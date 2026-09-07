import React, { useState, useEffect } from 'react';
import { FiNavigation, FiX, FiArrowRight, FiSearch, FiRotateCcw, FiZap } from 'react-icons/fi';
import { searchEntities } from '../api/client';

export default function PathFinder({
  isOpen,
  onOpen,
  onClose,
  source,
  target,
  pathResult,
  onSelectSource,
  onSelectTarget,
  onClearSource,
  onClearTarget,
  onReset,
  onFindPath,
  activeCase,
  loading = false
}) {
  const [sourceQuery, setSourceQuery] = useState('');
  const [targetQuery, setTargetQuery] = useState('');
  const [sourceResults, setSourceResults] = useState([]);
  const [targetResults, setTargetResults] = useState([]);

  // Clear queries when switching active case or clearing inputs
  useEffect(() => {
    setSourceQuery('');
    setTargetQuery('');
    setSourceResults([]);
    setTargetResults([]);
  }, [activeCase]);

  const handleSearch = async (query, setter) => {
    if (query.trim().length < 2) { 
      setter([]); 
      return; 
    }
    try {
      const data = await searchEntities(query, null, activeCase);
      setter(data.results || []);
    } catch { 
      setter([]); 
    }
  };

  const getEntityBadgeColor = (type) => {
    switch (type) {
      case 'PERSON': return 'bg-[#ff4757]/20 text-[#ff6b81] border-[#ff4757]/40';
      case 'PHONE': return 'bg-[#00d2d3]/20 text-[#48dbfb] border-[#00d2d3]/40';
      case 'LOCATION': return 'bg-[#54a0ff]/20 text-[#2e86de] border-[#54a0ff]/40';
      case 'VEHICLE': return 'bg-[#1dd1a1]/20 text-[#10ac84] border-[#1dd1a1]/40';
      case 'BANK_ACCOUNT': return 'bg-[#feca57]/20 text-[#ff9f43] border-[#feca57]/40';
      case 'ORGANIZATION': return 'bg-[#a29bfe]/20 text-[#6c5ce7] border-[#a29bfe]/40';
      default: return 'bg-gray-700/40 text-gray-300 border-gray-600';
    }
  };

  // Minimized Trigger Button
  if (!isOpen) {
    return (
      <button
        onClick={onOpen}
        className="absolute top-4 left-4 z-30 flex items-center gap-2.5 bg-[#0a1628]/95 border border-[#1e3a5f] hover:border-[#64ffda] text-[#c8d6e5] hover:text-[#64ffda] px-4 py-2.5 rounded-xl transition-all text-xs font-semibold shadow-2xl backdrop-blur-md group cursor-pointer"
        title="Trace connection path between any two entities by clicking them on the canvas"
      >
        <FiNavigation className="text-[#64ffda] group-hover:scale-110 transition-transform" size={15} />
        <span className="font-mono">Trace Path (Two-Click)</span>
        <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-[#13233a] border border-[#64ffda]/40 text-[#64ffda] rounded font-mono font-bold">
          2-Click
        </span>
      </button>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-30 w-88 max-w-[calc(100vw-2rem)] bg-[#0a1628]/95 border border-[#1e3a5f] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-[#1e3a5f] bg-[#0d1b2a]/90">
        <div className="flex items-center gap-2">
          <FiNavigation className="text-[#64ffda]" size={15} />
          <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
            Path Tracer
          </span>
          <span className="text-[10px] text-[#64ffda] bg-[#64ffda]/10 border border-[#64ffda]/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64ffda] animate-ping" />
            2-Click Mode
          </span>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#1e3a5f] transition-colors cursor-pointer"
          title="Close Path Tracer"
        >
          <FiX size={16} />
        </button>
      </div>

      <div className="p-3.5 space-y-3 overflow-y-auto custom-scrollbar flex-1">
        {/* Visual Guidance */}
        <div className="bg-[#0e1d33] border border-[#1e3a5f] rounded-lg p-2.5 text-[11px] text-[#c8d6e5] leading-relaxed">
          <div className="font-bold text-[#64ffda] mb-1 flex items-center gap-1.5">
            <FiZap size={13} className="text-[#64ffda]" />
            <span>Direct Canvas Interaction:</span>
          </div>
          Click any node on canvas for <span className="text-[#64ffda] font-bold">Source</span>, then another node for <span className="text-[#f9ca24] font-bold">Target</span> to trace the shortest syndicate link. Or search below:
        </div>

        {/* Source Entity */}
        <div className="relative">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono font-semibold">
              Source Entity (Node 1)
            </label>
            {source && (
              <span className="text-[9px] text-[#64ffda] font-mono">✓ Selected</span>
            )}
          </div>
          {source ? (
            <div className="flex items-center justify-between bg-[#0d1b2a] border border-[#64ffda] rounded-lg p-2 text-xs shadow-inner">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono uppercase font-bold shrink-0 ${getEntityBadgeColor(source.type || source.entity_type)}`}>
                  {source.type || source.entity_type || 'ENTITY'}
                </span>
                <span className="text-white font-bold truncate">{source.name || source.label}</span>
              </div>
              <button 
                onClick={() => { onClearSource(); setSourceQuery(''); }} 
                className="text-gray-400 hover:text-white ml-2 p-1 hover:bg-[#1e3a5f] rounded cursor-pointer"
                title="Clear Source"
              >
                <FiX size={13} />
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="border border-dashed border-[#64ffda]/40 bg-[#64ffda]/5 rounded-lg p-2 text-[10px] text-[#64ffda] font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#64ffda] animate-ping shrink-0" />
                <span>Click 1st entity on canvas, or search name:</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search source entity name..."
                  value={sourceQuery}
                  onChange={e => { 
                    setSourceQuery(e.target.value); 
                    handleSearch(e.target.value, setSourceResults); 
                  }}
                  className="w-full bg-[#0d1b2a] border border-[#1e3a5f] focus:border-[#64ffda] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                />
                <FiSearch className="absolute right-2.5 top-2 text-gray-500" size={13} />
              </div>
              {sourceResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-[#0a1628] border border-[#1e3a5f] rounded-lg max-h-36 overflow-y-auto z-50 shadow-2xl">
                  {sourceResults.map(r => (
                    <div 
                      key={r.id} 
                      className="px-2.5 py-2 text-xs hover:bg-[#1e3a5f] cursor-pointer border-b border-[#1e3a5f]/60 last:border-0 flex items-center justify-between"
                      onClick={() => { 
                        onSelectSource(r); 
                        setSourceResults([]); 
                        setSourceQuery(''); 
                      }}
                    >
                      <span className="text-white font-medium truncate">{r.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${getEntityBadgeColor(r.entity_type)}`}>
                        {r.entity_type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Target Entity */}
        <div className="relative">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono font-semibold">
              Target Entity (Node 2)
            </label>
            {target && (
              <span className="text-[9px] text-[#f9ca24] font-mono">✓ Selected</span>
            )}
          </div>
          {target ? (
            <div className="flex items-center justify-between bg-[#0d1b2a] border border-[#f9ca24] rounded-lg p-2 text-xs shadow-inner">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono uppercase font-bold shrink-0 ${getEntityBadgeColor(target.type || target.entity_type)}`}>
                  {target.type || target.entity_type || 'ENTITY'}
                </span>
                <span className="text-white font-bold truncate">{target.name || target.label}</span>
              </div>
              <button 
                onClick={() => { onClearTarget(); setTargetQuery(''); }} 
                className="text-gray-400 hover:text-white ml-2 p-1 hover:bg-[#1e3a5f] rounded cursor-pointer"
                title="Clear Target"
              >
                <FiX size={13} />
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="border border-dashed border-[#f9ca24]/40 bg-[#f9ca24]/5 rounded-lg p-2 text-[10px] text-[#f9ca24] font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#f9ca24] animate-ping shrink-0" />
                <span>Click 2nd entity on canvas, or search name:</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search target entity name..."
                  value={targetQuery}
                  onChange={e => { 
                    setTargetQuery(e.target.value); 
                    handleSearch(e.target.value, setTargetResults); 
                  }}
                  className="w-full bg-[#0d1b2a] border border-[#1e3a5f] focus:border-[#f9ca24] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                />
                <FiSearch className="absolute right-2.5 top-2 text-gray-500" size={13} />
              </div>
              {targetResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-[#0a1628] border border-[#1e3a5f] rounded-lg max-h-36 overflow-y-auto z-50 shadow-2xl">
                  {targetResults.map(r => (
                    <div 
                      key={r.id} 
                      className="px-2.5 py-2 text-xs hover:bg-[#1e3a5f] cursor-pointer border-b border-[#1e3a5f]/60 last:border-0 flex items-center justify-between"
                      onClick={() => { 
                        onSelectTarget(r); 
                        setTargetResults([]); 
                        setTargetQuery(''); 
                      }}
                    >
                      <span className="text-white font-medium truncate">{r.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${getEntityBadgeColor(r.entity_type)}`}>
                        {r.entity_type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onFindPath}
            disabled={!source || !target || loading}
            className="flex-1 py-2 bg-[#64ffda] hover:bg-[#52e3c0] text-[#0a1628] rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-[#0a1628]" />
            ) : (
              <>
                <FiSearch size={13} />
                <span>Trace Connection</span>
              </>
            )}
          </button>
          <button
            onClick={onReset}
            className="p-2 bg-[#13233a] hover:bg-[#1e3a5f] text-gray-300 hover:text-white border border-[#1e3a5f] rounded-lg text-xs transition-colors cursor-pointer"
            title="Reset All"
          >
            <FiRotateCcw size={14} />
          </button>
        </div>

        {/* Results */}
        {pathResult && (
          <div className="pt-2 border-t border-[#1e3a5f]">
            {pathResult.found ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#64ffda] font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#64ffda]" />
                    Connection Found — {pathResult.length ?? (pathResult.path?.length - 1)} hops
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono">
                    {pathResult.steps?.length || 0} link(s)
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
                  {pathResult.steps?.map((step, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between text-[11px] bg-[#0d1b2a] p-2 rounded-lg border border-[#1e3a5f] hover:border-[#64ffda]/40 transition-colors"
                    >
                      <span className="text-white font-medium truncate max-w-[34%]" title={step.from_name}>
                        {step.from_name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0 px-1">
                        <FiArrowRight className="text-[#64ffda]" size={10} />
                        <span className="text-[#f9ca24] font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#13233a] border border-[#1e3a5f]">
                          {step.relationship}
                        </span>
                        <FiArrowRight className="text-[#64ffda]" size={10} />
                      </div>
                      <span className="text-white font-medium truncate max-w-[34%] text-right" title={step.to_name}>
                        {step.to_name}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onReset}
                  className="w-full py-1.5 rounded-lg bg-[#13233a] hover:bg-[#1e3a5f] text-[#64ffda] text-xs font-mono font-semibold border border-[#1e3a5f] hover:border-[#64ffda]/50 transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                >
                  <FiRotateCcw size={12} />
                  <span>Trace Another Connection</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/30 text-center font-mono space-y-1.5">
                <div className="font-bold">No Direct Connection Found</div>
                <div className="text-[10px] opacity-80">
                  {pathResult.message || 'These entities have no reachable network paths in the active case graph.'}
                </div>
                <button
                  onClick={onReset}
                  className="px-3 py-1 rounded bg-[#13233a] hover:bg-[#1e3a5f] text-gray-200 text-[10px] border border-[#1e3a5f] transition-colors cursor-pointer inline-flex items-center gap-1 mt-1"
                >
                  <FiRotateCcw size={10} /> Try Different Entities
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
