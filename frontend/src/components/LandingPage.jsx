import React, { useState } from 'react';
import Particles from './Particles';
import { FiShield, FiX, FiCheckCircle } from 'react-icons/fi';

export default function LandingPage({ onEnter }) {
  const [showFeatures, setShowFeatures] = useState(false);

  const featuresList = [
    { name: "Spectral Graph Decapitation", desc: "Finds the minimal strike sequence to shatter cartel networks." },
    { name: "Physical-Exclusive Meetings", desc: "Exposes covert physical meetups between suspects maintaining radio silence." },
    { name: "Optical Plate-Cloning Paradox", desc: "Detects impossible kinematic highway velocities to flag cloned decoy vehicles." },
    { name: "Hawala Betrayal Index", desc: "Models financial conduits and simulate account freeze cascades and betrayal risk." },
    { name: "Accused Interrogation Simulator", desc: "AI persona mimicking suspect linguistics for mock interrogations." },
    { name: "Criminal-Slang Analyzer", desc: "Auto-translates masked underworld code words into plain English intelligence." },
    { name: "Confession-Probability Index", desc: "Chronobiological Shannon Entropy tracking to pinpoint optimal confession windows." },
    { name: "Voice-Cloned Sting Honeypot", desc: "Autonomous AI victim persona stalling scammers to extract intelligence." },
    { name: "Arrest Aftermath Predictor", desc: "Forecasts non-linear retaliatory and power-vacuum cascades following suspect arrests." },
    { name: "Criminal Dynasty History", desc: "Hypergraph kinship mapping predicting next-gen cartel successors and lineages." },
    { name: "Vulnerability Detection Counter AI", desc: "Adversarial underworld AI that attacks CrimeNet to discover blind spots." },
    { name: "Syntax DNA Stylometry", desc: "Linguistic fingerprinting to match anonymous manifestos to known suspects." },
    { name: "Internal-Leak Analyzer", desc: "Detects corrupt insider leaks and compromised access points via honeytoken beacon traps." }
  ];

  return (
    <div className="relative w-screen h-screen bg-[#000000] text-white overflow-hidden flex flex-col font-sans">
      <Particles
        particleColors={['#ffffff', '#00ff41', '#ffffff']}
        particleCount={200}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={100}
        moveParticlesOnHover={true}
        particleHoverFactor={1}
        alphaParticles={true}
        sizeRandomness={1}
        cameraDistance={20}
        disableRotation={false}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      <div className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <FiShield className="text-[var(--text-accent)] text-2xl" />
          <h1 className="text-xl font-bold tracking-wider" style={{ textShadow: '0 0 10px rgba(0,255,65,0.5)', color: 'var(--text-accent)' }}>
            CRIMENET
          </h1>
        </div>
        <div className="flex items-center gap-8 text-sm font-medium text-gray-400">
          <button onClick={() => setShowFeatures(true)} className="hover:text-white transition-colors">Features</button>
          <a 
            href="https://github.com/kulkarnishamanth4-ux/criminal-network-analyzer" 
            target="_blank" 
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            About
          </a>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 -mt-16 pointer-events-none">
        <div className="flex items-center gap-3 bg-[#0a0a0a] border border-[#222222] rounded-full p-1 pr-4 mb-8 pointer-events-auto">
          <span className="bg-white text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">NEW</span>
          <span className="text-xs text-gray-400 font-medium">Deployed v2.0 Matrix Protocols</span>
        </div>

        <h2 className="text-5xl md:text-[5.5rem] font-extrabold tracking-tight max-w-5xl mb-12 leading-[1.1] pointer-events-auto">
          Algorithms that dismantle <br /> the criminal underworld
        </h2>

        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={onEnter} 
            className="bg-white text-black font-bold text-sm px-8 py-3.5 rounded-xl hover:scale-105 transition-transform"
          >
            Get started
          </button>
        </div>
      </div>

      {showFeatures && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-[#222]">
              <h2 className="text-2xl font-bold text-[var(--text-accent)] tracking-wider uppercase">Project Features</h2>
              <button onClick={() => setShowFeatures(false)} className="text-gray-400 hover:text-white p-2">
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuresList.map((feat, idx) => (
                <div key={idx} className="bg-[#111] border border-[#333] p-4 rounded-xl flex items-start gap-3 hover:border-[var(--text-accent)] transition-colors">
                  <FiCheckCircle className="text-[var(--text-accent)] mt-0.5 shrink-0" size={18} />
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1">{feat.name}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
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
