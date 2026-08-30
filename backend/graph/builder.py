import networkx as nx
from sqlalchemy.orm import Session
from backend.database.models import Entity, Relationship

_cached_graph = None

_cached_graphs = {}

def invalidate_graph_cache():
    global _cached_graphs
    _cached_graphs.clear()

def build_graph_from_db(db: Session, force_rebuild: bool = False, case_id: str = "dawood") -> nx.Graph:
    global _cached_graphs
    if case_id in _cached_graphs and not force_rebuild:
        return _cached_graphs[case_id]

    G = nx.DiGraph()
    entities = db.query(Entity).all()
    
    # Filter entities by case_id (defaulting to "dawood" for older records)
    case_entities = {e.id: e for e in entities if (e.properties or {}).get('case_id', 'dawood') == case_id}
    
    for e in case_entities.values():
        G.add_node(e.id, entity_type=e.entity_type, name=e.name, properties=e.properties, risk_score=e.risk_score, pagerank=e.pagerank or 0.0, betweenness=e.betweenness or 0.0, community_id=e.community_id)
        
    relationships = db.query(Relationship).all()
    for r in relationships:
        if r.source_id in case_entities and r.target_id in case_entities:
            G.add_edge(r.source_id, r.target_id, id=r.id, rel_type=r.rel_type, weight=r.weight, properties=r.properties, timestamp=r.timestamp)
        
    _cached_graphs[case_id] = G
    return G

def get_ego_network(G: nx.Graph, node_id: int, depth: int = 2) -> dict:
    if node_id not in G:
        return {"nodes": [], "edges": []}
        
    ego_graph = nx.ego_graph(G, node_id, radius=depth)
    return graph_to_json(ego_graph)

def graph_to_json(G: nx.Graph) -> dict:
    nodes = []
    for node, data in G.nodes(data=True):
        nodes.append({"id": node, "type": data.get("entity_type"), "label": data.get("name"), "properties": data.get("properties", {}), "metrics": {"pagerank": data.get("pagerank", 0.0), "betweenness": data.get("betweenness", 0.0), "community_id": data.get("community_id")}})
        
    edges = []
    for source, target, data in G.edges(data=True):
        edges.append({"id": data.get("id"), "source": source, "target": target, "type": data.get("rel_type"), "label": data.get("rel_type"), "weight": data.get("weight", 1.0), "properties": data.get("properties", {})})
        
    return {"nodes": nodes, "edges": edges}
