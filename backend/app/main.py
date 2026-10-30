import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import api_v1_router

app = FastAPI(
    title="FLOWSTATE — AICTE Administrative Intelligence Platform",
    description="Regulation-aware administrative intelligence and workflow orchestration platform for AICTE approval processes.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Strict CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_ORIGIN,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api/v1")


@app.on_event("startup")
def on_startup():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@app.get("/")
def root():
    return {
        "name": "FLOWSTATE API",
        "version": "1.0.0",
        "regulatory_baseline": "AICTE Approval Process Handbook (2024-2027)",
        "docs": "/docs",
        "disclaimer": "Prototype — synthetic data. No live AICTE databases or APIs are connected.",
    }


@app.get("/health")
def health():
    return {"status": "ok", "app_env": settings.APP_ENV}
