from sqlalchemy.orm import Session
import networkx as nx
from backend.database.models import Anomaly

def detect_all_anomalies(db: Session, G: nx.Graph) -> list[dict]:
    # Placeholder for running all anomaly detection rules
    # This function is meant to aggregate results
    results = []
    results.extend(detect_burst_calling(db))
    results.extend(detect_rapid_money_flow(db))
    results.extend(detect_circular_transactions(db, G))
    results.extend(detect_ghost_connectors(db, G))
    results.extend(detect_geographic_anomaly(db))
    
    anomalies = []
    for r in results:
        a = Anomaly(
            anomaly_type=r.get("anomaly_type"),
            severity=r.get("severity"),
            title=r.get("title"),
            description=r.get("description"),
            evidence=r.get("evidence"),
            entity_ids=r.get("entity_ids")
        )
        db.add(a)
        anomalies.append(r)
    db.commit()
    return anomalies

def detect_burst_calling(db: Session) -> list[dict]:
    return []

def detect_rapid_money_flow(db: Session) -> list[dict]:
    return []

def detect_circular_transactions(db: Session, G: nx.Graph) -> list[dict]:
    directed_money = nx.DiGraph()
    for u, v, data in G.edges(data=True):
        if data.get('rel_type') == 'TRANSFERRED_MONEY_TO':
            directed_money.add_edge(u, v)
            
    anomalies = []
    try:
        cycles = list(nx.simple_cycles(directed_money))
        for c in cycles:
            if len(c) > 1:
                anomalies.append({
                    "anomaly_type": "CIRCULAR_TRANSACTION",
                    "severity": "CRITICAL",
                    "title": "Circular Money Flow Detected",
                    "description": "Funds flow in a cycle between these accounts",
                    "evidence": [f"Cycle detected involving {len(c)} nodes"],
                    "entity_ids": c
                })
    except Exception:
        pass
    return anomalies

def detect_ghost_connectors(db: Session, G: nx.Graph) -> list[dict]:
    anomalies = []
    try:
        bw = nx.betweenness_centrality(G)
        deg = dict(G.degree())
        
        # Identify high betweenness (>0.1) and low degree (<5)
        for node in G.nodes():
            if deg.get(node, 0) < 5 and bw.get(node, 0) > 0.1:
                anomalies.append({
                    "anomaly_type": "GHOST_CONNECTOR",
                    "severity": "HIGH",
                    "title": "Ghost Connector Identified",
                    "description": "Node has low direct connections but sits on many shortest paths",
                    "evidence": [f"Degree: {deg[node]}, Betweenness: {bw[node]:.4f}"],
                    "entity_ids": [node]
                })
    except Exception:
        pass
    return anomalies

def detect_geographic_anomaly(db: Session) -> list[dict]:
    return []
