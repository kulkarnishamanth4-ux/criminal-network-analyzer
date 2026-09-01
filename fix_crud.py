import codecs

with codecs.open('backend/database/crud.py', 'r', 'utf-8') as f:
    content = f.read()

# Fix get_all_anomalies
old_anomalies = '''def get_all_anomalies(db: Session, case_id: str = "dawood") -> list[Anomaly]:
    anomalies = db.query(Anomaly).order_by(Anomaly.created_at.desc()).all()
    # Assume anomalies generated via seed_d_company belong to dawood, and we didn't generate anomalies for other cases.
    if case_id != "dawood":
        return []
    return anomalies'''
new_anomalies = '''def get_all_anomalies(db: Session, case_id: str = "dawood") -> list[Anomaly]:
    return db.query(Anomaly).filter(
        (Anomaly.case_id == case_id) | ((Anomaly.case_id == None) & (case_id == "dawood"))
    ).order_by(Anomaly.created_at.desc()).all()'''
content = content.replace(old_anomalies, new_anomalies)

# Fix get_dashboard_stats
old_stats = '''def get_dashboard_stats(db: Session, case_id: str = "dawood") -> dict:
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
    }'''

new_stats = '''def get_dashboard_stats(db: Session, case_id: str = "dawood") -> dict:
    from sqlalchemy import func
    
    ent_filter = (Entity.case_id == case_id) | ((Entity.case_id == None) & (case_id == "dawood"))
    rel_filter = (Relationship.case_id == case_id) | ((Relationship.case_id == None) & (case_id == "dawood"))
    
    total_entities = db.query(Entity).filter(ent_filter).count()
    
    type_counts = db.query(Entity.entity_type, func.count(Entity.id)).filter(ent_filter).group_by(Entity.entity_type).all()
    entities_by_type = {t: c for t, c in type_counts}
    
    total_relationships = db.query(Relationship).filter(rel_filter).count()
    
    communities_count = db.query(func.count(func.distinct(Entity.community_id))).filter(ent_filter).scalar() or 0
    
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
    }'''
content = content.replace(old_stats, new_stats)

with codecs.open('backend/database/crud.py', 'w', 'utf-8') as f:
    f.write(content)
print("crud.py optimized.")
