import os, sys, random
from datetime import datetime, timedelta
sys.path.append(os.getcwd())
from backend.database.schema import SessionLocal
from backend.database.models import Relationship

db = SessionLocal()
now = datetime.utcnow()
rels = db.query(Relationship).all()
count = 0
for r in rels:
    if r.timestamp is None:
        # Give it a random timestamp between 2 years ago and now
        random_days = random.randint(1, 700)
        r.timestamp = now - timedelta(days=random_days)
        count += 1
db.commit()
print(f"Updated timestamps for {count} relationships.")
