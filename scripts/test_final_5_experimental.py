import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.graph.dynasty_pedigree import analyze_dynasty_pedigree
from backend.graph.plate_cloning import resolve_plate_cloning_paradoxes

def run_tests():
    print("==================================================")
    print("[*] TESTING EXPERIMENTAL ENGINES")
    print("==================================================")
    
    # 1. Test Multi-Generational Dynasty Pedigree
    print("\n1. Testing Multi-Generational Crime Dynasty Pedigree...")
    dyn = analyze_dynasty_pedigree()
    print(f"Status: {dyn['status']}")
    print(f"Dynasty Tracked: {dyn['dynasty_name']} (Founded: {dyn['founding_year']})")
    print(f"Generations Tracked: {dyn['generations_tracked']}")
    print(f"Gen-3 Clean Heir Risk: {dyn['average_generation_3_succession_risk_pct']}%")
    assert dyn['status'] == "success"
    print("[+] Dynasty Pedigree Engine Passed!")
    
    # 2. Test Optical Plate-Cloning Paradox Resolver
    print("\n2. Testing Optical Plate-Cloning Paradox Resolver...")
    plate = resolve_plate_cloning_paradoxes()
    print(f"Status: {plate['status']}")
    print(f"Cloned Plate Paradoxes Exposed: {plate['cloned_plate_paradoxes_detected']}")
    for c in plate['resolved_paradox_cases']:
        print(f"  Plate: {c['cloned_plate_identifier']} -> {c['bifurcated_trajectories']['vehicle_alpha_true']['designation']} vs {c['bifurcated_trajectories']['vehicle_ghost_decoy']['designation']}")
    assert plate['status'] == "success"
    assert plate['cloned_plate_paradoxes_detected'] > 0
    print("[+] Plate Cloning Paradox Resolver Passed!")
    
    print("\n==================================================")
    print("[SUCCESS] EXPERIMENTAL MODULES VERIFIED & PASSING!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
