from backend.database.schema import SessionLocal
from backend.database.models import Anomaly

db = SessionLocal()
anomalies = db.query(Anomaly).all()

case_map = {
    "Amritsar Border": "drug_punjab",
    "Guwahati Hub": "ht_assam",
    "Whitefield Tech": "cyber_bengaluru",
    "Surat Hawala": "money_gujarat",
    "Bastar Forest": "arms_chhattisgarh",
    "Wayanad Reserve": "wildlife_kerala",
    "Gorakhpur Racketeering": "extortion_up",
    "Jose 'Tusk' Thomas": "wildlife_kerala",
    "P. 'Grizzly' Nair": "wildlife_kerala",
    "Rajan Nair": "wildlife_kerala",
    "Naxal Command 'Rao'": "arms_chhattisgarh",
    "Suraj 'Katta' Singh": "arms_chhattisgarh",
    "Surat Diamond Bourse": "money_gujarat",
    "Amit 'Ledger' Shah": "money_gujarat",
    "Ravi 'Crypto' Kumar": "cyber_bengaluru",
    "CASH-STASH": "money_gujarat",
    "DARK-WALLET": "cyber_bengaluru",
    "BORDER-DROP": "drug_punjab",
    "ARMORY-CACHE": "arms_chhattisgarh",
    "TIGER-SKIN": "wildlife_kerala",
    "EXTORTION-FRONT": "extortion_up",
    "B. 'Don' Yadav": "extortion_up",
    "Gurmeet 'King' Singh": "drug_punjab",
    "Ali 'Cartel' Khan": "drug_punjab",
    "Anil 'Trafficker' Bora": "ht_assam",
    "Dimapur Checkpoint": "ht_assam"
}

updated = 0
for a in anomalies:
    # Check if this anomaly belongs to another case
    for keyword, case_id in case_map.items():
        if keyword in a.description or keyword in a.title:
            if a.case_id != case_id:
                a.case_id = case_id
                updated += 1
            break

db.commit()
print(f"Fixed {updated} anomalies.")
