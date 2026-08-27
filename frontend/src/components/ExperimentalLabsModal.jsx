import React, { useState, useEffect } from 'react';
import { 
  FiX, FiTarget, FiCompass, FiCpu, FiCode, FiAlertTriangle, 
  FiCheckCircle, FiSend, FiArrowRight, FiShield, FiZap, FiRadio, 
  FiActivity, FiDroplet, FiMic, FiLock, FiEye, FiVolume2, FiSearch, FiFileText
} from 'react-icons/fi';
import { 
  getDecapitation, getGhostRendezvous, matchStylometry, 
  interrogateSuspect, getSuspectsList, analyzeAcoustics,
  simulateHawalaFluid, getPanicEntropy, getQuantumMole,
  decodeCryptolalia, getZkFederation
} from '../api/client';

export default function ExperimentalLabsModal({ onClose, onHighlightNodes }) {
  const [activeTab, setActiveTab] = useState('decapitation');
  
  // ── 1. Decapitation State ──
  const [decapData, setDecapData] = useState(null);
  const [decapLoading, setDecapLoading] = useState(false);

  // ── 2. Ghost Rendezvous State ──
  const [ghostData, setGhostData] = useState(null);
  const [ghostLoading, setGhostLoading] = useState(false);

  // ── 3. Interrogation State ──
  const [suspects, setSuspects] = useState([]);
  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [interrogationInput, setInterrogationInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [interrogationLoading, setInterrogationLoading] = useState(false);
  const [activeContradiction, setActiveContradiction] = useState(null);

  // ── 4. Stylometry State ──
  const [stylometryInput, setStylometryInput] = useState('');
  const [stylometryResult, setStylometryResult] = useState(null);
  const [stylometryLoading, setStylometryLoading] = useState(false);

  // ── 5. Ghost Acoustic State ──
  const [acousticResult, setAcousticResult] = useState(null);
  const [acousticLoading, setAcousticLoading] = useState(false);
  const [selectedAudioCall, setSelectedAudioCall] = useState('intercept_call_001');

  // ── 6. Hawala Fluid Dynamics State ──
  const [hawalaResult, setHawalaResult] = useState(null);
  const [hawalaLoading, setHawalaLoading] = useState(false);

  // ── 7. Panic Entropy State ──
  const [panicResult, setPanicResult] = useState(null);
  const [panicLoading, setPanicLoading] = useState(false);
  const [selectedPanicSuspectId, setSelectedPanicSuspectId] = useState('');

  // ── 8. Quantum Mole Hunter State ──
  const [moleResult, setMoleResult] = useState(null);
  const [moleLoading, setMoleLoading] = useState(false);

  // ── 9. Cryptolalia Slang State ──
  const [cryptolaliaInput, setCryptolaliaInput] = useState('bhaiji 50 peti aur gulab jamun ready hai... chidiya ka arrangement karlo jaldi');
  const [cryptolaliaResult, setCryptolaliaResult] = useState(null);
  const [cryptolaliaLoading, setCryptolaliaLoading] = useState(false);

  // ── 10. ZK Federation State ──
  const [zkResult, setZkResult] = useState(null);
  const [zkLoading, setZkLoading] = useState(false);

  // Load Suspects List on mount for Interrogation & Panic tabs
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

  // Fetch data on tab switch
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
    setStylometryResult(null);
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

  const tabsList = [
    // Tier 1: Tactical & Kinetic Operations
    { id: 'decapitation', label: '⚔️ Decapitation', category: 'Tactical' },
    { id: 'ghost', label: '🛰️ Ghost Rendezvous', category: 'Tactical' },
    { id: 'hawala_fluid', label: '🌊 Hawala Fluid Dynamics', category: 'Tactical' },
    // Tier 2: Cognitive, Audio & Forensic AI
    { id: 'interrogate', label: '🎭 Digital Twin Interrogation', category: 'Cognitive & Audio' },
    { id: 'acoustic', label: '🎙️ Ghost-Acoustic Geo-Triangulation', category: 'Cognitive & Audio' },
    { id: 'panic', label: '🧠 Panic-Entropy Profiler', category: 'Cognitive & Audio' },
    // Tier 3: Counter-Intel, Slang & Cryptography
    { id: 'stylometry', label: '🧬 Syntax DNA Stylometry', category: 'Counter-Intel & Crypto' },
    { id: 'cryptolalia', label: '🗣️ Cryptolalia Dark-Slang', category: 'Counter-Intel & Crypto' },
    { id: 'quantum_mole', label: '🕳️ Quantum Mole-Hunter', category: 'Counter-Intel & Crypto' },
    { id: 'zk_federation', label: '🔐 Zero-Knowledge PSI Federation', category: 'Counter-Intel & Crypto' }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl w-full max-w-6xl h-[88vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center px-6 py-3.5 border-b border-[var(--border)] bg-[var(--bg-primary)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--text-accent)]/10 border border-[var(--text-accent)] rounded-lg text-[var(--text-accent)]">
              <FiCpu size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wider text-[var(--text-primary)] uppercase">
                  Black-Ops Experimental Labs
                </h2>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono font-bold border border-red-500/30">
                  TOP SECRET / SIH-MHA
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                10 Bleeding-Edge Computational Intelligence, Multi-Agent Wargaming, Acoustic Forensics & ZK-Crypto Engines
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white p-2 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Tab Navigation Scrollbar */}
        <div className="flex overflow-x-auto border-b border-[var(--border)] bg-[var(--bg-card)] px-2 py-1 gap-1">
          {tabsList.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-semibold whitespace-nowrap rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[var(--text-accent)] text-[#0a0a1a] shadow-[0_0_10px_rgba(100,255,218,0.4)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#070714]">

          {/* ══════════════════════════════════════════════════════════════
              TAB 1: DECAPITATION
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'decapitation' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-accent)] uppercase tracking-wider flex items-center gap-2">
                    <FiZap /> Critical Cut-Set Spectral Percolation
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Solves the Minimum-Cut problem on the Graph Laplacian matrix to find the exact strike sequence of warrants that shatters the cartel into isolated fragments.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-[var(--neon-red)]">
                    {decapData?.syndicate_disruption_efficiency_pct || 0}%
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase">Disruption Efficiency</div>
                </div>
              </div>

              {decapLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--text-accent)] mb-3"></div>
                  <span className="text-xs">Computing Spectral Graph Laplacian cuts...</span>
                </div>
              ) : decapData?.targets?.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {decapData.targets.map((target) => (
                      <div key={target.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 relative overflow-hidden flex flex-col justify-between hover:border-[var(--neon-red)] transition-colors">
                        <div className="absolute top-0 right-0 bg-red-500/20 text-red-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-bl">
                          STRIKE #{target.strike_order}
                        </div>
                        <div>
                          <div className="text-xs text-[var(--text-secondary)] uppercase">{target.type}</div>
                          <div className="text-base font-bold text-[var(--text-primary)] mt-1">{target.name}</div>
                          
                          <div className="mt-3 space-y-1 text-xs">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[var(--text-secondary)]">Post-Strike LCC:</span>
                              <span className="font-mono text-[var(--text-accent)]">{target.post_strike_lcc} nodes</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[var(--text-secondary)]">Cumulative Collapse:</span>
                              <span className="font-mono font-bold text-red-400">{target.cumulative_fragmentation_pct}%</span>
                            </div>
                          </div>

                          <div className="mt-3 p-2 bg-[var(--bg-primary)] rounded border border-[var(--border)] text-[10px] text-[var(--text-secondary)] italic">
                            "{target.tactical_rationale}"
                          </div>
                        </div>

                        {onHighlightNodes && (
                          <button
                            onClick={() => { onHighlightNodes([target.id]); onClose(); }}
                            className="mt-4 w-full py-1.5 bg-[var(--bg-primary)] hover:bg-[var(--text-accent)] hover:text-[#0a0a1a] text-[var(--text-accent)] border border-[var(--text-accent)] rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                          >
                            <FiTarget size={12} /> Spotlight on Canvas
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded text-xs text-[var(--text-secondary)]">
                    <span className="text-[var(--text-accent)] font-bold">Strategic Summary: </span>{decapData.summary}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 2: GHOST RENDEZVOUS
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'ghost' && (
            <div className="space-y-4">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-accent)] uppercase flex items-center gap-2">
                    <FiRadio /> 4D Spatiotemporal Trajectory Intersection
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Detects physical encounters between suspects maintaining total radio silence (zero calls/transfers).
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-[var(--text-accent)]">{ghostData?.count || 0}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase">Covert Events</div>
                </div>
              </div>

              {ghostData?.rendezvous_events?.map((ev, i) => (
                <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3.5 hover:border-[var(--text-accent)]">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="text-sm font-bold text-[var(--text-primary)]">
                      {ev.person_1_name} <span className="text-[var(--text-accent)]">⟷</span> {ev.person_2_name} 
                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--neon-gold)]">📍 {ev.location}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[var(--severity-critical)]">{ev.suspicion_score}% SUSPICION</span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] space-y-0.5">
                    {ev.evidence_chain.map((ed, idx) => (
                      <div key={idx}>• {ed}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 3: HAWALA FLUID DYNAMICS (NEW)
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'hawala_fluid' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-[var(--neon-gold)] uppercase flex items-center gap-2">
                    <FiDroplet /> Navier-Stokes Financial Fluid Dynamics & Flash-Crash Trap
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Models transaction conduits as compressible fluid pipes to simulate targeted account blockades and compute the internal syndicate betrayal probability.
                  </p>
                </div>
                <button
                  onClick={() => handleRunHawalaFluid()}
                  disabled={hawalaLoading}
                  className="px-4 py-2 bg-[var(--neon-gold)] hover:opacity-90 text-[#0a0a1a] font-bold text-xs rounded-lg transition-all"
                >
                  {hawalaLoading ? 'Simulating...' : 'Run Account Freeze Simulation'}
                </button>
              </div>

              {hawalaResult && hawalaResult.status === 'success' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-[var(--bg-card)] p-3.5 rounded border border-[var(--border)] text-center">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Downstream Starvation</div>
                      <div className="text-xl font-bold font-mono text-[var(--neon-red)]">
                        {hawalaResult.fluid_pressure_metrics.downstream_liquidity_starvation_pct}%
                      </div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-3.5 rounded border border-[var(--border)] text-center">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Upstream Backlog</div>
                      <div className="text-xl font-bold font-mono text-[var(--neon-gold)]">
                        ₹{(hawalaResult.fluid_pressure_metrics.upstream_backlog_conduit_inr / 100000).toFixed(1)} Lakhs
                      </div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-3.5 rounded border border-[var(--border)] text-center">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Isolated Mule Accounts</div>
                      <div className="text-xl font-bold font-mono text-[var(--text-accent)]">
                        {hawalaResult.fluid_pressure_metrics.isolated_downstream_mules}
                      </div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-3.5 rounded border border-[var(--border)] text-center">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Internal Betrayal Index</div>
                      <div className="text-xl font-bold font-mono text-purple-400">
                        {hawalaResult.fluid_pressure_metrics.syndicate_internal_betrayal_risk_index}%
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-lg text-xs leading-relaxed text-[var(--text-primary)]">
                    <span className="text-purple-400 font-bold uppercase">Tactical Flash-Crash Assessment: </span>
                    {hawalaResult.tactical_fluid_assessment}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 4: DIGITAL TWIN INTERROGATION
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'interrogate' && (
            <div className="h-full flex flex-col space-y-3">
              <div className="flex justify-between items-center bg-[var(--bg-primary)] p-2.5 rounded border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-[var(--text-secondary)]">Suspect Twin:</label>
                  <select 
                    value={selectedSuspectId}
                    onChange={handleSuspectChange}
                    className="bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-accent)] rounded px-2.5 py-1 text-xs"
                  >
                    {suspects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="text-[10px] text-[var(--neon-green)] flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-ping"></span>
                  GROUND-TRUTH FACT VALIDATOR: ACTIVE
                </div>
              </div>

              <div className="flex-1 min-h-[260px] bg-[var(--bg-card)] border border-[var(--border)] rounded p-3.5 overflow-y-auto space-y-2.5">
                {messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.sender === 'investigator' ? 'items-end' : m.sender === 'suspect' ? 'items-start' : 'items-center'}`}>
                    <div className={`max-w-[80%] rounded p-2.5 text-xs ${m.sender === 'investigator' ? 'bg-[var(--text-accent)] text-[#070714] font-medium' : m.sender === 'suspect' ? 'bg-[var(--bg-primary)] border border-[var(--border)] text-white' : 'text-[10px] text-[var(--text-secondary)]'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {activeContradiction && (
                <div className="bg-red-950/40 border-2 border-red-500/80 rounded p-2.5 text-xs">
                  <div className="text-red-400 font-bold flex items-center gap-1.5"><FiAlertTriangle /> LIE DETECTED: Ground-Truth Contradiction</div>
                  <div className="text-white mt-1"><strong>Evidence: </strong>{activeContradiction.ground_truth}</div>
                  <div className="text-[var(--neon-gold)] mt-1"><strong>🎯 Recommended Trap: </strong>{activeContradiction.recommended_trap_question}</div>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask interrogation question..."
                  value={interrogationInput}
                  onChange={e => setInterrogationInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendQuestion()}
                  className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-3 py-1.5 text-xs text-white"
                />
                <button onClick={() => handleSendQuestion()} className="px-4 py-1.5 bg-[var(--text-accent)] text-[#0a0a1a] font-bold text-xs rounded flex items-center gap-1">
                  <FiSend /> Interrogate
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 5: PROJECT GHOST-ACOUSTIC (NEW)
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'acoustic' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-accent)] uppercase flex items-center gap-2">
                    <FiMic /> Micro-Ambient Acoustic Geo-Triangulation
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Decomposes sub-audible background noise behind intercepted calls (50Hz grid micro-drift, railway horn resonance, room reverberation decay).
                  </p>
                </div>
                <div className="flex gap-2">
                  {['intercept_call_001', 'intercept_call_002', 'intercept_call_003'].map((callId, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRunAcoustics(callId)}
                      className={`text-xs px-3 py-1.5 rounded border transition-all ${selectedAudioCall === callId ? 'bg-[var(--text-accent)] text-[#0a0a1a] font-bold border-transparent' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}
                    >
                      Intercept #{idx+1}
                    </button>
                  ))}
                </div>
              </div>

              {acousticResult && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border)]">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Triangulated Region</div>
                      <div className="text-base font-bold text-[var(--text-accent)] mt-1">{acousticResult.triangulated_region}</div>
                      <div className="text-xs text-[var(--neon-gold)] mt-1">📍 {acousticResult.estimated_coordinates.city}</div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border)]">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Uncertainty Radius</div>
                      <div className="text-2xl font-bold font-mono text-[var(--neon-green)] mt-1">{acousticResult.geo_uncertainty_radius_meters}m</div>
                      <div className="text-[10px] text-[var(--text-secondary)] mt-1">Tightened via Doppler Harmonics</div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border)]">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Acoustic Confidence</div>
                      <div className="text-2xl font-bold font-mono text-purple-400 mt-1">{acousticResult.overall_acoustic_confidence_pct}%</div>
                      <div className="text-[10px] text-[var(--text-secondary)] mt-1">Signal-to-Noise: {acousticResult.signal_to_noise_ratio_db} dB</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[var(--bg-card)] p-3.5 rounded border border-[var(--border)] space-y-1.5">
                      <div className="font-bold text-[var(--text-accent)]">⚡ Layer 1: 50Hz Mains Electrical Grid Hum</div>
                      <div>Fundamental: <strong>{acousticResult.decomposed_forensic_layers.layer_1_grid_hum.detected_fundamental_hz} Hz</strong></div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{acousticResult.decomposed_forensic_layers.layer_1_grid_hum.regional_grid_match}</div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-3.5 rounded border border-[var(--border)] space-y-1.5">
                      <div className="font-bold text-[var(--neon-gold)]">🚆 Layer 2: Locomotive Acoustic Signature</div>
                      <div>Matched: <strong>{acousticResult.decomposed_forensic_layers.layer_2_locomotive_acoustics.detected_signatures[0]}</strong></div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{acousticResult.decomposed_forensic_layers.layer_2_locomotive_acoustics.railway_corridor_correlation}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)]">
                    <span className="text-[var(--text-accent)] font-bold">Tactical Acoustic Assessment: </span>
                    {acousticResult.tactical_assessment}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 6: COGNITIVE EXHAUST & PANIC ENTROPY (NEW)
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'panic' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-red-400 uppercase flex items-center gap-2">
                    <FiActivity /> Chronobiological Shannon Entropy & Confession Window Predictor
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Measures temporal entropy and circadian decay to pinpoint the golden window when suspect will confess.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedPanicSuspectId}
                    onChange={e => handleRunPanic(e.target.value)}
                    className="bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-accent)] text-xs rounded px-3 py-1.5"
                  >
                    {suspects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {panicResult && panicResult.status === 'success' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border)] text-center">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Panic Entropy Index</div>
                      <div className="text-3xl font-bold font-mono text-red-500 mt-1">
                        {panicResult.panic_entropy_metrics.panic_entropy_index_pct}%
                      </div>
                      <div className="text-[10px] text-red-400 mt-1">{panicResult.panic_entropy_metrics.circadian_regularity_status}</div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border)] text-center">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Approver / Confession Probability</div>
                      <div className="text-3xl font-bold font-mono text-[var(--neon-green)] mt-1">
                        {panicResult.panic_entropy_metrics.confession_approver_probability_pct}%
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] mt-1">Section 306 CrPC / BNSS Candidate</div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border)] text-center">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Temporal Shannon Entropy</div>
                      <div className="text-3xl font-bold font-mono text-[var(--neon-gold)] mt-1">
                        {panicResult.panic_entropy_metrics.temporal_shannon_entropy_bits} bits
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] mt-1">{panicResult.panic_entropy_metrics.nocturnal_call_spike_ratio}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-red-950/20 border border-red-500/40 rounded-lg text-xs leading-relaxed text-white">
                    <span className="text-red-400 font-bold uppercase">🚨 Golden Arrest Window: </span>
                    {panicResult.tactical_psychological_assessment}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 7: STYLOMETRY
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'stylometry' && (
            <div className="space-y-4">
              <div className="bg-[var(--bg-primary)] p-4 rounded border border-[var(--border)]">
                <h3 className="text-sm font-bold text-[var(--text-accent)] uppercase flex items-center gap-2"><FiCode /> Hinglish Syntax DNA Matcher</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Attributes extortion SMS & dark-web posts to known suspects based on dialect syntax markers.</p>
              </div>

              <div className="flex gap-2">
                {[
                  { label: 'Extortion Threat', text: 'CALL KYUN NAHI UTHA RAHA HAI?! Aakhri baar bol raha hu... hafta nahi diya toh parivar khatam!!' },
                  { label: 'Hawala Ledger', text: 'account number bhej diya... party se 50 peti confirm karo... entry match honi chahiye' }
                ].map((s, i) => (
                  <button key={i} onClick={() => handleRunStylometry(s.text)} className="text-xs bg-[var(--bg-card)] px-3 py-1.5 rounded border border-[var(--border)] hover:text-white">
                    {s.label}
                  </button>
                ))}
              </div>

              {stylometryResult && (
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded space-y-2">
                  <div className="text-sm font-bold text-[var(--neon-green)]">Top Attribution: {stylometryResult.top_attribution} ({stylometryResult.top_confidence}%)</div>
                  <div className="text-xs text-[var(--text-secondary)]">{stylometryResult.summary}</div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 8: CRYPTOLALIA DARK-SLANG (NEW)
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'cryptolalia' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)]">
                <h3 className="text-sm font-bold text-[var(--neon-gold)] uppercase flex items-center gap-2">
                  <FiVolume2 /> Autonomous Dark-Slang Evolving Decryption (Cryptolalia Radar)
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Auto-translates masked underworld code words (mithai, gulab jamun, peti, chidiya, patakha) into plain English intelligence.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={cryptolaliaInput}
                  onChange={e => setCryptolaliaInput(e.target.value)}
                  placeholder="Paste intercepted coded underworld slang..."
                  className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-4 py-2 text-xs font-mono text-white"
                />
                <button
                  onClick={() => handleRunCryptolalia()}
                  className="px-5 py-2 bg-[var(--neon-gold)] text-[#0a0a1a] font-bold text-xs rounded hover:opacity-90"
                >
                  Decipher Coded Slang
                </button>
              </div>

              {cryptolaliaResult && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg space-y-2">
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase">Decrypted Plain-Text Intelligence Summary:</div>
                    <div className="text-sm font-mono leading-relaxed text-[var(--text-accent)] p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
                      {cryptolaliaResult.decrypted_intelligence_translation}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {cryptolaliaResult.decrypted_lexicon_breakdown.map((t, idx) => (
                      <div key={idx} className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border)]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono font-bold text-[var(--neon-gold)]">"{t.slang_term}"</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">{t.threat_severity}</span>
                        </div>
                        <div className="text-xs font-semibold text-white">{t.decrypted_meaning}</div>
                        <div className="text-[10px] text-[var(--text-secondary)] mt-1">Category: {t.category}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 9: QUANTUM MOLE-HUNTER (NEW)
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'quantum_mole' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-red-400 uppercase flex items-center gap-2">
                    <FiEye /> Quantum Mole-Hunter: Negative-Topology Insider Leak Radar
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Detects compromised police personnel by correlating confidential internal database file lookups with immediate external cartel defensive shifts occurring within 120 minutes.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-red-500">{moleResult?.flagged_insider_anomalies || 0}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase">Compromised Leads</div>
                </div>
              </div>

              {moleResult && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  {moleResult.leak_detections.map((m, idx) => (
                    <div key={idx} className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border)] hover:border-red-500 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{m.officer_name}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-[var(--bg-primary)] rounded text-[var(--text-secondary)] font-mono">{m.officer_badge}</span>
                          <span className="text-xs text-[var(--neon-gold)]">📍 {m.department}</span>
                        </div>
                        <div className="text-sm font-bold font-mono text-red-400">{m.leak_correlation_index_pct}% LEAK CORRELATION</div>
                      </div>

                      <div className="text-xs text-[var(--text-secondary)] space-y-1">
                        <div>• <strong>File Looked Up: </strong><span className="font-mono text-white">{m.compromised_file}</span> at {m.access_timestamp}</div>
                        <div>• <strong>Cartel Evasion Action: </strong><span className="text-red-300">{m.cartel_defensive_action}</span></div>
                      </div>
                    </div>
                  ))}

                  <div className="p-3 bg-red-950/20 border border-red-500/30 rounded text-xs text-white">
                    <span className="text-red-400 font-bold uppercase">Counter-Espionage Action: </span>
                    {moleResult.tactical_counter_espionage_guidance}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 10: ZERO-KNOWLEDGE FEDERATION (NEW)
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'zk_federation' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-accent)] uppercase flex items-center gap-2">
                    <FiLock /> Zero-Knowledge Private Set Intersection (PSI) Graph Federation
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Allows Maharashtra ATS, UP-STF, and Delhi Police to discover intersecting syndicate identifiers across state borders without disclosing confidential non-matching records.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-[var(--text-accent)]">{zkResult?.verified_cross_agency_intersections || 0}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase">Verified PSI Matches</div>
                </div>
              </div>

              {zkResult && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  {zkResult.federation_events.map((ev, idx) => (
                    <div key={idx} className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border)] hover:border-[var(--text-accent)] transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-bold text-sm text-[var(--text-accent)] font-mono flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-primary)] text-white">{ev.entity_type}</span>
                          <span>{ev.matched_identifier}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--neon-green)] bg-[var(--neon-green)]/10 px-2 py-0.5 rounded border border-[var(--neon-green)]/30">
                          {ev.cryptographic_proof_hash}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
                          <span className="text-[10px] text-[var(--text-secondary)] uppercase">Jurisdiction 1: </span>
                          <div className="font-medium text-white mt-0.5">{ev.agency_1_case}</div>
                        </div>
                        <div className="p-2 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
                          <span className="text-[10px] text-[var(--text-secondary)] uppercase">Jurisdiction 2: </span>
                          <div className="font-medium text-white mt-0.5">{ev.agency_2_case}</div>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] text-[var(--neon-gold)] flex justify-between">
                        <span>🛡️ {ev.zero_knowledge_guarantee}</span>
                        <span className="font-bold text-red-400">{ev.syndicate_interstate_threat}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
