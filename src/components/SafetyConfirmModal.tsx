import React from 'react';
import { ShieldAlert, AlertTriangle, Check, X } from 'lucide-react';
import { soundFx, triggerHaptic } from '../utils/audioSynthesizer';

interface SafetyConfirmModalProps {
  isOpen: boolean;
  actionTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SafetyConfirmModal: React.FC<SafetyConfirmModalProps> = ({
  isOpen,
  actionTitle,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md hud-panel p-6 rounded-2xl border-2 border-red-500/60 shadow-[0_0_35px_rgba(239,68,68,0.35)] cyber-grid">
        {/* Holographic corner notches */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500" />

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-tech text-red-400 tracking-widest uppercase">
              SECURITY PROTOCOL • LEVEL 5 CLEARANCE
            </span>
            <h3 className="text-lg font-orbitron font-bold text-red-100 tracking-wide mt-1">
              COMMAND AUTHORIZATION REQUIRED
            </h3>
            <p className="text-xs text-cyan-300/80 font-tech mt-2">
              JARVIS safeguards your data. Are you certain you wish to execute:
            </p>
            <div className="mt-2 p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs font-rajdhani text-red-200 font-semibold">
              "{actionTitle}"
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 w-full pt-2">
            <button
              onClick={() => {
                soundFx.playTactileClick();
                triggerHaptic('light');
                onCancel();
              }}
              className="flex-1 py-2.5 rounded-xl bg-gray-900 border border-gray-700 hover:bg-gray-800 text-xs font-tech text-gray-300 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>ABORT COMMAND</span>
            </button>

            <button
              onClick={() => {
                soundFx.playAlertAlarm();
                triggerHaptic('alert');
                onConfirm();
              }}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-tech font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>AUTHORIZE EXECUTION</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
