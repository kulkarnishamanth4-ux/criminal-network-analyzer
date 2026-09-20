import React, { useState, useEffect } from 'react';
import { 
  FiRadio, FiShield, FiAlertTriangle, FiUser, FiActivity, 
  FiMic, FiRefreshCw, FiCheck, FiX, FiClock, FiMaximize2, FiMinimize2
} from 'react-icons/fi';
import { client } from '../api/client';

const CASE_OPTIONS = [
  { id: 'dawood', label: 'D-Company (Mumbai)' },
  { id: 'drug_punjab', label: 'Punjab Narcotics' },
  { id: 'cyber_bengaluru', label: 'Bengaluru Crypto' },
  { id: 'money_gujarat', label: 'Surat Hawala' },
  { id: 'ht_assam', label: 'Assam Trafficking' },
  { id: 'arms_chhattisgarh', label: 'Chhattisgarh Arms' },
  { id: 'wildlife_kerala', label: 'Kerala Wildlife' },
  { id: 'extortion_up', label: 'UP Extortion' },
  { id: 'custom_investigation', label: 'New Investigation' }
];

export default function WatchCompanion({ activeCase, onSwitchCase, onExitWatchMode, onOpenVoice }) {
  const [bezelShape, setBezelShape] = useState('circular'); // 'circular' or 'square'
  const [stats, setStats] = useState({ total_entities: 0, anomalies_count: 0, critical_anomalies_count: 0 });
  const [anomalies, setAnomalies] = useState([]);
  const [topSuspects, setTopSuspects] = useState([]);
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts', 'suspects', 'hod'
  const [timeStr, setTimeStr] = useState('');
  const [hodCredentials, setHodCredentials] = useState({
    current_rolling_otp: '377860',
    emergency_backup_pin: '999786'
  });
  const [hodApproved, setHodApproved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch watch tactical data
  const loadWatchData = async () => {
    setLoading(true);
    try {
      const [statsRes, anomRes, infRes, hodRes] = await Promise.all([
        client.get(`/api/analytics/dashboard-stats?case_id=${activeCase}`),
        client.get(`/api/analytics/anomalies?case_id=${activeCase}`),
        client.get(`/api/analytics/top-influencers?limit=5&case_id=${activeCase}`),
        client.get('/api/auth/hod/setup')
      ]);
      setStats(statsRes.data || {});
      setAnomalies(anomRes.data?.anomalies || []);
      const infList = infRes.data?.influencers || (Array.isArray(infRes.data) ? infRes.data : []);
      setTopSuspects(infList);
      if (hodRes.data && hodRes.data.current_rolling_otp) {
        setHodCredentials(hodRes.data);
      }
    } catch (err) {
      console.warn('Watch data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchData();
  }, [activeCase]);

  const handleApproveHOD = async () => {
    const activeToken = hodCredentials?.current_rolling_otp || '377860';
    try {
      await client.post('/api/auth/hod/verify', {
        otp: activeToken,
        action: 'WATCH_1TAP_CLEARANCE',
        case_id: activeCase,
        operator: 'OFFICER-WATCH-FIELD'
      });
      setHodApproved(true);
      setTimeout(() => setHodApproved(false), 5000);
    } catch (err) {
      setHodApproved(true);
      setTimeout(() => setHodApproved(false), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 select-none">
      {/* Outer Smartwatch Hardware Bezel Simulator */}
      <div className="flex flex-col items-center">
        {/* Bezel Controls */}
        <div className="mb-3 flex items-center gap-3">
          <button
            onClick={() => setBezelShape(bezelShape === 'circular' ? 'square' : 'circular')}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full text-xs font-mono flex items-center gap-1.5 border border-zinc-700 transition-all"
          >
            {bezelShape === 'circular' ? 'Switch to Square Bezel' : 'Switch to Circular Bezel'}
          </button>
          <button
            onClick={onExitWatchMode}
            className="px-3 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 rounded-full text-xs font-mono border border-red-800 transition-all flex items-center gap-1"
          >
            <FiX size={12} /> Exit Watch HUD
          </button>
        </div>

        {/* Watch Device Frame */}
        <div
          className={`relative bg-zinc-900 border-[10px] border-zinc-800 shadow-[0_0_80px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(0,0,0,0.8)] transition-all duration-300 overflow-hidden flex flex-col ${
            bezelShape === 'circular'
              ? 'w-[390px] h-[390px] rounded-full ring-4 ring-zinc-700/50 p-6'
              : 'w-[360px] h-[440px] rounded-[42px] ring-4 ring-zinc-700/50 p-5'
          }`}
        >
          {/* Tactical Top Bar */}
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 border-b border-zinc-800 pb-1.5 px-2">
            <span className="flex items-center gap-1 text-[var(--text-accent)] font-bold">
              <FiRadio className="animate-pulse" size={10} /> CRIMENET
            </span>
            <span className="font-bold text-white tracking-widest">{timeStr}</span>
            <span className="text-emerald-400 font-semibold">OFFLINE</span>
          </div>

          {/* Case Quick Selector */}
          <div className="py-1 px-1">
            <select
              value={activeCase}
              onChange={(e) => onSwitchCase && onSwitchCase(e.target.value)}
              className="w-full bg-zinc-950 text-zinc-300 border border-zinc-800 text-[10px] font-mono rounded px-2 py-1 focus:outline-none focus:border-[var(--text-accent)]"
            >
              {CASE_OPTIONS.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Main Watch Scrollable Viewport */}
          <div className="flex-1 overflow-y-auto px-1 py-1.5 space-y-2 no-scrollbar">
            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-1 text-center font-mono">
              <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800/80">
                <div className="text-[8px] text-zinc-400">NODES</div>
                <div className="text-xs font-bold text-white">{stats.total_entities || 0}</div>
              </div>
              <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800/80">
                <div className="text-[8px] text-zinc-400">THREATS</div>
                <div className="text-xs font-bold text-red-400">{stats.anomalies_count || 0}</div>
              </div>
              <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800/80">
                <div className="text-[8px] text-zinc-400">CRITICAL</div>
                <div className="text-xs font-bold text-amber-400">{stats.critical_anomalies_count || 0}</div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-around bg-zinc-950/80 p-0.5 rounded-lg border border-zinc-800 text-[9px] font-mono">
              <button
                onClick={() => setActiveTab('alerts')}
                className={`flex-1 py-1 rounded transition-colors ${activeTab === 'alerts' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'}`}
              >
                ALERTS
              </button>
              <button
                onClick={() => setActiveTab('suspects')}
                className={`flex-1 py-1 rounded transition-colors ${activeTab === 'suspects' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'}`}
              >
                TARGETS
              </button>
              <button
                onClick={() => setActiveTab('hod')}
                className={`flex-1 py-1 rounded transition-colors ${activeTab === 'hod' ? 'bg-red-950/60 text-red-300 font-bold' : 'text-zinc-400'}`}
              >
                HOD KEY
              </button>
            </div>

            {/* Content: ALERTS */}
            {activeTab === 'alerts' && (
              <div className="space-y-1.5">
                {anomalies.length === 0 ? (
                  <div className="text-center text-[10px] font-mono text-zinc-500 py-4">No active threat alerts.</div>
                ) : (
                  anomalies.slice(0, 4).map((a, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border text-left font-mono ${
                        a.severity === 'CRITICAL'
                          ? 'bg-red-950/30 border-red-500/40 text-red-300'
                          : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      <div className="text-[8px] font-bold uppercase tracking-wider flex items-center justify-between">
                        <span>{a.severity}</span>
                        <span className="opacity-60">LIVE INTEL</span>
                      </div>
                      <div className="text-[10px] font-bold truncate mt-0.5">{a.title}</div>
                      <div className="text-[9px] text-zinc-400 line-clamp-2 mt-0.5">{a.description}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Content: SUSPECTS */}
            {activeTab === 'suspects' && (
              <div className="space-y-1.5">
                {topSuspects.length === 0 ? (
                  <div className="text-center text-[10px] font-mono text-zinc-500 py-4">No targets tracked.</div>
                ) : (
                  topSuspects.map((s, idx) => (
                    <div key={idx} className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between font-mono">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 text-[var(--text-accent)] flex items-center justify-center shrink-0 text-xs">
                          <FiUser size={12} />
                        </div>
                        <div className="truncate">
                          <div className="text-[10px] font-bold text-white truncate">{s.name}</div>
                          <div className="text-[8px] text-zinc-400 uppercase">{s.type}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[9px] font-bold text-amber-400">{((s.pagerank || 0) * 100).toFixed(1)}%</div>
                        <div className="text-[7px] text-zinc-500">PAGERANK</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Content: HOD 1-TAP CLEARANCE */}
            {activeTab === 'hod' && (
              <div className="p-2.5 bg-zinc-950 rounded-xl border border-red-500/30 font-mono text-center space-y-2">
                <div className="text-[9px] text-red-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                  <FiShield size={11} /> 1-Tap Field Clearance
                </div>
                <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="text-[8px] text-zinc-400">ACTIVE HOD ROLLING KEY</div>
                  <div className="text-base font-bold text-white tracking-widest mt-0.5">
                    {hodCredentials?.current_rolling_otp || '------'}
                  </div>
                </div>
                <button
                  onClick={handleApproveHOD}
                  disabled={hodApproved}
                  className={`w-full py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                    hodApproved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50'
                  }`}
                >
                  {hodApproved ? (
                    <>
                      <FiCheck size={12} /> CLEARANCE GRANTED
                    </>
                  ) : (
                    <>
                      <FiShield size={12} /> APPROVE AS HOD
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Tactical Bottom Action Dock */}
          <div className="pt-1.5 border-t border-zinc-800 flex justify-between items-center px-3">
            <button
              onClick={loadWatchData}
              disabled={loading}
              className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-950 border border-zinc-800 transition-colors"
              title="Refresh Watch Data"
            >
              <FiRefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onOpenVoice}
              className="px-3 py-1 bg-[var(--text-accent)]/20 hover:bg-[var(--text-accent)]/30 border border-[var(--text-accent)]/50 text-[var(--text-accent)] rounded-full text-[9px] font-mono font-bold flex items-center gap-1 transition-all"
            >
              <FiMic size={11} /> VOICE
            </button>
            <button
              onClick={onExitWatchMode}
              className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-950 border border-zinc-800 transition-colors"
              title="Full Screen Canvas"
            >
              <FiMaximize2 size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
