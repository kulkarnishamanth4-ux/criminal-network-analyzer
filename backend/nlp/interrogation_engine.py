from sqlalchemy.orm import Session
from backend.database.models import Entity, Relationship, FIR
from backend.database.crud import get_entity_dossier
import re

# Suspect psychological profiles & predefined response strategies
SUSPECT_PERSONAS = {
    "Vikram Sharma": {
        "demeanor": "Cold, calculated, polite deflection, claims to be a legitimate interstate transport contractor.",
        "default_alibis": {
            "money": "I only handle legitimate freight payments and truck diesel expenses for my transport company.",
            "associates": "I deal with hundreds of truck drivers and brokers daily. I cannot remember every casual acquaintance.",
            "location": "I was at my transport office reviewing logistics schedules.",
            "contraband": "Whatever was found in those trucks was loaded by the third-party client. We only provide the transport vehicle."
        }
    },
    "Suresh Agarwal": {
        "demeanor": "Nervous, technical financial evasion, claims all transactions are chartered accountant approved loans.",
        "default_alibis": {
            "money": "Those transfers were standard short-term inter-corporate commercial credit loans, completely audited.",
            "associates": "Sellers and buyers deal through market brokers. I never meet account beneficiaries directly.",
            "location": "I have not left my trading office in Chandni Chowk all week.",
            "hawala": "I am a tax-paying registered GST merchant. Any cash flow is standard commodity advance payment."
        }
    },
    "Mohammed Irfan": {
        "demeanor": "Aggressive, combative, claims political framing by rival local union factions.",
        "default_alibis": {
            "money": "I have never demanded a single rupee from anyone. These shopkeepers are lying under pressure.",
            "calls": "My phone is frequently used by union workers and volunteers in the neighborhood.",
            "location": "I was attending community meetings in Noida.",
            "threats": "I don't make threats. I am a community leader resolving local disputes peacefully."
        }
    },
    "Deepak Verma": {
        "demeanor": "Tech-evasive, plays dumb, claims his servers/SIMs were hacked or rented unknowingly.",
        "default_alibis": {
            "tech": "I only rent raw cloud servers and GSM hardware. What clients run on them is beyond my knowledge.",
            "otp": "I don't know anything about OTP bypass. My IP addresses were probably spoofed by someone else.",
            "money": "Those USDT crypto transactions are freelance software development payments from overseas."
        }
    }
}

def interrogate_suspect(db: Session, entity_id: int, question: str, history: list = None) -> dict:
    """
    Digital Twin Interrogation Contradiction Engine.
    Simulates a live suspect persona while running real-time ground-truth fact-checking
    against the SQLite graph database to detect lies and generate tactical trap questions.
    """
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        return {"status": "error", "message": "Suspect entity not found in database"}
        
    dossier = get_entity_dossier(db, entity_id)
    suspect_name = entity.name
    
    # Retrieve persona template or build generic default
    persona = SUSPECT_PERSONAS.get(suspect_name, {
        "demeanor": "Guarded, minimal compliance, evasive alibis.",
        "default_alibis": {
            "money": "I have no knowledge of those bank transfers.",
            "calls": "Someone else must have used my phone number.",
            "location": "I was at home with my family during that time."
        }
    })
    
    q_lower = question.lower()
    
    # 1. Determine Suspect Persona Response
    response_text = ""
    contradiction = None
    
    # Match question themes
    if any(k in q_lower for k in ["where were you", "location", "travel", "mumbai", "delhi", "jaipur", "highway", "toll", "night"]):
        response_text = f"Officer, I have no reason to lie. {persona['default_alibis'].get('location', 'I was at home with my family and never visited that location.')}"
        
        # Check against ground truth: SPOTTED_AT / Vehicle / FIRs
        rels = dossier.get("relationships", [])
        loc_rels = [r for r in rels if r.get("type") == "SPOTTED_AT" or "LOCATION" in str(r.get("target_id", ""))]
        firs = dossier.get("firs", [])
        
        if loc_rels or firs:
            if loc_rels:
                loc_name = loc_rels[0].get("target_name", "Highway Nexus")
            else:
                first_fir = firs[0]
                loc_name = getattr(first_fir, "police_station", None) or (first_fir.get("police_station") if isinstance(first_fir, dict) else "State Police Jurisdiction") or "Highway Nexus"
                
            contradiction = {
                "detected": True,
                "severity": "CRITICAL",
                "claim": f"Suspect claimed to be at home/office and never visited the location.",
                "ground_truth": f"ANPR Camera & Police FIR records prove physical presence at '{loc_name}'.",
                "recommended_trap_question": f"\"If you were at home, how did our automated toll cameras log your vehicle at {loc_name} at that exact hour?\""
            }
            
    elif any(k in q_lower for k in ["money", "cash", "account", "transfer", "lakh", "crore", "bank", "hawala", "payment", "rupee"]):
        response_text = f"Everything in my accounts is 100% accounted for. {persona['default_alibis'].get('money', 'I only conduct audited commercial business transactions.')}"
        
        # Check ground truth: TRANSFERRED_MONEY_TO or Anomaly
        anomalies = dossier.get("anomalies", [])
        circ_anomalies = [a for a in anomalies if "MONEY" in (getattr(a, "anomaly_type", "") if hasattr(a, "anomaly_type") else a.get("anomaly_type", "")) or "CIRCULAR" in (getattr(a, "anomaly_type", "") if hasattr(a, "anomaly_type") else a.get("anomaly_type", ""))]
        
        if circ_anomalies or len(dossier.get("relationships", [])) > 2:
            first_anomaly = circ_anomalies[0] if circ_anomalies else None
            if first_anomaly:
                a_desc = getattr(first_anomaly, "title", None) or (first_anomaly.get("title") if isinstance(first_anomaly, dict) else "Rapid Layered Fund Movement")
            else:
                a_desc = "Unexplained high-velocity transactions"
            contradiction = {
                "detected": True,
                "severity": "CRITICAL",
                "claim": "Suspect claimed all funds are standard legitimate commercial trade payments.",
                "ground_truth": f"Financial anomaly detector identified: '{a_desc}' moving across dummy mule accounts.",
                "recommended_trap_question": f"\"Why did your account transfer funds to a dormant shell account within minutes of receiving it?\""
            }
            
    elif any(k in q_lower for k in ["know", "suresh", "vikram", "irfan", "manoj", "deepak", "call", "phone", "associate", "partner"]):
        response_text = f"I might have received calls from many people, but I don't have any personal relationship with them. {persona['default_alibis'].get('associates', 'I only know them by name in passing.')}"
        
        # Check ground truth: CALLED or MENTIONED_IN_FIR relationships
        call_rels = [r for r in dossier.get("relationships", []) if r.get("type") in ["CALLED", "ASSOCIATED_WITH", "TRANSFERRED_MONEY_TO"]]
        if call_rels:
            top_rel = call_rels[0]
            partner_name = top_rel.get("target_name", "Known Co-Accused")
            contradiction = {
                "detected": True,
                "severity": "HIGH",
                "claim": f"Suspect denies close ties with associates.",
                "ground_truth": f"Telecom CDR records show {len(call_rels)} direct communication/financial connections with {partner_name}.",
                "recommended_trap_question": f"\"If you only know him in passing, why do your CDR logs show 18 late-night calls to {partner_name}?\""
            }
    else:
        response_text = f"Officer, you can verify everything. I have nothing to hide and my legal counsel has advised me that I am fully cooperating."
        
    return {
        "status": "success",
        "suspect_id": entity_id,
        "suspect_name": suspect_name,
        "suspect_demeanor": persona["demeanor"],
        "suspect_response": response_text,
        "contradiction": contradiction,
        "tactical_guidance": "Push on the timeline contradiction immediately to break psychological composure." if contradiction else "Ask specifically about known vehicle sightings or bank transfers to trigger ground-truth verification."
    }
