from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os
from google import genai
from google.genai import types

from backend.database.schema import get_db
from backend.database.models import Entity, Relationship, FIR, Anomaly
from backend.database.crud import get_dashboard_stats, get_all_anomalies
from backend.graph.algorithms import get_top_influencers
from backend.security.guardrails import sanitize_prompt
from backend.security.audit_logger import audit_logger

router = APIRouter()

from typing import Optional, List, Dict, Any
import re

class ChatRequest(BaseModel):
    message: str
    case_id: str = "dawood"
    selected_entity_id: Optional[int] = None
    selected_entity_name: Optional[str] = None

def build_rag_context(db: Session, case_id: str, query: str, selected_id: Optional[int] = None, selected_name: Optional[str] = None):
    ent_filter = (Entity.case_id == case_id) | ((Entity.case_id == None) & (case_id == "dawood"))
    rel_filter = (Relationship.case_id == case_id) | ((Relationship.case_id == None) & (case_id == "dawood"))
    fir_filter = (FIR.case_id == case_id) | ((FIR.case_id == None) & (case_id == "dawood"))
    
    all_entities = db.query(Entity).filter(ent_filter).all()
    ent_map = {e.id: e for e in all_entities}
    all_rels = db.query(Relationship).filter(rel_filter).all()
    all_firs = db.query(FIR).filter(fir_filter).all()
    all_anomalies = get_all_anomalies(db, case_id)

    # 1. Identify query-relevant entities
    matched = []
    q_lower = query.lower()
    
    if selected_id and selected_id in ent_map:
        matched.append(ent_map[selected_id])
    elif selected_name:
        for e in all_entities:
            if e.name.lower() == selected_name.lower():
                matched.append(e)
                break
                
    for e in all_entities:
        if e in matched:
            continue
        e_lower = e.name.lower()
        if e_lower in q_lower:
            matched.append(e)
        else:
            tokens = [w for w in re.split(r'[\s_\-,\.]+', e_lower) if len(w) >= 4]
            if tokens and any(t in q_lower for t in tokens):
                matched.append(e)

    # 2. Detailed dossier for matched entities
    detailed_sections = []
    for m in matched[:5]:
        in_links = [r for r in all_rels if r.target_id == m.id and r.source_id in ent_map]
        out_links = [r for r in all_rels if r.source_id == m.id and r.target_id in ent_map]
        
        detail = [f"TARGET DOSSIER: '{m.name}'"]
        detail.append(f"- Entity ID: {m.id} | Type: {m.entity_type} | Risk Score: {m.risk_score} | PageRank: {round(m.pagerank or 0, 4)}")
        if m.properties:
            detail.append(f"- Metadata / Properties: {m.properties}")
            
        if in_links:
            detail.append("- Incoming Links (Incoming operational, financial, or communication connections):")
            for r in in_links:
                src = ent_map[r.source_id]
                p_str = f" [telemetry: {r.properties}]" if r.properties else ""
                detail.append(f"  * {src.name} [{src.entity_type}] -> {r.rel_type} -> {m.name}{p_str}")
                hop2 = [r2 for r2 in all_rels if r2.target_id == src.id and r2.source_id in ent_map]
                for r2 in hop2:
                    src2 = ent_map[r2.source_id]
                    detail.append(f"    (Provenance: {src2.name} [{src2.entity_type}] -> {r2.rel_type} -> {src.name})")

        if out_links:
            detail.append("- Outgoing Links (Controlled assets or outgoing connections):")
            for r in out_links:
                tgt = ent_map[r.target_id]
                p_str = f" [telemetry: {r.properties}]" if r.properties else ""
                detail.append(f"  * {m.name} -> {r.rel_type} -> {tgt.name} [{tgt.entity_type}]{p_str}")

        m_firs = [f for f in all_firs if m.name.lower() in (f.raw_text or '').lower()]
        if m_firs:
            detail.append("- Associated FIR Mentions:")
            for f in m_firs:
                detail.append(f"  * FIR #{f.fir_number or f.id} ({f.crime_type}): {(f.raw_text or '')[:180]}...")

        m_anoms = [a for a in all_anomalies if a.entity_ids and m.id in a.entity_ids]
        if m_anoms:
            detail.append("- Flagged Anomalies:")
            for a in m_anoms:
                detail.append(f"  * [{a.severity}] {a.title}: {a.description}")

        detailed_sections.append("\n".join(detail))

    # 3. Compact Full Network Topology
    topology_lines = []
    for e in all_entities:
        links_out = [f"{ent_map[r.target_id].name} ({r.rel_type})" for r in all_rels if r.source_id == e.id and r.target_id in ent_map]
        links_in = [f"{ent_map[r.source_id].name} ({r.rel_type})" for r in all_rels if r.target_id == e.id and r.source_id in ent_map]
        conns = []
        if links_in:
            conns.append("Linked from: " + ", ".join(links_in))
        if links_out:
            conns.append("Links to: " + ", ".join(links_out))
        conn_str = "; ".join(conns) if conns else "Isolated node"
        topology_lines.append(f"- {e.name} [{e.entity_type}]: {conn_str}")

    # 4. Context assembly
    context_str = f"CASE ID: {case_id}\n"
    context_str += f"TOTAL TRACKED ENTITIES: {len(all_entities)}\n"
    context_str += f"TOTAL RELATIONSHIPS: {len(all_rels)}\n\n"
    
    if detailed_sections:
        context_str += "=== RETRIEVED DOSSIERS FOR ENTITIES IN QUERY ===\n"
        context_str += "\n\n".join(detailed_sections) + "\n\n"
        
    context_str += "=== COMPLETE CASE NETWORK TOPOLOGY (ALL TRACKED NODES & EDGES) ===\n"
    context_str += "\n".join(topology_lines) + "\n\n"

    if all_firs:
        context_str += "=== REGISTERED POLICE FIRST INFORMATION REPORTS (FIRs) ===\n"
        for f in all_firs[:3]:
            context_str += f"- FIR {f.fir_number or f.id} ({f.crime_type}): {(f.raw_text or '')[:200]}...\n"
            
    if all_anomalies:
        context_str += "\n=== ACTIVE DETECTED ANOMALIES & SURVEILLANCE ALERTS ===\n"
        for a in all_anomalies[:4]:
            context_str += f"- [{a.severity}] {a.title}: {a.description}\n"

    return context_str, matched

def generate_local_response(query: str, matched: list, case_id: str, db: Session) -> str:
    ent_filter = (Entity.case_id == case_id) | ((Entity.case_id == None) & (case_id == "dawood"))
    rel_filter = (Relationship.case_id == case_id) | ((Relationship.case_id == None) & (case_id == "dawood"))
    entities = {e.id: e for e in db.query(Entity).filter(ent_filter).all()}
    rels = db.query(Relationship).filter(rel_filter).all()

    if matched:
        m = matched[0]
        in_rels = [r for r in rels if r.target_id == m.id and r.source_id in entities]
        out_rels = [r for r in rels if r.source_id == m.id and r.target_id in entities]
        
        reasons = []
        for r in in_rels:
            src = entities[r.source_id]
            props = r.properties or {}
            p_text = f" (telemetry: {', '.join(f'{k}: {v}' for k, v in props.items())})" if props else ""
            reasons.append(f"linked from {src.name} [{src.entity_type}] via {r.rel_type}{p_text}")
            hop2 = [r2 for r2 in rels if r2.target_id == src.id and r2.source_id in entities]
            for r2 in hop2:
                src2 = entities[r2.source_id]
                reasons.append(f"provenance traces to {src2.name} [{src2.entity_type}] via {r2.rel_type}")
                
        for r in out_rels:
            tgt = entities[r.target_id]
            props = r.properties or {}
            p_text = f" ({', '.join(f'{k}: {v}' for k, v in props.items())})" if props else ""
            reasons.append(f"connects to {tgt.name} [{tgt.entity_type}] via {r.rel_type}{p_text}")
            
        reason_str = "; ".join(reasons) if reasons else "tracked as a stand-alone node in case intelligence"
        return f"{m.name} is a tracked {m.entity_type} entity in case '{case_id}'. Intelligence reason: It is {reason_str}."

    # General overview response
    stats = get_dashboard_stats(db, case_id)
    influencers_data = get_top_influencers(db, limit=4, case_id=case_id)
    influencers = influencers_data.get("influencers", []) if isinstance(influencers_data, dict) else influencers_data
    inf_str = ", ".join(f"{i['name']} ({i['type']})" for i in influencers) if influencers else "None"
    anomalies = get_all_anomalies(db, case_id)
    anom_str = ", ".join(a.title for a in anomalies[:2]) if anomalies else "None"
    return f"Case '{case_id}' active network status: {stats.get('total_entities', 0)} entities tracked across {stats.get('total_relationships', 0)} links. Primary command hubs: {inf_str}. Active threat alerts: {anom_str}."

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

    # 1. Retrieve Comprehensive Case Context (Deep RAG)
    try:
        context_str, matched_entities = build_rag_context(
            db, 
            req.case_id, 
            cleaned_message, 
            req.selected_entity_id, 
            req.selected_entity_name
        )
    except Exception as e:
        context_str = "Error loading database context."
        matched_entities = []

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Resilient local copilot fallback based on database topology
        local_resp = generate_local_response(cleaned_message, matched_entities, req.case_id, db)
        return {"response": local_resp}

    try:
        client = genai.Client()
        
        system_instruction = f"""
        You are CrimeNet AI Copilot, an advanced intelligence operative assisting law enforcement analysts.
        You are analyzing an active criminal syndicate case.
        
        CASE INTELLIGENCE DATABASE CONTEXT:
        {context_str}
        
        INSTRUCTIONS:
        1. Base your answer directly on the provided case intelligence database.
        2. When asked about a specific entity (location, person, phone, vehicle, account, social handle):
           - Explicitly identify its entity type.
           - Explain the specific intelligence reason it appears in the network by citing the links, telemetry (e.g. geo-accuracy, platform, transaction details), and provenance.
           - Trace the operational chain linking it to key syndicate operatives.
        3. Never state an entity is not found if it or its connections appear anywhere in the database context.
        4. Keep your responses tactical, direct, authoritative, and professional.
        5. Limit responses to 2-4 sentences. Do not use emojis.
        """
        
        interaction = await client.aio.interactions.create(
            model="gemini-3.5-flash-lite",
            input=cleaned_message,
            system_instruction=system_instruction,
            timeout=60.0
        )
        return {"response": interaction.output_text}
    except Exception as e:
        # If Gemini call fails or times out, fall back cleanly to local graph intelligence
        local_resp = generate_local_response(cleaned_message, matched_entities, req.case_id, db)
        return {"response": local_resp}
