import React, { useState, useEffect } from 'react';
import { FiBell, FiAlertCircle } from 'react-icons/fi';
import { getAnomalies } from '../api/client';

export default function AlertsFeed({ onEntitySelect }) {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnomalies().then(res => {
      setAnomalies(res.anomalies || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'text-[var(--severity-critical)] border-[var(--severity-critical)] bg-[var(--severity-critical)]/10';
      case 'HIGH': return 'text-[var(--severity-high)] border-[var(--severity-high)] bg-[var(--severity-high)]/10';
      case 'MEDIUM': return 'text-[var(--severity-medium)] border-[var(--severity-medium)] bg-[var(--severity-medium)]/10';
      case 'LOW': return 'text-[var(--severity-low)] border-[var(--severity-low)] bg-[var(--severity-low)]/10';
      default: return 'text-[var(--text-secondary)] border-[var(--text-secondary)] bg-[var(--bg-primary)]';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-card)] sticky top-0 z-10 flex items-center gap-2">
        <FiBell className="text-[var(--text-accent)]" />
        <h2 className="text-sm font-semibold uppercase tracking-wider">Live Intel Feed</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
           Array.from({length: 5}).map((_, i) => (
             <div key={i} className="animate-pulse h-24 bg-[var(--bg-primary)] rounded-md border border-[var(--border)]"></div>
           ))
        ) : anomalies.length === 0 ? (
          <div className="text-center text-[var(--text-secondary)] text-sm p-4">
            No active anomalies detected.
          </div>
        ) : (
          anomalies.map((anomaly, i) => (
            <div key={i} className={`p-3 rounded-md border ${getSeverityColor(anomaly.severity)} relative overflow-hidden group`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1.5">
                  <FiAlertCircle size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{anomaly.severity}</span>
                </div>
                <span className="text-[9px] opacity-70">Just now</span>
              </div>
              <h3 className="text-sm font-bold mb-1 text-[var(--text-primary)]">{anomaly.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-2 line-clamp-2 group-hover:line-clamp-none transition-all">
                {anomaly.description}
              </p>
              {anomaly.entity_ids && anomaly.entity_ids.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {anomaly.entity_ids.map(id => (
                    <button 
                      key={id}
                      className="text-[9px] px-1.5 py-0.5 rounded border border-current opacity-80 hover:opacity-100"
                      onClick={() => onEntitySelect({ id })}
                    >
                      {id.slice(0, 8)}...
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
