import React, { useState, useEffect } from 'react';
import { 
  FiX, FiTarget, FiCompass, FiCpu, FiCode, FiAlertTriangle, 
  FiCheckCircle, FiSend, FiArrowRight, FiShield, FiZap, FiRadio, FiActivity
} from 'react-icons/fi';
import { 
  getDecapitation, getGhostRendezvous, matchStylometry, 
  interrogateSuspect, getSuspectsList 
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

  // Initial load for active tab
  useEffect(() => {
    if (activeTab === 'decapitation' && !decapData) {
      setDecapLoading(true);
      getDecapitation().then(res => {
        setDecapData(res);
        setDecapLoading(false);
      }).catch(() => setDecapLoading(false));
    } else if (activeTab === 'ghost' && !ghostData) {
      setGhostLoading(true);
      getGhostRendezvous().then(res => {
        setGhostData(res);
        setGhostLoading(false);
      }).catch(() => setGhostLoading(false));
    } else if (activeTab === 'interrogate' && suspects.length === 0) {
      getSuspectsList().then(res => {
        const sList = res.suspects || [];
        setSuspects(sList);
        if (sList.length > 0) {
          setSelectedSuspectId(sList[0].id);
          setMessages([{
            sender: 'system',
            text: `Connected to suspect digital persona: ${sList[0].name}. Ask about their whereabouts, associates, or banking records.`
          }]);
        }
      });
    }
  }, [activeTab]);

  // Handle Suspect Switch in Interrogation
  const handleSuspectChange = (e) => {
    const sId = e.target.value;
    setSelectedSuspectId(sId);
    const sObj = suspects.find(s => String(s.id) === String(sId));
    setMessages([{
      sender: 'system',
      text: `Loaded digital twin profile for: ${sObj?.name || 'Target'}. Initializing real-time ground-truth validator...`
    }]);
    setActiveContradiction(null);
  };

  // Submit Interrogation Question
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
      }
    } catch {
      setMessages(prev => [...prev, { sender: 'system', text: 'Error contacting interrogation persona.' }]);
    }
    setInterrogationLoading(false);
  };

  // Run Stylometry Match
  const handleRunStylometry = async (sampleText) => {
    const txt = sampleText || stylometryInput;
    if (!txt.trim()) return;
    if (sampleText) setStylometryInput(sampleText);
    setStylometryLoading(true);
    setStylometryResult(null);

    try {
      const res = await matchStylometry(txt);
      setStylometryResult(res);
    } catch (err) {
      console.error(err);
    }
    setStylometryLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-primary)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--text-accent)]/10 border border-[var(--text-accent)] rounded-lg text-[var(--text-accent)]">
              <FiCpu size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wider text-[var(--text-primary)] uppercase">
                  Black-Ops Experimental Labs
                </h2>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono font-bold border border-red-500/30">
                  CLASSIFIED
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Next-Gen Computational Intelligence, Spectral Percolation & Forensic AI Modules
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white p-2 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--border)] bg-[var(--bg-card)] px-4">
          {[
            { id: 'decapitation', label: '⚔️ Algorithmic Decapitation', desc: 'Spectral Cut & Syndicate Disruption' },
            { id: 'ghost', label: '🛰️ Ghost Rendezvous', desc: '4D Trajectory Co-Location Radar' },
            { id: 'interrogate', label: '🎭 Digital Twin Interrogation', desc: 'Live Lie & Contradiction Engine' },
            { id: 'stylometry', label: '🧬 Syntax DNA Stylometry', desc: 'Hinglish Chat & SMS De-Anonymizer' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 text-left transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-[var(--text-accent)] bg-[var(--bg-card-hover)] text-[var(--text-accent)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-white'
              }`}
            >
              <div className="text-xs font-bold">{tab.label}</div>
              <div className="text-[10px] opacity-70 truncate">{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#070714]">

          {/* ══════════════════════════════════════════════════════════════
              TAB 1: ALGORITHMIC DECAPITATION
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'decapitation' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-accent)] uppercase tracking-wider flex items-center gap-2">
                    <FiZap /> Critical Cut-Set Percolation Theory
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Instead of arresting high-degree figureheads, this engine solves the Minimum-Cut problem on the Graph Laplacian, isolating critical articulation points that cause maximal topological fragmentation of the cartel.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-[var(--neon-red)]">
                    {decapData?.syndicate_disruption_efficiency_pct || 0}%
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Disruption Index</div>
                </div>
              </div>

              {decapLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--text-accent)] mb-3"></div>
                  <span className="text-xs">Computing Spectral Graph Laplacian cuts...</span>
                </div>
              ) : decapData?.targets?.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Recommended Sequential Strike Protocol ({decapData.targets.length} Targeted Arrests)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {decapData.targets.map((target, i) => (
                      <div key={target.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 relative overflow-hidden flex flex-col justify-between hover:border-[var(--neon-red)] transition-colors">
                        <div className="absolute top-0 right-0 bg-red-500/20 text-red-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-bl">
                          STRIKE #{target.strike_order}
                        </div>
                        <div>
                          <div className="text-xs text-[var(--text-secondary)] uppercase">{target.type}</div>
                          <div className="text-base font-bold text-[var(--text-primary)] mt-1">{target.name}</div>
                          
                          <div className="mt-3 space-y-1.5 text-xs">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[var(--text-secondary)]">Betweenness Nexus:</span>
                              <span className="font-mono text-[var(--neon-gold)]">{target.betweenness}</span>
                            </div>
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
                            onClick={() => {
                              onHighlightNodes([target.id]);
                              onClose();
                            }}
                            className="mt-4 w-full py-1.5 bg-[var(--bg-primary)] hover:bg-[var(--text-accent)] hover:text-[#0a0a1a] text-[var(--text-accent)] border border-[var(--text-accent)] rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                          >
                            <FiTarget size={12} /> Spotlight on Canvas
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded text-xs text-[var(--text-secondary)]">
                    <span className="text-[var(--text-accent)] font-bold">Executive Strategic Summary: </span>
                    {decapData.summary}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-[var(--text-secondary)] text-sm">
                  Upload network data (FIRs, CDRs, Financials) to compute tactical decapitation cuts.
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 2: SPATIOTEMPORAL GHOST RENDEZVOUS
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'ghost' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)] flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-accent)] uppercase tracking-wider flex items-center gap-2">
                    <FiRadio /> 4D Spatiotemporal Trajectory Intersection
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Uncovers covert physical rendezvous between cartel operators who maintain strict telecom silence (never call or text each other), but whose vehicle plates or FIR geolocations intersect in spacetime.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-[var(--text-accent)]">
                    {ghostData?.count || 0}
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Covert Events</div>
                </div>
              </div>

              {ghostLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--text-accent)] mb-3"></div>
                  <span className="text-xs">Correlating continuous vehicle ANPR & station co-location trajectories...</span>
                </div>
              ) : ghostData?.rendezvous_events?.length > 0 ? (
                <div className="space-y-3">
                  {ghostData.rendezvous_events.map((ev, i) => (
                    <div key={ev.id || i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--text-accent)] transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[var(--text-primary)]">{ev.person_1_name}</span>
                          <FiArrowRight className="text-[var(--text-accent)]" />
                          <span className="text-sm font-bold text-[var(--text-primary)]">{ev.person_2_name}</span>
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--neon-gold)]">
                            📍 {ev.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-[var(--severity-critical)]">
                            {ev.suspicion_score}% SUSPICION
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 mt-2">
                        {ev.evidence_chain.map((ed, idx) => (
                          <div key={idx} className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-accent)] shrink-0"></span>
                            <span>{ed}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 pt-2 border-t border-[var(--border)] flex justify-between items-center text-[10px]">
                        <span className="text-[var(--text-secondary)]">Temporal Window: {ev.timestamp_window}</span>
                        <span className="text-red-400 font-mono font-medium">{ev.tactical_assessment}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-[var(--text-secondary)] text-sm">
                  No covert physical rendezvous detected across current dataset.
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 3: DIGITAL TWIN INTERROGATION ROOM
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'interrogate' && (
            <div className="h-full flex flex-col space-y-4">
              
              {/* Suspect Selector & HUD */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-[var(--text-secondary)] uppercase font-semibold">Select Suspect Persona:</label>
                  <select 
                    value={selectedSuspectId}
                    onChange={handleSuspectChange}
                    className="bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-accent)] rounded px-3 py-1 text-xs focus:outline-none focus:border-[var(--text-accent)]"
                  >
                    {suspects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Risk: {(s.risk_score * 100 || 0).toFixed(0)}%)</option>
                    ))}
                  </select>
                </div>

                <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-ping"></span>
                  <span>Ground-Truth Contradiction Engine: <strong>ACTIVE</strong></span>
                </div>
              </div>

              {/* Chat Window */}
              <div className="flex-1 min-h-[280px] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 overflow-y-auto space-y-3">
                {messages.map((m, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col ${
                      m.sender === 'investigator' ? 'items-end' : m.sender === 'suspect' ? 'items-start' : 'items-center'
                    }`}
                  >
                    {m.sender === 'system' ? (
                      <div className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-[var(--border)] px-3 py-1 rounded-full text-center max-w-md">
                        {m.text}
                      </div>
                    ) : (
                      <div className={`max-w-[75%] rounded-lg p-3 text-xs leading-relaxed ${
                        m.sender === 'investigator'
                          ? 'bg-[var(--text-accent)] text-[#070714] font-medium'
                          : 'bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)]'
                      }`}>
                        <div className="text-[9px] uppercase font-bold tracking-wider mb-1 opacity-70">
                          {m.sender === 'investigator' ? 'Investigating Officer' : 'Suspect Persona'}
                        </div>
                        {m.text}
                      </div>
                    )}
                  </div>
                ))}
                {interrogationLoading && (
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] italic">
                    <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-[var(--text-accent)]"></div>
                    Suspect is formulating alibi...
                  </div>
                )}
              </div>

              {/* Contradiction Alert Box */}
              {activeContradiction && (
                <div className="bg-red-950/40 border-2 border-red-500/80 rounded-lg p-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <FiAlertTriangle className="animate-bounce" /> 
                    LIE DETECTED: Ground-Truth Fact Contradiction
                  </div>
                  <div className="text-xs text-[var(--text-primary)]">
                    <strong>Evidence: </strong>{activeContradiction.ground_truth}
                  </div>
                  <div className="mt-2 p-2 bg-black/50 rounded border border-red-500/30 text-xs text-[var(--neon-gold)]">
                    <strong>🎯 Recommended Trap Question: </strong>{activeContradiction.recommended_trap_question}
                  </div>
                </div>
              )}

              {/* Quick Trap Prompts */}
              <div className="flex flex-wrap gap-2">
                {[
                  "Where were you on the night of the incident?",
                  "Why did your bank account transfer funds to a shell account?",
                  "Do you know the other co-accused in this syndicate?"
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendQuestion(q)}
                    className="text-[10px] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white px-2.5 py-1 rounded transition-colors"
                  >
                    "{q}"
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type interrogation question (e.g., whereabouts, bank transfers, associates)..."
                  value={interrogationInput}
                  onChange={e => setInterrogationInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendQuestion()}
                  className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-[var(--text-accent)] text-[var(--text-primary)]"
                />
                <button
                  onClick={() => handleSendQuestion()}
                  disabled={interrogationLoading}
                  className="px-5 py-2 bg-[var(--text-accent)] hover:opacity-90 text-[#070714] font-bold text-xs rounded-lg transition-opacity flex items-center gap-1.5"
                >
                  <FiSend /> Interrogate
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 4: SYNTAX DNA STYLOMETRY
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'stylometry' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border)]">
                <h3 className="text-sm font-bold text-[var(--text-accent)] uppercase tracking-wider flex items-center gap-2">
                  <FiCode /> Cross-Platform Hinglish & Cybercrime Syntax Fingerprinter
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Paste unclassified extortion SMS, dark-web chats, or Telegram snippets. The engine evaluates Hinglish dialect markers, casing entropy, and punctuation DNA against suspect profiles.
                </p>
              </div>

              {/* Sample Messages */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold">Load Sample Intercept:</span>
                {[
                  { label: 'Extortion Threat SMS', text: 'CALL KYUN NAHI UTHA RAHA HAI?! Aakhri baar bol raha hu... hafta nahi diya toh parivar khatam!!' },
                  { label: 'Hawala Transfer Note', text: 'account number bhej diya... party se 50 peti confirm karo... entry match honi chahiye' },
                  { label: 'Cyber SIM Box Chat', text: '64 channel sim box online hai... new otp bypass link ready... usdt wallet check karo bro' }
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRunStylometry(s.text)}
                    className="text-[10px] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white px-2.5 py-1 rounded transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex flex-col gap-2">
                <textarea
                  rows={3}
                  value={stylometryInput}
                  onChange={e => setStylometryInput(e.target.value)}
                  placeholder="Paste unclassified text, WhatsApp/Telegram intercept, or extortion note..."
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-3 text-xs focus:outline-none focus:border-[var(--text-accent)] text-[var(--text-primary)] font-mono"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => handleRunStylometry()}
                    disabled={stylometryLoading || !stylometryInput.trim()}
                    className="px-6 py-2 bg-[var(--text-accent)] text-[#070714] font-bold text-xs rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    {stylometryLoading ? 'Analyzing Syntax DNA...' : 'Run Stylometric DNA Attribution'}
                  </button>
                </div>
              </div>

              {/* Results */}
              {stylometryResult && stylometryResult.status === 'success' && (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 space-y-4 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
                    <div>
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Top Match Attribution</div>
                      <div className="text-lg font-bold text-[var(--neon-green)] flex items-center gap-2">
                        <FiCheckCircle /> {stylometryResult.top_attribution}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-mono font-bold text-[var(--text-accent)]">
                        {stylometryResult.top_confidence}%
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Confidence Score</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Suspect Attribution Ranking
                    </h4>
                    {stylometryResult.suspect_rankings.map((s, idx) => (
                      <div key={idx} className="bg-[var(--bg-primary)] p-3 rounded border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-sm text-[var(--text-primary)]">
                            {s.suspect_name} <span className="text-xs text-[var(--text-secondary)] font-normal">({s.alias})</span>
                          </div>
                          <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                            {s.evidence.join(' • ')}
                          </div>
                          {s.matched_markers.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {s.matched_markers.map((m, mIdx) => (
                                <span key={mIdx} className="text-[9px] bg-[var(--text-accent)]/10 text-[var(--text-accent)] border border-[var(--text-accent)]/30 px-1.5 py-0.5 rounded font-mono">
                                  #{m}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="w-32 shrink-0">
                          <div className="flex justify-between text-xs mb-1 font-mono">
                            <span>Match</span>
                            <span>{s.confidence_pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[var(--bg-card)] rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${s.confidence_pct > 70 ? 'bg-[var(--neon-green)]' : s.confidence_pct > 40 ? 'bg-[var(--neon-gold)]' : 'bg-[var(--text-secondary)]'}`}
                              style={{ width: `${s.confidence_pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
