/**
 * SVG Musical Staff Notation Renderer for NotaSakti Maestro
 * Accurately renders 5-line Treble & Bass staves, clef glyphs, noteheads, stems,
 * ledger lines, accidentals, measure lines, and animated rhythm hit-line.
 */

import React from 'react';
import { NoteInfo, Clef, HitRating } from '../types/music';

interface StaffRendererProps {
  notes: NoteInfo[];
  currentBeat: number;
  clef: Clef | 'both';
  activeNoteIndex: number;
  lastHitRating: HitRating | null;
  lastHitNoteId: string | null;
  isWaitMode: boolean;
  bpm: number;
  showNoteNames: boolean;
  showSolfege: boolean;
  timeSignature: [number, number];
  onNoteClick?: (note: NoteInfo) => void;
}

// Convert a pitch like "C4" or "F#4" to a diatonic step offset relative to line 1 of staff
// In Treble Clef: Line 1 = E4 (step offset 0)
// Step offsets: E4 = 0, F4 = 1, G4 = 2, A4 = 3, B4 = 4, C5 = 5, D5 = 6, E5 = 7, F5 = 8
// Middle C (C4) = -2 (needs ledger line below)
// D4 = -1 (sits just under line 1)
function getTrebleDiatonicOffset(step: string, octave: number): number {
  const stepMap: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  const baseVal = octave * 7 + (stepMap[step] ?? 0);
  // E4 is octave 4, step E(2) => 4 * 7 + 2 = 30
  const E4_VAL = 30;
  return baseVal - E4_VAL;
}

// In Bass Clef: Line 1 = G2 (step offset 0)
// Step offsets: G2 = 0, A2 = 1, B2 = 2, C3 = 3, D3 = 4, E3 = 5, F3 = 6, G3 = 7, A3 = 8
// Middle C (C4) = 10 (needs ledger line above line 5)
function getBassDiatonicOffset(step: string, octave: number): number {
  const stepMap: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  const baseVal = octave * 7 + (stepMap[step] ?? 0);
  // G2 is octave 2, step G(4) => 2 * 7 + 4 = 18
  const G2_VAL = 18;
  return baseVal - G2_VAL;
}

export const StaffRenderer: React.FC<StaffRendererProps> = ({
  notes,
  currentBeat,
  clef,
  activeNoteIndex,
  lastHitRating,
  lastHitNoteId,
  isWaitMode,
  showNoteNames,
  showSolfege,
  timeSignature,
  onNoteClick,
}) => {
  // Staff geometry constants
  const LINE_SPACING = 12; // pixels between each staff line
  const STAFF_TOP_Y = 56;  // Top line of Treble (Line 5 = F5)
  // 5 lines:
  // Line 5 (F5): STAFF_TOP_Y + 0 * LINE_SPACING = 56
  // Line 4 (D5): STAFF_TOP_Y + 1 * LINE_SPACING = 68
  // Line 3 (B4): STAFF_TOP_Y + 2 * LINE_SPACING = 80
  // Line 2 (G4): STAFF_TOP_Y + 3 * LINE_SPACING = 92
  // Line 1 (E4): STAFF_TOP_Y + 4 * LINE_SPACING = 104
  const TREBLE_LINE1_Y = STAFF_TOP_Y + 4 * LINE_SPACING; // 104

  // Bass Staff Geometry (if active or Grand Staff)
  const BASS_TOP_Y = clef === 'both' ? 180 : 56;
  const BASS_LINE1_Y = BASS_TOP_Y + 4 * LINE_SPACING;

  // Horizontal geometry
  const HIT_TARGET_X = 180; // Fixed hit target line position
  const PIXELS_PER_BEAT = 110; // Beat to pixel scale for smooth scrolling

  const containerHeight = clef === 'both' ? 270 : 180;

  // Helper to calculate Y for any note
  const getNoteY = (note: NoteInfo): number => {
    if (note.clef === 'treble') {
      const offset = getTrebleDiatonicOffset(note.step, note.octave);
      // Each step moves up by LINE_SPACING / 2 (6px)
      return TREBLE_LINE1_Y - offset * (LINE_SPACING / 2);
    } else {
      const offset = getBassDiatonicOffset(note.step, note.octave);
      return BASS_LINE1_Y - offset * (LINE_SPACING / 2);
    }
  };

  // Helper to determine if ledger lines are needed
  const getLedgerLines = (note: NoteInfo, noteY: number) => {
    const lines: number[] = [];
    if (note.clef === 'treble') {
      // Below staff: Line 1 Y = 104
      // Middle C is Y = 116 (offset -2) -> ledger at 116
      // A3 is Y = 128 (offset -4) -> ledgers at 116, 128
      if (noteY > TREBLE_LINE1_Y + LINE_SPACING / 2) {
        for (let y = TREBLE_LINE1_Y + LINE_SPACING; y <= noteY + 2; y += LINE_SPACING) {
          lines.push(y);
        }
      }
      // Above staff: Line 5 Y = 56
      // A5 is Y = 44 (offset 10) -> ledger at 44
      // C6 is Y = 32 (offset 12) -> ledgers at 44, 32
      if (noteY < STAFF_TOP_Y - LINE_SPACING / 2) {
        for (let y = STAFF_TOP_Y - LINE_SPACING; y >= noteY - 2; y -= LINE_SPACING) {
          lines.push(y);
        }
      }
    } else {
      // Bass clef below: Line 1 Y = BASS_LINE1_Y
      if (noteY > BASS_LINE1_Y + LINE_SPACING / 2) {
        for (let y = BASS_LINE1_Y + LINE_SPACING; y <= noteY + 2; y += LINE_SPACING) {
          lines.push(y);
        }
      }
      // Bass clef above: Line 5 Y = BASS_TOP_Y
      // Middle C is Y = BASS_TOP_Y - LINE_SPACING
      if (noteY < BASS_TOP_Y - LINE_SPACING / 2) {
        for (let y = BASS_TOP_Y - LINE_SPACING; y >= noteY - 2; y -= LINE_SPACING) {
          lines.push(y);
        }
      }
    }
    return lines;
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-inner select-none">
      {/* Background Subtle Staff Header Overlay */}
      <div className="absolute top-2 left-4 z-10 flex items-center gap-3 text-xs text-slate-400 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          {clef === 'both' ? 'Grand Staff (Kunci G & F)' : clef === 'treble' ? 'Kunci G (Treble Clef)' : 'Kunci F (Bass Clef)'}
        </span>
        <span className="text-slate-600">|</span>
        <span>Birama {timeSignature[0]}/{timeSignature[1]}</span>
        {isWaitMode && (
          <span className="text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Wait Mode (Menunggu Tekan)
          </span>
        )}
      </div>

      <svg
        className="w-full h-full block"
        height={containerHeight}
        viewBox={`0 0 960 ${containerHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Hit target line glow */}
          <linearGradient id="hitLineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
          </linearGradient>

          {/* Golden note glow for wait mode */}
          <radialGradient id="waitHalo">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ----------------- TREBLE STAFF LINES ----------------- */}
        <g id="treble-staff" opacity={clef === 'bass' ? 0.2 : 1}>
          {[0, 1, 2, 3, 4].map((i) => {
            const y = STAFF_TOP_Y + i * LINE_SPACING;
            return (
              <line
                key={`treble_line_${i}`}
                x1="0"
                y1={y}
                x2="960"
                y2={y}
                stroke="#64748b"
                strokeWidth="1.25"
                opacity="0.85"
              />
            );
          })}

          {/* Treble Clef Glyph (G-Clef) */}
          <text
            x="48"
            y={STAFF_TOP_Y + 3.8 * LINE_SPACING}
            fontSize="52"
            fontFamily="serif"
            fill="#e2e8f0"
            className="select-none pointer-events-none"
          >
            𝄞
          </text>

          {/* Time Signature */}
          <g transform={`translate(100, ${STAFF_TOP_Y})`}>
            <text x="0" y="20" fontSize="22" fontWeight="bold" fontFamily="sans-serif" fill="#94a3b8">
              {timeSignature[0]}
            </text>
            <text x="0" y="42" fontSize="22" fontWeight="bold" fontFamily="sans-serif" fill="#94a3b8">
              {timeSignature[1]}
            </text>
          </g>
        </g>

        {/* ----------------- BASS STAFF LINES (if both or bass) ----------------- */}
        {(clef === 'bass' || clef === 'both') && (
          <g id="bass-staff">
            {[0, 1, 2, 3, 4].map((i) => {
              const y = BASS_TOP_Y + i * LINE_SPACING;
              return (
                <line
                  key={`bass_line_${i}`}
                  x1="0"
                  y1={y}
                  x2="960"
                  y2={y}
                  stroke="#64748b"
                  strokeWidth="1.25"
                  opacity="0.85"
                />
              );
            })}

            {/* Bass Clef Glyph (F-Clef) */}
            <text
              x="48"
              y={BASS_TOP_Y + 2.8 * LINE_SPACING}
              fontSize="44"
              fontFamily="serif"
              fill="#e2e8f0"
              className="select-none pointer-events-none"
            >
              𝄢
            </text>

            {/* Time Signature */}
            <g transform={`translate(100, ${BASS_TOP_Y})`}>
              <text x="0" y="20" fontSize="22" fontWeight="bold" fontFamily="sans-serif" fill="#94a3b8">
                {timeSignature[0]}
              </text>
              <text x="0" y="42" fontSize="22" fontWeight="bold" fontFamily="sans-serif" fill="#94a3b8">
                {timeSignature[1]}
              </text>
            </g>
          </g>
        )}

        {/* Grand Staff Left Bracket Bar (if both) */}
        {clef === 'both' && (
          <g>
            <line x1="38" y1={STAFF_TOP_Y} x2="38" y2={BASS_TOP_Y + 4 * LINE_SPACING} stroke="#cbd5e1" strokeWidth="3" />
            <line x1="34" y1={STAFF_TOP_Y} x2="38" y2={STAFF_TOP_Y} stroke="#cbd5e1" strokeWidth="2" />
            <line x1="34" y1={BASS_TOP_Y + 4 * LINE_SPACING} x2="38" y2={BASS_TOP_Y + 4 * LINE_SPACING} stroke="#cbd5e1" strokeWidth="2" />
          </g>
        )}

        {/* ----------------- HIT TARGET LINE (Zona Ketukan) ----------------- */}
        <g id="hit-target-line">
          {/* Soft target bar highlight */}
          <rect
            x={HIT_TARGET_X - 16}
            y={24}
            width="32"
            height={containerHeight - 34}
            fill="url(#hitLineGradient)"
            opacity="0.4"
            rx="4"
          />
          <line
            x1={HIT_TARGET_X}
            y1={24}
            x2={HIT_TARGET_X}
            y2={containerHeight - 10}
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />
          {/* Target strike circles at staves */}
          <circle cx={HIT_TARGET_X} cy={TREBLE_LINE1_Y - 2 * LINE_SPACING} r="10" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
          {clef === 'both' && (
            <circle cx={HIT_TARGET_X} cy={BASS_TOP_Y + 2 * LINE_SPACING} r="10" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
          )}
        </g>

        {/* ----------------- SCROLLING MEASURE BARLINES ----------------- */}
        {(() => {
          const beatsPerMeasure = timeSignature[0];
          const totalBeats = Math.max(...notes.map((n) => n.beatOffset + n.duration), 16);
          const barElements = [];
          for (let b = 0; b <= totalBeats; b += beatsPerMeasure) {
            const barX = HIT_TARGET_X + (b - currentBeat) * PIXELS_PER_BEAT;
            if (barX >= 40 && barX <= 960) {
              barElements.push(
                <g key={`bar_${b}`}>
                  <line
                    x1={barX}
                    y1={STAFF_TOP_Y}
                    x2={barX}
                    y2={clef === 'both' ? BASS_TOP_Y + 4 * LINE_SPACING : TREBLE_LINE1_Y}
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray={clef === 'both' ? 'none' : undefined}
                  />
                  <text x={barX + 4} y={STAFF_TOP_Y - 6} fontSize="11" fill="#64748b" fontFamily="monospace">
                    M{Math.floor(b / beatsPerMeasure) + 1}
                  </text>
                </g>
              );
            }
          }
          return barElements;
        })()}

        {/* ----------------- DYNAMIC MUSICAL NOTES ----------------- */}
        {notes.map((note, idx) => {
          const noteX = HIT_TARGET_X + (note.beatOffset - currentBeat) * PIXELS_PER_BEAT;
          // Cull notes that are completely off screen
          if (noteX < 30 || noteX > 940) return null;

          const noteY = getNoteY(note);
          const ledgers = getLedgerLines(note, noteY);
          const isActive = idx === activeNoteIndex;
          const isHitFeedback = lastHitNoteId === note.id;

          // Note color based on state
          let noteColor = '#f8fafc';
          let noteStroke = '#0f172a';
          let glowHalo = false;

          if (isActive) {
            noteColor = isWaitMode ? '#fbbf24' : '#38bdf8'; // Amber when waiting, cyan in rhythm mode
            glowHalo = true;
          }

          if (isHitFeedback) {
            if (lastHitRating === 'PERFECT') {
              noteColor = '#10b981'; // Emerald
            } else if (lastHitRating === 'GOOD') {
              noteColor = '#3b82f6'; // Blue
            } else if (lastHitRating === 'MISS') {
              noteColor = '#ef4444'; // Red
            }
          }

          // Stem direction: Notes on or above line 3 (B4) usually have stems pointing down, below point up
          const stemDirection = noteY <= (note.clef === 'treble' ? STAFF_TOP_Y + 2 * LINE_SPACING : BASS_TOP_Y + 2 * LINE_SPACING) ? 'down' : 'up';
          const stemLength = 32;

          return (
            <g
              key={note.id}
              className="cursor-pointer transition-transform duration-100"
              onClick={() => onNoteClick && onNoteClick(note)}
            >
              {/* Wait Mode / Active Glow */}
              {glowHalo && (
                <circle cx={noteX} cy={noteY} r="24" fill="url(#waitHalo)" className="animate-pulse" />
              )}

              {/* Ledger Lines (Garis Bantu) */}
              {ledgers.map((ly, lIdx) => (
                <line
                  key={`ledger_${note.id}_${lIdx}`}
                  x1={noteX - 14}
                  y1={ly}
                  x2={noteX + 14}
                  y2={ly}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
              ))}

              {/* Accidental Sign (♯, ♭, ♮) */}
              {note.accidental && (
                <text
                  x={noteX - 16}
                  y={noteY + 5}
                  fontSize="20"
                  fontWeight="bold"
                  fill="#f59e0b"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {note.accidental === '#' ? '♯' : note.accidental === 'b' ? '♭' : '♮'}
                </text>
              )}

              {/* Notehead (Kepala Not) */}
              {note.duration === 4 ? (
                // Whole note: Open elliptical ring (Semibreve)
                <ellipse
                  cx={noteX}
                  cy={noteY}
                  rx="7.5"
                  ry="5.5"
                  fill="none"
                  stroke={noteColor}
                  strokeWidth="2.75"
                  transform={`rotate(-20 ${noteX} ${noteY})`}
                />
              ) : note.duration === 2 ? (
                // Half note: Open elliptical ring with stem (Minim)
                <>
                  <ellipse
                    cx={noteX}
                    cy={noteY}
                    rx="7.2"
                    ry="5.2"
                    fill="none"
                    stroke={noteColor}
                    strokeWidth="2.5"
                    transform={`rotate(-20 ${noteX} ${noteY})`}
                  />
                  {/* Stem */}
                  <line
                    x1={stemDirection === 'up' ? noteX + 6 : noteX - 6}
                    y1={noteY}
                    x2={stemDirection === 'up' ? noteX + 6 : noteX - 6}
                    y2={stemDirection === 'up' ? noteY - stemLength : noteY + stemLength}
                    stroke={noteColor}
                    strokeWidth="1.8"
                  />
                </>
              ) : (
                // Quarter or Eighth note: Solid oval with stem
                <>
                  <ellipse
                    cx={noteX}
                    cy={noteY}
                    rx="7.5"
                    ry="5.5"
                    fill={noteColor}
                    stroke={noteStroke}
                    strokeWidth="0.5"
                    transform={`rotate(-20 ${noteX} ${noteY})`}
                  />
                  {/* Stem */}
                  <line
                    x1={stemDirection === 'up' ? noteX + 6.5 : noteX - 6.5}
                    y1={noteY}
                    x2={stemDirection === 'up' ? noteX + 6.5 : noteX - 6.5}
                    y2={stemDirection === 'up' ? noteY - stemLength : noteY + stemLength}
                    stroke={noteColor}
                    strokeWidth="1.8"
                  />
                  {/* Eighth note flag */}
                  {note.duration === 0.5 && (
                    <path
                      d={
                        stemDirection === 'up'
                          ? `M ${noteX + 6.5} ${noteY - stemLength} Q ${noteX + 16} ${noteY - stemLength + 10} ${noteX + 14} ${noteY - stemLength + 18}`
                          : `M ${noteX - 6.5} ${noteY + stemLength} Q ${noteX + 4} ${noteY + stemLength - 10} ${noteX + 2} ${noteY + stemLength - 18}`
                      }
                      stroke={noteColor}
                      strokeWidth="2"
                      fill="none"
                    />
                  )}
                </>
              )}

              {/* Optional Educational Guides (Nama Not / Solmisasi) */}
              {(showNoteNames || showSolfege || note.lyric) && (
                <g>
                  {showNoteNames && (
                    <text
                      x={noteX}
                      y={noteY + (stemDirection === 'up' ? 18 : -14)}
                      fontSize="10"
                      fontWeight="bold"
                      fill={isActive ? '#38bdf8' : '#94a3b8'}
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {note.pitch}
                    </text>
                  )}
                  {showSolfege && note.solfege && (
                    <text
                      x={noteX}
                      y={noteY + (stemDirection === 'up' ? 28 : -24)}
                      fontSize="9"
                      fontWeight="semibold"
                      fill="#e2e8f0"
                      textAnchor="middle"
                    >
                      {note.solfege}
                    </text>
                  )}
                  {note.lyric && !showSolfege && (
                    <text
                      x={noteX}
                      y={containerHeight - 12}
                      fontSize="11"
                      fill="#cbd5e1"
                      textAnchor="middle"
                    >
                      {note.lyric}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
