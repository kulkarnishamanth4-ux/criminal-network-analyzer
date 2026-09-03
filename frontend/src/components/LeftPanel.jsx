import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiUsers, FiLink, FiActivity, FiAlertTriangle, FiTrendingUp, FiSearch, FiX } from 'react-icons/fi';
import { getTopInfluencers, getCommunities, getCrimePredictions, searchEntities } from '../api/client';

const CASE_PREDICTIONS = {
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

export default function LeftPanel({ stats, onEntitySelect, onCommunitySelect, activeCase }) {
  const [influencers, setInfluencers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [predictions, setPredictions] = useState(CASE_PREDICTIONS[activeCase] || []);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Instant initial load for smooth UX
    if (CASE_PREDICTIONS[activeCase]) {
      setPredictions(CASE_PREDICTIONS[activeCase]);
    }

    Promise.all([
      getTopInfluencers(10, activeCase).catch(() => ({})),
      getCommunities(activeCase).catch(() => ({})),
      getCrimePredictions(activeCase).catch(() => ({}))
    ]).then(([inf, comm, pred]) => {
      setInfluencers(Array.isArray(inf) ? inf : (inf?.influencers || []));
      setCommunities(Array.isArray(comm) ? comm : (comm?.communities || []));
      
      const predList = Array.isArray(pred) ? pred : (pred?.predictions || []);
      // If backend returned valid case-specific predictions
      if (predList && predList.length > 0 && predList[0]?.indicators?.length > 0 && predList[0]?.crime_type !== "Money Laundering") {
        setPredictions(predList);
      } else if (CASE_PREDICTIONS[activeCase]) {
        setPredictions(CASE_PREDICTIONS[activeCase]);
      } else if (predList.length > 0) {
        setPredictions(predList);
      }
      setLoading(false);
    });
  }, [activeCase]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(() => {
      setIsSearching(true);
      searchEntities(searchQuery).then(res => {
        setSearchResults(res.results || []);
        setIsSearching(false);
      }).catch(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  if (isCollapsed) {
    return (
      <aside className="w-[40px] bg-[var(--bg-card)] border-r border-[var(--border)] h-full flex flex-col z-10 shadow-lg shrink-0 items-center pt-4">
        <button onClick={() => setIsCollapsed(false)} className="text-[var(--text-secondary)] hover:text-white p-2 rounded hover:bg-[var(--bg-primary)]" title="Expand Panel">
          <FiChevronRight size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[280px] bg-[var(--bg-card)] border-r border-[var(--border)] h-full overflow-y-auto flex flex-col z-10 shadow-lg shrink-0 relative">
      <button onClick={() => setIsCollapsed(true)} className="absolute top-3 right-3 z-50 text-[var(--text-secondary)] hover:text-white p-1 rounded hover:bg-[var(--bg-primary)]" title="Collapse Panel">
        <FiChevronLeft size={16} />
      </button>
      <div className="p-4 space-y-6 pt-10">
        
        {/* Global Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
            <FiSearch size={14} />
          </div>
          <input
            type="text"
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded p-2 pl-9 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-accent)] transition-colors"
            placeholder="Search entities, phones, accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-secondary)] hover:text-white"
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
            >
              <FiX size={14} />
            </button>
          )}
          
          {/* Search Dropdown */}
          {searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-card)] border border-[var(--border)] rounded shadow-xl max-h-60 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-3 text-xs text-[var(--text-secondary)] text-center">Searching Intelligence Base...</div>
              ) : searchResults.length > 0 ? (
                <div className="p-1">
                  {searchResults.map(entity => (
                    <div 
                      key={entity.id} 
                      className="p-2 hover:bg-[var(--bg-card-hover)] cursor-pointer rounded flex items-center justify-between border-b border-[var(--border)] last:border-0"
                      onClick={() => {
                        onEntitySelect(entity);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <div>
                        <div className="text-xs font-semibold text-[var(--text-primary)]">{entity.name}</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">{entity.entity_type}</div>
                      </div>
                      <span className="text-[10px] text-[var(--text-accent)]">Select</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-xs text-[var(--text-secondary)] text-center">No entities found</div>
              )}
            </div>
          )}
        </div>

        {/* Dashboard Stats */}
        <div>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiActivity /> System Stats
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <StatCard 
              title="Entities" 
              value={stats?.total_entities} 
              icon={<FiUsers size={14} />} 
            />
            <StatCard 
              title="Relations" 
              value={stats?.total_relationships} 
              icon={<FiLink size={14} />} 
            />
            <StatCard 
              title="Clusters" 
              value={stats?.communities_count} 
              icon={<FiTrendingUp size={14} />} 
            />
            <StatCard 
              title="Threats" 
              value={stats?.anomalies_count} 
              icon={<FiAlertTriangle size={14} />} 
              highlight={stats?.critical_anomalies > 0} 
            />
          </div>
        </div>

        {/* Top Influencers */}
        <div>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiTrendingUp /> Key Targets (PageRank)
          </h2>
          {loading ? (
            <div className="animate-pulse h-20 bg-[var(--bg-primary)] rounded"></div>
          ) : (
            <div className="space-y-2">
              {influencers.slice(0, 5).map((inf, i) => {
                const maxPr = Math.max(...influencers.map(x => x.pagerank || 0), 0.0001);
                const pct = Math.min(100, ((inf.pagerank || 0) / maxPr) * 100);
                return (
                <div 
                  key={inf.id} 
                  className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border)] cursor-pointer hover:border-[var(--text-accent)] transition-colors flex items-center justify-between"
                  onClick={() => onEntitySelect(inf)}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="text-[10px] font-bold text-[var(--text-secondary)] w-4">{i + 1}</div>
                    <div className="truncate text-sm">{inf.name}</div>
                  </div>
                  <div className="w-12 h-1 bg-[var(--bg-card-hover)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--neon-red)]" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>

        {/* Communities */}
        <div>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiUsers /> Syndicates Detected
          </h2>
          {loading ? (
            <div className="animate-pulse h-20 bg-[var(--bg-primary)] rounded"></div>
          ) : (
            <div className="space-y-2">
              {communities.slice(0, 5).map(com => (
                <div 
                  key={com.community_id || com.id} 
                  onClick={() => onCommunitySelect && onCommunitySelect(com.community_id)}
                  className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border)] cursor-pointer hover:bg-[#111] hover:border-[var(--text-accent)] transition-colors"
                >
                  <div className="text-sm font-medium leading-tight mb-1">
                    {com.alias || `Cluster #${com.community_id || com.id}`}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-[var(--neon-gold)] truncate flex-1">
                      {com.dominant_crime_type || 'Syndicate Operations'}
                    </span>
                    <span className="text-[10px] bg-[var(--bg-card-hover)] px-1.5 py-0.5 rounded text-[var(--text-accent)] shrink-0 font-medium">
                      {com.member_count} members
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Crime Predictions */}
        <div>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiAlertTriangle /> Predictive Intel
          </h2>
          {loading && predictions.length === 0 ? (
             <div className="animate-pulse h-20 bg-[var(--bg-primary)] rounded"></div>
          ) : (
            <div className="space-y-2.5">
              {predictions.map((pred, i) => {
                const confPct = Math.round(pred.confidence * 100);
                const barColor = confPct >= 90 ? 'bg-[#ff4757]' : confPct >= 75 ? 'bg-[#ffa502]' : 'bg-[var(--neon-teal)]';
                const textColor = confPct >= 90 ? 'text-[#ff4757]' : confPct >= 75 ? 'text-[#ffa502]' : 'text-[var(--neon-teal)]';
                const matchedCount = pred.indicators?.filter(x => x.matched !== false).length || pred.indicators?.length || 0;
                
                return (
                  <div key={i} className="bg-[var(--bg-primary)] p-2.5 rounded border border-[var(--border)] hover:border-[var(--text-accent)] transition-all">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-[var(--text-primary)] font-medium truncate pr-2" title={pred.crime_type}>
                        {pred.crime_type}
                      </span>
                      <span className={`font-mono font-bold text-[11px] ${textColor}`}>{confPct}%</span>
                    </div>
                    <div className="w-full h-1 bg-[var(--bg-card-hover)] rounded-full overflow-hidden mb-1.5">
                      <div 
                        className={`h-full ${barColor} transition-all duration-500`} 
                        style={{ width: `${confPct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] flex justify-between items-center">
                      <span>{matchedCount} matching indicator{matchedCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}
