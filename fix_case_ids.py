from backend.database.schema import SessionLocal
from backend.database.models import Entity, Relationship

db = SessionLocal()
entities = db.query(Entity).all()
updated_ent = 0
for e in entities:
    real_case = (e.properties or {}).get('case_id')
    if real_case and e.case_id != real_case:
        e.case_id = real_case
        updated_ent += 1

rels = db.query(Relationship).all()
updated_rel = 0
for r in rels:
    real_case = (r.properties or {}).get('case_id')
    if real_case and r.case_id != real_case:
        r.case_id = real_case
        updated_rel += 1

db.commit()
print(f"Fixed {updated_ent} entities and {updated_rel} relationships.")
