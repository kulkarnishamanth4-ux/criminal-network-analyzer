from backend.database.schema import SessionLocal
from backend.graph.builder import build_graph_from_db, graph_to_json
import json

db = SessionLocal()
G = build_graph_from_db(db, force_rebuild=True, case_id="dawood")
data = graph_to_json(G)
print("Nodes:", len(data['nodes']))
print("Edges:", len(data['edges']))
# Print first few edges
for e in data['edges'][:5]:
    print(e)
