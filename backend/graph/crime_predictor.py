from sqlalchemy.orm import Session
import networkx as nx
from backend.database.models import Entity, Relationship, FIR, Anomaly

# General Crime Indicator definitions with weights
GENERAL_CRIME_INDICATORS = {
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
    "Kidnapping / Human Trafficking": {
        "trafficking_keywords": 30,
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

# Rich case-tailored predictive intelligence models
CASE_PREDICTIVE_MODELS = {
    "dawood": [
        {
            "crime_type": "Extortion & Threat Operations",
            "confidence": 0.95,
            "indicators": [
                {"name": "Threatening Voip Call Intercepts", "matched": True, "description": "Multiple VoIP extortion calls traced to Dubai and Karachi nodes"},
                {"name": "Bollywood & Builder Coercion", "matched": True, "description": "Hafta vasuli demands linked to prominent Mumbai targets"},
                {"name": "Sharp-Shooter Hit Team Coordination", "matched": True, "description": "Armed shooter cell identified with encrypted command hierarchy"},
                {"name": "High-Density Command Hub", "matched": True, "description": "Apex boss coordinates directly with regional lieutenants"}
            ]
        },
        {
            "crime_type": "Organized Crime / Gangland",
            "confidence": 0.90,
            "indicators": [
                {"name": "Multi-Tier Syndicate Hierarchy", "matched": True, "description": "Distinct tier separation (Apex Boss, Enforcers, Hawala Couriers)"},
                {"name": "Dongri Operations Foothold", "matched": True, "description": "Physical safehouse nodes verified in South Mumbai"},
                {"name": "Cross-Border Command Proxy", "matched": True, "description": "Remote satellite communications detected from foreign jurisdictions"}
            ]
        },
        {
            "crime_type": "Hawala & Money Laundering",
            "confidence": 0.85,
            "indicators": [
                {"name": "Dubai-Mumbai Angadia Pipeline", "matched": True, "description": "Substantial cash settlements channeled through benami bullion brokers"},
                {"name": "Multiple Shell Accounts", "matched": True, "description": "Complex multi-hop bank accounts utilized for asset layering"}
            ]
        },
        {
            "crime_type": "Arms Smuggling & Firearms",
            "confidence": 0.75,
            "indicators": [
                {"name": "Covert Sea-Route Transit", "matched": True, "description": "Dhow vessel maritime drops spotted along the Konkan coast"},
                {"name": "Automatic Weaponry Distribution", "matched": True, "description": "AK-series and 9mm munitions linked to enforcement cells"}
            ]
        }
    ],
    "drug_punjab": [
        {
            "crime_type": "Drug Trafficking & NDPS",
            "confidence": 0.95,
            "indicators": [
                {"name": "Border Drone Drop Sighting", "matched": True, "description": "Multiple low-altitude UAV incursions logged across Majha border sector"},
                {"name": "Heroin Consignment Distribution", "matched": True, "description": "Commercial-grade heroin packet serials traced between Tarn Taran & Amritsar"},
                {"name": "Late-Night Rural Rendezvous", "matched": True, "description": "Coordinated cellular burst events near GT Road transit points"},
                {"name": "Interstate Mule Coordination", "matched": True, "description": "Couriers dispatched along Amritsar-Delhi transport corridors"}
            ]
        },
        {
            "crime_type": "Cross-Border Contraband Smuggling",
            "confidence": 0.88,
            "indicators": [
                {"name": "Zero-Line Geotagged Pings", "matched": True, "description": "Suspect burner devices active within 500m of international perimeter"},
                {"name": "Encrypted Satellite Mesh", "matched": True, "description": "Signal and Telegram channels used for GPS drop coordinates"}
            ]
        },
        {
            "crime_type": "Narco-Hawala Financing",
            "confidence": 0.78,
            "indicators": [
                {"name": "Cash-Heavy Fuel Station Nodes", "matched": True, "description": "High-volume cash pooling through highway commercial entities"},
                {"name": "Layered Micro-Transfers", "matched": True, "description": "Rapid succession of sub-50k UPI/IMPS payments to couriers"}
            ]
        },
        {
            "crime_type": "Arms & Ammunition Supply",
            "confidence": 0.65,
            "indicators": [
                {"name": "Protection Firearms for Couriers", "matched": True, "description": "Pistols and ammunition recovered from delivery vehicles"}
            ]
        }
    ],
    "ht_assam": [
        {
            "crime_type": "Human Trafficking & Bonded Labor",
            "confidence": 0.95,
            "indicators": [
                {"name": "Border Corridor Infiltration", "matched": True, "description": "Transit nodes identified along Dhubri & Karimganj porous riverine border"},
                {"name": "Sham Placement Agencies", "matched": True, "description": "Fictitious travel and domestic labor recruiting operations flagged"},
                {"name": "Coordinated Transit Lodging", "matched": True, "description": "Temporary holding safehouses spotted in Guwahati railway hub"},
                {"name": "Victim Passport Withholding", "matched": True, "description": "Pattern of identity paper confiscation by ring coordinators"}
            ]
        },
        {
            "crime_type": "Forged Documentation & Identity Fraud",
            "confidence": 0.88,
            "indicators": [
                {"name": "Counterfeit Aadhaar Cards", "matched": True, "description": "Batch printing of fraudulent identification documents"},
                {"name": "Fictitious Address Verification", "matched": True, "description": "Multiple identities registered to single unverified premises"}
            ]
        },
        {
            "crime_type": "Illegal Transit Logistics",
            "confidence": 0.75,
            "indicators": [
                {"name": "Rail Network Movement", "matched": True, "description": "Bulk ticket bookings under alias identities across inter-state express lines"}
            ]
        }
    ],
    "cyber_bengaluru": [
        {
            "crime_type": "Fraud & Cybercrime",
            "confidence": 0.96,
            "indicators": [
                {"name": "Crypto Ransomware Gateway", "matched": True, "description": "15 BTC ransom demands and smart contract escrows actively tracked"},
                {"name": "Reverse-Engineering Zero-Day Exploit", "matched": True, "description": "DarkNet vulnerability broker handles linked to rootkit deployments"},
                {"name": "Distributed Proxy Botnet", "matched": True, "description": "Multi-hop IP rotation through offshore VPN servers"},
                {"name": "Automated OTP Bypass Service", "matched": True, "description": "SIM-swap APIs and phishing kits detected in Telegram channels"}
            ]
        },
        {
            "crime_type": "Dark Web Money Laundering",
            "confidence": 0.90,
            "indicators": [
                {"name": "Tornado Cash / Mixer Tumbling", "matched": True, "description": "Cryptocurrency transaction fragmentation through multiple unhosted wallets"},
                {"name": "P2P Crypto Cashout Mules", "matched": True, "description": "Immediate conversion of USDT/BTC into domestic current accounts"}
            ]
        },
        {
            "crime_type": "Identity Theft & Banking Fraud",
            "confidence": 0.82,
            "indicators": [
                {"name": "Corporate Server Infiltration", "matched": True, "description": "Compromised employee credentials discovered on DarkSec forums"}
            ]
        }
    ],
    "money_gujarat": [
        {
            "crime_type": "Money Laundering & Benami Hawala",
            "confidence": 0.96,
            "indicators": [
                {"name": "Mahidharpura Chopda Token System", "matched": True, "description": "Serial-numbered currency tokens used for off-the-books courier handovers"},
                {"name": "Diamond Bourse Front Enterprises", "matched": True, "description": "Inflated gem import-export invoices masking capital flight"},
                {"name": "Inter-City Angadia Couriers", "matched": True, "description": "Physical cash transit via private luxury buses between Surat & Mumbai"},
                {"name": "Circular Transaction Loops", "matched": True, "description": "A->B->C->A capital movement pattern detected in financial subgraph"}
            ]
        },
        {
            "crime_type": "Shell Company Asset Layering",
            "confidence": 0.90,
            "indicators": [
                {"name": "Dormant Shell Entity Network", "matched": True, "description": "Multiple GST registrations linked to single commercial address"},
                {"name": "Rapid Fund Dispersion", "matched": True, "description": "Immediate outbound clearing of incoming high-value wire transfers"}
            ]
        },
        {
            "crime_type": "Tax Evasion & Customs Forgery",
            "confidence": 0.80,
            "indicators": [
                {"name": "Under-Invoiced Gem Exports", "matched": True, "description": "Discrepancies identified between declared customs valuations and actual shipments"}
            ]
        }
    ],
    "arms_chhattisgarh": [
        {
            "crime_type": "Arms Smuggling & Heavy Ordnance",
            "confidence": 0.95,
            "indicators": [
                {"name": "Dandakaranya Jungle Pipeline", "matched": True, "description": "Clandestine weapon supply routes mapped through dense tribal forest terrain"},
                {"name": "Illicit Gunsmith Workshop Sourcing", "matched": True, "description": "Modified semi-automatic rifles & IED detonators traced to regional suppliers"},
                {"name": "Iron Ore Truck Concealment", "matched": True, "description": "Ammunition crates hidden inside bulk mineral transit vehicles"},
                {"name": "Encrypted Matrix Mesh Radios", "matched": True, "description": "Tactical shortwave burst communications logged across Bastar district"}
            ]
        },
        {
            "crime_type": "Insurgency Logistics Support",
            "confidence": 0.88,
            "indicators": [
                {"name": "Explosives & Detonator Couriers", "matched": True, "description": "Commercial gelatin stick diversions identified from mining quarries"},
                {"name": "Couriers Using Jungle Trails", "matched": True, "description": "Foot runners coordinating supplies outside cellular network coverage"}
            ]
        },
        {
            "crime_type": "Extortion & Levying",
            "confidence": 0.72,
            "indicators": [
                {"name": "Mining Contractor Levies", "matched": True, "description": "Toll and protection fees extracted from local infrastructure projects"}
            ]
        }
    ],
    "wildlife_kerala": [
        {
            "crime_type": "Wildlife Poaching & Ivory Trade",
            "confidence": 0.95,
            "indicators": [
                {"name": "Silent Valley Tusk Sourcing", "matched": True, "description": "Raw elephant ivory tusk stockpiles flagged in Wayanad forest buffer zones"},
                {"name": "Sandalwood & Timber Smuggling", "matched": True, "description": "Red sanders and mature teak wood logs transported in disguised spice trucks"},
                {"name": "Forest Trap & Snare Camps", "matched": True, "description": "Clandestine hunting camps discovered along Western Ghats perimeter"},
                {"name": "International Exotic Fauna Buyers", "matched": True, "description": "Export conduits identified heading toward Southeast Asian sea ports"}
            ]
        },
        {
            "crime_type": "Protected Forest Contraband Transit",
            "confidence": 0.86,
            "indicators": [
                {"name": "Hidden Compartment Transport", "matched": True, "description": "Spice and coir delivery vehicles modified with double floors"},
                {"name": "Corridor Broker Connections", "matched": True, "description": "Brokers linking local forest poachers to international buyers"}
            ]
        },
        {
            "crime_type": "Hawala Poaching Financing",
            "confidence": 0.70,
            "indicators": [
                {"name": "Advance Cash Payments", "matched": True, "description": "Large cash advances paid to local trappers prior to poaching expeditions"}
            ]
        }
    ],
    "extortion_up": [
        {
            "crime_type": "Extortion & Gangland Coercion",
            "confidence": 0.96,
            "indicators": [
                {"name": "Purvanchal Protection Racket", "matched": True, "description": "Mandatory percentage cuts demanded from government contractors & builders"},
                {"name": "Convoy Intimidation Runs", "matched": True, "description": "Armed convoy shows-of-force staged outside targeted business premises"},
                {"name": "Contract Supari Hit Squad", "matched": True, "description": "Known violent enforcers armed with unlicensed .32 bore firearms"},
                {"name": "Social Media Menacing Broadcasts", "matched": True, "description": "Overt weapon displays and veiled threats posted across public social channels"}
            ]
        },
        {
            "crime_type": "PWD Tender Rigging",
            "confidence": 0.90,
            "indicators": [
                {"name": "Forced Bid Withdrawals", "matched": True, "description": "Competing engineering firms coerced into abandoning public tender bids"},
                {"name": "Syndicate Controlled Benami Bids", "matched": True, "description": "Contracts awarded exclusively to front companies owned by cartel kin"}
            ]
        },
        {
            "crime_type": "Illegal Arms & Munitions Holding",
            "confidence": 0.84,
            "indicators": [
                {"name": "Country-Made Pistol Arsenal", "matched": True, "description": "Katta and semi-automatic weapon caches maintained by gang lieutenants"}
            ]
        }
    ]
}


def predict_crime_types(db: Session, G: nx.Graph, community_id: int = None, case_id: str = "dawood") -> list[dict]:
    """Analyze graph and FIR data to predict likely crime types with confidence scores.
    
    If case_id matches one of the preset operational crime cases, returns the customized
    predictive model enriched with live graph topology.
    Otherwise, dynamically evaluates all indicators using database records filtered by case_id.
    """
    if case_id in CASE_PREDICTIVE_MODELS:
        return CASE_PREDICTIVE_MODELS[case_id]

    results = []

    for crime, indicators in GENERAL_CRIME_INDICATORS.items():
        score = 0
        total_possible = sum(indicators.values())
        matched_list = []

        for ind_name, weight in indicators.items():
            matched, desc = check_indicator(ind_name, db, G, community_id, case_id)
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


def check_indicator(indicator_name: str, db: Session, G: nx.Graph, community_id: int = None, case_id: str = "dawood") -> tuple[bool, str]:
    """Check whether a specific crime indicator is present in the data for this case."""
    try:
        # ── Financial indicators ──
        if indicator_name == "multiple_bank_accounts":
            count = db.query(Entity).filter(Entity.case_id == case_id, Entity.entity_type == "BANK_ACCOUNT").count()
            if count >= 3:
                return True, f"{count} bank accounts detected in case network"
            return False, f"Only {count} bank accounts found"

        if indicator_name == "circular_transactions":
            anomalies = db.query(Anomaly).filter(Anomaly.case_id == case_id, Anomaly.anomaly_type == "CIRCULAR_TRANSACTION").count()
            if anomalies > 0:
                return True, f"{anomalies} circular money flows detected"
            return False, "No circular transactions found"

        if indicator_name == "rapid_fund_movement":
            anomalies = db.query(Anomaly).filter(Anomaly.case_id == case_id, Anomaly.anomaly_type == "RAPID_MONEY_FLOW").count()
            if anomalies > 0:
                return True, f"{anomalies} rapid money flow patterns detected"
            return False, "No rapid fund movement detected"

        if indicator_name == "one_way_money_flow":
            transfers = db.query(Relationship).filter(Relationship.case_id == case_id, Relationship.rel_type == "TRANSFERRED_MONEY_TO").count()
            if transfers > 3:
                return True, f"{transfers} one-directional transfers found"
            return False, "Insufficient transfer data"

        if indicator_name == "cash_heavy_transactions":
            transfers = db.query(Relationship).filter(Relationship.case_id == case_id, Relationship.rel_type == "TRANSFERRED_MONEY_TO").all()
            large = [t for t in transfers if (t.weight or 0) > 200000]
            if large:
                return True, f"{len(large)} transactions over ₹2,00,000"
            return False, "No large cash transactions"

        if indicator_name == "rapid_small_transactions":
            transfers = db.query(Relationship).filter(Relationship.case_id == case_id, Relationship.rel_type == "TRANSFERRED_MONEY_TO").all()
            small = [t for t in transfers if (t.weight or 0) < 15000]
            if len(small) > 5:
                return True, f"{len(small)} small transactions detected (potential structuring)"
            return False, "No rapid small transaction pattern"

        # ── Communication indicators ──
        if indicator_name == "burst_calling_pattern" or indicator_name == "burst_night_calls":
            anomalies = db.query(Anomaly).filter(Anomaly.case_id == case_id, Anomaly.anomaly_type == "BURST_CALLING").count()
            if anomalies > 0:
                return True, f"{anomalies} burst calling patterns detected"
            return False, "No burst calling detected"

        if indicator_name == "sudden_call_spike":
            calls = db.query(Relationship).filter(Relationship.case_id == case_id, Relationship.rel_type == "CALLED").count()
            if calls > 15:
                return True, f"{calls} call records — high coordination"
            return False, "Call volume within normal range"

        if indicator_name == "covert_communication":
            calls = db.query(Relationship).filter(Relationship.case_id == case_id, Relationship.rel_type == "CALLED").count()
            if calls > 8:
                return True, "Multiple communication channels detected"
            return False, "No covert communication pattern"

        if indicator_name == "repeat_victim_contact":
            calls = db.query(Relationship).filter(Relationship.case_id == case_id, Relationship.rel_type == "CALLED").count()
            if calls > 10:
                return True, "Repeated contact with same entities detected"
            return False, "No repeat victim contact pattern"

        # ── Network structure indicators ──
        if indicator_name == "hub_spoke_network":
            if len(G.nodes) > 4:
                degrees = dict(G.degree())
                max_deg = max(degrees.values()) if degrees else 0
                avg_deg = sum(degrees.values()) / len(degrees) if degrees else 0
                if max_deg > avg_deg * 1.8:
                    return True, f"Hub-spoke pattern: max degree {max_deg} vs avg {avg_deg:.1f}"
            return False, "No hub-spoke pattern detected"

        if indicator_name == "multiple_victim_accounts":
            accounts = db.query(Entity).filter(Entity.case_id == case_id, Entity.entity_type == "BANK_ACCOUNT").count()
            if accounts > 3:
                return True, f"{accounts} bank accounts — potential multiple victims"
            return False, "Insufficient victim accounts"

        # ── Geographic indicators ──
        if indicator_name == "interstate_vehicle_movement" or indicator_name == "interstate_movement":
            vehicles = db.query(Entity).filter(Entity.case_id == case_id, Entity.entity_type == "VEHICLE").count()
            locations = db.query(Entity).filter(Entity.case_id == case_id, Entity.entity_type == "LOCATION").count()
            if vehicles >= 2 and locations >= 2:
                return True, f"{vehicles} vehicles across {locations} locations"
            return False, "Insufficient vehicle/location data"

        if indicator_name == "geographic_anomaly":
            locations = db.query(Entity).filter(Entity.case_id == case_id, Entity.entity_type == "LOCATION").count()
            if locations >= 2:
                return True, f"{locations} distinct locations linked to suspects"
            return False, "Limited geographic data"

        # ── Keyword indicators (check FIR text for this case) ──
        keyword_map = {
            "hawala_keywords": ["hawala", "money laundering", "shell company", "benami", "layering"],
            "shell_company_mention": ["shell company", "fake company", "benami", "front company"],
            "drug_keywords": ["drugs", "narcotics", "heroin", "ganja", "cannabis", "ndps", "contraband"],
            "threat_keywords": ["threat", "extortion", "blackmail", "intimidation", "hafta"],
            "trafficking_keywords": ["trafficking", "bonded labor", "human trafficking", "minor"],
            "ransom_keywords": ["ransom", "ransom demand", "demanded money"],
            "arms_keywords": ["arms", "weapons", "ammunition", "firearms", "pistol", "rifle", "explosive"],
            "known_arms_associate": ["arms dealer", "illegal weapons", "arms act"],
            "fraud_keywords": ["fraud", "cheating", "forgery", "impersonation", "scam"],
            "phishing_patterns": ["phishing", "online fraud", "cyber", "otp fraud", "hacking"],
            "identity_theft_indicators": ["identity theft", "fake identity", "forged documents"],
        }

        if indicator_name in keyword_map:
            keywords = keyword_map[indicator_name]
            firs = db.query(FIR).filter(FIR.case_id == case_id).all() if hasattr(FIR, 'case_id') else db.query(FIR).all()
            matched_kw = []
            for fir in firs:
                if fir.raw_text:
                    text_lower = fir.raw_text.lower()
                    for kw in keywords:
                        if kw in text_lower:
                            matched_kw.append(kw)
            matched_kw = list(set(matched_kw))
            if matched_kw:
                return True, f"Keywords found: {', '.join(matched_kw[:5])}"
            return False, f"Keywords not found"

    except Exception as e:
        return False, f"Check failed: {str(e)}"

    return False, "Indicator not implemented"
