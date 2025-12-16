import os
import google.generativeai as genai
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from datetime import datetime, timezone
from app.core.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])

# 1. Configure the AI with your Key
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# 2. Define the data structure we expect from the App
class AIProcessRequest(BaseModel):
    noteTitle: str
    noteContent: str
    userPrompt: str

# 3. Define the data structure we send back to the App
class AIProcessResponse(BaseModel):
    result: str
    processedAt: str
    modelUsed: str

# 4. The actual route handler
@router.post("/process", response_model=AIProcessResponse)
async def process_ai_request(
    request: AIProcessRequest,
  
):
    if not api_key:
        raise HTTPException(status_code=503, detail="Server missing API Key")

    try:
        # Use the 'flash' model for speed and low cost
        model = genai.GenerativeModel('gemini-2.0-flash')

        # Build the context for the AI
        prompt = f"""
        You are a helpful AI assistant built into a notes app.
        
        Context:
        Note Title: {request.noteTitle}
        Note Content:
        {request.noteContent}
        
        User Request: {request.userPrompt}
        
        Please provide a helpful response based on the note content above.
        """

        response = model.generate_content(prompt)
        
        if not response.text:
            raise ValueError("Empty response from AI")

        return AIProcessResponse(
            result=response.text,
            processedAt=datetime.now(timezone.utc).isoformat(),
            modelUsed='gemini-2.0-flash'
        )

    except Exception as e:
        print(f"AI Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))