from backend.database.schema import SessionLocal
from backend.database.models import Entity, Relationship
import json

db = SessionLocal()
entities = db.query(Entity).all()
print("Total entities:", len(entities))

dawood_entities = [e for e in entities if (e.properties or {}).get("case_id", "dawood") == "dawood"]
print("Dawood entities with default getter:", len(dawood_entities))

for e in entities[:5]:
    print(e.id, type(e.properties), e.properties)

