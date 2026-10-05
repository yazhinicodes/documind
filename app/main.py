from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, documents, qa

from fastapi.security import HTTPBearer
from fastapi.openapi.utils import get_openapi

security = HTTPBearer()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DocuMind",
    description="AI-powered document Q&A system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(qa.router, prefix="/qa", tags=["Q&A"])

@app.get("/")
def root():
    return {"message": "DocuMind API is running."}