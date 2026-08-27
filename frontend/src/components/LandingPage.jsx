import React from 'react';
import Particles from './Particles';
import { FiShield } from 'react-icons/fi';

export default function LandingPage({ onEnter }) {
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
        className="absolute inset-0 z-0"
      />

      <div className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <FiShield className="text-[var(--text-accent)] text-2xl" />
          <h1 className="text-xl font-bold tracking-wider" style={{ textShadow: '0 0 10px rgba(0,255,65,0.5)', color: 'var(--text-accent)' }}>
            CRIMENET
          </h1>
        </div>
        <div className="flex items-center gap-8 text-sm font-medium text-gray-400">
          <button className="hover:text-white transition-colors">Features</button>
          <button className="hover:text-white transition-colors">About</button>
          <button className="bg-white text-black px-5 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">
            Sign up
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 -mt-16">
        <div className="flex items-center gap-3 bg-[#0a0a0a] border border-[#222222] rounded-full p-1 pr-4 mb-8">
          <span className="bg-white text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">NEW</span>
          <span className="text-xs text-gray-400 font-medium">Deployed v2.0 Matrix Protocols</span>
        </div>

        <h2 className="text-5xl md:text-[5.5rem] font-extrabold tracking-tight max-w-5xl mb-12 leading-[1.1]">
          Algorithms that dismantle <br /> the criminal underworld
        </h2>

        <div className="flex items-center gap-4">
          <button 
            onClick={onEnter} 
            className="bg-white text-black font-bold text-sm px-8 py-3.5 rounded-xl hover:scale-105 transition-transform"
          >
            Get started
          </button>
          <button className="bg-[#141414] border border-[#333] text-white font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-[#222] transition-colors">
            Learn more
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-10 flex items-center gap-3">
        <span className="text-sm text-gray-500 font-medium">Demo Content</span>
        <div className="w-10 h-6 bg-[#1a1a1a] border border-[#333] rounded-full relative cursor-not-allowed">
          <div className="absolute left-1 top-1 w-3.5 h-3.5 bg-gray-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
