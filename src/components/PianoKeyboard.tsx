/**
 * Interactive Virtual Piano Keyboard for NotaSakti Maestro
 * Responsive ivory/ebony keys with multi-touch, keyboard hotkeys, and target highlights.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { soundEngine, pitchToMidi } from '../audio/soundEngine';

interface PianoKeyboardProps {
  targetPitch?: string | null;
  showKeyLabels?: boolean;
  highlightTarget?: boolean;
  onNoteTrigger: (pitch: string, midi: number) => void;
  activeExternalMidi?: number | null;
}

interface KeyConfig {
  pitch: string;
  midi: number;
  isBlack: boolean;
  keyboardKey?: string;
  label: string;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  targetPitch,
  showKeyLabels = true,
  highlightTarget = true,
  onNoteTrigger,
  activeExternalMidi,
}) => {
  // Octave window: allow shifting between Low (C3-B4) and High (C4-B5)
  const [octaveBase, setOctaveBase] = useState<number>(4); // Default C4 octave
  const [pressedMidis, setPressedMidis] = useState<Set<number>>(new Set());

  // Generate 2 complete octaves based on octaveBase
  // E.g., if base is 4: C3 to B4 or C4 to B5
  const generateKeys = (): KeyConfig[] => {
    const keys: KeyConfig[] = [];
    // Start from octaveBase - 1 to octaveBase (e.g. C3 to B4)
    const startOct = octaveBase - 1;
    const endOct = octaveBase;

    const pattern = [
      { step: 'C', isBlack: false },
      { step: 'C#', isBlack: true },
      { step: 'D', isBlack: false },
      { step: 'D#', isBlack: true },
      { step: 'E', isBlack: false },
      { step: 'F', isBlack: false },
      { step: 'F#', isBlack: true },
      { step: 'G', isBlack: false },
      { step: 'G#', isBlack: true },
      { step: 'A', isBlack: false },
      { step: 'A#', isBlack: true },
      { step: 'B', isBlack: false },
    ];

    // Keybindings mapping for Middle Octave
    const keyBindingMap: Record<string, string> = {
      C4: 'A',
      'C#4': 'W',
      D4: 'S',
      'D#4': 'E',
      E4: 'D',
      F4: 'F',
      'F#4': 'T',
      G4: 'G',
      'G#4': 'Y',
      A4: 'H',
      'A#4': 'U',
      B4: 'J',
      C5: 'K',
      'C#5': 'O',
      D5: 'L',
    };

    for (let oct = startOct; oct <= endOct; oct++) {
      pattern.forEach(({ step, isBlack }) => {
        const pitch = `${step}${oct}`;
        const midi = pitchToMidi(pitch);
        keys.push({
          pitch,
          midi,
          isBlack,
          keyboardKey: keyBindingMap[pitch],
          label: step,
        });
      });
    }

    // Add high C cap (e.g. C5 or C6)
    const capPitch = `C${endOct + 1}`;
    keys.push({
      pitch: capPitch,
      midi: pitchToMidi(capPitch),
      isBlack: false,
      keyboardKey: keyBindingMap[capPitch],
      label: 'C',
    });

    return keys;
  };

  const keys = generateKeys();
  const whiteKeys = keys.filter((k) => !k.isBlack);
  const targetMidi = targetPitch ? pitchToMidi(targetPitch) : null;

  // Handle note press action
  const handlePress = useCallback(
    (key: KeyConfig) => {
      soundEngine.playNote(key.midi);
      setPressedMidis((prev) => new Set(prev).add(key.midi));
      onNoteTrigger(key.pitch, key.midi);

      setTimeout(() => {
        setPressedMidis((prev) => {
          const next = new Set(prev);
          next.delete(key.midi);
          return next;
        });
      }, 180);
    },
    [onNoteTrigger]
  );

  // PC Keyboard listeners (e.g. A, S, D, F, G...)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const keyChar = e.key.toUpperCase();
      const matched = keys.find((k) => k.keyboardKey === keyChar);
      if (matched) {
        handlePress(matched);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keys, handlePress]);

  // Sync external MIDI or Pitch detection active note
  useEffect(() => {
    if (activeExternalMidi !== undefined && activeExternalMidi !== null) {
      setPressedMidis((prev) => new Set(prev).add(activeExternalMidi));
      const timer = setTimeout(() => {
        setPressedMidis((prev) => {
          const next = new Set(prev);
          next.delete(activeExternalMidi);
          return next;
        });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [activeExternalMidi]);

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {/* Octave Shift and Range Bar */}
      <div className="w-full flex items-center justify-between px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-300">Rentang Piano:</span>
          <span className="font-mono text-cyan-400">
            C{octaveBase - 1} — C{octaveBase + 1}
          </span>
          {targetPitch && (
            <span className="bg-slate-800 text-amber-400 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700">
              Target: {targetPitch}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setOctaveBase((o) => Math.max(3, o - 1))}
            className="px-2.5 py-1 text-xs rounded hover:bg-slate-700 active:scale-95 transition text-slate-200"
            title="Turunkan 1 Oktaf"
          >
            ◀ Oktaf Rendah (Bass)
          </button>
          <button
            onClick={() => setOctaveBase(4)}
            className={`px-2.5 py-1 text-xs rounded transition ${
              octaveBase === 4 ? 'bg-cyan-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Normal (C4)
          </button>
          <button
            onClick={() => setOctaveBase((o) => Math.min(5, o + 1))}
            className="px-2.5 py-1 text-xs rounded hover:bg-slate-700 active:scale-95 transition text-slate-200"
            title="Naikkan 1 Oktaf"
          >
            Oktaf Tinggi (Treble) ▶
          </button>
        </div>
      </div>

      {/* Keyboard Bed */}
      <div className="relative w-full max-w-4xl h-44 sm:h-48 bg-slate-950 p-2 pt-3 rounded-2xl border-2 border-slate-800 shadow-2xl overflow-hidden flex select-none">
        {/* Felt Red Rail at top of piano keys */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-800 via-red-600 to-red-800 border-b border-red-950 shadow-sm z-30" />

        {/* White Keys */}
        <div className="w-full h-full flex z-10">
          {whiteKeys.map((key) => {
            const isPressed = pressedMidis.has(key.midi);
            const isTarget = highlightTarget && targetMidi === key.midi;
            const isMiddleC = key.pitch === 'C4';

            return (
              <button
                key={key.pitch}
                onClick={() => handlePress(key)}
                className={`relative flex-1 h-full rounded-b-lg border-x border-b border-slate-300 dark:border-slate-400/30 transition-all duration-75 flex flex-col justify-end items-center pb-2 ${
                  isPressed
                    ? 'bg-cyan-200 translate-y-1 shadow-inner'
                    : isTarget
                    ? 'bg-amber-100 hover:bg-amber-200 ring-2 ring-amber-400 ring-inset shadow-md'
                    : 'bg-gradient-to-b from-stone-100 via-white to-stone-200 hover:bg-stone-50 active:translate-y-1'
                } shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
              >
                {/* Middle C indicator dot */}
                {isMiddleC && (
                  <div className="absolute top-6 w-2 h-2 rounded-full bg-cyan-500 shadow-sm" title="Middle C (C4)" />
                )}

                {/* PC Keyboard Shortcut */}
                {key.keyboardKey && (
                  <span className="text-[10px] font-mono text-slate-400 mb-0.5">
                    [{key.keyboardKey}]
                  </span>
                )}

                {/* Note Label */}
                {showKeyLabels && (
                  <span
                    className={`text-xs font-bold font-mono tracking-tight ${
                      isTarget ? 'text-amber-800' : isMiddleC ? 'text-cyan-700' : 'text-slate-800'
                    }`}
                  >
                    {key.pitch}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Black Keys */}
        <div className="absolute top-2 left-2 right-2 h-28 sm:h-32 flex pointer-events-none z-20">
          {/* Black key positioning based on diatonic white key index */}
          {whiteKeys.map((wKey, idx) => {
            if (idx === whiteKeys.length - 1) return null;

            // Check if there is a black key between wKey and next wKey
            const hasSharp = ['C', 'D', 'F', 'G', 'A'].includes(wKey.pitch.replace(/\d+/, ''));
            if (!hasSharp) return null;

            const oct = parseInt(wKey.pitch.replace(/\D+/, ''), 10);
            const step = wKey.pitch.replace(/\d+/, '');
            const blackPitch = `${step}#${oct}`;
            const blackKey = keys.find((k) => k.pitch === blackPitch);
            if (!blackKey) return null;

            const isPressed = pressedMidis.has(blackKey.midi);
            const isTarget = highlightTarget && targetMidi === blackKey.midi;

            // Left percentage based on white key width
            const whiteKeyPercent = 100 / whiteKeys.length;
            const leftPos = (idx + 1) * whiteKeyPercent - whiteKeyPercent * 0.32;

            return (
              <button
                key={blackKey.pitch}
                style={{
                  left: `${leftPos}%`,
                  width: `${whiteKeyPercent * 0.64}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePress(blackKey);
                }}
                className={`absolute top-0 h-full rounded-b-md transition-all duration-75 flex flex-col justify-end items-center pb-2 pointer-events-auto border-x border-b border-black ${
                  isPressed
                    ? 'bg-cyan-500 translate-y-1 shadow-inner'
                    : isTarget
                    ? 'bg-amber-500 ring-2 ring-amber-300 ring-inset shadow-lg'
                    : 'bg-gradient-to-b from-stone-900 via-neutral-900 to-black hover:bg-neutral-800 active:translate-y-1'
                } shadow-[0_6px_8px_rgba(0,0,0,0.5)]`}
              >
                {/* PC Keyboard Shortcut */}
                {blackKey.keyboardKey && (
                  <span className="text-[9px] font-mono text-neutral-400 mb-0.5">
                    {blackKey.keyboardKey}
                  </span>
                )}
                {/* Note Label */}
                {showKeyLabels && (
                  <span className="text-[10px] font-mono font-medium text-neutral-200">
                    {blackKey.label}#
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
