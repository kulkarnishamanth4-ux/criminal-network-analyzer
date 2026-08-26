import networkx as nx
from sqlalchemy.orm import Session
from backend.database.models import Entity, Relationship

def build_graph_from_db(db: Session) -> nx.Graph:
    G = nx.DiGraph()
    entities = db.query(Entity).all()
    for e in entities:
        G.add_node(e.id, entity_type=e.entity_type, name=e.name, properties=e.properties, risk_score=e.risk_score, pagerank=e.pagerank or 0.0, betweenness=e.betweenness or 0.0, community_id=e.community_id)
        
    relationships = db.query(Relationship).all()
    for r in relationships:
        G.add_edge(r.source_id, r.target_id, id=r.id, rel_type=r.rel_type, weight=r.weight, properties=r.properties, timestamp=r.timestamp)
        
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
