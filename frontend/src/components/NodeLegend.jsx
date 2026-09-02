import React from 'react';

export default function NodeLegend() {
  const legendItems = [
    { type: 'Person', color: '#ff4757', shape: 'rounded-full' },
    { type: 'Phone', color: '#00d2d3', shape: 'rotate-45' },
    { type: 'Location', color: '#54a0ff', shape: 'rounded-sm' },
    { type: 'Vehicle', color: '#1dd1a1', shape: 'rounded-t-[30%] rounded-b-sm' },
    { type: 'Bank Acct', color: '#feca57', shape: 'rounded-sm' },
    { type: 'Organization', color: '#a29bfe', shape: 'rounded-sm' },
    { type: 'Social Handle', color: '#fd79a8', shape: 'rounded-full' },
  ];

  return (
    <div className="absolute bottom-4 left-4 bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border)] rounded-md p-3 shadow-lg z-10">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 border-b border-[var(--border)] pb-1">
        Node Types
      </h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {legendItems.map(item => (
          <div key={item.type} className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 ${item.shape}`}
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] text-[var(--text-primary)]">{item.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
