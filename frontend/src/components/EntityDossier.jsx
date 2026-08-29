import React, { useState, useEffect } from 'react';
import { FiUser, FiPhone, FiMapPin, FiBriefcase, FiDollarSign, FiActivity, FiChevronDown, FiChevronUp, FiAlertTriangle, FiTrendingUp, FiUsers, FiClock, FiArrowRight } from 'react-icons/fi';
import { getEntityDossier } from '../api/client';

const getIcon = (type) => {
  switch (type?.toUpperCase()) {
    case 'PERSON': return <FiUser />;
    case 'PHONE': return <FiPhone />;
    case 'LOCATION': return <FiMapPin />;
    case 'BANK_ACCOUNT': return <FiDollarSign />;
    case 'VEHICLE': return <FiActivity />;
    default: return <FiBriefcase />;
  }
};

const getRiskLabel = (score) => {
  if (score > 0.7) return { label: 'CRITICAL', color: 'var(--severity-critical)', bg: 'rgba(255,0,64,0.15)' };
  if (score > 0.4) return { label: 'HIGH', color: 'var(--severity-high)', bg: 'rgba(255,107,53,0.15)' };
  if (score > 0.15) return { label: 'MEDIUM', color: 'var(--severity-medium)', bg: 'rgba(249,202,36,0.15)' };
  return { label: 'LOW', color: 'var(--severity-low)', bg: 'rgba(78,205,196,0.15)' };
};

function Section({ title, icon, count, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <button 
        className="w-full flex items-center justify-between p-3 hover:bg-[var(--bg-card-hover)] transition-colors text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
          {count !== undefined && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--bg-card-hover)] text-[var(--text-accent)]">{count}</span>
          )}
        </span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {open && <div className="p-3 pt-0">{children}</div>}
    </div>
  );
}

export default function EntityDossier({ entityData, onEntitySelect, onExpandNetwork }) {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRelId, setExpandedRelId] = useState(null);

  useEffect(() => {
    if (!entityData?.id) return;
    setLoading(true);
    getEntityDossier(entityData.id)
      .then(res => {
        setDossier(res);
        setLoading(false);
      })
      .catch(() => {
        setDossier({ entity: entityData, relationships: [], firs: [], anomalies: [] });
        setLoading(false);
      });
  }, [entityData?.id]);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-[var(--text-secondary)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--text-accent)] mb-4"></div>
        <span className="text-xs animate-pulse">Compiling intelligence report...</span>
      </div>
    );
  }

  const { entity, relationships, firs, anomalies } = dossier || {};
  const type = entity?.entity_type || entity?.type || 'UNKNOWN';
  const name = entity?.name || entity?.label || entity?.id || 'Unknown';
  const pr = entity?.pagerank || entity?.metrics?.pagerank || 0;
  const bt = entity?.betweenness || entity?.metrics?.betweenness || 0;
  const communityId = entity?.community_id ?? entity?.metrics?.community_id ?? null;
  const risk = getRiskLabel(pr);

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
        
        {/* Risk Badge */}
        <div className="mt-3 flex justify-center">
          <span 
            className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border"
            style={{ color: risk.color, backgroundColor: risk.bg, borderColor: risk.color }}
          >
            {risk.label} THREAT
          </span>
        </div>

        {/* Threat Gauge */}
        <div className="mt-3 flex flex-col items-center">
          <div className="w-full bg-[var(--bg-primary)] h-2 rounded-full overflow-hidden flex">
            <div 
              className="h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, pr * 500)}%`, backgroundColor: risk.color }}
            />
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="flex-1 overflow-y-auto">

        {/* Metrics */}
        <Section title="Network Metrics" icon={<FiTrendingUp size={12} />} defaultOpen={true}>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-card)] p-2 rounded border border-[var(--border)] text-center">
              <div className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider">PageRank</div>
              <div className="text-sm font-bold text-[var(--text-accent)]">{(pr * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-[var(--bg-card)] p-2 rounded border border-[var(--border)] text-center">
              <div className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider">Betweenness</div>
              <div className="text-sm font-bold text-[var(--neon-gold)]">{(bt * 100).toFixed(1)}%</div>
            </div>
            {communityId !== null && (
              <div className="bg-[var(--bg-card)] p-2 rounded border border-[var(--border)] text-center col-span-2">
                <div className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-center gap-1"><FiUsers size={10} /> Syndicate Cluster</div>
                <div className="text-sm font-bold text-[var(--neon-purple)]">Cluster #{communityId}</div>
              </div>
            )}
          </div>
        </Section>

        {/* Properties */}
        <Section title="Properties" icon={<FiBriefcase size={12} />}>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">ID:</span>
              <span className="font-mono text-[10px] text-[var(--text-primary)]">{entity?.id}</span>
            </div>
            {Object.keys(entity?.properties || {}).length === 0 ? (
              <div className="text-[10px] text-[var(--text-secondary)] italic text-center py-2 opacity-50">No additional intelligence logged.</div>
            ) : (
              Object.entries(entity.properties).map(([key, val]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)] capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-[var(--text-primary)] text-right max-w-[60%] truncate" title={String(val)}>{String(val)}</span>
                </div>
              ))
            )}
          </div>
        </Section>

        {/* Anomalies */}
        {anomalies && anomalies.length > 0 && (
          <Section title="Linked Anomalies" icon={<FiAlertTriangle size={12} />} count={anomalies.length} defaultOpen={true}>
            <ul className="space-y-2">
              {anomalies.map((a, i) => {
                const sevColor = a.severity === 'CRITICAL' ? 'var(--severity-critical)' : a.severity === 'HIGH' ? 'var(--severity-high)' : 'var(--severity-medium)';
                return (
                  <li key={i} className="text-xs p-2 bg-[var(--bg-card)] rounded border border-[var(--border)]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sevColor }}></span>
                      <span className="font-bold text-[10px] uppercase tracking-wider" style={{ color: sevColor }}>{a.severity}</span>
                    </div>
                    <div className="text-[var(--text-primary)] font-medium">{a.title}</div>
                    {a.description && <div className="text-[var(--text-secondary)] text-[10px] mt-1 line-clamp-2">{a.description}</div>}
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {/* Criminal Records */}
        {firs && firs.length > 0 && (
          <Section title="Criminal Records" icon={<FiClock size={12} />} count={firs.length}>
            <ul className="space-y-2">
              {firs.map((fir, i) => (
                <li key={i} className="text-xs p-2 bg-[var(--bg-card)] rounded border border-[var(--border)] overflow-hidden">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="font-bold text-[var(--neon-red)] truncate" title={`FIR #${fir.fir_number || fir.id}`}>FIR #{fir.fir_number || fir.id}</span>
                    {fir.crime_type && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-card-hover)] text-[var(--neon-gold)] shrink-0 whitespace-nowrap">{fir.crime_type}</span>}
                  </div>
                  {fir.police_station && <div className="text-[10px] text-[var(--text-secondary)]"> {fir.police_station}{fir.district ? `, ${fir.district}` : ''}</div>}
                  {fir.raw_text && <div className="mt-1 line-clamp-2 text-[10px] text-[var(--text-secondary)] italic">"{fir.raw_text.slice(0, 120)}…"</div>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Known Connections */}
        {relationships && relationships.length > 0 && (
          <Section title="Known Connections" icon={<FiActivity size={12} />} count={relationships.length}>
             <ul className="space-y-1.5">
                {relationships.slice(0, 15).map((rel, i) => (
                  <li key={i} className="bg-[var(--bg-card)] rounded border border-[var(--border)] overflow-hidden transition-all group">
                    <div className="text-xs flex items-center justify-between p-2 cursor-pointer hover:bg-[var(--bg-card-hover)]"
                         onClick={() => onEntitySelect && onEntitySelect({ id: rel.target_id, name: rel.target_name })}>
                      <div className="flex items-center gap-2 truncate max-w-[70%]">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-card-hover)] text-[var(--text-accent)] shrink-0 font-mono tracking-tight">{rel.type}</span>
                        <span className="truncate text-[var(--text-primary)] font-medium group-hover:text-[var(--text-accent)]" title="Click to view target dossier">{rel.target_name || `Entity #${rel.target_id}`}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setExpandedRelId(expandedRelId === rel.id ? null : rel.id); }}
                        className="text-[10px] text-[var(--text-secondary)] opacity-60 hover:opacity-100 flex items-center gap-1 border border-transparent hover:border-[var(--text-accent)] hover:text-[var(--text-accent)] px-1.5 py-0.5 rounded transition-all"
                        title="Inspect connection details"
                      >
                        INSPECT {expandedRelId === rel.id ? <FiChevronUp size={10} /> : <FiChevronDown size={10} />}
                      </button>
                    </div>
                    
                    {/* Expanded Inline Details */}
                    {expandedRelId === rel.id && (
                      <div className="bg-[var(--bg-card-hover)] p-2 text-[10px] border-t border-[var(--border)]">
                        <div className="font-bold text-[var(--text-primary)] mb-1 uppercase tracking-wider text-[9px] border-b border-[var(--border)] pb-1">Connection Analytics</div>
                        <div className="space-y-1.5 mt-1.5">
                           {rel.timestamp && (
                             <div className="flex justify-between">
                               <span className="text-[var(--text-secondary)]">Timestamp:</span>
                               <span className="text-[var(--text-primary)] font-mono">{new Date(rel.timestamp).toLocaleString()}</span>
                             </div>
                           )}
                           {Object.keys(rel.properties || {}).length === 0 && !rel.timestamp ? (
                             <div className="text-[var(--text-secondary)] italic">No additional metadata available for this link.</div>
                           ) : (
                             Object.entries(rel.properties || {}).map(([k, v]) => (
                               <div key={k} className="flex justify-between">
                                 <span className="text-[var(--text-secondary)] capitalize">{k.replace(/_/g, ' ')}:</span>
                                 <span className="text-[var(--text-primary)] font-mono text-right truncate max-w-[70%]" title={String(v)}>{String(v)}</span>
                               </div>
                             ))
                           )}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              {relationships.length > 15 && (
                <li className="text-[10px] text-center text-[var(--text-secondary)] py-1">
                  +{relationships.length - 15} more connections
                </li>
              )}
            </ul>
          </Section>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-card)]">
        <button 
          onClick={() => onExpandNetwork && onExpandNetwork(entity?.id)}
          className="w-full py-2 bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--text-accent)] hover:text-[var(--text-accent)] transition-colors rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <FiActivity /> Focus Subnetwork
        </button>
      </div>
    </div>
  );
}
