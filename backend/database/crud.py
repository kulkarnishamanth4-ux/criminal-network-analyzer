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

def create_anomaly(db: Session, anomaly_type: str, severity: str, title: str, description: str = None, evidence: list = None, entity_ids: list = None, case_id: str = "dawood") -> Anomaly:
    anomaly = Anomaly(anomaly_type=anomaly_type, severity=severity, title=title, description=description, evidence=evidence or [], entity_ids=entity_ids or [], case_id=case_id)
    db.add(anomaly)
    db.commit()
    db.refresh(anomaly)
    return anomaly

def get_all_anomalies(db: Session, case_id: str = "dawood") -> list[Anomaly]:
    anomalies = db.query(Anomaly).order_by(Anomaly.created_at.desc()).all()
    # Assume anomalies generated via seed_d_company belong to dawood, and we didn't generate anomalies for other cases.
    if case_id != "dawood":
        return []
    return anomalies

def get_dashboard_stats(db: Session, case_id: str = "dawood") -> dict:
    from sqlalchemy import func
    entities = db.query(Entity).all()
    case_entities = [e for e in entities if (e.properties or {}).get("case_id", "dawood") == case_id]
    case_entity_ids = set([e.id for e in case_entities])
    
    total_entities = len(case_entities)
    
    entities_by_type = {}
    for e in case_entities:
        entities_by_type[e.entity_type] = entities_by_type.get(e.entity_type, 0) + 1
        
    relationships = db.query(Relationship).all()
    case_relationships = [r for r in relationships if r.source_id in case_entity_ids and r.target_id in case_entity_ids]
    total_relationships = len(case_relationships)
    
    communities_count = len(set([e.community_id for e in case_entities if e.community_id is not None]))
    
    anomalies = get_all_anomalies(db, case_id)
    anomalies_count = len(anomalies)
    critical_anomalies = len([a for a in anomalies if a.severity == "CRITICAL"])

    return {
        "total_entities": total_entities,
        "entities_by_type": entities_by_type,
        "total_relationships": total_relationships,
        "communities_count": communities_count,
        "anomalies_count": anomalies_count,
        "critical_anomalies_count": critical_anomalies,
        "top_communities": []
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
