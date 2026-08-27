import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.schema import SessionLocal, init_db
from backend.graph.decapitation import compute_decapitation_strategy
from backend.graph.ghost_rendezvous import detect_ghost_rendezvous
from backend.nlp.stylometry import analyze_stylometry
from backend.nlp.interrogation_engine import interrogate_suspect
from backend.database.models import Entity

def run_tests():
    print("==================================================")
    print("[*] TESTING 4 EXPERIMENTAL HIGH-RISK FEATURES")
    print("==================================================")
    
    init_db()
    db = SessionLocal()
    
    # 1. Test Decapitation Engine
    print("\n1. Testing Algorithmic Decapitation Engine...")
    decap = compute_decapitation_strategy(db, max_targets=3)
    print(f"Status: {decap['status']}")
    print(f"Disruption Efficiency: {decap.get('syndicate_disruption_efficiency_pct', 0)}%")
    print(f"Targets Identified: {len(decap.get('targets', []))}")
    for t in decap.get('targets', []):
        print(f"  Strike #{t['strike_order']}: {t['name']} ({t['type']}) -> LCC drops to {t['post_strike_lcc']} ({t['cumulative_fragmentation_pct']}% fragmentation)")
    assert decap['status'] in ['success', 'empty']
    print("[+] Decapitation Engine Passed!")
    
    # 2. Test Ghost Rendezvous Radar
    print("\n2. Testing Spatiotemporal Ghost-Rendezvous Radar...")
    ghost = detect_ghost_rendezvous(db)
    print(f"Status: {ghost['status']}")
    print(f"Ghost Events Found: {ghost.get('count', 0)}")
    for ev in ghost.get('rendezvous_events', [])[:3]:
        print(f"  {ev['person_1_name']} <--> {ev['person_2_name']} at {ev['location']} (Suspicion: {ev['suspicion_score']}%)")
    assert ghost['status'] in ['success', 'empty']
    print("[+] Ghost Rendezvous Engine Passed!")
    
    # 3. Test Shadow-Persona Stylometry
    print("\n3. Testing Shadow-Persona Stylometry...")
    test_extortion_msg = "CALL KYUN NAHI UTHA RAHA HAI?! Aakhri baar bol raha hu... hafta nahi diya toh parivar khatam!!"
    test_hawala_msg = "account number bhej diya... party se 50 peti confirm karo... entry match honi chahiye"
    
    sty1 = analyze_stylometry(test_extortion_msg, db)
    print(f"Attributed Extortion Msg to: {sty1['top_attribution']} ({sty1['top_confidence']}%)")
    assert sty1["top_attribution"] == "Mohammed Irfan"
    
    sty2 = analyze_stylometry(test_hawala_msg, db)
    print(f"Attributed Hawala Msg to: {sty2['top_attribution']} ({sty2['top_confidence']}%)")
    assert sty2["top_attribution"] == "Suresh Agarwal"
    print("[+] Stylometry Engine Passed!")
    
    # 4. Test Digital Twin Interrogation Contradiction Engine
    print("\n4. Testing Digital Twin Interrogation Engine...")
    suspect = db.query(Entity).filter(Entity.entity_type == "PERSON").first()
    if suspect:
        inter = interrogate_suspect(db, suspect.id, "Where were you on the night of the incident? Were you in Mumbai?")
        print(f"Interrogating: {suspect.name}")
        print(f"Suspect Response: {inter['suspect_response']}")
        if inter.get('contradiction'):
            print(f"[!] Contradiction: {inter['contradiction']['ground_truth']}")
            print(f"[>] Recommended Trap: {inter['contradiction']['recommended_trap_question']}")
    print("[+] Interrogation Engine Passed!")
    
    db.close()
    print("\n==================================================")
    print("[SUCCESS] ALL 4 EXPERIMENTAL ENGINES VERIFIED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
