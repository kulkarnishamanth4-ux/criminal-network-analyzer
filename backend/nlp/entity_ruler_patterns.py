import os

def _load_gazetteer(filename: str) -> list[str]:
    filepath = os.path.join(os.path.dirname(__file__), '..', 'data', 'gazetteers', filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        return []

def get_entity_ruler_patterns() -> list[dict]:
    """Returns a list of SpaCy EntityRuler pattern dicts."""
    patterns = []
    
    first_names = _load_gazetteer('indian_first_names.txt')
    last_names = _load_gazetteer('indian_last_names.txt')
    cities_lines = _load_gazetteer('indian_cities.txt')
    states = _load_gazetteer('indian_states.txt')
    localities = _load_gazetteer('indian_localities.txt')
    vehicles = _load_gazetteer('indian_vehicles.txt')
    
    cities = [line.split(',')[0].strip() for line in cities_lines]
    all_places = cities + localities

    # 1. VEHICLE patterns (checked first so vehicle models like Innova/Scorpio are never marked as PERSON)
    for v in vehicles:
        words = v.split()
        if len(words) == 1:
            patterns.append({"label": "VEHICLE", "pattern": [{"LOWER": words[0].lower()}]})
        else:
            patterns.append({"label": "VEHICLE", "pattern": [{"LOWER": w.lower()} for w in words]})

    # 2. GPE patterns for cities, localities, and neighborhoods (e.g. Dadar, Bandra, Saket)
    for place in all_places:
        words = place.split()
        if len(words) == 1:
            patterns.append({"label": "GPE", "pattern": [{"LOWER": words[0].lower()}]})
        else:
            pattern = [{"LOWER": w.lower()} for w in words]
            patterns.append({"label": "GPE", "pattern": pattern})
            
    # 3. GPE patterns for states
    for state in states:
        words = state.split()
        if len(words) == 1:
            patterns.append({"label": "GPE", "pattern": [{"LOWER": words[0].lower()}]})
        else:
            pattern = [{"LOWER": w.lower()} for w in words]
            patterns.append({"label": "GPE", "pattern": pattern})

    # 4. PERSON patterns
    # Match full First Name + Last Name / Word combinations first, then single first names.
    # Exclude any names that overlap with vehicle makes or place names.
    disallowed_person_names = {v.lower() for v in vehicles} | {p.lower() for p in all_places}
    for fn in first_names:
        if fn.lower() in disallowed_person_names:
            continue
        patterns.append({"label": "PERSON", "pattern": [{"LOWER": fn.lower()}, {"IS_ALPHA": True}]})
        patterns.append({"label": "PERSON", "pattern": [{"LOWER": fn.lower()}]})
            
    return patterns

def get_regex_patterns() -> dict:
    """Returns regex patterns for Indian-specific identifiers."""
    return {
        'PHONE': r'(?:\+91[\s-]?)?(?:0)?[6-9]\d{4}[\s-]?\d{5}',
        'VEHICLE': r'[A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{1,3}[\s-]?\d{4}',
        'AADHAAR': r'\d{4}[\s-]?\d{4}[\s-]?\d{4}',
        'PAN': r'[A-Z]{5}\d{4}[A-Z]',
        'ACCOUNT': r'\d{9,18}',
        'FIR_NUMBER': r'FIR[\s#]*(?:No\.?)?[\s:]*\d{1,4}[/\\-]?\d{2,4}',
    }
