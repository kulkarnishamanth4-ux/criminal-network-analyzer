import os
import sys
import json
from datetime import datetime, timedelta

# Add parent directory to path to allow importing backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.schema import engine, SessionLocal, Base
from backend.database.models import Entity, Relationship, FIR, Anomaly
import backend.database.crud as crud

def reset_database():
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating new tables...")
    Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # ==========================================
    # 1. ENTITIES (The Syndicate structure)
    # ==========================================
    # Kingpin
    vikram = crud.get_or_create_entity(db, "PERSON", "Vikram Sharma", {"role": "Kingpin", "alias": "Bhaiji", "risk_score": 98.5})
    
    # Lieutenants
    rajesh = crud.get_or_create_entity(db, "PERSON", "Rajesh Kumar", {"role": "Operations Chief", "risk_score": 85.0})
    mohan = crud.get_or_create_entity(db, "PERSON", "Mohanlal", {"role": "Enforcer", "risk_score": 88.0})
    
    # Financial / Hawala wing
    ahmed = crud.get_or_create_entity(db, "PERSON", "Ahmed Bhai", {"role": "Hawala Operator", "risk_score": 92.0})
    diamond_corp = crud.get_or_create_entity(db, "ORGANIZATION", "Diamond Merchants Pvt Ltd", {"type": "Front Company", "risk_score": 75.0})
    
    # Dynasty Next-Gen
    karan = crud.get_or_create_entity(db, "PERSON", "Karan Sharma", {"role": "Successor", "clean_record": True, "risk_score": 40.0})
    arjun = crud.get_or_create_entity(db, "PERSON", "Arjun Sharma", {"role": "Proxy Director", "clean_record": True, "risk_score": 35.0})
    
    # Mules & Associates
    mule1 = crud.get_or_create_entity(db, "PERSON", "Suresh (Mule)", {"role": "Mule", "risk_score": 60.0})
    mule2 = crud.get_or_create_entity(db, "PERSON", "Ramesh (Mule)", {"role": "Mule", "risk_score": 60.0})
    
    # Phone Numbers
    p_vikram = crud.get_or_create_entity(db, "PHONE", "+91-9876543210")
    p_rajesh = crud.get_or_create_entity(db, "PHONE", "+91-9998887776")
    p_mohan = crud.get_or_create_entity(db, "PHONE", "+91-8887776665")
    p_ahmed = crud.get_or_create_entity(db, "PHONE", "+91-7776665554")
    
    # Bank Accounts
    acc_vikram = crud.get_or_create_entity(db, "BANK_ACCOUNT", "SBI-001234")
    acc_front = crud.get_or_create_entity(db, "BANK_ACCOUNT", "HDFC-DIAMOND-999")
    acc_mule1 = crud.get_or_create_entity(db, "BANK_ACCOUNT", "ICICI-MULE-001")
    acc_mule2 = crud.get_or_create_entity(db, "BANK_ACCOUNT", "ICICI-MULE-002")
    
    # Locations
    loc_mumbai = crud.get_or_create_entity(db, "LOCATION", "Taj Hotel Lobby, Mumbai")
    loc_delhi = crud.get_or_create_entity(db, "LOCATION", "Connaught Place, Delhi")
    loc_dubai = crud.get_or_create_entity(db, "LOCATION", "Deira Gold Souk, Dubai")
    
    # Vehicles
    veh_cloned = crud.get_or_create_entity(db, "VEHICLE", "MH-12-XYZ-9999", {"make": "Toyota Fortuner"})
    veh_mohan = crud.get_or_create_entity(db, "VEHICLE", "DL-4C-ABC-1234", {"make": "Mahindra Scorpio"})

    # ==========================================
    # 2. RELATIONSHIPS
    # ==========================================
    now = datetime.utcnow()
    
    # Hierarchy & Affiliations
    crud.create_relationship(db, vikram.id, rajesh.id, "ASSOCIATED_WITH", 0.9)
    crud.create_relationship(db, vikram.id, mohan.id, "ASSOCIATED_WITH", 0.9)
    crud.create_relationship(db, vikram.id, ahmed.id, "ASSOCIATED_WITH", 0.8)
    crud.create_relationship(db, ahmed.id, diamond_corp.id, "CONTROLS", 1.0)
    
    # Dynasty Kinship
    crud.create_relationship(db, vikram.id, karan.id, "FATHER_OF", 1.0)
    crud.create_relationship(db, vikram.id, arjun.id, "UNCLE_OF", 0.8)
    crud.create_relationship(db, karan.id, diamond_corp.id, "BOARD_MEMBER", 0.9)
    
    # Phone Ownership
    crud.create_relationship(db, vikram.id, p_vikram.id, "OWNS_PHONE")
    crud.create_relationship(db, rajesh.id, p_rajesh.id, "OWNS_PHONE")
    crud.create_relationship(db, mohan.id, p_mohan.id, "OWNS_PHONE")
    crud.create_relationship(db, ahmed.id, p_ahmed.id, "OWNS_PHONE")
    
    # Communications (CDR)
    crud.create_relationship(db, p_vikram.id, p_rajesh.id, "CALLED", weight=0.5, timestamp=now - timedelta(days=2))
    crud.create_relationship(db, p_rajesh.id, p_mohan.id, "CALLED", weight=0.7, timestamp=now - timedelta(days=1))
    # Burst calling for Panic Entropy trigger (Mohan to Vikram)
    for i in range(15):
        crud.create_relationship(db, p_mohan.id, p_vikram.id, "CALLED", weight=0.9, timestamp=now - timedelta(hours=3, minutes=i*2))
        
    # Financial Flow (Hawala)
    crud.create_relationship(db, diamond_corp.id, acc_front.id, "OWNS_ACCOUNT")
    crud.create_relationship(db, mule1.id, acc_mule1.id, "OWNS_ACCOUNT")
    crud.create_relationship(db, mule2.id, acc_mule2.id, "OWNS_ACCOUNT")
    
    crud.create_relationship(db, acc_front.id, acc_mule1.id, "TRANSFERRED_MONEY_TO", weight=0.8, timestamp=now - timedelta(days=5), properties={"amount": 500000})
    crud.create_relationship(db, acc_front.id, acc_mule2.id, "TRANSFERRED_MONEY_TO", weight=0.8, timestamp=now - timedelta(days=5), properties={"amount": 500000})
    crud.create_relationship(db, acc_mule1.id, acc_mule2.id, "TRANSFERRED_MONEY_TO", weight=0.6, timestamp=now - timedelta(days=4), properties={"amount": 490000}) # Smurfing
    
    # Ghost Rendezvous (Rajesh & Ahmed at Taj Hotel, no phone contact)
    crud.create_relationship(db, rajesh.id, loc_mumbai.id, "SPOTTED_AT", weight=1.0, timestamp=now - timedelta(days=10, hours=14))
    crud.create_relationship(db, ahmed.id, loc_mumbai.id, "SPOTTED_AT", weight=1.0, timestamp=now - timedelta(days=10, hours=14, minutes=5))
    
    # Optical Plate Cloning Paradox (Same plate, two locations simultaneously)
    crud.create_relationship(db, veh_cloned.id, loc_mumbai.id, "SPOTTED_AT", weight=1.0, timestamp=now - timedelta(days=1, hours=12))
    crud.create_relationship(db, veh_cloned.id, loc_delhi.id, "SPOTTED_AT", weight=1.0, timestamp=now - timedelta(days=1, hours=12, minutes=15)) # Impossible travel time
    
    # ==========================================
    # 3. FIR DATA (For NLP extraction & Gangwar cascade)
    # ==========================================
    f1 = FIR(
        fir_number="FIR_001_VIKRAM_SHARMA_NARCOTICS_CRACKDOWN",
        date=now - timedelta(days=14),
        police_station="Mumbai Central",
        raw_text="Major narcotics bust at Mumbai port. Suspect Vikram Sharma fled the scene. Associates Rajesh Kumar and Mohanlal believed to be retaliating against rival cartel. Seized 50kg of contraband. Vehicle MH-12-XYZ-9999 was seen fleeing.",
        crime_type="Narcotics & Organized Crime",
        crime_confidence=0.95,
        extracted_entities=["Vikram Sharma", "Rajesh Kumar", "Mohanlal", "Mumbai", "MH-12-XYZ-9999"]
    )
    db.add(f1)
    
    f2 = FIR(
        fir_number="FIR_002_HAWALA_RAID",
        date=now - timedelta(days=7),
        police_station="Delhi Special Cell",
        raw_text="Raid on Diamond Merchants Pvt Ltd revealed hawala transactions routed to Dubai. Director Ahmed Bhai absconding. Suspicious transfers noted to ICICI-MULE-001 and ICICI-MULE-002.",
        crime_type="Money Laundering",
        crime_confidence=0.98,
        extracted_entities=["Diamond Merchants Pvt Ltd", "Ahmed Bhai", "Dubai", "ICICI-MULE-001", "ICICI-MULE-002"]
    )
    db.add(f2)
    
    # ==========================================
    # 4. ANOMALIES
    # ==========================================
    a1 = Anomaly(
        anomaly_type="BURST_CALLING",
        severity="CRITICAL",
        title="Panic Entropy: Burst Calling Detected post-FIR",
        description="Mohanlal made 15 calls to Vikram Sharma in a 30 minute window following police action.",
        entity_ids=[mohan.id, vikram.id]
    )
    db.add(a1)
    
    a2 = Anomaly(
        anomaly_type="CIRCULAR_TRANSACTION",
        severity="HIGH",
        title="Hawala Smurfing Ring Detected",
        description="Funds traversing from Diamond Merchants to mules and looping back.",
        entity_ids=[diamond_corp.id, mule1.id, mule2.id]
    )
    db.add(a2)

    db.commit()
    print("Database seeding completed successfully.")
    db.close()

if __name__ == "__main__":
    reset_database()
    seed_data()
