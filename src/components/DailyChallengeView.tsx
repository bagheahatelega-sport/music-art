/**
 * Daily Sight-Reading Challenge View for NotaSakti Maestro
 * Fresh randomized sight-reading exercises daily with streak rewards.
 */

import React, { useState } from 'react';
import { SongMetadata, Clef } from '../types/music';
import { generateDailyChallenge } from '../data/musicData';
import { Calendar, Flame, Trophy, Play, CheckCircle, RefreshCw } from 'lucide-react';

interface DailyChallengeViewProps {
  onStartChallenge: (song: SongMetadata) => void;
  streakDays: number;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  onStartChallenge,
  streakDays,
}) => {
  const [clef, setClef] = useState<Clef>('treble');
  const [dailySong, setDailySong] = useState<SongMetadata>(() => generateDailyChallenge('treble'));

  const handleClefChange = (newClef: Clef) => {
    setClef(newClef);
    setDailySong(generateDailyChallenge(newClef));
  };

  const handleRegenerate = () => {
    setDailySong(generateDailyChallenge(clef));
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Banner & Streak Summary */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/60 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4" />
              <span>Tantangan Harian Sight-Reading</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Uji Reflek Membaca Notasi Hari Ini
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              12 not acak yang diperbarui setiap hari untuk membangun memori visual instan antara posisi garis/spasi partitur dan jemari Anda.
            </p>
          </div>

          {/* Daily Streak Badge */}
          <div className="flex items-center gap-4 bg-slate-950/80 backdrop-blur border border-amber-500/30 px-5 py-3.5 rounded-2xl shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Flame className="w-7 h-7 fill-amber-500 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Rentetan Latihan</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-amber-400">{streakDays}</span>
                <span className="text-xs text-slate-300 font-semibold">Hari Berturut-turut!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-white">
            {dailySong.title}
          </h3>
          <p className="text-sm text-slate-400">
            {dailySong.description}
          </p>

          {/* Clef Selector */}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-400 font-medium">Pilih Kunci:</span>
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => handleClefChange('treble')}
                className={`px-3 py-1.5 rounded-md font-semibold transition ${
                  clef === 'treble' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Kunci G (Treble)
              </button>
              <button
                onClick={() => handleClefChange('bass')}
                className={`px-3 py-1.5 rounded-md font-semibold transition ${
                  clef === 'bass' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Kunci F (Bass)
              </button>
            </div>

            <button
              onClick={handleRegenerate}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              title="Acak Ulang Soal Harian"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Start Button */}
        <div className="w-full md:w-auto flex flex-col items-center gap-2">
          <button
            onClick={() => onStartChallenge(dailySong)}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 text-sm transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Mulai Tantangan Hari Ini</span>
          </button>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            Raih Akurasi &gt; 90% untuk Mempertahankan Streak
          </span>
        </div>
      </div>
    </div>
  );
};
