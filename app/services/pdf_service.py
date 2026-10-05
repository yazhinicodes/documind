from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import chromadb
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import os
import uuid

CHROMA_PATH = "chroma_db"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=GEMINI_API_KEY
)

def get_embedding(text: str) -> list:
    return embeddings.embed_query(text)

def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def split_text_into_chunks(text: str) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    return splitter.split_text(text)

def store_chunks_in_chromadb(chunks: list[str], document_id: int, filename: str) -> int:
    collection_name = f"document_{document_id}"
    collection = chroma_client.get_or_create_collection(
        name=collection_name        
    )

    ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas = [{"document_id": document_id, "filename": filename, "chunk_index": i}
                 for i, _ in enumerate(chunks)]
    chunk_embeddings = [get_embedding(chunk) for chunk in chunks]

    collection.add(
        documents=chunks,
        ids=ids,
        metadatas=metadatas,
        embeddings=chunk_embeddings
    )
    return len(chunks)

def process_pdf(file_path: str, document_id: int, filename: str) -> int:
    text = extract_text_from_pdf(file_path)
    chunks = split_text_into_chunks(text)
    chunk_count = store_chunks_in_chromadb(chunks, document_id, filename)
    return chunk_count
