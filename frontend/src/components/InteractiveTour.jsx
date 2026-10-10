import React, { useState, useEffect, useRef } from 'react';
import { 
  FiCrosshair, 
  FiMove, 
  FiSearch, 
  FiLink, 
  FiFolder, 
  FiUploadCloud, 
  FiCpu, 
  FiActivity, 
  FiX, 
  FiChevronRight, 
  FiChevronLeft, 
  FiCheck, 
  FiPlay,
  FiHelpCircle
} from 'react-icons/fi';

const TOUR_STEPS = [
  {
    id: 'fit-screen',
    selector: '[data-tour="fit-screen"]',
    title: '1. Fit Network to Screen',
    subtitle: 'CANVAS ORIENTATION CONTROL',
    icon: <FiCrosshair className="text-[#64ffda]" size={18} />,
    content: 'Whenever you load a case, ingest new evidence, or pan away, click this Fit to Screen button (crosshair icon) to automatically center the entire criminal network graph within your display viewport.',
    hint: 'Tip: You can also use the + / - zoom buttons below, or double-click any node to expand its 2-hop ego network.',
    actionType: 'fit-screen',
    actionLabel: 'Click to Fit Screen Now',
  },
  {
    id: 'floating-tools',
    selector: '[data-tour="floating-tools"]',
    fallbackSelectors: ['[data-tour="voice-copilot"]', '[data-tour="floating-chatbot"]'],
    title: '2. Draggable AI & Voice Controls',
    subtitle: 'MOVABLE OPERATOR CONTROLS',
    icon: <FiMove className="text-[#f9ca24]" size={18} />,
    content: 'The Tactical Voice Copilot (Alt+V) and the AI Copilot (>_) buttons are completely draggable! If they ever cover your network nodes or side panels, click and drag them anywhere across the screen. Your custom position is saved automatically.',
    hint: 'Tip: Try dragging either button right now to place them wherever you prefer.',
  },
  {
    id: 'node-search',
    selector: '[data-tour="node-search"]',
    title: '3. Instant Entity Search',
    subtitle: 'CANVAS NODE LOCATOR',
    icon: <FiSearch className="text-[#4ecdc4]" size={18} />,
    content: 'Need to pinpoint a specific kingpin, shell company, vehicle, or phone number? Click this search button (directly above Zoom In) to open a search popover that smoothly flies Cytoscape to zoom and focus on that node.',
    hint: 'Tip: You can search by suspect name, alias, vehicle plate, or phone number.',
  },
  {
    id: 'trace-path',
    selector: '[data-tour="trace-path"]',
    title: '4. Two-Click Connection Tracer',
    subtitle: 'CRIMINAL LINK DISCOVERY',
    icon: <FiLink className="text-[#45b7d1]" size={18} />,
    content: 'Activate Two-Click mode, then click any two suspects or entities on the graph to instantly trace the shortest chain of criminal associations, shared vehicles, and fund transfers between them.',
    hint: 'Tip: Great for identifying secret middlemen or money mules between kingpins.',
  },
  {
    id: 'case-selector',
    selector: '[data-tour="case-selector"]',
    title: '5. Syndicate Investigation Dossiers',
    subtitle: 'PRE-SEEDED & CUSTOM CASES',
    icon: <FiFolder className="text-[#a29bfe]" size={18} />,
    content: 'Switch between multi-agency intelligence operations (such as Dawood D-Company, Purvanchal Mafia, Punjab Narcotics) or switch to "New Investigation" to upload and investigate your own raw evidence.',
    hint: 'Tip: Every case contains full graph topology, financial ledgers, and CDR phone logs.',
  },
  {
    id: 'data-ingestion',
    selector: '[data-tour="data-ingestion"]',
    title: '6. Multi-Source Evidence Ingestion',
    subtitle: 'FORENSIC DATA VAULT',
    icon: <FiUploadCloud className="text-[#96c93d]" size={18} />,
    content: 'Upload police FIR text reports, CDR call records (.csv), bank financial ledgers (.csv), and ANPR vehicle sightings (.csv). Our NLP pipeline extracts entities and constructs network links in real time.',
    hint: 'Tip: Pre-configured sample files can be downloaded right from the Ingestion modal.',
  },
  {
    id: 'intel-suite',
    selector: '[data-tour="intel-suite"]',
    title: '7. Advanced Intelligence Suite',
    subtitle: 'EXPERIMENTAL LABS & AUDIT',
    icon: <FiCpu className="text-[#ff6b6b]" size={18} />,
    content: 'Access deep algorithmic analytics: Decapitation Strike simulation (LCC network breakdown), Quantum Mole insider leak detection, Optical Plate-Cloning paradox analysis, and immutable SIEM audit logs.',
    hint: 'Tip: Requires Clearance Level 3+ (Admin / Director).',
  },
  {
    id: 'right-panel',
    selector: '[data-tour="right-panel"]',
    title: '8. Live Threat Feed & 360° Dossier',
    subtitle: 'TACTICAL INTELLIGENCE FEED',
    icon: <FiActivity className="text-[#ff6b35]" size={18} />,
    content: 'The Right Panel shows real-time algorithmic threat alerts. Clicking any entity on the canvas instantly switches this panel into a complete 360° Forensic Intelligence Dossier with risk metrics and FIR history.',
    hint: 'Tip: You can collapse or expand this panel with the arrow button at its top.',
  }
];

export default function InteractiveTour({ isOpen, onClose, onFitCanvas }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [cardPosition, setCardPosition] = useState({ top: 100, left: 100, placement: 'bottom' });
  const tooltipRef = useRef(null);

  const step = TOUR_STEPS[currentStepIndex];

  // Update target rect and position
  useEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      let el = document.querySelector(step.selector);
      if (!el && step.fallbackSelectors) {
        for (const sel of step.fallbackSelectors) {
          el = document.querySelector(sel);
          if (el) break;
        }
      }

      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right
        });

        // Compute optimal position for the tooltip card
        const cardWidth = Math.min(380, window.innerWidth - 32);
        const cardHeight = 260;
        const padding = 16;

        let left = rect.left + rect.width / 2 - cardWidth / 2;
        // Clamp horizontally
        left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, left));

        let top = 0;
        let placement = 'bottom';

        // Check space above vs below
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow >= cardHeight + padding) {
          top = rect.bottom + padding;
          placement = 'bottom';
        } else if (spaceAbove >= cardHeight + padding) {
          top = rect.top - cardHeight - padding;
          placement = 'top';
        } else {
          // If neither has room, position to the side or center
          if (rect.left > cardWidth + padding) {
            left = rect.left - cardWidth - padding;
            top = Math.max(20, Math.min(window.innerHeight - cardHeight - 20, rect.top));
            placement = 'left';
          } else {
            left = Math.min(window.innerWidth - cardWidth - 20, rect.right + padding);
            top = Math.max(20, Math.min(window.innerHeight - cardHeight - 20, rect.top));
            placement = 'right';
          }
        }

        setCardPosition({ top, left, placement });
      } else {
        // If element is not rendered, center on screen
        const cardWidth = Math.min(380, window.innerWidth - 32);
        setTargetRect(null);
        setCardPosition({
          top: window.innerHeight / 2 - 130,
          left: window.innerWidth / 2 - cardWidth / 2,
          placement: 'center'
        });
      }
    };

    updateRect();
    const handleResize = () => updateRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isOpen, currentStepIndex, step]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleComplete();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('crimenet_tour_completed', 'true');
    } catch (_) {}
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden select-none pointer-events-auto">
      {/* Dark overlay backdrop with cutout feel */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={handleComplete}
      />

      {/* Target Spotlight Highlight Ring */}
      {targetRect && (
        <div 
          className="absolute pointer-events-none transition-all duration-300 rounded-xl"
          style={{
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
            boxShadow: '0 0 0 9999px rgba(3, 7, 18, 0.75), 0 0 25px rgba(100, 255, 218, 0.6)',
            border: '2px solid #64ffda',
            zIndex: 101,
          }}
        >
          <span className="absolute -top-1 -left-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#64ffda] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#64ffda]"></span>
          </span>
        </div>
      )}

      {/* Tour Step Card */}
      <div 
        ref={tooltipRef}
        style={{
          top: `${cardPosition.top}px`,
          left: `${cardPosition.left}px`,
          zIndex: 105,
        }}
        className="absolute w-[360px] max-w-[92vw] bg-[#091426] border border-[#1e3a5f] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-5 text-[#c8d6e5] transition-all duration-300 animate-in fade-in zoom-in-95 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0e223d] border border-[#1e3a5f] flex items-center justify-center shrink-0 shadow-inner">
              {step.icon}
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-wider font-bold text-[#64ffda] uppercase">
                {step.subtitle} • {currentStepIndex + 1}/{TOUR_STEPS.length}
              </div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {step.title}
              </h3>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleComplete}
            className="text-[#8892b0] hover:text-white p-1 rounded hover:bg-[#13233a] transition-colors"
            title="Skip Tour (Esc)"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Content Body */}
        <p className="text-xs text-[#b8c7db] leading-relaxed mb-3">
          {step.content}
        </p>

        {/* Optional Action / Interactive Trigger */}
        {step.actionType === 'fit-screen' && (
          <button
            type="button"
            onClick={() => {
              if (onFitCanvas) onFitCanvas();
            }}
            className="w-full mb-3 py-1.5 px-3 rounded-lg bg-[#0e2a4a] hover:bg-[#143d6b] border border-[#64ffda]/40 text-[#64ffda] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
          >
            <FiCrosshair size={14} className="group-hover:rotate-45 transition-transform" />
            <span>{step.actionLabel}</span>
          </button>
        )}

        {/* Hint Box */}
        {step.hint && (
          <div className="p-2 rounded-lg bg-[#050b14] border border-[#1e3a5f]/60 text-[11px] font-mono text-[#8892b0] mb-4 flex items-start gap-1.5">
            <span className="text-[#f9ca24] shrink-0 font-bold">💡</span>
            <span>{step.hint}</span>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1e3a5f]/60">
          {/* Step Dots */}
          <div className="flex items-center gap-1">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStepIndex 
                    ? 'w-5 bg-[#64ffda]' 
                    : 'w-1.5 bg-[#1e3a5f] hover:bg-[#8892b0]'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-2.5 py-1.5 text-xs text-[#8892b0] hover:text-white rounded-lg hover:bg-[#13233a] transition-colors flex items-center gap-1 font-medium cursor-pointer"
              >
                <FiChevronLeft size={14} /> Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-3.5 py-1.5 text-xs font-bold bg-[#64ffda] text-[#060a14] hover:bg-[#4ecdc4] rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-[0_0_12px_rgba(100,255,218,0.3)]"
            >
              {currentStepIndex === TOUR_STEPS.length - 1 ? (
                <>Finish <FiCheck size={14} /></>
              ) : (
                <>Next <FiChevronRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
