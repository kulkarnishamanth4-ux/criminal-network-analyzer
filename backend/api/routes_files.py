from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.schema import get_db
from backend.database.models import UploadedFile
from backend.limiter import limiter
from fastapi import Request, HTTPException

router = APIRouter()

@router.get("/files/{case_id}")
@limiter.limit("30/minute")
async def get_files_by_case(request: Request, case_id: str, db: Session = Depends(get_db)):
    files = db.query(UploadedFile).filter(UploadedFile.case_id == case_id).all()
    return [{
        "id": f.id,
        "filename": f.filename,
        "file_type": f.file_type,
        "file_size": f.file_size,
        "uploaded_at": f.uploaded_at,
        "case_id": f.case_id
    } for f in files]

@router.get("/files/{case_id}/{file_id}/preview")
@limiter.limit("30/minute")
async def get_file_preview(request: Request, case_id: str, file_id: int, db: Session = Depends(get_db)):
    file = db.query(UploadedFile).filter(UploadedFile.id == file_id, UploadedFile.case_id == case_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return {
        "filename": file.filename,
        "file_type": file.file_type,
        "raw_content": file.raw_content,
        "parsed_preview": file.parsed_preview
    }

@router.delete("/files/{case_id}/{file_id}")
@limiter.limit("30/minute")
async def delete_uploaded_file(request: Request, case_id: str, file_id: int, db: Session = Depends(get_db)):
    file = db.query(UploadedFile).filter(UploadedFile.id == file_id, UploadedFile.case_id == case_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    filename = file.filename
    file_type = file.file_type
    
    # Delete uploaded file record
    db.delete(file)
    db.commit()
    
    try:
        from backend.security.audit_logger import audit_logger
        client_ip = request.client.host if request.client else "0.0.0.0"
        audit_logger.log_event(
            action="FILE_DELETE",
            user="operator",
            resource=f"{file_type}/{filename}",
            details=f"Removed file '{filename}' (ID: {file_id}) from case '{case_id}'",
            severity="INFO",
            ip_address=client_ip
        )
    except Exception:
        pass
        
    return {"status": "success", "message": f"File '{filename}' removed successfully", "file_id": file_id}

@router.delete("/files/{case_id}")
@limiter.limit("30/minute")
async def clear_all_uploaded_files(request: Request, case_id: str, db: Session = Depends(get_db)):
    deleted_count = db.query(UploadedFile).filter(UploadedFile.case_id == case_id).delete()
    db.commit()
    
    try:
        from backend.security.audit_logger import audit_logger
        client_ip = request.client.host if request.client else "0.0.0.0"
        audit_logger.log_event(
            action="FILE_CLEAR_ALL",
            user="operator",
            resource=f"case/{case_id}",
            details=f"Cleared all {deleted_count} uploaded files from case '{case_id}'",
            severity="WARNING",
            ip_address=client_ip
        )
    except Exception:
        pass
        
    return {"status": "success", "message": f"Cleared {deleted_count} files from case '{case_id}'", "count": deleted_count}
