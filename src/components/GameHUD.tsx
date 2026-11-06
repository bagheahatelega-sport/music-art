/**
 * Rhythm Game HUD for NotaSakti Maestro
 * Displays score, combo streak, hit rating banner (Benar/Salah), accuracy, and audio sound test controls.
 */

import React from 'react';
import { HitRating, PlayMode, InputMethod } from '../types/music';
import { soundEngine } from '../audio/soundEngine';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  XCircle,
  Sparkles,
  Music,
} from 'lucide-react';

interface GameHUDProps {
  score: number;
  combo: number;
  highestCombo: number;
  totalNotes: number;
  completedNotes: number;
  lastRating: HitRating | null;
  lastDeltaMs: number | null;
  playMode: PlayMode;
  inputMethod: InputMethod;
  bpm: number;
  isPlaying: boolean;
  isMetronomeOn: boolean;
  accuracy: number;
  onTogglePlay: () => void;
  onRestart: () => void;
  onToggleMetronome: () => void;
  onChangeBpm: (newBpm: number) => void;
  onChangePlayMode: (mode: PlayMode) => void;
  onChangeInputMethod: (method: InputMethod) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  combo,
  highestCombo,
  totalNotes,
  completedNotes,
  lastRating,
  lastDeltaMs,
  playMode,
  inputMethod,
  bpm,
  isPlaying,
  isMetronomeOn,
  accuracy,
  onTogglePlay,
  onRestart,
  onToggleMetronome,
  onChangeBpm,
  onChangePlayMode,
  onChangeInputMethod,
}) => {
  const progressPercent = totalNotes > 0 ? Math.min(100, Math.round((completedNotes / totalNotes) * 100)) : 0;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Skor Total</span>
          <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Combo */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Rangkaian Combo</span>
            {combo >= 5 && <Flame className="w-4 h-4 text-amber-500 animate-bounce" />}
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-black font-mono tabular-nums ${
                combo >= 10 ? 'text-amber-400' : combo >= 5 ? 'text-cyan-400' : 'text-slate-200'
              }`}
            >
              {combo}x
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Max: {highestCombo}x</span>
          </div>
        </div>

        {/* Akurasi */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Akurasi Timing</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {accuracy}%
          </span>
        </div>

        {/* Not Selesai / Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Kemajuan Partitur</span>
            <span className="font-mono text-slate-300">{completedNotes}/{totalNotes}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Floating Hit Feedback Rating Overlay (BENAR vs SALAH) */}
      {lastRating && (
        <div className="w-full flex items-center justify-center -my-1">
          <div
            className={`px-5 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-black tracking-wider uppercase shadow-xl transition-all animate-in fade-in zoom-in-95 duration-150 ${
              lastRating === 'PERFECT'
                ? 'bg-emerald-500/25 text-emerald-300 border-2 border-emerald-500/50 shadow-emerald-500/20'
                : lastRating === 'GOOD'
                ? 'bg-cyan-500/25 text-cyan-300 border-2 border-cyan-500/50 shadow-cyan-500/20'
                : 'bg-rose-500/30 text-rose-300 border-2 border-rose-500/60 shadow-rose-500/20 animate-pulse'
            }`}
          >
            {lastRating === 'PERFECT' ? (
              <>
                <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>NADA BENAR! (PERFECT)</span>
              </>
            ) : lastRating === 'GOOD' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>NADA BENAR! (GOOD)</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>NADA SALAH! (MISS)</span>
              </>
            )}

            {lastDeltaMs !== null && (
              <span className="font-mono text-[10px] lowercase font-normal opacity-85 ml-1">
                ({lastDeltaMs > 0 ? `+${lastDeltaMs}` : lastDeltaMs}ms)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Controls, Mode Switches, and Audio Test Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Play / Restart / Metronome */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-md shadow-cyan-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Jeda (Pause)' : 'Mulai (Play)'}</span>
          </button>

          <button
            onClick={onRestart}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Ulangi dari Awal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMetronome}
            className={`px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 transition ${
              isMetronomeOn ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
            title="Metronom Ketukan Audio"
          >
            {isMetronomeOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>Metronom</span>
          </button>
        </div>

        {/* Audio Soundbar Tester (Tes Piano, Benar, Salah) */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-semibold px-1 hidden md:inline">Uji Suara:</span>
          <button
            onClick={() => soundEngine.testAudio('piano')}
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 transition flex items-center gap-1 text-[11px]"
            title="Tes Suara Piano (Middle C C4)"
          >
            <Music className="w-3 h-3 text-cyan-400" />
            <span>Suara Piano</span>
          </button>
          <button
            onClick={() => soundEngine.testAudio('correct')}
            className="px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 transition flex items-center gap-1 text-[11px]"
            title="Tes Sound Efek Jawaban Benar (Chime)"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Sound Benar</span>
          </button>
          <button
            onClick={() => soundEngine.testAudio('wrong')}
            className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 transition flex items-center gap-1 text-[11px]"
            title="Tes Sound Efek Jawaban Salah (Buzzer Tet-Tot)"
          >
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>Sound Salah</span>
          </button>
        </div>

        {/* BPM Slider */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400">Tempo:</span>
          <span className="font-mono text-cyan-400 font-bold w-12">{bpm} BPM</span>
          <input
            type="range"
            min="40"
            max="160"
            step="2"
            value={bpm}
            onChange={(e) => onChangeBpm(Number(e.target.value))}
            className="w-20 accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Mode & Input Switches */}
        <div className="flex items-center gap-2">
          {/* Mode Latihan: Wait Mode vs Rhythm Mode */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onChangePlayMode('WAIT_MODE')}
              className={`px-2.5 py-1 rounded text-xs transition ${
                playMode === 'WAIT_MODE'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Lagu berhenti sampai not yang tepat ditekan"
            >
              Wait Mode
            </button>
            <button
              onClick={() => onChangePlayMode('RHYTHM_MODE')}
              className={`px-2.5 py-1 rounded text-xs transition ${
                playMode === 'RHYTHM_MODE'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kecepatan normal dengan penilaian timing ritme"
            >
              Rhythm Mode
            </button>
          </div>

          {/* Input Method Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['PIANO', 'RHYTHM_TAP'] as InputMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => onChangeInputMethod(m)}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  inputMethod === m
                    ? 'bg-slate-800 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 'PIANO' ? 'Piano Tuts' : 'Ketukan Ritme'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
