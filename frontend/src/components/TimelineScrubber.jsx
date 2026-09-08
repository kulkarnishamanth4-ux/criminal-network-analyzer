import React, { useState, useEffect } from 'react';
import { FiClock, FiChevronDown, FiChevronUp, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

export default function TimelineScrubber({ 
  elements, 
  onFilter,
  isMinimized: controlledMinimized,
  onToggleMinimize
}) {
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (controlledMinimized !== undefined) {
      setIsMinimized(controlledMinimized);
    }
  }, [controlledMinimized]);

  const handleToggleMinimize = (val) => {
    setIsMinimized(val);
    if (onToggleMinimize) onToggleMinimize(val);
  };

  useEffect(() => {
    if (!elements || !elements.edges) return;
    
    let min = Infinity;
    let max = -Infinity;
    
    elements.edges.forEach(e => {
      const data = e.data || e;
      if (data.timestamp) {
        const t = new Date(data.timestamp).getTime();
        if (t < min) min = t;
        if (t > max) max = t;
      }
    });

    if (min !== Infinity && max !== -Infinity) {
      setMinDate(min);
      setMaxDate(max);
      setCurrentDate(max);
      onFilter(max);
    }
  }, [elements]);

  const handleChange = (e) => {
    const val = Number(e.target.value);
    setCurrentDate(val);
    onFilter(val);
  };

  if (!minDate || !maxDate) return null;

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  // Minimized Floating Pill
  if (isMinimized) {
    return (
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => handleToggleMinimize(false)}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0a1220]/95 border border-[#1e3a5f] hover:border-[#64ffda] text-[#c8d6e5] text-xs font-mono shadow-2xl backdrop-blur-md transition-all hover:scale-105 group cursor-pointer"
          title="Click to expand Temporal Timeline Scrubber"
        >
          <FiClock className="text-[#64ffda] group-hover:rotate-45 transition-transform" size={14} />
          <span className="text-gray-300 font-medium">Timeline:</span>
          <span className="text-[#64ffda] font-bold">
            {new Date(currentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span className="text-[10px] text-[#8892b0] ml-1 bg-[#13233a] px-2 py-0.5 rounded-full border border-[#1e3a5f] group-hover:border-[#64ffda] flex items-center gap-1">
            Expand <FiChevronUp size={12} />
          </span>
        </button>
      </div>
    );
  }

  // Expanded Scrubber Card
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-3/4 max-w-2xl bg-[#0a1220]/95 border border-[#1e3a5f] p-4 rounded-xl shadow-[0_0_25px_rgba(0,0,0,0.7)] z-20 flex flex-col gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex justify-between items-center text-xs text-[var(--text-accent)] font-semibold">
        <span className="opacity-70 font-mono">{formatDate(minDate)}</span>
        <div className="flex items-center gap-2">
          <FiClock size={13} className="text-[#64ffda]" />
          <span className="text-white text-sm font-bold font-mono bg-[#13233a] px-3 py-1 rounded-md border border-[#1e3a5f] shadow-inner">
            {new Date(currentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="opacity-70 font-mono">{formatDate(maxDate)}</span>
          <button 
            onClick={() => handleToggleMinimize(true)}
            className="text-gray-300 hover:text-white px-2.5 py-1 rounded-md bg-[#13233a] hover:bg-[#1e3a5f] border border-[#1e3a5f] hover:border-[#64ffda]/50 transition-all flex items-center gap-1.5 text-[11px] font-mono shadow-sm group cursor-pointer"
            title="Minimize Timeline Scrubber to floating bottom pill"
          >
            <FiMinimize2 size={12} className="text-[#64ffda] group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Minimize</span>
            <FiChevronDown size={13} className="text-gray-400 group-hover:text-white" />
          </button>
        </div>
      </div>

      <input 
        type="range" 
        min={minDate} 
        max={maxDate} 
        value={currentDate} 
        onChange={handleChange}
        className="w-full h-1.5 bg-[#13233a] rounded-lg appearance-none cursor-pointer accent-[#64ffda]"
      />

      <div className="flex items-center justify-between text-[10px] text-[#8892b0] uppercase tracking-widest font-mono font-bold">
        <span>Historical State</span>
        <span className="opacity-60">Temporal Network Evolution</span>
        <span>Latest Intel</span>
      </div>
    </div>
  );
}
