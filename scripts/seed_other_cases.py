import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.database.crud import get_or_create_entity, create_relationship

def generate_case_data(db: Session, case_id: str, case_name: str, location_base: str, role_labels: dict, node_names: list, asset_types: dict):
    now = datetime.utcnow()
    
    # Create nodes
    boss = get_or_create_entity(db, "PERSON", node_names[0], {"role": role_labels["boss"], "case_id": case_id})
    lt1 = get_or_create_entity(db, "PERSON", node_names[1], {"role": role_labels["lt"], "case_id": case_id})
    lt2 = get_or_create_entity(db, "PERSON", node_names[2], {"role": role_labels["lt"], "case_id": case_id})
    
    foot_soldiers = []
    for i in range(3, 7):
        fs = get_or_create_entity(db, "PERSON", node_names[i], {"role": role_labels["foot"], "case_id": case_id})
        foot_soldiers.append(fs)
        
    # Locations
    loc1 = get_or_create_entity(db, "LOCATION", f"{location_base} Safehouse", {"case_id": case_id})
    loc2 = get_or_create_entity(db, "LOCATION", f"{location_base} Drop Point", {"case_id": case_id})
    
    # Phones
    b_phone = get_or_create_entity(db, "PHONE", f"+91-999000{random.randint(1000, 9999)}", {"case_id": case_id})
    lt1_phone = get_or_create_entity(db, "PHONE", f"+91-999000{random.randint(1000, 9999)}", {"case_id": case_id})
    
    # Bank/Crypto
    acc1 = get_or_create_entity(db, asset_types["finance"], f"{asset_types['finance_prefix']}-{random.randint(10000,99999)}", {"case_id": case_id})
    
    # Relationships
    create_relationship(db, boss.id, lt1.id, "COMMANDS", 1.0, {"case_id": case_id})
    create_relationship(db, boss.id, lt2.id, "COMMANDS", 1.0, {"case_id": case_id})
    create_relationship(db, boss.id, b_phone.id, "OWNS_PHONE", 1.0, {"case_id": case_id})
    create_relationship(db, lt1.id, lt1_phone.id, "OWNS_PHONE", 1.0, {"case_id": case_id})
    
    create_relationship(db, boss.id, acc1.id, "OWNS_ACCOUNT", 1.0, {"case_id": case_id})
    create_relationship(db, lt1.id, loc1.id, "SPOTTED_AT", 0.8, {"case_id": case_id})
    
    for fs in foot_soldiers:
        create_relationship(db, random.choice([lt1.id, lt2.id]), fs.id, "DIRECTS", 0.7, {"case_id": case_id})
        create_relationship(db, fs.id, loc2.id, "SPOTTED_AT", 0.9, {"case_id": case_id})
        create_relationship(db, fs.id, b_phone.id, "CALLED", 0.4, {"case_id": case_id})

def seed_additional_cases(db: Session):
    print("Seeding diverse organized crime cases...")
    
    cases = [
        {
            "id": "drug_punjab", "name": "Drug Trafficking", "loc": "Amritsar Border",
            "roles": {"boss": "Cartel Head", "lt": "Distributor", "foot": "Peddler/Mule"},
            "names": ["Balwinder 'Billa' Singh", "Gurpreet 'Garry' Sandhu", "Vikram 'Vicky' Brar", "Raju", "Kala", "Deepa", "Sonu"],
            "assets": {"finance": "BANK_ACCOUNT", "finance_prefix": "HDFC-ASR"}
        },
        {
            "id": "ht_assam", "name": "Human Trafficking", "loc": "Guwahati Hub",
            "roles": {"boss": "Ring Leader", "lt": "Transporter", "foot": "Agent"},
            "names": ["Anwar Ali", "Rofiqul Islam", "Babu Bhai", "Munna", "Sajid", "Raju", "Kamal"],
            "assets": {"finance": "BANK_ACCOUNT", "finance_prefix": "SBI-GHY"}
        },
        {
            "id": "cyber_bengaluru", "name": "Cybercrime Syndicate", "loc": "Whitefield Tech Park",
            "roles": {"boss": "Mastermind", "lt": "Tech Lead", "foot": "Caller/Phisher"},
            "names": ["Ramesh 'Phishing' Kumar", "Sunil 'Hacker' Shetty", "Priya 'Scam' Sharma", "Rahul", "Amit", "Neha", "Vikas"],
            "assets": {"finance": "BANK_ACCOUNT", "finance_prefix": "CRYPTO-WALLET-BTC"}
        },
        {
            "id": "money_gujarat", "name": "Money Laundering", "loc": "Surat Diamond Market",
            "roles": {"boss": "Hawala Operator", "lt": "Angadia", "foot": "Cash Courier"},
            "names": ["Mansukh Bhai", "Ketan Patel", "Jignesh Shah", "Ramesh", "Suresh", "Mahesh", "Dinesh"],
            "assets": {"finance": "BANK_ACCOUNT", "finance_prefix": "HAWALA-SURAT"}
        },
        {
            "id": "arms_chhattisgarh", "name": "Arms Trafficking", "loc": "Bastar Forest",
            "roles": {"boss": "Supplier", "lt": "Logistics", "foot": "Runner"},
            "names": ["Naxal Commander 'Rao'", "Suraj 'Katta' Singh", "Bhima", "Somu", "Mangal", "Budhram", "Sukku"],
            "assets": {"finance": "BANK_ACCOUNT", "finance_prefix": "CASH-STASH"}
        },
        {
            "id": "wildlife_kerala", "name": "Wildlife Poaching", "loc": "Wayanad Reserve",
            "roles": {"boss": "Smuggling Don", "lt": "Middleman", "foot": "Poacher"},
            "names": ["Jose 'Tusk' Thomas", "Rajan Nair", "Kumar", "Biju", "Sabu", "Vinu", "Mani"],
            "assets": {"finance": "BANK_ACCOUNT", "finance_prefix": "FEDERAL-KRL"}
        },
        {
            "id": "extortion_up", "name": "Extortion & Racketeering", "loc": "Gorakhpur",
            "roles": {"boss": "Bahubali (Don)", "lt": "Shooter", "foot": "Enforcer"},
            "names": ["Vikas 'Dada' Singh", "Munna Bajrangi", "Chhotu", "Ramu", "Shyam", "Kallu", "Pintu"],
            "assets": {"finance": "BANK_ACCOUNT", "finance_prefix": "PNB-GKP"}
        }
    ]
    
    for c in cases:
        generate_case_data(db, c["id"], c["name"], c["loc"], c["roles"], c["names"], c["assets"])
    
    print("Additional cases seeded successfully.")
