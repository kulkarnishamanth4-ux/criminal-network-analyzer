from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from backend.database.schema import get_db
from backend.database.models import Entity
from backend.graph.decapitation import compute_decapitation_strategy
from backend.graph.ghost_rendezvous import detect_ghost_rendezvous
from backend.nlp.stylometry import analyze_stylometry
from backend.nlp.interrogation_engine import interrogate_suspect
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class StylometryRequest(BaseModel):
    text: str

class InterrogationRequest(BaseModel):
    entity_id: int
    question: str
    history: Optional[List[dict]] = []

@router.get("/experimental/decapitation")
def get_decapitation(max_targets: int = 3, db: Session = Depends(get_db)):
    """Computes mathematical minimum-cut strike sequence to cause maximum syndicate fragmentation."""
    return compute_decapitation_strategy(db, max_targets)

@router.get("/experimental/ghost-rendezvous")
def get_ghost_rendezvous(max_time_diff_hours: int = 48, db: Session = Depends(get_db)):
    """Uncovers covert physical rendezvous between suspects with zero direct telecom/financial contact."""
    return detect_ghost_rendezvous(db, max_time_diff_hours)

@router.post("/experimental/stylometry/match")
def match_stylometry(req: StylometryRequest, db: Session = Depends(get_db)):
    """Attributes unclassified text/SMS/chat snippets to suspects via Syntax DNA & Hinglish dialect markers."""
    return analyze_stylometry(req.text, db)

@router.post("/experimental/interrogate")
def interrogate(req: InterrogationRequest, db: Session = Depends(get_db)):
    """Digital Twin Interrogation Engine with live ground-truth lie detection and trap question generation."""
    return interrogate_suspect(db, req.entity_id, req.question, req.history)

@router.get("/experimental/suspects")
def list_suspects(db: Session = Depends(get_db)):
    """Returns list of suspect entities available for interrogation and stylometric profiling."""
    suspects = db.query(Entity).filter(Entity.entity_type == "PERSON").all()
    return {
        "suspects": [
            {"id": s.id, "name": s.name, "risk_score": s.risk_score, "pagerank": s.pagerank}
            for s in suspects
        ]
    }
