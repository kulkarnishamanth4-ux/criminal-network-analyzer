from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.schema import get_db
from backend.graph.builder import build_graph_from_db, get_ego_network, graph_to_json

router = APIRouter()

@router.get("/network/{entity_id}")
def get_entity_network(entity_id: int, depth: int = 2, db: Session = Depends(get_db)):
    G = build_graph_from_db(db)
    return get_ego_network(G, entity_id, depth)

@router.get("/graph/full")
def get_full_graph(db: Session = Depends(get_db)):
    G = build_graph_from_db(db)
    return graph_to_json(G)
