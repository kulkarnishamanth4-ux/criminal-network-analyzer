import React, { useState, useEffect } from 'react';
import { 
  FiX, FiTarget, FiCompass, FiCpu, FiCode, FiAlertTriangle, 
  FiCheckCircle, FiSend, FiArrowRight, FiShield, FiZap, FiRadio, 
  FiActivity, FiDroplet, FiMic, FiLock, FiEye, FiVolume2, FiTrendingUp,
  FiShare2, FiTruck, FiCrosshair, FiTerminal, FiPlay, FiPause, FiFileText,
  FiDownload, FiSliders, FiClock, FiMapPin, FiLayers, FiAlertCircle
} from 'react-icons/fi';
import { 
  getDecapitation, getGhostRendezvous, matchStylometry, 
  interrogateSuspect, getSuspectsList, analyzeAcoustics,
  simulateHawalaFluid, getPanicEntropy, getQuantumMole,
  decodeCryptolalia, simulateHoneypotSting,
  getDynastyPedigree, getPlateCloningResolver,
  forecastGangwarCascade, runMoriartyRedteam, analyzeSocmint
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

  const [stylometryInput, setStylometryInput] = useState('');
  const [stylometryResult, setStylometryResult] = useState(null);
  const [stylometryLoading, setStylometryLoading] = useState(false);

  const [acousticResult, setAcousticResult] = useState(null);
  const [acousticLoading, setAcousticLoading] = useState(false);
  const [selectedAudioCall, setSelectedAudioCall] = useState('intercept_call_001');

  const [hawalaResult, setHawalaResult] = useState(null);
  const [hawalaLoading, setHawalaLoading] = useState(false);
  const [frozenNodes, setFrozenNodes] = useState([1, 4]);

  const [panicResult, setPanicResult] = useState(null);
  const [panicLoading, setPanicLoading] = useState(false);
  const [selectedPanicSuspectId, setSelectedPanicSuspectId] = useState('');

  const [moleResult, setMoleResult] = useState(null);
  const [moleLoading, setMoleLoading] = useState(false);

  const [cryptolaliaInput, setCryptolaliaInput] = useState('bhaiji 50 peti aur gulab jamun ready hai... chidiya ka arrangement karlo jaldi');
  const [cryptolaliaResult, setCryptolaliaResult] = useState(null);
  const [cryptolaliaLoading, setCryptolaliaLoading] = useState(false);

  const [honeypotInput, setHoneypotInput] = useState('Aakhri baar bol raha hu, 10 lakh rupay is UPI par bhej mule_merchant@sbi nahi toh parivar khatam!');
  const [honeypotResult, setHoneypotResult] = useState(null);
  const [honeypotLoading, setHoneypotLoading] = useState(false);

  const [dynastyResult, setDynastyResult] = useState(null);
  const [dynastyLoading, setDynastyLoading] = useState(false);

  const [plateResult, setPlateResult] = useState(null);
  const [plateLoading, setPlateLoading] = useState(false);

  const [gangwarResult, setGangwarResult] = useState(null);
  const [gangwarLoading, setGangwarLoading] = useState(false);

  const [moriartyResult, setMoriartyResult] = useState(null);
  const [moriartyLoading, setMoriartyLoading] = useState(false);
  const [selectedMoriartyVector, setSelectedMoriartyVector] = useState('HAWALA_MICRO_SMURFING_EVASION');

  const [socmintData, setSocmintData] = useState(null);
  const [socmintLoading, setSocmintLoading] = useState(false);
  const [socmintInput, setSocmintInput] = useState("@d_boss_official: System is ready. 50 peti package will drop in Dongri tonight #BhaiCompany");
  const [selectedSocmintStream, setSelectedSocmintStream] = useState('all');
  const [showWarrantModal, setShowWarrantModal] = useState(false);

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
        setSelectedPanicSuspectId(sList[0].id);
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
    } else if (activeTab === 'acoustic' && !acousticResult) {
      handleRunAcoustics('intercept_call_001');
    } else if (activeTab === 'hawala_fluid' && !hawalaResult) {
      handleRunHawalaFluid();
    } else if (activeTab === 'panic' && selectedPanicSuspectId && !panicResult) {
      handleRunPanic(selectedPanicSuspectId);
    } else if (activeTab === 'quantum_mole' && !moleResult) {
      setMoleLoading(true);
      getQuantumMole(activeCase).then(res => { setMoleResult(res); setMoleLoading(false); }).catch(() => setMoleLoading(false));
    } else if (activeTab === 'cryptolalia' && !cryptolaliaResult) {
      handleRunCryptolalia(cryptolaliaInput);
    } else if (activeTab === 'honeypot' && !honeypotResult) {
      handleRunHoneypot(honeypotInput);
    } else if (activeTab === 'dynasty' && !dynastyResult) {
      setDynastyLoading(true);
      getDynastyPedigree(activeCase).then(res => { setDynastyResult(res); setDynastyLoading(false); }).catch(() => setDynastyLoading(false));
    } else if (activeTab === 'plate_cloning' && !plateResult) {
      setPlateLoading(true);
      getPlateCloningResolver(activeCase).then(res => { setPlateResult(res); setPlateLoading(false); }).catch(() => setPlateLoading(false));
    } else if (activeTab === 'gangwar' && !gangwarResult) {
      handleRunGangwar();
    } else if (activeTab === 'moriarty' && !moriartyResult) {
      handleRunMoriarty('HAWALA_MICRO_SMURFING_EVASION');
    } else if (activeTab === 'socmint' && !socmintData) {
      handleRunSocmint();
    }
  }, [activeTab]);

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

  const handleRunStylometry = async (sampleText) => {
    const txt = sampleText || stylometryInput;
    if (!txt.trim()) return;
    if (sampleText) setStylometryInput(sampleText);
    setStylometryLoading(true);
    try {
      const res = await matchStylometry(txt, activeCase);
      setStylometryResult(res);
    } catch (err) { console.error(err); }
    setStylometryLoading(false);
  };

  const handleRunAcoustics = async (audioId) => {
    setSelectedAudioCall(audioId);
    setAcousticLoading(true);
    try {
      const res = await analyzeAcoustics(audioId, activeCase);
      setAcousticResult(res);
    } catch (err) { console.error(err); }
    setAcousticLoading(false);
  };

  const handleRunHawalaFluid = async (frozenIds = frozenNodes) => {
    setHawalaLoading(true);
    try {
      const res = await simulateHawalaFluid(frozenIds, activeCase);
      setHawalaResult(res);
    } catch (err) { console.error(err); }
    setHawalaLoading(false);
  };

  const toggleFreezeNode = (nodeId) => {
    let next;
    if (frozenNodes.includes(nodeId)) {
      next = frozenNodes.filter(id => id !== nodeId);
    } else {
      next = [...frozenNodes, nodeId];
    }
    setFrozenNodes(next);
    handleRunHawalaFluid(next);
  };

  const handleRunPanic = async (sId) => {
    setSelectedPanicSuspectId(sId);
    setPanicLoading(true);
    try {
      const res = await getPanicEntropy(sId, activeCase);
      setPanicResult(res);
    } catch (err) { console.error(err); }
    setPanicLoading(false);
  };

  const handleRunCryptolalia = async (text) => {
    const txt = text || cryptolaliaInput;
    if (!txt.trim()) return;
    if (text) setCryptolaliaInput(text);
    setCryptolaliaLoading(true);
    try {
      const res = await decodeCryptolalia(txt, activeCase);
      setCryptolaliaResult(res);
    } catch (err) { console.error(err); }
    setCryptolaliaLoading(false);
  };

  const handleRunHoneypot = async (msg) => {
    const threat = msg || honeypotInput;
    if (!threat.trim()) return;
    if (msg) setHoneypotInput(msg);
    setHoneypotLoading(true);
    try {
      const res = await simulateHoneypotSting(threat, 2, activeCase);
      setHoneypotResult(res);
    } catch (err) { console.error(err); }
    setHoneypotLoading(false);
  };

  const handleRunGangwar = async (trigger = "FIR_001_VIKRAM_SHARMA_NARCOTICS_CRACKDOWN") => {
    setGangwarLoading(true);
    try {
      const res = await forecastGangwarCascade(trigger);
      setGangwarResult(res);
    } catch (err) { console.error(err); }
    setGangwarLoading(false);
  };

  const handleRunMoriarty = async (vector) => {
    const v = vector || selectedMoriartyVector;
    setSelectedMoriartyVector(v);
    setMoriartyLoading(true);
    try {
      const res = await runMoriartyRedteam(v, activeCase);
      setMoriartyResult(res);
    } catch (err) { console.error(err); }
    setMoriartyLoading(false);
  };

  const handleRunSocmint = async (customTxt) => {
    const txt = customTxt || socmintInput;
    setSocmintLoading(true);
    try {
      const res = await analyzeSocmint([txt], activeCase);
      setSocmintData(res);
    } catch (err) { console.error(err); }
    setSocmintLoading(false);
  };

  // 14 Modules Categorized into 4 Command Tiers
  const categories = {
    tactical: {
      name: ' Tactical & Kinetic Operations',
      tabs: [
        { id: 'decapitation', label: ' Decapitation Strike' },
        { id: 'ghost', label: ' Physical-Exclusive Meetings' },
        { id: 'plate_cloning', label: ' Optical Plate-Cloning' },
        { id: 'hawala_fluid', label: ' Hawala Betrayal Index' },
        { id: 'socmint', label: ' SOCMINT Threat Scanner' }
      ]
    },
    cognitive: {
      name: ' Cognitive, Audio & Forensics',
      tabs: [
        { id: 'interrogate', label: ' Accused Interrogation Simulator' },
        { id: 'panic', label: ' Confession-Probability Index' },
        { id: 'honeypot', label: ' Voice-Cloned Sting Honeypot' }
      ]
    },
    wargaming: {
      name: ' Chaos, Lineage & War-Gaming',
      tabs: [
        { id: 'gangwar', label: ' Arrest Aftermath Predictor' },
        { id: 'dynasty', label: ' Criminal Dynasty History' },
        { id: 'moriarty', label: ' Vulnerability Detection Counter AI' }
      ]
    },
    counterintel: {
      name: ' Counter-Intel & Cryptography',
      tabs: [
        { id: 'stylometry', label: ' Syntax DNA Stylometry' },
        { id: 'cryptolalia', label: ' Criminal-Slang Analyzer' },
        { id: 'quantum_mole', label: ' Internal-Leak Analyzer' }
      ]
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
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
                National Security Command Suite: Spectral Decapitation, Spatiotemporal Tracking, Interrogation Fact-Checking & Hawala Betrayal
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
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase font-mono">SWAT Teams: {strikeTeams}</div>
                    <div className="text-xs font-bold text-[var(--text-accent)]">{decapData?.syndicate_disruption_efficiency_pct || 88}% Collapse</div>
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
                  { id: 'phase1', label: 'Phase 1: Apex Hub Strike', sub: 'Neutralize Primary Hub Node' },
                  { id: 'phase2', label: 'Phase 2: Edge Severance', sub: 'Fracture Command Channels' },
                  { id: 'phase3', label: 'Phase 3: Percolation Collapse', sub: 'Isolate Singleton Clusters' }
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
                    <div className={`text-xs font-bold ${decapPhase === ph.id ? 'text-[var(--text-accent)]' : 'text-gray-300'}`}>{ph.label}</div>
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
          {activeTab === 'plate_cloning' && (
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
                  <div className="text-2xl font-mono font-bold text-[var(--neon-red)]">{plateResult?.cloned_plate_paradoxes_count || 2}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase">Cloned Vehicles Flagged</div>
                </div>
              </div>

              {plateResult?.resolved_plate_anomalies?.length > 0 && (
                <div className="space-y-6">
                  {plateResult.resolved_plate_anomalies.map((c, i) => (
                    <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5 space-y-4">
                      
                      {/* Paradox Header */}
                      <div className="flex flex-wrap justify-between items-center border-b border-[var(--border)] pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-lg text-[var(--neon-gold)] bg-[#111] px-3 py-1 rounded border border-[var(--border)]">
                            {c.plate_number}
                          </span>
                          <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/40 px-2.5 py-1 rounded font-bold font-mono">
                            ⚡ {c.kinematic_impossibility_velocity_kmh} KM/H (KINEMATIC VIOLATION)
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
                          <div className="text-white font-medium">{c.bifurcated_trajectories.true_route_telemetry.location}</div>
                          <div className="text-[var(--text-secondary)] font-mono">{c.bifurcated_trajectories.true_route_telemetry.timestamp}</div>
                          <div className="text-[11px] text-gray-300 pt-1 border-t border-[var(--border)]">
                            FASTag RFID Tag ID matched registered chassis VIN #9941.
                          </div>
                        </div>

                        <div className="p-4 bg-[var(--bg-primary)] rounded-lg border border-red-500/40 space-y-2">
                          <div className="text-red-400 font-bold uppercase flex items-center justify-between">
                            <span>⚠ Phantom Decoy (Cloned Mule)</span>
                            <span className="text-[10px] font-mono bg-red-500/20 px-2 py-0.5 rounded">COUNTERFEIT DECOY</span>
                          </div>
                          <div className="text-white font-medium">{c.bifurcated_trajectories.phantom_decoy_telemetry.location}</div>
                          <div className="text-[var(--text-secondary)] font-mono">{c.bifurcated_trajectories.phantom_decoy_telemetry.timestamp}</div>
                          <div className="text-[11px] text-gray-300 pt-1 border-t border-[var(--border)]">
                            Optical OCR snapshot detected mismatched vehicle color/model.
                          </div>
                        </div>
                      </div>

                      {/* Automated Highway Choke-Point Barricade Dispatch Table */}
                      <div className="bg-[#050510] border border-[var(--border)] rounded-lg p-3.5 space-y-2">
                        <div className="text-xs font-bold text-[var(--text-accent)] uppercase flex items-center gap-1.5">
                          <FiAlertCircle /> Automated Highway Choke-Point Interceptor Dispatch:
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-2.5 bg-[var(--bg-card)] rounded border border-[var(--border)] flex justify-between items-center">
                            <div>
                              <div className="font-bold text-white">Panvel Toll Plaza (Corridor Alpha)</div>
                              <div className="text-[10px] text-[var(--text-secondary)]">Intercept Principal Vehicle</div>
                            </div>
                            <span className="font-mono text-xs font-bold text-green-400">ETA: 14 MINS</span>
                          </div>
                          <div className="p-2.5 bg-[var(--bg-card)] rounded border border-[var(--border)] flex justify-between items-center">
                            <div>
                              <div className="font-bold text-white">Vashi Toll Plaza (Corridor Beta)</div>
                              <div className="text-[10px] text-[var(--text-secondary)]">Seize Cloned Decoy Mule</div>
                            </div>
                            <span className="font-mono text-xs font-bold text-red-400">ETA: 08 MINS</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              4. HAWALA BETRAYAL INDEX (UNIMAGINABLE UPGRADE)
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'hawala_fluid' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--neon-gold)] uppercase flex items-center gap-2">
                    <FiDroplet /> Hawala Betrayal Index & Interactive Fluid Pipe Conduit Visualizer
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Uses Max-Flow / Min-Cut (Ford-Fulkerson algorithm) to model financial conduits as fluid pipes, simulate account freezes, and calculate internal syndicate betrayal risk.
                  </p>
                </div>
                <button 
                  onClick={() => handleRunHawalaFluid()} 
                  className="px-4 py-2 bg-[var(--neon-gold)] text-[#0a0a1a] font-bold text-xs rounded hover:opacity-90 transition-opacity"
                >
                  {hawalaLoading ? 'Simulating...' : 'Recalculate Betrayal Index'}
                </button>
              </div>

              {/* Interactive Fluid Pipe Conduit Diagram */}
              <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Interactive Smurfing Pipeline & Frozen Node Simulation (Click Node to Freeze)
                  </div>
                  <span className="text-[10px] font-mono text-[var(--neon-gold)]">
                    {frozenNodes.length} ACCOUNTS FREEZE-LOCKED ❄️
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                  {[
                    { id: 1, name: "Apex Controller (Dubai)", type: "Origin Master", inr: "5.0 Cr" },
                    { id: 2, name: "Angadia Courier #1 (Surat)", type: "Primary Transit", inr: "2.5 Cr" },
                    { id: 3, name: "Shell Bullion Front (Mumbai)", type: "Layering Hub", inr: "1.8 Cr" },
                    { id: 4, name: "Mule Account A (Bank)", type: "Smurfing Mule", inr: "45 Lakhs" },
                    { id: 5, name: "Offshore Real Estate (Cashout)", type: "Terminal Sink", inr: "3.2 Cr" }
                  ].map((node) => {
                    const isFrozen = frozenNodes.includes(node.id);
                    return (
                      <div
                        key={node.id}
                        onClick={() => toggleFreezeNode(node.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isFrozen 
                            ? 'bg-red-950/30 border-red-500 text-white shadow-[0_0_12px_rgba(255,0,0,0.3)]' 
                            : 'bg-[var(--bg-primary)] border-[var(--border)] text-gray-300 hover:border-[var(--neon-gold)]'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] mb-1 font-mono">
                          <span>NODE #{node.id}</span>
                          <span>{isFrozen ? '❄️ FROZEN' : 'FLOWING'}</span>
                        </div>
                        <div className="text-xs font-bold text-white truncate">{node.name}</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">{node.type}</div>
                        <div className="text-xs font-mono font-bold text-[var(--neon-gold)] mt-2">{node.inr}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {hawalaResult && (
                <>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg text-xs text-[var(--neon-gold)] font-mono leading-relaxed">
                    {hawalaResult.tactical_fluid_assessment}
                  </div>

                  {/* 4 Fluid Pressure Telemetry Gauges */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-[var(--bg-card)] p-3.5 rounded-lg border border-[var(--border)] text-center">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase font-mono">Liquidity Starvation</div>
                      <div className="text-2xl font-bold text-[var(--neon-red)] mt-1">
                        {hawalaResult.fluid_pressure_metrics.downstream_liquidity_starvation_pct}%
                      </div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-3.5 rounded-lg border border-[var(--border)] text-center">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase font-mono">Upstream Pressure Backlog</div>
                      <div className="text-2xl font-bold text-[var(--neon-gold)] mt-1">
                        ₹{(hawalaResult.fluid_pressure_metrics.upstream_backlog_conduit_inr/100000).toFixed(1)}L
                      </div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-3.5 rounded-lg border border-[var(--border)] text-center">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase font-mono">Isolated Mules</div>
                      <div className="text-2xl font-bold text-[var(--text-accent)] mt-1">
                        {hawalaResult.fluid_pressure_metrics.isolated_downstream_mules}
                      </div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-3.5 rounded-lg border border-[var(--border)] text-center">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase font-mono">Betrayal Risk Index</div>
                      <div className="text-2xl font-bold text-green-400 mt-1">
                        {hawalaResult.fluid_pressure_metrics.syndicate_internal_betrayal_risk_index}%
                      </div>
                    </div>
                  </div>

                  {/* Game-Theoretic Informant Breakdown */}
                  <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg space-y-2 text-xs">
                    <div className="font-bold text-white uppercase text-xs flex items-center gap-2">
                      <FiTrendingUp className="text-[var(--neon-gold)]" /> Game-Theoretic Informant Defection Forecast:
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      Freezing the smurfing bottleneck nodes cuts off operative liquidity. 
                      Couriers with &gt;₹25 Lakhs unpaid liability face an <strong>89.4% probability of turning State Approver (Informant)</strong> to avoid syndicate retribution.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              5. ACCUSED INTERROGATION SIMULATOR (UNIMAGINABLE UPGRADE)
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
                        { label: "Dongri Drop Post (IG)", text: "@d_boss_official: System is ready. 50 peti package will drop in Dongri tonight #BhaiCompany" },
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

              {/* Real-Time Inline Underworld Slang Highlight */}
              <div className="p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg space-y-1.5">
                <div className="text-[10px] text-[var(--text-secondary)] font-mono uppercase">
                  Real-Time Slang (Cryptolalia) Inline De-Masker:
                </div>
                <div className="text-xs text-white leading-relaxed font-mono">
                  {socmintInput.includes("50 peti") ? (
                    <span>
                      {socmintInput.split("50 peti")[0]}
                      <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 px-1.5 py-0.5 rounded font-bold">50 peti [₹50 Lakhs Cash]</span>
                      {socmintInput.split("50 peti")[1]}
                    </span>
                  ) : (
                    socmintInput
                  )}
                </div>
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
              7. CONFESSION-PROBABILITY INDEX
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'panic' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-green-400 uppercase flex items-center gap-2"><FiActivity /> Confession-Probability Index & Shannon Entropy Profiler</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Measures temporal entropy and circadian decay to pinpoint optimal confession windows.</p>
                </div>
                <select value={selectedPanicSuspectId} onChange={e => handleRunPanic(e.target.value)} className="bg-[var(--bg-card)] border text-[var(--text-accent)] text-xs rounded px-3 py-1.5">
                  {suspects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {panicResult && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-[var(--bg-card)] p-4 rounded border text-center">
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase">Panic Entropy Index</div>
                    <div className="text-3xl font-bold text-green-500 mt-1">{panicResult.panic_entropy_metrics.panic_entropy_index_pct}%</div>
                  </div>
                  <div className="bg-[var(--bg-card)] p-4 rounded border text-center">
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase">Confession Probability</div>
                    <div className="text-3xl font-bold text-[var(--neon-green)] mt-1">{panicResult.panic_entropy_metrics.confession_approver_probability_pct}%</div>
                  </div>
                  <div className="bg-[var(--bg-card)] p-4 rounded border text-center">
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase">Temporal Shannon Entropy</div>
                    <div className="text-3xl font-bold text-[var(--neon-gold)] mt-1">{panicResult.panic_entropy_metrics.temporal_shannon_entropy_bits} bits</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              8. VOICE-CLONED STING HONEYPOT
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'honeypot' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-accent)] uppercase flex items-center gap-2"><FiMic /> Autonomous Voice-Cloned Sting Honeypot</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Autonomous conversational AI victim persona stalling extortionists and cyber-scammers while live-extracting UPI handles, mule accounts, and physical meetup coordinates.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={honeypotInput}
                  onChange={e => setHoneypotInput(e.target.value)}
                  placeholder="Simulate extortionist threat message..."
                  className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-4 py-2 text-xs text-white"
                />
                <button
                  onClick={() => handleRunHoneypot()}
                  className="px-5 py-2 bg-[var(--text-accent)] text-[#0a0a1a] font-bold text-xs rounded hover:opacity-90"
                >
                  Deploy Sting Persona
                </button>
              </div>

              {honeypotResult && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-[var(--bg-card)] p-3.5 rounded border border-[var(--border)]">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Stall Duration</div>
                      <div className="text-2xl font-bold font-mono text-[var(--neon-green)] mt-1">{honeypotResult.simulated_call_duration_minutes} min</div>
                      <div className="text-[10px] text-[var(--text-secondary)] mt-1">Victim Persona: {honeypotResult.victim_persona_used}</div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-3.5 rounded border border-[var(--border)]">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Extracted UPI / Accounts</div>
                      <div className="text-sm font-bold font-mono text-[var(--neon-gold)] mt-1 truncate">{honeypotResult.harvested_intelligence.extracted_upi_handles[0]}</div>
                      <div className="text-[10px] text-[var(--text-secondary)] mt-1">IFSC: Bank Account Captured</div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-3.5 rounded border border-[var(--border)]">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Caller Aggression</div>
                      <div className="text-xl font-bold font-mono text-green-400 mt-1">{honeypotResult.voice_biomarkers_telemetry.caller_aggression_level}</div>
                      <div className="text-[10px] text-[var(--text-secondary)] mt-1">Acoustic: Call-Center Echo</div>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg space-y-2">
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase">Synthetic Honeypot Voice Response:</div>
                    <div className="text-xs italic leading-relaxed text-white p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
                      "{honeypotResult.honeypot_synthetic_response}"
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              9. ARREST AFTERMATH PREDICTOR
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'gangwar' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-green-500 uppercase flex items-center gap-2"><FiTrendingUp /> Arrest Aftermath & Retaliation Predictor</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Implements Spatiotemporal Hawkes Point Processes to forecast 14-day retaliatory shooting cascades and target strike zones following key arrests.
                  </p>
                </div>
                <button onClick={() => handleRunGangwar()} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded">
                  Forecast Arrest Aftermath
                </button>
              </div>

              {gangwarResult && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded flex justify-between items-center text-xs">
                    <div>Trigger Event: <strong>{gangwarResult.trigger_event}</strong></div>
                    <div className="text-[var(--neon-gold)] font-bold">Peak Hazard: {gangwarResult.hawkes_point_process_metrics.peak_syndicate_shockwave_window}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Predicted Strike Target Sectors</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {gangwarResult.predicted_strike_targets.map((st, i) => (
                        <div key={i} className="bg-[var(--bg-card)] p-3.5 rounded border border-[var(--border)] space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400">PRIORITY #{st.priority}</span>
                            <span className="font-mono font-bold text-xs text-green-400">{st.probability_pct}% RISK</span>
                          </div>
                          <div className="font-bold text-sm text-white">{st.target_sector}</div>
                          <div className="text-xs text-[var(--text-secondary)]">Faction: {st.suspected_instigator}</div>
                          <div className="text-[10px] text-[var(--neon-gold)]">Window: {st.peak_risk_window}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-green-950/20 border border-green-500/30 rounded text-xs text-white">
                    <strong>Pre-Emptive Action: </strong>{gangwarResult.tactical_deterrence_protocol}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              10. CRIMINAL DYNASTY HISTORY
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
              11. VULNERABILITY DETECTION COUNTER AI
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'moriarty' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-green-500 uppercase flex items-center gap-2"><FiCrosshair /> Vulnerability Detection Counter AI (Red-Team)</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Adversarial underworld AI that attacks CrimeNet from the outside to discover algorithmic blind spots and auto-generates defensive anomaly heuristics.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRunMoriarty('HAWALA_MICRO_SMURFING_EVASION')}
                    className={`text-xs px-3 py-1.5 rounded border ${selectedMoriartyVector === 'HAWALA_MICRO_SMURFING_EVASION' ? 'bg-green-500 text-white font-bold' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}
                  >
                    Smurfing Attack
                  </button>
                  <button
                    onClick={() => handleRunMoriarty('BURNER_SIM_ROUND_ROBIN')}
                    className={`text-xs px-3 py-1.5 rounded border ${selectedMoriartyVector === 'BURNER_SIM_ROUND_ROBIN' ? 'bg-green-500 text-white font-bold' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}
                  >
                    SIM Round-Robin
                  </button>
                </div>
              </div>

              {moriartyResult && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                      <div className="font-bold text-sm text-green-400"> {moriartyResult.attack_simulation_executed}</div>
                      <span className="text-xs font-mono font-bold text-[var(--neon-green)]">+{moriartyResult.system_resilience_gain_pct}% RESILIENCE</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]"><strong>Counter AI Exploit Logic: </strong>{moriartyResult.moriarty_adversarial_exploit}</div>
                    <div className="text-xs text-green-300"><strong>Algorithmic Blindspot Exposed: </strong>{moriartyResult.algorithmic_blindspot_exposed}</div>
                  </div>

                  <div className="p-4 bg-[var(--bg-primary)] border border-[var(--neon-green)]/40 rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[var(--neon-green)] font-bold">
                      <span> Auto-Synthesized Defensive Patch Deployed:</span>
                      <span className="font-mono text-[10px] bg-[var(--neon-green)]/20 px-2 py-0.5 rounded">RUNTIME ACTIVE</span>
                    </div>
                    <div className="font-mono font-bold text-white text-sm">{moriartyResult.auto_synthesized_defensive_patch.rule_name}</div>
                    <div className="text-[var(--text-secondary)]">Condition: {moriartyResult.auto_synthesized_defensive_patch.patch_architecture.trigger_condition}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              12. SYNTAX DNA STYLOMETRY
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'stylometry' && (
            <div className="space-y-4">
              <div className="bg-[var(--bg-primary)] p-4 rounded border">
                <h3 className="text-sm font-bold text-[var(--text-accent)] uppercase flex items-center gap-2"><FiCode /> Hinglish Syntax DNA Matcher</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Attributes extortion SMS & dark-web posts to known suspects based on dialect syntax markers.</p>
              </div>
              <div className="flex gap-2">
                {[
                  { label: 'Extortion Threat', text: 'CALL KYUN NAHI UTHA RAHA HAI?! Aakhri baar bol raha hu... hafta nahi diya toh parivar khatam!!' },
                  { label: 'Hawala Ledger', text: 'account number bhej diya... party se 50 peti confirm karo... entry match honi chahiye' }
                ].map((s, i) => (
                  <button key={i} onClick={() => handleRunStylometry(s.text)} className="text-xs bg-[var(--bg-card)] px-3 py-1.5 rounded border text-[var(--text-secondary)] hover:text-white">
                    {s.label}
                  </button>
                ))}
              </div>
              {stylometryResult && (
                <div className="p-4 bg-[var(--bg-card)] border rounded space-y-2">
                  <div className="text-sm font-bold text-[var(--neon-green)]">Top Attribution: {stylometryResult.top_attribution} ({stylometryResult.top_confidence}%)</div>
                  <div className="text-xs text-[var(--text-secondary)]">{stylometryResult.summary}</div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              13. CRIMINAL-SLANG ANALYZER
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'cryptolalia' && (
            <div className="space-y-4">
              <div className="bg-[var(--bg-primary)] p-4 rounded border">
                <h3 className="text-sm font-bold text-[var(--neon-gold)] uppercase flex items-center gap-2"><FiVolume2 /> Criminal-Slang Analyzer & Code Decryption</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Auto-translates masked underworld code words into plain English intelligence.</p>
              </div>
              <div className="flex gap-2">
                <input type="text" value={cryptolaliaInput} onChange={e => setCryptolaliaInput(e.target.value)} className="flex-1 bg-[var(--bg-primary)] border rounded px-3 py-1.5 text-xs text-white" />
                <button onClick={() => handleRunCryptolalia()} className="px-4 py-1.5 bg-[var(--neon-gold)] text-[#0a0a1a] font-bold text-xs rounded">Decipher</button>
              </div>
              {cryptolaliaResult && (
                <div className="p-4 bg-[var(--bg-card)] border rounded space-y-2">
                  <div className="text-xs text-[var(--text-secondary)]">Decrypted Intelligence:</div>
                  <div className="text-sm font-mono text-[var(--text-accent)] p-2.5 bg-[var(--bg-primary)] rounded">{cryptolaliaResult.decrypted_intelligence_translation}</div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              14. INTERNAL-LEAK ANALYZER
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
