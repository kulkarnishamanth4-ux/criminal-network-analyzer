from backend.database.schema import SessionLocal
from backend.database.models import Entity, Relationship
from sqlalchemy import desc

db = SessionLocal()

all_dawood = db.query(Entity).filter(Entity.case_id == "dawood").order_by(desc(Entity.id)).all()

# We want to keep exactly 100. Let's delete the newest ones first (which are the procedural ones)
to_delete = all_dawood[:-100]

print(f"Deleting {len(to_delete)} entities to reach exactly 100 total.")

delete_ids = [e.id for e in to_delete]

# Delete relationships where either source or target is in delete_ids
deleted_rels = db.query(Relationship).filter(
    (Relationship.source_id.in_(delete_ids)) | (Relationship.target_id.in_(delete_ids))
).delete(synchronize_session=False)

print(f"Deleted {deleted_rels} relationships.")

# Delete the entities
deleted_ents = db.query(Entity).filter(Entity.id.in_(delete_ids)).delete(synchronize_session=False)
db.commit()

all_dawood_now = db.query(Entity).filter(Entity.case_id == "dawood").count()
print(f"Total Dawood Entities now: {all_dawood_now}")
