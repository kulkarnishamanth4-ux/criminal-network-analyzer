import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiUsers, FiLink, FiActivity, FiAlertTriangle, FiTrendingUp, FiSearch, FiX } from 'react-icons/fi';
import { getTopInfluencers, getCommunities, getCrimePredictions, searchEntities } from '../api/client';

function StatCard({ title, value, icon, highlight }) {
  return (
    <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border)] flex items-center gap-2 overflow-hidden">
      <div className={`p-2 rounded-md shrink-0 ${highlight ? 'bg-[var(--severity-critical)] text-[var(--bg-primary)]' : 'bg-[var(--bg-card-hover)] text-[var(--text-accent)]'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wide truncate" title={title}>{title}</div>
        <div className={`text-lg font-bold ${highlight ? 'text-[var(--severity-critical)]' : 'text-[var(--text-primary)]'}`}>
          {value || 0}
        </div>
      </div>
    </div>
  );
}

export default function LeftPanel({ stats, onEntitySelect, onCommunitySelect, activeCase }) {
  const [influencers, setInfluencers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    Promise.all([
      getTopInfluencers(10, activeCase).catch(() => ({})),
      getCommunities(activeCase).catch(() => ({})),
      getCrimePredictions(activeCase).catch(() => ({}))
    ]).then(([inf, comm, pred]) => {
      setInfluencers(Array.isArray(inf) ? inf : (inf?.influencers || []));
      setCommunities(Array.isArray(comm) ? comm : (comm?.communities || []));
      setPredictions(Array.isArray(pred) ? pred : (pred?.predictions || []));
      setLoading(false);
    });
  }, [activeCase]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(() => {
      setIsSearching(true);
      searchEntities(searchQuery).then(res => {
        setSearchResults(res.results || []);
        setIsSearching(false);
      }).catch(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  if (isCollapsed) {
    return (
      <aside className="w-[40px] bg-[var(--bg-card)] border-r border-[var(--border)] h-full flex flex-col z-10 shadow-lg shrink-0 items-center pt-4">
        <button onClick={() => setIsCollapsed(false)} className="text-[var(--text-secondary)] hover:text-white p-2 rounded hover:bg-[var(--bg-primary)]" title="Expand Panel">
          <FiChevronRight size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[280px] bg-[var(--bg-card)] border-r border-[var(--border)] h-full overflow-y-auto flex flex-col z-10 shadow-lg shrink-0 relative">
      <button onClick={() => setIsCollapsed(true)} className="absolute top-3 right-3 z-50 text-[var(--text-secondary)] hover:text-white p-1 rounded hover:bg-[var(--bg-primary)]" title="Collapse Panel">
        <FiChevronLeft size={16} />
      </button>
      <div className="p-4 space-y-6 pt-10">
        
        {/* Global Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
            <FiSearch size={14} />
          </div>
          <input
            type="text"
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded p-2 pl-9 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-accent)] transition-colors"
            placeholder="Search entities, phones, accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-secondary)] hover:text-white"
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
            >
              <FiX size={14} />
            </button>
          )}
          
          {/* Search Dropdown */}
          {searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-card)] border border-[var(--border)] rounded shadow-xl max-h-60 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-3 text-xs text-center text-[var(--text-secondary)]">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-xs text-center text-[var(--text-secondary)]">No matches found.</div>
              ) : (
                <ul className="py-1">
                  {searchResults.map(result => (
                    <li 
                      key={result.id}
                      className="px-3 py-2 text-xs hover:bg-[var(--bg-card-hover)] cursor-pointer flex justify-between items-center group"
                      onClick={() => {
                        onEntitySelect(result);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <span className="truncate text-[var(--text-primary)] group-hover:text-[var(--text-accent)]">{result.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-secondary)] uppercase">{result.type || result.entity_type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

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
              {influencers.slice(0, 5).map((inf, i) => {
                const maxPr = Math.max(...influencers.map(x => x.pagerank || 0), 0.0001);
                const pct = Math.min(100, ((inf.pagerank || 0) / maxPr) * 100);
                return (
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
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )})}
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
                <div 
                  key={com.community_id || com.id} 
                  onClick={() => onCommunitySelect && onCommunitySelect(com.community_id)}
                  className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border)] cursor-pointer hover:bg-[#111] hover:border-[var(--text-accent)] transition-colors"
                >
                  <div className="text-sm font-medium leading-tight mb-1">
                    {com.alias || `Cluster #${com.community_id || com.id}`}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-[var(--neon-gold)] truncate flex-1">
                      {com.dominant_crime_type || 'Syndicate Operations'}
                    </span>
                    <span className="text-[10px] bg-[var(--bg-card-hover)] px-1.5 py-0.5 rounded text-[var(--text-accent)] shrink-0 font-medium">
                      {com.member_count} members
                    </span>
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
