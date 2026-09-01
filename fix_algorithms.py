import codecs

with codecs.open('backend/graph/algorithms.py', 'r', 'utf-8') as f:
    content = f.read()

old_influencers = '''def get_top_influencers(db: Session, limit: int = 10, case_id: str = "dawood") -> list[dict]:
    entities = db.query(Entity).all()
    case_entities = [e for e in entities if (e.properties or {}).get("case_id", "dawood") == case_id and e.entity_type == "PERSON"]
    case_entities.sort(key=lambda x: x.pagerank or 0.0, reverse=True)
    if not case_entities or all(e.pagerank == 0 for e in case_entities):
        case_entities = [e for e in entities if (e.properties or {}).get("case_id", "dawood") == case_id]
        case_entities.sort(key=lambda x: x.pagerank or 0.0, reverse=True)
    return [{"id": e.id, "name": e.name, "type": e.entity_type, "pagerank": round(e.pagerank or 0, 6), "betweenness": round(e.betweenness or 0, 6), "community_id": e.community_id} for e in case_entities[:limit]]'''

new_influencers = '''def get_top_influencers(db: Session, limit: int = 10, case_id: str = "dawood") -> list[dict]:
    ent_filter = (Entity.case_id == case_id) | ((Entity.case_id == None) & (case_id == "dawood"))
    
    # Try getting persons first
    case_entities = db.query(Entity).filter(ent_filter).filter(Entity.entity_type == "PERSON").order_by(Entity.pagerank.desc()).limit(limit).all()
    
    # If no persons have pagerank, fallback to any entity type
    if not case_entities or all(e.pagerank == 0.0 or e.pagerank is None for e in case_entities):
        case_entities = db.query(Entity).filter(ent_filter).order_by(Entity.pagerank.desc()).limit(limit).all()
        
    return [{"id": e.id, "name": e.name, "type": e.entity_type, "pagerank": round(e.pagerank or 0, 6), "betweenness": round(e.betweenness or 0, 6), "community_id": e.community_id} for e in case_entities]'''

old_communities = '''def get_communities_summary(db: Session, case_id: str = "dawood") -> list[dict]:
    entities = db.query(Entity).filter(Entity.community_id.isnot(None)).all()
    case_entities = [e for e in entities if (e.properties or {}).get("case_id", "dawood") == case_id]
    
    comms = {}
    for e in case_entities:
        c = e.community_id
        if c not in comms:
            comms[c] = {"size": 0, "members": [], "key_nodes": []}
        comms[c]["size"] += 1
        comms[c]["members"].append(e.name)
        if e.pagerank and e.pagerank > 0.01:
            comms[c]["key_nodes"].append({"name": e.name, "type": e.entity_type})
            
    summary = []
    for c, data in comms.items():
        summary.append({
            "community_id": c,
            "size": data["size"],
            "key_nodes": data["key_nodes"][:3],
            "synopsis": f"Community {c} with {data['size']} members."
        })
    return sorted(summary, key=lambda x: x["size"], reverse=True)'''

new_communities = '''def get_communities_summary(db: Session, case_id: str = "dawood") -> list[dict]:
    ent_filter = (Entity.case_id == case_id) | ((Entity.case_id == None) & (case_id == "dawood"))
    case_entities = db.query(Entity).filter(Entity.community_id.isnot(None)).filter(ent_filter).all()
    
    comms = {}
    for e in case_entities:
        c = e.community_id
        if c not in comms:
            comms[c] = {"size": 0, "members": [], "key_nodes": []}
        comms[c]["size"] += 1
        comms[c]["members"].append(e.name)
        if e.pagerank and e.pagerank > 0.01:
            comms[c]["key_nodes"].append({"name": e.name, "type": e.entity_type})
            
    summary = []
    for c, data in comms.items():
        summary.append({
            "community_id": c,
            "size": data["size"],
            "key_nodes": data["key_nodes"][:3],
            "synopsis": f"Community {c} with {data['size']} members."
        })
    return sorted(summary, key=lambda x: x["size"], reverse=True)'''

content = content.replace(old_influencers, new_influencers)
content = content.replace(old_communities, new_communities)

with codecs.open('backend/graph/algorithms.py', 'w', 'utf-8') as f:
    f.write(content)
print("algorithms.py optimized.")
