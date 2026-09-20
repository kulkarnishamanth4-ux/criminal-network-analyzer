import React, { useState, useEffect } from 'react';
import { 
  FiDownloadCloud, FiSmartphone, FiShield, FiCpu, 
  FiHardDrive, FiCheckCircle, FiX, FiExternalLink, FiTerminal 
} from 'react-icons/fi';
import { API_URL } from '../api/client';

export default function APKDownloadModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setPwaInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('PWA installation prompt is ready when accessed over HTTPS or localhost in supported browsers.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setPwaInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const handleDirectDownload = () => {
    setDownloadStarted(true);
    const link = document.createElement('a');
    link.href = `${API_URL}/api/download/apk`;
    link.download = 'CrimeNet-Field-Command-v2.6.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadStarted(false), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] border-2 border-[var(--text-accent)]/40 rounded-2xl shadow-[0_0_60px_rgba(100,255,218,0.15)] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[var(--bg-primary)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--text-accent)]/10 text-[var(--text-accent)] border border-[var(--text-accent)]/30">
              <FiSmartphone size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Android APK & Offline Field App
              </h3>
              <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                Autonomous Air-Gapped Package [v2.6.0]
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-white p-1 rounded-md transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Main Download Card */}
          <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-bold text-white">
                  CrimeNet Field Command APK
                </div>
                <div className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
                  Package: in.gov.sih.crimenet • Architecture: Universal Android
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                AIR-GAPPED
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Standalone mobile build pre-bundled with local SQLite database schema, 
              deterministic offline Graph RAG Copilot, and full voice command suite.
            </p>

            <button
              onClick={handleDirectDownload}
              className="w-full py-3 bg-[var(--text-accent)] hover:bg-[var(--text-accent)]/90 text-[#0a1424] font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_20px_rgba(100,255,218,0.3)] flex items-center justify-center gap-2"
            >
              <FiDownloadCloud size={16} />
              {downloadStarted ? 'Downloading APK Package...' : 'Download Android APK (.apk)'}
            </button>
          </div>

          {/* Alternative: Instant PWA Install */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <FiHardDrive size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Progressive Web App (PWA)</div>
                <div className="text-[10px] font-mono text-[var(--text-secondary)]">Instant Install via Chrome/Edge</div>
              </div>
            </div>
            <button
              onClick={handleInstallPWA}
              disabled={pwaInstalled}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold border transition-all ${
                pwaInstalled
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-[var(--bg-card-hover)] text-white hover:border-[var(--text-accent)]'
              }`}
            >
              {pwaInstalled ? 'Installed' : 'Install PWA'}
            </button>
          </div>

          {/* Technical Offline Capabilities Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[var(--bg-primary)]/60 border border-[var(--border)]">
              <div className="text-[10px] text-[var(--text-accent)] font-bold flex items-center gap-1 mb-1">
                <FiCpu size={12} /> Local Graph Engine
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                Algorithms execute directly on client hardware with 0 API calls.
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg-primary)]/60 border border-[var(--border)]">
              <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mb-1">
                <FiShield size={12} /> Offline Chatbot RAG
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                Local Ollama or deterministic topological reasoning active.
              </div>
            </div>
          </div>

          {/* CLI Build Instructions for Developers */}
          <div className="p-3 rounded-lg bg-black/50 border border-[var(--border)] text-[11px] font-mono space-y-1">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase flex items-center gap-1">
              <FiTerminal size={11} /> Developer Build Script
            </div>
            <div className="text-gray-300 select-all font-mono">
              scripts\build_apk.bat
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
