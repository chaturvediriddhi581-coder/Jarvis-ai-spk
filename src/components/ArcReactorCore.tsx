import React from 'react';
import { AssistantState } from '../types';
import { Mic, Radio, Zap, Volume2, Sparkles } from 'lucide-react';

interface ArcReactorCoreProps {
  state: AssistantState;
  onActivate: () => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ArcReactorCore: React.FC<ArcReactorCoreProps> = ({
  state,
  onActivate,
  size = 'md',
  showLabel = true,
}) => {
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';
  const isSpeaking = state === 'speaking';

  // Size configurations
  const dimensions = {
    sm: 'w-36 h-36',
    md: 'w-52 h-52 sm:w-60 sm:h-60',
    lg: 'w-64 h-64 sm:w-80 sm:h-80',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* Outer ambient glow */}
      <div
        className={`absolute rounded-full pointer-events-none transition-all duration-700 ${
          isListening
            ? 'w-72 h-72 sm:w-96 sm:h-96 bg-cyan-400/25 blur-3xl animate-pulse'
            : isSpeaking
            ? 'w-64 h-64 sm:w-80 sm:h-80 bg-blue-500/20 blur-2xl animate-pulse'
            : isThinking
            ? 'w-64 h-64 sm:w-80 sm:h-80 bg-indigo-500/20 blur-2xl'
            : 'w-48 h-48 sm:w-64 sm:h-64 bg-cyan-500/15 blur-xl'
        }`}
      />

      {/* Main Interactive Arc Core */}
      <button
        onClick={onActivate}
        type="button"
        aria-label="Activate Rudraksh JARVIS Voice Assistant"
        className={`relative ${dimensions} rounded-full flex items-center justify-center cursor-pointer transition-transform duration-300 active:scale-95 focus:outline-none group`}
      >
        {/* SVG Holographic Rings */}
        <svg
          viewBox="0 0 240 240"
          className="absolute inset-0 w-full h-full overflow-visible"
        >
          <defs>
            {/* Holographic Cyan Gradient */}
            <linearGradient id="arcCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
            </linearGradient>

            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="intenseGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Compass / Dial Ring */}
          <circle
            cx="120"
            cy="120"
            r="112"
            fill="none"
            stroke="rgba(0, 240, 255, 0.25)"
            strokeWidth="1.2"
            strokeDasharray="3 9"
            className="animate-spin-slow origin-center"
          />

          {/* Outer Segmented Gear Tracks */}
          <circle
            cx="120"
            cy="120"
            r="104"
            fill="none"
            stroke="rgba(0, 240, 255, 0.45)"
            strokeWidth="2.5"
            strokeDasharray="22 14 6 14"
            className={
              isListening
                ? 'animate-spin-medium origin-center'
                : 'animate-spin-reverse-slow origin-center'
            }
          />

          {/* 12 Holographic Angular Notches */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 120 + 96 * Math.cos(angle);
            const y1 = 120 + 96 * Math.sin(angle);
            const x2 = 120 + 106 * Math.cos(angle);
            const y2 = 120 + 106 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isListening ? '#00f0ff' : 'rgba(0, 240, 255, 0.6)'}
                strokeWidth={i % 3 === 0 ? '2.5' : '1.2'}
              />
            );
          })}

          {/* Mid Segmented Arc Ring (Counter-rotating) */}
          <circle
            cx="120"
            cy="120"
            r="82"
            fill="none"
            stroke="url(#arcCyanGrad)"
            strokeWidth="3.5"
            strokeDasharray="50 15 20 15"
            filter="url(#glowFilter)"
            className={
              isThinking
                ? 'animate-spin-medium origin-center'
                : 'animate-spin-slow origin-center'
            }
          />

          {/* Inner Energy Wave Circle */}
          <circle
            cx="120"
            cy="120"
            r="64"
            fill="none"
            stroke={isListening ? '#38bdf8' : 'rgba(0, 240, 255, 0.4)'}
            strokeWidth="1.5"
            strokeDasharray="8 6"
            className="animate-spin-reverse-slow origin-center"
          />

          {/* 3 Nano-Tech Turbine Fins / Triangular Arc Core Elements */}
          {Array.from({ length: 3 }).map((_, i) => {
            const rot = i * 120;
            return (
              <g
                key={i}
                transform={`rotate(${rot} 120 120)`}
                className={
                  isListening
                    ? 'animate-spin-medium origin-center'
                    : 'animate-spin-slow origin-center'
                }
              >
                <path
                  d="M120 60 L126 80 L114 80 Z"
                  fill="rgba(0, 240, 255, 0.7)"
                  filter="url(#glowFilter)"
                />
                <circle cx="120" cy="54" r="2.5" fill="#00f0ff" />
              </g>
            );
          })}

          {/* Pulsing Central Plasma Chamber */}
          <circle
            cx="120"
            cy="120"
            r="44"
            fill="rgba(3, 16, 38, 0.85)"
            stroke="#00f0ff"
            strokeWidth="2.5"
            filter="url(#intenseGlow)"
            className={isListening ? 'animate-pulse' : 'animate-pulse-core'}
          />

          {/* Core Inner Ring */}
          <circle
            cx="120"
            cy="120"
            r="32"
            fill="rgba(0, 240, 255, 0.15)"
            stroke="rgba(56, 189, 248, 0.9)"
            strokeWidth="1.8"
          />
        </svg>

        {/* Center Interactive Icon & Telemetry */}
        <div className="z-10 flex flex-col items-center justify-center pointer-events-none text-cyan-300">
          {isListening ? (
            <div className="flex flex-col items-center">
              <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-200 animate-bounce filter drop-shadow-[0_0_8px_#00f0ff]" />
              <span className="text-[10px] font-tech text-cyan-400 tracking-widest mt-1">
                RECEIVING
              </span>
            </div>
          ) : isThinking ? (
            <div className="flex flex-col items-center">
              <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-200 animate-spin filter drop-shadow-[0_0_8px_#00f0ff]" />
              <span className="text-[10px] font-tech text-cyan-400 tracking-widest mt-1">
                COMPUTING
              </span>
            </div>
          ) : isSpeaking ? (
            <div className="flex flex-col items-center">
              <Volume2 className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-200 animate-pulse filter drop-shadow-[0_0_8px_#00f0ff]" />
              <span className="text-[10px] font-tech text-cyan-400 tracking-widest mt-1">
                TRANSMITTING
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 sm:w-9 sm:h-9 text-cyan-300/90 filter drop-shadow-[0_0_6px_#00f0ff]" />
              <span className="text-[9px] font-tech text-cyan-400/80 tracking-widest mt-1">
                ONLINE
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Acoustic Radial Rings when listening */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-30 pointer-events-none" />
        )}
      </button>

      {/* State Label & Sub-telemetry */}
      {showLabel && (
        <div className="mt-4 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 backdrop-blur-md">
            <span
              className={`w-2 h-2 rounded-full ${
                isListening
                  ? 'bg-red-400 animate-ping'
                  : isSpeaking
                  ? 'bg-cyan-400 animate-pulse'
                  : isThinking
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="font-tech text-xs tracking-wider text-cyan-200 uppercase">
              {isListening
                ? 'Listening to command...'
                : isThinking
                ? 'Processing query...'
                : isSpeaking
                ? 'JARVIS Vocalizing...'
                : 'Systems Standby • Tap to speak'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
