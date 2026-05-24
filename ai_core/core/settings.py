import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY", "")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
LLAMA_API_KEY = (
    os.getenv("LLAMA_API_KEY", "")
    or os.getenv("LLAMA_KEY", "")
    or os.getenv("LLAMA_API_TOKEN", "")
    or GROQ_API_KEY
    or TOGETHER_API_KEY
    or OPENROUTER_API_KEY
)
LLAMA_BASE_URL = os.getenv("LLAMA_BASE_URL", "")
LLAMA_MODEL = os.getenv("LLAMA_MODEL", "llama-3.1-8b-instant")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1")

if not LLAMA_BASE_URL and GROQ_API_KEY:
    LLAMA_BASE_URL = "https://api.groq.com/openai/v1"

if not LLAMA_BASE_URL and TOGETHER_API_KEY:
    LLAMA_BASE_URL = "https://api.together.xyz/v1"

if not LLAMA_BASE_URL and OPENROUTER_API_KEY:
    LLAMA_BASE_URL = "https://openrouter.ai/api/v1"

if LLAMA_API_KEY and not LLAMA_BASE_URL:
    LLAMA_BASE_URL = "https://api.groq.com/openai/v1"

MONGO_URI = os.getenv("MONGO_URI", "")
MONGO_DB = os.getenv("MONGO_DB", "research_db")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "research_history")
