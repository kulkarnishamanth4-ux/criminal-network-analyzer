import React, { useState, useRef, useEffect } from 'react';
import { 
  FiMessageSquare, 
  FiX, 
  FiSend, 
  FiLoader, 
  FiTerminal, 
  FiTarget, 
  FiUsers, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiHelpCircle,
  FiZap
} from 'react-icons/fi';
import { chatWithAgent, checkAliasMatch, getSuggestedSuspects } from '../api/client';

export default function ChatBot({ activeCase }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'CrimeNet AI Copilot online. How can I assist with this network?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Alias Matcher State
  const [showAliasForm, setShowAliasForm] = useState(false);
  const [aliasNameA, setAliasNameA] = useState('');
  const [aliasNameB, setAliasNameB] = useState('');
  const [aliasContext, setAliasContext] = useState('');
  const [suggestedSuspects, setSuggestedSuspects] = useState([]);
  const [formError, setFormError] = useState('');

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showAliasForm]);

  // Reset chat and fetch suspects when case changes
  useEffect(() => {
    setMessages([{ role: 'ai', content: `Switched to case: ${activeCase}. Analyzing topology...` }]);
    getSuggestedSuspects(activeCase)
      .then(res => setSuggestedSuspects(res?.suspects || []))
      .catch(() => setSuggestedSuspects([]));
  }, [activeCase]);

  // Load suspects when alias form is opened if not yet loaded
  useEffect(() => {
    if (showAliasForm && suggestedSuspects.length === 0) {
      getSuggestedSuspects(activeCase)
        .then(res => setSuggestedSuspects(res?.suspects || []))
        .catch(() => setSuggestedSuspects([]));
    }
  }, [showAliasForm, activeCase]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatWithAgent(userMsg, activeCase);
      setMessages(prev => [...prev, { role: 'ai', content: response.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: '[NETWORK ERROR] Failed to reach CrimeNet AI.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAliasCheck = async (e) => {
    e.preventDefault();
    const nameA = aliasNameA.trim();
    const nameB = aliasNameB.trim();

    if (!nameA || !nameB) {
      setFormError('Please provide both Name A and Name B.');
      return;
    }

    setFormError('');
    setIsLoading(true);
    try {
      const result = await checkAliasMatch(nameA, nameB, activeCase, aliasContext);
      setMessages(prev => [...prev, { role: 'ai', type: 'alias_result', content: result }]);
      setShowAliasForm(false);
      setAliasNameA(''); 
      setAliasNameB(''); 
      setAliasContext('');
    } catch (err) {
      const errDetail = err?.response?.data?.detail || 'Alias resolution engine encountered an error.';
      setMessages(prev => [...prev, { role: 'ai', content: `[ERROR] ${errDetail}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const setQuickPair = (nameA, nameB, context = '') => {
    setAliasNameA(nameA);
    setAliasNameB(nameB);
    if (context) setAliasContext(context);
    setFormError('');
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="absolute bottom-24 right-6 w-12 h-12 bg-[#0a0a1a] border border-[#1e3a5f] rounded-full flex items-center justify-center text-[#f9ca24] hover:bg-[#1e3a5f] transition-all shadow-[0_0_15px_rgba(249,202,36,0.3)] z-50 group"
          title="AI Intelligence Copilot"
        >
          <FiTerminal size={20} className="group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-24 right-6 w-[420px] max-w-[95vw] h-[560px] bg-[#05050f] border border-[#1e3a5f] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-xl bg-opacity-95">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-[#1e3a5f] bg-[#0a0f1d]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#f9ca24]/10 border border-[#f9ca24]/30 flex items-center justify-center">
                <FiTerminal className="text-[#f9ca24] text-xs" />
              </div>
              <div>
                <span className="font-bold text-xs text-white tracking-wide">CrimeNet AI Copilot</span>
                <span className="block text-[9px] font-mono text-[#64ffda]">ACTIVE CASE: {activeCase}</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1">
              <FiX size={16} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 font-mono text-xs">
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[95%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                {msg.type === 'alias_result' ? (
                  <div className="bg-[#08101e] border border-[#1e3a5f] p-3 rounded-xl text-[#c8d6e5] text-xs w-full shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#1e3a5f]/80 mb-2">
                      <div className="font-bold text-[#64ffda] text-xs flex items-center gap-1.5 truncate max-w-[65%]">
                        <FiTarget className="text-[#64ffda] shrink-0" size={13} />
                        <span className="truncate">{msg.content.name_a}</span>
                        <span className="text-gray-400 font-normal">↔</span>
                        <span className="truncate">{msg.content.name_b}</span>
                      </div>
                      {msg.content.verdict_label && (
                        <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider shrink-0 ${
                          (msg.content.probability || 0) >= 75 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : (msg.content.probability || 0) >= 40 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {msg.content.verdict_label}
                        </span>
                      )}
                    </div>
                    
                    {/* Primary Score Tile */}
                    {(() => {
                      const prob = Number(msg.content.probability ?? msg.content.probability_pct ?? 0);
                      const conf = msg.content.confidence_level || msg.content.confidence || 'EVALUATED';
                      return (
                        <div className="flex items-center justify-between my-2 bg-[#040812] p-2.5 rounded-lg border border-[#1e3a5f]">
                          <div>
                            <div className="text-2xl font-black font-mono tracking-tight" style={{
                              color: prob >= 75 ? '#2ed573' : prob >= 40 ? '#ffa502' : '#ff4757'
                            }}>
                              {prob.toFixed(1)}%
                            </div>
                            <span className="uppercase text-[8px] tracking-widest text-[#8892b0] font-mono">MATCH PROBABILITY</span>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider ${
                              conf === 'VERY_HIGH' 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                                : conf === 'HIGH' 
                                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' 
                                : conf === 'MEDIUM' 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}>
                              {conf} CONFIDENCE
                            </span>
                            {msg.content.direct_relationship && (
                              <div className="text-[8px] text-[#64ffda] mt-1 font-mono">
                                ⚡ Link: {msg.content.direct_relationship}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    
                    {/* 5-Axis Signal Decomposition */}
                    <div className="space-y-1.5 my-2.5 bg-[#040812]/70 p-2 rounded-lg border border-[#1e3a5f]/60">
                      <div className="text-[8px] font-mono uppercase tracking-wider text-[#8892b0] mb-1 flex items-center justify-between">
                        <span>5-Axis Signal Decomposition</span>
                        <span>Score</span>
                      </div>
                      {Object.entries(msg.content.breakdown || {}).map(([key, item]) => {
                        const score = typeof item === 'object' ? Number(item.score || 0) : Number(item || 0);
                        const details = typeof item === 'object' ? item.details : '';
                        const label = key.replace('_score', '').replace(/_/g, ' ');
                        return (
                          <div key={key} className="space-y-0.5">
                            <div className="flex justify-between items-center text-[9px] font-mono">
                              <span className="capitalize text-[#c8d6e5]">{label}</span>
                              <span className="font-bold text-[#64ffda]">{score}%</span>
                            </div>
                            <div className="w-full bg-[#101b2b] h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  score >= 70 ? 'bg-emerald-400' : score >= 40 ? 'bg-amber-400' : 'bg-rose-400'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                              />
                            </div>
                            {details && (
                              <div className="text-[8px] text-[#8892b0] truncate" title={details}>
                                {details}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Narrative Evidence Summary */}
                    <div className="text-[9px] bg-[#0c1829] p-2 rounded border border-[#1e3a5f] text-[#8892b0] italic leading-relaxed">
                      {msg.content.evidence_summary}
                    </div>
                  </div>
                ) : (
                  <div className={`p-2.5 rounded-lg leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#1e3a5f] text-white border border-[#1e3a5f]' 
                      : 'bg-[#0a1220] text-[#c8d6e5] border-l-2 border-[#f9ca24] pl-3 border border-[#1e3a5f]'
                  }`}>
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="self-start text-[#f9ca24] flex items-center gap-2 text-xs p-2">
                <FiLoader className="animate-spin" /> Querying syndicate intelligence...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Alias Matcher Drawer */}
          {showAliasForm && (
            <div className="p-3 bg-[#0a1220] border-t border-[#1e3a5f] flex flex-col gap-2.5 max-h-72 overflow-y-auto animate-in slide-in-from-bottom-2 duration-150">
              <div className="flex justify-between items-center border-b border-[#1e3a5f]/60 pb-1.5">
                <div className="flex items-center gap-1.5 text-xs text-[#64ffda] font-bold">
                  <FiTarget size={14} />
                  <span>AI Alias Probability Engine</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowAliasForm(false)} 
                  className="text-gray-400 hover:text-white p-1"
                >
                  <FiX size={14} />
                </button>
              </div>

              {/* Quick Select Preset Pairs for Active Case */}
              {suggestedSuspects.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-[#8892b0] uppercase">Quick Select From Active Case:</span>
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                    {suggestedSuspects.slice(0, 8).map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          if (!aliasNameA) setAliasNameA(s.name);
                          else if (!aliasNameB) setAliasNameB(s.name);
                          else setAliasNameA(s.name);
                        }}
                        className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#13233a] hover:bg-[#1e3a5f] text-[#c8d6e5] border border-[#1e3a5f] truncate max-w-[140px]"
                        title={`Click to set name: ${s.name}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleAliasCheck} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-mono text-[#8892b0] block mb-0.5">Primary Suspect (Name A)</label>
                    <input 
                      type="text" 
                      value={aliasNameA} 
                      onChange={e => { setAliasNameA(e.target.value); setFormError(''); }} 
                      placeholder="e.g. Dawood Ibrahim" 
                      className="w-full bg-[#05050f] border border-[#1e3a5f] text-xs p-1.5 rounded text-[#c8d6e5] focus:outline-none focus:border-[#64ffda]" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-[#8892b0] block mb-0.5">Alias / Handle (Name B)</label>
                    <input 
                      type="text" 
                      value={aliasNameB} 
                      onChange={e => { setAliasNameB(e.target.value); setFormError(''); }} 
                      placeholder="e.g. @sheikh_dawood_dxb" 
                      className="w-full bg-[#05050f] border border-[#1e3a5f] text-xs p-1.5 rounded text-[#c8d6e5] focus:outline-none focus:border-[#64ffda]" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono text-[#8892b0] block mb-0.5">Intelligence Context (Optional)</label>
                  <textarea 
                    value={aliasContext} 
                    onChange={e => setAliasContext(e.target.value)} 
                    placeholder="e.g. Intercepted Dubai IP relay ping or FIR mention..." 
                    className="w-full bg-[#05050f] border border-[#1e3a5f] text-xs p-1.5 rounded text-[#c8d6e5] h-10 resize-none focus:outline-none focus:border-[#64ffda]" 
                  />
                </div>

                {formError && (
                  <div className="text-[10px] text-rose-400 font-mono">
                    ⚠️ {formError}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading || !aliasNameA.trim() || !aliasNameB.trim()} 
                  className="w-full bg-[#1e3a5f] hover:bg-[#284c7d] text-[#64ffda] text-xs font-semibold py-1.5 rounded flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors shadow"
                >
                  <FiZap size={13} /> Run Multi-Axis Probability Analysis
                </button>
              </form>
            </div>
          )}

          {/* Bottom Chat Bar */}
          <div className="p-2 border-t border-[#1e3a5f] bg-[#0a0f1d] flex flex-col gap-2">
            <div className="flex gap-2">
              <button 
                onClick={() => setShowAliasForm(!showAliasForm)} 
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap border ${
                  showAliasForm 
                    ? 'bg-[#64ffda] text-black border-[#64ffda]' 
                    : 'bg-[#102035] text-[#64ffda] border-[#64ffda]/30 hover:bg-[#162c4a]'
                }`}
                title="Open AI Contextual Alias Matcher"
              >
                <FiTarget size={13} />
                <span>Alias Check</span>
              </button>

              <form onSubmit={handleSend} className="flex-1 flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about the network or suspects..."
                  className="flex-1 bg-[#05050f] border border-[#1e3a5f] rounded-lg text-[#c8d6e5] text-xs focus:outline-none focus:border-[#64ffda] px-3 py-1.5 transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="px-3 bg-[#1e3a5f] text-[#f9ca24] hover:bg-[#2c4a75] rounded-lg disabled:opacity-40 transition-colors flex items-center justify-center shrink-0"
                  title="Send query"
                >
                  <FiSend size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
