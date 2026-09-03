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

def get_top_influencers(db: Session, limit: int = 10, case_id: str = "dawood") -> list[dict]:
    ent_filter = (Entity.case_id == case_id) | ((Entity.case_id == None) & (case_id == "dawood"))
    
    # Try getting persons first
    case_entities = db.query(Entity).filter(ent_filter).filter(Entity.entity_type == "PERSON").order_by(Entity.pagerank.desc()).limit(limit).all()
    
    # If no persons have pagerank, fallback to any entity type
    if not case_entities or all(e.pagerank == 0.0 or e.pagerank is None for e in case_entities):
        case_entities = db.query(Entity).filter(ent_filter).order_by(Entity.pagerank.desc()).limit(limit).all()
        
    return [{"id": e.id, "name": e.name, "type": e.entity_type, "pagerank": round(e.pagerank or 0, 6), "betweenness": round(e.betweenness or 0, 6), "community_id": e.community_id} for e in case_entities]

def get_communities_summary(db: Session, case_id: str = "dawood") -> list[dict]:
    ent_filter = (Entity.case_id == case_id) | ((Entity.case_id == None) & (case_id == "dawood"))
    case_entities = db.query(Entity).filter(Entity.community_id.isnot(None)).filter(ent_filter).all()
    
    communities = {}
    for e in case_entities:
        cid = e.community_id
        if cid not in communities:
            communities[cid] = {"community_id": cid, "member_count": 0, "members": []}
        communities[cid]["member_count"] += 1
        if len(communities[cid]["members"]) < 5:
            communities[cid]["members"].append({"id": e.id, "name": e.name, "type": e.entity_type})
            
    # Comprehensive tactical alias definitions for all cases
    CASE_COMMUNITY_PROFILES = {
        "dawood": [
            ("D-Company Global Command", "Cross-Border Strategic Command & Elite Coordination"),
            ("Abu Salem Extortion Cadre", "Extortion, Bollywood Threat Ops & Contract Hits"),
            ("Tiger Memon Financial Ring", "Cross-Border Hawala, Smurfing & Shell Operations"),
            ("Dongri Tactical Safehouse Network", "Counter-Surveillance & Secure Harboring")
        ],
        "drug_punjab": [
            ("Majha Border Air-Drop Cartel", "Cross-Border Afghan Heroin Smuggling & Drone Drops"),
            ("Billa Sandhu Interstate Transit Ring", "High-Speed Highway Corridor Supply & Bulk Peddling"),
            ("Amritsar Hawala Liquidation Cell", "Drug Cash Layering & Benami Account Smurfing"),
            ("Border Belt Mule & Drop Unit", "Concealed Agricultural Stashes & Rural Distribution")
        ],
        "ht_assam": [
            ("Brahmaputra Transit Smuggling Syndicate", "Cross-Border Riverine Extraction & False Documentation"),
            ("Chakrashila Identity Forgery Ring", "Fake Aadhaar & Paperwork Fabrication for Forced Migrants"),
            ("Guwahati Long-Haul Train Network", "Interstate Safehouse Confinement & Railway Courier Ops"),
            ("Silchar Brokerage & Enforcer Cell", "Exploitative Labor Placement & Local Intermediary Hub")
        ],
        "cyber_bengaluru": [
            ("Apex ShadowMesh Phishing Consortium", "Spear-Phishing Executives & Reverse-Proxy Infiltration"),
            ("Zero-Day Monero Ransomware Ring", "Critical Infrastructure Lockout & Decentralized Tumblers"),
            ("DarkWeb Fast-Cash Extraction Squad", "ATM Cloning, Mule Account Liquidation & P2P Escrow"),
            ("Whitefield Cyber Infrastructure Cell", "Bulletproof Server Hosting & Botnet Command Nodes")
        ],
        "money_gujarat": [
            ("Surat Diamond Bourse Shadow Vault", "Under-Invoicing Conflict Gems & Token-Based Angadias"),
            ("Navsari-Dubai Smurfing Consortium", "Trade-Based Money Laundering & Shell Import Fronts"),
            ("Intercity Angadia Cash Mule Corridor", "Nightly Armored Vehicle Cash Transfers & Benami Vaults"),
            ("Surat Tactical Ledger Hub", "Double-Entry Offline Bookkeeping & Token Verification")
        ],
        "arms_chhattisgarh": [
            ("Dandakaranya Heavy Ordnance Arsenal", "Procuring Military-Grade IEDs & Assault Weaponry"),
            ("Bailadila Iron-Ore Transport Smugglers", "Covert Weapon Transit via Mineral Logistics Trucks"),
            ("Bastar Dense-Forest Courier Unit", "Unmarked Trail Weapon Caches & Camouflaged Bunkers"),
            ("Border Pipeline Arms Brokerage", "Interstate Illicit Firearms Acquisition & Distribution")
        ],
        "wildlife_kerala": [
            ("Silent Valley Ivory Poaching Consortium", "Illegal Elephant Tusk Extraction & Rainforest Traps"),
            ("Malabar Coast Maritime Smugglers", "Overseas Sea-Route Export of Endangered Rare Fauna"),
            ("Wayanad Forest Transit Brokers", "Covert Safehouse Storage & Counterfeit Forest Clearances"),
            ("Nilgiri Local Tracker & Trapper Ring", "Deep Jungle Animal Tracking & Poacher Encampments")
        ],
        "extortion_up": [
            ("Purvanchal Bahubali Hit Squad", "Targeted Political Intimidation, Toll Hafta & Enforcers"),
            ("Gorakhpur Tender-Rigging Syndicate", "Coercive Armed Takeover of Public Contracts & Mining"),
            ("Bhojpur Hawala Protection Network", "Extortion Collection & Real Estate Strong-Arming"),
            ("Eastern UP Safehouse Logistics Ring", "Fugitive Harboring & Untraceable Vehicle Routing")
        ]
    }

    # Assign tactical aliases based on case and cluster index
    profiles = CASE_COMMUNITY_PROFILES.get(case_id, CASE_COMMUNITY_PROFILES["dawood"])
    sorted_cids = sorted(communities.keys())

    for idx, cid in enumerate(sorted_cids):
        data = communities[cid]
        member_names = [m["name"].lower() for m in data["members"]]
        
        # Priority keyword checks
        if any("dawood" in n for n in member_names):
            data["alias"] = "D-Company Global Command"
            data["dominant_crime_type"] = "Cross-Border Strategic Command & Elite Coordination"
        elif any("salem" in n for n in member_names):
            data["alias"] = "Abu Salem Extortion Cadre"
            data["dominant_crime_type"] = "Extortion, Bollywood Threat Ops & Contract Hits"
        elif any("memon" in n for n in member_names):
            data["alias"] = "Tiger Memon Financial Ring"
            data["dominant_crime_type"] = "Cross-Border Hawala, Smurfing & Shell Operations"
        else:
            profile = profiles[idx % len(profiles)]
            data["alias"] = f"{profile[0]} (Cluster {cid})"
            data["dominant_crime_type"] = profile[1]
            
    return list(communities.values())
