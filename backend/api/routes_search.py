from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.database.schema import get_db
from backend.database.crud import search_entities, get_entity_dossier

router = APIRouter()

@router.get("/search")
def search(q: str, type: str = None, limit: int = 20, db: Session = Depends(get_db)):
    return search_entities(db, q, type, limit)

@router.get("/entity/{entity_id}/dossier")
def entity_dossier(entity_id: int, db: Session = Depends(get_db)):
    return get_entity_dossier(db, entity_id)
