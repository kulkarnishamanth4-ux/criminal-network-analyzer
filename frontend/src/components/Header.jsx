import React, { useState, useRef, useEffect } from 'react';
import { 
  FiUploadCloud, 
  FiFileText, 
  FiCpu, 
  FiShield,
  FiUser, 
  FiLogOut, 
  FiLink, 
  FiChevronDown,
  FiLayers,
  FiMic,
  FiKey,
  FiDownloadCloud,
  FiMoreVertical
} from 'react-icons/fi';
import SpecularButton from './SpecularButton';

export default function Header({ 
  onUploadClick, 
  onExperimentalClick, 
  onBlockchainClick, 
  activeCase, 
  onCaseChange, 
  currentUser, 
  onAuditClick, 
  onLogout,
  onVoiceClick,
  onHODClick,
  onAPKClick
}) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const level = currentUser?.level || 0;
  const [suiteMenuOpen, setSuiteMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const suiteMenuRef = useRef(null);
  const moreMenuRef = useRef(null);

  const cases = [
    { id: 'custom_investigation', label: 'New Investigation (Custom Data Upload)' },
    { id: 'dawood', label: 'Operation Syndicate (Dawood D-Company)' },
    { id: 'drug_punjab', label: 'Operation Falcon: Golden Crescent Narcotics (Punjab)' },
    { id: 'ht_assam', label: 'Operation Rescue: Cross-Border Trafficking (Assam)' },
    { id: 'cyber_bengaluru', label: 'Project DarkWeb: Apex Crypto Extortion (Bengaluru)' },
    { id: 'money_gujarat', label: 'Operation Swarn: Diamond City Hawala (Surat)' },
    { id: 'arms_chhattisgarh', label: 'Operation Red Corridor: Jungle Arms (Bastar)' },
    { id: 'wildlife_kerala', label: 'Operation WildTusk: Ivory Poaching (Wayanad)' },
    { id: 'extortion_up', label: 'Operation Bahubali: Purvanchal Mafia (Gorakhpur)' }
  ];

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (suiteMenuRef.current && !suiteMenuRef.current.contains(event.target)) {
        setSuiteMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-[#060a14] border-b border-[#1e3a5f] flex items-center justify-between px-4 sm:px-5 z-50 shadow-xl relative select-none">
      {/* Left Control Group: Brand, Cases, Intelligence Suite, Data Ingestion */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Brand: Just CRIMENET in slightly smaller font */}
        <span className="text-sm sm:text-base font-black tracking-widest text-[#64ffda] shrink-0 drop-shadow-[0_0_8px_rgba(100,255,218,0.3)]">
          CRIMENET
        </span>

        {/* Case Selector Dropdown */}
        <div className="relative w-56 sm:w-64 md:w-80 shrink-0">
          <select 
            value={activeCase} 
            onChange={(e) => onCaseChange(e.target.value)}
            className="w-full appearance-none bg-[#0a1220] border border-[#1e3a5f] hover:border-[#64ffda]/50 text-[var(--text-accent)] text-xs sm:text-sm font-medium rounded-lg px-3 py-2 pr-8 focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] outline-none transition-all cursor-pointer shadow-inner truncate"
          >
            {cases.map(c => (
              <option key={c.id} value={c.id} className="bg-[#0a1220] text-gray-200 py-1">
                {c.label}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64ffda]/70 pointer-events-none text-sm" />
        </div>

        {/* Intelligence Suite Dropdown */}
        {level >= 3 && (
          <div className="relative shrink-0" ref={suiteMenuRef}>
            <button 
              onClick={() => setSuiteMenuOpen(!suiteMenuOpen)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                suiteMenuOpen 
                  ? 'bg-[#162a45] border-[#64ffda] text-[#64ffda] shadow-[0_0_12px_rgba(100,255,218,0.25)]' 
                  : 'bg-[#0d1829] border-[#1e3a5f] text-[#c8d6e5] hover:border-[#64ffda]/40 hover:text-white'
              }`}
              title="Open Intelligence & Cyber Suite"
            >
              <FiLayers className="text-[#64ffda]" size={14} />
              <span className="hidden md:inline">Intelligence Suite</span>
              <FiChevronDown size={12} className={`transition-transform duration-200 ${suiteMenuOpen ? 'rotate-180 text-[#64ffda]' : 'text-gray-400'}`} />
            </button>

            {/* Dropdown Menu Popover */}
            {suiteMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-[#0a1424] border border-[#1e3a5f] rounded-xl shadow-2xl p-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
                <div className="px-3 py-2 border-b border-[#1e3a5f]/60 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8892b0]">Security & Analytics Suite</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">L{level} ACTIVE</span>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => { onBlockchainClick(); setSuiteMenuOpen(false); }}
                    className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-[#13233a] text-left transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 shrink-0 mt-0.5">
                      <FiLink size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-emerald-400">Blockchain & Crypto</div>
                      <div className="text-[10px] text-[#8892b0]">PoA Ledger & Narco-Flow Tracker</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { onAuditClick(); setSuiteMenuOpen(false); }}
                    className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-[#13233a] text-left transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:border-blue-400 shrink-0 mt-0.5">
                      <FiShield size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-blue-400">SIEM & CERT-In Logs</div>
                      <div className="text-[10px] text-[#8892b0]">Cryptographic Chain Audit Trail</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { onExperimentalClick(); setSuiteMenuOpen(false); }}
                    className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-[#13233a] text-left transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:border-purple-400 shrink-0 mt-0.5">
                      <FiCpu size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-400">Experimental Labs</div>
                      <div className="text-[10px] text-[#8892b0]">7 AI Topology & Strike Algorithms</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { if (onHODClick) onHODClick(); setSuiteMenuOpen(false); }}
                    className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-[#13233a] text-left transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:border-red-400 shrink-0 mt-0.5">
                      <FiKey size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-red-400">HOD 2FA Clearance</div>
                      <div className="text-[10px] text-[#8892b0]">RFC 6238 TOTP Supervisory Portal</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Major Change: Data Ingestion right after Intelligence Suite */}
        {level >= 2 && (
          <div className="shrink-0">
            <SpecularButton 
              onClick={onUploadClick}
              size="sm"
              radius={8}
              textColor="var(--text-accent)"
              lineColor="#00ff41"
              baseColor="#0f2618"
              intensity={1.5}
            >
              <FiUploadCloud size={14} />
              <span className="font-semibold text-xs whitespace-nowrap">Data Ingestion</span>
            </SpecularButton>
          </div>
        )}
      </div>

      {/* Right Control Group: 3-Dots Dropdown Menu + Full Logged-in User Profile */}
      <div className="flex items-center gap-3 shrink-0 ml-4">
        {/* 3-Dots Dropdown Menu containing Voice Copilot, Download APK, Generate Report */}
        <div className="relative shrink-0" ref={moreMenuRef}>
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-all cursor-pointer ${
              moreMenuOpen
                ? 'bg-[#162a45] border-[#64ffda] text-[#64ffda] shadow-[0_0_12px_rgba(100,255,218,0.25)]'
                : 'bg-[#0d1829] border-[#1e3a5f] text-[#c8d6e5] hover:border-[#64ffda]/50 hover:text-white hover:bg-[#13233a]'
            }`}
            title="More Options (Voice Copilot, Download APK, Generate Report)"
          >
            <FiMoreVertical size={16} />
          </button>

          {/* 3-Dots Dropdown Popover */}
          {moreMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#0a1424] border border-[#1e3a5f] rounded-xl shadow-2xl p-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
              <div className="px-3 py-1.5 border-b border-[#1e3a5f]/60 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8892b0]">Command Tools</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#64ffda]/10 text-[#64ffda] font-mono">TOOLS</span>
              </div>

              <div className="space-y-1">
                {/* 1. Voice Copilot */}
                <button
                  onClick={() => {
                    onVoiceClick();
                    setMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#13233a] text-left transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#64ffda]/10 border border-[#64ffda]/30 flex items-center justify-center text-[#64ffda] group-hover:border-[#64ffda] shrink-0">
                    <FiMic size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-[#64ffda]">Voice Copilot</div>
                    <div className="text-[10px] text-[#8892b0]">Voice Command HUD (Alt+V)</div>
                  </div>
                </button>

                {/* 2. Download APK */}
                <button
                  onClick={() => {
                    onAPKClick();
                    setMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#13233a] text-left transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:border-blue-400 shrink-0">
                    <FiDownloadCloud size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-blue-400">Download APK</div>
                    <div className="text-[10px] text-[#8892b0]">Offline Android Package (.apk)</div>
                  </div>
                </button>

                {/* 3. Generate Report */}
                {level >= 2 && (
                  <button
                    onClick={() => {
                      window.open(`${API_URL}/api/report/generate?case_id=${activeCase}`, '_blank');
                      setMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#13233a] text-left transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400 shrink-0">
                      <FiFileText size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-amber-400">Generate Report</div>
                      <div className="text-[10px] text-[#8892b0]">Official Case Dossier (PDF)</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Clearance Profile & Logout (Fully Displayed, Never Cut Off) */}
        {currentUser && (
          <div className="flex items-center gap-3 pl-3.5 border-l border-[#1e3a5f] shrink-0">
            <div className="text-right">
              <div className="text-xs font-bold text-white leading-snug whitespace-nowrap">
                {currentUser.displayName || currentUser.username || 'Officer'}
              </div>
              <div className="text-[10px] text-[#64ffda] uppercase font-mono tracking-wider font-semibold whitespace-nowrap">
                L{currentUser.level} • {currentUser.clearance}
              </div>
            </div>
            <button 
              onClick={onLogout} 
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/50 transition-colors shrink-0 cursor-pointer"
              title="Logout session"
            >
              <FiLogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
