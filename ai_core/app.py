from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.research import router as research_router
from routers.system import router as system_router
from routers.workspaces import router as workspaces_router

app = FastAPI(
    title="Antigravity AI Core",
    version="4.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(system_router)
app.include_router(workspaces_router)
app.include_router(research_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
