from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from backend.database.schema import get_db
from backend.database import crud
from backend.limiter import limiter

router = APIRouter()


def entity_to_dict(e):
    """Convert SQLAlchemy Entity to JSON-serializable dict."""
    return {
        "id": e.id,
        "entity_type": e.entity_type,
        "name": e.name,
        "properties": e.properties or {},
        "risk_score": e.risk_score or 0.0,
        "pagerank": round(e.pagerank or 0, 6),
        "betweenness": round(e.betweenness or 0, 6),
        "community_id": e.community_id,
    }


@router.get("/search")
@limiter.limit("60/minute")
def search(request: Request, q: str, type: str = None, limit: int = 20, case_id: str = None, db: Session = Depends(get_db)):
    results = crud.search_entities(db, q, type, limit, case_id)
    return {"results": [entity_to_dict(e) for e in results]}


@router.get("/entity/{entity_id}/dossier")
@limiter.limit("60/minute")
def entity_dossier(request: Request, entity_id: int, db: Session = Depends(get_db)):
    data = crud.get_entity_dossier(db, entity_id)
    if not data or not data.get("entity"):
        return {"error": "Entity not found"}

    entity = data["entity"]
    return {
        "entity": entity_to_dict(entity),
        "relationships": data.get("relationships", []),
        "firs": [
            {
                "id": f.id,
                "fir_number": f.fir_number,
                "date": str(f.date) if f.date else None,
                "police_station": f.police_station,
                "district": f.district,
                "crime_type": f.crime_type,
                "crime_confidence": f.crime_confidence,
                "raw_text": f.raw_text[:300] if f.raw_text else None,
            }
            for f in data.get("firs", [])
        ],
        "anomalies": [
            {
                "id": a.id,
                "anomaly_type": a.anomaly_type,
                "severity": a.severity,
                "title": a.title,
                "description": a.description,
            }
            for a in data.get("anomalies", [])
        ],
    }
