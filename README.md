# DocuMind — AI Document Q&A System

Upload any PDF and ask questions in plain English. Get accurate answers with citations showing exactly which part of the document the answer came from.

## Demo
> Upload a PDF → Ask a question → Get an answer with sources

## Tech Stack
- **Backend:** Python, FastAPI, SQLAlchemy
- **AI/ML:** LangChain, Google Gemini API, ChromaDB (vector database)
- **Database:** PostgreSQL
- **Frontend:** React, Vite, Axios
- **DevOps:** Docker, Docker Compose, Nginx

## How it works (RAG Pipeline)
1. User uploads a PDF
2. Text is extracted and split into chunks
3. Each chunk is converted to a vector embedding using Gemini
4. Embeddings are stored in ChromaDB
5. When a question is asked, the most relevant chunks are retrieved
6. Retrieved chunks + question are sent to Gemini
7. Gemini answers based only on the document context — with citations

## Features
- JWT-based authentication
- PDF upload and processing
- Semantic search across documents
- AI answers with source citations
- Ask across all documents or a specific one
- Clean ChatGPT-style UI
- Fully containerized with Docker

## Run Locally with Docker
```bash
git clone https://github.com/yazhinicodes/documind.git
cd documind

# Add your Gemini API key to .env
cp .env.example .env

docker-compose up --build
```
Open `http://localhost` in your browser.

## API Documentation
FastAPI auto-generates interactive docs at `http://localhost:8000/docs`

## Project Structure
```
documind/
├── app/
│   ├── routers/          # API endpoints
│   ├── services/         # PDF processing + RAG pipeline
│   ├── models.py         # Database models
│   ├── schemas.py        # Request/response validation
│   └── main.py           # FastAPI app
├── frontend/             # React application
├── docker-compose.yml    # Container orchestration
└── Dockerfile            # Backend container
```