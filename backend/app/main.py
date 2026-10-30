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

# Flexible CORS for local dev and cloud deployments (Vercel, Render)
raw_origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if "," in settings.FRONTEND_ORIGIN:
    raw_origins.extend([o.strip() for o in settings.FRONTEND_ORIGIN.split(",") if o.strip()])

cors_origins = list(set([o for o in raw_origins if o and o != "*"]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins else ["*"],
    allow_origin_regex=r"https://.*(\.vercel\.app|\.onrender\.com|\.pages\.dev)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API endpoints under /api/v1 (canonical) and without prefix (fallback compatibility)
app.include_router(api_v1_router, prefix="/api/v1")
app.include_router(api_v1_router, prefix="")


@app.on_event("startup")
def on_startup():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    try:
        from app.core.database import Base, SessionLocal, engine
        from app.models.identity import User
        # Ensure schema tables exist
        Base.metadata.create_all(bind=engine)
        # Check if database has users; if empty, run deterministic seed
        db = SessionLocal()
        user_count = db.query(User).count()
        db.close()
        if user_count == 0:
            print("🌱 Fresh database detected on startup. Auto-seeding initial AICTE records...")
            from app.seed.run import seed_database
            seed_database(reset=False)
            print("✅ Auto-seeding complete.")
    except Exception as e:
        print(f"Startup database initialization error: {e}")


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
