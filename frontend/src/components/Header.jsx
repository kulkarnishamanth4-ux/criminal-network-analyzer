import React from 'react';
import { FiUploadCloud, FiShield, FiFileText, FiCpu } from 'react-icons/fi';
import SpecularButton from './SpecularButton';

export default function Header({ onUploadClick, onExperimentalClick }) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return (
    <header className="h-16 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center justify-between px-6 z-20 shadow-md">
      <div className="flex items-center gap-3">
        <FiShield className="text-[var(--text-accent)] text-2xl" />
        <h1 className="text-xl font-bold tracking-wider" style={{ textShadow: '0 0 10px rgba(100,255,218,0.5)', color: 'var(--text-accent)' }}>
          CRIMENET
        </h1>
        <span className="text-[var(--text-secondary)] text-xs ml-2 uppercase tracking-widest hidden sm:inline-block">
          Intelligence Command Center
        </span>
      </div>

      <div className="flex-1"></div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onExperimentalClick}
          className="flex items-center gap-2 bg-[var(--bg-primary)] border border-green-500/50 text-green-400 hover:bg-green-500 hover:text-white px-3 py-1.5 rounded-md transition-all text-sm font-semibold shadow-[0_0_10px_rgba(255,0,64,0.2)] hover:shadow-[0_0_15px_rgba(255,0,64,0.5)]"
        >
          <FiCpu className="animate-pulse" />
          <span className="hidden md:inline"> Experimental Labs</span>
        </button>
        <button 
          onClick={() => window.open(`${API_URL}/api/report/generate`, '_blank')}
          className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-secondary)] px-3 py-1.5 rounded-md hover:border-[var(--neon-gold)] hover:text-[var(--neon-gold)] transition-all text-sm font-semibold"
        >
          <FiFileText />
          <span className="hidden lg:inline">Report</span>
        </button>
        <SpecularButton 
          onClick={onUploadClick}
          size="md"
          radius={6}
          textColor="var(--text-accent)"
          lineColor="#00ff41"
          baseColor="#1a2f1a"
          intensity={1.5}
        >
          <FiUploadCloud />
          <span>Data Ingestion</span>
        </SpecularButton>
      </div>
    </header>
  );
}
