from sqlalchemy.orm import Session
from backend.graph.builder import build_graph_from_db, invalidate_graph_cache
from backend.graph.algorithms import update_entity_metrics
from backend.graph.anomaly_detector import detect_all_anomalies

def compute_all_analytics(db: Session):
    invalidate_graph_cache()
    G = build_graph_from_db(db, force_rebuild=True)
    update_entity_metrics(db, G)
    detect_all_anomalies(db, G)
    invalidate_graph_cache()
