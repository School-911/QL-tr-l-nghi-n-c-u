from fastapi import APIRouter

from core.database import mongo_collection
from core.settings import (
    GEMINI_API_KEY,
    LLAMA_API_KEY,
    LLAMA_BASE_URL,
    LLAMA_MODEL,
    OLLAMA_BASE_URL,
    OLLAMA_MODEL,
    OPENAI_API_KEY,
)

router = APIRouter()

@router.get("/")
async def root():

    return {
        "status": "online",
        "service": "Antigravity AI Core"
    }

# =========================================================
# HEALTH
# =========================================================

@router.get("/health")
async def health():

    return {
        "status": "healthy",
        "gemini_configured": bool(GEMINI_API_KEY),
        "openai_configured": bool(OPENAI_API_KEY),
        "llama_api_configured": bool(LLAMA_API_KEY and LLAMA_BASE_URL),
        "llama_model": LLAMA_MODEL if LLAMA_API_KEY and LLAMA_BASE_URL else None,
        "ollama_configured": bool(OLLAMA_BASE_URL and OLLAMA_MODEL),
        "mongo_connected": mongo_collection is not None
    }


# =========================================================
# WORKSPACE / TEAM / NOTIFICATIONS
# =========================================================
