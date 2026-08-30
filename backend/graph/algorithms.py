import networkx as nx
import community as community_louvain
from sqlalchemy.orm import Session
from backend.database.models import Entity
import logging

def compute_pagerank(G: nx.Graph) -> dict:
    try:
        # Don't use edge weight - financial amounts skew structural importance
        return nx.pagerank(G)
    except Exception as e:
        logging.error(f"PageRank error: {e}")
        return {}

def compute_betweenness(G: nx.Graph) -> dict:
    try:
        return nx.betweenness_centrality(G)
    except Exception as e:
        logging.error(f"Betweenness error: {e}")
        return {}

def detect_communities(G: nx.Graph) -> dict:
    if len(G.nodes) == 0:
        return {}
    undirected_G = G.to_undirected()
    try:
        return community_louvain.best_partition(undirected_G, weight='weight')
    except Exception as e:
        logging.error(f"Community detection error: {e}")
        return {}

def update_entity_metrics(db: Session, G: nx.Graph):
    if len(G.nodes) == 0:
        return
        
    pr = compute_pagerank(G)
    bw = compute_betweenness(G)
    comm = detect_communities(G)
    
    entities = db.query(Entity).all()
    for e in entities:
        if e.id in pr:
            e.pagerank = pr[e.id]
        if e.id in bw:
            e.betweenness = bw[e.id]
        if e.id in comm:
            e.community_id = comm[e.id]
            
    db.commit()

def get_top_influencers(db: Session, limit: int = 10) -> list[dict]:
    entities = db.query(Entity).filter(Entity.entity_type == "PERSON").order_by(Entity.pagerank.desc()).limit(limit).all()
    if not entities or all(e.pagerank == 0 for e in entities):
        # Fallback: return all entity types sorted by pagerank
        entities = db.query(Entity).order_by(Entity.pagerank.desc()).limit(limit).all()
    return [{"id": e.id, "name": e.name, "type": e.entity_type, "pagerank": round(e.pagerank or 0, 6), "betweenness": round(e.betweenness or 0, 6), "community_id": e.community_id} for e in entities]

def get_communities_summary(db: Session) -> list[dict]:
    entities = db.query(Entity).filter(Entity.community_id.isnot(None)).all()
    communities = {}
    for e in entities:
        cid = e.community_id
        if cid not in communities:
            communities[cid] = {"community_id": cid, "member_count": 0, "members": []}
        communities[cid]["member_count"] += 1
        if len(communities[cid]["members"]) < 5:
            communities[cid]["members"].append({"id": e.id, "name": e.name, "type": e.entity_type})
            
    # Assign tactical aliases based on members
    for cid, data in communities.items():
        member_names = [m["name"].lower() for m in data["members"]]
        
        if any("dawood" in n or "kaskar" in n for n in member_names):
            data["alias"] = "D-Company Global Command"
            data["dominant_crime_type"] = "Cross-border Syndicate Operations"
        elif any("salem" in n or "shooter" in n or "hitman" in n for n in member_names):
            data["alias"] = "Abu Salem Extortion Cadre"
            data["dominant_crime_type"] = "Extortion & Contract Killings"
        elif any("memon" in n or "smurfer" in n or "hawala" in n for n in member_names):
            data["alias"] = "Tiger Memon Financial Ring"
            data["dominant_crime_type"] = "Hawala & Money Laundering"
        elif any("mirchi" in n for n in member_names):
            data["alias"] = "Mirchi Narcotics Cartel"
            data["dominant_crime_type"] = "Global Narcotics Smuggling"
        else:
            data["alias"] = f"Peripheral Cell Alpha-{cid}"
            data["dominant_crime_type"] = "Logistics & Local Support"
            
    return list(communities.values())
