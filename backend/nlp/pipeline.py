import spacy
from spacy.language import Language
import re
from .entity_ruler_patterns import get_entity_ruler_patterns, get_regex_patterns

# Global pipeline instance
_nlp = None

def get_nlp():
    """Lazy-load and return the SpaCy NLP pipeline with EntityRuler."""
    global _nlp
    if _nlp is None:
        # Load the base model. Note: this requires en_core_web_sm to be installed.
        _nlp = spacy.load("en_core_web_sm")
        
        # Add EntityRuler BEFORE the NER component
        ruler = _nlp.add_pipe("entity_ruler", before="ner")
        patterns = get_entity_ruler_patterns()
        ruler.add_patterns(patterns)
    return _nlp

def extract_entities_from_text(text: str) -> dict:
    """Extract entities from raw FIR text.
    
    Returns:
        {
            'persons': [{'name': 'Rajesh Kumar', 'start': 10, 'end': 22}],
            'locations': [{'name': 'Jaipur', 'start': 45, 'end': 51}],
            'phones': [{'number': '+91-98765-43210'}],
            'vehicles': [{'plate': 'MH-12-AB-1234'}],
            'organizations': [{'name': 'Sunrise Enterprises'}],
            'aadhaar_numbers': [{'number': '1234-5678-9012'}],
            'pan_numbers': [{'number': 'ABCDE1234F'}],
            'fir_numbers': [{'number': 'FIR No. 123/2024'}],
            'accounts': [{'number': '1234567890123'}]
        }
    """
    nlp = get_nlp()
    doc = nlp(text)
    
    result = {
        'persons': [],
        'locations': [],
        'phones': [],
        'vehicles': [],
        'organizations': [],
        'aadhaar_numbers': [],
        'pan_numbers': [],
        'fir_numbers': [],
        'accounts': []
    }
    
    # 1. Run SpaCy NER to get PERSON, GPE/LOC, ORG entities
    seen_entities = set()
    for ent in doc.ents:
        entity_text = ent.text.strip()
        span = (ent.start_char, ent.end_char)
        if span in seen_entities:
            continue
        seen_entities.add(span)
        
        if ent.label_ == "PERSON":
            result['persons'].append({'name': entity_text, 'start': ent.start_char, 'end': ent.end_char})
        elif ent.label_ in ["GPE", "LOC"]:
            result['locations'].append({'name': entity_text, 'start': ent.start_char, 'end': ent.end_char})
        elif ent.label_ == "ORG":
            result['organizations'].append({'name': entity_text, 'start': ent.start_char, 'end': ent.end_char})
            
    # 2. Run regex patterns
    regexes = get_regex_patterns()
    
    def extract_regex(pattern, key, result_list, name_key):
        for match in re.finditer(pattern, text):
            match_str = match.group(0).strip()
            # Basic deduplication
            if not any(item.get(name_key) == match_str for item in result_list):
                result_list.append({name_key: match_str, 'start': match.start(), 'end': match.end()})

    extract_regex(regexes['PHONE'], 'phones', result['phones'], 'number')
    extract_regex(regexes['VEHICLE'], 'vehicles', result['vehicles'], 'plate')
    extract_regex(regexes['AADHAAR'], 'aadhaar_numbers', result['aadhaar_numbers'], 'number')
    extract_regex(regexes['PAN'], 'pan_numbers', result['pan_numbers'], 'number')
    extract_regex(regexes['ACCOUNT'], 'accounts', result['accounts'], 'number')
    extract_regex(regexes['FIR_NUMBER'], 'fir_numbers', result['fir_numbers'], 'number')
    
    # Deduplicate persons/locations if any (simple)
    for key in ['persons', 'locations', 'organizations']:
        unique_items = []
        seen = set()
        for item in result[key]:
            if item['name'] not in seen:
                seen.add(item['name'])
                unique_items.append(item)
        result[key] = unique_items
        
    return result

def classify_crime(text: str) -> dict:
    """Classify the type of crime described in FIR text."""
    text_lower = text.lower()
    
    categories = {
        'Robbery/Dacoity': ['robbery', 'dacoity', 'loot', 'stolen', 'theft', 'burglary', 'snatching', 'armed robbery'],
        'Drug Trafficking': ['drugs', 'narcotics', 'heroin', 'cocaine', 'ganja', 'cannabis', 'opium', 'ndps', 'contraband', 'smuggling', 'consignment', 'substance'],
        'Money Laundering': ['hawala', 'money laundering', 'shell company', 'benami', 'layering', 'structuring', 'suspicious transaction'],
        'Extortion': ['extortion', 'threat', 'blackmail', 'ransom demand', 'threatening', 'intimidation', 'hafta', 'protection money'],
        'Kidnapping': ['kidnap', 'abduct', 'hostage', 'ransom', 'missing person', 'confinement'],
        'Murder/Attempt to Murder': ['murder', 'homicide', 'killed', 'shot dead', 'stabbed', 'attempt to murder', 'grievous hurt'],
        'Fraud/Cheating': ['fraud', 'cheating', 'forgery', 'impersonation', 'fake', 'counterfeit', 'scam', 'ponzi', 'chit fund'],
        'Cybercrime': ['hacking', 'phishing', 'online fraud', 'cyber', 'dark web', 'ransomware', 'identity theft', 'otp fraud'],
        'Arms Smuggling': ['arms', 'weapons', 'ammunition', 'illegal firearms', 'unlicensed', 'arms act', 'gun', 'pistol', 'rifle', 'explosive'],
        'Human Trafficking': ['trafficking', 'bonded labor', 'forced labor', 'prostitution', 'minor', 'child labor']
    }
    
    scores = {}
    indicators_found = {}
    
    for category, keywords in categories.items():
        score = 0
        found = []
        for kw in keywords:
            count = text_lower.count(kw)
            if count > 0:
                score += count
                found.append(kw)
        scores[category] = score
        indicators_found[category] = found
        
    best_category = max(scores.items(), key=lambda x: x[1])
    max_score = best_category[1]
    
    if max_score == 0:
        return {
            'crime_type': 'Unknown',
            'confidence': 0.0,
            'indicators': []
        }
        
    # Calculate simple confidence
    total_score = sum(scores.values())
    confidence = max_score / total_score if total_score > 0 else 0
    
    if confidence < 0.3:
        return {
            'crime_type': 'Unknown',
            'confidence': round(confidence, 2),
            'indicators': indicators_found[best_category[0]]
        }
        
    return {
        'crime_type': best_category[0],
        'confidence': round(confidence, 2),
        'indicators': indicators_found[best_category[0]]
    }
