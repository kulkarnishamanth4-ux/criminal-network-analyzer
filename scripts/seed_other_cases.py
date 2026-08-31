import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.database.crud import get_or_create_entity, create_relationship, create_anomaly

def generate_case_data(db: Session, case_id: str, case_name: str, location_base: str, role_labels: dict, node_names: list, asset_types: dict, coords: dict):
    now = datetime.utcnow()
    
    # 1. Leadership (3)
    boss = get_or_create_entity(db, "PERSON", node_names[0], {"role": role_labels["boss"], "case_id": case_id})
    lt1 = get_or_create_entity(db, "PERSON", node_names[1], {"role": role_labels["lt"], "case_id": case_id})
    lt2 = get_or_create_entity(db, "PERSON", node_names[2], {"role": role_labels["lt"], "case_id": case_id})
    
    # 2. Foot Soldiers (10)
    foot_soldiers = []
    for i in range(10):
        name = node_names[3 + i] if (3 + i) < len(node_names) else f"Operative {i}"
        fs = get_or_create_entity(db, "PERSON", name, {"role": role_labels["foot"], "case_id": case_id})
        foot_soldiers.append(fs)
        
    # 3. Locations (5)
    locations = []
    loc_names = ["Safehouse Alpha", "Warehouse", "Drop Point", "Front Business", "Transit Hub"]
    base_lat, base_lng = coords["lat"], coords["lng"]
    
    for i, lname in enumerate(loc_names):
        lat = base_lat + random.uniform(-0.05, 0.05)
        lng = base_lng + random.uniform(-0.05, 0.05)
        loc = get_or_create_entity(db, "LOCATION", f"{location_base} {lname}", {"case_id": case_id, "latitude": lat, "longitude": lng})
        locations.append(loc)
        
    # 4. Phones (10)
    phones = []
    for i in range(10):
        phone = get_or_create_entity(db, "PHONE", f"+91-9990{random.randint(10000, 99999)}", {"case_id": case_id, "provider": random.choice(["Jio", "Airtel", "Burner", "VoIP"])})
        phones.append(phone)
        
    # 5. Financial Accounts (5)
    accounts = []
    for i in range(5):
        acc = get_or_create_entity(db, asset_types["finance"], f"{asset_types['finance_prefix']}-{random.randint(10000,99999)}", {"case_id": case_id})
        accounts.append(acc)
        
    # 6. Vehicles (4)
    vehicles = []
    for i in range(4):
        veh = get_or_create_entity(db, "VEHICLE", f"IND-{random.randint(10,99)}-{random.randint(1000,9999)}", {"case_id": case_id, "type": random.choice(["SUV", "Truck", "Sedan", "Bike"])})
        vehicles.append(veh)

    # 7. Core Relationships
    create_relationship(db, boss.id, lt1.id, "COMMANDS", 1.0, {"case_id": case_id})
    create_relationship(db, boss.id, lt2.id, "COMMANDS", 1.0, {"case_id": case_id})
    
    # Assign phones
    create_relationship(db, boss.id, phones[0].id, "OWNS_PHONE", 1.0, {"case_id": case_id})
    create_relationship(db, lt1.id, phones[1].id, "OWNS_PHONE", 1.0, {"case_id": case_id})
    create_relationship(db, lt2.id, phones[2].id, "OWNS_PHONE", 1.0, {"case_id": case_id})
    
    # Assign accounts
    create_relationship(db, boss.id, accounts[0].id, "OWNS_ACCOUNT", 1.0, {"case_id": case_id})
    create_relationship(db, lt1.id, accounts[1].id, "OWNS_ACCOUNT", 1.0, {"case_id": case_id})
    create_relationship(db, lt2.id, accounts[2].id, "OWNS_ACCOUNT", 1.0, {"case_id": case_id})
    
    # Assign vehicles
    create_relationship(db, boss.id, vehicles[0].id, "OWNS_VEHICLE", 1.0, {"case_id": case_id})
    create_relationship(db, lt1.id, vehicles[1].id, "OWNS_VEHICLE", 1.0, {"case_id": case_id})
    
    # Connect foot soldiers
    for i, fs in enumerate(foot_soldiers):
        leader = lt1 if i < 5 else lt2
        create_relationship(db, leader.id, fs.id, "DIRECTS", 0.8, {"case_id": case_id})
        create_relationship(db, fs.id, phones[3 + (i % 7)].id, "OWNS_PHONE", 0.9, {"case_id": case_id})
        create_relationship(db, fs.id, locations[i % 5].id, "SPOTTED_AT", 0.9, {"case_id": case_id})
        if i % 3 == 0:
            create_relationship(db, fs.id, vehicles[2 + (i % 2)].id, "OWNS_VEHICLE", 1.0, {"case_id": case_id})
        if i % 2 == 0:
            create_relationship(db, fs.id, accounts[3 + (i % 2)].id, "OWNS_ACCOUNT", 1.0, {"case_id": case_id})
            
    # Cross connections
    create_relationship(db, foot_soldiers[0].id, foot_soldiers[1].id, "ASSOCIATED_WITH", 0.7, {"case_id": case_id})
    create_relationship(db, foot_soldiers[5].id, foot_soldiers[6].id, "ASSOCIATED_WITH", 0.7, {"case_id": case_id})
    
    # Calls & Finance
    for _ in range(15):
        p1, p2 = random.sample(phones, 2)
        create_relationship(db, p1.id, p2.id, "CALLED", random.uniform(0.3, 1.0), {"case_id": case_id, "duration": random.randint(10, 600)})
        
    for _ in range(10):
        a1, a2 = random.sample(accounts, 2)
        create_relationship(db, a1.id, a2.id, "TRANSFERRED_MONEY_TO", random.uniform(0.5, 1.0), {"case_id": case_id, "amount": random.randint(10000, 5000000)})
        
    for _ in range(8):
        v = random.choice(vehicles)
        l = random.choice(locations)
        create_relationship(db, v.id, l.id, "SPOTTED_AT", 1.0, {"case_id": case_id})

    # Create Anomalies
    anomaly_types = [
        ("BURST_CALLING", "HIGH", f"Sudden spike in encrypted VoIP calls mapped to {location_base}."),
        ("RAPID_MONEY_FLOW", "CRITICAL", f"Hawala layer detected: {random.randint(5,15)} million INR routed through {asset_types['finance_prefix']} accounts in 12 hours."),
        ("GEO_ANOMALY", "MEDIUM", f"Co-location detected: {boss.name}'s vehicle and {lt1.name}'s burner phone pinged {locations[0].name} simultaneously."),
        ("GHOST_CONNECTOR", "HIGH", f"Undocumented mediator found relaying commands between {lt1.name} and {lt2.name}.")
    ]
    
    for _ in range(3):
        a_type, a_sev, a_desc = random.choice(anomaly_types)
        create_anomaly(
            db=db,
            anomaly_type=a_type,
            severity=a_sev,
            title=f"Detected: {a_type.replace('_', ' ')}",
            description=a_desc,
            evidence=[{"type": "graph_pattern", "confidence": random.uniform(85, 99)}],
            entity_ids=[boss.id, lt1.id],
            case_id=case_id
        )

def seed_additional_cases(db: Session):
    from backend.database.models import Entity
    # We will force recreate by checking if drug_punjab has > 15 nodes.
    # Actually, we don't need to check, main.py drops all tables on startup if we just delete the sqlite file.
    
    print("Seeding deeply intricate organized crime cases (with geospatial/anomalies)...")
    
    cases = [
        {
            "id": "drug_punjab", "name": "Drug Trafficking", "loc": "Amritsar Border",
            "roles": {"boss": "Cartel Head", "lt": "Distributor", "foot": "Peddler/Mule"},
            "names": ["Balwinder 'Billa' Singh", "Gurpreet 'Garry' Sandhu", "Vikram 'Vicky' Brar", "Raju", "Kala", "Deepa", "Sonu", "Sunny", "Happy", "Goldy", "Jaggi", "Pargat", "Makhhan"],
            "assets": {"finance": "BANK_ACCOUNT", "finance_prefix": "HDFC-ASR"},
            "coords": {"lat": 31.6340, "lng": 74.8723}
        },
        {
            "id": "ht_assam", "name": "Human Trafficking", "loc": "Guwahati Hub",
            "roles": {"boss": "Ring Leader", "lt": "Transporter", "foot": "Agent"},
            "names": ["Anwar Ali", "Rofiqul Islam", "Babu Bhai", "Munna", "Sajid", "Raju", "Kamal", "Zakir", "Farooq", "Imran", "Salim", "Tariq", "Kabir"],
            "assets": {"finance": "BANK_ACCOUNT", "finance_prefix": "SBI-GHY"},
            "coords": {"lat": 26.1445, "lng": 91.7362}
        },
        {
            "id": "cyber_bengaluru", "name": "Cybercrime Syndicate", "loc": "Whitefield Tech Park",
            "roles": {"boss": "Mastermind", "lt": "Tech Lead", "foot": "Caller/Phisher"},
            "names": ["Ramesh 'Phishing' Kumar", "Sunil 'Hacker' Shetty", "Priya 'Scam' Sharma", "Rahul", "Amit", "Neha", "Vikas", "Pooja", "Arjun", "Karan", "Nitin", "Rohit", "Sneha"],
            "assets": {"finance": "BANK_ACCOUNT", "finance_prefix": "CRYPTO-WALLET-BTC"},
            "coords": {"lat": 12.9698, "lng": 77.7500}
        },
        {
            "id": "money_gujarat", "name": "Money Laundering", "loc": "Surat Diamond Market",
            "roles": {"boss": "Hawala Operator", "lt": "Angadia", "foot": "Cash Courier"},
            "names": ["Mansukh Bhai", "Ketan Patel", "Jignesh Shah", "Ramesh", "Suresh", "Mahesh", "Dinesh", "Bhavesh", "Hardik", "Viral", "Chirag", "Dipesh", "Mehul"],
            "assets": {"finance": "BANK_ACCOUNT", "finance_prefix": "HAWALA-SURAT"},
            "coords": {"lat": 21.1702, "lng": 72.8311}
        },
        {
            "id": "arms_chhattisgarh", "name": "Arms Trafficking", "loc": "Bastar Forest",
            "roles": {"boss": "Supplier", "lt": "Logistics", "foot": "Runner"},
            "names": ["Naxal Commander 'Rao'", "Suraj 'Katta' Singh", "Bhima", "Somu", "Mangal", "Budhram", "Sukku", "Laxman", "Ramu", "Shyam", "Hari", "Golu", "Monu"],
            "assets": {"finance": "BANK_ACCOUNT", "finance_prefix": "CASH-STASH"},
            "coords": {"lat": 19.2081, "lng": 81.9360}
        },
        {
            "id": "wildlife_kerala", "name": "Wildlife Poaching", "loc": "Wayanad Reserve",
            "roles": {"boss": "Smuggling Don", "lt": "Middleman", "foot": "Poacher"},
            "names": ["Jose 'Tusk' Thomas", "Rajan Nair", "Kumar", "Biju", "Sabu", "Vinu", "Mani", "Sreejith", "Pradeep", "Ajith", "Unni", "Gopi", "Ravi"],
            "assets": {"finance": "BANK_ACCOUNT", "finance_prefix": "FEDERAL-KRL"},
            "coords": {"lat": 11.6854, "lng": 76.1320}
        },
        {
            "id": "extortion_up", "name": "Extortion & Racketeering", "loc": "Gorakhpur",
            "roles": {"boss": "Bahubali (Don)", "lt": "Shooter", "foot": "Enforcer"},
            "names": ["Vikas 'Dada' Singh", "Munna Bajrangi", "Chhotu", "Ramu", "Shyam", "Kallu", "Pintu", "Raju", "Sanju", "Dabloo", "Guddu", "Bablu", "Ravi"],
            "assets": {"finance": "BANK_ACCOUNT", "finance_prefix": "PNB-GKP"},
            "coords": {"lat": 26.7606, "lng": 83.3732}
        }
    ]
    
    for c in cases:
        generate_case_data(db, c["id"], c["name"], c["loc"], c["roles"], c["names"], c["assets"], c["coords"])
    
    print("Additional cases seeded successfully.")
