import React, { useState, useEffect, useRef } from 'react';
import { FiMic, FiMicOff, FiVolume2, FiVolumeX, FiRadio, FiTerminal, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { client } from '../api/client';

export default function VoiceControlHUD({
  activeCase,
  onNavigate,
  onSwitchCase,
  onSelectEntity,
  onFilterRisk,
  onResetCanvas,
  onQueryAI,
  isOpen,
  onClose
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState(null);
  const [spokenReply, setSpokenReply] = useState('');
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [isSupported, setIsSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [permissionError, setPermissionError] = useState('');

  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  // Client-Side Deterministic Intent Parser (Instant Air-Gapped / Vercel Fallback)
  const parseIntentClientSide = (cmd) => {
    const t = cmd.toLowerCase().trim();

    // 1. Case Switching
    if (t.includes('dawood') || t.includes('mumbai') || t.includes('d-company') || t.includes('syndicate')) {
      return { action: 'SWITCH_CASE', payload: { case_id: 'dawood' }, spoken_reply: 'Switching active workspace to Operation Syndicate (Dawood D-Company).' };
    }
    if (t.includes('punjab') || t.includes('drug') || t.includes('narcotic') || t.includes('falcon')) {
      return { action: 'SWITCH_CASE', payload: { case_id: 'drug_punjab' }, spoken_reply: 'Switching active workspace to Operation Falcon (Punjab Narcotics).' };
    }
    if (t.includes('assam') || t.includes('traffick') || t.includes('rescue')) {
      return { action: 'SWITCH_CASE', payload: { case_id: 'ht_assam' }, spoken_reply: 'Switching active workspace to Operation Rescue (Cross-Border Trafficking).' };
    }
    if (t.includes('bengaluru') || t.includes('bangalore') || t.includes('crypto') || t.includes('darkweb')) {
      return { action: 'SWITCH_CASE', payload: { case_id: 'cyber_bengaluru' }, spoken_reply: 'Switching active workspace to Project DarkWeb (Bengaluru Crypto Extortion).' };
    }
    if (t.includes('gujarat') || t.includes('surat') || t.includes('hawala') || t.includes('swarn')) {
      return { action: 'SWITCH_CASE', payload: { case_id: 'money_gujarat' }, spoken_reply: 'Switching active workspace to Operation Swarn (Surat Hawala).' };
    }
    if (t.includes('chhattisgarh') || t.includes('bastar') || t.includes('arms') || t.includes('jungle')) {
      return { action: 'SWITCH_CASE', payload: { case_id: 'arms_chhattisgarh' }, spoken_reply: 'Switching active workspace to Operation Red Corridor (Chhattisgarh Arms).' };
    }
    if (t.includes('kerala') || t.includes('wildlife') || t.includes('ivory') || t.includes('tusk')) {
      return { action: 'SWITCH_CASE', payload: { case_id: 'wildlife_kerala' }, spoken_reply: 'Switching active workspace to Operation WildTusk (Kerala Wildlife).' };
    }
    if (t.includes('up') || t.includes('gorakhpur') || t.includes('extortion') || t.includes('purvanchal') || t.includes('bahubali')) {
      return { action: 'SWITCH_CASE', payload: { case_id: 'extortion_up' }, spoken_reply: 'Switching active workspace to Operation Bahubali (Purvanchal Mafia).' };
    }

    // 2. Navigation
    if (t.includes('experimental') || t.includes('lab') || t.includes('decapitation')) {
      return { action: 'NAVIGATE', payload: { modal: 'experimental' }, spoken_reply: 'Opening Experimental Intelligence Labs.' };
    }
    if (t.includes('ingest') || t.includes('upload') || t.includes('evidence') || t.includes('file')) {
      return { action: 'NAVIGATE', payload: { modal: 'upload' }, spoken_reply: 'Opening Universal Evidence Ingestion Hub.' };
    }
    if (t.includes('blockchain') || t.includes('ledger') || t.includes('tamper')) {
      return { action: 'NAVIGATE', payload: { modal: 'blockchain' }, spoken_reply: 'Opening Forensic Blockchain Ledger.' };
    }
    if (t.includes('hod') || t.includes('otp') || t.includes('clearance') || t.includes('supervis')) {
      return { action: 'NAVIGATE', payload: { modal: 'hod' }, spoken_reply: 'Opening Head of Department 2FA Clearance.' };
    }
    if (t.includes('audit') || t.includes('siem') || t.includes('log')) {
      return { action: 'NAVIGATE', payload: { modal: 'audit' }, spoken_reply: 'Opening SIEM Audit Log Viewer.' };
    }
    if (t.includes('apk') || t.includes('download') || t.includes('android')) {
      return { action: 'NAVIGATE', payload: { modal: 'apk' }, spoken_reply: 'Opening Standalone Android APK Package Manager.' };
    }
    if (t.includes('map') || t.includes('geospatial')) {
      return { action: 'NAVIGATE', payload: { view: 'map' }, spoken_reply: 'Switching to Geospatial Threat Map.' };
    }
    if (t.includes('network') || t.includes('graph')) {
      return { action: 'NAVIGATE', payload: { view: 'network' }, spoken_reply: 'Switching to Network Graph Canvas.' };
    }

    // 3. Canvas & Filters
    if (t.includes('reset') || t.includes('center') || t.includes('fit')) {
      return { action: 'RESET_CANVAS', payload: {}, spoken_reply: 'Recentering network graph canvas.' };
    }
    if (t.includes('risk') || t.includes('threat') || t.includes('filter')) {
      return { action: 'FILTER_RISK', payload: { risk_threshold: 0.7 }, spoken_reply: 'Filtering graph for critical threat entities.' };
    }

    // 4. Suspect Queries
    if (t.includes('kingpin') || t.includes('leader') || t.includes('boss')) {
      return { action: 'QUERY_AI', payload: { message: 'Identify the primary kingpin and command hierarchy.' }, spoken_reply: 'Synthesized topological hierarchy. Primary command apex identified.' };
    }

    return { action: 'QUERY_AI', payload: { message: cmd }, spoken_reply: `Processed tactical voice query: ${cmd}` };
  };

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        transcriptRef.current = '';
        setPermissionError('');
      };

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
        transcriptRef.current = currentText;
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setPermissionError('Microphone permission blocked. Please allow mic access in browser.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        const finalText = transcriptRef.current?.trim();
        if (finalText) {
          executeCommand(finalText);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition init error:', e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  // Hotkey listener (Alt+V or Ctrl+Space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.altKey && e.key.toLowerCase() === 'v') || (e.ctrlKey && e.code === 'Space')) {
        e.preventDefault();
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening]);

  const speakText = (text) => {
    if (!audioFeedback || !window.speechSynthesis || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      return;
    }
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    } else {
      setTranscript('');
      transcriptRef.current = '';
      setPermissionError('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start caught error:', err);
      }
    }
  };

  const dispatchParsedAction = (data, rawCmd) => {
    setLastCommand(data);
    setSpokenReply(data.spoken_reply || 'Command executed.');
    speakText(data.spoken_reply);

    switch (data.action) {
      case 'NAVIGATE':
        if (data.payload?.modal && onNavigate) onNavigate(data.payload.modal);
        if (data.payload?.view && onNavigate) onNavigate(data.payload.view);
        break;
      case 'SWITCH_CASE':
        if (data.payload?.case_id && onSwitchCase) onSwitchCase(data.payload.case_id);
        break;
      case 'SELECT_ENTITY':
        if (data.payload?.entity_name && onSelectEntity) onSelectEntity(data.payload.entity_name);
        break;
      case 'FILTER_RISK':
        if (onFilterRisk) onFilterRisk(data.payload?.risk_threshold || 0.7);
        break;
      case 'RESET_CANVAS':
        if (onResetCanvas) onResetCanvas();
        break;
      case 'QUERY_AI':
        if (onQueryAI) onQueryAI(data.payload?.message || rawCmd);
        break;
      default:
        break;
    }
  };

  // Dispatch command to backend or client-side fallback
  const executeCommand = async (textToExecute) => {
    const cmd = textToExecute || transcript;
    if (!cmd || !cmd.trim()) return;

    setIsProcessing(true);
    try {
      const res = await client.post('/api/voice/command', {
        transcript: cmd,
        case_id: activeCase
      });
      dispatchParsedAction(res.data, cmd);
    } catch (err) {
      // Offline / Vercel Client-Side Intent Parser Execution
      const clientIntent = parseIntentClientSide(cmd);
      dispatchParsedAction(clientIntent, cmd);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-[var(--bg-card)]/95 backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* HUD Header */}
      <div className="px-4 py-3 bg-[var(--bg-primary)]/80 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-[var(--text-accent)]'}`}></div>
          <span className="text-xs font-mono font-bold tracking-wider text-[var(--text-primary)] uppercase flex items-center gap-1.5">
            <FiRadio className="text-[var(--text-accent)]" /> Voice Tactical Copilot
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAudioFeedback(!audioFeedback)}
            className="p-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--bg-card-hover)]"
            title={audioFeedback ? 'Mute Voice Output' : 'Enable Voice Output'}
          >
            {audioFeedback ? <FiVolume2 size={14} /> : <FiVolumeX size={14} />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--bg-card-hover)]"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-3.5">
        {/* Permission Warning if Mic is blocked */}
        {permissionError && (
          <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-1.5">
            <FiAlertCircle size={14} className="shrink-0" />
            <span>{permissionError}</span>
          </div>
        )}

        {/* Visual Waveform / Mic Button */}
        <div className="flex flex-col items-center justify-center py-2">
          <button
            onClick={toggleListening}
            className={`relative p-5 rounded-full transition-all duration-300 cursor-pointer ${
              isListening
                ? 'bg-red-500/20 text-red-400 border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)]'
                : 'bg-[var(--bg-primary)] text-[var(--text-accent)] border border-[var(--border)] hover:border-[var(--text-accent)] shadow-lg'
            }`}
          >
            {isListening ? <FiMicOff size={28} className="animate-pulse" /> : <FiMic size={28} />}
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
            )}
          </button>
          <div className="mt-2 text-[11px] font-mono text-[var(--text-secondary)]">
            {isListening ? 'LISTENING... (Speak now)' : 'TAP MIC OR PRESS ALT+V'}
          </div>
        </div>

        {/* Live Transcript Display */}
        <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border)] min-h-[48px] flex items-center">
          <div className="text-xs font-mono text-[var(--text-primary)] break-words w-full">
            {transcript ? (
              <span className="text-[var(--text-accent)] font-semibold">"{transcript}"</span>
            ) : (
              <span className="text-[var(--text-secondary)] italic text-[11px]">
                Speak naturally: "Switch to Gujarat case", "Open experimental labs", "Filter high risk", "Who is the kingpin"...
              </span>
            )}
          </div>
        </div>

        {/* Quick Voice Command Chips */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">Quick Spoken Directives:</div>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Switch to Gujarat',
              'Open Punjab',
              'Open Labs',
              'Filter High Risk',
              'Who is Kingpin?',
              'Reset Canvas'
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setTranscript(chip);
                  executeCommand(chip);
                }}
                className="px-2 py-1 rounded bg-[var(--bg-primary)] hover:bg-[var(--text-accent)]/15 border border-[var(--border)] hover:border-[var(--text-accent)]/40 text-[10px] font-mono text-[var(--text-primary)] transition-all cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Response */}
        {spokenReply && (
          <div className="p-2.5 rounded-lg bg-[var(--bg-primary)]/90 border border-[var(--text-accent)]/30 text-xs font-mono">
            <div className="text-[10px] text-[var(--text-accent)] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <FiTerminal size={10} /> Copilot Action Response
            </div>
            <div className="text-[var(--text-primary)]">{spokenReply}</div>
          </div>
        )}

        {/* Fallback Text Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeCommand(manualInput);
            setManualInput('');
          }}
          className="flex gap-1.5 pt-1 border-t border-[var(--border)]"
        >
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Type directive override..."
            className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-accent)] font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[var(--bg-card-hover)] hover:bg-[var(--border)] text-xs text-[var(--text-primary)] rounded border border-[var(--border)] font-mono font-bold"
          >
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}
