from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import CORS_ORIGINS
from backend.database.schema import init_db, get_db, SessionLocal
from backend.database.models import Base, Entity
from backend.api import routes_upload, routes_network, routes_analytics, routes_search, routes_report, routes_experimental, routes_chat
from scripts.seed_d_company import seed_dawood_case
from scripts.seed_other_cases import seed_additional_cases
from backend.graph.algorithms import update_entity_metrics
from backend.graph.builder import build_graph_from_db

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from backend.limiter import limiter

app = FastAPI(title="CrimeNet Intelligence Platform")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
app.include_router(routes_chat.router, prefix="/api", tags=["Chat"])
app.include_router(routes_blockchain.router, prefix="/api", tags=["Blockchain"])

import threading

def run_startup_tasks():
    print("Starting background initialization tasks...")
    db = SessionLocal()
    try:
        # Seed Data (Idempotent)
        print("Checking and seeding databases...")
        # seed_dawood_case() removed to prevent infinite duplication on reboot
        # seed_additional_cases(db) removed to prevent infinite duplication on reboot
            
        print("Computing Graph Metrics (PageRank, Betweenness, Communities) for all cases...")
        cases = ["dawood", "drug_punjab", "ht_assam", "cyber_bengaluru", "money_gujarat", "arms_chhattisgarh", "wildlife_kerala", "extortion_up"]
        for cid in cases:
            G = build_graph_from_db(db, force_rebuild=True, case_id=cid)
            update_entity_metrics(db, G)
            build_graph_from_db(db, force_rebuild=True, case_id=cid)
        print("Metrics computation complete.")
    except Exception as e:
        print(f"Background task failed: {e}")
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    init_db()
    # Run heavy tasks in background so the port binds immediately
    threading.Thread(target=run_startup_tasks, daemon=True).start()
