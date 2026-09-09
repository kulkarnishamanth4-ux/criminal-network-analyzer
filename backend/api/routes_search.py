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
    try:
        from backend.security.audit_logger import audit_logger
        audit_logger.log_event(
            action="INTELLIGENCE_SEARCH",
            user=request.headers.get("X-User-Id", "OFFICER-ATS-402"),
            resource=f"QUERY:{q}",
            details=f"Search executed for '{q}' (Type Filter: {type or 'ALL'}, Case: {case_id or 'ALL'}) - {len(results)} matches retrieved",
            severity="INFO",
            ip_address=request.client.host if request.client else "127.0.0.1"
        )
    except Exception:
        pass
    return {"results": [entity_to_dict(e) for e in results]}


@router.get("/entity/{entity_id}/dossier")
@limiter.limit("60/minute")
def entity_dossier(request: Request, entity_id: int, db: Session = Depends(get_db)):
    data = crud.get_entity_dossier(db, entity_id)
    if not data or not data.get("entity"):
        return {"error": "Entity not found"}

    entity = data["entity"]
    try:
        from backend.security.audit_logger import audit_logger
        props = entity.properties or {}
        role = props.get("role") or props.get("classification")
        if not role:
            if entity.risk_score >= 0.7:
                role = "Accused / Primary Target"
            elif entity.entity_type == "PERSON":
                role = "Person of Interest"
            else:
                role = entity.entity_type

        is_victim = "victim" in str(role).lower() or props.get("status") == "Under Police Protection"
        classification_prefix = "VICTIM" if is_victim else ("ACCUSED" if entity.risk_score >= 0.7 else entity.entity_type)

        audit_logger.log_event(
            action="ENTITY_DOSSIER_ACCESSED",
            user=request.headers.get("X-User-Id", "OFFICER-ATS-402"),
            resource=f"ENTITY:{entity.id}:{entity.name}",
            details=f"Accessed 360-degree intelligence dossier for {classification_prefix} '{entity.name}' (Role: {role}, Risk: {round((entity.risk_score or 0)*100)}%, Case: {entity.case_id})",
            severity="WARNING" if entity.risk_score >= 0.75 else "INFO",
            ip_address=request.client.host if request.client else "127.0.0.1"
        )
    except Exception:
        pass

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
