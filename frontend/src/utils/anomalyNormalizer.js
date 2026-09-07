/**
 * Normalizes legacy anomaly/threat feature names in titles and descriptions to current canonical names.
 */
const CANONICAL_MAPPINGS = [
  // Optical Plate-Cloning
  { pattern: /Impossible Transit Velocity/gi, replacement: 'Optical Plate-Cloning Paradox' },
  { pattern: /Transit Velocity/gi, replacement: 'Optical Plate-Cloning' },
  
  // Hawala Betrayal Index
  { pattern: /Hawala Smurfing/gi, replacement: 'Hawala Betrayal Index' },
  { pattern: /Hawala Fluid Dynamics/gi, replacement: 'Hawala Betrayal Index' },
  
  // Physical-Exclusive Meetings
  { pattern: /Ghost Rendezvous/gi, replacement: 'Physical-Exclusive Meeting' },
  { pattern: /Ghost Connector/gi, replacement: 'Physical-Exclusive Intermediary' },
  
  // Confession-Probability Index
  { pattern: /Panic Entropy/gi, replacement: 'Confession-Probability Index' },
  
  // Arrest Aftermath Predictor
  { pattern: /Gangwar Cascade/gi, replacement: 'Arrest Aftermath Prediction' },
  
  // Internal-Leak Analyzer
  { pattern: /Quantum Mole/gi, replacement: 'Internal-Leak Detection' },
  
  // Counter AI
  { pattern: /Moriarty Redteam/gi, replacement: 'Vulnerability Detection Counter AI' },
  
  // Criminal Dynasty
  { pattern: /Dynasty Pedigree/gi, replacement: 'Criminal Dynasty History' },
  
  // Criminal Slang
  { pattern: /Cryptolalia/gi, replacement: 'Criminal-Slang Analysis' }
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
