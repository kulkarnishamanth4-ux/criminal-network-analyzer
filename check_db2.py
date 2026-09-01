from backend.database.schema import SessionLocal
from backend.database.models import Entity, Relationship

db = SessionLocal()
entities = db.query(Entity).all()

dawood_count = 0
other_count = 0
for e in entities:
    props = e.properties
    # Wait, what if e.properties is a STRING in some rows?
    if isinstance(props, str):
        print("STRING PROPS:", props)
        import json
        props = json.loads(props)
        
    case = (props or {}).get("case_id", "dawood")
    if case == "dawood":
        dawood_count += 1
    else:
        other_count += 1

print("Dawood:", dawood_count)
print("Other:", other_count)
