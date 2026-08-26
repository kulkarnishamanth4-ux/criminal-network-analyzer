from sqlalchemy.orm import Session
import networkx as nx

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
    # Simplified mock for demonstration
    if indicator_name == "multiple_bank_accounts":
        return True, "Found multiple bank accounts"
    return False, "Not detected"
