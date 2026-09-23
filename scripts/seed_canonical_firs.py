"""
Seeds official FIR records for all canonical cases in the SQLite database.
"""

import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from datetime import datetime
from backend.database.schema import SessionLocal
from backend.database.models import FIR, Entity

def seed_firs():
    db = SessionLocal()
    
    canonical_firs = [
        # Drug Trafficking Punjab
        {
            "case_id": "drug_punjab",
            "fir_number": "FIR_PB_NDPS_2026_402",
            "date": datetime(2026, 4, 12, 14, 30),
            "police_station": "Amritsar Rural Police Station",
            "district": "Amritsar, Punjab",
            "crime_type": "Narcotics Trafficking & Border Smuggling",
            "crime_confidence": 0.96,
            "raw_text": "FIR registered under NDPS Act Sections 21/29 and Aircraft Act against Jaspal Singh (alias Billa Sandhu) and Gurpreet Singh regarding cross-border drone-dropped heroin consignment of 14.5 kg recovered near Attari border outpost.",
            "extracted_entities": ["Jaspal Singh", "Billa Sandhu", "Gurpreet Singh", "Amritsar Rural PS"]
        },
        {
            "case_id": "drug_punjab",
            "fir_number": "FIR_PB_HAWALA_2026_118",
            "date": datetime(2026, 6, 8, 11, 15),
            "police_station": "STF State Crime Cell",
            "district": "Ludhiana, Punjab",
            "crime_type": "Drug Money Laundering & Narco-Terror",
            "crime_confidence": 0.91,
            "raw_text": "Special Task Force probe uncovered illicit layering of Rs 4.8 Crore drug proceeds routed through shell transport firms and benami accounts connected to Jaspal Singh network.",
            "extracted_entities": ["Jaspal Singh", "STF"]
        },

        # Human Trafficking Assam
        {
            "case_id": "ht_assam",
            "fir_number": "FIR_AS_HT_2026_1109",
            "date": datetime(2026, 3, 22, 18, 45),
            "police_station": "Paltan Bazaar Police Station",
            "district": "Kamrup Metropolitan, Guwahati",
            "crime_type": "Human Trafficking & Identity Forgery",
            "crime_confidence": 0.94,
            "raw_text": "Case registered under IPC Section 370, 420, 468 and Immoral Traffic (Prevention) Act against Manik Ali and Rehana Begum for operating interstate forged documentation and illegal human trafficking network from border transit corridors.",
            "extracted_entities": ["Manik Ali", "Rehana Begum", "Guwahati Railway Station"]
        },
        {
            "case_id": "ht_assam",
            "fir_number": "FIR_AS_FORGERY_2026_304",
            "date": datetime(2026, 5, 14, 9, 30),
            "police_station": "Dhubri Town Police Station",
            "district": "Dhubri, Assam",
            "crime_type": "Forged Citizenship Documents",
            "crime_confidence": 0.89,
            "raw_text": "Intelligence raid dismantled counterfeit Aadhaar and voter ID fabrication center in Chakrashila operated by syndicate members linked to Manik Ali.",
            "extracted_entities": ["Manik Ali", "Dhubri"]
        },

        # Cyber Crime Bengaluru
        {
            "case_id": "cyber_bengaluru",
            "fir_number": "FIR_KA_CYBER_2026_883",
            "date": datetime(2026, 2, 19, 16, 20),
            "police_station": "Cyber Crime Police Station CID",
            "district": "Bengaluru City, Karnataka",
            "crime_type": "Corporate Ransomware & DarkWeb Laundering",
            "crime_confidence": 0.97,
            "raw_text": "Crime registered under IT Act Section 66C, 66D, 43 and IPC 420/384 against Ramesh 'Phishing' Kumar and Sunil 'Hacker' Shetty for deploying Zero-Day Monero ransomware against healthcare servers and laundering 15 BTC via decentralized tumblers.",
            "extracted_entities": ["Ramesh 'Phishing' Kumar", "Sunil 'Hacker' Shetty", "Apex ShadowMesh"]
        },
        {
            "case_id": "cyber_bengaluru",
            "fir_number": "FIR_KA_MULE_2026_214",
            "date": datetime(2026, 7, 5, 13, 10),
            "police_station": "Whitefield Police Station",
            "district": "Bengaluru, Karnataka",
            "crime_type": "Mule Account Fraud Ring",
            "crime_confidence": 0.88,
            "raw_text": "Investigation revealed 42 synchronized ATM cash extractions and corporate spoofing operations coordinated by Priya 'Scam' Sharma through Whitefield Tech Park safehouse.",
            "extracted_entities": ["Priya 'Scam' Sharma", "Whitefield"]
        },

        # Money Laundering Gujarat
        {
            "case_id": "money_gujarat",
            "fir_number": "FIR_GJ_AML_2026_774",
            "date": datetime(2026, 1, 30, 10, 0),
            "police_station": "CID Crime Surat Zone",
            "district": "Surat, Gujarat",
            "crime_type": "Hawala & Trade-Based Money Laundering",
            "crime_confidence": 0.95,
            "raw_text": "Enforcement Directorate and CID joint complaint under PMLA Act against Harshad Patel and Jayesh Shah for circular trading, under-invoicing rough diamond imports, and running token-based Angadia cash mule corridors.",
            "extracted_entities": ["Harshad Patel", "Jayesh Shah", "Surat Diamond Bourse"]
        },

        # Arms Trafficking Chhattisgarh
        {
            "case_id": "arms_chhattisgarh",
            "fir_number": "FIR_CG_ARMS_2026_521",
            "date": datetime(2026, 4, 28, 20, 15),
            "police_station": "Bastar Rural Police Station",
            "district": "Bastar, Chhattisgarh",
            "crime_type": "Illicit Arms & Heavy Ordnance Trafficking",
            "crime_confidence": 0.96,
            "raw_text": "FIR under Arms Act Sections 25/27 and UAPA against Sukru Korram and Manglu Ram after interception of mineral transport truck carrying 28 assault rifles, detonator assemblies, and radio transmitters in Dandakaranya forest corridor.",
            "extracted_entities": ["Sukru Korram", "Manglu Ram", "Bailadila Iron-Ore Transport"]
        },

        # Wildlife Poaching Kerala
        {
            "case_id": "wildlife_kerala",
            "fir_number": "FIR_KL_WILD_2026_339",
            "date": datetime(2026, 3, 11, 8, 45),
            "police_station": "Nilambur Forest Range Office",
            "district": "Malappuram, Kerala",
            "crime_type": "Elephant Ivory Poaching & Wildlife Trafficking",
            "crime_confidence": 0.95,
            "raw_text": "Forest Department registered case under Wildlife Protection Act 1972 Sections 9, 39, 51 against Ravi 'Tracker' and Kunjumon following recovery of 4 raw elephant tusks and seizure of illegal jaw traps in Silent Valley perimeter.",
            "extracted_entities": ["Ravi 'Tracker'", "Kunjumon", "Silent Valley"]
        },

        # Extortion Ring UP
        {
            "case_id": "extortion_up",
            "fir_number": "FIR_UP_EXT_2026_662",
            "date": datetime(2026, 5, 2, 17, 30),
            "police_station": "Anti-Extortion Cell STF Gorakhpur",
            "district": "Gorakhpur, Uttar Pradesh",
            "crime_type": "Tender Coercion & Purvanchal Gangster Syndicate",
            "crime_confidence": 0.97,
            "raw_text": "STF registered FIR under IPC Section 384/386, 506 and UP Gangsters Act against Virendra Pratap and Rakesh Tiwari for armed intimidation of infrastructure contractors, highway toll hafta collection, and benami tender allocation.",
            "extracted_entities": ["Virendra Pratap", "Rakesh Tiwari", "Purvanchal"]
        }
    ]

    added = 0
    for data in canonical_firs:
        existing = db.query(FIR).filter(FIR.fir_number == data["fir_number"]).first()
        if not existing:
            fir = FIR(
                case_id=data["case_id"],
                fir_number=data["fir_number"],
                date=data["date"],
                police_station=data["police_station"],
                district=data["district"],
                crime_type=data["crime_type"],
                crime_confidence=data["crime_confidence"],
                raw_text=data["raw_text"],
                extracted_entities=data["extracted_entities"]
            )
            db.add(fir)
            added += 1

    db.commit()
    db.close()
    print(f"Seeded {added} canonical FIR records into SQLite database.")

if __name__ == "__main__":
    seed_firs()
