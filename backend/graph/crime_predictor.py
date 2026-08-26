from sqlalchemy.orm import Session
import networkx as nx
from backend.database.models import Entity, Relationship, FIR, Anomaly

CRIME_INDICATORS = {
    "Money Laundering": {
        "circular_transactions": 25,
        "rapid_fund_movement": 20,
        "multiple_bank_accounts": 15,
        "hawala_keywords": 20,
        "shell_company_mention": 20,
    },
    "Drug Trafficking": {
        "hub_spoke_network": 25,
        "burst_night_calls": 20,
        "interstate_vehicle_movement": 15,
        "drug_keywords": 25,
        "cash_heavy_transactions": 15,
    },
    "Extortion": {
        "threat_keywords": 30,
        "burst_calling_pattern": 20,
        "one_way_money_flow": 25,
        "repeat_victim_contact": 25,
    },
    "Kidnapping": {
        "kidnap_keywords": 30,
        "ransom_keywords": 25,
        "sudden_call_spike": 20,
        "geographic_anomaly": 25,
    },
    "Arms Smuggling": {
        "arms_keywords": 30,
        "interstate_movement": 20,
        "covert_communication": 20,
        "known_arms_associate": 30,
    },
    "Fraud / Cybercrime": {
        "fraud_keywords": 25,
        "multiple_victim_accounts": 25,
        "phishing_patterns": 20,
        "rapid_small_transactions": 15,
        "identity_theft_indicators": 15,
    }
}


def predict_crime_types(db: Session, G: nx.Graph, community_id: int = None) -> list[dict]:
    """Analyze graph and FIR data to predict likely crime types with confidence scores."""
    results = []

    for crime, indicators in CRIME_INDICATORS.items():
        score = 0
        total_possible = sum(indicators.values())
        matched_list = []

        for ind_name, weight in indicators.items():
            matched, desc = check_indicator(ind_name, db, G, community_id)
            if matched:
                score += weight
                matched_list.append({"name": ind_name, "matched": True, "description": desc})
            else:
                matched_list.append({"name": ind_name, "matched": False, "description": desc})

        confidence = score / total_possible if total_possible > 0 else 0
        if confidence > 0:
            results.append({
                "crime_type": crime,
                "confidence": round(confidence, 2),
                "indicators": matched_list
            })

    return sorted(results, key=lambda x: x['confidence'], reverse=True)


def check_indicator(indicator_name: str, db: Session, G: nx.Graph, community_id: int = None) -> tuple[bool, str]:
    """Check whether a specific crime indicator is present in the data."""
    try:
        # ── Financial indicators ──
        if indicator_name == "multiple_bank_accounts":
            count = db.query(Entity).filter(Entity.entity_type == "BANK_ACCOUNT").count()
            if count >= 3:
                return True, f"{count} bank accounts detected in network"
            return False, f"Only {count} bank accounts found"

        if indicator_name == "circular_transactions":
            anomalies = db.query(Anomaly).filter(Anomaly.anomaly_type == "CIRCULAR_TRANSACTION").count()
            if anomalies > 0:
                return True, f"{anomalies} circular money flows detected"
            return False, "No circular transactions found"

        if indicator_name == "rapid_fund_movement":
            anomalies = db.query(Anomaly).filter(Anomaly.anomaly_type == "RAPID_MONEY_FLOW").count()
            if anomalies > 0:
                return True, f"{anomalies} rapid money flow patterns detected"
            return False, "No rapid fund movement detected"

        if indicator_name == "one_way_money_flow":
            # Check if money flows primarily in one direction
            transfers = db.query(Relationship).filter(Relationship.rel_type == "TRANSFERRED_MONEY_TO").count()
            if transfers > 5:
                return True, f"{transfers} one-directional transfers found"
            return False, "Insufficient transfer data"

        if indicator_name == "cash_heavy_transactions":
            transfers = db.query(Relationship).filter(Relationship.rel_type == "TRANSFERRED_MONEY_TO").all()
            large = [t for t in transfers if (t.weight or 0) > 500000]
            if large:
                return True, f"{len(large)} transactions over ₹5,00,000"
            return False, "No large cash transactions"

        if indicator_name == "rapid_small_transactions":
            transfers = db.query(Relationship).filter(Relationship.rel_type == "TRANSFERRED_MONEY_TO").all()
            small = [t for t in transfers if (t.weight or 0) < 10000]
            if len(small) > 10:
                return True, f"{len(small)} small transactions detected (potential structuring)"
            return False, "No rapid small transaction pattern"

        # ── Communication indicators ──
        if indicator_name == "burst_calling_pattern" or indicator_name == "burst_night_calls":
            anomalies = db.query(Anomaly).filter(Anomaly.anomaly_type == "BURST_CALLING").count()
            if anomalies > 0:
                return True, f"{anomalies} burst calling patterns detected"
            return False, "No burst calling detected"

        if indicator_name == "sudden_call_spike":
            calls = db.query(Relationship).filter(Relationship.rel_type == "CALLED").count()
            if calls > 50:
                return True, f"{calls} call records — high volume indicates coordination"
            return False, "Call volume within normal range"

        if indicator_name == "covert_communication":
            calls = db.query(Relationship).filter(Relationship.rel_type == "CALLED").count()
            if calls > 20:
                return True, "Multiple communication channels detected"
            return False, "No covert communication pattern"

        if indicator_name == "repeat_victim_contact":
            calls = db.query(Relationship).filter(Relationship.rel_type == "CALLED").count()
            if calls > 30:
                return True, "Repeated contact with same entities detected"
            return False, "No repeat victim contact pattern"

        # ── Network structure indicators ──
        if indicator_name == "hub_spoke_network":
            if len(G.nodes) > 5:
                degrees = dict(G.degree())
                max_deg = max(degrees.values()) if degrees else 0
                avg_deg = sum(degrees.values()) / len(degrees) if degrees else 0
                if max_deg > avg_deg * 2:
                    return True, f"Hub-spoke pattern: max degree {max_deg} vs avg {avg_deg:.1f}"
            return False, "No hub-spoke pattern detected"

        if indicator_name == "multiple_victim_accounts":
            accounts = db.query(Entity).filter(Entity.entity_type == "BANK_ACCOUNT").count()
            if accounts > 5:
                return True, f"{accounts} bank accounts — potential multiple victims"
            return False, "Insufficient victim accounts"

        # ── Geographic indicators ──
        if indicator_name == "interstate_vehicle_movement" or indicator_name == "interstate_movement":
            vehicles = db.query(Entity).filter(Entity.entity_type == "VEHICLE").count()
            locations = db.query(Entity).filter(Entity.entity_type == "LOCATION").count()
            if vehicles > 2 and locations > 2:
                return True, f"{vehicles} vehicles across {locations} locations"
            return False, "Insufficient vehicle/location data"

        if indicator_name == "geographic_anomaly":
            locations = db.query(Entity).filter(Entity.entity_type == "LOCATION").count()
            if locations > 3:
                return True, f"{locations} distinct locations linked to suspects"
            return False, "Limited geographic data"

        # ── Keyword indicators (check FIR text) ──
        keyword_map = {
            "hawala_keywords": ["hawala", "money laundering", "shell company", "benami", "layering"],
            "shell_company_mention": ["shell company", "fake company", "benami", "front company"],
            "drug_keywords": ["drugs", "narcotics", "heroin", "ganja", "cannabis", "ndps", "contraband"],
            "threat_keywords": ["threat", "extortion", "blackmail", "intimidation", "hafta"],
            "kidnap_keywords": ["kidnap", "abduct", "hostage", "confinement"],
            "ransom_keywords": ["ransom", "ransom demand", "demanded money"],
            "arms_keywords": ["arms", "weapons", "ammunition", "firearms", "pistol", "rifle", "explosive"],
            "known_arms_associate": ["arms dealer", "illegal weapons", "arms act"],
            "fraud_keywords": ["fraud", "cheating", "forgery", "impersonation", "scam"],
            "phishing_patterns": ["phishing", "online fraud", "cyber", "otp fraud", "hacking"],
            "identity_theft_indicators": ["identity theft", "fake identity", "forged documents"],
        }

        if indicator_name in keyword_map:
            keywords = keyword_map[indicator_name]
            firs = db.query(FIR).all()
            matched_kw = []
            for fir in firs:
                if fir.raw_text:
                    text_lower = fir.raw_text.lower()
                    for kw in keywords:
                        if kw in text_lower:
                            matched_kw.append(kw)
            matched_kw = list(set(matched_kw))
            if matched_kw:
                return True, f"Keywords found in FIRs: {', '.join(matched_kw[:5])}"
            return False, f"Keywords not found: {', '.join(keywords[:3])}..."

    except Exception as e:
        return False, f"Check failed: {str(e)}"

    return False, "Indicator not implemented"
