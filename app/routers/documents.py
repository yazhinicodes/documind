from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth_utils import get_current_user
from app.services.pdf_service import process_pdf
import shutil
import os
import uuid

router = APIRouter()

UPLOAD_DIR = "uploaded_pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.DocumentResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User =  Depends(get_current_user)
):    
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)    

    document = models.Document(
        filename=unique_filename,
        original_name=file.filename,
        user_id=current_user.id,
        chunk_count=0
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    try:        
        chunk_count = process_pdf(file_path, document.id, file.filename)        
        document.chunk_count = chunk_count
        db.commit()
        db.refresh(document)
    except Exception as e:
        db.delete(document)
        db.commit()
        os.remove(file_path)        
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

    return document

@router.get("/", response_model=list[schemas.DocumentResponse])
def get_my_documents(
    db: Session = Depends(get_db),
    current_user: models.User =  Depends(get_current_user)
):
    documents = db.query(models.Document).filter(
        models.Document.user_id == current_user.id
    ).all()
    return documents

@router.delete("/{document_id}", status_code=204)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    document = db.query(models.Document).filter(
        models.Document.id == document_id,
        models.Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        file_path = os.path.join(UPLOAD_DIR, document.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass

    db.delete(document)
    db.commit()
    return None
