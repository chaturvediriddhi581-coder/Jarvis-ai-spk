import React, { useEffect, useState } from 'react';
import { AssistantState } from '../types';

interface AudioWaveformProps {
  state: AssistantState;
  barCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  state,
  barCount = 28,
}) => {
  const [frequencies, setFrequencies] = useState<number[]>(() =>
    Array.from({ length: barCount }, () => 10)
  );

  useEffect(() => {
    let animFrame: number;
    let tick = 0;

    const update = () => {
      tick += 0.08;
      const mid = Math.floor(barCount / 2);

      const nextFreqs = Array.from({ length: barCount }, (_, i) => {
        const distFromCenter = Math.abs(i - mid) / mid;
        const envelope = Math.max(0.15, 1 - distFromCenter * 0.7);

        if (state === 'speaking') {
          // Dynamic harmonic audio waves
          const wave1 = Math.sin(tick * 3 + i * 0.45);
          const wave2 = Math.cos(tick * 1.8 - i * 0.3);
          const combined = Math.abs(wave1 * 0.6 + wave2 * 0.4);
          return Math.floor(18 + combined * 70 * envelope);
        } else if (state === 'listening') {
          // High sensitivity mic pickup vibration
          const wave = Math.abs(Math.sin(tick * 5 + i * 0.8));
          return Math.floor(15 + wave * 55 * envelope);
        } else if (state === 'thinking') {
          // Computing scanning wave sweep
          const sweep = Math.sin(tick * 4 - i * 0.3);
          return Math.floor(12 + Math.max(0, sweep) * 45 * envelope);
        } else {
          // Idle ambient gentle breathing
          const wave = Math.sin(tick + i * 0.25);
          return Math.floor(8 + (wave + 1) * 6 * envelope);
        }
      });

      setFrequencies(nextFreqs);
      animFrame = requestAnimationFrame(update);
    };

    animFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrame);
  }, [state, barCount]);

  return (
    <div className="flex items-center justify-center gap-[3px] sm:gap-1 h-12 px-2 overflow-hidden select-none">
      {frequencies.map((height, idx) => {
        const isCenter = Math.abs(idx - Math.floor(barCount / 2)) < 4;
        return (
          <div
            key={idx}
            className={`w-[3px] sm:w-1 rounded-full transition-all duration-75 ${
              state === 'listening'
                ? 'bg-gradient-to-t from-cyan-600 via-cyan-400 to-sky-200'
                : state === 'speaking'
                ? 'bg-gradient-to-t from-blue-600 via-cyan-400 to-white shadow-[0_0_8px_#00f0ff]'
                : state === 'thinking'
                ? 'bg-gradient-to-t from-indigo-700 via-cyan-500 to-cyan-300'
                : 'bg-cyan-800/40'
            }`}
            style={{
              height: `${Math.max(6, Math.min(height, 46))}px`,
              opacity: state === 'idle' ? 0.35 : isCenter ? 1 : 0.8,
            }}
          />
        );
      })}
    </div>
  );
};
