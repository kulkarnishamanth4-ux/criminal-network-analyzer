"""
Exports all 8 cases from the local SQLite database into frontend/src/data/offline_intelligence.json
Ensures 100% offline data availability on Vercel, PWA, or air-gapped environments.
"""

import json
import os
from backend.database.schema import SessionLocal
from backend.database.models import Anomaly
from backend.graph.builder import build_graph_from_db, graph_to_json
from backend.database.crud import get_dashboard_stats

CASES = [
    'dawood',
    'drug_punjab',
    'ht_assam',
    'cyber_bengaluru',
    'money_gujarat',
    'arms_chhattisgarh',
    'wildlife_kerala',
    'extortion_up'
]


def export_bundle():
    db = SessionLocal()
    export_data = {}

    for cid in CASES:
        G = build_graph_from_db(db, case_id=cid)
        graph_json = graph_to_json(G)
        stats = get_dashboard_stats(db, case_id=cid)

        anomalies = db.query(Anomaly).filter(Anomaly.case_id == cid).all()
        anom_list = [{
            'id': a.id,
            'anomaly_type': a.anomaly_type,
            'severity': a.severity,
            'title': a.title,
            'description': a.description,
            'evidence': a.evidence,
            'entity_ids': a.entity_ids,
            'case_id': a.case_id,
            'created_at': a.created_at.isoformat() if a.created_at else None
        } for a in anomalies]

        sorted_nodes = sorted(G.nodes(data=True), key=lambda x: x[1].get('pagerank', 0.0), reverse=True)
        influencers = [{
            'id': n[0],
            'name': n[1].get('name'),
            'entity_type': n[1].get('type'),
            'pagerank': n[1].get('pagerank', 0.0),
            'betweenness': n[1].get('betweenness', 0.0),
            'risk_score': n[1].get('risk_score', 0)
        } for n in sorted_nodes[:10]]

        export_data[cid] = {
            'graph': graph_json,
            'stats': stats,
            'anomalies': anom_list,
            'influencers': influencers
        }

    db.close()

    out_dir = os.path.join('frontend', 'src', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, 'offline_intelligence.json')

    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, indent=2)

    print(f"Exported all 8 cases to {out_file} (Size: {os.path.getsize(out_file)} bytes)")
    for cid in CASES:
        g = export_data[cid]['graph']
        print(f"Case {cid:18}: nodes={len(g['nodes'])}, edges={len(g['edges'])}, anomalies={len(export_data[cid]['anomalies'])}")


if __name__ == '__main__':
    export_bundle()
