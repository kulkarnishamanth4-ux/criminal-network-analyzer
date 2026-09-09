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
  
  
  // Criminal Dynasty
  { pattern: /Dynasty Pedigree/gi, replacement: 'Criminal Dynasty History' },
  
  // Coded Intercepts
  { pattern: /Criminal-Slang Analysis/gi, replacement: 'Coded Intelligence Translation' },
  { pattern: /Cryptolalia/gi, replacement: 'Coded Intelligence' }
];

export function normalizeAnomalyText(text) {
  if (!text || typeof text !== 'string') return text;
  let result = text;
  for (const { pattern, replacement } of CANONICAL_MAPPINGS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export default normalizeAnomalyText;
