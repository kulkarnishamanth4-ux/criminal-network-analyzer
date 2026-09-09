from fastapi import APIRouter, Request, Query
from typing import Optional
from pydantic import BaseModel
from backend.security.audit_logger import audit_logger
from backend.limiter import limiter

router = APIRouter()

class AuditLogCreate(BaseModel):
    action: str
    resource: str
    details: Optional[str] = ""
    severity: Optional[str] = "INFO"
    user: Optional[str] = None
    ip_address: Optional[str] = None

@router.get("/audit/logs")
@limiter.limit("60/minute")
async def get_audit_logs(request: Request, limit: int = 100, severity: Optional[str] = None, q: Optional[str] = None):
    return audit_logger.get_logs(limit=limit, severity_filter=severity, search_query=q)

@router.post("/audit/log")
@limiter.limit("120/minute")
async def create_audit_log(request: Request, entry: AuditLogCreate):
    client_ip = entry.ip_address or (request.client.host if request.client else "127.0.0.1")
    user = entry.user or request.headers.get("X-User-Id", "OFFICER-ATS-402")
    log = audit_logger.log_event(
        action=entry.action,
        user=user,
        resource=entry.resource,
        details=entry.details or "",
        severity=entry.severity or "INFO",
        ip_address=client_ip
    )
    return {"status": "success", "entry": log}

@router.get("/audit/verify")
@limiter.limit("30/minute")
async def verify_audit_integrity(request: Request):
    return audit_logger.verify_integrity()

@router.get("/audit/export")
@limiter.limit("30/minute")
async def export_audit_logs(request: Request):
    return audit_logger.export_cert_in_format()
