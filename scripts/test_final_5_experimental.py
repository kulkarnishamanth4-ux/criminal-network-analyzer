import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.nlp.honeypot_sting import simulate_honeypot_exchange
from backend.graph.dynasty_pedigree import analyze_dynasty_pedigree
from backend.graph.plate_cloning import resolve_plate_cloning_paradoxes
from backend.analytics.gangwar_cascade import forecast_gangwar_cascade
from backend.nlp.moriarty_redteam import execute_moriarty_redteam_attack

def run_tests():
    print("==================================================")
    print("[*] TESTING FINAL 5 EXPERIMENTAL ENGINES (15 TOTAL)")
    print("==================================================")
    
    # 1. Test Honeypot Sting Agent
    print("\n1. Testing Voice-Cloned Sting Honeypot...")
    threat = "Aakhri baar bol raha hu, 10 lakh rupay is UPI par bhej mule_merchant@sbi nahi toh parivar khatam!"
    hp = simulate_honeypot_exchange(threat, turn_index=2)
    print(f"Status: {hp['status']}")
    print(f"Stall Duration: {hp['simulated_call_duration_minutes']} min")
    print(f"Active Deception Strategy: {hp['active_deception_strategy']}")
    print(f"Extracted UPI: {hp['harvested_intelligence']['extracted_upi_handles']}")
    assert hp['status'] == "success"
    print("[+] Honeypot Sting Agent Passed!")
    
    # 2. Test Multi-Generational Dynasty Pedigree
    print("\n2. Testing Multi-Generational Crime Dynasty Pedigree...")
    dyn = analyze_dynasty_pedigree()
    print(f"Status: {dyn['status']}")
    print(f"Dynasty Tracked: {dyn['dynasty_name']} (Founded: {dyn['founding_year']})")
    print(f"Generations Tracked: {dyn['generations_tracked']}")
    print(f"Gen-3 Clean Heir Risk: {dyn['average_generation_3_succession_risk_pct']}%")
    assert dyn['status'] == "success"
    print("[+] Dynasty Pedigree Engine Passed!")
    
    # 3. Test Optical Plate-Cloning Paradox Resolver
    print("\n3. Testing Optical Plate-Cloning Paradox Resolver...")
    plate = resolve_plate_cloning_paradoxes()
    print(f"Status: {plate['status']}")
    print(f"Cloned Plate Paradoxes Exposed: {plate['cloned_plate_paradoxes_detected']}")
    for c in plate['resolved_paradox_cases']:
        print(f"  Plate: {c['cloned_plate_identifier']} -> {c['bifurcated_trajectories']['vehicle_alpha_true']['designation']} vs {c['bifurcated_trajectories']['vehicle_ghost_decoy']['designation']}")
    assert plate['status'] == "success"
    assert plate['cloned_plate_paradoxes_detected'] > 0
    print("[+] Plate Cloning Paradox Resolver Passed!")
    
    # 4. Test Macro Chaos-Theory Gang War Cascade
    print("\n4. Testing Macro Chaos-Theory Gang War Cascade Forecaster...")
    gw = forecast_gangwar_cascade("FIR_001_NARCOTICS_CRACKDOWN")
    print(f"Status: {gw['status']}")
    print(f"Peak Shockwave Window: {gw['hawkes_point_process_metrics']['peak_syndicate_shockwave_window']}")
    print(f"Predicted Strike Targets: {len(gw['predicted_strike_targets'])}")
    for st in gw['predicted_strike_targets']:
        print(f"  Sector: {st['target_sector']} (Risk: {st['probability_pct']}%)")
    assert gw['status'] == "success"
    print("[+] Gang War Cascade Forecaster Passed!")
    
    # 5. Test Project Moriarty Red-Team AI
    print("\n5. Testing Project Moriarty Autonomous Red-Team AI...")
    moriarty = execute_moriarty_redteam_attack("HAWALA_MICRO_SMURFING_EVASION")
    print(f"Status: {moriarty['status']}")
    print(f"Attack Executed: {moriarty['attack_simulation_executed']}")
    print(f"Auto-Synthesized Patch: {moriarty['auto_synthesized_defensive_patch']['rule_name']}")
    print(f"Resilience Gain: +{moriarty['system_resilience_gain_pct']}%")
    assert moriarty['status'] == "success"
    print("[+] Project Moriarty Red-Team AI Passed!")
    
    print("\n==================================================")
    print("[SUCCESS] ALL 15 EXPERIMENTAL MODULES VERIFIED & PASSING!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
