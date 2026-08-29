from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import CORS_ORIGINS
from backend.database.schema import init_db, get_db, SessionLocal
from backend.database.models import Base, Entity
from backend.api import routes_upload, routes_network, routes_analytics, routes_search, routes_report, routes_experimental
from scripts.seed_rich_data import seed_data
from backend.graph.algorithms import update_entity_metrics
from backend.graph.builder import build_graph_from_db

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
app.include_router(routes_report.router, prefix="/api", tags=["Report"])
app.include_router(routes_experimental.router, prefix="/api", tags=["Experimental"])

@app.on_event("startup")
def startup_event():
    init_db()
    db = SessionLocal()
    # If the database is empty, seed it with the rich narrative data
    if db.query(Entity).first() is None:
        print("Database is empty. Seeding rich synthetic narrative data...")
        seed_data()
        
    print("Computing Graph Metrics (PageRank, Betweenness, Communities)...")
    G = build_graph_from_db(db)
    update_entity_metrics(db, G)
    print("Metrics computation complete.")
    db.close()
