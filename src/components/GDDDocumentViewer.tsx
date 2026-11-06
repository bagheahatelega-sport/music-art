/**
 * Interactive Game Design Document (GDD) & Technical Architecture Blueprint
 * Comprehensive, production-ready specifications for NotaSakti Maestro
 */

import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Cpu,
  GraduationCap,
  Rocket,
  CheckCircle2,
  FileCode2,
  ChevronRight,
  Shield,
  Activity,
  Music,
} from 'lucide-react';

export const GDDDocumentViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'core' | 'curriculum' | 'features' | 'tech' | 'mvp'
  >('core');

  return (
    <div className="w-full flex flex-col gap-6 text-slate-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <FileCode2 className="w-4 h-4" />
          <span>GAME DESIGN DOCUMENT (GDD) & SYSTEM ARCHITECTURE</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          NotaSakti Maestro: Desain Game Musik Edukasi Sight-Reading
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Rancangan spesifikasi komprehensif untuk pengembang front-end, game programmer, dan instruktur musik: menggabungkan partitur nyata (kunci G &amp; F) dengan keasyikan mekanik rhythm game multi-modal (Piano Virtual, Ketukan, Mic Pitch Detection, dan Web MIDI).
        </p>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-slate-800">
          {[
            { id: 'core', label: '1. Core Gameplay & Mekanik', icon: Sparkles },
            { id: 'curriculum', label: '2. Kurikulum & Gamifikasi', icon: GraduationCap },
            { id: 'features', label: '3. Fitur Utama & Mode', icon: Layers },
            { id: 'tech', label: '4. Tech Stack & Audio Engine', icon: Cpu },
            { id: 'mvp', label: '5. Roadmap MVP Tahap 1', icon: Rocket },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Core Gameplay & Mekanik Gamifikasi */}
      {activeTab === 'core' && (
        <div className="space-y-6">
          {/* Section 1.1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono">1.1</span>
              Tampilan Not Balok di Layar (Visual Notation Engine)
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Mayoritas rhythm game (seperti Piano Tiles atau Guitar Hero) menggunakan <em>falling tiles</em> tanpa mengajarkan posisi garis dan spasi partitur asli. NotaSakti Maestro menggunakan konsep <strong>Hybrid Horizontal Scrolling Stave with Hit Window</strong>:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wide mb-2">
                  A. Notasi Paranada Riil (5-Line Grand Staff)
                </h4>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                  <li><strong>Paranada Kunci G (Treble Clef)</strong>: Nada garis 1–5 (E4, G4, B4, D5, F5) dan spasi 1–4 (F4, A4, C5, E5).</li>
                  <li><strong>Paranada Kunci F (Bass Clef)</strong>: Garis ke-4 berpusat pada nada F3 (di antara dua titik F-clef).</li>
                  <li><strong>Ledger Lines (Garis Bantu)</strong>: Ditampilkan otomatis secara matematis saat nada menyentuh Middle C (C4) atau melampaui rentang paranada.</li>
                  <li><strong>Bentuk Not Sesuai Durasi</strong>: Not Utuh (oval berongga tanpa tangkai 𝅝), Not Setengah (oval berongga bertangkai 𝅗𝅥), Not Seperempat (oval penuh bertangkai ♩), dan Not Seperdelapan (dengan bendera/beam ♪).</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wide mb-2">
                  B. Scrolling Sheet Music vs Falling Notes
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  Dipilih <strong>Horizontal Scrolling Sheet Music dengan Dynamic Hit Bar</strong>:
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Partitur bergerak mulus dari kanan ke kiri sesuai tempo (BPM).</li>
                  <li>Terdapat <strong>Zona Ketukan Vertikal (Target Hit Line)</strong> di sisi kiri-tengah layar.</li>
                  <li>Pemain harus menekan not yang tepat saat kepala not (notehead) bersinggungan dengan garis target.</li>
                  <li>Membiasakan mata pemain bergerak dari kiri ke kanan (kebiasaan sight-reading musisi riil).</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 1.2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono">1.2</span>
              Sistem Input Multi-Modal (Virtual Piano, Rhythm Pad, Mic, MIDI)
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Aplikasi mendukung 4 metode interaksi untuk berbagai profil pengguna dan perangkat:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xl mb-1 block">🎹</span>
                  <h4 className="font-bold text-white mb-1">1. Virtual Piano</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Keyboard piano layar sentuh (touchscreen) & keyboard PC (shortcut A-S-D-F-G...). Menampilkan visual tuts putih & hitam dengan animasi tekan realistis.
                  </p>
                </div>
                <span className="mt-3 text-[10px] text-cyan-400 font-mono">Mobile Touch / Desktop</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xl mb-1 block">🥁</span>
                  <h4 className="font-bold text-white mb-1">2. Rhythm Tap Pad</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Mode ketukan drum/pad besar (layaknya Taiko). Fokus pada durasi nilai ketukan, birama 4/4 atau 3/4, dan ritme sinkopasi.
                  </p>
                </div>
                <span className="mt-3 text-[10px] text-amber-400 font-mono">Fokus Nilai Ketuk</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xl mb-1 block">🎙️</span>
                  <h4 className="font-bold text-white mb-1">3. Pitch Detection</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Mikrofon mendengarkan frekuensi suara pengguna (vokal/nyanyian, pianika fisik, biola, suling). Algoritma autokorelasi mendeteksi nada Hz secara real-time.
                  </p>
                </div>
                <span className="mt-3 text-[10px] text-emerald-400 font-mono">Alat Musik Nyata</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xl mb-1 block">🔌</span>
                  <h4 className="font-bold text-white mb-1">4. Web MIDI API</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Dukungan plug-and-play untuk keyboard/synthesizer MIDI fisik via kabel USB atau Bluetooth MIDI tanpa instal driver tambahan.
                  </p>
                </div>
                <span className="mt-3 text-[10px] text-indigo-400 font-mono">Pro Keyboardist</span>
              </div>
            </div>
          </div>

          {/* Section 1.3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono">1.3</span>
              Sistem Penilaian, Timing Windows &amp; Visual Feedback
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Penilaian</th>
                    <th className="py-2.5 px-3">Jendela Timing (Latency Window)</th>
                    <th className="py-2.5 px-3">Skor Basis</th>
                    <th className="py-2.5 px-3">Feedback Visual & Audio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">PERFECT</td>
                    <td className="py-2.5 px-3 font-mono">± 0 s/d 75 ms</td>
                    <td className="py-2.5 px-3 font-mono font-bold">+100 × Combo</td>
                    <td className="py-2.5 px-3">Not menyala hijau zamrud (emerald), percikan partikel emas, bunyi chime arpeggio cerah.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-cyan-400">GOOD</td>
                    <td className="py-2.5 px-3 font-mono">± 76 s/d 180 ms</td>
                    <td className="py-2.5 px-3 font-mono font-bold">+50 × Combo</td>
                    <td className="py-2.5 px-3">Not menyala biru cyan, combo berlanjut, nada chime akustik reguler.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-rose-400">MISS</td>
                    <td className="py-2.5 px-3 font-mono">&gt; ± 180 ms atau Salah Nada</td>
                    <td className="py-2.5 px-3 font-mono font-bold">0</td>
                    <td className="py-2.5 px-3">Not berguncang merah (crimson wobble), combo reset ke 0, bunyi wood thud halus (tidak memekakkan telinga).</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <strong>Mekanik Kesalahan Nada (Pitch Error):</strong> Jika pengguna menekan nada salah (misal nada di partitur adalah E4, tetapi ditekan D4), aplikasi langsung menampilkan not hantu merah di posisi yang ditekan dan memancarkan petunjuk panah ke nada yang benar.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Kurikulum & Progresi */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono">2.1</span>
              Sistem Kurikulum Bertingkat (Pedagogical Progression)
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Kurikulum dirancang berdasarkan metodologi Kodály, Bastien, dan Suzuki: mengisolasi satu variabel musik pada satu waktu agar memori kerja (working memory) siswa tidak mengalami cognitive overload.
            </p>

            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-emerald-400">TIER 1: LEVEL PEMULA (BEGINNER)</span>
                  <span className="text-[11px] text-slate-400">Fokus: Navigasi Garis vs Spasi</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <strong className="text-white block mb-1">Tahap 1: Triad C-D-E</strong>
                    <span>Pengenalan Middle C (garis bantu bawah), D4 (menggantung di bawah garis 1), E4 (garis 1 paranada).</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <strong className="text-white block mb-1">Tahap 2: Lima Jari C4–G4</strong>
                    <span>Melatih tangan kanan piano pada posisi C position (C4, D4, E4, F4, G4). Birama 4/4 dengan not 1 & 2 ketuk.</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <strong className="text-white block mb-1">Tahap 3: Nilai Ketuk</strong>
                    <span>Membedakan bentuk fisik Not Penuh (Whole 𝅝), Setengah (Half 𝅗𝅥), dan Seperempat (Quarter ♩).</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-cyan-400">TIER 2: LEVEL MENENGAH (INTERMEDIATE)</span>
                  <span className="text-[11px] text-slate-400">Fokus: Kunci F, Tuts Hitam, & Ritme Sinkopasi</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <strong className="text-white block mb-1">Tahap 4: Menyelami Kunci F</strong>
                    <span>Membaca Kunci Bass (F3 sampai Middle C C4). Memahami bahwa Middle C adalah jembatan antara kedua kunci.</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <strong className="text-white block mb-1">Tahap 5: Tanda Kromatik (♯ / ♭)</strong>
                    <span>Pengenalan tuts hitam piano (F#4 dan Bb4), tanda mula G Mayor dan F Mayor.</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <strong className="text-white block mb-1">Tahap 6: Birama Kompleks</strong>
                    <span>Membaca birama 3/4 (Waltz) dan birama campuran dengan not seperdelapan (♪).</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-amber-400">TIER 3: GRAND STAFF MAESTRO (ADVANCED)</span>
                  <span className="text-[11px] text-slate-400">Fokus: Polifoni Dua Tangan</span>
                </div>
                <p className="text-xs text-slate-300">
                  Menampilkan dua paranada (Kunci G dan Kunci F) secara bersamaan yang dihubungkan garis akolada. Membiasakan musisi membaca tangan kanan dan kiri secara independen maupun serentak.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-cyan-400">TIER 4: UNSUR &amp; PRINSIP SENI RUPA (LEVEL 7–10)</span>
                  <span className="text-[11px] text-amber-300">Fokus: Kuis Visual &amp; Korelasi Rupa-Musik</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <strong className="text-cyan-400 block mb-1">Unsur-Unsur Seni Rupa (Level 7, 8, 9)</strong>
                    <ul className="space-y-1 list-disc list-inside text-slate-400">
                      <li><strong>Titik (Point)</strong>: Unsur paling mendasar, awal segala bentuk dan teknik pointilisme.</li>
                      <li><strong>Garis (Line)</strong>: Sambungan titik dengan arah (lurus horizontal tenang, lengkung luwes, zigzag tegang).</li>
                      <li><strong>Bidang (Shape 2D)</strong>: Area tertutup 2 dimensi berdimensi panjang dan lebar.</li>
                      <li><strong>Bentuk (Form 3D)</strong>: Unsur 3 dimensi yang memiliki volume, isi, dan kedalaman (geometris &amp; organis).</li>
                      <li><strong>Ruang (Space)</strong>: Ruang nyata (3D) dan ruang semu/ilusi perspektif (2D).</li>
                      <li><strong>Gelap-Terang (Value)</strong>: Efek pencahayaan/bayangan (chiaroscuro) yang membentuk volume.</li>
                      <li><strong>Warna (Color)</strong>: Warna primer (merah-kuning-biru), sekunder, komplementer, hangat, &amp; dingin.</li>
                      <li><strong>Tekstur (Texture)</strong>: Nilai raba permukaan objek (tekstur nyata vs tekstur semu).</li>
                    </ul>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <strong className="text-amber-400 block mb-1">Prinsip-Prinsip Seni Rupa (Level 10)</strong>
                    <ul className="space-y-1 list-disc list-inside text-slate-400">
                      <li><strong>Kesatuan (Unity)</strong>: Keterpaduan organis seluruh unsur rupa menjadi karya utuh.</li>
                      <li><strong>Keseimbangan (Balance)</strong>: Keseimbangan simetris, asimetris (informal), dan radial.</li>
                      <li><strong>Pusat Perhatian (Emphasis / Focal Point)</strong>: Bagian yang dibuat paling menonjol/kontras.</li>
                      <li><strong>Irama / Ritme Visual (Rhythm)</strong>: Pengulangan pola garis, bentuk, atau warna berurutan.</li>
                      <li><strong>Proporsi (Proportion)</strong>: Kesebandingan ukuran antar bagian dengan keseluruhan.</li>
                      <li><strong>Kontras &amp; Gradasi</strong>: Perbedaan mencolok dan peralihan bertingkat yang harmonis.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono">2.2</span>
              Perbandingan: &apos;Wait Mode&apos; vs &apos;Rhythm Mode&apos;
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
                  <span>🟡 Wait Mode (Mode Belajar / Menunggu)</span>
                </div>
                <p className="text-slate-300 leading-relaxed mb-3">
                  Lagu/partitur <strong>berhenti total</strong> pada not target saat tiba di garis hit sampai pengguna menekan not yang benar.
                </p>
                <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                  <li>Nol tekanan waktu (zero time pressure), bebas rasa cemas.</li>
                  <li>Not yang menunggu memancarkan lingkaran halo keemasan.</li>
                  <li>Sangat cocok untuk sesi belajar awal, anak-anak, dan pemula sight-reading.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/30">
                <div className="flex items-center gap-2 text-cyan-400 font-bold mb-2">
                  <span>🔵 Rhythm Mode (Mode Arcade / Waktu Nyata)</span>
                </div>
                <p className="text-slate-300 leading-relaxed mb-3">
                  Partitur berjalan konstan mengikuti tempo (BPM) yang ditentukan metronom layaknya rhythm game sungguhan.
                </p>
                <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                  <li>Evaluasi timing presisi (Perfect/Good/Miss).</li>
                  <li>Membangun refleks mata-ke-jari tanpa perlu berpikir verbal.</li>
                  <li>Menghasilkan skor, combo multiplier, dan pencapaian leaderboard.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Fitur Utama Aplikasi */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              4 Pilar Fitur Utama NotaSakti Maestro
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-cyan-400 text-sm mb-1 flex items-center gap-1.5">
                  <Rocket className="w-4 h-4" /> 1. Mode Petualangan (Campaign Map)
                </h4>
                <p className="text-slate-300 leading-relaxed mb-2">
                  Peta level terstruktur dengan sistem bintang (1–3 bintang) dan unlock gating.
                </p>
                <ul className="text-slate-400 space-y-1 list-disc list-inside">
                  <li>Syarat lulus level: Akurasi minimal 80% di Rhythm Mode.</li>
                  <li>Skor bintang 3 diraih dengan akurasi &gt; 95% dan zero miss.</li>
                  <li>Setiap level disertai ringkasan teori musik 1 kalimat yang mudah dipahami.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 text-sm mb-1 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> 2. Tantangan Harian (Daily Challenge)
                </h4>
                <p className="text-slate-300 leading-relaxed mb-2">
                  Soal notasi acak yang disegarkan setiap 24 jam dengan penghitung streak (rentetan hari berturut-turut).
                </p>
                <ul className="text-slate-400 space-y-1 list-disc list-inside">
                  <li>Mendorong habit pembentukan reflek membaca notasi setiap hari.</li>
                  <li>Reward harian: Pengganda XP dan lencana lencana prestise.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-indigo-400 text-sm mb-1 flex items-center gap-1.5">
                  <Music className="w-4 h-4" /> 3. Pustaka Partitur (Free Play &amp; Song Library)
                </h4>
                <p className="text-slate-300 leading-relaxed mb-2">
                  Koleksi lagu populer dan karya klasik (Ode to Joy, Für Elise, Canon in D, Ibu Kita Kartini, dsb).
                </p>
                <ul className="text-slate-400 space-y-1 list-disc list-inside">
                  <li>Slider tempo dinamis (40–160 BPM) untuk latihan lambat hingga kecepatan konser.</li>
                  <li>Filter berdasarkan kategori (Klasik, Populer, Lagu Nasional) dan tingkat kesulitan.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-emerald-400 text-sm mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> 4. Profil &amp; Statistik Kemajuan
                </h4>
                <p className="text-slate-300 leading-relaxed mb-2">
                  Dashboard analitik dengan visual heatmap reflek not balok.
                </p>
                <ul className="text-slate-400 space-y-1 list-disc list-inside">
                  <li>Mendeteksi nada mana yang paling sering membuat pengguna ragu (misal nada F3 Kunci Bass memiliki latency 91ms vs C4 42ms).</li>
                  <li>Rekomendasi latihan otomatis berbasis kelemahan pembacaan not.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Tech Stack & Audio Engine */}
      {activeTab === 'tech' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">
              Rekomendasi Arsitektur Teknologi &amp; Audio Engine
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Dalam game musik edukasi, <strong>latensi audio</strong> (waktu antara sentuhan tuts dan suara berbunyi) harus di bawah 20ms agar terasa alami bagi musisi. Berikut matriks perbandingan framework:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Framework</th>
                    <th className="py-2.5 px-3">Audio Latency</th>
                    <th className="py-2.5 px-3">Notasi Musik</th>
                    <th className="py-2.5 px-3">Kelebihan &amp; Pertimbangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr className="bg-cyan-950/20">
                    <td className="py-2.5 px-3 font-bold text-cyan-300">Web / PWA (React + Web Audio API) ⭐ Rekomendasi Utama</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">&lt; 15 ms (Native Hardware)</td>
                    <td className="py-2.5 px-3 font-medium">SVG / Canvas / VexFlow</td>
                    <td className="py-2.5 px-3">Zero install, langsung jalan di browser HP &amp; laptop murid, support Web Audio + Web MIDI + Web Audio Pitch Detection out-of-the-box.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-white">Flutter</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">~25–40 ms (Oboe plugin)</td>
                    <td className="py-2.5 px-3">Custom Painter</td>
                    <td className="py-2.5 px-3">Performa UI 60/120fps sangat halus, namun butuh native bridging C++ (Oboe/AAudio) di Android untuk latensi rendah.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-white">React Native</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">~30–50 ms</td>
                    <td className="py-2.5 px-3">react-native-svg</td>
                    <td className="py-2.5 px-3">Bagus untuk aplikasi konten, namun audio timing berisiko jitter bila event loop thread terblokir animasi berat.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-white">Unity (C#)</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">&lt; 15 ms (DSP Audio)</td>
                    <td className="py-2.5 px-3">Custom Mesh / Sprite2D</td>
                    <td className="py-2.5 px-3">Cocok jika ingin grafik 3D/efek partikel arcade berat, namun ukuran bundle aplikasi besar (&gt;60MB) dan proses build lebih lama.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800">
              <h4 className="text-sm font-bold text-white mb-2">
                Pilihan Library Notasi Musik: VexFlow vs OpenSheetMusicDisplay (OSMD) vs Custom SVG
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-cyan-400 block mb-1">Custom SVG / Canvas (Dipakai di Prototipe Ini)</strong>
                  <p className="text-slate-400">
                    Sangat ringan (&lt;10KB), performa rendering 60fps tanpa lagging, kontrol penuh atas playhead garis target animasi rhythm game, dan bebas bug dependency.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-indigo-400 block mb-1">VexFlow (Standard Library)</strong>
                  <p className="text-slate-400">
                    Library standar industri untuk merender partitur musik di browser. Mendukung notasi kompleks (beam, triplet, chord cluster, artikulasi staccato/accent).
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-amber-400 block mb-1">OpenSheetMusicDisplay (OSMD)</strong>
                  <p className="text-slate-400">
                    Berbasis VexFlow dengan parser file MusicXML standar. Cocok jika di masa depan pengguna ingin meng-upload partitur sendiri dalam format .xml / .mxl dari Sibelius / MuseScore.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Langkah Implementasi Tahap 1 (MVP) */}
      {activeTab === 'mvp' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-cyan-400" />
              Rencana Eksekusi MVP (Minimum Viable Product) — 4 Sprint
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              Untuk meluncurkan prototipe yang fungsional, teruji, dan siap dipakai siswa/pengguna pertama, berikut urutan langkah esensial per sprint (masing-masing 1–2 minggu):
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold font-mono flex items-center justify-center shrink-0 text-sm">S1</span>
                <div>
                  <h4 className="font-bold text-white text-sm">Sprint 1: Audio Engine &amp; Virtual Piano Latensi Rendah</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Membangun Web Audio Synthesizer (ADSR piano akustik, klik metronom, SFX rating). Memastikan responsivitas tuts piano virtual di layar sentuh mobile dan keyboard fisik tanpa delay audible (&lt;20ms).
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold font-mono flex items-center justify-center shrink-0 text-sm">S2</span>
                <div>
                  <h4 className="font-bold text-white text-sm">Sprint 2: Notation Renderer &amp; Scrolling Rhythm Track</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Merender 5 garis paranada Kunci G, clef glyph, garis bantu Middle C (ledger lines), dan not bergeser ke arah garis target. Implementasi logika evaluasi timing (Perfect ±75ms, Good ±180ms, Miss) dan score combo.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold font-mono flex items-center justify-center shrink-0 text-sm">S3</span>
                <div>
                  <h4 className="font-bold text-white text-sm">Sprint 3: Dual Mode (Wait Mode vs Rhythm Mode) &amp; Kurikulum Dasar</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Menyediakan tombol switch antara &apos;Wait Mode&apos; (lagu berhenti menunggu not ditekan) dan &apos;Rhythm Mode&apos; (arcade kontinu). Memasukkan 6 level kurikulum awal (C-D-E, Kunci F, kres/mol).
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold font-mono flex items-center justify-center shrink-0 text-sm">S4</span>
                <div>
                  <h4 className="font-bold text-white text-sm">Sprint 4: Input Tambahan (Mic Pitch Detection &amp; MIDI) + Diagnostic Heatmap</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Integrasi mikrofon (autokorelasi deteksi frekuensi) dan Web MIDI API. Menghitung akurasi per nada dalam profil pengguna agar siswa mengetahui not balok mana yang masih lambat dibaca.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 p-4 bg-emerald-950/30 rounded-xl border border-emerald-500/30 text-xs text-emerald-300">
              ✅ <strong>Status Prototipe Saat Ini:</strong> Seluruh fitur esensial dari Sprint 1 hingga Sprint 4 telah terpasang dan dapat langsung Anda coba mainkan di tab &quot;Play Stage / Studio Musik&quot;!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
