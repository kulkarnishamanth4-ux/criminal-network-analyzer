import React, { useState, useEffect } from 'react';
import { 
  FiX, FiTarget, FiCompass, FiCpu, FiCode, FiAlertTriangle, 
  FiCheckCircle, FiSend, FiArrowRight, FiShield, FiZap, FiRadio, 
  FiActivity, FiDroplet, FiMic, FiLock, FiEye, FiVolume2, FiTrendingUp,
  FiShare2, FiTruck, FiCrosshair, FiTerminal
} from 'react-icons/fi';
import { 
  getDecapitation, getGhostRendezvous, matchStylometry, 
  interrogateSuspect, getSuspectsList, analyzeAcoustics,
  simulateHawalaFluid, getPanicEntropy, getQuantumMole,
  decodeCryptolalia, getZkFederation, simulateHoneypotSting,
  getDynastyPedigree, getPlateCloningResolver,
  forecastGangwarCascade, runMoriartyRedteam
} from '../api/client';
import Dock from './Dock';

export default function ExperimentalLabsModal({ onClose, onHighlightNodes }) {
  const [activeCategory, setActiveCategory] = useState('tactical');
  const [activeTab, setActiveTab] = useState('decapitation');
  
  // ── States for all 15 modules ──
  const [decapData, setDecapData] = useState(null);
  const [decapLoading, setDecapLoading] = useState(false);

  const [ghostData, setGhostData] = useState(null);
  const [ghostLoading, setGhostLoading] = useState(false);

  const [suspects, setSuspects] = useState([]);
  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [interrogationInput, setInterrogationInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [interrogationLoading, setInterrogationLoading] = useState(false);
  const [activeContradiction, setActiveContradiction] = useState(null);

  const [stylometryInput, setStylometryInput] = useState('');
  const [stylometryResult, setStylometryResult] = useState(null);
  const [stylometryLoading, setStylometryLoading] = useState(false);

  const [acousticResult, setAcousticResult] = useState(null);
  const [acousticLoading, setAcousticLoading] = useState(false);
  const [selectedAudioCall, setSelectedAudioCall] = useState('intercept_call_001');

  const [hawalaResult, setHawalaResult] = useState(null);
  const [hawalaLoading, setHawalaLoading] = useState(false);

  const [panicResult, setPanicResult] = useState(null);
  const [panicLoading, setPanicLoading] = useState(false);
  const [selectedPanicSuspectId, setSelectedPanicSuspectId] = useState('');

  const [moleResult, setMoleResult] = useState(null);
  const [moleLoading, setMoleLoading] = useState(false);

  const [cryptolaliaInput, setCryptolaliaInput] = useState('bhaiji 50 peti aur gulab jamun ready hai... chidiya ka arrangement karlo jaldi');
  const [cryptolaliaResult, setCryptolaliaResult] = useState(null);
  const [cryptolaliaLoading, setCryptolaliaLoading] = useState(false);

  const [zkResult, setZkResult] = useState(null);
  const [zkLoading, setZkLoading] = useState(false);

  // ── Final 5 States ──
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

  // Load Suspects
  useEffect(() => {
    getSuspectsList().then(res => {
      const sList = res.suspects || [];
      setSuspects(sList);
      if (sList.length > 0) {
        setSelectedSuspectId(sList[0].id);
        setSelectedPanicSuspectId(sList[0].id);
        setMessages([{
          sender: 'system',
          text: `Connected to suspect digital persona: ${sList[0].name}. Ask about their whereabouts, associates, or banking records.`
        }]);
      }
    });
  }, []);

  // Fetch data on active tab switch
  useEffect(() => {
    if (activeTab === 'decapitation' && !decapData) {
      setDecapLoading(true);
      getDecapitation().then(res => { setDecapData(res); setDecapLoading(false); }).catch(() => setDecapLoading(false));
    } else if (activeTab === 'ghost' && !ghostData) {
      setGhostLoading(true);
      getGhostRendezvous().then(res => { setGhostData(res); setGhostLoading(false); }).catch(() => setGhostLoading(false));
    } else if (activeTab === 'acoustic' && !acousticResult) {
      handleRunAcoustics('intercept_call_001');
    } else if (activeTab === 'hawala_fluid' && !hawalaResult) {
      handleRunHawalaFluid();
    } else if (activeTab === 'panic' && selectedPanicSuspectId && !panicResult) {
      handleRunPanic(selectedPanicSuspectId);
    } else if (activeTab === 'quantum_mole' && !moleResult) {
      setMoleLoading(true);
      getQuantumMole().then(res => { setMoleResult(res); setMoleLoading(false); }).catch(() => setMoleLoading(false));
    } else if (activeTab === 'cryptolalia' && !cryptolaliaResult) {
      handleRunCryptolalia(cryptolaliaInput);
    } else if (activeTab === 'zk_federation' && !zkResult) {
      setZkLoading(true);
      getZkFederation().then(res => { setZkResult(res); setZkLoading(false); }).catch(() => setZkLoading(false));
    } else if (activeTab === 'honeypot' && !honeypotResult) {
      handleRunHoneypot(honeypotInput);
    } else if (activeTab === 'dynasty' && !dynastyResult) {
      setDynastyLoading(true);
      getDynastyPedigree().then(res => { setDynastyResult(res); setDynastyLoading(false); }).catch(() => setDynastyLoading(false));
    } else if (activeTab === 'plate_cloning' && !plateResult) {
      setPlateLoading(true);
      getPlateCloningResolver().then(res => { setPlateResult(res); setPlateLoading(false); }).catch(() => setPlateLoading(false));
    } else if (activeTab === 'gangwar' && !gangwarResult) {
      handleRunGangwar();
    } else if (activeTab === 'moriarty' && !moriartyResult) {
      handleRunMoriarty('HAWALA_MICRO_SMURFING_EVASION');
    }
  }, [activeTab]);

  // Handlers
  const handleSuspectChange = (e) => {
    const sId = e.target.value;
    setSelectedSuspectId(sId);
    const sObj = suspects.find(s => String(s.id) === String(sId));
    setMessages([{
      sender: 'system',
      text: `Loaded digital twin profile for: ${sObj?.name || 'Target'}. Initializing ground-truth fact-checker...`
    }]);
    setActiveContradiction(null);
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
      if (res.contradiction) setActiveContradiction(res.contradiction);
    } catch {
      setMessages(prev => [...prev, { sender: 'system', text: 'Error contacting interrogation persona.' }]);
    }
    setInterrogationLoading(false);
  };

  const handleRunStylometry = async (sampleText) => {
    const txt = sampleText || stylometryInput;
    if (!txt.trim()) return;
    if (sampleText) setStylometryInput(sampleText);
    setStylometryLoading(true);
    try {
      const res = await matchStylometry(txt);
      setStylometryResult(res);
    } catch (err) { console.error(err); }
    setStylometryLoading(false);
  };

  const handleRunAcoustics = async (audioId) => {
    setSelectedAudioCall(audioId);
    setAcousticLoading(true);
    try {
      const res = await analyzeAcoustics(audioId);
      setAcousticResult(res);
    } catch (err) { console.error(err); }
    setAcousticLoading(false);
  };

  const handleRunHawalaFluid = async (frozenIds = []) => {
    setHawalaLoading(true);
    try {
      const res = await simulateHawalaFluid(frozenIds);
      setHawalaResult(res);
    } catch (err) { console.error(err); }
    setHawalaLoading(false);
  };

  const handleRunPanic = async (sId) => {
    setSelectedPanicSuspectId(sId);
    setPanicLoading(true);
    try {
      const res = await getPanicEntropy(sId);
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
      const res = await decodeCryptolalia(txt);
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
      const res = await simulateHoneypotSting(threat, 2);
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
      const res = await runMoriartyRedteam(v);
      setMoriartyResult(res);
    } catch (err) { console.error(err); }
    setMoriartyLoading(false);
  };

  // 15 Modules Categorized into 4 Command Tiers
  const categories = {
    tactical: {
      name: ' Tactical & Kinetic Operations',
      tabs: [
        { id: 'decapitation', label: ' Decapitation Strike' },
        { id: 'ghost', label: ' Ghost Rendezvous' },
        { id: 'plate_cloning', label: ' Optical Plate-Cloning' },
        { id: 'hawala_fluid', label: ' Hawala Fluid Dynamics' }
      ]
    },
    cognitive: {
      name: ' Cognitive, Audio & Forensics',
      tabs: [
        { id: 'interrogate', label: ' Digital Twin Interrogation' },
        { id: 'panic', label: ' Panic-Entropy Profiler' },
        { id: 'honeypot', label: ' Voice-Cloned Sting Honeypot' }
      ]
    },
    wargaming: {
      name: ' Chaos, Lineage & War-Gaming',
      tabs: [
        { id: 'gangwar', label: ' Gang War Hawkes Cascade' },
        { id: 'dynasty', label: ' 30-Year Dynasty Pedigree' },
        { id: 'moriarty', label: ' Project Moriarty Red-Team' }
      ]
    },
    counterintel: {
      name: ' Counter-Intel & Cryptography',
      tabs: [
        { id: 'stylometry', label: ' Syntax DNA Stylometry' },
        { id: 'cryptolalia', label: ' Cryptolalia Dark-Slang' },
        { id: 'quantum_mole', label: ' Quantum Mole-Hunter' },
        { id: 'zk_federation', label: ' Zero-Knowledge PSI Federation' }
      ]
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl w-full max-w-6xl h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
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
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                National Security Suite: Spectral Graph Decapitation, Hawkes Chaos Point Processes, Acoustic Forensics & ZK-PSI Federation
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

          {/* 1. DECAPITATION */}
          {activeTab === 'decapitation' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-accent)] uppercase flex items-center gap-2"><FiZap /> Critical Cut-Set Spectral Percolation</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Solves the Minimum-Cut problem on the Graph Laplacian to find the minimal strike sequence that shatters the cartel.</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-[var(--neon-red)]">{decapData?.syndicate_disruption_efficiency_pct || 0}%</div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase">Disruption Efficiency</div>
                </div>
              </div>
              {decapData?.targets?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {decapData.targets.map(target => (
                    <div key={target.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 relative flex flex-col justify-between hover:border-[var(--neon-red)]">
                      <div>
                        <div className="text-xs text-[var(--text-secondary)] uppercase">{target.type}</div>
                        <div className="text-base font-bold text-white mt-1">{target.name}</div>
                        <div className="mt-2 text-xs space-y-1 text-[var(--text-secondary)]">
                          <div>Post-Strike LCC: <span className="text-[var(--text-accent)] font-mono">{target.post_strike_lcc} nodes</span></div>
                          <div>Cumulative Collapse: <span className="text-green-400 font-mono font-bold">{target.cumulative_fragmentation_pct}%</span></div>
                        </div>
                      </div>
                      {onHighlightNodes && (
                        <button onClick={() => { onHighlightNodes([target.id]); onClose(); }} className="mt-4 py-1 bg-[var(--bg-primary)] border border-[var(--text-accent)] text-[var(--text-accent)] rounded text-xs font-semibold">
                          Spotlight on Canvas
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. GHOST RENDEZVOUS */}
          {activeTab === 'ghost' && (
            <div className="space-y-4">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-accent)] uppercase flex items-center gap-2"><FiRadio /> 4D Spatiotemporal Trajectory Intersection</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Exposes covert physical meetups between suspects maintaining total digital radio silence.</p>
                </div>
                <div className="text-2xl font-mono font-bold text-[var(--text-accent)]">{ghostData?.count || 0} Events</div>
              </div>
              {ghostData?.rendezvous_events?.map((ev, i) => (
                <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3.5 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-white">{ev.person_1_name} ⟷ {ev.person_2_name} <span className="text-xs text-[var(--neon-gold)] ml-2"> {ev.location}</span></div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">{ev.evidence_chain[0]}</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--severity-critical)]">{ev.suspicion_score}% SUSPICION</span>
                </div>
              ))}
            </div>
          )}

          {/* 3. OPTICAL PLATE CLONING (NEW) */}
          {activeTab === 'plate_cloning' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-[var(--neon-gold)] uppercase flex items-center gap-2"><FiTruck /> Optical Plate-Cloning Paradox Resolver</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Detects impossible kinematic velocities (&gt;200 km/h) across highway ANPR FASTag cameras to bifurcate cloned plates into True vs Phantom decoy routes.</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-[var(--neon-gold)]">{plateResult?.cloned_plate_paradoxes_detected || 0}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase">Cloned Networks</div>
                </div>
              </div>

              {plateResult && (
                <div className="space-y-4">
                  {plateResult.resolved_paradox_cases.map((c, i) => (
                    <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                        <span className="font-mono text-base font-bold text-[var(--neon-red)]">PLATE: {c.cloned_plate_identifier}</span>
                        <span className="text-xs text-green-400 font-mono font-bold">{c.velocity_violation_status}</span>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] font-mono">{c.kinematic_paradox}</div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--neon-green)]/40 space-y-1">
                          <div className="font-bold text-[var(--neon-green)]">{c.bifurcated_trajectories.vehicle_alpha_true.designation}</div>
                          <div>Vehicle Make: {c.bifurcated_trajectories.vehicle_alpha_true.detected_make}</div>
                          <div className="text-[10px] text-[var(--text-secondary)]">Location: {c.bifurcated_trajectories.vehicle_alpha_true.sighting_location} at {c.bifurcated_trajectories.vehicle_alpha_true.timestamp}</div>
                        </div>
                        <div className="p-3 bg-[var(--bg-primary)] rounded border border-green-500/40 space-y-1">
                          <div className="font-bold text-green-400">{c.bifurcated_trajectories.vehicle_ghost_decoy.designation}</div>
                          <div>Vehicle Make: {c.bifurcated_trajectories.vehicle_ghost_decoy.detected_make}</div>
                          <div className="text-[10px] text-[var(--text-secondary)]">Location: {c.bifurcated_trajectories.vehicle_ghost_decoy.sighting_location} at {c.bifurcated_trajectories.vehicle_ghost_decoy.timestamp}</div>
                        </div>
                      </div>

                      <div className="p-2.5 bg-green-950/20 border border-green-500/30 rounded text-xs text-white">
                        <strong>Tactical Protocol: </strong>{c.tactical_interception_protocol}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. HAWALA FLUID DYNAMICS */}
              {activeTab === 'hawala_fluid' && (
                <div className="space-y-6">
                  <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--neon-gold)] uppercase flex items-center gap-2"><FiDroplet /> Navier-Stokes Financial Fluid Dynamics</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Models financial conduits as fluid pipes to simulate account freeze cascades and calculate the internal betrayal risk index.</p>
                    </div>
                    <button onClick={() => { setHawalaResult(null); handleRunHawalaFluid(); }} className="px-4 py-2 bg-[var(--neon-gold)] text-[#0a0a1a] font-bold text-xs rounded hover:opacity-90">
                      {hawalaLoading ? 'Simulating...' : 'Run Account Freeze Simulation'}
                    </button>
                  </div>
                  {hawalaResult && (
                    <>
                      <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg text-sm text-[var(--neon-gold)] font-mono">
                        {hawalaResult.tactical_fluid_assessment}
                      </div>
                      
                      {hawalaResult.frozen_target_accounts?.length > 0 && (
                        <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-3">
                          <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-2">Simulated Targets For Freezing</div>
                          <div className="flex gap-2 flex-wrap">
                            {hawalaResult.frozen_target_accounts.map(acc => (
                              <div key={acc.id} className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded text-xs">
                                ❄️ {acc.account_number}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border)] text-center">
                          <div className="text-[10px] text-[var(--text-secondary)] uppercase">Liquidity Starvation</div>
                          <div className="text-xl font-bold text-[var(--neon-red)] mt-1">{hawalaResult.fluid_pressure_metrics.downstream_liquidity_starvation_pct}%</div>
                        </div>
                        <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border)] text-center">
                          <div className="text-[10px] text-[var(--text-secondary)] uppercase">Upstream Backlog</div>
                          <div className="text-xl font-bold text-[var(--neon-gold)] mt-1">₹{(hawalaResult.fluid_pressure_metrics.upstream_backlog_conduit_inr/100000).toFixed(1)}L</div>
                        </div>
                        <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border)] text-center">
                          <div className="text-[10px] text-[var(--text-secondary)] uppercase">Mules Starved</div>
                          <div className="text-xl font-bold text-[var(--text-accent)] mt-1">{hawalaResult.fluid_pressure_metrics.isolated_downstream_mules}</div>
                        </div>
                        <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border)] text-center">
                          <div className="text-[10px] text-[var(--text-secondary)] uppercase">Betrayal Risk Index</div>
                          <div className="text-xl font-bold text-gray-400 mt-1">{hawalaResult.fluid_pressure_metrics.syndicate_internal_betrayal_risk_index}%</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 5. DIGITAL TWIN INTERROGATION */}
          {activeTab === 'interrogate' && (
            <div className="h-full flex flex-col space-y-3">
              <div className="flex justify-between items-center bg-[var(--bg-primary)] p-2.5 rounded border border-[var(--border)]">
                <select value={selectedSuspectId} onChange={handleSuspectChange} className="bg-[var(--bg-card)] border text-[var(--text-accent)] text-xs rounded px-2.5 py-1">
                  {suspects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <div className="text-[10px] text-[var(--neon-green)] font-mono">GROUND-TRUTH FACT VALIDATOR: ACTIVE</div>
              </div>
              <div className="flex-1 min-h-[260px] bg-[var(--bg-card)] border rounded p-3 overflow-y-auto space-y-2">
                {messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.sender === 'investigator' ? 'items-end' : m.sender === 'suspect' ? 'items-start' : 'items-center'}`}>
                    <div className={`max-w-[80%] rounded p-2.5 text-xs ${m.sender === 'investigator' ? 'bg-[var(--text-accent)] text-[#070714] font-medium' : m.sender === 'suspect' ? 'bg-[var(--bg-primary)] border text-white' : 'text-[10px] text-[var(--text-secondary)]'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              {activeContradiction && (
                <div className="bg-green-950/40 border-2 border-green-500/80 rounded p-2 text-xs text-white">
                  <div className="text-green-400 font-bold"><FiAlertTriangle /> LIE DETECTED: Ground-Truth Contradiction</div>
                  <div><strong>Evidence: </strong>{activeContradiction.ground_truth}</div>
                  <div className="text-[var(--neon-gold)] mt-1"><strong> Trap: </strong>{activeContradiction.recommended_trap_question}</div>
                </div>
              )}
              <div className="flex gap-2">
                <input type="text" placeholder="Ask question..." value={interrogationInput} onChange={e => setInterrogationInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendQuestion()} className="flex-1 bg-[var(--bg-primary)] border rounded px-3 py-1.5 text-xs text-white" />
                <button onClick={() => handleSendQuestion()} className="px-4 py-1.5 bg-[var(--text-accent)] text-[#0a0a1a] font-bold text-xs rounded">Interrogate</button>
              </div>
            </div>
          )}

          {/* 7. PANIC ENTROPY */}
          {activeTab === 'panic' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border flex justify-between">
                <div>
                  <h3 className="text-sm font-bold text-green-400 uppercase flex items-center gap-2"><FiActivity /> Chronobiological Shannon Entropy Profiler</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Measures temporal entropy and circadian decay to pinpoint the golden confession window.</p>
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

          {/* 8. VOICE-CLONED STING HONEYPOT (NEW) */}
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

          {/* 9. GANG WAR HAWKES CASCADE (NEW) */}
          {activeTab === 'gangwar' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-green-500 uppercase flex items-center gap-2"><FiTrendingUp /> Macro Chaos-Theory Gang War Cascade Forecaster</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Implements Spatiotemporal Hawkes Point Processes (earthquake aftershock math) to forecast non-linear 14-day retaliatory shooting cascades and target strike zones.
                  </p>
                </div>
                <button onClick={() => handleRunGangwar()} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded">
                  Re-compute Hawkes Waveform
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

          {/* 10. 30-YEAR DYNASTY PEDIGREE (NEW) */}
          {activeTab === 'dynasty' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-[var(--neon-gold)] uppercase flex items-center gap-2"><FiShare2 /> 30-Year Multi-Generational Crime Dynasty Pedigree</h3>
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

          {/* 11. PROJECT MORIARTY RED-TEAM AI (NEW) */}
          {activeTab === 'moriarty' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-green-500 uppercase flex items-center gap-2"><FiCrosshair /> Project Moriarty: Autonomous Counter-Forensic Red-Team AI</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Adversarial underworld AI that attacks CrimeNet from the outside to discover algorithmic blind spots and auto-generates defensive anomaly heuristics to patch them.
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
                    <div className="text-xs text-[var(--text-secondary)]"><strong>Moriarty Exploit Logic: </strong>{moriartyResult.moriarty_adversarial_exploit}</div>
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

          {/* 12. STYLOMETRY */}
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

          {/* 13. CRYPTOLALIA DARK SLANG */}
          {activeTab === 'cryptolalia' && (
            <div className="space-y-4">
              <div className="bg-[var(--bg-primary)] p-4 rounded border">
                <h3 className="text-sm font-bold text-[var(--neon-gold)] uppercase flex items-center gap-2"><FiVolume2 /> Autonomous Dark-Slang Decryption</h3>
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

          {/* 14. QUANTUM MOLE HUNTER */}
          {activeTab === 'quantum_mole' && (
            <div className="space-y-4">
              <div className="bg-[var(--bg-primary)] p-4 rounded border flex justify-between">
                <div>
                  <h3 className="text-sm font-bold text-green-400 uppercase flex items-center gap-2"><FiEye /> Quantum Mole-Hunter Radar</h3>
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

          {/* 15. ZERO KNOWLEDGE PSI FEDERATION */}
          {activeTab === 'zk_federation' && (
            <div className="space-y-4">
              <div className="bg-[var(--bg-primary)] p-4 rounded border flex justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-accent)] uppercase flex items-center gap-2"><FiLock /> Zero-Knowledge PSI Federation</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Discovers cross-state syndicate identifiers without disclosing non-matching confidential records.</p>
                </div>
                <div className="text-2xl font-mono font-bold text-[var(--text-accent)]">{zkResult?.verified_cross_agency_intersections || 0} Matches</div>
              </div>
              {zkResult?.federation_events?.map((ev, i) => (
                <div key={i} className="bg-[var(--bg-card)] border rounded p-3 text-xs space-y-1">
                  <div className="flex justify-between font-mono text-[var(--text-accent)] font-bold">
                    <span>[{ev.entity_type}] {ev.matched_identifier}</span>
                    <span className="text-[10px] text-[var(--neon-green)]">{ev.cryptographic_proof_hash}</span>
                  </div>
                  <div className="text-[var(--text-secondary)]">{ev.agency_1_case} ⟷ {ev.agency_2_case}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
