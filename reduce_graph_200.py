from backend.database.schema import SessionLocal
from backend.database.models import Entity, Relationship

db = SessionLocal()

# Find all generated entities
generated_entities = []
all_dawood = db.query(Entity).filter(Entity.case_id == "dawood").all()

for e in all_dawood:
    if (e.properties or {}).get("generated") == True:
        generated_entities.append(e)

print(f"Found {len(generated_entities)} generated entities.")

# We want to keep about 80 of them (so 80 generated + ~120 core/other = ~200)
to_delete = generated_entities[80:]

print(f"Deleting {len(to_delete)} entities to reach ~200 total.")

delete_ids = [e.id for e in to_delete]

# Delete relationships where either source or target is in delete_ids
deleted_rels = db.query(Relationship).filter(
    (Relationship.source_id.in_(delete_ids)) | (Relationship.target_id.in_(delete_ids))
).delete(synchronize_session=False)

print(f"Deleted {deleted_rels} relationships.")

# Delete the entities
deleted_ents = db.query(Entity).filter(Entity.id.in_(delete_ids)).delete(synchronize_session=False)
db.commit()

print(f"Deleted {deleted_ents} entities.")

all_dawood_now = db.query(Entity).filter(Entity.case_id == "dawood").count()
print(f"Total Dawood Entities now: {all_dawood_now}")
