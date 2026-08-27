import React, { useState, useEffect } from 'react';
import { FiSearch, FiUploadCloud, FiShield, FiFileText, FiCpu } from 'react-icons/fi';
import { searchEntities } from '../api/client';

export default function Header({ onUploadClick, onSearchResultSelect, onExperimentalClick }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 2) {
        searchEntities(query).then(data => {
          setResults(data.results || []);
          setShowDropdown(true);
        }).catch(err => console.error(err));
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (result) => {
    onSearchResultSelect(result);
    setShowDropdown(false);
    setQuery('');
  };

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

      <div className="flex-1 max-w-xl mx-8 relative">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search entities, phones, locations..."
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-md py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--text-accent)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-colors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if(results.length > 0) setShowDropdown(true); }}
          />
        </div>
        
        {showDropdown && results.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto">
            {results.map(r => (
              <div 
                key={r.id} 
                className="px-4 py-2 hover:bg-[var(--bg-card-hover)] cursor-pointer border-b border-[var(--border)] last:border-b-0 flex items-center justify-between"
                onClick={() => handleSelect(r)}
              >
                <div>
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{r.id}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-secondary)]">
                  {r.entity_type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

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
        <button 
          onClick={onUploadClick}
          className="specular-button specular-button--md"
        >
          <span className="specular-button__label">
            <FiUploadCloud />
            <span>Data Ingestion</span>
          </span>
          <div className="specular-button__fx"><canvas></canvas></div>
        </button>
      </div>
    </header>
  );
}
