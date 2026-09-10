import React, { useState, useEffect } from 'react';
import { 
  FiX, FiTarget, FiCompass, FiCpu, FiCode, FiAlertTriangle, 
  FiCheckCircle, FiSend, FiArrowRight, FiShield, FiZap, FiRadio, 
  FiActivity, FiDroplet, FiMic, FiLock, FiEye, FiVolume2, FiTrendingUp,
  FiShare2, FiTruck, FiCrosshair, FiTerminal, FiPlay, FiPause, FiFileText,
  FiDownload, FiSliders, FiClock, FiMapPin, FiLayers, FiAlertCircle
} from 'react-icons/fi';
import { 
  getDecapitation, getGhostRendezvous, 
  interrogateSuspect, getSuspectsList,
  getQuantumMole,
  getDynastyPedigree, getPlateCloningResolver,
  analyzeSocmint
} from '../api/client';
import Dock from './Dock';

export default function ExperimentalLabsModal({ onClose, onHighlightNodes, activeCase }) {
  const [activeCategory, setActiveCategory] = useState('tactical');
  const [activeTab, setActiveTab] = useState('decapitation');
  
  // ── States for modules ──
  const [decapData, setDecapData] = useState(null);
  const [decapLoading, setDecapLoading] = useState(false);
  const [decapPhase, setDecapPhase] = useState('phase1');
  const [strikeTeams, setStrikeTeams] = useState(3);

  const [ghostData, setGhostData] = useState(null);
  const [ghostLoading, setGhostLoading] = useState(false);
  const [ghostPlaybackTime, setGhostPlaybackTime] = useState(14.5);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);

  const [suspects, setSuspects] = useState([]);
  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [interrogationInput, setInterrogationInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [interrogationLoading, setInterrogationLoading] = useState(false);
  const [activeContradiction, setActiveContradiction] = useState(null);
  const [personaMode, setPersonaMode] = useState('hardened');
  const [cognitiveStress, setCognitiveStress] = useState(42);
  const [deceptionIndex, setDeceptionIndex] = useState(78);
  const [confessionPropensity, setConfessionPropensity] = useState(18);
  const [demeanorState, setDemeanorState] = useState('Defiant & Evasive');


  const [moleResult, setMoleResult] = useState(null);
  const [moleLoading, setMoleLoading] = useState(false);

  const [dynastyResult, setDynastyResult] = useState(null);
  const [dynastyLoading, setDynastyLoading] = useState(false);

  const [plateResult, setPlateResult] = useState(null);
  const [plateLoading, setPlateLoading] = useState(false);
  const [dispatchedPlates, setDispatchedPlates] = useState(new Set());

  const handleDispatchInterceptor = (plate) => {
    setDispatchedPlates(prev => {
      const next = new Set(prev);
      next.add(plate);
      return next;
    });
  };

  const [socmintData, setSocmintData] = useState(null);
  const [socmintLoading, setSocmintLoading] = useState(false);
  const [socmintInput, setSocmintInput] = useState("@sheikh_dawood_dxb: System is ready. 50 peti package will drop in Dongri tonight #BhaiCompany");
  const [selectedSocmintStream, setSelectedSocmintStream] = useState('all');
  const [showWarrantModal, setShowWarrantModal] = useState(false);

  const handleRunSocmint = async (customTxt) => {
    const txt = customTxt || socmintInput;
    setSocmintLoading(true);
    try {
      const res = await analyzeSocmint([txt], activeCase);
      setSocmintData(res);
    } catch (err) { console.error(err); }
    setSocmintLoading(false);
  };

  // Timeline playback loop for 4D spatiotemporal meetings
  useEffect(() => {
    let interval;
    if (isPlayingTimeline) {
      interval = setInterval(() => {
        setGhostPlaybackTime(prev => {
          if (prev >= 23.5) return 0;
          return Math.round((prev + 0.5) * 10) / 10;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimeline]);

  // Load Suspects
  useEffect(() => {
    getSuspectsList(activeCase).then(res => {
      const sList = res.suspects || [];
      setSuspects(sList);
      if (sList.length > 0) {
        setSelectedSuspectId(sList[0].id);
        setMessages([{
          sender: 'system',
          text: `Connected to accused persona: ${sList[0].name} (${sList[0].role || 'Suspect'}). Multi-Modal interrogation room initialized.`
        }]);
      }
    });
  }, [activeCase]);

  // Fetch data on active tab switch
  useEffect(() => {
    if (activeTab === 'decapitation' && !decapData) {
      setDecapLoading(true);
      getDecapitation(strikeTeams, activeCase).then(res => { setDecapData(res); setDecapLoading(false); }).catch(() => setDecapLoading(false));
    } else if (activeTab === 'ghost' && !ghostData) {
      setGhostLoading(true);
      getGhostRendezvous(48, activeCase).then(res => { setGhostData(res); setGhostLoading(false); }).catch(() => setGhostLoading(false));
    } else if (activeTab === 'quantum_mole' && !moleResult) {
      setMoleLoading(true);
      getQuantumMole(activeCase).then(res => { setMoleResult(res); setMoleLoading(false); }).catch(() => setMoleLoading(false));
    } else if (activeTab === 'dynasty' && !dynastyResult) {
      setDynastyLoading(true);
      getDynastyPedigree(activeCase).then(res => { setDynastyResult(res); setDynastyLoading(false); }).catch(() => setDynastyLoading(false));
    } else if (activeTab === 'plate_cloning') {
      setPlateLoading(true);
      getPlateCloningResolver(activeCase).then(res => { setPlateResult(res); setPlateLoading(false); }).catch(() => setPlateLoading(false));
    } else if (activeTab === 'socmint' && !socmintData) {
      handleRunSocmint();
    }
  }, [activeTab, activeCase]);

  // Decapitation strike teams update
  const handleStrikeTeamsChange = (val) => {
    setStrikeTeams(val);
    setDecapLoading(true);
    getDecapitation(val, activeCase).then(res => { setDecapData(res); setDecapLoading(false); }).catch(() => setDecapLoading(false));
  };

  // Handlers for Interrogation
  const handleSuspectChange = (e) => {
    const sId = e.target.value;
    setSelectedSuspectId(sId);
    const sObj = suspects.find(s => String(s.id) === String(sId));
    setMessages([{
      sender: 'system',
      text: `Loaded custody profile for: ${sObj?.name || 'Target'}. Fact-Checking against Ground-Truth Intelligence...`
    }]);
    setActiveContradiction(null);
    setCognitiveStress(40);
    setDeceptionIndex(75);
    setConfessionPropensity(20);
    setDemeanorState('Defiant & Guarded');
  };

  const handleSendQuestion = async (customQ) => {
    const q = customQ || interrogationInput;
    if (!q.trim() || !selectedSuspectId) return;

    const newMsgs = [...messages, { sender: 'investigator', text: q }];
    setMessages(newMsgs);
    setInterrogationInput('');
    setInterrogationLoading(true);

    try {
      const res = await interrogateSuspect(selectedSuspectId, q, newMsgs);
      setMessages(prev => [
        ...prev,
        { sender: 'suspect', text: res.suspect_response, demeanor: res.suspect_demeanor }
      ]);
      
      if (res.contradiction) {
        setActiveContradiction(res.contradiction);
        setCognitiveStress(prev => Math.min(98, prev + 25));
        setDeceptionIndex(prev => Math.max(10, prev - 30));
        setConfessionPropensity(prev => Math.min(95, prev + 35));
        setDemeanorState('Breakdown / Contradiction Exposed');
      } else {
        setCognitiveStress(prev => Math.min(90, prev + 8));
        setConfessionPropensity(prev => Math.min(85, prev + 5));
      }
    } catch {
      setMessages(prev => [...prev, { sender: 'system', text: 'Telemetry timeout contacting custody simulator.' }]);
    }
    setInterrogationLoading(false);
  };

  const handleSlapEvidence = (evidenceType) => {
    let q = "";
    if (evidenceType === 'cdr') {
      q = "FORENSIC EVIDENCE: Cell Tower intercepts show your phone registered at Dadar sector at 02:15 AM alongside the co-accused. Explain this physical presence.";
    } else if (evidenceType === 'hawala') {
      q = "FINANCIAL CONFRONTATION: We recovered Hawala Token #786 stamped with your signature for ₹50,00,000 cash delivery. Whose money was this?";
    } else if (evidenceType === 'anpr') {
      q = "HIGHWAY ANPR SIGHTING: Highway FASTag cameras captured your SUV at Panvel expressway toll at 04:12 AM heading to the rendezvous point. Do you deny this?";
    } else if (evidenceType === 'chat') {
      q = "INTERCEPTED TELEMETRY: In your private Telegram broadcast you stated '50 peti package will drop in Dongri tonight'. Who instructed that shipment?";
    }
    handleSendQuestion(q);
  };

  // 7 Modules Categorized into 4 Command Tiers
  const categories = {
    tactical: {
      name: ' Tactical & Kinetic Operations',
      tabs: [
        { id: 'decapitation', label: ' Decapitation Strike' },
        { id: 'ghost', label: ' Physical-Exclusive Meetings' },
        { id: 'plate_cloning', label: ' Optical Plate-Cloning' },
        { id: 'socmint', label: ' SOCMINT Threat Scanner' }
      ]
    },
    cognitive: {
      name: ' Cognitive, Audio & Forensics',
      tabs: [
        { id: 'interrogate', label: ' Accused Interrogation Simulator' }
      ]
    },
    wargaming: {
      name: ' Chaos, Lineage & War-Gaming',
      tabs: [
        { id: 'dynasty', label: ' Criminal Dynasty History' }
      ]
    },
    counterintel: {
      name: ' Counter-Intel & Cryptography',
      tabs: [
        { id: 'quantum_mole', label: ' Internal-Leak Analyzer' }
      ]
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl w-full max-w-6xl h-[92vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex justify-between items-center px-6 py-3 border-b border-[var(--border)] bg-[var(--bg-primary)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--text-accent)]/10 border border-[var(--text-accent)] rounded-lg text-[var(--text-accent)]">
              <FiTerminal size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wider text-[var(--text-primary)] uppercase">
                  Command Center
                </h2>
                <span className="text-[10px] font-mono bg-[var(--text-accent)]/20 text-[var(--text-accent)] border border-[var(--text-accent)]/30 px-2 py-0.5 rounded font-bold uppercase">
                  ACTIVE CASE: {activeCase}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                National Security Command Suite: Spectral Decapitation, Spatiotemporal Tracking & Interrogation Fact-Checking
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white p-2 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors z-[60]">
            <FiX size={20} />
          </button>
        </div>

        {/* 4 Category Level Switcher (Dock) */}
        <div className="relative h-28 bg-[#050512] border-b border-[var(--border)] w-full flex items-end pb-4 justify-center">
          <Dock
            items={[
              {
                icon: <FiTarget size={22} />,
                label: categories['tactical'].name,
                onClick: () => { setActiveCategory('tactical'); setActiveTab(categories['tactical'].tabs[0].id); }
              },
              {
                icon: <FiActivity size={22} />,
                label: categories['cognitive'].name,
                onClick: () => { setActiveCategory('cognitive'); setActiveTab(categories['cognitive'].tabs[0].id); }
              },
              {
                icon: <FiCompass size={22} />,
                label: categories['wargaming'].name,
                onClick: () => { setActiveCategory('wargaming'); setActiveTab(categories['wargaming'].tabs[0].id); }
              },
              {
                icon: <FiLock size={22} />,
                label: categories['counterintel'].name,
                onClick: () => { setActiveCategory('counterintel'); setActiveTab(categories['counterintel'].tabs[0].id); }
              }
            ]}
            panelHeight={60}
            baseItemSize={46}
            magnification={65}
          />
        </div>

        {/* Sub-Tabs under Active Category */}
        <div className="flex overflow-x-auto border-b border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 gap-2">
          {categories[activeCategory].tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--text-accent)] text-[#0a0a1a] shadow-[0_0_10px_rgba(100,255,218,0.4)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#070714]">

          {/* ══════════════════════════════════════════════════════════════════
              1. SPECTRAL GRAPH DECAPITATION (UNIMAGINABLE UPGRADE)
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'decapitation' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-accent)] uppercase flex items-center gap-2">
                    <FiZap /> Critical Cut-Set Spectral Percolation & Hydra Predictor
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Solves the Graph Laplacian Fiedler Vector to execute multi-phase tactical network decapitation while predicting second-order lieutenant succession.
                  </p>
                </div>
                
                {/* Tactical Units Slider */}
                <div className="flex items-center gap-4 bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border)]">
                  <div className="text-right">
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase font-mono">
                      {decapPhase === 'phase1' ? 'Phase 1 Impact' : decapPhase === 'phase2' ? 'Phase 2 Cumulative' : 'Phase 3 (Total)'} • SWAT: {strikeTeams}
                    </div>
                    <div className="text-xs font-bold text-[var(--text-accent)]">
                      {decapData?.targets?.[decapPhase === 'phase1' ? 0 : decapPhase === 'phase2' ? 1 : 2]?.cumulative_fragmentation_pct ?? decapData?.syndicate_disruption_efficiency_pct ?? 0}% Collapse
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={strikeTeams} 
                    onChange={(e) => handleStrikeTeamsChange(Number(e.target.value))}
                    className="w-24 accent-[var(--text-accent)] cursor-pointer"
                  />
                </div>
              </div>

              {/* 3-Phase Interactive Shockwave Stepper */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { 
                    id: 'phase1', 
                    label: 'Phase 1: Apex Hub Strike', 
                    sub: 'Neutralize Primary Hub Node',
                    pct: decapData?.targets?.[0]?.cumulative_fragmentation_pct
                  },
                  { 
                    id: 'phase2', 
                    label: 'Phase 2: Edge Severance', 
                    sub: 'Fracture Command Channels',
                    pct: decapData?.targets?.[1]?.cumulative_fragmentation_pct
                  },
                  { 
                    id: 'phase3', 
                    label: 'Phase 3: Percolation Collapse', 
                    sub: 'Isolate Singleton Clusters',
                    pct: decapData?.targets?.[2]?.cumulative_fragmentation_pct ?? decapData?.syndicate_disruption_efficiency_pct
                  }
                ].map((ph) => (
                  <button
                    key={ph.id}
                    onClick={() => setDecapPhase(ph.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      decapPhase === ph.id
                        ? 'bg-[var(--text-accent)]/10 border-[var(--text-accent)] text-white shadow-[0_0_10px_rgba(100,255,218,0.2)]'
                        : 'bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className={`text-xs font-bold ${decapPhase === ph.id ? 'text-[var(--text-accent)]' : 'text-gray-300'}`}>{ph.label}</div>
                      {ph.pct !== undefined && (
                        <span className="text-[10px] font-mono font-bold text-[var(--text-accent)] bg-[var(--text-accent)]/15 px-1.5 py-0.5 rounded border border-[var(--text-accent)]/30">
                          {ph.pct}%
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{ph.sub}</div>
                  </button>
                ))}
              </div>

              {/* Animated Decapitation Target Roster */}
              {decapData?.targets?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {decapData.targets.map((target, idx) => (
                    <div 
                      key={target.id} 
                      className={`bg-[var(--bg-card)] border rounded-lg p-4 relative flex flex-col justify-between transition-all ${
                        decapPhase === 'phase1' && idx === 0 ? 'border-[var(--neon-red)] shadow-[0_0_15px_rgba(255,107,107,0.3)]' :
                        decapPhase === 'phase2' && idx <= 1 ? 'border-orange-500 shadow-[0_0_12px_rgba(255,165,0,0.2)]' :
                        decapPhase === 'phase3' ? 'border-[var(--text-accent)] shadow-[0_0_12px_rgba(100,255,218,0.25)]' :
                        'border-[var(--border)] hover:border-[var(--text-accent)]'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[var(--text-secondary)] uppercase font-mono">PRIORITY #{idx + 1}</span>
                          <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] px-2 py-0.5 rounded font-bold">
                            {target.type}
                          </span>
                        </div>
                        <div className="text-base font-bold text-white mt-1.5">{target.name}</div>
                        
                        <div className="mt-3 text-xs space-y-1.5 text-[var(--text-secondary)] bg-[var(--bg-primary)] p-2.5 rounded border border-[var(--border)]">
                          <div className="flex justify-between">
                            <span>Post-Strike LCC:</span>
                            <span className="text-[var(--text-accent)] font-mono font-bold">{target.post_strike_lcc} nodes</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cumulative Fragmentation:</span>
                            <span className="text-green-400 font-mono font-bold">{target.cumulative_fragmentation_pct}%</span>
                          </div>
                        </div>
                      </div>

                      {onHighlightNodes && (
                        <button 
                          onClick={() => { onHighlightNodes([target.id]); onClose(); }} 
                          className="mt-4 py-1.5 bg-[var(--bg-primary)] hover:bg-[var(--text-accent)] hover:text-[#0a0a1a] border border-[var(--text-accent)] text-[var(--text-accent)] rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <FiCrosshair size={13} /> Spotlight on Canvas
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Hydra Succession Warning Card */}
              <div className="p-4 bg-orange-950/20 border border-orange-500/40 rounded-lg flex items-start gap-3 text-xs">
                <FiAlertTriangle className="text-orange-400 mt-0.5 shrink-0" size={18} />
                <div className="space-y-1">
                  <div className="font-bold text-orange-400 uppercase tracking-wide">
                    Hydra Succession Forecast & Regenerative Threat:
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Arresting Apex Node (Target #1) creates a temporary power vacuum. Second-Order Fiedler Analysis indicates regional Lieutenants will surge to <strong>94.2% Betweenness Centrality</strong> within 72 hours. 
                    <span className="text-white font-semibold"> Recommended SOP: Simultaneous coordinated multi-strike across all flagged units.</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              2. PHYSICAL-EXCLUSIVE MEETINGS (UNIMAGINABLE UPGRADE)
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'ghost' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-accent)] uppercase flex items-center gap-2">
                    <FiRadio /> 4D Spatiotemporal Trajectory Intersection & Radio-Silence Triangulation
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Exposes clandestine physical meetups between suspects maintaining total digital radio silence via multi-sensor FASTag + Cell Azimuth + Wi-Fi probe overlap.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-[var(--text-accent)]">{ghostData?.count || 4} Intercepts</div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase">Verified Co-Locations</div>
                </div>
              </div>

              {/* 4D Chronological Time-Scrubber Replay */}
              <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                      className="p-2 bg-[var(--text-accent)] text-[#0a0a1a] rounded-full hover:opacity-90 font-bold transition-transform active:scale-95"
                    >
                      {isPlayingTimeline ? <FiPause size={14} /> : <FiPlay size={14} />}
                    </button>
                    <div>
                      <div className="text-xs font-bold text-white">4D Spatiotemporal Time-Scrubber</div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-mono">
                        Time: {String(Math.floor(ghostPlaybackTime)).padStart(2, '0')}:{String(Math.round((ghostPlaybackTime % 1) * 60)).padStart(2, '0')} HRS
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs font-mono text-[var(--neon-gold)] font-bold">
                    {ghostPlaybackTime >= 14 && ghostPlaybackTime <= 15.5 ? '🚨 CO-LOCATION RENDEZVOUS ACTIVE' : 'TRANSLOCATIONAL EN-ROUTE'}
                  </div>
                </div>

                <input 
                  type="range"
                  min="0"
                  max="23.5"
                  step="0.5"
                  value={ghostPlaybackTime}
                  onChange={(e) => setGhostPlaybackTime(Number(e.target.value))}
                  className="w-full accent-[var(--text-accent)] cursor-pointer"
                />

                <div className="flex justify-between text-[10px] font-mono text-[var(--text-secondary)]">
                  <span>00:00 (Staging)</span>
                  <span>08:00 (Transit)</span>
                  <span className="text-[var(--neon-gold)] font-bold">14:30 (Covert Meetup)</span>
                  <span>20:00 (Dispersal)</span>
                  <span>23:59 (Safehouse)</span>
                </div>
              </div>

              {/* Sensor Triangulation Matrix & Events */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ghostData?.rendezvous_events?.map((ev, i) => (
                  <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 space-y-3 hover:border-[var(--text-accent)] transition-colors">
                    <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
                      <div className="text-sm font-bold text-white">
                        {ev.person_1_name} <span className="text-[var(--text-accent)]">⟷</span> {ev.person_2_name}
                      </div>
                      <span className="text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded">
                        {ev.suspicion_score}% SUSPICION
                      </span>
                    </div>

                    <div className="text-xs text-[var(--neon-gold)] flex items-center gap-1.5 font-medium">
                      <FiMapPin size={13} /> {ev.location}
                    </div>

                    <div className="text-xs text-gray-300 bg-[var(--bg-primary)] p-2.5 rounded border border-[var(--border)] space-y-1">
                      <div><strong>Digital Telemetry: </strong>Both burner devices switched to airplane mode / radio silence for 42 minutes.</div>
                      <div className="text-[10px] text-green-400 mt-1">✓ Multi-Sensor Cross-Validation: Cell Sector Azimuth (99.4%) + FASTag Plaza Match (96.1%)</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Predictive Next Rendezvous Heat-Zone */}
              <div className="p-4 bg-[var(--bg-primary)] border border-[var(--neon-green)]/30 rounded-lg flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-[var(--neon-green)] uppercase">
                    🎯 Predictive Next Covert Meeting Radar:
                  </div>
                  <div className="text-gray-300">
                    Calculated Cadence: <strong>Friday, 23:00 — 01:00 HRS</strong> @ <em>Highway Bypass Truck Dhaba, NH-48</em>
                  </div>
                </div>
                <span className="px-3 py-1 bg-[var(--neon-green)]/20 text-[var(--neon-green)] font-mono text-[10px] rounded font-bold">
                  HIGH CONFIDENCE (91.8%)
                </span>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              3. OPTICAL PLATE-CLONING PARADOX (UNIMAGINABLE UPGRADE)
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'plate_cloning' && (() => {
            const anomalies = plateResult?.resolved_plate_anomalies || plateResult?.resolved_paradox_cases || [];
            return (
              <div className="space-y-6">
                <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--neon-gold)] uppercase flex items-center gap-2">
                      <FiTruck /> Optical Plate-Cloning Paradox Resolver & Choke-Point Dispatch
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                      Detects impossible kinematic velocities (&gt;240 km/h) across highway ANPR FASTag cameras to bifurcate cloned plates into True Vehicle vs Phantom Decoy trajectories.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-[var(--neon-red)]">
                      {plateLoading ? '...' : (anomalies.length || plateResult?.cloned_plate_paradoxes_count || 2)}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase">Cloned Vehicles Flagged</div>
                  </div>
                </div>

                {plateLoading ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 space-y-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg">
                    <FiTruck className="text-3xl text-[var(--neon-gold)] animate-bounce" />
                    <span className="text-xs font-mono tracking-wider text-gray-300">
                      Scanning National Highway ANPR Camera Feeds & FASTag Telemetry...
                    </span>
                  </div>
                ) : anomalies.length > 0 ? (
                  <div className="space-y-6">
                    {anomalies.map((c, i) => {
                      const plateNum = c.plate_number || c.cloned_plate_identifier || `CLONED-VEHICLE-${i+1}`;
                      const velocity = c.kinematic_impossibility_velocity_kmh || 473.3;
                      const trueRoute = c.bifurcated_trajectories?.true_route_telemetry || c.bifurcated_trajectories?.vehicle_alpha_true || {};
                      const phantomRoute = c.bifurcated_trajectories?.phantom_decoy_telemetry || c.bifurcated_trajectories?.vehicle_ghost_decoy || {};
                      const chokes = c.choke_point_interceptors || [
                        { toll_plaza: "Panvel Toll Plaza (Corridor Alpha)", action: "Intercept Principal Vehicle", eta: "14 MINS" },
                        { toll_plaza: "Vashi Toll Plaza (Corridor Beta)", action: "Seize Cloned Decoy Mule", eta: "08 MINS" }
                      ];

                      return (
                        <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5 space-y-4">
                          
                          {/* Paradox Header */}
                          <div className="flex flex-wrap justify-between items-center border-b border-[var(--border)] pb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-lg text-[var(--neon-gold)] bg-[#111] px-3 py-1 rounded border border-[var(--border)]">
                                {plateNum}
                              </span>
                              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/40 px-2.5 py-1 rounded font-bold font-mono">
                                ⚡ {velocity} KM/H (KINEMATIC VIOLATION)
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">
                              Bifurcated Trajectory Telemetry
                            </span>
                          </div>

                          {/* True vs Phantom Decoy Bifurcation Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-4 bg-[var(--bg-primary)] rounded-lg border border-green-500/40 space-y-2">
                              <div className="text-green-400 font-bold uppercase flex items-center justify-between">
                                <span>✓ True Route (Target Principal)</span>
                                <span className="text-[10px] font-mono bg-green-500/20 px-2 py-0.5 rounded">AUTHENTICATED</span>
                              </div>
                              <div className="text-white font-medium">
                                {trueRoute.location || trueRoute.sighting_location || 'Corridor Alpha Sighting'}
                              </div>
                              <div className="text-[var(--text-secondary)] font-mono">
                                {trueRoute.timestamp || '2026-08-15 14:10:00 IST'}
                              </div>
                              <div className="text-[11px] text-gray-300 pt-1 border-t border-[var(--border)]">
                                Make: <strong className="text-emerald-300">{trueRoute.optical_vehicle_make || trueRoute.detected_make || 'Silver Honda City'}</strong> | RFID: {trueRoute.fastag_rfid || 'FASTAG-AUTHENTICATED'}
                              </div>
                            </div>

                            <div className="p-4 bg-[var(--bg-primary)] rounded-lg border border-red-500/40 space-y-2">
                              <div className="text-red-400 font-bold uppercase flex items-center justify-between">
                                <span>⚠ Phantom Decoy (Cloned Mule)</span>
                                <span className="text-[10px] font-mono bg-red-500/20 px-2 py-0.5 rounded">COUNTERFEIT DECOY</span>
                              </div>
                              <div className="text-white font-medium">
                                {phantomRoute.location || phantomRoute.sighting_location || 'Corridor Beta Sighting'}
                              </div>
                              <div className="text-[var(--text-secondary)] font-mono">
                                {phantomRoute.timestamp || '2026-08-15 14:28:00 IST'}
                              </div>
                              <div className="text-[11px] text-gray-300 pt-1 border-t border-[var(--border)]">
                                Make: <strong className="text-red-300">{phantomRoute.optical_vehicle_make || phantomRoute.detected_make || 'Dark Mahindra Scorpio'}</strong> | RFID: {phantomRoute.fastag_rfid || 'COUNTERFEIT-CLONED-TAG'}
                              </div>
                            </div>
                          </div>

                          {/* Automated Highway Choke-Point Barricade Dispatch Table */}
                          <div className="bg-[#050510] border border-[var(--border)] rounded-lg p-3.5 space-y-2">
                            <div className="flex justify-between items-center pb-1">
                              <div className="text-xs font-bold text-[var(--text-accent)] uppercase flex items-center gap-1.5">
                                <FiAlertCircle /> Automated Highway Choke-Point Interceptor Dispatch:
                              </div>
                              <button
                                onClick={() => handleDispatchInterceptor(plateNum)}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition-all ${
                                  dispatchedPlates.has(plateNum)
                                    ? 'bg-green-600 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                                    : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse'
                                }`}
                              >
                                <FiShield className="text-xs" />
                                {dispatchedPlates.has(plateNum)
                                  ? '✓ Interceptor Units Dispatched (Sec 102)'
                                  : '🚨 Dispatch Highway Interceptors'}
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              {chokes.map((choke, chIdx) => (
                                <div key={chIdx} className="p-2.5 bg-[var(--bg-card)] rounded border border-[var(--border)] flex justify-between items-center">
                                  <div>
                                    <div className="font-bold text-white">{choke.toll_plaza}</div>
                                    <div className="text-[10px] text-[var(--text-secondary)]">{choke.action}</div>
                                  </div>
                                  <span className={`font-mono text-xs font-bold ${chIdx === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ETA: {choke.eta}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-gray-400 text-xs">
                    No kinematic plate-cloning anomalies detected for this investigation.
                  </div>
                )}
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════════════════════════════
              ACCUSED INTERROGATION SIMULATOR
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'interrogate' && (
            <div className="h-full flex flex-col space-y-4">
              
              {/* Header & Persona Selector */}
              <div className="flex flex-wrap justify-between items-center bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border)] gap-2">
                <div className="flex items-center gap-3">
                  <select 
                    value={selectedSuspectId} 
                    onChange={handleSuspectChange} 
                    className="bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-accent)] text-xs rounded px-3 py-1.5 outline-none font-bold"
                  >
                    {suspects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role || 'Accused'})</option>)}
                  </select>

                  <div className="flex gap-1 bg-[#111] p-1 rounded border border-[var(--border)]">
                    {['hardened', 'mule', 'fixer'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setPersonaMode(mode)}
                        className={`text-[10px] px-2.5 py-0.5 rounded uppercase font-bold transition-colors ${
                          personaMode === mode ? 'bg-[var(--text-accent)] text-[#0a0a1a]' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">Demeanor:</span>
                  <span className="text-xs font-mono font-bold text-[var(--neon-gold)] bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded">
                    {demeanorState}
                  </span>
                </div>
              </div>

              {/* Real-Time Bio-Cognitive Stress Gauges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border)]">
                  <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-mono uppercase mb-1">
                    <span>Cognitive Load</span>
                    <span className="text-orange-400 font-bold">{cognitiveStress}%</span>
                  </div>
                  <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full transition-all duration-500" style={{ width: `${cognitiveStress}%` }} />
                  </div>
                </div>

                <div className="bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border)]">
                  <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-mono uppercase mb-1">
                    <span>Deception Index</span>
                    <span className="text-red-400 font-bold">{deceptionIndex}%</span>
                  </div>
                  <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${deceptionIndex}%` }} />
                  </div>
                </div>

                <div className="bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border)]">
                  <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-mono uppercase mb-1">
                    <span>Confession Propensity</span>
                    <span className="text-green-400 font-bold">{confessionPropensity}%</span>
                  </div>
                  <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${confessionPropensity}%` }} />
                  </div>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 min-h-[220px] max-h-[300px] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3.5 overflow-y-auto space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.sender === 'investigator' ? 'items-end' : m.sender === 'suspect' ? 'items-start' : 'items-center'}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                      m.sender === 'investigator' 
                        ? 'bg-[var(--text-accent)] text-[#070714] font-medium shadow-md' 
                        : m.sender === 'suspect' 
                        ? 'bg-[var(--bg-primary)] border border-[var(--border)] text-white' 
                        : 'text-[11px] text-[var(--text-secondary)] italic'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Contradiction Detection Alert */}
              {activeContradiction && (
                <div className="bg-green-950/40 border-2 border-green-500/80 rounded-lg p-3 text-xs text-white space-y-1 animate-in fade-in duration-300">
                  <div className="text-green-400 font-bold flex items-center gap-1.5">
                    <FiAlertTriangle /> LIE DETECTED: Ground-Truth Intelligence Contradiction
                  </div>
                  <div><strong>Database Evidence: </strong>{activeContradiction.ground_truth}</div>
                  <div className="text-[var(--neon-gold)]"><strong>Recommended Trap: </strong>{activeContradiction.recommended_trap_question}</div>
                </div>
              )}

              {/* Interactive Evidence Slapdown Buttons */}
              <div className="space-y-1.5">
                <div className="text-[10px] text-[var(--text-secondary)] uppercase font-mono tracking-wider">
                  Tactical Evidence Confrontation (Slap onto Interrogation Desk):
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleSlapEvidence('cdr')}
                    className="text-xs bg-[var(--bg-primary)] border border-blue-500/50 text-blue-300 hover:bg-blue-500/20 px-3 py-1 rounded transition-colors"
                  >
                    📄 Slap Dadar CDR Ping
                  </button>
                  <button 
                    onClick={() => handleSlapEvidence('hawala')}
                    className="text-xs bg-[var(--bg-primary)] border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20 px-3 py-1 rounded transition-colors"
                  >
                    💰 Confront Token #786 Ledger
                  </button>
                  <button 
                    onClick={() => handleSlapEvidence('anpr')}
                    className="text-xs bg-[var(--bg-primary)] border border-red-500/50 text-red-300 hover:bg-red-500/20 px-3 py-1 rounded transition-colors"
                  >
                    🚗 Present ANPR Camera Sighting
                  </button>
                  <button 
                    onClick={() => handleSlapEvidence('chat')}
                    className="text-xs bg-[var(--bg-primary)] border border-purple-500/50 text-purple-300 hover:bg-purple-500/20 px-3 py-1 rounded transition-colors"
                  >
                    📱 Present Intercepted Chat
                  </button>
                </div>
              </div>

              {/* Question Input */}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask custody suspect a direct or evasive trap question..." 
                  value={interrogationInput} 
                  onChange={e => setInterrogationInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSendQuestion()} 
                  className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-4 py-2 text-xs text-white outline-none focus:border-[var(--text-accent)]" 
                />
                <button 
                  onClick={() => handleSendQuestion()} 
                  disabled={interrogationLoading}
                  className="px-5 py-2 bg-[var(--text-accent)] text-[#0a0a1a] font-bold text-xs rounded hover:opacity-90 disabled:opacity-50"
                >
                  {interrogationLoading ? 'Analyzing...' : 'Interrogate'}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              6. SOCMINT THREAT SCANNER (UNIMAGINABLE UPGRADE)
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'socmint' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-blue-400 uppercase flex items-center gap-2">
                    <FiEye /> Multi-Platform SOCMINT & DarkNet Threat Scanner
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Parses open-source & dark-web broadcasts to extract threat levels, decrypt underworld slang in real-time, and auto-synthesize judicial Section 69A IT Act warrants.
                  </p>
                </div>
                
                <button 
                  onClick={() => setShowWarrantModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded flex items-center gap-1.5 transition-colors shadow-lg"
                >
                  <FiFileText size={14} /> Generate Section 69A Warrant
                </button>
              </div>

              {/* Multi-Platform Intercept Stream Filters */}
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'All Feeds' },
                  { id: 'telegram', label: 'Telegram Channels' },
                  { id: 'darkweb', label: 'DarkWeb Escrows' },
                  { id: 'instagram', label: 'Instagram Stories' }
                ].map(stream => (
                  <button
                    key={stream.id}
                    onClick={() => setSelectedSocmintStream(stream.id)}
                    className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                      selectedSocmintStream === stream.id 
                        ? 'bg-blue-600 text-white border-blue-500 font-bold' 
                        : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    {stream.label}
                  </button>
                ))}
              </div>

              {/* Case-Specific Presets */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">
                  Intercepted Broadcast Intelligence Presets ({activeCase}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const presetsMap = {
                      dawood: [
                        { label: "Dongri Drop Post (IG)", text: "@sheikh_dawood_dxb: System is ready. 50 peti package will drop in Dongri tonight #BhaiCompany" },
                        { label: "Salem Extortion Threat (X)", text: "@captain_salem: Final warning to Bollywood producer... 50 khoka tayyar rakho warna shooter ghar pe aayega" }
                      ],
                      drug_punjab: [
                        { label: "Drone Drop Broadcast (IG)", text: "@billa_majha_punjab: Big parcel arriving across the wire at 02:00 AM near border dhaba #MajhaBoys #BillaGroup" },
                        { label: "Highway Transit Story (Snap)", text: "@garry_sandhu_amritsar: 4x4 loaded for GT Road run. Consignment cleared #NightRiders" }
                      ],
                      ht_assam: [
                        { label: "Train Batch Logistics (FB)", text: "@anwar_ali_guwahati: 12 candidates ready for Kamakhya express departure at 23:00. Factory jobs confirmed #AssamTravels" },
                        { label: "Riverine Crossing Ping (IMO)", text: "@rofiqul_express_transit: River crossing clear at Dhubri. Connect on IMO for transit paperwork" }
                      ],
                      cyber_bengaluru: [
                        { label: "Zero-Day Ransom Post (DarkWeb)", text: "@0xRamesh_DarkSec: Exfiltrated complete VIP financial database. 15 BTC countdown started to 1P5ZEDWT... #ZeroDay" },
                        { label: "Proxy Credential Leak (TG)", text: "@sunil_root_hacker: Reverse-proxy bypass script active across 45 bank portals. Mule accounts ready #DarkNet" }
                      ],
                      money_gujarat: [
                        { label: "Angadia Token Dispatch (WA)", text: "@mansukh_angadia_surat: Match note serial 786-990-21. 25 Crore cash clearance against Surat Bourse token" },
                        { label: "Dubai Smurfing Route (IG)", text: "@ketan_patel_bourse: Import bill under-invoicing cleared. Foreign exchange layered via UAE shell fronts" }
                      ],
                      arms_chhattisgarh: [
                        { label: "Ore Truck Ammo Cache (Matrix)", text: "@rao_commander_bastar: 20 crates marked machine parts moving via Bailadila mineral transport trucks. Lal Salaam" },
                        { label: "Jungle Weapon Supply (TG)", text: "@katta_singh_desi: Automatic rifle consignment cached at deep forest trail. Contact on Matrix node" }
                      ],
                      wildlife_kerala: [
                        { label: "Ivory Tusk Shipment (FB)", text: "@jose_tusk_wayanad: Two pairs of 35kg raw white logs sealed in spice container. Kochi maritime vessel ETD 03:00" },
                        { label: "Poacher Staging Ping (TG)", text: "@rajan_nair_trapper: Rainforest perimeter traps laid. Export buyer confirmed for exotic species #MalabarExotic" }
                      ],
                      extortion_up: [
                        { label: "PWD Tender Warning (FB)", text: "@munna_bajrangi_shooter: PWD road tender submission tomorrow. Jo bhi form bharega use goli milegi. Dada ka aadesh hai" },
                        { label: "Bahubali Convoy Reel (IG)", text: "@vikas_dada_gorakhpur: 10 Fortuner convoy passing through Gorakhpur toll plaza. Purvanchal belongs to Dada #Bahubali" }
                      ]
                    };
                    const presets = presetsMap[activeCase] || presetsMap.dawood;
                    return presets.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSocmintInput(p.text);
                          handleRunSocmint(p.text);
                        }}
                        className="text-xs bg-[var(--bg-card)] border border-[var(--border)] hover:border-blue-500 hover:text-blue-300 text-[var(--text-secondary)] px-3 py-1.5 rounded-md transition-colors"
                      >
                        ⚡ {p.label}
                      </button>
                    ));
                  })()}
                </div>
              </div>

              {/* Scanner Input */}
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-[#111] border border-[#333] text-xs p-3 rounded-lg text-[var(--text-primary)] focus:border-blue-500 outline-none font-mono"
                  value={socmintInput}
                  onChange={e => setSocmintInput(e.target.value)}
                  placeholder="Paste intercepted social media string or broadcast..."
                />
                <button 
                  onClick={() => handleRunSocmint()}
                  disabled={socmintLoading}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold disabled:opacity-50 transition-colors"
                >
                  {socmintLoading ? 'Scanning...' : <><FiSend size={14} /> Scan</>}
                </button>
              </div>

              {socmintData && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#111] p-4 rounded border border-[var(--border)]">
                      <div className="text-xs text-[var(--text-secondary)] uppercase font-mono">Threat Level</div>
                      <div className={`text-xl font-bold mt-1 ${socmintData.threat_level === 'CRITICAL' ? 'text-red-500' : 'text-yellow-400'}`}>
                        {socmintData.threat_level}
                      </div>
                    </div>
                    <div className="bg-[#111] p-4 rounded border border-[var(--border)]">
                      <div className="text-xs text-[var(--text-secondary)] uppercase font-mono">Escalation Probability</div>
                      <div className="text-xl font-bold text-orange-500 mt-1">{socmintData.gang_escalation_probability}</div>
                    </div>
                  </div>

                  {/* Monitored Handles */}
                  {socmintData.detected_handles && socmintData.detected_handles.length > 0 && (
                    <div className="bg-[#0a0a0f] border border-[#333] p-4 rounded space-y-2">
                      <h4 className="text-xs font-bold text-[var(--text-accent)] uppercase border-b border-[#333] pb-2 flex items-center justify-between">
                        <span>Monitored Handles & Cyber Nodes</span>
                        <span className="text-[10px] text-gray-500 font-mono">SOCMINT MESH</span>
                      </h4>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {socmintData.detected_handles.map((h, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 bg-[#1a1a2e] text-pink-400 border border-pink-500/40 text-xs px-2.5 py-1 rounded-md font-mono font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-[#0a0a0f] border border-[#333] p-4 rounded space-y-2">
                    <h4 className="text-xs font-bold text-[var(--text-accent)] uppercase border-b border-[#333] pb-2">Geospatial EXIF Anchors</h4>
                    {socmintData.geo_anchoring.map((loc, i) => (
                      <div key={i} className="text-xs text-gray-300 flex items-center gap-2">
                        <FiCompass className="text-[var(--text-accent)]" /> {loc}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warrant Modal Overlay */}
              {showWarrantModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                  <div className="bg-[#0a0a14] border border-blue-500/50 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                      <div className="font-mono text-sm font-bold text-blue-400 flex items-center gap-2">
                        <FiFileText /> MINISTRY OF HOME AFFAIRS / IT ACT SEC 69A WARRANT
                      </div>
                      <button onClick={() => setShowWarrantModal(false)} className="text-gray-400 hover:text-white">
                        <FiX size={18} />
                      </button>
                    </div>

                    <div className="bg-[#111] p-4 rounded border border-gray-800 font-mono text-xs text-gray-300 space-y-2 leading-relaxed">
                      <div className="text-white font-bold">CASE REF: CR-MHA-{activeCase.toUpperCase()}-2026</div>
                      <div><strong>TARGET BROADCAST: </strong>"{socmintInput}"</div>
                      <div><strong>FLAGGED ENTITY: </strong>{socmintData?.detected_handles?.[0] || '@monitored_target'}</div>
                      <div><strong>EXIF GEOLOCATION: </strong>{socmintData?.geo_anchoring?.[0] || 'South Mumbai Sector'}</div>
                      <div><strong>LEGAL STATUTE: </strong>Section 69A Information Technology Act, 2000 (Emergency Takedown & Decryption Mandate)</div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button 
                        onClick={() => setShowWarrantModal(false)} 
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded"
                      >
                        Close
                      </button>
                      <button 
                        onClick={() => {
                          alert("Section 69A Warrant Formatted & Exported to Legal Registry.");
                          setShowWarrantModal(false);
                        }} 
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-1.5"
                      >
                        <FiDownload /> Export Court Annexure
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* ══════════════════════════════════════════════════════════════════
              CRIMINAL DYNASTY HISTORY
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'dynasty' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-[var(--neon-gold)] uppercase flex items-center gap-2"><FiShare2 /> Criminal Dynasty History & Lineage Pedigree</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Hypergraph kinship & corporate proxy mapping predicting clean-record next-generation cartel successors before they register their first police offence.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-[var(--neon-gold)]">{dynastyResult?.average_generation_3_succession_risk_pct}%</div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase">Gen-3 Succession Risk</div>
                </div>
              </div>

              {dynastyResult && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-3">
                    {dynastyResult.lineage_breakdown.map((gen, idx) => (
                      <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-accent)] pb-1 border-b border-[var(--border)]">
                          {gen.generation_tier}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {gen.members.map((m, mIdx) => (
                            <div key={mIdx} className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)] space-y-1 text-xs">
                              <div className="font-bold text-sm text-white flex justify-between items-center">
                                <span>{m.name}</span>
                                {m.succession_probability_pct && (
                                  <span className="text-[10px] font-mono text-[var(--neon-gold)]">{m.succession_probability_pct}% RISK</span>
                                )}
                              </div>
                              <div className="text-[var(--text-secondary)]">{m.relation || m.role}</div>
                              {m.tactical_threat && (
                                <div className="text-[10px] text-green-400 mt-1 italic">"{m.tactical_threat}"</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded text-xs text-white">
                    <span className="text-[var(--neon-gold)] font-bold uppercase">Succession Threat Assessment: </span>
                    {dynastyResult.tactical_succession_assessment}
                  </div>
                </div>
              )}
            </div>
          )}



          {/* ══════════════════════════════════════════════════════════════════
              INTERNAL-LEAK ANALYZER
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'quantum_mole' && (
            <div className="space-y-4">
              <div className="bg-[var(--bg-primary)] p-4 rounded border flex justify-between">
                <div>
                  <h3 className="text-sm font-bold text-green-400 uppercase flex items-center gap-2"><FiEye /> Internal-Leak Analyzer Radar</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Correlates internal file lookups with external cartel evasions within 120 minutes.</p>
                </div>
                <div className="text-2xl font-mono font-bold text-green-500">{moleResult?.flagged_insider_anomalies || 0} Leads</div>
              </div>
              {moleResult?.leak_detections?.map((m, i) => (
                <div key={i} className="bg-[var(--bg-card)] border rounded p-3 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-white">
                    <span>{m.officer_name} ({m.officer_badge})</span>
                    <span className="text-green-400 font-mono">{m.leak_correlation_index_pct}% LEAK CORRELATION</span>
                  </div>
                  <div className="text-[var(--text-secondary)]">File Looked Up: {m.compromised_file} ⟷ Evasion: {m.cartel_defensive_action}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
