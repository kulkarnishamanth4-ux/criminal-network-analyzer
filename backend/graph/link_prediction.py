import networkx as nx

def predict_links(G: nx.Graph, min_confidence: float = 0.3) -> list[dict]:
    undirected_G = G.to_undirected()
    preds = []
    
    try:
        jc = list(nx.jaccard_coefficient(undirected_G))
        for u, v, p in jc:
            if p >= min_confidence:
                preds.append({
                    "source_id": u,
                    "target_id": v,
                    "source_name": G.nodes[u].get('name', str(u)),
                    "target_name": G.nodes[v].get('name', str(v)),
                    "confidence": p,
                    "evidence": ["High Jaccard similarity between nodes"]
                })
    except Exception:
        pass
        
    return sorted(preds, key=lambda x: x['confidence'], reverse=True)
