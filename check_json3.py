from backend.database.schema import SessionLocal
from backend.graph.builder import build_graph_from_db, graph_to_json

db = SessionLocal()
G = build_graph_from_db(db, force_rebuild=True, case_id="dawood")
data = graph_to_json(G)
for e in data['edges']:
    print(f"Edge: {e['source']} -> {e['target']} [{e['type']}]")
