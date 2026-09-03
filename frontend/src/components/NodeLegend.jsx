import React, { useState } from 'react';
import { FiLayers, FiX, FiInfo } from 'react-icons/fi';

export default function NodeLegend() {
  const [isOpen, setIsOpen] = useState(false);

  const legendItems = [
    { type: 'Person', color: '#ff4757', shape: 'rounded-full' },
    { type: 'Phone', color: '#00d2d3', shape: 'rotate-45' },
    { type: 'Location', color: '#54a0ff', shape: 'rounded-sm' },
    { type: 'Vehicle', color: '#1dd1a1', shape: 'rounded-t-[30%] rounded-b-sm' },
    { type: 'Bank Acct', color: '#feca57', shape: 'rounded-sm' },
    { type: 'Organization', color: '#a29bfe', shape: 'rounded-sm' },
    { type: 'Social Handle', color: '#fd79a8', shape: 'rounded-full' },
  ];

  const threatLevels = [
    { level: 'High Threat', desc: 'Bosses, Kingpins & Apex Targets', size: 'w-5 h-5', border: 'border-2 border-[#ff0040]', color: 'bg-[#ff4757]' },
    { level: 'Medium Threat', desc: 'Lieutenants, Operatives & Vaults', size: 'w-3.5 h-3.5', border: 'border border-[#ffd32a]', color: 'bg-[#ffa502]' },
    { level: 'Low Threat', desc: 'Burners, Mules & Drop Points', size: 'w-2 h-2', border: 'border border-gray-400', color: 'bg-gray-400' },
  ];

  return (
    <div className="absolute bottom-6 left-6 z-20">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[var(--bg-primary)]/90 hover:bg-[var(--bg-card)] text-[var(--text-accent)] border border-[var(--border)] hover:border-[var(--text-accent)] px-3.5 py-2 rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all group"
          title="Open Node Types & Threat Legend"
        >
          <FiLayers size={14} className="group-hover:scale-110 transition-transform text-[var(--text-accent)]" />
          <span>Node Types</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-accent)] animate-pulse ml-0.5"></span>
        </button>
      ) : (
        <div className="bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border)] rounded-xl p-4 shadow-[0_0_25px_rgba(0,0,0,0.8)] w-72 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)] mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-accent)] flex items-center gap-1.5">
              <FiLayers size={13} />
              <span>Network Taxonomy</span>
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[var(--bg-primary)] transition-colors"
              title="Close Panel"
            >
              <FiX size={14} />
            </button>
          </div>

          {/* Node Types Section */}
          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1.5 tracking-wider">
              Entity Classifications
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {legendItems.map(item => (
                <div key={item.type} className="flex items-center gap-2">
                  <div 
                    className={`w-3 h-3 shrink-0 ${item.shape}`}
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[11px] text-[var(--text-primary)] truncate">{item.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Threat Sizing Section */}
          <div className="pt-2.5 border-t border-[var(--border)]/60">
            <div className="text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1.5 tracking-wider flex items-center justify-between">
              <span>Threat Hierarchy Sizing</span>
              <FiInfo size={10} className="text-[var(--neon-gold)]" />
            </div>
            <div className="space-y-1.5">
              {threatLevels.map(t => (
                <div key={t.level} className="flex items-center gap-2.5">
                  <div className="w-5 flex items-center justify-center shrink-0">
                    <div className={`${t.size} ${t.border} ${t.color} rounded-full`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-white leading-tight">{t.level}</div>
                    <div className="text-[9px] text-[var(--text-secondary)] truncate">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
