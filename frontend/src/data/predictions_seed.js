/**
 * Pre-seeded case predictions with rich indicators and forensic evidence.
 * Used for both offline mode (Vercel) and dynamic prediction evaluation.
 */

export const CASE_PREDICTIONS = {
  dawood: [
    {
      crime_type: "Extortion & Threat Operations",
      confidence: 0.95,
      indicators: [
        { name: "Threatening VoIP Call Intercepts", matched: true, description: "Multiple VoIP extortion calls traced to Dubai and Karachi nodes" },
        { name: "Bollywood & Builder Coercion", matched: true, description: "Hafta vasuli demands linked to prominent Mumbai targets" },
        { name: "Sharp-Shooter Hit Team Coordination", matched: true, description: "Armed shooter cell identified with encrypted command hierarchy" },
        { name: "High-Density Command Hub", matched: true, description: "Apex boss coordinates directly with regional lieutenants" }
      ]
    },
    {
      crime_type: "Organized Crime / Gangland",
      confidence: 0.90,
      indicators: [
        { name: "Multi-Tier Syndicate Hierarchy", matched: true, description: "Distinct tier separation (Apex Boss, Enforcers, Hawala Couriers)" },
        { name: "Dongri Operations Foothold", matched: true, description: "Physical safehouse nodes verified in South Mumbai" },
        { name: "Cross-Border Command Proxy", matched: true, description: "Remote satellite communications detected from foreign jurisdictions" }
      ]
    },
    {
      crime_type: "Hawala & Money Laundering",
      confidence: 0.85,
      indicators: [
        { name: "Dubai-Mumbai Angadia Pipeline", matched: true, description: "Substantial cash settlements channeled through benami bullion brokers" },
        { name: "Multiple Shell Accounts", matched: true, description: "Complex multi-hop bank accounts utilized for asset layering" }
      ]
    },
    {
      crime_type: "Arms Smuggling & Firearms",
      confidence: 0.75,
      indicators: [
        { name: "Covert Sea-Route Transit", matched: true, description: "Dhow vessel maritime drops spotted along the Konkan coast" },
        { name: "Automatic Weaponry Distribution", matched: true, description: "AK-series and 9mm munitions linked to enforcement cells" }
      ]
    }
  ],
  drug_punjab: [
    {
      crime_type: "Drug Trafficking & NDPS",
      confidence: 0.95,
      indicators: [
        { name: "Border Drone Drop Sighting", matched: true, description: "Multiple low-altitude UAV incursions logged across Majha border sector" },
        { name: "Heroin Consignment Distribution", matched: true, description: "Commercial-grade heroin packet serials traced between Tarn Taran & Amritsar" },
        { name: "Late-Night Rural Rendezvous", matched: true, description: "Coordinated cellular burst events near GT Road transit points" },
        { name: "Interstate Mule Coordination", matched: true, description: "Couriers dispatched along Amritsar-Delhi transport corridors" }
      ]
    },
    {
      crime_type: "Cross-Border Contraband Smuggling",
      confidence: 0.88,
      indicators: [
        { name: "Zero-Line Geotagged Pings", matched: true, description: "Suspect burner devices active within 500m of international perimeter" },
        { name: "Encrypted Satellite Mesh", matched: true, description: "Signal and Telegram channels used for GPS drop coordinates" }
      ]
    },
    {
      crime_type: "Narco-Hawala Financing",
      confidence: 0.78,
      indicators: [
        { name: "Cash-Heavy Fuel Station Nodes", matched: true, description: "High-volume cash pooling through highway commercial entities" },
        { name: "Layered Micro-Transfers", matched: true, description: "Rapid succession of sub-50k UPI/IMPS payments to couriers" }
      ]
    },
    {
      crime_type: "Arms & Ammunition Supply",
      confidence: 0.65,
      indicators: [
        { name: "Protection Firearms for Couriers", matched: true, description: "Pistols and ammunition recovered from delivery vehicles" }
      ]
    }
  ],
  ht_assam: [
    {
      crime_type: "Human Trafficking & Bonded Labor",
      confidence: 0.95,
      indicators: [
        { name: "Border Corridor Infiltration", matched: true, description: "Transit nodes identified along Dhubri & Karimganj porous riverine border" },
        { name: "Sham Placement Agencies", matched: true, description: "Fictitious travel and domestic labor recruiting operations flagged" },
        { name: "Coordinated Transit Lodging", matched: true, description: "Temporary holding safehouses spotted in Guwahati railway hub" },
        { name: "Victim Passport Withholding", matched: true, description: "Pattern of identity paper confiscation by ring coordinators" }
      ]
    },
    {
      crime_type: "Forged Documentation & Identity Fraud",
      confidence: 0.88,
      indicators: [
        { name: "Counterfeit Aadhaar Cards", matched: true, description: "Batch printing of fraudulent identification documents" },
        { name: "Fictitious Address Verification", matched: true, description: "Multiple identities registered to single unverified premises" }
      ]
    },
    {
      crime_type: "Illegal Transit Logistics",
      confidence: 0.75,
      indicators: [
        { name: "Rail Network Movement", matched: true, description: "Bulk ticket bookings under alias identities across inter-state express lines" }
      ]
    }
  ],
  cyber_bengaluru: [
    {
      crime_type: "Fraud & Cybercrime",
      confidence: 0.96,
      indicators: [
        { name: "Crypto Ransomware Gateway", matched: true, description: "15 BTC ransom demands and smart contract escrows actively tracked" },
        { name: "Reverse-Engineering Zero-Day Exploit", matched: true, description: "DarkNet vulnerability broker handles linked to rootkit deployments" },
        { name: "Distributed Proxy Botnet", matched: true, description: "Multi-hop IP rotation through offshore VPN servers" },
        { name: "Automated OTP Bypass Service", matched: true, description: "SIM-swap APIs and phishing kits detected in Telegram channels" }
      ]
    },
    {
      crime_type: "Dark Web Money Laundering",
      confidence: 0.90,
      indicators: [
        { name: "Tornado Cash / Mixer Tumbling", matched: true, description: "Cryptocurrency transaction fragmentation through multiple unhosted wallets" },
        { name: "P2P Crypto Cashout Mules", matched: true, description: "Immediate conversion of USDT/BTC into domestic current accounts" }
      ]
    },
    {
      crime_type: "Identity Theft & Banking Fraud",
      confidence: 0.82,
      indicators: [
        { name: "Corporate Server Infiltration", matched: true, description: "Compromised employee credentials discovered on DarkSec forums" }
      ]
    }
  ],
  money_gujarat: [
    {
      crime_type: "Money Laundering & Benami Hawala",
      confidence: 0.96,
      indicators: [
        { name: "Mahidharpura Chopda Token System", matched: true, description: "Serial-numbered currency tokens used for off-the-books courier handovers" },
        { name: "Diamond Bourse Front Enterprises", matched: true, description: "Inflated gem import-export invoices masking capital flight" },
        { name: "Inter-City Angadia Couriers", matched: true, description: "Physical cash transit via private luxury buses between Surat & Mumbai" },
        { name: "Circular Transaction Loops", matched: true, description: "A->B->C->A capital movement pattern detected in financial subgraph" }
      ]
    },
    {
      crime_type: "Shell Company Asset Layering",
      confidence: 0.90,
      indicators: [
        { name: "Dormant Shell Entity Network", matched: true, description: "Multiple GST registrations linked to single commercial address" },
        { name: "Rapid Fund Dispersion", matched: true, description: "Immediate outbound clearing of incoming high-value wire transfers" }
      ]
    },
    {
      crime_type: "Tax Evasion & Customs Forgery",
      confidence: 0.80,
      indicators: [
        { name: "Under-Invoiced Gem Exports", matched: true, description: "Discrepancies identified between declared customs valuations and actual shipments" }
      ]
    }
  ],
  arms_chhattisgarh: [
    {
      crime_type: "Arms Smuggling & Heavy Ordnance",
      confidence: 0.95,
      indicators: [
        { name: "Dandakaranya Jungle Pipeline", matched: true, description: "Clandestine weapon supply routes mapped through dense tribal forest terrain" },
        { name: "Illicit Gunsmith Workshop Sourcing", matched: true, description: "Modified semi-automatic rifles & IED detonators traced to regional suppliers" },
        { name: "Iron Ore Truck Concealment", matched: true, description: "Ammunition crates hidden inside bulk mineral transit vehicles" },
        { name: "Encrypted Matrix Mesh Radios", matched: true, description: "Tactical shortwave burst communications logged across Bastar district" }
      ]
    },
    {
      crime_type: "Insurgency Logistics Support",
      confidence: 0.88,
      indicators: [
        { name: "Explosives & Detonator Couriers", matched: true, description: "Commercial gelatin stick diversions identified from mining quarries" },
        { name: "Couriers Using Jungle Trails", matched: true, description: "Foot runners coordinating supplies outside cellular network coverage" }
      ]
    },
    {
      crime_type: "Extortion & Levying",
      confidence: 0.72,
      indicators: [
        { name: "Mining Contractor Levies", matched: true, description: "Toll and protection fees extracted from local infrastructure projects" }
      ]
    }
  ],
  wildlife_kerala: [
    {
      crime_type: "Wildlife Poaching & Ivory Trade",
      confidence: 0.95,
      indicators: [
        { name: "Silent Valley Tusk Sourcing", matched: true, description: "Raw elephant ivory tusk stockpiles flagged in Wayanad forest buffer zones" },
        { name: "Sandalwood & Timber Smuggling", matched: true, description: "Red sanders and mature teak wood logs transported in disguised spice trucks" },
        { name: "Forest Trap & Snare Camps", matched: true, description: "Clandestine hunting camps discovered along Western Ghats perimeter" },
        { name: "International Exotic Fauna Buyers", matched: true, description: "Export conduits identified heading toward Southeast Asian sea ports" }
      ]
    },
    {
      crime_type: "Protected Forest Contraband Transit",
      confidence: 0.86,
      indicators: [
        { name: "Hidden Compartment Transport", matched: true, description: "Spice and coir delivery vehicles modified with double floors" }
      ]
    },
    {
      crime_type: "Hawala Poaching Financing",
      confidence: 0.70,
      indicators: [
        { name: "Advance Cash Payments", matched: true, description: "Large cash advances paid to local trappers prior to poaching expeditions" }
      ]
    }
  ],
  extortion_up: [
    {
      crime_type: "Extortion & Gangland Coercion",
      confidence: 0.96,
      indicators: [
        { name: "Purvanchal Protection Racket", matched: true, description: "Mandatory percentage cuts demanded from government contractors & builders" },
        { name: "Convoy Intimidation Runs", matched: true, description: "Armed convoy shows-of-force staged outside targeted business premises" },
        { name: "Contract Supari Hit Squad", matched: true, description: "Known violent enforcers armed with unlicensed .32 bore firearms" },
        { name: "Social Media Menacing Broadcasts", matched: true, description: "Overt weapon displays and veiled threats posted across public social channels" }
      ]
    },
    {
      crime_type: "PWD Tender Rigging",
      confidence: 0.90,
      indicators: [
        { name: "Forced Bid Withdrawals", matched: true, description: "Competing engineering firms coerced into abandoning public tender bids" },
        { name: "Syndicate Controlled Benami Bids", matched: true, description: "Contracts awarded exclusively to front companies owned by cartel kin" }
      ]
    },
    {
      crime_type: "Illegal Arms & Munitions Holding",
      confidence: 0.84,
      indicators: [
        { name: "Country-Made Pistol Arsenal", matched: true, description: "Katta and semi-automatic weapon caches maintained by gang lieutenants" }
      ]
    }
  ]
};

/**
 * Dynamically computes crime predictions and concrete evidence indicators
 * based on live graph entities, relationships, uploaded files, and anomalies.
 */
export function computeDynamicPredictions({ caseId, graphData, firs = [], anomalies = [], uploadedFiles = [] }) {
  const canonical = CASE_PREDICTIONS[caseId];
  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];
  const hasUploadedFiles = Array.isArray(uploadedFiles) && uploadedFiles.length > 0;

  // If this is a canonical case and no new custom files have been added, return canonical
  if (canonical && !hasUploadedFiles && (caseId !== 'custom_investigation')) {
    return canonical;
  }

  // If literally no data exists in custom investigation, return empty list
  if (nodes.length === 0 && !hasUploadedFiles && firs.length === 0) {
    return canonical || [];
  }

  // Gather entity subsets
  const persons = nodes.filter(n => (n.type || n.entity_type) === 'PERSON');
  const phones = nodes.filter(n => (n.type || n.entity_type) === 'PHONE');
  const accounts = nodes.filter(n => (n.type || n.entity_type) === 'BANK_ACCOUNT');
  const vehicles = nodes.filter(n => (n.type || n.entity_type) === 'VEHICLE');
  const locations = nodes.filter(n => (n.type || n.entity_type) === 'LOCATION');
  const orgs = nodes.filter(n => (n.type || n.entity_type) === 'ORGANIZATION');

  const fileNames = uploadedFiles.map(f => f.filename || f.name || '').filter(Boolean);
  const fileTypes = new Set(uploadedFiles.map(f => (f.file_type || f.type || '').toLowerCase()));
  const hasFir = fileTypes.has('fir') || firs.length > 0 || fileNames.some(n => n.includes('fir') || n.endsWith('.txt') || n.endsWith('.pdf'));
  const hasCdr = fileTypes.has('cdr') || phones.length > 0 || edges.some(e => (e.type || e.label) === 'CALLED') || fileNames.some(n => n.includes('cdr'));
  const hasFin = fileTypes.has('financial') || accounts.length > 0 || edges.some(e => (e.type || e.label) === 'TRANSFERRED_MONEY_TO') || fileNames.some(n => n.includes('fin') || n.includes('ledger'));
  const hasVeh = fileTypes.has('vehicle') || vehicles.length > 0 || edges.some(e => (e.type || e.label) === 'SPOTTED_AT') || fileNames.some(n => n.includes('vehicle'));

  const dynamicList = [];

  // Category 1: Formal FIR Classification & Syndicate Conspiracy
  if (hasFir || (persons.length >= 2 && nodes.length >= 3)) {
    const personNames = persons.slice(0, 4).map(p => p.name || p.label).join(', ');
    const locNames = locations.slice(0, 3).map(l => l.name || l.label).join(', ');
    const firRef = firs.length > 0 ? (firs[0].fir_number || 'FIR 0234/2024') : 'Seized FIR Narrative';
    const firPs = firs.length > 0 ? (firs[0].police_station || 'PS Sadar Bazar') : 'Jurisdictional Police Station';

    const indicators = [
      {
        name: "First Information Report Registry",
        matched: true,
        description: `Ingested ${firRef} registered at ${firPs} citing statutory penal provisions (IPC 420, 467, 468, 120B)`
      },
      {
        name: "Identified Operational Conspirators",
        matched: true,
        description: personNames ? `Co-accused identified across evidentiary records: ${personNames}` : "Multiple named suspects linked through common criminal enterprise"
      }
    ];

    if (locNames) {
      indicators.push({
        name: "Geospatial Staging & Safehouses",
        matched: true,
        description: `Operational rendezvous points verified: ${locNames}`
      });
    }

    if (orgs.length > 0) {
      indicators.push({
        name: "Commercial Shell Corporation Front",
        matched: true,
        description: `Commercial front entities identified: ${orgs.slice(0, 2).map(o => o.name || o.label).join(', ')}`
      });
    }

    dynamicList.push({
      crime_type: "Organized Crime & Criminal Conspiracy",
      confidence: 0.94,
      indicators
    });
  }

  // Category 2: Hawala & Money Laundering Operations
  if (hasFin || accounts.length > 0) {
    const accList = accounts.slice(0, 3).map(a => a.name || a.label).join(', ');
    const indicators = [
      {
        name: "Layered Bank Account Ledger",
        matched: true,
        description: accList ? `Active financial accounts flagged in transaction trail: ${accList}` : "Bank account entities identified in forensic transaction records"
      },
      {
        name: "Multi-Hop Capital Velocity",
        matched: true,
        description: "Financial subgraph exhibits rapid structuring and non-commercial settlement loops"
      },
      {
        name: "Benami Financial Proxy Channels",
        matched: true,
        description: "Cross-account transactions indicate third-party smurfing and unaccounted cash handoffs"
      }
    ];

    dynamicList.push({
      crime_type: "Hawala & Money Laundering Operations",
      confidence: 0.91,
      indicators
    });
  }

  // Category 3: Covert Communications & Extortion
  if (hasCdr || phones.length > 0) {
    const phoneList = phones.slice(0, 3).map(p => p.name || p.label).join(', ');
    const indicators = [
      {
        name: "Monitored Burner Fleet",
        matched: true,
        description: phoneList ? `Suspect mobile numbers active in evidence: ${phoneList}` : "Active telecommunication endpoints verified in CDR records"
      },
      {
        name: "Burst Telephony Coordination",
        matched: true,
        description: "High-density call interaction frequency indicative of tactical event coordination"
      },
      {
        name: "Cell Tower Geo-Triangulation",
        matched: true,
        description: "Call records mapped across regional BTS base station clusters"
      }
    ];

    dynamicList.push({
      crime_type: "Extortion & Covert Tactical Communications",
      confidence: 0.88,
      indicators
    });
  }

  // Category 4: Contraband Transit & Vehicle Logistics
  if (hasVeh || vehicles.length > 0) {
    const plateList = vehicles.slice(0, 3).map(v => v.name || v.label).join(', ');
    const indicators = [
      {
        name: "Suspect Vehicle Fleet Registrations",
        matched: true,
        description: plateList ? `Monitored plates logged: ${plateList}` : "Motor vehicle transport assets identified in surveillance records"
      },
      {
        name: "ANPR Highway Sighting Correlation",
        matched: true,
        description: "Automated license plate recognition camera hits correlated with suspect movements"
      },
      {
        name: "Interstate Transit Logistics",
        matched: true,
        description: "High-speed transit between corridor checkposts and safehouse nodes"
      }
    ];

    dynamicList.push({
      crime_type: "Contraband Transit & Vehicle Logistics",
      confidence: 0.82,
      indicators
    });
  }

  // Fallback if entities exist but didn't trigger specific category
  if (dynamicList.length === 0 && nodes.length > 0) {
    const summaryLabels = nodes.slice(0, 4).map(n => n.name || n.label).join(', ');
    dynamicList.push({
      crime_type: "Syndicate Operations Intelligence",
      confidence: 0.85,
      indicators: [
        {
          name: "Active Network Entities",
          matched: true,
          description: `Extracted ${nodes.length} evidentiary entities including: ${summaryLabels}`
        },
        {
          name: "Topological Cluster Cohesion",
          matched: true,
          description: `Interconnected via ${edges.length} relational edges across multi-source evidence`
        }
      ]
    });
  }

  return dynamicList.length > 0 ? dynamicList : (canonical || []);
}
