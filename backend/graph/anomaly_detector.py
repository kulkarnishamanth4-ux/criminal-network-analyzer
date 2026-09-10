from sqlalchemy.orm import Session
import networkx as nx
from backend.database.models import Anomaly, Relationship, Entity
import logging

logger = logging.getLogger(__name__)


def detect_all_anomalies(db: Session, G: nx.Graph, case_id: str = "custom_investigation") -> list[dict]:
    """Run anomaly detection rules and append newly discovered anomalies without deleting existing ones."""
    existing_titles = {
        a.title for a in db.query(Anomaly.title).filter(Anomaly.case_id == case_id).all()
    }

    results = []
    try:
        results.extend(detect_burst_calling(db))
    except Exception as e:
        logger.warning(f"Error in detect_burst_calling: {e}")
    try:
        results.extend(detect_rapid_money_flow(db))
    except Exception as e:
        logger.warning(f"Error in detect_rapid_money_flow: {e}")
    try:
        results.extend(detect_circular_transactions(db, G))
    except Exception as e:
        logger.warning(f"Error in detect_circular_transactions: {e}")
    try:
        results.extend(detect_ghost_connectors(db, G))
    except Exception as e:
        logger.warning(f"Error in detect_ghost_connectors: {e}")

    newly_added = []
    for r in results:
        title = r.get("title")
        if title and title not in existing_titles:
            a = Anomaly(
                anomaly_type=r.get("anomaly_type"),
                severity=r.get("severity"),
                title=title,
                description=r.get("description"),
                evidence=r.get("evidence"),
                entity_ids=r.get("entity_ids"),
                case_id=case_id
            )
            db.add(a)
            existing_titles.add(title)
            newly_added.append(r)
            
    if newly_added:
        db.commit()

    # Return all current anomalies for this case
    all_case_anomalies = db.query(Anomaly).filter(Anomaly.case_id == case_id).all()
    return [
        {
            "id": a.id,
            "anomaly_type": a.anomaly_type,
            "severity": a.severity,
            "title": a.title,
            "description": a.description,
            "evidence": a.evidence,
            "entity_ids": a.entity_ids
        }
        for a in all_case_anomalies
    ]


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


def format_inr(amount: float) -> str:
    """Format numeric amount into Indian comma numbering system (lakhs, crores)."""
    s = str(int(round(float(amount))))
    if len(s) <= 3:
        return s
    last3 = s[-3:]
    rest = s[:-3]
    parts = []
    while len(rest) > 2:
        parts.insert(0, rest[-2:])
        rest = rest[:-2]
    if rest:
        parts.insert(0, rest)
    return ",".join(parts) + "," + last3


def format_inr_text(text: str) -> str:
    """Format any rupee currency amounts in a text string into Indian comma notation."""
    if not text or not isinstance(text, str):
        return text
    import re
    def repl(m):
        raw = m.group(1).replace(",", "")
        return "₹" + format_inr(raw)
    return re.sub(r"₹\s*([0-9,]+)(?!\s*(?:[Ll]akh|[Cc]rore|[Cc]r\b))", repl, text)



def detect_rapid_money_flow(db: Session) -> list[dict]:
    """Flag accounts with rapid high-volume money movement (potential layering)."""
    sent = db.query(Relationship).filter(
        Relationship.rel_type == "TRANSFERRED_MONEY_TO"
    ).all()

    anomalies = []
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
                "description": f"Account received ₹{format_inr(account_in[acct_id])} and sent ₹{format_inr(account_out[acct_id])} — potential layering.",
                "evidence": [
                    f"Total inflow: ₹{format_inr(account_in[acct_id])}",
                    f"Total outflow: ₹{format_inr(account_out[acct_id])}"
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
                        "title": f"Physical-Exclusive Intermediary: {ent.name}",
                        "description": f"{ent.name} ({ent.entity_type}) has only {deg[node]} direct connections but sits on {betw:.1%} of all shortest paths — likely an undocumented broker or intermediary operating via physical-exclusive channels.",
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
