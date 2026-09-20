"""
Voice Command Intent Parser and Dispatcher.
Parses natural language spoken phrases into structured UI/API actions.
Zero cloud dependencies — executes completely offline.
"""

import re
from typing import Dict, Any

CASE_ALIAS_MAP = {
    "dawood": "dawood",
    "d company": "dawood",
    "syndicate": "dawood",
    "punjab": "drug_punjab",
    "drug": "drug_punjab",
    "narcotics": "drug_punjab",
    "falcon": "drug_punjab",
    "assam": "ht_assam",
    "trafficking": "ht_assam",
    "bengaluru": "cyber_bengaluru",
    "bangalore": "cyber_bengaluru",
    "cyber": "cyber_bengaluru",
    "crypto": "cyber_bengaluru",
    "gujarat": "money_gujarat",
    "surat": "money_gujarat",
    "hawala": "money_gujarat",
    "diamond": "money_gujarat",
    "chhattisgarh": "arms_chhattisgarh",
    "bastar": "arms_chhattisgarh",
    "arms": "arms_chhattisgarh",
    "kerala": "wildlife_kerala",
    "poaching": "wildlife_kerala",
    "ivory": "wildlife_kerala",
    "uttar pradesh": "extortion_up",
    "gorakhpur": "extortion_up",
    "extortion": "extortion_up",
    "new investigation": "custom_investigation",
    "custom": "custom_investigation",
}


def parse_voice_command(transcript: str, active_case: str = "dawood") -> Dict[str, Any]:
    """
    Parses a speech-to-text transcript into an actionable command.
    Returns: {
        "action": "NAVIGATE" | "SWITCH_CASE" | "SELECT_ENTITY" | "FILTER_RISK" | "RESET_CANVAS" | "QUERY_AI" | "UNKNOWN",
        "target": str,
        "spoken_reply": str,
        "payload": dict
    }
    """
    if not transcript or not transcript.strip():
        return {
            "action": "NONE",
            "spoken_reply": "No voice command received.",
            "payload": {}
        }

    raw = transcript.strip().lower()

    # 1. Navigation Commands
    if any(k in raw for k in ["open experimental", "experimental labs", "show labs", "open labs"]):
        return {
            "action": "NAVIGATE",
            "target": "experimental_labs",
            "spoken_reply": "Opening Experimental Intelligence Labs.",
            "payload": {"modal": "experimental"}
        }

    if any(k in raw for k in ["open upload", "upload data", "show upload", "import file"]):
        return {
            "action": "NAVIGATE",
            "target": "upload",
            "spoken_reply": "Opening Data Upload and Ingestion Portal.",
            "payload": {"modal": "upload"}
        }

    if any(k in raw for k in ["open blockchain", "show blockchain", "blockchain ledger", "show ledger"]):
        return {
            "action": "NAVIGATE",
            "target": "blockchain",
            "spoken_reply": "Opening Immutable Blockchain Forensic Ledger.",
            "payload": {"modal": "blockchain"}
        }

    if any(k in raw for k in ["open audit", "audit log", "show audit", "show security logs"]):
        return {
            "action": "NAVIGATE",
            "target": "audit",
            "spoken_reply": "Opening Cryptographic SIEM Audit Log.",
            "payload": {"modal": "audit"}
        }

    if any(k in raw for k in ["show map", "geospatial", "open map", "satellite view", "location map"]):
        return {
            "action": "NAVIGATE",
            "target": "map",
            "spoken_reply": "Switching to Geospatial Intel Map.",
            "payload": {"view": "map"}
        }

    if any(k in raw for k in ["show network", "graph view", "show canvas", "open graph"]):
        return {
            "action": "NAVIGATE",
            "target": "network",
            "spoken_reply": "Switching to Main Network Graph Canvas.",
            "payload": {"view": "network"}
        }

    # 2. Case Switching Commands ("Switch to Gujarat case", "Load Punjab", "Open Dawood")
    if "switch to" in raw or "load case" in raw or "open case" in raw or "change case" in raw:
        for alias, cid in CASE_ALIAS_MAP.items():
            if alias in raw:
                return {
                    "action": "SWITCH_CASE",
                    "target": cid,
                    "spoken_reply": f"Switching active investigation workspace to {alias.title()}.",
                    "payload": {"case_id": cid}
                }

    # 3. Canvas & Graph Manipulation
    if any(k in raw for k in ["reset canvas", "fit graph", "zoom out", "center graph", "reset view"]):
        return {
            "action": "RESET_CANVAS",
            "target": "canvas",
            "spoken_reply": "Resetting network graph view and centering viewport.",
            "payload": {}
        }

    if any(k in raw for k in ["filter high risk", "show critical", "highlight threats", "high risk suspects"]):
        return {
            "action": "FILTER_RISK",
            "target": "critical",
            "spoken_reply": "Filtering network to highlight critical and high-risk operatives.",
            "payload": {"risk_threshold": 0.7}
        }

    # 4. Suspect / Entity Selection ("Focus on Abu Salem", "Select Rajesh Kumar", "Inspect suspect X")
    focus_match = re.search(r'(?:focus on|inspect|select|search for|find suspect|locate)\s+([a-zA-Z0-9_\-\s]+)', raw)
    if focus_match:
        entity_name = focus_match.group(1).strip()
        # Avoid capturing command words
        if entity_name not in ["map", "labs", "upload", "audit", "canvas", "ledger"]:
            return {
                "action": "SELECT_ENTITY",
                "target": entity_name,
                "spoken_reply": f"Locating and focusing dossier on {entity_name.title()}.",
                "payload": {"entity_name": entity_name}
            }

    # 5. Fallback: Treat as a Tactical Question for the LLM Copilot
    return {
        "action": "QUERY_AI",
        "target": "copilot",
        "spoken_reply": f"Evaluating voice intelligence query: {transcript}",
        "payload": {"message": transcript, "case_id": active_case}
    }
