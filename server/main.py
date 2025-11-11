from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
import uvicorn

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AIRequest(BaseModel):
    action: str
    text: str
    model: str | None = "gemini-2.5-flash-lite"

def build_prompt(action: str, text: str) -> str:
    match action:
        case "rewrite":
            return f"Rewrite this text professionally and clearly:\n\n{text}"
        case "summarize":
            return f"Summarize this text in 3 short bullet points:\n\n{text}"
        case "grammar":
            return f"Fix grammar and spelling mistakes in this text:\n\n{text}"
        case _:
            return text

@app.post("/api/ai")
async def ai_edit(request: AIRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    prompt = build_prompt(request.action, text)

    try:
        model = genai.GenerativeModel(request.model)
        response = model.generate_content(prompt)
        result = response.text.strip()
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
if __name__ == "__main__" :
    uvicorn.run(
        "main:app",
        host = "127.0.0.1",
        port = 8000,
        reload = True
    )