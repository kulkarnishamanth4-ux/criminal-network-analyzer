import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.schema import SessionLocal, init_db
from backend.database.models import Entity
from backend.nlp.ghost_acoustic import analyze_ambient_acoustics
from backend.graph.hawala_fluid import simulate_hawala_fluid_dynamics
from backend.analytics.panic_entropy import calculate_panic_profile
from backend.graph.quantum_mole import detect_internal_leaks
from backend.nlp.cryptolalia import decode_dark_slang

def run_tests():
    print("==================================================")
    print("[*] TESTING ADVANCED NEXT-GEN EXPERIMENTAL ENGINES")
    print("==================================================")
    
    db = SessionLocal()
    
    # 1. Test Forensic Acoustics
    print("\n1. Testing Forensic Acoustics Geo-Triangulation...")
    res = analyze_ambient_acoustics("intercept_call_001")
    print(f"Status: {res['status']}")
    print(f"Profile ID: {res['audio_profile_id']}")
    print(f"Triangulated Region: {res['triangulated_region']}")
    print(f"Confidence: {res['overall_acoustic_confidence_pct']}%")
    assert res['status'] == "success"
    print("[+] Forensic Acoustics Engine Passed!")
    
    # 2. Test Hawala Betrayal Index
    print("\n2. Testing Hawala Betrayal Index & Fluid Dynamics...")
    fluid = simulate_hawala_fluid_dynamics(db)
    print(f"Status: {fluid['status']}")
    print(f"Assessed Nodes: {fluid['total_financial_nodes']}")
    print(f"Liquidity Starvation: {fluid['fluid_pressure_metrics']['downstream_liquidity_starvation_pct']}%")
    print(f"Betrayal Risk Index: {fluid['fluid_pressure_metrics']['syndicate_internal_betrayal_risk_index']}%")
    assert fluid['status'] == "success"
    print("[+] Hawala Betrayal Index Engine Passed!")
    
    # 3. Test Confession-Probability Index
    print("\n3. Testing Confession-Probability Index & Panic Entropy...")
    first_person = db.query(Entity).filter(Entity.entity_type == "PERSON").first()
    if first_person:
        panic = calculate_panic_profile(db, first_person.id)
        print(f"Suspect: {panic['suspect_name']}")
        print(f"Panic Entropy Index: {panic['panic_entropy_metrics']['panic_entropy_index_pct']}%")
        print(f"Confession Approver Probability: {panic['panic_entropy_metrics']['confession_approver_probability_pct']}%")
        assert panic['status'] == "success"
        print("[+] Confession-Probability Index Engine Passed!")
    
    # 4. Test Internal-Leak Analyzer
    print("\n4. Testing Internal-Leak Analyzer...")
    mole = detect_internal_leaks(db)
    print(f"Flagged Leaks: {mole['flagged_insider_anomalies']}")
    for lk in mole['leak_detections']:
        print(f"  Officer: {lk['officer_name']} ({lk['officer_badge']}) -> Leak Correlation: {lk['leak_correlation_index_pct']}%")
    assert mole['status'] == "success"
    print("[+] Internal-Leak Analyzer Engine Passed!")
    
    # 5. Test Criminal-Slang Analyzer
    print("\n5. Testing Criminal-Slang Analyzer...")
    sample_slang = "bhaiji 50 peti aur gulab jamun ready hai... chidiya ka arrangement karlo jaldi"
    crypto = decode_dark_slang(sample_slang)
    print(f"Original Text: {crypto['original_intercept']}")
    print(f"Decoded Intelligence: {crypto['decrypted_intelligence_translation'].replace('₹', 'INR ')}")
    print(f"Detected Slang Count: {crypto['detected_cryptolalia_terms_count']}")
    assert crypto['status'] == "success"
    assert crypto['detected_cryptolalia_terms_count'] >= 3
    print("[+] Criminal-Slang Analyzer Engine Passed!")
    
    db.close()
    print("\n==================================================")
    print("[SUCCESS] ALL ADVANCED EXPERIMENTAL ENGINES VERIFIED!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
