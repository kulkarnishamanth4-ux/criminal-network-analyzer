/**
 * Normalizes legacy anomaly/threat feature names in titles and descriptions to current canonical names.
 */
const CANONICAL_MAPPINGS = [
  // Optical Plate-Cloning
  { pattern: /Impossible Transit Velocity/gi, replacement: 'Optical Plate-Cloning Paradox' },
  { pattern: /Transit Velocity/gi, replacement: 'Optical Plate-Cloning' },
  
  // Hawala Layering
  { pattern: /Hawala Betrayal Index/gi, replacement: 'Cross-Border Hawala Layering' },
  { pattern: /Hawala Smurfing/gi, replacement: 'Cross-Border Hawala Layering' },
  { pattern: /Hawala Fluid Dynamics/gi, replacement: 'Cross-Border Hawala Layering' },
  
  // Physical-Exclusive Meetings
  { pattern: /Ghost Rendezvous/gi, replacement: 'Physical-Exclusive Meeting' },
  { pattern: /Ghost Connector/gi, replacement: 'Physical-Exclusive Intermediary' },
  
  // Circadian Burst Calling
  { pattern: /Confession-Probability Index/gi, replacement: 'Circadian Burst Calling Alert' },
  { pattern: /Panic Entropy/gi, replacement: 'Circadian Burst Calling Alert' },
  
  // Conflict Escalation
  { pattern: /Gangwar Cascade/gi, replacement: 'Conflict Escalation Prediction' },
  { pattern: /Arrest Aftermath/gi, replacement: 'Conflict Escalation' },
  
  // Internal-Leak Analyzer
  { pattern: /Quantum Mole/gi, replacement: 'Internal-Leak Detection' },
  
  // Coded Intercepts
  { pattern: /Criminal-Slang Analysis/gi, replacement: 'Coded Intelligence Translation' },
  { pattern: /Cryptolalia/gi, replacement: 'Coded Intelligence' }
];

/**
 * Formats any Western-grouped currency strings (e.g. ₹1,500,000) into Indian comma notation (e.g. ₹15,00,000).
 */
export function formatIndianCurrencyString(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/₹\s*([\d,]+)(\.\d+)?(?!\s*(?:lakh|crore|cr|k|m|b)\b)/gi, (match, intPart, decPart) => {
    const raw = intPart.replace(/,/g, '');
    if (!/^\d+$/.test(raw)) return match;
    const dec = decPart || '';
    if (raw.length <= 3) return `₹${raw}${dec}`;
    const last3 = raw.slice(-3);
    let rest = raw.slice(0, -3);
    const parts = [];
    while (rest.length > 2) {
      parts.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest.length > 0) {
      parts.unshift(rest);
    }
    return `₹${parts.join(',')},${last3}${dec}`;
  });
}

export function normalizeAnomalyText(text) {
  if (!text || typeof text !== 'string') return text;
  let result = text;
  for (const { pattern, replacement } of CANONICAL_MAPPINGS) {
    result = result.replace(pattern, replacement);
  }
  return formatIndianCurrencyString(result);
}

export default normalizeAnomalyText;

