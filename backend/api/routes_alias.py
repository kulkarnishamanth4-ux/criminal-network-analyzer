from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import difflib
import os
import json
from google import genai
from backend.database.schema import get_db
from backend.database.crud import search_entities, get_entity_relationships
from backend.database.models import Relationship, Entity

router = APIRouter()

class AliasRequest(BaseModel):
    name_a: str
    name_b: str
    case_id: str = "dawood"
    context: str = ""

@router.get("/alias/suggest-suspects")
def get_suggested_suspects(case_id: str = "dawood", db: Session = Depends(get_db)):
    """Return suspects and burner handles in this case to populate quick-pick selectors."""
    entities = db.query(Entity).filter(
        (Entity.case_id == case_id) | ((Entity.case_id == None) & (case_id == "dawood"))
    ).filter(
        Entity.entity_type.in_(["PERSON", "HANDLE", "SOCIAL_HANDLE"])
    ).limit(30).all()
    
    return {
        "suspects": [
            {
                "id": e.id,
                "name": e.name,
                "type": e.entity_type,
                "role": (e.properties or {}).get("role", e.entity_type)
            }
            for e in entities
        ]
    }

@router.post("/alias/probability")
async def get_alias_probability(req: AliasRequest, db: Session = Depends(get_db)):
    name_a = (req.name_a or "").strip()
    name_b = (req.name_b or "").strip()
    
    if not name_a or not name_b:
        raise HTTPException(status_code=400, detail="Both name_a and name_b must be non-empty strings.")
        
    # 1. Phonetic & Lexical Score
    a_raw = name_a.lower().replace('@', '')
    b_raw = name_b.lower().replace('@', '')
    
    if a_raw == b_raw:
        phonetic_score = 100
        phonetic_details = "Identical normalized string match (100%)."
    else:
        ratio = difflib.SequenceMatcher(None, a_raw, b_raw).ratio()
        
        strip_tokens = ['bhai', 'don', 'captain', 'sheikh', 'kumar', 'singh', 'sharma', 'khan', 'urf', 'alias', 'dxb', 'bom', '_', '-']
        a_clean = a_raw
        b_clean = b_raw
        for t in strip_tokens:
            a_clean = a_clean.replace(t, ' ')
            b_clean = b_clean.replace(t, ' ')
        a_clean = ' '.join(a_clean.split())
        b_clean = ' '.join(b_clean.split())
        
        clean_ratio = difflib.SequenceMatcher(None, a_clean, b_clean).ratio()
        phonetic_score = int(max(ratio, clean_ratio) * 100)
        
        # Substring / token matching
        a_tokens = set(a_clean.split())
        b_tokens = set(b_clean.split())
        if a_tokens and b_tokens and (a_tokens & b_tokens):
            phonetic_score = max(phonetic_score, 85)
            phonetic_details = f"Strong lexical overlap: shared key token '{list(a_tokens & b_tokens)[0]}' ({phonetic_score}%)."
        elif (a_clean and a_clean in b_clean) or (b_clean and b_clean in a_clean):
            phonetic_score = max(phonetic_score, 80)
            phonetic_details = f"Substring containment detected ({phonetic_score}%)."
        else:
            phonetic_details = f"Orthographic similarity ratio: {phonetic_score}%."
            
    # 2. Graph & Entity Topology Analysis
    entities_a = search_entities(db, name_a.replace('@', ''), case_id=req.case_id)
    entities_b = search_entities(db, name_b.replace('@', ''), case_id=req.case_id)
    
    a_locs, b_locs = set(), set()
    a_banks, b_banks = set(), set()
    a_phones, b_phones = set(), set()
    a_associates, b_associates = set(), set()
    
    direct_link = False
    direct_rel_type = None
    
    b_ids = {eb.id for eb in entities_b}
    
    for ea in entities_a:
        rels = get_entity_relationships(db, ea.id)
        for r in rels:
            rel = r["relationship"]
            ent = r["related_entity"]
            
            if ent.id in b_ids:
                direct_link = True
                direct_rel_type = rel.rel_type
                
            if ent.entity_type == "LOCATION" or rel.rel_type in ["SPOTTED_AT", "LOCATED_AT"]:
                a_locs.add(ent.id)
            elif ent.entity_type in ["BANK_ACCOUNT", "FINANCIAL_NODE"] or rel.rel_type in ["OWNS_ACCOUNT", "TRANSFERRED_MONEY_TO"]:
                a_banks.add(ent.id)
            elif ent.entity_type == "PHONE" or rel.rel_type in ["OWNS_PHONE", "CALLED"]:
                a_phones.add(ent.id)
            elif ent.entity_type == "PERSON":
                a_associates.add(ent.id)
                
    for eb in entities_b:
        rels = get_entity_relationships(db, eb.id)
        for r in rels:
            rel = r["relationship"]
            ent = r["related_entity"]
            
            if ent.entity_type == "LOCATION" or rel.rel_type in ["SPOTTED_AT", "LOCATED_AT"]:
                b_locs.add(ent.id)
            elif ent.entity_type in ["BANK_ACCOUNT", "FINANCIAL_NODE"] or rel.rel_type in ["OWNS_ACCOUNT", "TRANSFERRED_MONEY_TO"]:
                b_banks.add(ent.id)
            elif ent.entity_type == "PHONE" or rel.rel_type in ["OWNS_PHONE", "CALLED"]:
                b_phones.add(ent.id)
            elif ent.entity_type == "PERSON":
                b_associates.add(ent.id)
                
    shared_locations = len(a_locs & b_locs)
    shared_banks = len(a_banks & b_banks)
    shared_phones = len(a_phones & b_phones)
    shared_associates = len(a_associates & b_associates)
    
    spatiotemporal_score = min(100, shared_locations * 50)
    financial_score = min(100, shared_banks * 50)
    communication_score = min(100, shared_phones * 50)
    
    # 3. AI & Network Topology Synthesis
    ai_score = 50
    ai_details = "Graph topology heuristic evaluated"
    
    if direct_link:
        if direct_rel_type in ["OWNS_HANDLE", "ALIAS_OF", "SAME_AS"]:
            ai_score = 98
            ai_details = f"Direct relationship confirmed in syndicate intelligence ({direct_rel_type})."
        else:
            ai_score = 85
            ai_details = f"Direct network edge confirmed ({direct_rel_type})."
    elif shared_associates > 0:
        ai_score = min(90, 40 + shared_associates * 20)
        ai_details = f"Entities share {shared_associates} mutual criminal associate(s)."
    else:
        ai_score = int(phonetic_score * 0.6)
        ai_details = "No physical or financial node overlap detected in active case."
        
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key and not direct_link:
        try:
            client = genai.Client()
            prompt = (
                f"Analyze if '{name_a}' and '{name_b}' represent the same person / alias in criminal case {req.case_id}.\n"
                f"Context: {req.context}\n"
                f"Phonetic match: {phonetic_score}%\n"
                f"Shared locations: {shared_locations}\n"
                f"Shared financial accounts: {shared_banks}\n"
                f"Shared phone numbers: {shared_phones}\n"
                f"Shared associates: {shared_associates}\n"
                "Return ONLY a JSON object: {\"score\": int (0-100), \"details\": \"one concise sentence\"}"
            )
            interaction = await client.aio.interactions.create(
                model="gemini-3.5-flash-lite",
                input=prompt,
                system_instruction="You are an expert criminal intelligence alias analyst. Return only JSON.",
                timeout=15.0
            )
            res = json.loads(interaction.output_text.strip("```json").strip("```").strip())
            ai_score = max(0, min(100, int(res.get("score", ai_score))))
            ai_details = res.get("details", ai_details)
        except Exception:
            pass

    # 4. Final Probability Calculation (Strictly 0.0 to 100.0)
    final_score = (
        (phonetic_score * 0.25) +
        (spatiotemporal_score * 0.20) +
        (financial_score * 0.20) +
        (communication_score * 0.15) +
        (ai_score * 0.20)
    )
    
    if direct_link and direct_rel_type in ["OWNS_HANDLE", "ALIAS_OF", "SAME_AS"]:
        final_score = max(final_score, 94.5)
    elif a_raw == b_raw:
        final_score = 100.0
        
    final_score = round(min(100.0, max(0.0, final_score)), 1)
    
    if final_score >= 80.0:
        confidence = "VERY_HIGH"
        verdict = "CONFIRMED_OPERATIONAL_ALIAS"
    elif final_score >= 60.0:
        confidence = "HIGH"
        verdict = "HIGH_PROBABILITY_ALIAS"
    elif final_score >= 35.0:
        confidence = "MEDIUM"
        verdict = "POSSIBLE_IDENTITY_OVERLAP"
    else:
        confidence = "LOW"
        verdict = "DISTINCT_INDIVIDUALS"
        
    evidence_parts = []
    if direct_link:
        evidence_parts.append(f"Direct link confirmed: {direct_rel_type}")
    if shared_locations > 0:
        evidence_parts.append(f"{shared_locations} shared location(s)")
    if shared_banks > 0:
        evidence_parts.append(f"{shared_banks} shared account(s)")
    if shared_phones > 0:
        evidence_parts.append(f"{shared_phones} shared phone contact(s)")
    if shared_associates > 0:
        evidence_parts.append(f"{shared_associates} mutual associate(s)")
        
    if evidence_parts:
        evidence_summary = "Corroborated by " + ", ".join(evidence_parts) + "."
    else:
        evidence_summary = f"Found 0 shared locations, 0 shared financial nodes, 0 shared communication nodes."

    return {
        "name_a": name_a,
        "name_b": name_b,
        "probability": final_score,
        "probability_pct": final_score,
        "confidence": confidence,
        "confidence_level": confidence,
        "verdict": verdict,
        "verdict_label": verdict.replace("_", " ").title(),
        "breakdown": {
            "phonetic": {
                "score": phonetic_score,
                "details": phonetic_details
            },
            "spatiotemporal": {
                "score": spatiotemporal_score,
                "details": f"{shared_locations} shared location coordinate(s)"
            },
            "financial": {
                "score": financial_score,
                "details": f"{shared_banks} shared banking node(s)"
            },
            "communication": {
                "score": communication_score,
                "details": f"{shared_phones} shared communication link(s)"
            },
            "ai_assessment": {
                "score": ai_score,
                "details": ai_details
            }
        },
        "evidence_summary": evidence_summary,
        "direct_relationship": direct_rel_type if direct_link else None
    }
