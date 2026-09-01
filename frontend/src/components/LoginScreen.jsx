import React, { useState } from 'react';
import { FiLock, FiUser, FiShield, FiAlertTriangle } from 'react-icons/fi';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      if (username.toLowerCase() === 'admin' && password === 'admin') {
        onLogin({ username: 'Director Sharma', role: 'ADMIN' });
      } else if (username.toLowerCase() === 'officer' && password === 'officer') {
        onLogin({ username: 'Officer Rajesh', role: 'INVESTIGATOR' });
      } else {
        setError('Invalid clearance credentials. Access denied.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex h-screen w-screen bg-[#05050f] items-center justify-center relative overflow-hidden">
      {/* Matrix-like background effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(10, 10, 26, 0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(10, 10, 26, 0.9) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 0%, #05050f 100%)' }}></div>

      <div className="relative z-10 w-full max-w-md bg-[#0a0a1a] border border-[#1e3a5f] rounded-2xl shadow-[0_0_40px_rgba(30,58,95,0.4)] overflow-hidden">
        
        {/* Header */}
        <div className="p-8 text-center border-b border-[#1e3a5f] bg-[#05050f]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1e3a5f] bg-opacity-30 border border-[#4ecdc4] mb-4 text-[#4ecdc4] shadow-[0_0_15px_rgba(78,205,196,0.5)]">
            <FiShield size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-1">Crime<span className="text-[#f9ca24]">Net</span></h1>
          <p className="text-xs text-[#4ecdc4] uppercase tracking-widest font-mono">Restricted Intelligence Terminal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-400 p-3 rounded flex items-start gap-2 text-sm font-mono">
              <FiAlertTriangle className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 font-mono">Operative ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <FiUser />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-[#05050f] border border-[#1e3a5f] rounded focus:border-[#4ecdc4] focus:ring-1 focus:ring-[#4ecdc4] text-white pl-10 py-2.5 outline-none transition-all font-mono"
                  placeholder="admin or officer"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 font-mono">Clearance Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <FiLock />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#05050f] border border-[#1e3a5f] rounded focus:border-[#4ecdc4] focus:ring-1 focus:ring-[#4ecdc4] text-white pl-10 py-2.5 outline-none transition-all font-mono"
                  placeholder="admin or officer"
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#1e3a5f] hover:bg-[#2c5282] text-[#c8d6e5] font-bold uppercase tracking-widest py-3 rounded border border-[#4ecdc4] hover:border-white transition-all shadow-[0_0_15px_rgba(30,58,95,0.8)] hover:shadow-[0_0_20px_rgba(78,205,196,0.5)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <><span className="animate-pulse">Authenticating...</span></>
            ) : (
              <>Initiate Uplink</>
            )}
          </button>
          
          <div className="text-center">
            <p className="text-[10px] text-gray-600 font-mono mt-4">
              UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED<br/>
              ALL ACTIONS ARE LOGGED AND MONITORED
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
