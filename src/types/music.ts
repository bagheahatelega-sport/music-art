/**
 * Music Theory and Game Types for NotaSakti Maestro
 */

export type Clef = 'treble' | 'bass';

export type NoteDuration = number; // e.g. 4 (whole), 3 (dotted half), 2 (half), 1.5 (dotted quarter), 1 (quarter), 0.5 (eighth)

export type Accidental = '#' | 'b' | 'n' | null;

export interface NoteInfo {
  id: string;
  pitch: string; // e.g. "C4", "D4", "F#4", "Bb3"
  step: string;  // "C", "D", "E", "F", "G", "A", "B"
  octave: number; // 3, 4, 5
  accidental?: Accidental;
  midi: number;  // C4 = 60
  duration: NoteDuration; // in beats
  beatOffset: number; // absolute beat timing in measure/song
  clef: Clef;
  solfege?: string; // "Do", "Re", "Mi", etc.
  lyric?: string;
  hand?: 'left' | 'right';
  measure?: number;
}

export type HitRating = 'PERFECT' | 'GOOD' | 'MISS' | 'NONE';

export interface HitResult {
  id: string;
  rating: HitRating;
  targetPitch: string;
  playedPitch: string | null;
  deltaMs: number;
  score: number;
  combo: number;
  timestamp: number;
}

export type PlayMode = 'WAIT_MODE' | 'RHYTHM_MODE';
export type InputMethod = 'PIANO' | 'MICROPHONE' | 'RHYTHM_TAP' | 'MIDI';

export interface SongMetadata {
  id: string;
  title: string;
  composer: string;
  category: 'Latihan' | 'Klasik' | 'Lagu Wajib' | 'Populer';
  difficulty: 'Pemula' | 'Menengah' | 'Mahir';
  clef: Clef | 'both';
  bpm: number;
  timeSignature: [number, number]; // e.g. [4, 4] or [3, 4]
  keySignature: string; // e.g. "C Mayor", "G Mayor (1#)", "F Mayor (1b)"
  description: string;
  notes: NoteInfo[];
}

export interface ArtQuestion {
  id: string;
  category: 'Unsur Seni Rupa' | 'Prinsip Seni Rupa' | 'Korelasi Rupa & Musik' | string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  audioSampleMidi?: number;
  symbol?: string;
  visualHint?: string;
}

export interface CampaignStage {
  id: number;
  title: string;
  subtitle: string;
  clef: Clef | 'both';
  concept: string;
  targetNotes: string[];
  song: SongMetadata;
  unlocked: boolean;
  stars: number; // 0 to 3
  highScore: number;
  bestAccuracy: number;
  stageType?: 'sheet_reading' | 'art_theory_quiz';
  quizQuestions?: ArtQuestion[];
}

export interface UserStats {
  totalNotesPlayed: number;
  perfectHits: number;
  goodHits: number;
  missHits: number;
  highestCombo: number;
  streakDays: number;
  lastPlayedDate: string;
  campaignStars: number;
  noteAccuracy: Record<string, { total: number; correct: number; avgLatencyMs: number }>;
  clefStats: {
    treble: { total: number; correct: number };
    bass: { total: number; correct: number };
  };
}
