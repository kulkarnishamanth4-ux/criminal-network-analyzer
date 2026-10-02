"""
Voice Control API Router.
Accepts voice transcripts and returns structured executable actions for the frontend.
Includes guardrails against prompt injection, jailbreak, and abuse.
"""

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from backend.database.schema import get_db
from backend.ai.voice_controller import parse_voice_command
from backend.security.audit_logger import audit_logger
from backend.security.guardrails import sanitize_prompt
from backend.limiter import limiter

router = APIRouter()

MAX_VOICE_TRANSCRIPT_LENGTH = 500  # Voice commands should be short spoken phrases

class VoiceCommandRequest(BaseModel):
    transcript: str = Field(..., min_length=1, max_length=MAX_VOICE_TRANSCRIPT_LENGTH)
    case_id: str = "dawood"


@router.post("/voice/command")
@limiter.limit("20/minute")
def process_voice_command(request: Request, req: VoiceCommandRequest, db: Session = Depends(get_db)):
    # 1. Length guard
    if not req.transcript or not req.transcript.strip():
        return JSONResponse(status_code=400, content={
            "action": "BLOCKED",
            "spoken_reply": "Empty voice command received. Please speak a command.",
            "payload": {},
            "guardrail": {"blocked": True, "reason": "Empty transcript"}
        })

    if len(req.transcript) > MAX_VOICE_TRANSCRIPT_LENGTH:
        audit_logger.log_event(
            action="VOICE_GUARDRAIL_BLOCK",
            user="operator",
            resource="voice/command",
            details=f"Transcript exceeded {MAX_VOICE_TRANSCRIPT_LENGTH} char limit ({len(req.transcript)} chars)",
            severity="WARNING"
        )
        return JSONResponse(status_code=400, content={
            "action": "BLOCKED",
            "spoken_reply": "Voice command too long. Please use a shorter spoken phrase.",
            "payload": {},
            "guardrail": {"blocked": True, "reason": "Exceeds maximum length"}
        })

    # 2. Prompt injection / jailbreak guard
    safety_check = sanitize_prompt(req.transcript)
    if not safety_check['is_safe']:
        audit_logger.log_event(
            action="VOICE_GUARDRAIL_BLOCK",
            user="operator",
            resource="voice/command",
            details=f"Threats: {safety_check['threats_detected']} | Risk: {safety_check['risk_score']} | Raw: '{req.transcript[:200]}'",
            severity="CRITICAL"
        )
        return JSONResponse(status_code=403, content={
            "action": "BLOCKED",
            "spoken_reply": "Voice command blocked by security guardrails. Potential injection or abuse detected.",
            "payload": {},
            "guardrail": {
                "blocked": True,
                "threats_detected": safety_check['threats_detected'],
                "risk_score": safety_check['risk_score']
            }
        })

    # 3. Use sanitized input for parsing
    sanitized_transcript = safety_check['sanitized_input']
    result = parse_voice_command(sanitized_transcript, active_case=req.case_id)

    # 4. Attach safety metadata to response
    result['guardrail'] = {
        'blocked': False,
        'risk_score': safety_check['risk_score'],
        'sanitized': sanitized_transcript != req.transcript
    }

    audit_logger.log_event(
        action="VOICE_COMMAND_EXECUTED",
        user="operator",
        resource=f"ACTION:{result.get('action')}",
        details=f"Spoken text: '{sanitized_transcript}' -> Action: {result.get('action')} | Risk: {safety_check['risk_score']}",
        severity="INFO"
    )

    return result
