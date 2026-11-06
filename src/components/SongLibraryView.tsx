/**
 * Free Play & Song Library for NotaSakti Maestro
 * Classical, National, and Popular pieces with difficulty, clef, and BPM filters.
 */

import React, { useState } from 'react';
import { SongMetadata, Clef } from '../types/music';
import { Music, Play, Filter, Clock, Disc } from 'lucide-react';

interface SongLibraryViewProps {
  songs: SongMetadata[];
  onSelectSong: (song: SongMetadata) => void;
  currentSongId?: string;
}

export const SongLibraryView: React.FC<SongLibraryViewProps> = ({
  songs,
  onSelectSong,
  currentSongId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Semua');

  const filteredSongs = songs.filter((s) => {
    const matchCat = selectedCategory === 'Semua' || s.category === selectedCategory;
    const matchDiff = selectedDifficulty === 'Semua' || s.difficulty === selectedDifficulty;
    return matchCat && matchDiff;
  });

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
            <Disc className="w-4 h-4" />
            <span>PUSTAKA PARTITUR & FREE PLAY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Katalog Karya Musik Populer & Klasik
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Latih kecepatan membaca not balok Anda dengan karya nyata dari Beethoven, Mozart, Bach, hingga lagu nasional.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {['Semua', 'Klasik', 'Lagu Wajib', 'Populer'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {['Semua', 'Pemula', 'Menengah'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  selectedDifficulty === diff
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Song List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSongs.map((song) => {
          const isSelected = song.id === currentSongId;

          return (
            <div
              key={song.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {song.category}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      song.difficulty === 'Pemula'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : song.difficulty === 'Menengah'
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {song.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  {song.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Komposer: {song.composer}
                </p>

                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-2">
                  {song.description}
                </p>

                {/* Metadata Pills */}
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {song.bpm} BPM
                  </span>
                  <span>·</span>
                  <span>Birama {song.timeSignature[0]}/{song.timeSignature[1]}</span>
                  <span>·</span>
                  <span>{song.keySignature}</span>
                  <span>·</span>
                  <span>{song.notes.length} Not</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {song.clef === 'both' ? 'Grand Staff' : song.clef === 'treble' ? 'Kunci G' : 'Kunci F'}
                </span>
                <button
                  onClick={() => onSelectSong(song)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isSelected ? 'Sedang Dimainkan' : 'Pilih & Mainkan'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
