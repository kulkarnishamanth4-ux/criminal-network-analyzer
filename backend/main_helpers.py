from sqlalchemy.orm import Session
from backend.graph.builder import build_graph_from_db
from backend.graph.algorithms import update_entity_metrics
from backend.graph.anomaly_detector import detect_all_anomalies

def compute_all_analytics(db: Session):
    G = build_graph_from_db(db)
    update_entity_metrics(db, G)
    detect_all_anomalies(db, G)
