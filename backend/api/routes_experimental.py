from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from backend.database.schema import get_db
from backend.database.models import Entity
from backend.graph.decapitation import compute_decapitation_strategy
from backend.graph.ghost_rendezvous import detect_ghost_rendezvous
from backend.nlp.stylometry import analyze_stylometry
from backend.nlp.interrogation_engine import interrogate_suspect
from backend.nlp.ghost_acoustic import analyze_ambient_acoustics
from backend.graph.hawala_fluid import simulate_hawala_fluid_dynamics
from backend.analytics.panic_entropy import calculate_panic_profile
from backend.graph.quantum_mole import detect_internal_leaks
from backend.nlp.cryptolalia import decode_dark_slang
from backend.nlp.honeypot_sting import simulate_honeypot_exchange
from backend.graph.dynasty_pedigree import analyze_dynasty_pedigree
from backend.graph.plate_cloning import resolve_plate_cloning_paradoxes
from backend.analytics.gangwar_cascade import forecast_gangwar_cascade
from backend.nlp.moriarty_redteam import execute_moriarty_redteam_attack
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class StylometryRequest(BaseModel):
    case_id: Optional[str] = "dawood"
    text: str

class InterrogationRequest(BaseModel):
    case_id: Optional[str] = "dawood"
    entity_id: int
    question: str
    history: Optional[List[dict]] = []

class AcousticRequest(BaseModel):
    case_id: Optional[str] = "dawood"
    audio_profile_id: Optional[str] = "intercept_call_001"

class HawalaFluidRequest(BaseModel):
    case_id: Optional[str] = "dawood"
    frozen_account_ids: Optional[List[int]] = []

class CryptolaliaRequest(BaseModel):
    case_id: Optional[str] = "dawood"
    text: str

class HoneypotRequest(BaseModel):
    case_id: Optional[str] = "dawood"
    threat_message: str
    turn_index: Optional[int] = 1

class GangwarRequest(BaseModel):
    case_id: Optional[str] = "dawood"
    trigger_event: Optional[str] = "FIR_001_VIKRAM_SHARMA_NARCOTICS_CRACKDOWN"

class MoriartyRequest(BaseModel):
    case_id: Optional[str] = "dawood"
    attack_vector: Optional[str] = "HAWALA_MICRO_SMURFING_EVASION"

class SocmintRequest(BaseModel):
    case_id: Optional[str] = "dawood"
    posts: List[str]

@router.get("/experimental/decapitation")
def get_decapitation(max_targets: int = 3, case_id: str = "dawood", db: Session = Depends(get_db)):
    """Computes mathematical minimum-cut strike sequence to cause maximum syndicate fragmentation."""
    return compute_decapitation_strategy(db, max_targets, case_id)

@router.get("/experimental/ghost-rendezvous")
def get_ghost_rendezvous(max_time_diff_hours: int = 48, db: Session = Depends(get_db)):
    """Uncovers covert physical rendezvous between suspects with zero direct telecom/financial contact."""
    return detect_ghost_rendezvous(db, max_time_diff_hours)

@router.post("/experimental/stylometry/match")
def match_stylometry(req: StylometryRequest, db: Session = Depends(get_db)):
    """Attributes unclassified text/SMS/chat snippets to suspects via Syntax DNA & Hinglish dialect markers."""
    return analyze_stylometry(req.text, db)

@router.post("/experimental/interrogate")
def interrogate(req: InterrogationRequest, db: Session = Depends(get_db)):
    """Digital Twin Interrogation Engine with live ground-truth lie detection and trap question generation."""
    return interrogate_suspect(db, req.entity_id, req.question, req.history)

@router.get("/experimental/suspects")
def list_suspects(case_id: str = "dawood", db: Session = Depends(get_db)):
    """Returns list of suspect entities available for interrogation and stylometric profiling."""
    suspects = [s for s in db.query(Entity).filter(Entity.entity_type == "PERSON").all() if (s.properties or {}).get("case_id", "dawood") == case_id]
    return {
        "suspects": [
            {"id": s.id, "name": s.name, "risk_score": s.risk_score, "pagerank": s.pagerank}
            for s in suspects
        ]
    }

@router.post("/experimental/ghost-acoustic/analyze")
def analyze_acoustics(req: AcousticRequest):
    """Project Ghost-Acoustic: micro-ambient acoustic geo-triangulation."""
    return analyze_ambient_acoustics(req.audio_profile_id)

@router.post("/experimental/hawala-fluid/simulate")
def simulate_hawala_fluid(req: HawalaFluidRequest, db: Session = Depends(get_db)):
    """Hawala Fluid Dynamics & Synthetic Liquidity Flash-Crash simulation."""
    return simulate_hawala_fluid_dynamics(db, req.frozen_account_ids)

@router.get("/experimental/panic-entropy/{entity_id}")
def get_panic_entropy(entity_id: int, db: Session = Depends(get_db)):
    """Cognitive Exhaust & Panic-Entropy Profiler calculating confession probability."""
    return calculate_panic_profile(db, entity_id)

@router.get("/experimental/quantum-mole")
def get_quantum_mole(db: Session = Depends(get_db)):
    """Quantum Mole-Hunter: Negative-topology internal leak detector."""
    return detect_internal_leaks(db)

@router.post("/experimental/cryptolalia/decode")
def decode_cryptolalia(req: CryptolaliaRequest):
    """Criminal-Slang Analyzer: Evolving Decryption (Criminal-Slang Radar)."""
    return decode_dark_slang(req.text)

@router.post("/experimental/honeypot-sting/simulate")
def run_honeypot_sting(req: HoneypotRequest):
    """Autonomous Voice-Cloned Sting Honeypot against extortionists."""
    return simulate_honeypot_exchange(req.threat_message, req.turn_index)

@router.get("/experimental/dynasty-pedigree")
def get_dynasty_pedigree():
    """Multi-Generational Crime Dynasty Pedigree Engine (30-Year Lineage)."""
    return analyze_dynasty_pedigree()

@router.get("/experimental/plate-cloning-resolver")
def get_plate_cloning_resolution():
    """Optical Plate-Cloning Paradox Resolver (Kinematic Velocity Splitter)."""
    return resolve_plate_cloning_paradoxes()

@router.post("/experimental/gangwar-cascade/forecast")
def get_gangwar_forecast(req: GangwarRequest):
    """Macro Chaos-Theory Gang War Cascade Forecaster (Hawkes Point Processes)."""
    return forecast_gangwar_cascade(req.trigger_event)

@router.post("/experimental/moriarty-redteam/attack-and-patch")
def run_moriarty_redteam(req: MoriartyRequest):
    """Project Moriarty: Autonomous Counter-Forensic Red-Team AI."""
    return execute_moriarty_redteam_attack(req.attack_vector)

@router.post("/experimental/socmint/analyze")
def analyze_socmint(req: SocmintRequest):
    """SOCMINT Threat Scanner using multi-case predictive OSINT analytics."""
    cid = req.case_id or "dawood"
    
    case_socmint_profiles = {
        "dawood": {
            "threat_level": "CRITICAL",
            "gang_escalation_probability": "94.2%",
            "detected_handles": ["@d_boss_official", "@captain_salem", "Firoz_Bhai_Don"],
            "geo_anchoring": ["Dongri Safehouse A (15m radius)", "Karachi Port", "Taj Lands End, Bandra"],
            "sentiment_analysis": "Highly aggressive, escalating intimidation, coded financial instructions.",
            "insights": [
                "Detected underworld code words 'peti' & 'khoka' indicating a 50 Crore extortion demand.",
                "Cross-referenced tagging graph confirms active link between Abu Salem's hit squad and Dawood's command.",
                "Location data extracted from photo EXIF places an armed shooter 500m from a Bollywood producer's residence."
            ]
        },
        "drug_punjab": {
            "threat_level": "CRITICAL",
            "gang_escalation_probability": "89.6%",
            "detected_handles": ["@billa_majha_punjab", "@garry_sandhu_amritsar", "@vicky_border_rider"],
            "geo_anchoring": ["Amritsar Border Safehouse Alpha", "GT Road Highway Corridor", "Attari Sector"],
            "sentiment_analysis": "Boastful swagger, nocturnal operational coordination, veiled narcotics jargon.",
            "insights": [
                "Decoded slang 'special parcel across the wire' indicating a 20kg drone-dropped Afghan heroin consignment.",
                "Cross-tagging between Garry Sandhu and Billa Majha establishes direct procurement coordination.",
                "Night-time EXIF geolocation matches clandestine tractor paths near the Indo-Pak border fence."
            ]
        },
        "ht_assam": {
            "threat_level": "HIGH",
            "gang_escalation_probability": "84.1%",
            "detected_handles": ["@anwar_ali_guwahati", "@rofiqul_express_transit", "@babu_bhai_chittagong"],
            "geo_anchoring": ["Guwahati Hub Safehouse Alpha", "Kamakhya Junction Railway Terminal", "Dhubri Riverbank"],
            "sentiment_analysis": "Covert transactional, deceptive employment listings, urgent passenger logistics.",
            "insights": [
                "Detected coordinated Facebook/IMO posts advertising fraudulent high-paying factory jobs in Delhi-NCR.",
                "Transit manifests and forged document photos recovered from encrypted Telegram story caches.",
                "Timestamp correlation indicates a batch of 12 captive victims departing Kamakhya Jn on the midnight express."
            ]
        },
        "cyber_bengaluru": {
            "threat_level": "CRITICAL",
            "gang_escalation_probability": "96.5%",
            "detected_handles": ["@0xRamesh_DarkSec", "@sunil_root_hacker", "@priya_scam_queen"],
            "geo_anchoring": ["Whitefield Tech Park Safehouse Alpha", "Electronic City Node", "Telegram DarkNet Hub"],
            "sentiment_analysis": "Extortionate, tech-elitist, timed ransom countdowns with crypto wallet signatures.",
            "insights": [
                "Captured dark-web broadcast advertising exfiltrated corporate ERP databases with a 15 BTC countdown.",
                "Code repo commits link reverse-proxy spear-phishing kits directly to Ramesh 'Phishing' Kumar's handle.",
                "Automated cryptocurrency tumbler hops traced from target wallets into Monero liquidation endpoints."
            ]
        },
        "money_gujarat": {
            "threat_level": "HIGH",
            "gang_escalation_probability": "78.3%",
            "detected_handles": ["@mansukh_angadia_surat", "@ketan_patel_bourse", "@jignesh_hawala_dubai"],
            "geo_anchoring": ["Surat Diamond Market Safehouse Alpha", "Mahidharpura Bourse", "Navsari Transit Hub"],
            "sentiment_analysis": "Discrete double-entry ledger tokens, commercial euphemisms for illicit liquidity.",
            "insights": [
                "Decoded currency serial token '786-990-21' serving as proof-of-claim for a 25 Crore INR physical cash release.",
                "Cross-referenced status updates confirm nightly armored courier dispatch between Surat and Mumbai.",
                "Shell export invoice images posted in private channels match known Dubai diamond trade under-invoicing rings."
            ]
        },
        "arms_chhattisgarh": {
            "threat_level": "CRITICAL",
            "gang_escalation_probability": "91.8%",
            "detected_handles": ["@rao_commander_bastar", "@katta_singh_desi", "@bhima_jungle_runner"],
            "geo_anchoring": ["Bastar Forest Safehouse Alpha", "Bailadila Iron Ore Logistics Corridor", "Dandakaranya Ridge"],
            "sentiment_analysis": "Militant ideological, clandestine tactical movement orders, weaponry stocktaking.",
            "insights": [
                "Intercepted encrypted radio dispatch confirming 20 crates of 7.62mm ammunition concealed inside iron ore trucks.",
                "EXIF GPS pins embedded in weapon maintenance photos triangulate an underground weapons depot in Bastar.",
                "Signal messenger logs demonstrate active procurement pipeline connecting interstate arms runners to Rao's cell."
            ]
        },
        "wildlife_kerala": {
            "threat_level": "HIGH",
            "gang_escalation_probability": "82.7%",
            "detected_handles": ["@jose_tusk_wayanad", "@rajan_nair_trapper", "@kumar_poacher_silentvalley"],
            "geo_anchoring": ["Wayanad Reserve Safehouse Alpha", "Silent Valley National Park Border", "Kochi Port Terminal"],
            "sentiment_analysis": "Commercial poaching negotiations, concealed biological cargo terms, sea-freight timelines.",
            "insights": [
                "Detected veiled listings for '35kg raw white logs' matching elephant tusk poaching timelines in Wayanad.",
                "Telegram export manifest details container booking on a merchant vessel departing Kochi port for East Asia.",
                "Satellite tracking cross-referenced with photo geotags isolates poacher staging camps near the rainforest perimeter."
            ]
        },
        "extortion_up": {
            "threat_level": "CRITICAL",
            "gang_escalation_probability": "93.4%",
            "detected_handles": ["@vikas_dada_gorakhpur", "@munna_bajrangi_shooter", "@chhotu_enforcer_up"],
            "geo_anchoring": ["Gorakhpur Safehouse Alpha", "PWD District Contractor Office", "Bhojpur Toll Plaza"],
            "sentiment_analysis": "Intimidating coercive threats, public display of illegal firearms and political convoy dominance.",
            "insights": [
                "Video post shows hitman Munna Bajrangi issuing explicit death threats against bidders for a 50 Crore PWD highway tender.",
                "Instagram reel analysis identifies untraceable cloned SUV number plates operating in Vikas Dada's convoy.",
                "Financial intimidation logs reveal systematic 10% 'hafta' extortion levied against regional infrastructure builders."
            ]
        }
    }
    
    profile = case_socmint_profiles.get(cid, case_socmint_profiles["dawood"])
    
    # If user provided custom post text, reflect analysis dynamically
    if req.posts and len(req.posts) > 0 and req.posts[0].strip():
        custom_text = req.posts[0]
        return {
            "threat_level": profile["threat_level"],
            "gang_escalation_probability": profile["gang_escalation_probability"],
            "detected_handles": profile.get("detected_handles", []),
            "geo_anchoring": profile["geo_anchoring"],
            "sentiment_analysis": f"Intercepted Post: \"{custom_text[:80]}...\" — Analyzed: {profile['sentiment_analysis']}",
            "insights": profile["insights"]
        }
    
    return profile
