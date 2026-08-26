import React, { useState, useEffect } from 'react';
import { FiUsers, FiLink, FiActivity, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import { getTopInfluencers, getCommunities, getCrimePredictions } from '../api/client';

function StatCard({ title, value, icon, highlight }) {
  return (
    <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border)] flex items-center gap-3">
      <div className={`p-2 rounded-md ${highlight ? 'bg-red-500/20 text-red-500' : 'bg-[var(--bg-card-hover)] text-[var(--text-accent)]'}`}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{title}</div>
        <div className={`text-xl font-bold ${highlight ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
          {value || 0}
        </div>
      </div>
    </div>
  );
}

export default function LeftPanel({ stats, onEntitySelect }) {
  const [influencers, setInfluencers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTopInfluencers().catch(() => ({ influencers: [] })),
      getCommunities().catch(() => ({ communities: [] })),
      getCrimePredictions().catch(() => ({ predictions: [] }))
    ]).then(([infRes, comRes, predRes]) => {
      setInfluencers(infRes.influencers || []);
      setCommunities(comRes.communities || []);
      setPredictions(predRes.predictions || []);
      setLoading(false);
    });
  }, []);

  return (
    <aside className="w-[280px] bg-[var(--bg-card)] border-r border-[var(--border)] h-full overflow-y-auto flex flex-col z-10 shadow-lg shrink-0">
      <div className="p-4 space-y-6">
        
        {/* Dashboard Stats */}
        <div>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiActivity /> Overview
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <StatCard title="Entities" value={stats?.total_entities} icon={<FiUsers size={16}/>} />
            <StatCard title="Relations" value={stats?.total_relationships} icon={<FiLink size={16}/>} />
            <StatCard title="Communities" value={stats?.communities_count} icon={<FiUsers size={16}/>} />
            <StatCard title="Anomalies" value={stats?.anomalies_count} icon={<FiAlertTriangle size={16}/>} highlight={stats?.critical_anomalies > 0} />
          </div>
        </div>

        {/* Top Influencers */}
        <div>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiTrendingUp /> Key Targets
          </h2>
          {loading ? (
            <div className="animate-pulse h-20 bg-[var(--bg-primary)] rounded"></div>
          ) : (
            <div className="space-y-2">
              {influencers.slice(0, 5).map((inf, i) => (
                <div 
                  key={inf.id} 
                  className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border)] cursor-pointer hover:border-[var(--text-accent)] transition-colors flex items-center justify-between"
                  onClick={() => onEntitySelect(inf)}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="text-[10px] font-bold text-[var(--text-secondary)] w-4">{i + 1}</div>
                    <div className="truncate text-sm">{inf.name}</div>
                  </div>
                  <div className="w-12 h-1 bg-[var(--bg-card-hover)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--neon-red)]" 
                      style={{ width: `${Math.min(100, (inf.pagerank || 0) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Communities */}
        <div>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiUsers /> Syndicates Detected
          </h2>
          {loading ? (
            <div className="animate-pulse h-20 bg-[var(--bg-primary)] rounded"></div>
          ) : (
            <div className="space-y-2">
              {communities.slice(0, 5).map(com => (
                <div key={com.id} className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border)]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Network #{com.id.slice(0,4)}</span>
                    <span className="text-[10px] bg-[var(--bg-card-hover)] px-1.5 py-0.5 rounded text-[var(--text-accent)]">
                      {com.member_count} members
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--neon-gold)]">
                    {com.dominant_crime_type || 'Unknown Activity'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Crime Predictions */}
        <div>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiAlertTriangle /> Predictive Intel
          </h2>
          {loading ? (
             <div className="animate-pulse h-20 bg-[var(--bg-primary)] rounded"></div>
          ) : (
            <div className="space-y-3">
              {predictions.map((pred, i) => (
                <div key={i} className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border)]">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-primary)]">{pred.crime_type}</span>
                    <span className="text-[var(--neon-teal)]">{(pred.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1 bg-[var(--bg-card-hover)] rounded-full overflow-hidden mb-1">
                    <div 
                      className="h-full bg-[var(--neon-teal)]" 
                      style={{ width: `${pred.confidence * 100}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-[var(--text-secondary)]">
                    {pred.indicators?.length || 0} matching indicators
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}
