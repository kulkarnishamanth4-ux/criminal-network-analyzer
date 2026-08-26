from sqlalchemy.orm import Session
import networkx as nx
from backend.database.models import Anomaly, Relationship, Entity
import logging

logger = logging.getLogger(__name__)


def detect_all_anomalies(db: Session, G: nx.Graph) -> list[dict]:
    """Run all anomaly detection rules. Clears old anomalies first to avoid duplicates."""
    # Clear previous anomalies
    db.query(Anomaly).delete()
    db.commit()

    results = []
    results.extend(detect_burst_calling(db))
    results.extend(detect_rapid_money_flow(db))
    results.extend(detect_circular_transactions(db, G))
    results.extend(detect_ghost_connectors(db, G))

    anomalies = []
    for r in results:
        a = Anomaly(
            anomaly_type=r.get("anomaly_type"),
            severity=r.get("severity"),
            title=r.get("title"),
            description=r.get("description"),
            evidence=r.get("evidence"),
            entity_ids=r.get("entity_ids")
        )
        db.add(a)
        anomalies.append(r)
    db.commit()
    return anomalies


def detect_burst_calling(db: Session) -> list[dict]:
    """Flag pairs with many CALLED relationships (high weight = many calls)."""
    anomalies = []
    rels = db.query(Relationship).filter(Relationship.rel_type == "CALLED").all()

    # Count calls between pairs
    pair_counts = {}
    for r in rels:
        key = (min(r.source_id, r.target_id), max(r.source_id, r.target_id))
        pair_counts[key] = pair_counts.get(key, 0) + 1

    for (s, t), count in pair_counts.items():
        if count >= 15:
            src = db.query(Entity).filter(Entity.id == s).first()
            tgt = db.query(Entity).filter(Entity.id == t).first()
            src_name = src.name if src else str(s)
            tgt_name = tgt.name if tgt else str(t)

            if count >= 25:
                severity = "CRITICAL"
            elif count >= 20:
                severity = "HIGH"
            else:
                severity = "MEDIUM"

            anomalies.append({
                "anomaly_type": "BURST_CALLING",
                "severity": severity,
                "title": f"Burst Calling: {src_name} ↔ {tgt_name}",
                "description": f"{count} calls detected between these entities — indicates coordinated activity.",
                "evidence": [f"{count} call records between {src_name} and {tgt_name}"],
                "entity_ids": [s, t]
            })

    return anomalies


def detect_rapid_money_flow(db: Session) -> list[dict]:
    """Flag accounts that both send and receive large amounts."""
    anomalies = []

    # Find accounts involved in both sending and receiving
    sent = db.query(Relationship).filter(Relationship.rel_type == "TRANSFERRED_MONEY_TO").all()

    account_in = {}
    account_out = {}
    for r in sent:
        amount = r.weight or 0
        account_out[r.source_id] = account_out.get(r.source_id, 0) + amount
        account_in[r.target_id] = account_in.get(r.target_id, 0) + amount

    # Flag accounts that both receive and send large sums (layering)
    for acct_id in set(account_in.keys()) & set(account_out.keys()):
        total_flow = min(account_in[acct_id], account_out[acct_id])
        if total_flow > 100000:  # 1 lakh INR
            ent = db.query(Entity).filter(Entity.id == acct_id).first()
            ent_name = ent.name if ent else str(acct_id)

            if total_flow > 1000000:
                severity = "CRITICAL"
            elif total_flow > 500000:
                severity = "HIGH"
            else:
                severity = "MEDIUM"

            anomalies.append({
                "anomaly_type": "RAPID_MONEY_FLOW",
                "severity": severity,
                "title": f"Money Layering: Account {ent_name}",
                "description": f"Account received ₹{account_in[acct_id]:,.0f} and sent ₹{account_out[acct_id]:,.0f} — potential layering.",
                "evidence": [
                    f"Total inflow: ₹{account_in[acct_id]:,.0f}",
                    f"Total outflow: ₹{account_out[acct_id]:,.0f}"
                ],
                "entity_ids": [acct_id]
            })

    return anomalies


def detect_circular_transactions(db: Session, G: nx.Graph) -> list[dict]:
    """Find cycles in the financial subgraph — limit to short cycles to avoid explosion."""
    directed_money = nx.DiGraph()
    for u, v, data in G.edges(data=True):
        if data.get('rel_type') == 'TRANSFERRED_MONEY_TO':
            directed_money.add_edge(u, v)

    anomalies = []
    try:
        # Only look for short cycles (3-5 nodes) to avoid combinatorial explosion
        seen_cycles = set()
        for cycle in nx.simple_cycles(directed_money):
            if 3 <= len(cycle) <= 5:
                # Normalize cycle for dedup
                cycle_key = tuple(sorted(cycle))
                if cycle_key not in seen_cycles:
                    seen_cycles.add(cycle_key)
                    names = []
                    for nid in cycle:
                        ent = db.query(Entity).filter(Entity.id == nid).first()
                        names.append(ent.name if ent else str(nid))

                    anomalies.append({
                        "anomaly_type": "CIRCULAR_TRANSACTION",
                        "severity": "CRITICAL",
                        "title": f"Circular Money Flow: {' → '.join(names[:3])}...",
                        "description": f"Funds flow in a cycle between {len(cycle)} accounts: {' → '.join(names)} → {names[0]}",
                        "evidence": [f"{len(cycle)}-node financial cycle detected"],
                        "entity_ids": cycle
                    })

            # Cap at 20 circular transaction anomalies
            if len(anomalies) >= 20:
                break
    except Exception as e:
        logger.error(f"Circular transaction detection error: {e}")

    return anomalies


def detect_ghost_connectors(db: Session, G: nx.Graph) -> list[dict]:
    """Find nodes with low degree but high betweenness — potential brokers/fixers."""
    anomalies = []
    try:
        if len(G.nodes) < 3:
            return []

        bw = nx.betweenness_centrality(G)
        deg = dict(G.degree())

        # Sort by betweenness and flag top nodes with low degree
        sorted_bw = sorted(bw.items(), key=lambda x: x[1], reverse=True)
        threshold = sorted_bw[max(0, len(sorted_bw) // 10)][1] if sorted_bw else 0.1

        for node, betw in sorted_bw[:10]:
            if deg.get(node, 0) < 8 and betw > max(threshold, 0.05):
                ent = db.query(Entity).filter(Entity.id == node).first()
                if ent:
                    anomalies.append({
                        "anomaly_type": "GHOST_CONNECTOR",
                        "severity": "HIGH",
                        "title": f"Ghost Connector: {ent.name}",
                        "description": f"{ent.name} ({ent.entity_type}) has only {deg[node]} direct connections but sits on {betw:.1%} of all shortest paths — likely a broker or intermediary.",
                        "evidence": [
                            f"Degree: {deg[node]}",
                            f"Betweenness centrality: {betw:.4f}",
                            f"Entity type: {ent.entity_type}"
                        ],
                        "entity_ids": [node]
                    })
    except Exception as e:
        logger.error(f"Ghost connector detection error: {e}")

    return anomalies
