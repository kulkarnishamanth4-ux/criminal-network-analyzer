import networkx as nx
from backend.database.schema import SessionLocal
from backend.database.models import Entity
from backend.graph.builder import build_graph_from_db
from backend.graph.algorithms import detect_communities

db = SessionLocal()
print("Building graph from DB...")
G = build_graph_from_db(db, force_rebuild=True, case_id="dawood")
print("Computing PageRank...")
try:
    pr = nx.pagerank(G, max_iter=100)
    for node_id, score in pr.items():
        db.query(Entity).filter(Entity.id == node_id).update({"pagerank": score})
    db.commit()
    print("PageRank updated.")
    
    print("Detecting Communities...")
    detect_communities(db, G)
    print("Communities and Betweenness updated.")
except Exception as e:
    print("Error:", e)
