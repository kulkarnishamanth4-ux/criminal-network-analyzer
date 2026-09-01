import os
import sys
sys.path.append(os.getcwd())

from backend.database.schema import SessionLocal
from sqlalchemy import text

db = SessionLocal()

tables = ["entities", "relationships", "firs", "anomalies"]
for table in tables:
    try:
        db.execute(text(f"ALTER TABLE {table} ADD COLUMN case_id VARCHAR(50) DEFAULT 'dawood';"))
        db.commit()
        print(f"Added case_id to {table}")
    except Exception as e:
        print(f"Error on {table}: {e}")
        db.rollback()

