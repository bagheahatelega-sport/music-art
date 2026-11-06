/**
 * NotaSakti Maestro - Interactive Educational Rhythm Music Game
 * Complete Sight-Reading & Rhythm Notation Learning Engine
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  NoteInfo,
  SongMetadata,
  CampaignStage,
  PlayMode,
  InputMethod,
  HitRating,
  UserStats,
} from './types/music';
import {
  CAMPAIGN_STAGES,
  SONG_LIBRARY,
  INITIAL_USER_STATS,
} from './data/musicData';
import { soundEngine, pitchToMidi } from './audio/soundEngine';
import { StaffRenderer } from './components/StaffRenderer';
import { PianoKeyboard } from './components/PianoKeyboard';
import { RhythmTapPad } from './components/RhythmTapPad';
import { PitchDetectionHUD } from './components/PitchDetectionHUD';
import { GameHUD } from './components/GameHUD';
import { CampaignView } from './components/CampaignView';
import { SongLibraryView } from './components/SongLibraryView';
import { DailyChallengeView } from './components/DailyChallengeView';
import { ProfileStatsView } from './components/ProfileStatsView';
import { GDDDocumentViewer } from './components/GDDDocumentViewer';
import { ArtTheoryQuizModal } from './components/ArtTheoryQuizModal';

import {
  Music4,
  BookOpen,
  Calendar,
  Disc,
  BarChart2,
  FileText,
  Star,
  CheckCircle,
  HelpCircle,
  Eye,
  Settings,
} from 'lucide-react';

export default function App() {
  // Navigation tabs: 'play' | 'campaign' | 'daily' | 'library' | 'stats' | 'gdd'
  const [activeTab, setActiveTab] = useState<
    'play' | 'campaign' | 'daily' | 'library' | 'stats' | 'gdd'
  >('play');

  // Curriculum and songs state
  const [campaignStages, setCampaignStages] = useState<CampaignStage[]>(CAMPAIGN_STAGES);
  const [currentSong, setCurrentSong] = useState<SongMetadata>(CAMPAIGN_STAGES[0].song);
  const [currentStageId, setCurrentStageId] = useState<number>(1);

  // Gameplay state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playMode, setPlayMode] = useState<PlayMode>('WAIT_MODE'); // Start in Wait Mode for friendly learning
  const [inputMethod, setInputMethod] = useState<InputMethod>('PIANO');
  const [bpm, setBpm] = useState<number>(CAMPAIGN_STAGES[0].song.bpm);
  const [isMetronomeOn, setIsMetronomeOn] = useState<boolean>(false);

  // Time & Note tracking
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number>(0);
  const [completedNoteIds, setCompletedNoteIds] = useState<Set<string>>(new Set());

  // Scoring & Stats
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [highestCombo, setHighestCombo] = useState<number>(0);
  const [perfectCount, setPerfectCount] = useState<number>(0);
  const [goodCount, setGoodCount] = useState<number>(0);
  const [missCount, setMissCount] = useState<number>(0);
  const [lastRating, setLastRating] = useState<HitRating | null>(null);
  const [lastDeltaMs, setLastDeltaMs] = useState<number | null>(null);
  const [lastHitNoteId, setLastHitNoteId] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_USER_STATS);

  // Visual aids toggles
  const [showNoteNames, setShowNoteNames] = useState<boolean>(true);
  const [showSolfege, setShowSolfege] = useState<boolean>(false);
  const [highlightTargetKeys, setHighlightTargetKeys] = useState<boolean>(true);

  // Level Complete Modal
  const [isLevelFinished, setIsLevelFinished] = useState<boolean>(false);
  const [finishedStars, setFinishedStars] = useState<number>(0);

  // Active Quiz Modal for Unsur & Prinsip Seni
  const [activeQuizStage, setActiveQuizStage] = useState<CampaignStage | null>(null);

  // External MIDI input
  const [activeExternalMidi, setActiveExternalMidi] = useState<number | null>(null);

  // Animation frame loop refs
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentBeatRef = useRef<number>(currentBeat);
  currentBeatRef.current = currentBeat;

  const activeNoteIndexRef = useRef<number>(activeNoteIndex);
  activeNoteIndexRef.current = activeNoteIndex;

  const currentSongRef = useRef<SongMetadata>(currentSong);
  currentSongRef.current = currentSong;

  const playModeRef = useRef<PlayMode>(playMode);
  playModeRef.current = playMode;

  const bpmRef = useRef<number>(bpm);
  bpmRef.current = bpm;

  const completedNotesRef = useRef<Set<string>>(completedNoteIds);
  completedNotesRef.current = completedNoteIds;

  // Active target note
  const activeNote: NoteInfo | undefined = currentSong.notes[activeNoteIndex];

  // ----------------------------------------------------
  // METRONOME TICK DISPATCHER
  // ----------------------------------------------------
  const lastMetronomeBeatRef = useRef<number>(-1);
  useEffect(() => {
    if (!isPlaying || !isMetronomeOn) return;
    const floorBeat = Math.floor(currentBeat);
    if (floorBeat !== lastMetronomeBeatRef.current && floorBeat >= 0) {
      lastMetronomeBeatRef.current = floorBeat;
      const isDownbeat = floorBeat % currentSong.timeSignature[0] === 0;
      soundEngine.playMetronome(isDownbeat);
    }
  }, [currentBeat, isPlaying, isMetronomeOn, currentSong]);

  // ----------------------------------------------------
  // HIT EVALUATION FUNCTION
  // ----------------------------------------------------
  const evaluateHit = useCallback(
    (playedPitch: string | null, playedMidi: number | null, isRhythmTap: boolean = false) => {
      const song = currentSongRef.current;
      const beat = currentBeatRef.current;
      const noteIdx = activeNoteIndexRef.current;
      const note = song.notes[noteIdx];

      if (!note) return;

      const secondsPerBeat = 60 / bpmRef.current;
      const beatDelta = beat - note.beatOffset;
      const deltaMs = Math.round(beatDelta * secondsPerBeat * 1000);

      const targetMidi = pitchToMidi(note.pitch);
      const isPitchCorrect = isRhythmTap || (playedMidi !== null && playedMidi === targetMidi);

      let rating: HitRating = 'NONE';
      const absDelta = Math.abs(deltaMs);

      if (playModeRef.current === 'WAIT_MODE') {
        // In Wait Mode, if pitch matches, it's always PERFECT
        if (isPitchCorrect) {
          rating = 'PERFECT';
        } else {
          rating = 'MISS';
        }
      } else {
        // In Rhythm Mode, verify timing window
        if (!isPitchCorrect) {
          rating = 'MISS';
        } else if (absDelta <= 75) {
          rating = 'PERFECT';
        } else if (absDelta <= 180) {
          rating = 'GOOD';
        } else {
          rating = 'MISS';
        }
      }

      // Play Feedback Sound
      soundEngine.playHitSound(rating);

      // Visual feedback state
      setLastRating(rating);
      setLastDeltaMs(deltaMs);
      setLastHitNoteId(note.id);

      // Update Scoring & Combo
      if (rating === 'PERFECT' || rating === 'GOOD') {
        const baseScore = rating === 'PERFECT' ? 100 : 50;
        setCombo((prevCombo) => {
          const nextCombo = prevCombo + 1;
          setHighestCombo((h) => Math.max(h, nextCombo));
          setScore((s) => s + baseScore * nextCombo);

          // Milestone Celebration
          if (nextCombo === 10 || nextCombo === 25 || nextCombo === 50) {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
            });
          }
          return nextCombo;
        });

        if (rating === 'PERFECT') setPerfectCount((p) => p + 1);
        else setGoodCount((g) => g + 1);

        // Mark note completed
        setCompletedNoteIds((prev) => new Set(prev).add(note.id));

        // Advance to next note
        const nextIdx = noteIdx + 1;
        if (nextIdx < song.notes.length) {
          setActiveNoteIndex(nextIdx);
        } else {
          // Finished song!
          handleFinishSong();
        }
      } else {
        // MISS
        setCombo(0);
        setMissCount((m) => m + 1);
      }
    },
    []
  );

  // ----------------------------------------------------
  // NOTE TRIGGER HANDLER (From Piano, Mic, or Keyboard)
  // ----------------------------------------------------
  const handleUserNoteTrigger = useCallback(
    (pitch: string, midi: number, fromMicOrMidi: boolean = false) => {
      if (fromMicOrMidi) {
        soundEngine.playNote(midi);
      }
      if (!isPlaying) {
        setIsPlaying(true);
      }
      evaluateHit(pitch, midi, false);
    },
    [isPlaying, evaluateHit]
  );

  // Rhythm Tap Pad Handler
  const handleRhythmTap = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
    evaluateHit(null, null, true);
  }, [isPlaying, evaluateHit]);

  // ----------------------------------------------------
  // WEB MIDI API HOOKUP
  // ----------------------------------------------------
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator) {
      (navigator as unknown as { requestMIDIAccess: () => Promise<{ inputs: Map<string, { onmidimessage: ((event: { data: Uint8Array }) => void) | null }> }> })
        .requestMIDIAccess()
        .then(
          (midiAccess) => {
            midiAccess.inputs.forEach((input) => {
              input.onmidimessage = (event: { data: Uint8Array }) => {
                const [status, noteNumber, velocity] = event.data;
                const command = status >> 4;
                if (command === 9 && velocity > 0) {
                  // Note ON
                  setActiveExternalMidi(noteNumber);
                  const stepNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                  const step = stepNames[noteNumber % 12];
                  const oct = Math.floor(noteNumber / 12) - 1;
                  handleUserNoteTrigger(`${step}${oct}`, noteNumber, true);
                }
              };
            });
          },
          () => {
            // MIDI not available or permission declined
          }
        );
    }
  }, [handleUserNoteTrigger]);

  // ----------------------------------------------------
  // LEVEL FINISH HANDLER
  // ----------------------------------------------------
  const handleFinishSong = () => {
    setIsPlaying(false);
    setIsLevelFinished(true);

    const total = perfectCount + goodCount + missCount + 1;
    const correct = perfectCount + goodCount + 1;
    const finalAccuracy = Math.round((correct / total) * 100);

    let starsEarned = 1;
    if (finalAccuracy >= 95) starsEarned = 3;
    else if (finalAccuracy >= 85) starsEarned = 2;
    setFinishedStars(starsEarned);

    // Trigger celebration confetti
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
    });

    // Unlock next stage if in Campaign
    if (currentStageId) {
      setCampaignStages((prevStages) =>
        prevStages.map((stage) => {
          if (stage.id === currentStageId) {
            return {
              ...stage,
              stars: Math.max(stage.stars, starsEarned),
              bestAccuracy: Math.max(stage.bestAccuracy, finalAccuracy),
              highScore: Math.max(stage.highScore, score),
            };
          }
          if (stage.id === currentStageId + 1) {
            return { ...stage, unlocked: true };
          }
          return stage;
        })
      );
    }
  };

  // ----------------------------------------------------
  // ART THEORY QUIZ COMPLETION HANDLER
  // ----------------------------------------------------
  const handleCompleteQuiz = (starsEarned: number, quizScore: number, accuracy: number) => {
    if (!activeQuizStage) return;
    const stageId = activeQuizStage.id;

    setCampaignStages((prevStages) =>
      prevStages.map((stage) => {
        if (stage.id === stageId) {
          return {
            ...stage,
            stars: Math.max(stage.stars, starsEarned),
            highScore: Math.max(stage.highScore, quizScore),
            bestAccuracy: Math.max(stage.bestAccuracy, accuracy),
          };
        }
        if (stage.id === stageId + 1 && accuracy >= 60) {
          return { ...stage, unlocked: true };
        }
        return stage;
      })
    );

    setUserStats((prev) => ({
      ...prev,
      campaignStars: prev.campaignStars + starsEarned,
    }));
  };

  // ----------------------------------------------------
  // GAMEPLAY ANIMATION TICK LOOP
  // ----------------------------------------------------
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (isPlayingRef.current) {
        const beatsPerSecond = bpmRef.current / 60;
        const currentB = currentBeatRef.current;
        const song = currentSongRef.current;
        const noteIdx = activeNoteIndexRef.current;
        const targetNote = song.notes[noteIdx];

        if (playModeRef.current === 'WAIT_MODE') {
          // WAIT MODE:
          // Advance smoothly toward the next target note.
          // Once the playhead arrives at the target note beat offset, freeze until played!
          if (targetNote) {
            if (currentB < targetNote.beatOffset) {
              const nextBeat = Math.min(targetNote.beatOffset, currentB + deltaTime * beatsPerSecond);
              setCurrentBeat(nextBeat);
            }
            // If already at target note, pause progression and wait for user input!
          } else {
            setCurrentBeat((b) => b + deltaTime * beatsPerSecond);
          }
        } else {
          // RHYTHM MODE:
          // Continuous tempo scrolling.
          const nextBeat = currentB + deltaTime * beatsPerSecond;
          setCurrentBeat(nextBeat);

          // If a note has scrolled past the target hit window (> +180ms late), count as MISS
          if (targetNote) {
            const secondsPerBeat = 60 / bpmRef.current;
            const deltaMs = (nextBeat - targetNote.beatOffset) * secondsPerBeat * 1000;
            if (deltaMs > 200 && !completedNotesRef.current.has(targetNote.id)) {
              // Note was missed!
              soundEngine.playHitSound('MISS');
              setLastRating('MISS');
              setLastDeltaMs(Math.round(deltaMs));
              setLastHitNoteId(targetNote.id);
              setCombo(0);
              setMissCount((m) => m + 1);

              // Auto advance to next note
              const nextIdx = noteIdx + 1;
              if (nextIdx < song.notes.length) {
                setActiveNoteIndex(nextIdx);
              } else {
                handleFinishSong();
              }
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ----------------------------------------------------
  // RESTART / SELECT SONG
  // ----------------------------------------------------
  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentBeat(0);
    setActiveNoteIndex(0);
    setCompletedNoteIds(new Set());
    setScore(0);
    setCombo(0);
    setPerfectCount(0);
    setGoodCount(0);
    setMissCount(0);
    setLastRating(null);
    setLastDeltaMs(null);
    setLastHitNoteId(null);
    setIsLevelFinished(false);
  };

  const handleSelectSong = (song: SongMetadata, stageId?: number) => {
    setCurrentSong(song);
    setBpm(song.bpm);
    if (stageId) setCurrentStageId(stageId);
    handleRestart();
    setActiveTab('play');
  };

  // Accuracy calculation
  const totalAttempted = perfectCount + goodCount + missCount;
  const currentAccuracy = totalAttempted > 0 ? Math.round(((perfectCount + goodCount) / totalAttempted) * 100) : 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ----------------- TOP BAR CONTRACT ----------------- */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('play')}
          className="text-lg font-black tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition text-left"
        >
          <span className="text-xl">𝄞</span>
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            NotaSakti Maestro
          </span>
        </button>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setActiveTab('play')}
            className={`hover:text-white transition whitespace-nowrap shrink-0 pb-1 ${
              activeTab === 'play' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''
            }`}
          >
            Studio Bermain
          </button>
          <button
            onClick={() => setActiveTab('campaign')}
            className={`hover:text-white transition whitespace-nowrap shrink-0 pb-1 ${
              activeTab === 'campaign' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''
            }`}
          >
            Mode Petualangan
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`hover:text-white transition whitespace-nowrap shrink-0 pb-1 ${
              activeTab === 'daily' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''
            }`}
          >
            Tantangan Harian
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`hover:text-white transition whitespace-nowrap shrink-0 pb-1 ${
              activeTab === 'library' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''
            }`}
          >
            Pustaka Partitur
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`hover:text-white transition whitespace-nowrap shrink-0 pb-1 ${
              activeTab === 'stats' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''
            }`}
          >
            Statistik Reflek
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('gdd')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'gdd'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dokumen GDD & Arsitektur</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex items-center justify-around bg-slate-900 border-b border-slate-800 px-2 py-2 text-xs overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('play')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            activeTab === 'play' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
          }`}
        >
          Studio
        </button>
        <button
          onClick={() => setActiveTab('campaign')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            activeTab === 'campaign' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
          }`}
        >
          Petualangan
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            activeTab === 'daily' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
          }`}
        >
          Harian
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            activeTab === 'library' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
          }`}
        >
          Pustaka
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            activeTab === 'stats' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
          }`}
        >
          Statistik
        </button>
      </div>

      {/* ----------------- MAIN VIEWPORT CONTAINER ----------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* TAB 1: STUDIO BERMAIN (CORE GAMEPLAY) */}
        {activeTab === 'play' && (
          <div className="flex flex-col gap-5">
            {/* Song Title & Quick Description */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold">
                  <span>Partitur Aktif:</span>
                  <span className="font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                    {currentSong.category} · {currentSong.difficulty}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                  {currentSong.title}
                </h2>
                <p className="text-xs text-slate-400">
                  {currentSong.description}
                </p>
              </div>

              {/* Visual Aids Toggles */}
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setShowNoteNames(!showNoteNames)}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                    showNoteNames ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Tampilkan label nama not (C4, D4, dll)"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Nama Not</span>
                </button>

                <button
                  onClick={() => setShowSolfege(!showSolfege)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    showSolfege ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Tampilkan solmisasi (Do, Re, Mi)"
                >
                  Do-Re-Mi
                </button>

                <button
                  onClick={() => setHighlightTargetKeys(!highlightTargetKeys)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    highlightTargetKeys ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Beri tanda emas pada tuts piano target"
                >
                  Tuts Panduan
                </button>
              </div>
            </div>

            {/* Game HUD (Score, Combo, Accuracy, Progress, Controls) */}
            <GameHUD
              score={score}
              combo={combo}
              highestCombo={highestCombo}
              totalNotes={currentSong.notes.length}
              completedNotes={completedNoteIds.size}
              lastRating={lastRating}
              lastDeltaMs={lastDeltaMs}
              playMode={playMode}
              inputMethod={inputMethod}
              bpm={bpm}
              isPlaying={isPlaying}
              isMetronomeOn={isMetronomeOn}
              accuracy={currentAccuracy}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onRestart={handleRestart}
              onToggleMetronome={() => setIsMetronomeOn(!isMetronomeOn)}
              onChangeBpm={(newBpm) => setBpm(newBpm)}
              onChangePlayMode={(mode) => setPlayMode(mode)}
              onChangeInputMethod={(method) => setInputMethod(method)}
            />

            {/* Precision Musical Notation Staff Renderer */}
            <StaffRenderer
              notes={currentSong.notes}
              currentBeat={currentBeat}
              clef={currentSong.clef}
              activeNoteIndex={activeNoteIndex}
              lastHitRating={lastRating}
              lastHitNoteId={lastHitNoteId}
              isWaitMode={playMode === 'WAIT_MODE'}
              bpm={bpm}
              showNoteNames={showNoteNames}
              showSolfege={showSolfege}
              timeSignature={currentSong.timeSignature}
              onNoteClick={(clickedNote) => {
                soundEngine.playNote(clickedNote.midi);
              }}
            />

            {/* Microphone Pitch Detection HUD */}
            <PitchDetectionHUD
              targetPitch={activeNote?.pitch}
              onDetectedNote={(detectedPitch, detectedMidi) => {
                handleUserNoteTrigger(detectedPitch, detectedMidi, true);
              }}
            />

            {/* Interactive User Input Deck */}
            {inputMethod === 'PIANO' ? (
              <PianoKeyboard
                targetPitch={activeNote?.pitch}
                showKeyLabels={showNoteNames}
                highlightTarget={highlightTargetKeys}
                activeExternalMidi={activeExternalMidi}
                onNoteTrigger={(pitch, midi) => {
                  handleUserNoteTrigger(pitch, midi);
                }}
              />
            ) : (
              <RhythmTapPad
                targetNoteName={activeNote?.pitch}
                isWaitMode={playMode === 'WAIT_MODE'}
                onTap={handleRhythmTap}
              />
            )}
          </div>
        )}

        {/* TAB 2: MODE PETUALANGAN (CAMPAIGN) */}
        {activeTab === 'campaign' && (
          <CampaignView
            stages={campaignStages}
            currentStageId={currentStageId}
            onSelectStage={(stage) => handleSelectSong(stage.song, stage.id)}
            onOpenQuizStage={(stage) => setActiveQuizStage(stage)}
          />
        )}

        {/* TAB 3: TANTANGAN HARIAN (DAILY CHALLENGE) */}
        {activeTab === 'daily' && (
          <DailyChallengeView
            streakDays={userStats.streakDays}
            onStartChallenge={(dailySong) => handleSelectSong(dailySong)}
          />
        )}

        {/* TAB 4: PUSTAKA PARTITUR (FREE PLAY) */}
        {activeTab === 'library' && (
          <SongLibraryView
            songs={SONG_LIBRARY}
            currentSongId={currentSong.id}
            onSelectSong={(song) => handleSelectSong(song)}
          />
        )}

        {/* TAB 5: STATISTIK & REKOGNISI REFLEK */}
        {activeTab === 'stats' && <ProfileStatsView stats={userStats} />}

        {/* TAB 6: GDD & SPESIFIKASI ARSITEKTUR LENGKAP */}
        {activeTab === 'gdd' && <GDDDocumentViewer />}
      </main>

      {/* ----------------- LEVEL COMPLETE MODAL ----------------- */}
      {isLevelFinished && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-3xl mb-4">
              🎉
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight">
              Latihan Selesai!
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {currentSong.title} berhasil Anda mainkan dengan sukses.
            </p>

            {/* Stars */}
            <div className="flex items-center gap-2 my-4">
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  className={`w-8 h-8 ${
                    starIdx <= finishedStars
                      ? 'text-amber-400 fill-amber-400 animate-bounce'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Stats Breakdown */}
            <div className="w-full grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 my-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Akurasi</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{currentAccuracy}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Max Combo</span>
                <span className="text-lg font-bold font-mono text-cyan-400">{highestCombo}x</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Skor Akhir</span>
                <span className="text-lg font-bold font-mono text-amber-400">{score.toLocaleString()}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 w-full mt-4">
              <button
                onClick={handleRestart}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
              >
                Ulangi Lagu
              </button>
              <button
                onClick={() => {
                  setIsLevelFinished(false);
                  setActiveTab('campaign');
                }}
                className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-cyan-500/20"
              >
                Peta Petualangan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- ART THEORY & PRINCIPLES QUIZ MODAL ----------------- */}
      {activeQuizStage && activeQuizStage.quizQuestions && (
        <ArtTheoryQuizModal
          stageTitle={activeQuizStage.title}
          stageSubtitle={activeQuizStage.subtitle}
          questions={activeQuizStage.quizQuestions}
          onCompleteQuiz={handleCompleteQuiz}
          onClose={() => setActiveQuizStage(null)}
        />
      )}
    </div>
  );
}
