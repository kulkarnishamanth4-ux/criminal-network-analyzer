import spacy
from spacy.language import Language
import re
import difflib
from .entity_ruler_patterns import get_entity_ruler_patterns, get_regex_patterns

_nlp = None

def get_nlp():
    global _nlp
    if _nlp is None:
        _nlp = spacy.load("en_core_web_sm")
        ruler = _nlp.add_pipe("entity_ruler", before="ner")
        ruler.add_patterns(get_entity_ruler_patterns())
    return _nlp

def fuzzy_match_entity(extracted_name: str, known_names: set, threshold=0.85) -> str:
    """Uses difflib to snap messy FIR OCR/typos to known entities."""
    if not extracted_name or not known_names:
        return extracted_name
    
    best_match = None
    highest_ratio = 0.0
    
    extracted_lower = extracted_name.lower()
    for known in known_names:
        ratio = difflib.SequenceMatcher(None, extracted_lower, known.lower()).ratio()
        if ratio > highest_ratio:
            highest_ratio = ratio
            best_match = known
            
    if highest_ratio >= threshold:
        return best_match
    return extracted_name

def extract_entities_from_text(text: str, known_entities: set = None) -> dict:
    if known_entities is None:
        known_entities = set()
        
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
    
    # 1. Custom Regex for Indian Police FIR specific formats
    # Handle aliases (urf, alias, @) and relationships (s/o, w/o, d/o, r/o)
    indian_context_regex = r'([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+(?:urf|alias|@|s/o|w/o|d/o)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)'
    for match in re.finditer(indian_context_regex, text):
        person1 = match.group(1).strip()
        person2 = match.group(2).strip()
        result['persons'].append({'name': person1, 'start': match.start(1), 'end': match.end(1), 'context': 'primary'})
        result['persons'].append({'name': person2, 'start': match.start(2), 'end': match.end(2), 'context': 'alias_or_relative'})

    # Resident of (r/o)
    ro_regex = r'(?:r/o|resident of)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)'
    for match in re.finditer(ro_regex, text):
        loc = match.group(1).strip()
        result['locations'].append({'name': loc, 'start': match.start(1), 'end': match.end(1)})

    # 2. SpaCy NER
    seen_entities = set()
    for ent in doc.ents:
        span = (ent.start_char, ent.end_char)
        if span in seen_entities:
            continue
        seen_entities.add(span)
        
        entity_text = ent.text.strip()
        if ent.label_ == "PERSON":
            result['persons'].append({'name': entity_text, 'start': ent.start_char, 'end': ent.end_char})
        elif ent.label_ in ["GPE", "LOC"]:
            result['locations'].append({'name': entity_text, 'start': ent.start_char, 'end': ent.end_char})
        elif ent.label_ == "ORG":
            result['organizations'].append({'name': entity_text, 'start': ent.start_char, 'end': ent.end_char})
            
    # 3. Standard Regex Extractors (Phones, Vehicles, etc.)
    regexes = get_regex_patterns()
    def extract_regex(pattern, key, result_list, name_key):
        for match in re.finditer(pattern, text):
            match_str = match.group(0).strip()
            if not any(item.get(name_key) == match_str for item in result_list):
                result_list.append({name_key: match_str, 'start': match.start(), 'end': match.end()})

    extract_regex(regexes['PHONE'], 'phones', result['phones'], 'number')
    extract_regex(regexes['VEHICLE'], 'vehicles', result['vehicles'], 'plate')
    extract_regex(regexes['ACCOUNT'], 'accounts', result['accounts'], 'number')
    
    # 4. Clean, Fuzzy Match, and Deduplicate
    stop_suffixes = {' and', ' or', ' the', ' of', ' in', ' at', ' to', ' from', ' with', ' by', ' for', ' on', ' is'}
    def clean_name(name: str) -> str:
        name = name.strip('.,;:!?\n\t ')
        lower = name.lower()
        for suffix in stop_suffixes:
            if lower.endswith(suffix):
                name = name[:len(name)-len(suffix)].strip()
        return name.strip()
    
    for key in ['persons', 'locations', 'organizations']:
        unique_items = []
        seen = set()
        for item in result[key]:
            cleaned = clean_name(item['name'])
            # Apply fuzzy matching to snap messy OCR/typos to known entities
            snapped = fuzzy_match_entity(cleaned, known_entities)
            if snapped and len(snapped) > 1 and snapped.lower() not in seen:
                seen.add(snapped.lower())
                item['name'] = snapped
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
        return {'crime_type': 'Unknown', 'confidence': 0.0, 'indicators': []}
        
    total_score = sum(scores.values())
    confidence = max_score / total_score if total_score > 0 else 0
    
    return {
        'crime_type': best_category[0] if confidence >= 0.3 else 'Unknown',
        'confidence': round(confidence, 2),
        'indicators': indicators_found[best_category[0]]
    }
