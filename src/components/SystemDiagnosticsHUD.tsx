import React, { useState } from 'react';
import { SystemTelemetry, SystemProtocol, UserPreferences } from '../types';
import {
  Shield,
  Activity,
  Cpu,
  Zap,
  Gauge,
  Sliders,
  Volume2,
  VolumeX,
  Smartphone,
  Sparkles,
  Sun,
  Flame,
  Radio,
} from 'lucide-react';
import { soundFx, triggerHaptic } from '../utils/audioSynthesizer';

interface SystemDiagnosticsHUDProps {
  telemetry: SystemTelemetry;
  currentProtocol: SystemProtocol;
  onSelectProtocol: (protocol: SystemProtocol) => void;
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  onRequestBriefing: () => void;
}

export const SystemDiagnosticsHUD: React.FC<SystemDiagnosticsHUDProps> = ({
  telemetry,
  currentProtocol,
  onSelectProtocol,
  preferences,
  setPreferences,
  onRequestBriefing,
}) => {
  const protocols: Array<{ id: SystemProtocol; name: string; desc: string; icon: any; color: string }> = [
    {
      id: 'STANDARD',
      name: 'Standard Protocol',
      desc: 'All subroutines balanced. Full conversational and tactical support.',
      icon: Shield,
      color: 'text-cyan-400',
    },
    {
      id: 'SENTRY_MODE',
      name: 'Sentry Protocol',
      desc: 'Heightened radar sensitivity, rapid defensive response, perimeter scan.',
      icon: Radio,
      color: 'text-amber-400',
    },
    {
      id: 'STEALTH',
      name: 'Stealth Protocol',
      desc: 'Audio dampening, visual emission minimization, silent operations.',
      icon: Gauge,
      color: 'text-purple-400',
    },
    {
      id: 'HOUSE_PARTY',
      name: 'House Party Protocol',
      desc: 'Full suit legion synchronization. Arc reactor illumination boost.',
      icon: Flame,
      color: 'text-rose-400',
    },
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto hud-panel rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30 p-4 sm:p-6 space-y-6 cyber-grid overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/25 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="font-orbitron font-bold text-base sm:text-lg text-cyan-100 tracking-wider">
              MARK LXXXV SYSTEM DIAGNOSTICS
            </h2>
          </div>
          <p className="text-xs font-tech text-cyan-400/80 mt-0.5">
            STARK INDUSTRIES • NEURAL CORE COGNITION • VERSION {telemetry.version}
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playJarvisChime();
            triggerHaptic('success');
            onRequestBriefing();
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-950 font-bold text-xs tracking-wider font-tech shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>REQUEST STATUS BRIEFING</span>
        </button>
      </div>

      {/* Telemetry Gauge Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="hud-panel p-3.5 rounded-xl border border-cyan-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-[10px] font-tech uppercase tracking-wider">ARC CORE POWER</span>
            <Zap className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="text-xl sm:text-2xl font-tech font-bold text-cyan-100">
            {telemetry.arcReactorOutput}
          </div>
          <div className="w-full bg-cyan-950/80 rounded-full h-1.5 mt-2 overflow-hidden border border-cyan-500/30">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-[99%]" />
          </div>
        </div>

        <div className="hud-panel p-3.5 rounded-xl border border-cyan-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-[10px] font-tech uppercase tracking-wider">CORE TEMPERATURE</span>
            <Activity className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="text-xl sm:text-2xl font-tech font-bold text-cyan-100">
            {telemetry.coreTemperature}
          </div>
          <span className="text-[10px] font-tech text-emerald-400 mt-2">
            OPTIMAL THERMAL FLUX
          </span>
        </div>

        <div className="hud-panel p-3.5 rounded-xl border border-cyan-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-[10px] font-tech uppercase tracking-wider">NEURAL LATENCY</span>
            <Cpu className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="text-xl sm:text-2xl font-tech font-bold text-cyan-100">
            {telemetry.latencyMs} ms
          </div>
          <span className="text-[10px] font-tech text-cyan-400/80 mt-2">
            SUB-MILLISECOND RESPONSE
          </span>
        </div>

        <div className="hud-panel p-3.5 rounded-xl border border-cyan-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-[10px] font-tech uppercase tracking-wider">GEMINI CORE</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-tech font-bold text-emerald-300">
            {telemetry.geminiOnline ? 'ONLINE' : 'ACTIVE'}
          </div>
          <span className="text-[10px] font-tech text-cyan-400/80 mt-2">
            3.8-FLASH REASONING
          </span>
        </div>
      </div>

      {/* Protocols Switcher */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-orbitron font-semibold text-xs tracking-wider text-cyan-300">
            TACTICAL PROTOCOL MATRIX
          </h3>
          <span className="text-[11px] font-tech text-cyan-400/80">
            ACTIVE PROTOCOL: <strong className="text-cyan-200">{currentProtocol}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {protocols.map((proto) => {
            const Icon = proto.icon;
            const isActive = currentProtocol === proto.id;

            return (
              <button
                key={proto.id}
                onClick={() => {
                  soundFx.playTactileClick();
                  triggerHaptic('medium');
                  onSelectProtocol(proto.id);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_18px_rgba(0,240,255,0.35)]'
                    : 'bg-gray-900/60 border-cyan-500/20 hover:border-cyan-400/50 hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${proto.color}`} />
                    <span className="font-orbitron text-xs font-bold text-cyan-100">
                      {proto.name}
                    </span>
                  </div>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-tech uppercase bg-cyan-500 text-gray-950 font-bold">
                      ENGAGED
                    </span>
                  )}
                </div>
                <p className="text-xs text-cyan-300/80 font-rajdhani leading-snug">
                  {proto.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Preferences & Hardware Configuration */}
      <div className="hud-panel p-4 rounded-xl border border-cyan-500/30 space-y-4">
        <h3 className="font-orbitron font-semibold text-xs tracking-wider text-cyan-300 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>OPERATIONAL PREFERENCES & ANDROID TACTILE CONTROLS</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* User Callsign */}
          <div className="space-y-1">
            <label className="text-[11px] font-tech text-cyan-400/80">User Callsign / Name:</label>
            <input
              type="text"
              value={preferences.callSign}
              onChange={(e) =>
                setPreferences((p) => ({ ...p, callSign: e.target.value, userName: e.target.value }))
              }
              className="w-full bg-gray-950/80 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-cyan-100 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Voice Engine Model */}
          <div className="space-y-1">
            <label className="text-[11px] font-tech text-cyan-400/80">AI Voice Tone:</label>
            <select
              value={preferences.voiceName}
              onChange={(e) =>
                setPreferences((p) => ({ ...p, voiceName: e.target.value as any }))
              }
              className="w-full bg-gray-950/80 border border-cyan-500/30 rounded-lg px-2 py-1.5 text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="Fenrir">Fenrir (Deep, authoritative butler)</option>
              <option value="Puck">Puck (Crisp, witty British)</option>
              <option value="Zephyr">Zephyr (Smooth futuristic)</option>
              <option value="Kore">Kore (Balanced and clear)</option>
            </select>
          </div>

          {/* Auto-Speak toggle */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => {
                soundFx.playTactileClick();
                setPreferences((p) => ({ ...p, autoSpeak: !p.autoSpeak }));
              }}
              className={`w-full py-1.5 px-3 rounded-lg border text-xs font-tech flex items-center justify-center gap-2 transition-all cursor-pointer ${
                preferences.autoSpeak
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
            >
              {preferences.autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>Auto-Vocalize: {preferences.autoSpeak ? 'ENABLED' : 'MUTED'}</span>
            </button>
          </div>
        </div>

        {/* Haptics & Sound FX */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-cyan-500/20">
          <button
            onClick={() => {
              triggerHaptic('success');
              setPreferences((p) => ({ ...p, hapticsEnabled: !p.hapticsEnabled }));
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-tech flex items-center gap-1.5 transition-all cursor-pointer ${
              preferences.hapticsEnabled
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                : 'bg-gray-900 border-gray-700 text-gray-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Haptic Vibration: {preferences.hapticsEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              const next = !preferences.soundFxEnabled;
              soundFx.setSoundEnabled(next);
              setPreferences((p) => ({ ...p, soundFxEnabled: next }));
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-tech flex items-center gap-1.5 transition-all cursor-pointer ${
              preferences.soundFxEnabled
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                : 'bg-gray-900 border-gray-700 text-gray-400'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>HUD Sound Effects: {preferences.soundFxEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
