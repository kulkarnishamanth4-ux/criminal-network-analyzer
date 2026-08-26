from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import CORS_ORIGINS
from backend.database.schema import init_db, get_db
from backend.database.models import Base, Entity
from backend.api import routes_upload, routes_network, routes_analytics, routes_search

app = FastAPI(title="CrimeNet Intelligence Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_upload.router, prefix="/api", tags=["Upload"])
app.include_router(routes_network.router, prefix="/api", tags=["Network"])
app.include_router(routes_analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(routes_search.router, prefix="/api", tags=["Search"])

@app.on_event("startup")
def startup_event():
    init_db()
    # Can load initial synthetic data here if DB is empty
