from backend.database.schema import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_entities_case_id ON entities(case_id);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_relationships_case_id ON relationships(case_id);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_firs_case_id ON firs(case_id);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_anomalies_case_id ON anomalies(case_id);"))
        conn.commit()
        print("Indices successfully created on remote database.")
    except Exception as e:
        print("Could not create indices (might already exist or not supported by dialect):", e)
