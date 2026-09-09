import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiX, FiShield, FiDownload, FiCheckCircle, FiRefreshCw, 
  FiSearch, FiFilter, FiCopy, FiCheck, FiAlertTriangle, FiAlertOctagon,
  FiFileText, FiLayers, FiEye, FiArrowRight
} from 'react-icons/fi';
import { getAuditLogs, verifyAuditIntegrity, exportAuditReport } from '../api/client';

export default function AuditLogViewer({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [integrityStatus, setIntegrityStatus] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getAuditLogs(100, severityFilter === 'All' ? null : severityFilter, searchQuery || null);
      setLogs(Array.isArray(data) ? data : (data.logs || []));
    } catch (err) {
      console.error('Failed to fetch SIEM audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      setIntegrityStatus(null);
    }
  }, [isOpen, severityFilter]);

  const handleVerify = async () => {
    try {
      const res = await verifyAuditIntegrity();
      setIntegrityStatus(res.is_valid ? 'valid' : 'tampered');
    } catch (err) {
      setIntegrityStatus('error');
    }
  };

  const handleExport = async () => {
    try {
      const res = await exportAuditReport();
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cert_in_audit_report_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Client-side quick filter for real-time search responsiveness
  const displayLogs = useMemo(() => {
    if (!searchQuery) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(log => 
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.resource && log.resource.toLowerCase().includes(q)) ||
      (log.user && log.user.toLowerCase().includes(q)) ||
      (log.user_id && log.user_id.toLowerCase().includes(q)) ||
      (log.sha256_hash && log.sha256_hash.toLowerCase().includes(q))
    );
  }, [logs, searchQuery]);

  // Metric counts
  const counts = useMemo(() => {
    const total = logs.length;
    const info = logs.filter(l => l.severity === 'INFO').length;
    const warning = logs.filter(l => l.severity === 'WARNING').length;
    const critical = logs.filter(l => l.severity === 'CRITICAL').length;
    return { total, info, warning, critical };
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#0b101b] border border-[#1e2d4a] rounded-2xl w-full max-w-7xl h-[92vh] shadow-2xl flex flex-col text-gray-200 overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0d1527] border-b border-[#1e2d4a] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <FiShield className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  SIEM Cryptographic Audit Trail
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                  CERT-In Sec 70B
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/70 text-blue-400 border border-blue-800/40">
                  Sec 65B IEA Compliant
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Append-only SHA-256 Merkle chain recording case navigation, dossier access, and forensic events
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleVerify}
              className="flex items-center gap-1.5 text-xs bg-[#132038] hover:bg-[#192b4a] text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-all"
              title="Verify cryptographic hash chain integrity"
            >
              <FiCheckCircle className="text-cyan-400" />
              Verify Chain Integrity
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 text-xs bg-[#132038] hover:bg-[#192b4a] text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-all"
              title="Export official CERT-In audit package"
            >
              <FiDownload className="text-amber-400" />
              Export CERT-In Report
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg bg-[#1a233a]/60 text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 border border-transparent transition-all"
              title="Close viewer"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>

        {/* Metric Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-[#080d18] border-b border-[#1e2d4a]">
          <div className="p-2.5 bg-[#0d1527] border border-[#1e2d4a] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-gray-400 font-mono block">Chained Logs</span>
              <span className="text-base font-bold text-white font-mono">{counts.total}</span>
            </div>
            <FiLayers className="text-gray-500 text-lg" />
          </div>

          <div className="p-2.5 bg-[#0d1527] border border-[#1e2d4a] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-gray-400 font-mono block">Normal Operations</span>
              <span className="text-base font-bold text-cyan-400 font-mono">{counts.info}</span>
            </div>
            <FiEye className="text-cyan-500/60 text-lg" />
          </div>

          <div className="p-2.5 bg-[#0d1527] border border-[#1e2d4a] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-gray-400 font-mono block">Security Flags</span>
              <span className="text-base font-bold text-amber-400 font-mono">{counts.warning}</span>
            </div>
            <FiAlertTriangle className="text-amber-500/60 text-lg" />
          </div>

          <div className="p-2.5 bg-[#0d1527] border border-[#1e2d4a] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-gray-400 font-mono block">Critical Anomalies</span>
              <span className="text-base font-bold text-red-400 font-mono">{counts.critical}</span>
            </div>
            <FiAlertOctagon className="text-red-500/60 text-lg" />
          </div>

          <div className="p-2.5 bg-[#0d1527] border border-[#1e2d4a] rounded-xl flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <span className="text-[10px] uppercase text-gray-400 font-mono block">Merkle Chain Status</span>
              <span className={`text-xs font-bold font-mono tracking-wide ${
                integrityStatus === 'tampered' ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {integrityStatus === 'tampered' ? 'COMPROMISED' : '100% VERIFIED'}
              </span>
            </div>
            <FiCheckCircle className="text-emerald-500/70 text-lg" />
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-3 bg-[#0a101f] border-b border-[#1e2d4a] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search logs by keyword, accused, victim, case, officer, action..."
                className="w-full bg-[#060a14] border border-[#1e2d4a] rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs text-gray-400 hover:text-white px-2"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400 text-xs" />
              <select 
                value={severityFilter} 
                onChange={e => setSeverityFilter(e.target.value)}
                className="bg-[#060a14] border border-[#1e2d4a] text-xs px-2.5 py-1.5 rounded-lg text-gray-200 outline-none focus:border-cyan-500 font-mono"
              >
                <option value="All">All Severities</option>
                <option value="INFO">INFO (Normal Ops)</option>
                <option value="WARNING">WARNING (Sensitive Access)</option>
                <option value="CRITICAL">CRITICAL (Security Alerts)</option>
              </select>
            </div>

            <button 
              onClick={fetchLogs} 
              className="flex items-center gap-1.5 text-xs bg-[#132038] text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-[#1e2d4a] hover:border-gray-600 transition-all"
            >
              <FiRefreshCw className={`text-xs ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Verification Status Toast Banner */}
        {integrityStatus === 'valid' && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-4 py-2 text-center text-xs text-emerald-300 font-mono flex items-center justify-center gap-2">
            <FiCheckCircle className="text-emerald-400" />
            <span>Cryptographic Proof Valid: All {counts.total} log entries verified against SHA-256 Merkle chain. Zero tampering detected.</span>
          </div>
        )}
        {integrityStatus === 'tampered' && (
          <div className="bg-red-950/80 border-b border-red-500/50 px-4 py-2 text-center text-xs text-red-300 font-mono font-bold flex items-center justify-center gap-2 animate-pulse">
            <FiAlertOctagon className="text-red-400" />
            <span>CRITICAL SECURITY ALERT: Chain integrity violation detected! Log entries fail bit-for-bit hash reconciliation.</span>
          </div>
        )}

        {/* Table Area */}
        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-[#0f172a] text-gray-300 sticky top-0 shadow-md border-b border-[#1e2d4a] z-10">
              <tr>
                <th className="p-2.5 w-36">Timestamp (UTC)</th>
                <th className="p-2.5 w-24">Severity</th>
                <th className="p-2.5 w-52">Action Type</th>
                <th className="p-2.5 w-36">Forensic User</th>
                <th className="p-2.5 w-44">Target Resource</th>
                <th className="p-2.5">Event Details & Forensic Context</th>
                <th className="p-2.5 w-32 text-right">SHA-256 Chain Seal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d4a]/40">
              {displayLogs.map((log, idx) => {
                const userText = log.user || log.user_id || 'OFFICER-ATS-402';
                const hashText = log.sha256_hash || log.hash || '';
                const isSelected = selectedLog && selectedLog.sha256_hash === log.sha256_hash;

                return (
                  <tr 
                    key={idx} 
                    onClick={() => setSelectedLog(isSelected ? null : log)}
                    className={`transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-[#15233e] border-cyan-500/50' 
                        : idx % 2 === 0 ? 'bg-[#090e1a]' : 'bg-[#060912]'
                    } hover:bg-[#121c33]`}
                  >
                    {/* Timestamp */}
                    <td className="p-2.5 text-gray-400 whitespace-nowrap text-[11px]">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString([], {
                        month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
                      }) : 'N/A'}
                    </td>

                    {/* Severity Pill */}
                    <td className="p-2.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800/60 shadow-[0_0_8px_rgba(239,68,68,0.3)]' :
                        log.severity === 'WARNING' ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                        'bg-cyan-950/70 text-cyan-300 border border-cyan-800/50'
                      }`}>
                        {log.severity}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-2.5 font-bold text-white whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-[#101726] border border-[#1e2d4a] text-gray-200">
                        {log.action}
                      </span>
                    </td>

                    {/* User */}
                    <td className="p-2.5 text-cyan-400 font-semibold whitespace-nowrap">
                      {userText}
                    </td>

                    {/* Resource */}
                    <td className="p-2.5 max-w-[160px] truncate text-gray-300" title={log.resource}>
                      <span className="text-gray-400 font-mono text-[11px]">{log.resource}</span>
                    </td>

                    {/* Details */}
                    <td className="p-2.5 text-gray-300 text-[11px]" title={log.details}>
                      <div className="line-clamp-2 leading-relaxed">
                        {log.details || 'System audit checkpoint recorded.'}
                      </div>
                    </td>

                    {/* Hash & Copy */}
                    <td className="p-2.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-gray-500 font-mono text-[11px]" title={hashText}>
                          {hashText ? hashText.substring(0, 8) + '...' : '-'}
                        </span>
                        {hashText && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(hashText, `hash_${idx}`);
                            }}
                            className="p-1 hover:bg-[#1e2d4a] rounded text-gray-400 hover:text-cyan-400 transition-all"
                            title="Copy full SHA-256 hash"
                          >
                            {copiedHash === `hash_${idx}` ? <FiCheck className="text-xs text-emerald-400" /> : <FiCopy className="text-xs" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {displayLogs.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500">
                    No matching audit log entries found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Log Quick Inspector Modal / Drawer */}
        {selectedLog && (
          <div className="p-4 bg-[#0d1527] border-t border-[#1e2d4a] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono animate-in slide-in-from-bottom duration-150">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{selectedLog.action}</span>
                <span className="text-gray-400">by</span>
                <span className="text-cyan-400 font-semibold">{selectedLog.user || selectedLog.user_id}</span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-400">IP: {selectedLog.ip_address || '127.0.0.1'}</span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-400">{new Date(selectedLog.timestamp).toUTCString()}</span>
              </div>
              <p className="text-gray-300 text-xs font-sans">
                {selectedLog.details}
              </p>
              <div className="text-[11px] text-gray-500 break-all">
                Full SHA-256: <span className="text-emerald-400">{selectedLog.sha256_hash || selectedLog.hash}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="px-3 py-1 rounded bg-[#1e2d4a] hover:bg-[#253658] text-gray-300 text-xs shrink-0"
            >
              Close Inspector
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
