from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from backend.database.schema import get_db
from backend.database.models import Entity
from backend.graph.decapitation import compute_decapitation_strategy
from backend.graph.ghost_rendezvous import detect_ghost_rendezvous
from backend.nlp.stylometry import analyze_stylometry
from backend.nlp.interrogation_engine import interrogate_suspect
from backend.nlp.ghost_acoustic import analyze_ambient_acoustics
from backend.graph.hawala_fluid import simulate_hawala_fluid_dynamics
from backend.analytics.panic_entropy import calculate_panic_profile
from backend.graph.quantum_mole import detect_internal_leaks
from backend.nlp.cryptolalia import decode_dark_slang
from backend.crypto.zk_federation import execute_zk_federation_query
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class StylometryRequest(BaseModel):
    text: str

class InterrogationRequest(BaseModel):
    entity_id: int
    question: str
    history: Optional[List[dict]] = []

class AcousticRequest(BaseModel):
    audio_profile_id: Optional[str] = "intercept_call_001"

class HawalaFluidRequest(BaseModel):
    frozen_account_ids: Optional[List[int]] = []

class CryptolaliaRequest(BaseModel):
    text: str

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

@router.post("/experimental/ghost-acoustic/analyze")
def analyze_acoustics(req: AcousticRequest):
    """Project Ghost-Acoustic: micro-ambient acoustic geo-triangulation."""
    return analyze_ambient_acoustics(req.audio_profile_id)

@router.post("/experimental/hawala-fluid/simulate")
def simulate_hawala_fluid(req: HawalaFluidRequest, db: Session = Depends(get_db)):
    """Hawala Fluid Dynamics & Synthetic Liquidity Flash-Crash simulation."""
    return simulate_hawala_fluid_dynamics(db, req.frozen_account_ids)

@router.get("/experimental/panic-entropy/{entity_id}")
def get_panic_entropy(entity_id: int, db: Session = Depends(get_db)):
    """Cognitive Exhaust & Panic-Entropy Profiler calculating confession probability."""
    return calculate_panic_profile(db, entity_id)

@router.get("/experimental/quantum-mole")
def get_quantum_mole(db: Session = Depends(get_db)):
    """Quantum Mole-Hunter: Negative-topology internal leak detector."""
    return detect_internal_leaks(db)

@router.post("/experimental/cryptolalia/decode")
def decode_cryptolalia(req: CryptolaliaRequest):
    """Autonomous Dark-Slang Evolving Decryption (Cryptolalia Radar)."""
    return decode_dark_slang(req.text)

@router.get("/experimental/zk-federation")
def get_zk_federation():
    """Zero-Knowledge Blind Graph Federation across state police agency nodes."""
    return execute_zk_federation_query()
