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
