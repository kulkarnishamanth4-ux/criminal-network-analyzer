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
    crud.create_relationship(db, vikram.id, rajesh.id, "ASSOCIATED_WITH", 0.9, properties={"status": "Active", "hierarchy": "Direct Report", "trust_level": "High"}, timestamp=now - timedelta(days=400))
    crud.create_relationship(db, vikram.id, mohan.id, "ASSOCIATED_WITH", 0.9, properties={"status": "Active", "hierarchy": "Direct Report", "trust_level": "High"}, timestamp=now - timedelta(days=380))
    crud.create_relationship(db, vikram.id, ahmed.id, "ASSOCIATED_WITH", 0.8, properties={"status": "Active", "hierarchy": "Contractor", "trust_level": "Medium"}, timestamp=now - timedelta(days=200))
    crud.create_relationship(db, ahmed.id, diamond_corp.id, "CONTROLS", 1.0, properties={"legal_status": "Proxy Director", "shares": "100%", "incorporated": "2018-05-12"}, timestamp=now - timedelta(days=1500))
    
    # Dynasty Kinship
    crud.create_relationship(db, vikram.id, karan.id, "FATHER_OF", 1.0, properties={"bloodline": "Primary Heir", "status": "Confirmed"}, timestamp=now - timedelta(days=8000))
    crud.create_relationship(db, vikram.id, arjun.id, "UNCLE_OF", 0.8, properties={"bloodline": "Nephew", "status": "Confirmed"}, timestamp=now - timedelta(days=9000))
    crud.create_relationship(db, karan.id, diamond_corp.id, "BOARD_MEMBER", 0.9, properties={"designation": "Executive Director", "appointment_date": "2023-01-15"}, timestamp=now - timedelta(days=600))
    
    # Phone Ownership
    crud.create_relationship(db, vikram.id, p_vikram.id, "OWNS_PHONE", properties={"provider": "Jio", "status": "Active", "activation_date": "2021-08-10"}, timestamp=now - timedelta(days=900))
    crud.create_relationship(db, rajesh.id, p_rajesh.id, "OWNS_PHONE", properties={"provider": "Airtel", "status": "Burner", "activation_date": "2024-01-05"}, timestamp=now - timedelta(days=230))
    crud.create_relationship(db, mohan.id, p_mohan.id, "OWNS_PHONE", properties={"provider": "Vodafone Idea", "status": "Active", "activation_date": "2023-11-20"}, timestamp=now - timedelta(days=280))
    crud.create_relationship(db, ahmed.id, p_ahmed.id, "OWNS_PHONE", properties={"provider": "Etisalat (Roaming)", "status": "Active", "activation_date": "2022-05-15"}, timestamp=now - timedelta(days=800))
    
    # Communications (CDR)
    crud.create_relationship(db, p_vikram.id, p_rajesh.id, "CALLED", weight=0.5, timestamp=now - timedelta(days=2), properties={"duration_seconds": 120, "cell_tower": "Bandra_West_04", "call_type": "Encrypted WhatsApp Audio"})
    crud.create_relationship(db, p_rajesh.id, p_mohan.id, "CALLED", weight=0.7, timestamp=now - timedelta(days=1), properties={"duration_seconds": 45, "cell_tower": "Dharavi_South_12", "call_type": "Standard Cellular"})
    # Burst calling for Panic Entropy trigger (Mohan to Vikram)
    for i in range(15):
        crud.create_relationship(db, p_mohan.id, p_vikram.id, "CALLED", weight=0.9, timestamp=now - timedelta(hours=3, minutes=i*2), properties={"duration_seconds": 15, "cell_tower": "Dharavi_South_12", "call_type": "Standard Cellular", "status": "Dropped/Unanswered"})
        
    # Financial Flow (Hawala)
    crud.create_relationship(db, diamond_corp.id, acc_front.id, "OWNS_ACCOUNT", properties={"bank": "HDFC", "branch": "Nariman Point", "kyc_status": "Verified"}, timestamp=now - timedelta(days=1500))
    crud.create_relationship(db, mule1.id, acc_mule1.id, "OWNS_ACCOUNT", properties={"bank": "ICICI", "branch": "Andheri East", "kyc_status": "Forged"}, timestamp=now - timedelta(days=100))
    crud.create_relationship(db, mule2.id, acc_mule2.id, "OWNS_ACCOUNT", properties={"bank": "ICICI", "branch": "Andheri East", "kyc_status": "Forged"}, timestamp=now - timedelta(days=95))
    
    crud.create_relationship(db, acc_front.id, acc_mule1.id, "TRANSFERRED_MONEY_TO", weight=0.8, timestamp=now - timedelta(days=5), properties={"amount_inr": 500000, "transaction_id": "IMPS-987654321", "purpose": "Vendor Payment"})
    crud.create_relationship(db, acc_front.id, acc_mule2.id, "TRANSFERRED_MONEY_TO", weight=0.8, timestamp=now - timedelta(days=5), properties={"amount_inr": 500000, "transaction_id": "IMPS-987654322", "purpose": "Logistics Fees"})
    crud.create_relationship(db, acc_mule1.id, acc_mule2.id, "TRANSFERRED_MONEY_TO", weight=0.6, timestamp=now - timedelta(days=4), properties={"amount_inr": 490000, "transaction_id": "UPI-123456789", "purpose": "Loan Repayment"}) # Smurfing
    
    # Ghost Rendezvous (Rajesh & Ahmed at Taj Hotel, no phone contact)
    crud.create_relationship(db, rajesh.id, loc_mumbai.id, "SPOTTED_AT", weight=1.0, timestamp=now - timedelta(days=10, hours=14), properties={"source": "CCTV Camera 04", "confidence": "98%"})
    crud.create_relationship(db, ahmed.id, loc_mumbai.id, "SPOTTED_AT", weight=1.0, timestamp=now - timedelta(days=10, hours=14, minutes=5), properties={"source": "CCTV Camera 02", "confidence": "95%"})
    
    # Optical Plate Cloning Paradox (Same plate, two locations simultaneously)
    crud.create_relationship(db, veh_cloned.id, loc_mumbai.id, "SPOTTED_AT", weight=1.0, timestamp=now - timedelta(days=1, hours=12), properties={"source": "ANPR Toll Naka", "speed": "45 km/h", "lane": "Fastag-1"})
    crud.create_relationship(db, veh_cloned.id, loc_delhi.id, "SPOTTED_AT", weight=1.0, timestamp=now - timedelta(days=1, hours=12, minutes=15), properties={"source": "ANPR Highway Cam", "speed": "60 km/h", "lane": "L2"}) # Impossible travel time
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

