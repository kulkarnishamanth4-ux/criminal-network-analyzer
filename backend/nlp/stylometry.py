import re
import math
from collections import Counter
from sqlalchemy.orm import Session
from backend.database.models import Entity, FIR

# Distinct linguistic profiles for key syndicate archetypes
SUSPECT_STYLOMETRIC_BASELINES = {
    "Dawood Ibrahim": {
        "alias": "Victor / Syndicate Coordinator",
        "hinglish_markers": ["bhai", "bhaiji", "consignment", "delivery", "rajasthan", "border", "maal", "clearance", "truck", "saaman"],
        "punctuation_profile": {"ellipsis": 0.4, "exclamations": 0.1, "uppercase": 0.15},
        "cadence": "Direct, authoritative, operational, medium-length clauses",
        "sample_style": "bhaiji delivery border pe pahuch gayi hai... clearance jaldi karvao"
    },
    "Tiger Memon": {
        "alias": "Sethji / Hawala Operator",
        "hinglish_markers": ["peti", "khoka", "entry", "account", "transfer", "rtgs", "hawala", "benami", "settlement", "party", "paisa"],
        "punctuation_profile": {"ellipsis": 0.6, "exclamations": 0.05, "uppercase": 0.3},
        "cadence": "Financial code words, short cryptic confirmations, heavy use of ellipses",
        "sample_style": "account number bhej diya... party se 50 peti confirm karo... entry match honi chahiye"
    },
    "Abu Salem": {
        "alias": "Bhai / Extortion Lead",
        "hinglish_markers": ["hafta", "vasuli", "police", "khatam", "jaan", "pariwar", "dhamki", "call", "uthana", "aakhri", "warning"],
        "punctuation_profile": {"ellipsis": 0.2, "exclamations": 0.7, "uppercase": 0.5},
        "cadence": "Aggressive, high threat intensity, uppercase emphasis, multiple exclamation marks",
        "sample_style": "CALL KYUN NAHI UTHA RAHA HAI?! Aakhri baar bol raha hu... hafta nahi diya toh parivar khatam!!"
    },
    "Tariq Parveen": {
        "alias": "Hacker-D / Cyber Mule Fixer",
        "hinglish_markers": ["otp", "sim", "proxy", "bypass", "gateway", "telegram", "link", "crypto", "usdt", "wallet", "server"],
        "punctuation_profile": {"ellipsis": 0.3, "exclamations": 0.2, "uppercase": 0.2},
        "cadence": "Tech-jargon heavy, lowercase preference, wallet addresses, speed-focused",
        "sample_style": "64 channel sim box online hai... new otp bypass link ready... usdt wallet check karo bro"
    },
    "Firoz Khan": {
        "alias": "Munna / Field Logistics",
        "hinglish_markers": ["bhaiya", "gaadi", "toll", "chowk", "cash", "noida", "location", "drop", "ready", "pahuch"],
        "punctuation_profile": {"ellipsis": 0.3, "exclamations": 0.3, "uppercase": 0.1},
        "cadence": "Short tactical field updates, location milestones",
        "sample_style": "bhaiya gaadi toll cross kar gayi hai... chandni chowk pe drop ready hai"
    }
}

def extract_stylometric_features(text: str) -> dict:
    """Extracts linguistic and syntactic DNA from raw text."""
    clean_text = text.strip()
    words = re.findall(r'\b\w+\b', clean_text.lower())
    if not words:
        return {"word_count": 0, "markers_found": [], "entropy": 0.0}
        
    char_count = len(clean_text)
    avg_word_length = sum(len(w) for w in words) / len(words)
    unique_words = len(set(words))
    ttr = unique_words / len(words)  # Type-Token Ratio
    
    # Punctuation counts
    ellipsis_count = len(re.findall(r'\.{2,}', clean_text))
    exclamation_count = len(re.findall(r'!+', clean_text))
    question_count = len(re.findall(r'\?+', clean_text))
    uppercase_chars = sum(1 for c in clean_text if c.isupper())
    uppercase_ratio = uppercase_chars / max(1, char_count)
    
    # Word repetitions / elongation (e.g. bhaiii, plzzz)
    elongated_words = re.findall(r'(\w)\1{2,}', clean_text)
    
    return {
        "word_count": len(words),
        "avg_word_length": round(avg_word_length, 2),
        "vocabulary_richness_ttr": round(ttr, 2),
        "ellipsis_count": ellipsis_count,
        "exclamation_count": exclamation_count,
        "question_count": question_count,
        "uppercase_ratio": round(uppercase_ratio, 2),
        "elongated_patterns": len(elongated_words),
        "words": words
    }

def analyze_stylometry(text: str, db: Session = None) -> dict:
    """
    Shadow-Persona Stylometry Engine.
    Matches unclassified text (extortion SMS, Telegram chat, dark web post)
    to real suspect personas via Syntax DNA and lexical frequency.
    """
    if not text or len(text.strip()) < 5:
        return {"status": "error", "message": "Input text too short for stylometric analysis"}
        
    features = extract_stylometric_features(text)
    input_words_set = set(features["words"])
    
    rankings = []
    
    for suspect_name, profile in SUSPECT_STYLOMETRIC_BASELINES.items():
        score = 0.0
        matched_markers = []
        
        # 1. Lexical Marker Match
        for marker in profile["hinglish_markers"]:
            if marker in input_words_set or any(marker in w for w in features["words"]):
                matched_markers.append(marker)
                score += 25.0
                
        # 2. Punctuation Profile Match
        p_prof = profile["punctuation_profile"]
        if features["exclamation_count"] > 0 and p_prof["exclamations"] > 0.4:
            score += 20.0
        if features["ellipsis_count"] > 0 and p_prof["ellipsis"] > 0.3:
            score += 15.0
        if features["uppercase_ratio"] > 0.25 and p_prof["uppercase"] > 0.25:
            score += 15.0
            
        # Normalize confidence to 0-98%
        confidence = min(98.5, max(12.0, score))
        
        # Linguistic evidence breakdown
        evidence = []
        if matched_markers:
            evidence.append(f"Distinct dialect lexicon match: {', '.join(matched_markers[:4])}")
        if features["exclamation_count"] > 0 and p_prof["exclamations"] > 0.4:
            evidence.append("Aggressive imperative punctuation matching extortion profile")
        if features["ellipsis_count"] > 0 and p_prof["ellipsis"] > 0.3:
            evidence.append("Cryptic sentence-trailing punctuation pattern")
        if features["uppercase_ratio"] > 0.25:
            evidence.append(f"High uppercase emphasis cadence ({int(features['uppercase_ratio']*100)}%)")
        if not evidence:
            evidence.append("Baseline background syntactic congruence")
            
        rankings.append({
            "suspect_name": suspect_name,
            "alias": profile["alias"],
            "confidence_pct": round(confidence, 1),
            "matched_markers": matched_markers,
            "cadence_description": profile["cadence"],
            "evidence": evidence
        })
        
    rankings.sort(key=lambda x: x["confidence_pct"], reverse=True)
    top_match = rankings[0]
    
    return {
        "status": "success",
        "input_features": {
            "word_count": features["word_count"],
            "vocabulary_ttr": features["vocabulary_richness_ttr"],
            "uppercase_ratio": features["uppercase_ratio"],
            "punctuation_events": features["ellipsis_count"] + features["exclamation_count"] + features["question_count"]
        },
        "top_attribution": top_match["suspect_name"],
        "top_confidence": top_match["confidence_pct"],
        "suspect_rankings": rankings,
        "summary": f"Stylometric DNA attributes this communication to '{top_match['suspect_name']}' ({top_match['alias']}) with {top_match['confidence_pct']}% confidence."
    }
