import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiLoader, FiTerminal } from 'react-icons/fi';
import { chatWithAgent } from '../api/client';

export default function ChatBot({ activeCase }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'CrimeNet AI Copilot online. How can I assist with this network?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
        <div className="absolute bottom-24 right-6 w-80 h-96 bg-[#05050f] border border-[#1e3a5f] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-md bg-opacity-95">
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
              <div key={idx} className={`max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                <div className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-[#1e3a5f] text-white border border-[#1e3a5f]' : 'bg-transparent text-[#c8d6e5] border-l-2 border-[#f9ca24] pl-3'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="self-start text-[#f9ca24] flex items-center gap-2 text-xs">
                <FiLoader className="animate-spin" /> Querying Database...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-2 border-t border-[#1e3a5f] bg-[#0a0a1a] flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about the network..."
              className="flex-1 bg-transparent border-none text-[#c8d6e5] text-sm focus:outline-none focus:ring-0 px-2"
              autoFocus
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="p-2 text-[#f9ca24] hover:bg-[#1e3a5f] rounded disabled:opacity-50 transition-colors"
            >
              <FiSend size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
