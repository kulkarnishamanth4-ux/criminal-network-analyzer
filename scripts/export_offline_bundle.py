"""
Exports all 8 cases from the local SQLite database into frontend/src/data/offline_intelligence.json
Ensures 100% offline data availability on Vercel, PWA, or air-gapped environments.
Includes:
- Full Network Graph (nodes with properties, metrics, roles; edges with types, weights, timestamps)
- Dashboard Stats
- Detected Syndicates / Communities (Louvain clusters with tactical aliases, crime profiles, member lists)
- Threat Anomalies (evidence, severity, entity linkages)
- Key Influencers / Targets (PageRank, Betweenness)
- Court-Admissible First Information Reports (FIRs)
"""

import json
import os
import sys

# Ensure backend can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.schema import SessionLocal
from backend.database.models import Anomaly, FIR
from backend.graph.builder import build_graph_from_db, graph_to_json
from backend.graph.algorithms import get_communities_summary
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
        
        # Enrich graph nodes with explicit name, label, entity_type, type, and risk_score
        for node in graph_json.get('nodes', []):
            node_name = node.get('label') or node.get('name') or f"Entity #{node.get('id')}"
            node_type = node.get('type') or node.get('entity_type') or 'PERSON'
            node['name'] = node_name
            node['label'] = node_name
            node['type'] = node_type
            node['entity_type'] = node_type
            
            # Ensure risk_score is available on node
            pr = node.get('metrics', {}).get('pagerank', 0.0)
            node['risk_score'] = node.get('risk_score') or (round(min(1.0, pr * 15), 2) if pr > 0 else 0.3)

        stats = get_dashboard_stats(db, case_id=cid)
        communities = get_communities_summary(db, case_id=cid)

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

        firs = db.query(FIR).filter((FIR.case_id == cid) | ((FIR.case_id == None) & (cid == 'dawood'))).all()
        fir_list = [{
            'id': f.id,
            'fir_number': f.fir_number,
            'date': f.date.isoformat() if f.date else None,
            'police_station': f.police_station,
            'district': f.district,
            'crime_type': f.crime_type,
            'crime_confidence': f.crime_confidence,
            'raw_text': f.raw_text,
            'extracted_entities': f.extracted_entities or [],
            'case_id': f.case_id
        } for f in firs]

        sorted_nodes = sorted(G.nodes(data=True), key=lambda x: x[1].get('pagerank', 0.0), reverse=True)
        influencers = [{
            'id': n[0],
            'name': n[1].get('name') or f"Entity #{n[0]}",
            'entity_type': n[1].get('entity_type') or n[1].get('type') or 'PERSON',
            'type': n[1].get('entity_type') or n[1].get('type') or 'PERSON',
            'pagerank': n[1].get('pagerank', 0.0),
            'betweenness': n[1].get('betweenness', 0.0),
            'risk_score': n[1].get('risk_score', 0)
        } for n in sorted_nodes[:10]]

        export_data[cid] = {
            'graph': graph_json,
            'stats': stats,
            'communities': communities,
            'anomalies': anom_list,
            'influencers': influencers,
            'firs': fir_list
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
        print(f"Case {cid:18}: nodes={len(g['nodes'])}, edges={len(g['edges'])}, comms={len(export_data[cid]['communities'])}, anomalies={len(export_data[cid]['anomalies'])}, firs={len(export_data[cid]['firs'])}")


if __name__ == '__main__':
    export_bundle()
