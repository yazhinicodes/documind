from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth_utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()

@router.post("/signup", response_model=schemas.UserResponse, status_code=201)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    if len(user_data.password) > 72:
        raise HTTPException(status_code=400, detail="Password cannot exceed 72 characters")
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password)        
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user