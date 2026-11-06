/**
 * Microphone Pitch Detection HUD & Real-time Tuner for NotaSakti Maestro
 * Allows playing by singing, whistling, or playing an acoustic instrument.
 */

import React, { useState, useEffect } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface PitchDetectionHUDProps {
  onDetectedNote: (pitch: string, midi: number) => void;
  targetPitch?: string | null;
}

export const PitchDetectionHUD: React.FC<PitchDetectionHUDProps> = ({
  onDetectedNote,
  targetPitch,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [pitchData, setPitchData] = useState<{
    pitch: string;
    midi: number;
    hz: number;
    cents: number;
    volume: number;
  } | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Debounce note triggers to avoid rapid duplicate triggers
  const [lastTriggeredPitch, setLastTriggeredPitch] = useState<string | null>(null);

  const toggleMic = async () => {
    if (isListening) {
      soundEngine.stopPitchDetection();
      setIsListening(false);
      setPitchData(null);
    } else {
      setPermissionError(null);
      const success = await soundEngine.startPitchDetection((data) => {
        setPitchData(data);
        if (data && data.volume > 0.05) {
          // If note is sustained or matches, trigger
          if (data.pitch !== lastTriggeredPitch) {
            setLastTriggeredPitch(data.pitch);
            onDetectedNote(data.pitch, data.midi);
            setTimeout(() => setLastTriggeredPitch(null), 300);
          }
        }
      });

      if (!success) {
        setPermissionError('Akses mikrofon ditolak atau tidak didukung di browser ini.');
        setIsListening(false);
      } else {
        setIsListening(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      soundEngine.stopPitchDetection();
    };
  }, []);

  const isMatched = pitchData && targetPitch && pitchData.pitch === targetPitch;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMic}
          className={`px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
            isListening
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-slate-400" />}
          <span>{isListening ? 'Mikrofon Aktif (Mendengar)' : 'Aktifkan Mikrofon (Pitch Detection)'}</span>
        </button>

        <span className="text-slate-400 hidden sm:inline">
          {isListening
            ? 'Nyanyikan atau mainkan alat musik akustik (pianika, biola, suling) ke mic!'
            : 'Gunakan suara asli atau instrumen fisik sebagai input.'}
        </span>
      </div>

      {permissionError && (
        <span className="text-rose-400 text-xs">{permissionError}</span>
      )}

      {/* Live Pitch Meter Display */}
      {isListening && (
        <div className="flex items-center gap-4 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          {/* Volume meter */}
          <div className="flex items-center gap-1.5" title="Tingkat Suara Input">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-75"
                style={{ width: `${(pitchData?.volume ?? 0) * 100}%` }}
              />
            </div>
          </div>

          {/* Detected note readout */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Terdeteksi:</span>
            <span
              className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${
                isMatched
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : pitchData
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-500'
              }`}
            >
              {pitchData?.pitch ?? '—'}
            </span>
            <span className="font-mono text-slate-500 text-[11px]">
              {pitchData ? `${pitchData.hz} Hz` : '0 Hz'}
            </span>
          </div>

          {/* Cents deviation needle */}
          {pitchData && (
            <div className="flex items-center gap-1.5" title="Deviasi Nada (-50 cents s/d +50 cents)">
              <span className="text-[10px] text-slate-500 font-mono">♭</span>
              <div className="w-16 h-1.5 bg-slate-800 rounded-full relative overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 w-2 bg-cyan-400 rounded-full -translate-x-1/2 transition-all duration-75"
                  style={{
                    left: `${Math.max(0, Math.min(100, 50 + (pitchData.cents / 50) * 50))}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono">♯</span>
              <span className="font-mono text-[10px] text-slate-400 w-6 text-right">
                {pitchData.cents > 0 ? `+${pitchData.cents}` : pitchData.cents}c
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
