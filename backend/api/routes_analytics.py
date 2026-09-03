from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.schema import get_db
from backend.database.crud import get_dashboard_stats, get_all_anomalies
from backend.graph.algorithms import get_top_influencers, get_communities_summary
from backend.graph.builder import build_graph_from_db
from backend.graph.crime_predictor import predict_crime_types
from backend.graph.link_prediction import predict_links

router = APIRouter()

@router.get("/analytics/top-influencers")
def top_influencers(limit: int = 10, case_id: str = "dawood", db: Session = Depends(get_db)):
    return get_top_influencers(db, limit, case_id)

@router.get("/analytics/communities")
def communities_summary(case_id: str = "dawood", db: Session = Depends(get_db)):
    return get_communities_summary(db, case_id)

@router.get("/analytics/anomalies")
def all_anomalies(case_id: str = "dawood", db: Session = Depends(get_db)):
    anomalies = get_all_anomalies(db, case_id)
    return {"anomalies": [
        {"id": a.id, "anomaly_type": a.anomaly_type, "severity": a.severity,
         "title": a.title, "description": a.description,
         "evidence": a.evidence or [], "entity_ids": a.entity_ids or []}
        for a in anomalies
    ]}

@router.get("/analytics/crime-predictions")
def crime_predictions(community_id: int = None, case_id: str = "dawood", db: Session = Depends(get_db)):
    G = build_graph_from_db(db, case_id=case_id)
    return predict_crime_types(db, G, community_id, case_id=case_id)

@router.get("/analytics/predicted-links")
def predicted_links(min_confidence: float = 0.3, case_id: str = "dawood", db: Session = Depends(get_db)):
    G = build_graph_from_db(db, case_id=case_id)
    return predict_links(G, min_confidence)

@router.get("/analytics/dashboard-stats")
def dashboard_stats(case_id: str = "dawood", db: Session = Depends(get_db)):
    return get_dashboard_stats(db, case_id)
