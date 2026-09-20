"""
Voice Control API Router.
Accepts voice transcripts and returns structured executable actions for the frontend.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database.schema import get_db
from backend.ai.voice_controller import parse_voice_command
from backend.security.audit_logger import audit_logger

router = APIRouter()


class VoiceCommandRequest(BaseModel):
    transcript: str
    case_id: str = "dawood"


@router.post("/voice/command")
def process_voice_command(req: VoiceCommandRequest, db: Session = Depends(get_db)):
    result = parse_voice_command(req.transcript, active_case=req.case_id)
    
    audit_logger.log_event(
        action="VOICE_COMMAND_EXECUTED",
        user="operator",
        resource=f"ACTION:{result.get('action')}",
        details=f"Spoken text: '{req.transcript}' -> Action: {result.get('action')}",
        severity="INFO"
    )
    
    return result
