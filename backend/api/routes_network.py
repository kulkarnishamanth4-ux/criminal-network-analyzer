from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.schema import get_db
from backend.graph.builder import build_graph_from_db, get_ego_network, graph_to_json
import networkx as nx

router = APIRouter()

@router.get("/network/{entity_id}")
def get_entity_network(entity_id: int, depth: int = 2, db: Session = Depends(get_db)):
    G = build_graph_from_db(db)
    return get_ego_network(G, entity_id, depth)

@router.get("/graph/full")
def get_full_graph(db: Session = Depends(get_db)):
    G = build_graph_from_db(db)
    return graph_to_json(G)

@router.get("/graph/shortest-path")
def shortest_path(source_id: int, target_id: int, db: Session = Depends(get_db)):
    """Find shortest path between two entities."""
    G = build_graph_from_db(db)
    undirected = G.to_undirected()
    
    if source_id not in undirected or target_id not in undirected:
        return {"found": False, "message": "One or both entities not found in graph", "path": [], "steps": []}
    
    try:
        path = nx.shortest_path(undirected, source=source_id, target=target_id)
        steps = []
        for i in range(len(path) - 1):
            u, v = path[i], path[i+1]
            edge_data = G.get_edge_data(u, v) or G.get_edge_data(v, u) or {}
            rel_type = edge_data.get('rel_type', 'CONNECTED')
            source_name = G.nodes[u].get('name', str(u))
            target_name = G.nodes[v].get('name', str(v))
            steps.append({
                "from_id": u,
                "from_name": source_name,
                "to_id": v,
                "to_name": target_name,
                "relationship": rel_type
            })
        
        return {
            "found": True,
            "path": path,
            "length": len(path) - 1,
            "steps": steps
        }
    except nx.NetworkXNoPath:
        return {"found": False, "message": "No connection found between these entities", "path": [], "steps": []}
    except Exception as e:
        return {"found": False, "message": str(e), "path": [], "steps": []}

