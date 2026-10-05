import requests

BASE_URL = "http://127.0.0.1:8000"

# Login
login_response = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "yazhini@test.com",
    "password": "test1234"
})
token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Ask a question about your resume
qa_response = requests.post(
    f"{BASE_URL}/qa/ask",
    headers=headers,
    json={
        "question": "What are the technical skills mentioned?",
        "document_id": 5
    }
)
print("Q&A status:", qa_response.status_code)
print("Answer:", qa_response.text)