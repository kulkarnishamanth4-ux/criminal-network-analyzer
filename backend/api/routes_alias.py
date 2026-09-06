from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
import difflib
import os
from google import genai
from backend.database.schema import get_db
from backend.database.crud import search_entities, get_entity_relationships
from backend.database.models import Relationship

router = APIRouter()

class AliasRequest(BaseModel):
    name_a: str
    name_b: str
    case_id: str = "custom_investigation"
    context: str = ""

@router.post("/alias/probability")
async def get_alias_probability(req: AliasRequest, db: Session = Depends(get_db)):
    # 1. Phonetic Score
    name_a_lower = req.name_a.lower()
    name_b_lower = req.name_b.lower()
    ratio = difflib.SequenceMatcher(None, name_a_lower, name_b_lower).ratio()
    phonetic_score = int(ratio * 100)
    
    if name_a_lower in name_b_lower or name_b_lower in name_a_lower:
        phonetic_score = max(phonetic_score, 70)
        
    common_suffixes = ["kumar", "singh", "bhai", "urf", "alias"]
    a_cleaned = name_a_lower
    b_cleaned = name_b_lower
    for suf in common_suffixes:
        a_cleaned = a_cleaned.replace(suf, "").strip()
        b_cleaned = b_cleaned.replace(suf, "").strip()
        
    cleaned_ratio = difflib.SequenceMatcher(None, a_cleaned, b_cleaned).ratio()
    if cleaned_ratio > ratio:
        phonetic_score = max(phonetic_score, int(cleaned_ratio * 100))

    phonetic_details = f"Phonetic similarity ratio: {phonetic_score}%."
    
    # Get entities
    entities_a = search_entities(db, req.name_a, case_id=req.case_id)
    entities_b = search_entities(db, req.name_b, case_id=req.case_id)
    
    # 2. Spatiotemporal Score & 3. Financial Score & 4. Communication Score
    shared_locations = 0
    shared_banks = 0
    shared_phones = 0
    
    a_locs, b_locs = set(), set()
    a_banks, b_banks = set(), set()
    a_phones, b_phones = set(), set()
    
    for ea in entities_a:
        rels = get_entity_relationships(db, ea.id)
        for r in rels:
            if r["relationship"].rel_type == "SPOTTED_AT":
                a_locs.add(r["target_id"])
            elif r["relationship"].rel_type in ["OWNS_ACCOUNT", "TRANSFERRED_MONEY_TO"]:
                a_banks.add(r["target_id"])
            elif r["relationship"].rel_type == "CALLED":
                a_phones.add(r["target_id"])
                
    for eb in entities_b:
        rels = get_entity_relationships(db, eb.id)
        for r in rels:
            if r["relationship"].rel_type == "SPOTTED_AT":
                b_locs.add(r["target_id"])
            elif r["relationship"].rel_type in ["OWNS_ACCOUNT", "TRANSFERRED_MONEY_TO"]:
                b_banks.add(r["target_id"])
            elif r["relationship"].rel_type == "CALLED":
                b_phones.add(r["target_id"])
                
    shared_locations = len(a_locs.intersection(b_locs))
    spatiotemporal_score = min(100, shared_locations * 25)
    
    shared_banks = len(a_banks.intersection(b_banks))
    financial_score = min(100, shared_banks * 30)
    
    shared_phones = len(a_phones.intersection(b_phones))
    communication_score = min(100, shared_phones * 25)

    evidence_summary = (f"Found {shared_locations} shared locations, "
                        f"{shared_banks} shared financial nodes, "
                        f"{shared_phones} shared communication nodes.")

    # 5. AI Score
    ai_score = 50
    ai_details = "AI engine unavailable"
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        try:
            client = genai.Client()
            prompt = f"Name A: {req.name_a}, Name B: {req.name_b}. Context: {req.context}. Evidence: {evidence_summary}. Phonetic score: {phonetic_score}."
            system_instruction = "Analyze the evidence for these two names and determine if they are the same person (alias). Return ONLY a JSON object with 'score' (0-100) and 'details' (brief justification)."
            interaction = await client.aio.interactions.create(
                model="gemini-3.5-flash-lite",
                input=prompt,
                system_instruction=system_instruction,
                timeout=30.0
            )
            import json
            res = json.loads(interaction.output_text.strip("```json").strip("```").strip())
            ai_score = res.get("score", 50)
            ai_details = res.get("details", "Analyzed by AI")
        except Exception as e:
            ai_details = f"AI error: {str(e)}"
            
    final_score = (phonetic_score * 0.20) + (spatiotemporal_score * 0.25) + (financial_score * 0.25) + (communication_score * 0.15) + (ai_score * 0.15)
    
    if final_score < 30:
        confidence = "LOW"
    elif final_score < 60:
        confidence = "MEDIUM"
    elif final_score < 85:
        confidence = "HIGH"
    else:
        confidence = "VERY_HIGH"
        
    return {
        "probability": final_score,
        "confidence": confidence,
        "breakdown": {
            "phonetic": {"score": phonetic_score, "details": phonetic_details},
            "spatiotemporal": {"score": spatiotemporal_score, "details": f"{shared_locations} shared locations"},
            "financial": {"score": financial_score, "details": f"{shared_banks} shared accounts/transfers"},
            "communication": {"score": communication_score, "details": f"{shared_phones} shared phone contacts"},
            "ai_assessment": {"score": ai_score, "details": ai_details}
        },
        "evidence_summary": evidence_summary
    }
