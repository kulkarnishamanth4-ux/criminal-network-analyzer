from backend.database.schema import SessionLocal
from backend.database.models import Entity, Relationship

db = SessionLocal()

dawood_entities = db.query(Entity).filter(Entity.case_id == "dawood").all()

to_delete = []
for e in dawood_entities:
    if (e.properties or {}).get("generated") == True:
        to_delete.append(e)

delete_ids = [e.id for e in to_delete]

# Delete any remaining relationships
db.query(Relationship).filter(
    (Relationship.source_id.in_(delete_ids)) | (Relationship.target_id.in_(delete_ids))
).delete(synchronize_session=False)

# Delete the entities
db.query(Entity).filter(Entity.id.in_(delete_ids)).delete(synchronize_session=False)
db.commit()

all_dawood_now = db.query(Entity).filter(Entity.case_id == "dawood").count()
print(f"Deleted {len(delete_ids)} generated entities. Total Dawood Entities now: {all_dawood_now}")
