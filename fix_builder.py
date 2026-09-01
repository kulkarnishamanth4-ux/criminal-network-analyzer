import codecs

with codecs.open('backend/graph/builder.py', 'r', 'utf-8') as f:
    content = f.read()

old_builder = '''def build_graph_from_db(db: Session, force_rebuild: bool = False, case_id: str = "dawood") -> nx.Graph:
    global _cached_graphs
    if case_id in _cached_graphs and not force_rebuild:
        return _cached_graphs[case_id]

    G = nx.DiGraph()
    entities = db.query(Entity).all()
    
    # Filter entities by case_id (defaulting to "dawood" for older records)
    case_entities = {e.id: e for e in entities if (e.properties or {}).get('case_id', 'dawood') == case_id}
    
    for e in case_entities.values():
        G.add_node(e.id, entity_type=e.entity_type, name=e.name, properties=e.properties, risk_score=e.risk_score, pagerank=e.pagerank, betweenness=e.betweenness, community_id=e.community_id)
        
    relationships = db.query(Relationship).all()
    for r in relationships:
        if r.source_id in case_entities and r.target_id in case_entities:
            G.add_edge(r.source_id, r.target_id, id=r.id, rel_type=r.rel_type, weight=r.weight, properties=r.properties, timestamp=r.timestamp)
        
    _cached_graphs[case_id] = G
    return G'''

new_builder = '''def build_graph_from_db(db: Session, force_rebuild: bool = False, case_id: str = "dawood") -> nx.Graph:
    global _cached_graphs
    if case_id in _cached_graphs and not force_rebuild:
        return _cached_graphs[case_id]

    G = nx.DiGraph()
    
    # Filter at database level for high performance
    ent_filter = (Entity.case_id == case_id) | ((Entity.case_id == None) & (case_id == "dawood"))
    rel_filter = (Relationship.case_id == case_id) | ((Relationship.case_id == None) & (case_id == "dawood"))
    
    entities = db.query(Entity).filter(ent_filter).all()
    case_entities = {e.id: e for e in entities}
    
    for e in entities:
        G.add_node(e.id, entity_type=e.entity_type, name=e.name, properties=e.properties, risk_score=e.risk_score, pagerank=e.pagerank, betweenness=e.betweenness, community_id=e.community_id)
        
    relationships = db.query(Relationship).filter(rel_filter).all()
    for r in relationships:
        if r.source_id in case_entities and r.target_id in case_entities:
            G.add_edge(r.source_id, r.target_id, id=r.id, rel_type=r.rel_type, weight=r.weight, properties=r.properties, timestamp=r.timestamp)
        
    _cached_graphs[case_id] = G
    return G'''

content = content.replace(old_builder, new_builder)

with codecs.open('backend/graph/builder.py', 'w', 'utf-8') as f:
    f.write(content)
print("builder.py optimized.")
