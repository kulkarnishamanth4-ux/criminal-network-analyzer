import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiCpu, FiTerminal } from 'react-icons/fi';
import { sendChatMessage } from '../api/client';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'CrimeNet AI Operative online. Secure connection established. How can I assist your investigation?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);
    
    try {
      const data = await sendChatMessage(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', text: data.response || "No response received." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "[SYSTEM ERROR] Could not reach AI Backend. Ensure the server is running." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[100] bg-[var(--text-accent)] text-[#0a0a1a] p-4 rounded-full shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:scale-110 transition-transform flex items-center justify-center group"
        >
          <FiMessageSquare size={24} />
          <span className="absolute right-full mr-4 bg-[#111] text-[var(--text-primary)] text-xs px-3 py-1.5 rounded border border-[var(--border)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            CrimeNet AI Assistant
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[100] w-80 sm:w-96 h-[500px] max-h-[80vh] bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-[#111] border-b border-[var(--border)] p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[var(--text-accent)]/20 p-1.5 rounded">
                <FiCpu className="text-[var(--text-accent)]" size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] leading-tight">CrimeNet AI</h3>
                <div className="text-[10px] text-[var(--neon-gold)] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)] animate-pulse"></span>
                  Operative Online
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[var(--text-secondary)] hover:text-white transition-colors p-1"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0f]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-[var(--text-accent)] text-[#0a0a1a] rounded-tr-none font-medium' 
                    : 'bg-[#1a1a24] text-[var(--text-primary)] border border-[#2a2a35] rounded-tl-none'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1 mb-1 opacity-50">
                      <FiTerminal size={10} />
                      <span className="text-[8px] uppercase tracking-wider">System</span>
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a24] border border-[#2a2a35] rounded-lg rounded-tl-none p-3 max-w-[85%]">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-[#111] border-t border-[var(--border)]">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Query intelligence network..."
                className="w-full bg-[#0a0a0f] border border-[#333] text-[var(--text-primary)] text-xs rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:border-[var(--text-accent)] transition-colors"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="absolute right-2 p-1.5 text-[var(--text-accent)] hover:bg-[var(--text-accent)]/20 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <FiSend size={14} />
              </button>
            </div>
          </form>

        </div>
      )}
    </>
  );
}
