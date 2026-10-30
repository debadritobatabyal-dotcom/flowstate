from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.applications import router as apps_router
from app.api.v1.documents import router as docs_router
from app.api.v1.deficiencies import router as defs_router
from app.api.v1.regulation import router as reg_router
from app.api.v1.impact import router as impact_router
from app.api.v1.evc import router as evc_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.audit import router as audit_router
from app.api.v1.users import router as users_router
from app.api.v1.system import router as system_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(users_router, prefix="/users", tags=["User Management"])
api_v1_router.include_router(apps_router, prefix="/applications", tags=["Applications"])
api_v1_router.include_router(docs_router, prefix="/documents", tags=["Documents & Evidence"])
api_v1_router.include_router(defs_router, prefix="/deficiencies", tags=["Deficiency Lineage & Re-Scrutiny"])
api_v1_router.include_router(reg_router, prefix="/regulation", tags=["Regulatory Intelligence"])
api_v1_router.include_router(impact_router, prefix="/impact", tags=["Change Impact Intelligence"])
api_v1_router.include_router(evc_router, prefix="/evc", tags=["EVC & Committees"])
api_v1_router.include_router(analytics_router, prefix="/analytics", tags=["Predictive Analytics"])
api_v1_router.include_router(audit_router, prefix="/audit", tags=["Audit Log"])
api_v1_router.include_router(system_router, prefix="/system", tags=["System & Demo Controls"])

