from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator('password')
    @classmethod
    def password_length(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        if len(v) > 72:
            raise ValueError('Password cannot exceed 72 characters')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    chunk_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionRequest(BaseModel):
    question: str
    document_id: Optional[int] = None

class AnswerResponse(BaseModel):
    answer: str
    sources: list[str]