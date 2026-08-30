import os
import sys
from datetime import datetime, timedelta

# Ensure we can import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.schema import engine, SessionLocal, Base
from backend.database.models import Entity, Relationship, FIR, Anomaly
from backend.database import crud

def reset_database():
    print("Wiping existing database for Operation Syndicate...")
    Base.metadata.drop_all(bind=engine)
    print("Re-creating schema...")
    Base.metadata.create_all(bind=engine)

def seed_dawood_case():
    db = SessionLocal()
    
    # Check if already seeded to prevent unique constraint violations on FIRs
    from backend.database.models import FIR
    if db.query(FIR).filter_by(fir_number="FIR_MUM_EXT_2026_9981").first():
        print("Dawood case already seeded. Skipping.")
        db.close()
        return

    now = datetime.utcnow()
    
    # ---------------------------------------------------------
    # 1. ENTITIES (The Syndicate)
    # ---------------------------------------------------------
    print("Seeding High Value Targets (D-Company Proxy)...")
    
    # Tier 1: Leadership
    dawood = crud.get_or_create_entity(db, "PERSON", "Dawood Ibrahim", {"role": "Global Syndicate Boss", "alias": "Muchhad", "interpol_red_notice": True})
    shakeel = crud.get_or_create_entity(db, "PERSON", "Chhota Shakeel", {"role": "Operations Chief", "alias": "Bhai", "location": "Karachi"})
    memon = crud.get_or_create_entity(db, "PERSON", "Tiger Memon", {"role": "Hawala & Logistics", "alias": "Tiger"})
    
    # Tier 2: Execution & Extortion
    salem = crud.get_or_create_entity(db, "PERSON", "Abu Salem", {"role": "Extortion Specialist", "alias": "Captain", "extradited": True})
    shooter1 = crud.get_or_create_entity(db, "PERSON", "Firoz Khan", {"role": "Sharpshooter", "status": "Absconding"})
    
    # Tier 3: Targets & Fronts
    producer = crud.get_or_create_entity(db, "PERSON", "Rajesh Roshan (Bollywood)", {"role": "Victim", "status": "Under Police Protection"})
    front_company = crud.get_or_create_entity(db, "ORGANIZATION", "D-International Trading LLC", {"type": "Hawala Front", "registration": "Dubai Free Zone"})
    
    # Comm Nodes (Burner Phones)
    d_phone = crud.get_or_create_entity(db, "PHONE", "+92-300-1234567") # Dawood's secure line
    s_phone = crud.get_or_create_entity(db, "PHONE", "+92-300-9876543") # Shakeel
    t_phone = crud.get_or_create_entity(db, "PHONE", "+971-50-1112222") # Tiger Dubai
    salem_phone = crud.get_or_create_entity(db, "PHONE", "+91-9898989898") # Salem Mumbai burner
    
    # Financial Nodes
    dubai_acc = crud.get_or_create_entity(db, "BANK_ACCOUNT", "ENBD-DUB-999")
    mumbai_acc_1 = crud.get_or_create_entity(db, "BANK_ACCOUNT", "HDFC-MUM-111")
    mumbai_acc_2 = crud.get_or_create_entity(db, "BANK_ACCOUNT", "ICICI-MUM-222")
    shooter_acc = crud.get_or_create_entity(db, "BANK_ACCOUNT", "SBI-MUM-333")
    
    # Spatial Nodes
    taj_hotel = crud.get_or_create_entity(db, "LOCATION", "Taj Lands End, Bandra")
    safehouse = crud.get_or_create_entity(db, "LOCATION", "Dongri Safehouse A")
    
    # Vehicles
    salem_car = crud.get_or_create_entity(db, "VEHICLE", "MH-01-AB-1234", {"make": "Honda City", "color": "Silver"})
    shooter_bike = crud.get_or_create_entity(db, "VEHICLE", "MH-02-CD-5678", {"make": "Bajaj Pulsar", "color": "Black"})

    # SOCMINT Nodes (Social Media Handles)
    dawood_ig = crud.get_or_create_entity(db, "SOCIAL_HANDLE", "@d_boss_official", {"platform": "Instagram", "followers": 12500})
    salem_x = crud.get_or_create_entity(db, "SOCIAL_HANDLE", "@captain_salem", {"platform": "X", "followers": 890})
    shooter_fb = crud.get_or_create_entity(db, "SOCIAL_HANDLE", "Firoz_Bhai_Don", {"platform": "Facebook", "friends": 450})

    # ---------------------------------------------------------
    # 2. STRUCTURAL RELATIONSHIPS (Command & Control)
    # ---------------------------------------------------------
    print("Wiring syndicate hierarchy...")
    crud.create_relationship(db, dawood.id, shakeel.id, "COMMANDS", 1.0, {"hierarchy": "Direct Report"}, now - timedelta(days=5000))
    crud.create_relationship(db, dawood.id, memon.id, "COMMANDS", 0.9, {"hierarchy": "Financial Control"}, now - timedelta(days=4500))
    crud.create_relationship(db, shakeel.id, salem.id, "DIRECTS_OPERATIONS_FOR", 0.9, {"status": "Active"}, now - timedelta(days=2000))
    crud.create_relationship(db, salem.id, shooter1.id, "HIRED", 0.8, {"payment_status": "Pending"}, now - timedelta(days=30))
    crud.create_relationship(db, memon.id, front_company.id, "CONTROLS", 1.0, {"legal_status": "Proxy Director"}, now - timedelta(days=3600))
    
    # Asset Ownership
    crud.create_relationship(db, dawood.id, d_phone.id, "OWNS_PHONE", 1.0, {"provider": "PTCL Pakistan", "encryption": "Military Grade"})
    crud.create_relationship(db, shakeel.id, s_phone.id, "OWNS_PHONE", 1.0, {"provider": "PTCL Pakistan"})
    crud.create_relationship(db, memon.id, t_phone.id, "OWNS_PHONE", 1.0, {"provider": "Etisalat Dubai"})
    crud.create_relationship(db, salem.id, salem_phone.id, "OWNS_PHONE", 1.0, {"provider": "Jio Pre-paid Burner"})
    crud.create_relationship(db, front_company.id, dubai_acc.id, "OWNS_ACCOUNT")
    crud.create_relationship(db, salem.id, mumbai_acc_1.id, "OWNS_ACCOUNT")
    crud.create_relationship(db, shooter1.id, shooter_acc.id, "OWNS_ACCOUNT")
    crud.create_relationship(db, salem.id, salem_car.id, "OWNS_VEHICLE")
    crud.create_relationship(db, shooter1.id, shooter_bike.id, "OWNS_VEHICLE")

    # SOCMINT Links
    crud.create_relationship(db, dawood.id, dawood_ig.id, "OWNS_HANDLE")
    crud.create_relationship(db, salem.id, salem_x.id, "OWNS_HANDLE")
    crud.create_relationship(db, shooter1.id, shooter_fb.id, "OWNS_HANDLE")
    crud.create_relationship(db, salem_x.id, dawood_ig.id, "TAGGED_IN_POST", 0.7, {"sentiment": "Praise"})
    crud.create_relationship(db, shooter_fb.id, safehouse.id, "POSTED_FROM", 0.9, {"geo_accuracy": "15m radius"})

    # ---------------------------------------------------------
    # 3. TEMPORAL RELATIONSHIPS (The Extortion Plot & Panic)
    # ---------------------------------------------------------
    print("Generating Extortion and Panic Entropy signatures...")
    
    # 1. Extortion calls (Salem to Producer)
    extortion_time = now - timedelta(days=5, hours=14) # Afternoon
    crud.create_relationship(db, salem_phone.id, producer.id, "THREATENED", 1.0, {"duration": 180, "demand": "50 Crore INR"}, extortion_time)
    crud.create_relationship(db, salem_phone.id, producer.id, "THREATENED", 1.0, {"duration": 45, "demand": "Final Warning"}, extortion_time + timedelta(days=1))
    
    # 2. The Police Raid / FIR Lodged (Triggers Panic)
    raid_time = now - timedelta(days=2, hours=18) # 6 PM raid on Salem's safehouse
    
    # 3. PANIC ENTROPY BURST: Salem frantically calls Shakeel in the dead of night
    # This will trigger a massive Q4 (Midnight-6AM) Shannon Entropy spike
    for i in range(25):
        burst_time = raid_time + timedelta(hours=8, minutes=i*4) # Starts at 2 AM
        crud.create_relationship(db, salem_phone.id, s_phone.id, "CALLED", 1.0, {"duration_seconds": 15, "cell_tower": "Dongri_South_01", "status": "Dropped/Short"}, burst_time)

    # 4. Shakeel escalates to Dawood (Highly irregular, extreme panic)
    escalation_time = raid_time + timedelta(hours=9) # 3 AM
    crud.create_relationship(db, s_phone.id, d_phone.id, "CALLED", 1.0, {"duration_seconds": 600, "cell_tower": "Karachi_Clifton_VIP"}, escalation_time)

    # ---------------------------------------------------------
    # 4. FINANCIAL HAWALA (Smurfing & Fluid Dynamics)
    # ---------------------------------------------------------
    print("Wiring Hawala Smurfing routes...")
    # Dubai front company sends money to Mumbai Shell 1
    transfer_time = now - timedelta(days=10)
    crud.create_relationship(db, dubai_acc.id, mumbai_acc_1.id, "TRANSFERRED_MONEY_TO", 0.9, {"amount_inr": 25000000, "transaction_id": "SWIFT-DXB-991", "purpose": "Software Export"}, transfer_time)
    
    # Mumbai Shell 1 smurfs it to Mumbai Shell 2 (Layering)
    crud.create_relationship(db, mumbai_acc_1.id, mumbai_acc_2.id, "TRANSFERRED_MONEY_TO", 0.8, {"amount_inr": 12500000, "transaction_id": "RTGS-MUM-111", "purpose": "Vendor Advance"}, transfer_time + timedelta(days=1))
    crud.create_relationship(db, mumbai_acc_1.id, mumbai_acc_2.id, "TRANSFERRED_MONEY_TO", 0.8, {"amount_inr": 12000000, "transaction_id": "RTGS-MUM-112", "purpose": "Consulting Fees"}, transfer_time + timedelta(days=2))
    
    # Shell 2 pays the Shooter (Integration)
    crud.create_relationship(db, mumbai_acc_2.id, shooter_acc.id, "TRANSFERRED_MONEY_TO", 0.7, {"amount_inr": 500000, "transaction_id": "IMPS-PAY-001", "purpose": "Misc"}, transfer_time + timedelta(days=3))

    # ---------------------------------------------------------
    # 5. SPATIAL GHOST RENDEZVOUS
    # ---------------------------------------------------------
    print("Generating Ghost Rendezvous coordinates...")
    # Abu Salem and the Shooter meet at Taj Hotel, but don't call each other.
    meet_time = now - timedelta(days=4, hours=19) # 7 PM, day before extortion warning 2
    crud.create_relationship(db, salem_car.id, taj_hotel.id, "SPOTTED_AT", 1.0, {"source": "ALPR Cam Bandra", "confidence": "99%"}, meet_time)
    crud.create_relationship(db, shooter_bike.id, taj_hotel.id, "SPOTTED_AT", 1.0, {"source": "CCTV Taj Parking", "confidence": "94%"}, meet_time + timedelta(minutes=10))

    # ---------------------------------------------------------
    # 6. FIR RECORDS (NLP Targets)
    # ---------------------------------------------------------
    print("Filing Digital FIRs...")
    f1 = FIR(
        fir_number="FIR_MUM_EXT_2026_9981",
        date=now - timedelta(days=2),
        police_station="Bandra Police Station",
        raw_text="Complainant Rajesh Roshan reported receiving extortion threats demanding 50 Crore INR from an individual identifying as Abu Salem, operating on behalf of Dawood Ibrahim and Chhota Shakeel. Threat calls traced to burner number +91-9898989898. Suspect was reportedly seen in a silver Honda City MH-01-AB-1234 near Taj Lands End.",
        crime_type="Extortion & Organized Crime",
        crime_confidence=0.98,
        extracted_entities=["Rajesh Roshan", "Abu Salem", "Dawood Ibrahim", "Chhota Shakeel", "+91-9898989898", "MH-01-AB-1234", "Taj Lands End"]
    )
    db.add(f1)
    
    f2 = FIR(
        fir_number="FIR_ED_HAWALA_2026_001",
        date=now - timedelta(days=1),
        police_station="Enforcement Directorate (ED) Mumbai",
        raw_text="Intelligence reveals massive hawala routing from Dubai via Tiger Memon's front company D-International Trading LLC. Funds entering HDFC-MUM-111 and layered into ICICI-MUM-222 to fund local shooters including Firoz Khan.",
        crime_type="Money Laundering & Terror Financing",
        crime_confidence=0.99,
        extracted_entities=["Tiger Memon", "D-International Trading LLC", "HDFC-MUM-111", "ICICI-MUM-222", "Firoz Khan", "Dubai"]
    )
    db.add(f2)

    # ---------------------------------------------------------
    # 7. EXPLICIT ANOMALIES (For Dashboard Highlighting)
    # ---------------------------------------------------------
    print("Generating AI System Anomalies...")
    a1 = Anomaly(
        anomaly_type="BURST_CALLING",
        severity="CRITICAL",
        title="Panic Entropy: Severe Nocturnal Burst Calling",
        description="Abu Salem exhibited severe circadian desynchronization, initiating 25 back-to-back calls to Chhota Shakeel between 02:00 AM and 04:00 AM immediately following FIR_MUM_EXT_2026_9981.",
        entity_ids=[salem.id, shakeel.id, salem_phone.id, s_phone.id]
    )
    db.add(a1)
    
    a2 = Anomaly(
        anomaly_type="GHOST_CONNECTOR",
        severity="HIGH",
        title="Ghost Rendezvous Detected at Taj Lands End",
        description="Abu Salem (MH-01-AB-1234) and Firoz Khan (MH-02-CD-5678) were co-located at Taj Lands End parking within 10 minutes of each other. No telephonic contact exists between them, indicating deliberate operational security (OpSec) avoidance.",
        entity_ids=[salem.id, shooter1.id, salem_car.id, shooter_bike.id, taj_hotel.id]
    )
    db.add(a2)
    
    a3 = Anomaly(
        anomaly_type="CIRCULAR_TRANSACTION",
        severity="CRITICAL",
        title="Hawala Smurfing: Cross-Border Layering",
        description="D-International Trading (Dubai) routed ?25,000,000 to HDFC-MUM-111, which was immediately layered across 48 hours to ICICI-MUM-222, and subsequently used to fund sharpshooter accounts.",
        entity_ids=[front_company.id, dubai_acc.id, mumbai_acc_1.id, mumbai_acc_2.id, shooter_acc.id]
    )
    db.add(a3)

    db.commit()
    print("SUCCESS: Operation Syndicate (D-Company Variant) has been successfully seeded into the master database.")
    db.close()

if __name__ == "__main__":
    reset_database()
    seed_dawood_case()
