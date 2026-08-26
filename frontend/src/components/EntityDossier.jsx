import React, { useState, useEffect } from 'react';
import { FiUser, FiPhone, FiMapPin, FiBriefcase, FiDollarSign, FiActivity, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { getEntityDossier, getNetwork } from '../api/client';

const getIcon = (type) => {
  switch (type?.toUpperCase()) {
    case 'PERSON': return <FiUser />;
    case 'PHONE': return <FiPhone />;
    case 'LOCATION': return <FiMapPin />;
    case 'BANK_ACCOUNT': return <FiDollarSign />;
    default: return <FiBriefcase />;
  }
};

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <button 
        className="w-full flex items-center justify-between p-3 hover:bg-[var(--bg-card-hover)] transition-colors text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
        onClick={() => setOpen(!open)}
      >
        {title}
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {open && <div className="p-3 pt-0">{children}</div>}
    </div>
  );
}

export default function EntityDossier({ entityData }) {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityData?.id) return;
    setLoading(true);
    getEntityDossier(entityData.id)
      .then(res => {
        setDossier(res);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to basic data if dossier fails
        setDossier({ entity: entityData, relationships: [], firs: [] });
        setLoading(false);
      });
  }, [entityData?.id]);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-[var(--text-secondary)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--text-accent)] mb-4"></div>
        Compiling intelligence report...
      </div>
    );
  }

  const { entity, relationships, firs, anomalies } = dossier || {};
  const type = entity?.entity_type || entity?.type || 'UNKNOWN';
  const name = entity?.name || entity?.label || entity?.id || 'Unknown';
  const risk = entity?.risk_score || entity?.metrics?.pagerank || 0;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header Profile */}
      <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-card)] text-center pt-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--bg-card-hover)] border-2 border-[var(--text-accent)] text-2xl text-[var(--text-accent)] mb-3">
          {getIcon(type)}
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] break-words">{name}</h2>
        <div className="inline-block mt-2 px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md text-[10px] text-[var(--text-secondary)] tracking-widest uppercase">
          {type}
        </div>
        
        {/* Risk Gauge */}
        <div className="mt-4 flex flex-col items-center">
          <div className="text-[10px] text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Threat Level</div>
          <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-full overflow-hidden flex">
            <div 
              className={`h-full ${risk > 0.7 ? 'bg-[var(--severity-critical)]' : risk > 0.4 ? 'bg-[var(--severity-high)]' : 'bg-[var(--severity-medium)]'}`} 
              style={{ width: `${Math.min(100, risk * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="flex-1 overflow-y-auto">
        <Section title="Properties">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">ID:</span>
              <span className="font-mono text-[10px] text-[var(--text-primary)]">{entity?.id}</span>
            </div>
            {Object.entries(entity?.properties || {}).map(([key, val]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)] capitalize">{key.replace('_', ' ')}:</span>
                <span className="text-[var(--text-primary)] text-right max-w-[60%] truncate" title={String(val)}>{String(val)}</span>
              </div>
            ))}
          </div>
        </Section>

        {firs && firs.length > 0 && (
          <Section title={`Criminal Records (${firs.length})`}>
            <ul className="space-y-2">
              {firs.map((fir, i) => (
                <li key={i} className="text-xs p-2 bg-[var(--bg-card)] rounded border border-[var(--border)]">
                  <div className="font-bold text-[var(--neon-red)]">{fir.id || 'FIR'}</div>
                  <div className="text-[var(--text-secondary)] text-[10px]">{fir.date}</div>
                  <div className="mt-1 line-clamp-2 text-[10px]">{fir.summary || fir.description}</div>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {relationships && relationships.length > 0 && (
          <Section title={`Known Connections (${relationships.length})`}>
             <ul className="space-y-2">
              {relationships.slice(0, 10).map((rel, i) => (
                <li key={i} className="text-xs flex items-center justify-between p-1.5 bg-[var(--bg-card)] rounded border border-[var(--border)]">
                  <span className="text-[var(--text-accent)] text-[10px] truncate max-w-[40%]">{rel.type}</span>
                  <span className="truncate max-w-[50%]">{rel.target_name || rel.target_id}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-card)]">
        <button className="w-full py-2 bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--text-accent)] hover:text-[var(--text-accent)] transition-colors rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
          <FiActivity /> Expand Network
        </button>
      </div>
    </div>
  );
}
