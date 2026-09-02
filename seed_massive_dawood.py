import random
from sqlalchemy.orm import Session
from backend.database.schema import SessionLocal
from backend.database.models import Entity, Relationship

db = SessionLocal()

# Find existing dawood entities to anchor the graph
dawood = db.query(Entity).filter_by(name="Dawood Ibrahim", case_id="dawood").first()
shakeel = db.query(Entity).filter_by(name="Chhota Shakeel", case_id="dawood").first()
salem = db.query(Entity).filter_by(name="Abu Salem", case_id="dawood").first()
memon = db.query(Entity).filter_by(name="Tiger Memon", case_id="dawood").first()

anchors = [dawood, shakeel, salem, memon]
anchors = [a for a in anchors if a is not None]
if not anchors:
    print("No anchors found, skipping.")
    exit(1)

print(f"Anchoring massive graph to {len(anchors)} leaders...")

types = ["PERSON", "PHONE", "BANK_ACCOUNT", "LOCATION", "VEHICLE", "ORGANIZATION"]
rel_types = ["CALLED", "TRANSFERRED_MONEY_TO", "SPOTTED_AT", "ASSOCIATED_WITH", "DIRECTS", "OWNS_PHONE", "OWNS_ACCOUNT"]

new_entities = []
for i in range(1200):
    e = Entity(
        entity_type=random.choice(types),
        name=f"Node_{i}_{random.randint(1000, 9999)}",
        case_id="dawood",
        properties={"generated": True},
        risk_score=random.uniform(0, 1)
    )
    db.add(e)
    new_entities.append(e)

db.commit()
print(f"Created 1200 new nodes.")

# We need the IDs to create relationships
for e in new_entities:
    db.refresh(e)

print("Wiring 3000 edges...")
for _ in range(3000):
    source = random.choice(new_entities)
    # 20% chance to connect to a leader, 80% to connect to another grunt
    if random.random() < 0.2:
        target = random.choice(anchors)
    else:
        target = random.choice(new_entities)
        
    r = Relationship(
        source_id=source.id,
        target_id=target.id,
        rel_type=random.choice(rel_types),
        weight=random.uniform(0.1, 1.0),
        case_id="dawood"
    )
    db.add(r)

db.commit()
print("Massive Dawood graph seeded successfully.")
