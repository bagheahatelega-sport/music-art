/**
 * Rhythm Tap Pad for NotaSakti Maestro
 * Dedicated input mode for rhythm timing and note duration training (like Taiko / Rhythm Game).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { soundEngine } from '../audio/soundEngine';

interface RhythmTapPadProps {
  onTap: () => void;
  targetNoteName?: string;
  isWaitMode?: boolean;
}

export const RhythmTapPad: React.FC<RhythmTapPadProps> = ({
  onTap,
  targetNoteName,
  isWaitMode,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleTapAction = useCallback(() => {
    soundEngine.playMetronome(true);
    setIsPressed(true);
    onTap();
    setTimeout(() => setIsPressed(false), 120);
  }, [onTap]);

  // Spacebar hotkey for rhythm tap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        handleTapAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTapAction]);

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
      <div className="text-center mb-3">
        <p className="text-xs text-slate-400">
          Mode Ketukan Ritme: Tekan tombol atau <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-cyan-300">Spacebar</kbd> tepat saat not menyentuh garis target biru.
        </p>
      </div>

      <button
        onClick={handleTapAction}
        className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center transition-all duration-75 select-none ${
          isPressed
            ? 'scale-95 bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_40px_rgba(6,182,212,0.6)]'
            : 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 hover:from-slate-700 hover:to-slate-900 shadow-2xl border-4 border-slate-700/60'
        }`}
      >
        {/* Outer drum ring */}
        <div className="absolute inset-2 rounded-full border border-dashed border-slate-600/50 pointer-events-none" />

        <div className="z-10 flex flex-col items-center text-center">
          <span className="text-4xl mb-1">🥁</span>
          <span className="text-lg font-bold tracking-wider text-slate-100 uppercase">
            {isWaitMode ? 'KETUK NOT' : 'KETUK RITME'}
          </span>
          <span className="text-xs text-cyan-400 font-mono mt-1 font-semibold">
            {targetNoteName ? `Not Target: ${targetNoteName}` : '[SPACEBAR]'}
          </span>
        </div>
      </button>
    </div>
  );
};
