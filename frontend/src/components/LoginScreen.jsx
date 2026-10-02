import React, { useState } from 'react';
import { 
  FiLock, 
  FiUser, 
  FiAlertTriangle, 
  FiEye, 
  FiEyeOff, 
  FiCheckCircle, 
  FiKey, 
  FiTerminal, 
  FiChevronRight, 
  FiPhone, 
  FiSend
} from 'react-icons/fi';
import { sendSmsOtp, verifySmsOtp } from '../api/client';

const USERS = [
  { 
    username: 'director', 
    password: 'director', 
    displayName: 'Director', 
    role: 'DIRECTOR', 
    level: 4, 
    clearance: 'TOP SECRET',
    badge: '',
    dept: 'Sovereign Intelligence Directorate',
    icon: 'DIR',
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
    displayName: 'Superintendent', 
    role: 'ADMIN', 
    level: 3, 
    clearance: 'SECRET',
    badge: '',
    dept: 'Special Cyber Operations Cell',
    icon: 'SP',
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
    displayName: 'Inspector', 
    role: 'INVESTIGATOR', 
    level: 2, 
    clearance: 'CONFIDENTIAL',
    badge: '',
    dept: 'Organized Crime Investigation Unit',
    icon: 'INS',
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
    displayName: 'Constable', 
    role: 'CONSTABLE', 
    level: 1, 
    clearance: 'RESTRICTED',
    badge: '',
    dept: 'Field Intelligence & Surveillance',
    icon: 'CT',
    color: '#94a3b8',
    privileges: [
      'Network Graph Topology Exploration',
      'Syndicate Entity Search & Lookup',
      'Basic Subject Dossiers'
    ]
  }
];

export default function LoginScreen({ onLogin, onDownloadApkClick }) {
  const [selectedUser, setSelectedUser] = useState(USERS[0]);
  const [username, setUsername] = useState(USERS[0].username);
  const [password, setPassword] = useState(USERS[0].password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // SMS OTP Login Mode
  const [loginMode, setLoginMode] = useState('credentials'); // 'credentials' or 'sms'
  const [smsPhone, setSmsPhone] = useState('');
  const [smsOtp, setSmsOtp] = useState('');
  const [smsRank, setSmsRank] = useState('DIRECTOR');
  const [smsOfficerName, setSmsOfficerName] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [smsOtpSent, setSmsOtpSent] = useState(false);
  const [smsVerifying, setSmsVerifying] = useState(false);
  const [smsError, setSmsError] = useState('');
  const [smsSuccess, setSmsSuccess] = useState('');
  const [smsDispatchedToken, setSmsDispatchedToken] = useState('');

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

  const handleSendSmsOtp = async () => {
    if (!smsPhone || smsPhone.replace(/\D/g, '').length < 10) {
      setSmsError('Enter a valid 10-digit designated mobile number.');
      return;
    }
    if (!smsOfficerName.trim()) {
      setSmsError('Enter the officer name for audit logging.');
      return;
    }
    setSmsSending(true);
    setSmsError('');
    setSmsSuccess('');
    setSmsDispatchedToken('');
    try {
      const res = await sendSmsOtp(smsPhone, smsRank, smsOfficerName);
      setSmsOtpSent(true);
      setSmsDispatchedToken(res.dispatched_token || '');
      setSmsSuccess(`OTP dispatched to ${res.phone} via ${res.provider}. Valid for 5 minutes.`);
    } catch (err) {
      setSmsError(err.response?.data?.detail || 'Failed to dispatch SMS OTP.');
    } finally {
      setSmsSending(false);
    }
  };

  const handleVerifySmsOtp = async () => {
    if (!smsOtp || smsOtp.length < 6) {
      setSmsError('Enter the complete 6-digit OTP received on the designated phone.');
      return;
    }
    setSmsVerifying(true);
    setSmsError('');
    try {
      const res = await verifySmsOtp(smsPhone, smsOtp, smsRank, smsOfficerName);
      if (res.verified && res.user) {
        onLogin({
          username: res.user.displayName,
          role: res.user.role,
          level: res.user.level,
          clearance: res.user.clearance,
          badge: res.user.badge,
          phone: res.user.phone,
          rank: res.user.rank
        });
      }
    } catch (err) {
      setSmsError(err.response?.data?.detail || 'OTP verification failed.');
    } finally {
      setSmsVerifying(false);
    }
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

      {/* Main Centered Access Terminal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-[#080d1a]/95 border border-[#1e3a5f] rounded-2xl shadow-[0_0_50px_rgba(0,18,40,0.8),0_0_20px_rgba(78,205,196,0.12)] overflow-hidden backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between">
        
        <div>
          {/* Clean Platform Header */}
          <div className="text-center mb-6 pb-4 border-b border-[#1e3a5f]/60">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase font-sans">
              CRIME<span className="text-[#64ffda]">NET</span>
            </h1>
            <p className="text-xs text-[#8892b0] font-mono mt-1">
              Criminal Network & Intelligence Analysis Platform
            </p>
          </div>

          <div>
            {/* Terminal Title & Subtitle */}
            <div className="border-b border-[#1e3a5f]/60 pb-3.5 mb-5">
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

            {/* Mode Switcher: SMS OTP 2FA vs Demo Credentials */}
            <div className="flex border-b border-[#1e3a5f]/80 mb-5">
              <button
                type="button"
                onClick={() => { setLoginMode('sms'); setError(''); }}
                className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-mono font-bold transition-all border-b-2 cursor-pointer ${
                  loginMode === 'sms'
                    ? 'border-[#64ffda] text-[#64ffda]'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <FiPhone size={13} /> Designated Mobile 2FA (SMS OTP)
              </button>
              <button
                type="button"
                onClick={() => { setLoginMode('credentials'); setSmsError(''); }}
                className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-mono font-bold transition-all border-b-2 cursor-pointer ${
                  loginMode === 'credentials'
                    ? 'border-[#64ffda] text-[#64ffda]'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <FiKey size={13} /> Pre-cleared Credentials (1-Click)
              </button>
            </div>

            {/* =============================================================
                MODE 1: DESIGNATED MOBILE PHONE 2FA (SMS OTP)
               ============================================================= */}
            {loginMode === 'sms' && (
              <div className="space-y-4">
                {smsError && (
                  <div className="bg-red-950/40 border border-red-500/80 text-red-300 p-3 rounded-xl flex items-start gap-2.5 text-xs font-mono animate-in fade-in duration-200">
                    <FiAlertTriangle className="mt-0.5 flex-shrink-0 text-red-400" size={16} />
                    <span className="leading-snug">{smsError}</span>
                  </div>
                )}

                {smsSuccess && (
                  <div className="bg-emerald-950/40 border border-emerald-500/80 text-emerald-300 p-3 rounded-xl flex items-start gap-2.5 text-xs font-mono animate-in fade-in duration-200">
                    <FiCheckCircle className="mt-0.5 flex-shrink-0 text-emerald-400" size={16} />
                    <span className="leading-snug">{smsSuccess}</span>
                  </div>
                )}

                {/* Rank / Clearance Tier Selection */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Clearance Rank to Request
                  </label>
                  <select
                    value={smsRank}
                    onChange={e => setSmsRank(e.target.value)}
                    className="w-full bg-[#040814] border border-[#1e3a5f] rounded-lg focus:border-[#64ffda] text-white px-3 py-2 text-xs outline-none font-mono cursor-pointer"
                  >
                    <option value="DIRECTOR">Director General (Level 4 - Top Secret Sovereign Enclave)</option>
                    <option value="ADMIN">Superintendent of Police (Level 3 - Secret Operations)</option>
                    <option value="INVESTIGATOR">Inspector / Cyber Investigator (Level 2 - Confidential)</option>
                    <option value="CONSTABLE">Field Operative / Constable (Level 1 - Restricted)</option>
                  </select>
                </div>

                {/* Officer Name Input */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Officer Name / Call Sign
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                      <FiUser size={15} />
                    </div>
                    <input
                      type="text"
                      value={smsOfficerName}
                      onChange={e => setSmsOfficerName(e.target.value)}
                      placeholder="e.g. Director, Inspector..."
                      className="w-full bg-[#040814] border border-[#1e3a5f] rounded-lg focus:border-[#64ffda] text-white pl-10 pr-4 py-2 text-xs outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Designated Phone Input & Dispatch */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-mono flex items-center justify-between">
                    <span>Designated Mobile Phone (+91)</span>
                    <span className="text-[10px] text-[#4ecdc4]">Live Telephony Relay</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                        <FiPhone size={15} />
                      </div>
                      <input
                        type="text"
                        value={smsPhone}
                        onChange={e => setSmsPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#040814] border border-[#1e3a5f] rounded-lg focus:border-[#64ffda] text-white pl-10 pr-4 py-2 text-xs outline-none font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendSmsOtp}
                      disabled={smsSending}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <FiSend size={13} />
                      {smsSending ? 'Dispatching...' : smsOtpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {/* OTP Input Field */}
                {smsOtpSent && (
                  <div className="space-y-3 pt-2 border-t border-[#1e3a5f]/60 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                        Enter 6-Digit SMS OTP Received on Phone
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                          <FiKey size={15} />
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={smsOtp}
                          onChange={e => setSmsOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="6-digit code"
                          className="w-full bg-[#040814] border border-[#64ffda] rounded-lg text-[#64ffda] pl-10 pr-4 py-2.5 text-center text-lg tracking-[0.4em] font-mono font-bold outline-none"
                        />
                      </div>
                    </div>

                    {/* Offline / Demonstration Token Inspection Box */}
                    {smsDispatchedToken && (
                      <div className="p-2.5 rounded-lg bg-[#050e1c] border border-[#64ffda]/30 text-xs font-mono flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase">Gateway Dispatched Token: </span>
                          <span className="text-[#64ffda] font-bold tracking-widest">{smsDispatchedToken}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSmsOtp(smsDispatchedToken)}
                          className="text-[10px] text-[#64ffda] underline hover:text-white cursor-pointer"
                        >
                          Autofill
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifySmsOtp}
                      disabled={smsVerifying || smsOtp.length < 6}
                      className="w-full py-3 rounded-lg bg-[#0e294b] hover:bg-[#133763] text-white font-mono font-bold text-xs uppercase tracking-wider border border-[#64ffda] shadow-[0_0_18px_rgba(100,255,218,0.25)] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {smsVerifying ? 'Verifying SMS Token...' : `Authenticate as ${smsRank}`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================
                MODE 2: PRE-CLEARED CREDENTIALS (1-CLICK DEMO)
               ============================================================= */}
            {loginMode === 'credentials' && (
              <div>
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
                              <span className="text-xs font-mono font-bold text-gray-300 px-1 py-0.5 rounded bg-black/40 border border-[#1e3a5f]">{u.icon}</span>
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

                          <div className="flex items-center justify-end text-[10px] font-mono text-gray-400 mt-1">
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
            )}
          </div>

          {/* Footer Terminal Status & APK Download Action */}
          <div className="mt-5 pt-3 border-t border-[#1e3a5f]/40 flex items-center justify-between text-[10px] font-mono text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00ff41] inline-block animate-pulse" />
              SESSION: Active Handshake
            </span>
            {onDownloadApkClick && (
              <button
                type="button"
                onClick={onDownloadApkClick}
                className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <FiPhone size={10} /> Download APK (.apk)
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
