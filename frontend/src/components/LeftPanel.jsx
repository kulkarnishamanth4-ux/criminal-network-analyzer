import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiUsers, FiLink, FiActivity, FiAlertTriangle, FiTrendingUp, FiSearch, FiX } from 'react-icons/fi';
import { getTopInfluencers, getCommunities, getCrimePredictions, searchEntities, getUploadedFiles } from '../api/client';
import { CASE_PREDICTIONS, computeDynamicPredictions } from '../data/predictions_seed';

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

export default function LeftPanel({ 
  stats, 
  dataVersion = 0,
  onEntitySelect, 
  onCommunitySelect, 
  activeCase,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  graphData = null
}) {
  const [influencers, setInfluencers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [predictions, setPredictions] = useState(() => 
    CASE_PREDICTIONS[activeCase] || computeDynamicPredictions({ caseId: activeCase, graphData }) || []
  );
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedPredIndex, setExpandedPredIndex] = useState(null);
  
  useEffect(() => {
    if (controlledCollapsed !== undefined) {
      setIsCollapsed(controlledCollapsed);
    }
  }, [controlledCollapsed]);

  const handleToggleCollapse = (val) => {
    setIsCollapsed(val);
    if (onToggleCollapse) onToggleCollapse(val);
  };
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Initial prediction estimate
    const initialEstimate = CASE_PREDICTIONS[activeCase] || computeDynamicPredictions({ caseId: activeCase, graphData });
    setPredictions(initialEstimate || []);
    setInfluencers([]);
    setCommunities([]);

    Promise.all([
      getTopInfluencers(10, activeCase).catch(() => ({})),
      getCommunities(activeCase).catch(() => ({})),
      getCrimePredictions(activeCase).catch(() => ([])),
      getUploadedFiles(activeCase).catch(() => ([]))
    ]).then(([inf, comm, pred, files]) => {
      setInfluencers(Array.isArray(inf) ? inf : (inf?.influencers || []));
      setCommunities(Array.isArray(comm) ? comm : (comm?.communities || []));
      
      const predList = Array.isArray(pred) ? pred : (pred?.predictions || []);
      const hasValidIndicators = predList && predList.length > 0 && predList.some(p => Array.isArray(p.indicators) && p.indicators.length > 0);

      if (hasValidIndicators) {
        setPredictions(predList);
      } else {
        // Dynamically compute evidence from graph and uploaded documents
        const dynamicPreds = computeDynamicPredictions({
          caseId: activeCase,
          graphData: graphData,
          uploadedFiles: Array.isArray(files) ? files : [],
          anomalies: []
        });
        setPredictions(dynamicPreds);
      }
      setLoading(false);
    });
  }, [activeCase, dataVersion, stats?.total_entities, stats?.total_relationships, graphData]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(() => {
      setIsSearching(true);
      searchEntities(searchQuery, null, activeCase).then(res => {
        setSearchResults(res.results || []);
        setIsSearching(false);
      }).catch(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  if (isCollapsed) {
    return (
      <aside className="w-[40px] bg-[var(--bg-card)] border-r border-[var(--border)] h-full flex flex-col z-10 shadow-lg shrink-0 items-center pt-4 transition-all duration-300">
        <button onClick={() => handleToggleCollapse(false)} className="text-[var(--text-secondary)] hover:text-white p-2 rounded hover:bg-[var(--bg-primary)] cursor-pointer" title="Expand Panel">
          <FiChevronRight size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[280px] bg-[var(--bg-card)] border-r border-[var(--border)] h-full overflow-y-auto flex flex-col z-10 shadow-lg shrink-0 relative transition-all duration-300">
      <button onClick={() => handleToggleCollapse(true)} className="absolute top-3 right-3 z-50 text-[var(--text-secondary)] hover:text-white p-1 rounded hover:bg-[var(--bg-primary)] cursor-pointer" title="Collapse Panel">
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
                <div className="p-3 text-xs text-[var(--text-secondary)] text-center">Searching Intelligence Base...</div>
              ) : searchResults.length > 0 ? (
                <div className="p-1">
                  {searchResults.map(entity => (
                    <div 
                      key={entity.id} 
                      className="p-2 hover:bg-[var(--bg-card-hover)] cursor-pointer rounded flex items-center justify-between border-b border-[var(--border)] last:border-0"
                      onClick={() => {
                        onEntitySelect(entity);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <div>
                        <div className="text-xs font-semibold text-[var(--text-primary)]">{entity.name}</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">{entity.entity_type}</div>
                      </div>
                      <span className="text-[10px] text-[var(--text-accent)]">Select</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-xs text-[var(--text-secondary)] text-center">No entities found</div>
              )}
            </div>
          )}
        </div>

        {/* Dashboard Stats */}
        <div>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiActivity /> System Stats
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <StatCard 
              title="Entities" 
              value={stats?.total_entities} 
              icon={<FiUsers size={14} />} 
            />
            <StatCard 
              title="Relations" 
              value={stats?.total_relationships} 
              icon={<FiLink size={14} />} 
            />
            <StatCard 
              title="Clusters" 
              value={stats?.communities_count} 
              icon={<FiTrendingUp size={14} />} 
            />
            <StatCard 
              title="Threats" 
              value={stats?.anomalies_count} 
              icon={<FiAlertTriangle size={14} />} 
              highlight={stats?.critical_anomalies > 0} 
            />
          </div>
        </div>

        {/* Top Influencers */}
        <div>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiTrendingUp /> Key Targets (PageRank)
          </h2>
          {loading ? (
            <div className="animate-pulse h-20 bg-[var(--bg-primary)] rounded"></div>
          ) : influencers.length > 0 ? (
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
          ) : (
            <div className="p-2.5 text-[11px] text-[var(--text-secondary)] text-center font-mono border border-dashed border-[var(--border)] rounded-lg">
              No key targets found
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
          ) : communities.length > 0 ? (
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
          ) : (
            <div className="p-2.5 text-[11px] text-[var(--text-secondary)] text-center font-mono border border-dashed border-[var(--border)] rounded-lg">
              No syndicate clusters detected
            </div>
          )}
        </div>

        {/* Crime Predictions */}
        <div>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiAlertTriangle /> Predictive Intel
          </h2>
          {loading && predictions.length === 0 ? (
             <div className="animate-pulse h-20 bg-[var(--bg-primary)] rounded"></div>
          ) : predictions.length > 0 ? (
            <div className="space-y-2.5">
              {predictions.map((pred, i) => {
                const confPct = Math.round(pred.confidence * 100);
                const barColor = confPct >= 90 ? 'bg-[#ff4757]' : confPct >= 75 ? 'bg-[#ffa502]' : 'bg-[var(--neon-teal)]';
                const textColor = confPct >= 90 ? 'text-[#ff4757]' : confPct >= 75 ? 'text-[#ffa502]' : 'text-[var(--neon-teal)]';
                const matchedCount = pred.indicators?.filter(x => x.matched !== false).length || pred.indicators?.length || 0;
                
                const isExpanded = expandedPredIndex === i;
                return (
                  <div 
                    key={i} 
                    onClick={() => setExpandedPredIndex(isExpanded ? null : i)}
                    className="bg-[var(--bg-primary)] p-2.5 rounded border border-[var(--border)] hover:border-[var(--text-accent)] transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-[var(--text-primary)] font-medium truncate pr-2" title={pred.crime_type}>
                        {pred.crime_type}
                      </span>
                      <span className={`font-mono font-bold text-[11px] ${textColor}`}>{confPct}%</span>
                    </div>
                    <div className="w-full h-1 bg-[var(--bg-card-hover)] rounded-full overflow-hidden mb-1.5">
                      <div 
                        className={`h-full ${barColor} transition-all duration-500`} 
                        style={{ width: `${confPct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] flex justify-between items-center">
                      <span>{matchedCount} matching indicator{matchedCount !== 1 ? 's' : ''}</span>
                      <span className="text-[9px] text-[var(--text-accent)] font-mono">{isExpanded ? 'Hide ▲' : 'Evidence ▼'}</span>
                    </div>

                    {isExpanded && pred.indicators && pred.indicators.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[var(--border)] space-y-1.5">
                        {pred.indicators.map((ind, idx) => (
                          <div key={idx} className="text-[10px] flex items-start gap-1.5 leading-tight">
                            <span className={`font-mono text-[9px] font-bold shrink-0 mt-0.5 ${ind.matched !== false ? 'text-green-400' : 'text-gray-500'}`}>
                              {ind.matched !== false ? '[+]' : '[-]'}
                            </span>
                            <div className="min-w-0">
                              <span className={`font-medium ${ind.matched !== false ? 'text-gray-200' : 'text-gray-500'}`}>
                                {ind.name.replace(/_/g, ' ')}:
                              </span>{' '}
                              <span className="text-gray-400 text-[9px]">{ind.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-2.5 text-[11px] text-[var(--text-secondary)] text-center font-mono border border-dashed border-[var(--border)] rounded-lg">
              {activeCase === 'custom_investigation' ? 'Upload evidence or load sample to generate predictive intel' : 'No predictive intel available'}
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}
