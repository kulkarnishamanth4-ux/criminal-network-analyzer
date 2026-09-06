import React, { useState, useEffect } from 'react';
import { FiX, FiShield, FiDownload, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { getAuditLogs, verifyAuditIntegrity, exportAuditReport } from '../api/client';

export default function AuditLogViewer({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [integrityStatus, setIntegrityStatus] = useState(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getAuditLogs(50, filter === 'All' ? null : filter);
      setLogs(data.logs || data); // handle both direct array or wrapped object
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      setIntegrityStatus(null);
    }
  }, [isOpen, filter]);

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
      a.download = `cert_in_audit_report_${new Date().toISOString()}.json`;
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a1628] border border-[#1e3a5f] rounded-lg w-full max-w-6xl h-[85vh] shadow-2xl flex flex-col text-[#c8d6e5] animate-in zoom-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#1e3a5f] bg-[#0a1628]">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FiShield className="text-[#64ffda]" />
            SIEM Audit Log Viewer
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-[#1e3a5f] flex justify-between items-center bg-[#05050f]">
          <div className="flex items-center gap-4">
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              className="bg-[#0a1628] border border-[#1e3a5f] text-xs p-1.5 rounded text-[#c8d6e5] focus:outline-none"
            >
              <option value="All">All Severities</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            <button onClick={fetchLogs} className="flex items-center gap-1 text-xs bg-[#1e3a5f] text-[#c8d6e5] px-3 py-1.5 rounded hover:bg-[#2c4a75] transition-colors">
              <FiRefreshCw className={isLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={handleVerify} className="flex items-center gap-2 text-xs bg-[#1e3a5f] text-[#64ffda] border border-[#64ffda]/30 px-3 py-1.5 rounded hover:bg-[#64ffda]/10 transition-colors">
              <FiCheckCircle /> Verify Chain Integrity
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 text-xs bg-[#1e3a5f] text-[#f9ca24] border border-[#f9ca24]/30 px-3 py-1.5 rounded hover:bg-[#f9ca24]/10 transition-colors">
              <FiDownload /> Export CERT-In Report
            </button>
          </div>
        </div>

        {/* Integrity Status Banner */}
        {integrityStatus === 'valid' && (
          <div className="bg-green-900/30 border-y border-green-500/50 p-2 text-center text-xs text-green-400 font-mono">
            SUCCESS: Chain integrity verified. No tampering detected.
          </div>
        )}
        {integrityStatus === 'tampered' && (
          <div className="bg-red-900/30 border-y border-red-500/50 p-2 text-center text-xs text-red-400 font-mono font-bold">
            CRITICAL: Chain integrity violation detected! Logs may have been tampered with.
          </div>
        )}

        {/* Table Area */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#1e3a5f]/50 text-gray-300 sticky top-0 shadow">
              <tr>
                <th className="p-2 border-b border-[#1e3a5f]">Timestamp</th>
                <th className="p-2 border-b border-[#1e3a5f]">Severity</th>
                <th className="p-2 border-b border-[#1e3a5f]">Action</th>
                <th className="p-2 border-b border-[#1e3a5f]">User</th>
                <th className="p-2 border-b border-[#1e3a5f]">Resource</th>
                <th className="p-2 border-b border-[#1e3a5f]">Hash</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(logs) && logs.map((log, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-[#0a1628]' : 'bg-[#05050f]'} hover:bg-[#1e3a5f]/30 transition-colors`}>
                  <td className="p-2 border-b border-[#1e3a5f]/30 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-2 border-b border-[#1e3a5f]/30">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.severity === 'CRITICAL' ? 'bg-red-900/50 text-red-400 border border-red-500/30' :
                      log.severity === 'WARNING' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30' :
                      'bg-blue-900/50 text-blue-400 border border-blue-500/30'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="p-2 border-b border-[#1e3a5f]/30 font-bold">{log.action}</td>
                  <td className="p-2 border-b border-[#1e3a5f]/30 text-[#64ffda]">{log.user_id}</td>
                  <td className="p-2 border-b border-[#1e3a5f]/30 max-w-[200px] truncate" title={log.resource}>{log.resource}</td>
                  <td className="p-2 border-b border-[#1e3a5f]/30 text-gray-500 truncate" title={log.hash}>{log.hash ? log.hash.substring(0, 12) + '...' : '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-gray-500">No logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
