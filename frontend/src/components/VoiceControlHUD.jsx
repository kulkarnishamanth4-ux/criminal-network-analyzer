import React, { useState, useEffect, useRef } from 'react';
import { FiMic, FiMicOff, FiVolume2, FiVolumeX, FiRadio, FiTerminal, FiX } from 'react-icons/fi';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
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
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 0.9; // Tactical commanding pitch
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('David')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  // Dispatch command to backend and execute corresponding UI action
  const executeCommand = async (textToExecute) => {
    const cmd = textToExecute || transcript;
    if (!cmd || !cmd.trim()) return;

    setIsProcessing(true);
    try {
      const res = await client.post('/api/voice/command', {
        transcript: cmd,
        case_id: activeCase
      });
      const data = res.data;
      setLastCommand(data);
      setSpokenReply(data.spoken_reply || 'Command acknowledged.');

      speakText(data.spoken_reply);

      // Execute Action
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
          if (onQueryAI) onQueryAI(data.payload?.message || cmd);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Voice command error:', err);
      const fallbackMsg = 'Failed to interpret voice intent.';
      setSpokenReply(fallbackMsg);
      speakText(fallbackMsg);
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
      <div className="p-4 space-y-4">
        {/* Visual Waveform / Mic Button */}
        <div className="flex flex-col items-center justify-center py-3">
          <button
            onClick={toggleListening}
            className={`relative p-5 rounded-full transition-all duration-300 ${
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
        <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border)] min-h-[50px] flex items-center">
          <div className="text-xs font-mono text-[var(--text-primary)] break-words w-full">
            {transcript ? (
              <span className="text-[var(--text-accent)]">"{transcript}"</span>
            ) : (
              <span className="text-[var(--text-secondary)] italic">
                Try: "Open experimental labs", "Switch to Gujarat case", "Focus on Abu Salem", "Filter high risk"...
              </span>
            )}
          </div>
        </div>

        {/* Execute Button */}
        {transcript && (
          <button
            onClick={() => executeCommand()}
            disabled={isProcessing}
            className="w-full py-2 bg-[var(--text-accent)]/20 hover:bg-[var(--text-accent)]/30 border border-[var(--text-accent)]/50 text-[var(--text-accent)] rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all"
          >
            {isProcessing ? 'Executing Intent...' : 'EXECUTE COMMAND'}
          </button>
        )}

        {/* Feedback Response */}
        {spokenReply && (
          <div className="p-2.5 rounded-lg bg-[var(--bg-primary)]/90 border border-[var(--text-accent)]/30 text-xs font-mono">
            <div className="text-[10px] text-[var(--text-accent)] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <FiTerminal size={10} /> Copilot Action Response
            </div>
            <div className="text-[var(--text-primary)]">{spokenReply}</div>
          </div>
        )}

        {/* Fallback Text Input if Mic Unavailable or Noisy */}
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
            placeholder="Type voice command manual override..."
            className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-accent)] font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[var(--bg-card-hover)] hover:bg-[var(--border)] text-xs text-[var(--text-primary)] rounded border border-[var(--border)] font-mono"
          >
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}
