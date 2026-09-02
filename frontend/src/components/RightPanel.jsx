import React, { useState } from 'react';
import AlertsFeed from './AlertsFeed';
import EntityDossier from './EntityDossier';
import { FiX, FiChevronRight, FiChevronLeft } from 'react-icons/fi';

export default function RightPanel({ selectedEntity, onEntitySelect, onExpandNetwork, activeCase }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <aside className="w-[40px] bg-[var(--bg-card)] border-l border-[var(--border)] h-full flex flex-col z-10 shadow-lg shrink-0 items-center pt-4">
        <button onClick={() => setIsCollapsed(false)} className="text-[var(--text-secondary)] hover:text-white p-2 rounded hover:bg-[var(--bg-primary)]" title="Expand Panel">
          <FiChevronLeft size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[320px] bg-[var(--bg-card)] border-l border-[var(--border)] h-full overflow-y-auto flex flex-col z-10 shadow-lg shrink-0 relative transition-all duration-300">
      <button onClick={() => setIsCollapsed(true)} className="absolute top-3 left-3 z-50 text-[var(--text-secondary)] hover:text-white p-1 rounded hover:bg-[var(--bg-primary)]" title="Collapse Panel">
        <FiChevronRight size={16} />
      </button>
      {selectedEntity ? (
        <div className="relative flex-1 flex flex-col h-full">
          <button 
            className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-white p-1 bg-[var(--bg-primary)] rounded-full z-50 border border-[var(--border)]"
            onClick={() => onEntitySelect(null)}
          >
            <FiX size={16} />
          </button>
          <EntityDossier 
            entityData={selectedEntity} 
            onEntitySelect={onEntitySelect}
            onExpandNetwork={onExpandNetwork}
          />
        </div>
      ) : (
        <div className="pt-8">
          <AlertsFeed onEntitySelect={onEntitySelect} activeCase={activeCase} />
        </div>
      )}
    </aside>
  );
}
