from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth_utils import get_current_user
from app.services.rag_service import answer_question

router = APIRouter()

@router.post("/ask", response_model=schemas.AnswerResponse)
async def ask_question(
    question_data: schemas.QuestionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if question_data.document_id:
        document = db.query(models.Document).filter(
            models.Document.id == question_data.document_id,
            models.Document.user_id == current_user.id
        ).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

    result = answer_question(
        question=question_data.question,
        document_id=question_data.document_id
    )

    return result