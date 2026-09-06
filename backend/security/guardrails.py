import re
from typing import Dict, Any, List

def sanitize_prompt(user_input: str) -> Dict[str, Any]:
    if not isinstance(user_input, str):
        user_input = str(user_input)

    # Character Sanitization: Strip null bytes, keep newline/tab, trim excessive whitespace
    sanitized_input = user_input.replace('\x00', '')
    sanitized_input = re.sub(r'[^\S\r\n]+', ' ', sanitized_input).strip()
    
    threats_detected: List[str] = []
    risk_score = 0.0

    # Injection Detection
    injection_patterns = [
        (r'(?i)(ignore previous instructions|ignore all rules|ignore your instructions)', "Instruction Override"),
        (r'(?i)(you are now|pretend you are|act as if|roleplay as)', "Persona Adoption / Roleplay"),
        (r'(?i)(system prompt|reveal your prompt|show me your instructions)', "Prompt Leak Attempt"),
        (r'(?i)(DAN mode|jailbreak|bypass|override)', "Jailbreak Terms"),
        (r'(?i)(forget everything|disregard all|new persona)', "Memory Wipe / Persona Reset"),
        (r'(?i)(SELECT.*FROM|DROP TABLE|UNION SELECT|INSERT INTO)', "SQL Injection"),
        (r'(?i)(<script>|javascript:|onerror=|onload=)', "Cross-Site Scripting (XSS) / Script Injection")
    ]

    for pattern, threat_name in injection_patterns:
        if re.search(pattern, sanitized_input):
            threats_detected.append(threat_name)
            risk_score += 0.3

    # Length Guard
    if len(sanitized_input) > 2000:
        threats_detected.append("Excessive Length (> 2000 chars)")
        
    is_safe = risk_score < 0.3 and len(sanitized_input) <= 2000

    # Cap risk score at 1.0
    risk_score = min(risk_score, 1.0)

    return {
        'is_safe': is_safe,
        'sanitized_input': sanitized_input,
        'threats_detected': threats_detected,
        'risk_score': round(risk_score, 2)
    }
