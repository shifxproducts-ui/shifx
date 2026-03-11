"""
main.py — SHIFX PRODUCTS FastAPI application entry point.

Start with:
  uvicorn main:app --reload --port 8000
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import get_settings
from database import Base, engine
from database import get_db
from routes import (
    admin_routes,
    auth_routes,
    company_routes,
    order_routes,
    product_routes,
    review_routes,
    wishlist_routes,
)

settings = get_settings()


# ── Lifespan: create tables on startup ───────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables (no-op if they already exist)
    Base.metadata.create_all(bind=engine)
    yield


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    # Auto-create tables on startup
    @app.on_event("startup")
    async def startup():
    Base.metadata.create_all(bind=engine)
    title="SHIFX PRODUCTS API",
    description="Backend API for the SHIFX ecommerce platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth_routes.router)
app.include_router(product_routes.router)
app.include_router(order_routes.router)
app.include_router(review_routes.router)
app.include_router(wishlist_routes.router)
app.include_router(admin_routes.router)
app.include_router(company_routes.router)


# ── Health check ─────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "app": "SHIFX PRODUCTS API", "version": "1.0.0"}


# ── 404 fallback ──────────────────────────────────────────────────────────────

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={"detail": "Endpoint not found."})
