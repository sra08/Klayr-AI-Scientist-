from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from src.api.routes import run, plan, feedback, profile, researchers, collaboration, notifications

app = FastAPI(
    title="Klayr AI",
    description="Automated Experiment Generation Pipeline for researchers",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router registration
app.include_router(run.router, prefix="/api", tags=["pipeline"])
app.include_router(plan.router, prefix="/api", tags=["plans"])
app.include_router(feedback.router, prefix="/api", tags=["feedback"])
app.include_router(profile.router, prefix="/api", tags=["profile"])
app.include_router(researchers.router, prefix="/api/researchers", tags=["researchers"])
app.include_router(collaboration.router, prefix="/api/collab", tags=["collaboration"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])

@app.get("/")
async def root():
    return {"message": "Klayr API is operational"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
