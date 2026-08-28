from sqlalchemy.orm import Session
from backend.database.models import Entity, Relationship, FIR, Anomaly

def get_or_create_entity(db: Session, entity_type: str, name: str, properties: dict = None) -> Entity:
    entity = db.query(Entity).filter(Entity.entity_type == entity_type, Entity.name == name).first()
    if not entity:
        entity = Entity(entity_type=entity_type, name=name, properties=properties or {})
        db.add(entity)
        db.commit()
        db.refresh(entity)
    return entity

def create_relationship(db: Session, source_id: int, target_id: int, rel_type: str, weight: float = 1.0, properties: dict = None, timestamp=None) -> Relationship:
    rel = db.query(Relationship).filter(
        Relationship.source_id == source_id,
        Relationship.target_id == target_id,
        Relationship.rel_type == rel_type
    ).first()
    if not rel:
        rel = Relationship(source_id=source_id, target_id=target_id, rel_type=rel_type, weight=weight, properties=properties or {}, timestamp=timestamp)
        db.add(rel)
        db.commit()
        db.refresh(rel)
    return rel

def search_entities(db: Session, query: str, entity_type: str = None, limit: int = 20) -> list[Entity]:
    q = db.query(Entity).filter(Entity.name.ilike(f"%{query}%"))
    if entity_type:
        q = q.filter(Entity.entity_type == entity_type)
    return q.limit(limit).all()

def get_entity_by_id(db: Session, entity_id: int) -> Entity:
    return db.query(Entity).filter(Entity.id == entity_id).first()

def get_entity_relationships(db: Session, entity_id: int) -> list[dict]:
    out_rels = db.query(Relationship, Entity).join(Entity, Relationship.target_id == Entity.id).filter(Relationship.source_id == entity_id).all()
    in_rels = db.query(Relationship, Entity).join(Entity, Relationship.source_id == Entity.id).filter(Relationship.target_id == entity_id).all()
    
    result = []
    for rel, ent in out_rels:
        result.append({"relationship": rel, "related_entity": ent, "direction": "outgoing"})
    for rel, ent in in_rels:
        result.append({"relationship": rel, "related_entity": ent, "direction": "incoming"})
    return result

def create_fir(db: Session, raw_text: str, fir_number: str = None, date=None, police_station=None, district=None, crime_type: str = None, crime_confidence: float = None, extracted_entities: list = None) -> FIR:
    fir = FIR(fir_number=fir_number, raw_text=raw_text, crime_type=crime_type, crime_confidence=crime_confidence, extracted_entities=extracted_entities or [], date=date, police_station=police_station, district=district)
    db.add(fir)
    db.commit()
    db.refresh(fir)
    return fir

def create_anomaly(db: Session, anomaly_type: str, severity: str, title: str, description: str = None, evidence: list = None, entity_ids: list = None) -> Anomaly:
    anomaly = Anomaly(anomaly_type=anomaly_type, severity=severity, title=title, description=description, evidence=evidence or [], entity_ids=entity_ids or [])
    db.add(anomaly)
    db.commit()
    db.refresh(anomaly)
    return anomaly

def get_all_anomalies(db: Session) -> list[Anomaly]:
    return db.query(Anomaly).all()

def get_dashboard_stats(db: Session) -> dict:
    from sqlalchemy import func
    total_entities = db.query(Entity).count()
    counts = db.query(Entity.entity_type, func.count(Entity.id)).group_by(Entity.entity_type).all()
    entities_by_type = {t[0]: t[1] for t in counts}
    total_relationships = db.query(Relationship).count()
    communities_count = db.query(Entity.community_id).distinct().count()
    anomalies_count = db.query(Anomaly).count()
    critical_anomalies = db.query(Anomaly).filter(Anomaly.severity == "CRITICAL").count()

    return {
        "total_entities": total_entities,
        "entities_by_type": entities_by_type,
        "total_relationships": total_relationships,
        "communities_count": communities_count,
        "anomalies_count": anomalies_count,
        "critical_anomalies": critical_anomalies
    }

def get_entity_dossier(db: Session, entity_id: int) -> dict:
    entity = get_entity_by_id(db, entity_id)
    if not entity:
        return {}
    rels = get_entity_relationships(db, entity_id)
    # Push FIR text search to DB instead of loading all into memory
    matched_firs = db.query(FIR).filter(FIR.raw_text.ilike(f"%{entity.name}%")).all()
    
    anoms = db.query(Anomaly).all()
    related_anomalies = [a for a in anoms if a.entity_ids and entity_id in a.entity_ids]

    return {
        "entity": entity,
        "relationships": [{
            "id": r["relationship"].id, 
            "type": r["relationship"].rel_type, 
            "target_id": r["related_entity"].id,
            "target_name": r["related_entity"].name, 
            "direction": r["direction"],
            "properties": r["relationship"].properties or {},
            "timestamp": r["relationship"].timestamp.isoformat() if r["relationship"].timestamp else None
        } for r in rels],
        "firs": matched_firs,
        "anomalies": related_anomalies
    }
