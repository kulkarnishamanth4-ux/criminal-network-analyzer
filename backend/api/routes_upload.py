from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from backend.database.schema import get_db
from backend.database import crud
from backend.nlp.pipeline import extract_entities_from_text, classify_crime
from backend.nlp.parsers import parse_cdr_csv, parse_financial_csv, parse_vehicle_csv
from backend.main_helpers import compute_all_analytics
import json

router = APIRouter()

@router.post("/upload/fir")
async def upload_fir(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    text = content.decode("utf-8")
    
    extracted = extract_entities_from_text(text)
    classification = classify_crime(text)
    
    fir = crud.create_fir(
        db=db,
        raw_text=text,
        crime_type=classification.get('crime_type'),
        crime_confidence=classification.get('confidence'),
        extracted_entities=extracted
    )
    
    entities_created = 0
    entity_ids = []
    
    for p in extracted.get("persons", []):
        ent = crud.get_or_create_entity(db, "PERSON", p["name"])
        entity_ids.append(ent.id)
        entities_created += 1
    for p in extracted.get("locations", []):
        ent = crud.get_or_create_entity(db, "LOCATION", p["name"])
        entity_ids.append(ent.id)
        entities_created += 1
    for p in extracted.get("phones", []):
        ent = crud.get_or_create_entity(db, "PHONE", p["number"])
        entity_ids.append(ent.id)
        entities_created += 1
    for p in extracted.get("vehicles", []):
        ent = crud.get_or_create_entity(db, "VEHICLE", p["plate"])
        entity_ids.append(ent.id)
        entities_created += 1
    for p in extracted.get("organizations", []):
        ent = crud.get_or_create_entity(db, "ORGANIZATION", p["name"])
        entity_ids.append(ent.id)
        entities_created += 1
    
    # Create MENTIONED_IN_FIR relationships between all entities found in the same FIR
    for i in range(len(entity_ids)):
        for j in range(i + 1, len(entity_ids)):
            crud.create_relationship(db, entity_ids[i], entity_ids[j], "MENTIONED_IN_FIR", properties={"fir_id": fir.id})
        
    compute_all_analytics(db)
    
    return {
        "status": "success",
        "fir_id": fir.id,
        "entities_extracted": entities_created,
        "crime_type": fir.crime_type,
        "crime_confidence": fir.crime_confidence
    }

@router.post("/upload/cdr")
async def upload_cdr(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    records = parse_cdr_csv(content)
    
    for r in records:
        caller = crud.get_or_create_entity(db, "PHONE", r["caller"])
        receiver = crud.get_or_create_entity(db, "PHONE", r["receiver"])
        crud.create_relationship(db, caller.id, receiver.id, "CALLED", properties=r)
        
    compute_all_analytics(db)
    return {"status": "success", "records_processed": len(records)}

@router.post("/upload/financial")
async def upload_financial(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    records = parse_financial_csv(content)
    
    for r in records:
        sender_acc = crud.get_or_create_entity(db, "BANK_ACCOUNT", r["sender_account"])
        receiver_acc = crud.get_or_create_entity(db, "BANK_ACCOUNT", r["receiver_account"])
        sender = crud.get_or_create_entity(db, "PERSON", r.get("sender_name", "Unknown"))
        receiver = crud.get_or_create_entity(db, "PERSON", r.get("receiver_name", "Unknown"))
        
        crud.create_relationship(db, sender.id, sender_acc.id, "OWNS_ACCOUNT")
        crud.create_relationship(db, receiver.id, receiver_acc.id, "OWNS_ACCOUNT")
        crud.create_relationship(db, sender_acc.id, receiver_acc.id, "TRANSFERRED_MONEY_TO", weight=r.get("amount", 1.0), properties=r)
        
    compute_all_analytics(db)
    return {"status": "success", "records_processed": len(records)}

@router.post("/upload/vehicle")
async def upload_vehicle(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    records = parse_vehicle_csv(content)
    
    for r in records:
        vehicle = crud.get_or_create_entity(db, "VEHICLE", r["plate_number"])
        loc = crud.get_or_create_entity(db, "LOCATION", r["location"])
        crud.create_relationship(db, vehicle.id, loc.id, "SPOTTED_AT", properties=r)
        
    compute_all_analytics(db)
    return {"status": "success", "records_processed": len(records)}
