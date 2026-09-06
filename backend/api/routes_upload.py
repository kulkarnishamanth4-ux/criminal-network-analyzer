from fastapi import APIRouter, UploadFile, File, Depends, Request, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from backend.database.schema import get_db
from backend.database import crud
from backend.database.models import UploadedFile
from backend.security.audit_logger import audit_logger
from backend.nlp.pipeline import extract_entities_from_text, classify_crime
from backend.nlp.parsers import parse_cdr_csv, parse_financial_csv, parse_vehicle_csv
from backend.main_helpers import compute_all_analytics
from backend.limiter import limiter
import traceback

router = APIRouter()

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB limit

async def read_and_validate_upload(file: UploadFile, max_size: int = MAX_UPLOAD_SIZE) -> bytes:
    """Reads file content up to max_size + 1 and enforces file size ceiling."""
    content = await file.read(max_size + 1)
    if len(content) > max_size:
        raise ValueError(f"File size exceeds maximum allowed limit of {max_size // (1024 * 1024)}MB")
    return content

@router.post("/upload/fir")
@limiter.limit("30/minute")
async def upload_fir(
    request: Request,
    file: UploadFile = File(...),
    case_id: str = Query("custom_investigation"),
    db: Session = Depends(get_db)
):
    try:
        content = await read_and_validate_upload(file)
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            text = content.decode("latin-1")
        
        if not text.strip():
            return JSONResponse(status_code=400, content={"status": "error", "message": "Empty file uploaded"})
        
        # Get existing entities for fuzzy matching (typo snapping)
        existing_entities = {e.name for e in db.query(crud.Entity).all()}
        extracted = extract_entities_from_text(text, known_entities=existing_entities)
        
        classification = classify_crime(text)
        
        fir = crud.create_fir(
            db=db,
            raw_text=text,
            crime_type=classification.get('crime_type'),
            crime_confidence=classification.get('confidence'),
            extracted_entities=extracted,
            case_id=case_id
        )
        
        entities_created = 0
        entity_ids = []
        
        for p in extracted.get("persons", []):
            ent = crud.get_or_create_entity(db, "PERSON", p["name"], case_id=case_id)
            entity_ids.append(ent.id)
            entities_created += 1
        for p in extracted.get("locations", []):
            ent = crud.get_or_create_entity(db, "LOCATION", p["name"], case_id=case_id)
            entity_ids.append(ent.id)
            entities_created += 1
        for p in extracted.get("phones", []):
            ent = crud.get_or_create_entity(db, "PHONE", p["number"], case_id=case_id)
            entity_ids.append(ent.id)
            entities_created += 1
        for p in extracted.get("vehicles", []):
            ent = crud.get_or_create_entity(db, "VEHICLE", p["plate"], case_id=case_id)
            entity_ids.append(ent.id)
            entities_created += 1
        for p in extracted.get("organizations", []):
            ent = crud.get_or_create_entity(db, "ORGANIZATION", p["name"], case_id=case_id)
            entity_ids.append(ent.id)
            entities_created += 1
        
        # Create MENTIONED_IN_FIR relationships between all entities found in the same FIR
        rel_count = 0
        new_relationships = []
        for i in range(len(entity_ids)):
            for j in range(i + 1, len(entity_ids)):
                new_relationships.append(
                    crud.Relationship(
                        source_id=entity_ids[i],
                        target_id=entity_ids[j],
                        rel_type="MENTIONED_IN_FIR",
                        weight=1.0,
                        properties={"fir_id": fir.id},
                        case_id=case_id
                    )
                )
                rel_count += 1
            
        if new_relationships:
            db.add_all(new_relationships)
            db.commit()
            
        compute_all_analytics(db, case_id=case_id)

        # Save to uploaded_files record
        uploaded_record = UploadedFile(
            filename=file.filename or "fir_document.txt",
            file_type="fir",
            file_size=len(content),
            raw_content=text,
            parsed_preview={
                "entities": extracted,
                "crime_type": fir.crime_type,
                "crime_confidence": fir.crime_confidence,
                "entities_count": entities_created,
                "relationships_count": rel_count
            },
            case_id=case_id
        )
        db.add(uploaded_record)
        db.commit()

        # Audit log entry
        audit_logger.log_event(
            action="FILE_UPLOAD",
            user="operator",
            resource=f"fir/{file.filename}",
            details=f"Case: {case_id} | Extracted: {entities_created} entities, {rel_count} relationships",
            severity="INFO"
        )
        
        return {
            "status": "success",
            "fir_id": fir.id,
            "entities_extracted": entities_created,
            "relationships_created": rel_count,
            "crime_type": fir.crime_type,
            "crime_confidence": fir.crime_confidence
        }
    except ValueError as val_err:
        return JSONResponse(status_code=413, content={"status": "error", "message": str(val_err)})
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"status": "error", "message": f"Failed to process FIR: {str(e)}"})

@router.post("/upload/cdr")
@limiter.limit("30/minute")
async def upload_cdr(
    request: Request,
    file: UploadFile = File(...),
    case_id: str = Query("custom_investigation"),
    db: Session = Depends(get_db)
):
    try:
        content = await read_and_validate_upload(file)
        records = parse_cdr_csv(content)
        
        if not records:
            return JSONResponse(status_code=400, content={"status": "error", "message": "No valid CDR records found in file"})
        
        new_relationships = []
        for r in records:
            caller = crud.get_or_create_entity(db, "PHONE", r["caller"], case_id=case_id)
            receiver = crud.get_or_create_entity(db, "PHONE", r["receiver"], case_id=case_id)
            new_relationships.append(crud.Relationship(source_id=caller.id, target_id=receiver.id, rel_type="CALLED", properties=r, case_id=case_id))
            
        if new_relationships:
            db.add_all(new_relationships)
            db.commit()
            
        compute_all_analytics(db, case_id=case_id)

        try:
            raw_preview = content.decode("utf-8")[:5000]
        except Exception:
            raw_preview = str(content[:5000])

        uploaded_record = UploadedFile(
            filename=file.filename or "cdr_records.csv",
            file_type="cdr",
            file_size=len(content),
            raw_content=raw_preview,
            parsed_preview={"records": records[:100], "total_records": len(records)},
            case_id=case_id
        )
        db.add(uploaded_record)
        db.commit()

        audit_logger.log_event(
            action="FILE_UPLOAD",
            user="operator",
            resource=f"cdr/{file.filename}",
            details=f"Case: {case_id} | Processed: {len(records)} CDR records",
            severity="INFO"
        )

        return {"status": "success", "records_processed": len(records)}
    except ValueError as val_err:
        return JSONResponse(status_code=413, content={"status": "error", "message": str(val_err)})
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"status": "error", "message": f"Failed to process CDR: {str(e)}"})

@router.post("/upload/financial")
@limiter.limit("30/minute")
async def upload_financial(
    request: Request,
    file: UploadFile = File(...),
    case_id: str = Query("custom_investigation"),
    db: Session = Depends(get_db)
):
    try:
        content = await read_and_validate_upload(file)
        records = parse_financial_csv(content)
        
        if not records:
            return JSONResponse(status_code=400, content={"status": "error", "message": "No valid financial records found in file"})
        
        new_relationships = []
        for r in records:
            sender_acc = crud.get_or_create_entity(db, "BANK_ACCOUNT", r["sender_account"], case_id=case_id)
            receiver_acc = crud.get_or_create_entity(db, "BANK_ACCOUNT", r["receiver_account"], case_id=case_id)
            sender = crud.get_or_create_entity(db, "PERSON", r.get("sender_name", "Unknown"), case_id=case_id)
            receiver = crud.get_or_create_entity(db, "PERSON", r.get("receiver_name", "Unknown"), case_id=case_id)
            
            new_relationships.append(crud.Relationship(source_id=sender.id, target_id=sender_acc.id, rel_type="OWNS_ACCOUNT", case_id=case_id))
            new_relationships.append(crud.Relationship(source_id=receiver.id, target_id=receiver_acc.id, rel_type="OWNS_ACCOUNT", case_id=case_id))
            new_relationships.append(crud.Relationship(source_id=sender_acc.id, target_id=receiver_acc.id, rel_type="TRANSFERRED_MONEY_TO", weight=r.get("amount", 1.0), properties=r, case_id=case_id))
            
        if new_relationships:
            db.add_all(new_relationships)
            db.commit()
            
        compute_all_analytics(db, case_id=case_id)

        try:
            raw_preview = content.decode("utf-8")[:5000]
        except Exception:
            raw_preview = str(content[:5000])

        uploaded_record = UploadedFile(
            filename=file.filename or "financial_ledger.csv",
            file_type="financial",
            file_size=len(content),
            raw_content=raw_preview,
            parsed_preview={"records": records[:100], "total_records": len(records)},
            case_id=case_id
        )
        db.add(uploaded_record)
        db.commit()

        audit_logger.log_event(
            action="FILE_UPLOAD",
            user="operator",
            resource=f"financial/{file.filename}",
            details=f"Case: {case_id} | Processed: {len(records)} financial transactions",
            severity="INFO"
        )

        return {"status": "success", "records_processed": len(records)}
    except ValueError as val_err:
        return JSONResponse(status_code=413, content={"status": "error", "message": str(val_err)})
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"status": "error", "message": f"Failed to process financial data: {str(e)}"})

@router.post("/upload/vehicle")
@limiter.limit("30/minute")
async def upload_vehicle(
    request: Request,
    file: UploadFile = File(...),
    case_id: str = Query("custom_investigation"),
    db: Session = Depends(get_db)
):
    try:
        content = await read_and_validate_upload(file)
        records = parse_vehicle_csv(content)
        
        if not records:
            return JSONResponse(status_code=400, content={"status": "error", "message": "No valid vehicle records found in file"})
        
        new_relationships = []
        for r in records:
            vehicle = crud.get_or_create_entity(db, "VEHICLE", r["plate_number"], case_id=case_id)
            loc = crud.get_or_create_entity(db, "LOCATION", r["location"], case_id=case_id)
            new_relationships.append(crud.Relationship(source_id=vehicle.id, target_id=loc.id, rel_type="SPOTTED_AT", properties=r, case_id=case_id))
            
        if new_relationships:
            db.add_all(new_relationships)
            db.commit()
            
        compute_all_analytics(db, case_id=case_id)

        try:
            raw_preview = content.decode("utf-8")[:5000]
        except Exception:
            raw_preview = str(content[:5000])

        uploaded_record = UploadedFile(
            filename=file.filename or "vehicle_sightings.csv",
            file_type="vehicle",
            file_size=len(content),
            raw_content=raw_preview,
            parsed_preview={"records": records[:100], "total_records": len(records)},
            case_id=case_id
        )
        db.add(uploaded_record)
        db.commit()

        audit_logger.log_event(
            action="FILE_UPLOAD",
            user="operator",
            resource=f"vehicle/{file.filename}",
            details=f"Case: {case_id} | Processed: {len(records)} vehicle sightings",
            severity="INFO"
        )

        return {"status": "success", "records_processed": len(records)}
    except ValueError as val_err:
        return JSONResponse(status_code=413, content={"status": "error", "message": str(val_err)})
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"status": "error", "message": f"Failed to process vehicle data: {str(e)}"})
