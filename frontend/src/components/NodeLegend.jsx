import React from 'react';

export default function NodeLegend() {
  const legendItems = [
    { type: 'Person', color: '#ff6b6b', shape: 'rounded-full' },
    { type: 'Phone', color: '#4ecdc4', shape: 'rotate-45' },
    { type: 'Location', color: '#45b7d1', shape: 'rounded-sm' },
    { type: 'Vehicle', color: '#96c93d', shape: 'rounded-t-[30%] rounded-b-sm' }, // Approx pentagon
    { type: 'Bank Acct', color: '#f9ca24', shape: 'rounded-sm' }, // Approx hexagon via css
    { type: 'Organization', color: '#a29bfe', shape: 'rounded-sm' },
  ];

  return (
    <div className="absolute bottom-4 left-4 bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border)] rounded-md p-3 shadow-lg z-10">
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
