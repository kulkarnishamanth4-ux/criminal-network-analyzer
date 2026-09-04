import React, { useState, useEffect } from 'react';
import { FiNavigation, FiX, FiArrowRight, FiSearch } from 'react-icons/fi';
import { searchEntities, getShortestPath } from '../api/client';

export default function PathFinder({ onPathFound, activeCase }) {
  const [open, setOpen] = useState(false);
  const [sourceQuery, setSourceQuery] = useState('');
  const [targetQuery, setTargetQuery] = useState('');
  const [sourceResults, setSourceResults] = useState([]);
  const [targetResults, setTargetResults] = useState([]);
  const [source, setSource] = useState(null);
  const [target, setTarget] = useState(null);
  const [pathResult, setPathResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reset inputs when switching active case
  useEffect(() => {
    setSource(null);
    setTarget(null);
    setSourceQuery('');
    setTargetQuery('');
    setSourceResults([]);
    setTargetResults([]);
    setPathResult(null);
  }, [activeCase]);

  const handleSearch = async (query, setter) => {
    if (query.trim().length < 2) { setter([]); return; }
    try {
      const data = await searchEntities(query, null, activeCase);
      setter(data.results || []);
    } catch { setter([]); }
  };

  const findPath = async () => {
    if (!source || !target) return;
    setLoading(true);
    setPathResult(null);
    try {
      const result = await getShortestPath(source.id, target.id, activeCase);
      setPathResult(result);
      if (result.found && onPathFound) {
        onPathFound(result.path);
      }
    } catch {
      setPathResult({ found: false, message: 'Request failed' });
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2 rounded-lg hover:border-[var(--text-accent)] transition-colors text-xs font-semibold shadow-lg"
      >
        <FiNavigation className="text-[var(--text-accent)]" /> Find Connection
      </button>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-30 w-80 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border)] bg-[var(--bg-primary)]">
        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <FiNavigation className="text-[var(--text-accent)]" /> Path Finder
        </span>
        <button onClick={() => { setOpen(false); setPathResult(null); }} className="text-[var(--text-secondary)] hover:text-white">
          <FiX size={16} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Source */}
        <div className="relative">
          <label className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mb-1 block">Source Entity</label>
          {source ? (
            <div className="flex items-center justify-between bg-[var(--bg-primary)] border border-[var(--text-accent)] rounded px-2 py-1.5 text-xs">
              <span className="text-[var(--text-accent)]">{source.name}</span>
              <button onClick={() => { setSource(null); setSourceQuery(''); }} className="text-[var(--text-secondary)] hover:text-white ml-2"><FiX size={12}/></button>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Search for entity in active case..."
                value={sourceQuery}
                onChange={e => { setSourceQuery(e.target.value); handleSearch(e.target.value, setSourceResults); }}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--text-accent)] text-[var(--text-primary)]"
              />
              {sourceResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-[var(--bg-card)] border border-[var(--border)] rounded max-h-32 overflow-y-auto z-50 shadow-lg">
                  {sourceResults.map(r => (
                    <div key={r.id} className="px-2 py-1.5 text-xs hover:bg-[var(--bg-card-hover)] cursor-pointer border-b border-[var(--border)] last:border-0"
                      onClick={() => { setSource(r); setSourceResults([]); setSourceQuery(''); }}>
                      <span className="text-[var(--text-primary)]">{r.name}</span>
                      <span className="text-[9px] text-[var(--text-secondary)] ml-2">{r.entity_type}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Target */}
        <div className="relative">
          <label className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mb-1 block">Target Entity</label>
          {target ? (
            <div className="flex items-center justify-between bg-[var(--bg-primary)] border border-[var(--text-accent)] rounded px-2 py-1.5 text-xs">
              <span className="text-[var(--text-accent)]">{target.name}</span>
              <button onClick={() => { setTarget(null); setTargetQuery(''); }} className="text-[var(--text-secondary)] hover:text-white ml-2"><FiX size={12}/></button>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Search for entity in active case..."
                value={targetQuery}
                onChange={e => { setTargetQuery(e.target.value); handleSearch(e.target.value, setTargetResults); }}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--text-accent)] text-[var(--text-primary)]"
              />
              {targetResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-[var(--bg-card)] border border-[var(--border)] rounded max-h-32 overflow-y-auto z-50 shadow-lg">
                  {targetResults.map(r => (
                    <div key={r.id} className="px-2 py-1.5 text-xs hover:bg-[var(--bg-card-hover)] cursor-pointer border-b border-[var(--border)] last:border-0"
                      onClick={() => { setTarget(r); setTargetResults([]); setTargetQuery(''); }}>
                      <span className="text-[var(--text-primary)]">{r.name}</span>
                      <span className="text-[9px] text-[var(--text-secondary)] ml-2">{r.entity_type}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Find Button */}
        <button
          onClick={findPath}
          disabled={!source || !target || loading}
          className="w-full py-2 bg-[var(--text-accent)] text-[var(--bg-primary)] rounded text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[var(--bg-primary)]"></div>
          ) : (
            <><FiSearch size={12}/> Trace Connection</>
          )}
        </button>

        {/* Results */}
        {pathResult && (
          <div className="mt-2">
            {pathResult.found ? (
              <div className="space-y-2">
                <div className="text-[10px] text-[var(--text-accent)] font-bold uppercase tracking-wider">
                  Connection Found — {pathResult.length} hops
                </div>
                {pathResult.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-1 text-[10px] bg-[var(--bg-primary)] p-2 rounded border border-[var(--border)]">
                    <span className="text-[var(--text-primary)] font-medium truncate max-w-[35%]">{step.from_name}</span>
                    <FiArrowRight className="text-[var(--text-accent)] shrink-0" size={10} />
                    <span className="text-[var(--neon-gold)] font-mono text-[9px] shrink-0">{step.relationship}</span>
                    <FiArrowRight className="text-[var(--text-accent)] shrink-0" size={10} />
                    <span className="text-[var(--text-primary)] font-medium truncate max-w-[35%]">{step.to_name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/30 text-center">
                {pathResult.message || 'No connection found in active case graph'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
