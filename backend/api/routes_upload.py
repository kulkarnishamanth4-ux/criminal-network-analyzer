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
import re
import os
from datetime import datetime

def parse_iso_datetime(val):
    if not val:
        return None
    if isinstance(val, datetime):
        return val
    val_str = str(val).strip()
    try:
        return datetime.fromisoformat(val_str.replace('Z', '+00:00'))
    except Exception:
        pass
    for fmt in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y', '%Y/%m/%d %H:%M:%S'):
        try:
            return datetime.strptime(val_str, fmt)
        except Exception:
            continue
    return None

router = APIRouter()

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB limit

PROTECTED_CANONICAL_CASES = {
    "dawood",
    "drug_punjab",
    "ht_assam",
    "cyber_bengaluru",
    "money_gujarat",
    "arms_chhattisgarh",
    "wildlife_kerala",
    "extortion_up"
}

def resolve_safe_case_id(case_id: str, client_ip: str = "0.0.0.0") -> tuple[str, bool, str | None]:
    """
    Guards canonical syndicate dossiers against evidence contamination or accidental overwriting.
    Redirects user uploads and test sample loads to 'custom_investigation'.
    """
    if case_id in PROTECTED_CANONICAL_CASES:
        audit_logger.log_event(
            action="REDIRECT_PROTECTED_CASE_WRITE",
            user="operator",
            resource=case_id,
            details=f"Prevented modification of sealed case '{case_id}'. Safely routed to 'custom_investigation'.",
            severity="WARNING",
            ip_address=client_ip
        )
        return (
            "custom_investigation",
            True,
            f"Official syndicate case '{case_id}' is cryptographically sealed to preserve baseline integrity. Evidence was safely ingested into the 'New Investigation' workspace."
        )
    return (case_id, False, None)

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
    clear_existing: bool = Query(False),
    db: Session = Depends(get_db)
):
    try:
        client_ip = request.client.host if request.client else "0.0.0.0"
        target_case_id, was_redirected, notice = resolve_safe_case_id(case_id, client_ip)

        content = await read_and_validate_upload(file)
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            text = content.decode("latin-1")
        
        if not text.strip():
            return JSONResponse(status_code=400, content={"status": "error", "message": "Empty file uploaded"})
        
        # Optionally wipe old dirty data for this investigation if user requested a fresh import
        if clear_existing:
            db.query(crud.Relationship).filter(crud.Relationship.case_id == target_case_id).delete()
            db.query(crud.Entity).filter(crud.Entity.case_id == target_case_id).delete()
            db.query(crud.FIR).filter(crud.FIR.case_id == target_case_id).delete()
            db.query(UploadedFile).filter(UploadedFile.case_id == target_case_id).delete()
            db.query(crud.Anomaly).filter(crud.Anomaly.case_id == target_case_id).delete()
            db.commit()
        
        # Get existing entities for fuzzy matching (typo snapping)
        existing_entities = {e.name for e in db.query(crud.Entity).filter(crud.Entity.case_id == target_case_id).all()}
        extracted = extract_entities_from_text(text, known_entities=existing_entities)
        
        classification = classify_crime(text)
        
        fir = crud.create_fir(
            db=db,
            raw_text=text,
            crime_type=classification.get('crime_type'),
            crime_confidence=classification.get('confidence'),
            extracted_entities=extracted,
            case_id=target_case_id
        )
        
        # Create entities by type
        person_ents = []
        for p in extracted.get("persons", []):
            props = {"aliases": p.get("aliases", [])} if p.get("aliases") else {}
            ent = crud.get_or_create_entity(db, "PERSON", p["name"], properties=props, case_id=target_case_id)
            if p.get("aliases") and not (ent.properties and ent.properties.get("aliases")):
                ent.properties = {**(ent.properties or {}), "aliases": p["aliases"]}
            person_ents.append(ent)
            
        loc_ents = []
        for l in extracted.get("locations", []):
            ent = crud.get_or_create_entity(db, "LOCATION", l["name"], case_id=target_case_id)
            loc_ents.append(ent)
            
        phone_ents = []
        for ph in extracted.get("phones", []):
            ent = crud.get_or_create_entity(db, "PHONE", ph["number"], case_id=target_case_id)
            phone_ents.append(ent)
            
        veh_ents = []
        for v in extracted.get("vehicles", []):
            ent = crud.get_or_create_entity(db, "VEHICLE", v["plate"], case_id=target_case_id)
            veh_ents.append(ent)
            
        org_ents = []
        for o in extracted.get("organizations", []):
            ent = crud.get_or_create_entity(db, "ORGANIZATION", o["name"], case_id=target_case_id)
            org_ents.append(ent)
            
        entities_created = len(person_ents) + len(loc_ents) + len(phone_ents) + len(veh_ents) + len(org_ents)
        
        # Build Semantic Graph Relationships (Hierarchical, avoiding O(N^2) complete cliques)
        new_relationships = []
        existing_rel_pairs = set()

        # Parse FIR incident/filing date for chronological timeline progression
        fir_date_match = re.search(r'Date[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})', text)
        fir_ts = parse_iso_datetime(fir_date_match.group(1)) if fir_date_match else datetime.utcnow()

        def add_rel(src_id, tgt_id, rel_type, weight=1.0, props=None, rel_ts=None):
            if src_id == tgt_id:
                return
            pair = tuple(sorted((src_id, tgt_id))) + (rel_type,)
            if pair not in existing_rel_pairs:
                existing_rel_pairs.add(pair)
                new_relationships.append(
                    crud.Relationship(
                        source_id=src_id,
                        target_id=tgt_id,
                        rel_type=rel_type,
                        weight=weight,
                        properties=props or {"fir_id": fir.id},
                        timestamp=rel_ts or fir_ts,
                        case_id=target_case_id
                    )
                )

        # 1. Person-to-Person relationships
        if person_ents:
            primary_person = person_ents[0]
            # Link secondary suspects to primary suspect
            for p_ent in person_ents[1:]:
                add_rel(primary_person.id, p_ent.id, "CO_ACCUSED", weight=2.0)

            # Check co-occurrences in text sentences/paragraphs for specific actions (e.g. money transfer)
            for i in range(len(person_ents)):
                for j in range(i + 1, len(person_ents)):
                    p1, p2 = person_ents[i], person_ents[j]
                    for s in re.split(r'[\n.]+', text):
                        if p1.name.lower() in s.lower() and p2.name.lower() in s.lower():
                            if any(kw in s.lower() for kw in ['transfer', 'sent', 'paid', 'hawala', 'amount', 'lakh', 'crore']):
                                add_rel(p1.id, p2.id, "TRANSFERRED_MONEY_TO", weight=2.5)
                            else:
                                add_rel(p1.id, p2.id, "CO_ACCUSED", weight=1.5)

        # Helper to resolve closest person entity for non-person entities
        def resolve_target_person(item_name: str):
            if not person_ents:
                return None
            item_lower = item_name.lower()
            # Clause level
            for c in re.split(r'[,;.\n]+', text):
                if item_lower in c.lower():
                    for p_ent in person_ents:
                        if p_ent.name.lower() in c.lower():
                            return p_ent
            # Sentence level
            for s in re.split(r'[\n.]+', text):
                if item_lower in s.lower():
                    for p_ent in person_ents:
                        if p_ent.name.lower() in s.lower():
                            return p_ent
            # Paragraph level
            for para in [p.strip() for p in text.split('\n\n') if p.strip()]:
                if item_lower in para.lower():
                    for p_ent in person_ents:
                        if p_ent.name.lower() in para.lower():
                            return p_ent
            # Default to primary person
            return person_ents[0]

        # 2. Wire Phones to Persons (OWNS_PHONE)
        for ph in phone_ents:
            target = resolve_target_person(ph.name)
            if target:
                add_rel(target.id, ph.id, "OWNS_PHONE", weight=3.0)

        # 3. Wire Vehicles to Persons (OPERATES_VEHICLE)
        for v in veh_ents:
            target = resolve_target_person(v.name)
            if target:
                add_rel(target.id, v.id, "OPERATES_VEHICLE", weight=3.0)

        # 4. Wire Organizations to Persons (OPERATES)
        for o in org_ents:
            target = resolve_target_person(o.name)
            if target:
                add_rel(target.id, o.id, "OPERATES", weight=2.5)

        # 5. Wire Locations to Persons (OPERATES_IN)
        for l in loc_ents:
            target = resolve_target_person(l.name)
            if target:
                add_rel(target.id, l.id, "OPERATES_IN", weight=2.0)

        # Fallback: if no persons exist in FIR, connect entities sequentially
        if not person_ents:
            all_fallback = loc_ents + phone_ents + veh_ents + org_ents
            for i in range(len(all_fallback) - 1):
                add_rel(all_fallback[i].id, all_fallback[i+1].id, "MENTIONED_IN_FIR", weight=1.0)

        rel_count = len(new_relationships)
        if new_relationships:
            db.add_all(new_relationships)
            db.commit()
            
        compute_all_analytics(db, case_id=target_case_id)

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
            case_id=target_case_id
        )
        db.add(uploaded_record)
        db.commit()

        # Audit log entry
        audit_logger.log_event(
            action="FILE_UPLOAD",
            user="operator",
            resource=f"fir/{file.filename}",
            details=f"Case: {target_case_id} | Extracted: {entities_created} entities, {rel_count} relationships",
            severity="INFO"
        )
        
        return {
            "status": "success",
            "message": notice or "FIR document ingested successfully.",
            "target_case": target_case_id,
            "was_redirected": was_redirected,
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
        client_ip = request.client.host if request.client else "0.0.0.0"
        target_case_id, was_redirected, notice = resolve_safe_case_id(case_id, client_ip)

        content = await read_and_validate_upload(file)
        records = parse_cdr_csv(content)
        
        if not records:
            return JSONResponse(status_code=400, content={"status": "error", "message": "No valid CDR records found in file"})
        
        new_relationships = []
        for r in records:
            caller = crud.get_or_create_entity(db, "PHONE", r["caller"], case_id=target_case_id)
            receiver = crud.get_or_create_entity(db, "PHONE", r["receiver"], case_id=target_case_id)
            ts = parse_iso_datetime(r.get("timestamp"))
            new_relationships.append(crud.Relationship(source_id=caller.id, target_id=receiver.id, rel_type="CALLED", properties=r, timestamp=ts, case_id=target_case_id))
            
        if new_relationships:
            db.add_all(new_relationships)
            db.commit()
            
        compute_all_analytics(db, case_id=target_case_id)

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
            case_id=target_case_id
        )
        db.add(uploaded_record)
        db.commit()

        audit_logger.log_event(
            action="FILE_UPLOAD",
            user="operator",
            resource=f"cdr/{file.filename}",
            details=f"Case: {target_case_id} | Processed: {len(records)} CDR records",
            severity="INFO"
        )

        return {
            "status": "success",
            "message": notice or f"Processed {len(records)} CDR records.",
            "target_case": target_case_id,
            "was_redirected": was_redirected,
            "records_processed": len(records)
        }
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
        client_ip = request.client.host if request.client else "0.0.0.0"
        target_case_id, was_redirected, notice = resolve_safe_case_id(case_id, client_ip)

        content = await read_and_validate_upload(file)
        records = parse_financial_csv(content)
        
        if not records:
            return JSONResponse(status_code=400, content={"status": "error", "message": "No valid financial records found in file"})
        
        new_relationships = []
        for r in records:
            sender_acc = crud.get_or_create_entity(db, "BANK_ACCOUNT", r["sender_account"], case_id=target_case_id)
            receiver_acc = crud.get_or_create_entity(db, "BANK_ACCOUNT", r["receiver_account"], case_id=target_case_id)
            sender = crud.get_or_create_entity(db, "PERSON", r.get("sender_name", "Unknown"), case_id=target_case_id)
            receiver = crud.get_or_create_entity(db, "PERSON", r.get("receiver_name", "Unknown"), case_id=target_case_id)
            ts = parse_iso_datetime(r.get("timestamp"))
            
            new_relationships.append(crud.Relationship(source_id=sender.id, target_id=sender_acc.id, rel_type="OWNS_ACCOUNT", timestamp=ts, case_id=target_case_id))
            new_relationships.append(crud.Relationship(source_id=receiver.id, target_id=receiver_acc.id, rel_type="OWNS_ACCOUNT", timestamp=ts, case_id=target_case_id))
            new_relationships.append(crud.Relationship(source_id=sender_acc.id, target_id=receiver_acc.id, rel_type="TRANSFERRED_MONEY_TO", weight=r.get("amount", 1.0), properties=r, timestamp=ts, case_id=target_case_id))
            
        if new_relationships:
            db.add_all(new_relationships)
            db.commit()
            
        compute_all_analytics(db, case_id=target_case_id)

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
            case_id=target_case_id
        )
        db.add(uploaded_record)
        db.commit()

        audit_logger.log_event(
            action="FILE_UPLOAD",
            user="operator",
            resource=f"financial/{file.filename}",
            details=f"Case: {target_case_id} | Processed: {len(records)} financial transactions",
            severity="INFO"
        )

        return {
            "status": "success",
            "message": notice or f"Processed {len(records)} financial transactions.",
            "target_case": target_case_id,
            "was_redirected": was_redirected,
            "records_processed": len(records)
        }
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
        client_ip = request.client.host if request.client else "0.0.0.0"
        target_case_id, was_redirected, notice = resolve_safe_case_id(case_id, client_ip)

        content = await read_and_validate_upload(file)
        records = parse_vehicle_csv(content)
        
        if not records:
            return JSONResponse(status_code=400, content={"status": "error", "message": "No valid vehicle records found in file"})
        
        new_relationships = []
        for r in records:
            vehicle = crud.get_or_create_entity(db, "VEHICLE", r["plate_number"], case_id=target_case_id)
            loc = crud.get_or_create_entity(db, "LOCATION", r["location"], case_id=target_case_id)
            ts = parse_iso_datetime(r.get("timestamp"))
            new_relationships.append(crud.Relationship(source_id=vehicle.id, target_id=loc.id, rel_type="SPOTTED_AT", properties=r, timestamp=ts, case_id=target_case_id))
            
        if new_relationships:
            db.add_all(new_relationships)
            db.commit()
            
        compute_all_analytics(db, case_id=target_case_id)

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
            case_id=target_case_id
        )
        db.add(uploaded_record)
        db.commit()

        audit_logger.log_event(
            action="FILE_UPLOAD",
            user="operator",
            resource=f"vehicle/{file.filename}",
            details=f"Case: {target_case_id} | Processed: {len(records)} vehicle sightings",
            severity="INFO"
        )

        return {
            "status": "success",
            "message": notice or f"Processed {len(records)} vehicle sightings.",
            "target_case": target_case_id,
            "was_redirected": was_redirected,
            "records_processed": len(records)
        }
    except ValueError as val_err:
        return JSONResponse(status_code=413, content={"status": "error", "message": str(val_err)})
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"status": "error", "message": f"Failed to process vehicle data: {str(e)}"})

@router.post("/investigation/reset")
def reset_investigation(case_id: str = Query("custom_investigation"), db: Session = Depends(get_db)):
    """Wipes all entities, relationships, files, and anomalies for a custom case."""
    if case_id in PROTECTED_CANONICAL_CASES:
        return JSONResponse(
            status_code=403, 
            content={
                "status": "error", 
                "message": f"Case '{case_id}' is a sealed canonical syndicate dossier and cannot be wiped. Use 'restore-canonical' if you wish to reset it to official baseline."
            }
        )
    try:
        del_rels = db.query(crud.Relationship).filter(crud.Relationship.case_id == case_id).delete()
        del_ents = db.query(crud.Entity).filter(crud.Entity.case_id == case_id).delete()
        del_firs = db.query(crud.FIR).filter(crud.FIR.case_id == case_id).delete()
        del_files = db.query(UploadedFile).filter(UploadedFile.case_id == case_id).delete()
        del_anom = db.query(crud.Anomaly).filter(crud.Anomaly.case_id == case_id).delete()
        db.commit()

        compute_all_analytics(db, case_id=case_id)

        audit_logger.log_event(
            action="CASE_RESET",
            user="operator",
            resource=f"case/{case_id}",
            details=f"Wiped {del_ents} entities and {del_rels} relationships for case {case_id}",
            severity="WARNING"
        )
        return {
            "status": "success", 
            "message": f"Investigation '{case_id}' reset to clean slate.",
            "deleted_entities": del_ents,
            "deleted_relationships": del_rels
        }
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@router.post("/investigation/load-sample")
def load_sample_investigation(case_id: str = Query("custom_investigation"), db: Session = Depends(get_db)):
    """Resets the target case and loads the clean, verified sample FIR report dataset."""
    try:
        client_ip = "0.0.0.0"
        target_case_id, was_redirected, notice = resolve_safe_case_id(case_id, client_ip)
        sample_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "public", "samples", "sample_fir_report.txt")
        if not os.path.exists(sample_path):
            sample_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist", "samples", "sample_fir_report.txt")
        
        if not os.path.exists(sample_path):
            return JSONResponse(status_code=404, content={"status": "error", "message": "Sample FIR file not found"})

        with open(sample_path, "r", encoding="utf-8") as f:
            text = f.read()

        # Wipe old data for target case
        db.query(crud.Relationship).filter(crud.Relationship.case_id == target_case_id).delete()
        db.query(crud.Entity).filter(crud.Entity.case_id == target_case_id).delete()
        db.query(crud.FIR).filter(crud.FIR.case_id == target_case_id).delete()
        db.query(UploadedFile).filter(UploadedFile.case_id == target_case_id).delete()
        db.query(crud.Anomaly).filter(crud.Anomaly.case_id == target_case_id).delete()
        db.commit()

        # Extract cleanly
        extracted = extract_entities_from_text(text)
        classification = classify_crime(text)

        fir = crud.create_fir(
            db=db,
            raw_text=text,
            crime_type=classification.get("crime_type"),
            crime_confidence=classification.get("confidence"),
            extracted_entities=extracted,
            case_id=target_case_id
        )

        person_ents = []
        for p in extracted.get("persons", []):
            props = {"aliases": p.get("aliases", [])} if p.get("aliases") else {}
            ent = crud.get_or_create_entity(db, "PERSON", p["name"], properties=props, case_id=target_case_id)
            person_ents.append(ent)

        loc_ents = []
        for l in extracted.get("locations", []):
            ent = crud.get_or_create_entity(db, "LOCATION", l["name"], case_id=target_case_id)
            loc_ents.append(ent)

        phone_ents = []
        for ph in extracted.get("phones", []):
            ent = crud.get_or_create_entity(db, "PHONE", ph["number"], case_id=target_case_id)
            phone_ents.append(ent)

        veh_ents = []
        for v in extracted.get("vehicles", []):
            ent = crud.get_or_create_entity(db, "VEHICLE", v["plate"], case_id=target_case_id)
            veh_ents.append(ent)

        org_ents = []
        for o in extracted.get("organizations", []):
            ent = crud.get_or_create_entity(db, "ORGANIZATION", o["name"], case_id=target_case_id)
            org_ents.append(ent)

        new_relationships = []
        existing_rel_pairs = set()

        # Parse FIR incident/filing date for chronological timeline progression
        fir_date_match = re.search(r'Date[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})', text)
        fir_ts = parse_iso_datetime(fir_date_match.group(1)) if fir_date_match else datetime(2024, 3, 15, 10, 0, 0)

        def add_rel(src_id, tgt_id, rel_type, weight=1.0, props=None, rel_ts=None):
            if src_id == tgt_id: return
            pair = tuple(sorted((src_id, tgt_id))) + (rel_type,)
            if pair not in existing_rel_pairs:
                existing_rel_pairs.add(pair)
                new_relationships.append(
                    crud.Relationship(
                        source_id=src_id,
                        target_id=tgt_id,
                        rel_type=rel_type,
                        weight=weight,
                        properties=props or {"fir_id": fir.id},
                        timestamp=rel_ts or fir_ts,
                        case_id=target_case_id
                    )
                )

        if person_ents:
            primary_person = person_ents[0]
            for p_ent in person_ents[1:]:
                add_rel(primary_person.id, p_ent.id, "CO_ACCUSED", weight=2.0)

            for i in range(len(person_ents)):
                for j in range(i + 1, len(person_ents)):
                    p1, p2 = person_ents[i], person_ents[j]
                    for s in re.split(r'[\n.]+', text):
                        if p1.name.lower() in s.lower() and p2.name.lower() in s.lower():
                            if any(kw in s.lower() for kw in ['transfer', 'sent', 'paid', 'hawala', 'amount', 'lakh', 'crore']):
                                add_rel(p1.id, p2.id, "TRANSFERRED_MONEY_TO", weight=2.5)

        def resolve_target_person(item_name: str):
            if not person_ents: return None
            item_lower = item_name.lower()
            for s in re.split(r'[\n.]+', text):
                if item_lower in s.lower():
                    for p_ent in person_ents:
                        if p_ent.name.lower() in s.lower():
                            return p_ent
            return person_ents[0]

        for ph in phone_ents:
            t = resolve_target_person(ph.name)
            if t: add_rel(t.id, ph.id, "OWNS_PHONE", weight=3.0)

        for v in veh_ents:
            t = resolve_target_person(v.name)
            if t: add_rel(t.id, v.id, "OPERATES_VEHICLE", weight=3.0)

        for o in org_ents:
            t = resolve_target_person(o.name)
            if t: add_rel(t.id, o.id, "OPERATES", weight=2.5)

        for l in loc_ents:
            t = resolve_target_person(l.name)
            if t: add_rel(t.id, l.id, "OPERATES_IN", weight=2.0)

        # Ingest companion verified sample records (Financial, CDR, Vehicles) to provide full 360 multi-source intelligence
        sample_dir = os.path.dirname(sample_path)

        fin_path = os.path.join(sample_dir, "sample_financial_ledger.csv")
        if os.path.exists(fin_path):
            try:
                with open(fin_path, "rb") as f:
                    fin_records = parse_financial_csv(f.read())
                for r in fin_records:
                    sender_acc = crud.get_or_create_entity(db, "BANK_ACCOUNT", r["sender_account"], case_id=target_case_id)
                    receiver_acc = crud.get_or_create_entity(db, "BANK_ACCOUNT", r["receiver_account"], case_id=target_case_id)
                    sender = crud.get_or_create_entity(db, "PERSON", r.get("sender_name", "Unknown"), case_id=target_case_id)
                    receiver = crud.get_or_create_entity(db, "PERSON", r.get("receiver_name", "Unknown"), case_id=target_case_id)
                    ts = parse_iso_datetime(r.get("timestamp"))
                    add_rel(sender.id, sender_acc.id, "OWNS_ACCOUNT", weight=1.0, rel_ts=ts)
                    add_rel(receiver.id, receiver_acc.id, "OWNS_ACCOUNT", weight=1.0, rel_ts=ts)
                    add_rel(sender_acc.id, receiver_acc.id, "TRANSFERRED_MONEY_TO", weight=r.get("amount", 1.0), props=r, rel_ts=ts)
            except Exception as e:
                print("Failed to load sample financial data:", e)

        cdr_path = os.path.join(sample_dir, "sample_cdr_records.csv")
        if os.path.exists(cdr_path):
            try:
                with open(cdr_path, "rb") as f:
                    cdr_records = parse_cdr_csv(f.read())
                for r in cdr_records:
                    caller = crud.get_or_create_entity(db, "PHONE", r["caller"], case_id=target_case_id)
                    receiver = crud.get_or_create_entity(db, "PHONE", r["receiver"], case_id=target_case_id)
                    ts = parse_iso_datetime(r.get("timestamp"))
                    add_rel(caller.id, receiver.id, "CALLED", weight=1.0, props=r, rel_ts=ts)
            except Exception as e:
                print("Failed to load sample CDR data:", e)

        veh_path = os.path.join(sample_dir, "sample_vehicle_sightings.csv")
        if os.path.exists(veh_path):
            try:
                with open(veh_path, "rb") as f:
                    veh_records = parse_vehicle_csv(f.read())
                for r in veh_records:
                    veh = crud.get_or_create_entity(db, "VEHICLE", r["plate_number"], case_id=target_case_id)
                    loc = crud.get_or_create_entity(db, "LOCATION", r["location"], case_id=target_case_id)
                    ts = parse_iso_datetime(r.get("timestamp"))
                    add_rel(veh.id, loc.id, "SPOTTED_AT", weight=1.0, props=r, rel_ts=ts)
            except Exception as e:
                print("Failed to load sample vehicle data:", e)

        db.add_all(new_relationships)
        db.commit()

        compute_all_analytics(db, case_id=target_case_id)

        # Upload record
        uploaded_record = UploadedFile(
            filename="sample_fir_report.txt",
            file_type="fir",
            file_size=len(text.encode("utf-8")),
            raw_content=text,
            parsed_preview={
                "entities": extracted,
                "crime_type": fir.crime_type,
                "crime_confidence": fir.crime_confidence,
                "entities_count": len(person_ents)+len(loc_ents)+len(phone_ents)+len(veh_ents)+len(org_ents),
                "relationships_count": len(new_relationships)
            },
            case_id=target_case_id
        )
        db.add(uploaded_record)
        db.commit()

        return {
            "status": "success",
            "message": notice or "Clean sample investigation loaded successfully.",
            "target_case": target_case_id,
            "was_redirected": was_redirected,
            "entities_created": len(person_ents)+len(loc_ents)+len(phone_ents)+len(veh_ents)+len(org_ents),
            "relationships_created": len(new_relationships)
        }
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@router.post("/investigation/restore-canonical")
def restore_canonical_case(case_id: str = Query("dawood"), db: Session = Depends(get_db)):
    """Restores a canonical syndicate case to its pristine baseline state."""
    if case_id not in PROTECTED_CANONICAL_CASES:
        return JSONResponse(
            status_code=400, 
            content={"status": "error", "message": f"'{case_id}' is not a protected canonical syndicate case."}
        )
    try:
        # Wipe all records belonging to this canonical case
        db.query(crud.Relationship).filter(crud.Relationship.case_id == case_id).delete()
        db.query(crud.Entity).filter(crud.Entity.case_id == case_id).delete()
        db.query(crud.FIR).filter(crud.FIR.case_id == case_id).delete()
        db.query(UploadedFile).filter(UploadedFile.case_id == case_id).delete()
        db.query(crud.Anomaly).filter(crud.Anomaly.case_id == case_id).delete()
        db.commit()

        if case_id == "dawood":
            from scripts.seed_d_company import seed_dawood_case
            seed_dawood_case()
        else:
            from scripts.seed_other_cases import seed_additional_cases
            seed_additional_cases(db, target_case_id=case_id)

        compute_all_analytics(db, case_id=case_id)

        audit_logger.log_event(
            action="CASE_RESTORE",
            user="operator",
            resource=f"case/{case_id}",
            details=f"Restored sealed canonical case '{case_id}' to official baseline.",
            severity="INFO"
        )
        return {
            "status": "success",
            "case_id": case_id,
            "message": f"Canonical syndicate case '{case_id}' has been restored to its official baseline."
        }
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})


