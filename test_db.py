from backend.database.schema import SessionLocal
from backend.database.models import Entity, Relationship

db = SessionLocal()
entities = db.query(Entity).all()
for e in entities:
    if type(e.properties) != dict:
        print(f"Error! Entity {e.id} properties is {type(e.properties)}")
        import json
        try:
            p = json.loads(e.properties)
            print("Successfully parsed as JSON")
        except:
            pass

print("Count of entities with case_id = cyber_bengaluru:", len([e for e in entities if isinstance(e.properties, dict) and e.properties.get('case_id') == 'cyber_bengaluru']))
