from backend.database.schema import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Kill idle in transaction connections
    conn.execute(text("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction';"))
    conn.commit()
    print("Killed idle transactions.")
