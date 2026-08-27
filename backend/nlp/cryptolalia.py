import re
from typing import Dict, Any, List

# Evolving Underworld Cryptolalia Lexicon Mapping
DARK_SLANG_DICTIONARY = {
    # Financial / Hawala terms
    "peti": {"meaning": "₹1 Lakh (or ₹1 Crore in high-level syndicates)", "category": "Hawala / Cash", "severity": "HIGH"},
    "khoka": {"meaning": "₹1 Crore in cash", "category": "Hawala / Cash", "severity": "CRITICAL"},
    "mithai": {"meaning": "Hawala cash payout / Bribe payment", "category": "Hawala / Bribe", "severity": "HIGH"},
    "parchi": {"meaning": "Hawala token note / Serial number verification code", "category": "Hawala Token", "severity": "HIGH"},
    "entry": {"meaning": "Bogus accounting ledger entry for money laundering", "category": "Money Laundering", "severity": "MEDIUM"},
    
    # Narcotics terms
    "gulab jamun": {"meaning": "High-grade Afghan brown sugar / Heroin pellets", "category": "Narcotics (NDPS)", "severity": "CRITICAL"},
    "safed powder": {"meaning": "Cocaine / Synthetic Mephedrone (MDMA)", "category": "Narcotics (NDPS)", "severity": "CRITICAL"},
    "saaman": {"meaning": "Contraband / Narcotics consignment", "category": "Narcotics (NDPS)", "severity": "HIGH"},
    "churan": {"meaning": "Low-grade cannabis / ganja consignment", "category": "Narcotics (NDPS)", "severity": "MEDIUM"},
    
    # Extortion / Violence terms
    "patakha": {"meaning": "Country-made firearm / Improvised explosive", "category": "Illegal Firearms", "severity": "CRITICAL"},
    "kharcha paani": {"meaning": "Extortion protection money (Hafta)", "category": "Extortion", "severity": "HIGH"},
    "supari": {"meaning": "Contract assassination hit money", "category": "Murder / Hit Contract", "severity": "CRITICAL"},
    "khatam": {"meaning": "Physical elimination / target execution", "category": "Violent Threat", "severity": "CRITICAL"},
    
    # Cyber / Identity terms
    "chidiya": {"meaning": "Forged Indian / Foreign Passport", "category": "Fake Identity", "severity": "HIGH"},
    "dabba": {"meaning": "Unregistered 64-channel SIM Box router", "category": "Cyber Routing", "severity": "HIGH"},
    "khata": {"meaning": "Rented mule bank account for phishing funds", "category": "Cyber Mule", "severity": "HIGH"}
}

def decode_dark_slang(raw_text: str) -> Dict[str, Any]:
    """
    Autonomous Dark-Slang Evolving Decryption Engine (Cryptolalia Radar).
    Detects contextual semantic shifts where everyday innocent words (mithai, gulab jamun, peti)
    are used as operational underworld code-phrases. Auto-translates intercepted texts into plain English.
    """
    if not raw_text or len(raw_text.strip()) == 0:
        return {"status": "error", "message": "Text cannot be empty"}
        
    lower_text = raw_text.lower()
    decoded_text = raw_text
    detected_terms = []
    
    for slang_term, meta in DARK_SLANG_DICTIONARY.items():
        pattern = rf'\b{re.escape(slang_term)}\b'
        if re.search(pattern, lower_text):
            detected_terms.append({
                "slang_term": slang_term,
                "decrypted_meaning": meta["meaning"],
                "category": meta["category"],
                "threat_severity": meta["severity"]
            })
            # Replace inline with highlighted translation tag
            decoded_text = re.sub(
                pattern, 
                f"[{meta['meaning'].upper()}]", 
                decoded_text, 
                flags=re.IGNORECASE
            )
            
    # Calculate Slang Encryption Density (0-100%)
    word_count = max(1, len(raw_text.split()))
    slang_density_pct = min(98.0, round((len(detected_terms) / word_count) * 250.0, 1)) if detected_terms else 0.0

    return {
        "status": "success",
        "original_intercept": raw_text,
        "decrypted_intelligence_translation": decoded_text,
        "detected_cryptolalia_terms_count": len(detected_terms),
        "slang_encryption_density_pct": slang_density_pct,
        "decrypted_lexicon_breakdown": detected_terms,
        "intelligence_alert": (
            f"HIGH-RISK UNDERWORLD CRYPTOLALIA DETECTED: Message contains {len(detected_terms)} masked criminal operational codes. "
            f"Primary categories involved: {', '.join(set(t['category'] for t in detected_terms))}."
            if detected_terms else "No coded underworld slang detected in text snippet."
        )
    }
