/**
 * Interactive Art & Music Theory Quiz for NotaSakti Maestro
 * Unsur dan Prinsip Seni Musik dengan feedback suara BENAR & SALAH instan
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArtQuestion } from '../types/music';
import { soundEngine } from '../audio/soundEngine';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Star,
  Award,
  BookOpen,
} from 'lucide-react';

interface ArtTheoryQuizModalProps {
  stageTitle: string;
  stageSubtitle: string;
  questions: ArtQuestion[];
  onCompleteQuiz: (starsEarned: number, score: number, accuracy: number) => void;
  onClose: () => void;
}

export const ArtTheoryQuizModal: React.FC<ArtTheoryQuizModalProps> = ({
  stageTitle,
  stageSubtitle,
  questions,
  onCompleteQuiz,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      soundEngine.playCorrectSound();
      setScore((s) => s + 100);
      setCorrectCount((c) => c + 1);
    } else {
      soundEngine.playWrongSound();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz Finished!
      setIsFinished(true);
      const totalQ = questions.length;
      const accuracy = Math.round((correctCount / totalQ) * 100);

      let stars = 1;
      if (accuracy >= 80) stars = 3;
      else if (accuracy >= 60) stars = 2;

      if (stars >= 2) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      onCompleteQuiz(stars, score + (selectedOption === currentQ.correctIndex ? 100 : 0), accuracy);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setCorrectCount(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    let stars = 1;
    if (accuracy >= 80) stars = 3;
    else if (accuracy >= 60) stars = 2;

    return (
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-3xl mb-4">
            🎓
          </div>

          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Kuis Teori Seni Selesai
          </span>
          <h3 className="text-2xl font-black text-white tracking-tight mt-1">
            {stageTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Anda telah menyelesaikan seluruh pertanyaan materi unsur &amp; prinsip seni.
          </p>

          {/* Stars Earned */}
          <div className="flex items-center gap-2 my-5">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-8 h-8 ${
                  starIdx <= stars
                    ? 'text-amber-400 fill-amber-400 animate-bounce'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Results Summary */}
          <div className="w-full grid grid-cols-3 gap-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800 my-2">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-medium">Akurasi</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{accuracy}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-medium">Jawaban Benar</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{correctCount} / {questions.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-medium">Skor Teori</span>
              <span className="text-xl font-bold font-mono text-amber-400">{score}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full mt-6">
            <button
              onClick={handleRestart}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Kuis</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-cyan-500/20"
            >
              Simpan &amp; Lanjut
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentCorrect = selectedOption === currentQ.correctIndex;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-slate-950/80 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold font-mono">
              {currentQ.symbol || '🎨'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                  {currentQ.category}
                </span>
                <span className="text-xs text-slate-400 font-medium">· {currentQ.topic}</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                {stageTitle}
              </h3>
            </div>
          </div>

          {/* Question Counter */}
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Soal</span>
            <span className="text-sm font-bold font-mono text-cyan-400">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* Question Body */}
        <div className="p-6 flex flex-col gap-5">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
            <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isTargetCorrect = idx === currentQ.correctIndex;

              let btnStyle = 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 text-slate-200';

              if (isAnswered) {
                if (isTargetCorrect) {
                  btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 ring-2 ring-rose-500/30';
                } else {
                  btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-50';
                }
              }

              const optionLetters = ['A', 'B', 'C', 'D'];

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-xl border text-left transition-all duration-150 flex items-start gap-3 text-xs sm:text-sm font-medium ${btnStyle}`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isAnswered && isTargetCorrect
                        ? 'bg-emerald-500 text-slate-950'
                        : isAnswered && isSelected
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {optionLetters[idx]}
                  </span>
                  <span className="flex-1 mt-0.5">{opt}</span>

                  {isAnswered && isTargetCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isTargetCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Instant Pedagogical Explanation Banner */}
          {isAnswered && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm animate-in fade-in duration-200 flex flex-col gap-1.5 ${
                isCurrentCorrect
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
                {isCurrentCorrect ? (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                    <span className="text-emerald-400">JAWABAN BENAR! (CHIME SOUND DIBUNYIKAN)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-400">JAWABAN KURANG TEPAT (BUZZER SALAH DIBUNYIKAN)</span>
                  </>
                )}
              </div>
              <p className="text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950/80 border-t border-slate-800 p-4 px-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Tutup Kuis
          </button>

          {isAnswered && (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20"
            >
              <span>{currentIndex + 1 < questions.length ? 'Pertanyaan Berikutnya' : 'Lihat Hasil Kuis'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
