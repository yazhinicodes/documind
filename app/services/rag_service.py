import google.generativeai as genai
from app.services.pdf_service import chroma_client, get_embedding
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-3.8-flash")

def search_relevant_chunks(question: str, document_id: int = None, n_results: int = 4) -> list:
    question_embedding = get_embedding(question)
    if document_id:
        collection_name = f"document_{document_id}"
        try:
            collection = chroma_client.get_collection(name=collection_name)
            results = collection.query(
                query_embeddings=[question_embedding],
                n_results=n_results
            )
        except Exception:
            return []
    else:
        all_collections = chroma_client.list_collections()
        all_chunks = []
        all_metadatas = []
        for col in all_collections:
            collection = chroma_client.get_collection(name=col.name)                            
            results = collection.query(
                query_embeddings=[question_embedding],
                n_results=2
            )
            if results["documents"][0]:
                all_chunks.extend(results["documents"][0])
                all_metadatas.extend(results["metadatas"][0])
        return list(zip(all_chunks, all_metadatas))

    chunks = results["documents"][0]
    metadatas = results["metadatas"][0]
    return list(zip(chunks, metadatas))

def ask_gemini(question: str, context_chunks: list) -> dict:
    if not context_chunks:
        return {
            "answer": "No relevant documents found to answer your question.",
            "sources": []
        }

    context = ""
    sources = []
    for chunk, metadata in context_chunks:
        context += f"\n---\n{chunk}\n"
        source = f"Document: {metadata['filename']}, Chunk: {metadata['chunk_index'] + 1}"
        if source not in sources:
            sources.append(source)

    prompt = f"""You are a helpful assistant that answers questions based only on the provided document context.
If the answer is not found in the context, say "I couldn't find this information in the provided documents."
Do not make up information.

Context for documents:
{context}

Question: {question}

Answer:"""

    response = model.generate_content(prompt)
    return {
        "answer": response.text,
        "sources": sources
    }

def answer_question(question: str, document_id: int = None) -> dict:
    chunks = search_relevant_chunks(question, document_id)
    return ask_gemini(question, chunks)