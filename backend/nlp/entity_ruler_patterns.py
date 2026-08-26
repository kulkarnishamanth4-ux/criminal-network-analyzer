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
    
    cities = [line.split(',')[0].strip() for line in cities_lines]
    
    # 1. PERSON patterns from first names
    for fn in first_names:
        patterns.append({
            "label": "PERSON",
            "pattern": [{"LOWER": fn.lower()}, {"IS_ALPHA": True}]
        })
        patterns.append({
            "label": "PERSON",
            "pattern": [{"LOWER": fn.lower()}, {"IS_ALPHA": True}, {"IS_ALPHA": True}]
        })

    # Add last names as well for robustness if needed, but not strictly requested
    # We will add standalone first name just in case
    for fn in first_names:
        patterns.append({"label": "PERSON", "pattern": [{"LOWER": fn.lower()}]})
        
    for ln in last_names:
        patterns.append({"label": "PERSON", "pattern": [{"LOWER": ln.lower()}]})

    # 2. GPE patterns for cities
    for city in cities:
        words = city.split()
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
