from backend.database.schema import SessionLocal
from backend.graph.builder import build_graph_from_db, graph_to_json

db = SessionLocal()
G = build_graph_from_db(db, force_rebuild=True, case_id="dawood")
data = graph_to_json(G)
node_ids = {n['id'] for n in data['nodes']}
print("Missing sources:", [e for e in data['edges'] if e['source'] not in node_ids])
print("Missing targets:", [e for e in data['edges'] if e['target'] not in node_ids])
