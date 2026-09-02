from backend.database.schema import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Update entities case_id natively inside postgres if it exists in JSON
    conn.execute(text("UPDATE entities SET case_id = properties->>'case_id' WHERE properties->>'case_id' IS NOT NULL;"))
    # Update relationships case_id natively
    conn.execute(text("UPDATE relationships SET case_id = properties->>'case_id' WHERE properties->>'case_id' IS NOT NULL;"))
    conn.commit()
    print("Database healed natively via SQL.")
