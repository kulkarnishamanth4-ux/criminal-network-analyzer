from backend.database.schema import SessionLocal
from backend.database.models import Entity, Relationship

db = SessionLocal()

# Find all extra entities in dawood
extra_ents = db.query(Entity).filter(Entity.case_id == "dawood", Entity.id > 100).all()
delete_ids = [e.id for e in extra_ents]

print(f"Deleting {len(delete_ids)} extra procedural/bleed-over entities from Dawood.")

if delete_ids:
    db.query(Relationship).filter(
        (Relationship.source_id.in_(delete_ids)) | (Relationship.target_id.in_(delete_ids))
    ).delete(synchronize_session=False)

    db.query(Entity).filter(Entity.id.in_(delete_ids)).delete(synchronize_session=False)
    db.commit()

dawood_now = db.query(Entity).filter(Entity.case_id == "dawood").count()
print(f"Total Dawood Entities now: {dawood_now}")
