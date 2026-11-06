/**
 * Profile & Note Recognition Analytics for NotaSakti Maestro
 * Diagnostic heatmap, latency breakdown, clef proficiency, and achievement badges.
 */

import React from 'react';
import { UserStats } from '../types/music';
import { BarChart3, Award, Zap, Activity, ShieldCheck, Flame } from 'lucide-react';

interface ProfileStatsViewProps {
  stats: UserStats;
}

export const ProfileStatsView: React.FC<ProfileStatsViewProps> = ({ stats }) => {
  const totalHits = stats.perfectHits + stats.goodHits + stats.missHits;
  const overallAccuracy = totalHits > 0 ? Math.round(((stats.perfectHits + stats.goodHits) / totalHits) * 100) : 0;

  const badges = [
    {
      id: 'b1',
      title: 'Pionir Middle C',
      desc: 'Mengenali posisi C4 pada garis bantu lebih dari 30 kali',
      icon: '🎹',
      unlocked: (stats.noteAccuracy['C4']?.total ?? 0) >= 30,
    },
    {
      id: 'b2',
      title: 'Rhythm Virtuoso',
      desc: 'Mencapai rangkaian combo di atas 25x tanpa putus',
      icon: '🔥',
      unlocked: stats.highestCombo >= 25,
    },
    {
      id: 'b3',
      title: 'Penjelajah Kunci Bass',
      desc: 'Berhasil membaca nada pada Kunci F (Bass Clef)',
      icon: '⚓',
      unlocked: stats.clefStats.bass.correct >= 10,
    },
    {
      id: 'b4',
      title: 'Konsistensi Maestro',
      desc: 'Menjaga streak latihan harian minimal 3 hari',
      icon: '🏆',
      unlocked: stats.streakDays >= 3,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <span className="text-xs text-slate-400 font-medium uppercase">Total Not Dimainkan</span>
          <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
            {stats.totalNotesPlayed.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">Sepanjang waktu</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <span className="text-xs text-slate-400 font-medium uppercase">Akurasi Rata-rata</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {overallAccuracy}%
          </span>
          <span className="text-[11px] text-emerald-500/80 mt-0.5">Tingkat Masteri Baik</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <span className="text-xs text-slate-400 font-medium uppercase">Rekor Combo Tertinggi</span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {stats.highestCombo}x
          </span>
          <span className="text-[11px] text-amber-500/80 mt-0.5">Tanpa meleset</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <span className="text-xs text-slate-400 font-medium uppercase">Rentetan Latihan</span>
          <span className="text-2xl font-bold font-mono text-indigo-400 mt-1 tabular-nums flex items-center gap-1">
            {stats.streakDays} Hari
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 inline" />
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">Pertahankan streak!</span>
        </div>
      </div>

      {/* Note Recognition Heatmap & Diagnostic */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase">
            <Activity className="w-4 h-4" />
            <span>Peta Diagnostik Daya Baca Not (Recognition Heatmap)</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            Analisis Kecepatan & Presisi Reflek Tiap Not
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Menunjukkan seberapa cepat dan akurat Anda mengenali masing-masing not balok di paranada. Not dengan waktu reaksi di atas 75ms dianjurkan untuk dilatih ulang di Wait Mode.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 pt-2">
          {Object.entries(stats.noteAccuracy).map(([pitch, item]) => {
            const acc = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
            const isHighAccuracy = acc >= 90;
            const isMediumAccuracy = acc >= 75;

            return (
              <div
                key={pitch}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col items-center text-center justify-between"
              >
                <span className="font-mono text-base font-bold text-white mb-1">
                  {pitch}
                </span>

                <div
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold mb-1.5 ${
                    isHighAccuracy
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isMediumAccuracy
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {acc}%
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
                  <span>{item.avgLatencyMs}ms</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clef Proficiency Comparison & Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Treble vs Bass Clef Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Kemahiran Kunci G vs Kunci F
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Perbandingan reflek tangan kanan (Kunci G) dengan tangan kiri (Kunci F).
            </p>
          </div>

          <div className="space-y-4 my-4">
            {/* Treble */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>𝄞 Kunci G (Treble Clef)</span>
                <span className="font-mono text-cyan-400">
                  {stats.clefStats.treble.total > 0
                    ? Math.round((stats.clefStats.treble.correct / stats.clefStats.treble.total) * 100)
                    : 0}
                  % ({stats.clefStats.treble.correct}/{stats.clefStats.treble.total})
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full"
                  style={{
                    width: `${
                      stats.clefStats.treble.total > 0
                        ? (stats.clefStats.treble.correct / stats.clefStats.treble.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Bass */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>𝄢 Kunci F (Bass Clef)</span>
                <span className="font-mono text-indigo-400">
                  {stats.clefStats.bass.total > 0
                    ? Math.round((stats.clefStats.bass.correct / stats.clefStats.bass.total) * 100)
                    : 0}
                  % ({stats.clefStats.bass.correct}/{stats.clefStats.bass.total})
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{
                    width: `${
                      stats.clefStats.bass.total > 0
                        ? (stats.clefStats.bass.correct / stats.clefStats.bass.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
            💡 Tips: Kebanyakan pemula mahir di Kunci G namun ragu di Kunci F. Latihlah Level 3 di Mode Petualangan untuk menyeimbangkan reflek kedua tangan!
          </div>
        </div>

        {/* Badges & Achievements */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Lencana Pencapaian Musik
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Buka lencana kehormatan dengan menyelesaikan tantangan sight-reading.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 rounded-xl border flex flex-col gap-1.5 transition ${
                  badge.unlocked
                    ? 'bg-slate-950/80 border-amber-500/30'
                    : 'bg-slate-950/40 border-slate-800 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{badge.icon}</span>
                  {badge.unlocked ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Diraih
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">Terkunci</span>
                  )}
                </div>
                <h5 className="text-xs font-bold text-white">{badge.title}</h5>
                <p className="text-[11px] text-slate-400 leading-tight">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
