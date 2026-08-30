from backend.database.schema import SessionLocal
from backend.graph.builder import build_graph_from_db, graph_to_json
import json

db = SessionLocal()
G = build_graph_from_db(db, force_rebuild=True, case_id="cyber_bengaluru")
data = graph_to_json(G)
print(json.dumps(data, indent=2))
