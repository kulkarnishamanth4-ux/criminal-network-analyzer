"""
Script to fix misclassified entities in criminal_network.db:
- Vehicle makes/models (Innova, Scorpio, etc.) -> VEHICLE
- Localities/neighborhoods (Dadar, Bandra, etc.) -> LOCATION
"""
import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'criminal_network.db')
if not os.path.exists(db_path):
    print("Database not found at", db_path)
    exit(0)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

vehicle_keywords = [
    'innova', 'toyota innova', 'scorpio', 'fortuner', 'bolero', 'swift', 'honda city',
    'toyota', 'pulsar', 'thar', 'ertiga', 'baleno', 'wagonr', 'alto', 'safari',
    'harrier', 'nexon', 'brezza', 'xuv700', 'xuv500', 'qualis', 'tavera', 'duster',
    'seltos', 'sonet', 'verna', 'amaze', 'santro', 'gypsy', 'omni', 'activa', 'bullet',
    'royal enfield', 'apache', 'jupiter', 'ktm', 'duke', 'truck', 'tractor', 'dumper'
]

location_keywords = [
    'dadar', 'bandra', 'andheri', 'juhu', 'colaba', 'dharavi', 'kurla', 'borivali',
    'goregaon', 'malad', 'kandivali', 'chembur', 'ghatkopar', 'mulund', 'thane', 'vashi',
    'panvel', 'bhendi bazaar', 'dongri', 'byculla', 'worli', 'parel', 'lower parel',
    'saket', 'lajpat nagar', 'nehru place', 'connaught place', 'karol bagh', 'paharganj',
    'chandni chowk', 'rohini', 'dwarka', 'okhla', 'janakpuri', 'hauz khas', 'malviya nagar',
    'greater kailash', 'vasant kunj', 'south extension', 'defence colony', 'noida', 'gurgaon',
    'koramangala', 'indiranagar', 'whitefield', 'hsr layout', 'jayanagar', 'hitec city',
    'bastar', 'dandakaranya', 'wayanad', 'majha', 'dhubri', 'karimganj'
]

cur.execute('SELECT id, entity_type, name, case_id FROM entities')
rows = cur.fetchall()

to_veh = []
to_loc = []

for r in rows:
    eid, etype, name, cid = r
    nl = name.lower().strip()
    if etype == 'PERSON':
        if any(nl == vk or nl.endswith(' ' + vk) or nl.startswith(vk + ' ') for vk in vehicle_keywords):
            to_veh.append((eid, name, etype, cid))
        elif any(nl == lk or nl.endswith(' ' + lk) or nl.startswith(lk + ' ') for lk in location_keywords):
            to_loc.append((eid, name, etype, cid))

print(f"Found {len(to_veh)} entities to convert to VEHICLE: {to_veh}")
print(f"Found {len(to_loc)} entities to convert to LOCATION: {to_loc}")

for eid, name, _, _ in to_veh:
    cur.execute("UPDATE entities SET entity_type = 'VEHICLE' WHERE id = ?", (eid,))
for eid, name, _, _ in to_loc:
    cur.execute("UPDATE entities SET entity_type = 'LOCATION' WHERE id = ?", (eid,))

conn.commit()
conn.close()
print("Database entity types fixed successfully!")
