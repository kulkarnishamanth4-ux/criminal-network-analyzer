from fastapi import APIRouter, Request, Query
from backend.security.audit_logger import audit_logger
from backend.limiter import limiter

router = APIRouter()

@router.get("/audit/logs")
@limiter.limit("30/minute")
async def get_audit_logs(request: Request, limit: int = 50, severity: str = None):
    return audit_logger.get_logs(limit, severity)

@router.get("/audit/verify")
@limiter.limit("30/minute")
async def verify_audit_integrity(request: Request):
    return audit_logger.verify_integrity()

@router.get("/audit/export")
@limiter.limit("30/minute")
async def export_audit_logs(request: Request):
    return audit_logger.export_cert_in_format()
