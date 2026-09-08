import React, { useState, useEffect } from 'react';
import { 
  FiLock, 
  FiUser, 
  FiShield, 
  FiAlertTriangle, 
  FiEye, 
  FiEyeOff, 
  FiCheckCircle, 
  FiActivity, 
  FiCpu, 
  FiServer, 
  FiKey, 
  FiRadio,
  FiClock,
  FiTerminal,
  FiChevronRight
} from 'react-icons/fi';

const USERS = [
  { 
    username: 'director', 
    password: 'director', 
    displayName: 'Director Sharma', 
    role: 'DIRECTOR', 
    level: 4, 
    clearance: 'TOP SECRET',
    badge: 'DIR-001',
    dept: 'Sovereign Intelligence Directorate',
    icon: '🎖️',
    color: '#f9ca24',
    privileges: [
      'Full Enclave Control & Master Sovereign Key',
      'Autonomous AI Syndicate Interrogation',
      'Multi-Source Evidence Ingestion Hub',
      'Cryptographic Blockchain & SIEM Ledger',
      'Cross-Jurisdictional Case Management'
    ]
  },
  { 
    username: 'admin', 
    password: 'admin', 
    displayName: 'Superintendent Verma', 
    role: 'ADMIN', 
    level: 3, 
    clearance: 'SECRET',
    badge: 'SP-104',
    dept: 'Special Cyber Operations Cell',
    icon: '🛡️',
    color: '#4ecdc4',
    privileges: [
      'Multi-Source Evidence Ingestion Hub',
      'AI Threat & Topology Strike Analysis',
      'Blockchain Ledger Verification',
      'SIEM Audit Log Inspection & Export'
    ]
  },
  { 
    username: 'officer', 
    password: 'officer', 
    displayName: 'Inspector Rajesh', 
    role: 'INVESTIGATOR', 
    level: 2, 
    clearance: 'CONFIDENTIAL',
    badge: 'INS-421',
    dept: 'Organized Crime Investigation Unit',
    icon: '🔍',
    color: '#45b7d1',
    privileges: [
      'Multi-Source Evidence Ingestion Hub',
      'Tactical AI Chat Assistant',
      'Multi-Hop Path Tracing (Two-Click)',
      'Classified Subject Dossiers'
    ]
  },
  { 
    username: 'constable', 
    password: 'constable', 
    displayName: 'Constable Yadav', 
    role: 'CONSTABLE', 
    level: 1, 
    clearance: 'RESTRICTED',
    badge: 'CT-892',
    dept: 'Field Intelligence & Surveillance',
    icon: '📋',
    color: '#94a3b8',
    privileges: [
      'Network Graph Topology Exploration',
      'Syndicate Entity Search & Lookup',
      'Basic Subject Dossiers'
    ]
  }
];

export default function LoginScreen({ onLogin }) {
  const [selectedUser, setSelectedUser] = useState(USERS[0]);
  const [username, setUsername] = useState(USERS[0].username);
  const [password, setPassword] = useState(USERS[0].password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Real-time telemetry clocks & network latency
  const [telemetryTime, setTelemetryTime] = useState({
    utc: '',
    ist: '',
    ping: 18
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcString = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
      const istString = now.toLocaleTimeString('en-IN', { 
        timeZone: 'Asia/Kolkata', 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }) + ' IST';
      
      setTelemetryTime(prev => ({
        utc: utcString,
        ist: istString,
        ping: Math.floor(16 + Math.random() * 5)
      }));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const selectOperative = (user) => {
    setSelectedUser(user);
    setUsername(user.username);
    setPassword(user.password);
    setError('');
  };

  const handleUsernameChange = (val) => {
    setUsername(val);
    const matched = USERS.find(u => u.username.toLowerCase() === val.trim().toLowerCase());
    if (matched) {
      setSelectedUser(matched);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const user = USERS.find(
        u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
      );
      if (user) {
        onLogin({ 
          username: user.displayName, 
          role: user.role, 
          level: user.level, 
          clearance: user.clearance 
        });
      } else {
        setError('Clearance verification failed: Cryptographic token or operative ID invalid.');
        setIsLoading(false);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen w-screen bg-[#040711] flex items-center justify-center p-3 sm:p-5 lg:p-8 relative overflow-x-hidden select-none font-sans">
      
      {/* Background Cyber Grid & Vignette */}
      <div 
        className="absolute inset-0 opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(30, 58, 95, 0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 58, 95, 0.45) 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(10, 25, 47, 0.6) 0%, rgba(4, 7, 17, 0.98) 100%)'
        }}
      />

      {/* Decorative Cyber Lighting Rings */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ff41]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1e3a5f]/25 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Dual-Pane Terminal Card */}
      <div className="relative z-10 w-full max-w-5xl bg-[#080d1a]/95 border border-[#1e3a5f] rounded-2xl shadow-[0_0_50px_rgba(0,18,40,0.8),0_0_20px_rgba(78,205,196,0.12)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-2xl">

        {/* =========================================================================
            LEFT PANE: Sovereign Threat & Enclave Telemetry (5 Cols)
           ========================================================================= */}
        <div className="lg:col-span-5 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#1e3a5f]/70 bg-gradient-to-b from-[#091325]/90 via-[#060e1d]/85 to-[#040813]/95 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Cyber scan effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#64ffda]/[0.02] to-transparent pointer-events-none animate-pulse" />

          {/* Top Enclave Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3.5 mb-5">
              {/* Emblem / Shield Badge */}
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-[#0c1e36] to-[#060f1c] border border-[#64ffda]/40 flex items-center justify-center text-[#64ffda] shadow-[0_0_18px_rgba(100,255,218,0.25)] shrink-0">
                <FiShield size={28} className="text-[#64ffda]" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#040711] flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00ff41] animate-ping" />
                </span>
              </div>
              <div>
                <div className="text-[10px] font-mono tracking-widest text-[#64ffda] uppercase font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41]" />
                  GOVT OF INDIA • MHA
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase leading-tight font-sans">
                  CRIME<span className="text-[#f9ca24]">NET</span>
                </h1>
                <p className="text-[11px] text-[#8892b0] font-mono leading-none mt-0.5">
                  National Cyber Command • Enclave Tier-1
                </p>
              </div>
            </div>

            {/* Sovereign Classification Banner */}
            <div className="bg-[#051224]/80 border border-[#1e3a5f] rounded-lg p-3 mb-5">
              <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                <span className="text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FiActivity className="text-[#f9ca24]" /> Threat Status
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[#f9ca24] border border-amber-500/30 font-bold text-[10px] tracking-wide">
                  DEFCON 2 // ELEVATED
                </span>
              </div>
              <div className="text-[11px] text-gray-300 leading-snug">
                National Crime & Intelligence Analysis Grid active. Monitored syndicates across 9 cross-border sectors.
              </div>
            </div>

            {/* Real-Time Live Clock & Network Telemetry */}
            <div className="space-y-2 mb-5">
              <div className="bg-[#040a17]/90 border border-[#1e3a5f]/60 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400 flex items-center gap-1.5 text-[11px]">
                  <FiClock className="text-[#64ffda]" /> Node UTC
                </span>
                <span className="text-white font-semibold text-[11px] tracking-wide">
                  {telemetryTime.utc || 'SYNCING...'}
                </span>
              </div>

              <div className="bg-[#040a17]/90 border border-[#1e3a5f]/60 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400 flex items-center gap-1.5 text-[11px]">
                  <FiRadio className="text-[#4ecdc4]" /> Gateway Latency
                </span>
                <span className="text-[#00ff41] font-semibold text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] inline-block" />
                  {telemetryTime.ping}ms (Mumbai-04)
                </span>
              </div>
            </div>

            {/* Telemetry Checkpoints */}
            <div className="border-t border-[#1e3a5f]/50 pt-4 space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <FiCpu className="text-[#4ecdc4]" size={12} /> Crypto Handshake
                </span>
                <span className="text-[#64ffda] font-semibold">TLS 1.3 / AES-256-GCM</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <FiServer className="text-[#a29bfe]" size={12} /> Compliance Standard
                </span>
                <span className="text-white">CERT-In Rule 11 Active</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <FiKey className="text-[#f9ca24]" size={12} /> SIEM Ledger Audit
                </span>
                <span className="text-[#00ff41]">SHA-256 Chained ✓</span>
              </div>
            </div>
          </div>

          {/* Institutional Statutory Warning */}
          <div className="relative z-10 mt-6 pt-4 border-t border-[#1e3a5f]/50 text-[10px] text-gray-500 font-mono leading-relaxed">
            <span className="text-gray-400 font-semibold uppercase tracking-wider block mb-0.5">
              Statutory Security Warning:
            </span>
            Unauthorized access or attempted extraction is strictly punishable under Section 69B of the IT Act 2000 & Official Secrets Act 1923.
          </div>
        </div>

        {/* =========================================================================
            RIGHT PANE: Classified Access Terminal (7 Cols)
           ========================================================================= */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-[#070b16]">
          
          <div>
            {/* Terminal Title & Subtitle */}
            <div className="flex items-center justify-between border-b border-[#1e3a5f]/60 pb-3.5 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <FiTerminal className="text-[#64ffda]" />
                  <span className="text-xs uppercase tracking-widest font-mono font-bold text-[#64ffda]">
                    Access Terminal
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  Operative Clearance Handshake
                </h2>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 rounded bg-[#0a182b] border border-[#1e3a5f] text-[10px] font-mono text-[#4ecdc4] uppercase tracking-wider">
                  Tier-1 Gate
                </span>
              </div>
            </div>

            {/* Quick 1-Click Operative Selection Chips */}
            <div className="mb-5">
              <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-2 font-mono flex items-center justify-between">
                <span>Select Operative Identity (1-Click Demo)</span>
                <span className="text-[10px] text-[#64ffda]">Pre-cleared Credentials</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {USERS.map((u) => {
                  const isSelected = selectedUser?.username === u.username;
                  return (
                    <button
                      key={u.username}
                      type="button"
                      onClick={() => selectOperative(u)}
                      className={`relative text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-[#0e223d] border-[#64ffda] shadow-[0_0_16px_rgba(100,255,218,0.22)] ring-1 ring-[#64ffda]/40' 
                          : 'bg-[#091222]/80 border-[#1e3a5f]/70 hover:bg-[#0d1c33] hover:border-[#2d5584]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{u.icon}</span>
                          <span className="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-[130px]">
                            {u.displayName}
                          </span>
                        </div>
                        <span 
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wider uppercase shrink-0"
                          style={{
                            backgroundColor: `${u.color}15`,
                            color: u.color,
                            border: `1px solid ${u.color}40`
                          }}
                        >
                          L{u.level}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mt-1">
                        <span className="truncate">{u.badge}</span>
                        <span className="text-gray-300 font-semibold">{u.clearance}</span>
                      </div>

                      {isSelected && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00ff41]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-4 bg-red-950/40 border border-red-500/80 text-red-300 p-3 rounded-xl flex items-start gap-2.5 text-xs font-mono animate-in fade-in duration-200">
                <FiAlertTriangle className="mt-0.5 flex-shrink-0 text-red-400" size={16} />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Credential Form */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                  Operative ID / Call Sign
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <FiUser size={15} />
                  </div>
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => handleUsernameChange(e.target.value)}
                    className="w-full bg-[#040814] border border-[#1e3a5f] rounded-lg focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda] text-white pl-10 pr-4 py-2 text-sm outline-none transition-all font-mono"
                    placeholder="e.g. director, admin, officer..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                  Clearance Code / Security Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <FiLock size={15} />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#040814] border border-[#1e3a5f] rounded-lg focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda] text-white pl-10 pr-10 py-2 text-sm outline-none transition-all font-mono"
                    placeholder="Enter security passcode..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#64ffda] transition-colors cursor-pointer"
                    title={showPassword ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              {/* Dynamic Clearance Privilege Matrix */}
              {selectedUser && (
                <div className="mt-3 bg-[#050e1c] border border-[#1e3a5f]/60 rounded-xl p-3">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-gray-300 mb-2">
                    <span className="text-[#64ffda] flex items-center gap-1.5">
                      <FiCheckCircle size={13} /> Clearance Privileges Matrix
                    </span>
                    <span className="text-gray-400 font-normal">
                      Rank: Level {selectedUser.level}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {selectedUser.privileges.map((priv, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-300">
                        <span className="text-[#00ff41] text-xs">✓</span>
                        <span className="truncate">{priv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Authorize Security Enclave Action Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-[#0e294b] via-[#163b6b] to-[#0e294b] hover:from-[#133763] hover:to-[#133763] text-white font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl border border-[#64ffda]/60 hover:border-[#64ffda] transition-all shadow-[0_0_20px_rgba(14,41,75,0.8)] hover:shadow-[0_0_25px_rgba(100,255,218,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-[#64ffda] animate-spin" />
                    <span className="tracking-widest font-mono text-xs">Authorizing Security Enclave...</span>
                  </>
                ) : (
                  <>
                    <span className="font-mono tracking-widest text-xs">Authorize Security Enclave</span>
                    <FiChevronRight size={16} className="text-[#64ffda]" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Terminal Status */}
          <div className="mt-5 pt-3 border-t border-[#1e3a5f]/40 flex items-center justify-between text-[10px] font-mono text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00ff41] inline-block animate-pulse" />
              SESSION: Active Handshake
            </span>
            <span>SIEM AUDIT ENABLED • v3.4</span>
          </div>

        </div>

      </div>

    </div>
  );
}
