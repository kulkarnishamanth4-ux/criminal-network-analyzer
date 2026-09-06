from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os
from google import genai
from google.genai import types

from backend.database.schema import get_db
from backend.database.crud import get_dashboard_stats, get_all_anomalies
from backend.graph.algorithms import get_top_influencers
from backend.security.guardrails import sanitize_prompt
from backend.security.audit_logger import audit_logger

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    case_id: str = "dawood"

@router.post("/chat")
async def chat_with_agent(req: ChatRequest, db: Session = Depends(get_db)):
    # 0. Prompt Injection & Jailbreak Guardrails
    safety_check = sanitize_prompt(req.message)
    if not safety_check['is_safe']:
        threats_str = ", ".join(safety_check['threats_detected']) if safety_check['threats_detected'] else "High Risk Heuristic"
        audit_logger.log_event(
            action="PROMPT_INJECTION_BLOCKED",
            user="operator",
            resource=f"/api/chat?case_id={req.case_id}",
            details=f"Threats: {threats_str} | Risk Score: {safety_check['risk_score']}",
            severity="CRITICAL"
        )
        return {"response": f"[SECURITY ALERT] Prompt blocked by CrimeNet LLM Guardrails. Detected threat pattern: {threats_str}. Incident logged to SIEM audit chain."}
    
    cleaned_message = safety_check['sanitized_input']
    audit_logger.log_event(
        action="AI_QUERY",
        user="operator",
        resource=f"/api/chat?case_id={req.case_id}",
        details=f"Query evaluated on case: {req.case_id}",
        severity="INFO"
    )

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"response": "[SYSTEM ERROR] GEMINI_API_KEY environment variable is not set. Please add your API key to your Render dashboard environment variables to enable the live LLM AI."}
    
    # 1. Retrieve Case Context (RAG)
    try:
        stats = get_dashboard_stats(db, req.case_id)
        influencers_data = get_top_influencers(db, limit=5, case_id=req.case_id)
        if isinstance(influencers_data, dict):
            influencers = influencers_data.get("influencers", [])
        else:
            influencers = influencers_data
        
        anomalies = get_all_anomalies(db, req.case_id)
        top_anomalies = [a.title for a in anomalies[:3]]
        
        # Format Context
        context_str = f"CASE ID: {req.case_id}\n"
        context_str += f"ENTITIES TRACKED: {stats.get('total_entities', 0)}\n"
        context_str += f"RELATIONSHIPS: {stats.get('total_relationships', 0)}\n"
        context_str += f"HIGH RISK ENTITIES: {stats.get('high_risk_entities', 0)}\n\n"
        
        context_str += "TOP INFLUENCERS (By PageRank / Network Centrality):\n"
        for inf in influencers:
            context_str += f"- {inf['name']} (Type: {inf['type']}, PageRank: {inf['pagerank']})\n"
            
        context_str += "\nRECENT DETECTED ANOMALIES:\n"
        for a in top_anomalies:
            context_str += f"- {a}\n"
            
    except Exception as e:
        context_str = "Error loading database context."
    
    try:
        client = genai.Client()
        
        system_instruction = f"""
        You are CrimeNet AI, an advanced intelligence operative (AI Copilot). 
        You are analyzing an active criminal syndicate case. You are talking to a law enforcement user.
        
        CURRENT CASE DATABASE CONTEXT:
        {context_str}
        
        INSTRUCTIONS:
        Answer the user's query based ONLY on the provided database context.
        If the user asks about the overall network, summarize the top influencers or anomalies.
        Keep your responses extremely concise, tactical, and formatted professionally.
        Limit responses to 2-4 sentences. Do not use emojis. Act like a highly advanced OSINT/SIGINT platform.
        """
        
        interaction = await client.aio.interactions.create(
            model="gemini-3.5-flash-lite",
            input=cleaned_message,
            system_instruction=system_instruction,
            timeout=60.0
        )
        return {"response": interaction.output_text}
    except Exception as e:
        return {"response": f"[AI ENGINE OFFLINE] {str(e)}"}
