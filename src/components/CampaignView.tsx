/**
 * Campaign & Learning Progression System View for NotaSakti Maestro
 * Level-based curriculum: Notasi Balok (Level 1-6) + Unsur & Prinsip Seni Musik (Level 7-10).
 */

import React, { useState } from 'react';
import { CampaignStage } from '../types/music';
import {
  Star,
  Lock,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  Music,
  CheckCircle2,
  FileQuestion,
} from 'lucide-react';

interface CampaignViewProps {
  stages: CampaignStage[];
  onSelectStage: (stage: CampaignStage) => void;
  onOpenQuizStage: (stage: CampaignStage) => void;
  currentStageId?: number;
}

export const CampaignView: React.FC<CampaignViewProps> = ({
  stages,
  onSelectStage,
  onOpenQuizStage,
  currentStageId,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'notation' | 'art_theory'>('all');

  const filteredStages = stages.filter((stage) => {
    if (filterType === 'notation') return !stage.stageType || stage.stageType === 'sheet_reading';
    if (filterType === 'art_theory') return stage.stageType === 'art_theory_quiz';
    return true;
  });

  const totalStars = stages.reduce((acc, s) => acc + s.stars, 0);
  const unlockedCount = stages.filter((s) => s.unlocked).length;
  const theoryStageCount = stages.filter((s) => s.stageType === 'art_theory_quiz').length;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Curriculum Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
            <BookOpen className="w-4 h-4" />
            <span>KURIKULUM TERPADU: NOTASI BALOK &amp; SENI RUPA</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Mode Petualangan Notasi &amp; Unsur-Prinsip Seni Rupa
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Jelajahi perpaduan visual dan audio: dari membaca not balok di garis paranada hingga menguasai <strong>Unsur Seni Rupa</strong> (Titik, Garis, Bidang, Bentuk 3D, Ruang, Gelap-Terang, Warna, Tekstur) dan <strong>Prinsip Seni Rupa</strong> (Kesatuan, Keseimbangan, Irama, Proporsi, Pusat Perhatian).
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 shrink-0">
          <div>
            <span className="text-[11px] text-slate-500 uppercase block font-medium">Total Bintang</span>
            <span className="text-lg font-bold font-mono text-amber-400 flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400" />
              {totalStars} / {stages.length * 3}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-[11px] text-slate-500 uppercase block font-medium">Tahap Terbuka</span>
            <span className="text-lg font-bold font-mono text-cyan-400">
              {unlockedCount} / {stages.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Segmented Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterType === 'all'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua Tahap (1–10)
          </button>
          <button
            onClick={() => setFilterType('notation')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              filterType === 'notation'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Notasi Balok (Level 1–6)</span>
          </button>
          <button
            onClick={() => setFilterType('art_theory')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              filterType === 'art_theory'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>Unsur &amp; Prinsip Seni Rupa (Level 7–10)</span>
          </button>
        </div>

        <span className="text-xs text-slate-400">
          Menampilkan <strong className="text-slate-200 font-mono">{filteredStages.length}</strong> tahap
        </span>
      </div>

      {/* Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStages.map((stage) => {
          const isSelected = stage.id === currentStageId;
          const isQuiz = stage.stageType === 'art_theory_quiz';

          return (
            <div
              key={stage.id}
              className={`rounded-2xl border transition-all p-5 flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/20 shadow-xl'
                  : isQuiz
                  ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-indigo-900/50 hover:border-indigo-700 shadow-md hover:-translate-y-0.5'
                  : stage.unlocked
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md hover:-translate-y-0.5'
                  : 'bg-slate-950/60 border-slate-900 opacity-60'
              }`}
            >
              {/* Header: Stage Number, Category Badge, Stars */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800/40 px-2 py-0.5 rounded">
                      LEVEL {stage.id}
                    </span>
                    {isQuiz && (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        <span>Kuis Seni</span>
                      </span>
                    )}
                  </div>

                  {stage.unlocked ? (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-4 h-4 ${
                            starIdx <= stage.stars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Lock className="w-3.5 h-3.5" /> Terkunci
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {stage.title}
                </h3>
                <p className="text-xs text-cyan-300/80 font-medium mt-0.5">
                  {stage.subtitle}
                </p>

                <p className="text-xs text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                  {stage.concept}
                </p>

                {/* Target Topics / Notes Chips */}
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                  {isQuiz ? (
                    <>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">Fokus Materi:</span>
                      {stage.quizQuestions?.slice(0, 3).map((q) => (
                        <span
                          key={q.id}
                          className="px-2 py-0.5 bg-indigo-950/60 border border-indigo-800/40 text-indigo-200 font-medium text-[11px] rounded"
                        >
                          {q.topic}
                        </span>
                      ))}
                      {stage.quizQuestions && stage.quizQuestions.length > 3 && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          +{stage.quizQuestions.length - 3} lainnya
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">Not:</span>
                      {stage.targetNotes.map((note) => (
                        <span
                          key={note}
                          className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px] rounded"
                        >
                          {note}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Footer: Stats & Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div>
                  {stage.bestAccuracy > 0 ? (
                    <div className="text-[11px] text-slate-400">
                      <span>Akurasi: </span>
                      <span className="font-mono text-emerald-400 font-bold">{stage.bestAccuracy}%</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      {isQuiz ? `${stage.quizQuestions?.length ?? 5} Pertanyaan` : 'Belum dimainkan'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {isQuiz ? (
                    <>
                      <button
                        disabled={!stage.unlocked}
                        onClick={() => onOpenQuizStage(stage)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-md shadow-amber-500/20"
                      >
                        <FileQuestion className="w-3.5 h-3.5" />
                        <span>Mulai Kuis</span>
                      </button>
                      <button
                        title="Mainkan partitur demonstrasi level ini"
                        onClick={() => onSelectStage(stage)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                      >
                        <Music className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      disabled={!stage.unlocked}
                      onClick={() => onSelectStage(stage)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                        stage.unlocked
                          ? isSelected
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200'
                          : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <span>{isSelected ? 'Sedang Dipilih' : 'Mainkan'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
