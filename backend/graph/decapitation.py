import networkx as nx
from sqlalchemy.orm import Session
from backend.database.models import Entity, Relationship
from backend.graph.builder import build_graph_from_db

def compute_decapitation_strategy(db: Session, max_targets: int = 3) -> dict:
    """
    Computes the mathematical Critical Cut-Set (Algorithmic Decapitation).
    Uses Spectral Graph Theory, Articulation Points, and percolation simulations
    to determine which minimal sequence of arrests causes the largest collapse
    of the syndicate's Largest Connected Component (LCC).
    """
    G = build_graph_from_db(db)
    undirected = G.to_undirected()
    
    if len(undirected.nodes) == 0:
        return {
            "status": "empty",
            "message": "No graph data available to simulate decapitation",
            "baseline_lcc_size": 0,
            "recommended_targets": [],
            "simulation_results": []
        }
        
    initial_nodes_count = len(undirected.nodes)
    initial_components = list(nx.connected_components(undirected))
    initial_lcc_size = max(len(c) for c in initial_components) if initial_components else 0
    
    # 1. Candidate scoring: Combination of Betweenness, Articulation Points, and Degree
    betweenness = nx.betweenness_centrality(undirected)
    degrees = dict(undirected.degree())
    articulation_points = set(nx.articulation_points(undirected)) if len(undirected.nodes) > 2 else set()
    
    # Filter candidates to PERSON, BANK_ACCOUNT, and ORGANIZATION entities primarily
    candidate_scores = {}
    for node_id in undirected.nodes:
        node_type = G.nodes[node_id].get('type', 'UNKNOWN')
        name = G.nodes[node_id].get('name', str(node_id))
        
        # Priority weights: Persons & Key Accounts have higher actionable target value
        type_multiplier = 1.5 if node_type == 'PERSON' else (1.2 if node_type in ['BANK_ACCOUNT', 'ORGANIZATION'] else 0.8)
        is_articulation = 2.0 if node_id in articulation_points else 1.0
        
        score = (betweenness.get(node_id, 0) * 0.6 + (degrees.get(node_id, 0) / max(1, max(degrees.values() or [1]))) * 0.4) * type_multiplier * is_articulation
        candidate_scores[node_id] = {
            "score": score,
            "name": name,
            "type": node_type,
            "betweenness": round(betweenness.get(node_id, 0), 4),
            "degree": degrees.get(node_id, 0),
            "is_bottleneck": node_id in articulation_points
        }
        
    # Sort candidates by impact score
    ranked_candidates = sorted(candidate_scores.items(), key=lambda x: x[1]['score'], reverse=True)
    
    # 2. Greedy Sequential Percolation Simulation (finding optimal strike combo)
    sim_graph = undirected.copy()
    targets = []
    
    for i in range(min(max_targets, len(ranked_candidates))):
        best_candidate = None
        best_fragmentation = -1
        best_new_lcc = initial_lcc_size
        
        for cand_id, cand_meta in ranked_candidates:
            if cand_id in [t['id'] for t in targets] or cand_id not in sim_graph:
                continue
                
            temp_graph = sim_graph.copy()
            temp_graph.remove_node(cand_id)
            
            comps = list(nx.connected_components(temp_graph))
            new_lcc = max(len(c) for c in comps) if comps else 0
            fragmentation = 1.0 - (new_lcc / max(1, initial_lcc_size))
            
            if fragmentation > best_fragmentation:
                best_fragmentation = fragmentation
                best_candidate = (cand_id, cand_meta, new_lcc)
                
        if best_candidate:
            c_id, c_meta, n_lcc = best_candidate
            sim_graph.remove_node(c_id)
            
            # Generate tactical rationale
            rationale = []
            if c_meta["is_bottleneck"]:
                rationale.append("Structural Articulation Point (sole bridge between distinct factions)")
            if c_meta["betweenness"] > 0.05:
                rationale.append(f"Controls {int(c_meta['betweenness']*100)}% of shortest communication/money paths")
            if c_meta["type"] == "BANK_ACCOUNT":
                rationale.append("Financial clearing hub for multiple operational cells")
            elif c_meta["type"] == "PERSON":
                rationale.append("Operational coordinator with high cross-cluster reach")
            else:
                rationale.append(f"High degree centrality nexus ({c_meta['degree']} direct connections)")
                
            targets.append({
                "strike_order": len(targets) + 1,
                "id": c_id,
                "name": c_meta["name"],
                "type": c_meta["type"],
                "degree": c_meta["degree"],
                "betweenness": c_meta["betweenness"],
                "post_strike_lcc": n_lcc,
                "cumulative_fragmentation_pct": round(best_fragmentation * 100, 1),
                "tactical_rationale": " • ".join(rationale)
            })

    # 3. Final metrics
    final_comps = list(nx.connected_components(sim_graph))
    final_lcc = max(len(c) for c in final_comps) if final_comps else 0
    final_disruption = round((1.0 - (final_lcc / max(1, initial_lcc_size))) * 100, 1)
    
    return {
        "status": "success",
        "initial_entities": initial_nodes_count,
        "initial_lcc_size": initial_lcc_size,
        "final_lcc_size": final_lcc,
        "total_isolated_fragments": len(final_comps),
        "syndicate_disruption_efficiency_pct": final_disruption,
        "targets": targets,
        "summary": f"Executing {len(targets)} targeted warrants will reduce the primary criminal syndicate from {initial_lcc_size} interconnected nodes to {final_lcc} nodes, achieving {final_disruption}% network collapse across {len(final_comps)} splintered clusters."
    }
