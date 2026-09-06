import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiLoader, FiTerminal } from 'react-icons/fi';
import { chatWithAgent, checkAliasMatch } from '../api/client';

export default function ChatBot({ activeCase }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'CrimeNet AI Copilot online. How can I assist with this network?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [showAliasForm, setShowAliasForm] = useState(false);
  const [aliasNameA, setAliasNameA] = useState('');
  const [aliasNameB, setAliasNameB] = useState('');
  const [aliasContext, setAliasContext] = useState('');

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset chat when case changes
  useEffect(() => {
    setMessages([{ role: 'ai', content: `Switched to case: ${activeCase}. Analyzing topology...` }]);
  }, [activeCase]);

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
    if (!aliasNameA.trim() || !aliasNameB.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const result = await checkAliasMatch(aliasNameA, aliasNameB, activeCase, aliasContext);
      setMessages(prev => [...prev, { role: 'ai', type: 'alias_result', content: result }]);
      setShowAliasForm(false);
      setAliasNameA(''); setAliasNameB(''); setAliasContext('');
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: '[ERROR] Alias resolution failed.' }]);
    } finally {
      setIsLoading(false);
    }
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
        <div className="absolute bottom-24 right-6 w-96 h-[500px] bg-[#05050f] border border-[#1e3a5f] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-md bg-opacity-95">
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b border-[#1e3a5f] bg-[#0a0a1a]">
            <div className="flex items-center gap-2">
              <FiTerminal className="text-[#f9ca24]" />
              <span className="font-bold text-sm text-[#c8d6e5]">CrimeNet AI Copilot</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[#4ecdc4] hover:text-white transition-colors">
              <FiX size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 font-mono text-sm">
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[95%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                {msg.type === 'alias_result' ? (
                  <div className="bg-[#0a0a1a] border border-[#64ffda] p-3 rounded text-[#c8d6e5] text-xs w-full">
                    <div className="font-bold text-[#64ffda] mb-2 border-b border-[#64ffda]/30 pb-1">Alias Analysis: {msg.content.name_a} ↔ {msg.content.name_b}</div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl font-bold" style={{ color: msg.content.probability < 0.3 ? '#ff4757' : msg.content.probability < 0.6 ? '#ffa502' : '#2ed573' }}>
                        {(msg.content.probability * 100).toFixed(1)}%
                      </div>
                      <div className="flex flex-col">
                        <span className="uppercase text-[10px] tracking-wider text-gray-400">Match Probability</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#1e3a5f] mt-1 text-center border border-[#1e3a5f]">{msg.content.confidence_level} Confidence</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 mb-3">
                      {Object.entries(msg.content.breakdown || {}).map(([key, val]) => (
                        <div key={key} className="flex items-center text-[10px]">
                          <span className="w-24 truncate">{key.replace('_score', '')}</span>
                          <div className="flex-1 bg-[#1e3a5f] h-2 rounded overflow-hidden">
                            <div className="bg-[#64ffda] h-full" style={{ width: `${val * 100}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-[10px] italic text-gray-400">{msg.content.evidence_summary}</div>
                  </div>
                ) : (
                  <div className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-[#1e3a5f] text-white border border-[#1e3a5f]' : 'bg-transparent text-[#c8d6e5] border-l-2 border-[#f9ca24] pl-3'}`}>
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="self-start text-[#f9ca24] flex items-center gap-2 text-xs">
                <FiLoader className="animate-spin" /> Querying...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Alias Form */}
          {showAliasForm && (
            <form onSubmit={handleAliasCheck} className="p-3 bg-[#0a0a1a] border-t border-[#1e3a5f] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs text-[#64ffda] mb-1">
                <span>Alias Matcher</span>
                <button type="button" onClick={() => setShowAliasForm(false)}><FiX /></button>
              </div>
              <div className="flex gap-2">
                <input type="text" value={aliasNameA} onChange={e => setAliasNameA(e.target.value)} placeholder="Name A" className="flex-1 bg-[#05050f] border border-[#1e3a5f] text-xs p-1.5 rounded text-[#c8d6e5]" />
                <input type="text" value={aliasNameB} onChange={e => setAliasNameB(e.target.value)} placeholder="Name B" className="flex-1 bg-[#05050f] border border-[#1e3a5f] text-xs p-1.5 rounded text-[#c8d6e5]" />
              </div>
              <textarea value={aliasContext} onChange={e => setAliasContext(e.target.value)} placeholder="Context (optional)..." className="w-full bg-[#05050f] border border-[#1e3a5f] text-xs p-1.5 rounded text-[#c8d6e5] h-12 resize-none" />
              <button type="submit" disabled={isLoading} className="w-full bg-[#1e3a5f] text-[#64ffda] text-xs p-1.5 rounded hover:bg-[#1e3a5f]/80">Check Probability</button>
            </form>
          )}

          {/* Input */}
          <div className="p-2 border-t border-[#1e3a5f] bg-[#0a0a1a] flex flex-col gap-2">
            <div className="flex gap-2">
              <button onClick={() => setShowAliasForm(!showAliasForm)} className="bg-[#1e3a5f] text-[#64ffda] border border-[#64ffda]/30 rounded-lg px-3 py-1 text-xs hover:bg-[#64ffda]/20 whitespace-nowrap">
                Alias Check
              </button>
              <form onSubmit={handleSend} className="flex-1 flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about the network..."
                  className="flex-1 bg-[#05050f] border border-[#1e3a5f] rounded text-[#c8d6e5] text-sm focus:outline-none focus:ring-1 focus:ring-[#64ffda] px-2 py-1"
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="p-1.5 bg-[#1e3a5f] text-[#f9ca24] hover:bg-[#2c4a75] rounded disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <FiSend size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
