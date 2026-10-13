"""
AgroConnect – Farm-to-Market Platform (FastAPI Backend)
Main application entry point configuring routers, CORS, database lifecycle, and OpenAPI docs.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import logging

from app.config import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agroconnect-fastapi")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize MongoDB connection & indexes
    await connect_to_mongo()
    yield
    # Shutdown: gracefully close connections
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack Farm-to-Market agriculture marketplace connecting farmers directly with wholesale buyers.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs",
        "api_endpoints": {
            "auth": "/api/auth",
            "crops": "/api/crops",
            "orders": "/api/orders",
            "prices": "/api/prices",
            "assistant": "/api/assistant",
            "admin": "/api/admin",
        }
    }

# Mock route inclusion for standalone Python runs
# In production, routes from app/routes are mounted as:
# app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
# app.include_router(crops.router, prefix="/api/crops", tags=["Crop Listings"])
# app.include_router(orders.router, prefix="/api/orders", tags=["Order Management"])
# app.include_router(assistant.router, prefix="/api/assistant", tags=["AI Farmer Assistant"])
# app.include_router(prices.router, prefix="/api/prices", tags=["Market Prices"])
# app.include_router(admin.router, prefix="/api/admin", tags=["Admin Portal"])

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
