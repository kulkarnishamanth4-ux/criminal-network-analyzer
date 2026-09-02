import React, { useState } from 'react';
import AlertsFeed from './AlertsFeed';
import EntityDossier from './EntityDossier';
import { FiX, FiChevronRight, FiChevronLeft } from 'react-icons/fi';

export default function RightPanel({ selectedEntity, onEntitySelect, onExpandNetwork , activeCase}) {
  return (
    <aside className="w-[320px] bg-[var(--bg-card)] border-l border-[var(--border)] h-full overflow-y-auto flex flex-col z-10 shadow-lg shrink-0 transition-all duration-300">
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
        <AlertsFeed onEntitySelect={onEntitySelect} activeCase={activeCase} />
      )}
    </aside>
  );
}
