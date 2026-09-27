import React, { useState, useEffect, useRef } from 'react';
import { 
  FiMic, 
  FiMicOff, 
  FiVolume2, 
  FiVolumeX, 
  FiRadio, 
  FiTerminal, 
  FiX, 
  FiCheckCircle, 
  FiAlertCircle,
  FiZap,
  FiCompass,
  FiLayers
} from 'react-icons/fi';

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

  // Client-Side Deterministic Intent Parser (Instant Execution <5ms)
  const parseIntentClientSide = (cmd) => {
    const t = cmd.toLowerCase().trim();

    // 1. Identify Target Case
    let targetCase = null;
    let caseLabel = '';
    if (t.includes('dawood') || t.includes('mumbai') || t.includes('d-company') || t.includes('syndicate')) {
      targetCase = 'dawood';
      caseLabel = 'Operation Syndicate (Dawood D-Company)';
    } else if (t.includes('punjab') || t.includes('drug') || t.includes('narcotic') || t.includes('falcon') || t.includes('crescent')) {
      targetCase = 'drug_punjab';
      caseLabel = 'Operation Falcon (Punjab Narcotics)';
    } else if (t.includes('assam') || t.includes('traffick') || t.includes('rescue')) {
      targetCase = 'ht_assam';
      caseLabel = 'Operation Rescue (Cross-Border Trafficking)';
    } else if (t.includes('bengaluru') || t.includes('bangalore') || t.includes('crypto') || t.includes('darkweb') || t.includes('apex')) {
      targetCase = 'cyber_bengaluru';
      caseLabel = 'Project DarkWeb (Bengaluru Crypto Extortion)';
    } else if (t.includes('gujarat') || t.includes('surat') || t.includes('hawala') || t.includes('swarn') || t.includes('diamond')) {
      targetCase = 'money_gujarat';
      caseLabel = 'Operation Swarn (Surat Hawala)';
    } else if (t.includes('chhattisgarh') || t.includes('bastar') || t.includes('arms') || t.includes('jungle') || t.includes('corridor')) {
      targetCase = 'arms_chhattisgarh';
      caseLabel = 'Operation Red Corridor (Chhattisgarh Arms)';
    } else if (t.includes('kerala') || t.includes('wildlife') || t.includes('ivory') || t.includes('tusk') || t.includes('poaching')) {
      targetCase = 'wildlife_kerala';
      caseLabel = 'Operation WildTusk (Kerala Wildlife)';
    } else if (t.includes('up') || t.includes('gorakhpur') || t.includes('extortion') || t.includes('purvanchal') || t.includes('bahubali')) {
      targetCase = 'extortion_up';
      caseLabel = 'Operation Bahubali (Purvanchal Mafia)';
    } else if (t.includes('custom') || t.includes('new investigation') || t.includes('upload custom')) {
      targetCase = 'custom_investigation';
      caseLabel = 'New Investigation (Custom Data Upload)';
    }

    // 2. Identify Navigation Target
    let targetModal = null;
    let targetView = null;
    let modalLabel = '';
    if (t.includes('experimental') || t.includes('lab') || t.includes('decapitation') || t.includes('topology')) {
      targetModal = 'experimental';
      modalLabel = 'Experimental Intelligence Labs';
    } else if (t.includes('ingest') || t.includes('upload') || t.includes('evidence') || t.includes('file')) {
      targetModal = 'upload';
      modalLabel = 'Universal Evidence Ingestion Hub';
    } else if (t.includes('blockchain') || t.includes('ledger') || t.includes('tamper')) {
      targetModal = 'blockchain';
      modalLabel = 'Forensic Blockchain Ledger';
    } else if (t.includes('audit') || t.includes('siem') || t.includes('log')) {
      targetModal = 'audit';
      modalLabel = 'SIEM Audit Log Viewer';
    } else if (t.includes('apk') || t.includes('download') || t.includes('android')) {
      targetModal = 'apk';
      modalLabel = 'Android APK Package Manager';
    } else if (t.includes('trace') || t.includes('path') || t.includes('connect')) {
      targetModal = 'trace_path';
      modalLabel = 'Connection Path Tracer';
    } else if (t.includes('map') || t.includes('geospatial') || t.includes('satellite')) {
      targetView = 'map';
    } else if (t.includes('network') || t.includes('graph') || t.includes('canvas')) {
      targetView = 'network';
    }

    // Composite directive handling (e.g. "Open labs Switch to Bangalore")
    if (targetCase && (targetModal || targetView)) {
      return {
        action: 'COMPOSITE',
        payload: { case_id: targetCase, modal: targetModal, view: targetView },
        spoken_reply: `Switching workspace to ${caseLabel} and opening ${modalLabel || targetView}.`
      };
    }

    // Single Case Switch
    if (targetCase) {
      return { 
        action: 'SWITCH_CASE', 
        payload: { case_id: targetCase }, 
        spoken_reply: `Switching active workspace to ${caseLabel}.` 
      };
    }

    // Single Navigation Target
    if (targetModal) {
      return { 
        action: 'NAVIGATE', 
        payload: { modal: targetModal }, 
        spoken_reply: `Opening ${modalLabel}.` 
      };
    }
    if (targetView) {
      return { 
        action: 'NAVIGATE', 
        payload: { view: targetView }, 
        spoken_reply: `Switching to ${targetView === 'map' ? 'Geospatial Threat Map' : 'Network Graph Canvas'}.` 
      };
    }

    // 3. Canvas & Filter Controls
    if (t.includes('reset') || t.includes('center') || t.includes('fit') || t.includes('recenter')) {
      return { action: 'RESET_CANVAS', payload: {}, spoken_reply: 'Recentering network graph canvas.' };
    }
    if (t.includes('risk') || t.includes('threat') || t.includes('critical') || t.includes('filter')) {
      return { action: 'FILTER_RISK', payload: { risk_threshold: 0.7 }, spoken_reply: 'Filtering graph for critical threat entities.' };
    }

    // 4. Suspect Queries
    if (t.includes('kingpin') || t.includes('leader') || t.includes('boss') || t.includes('apex')) {
      return { action: 'QUERY_AI', payload: { message: 'Identify the primary kingpin and command hierarchy.' }, spoken_reply: 'Synthesized topological hierarchy. Primary command apex identified.' };
    }

    // 5. Focus on specific suspect name if phrased as "focus on [Name]" or "select [Name]"
    const focusMatch = t.match(/(?:focus on|select|find|show me|inspect)\s+([a-z\s]+)/i);
    if (focusMatch && focusMatch[1]) {
      const name = focusMatch[1].trim();
      return { action: 'SELECT_ENTITY', payload: { entity_name: name }, spoken_reply: `Focusing intelligence dossier on ${name}.` };
    }

    return { action: 'QUERY_AI', payload: { message: cmd }, spoken_reply: `Processed tactical voice query: ${cmd}` };
  };

  // Robust Speech Recognition Initializer (Direct synchronous user gesture)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setPermissionError('Web Speech API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or click the directive chips below.');
      return;
    }

    // Safely abort previous session if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }

    setTranscript('');
    transcriptRef.current = '';
    setPermissionError('');

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      // Match Indian English or fallback to user default / en-US
      recognition.lang = navigator.language && navigator.language.startsWith('en') ? navigator.language : 'en-IN';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
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
        console.warn('Speech recognition error event:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setPermissionError('Microphone permission blocked. Click the lock/tune icon in your address bar to allow mic access.');
        } else if (event.error === 'no-speech') {
          setPermissionError('No speech detected. Tap mic to speak or click any quick directive chip below.');
        } else if (event.error === 'network') {
          setPermissionError('Voice service network connection issue. Click the mic to retry, or use the 1-click directive buttons below.');
        } else if (event.error !== 'aborted') {
          setPermissionError(`Speech recognition status: ${event.error}`);
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
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
      setPermissionError('Could not start microphone. Please tap the mic button to grant permissions.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // When HUD closes, stop listening and clear transient errors
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setPermissionError('');
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

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

  const dispatchParsedAction = (data, rawCmd) => {
    setLastCommand(data);
    setSpokenReply(data.spoken_reply || 'Command executed.');
    speakText(data.spoken_reply);

    switch (data.action) {
      case 'COMPOSITE':
        if (data.payload?.case_id && onSwitchCase) onSwitchCase(data.payload.case_id);
        if (data.payload?.modal && onNavigate) onNavigate(data.payload.modal);
        if (data.payload?.view && onNavigate) onNavigate(data.payload.view);
        break;
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

  // Dispatch command with instant client-side intent execution (<5ms response time)
  const executeCommand = async (textToExecute) => {
    const cmd = textToExecute || transcript;
    if (!cmd || !cmd.trim()) return;

    setIsProcessing(true);
    setPermissionError('');

    try {
      const clientIntent = parseIntentClientSide(cmd);
      dispatchParsedAction(clientIntent, cmd);
    } catch (err) {
      console.error('Command execution error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[95vw] bg-[#081220]/95 backdrop-blur-xl border border-[#1e3a5f] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* HUD Header */}
      <div className="px-4 py-3 bg-[#060a14]/90 border-b border-[#1e3a5f] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-[#64ffda]'}`}></div>
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
            <FiRadio className="text-[#64ffda]" /> Voice Tactical Copilot
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAudioFeedback(!audioFeedback)}
            className="p-1.5 text-xs text-[#8892b0] hover:text-white rounded hover:bg-[#162a45] transition-colors"
            title={audioFeedback ? 'Mute Voice Output' : 'Enable Voice Output'}
          >
            {audioFeedback ? <FiVolume2 size={14} className="text-[#64ffda]" /> : <FiVolumeX size={14} />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-xs text-[#8892b0] hover:text-white rounded hover:bg-[#162a45] transition-colors"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-3.5">
        {/* Permission Warning / Browser Support Warning */}
        {permissionError && (
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-start gap-2">
            <FiAlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{permissionError}</span>
          </div>
        )}

        {!isSupported && !permissionError && (
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono flex items-start gap-2">
            <FiAlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>Web Speech API is optimized for Google Chrome, Microsoft Edge, or Safari. Use the quick buttons below or manual input.</span>
          </div>
        )}

        {/* Visual Waveform / Mic Button */}
        <div className="flex flex-col items-center justify-center py-2">
          <button
            onClick={toggleListening}
            className={`relative p-5 rounded-full transition-all duration-300 cursor-pointer ${
              isListening
                ? 'bg-red-500/20 text-red-400 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)] scale-105'
                : 'bg-[#0a1424] text-[#64ffda] border border-[#1e3a5f] hover:border-[#64ffda] shadow-lg hover:scale-105'
            }`}
            title={isListening ? 'Click to stop listening' : 'Click to start microphone listening'}
          >
            {isListening ? <FiMicOff size={28} className="animate-pulse" /> : <FiMic size={28} />}
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
            )}
          </button>
          <div className="mt-2.5 text-[11px] font-mono font-semibold tracking-wide">
            {isListening ? (
              <span className="text-red-400 animate-pulse flex items-center gap-1.5">
                ● LISTENING... SPEAK NOW
              </span>
            ) : (
              <span className="text-[#8892b0]">TAP MIC TO SPEAK OR PRESS ALT+V</span>
            )}
          </div>
        </div>

        {/* Live Transcript Display */}
        <div className="bg-[#060a14] p-3 rounded-lg border border-[#1e3a5f] min-h-[50px] flex items-center shadow-inner">
          <div className="text-xs font-mono text-white break-words w-full">
            {transcript ? (
              <span className="text-[#64ffda] font-semibold">"{transcript}"</span>
            ) : (
              <span className="text-[#8892b0]/70 italic text-[11px]">
                Speak naturally: "Switch to Bangalore", "Open experimental labs", "Trace path", "Filter high risk", "Who is kingpin"...
              </span>
            )}
          </div>
        </div>

        {/* Quick Voice Command Chips */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase text-[#8892b0] flex items-center justify-between">
            <span>Quick Spoken Directives:</span>
            <span className="text-[9px] text-[#64ffda]">1-CLICK EXECUTE</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: '⚡ Open Labs', cmd: 'Open experimental labs' },
              { label: '🏙️ Bangalore Case', cmd: 'Switch to Bangalore' },
              { label: '🍁 Punjab Case', cmd: 'Switch to Punjab' },
              { label: '🕶️ Dawood Case', cmd: 'Switch to Dawood' },
              { label: '🔗 Trace Path', cmd: 'Trace connection path' },
              { label: '🗺️ Threat Map', cmd: 'Switch to map view' },
              { label: '⚠️ Filter High Risk', cmd: 'Filter high risk threats' },
              { label: '🔄 Reset Canvas', cmd: 'Reset network canvas' }
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setTranscript(item.cmd);
                  executeCommand(item.cmd);
                }}
                className="px-2 py-1.5 rounded-lg bg-[#0a1424] hover:bg-[#162a45] border border-[#1e3a5f] hover:border-[#64ffda]/50 text-[11px] font-mono text-[#c8d6e5] hover:text-white transition-all text-left flex items-center gap-1.5 cursor-pointer truncate"
              >
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Response */}
        {spokenReply && (
          <div className="p-2.5 rounded-lg bg-[#060a14] border border-[#64ffda]/30 text-xs font-mono animate-in fade-in duration-150">
            <div className="text-[10px] text-[#64ffda] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <FiTerminal size={10} /> Copilot Action Response
            </div>
            <div className="text-white leading-relaxed">{spokenReply}</div>
          </div>
        )}

        {/* Fallback Text Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeCommand(manualInput);
            setManualInput('');
          }}
          className="flex gap-1.5 pt-2 border-t border-[#1e3a5f]"
        >
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Type directive override..."
            className="flex-1 bg-[#060a14] border border-[#1e3a5f] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#64ffda] font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#162a45] hover:bg-[#1e3a5f] text-xs text-[#64ffda] rounded-lg border border-[#64ffda]/30 font-mono font-bold transition-colors cursor-pointer"
          >
            EXECUTE
          </button>
        </form>
      </div>
    </div>
  );
}
