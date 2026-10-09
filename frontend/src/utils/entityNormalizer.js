/**
 * Normalizes entity types to prevent misclassification:
 * - Vehicle makes/models/plates -> VEHICLE
 * - Indian neighborhoods/districts/localities -> LOCATION
 */

export const VEHICLE_KEYWORDS = new Set([
  'innova', 'toyota innova', 'innova crysta', 'scorpio', 'mahindra scorpio', 'scorpio-n',
  'fortuner', 'toyota fortuner', 'bolero', 'mahindra bolero', 'swift', 'maruti swift',
  'dzire', 'swift dzire', 'i20', 'hyundai i20', 'i10', 'creta', 'hyundai creta',
  'city', 'honda city', 'silver honda city', 'pulsar', 'bajaj pulsar', 'splendor',
  'thar', 'mahindra thar', 'ertiga', 'baleno', 'wagonr', 'alto', 'safari', 'tata safari',
  'harrier', 'nexon', 'brezza', 'xuv700', 'xuv500', 'qualis', 'tavera', 'duster',
  'seltos', 'sonet', 'verna', 'amaze', 'santro', 'gypsy', 'omni', 'activa', 'bullet',
  'royal enfield', 'apache', 'jupiter', 'ktm', 'duke', 'truck', 'tractor', 'dumper',
  'tanker', 'ambulance', 'van', 'bus', 'motorcycle', 'bike', 'car', 'suv'
]);

export const LOCATION_KEYWORDS = new Set([
  'dadar', 'bandra', 'andheri', 'juhu', 'colaba', 'dharavi', 'kurla', 'borivali',
  'goregaon', 'malad', 'kandivali', 'chembur', 'ghatkopar', 'mulund', 'thane', 'vashi',
  'panvel', 'bhendi bazaar', 'dongri', 'byculla', 'worli', 'parel', 'lower parel',
  'saket', 'lajpat nagar', 'nehru place', 'connaught place', 'karol bagh', 'paharganj',
  'chandni chowk', 'rohini', 'dwarka', 'okhla', 'janakpuri', 'hauz khas', 'malviya nagar',
  'greater kailash', 'vasant kunj', 'south extension', 'defence colony', 'noida', 'gurgaon',
  'faridabad', 'ghaziabad', 'koramangala', 'indiranagar', 'whitefield', 'hsr layout',
  'jayanagar', 'hitec city', 'gachibowli', 'banjara hills', 'jubilee hills',
  'bastar', 'dandakaranya', 'wayanad', 'majha', 'dhubri', 'karimganj', 'amritsar',
  'jalandhar', 'ludhiana', 'meerut', 'muzaffarnagar', 'wagah'
]);

export function normalizeEntityType(name, originalType) {
  if (!name || typeof name !== 'string') return originalType || 'PERSON';
  const clean = name.trim().toLowerCase();

  // 1. Vehicle check
  if (VEHICLE_KEYWORDS.has(clean)) return 'VEHICLE';
  if (/^[A-Z]{2}[-\s]?\d{1,2}[-\s]?[A-Z]{1,3}[-\s]?\d{4}$/i.test(name.trim())) return 'VEHICLE';
  for (const v of VEHICLE_KEYWORDS) {
    if (v.length >= 4 && (clean === v || clean.startsWith(v + ' ') || clean.endsWith(' ' + v) || clean.includes(' ' + v + ' '))) {
      return 'VEHICLE';
    }
  }

  // 2. Location check
  if (LOCATION_KEYWORDS.has(clean)) return 'LOCATION';
  for (const loc of LOCATION_KEYWORDS) {
    if (loc.length >= 4 && (clean === loc || clean.startsWith(loc + ' ') || clean.endsWith(' ' + loc) || clean.includes(' ' + loc + ' '))) {
      return 'LOCATION';
    }
  }

  return originalType || 'PERSON';
}

export function normalizeNode(node) {
  if (!node) return node;
  const name = node.name || node.label || node.data?.name || node.data?.label || '';
  const currentType = node.type || node.entity_type || node.data?.type || node.data?.entity_type;
  const correctedType = normalizeEntityType(name, currentType);

  if (node.data) {
    return {
      ...node,
      type: correctedType,
      entity_type: correctedType,
      data: {
        ...node.data,
        type: correctedType,
        entity_type: correctedType,
      }
    };
  }

  return {
    ...node,
    type: correctedType,
    entity_type: correctedType,
  };
}
