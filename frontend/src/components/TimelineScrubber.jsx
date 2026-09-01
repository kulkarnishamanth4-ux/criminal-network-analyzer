import React, { useState, useEffect } from 'react';

export default function TimelineScrubber({ elements, onFilter }) {
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(null);

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
  }, [elements]); // Removed onFilter from dependencies to avoid loop

  const handleChange = (e) => {
    const val = Number(e.target.value);
    setCurrentDate(val);
    onFilter(val);
  };

  if (!minDate || !maxDate) return null;

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 max-w-2xl bg-[var(--bg-primary)] border border-[var(--border)] p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] z-20 flex flex-col gap-3 backdrop-blur-md bg-opacity-90">
      <div className="flex justify-between items-center text-xs text-[var(--text-accent)] font-semibold">
        <span className="opacity-70">{formatDate(minDate)}</span>
        <span className="text-white text-sm font-bold bg-[var(--bg-highlight)] px-3 py-1 rounded-md border border-[var(--border)]">
          {new Date(currentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span className="opacity-70">{formatDate(maxDate)}</span>
      </div>
      <input 
        type="range" 
        min={minDate} 
        max={maxDate} 
        value={currentDate} 
        onChange={handleChange}
        className="w-full h-1.5 bg-[var(--bg-highlight)] rounded-lg appearance-none cursor-pointer"
        style={{ accentColor: 'var(--neon-gold)' }}
      />
      <div className="text-center text-[10px] text-[var(--text-secondary)] opacity-50 uppercase tracking-widest font-bold">
        Temporal Network Evolution
      </div>
    </div>
  );
}
