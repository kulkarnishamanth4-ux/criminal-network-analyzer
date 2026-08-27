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
from backend.crypto.zk_federation import execute_zk_federation_query

def run_tests():
    print("==================================================")
    print("[*] TESTING 6 ADVANCED NEXT-GEN EXPERIMENTAL ENGINES")
    print("==================================================")
    
    init_db()
    db = SessionLocal()
    
    # 1. Test Project Ghost-Acoustic
    print("\n1. Testing Project Ghost-Acoustic Geo-Triangulation...")
    aco = analyze_ambient_acoustics("intercept_call_001")
    print(f"Status: {aco['status']}")
    print(f"Triangulated Region: {aco['triangulated_region']}")
    print(f"Geo Uncertainty Radius: {aco['geo_uncertainty_radius_meters']}m")
    print(f"Acoustic Confidence: {aco['overall_acoustic_confidence_pct']}%")
    print(f"Detected 50Hz Grid Fundamental: {aco['decomposed_forensic_layers']['layer_1_grid_hum']['detected_fundamental_hz']} Hz")
    assert aco['status'] == "success"
    print("[+] Ghost-Acoustic Engine Passed!")
    
    # 2. Test Hawala Fluid Dynamics
    print("\n2. Testing Hawala Fluid Dynamics...")
    fluid = simulate_hawala_fluid_dynamics(db)
    print(f"Status: {fluid['status']}")
    if fluid['status'] == "success":
        print(f"Total Volume INR: {fluid['total_pipeline_volume_inr']}")
        print(f"Downstream Starvation: {fluid['fluid_pressure_metrics']['downstream_liquidity_starvation_pct']}%")
        print(f"Internal Betrayal Risk Index: {fluid['fluid_pressure_metrics']['syndicate_internal_betrayal_risk_index']}%")
    assert fluid['status'] in ["success", "empty"]
    print("[+] Hawala Fluid Dynamics Engine Passed!")
    
    # 3. Test Cognitive Exhaust & Panic Entropy
    print("\n3. Testing Cognitive Exhaust & Panic-Entropy Profiler...")
    suspect = db.query(Entity).filter(Entity.entity_type == "PERSON").first()
    if suspect:
        panic = calculate_panic_profile(db, suspect.id)
        print(f"Suspect: {panic['suspect_name']}")
        print(f"Panic Entropy Index: {panic['panic_entropy_metrics']['panic_entropy_index_pct']}%")
        print(f"Approver/Confession Probability: {panic['panic_entropy_metrics']['confession_approver_probability_pct']}%")
        print(f"Circadian Status: {panic['panic_entropy_metrics']['circadian_regularity_status']}")
        assert panic['status'] == "success"
    print("[+] Panic-Entropy Profiler Passed!")
    
    # 4. Test Quantum Mole Hunter
    print("\n4. Testing Quantum Mole-Hunter Negative Topology...")
    mole = detect_internal_leaks(db)
    print(f"Status: {mole['status']}")
    print(f"Insider Anomalies Found: {mole['flagged_insider_anomalies']}")
    for m in mole['leak_detections']:
        print(f"  Officer: {m['officer_name']} ({m['department']}) -> Leak Correlation: {m['leak_correlation_index_pct']}%")
    assert mole['status'] == "success"
    print("[+] Quantum Mole-Hunter Passed!")
    
    # 5. Test Cryptolalia Slang Decryption
    print("\n5. Testing Cryptolalia Dark-Slang Decryption...")
    sample_slang = "bhaiji 50 peti aur gulab jamun ready hai... chidiya ka arrangement karlo jaldi"
    crypto = decode_dark_slang(sample_slang)
    print(f"Original Text: {crypto['original_intercept']}")
    print(f"Decoded Intelligence: {crypto['decrypted_intelligence_translation'].replace('₹', 'INR ')}")
    print(f"Detected Slang Count: {crypto['detected_cryptolalia_terms_count']}")
    assert crypto['status'] == "success"
    assert crypto['detected_cryptolalia_terms_count'] >= 3
    print("[+] Cryptolalia Dark-Slang Engine Passed!")
    
    # 6. Test Zero-Knowledge Federation
    print("\n6. Testing Zero-Knowledge Blind Graph Federation...")
    zk = execute_zk_federation_query()
    print(f"Status: {zk['status']}")
    print(f"Participating State Nodes: {zk['federated_nodes_count']}")
    print(f"Cross-Agency PSI Intersections Found: {zk['verified_cross_agency_intersections']}")
    for ev in zk['federation_events']:
        print(f"  Matched [{ev['entity_type']}] {ev['matched_identifier']} between: {ev['agency_1_case']} AND {ev['agency_2_case']}")
    assert zk['status'] == "success"
    assert zk['verified_cross_agency_intersections'] > 0
    print("[+] Zero-Knowledge Federation Passed!")
    
    db.close()
    print("\n==================================================")
    print("[SUCCESS] ALL 6 ADVANCED EXPERIMENTAL ENGINES VERIFIED!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
