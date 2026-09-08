import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.schema import SessionLocal, init_db
from backend.database.models import Entity
from backend.nlp.ghost_acoustic import analyze_ambient_acoustics
from backend.graph.quantum_mole import detect_internal_leaks

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
    
    # 2. Test Internal-Leak Analyzer
    print("\n2. Testing Internal-Leak Analyzer...")
    mole = detect_internal_leaks(db)
    print(f"Flagged Leaks: {mole['flagged_insider_anomalies']}")
    for lk in mole['leak_detections']:
        print(f"  Officer: {lk['officer_name']} ({lk['officer_badge']}) -> Leak Correlation: {lk['leak_correlation_index_pct']}%")
    assert mole['status'] == "success"
    print("[+] Internal-Leak Analyzer Engine Passed!")
    
    db.close()
    print("\n==================================================")
    print("[SUCCESS] ALL ADVANCED EXPERIMENTAL ENGINES VERIFIED!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
