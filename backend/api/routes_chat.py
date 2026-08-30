from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from google import genai
from google.genai import types

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_with_agent(req: ChatRequest):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"response": "[SYSTEM ERROR] GEMINI_API_KEY environment variable is not set. Please add your API key to your Render dashboard environment variables to enable the live LLM AI."}
    
    try:
        client = genai.Client() # Automatically uses GEMINI_API_KEY
        
        system_instruction = """
        You are CrimeNet AI, an advanced intelligence operative analyzing the D-Company global syndicate (Dawood Ibrahim, Tiger Memon, Abu Salem).
        You are talking to a law enforcement user.
        Keep your responses extremely concise, tactical, and formatted professionally.
        Limit responses to 2-3 sentences. Do not use emojis. Act like a highly advanced OSINT/SIGINT platform.
        """
        
        interaction = await client.aio.interactions.create(
            model="gemini-3.6-flash",
            input=req.message,
            system_instruction=system_instruction,
            timeout=15.0
        )
        return {"response": interaction.output_text}
    except Exception as e:
        return {"response": f"[AI ENGINE OFFLINE] {str(e)}"}
