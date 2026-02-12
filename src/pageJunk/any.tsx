import React, { useEffect, useState, useMemo } from "react";
import { ZoomIn, ZoomOut, Eye, EyeOff } from "lucide-react";

interface Note {
  id: string;
  number: number;
  type: number;
  position: number;
  comboIndex: number;
  gap?: number; // <--- PROPERTY BARU: Jarak dari note sebelumnya di lane yang sama
}

interface VisualizerProps {
  chartId: string | null;
}

// Mapping: Data Position (Key) -> Visual Lane 1-5 Left-to-Right (Value)
// Berdasarkan formasi 4-2-1-3-5:
// Data 4 (Far Left)  -> Visual 1
// Data 2 (Left)      -> Visual 2
// Data 1 (Center)    -> Visual 3
// Data 3 (Right)     -> Visual 4
// Data 5 (Far Right) -> Visual 5
const VISUAL_LANE_MAP: Record<number, number> = {
  4: 1,
  2: 2,
  1: 3,
  3: 4,
  5: 5,
};

const BeatmapVisualizer: React.FC<VisualizerProps> = ({ chartId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [zoom, setZoom] = useState(5);
  const [showAllNotes, setShowAllNotes] = useState(false);

  useEffect(() => {
    if (!chartId) return;

    const fetchChart = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://diveidolypapi.my.id/api/music/charts/${chartId}`,
        );
        if (!res.ok) throw new Error("Chart data not found");
        const data = await res.json();

        // 1. Filter & Sort
        const validNotes = data
          .filter((n: any) => n.type !== 0)
          .sort((a: any, b: any) => a.number - b.number);

        // 2. Re-indexing & GAP Calculation (PERBAIKAN DISINI)
        const lastComboInLane: Record<number, number> = {}; // Simpan Combo Index terakhir

        const processedNotes = validNotes.map((n: any, index: number) => {
          const currentCombo = index + 1; // 1, 2, 3...
          const lane = n.position > 0 ? n.position : 0;

          // Hitung Gap berdasarkan COMBO INDEX (bukan number/waktu)
          let currentGap = 0;
          if (lane > 0 && lastComboInLane[lane] !== undefined) {
            currentGap = currentCombo - lastComboInLane[lane];
          }

          // Update pelacak
          if (lane > 0) {
            lastComboInLane[lane] = currentCombo;
          }

          return {
            ...n,
            comboIndex: currentCombo,
            gap: currentGap,
          };
        });

        setNotes(processedNotes);
      } catch (err) {
        console.error(err);
        setError("Failed to load beatmap.");
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [chartId]);

  const visibleNotes = useMemo(() => {
    if (showAllNotes) return notes;
    return notes.filter((n) => n.type === 2 || n.type === 3);
  }, [notes, showAllNotes]);

  const laneStats = useMemo(() => {
    const stats: Record<number, { hasSP: boolean; count: number }> = {
      4: { hasSP: false, count: 0 },
      2: { hasSP: false, count: 0 },
      1: { hasSP: false, count: 0 },
      3: { hasSP: false, count: 0 },
      5: { hasSP: false, count: 0 },
    };

    let totalNotesAllLanes = 0;

    notes.forEach((n) => {
      // Abaikan note tanpa posisi
      if (n.position < 1 || n.position > 5) return;

      stats[n.position].count++;
      totalNotesAllLanes++;

      if (n.type === 3) {
        // Type 3 = SP Skill
        stats[n.position].hasSP = true;
      }
    });

    // Hitung rata-rata note per lane untuk menentukan threshold "Banyak vs Sedikit"
    const averageCount = totalNotesAllLanes / 5;

    return { data: stats, threshold: averageCount };
  }, [notes]);

  if (!chartId)
    return (
      <div className="text-gray-500 p-10 text-center">
        Select a song to view chart
      </div>
    );
  if (loading)
    return (
      <div className="text-pink-400 p-10 text-center animate-pulse">
        Loading Beatmap...
      </div>
    );
  if (error)
    return <div className="text-red-400 p-10 text-center">{error}</div>;

  const lastNoteNum = notes.length > 0 ? notes[notes.length - 1].number : 0;
  const TOTAL_HEIGHT = lastNoteNum * zoom + 200;

  const renderLanes = () => (
    <div className="absolute inset-0 flex pointer-events-none">
      {/* Kita merender kolom visual 1 s/d 5 dari kiri ke kanan */}
      {[1, 2, 3, 4, 5].map((visualLane) => {
        // KITA HARUS CARI TAHU: Data Position mana yang menempati Visual Lane ini?
        // Visual 1 <== Data 4
        // Visual 2 <== Data 2
        // Visual 3 <== Data 1
        // Visual 4 <== Data 3
        // Visual 5 <== Data 5
        const dataPositionMapInv: Record<number, number> = {
          1: 4,
          2: 2,
          3: 1,
          4: 3,
          5: 5,
        };
        const originalDataLane = dataPositionMapInv[visualLane];

        const stat = laneStats.data[originalDataLane];
        let label = "少"; // Default: Sedikit/Less
        let labelColor = "text-gray-600"; // Warna gelap/pudar
        let labelSize = "text-xs";

        if (stat.hasSP) {
          label = "SP";
          labelColor =
            "text-pink-500 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]";
          labelSize = "text-sm";
        } else if (stat.count > laneStats.threshold) {
          label = "多"; // Banyak/More
          labelColor = "text-gray-200"; // Putih terang
          labelSize = "text-xs";
        }

        return (
          <div
            key={visualLane}
            className="flex-1 border-r border-gray-700/30 last:border-r-0 relative group hover:bg-white/5 transition-colors"
          >
            {/* Label Header (SP / 多 / 少) */}
            <div
              className={`absolute -top-8 left-1/2 -translate-x-1/2 font-black font-mono flex flex-col items-center gap-1 ${labelColor} ${labelSize}`}
            >
              <span>{label}</span>
              {/* Optional: Angka Lane Kecil di bawah label */}
              <span className="text-[9px] opacity-50 font-normal text-gray-500">
                {originalDataLane}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full h-full bg-gray-900 rounded-xl border border-gray-800 relative overflow-hidden flex flex-col shadow-inner">
      {/* Header Controls */}
      <div className="bg-gray-800 p-2 text-xs text-gray-400 flex flex-wrap justify-between items-center px-4 border-b border-gray-700 z-20 shadow-sm gap-2">
        <div className="flex flex-col">
          <span className="font-mono text-pink-500 font-bold">{chartId}</span>
          <span className="text-[10px]">
            Showing: {visibleNotes.length} / Total: {notes.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* <button
            onClick={() => setShowAllNotes(!showAllNotes)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
              showAllNotes
                ? "bg-blue-600 text-white border-blue-400"
                : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
            }`}
          >
            {showAllNotes ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>{showAllNotes ? "Show All" : "Skills Only"}</span>
          </button> */}

          <div className="flex items-center gap-2 bg-gray-900/50 px-2 py-1 rounded-lg">
            <ZoomOut size={14} />
            <input
              type="range"
              min="2"
              max="15"
              step="0.5"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <ZoomIn size={14} />
          </div>
        </div>
      </div>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 relative">
        <div
          className="relative mx-auto my-10 bg-gray-900/50 transition-all duration-300"
          style={{ width: "100%", maxWidth: "500px", height: TOTAL_HEIGHT }}
        >
          {renderLanes()}
          <div className="absolute top-0 w-full border-t-2 border-pink-500/50 text-center z-0">
            <span className="bg-pink-900/50 text-pink-200 text-[9px] px-2 py-0.5 rounded-b font-bold tracking-widest">
              START
            </span>
          </div>

          {visibleNotes.map((note, idx) => {
            // 1. Tentukan Visual Lane
            // Jika note.position ada di map, pakai itu. Jika 0/invalid, default ke tengah (3)
            const visualLane = VISUAL_LANE_MAP[note.position] || 3;

            // 2. Hitung posisi CSS berdasarkan Visual Lane (1-5 Linear)
            const leftPercent = (visualLane - 1) * 20 + 10;

            const topPosition = note.number * zoom;

            let noteClass = "";
            let content = "";
            let zIndex = 10;

            if (note.type === 2) {
              noteClass =
                "w-8 h-8 bg-blue-600 border-2 border-cyan-300 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center font-bold text-xs text-white";
              content = note.comboIndex.toString();
              zIndex = 20;
            } else if (note.type === 3) {
              noteClass =
                "w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 border-2 border-yellow-200 rounded-full shadow-[0_0_25px_rgba(236,72,153,0.8)] flex items-center justify-center font-bold text-sm text-white animate-pulse";
              content = note.comboIndex.toString();
              zIndex = 30;
            } else {
              noteClass = "w-2 h-2 bg-gray-400/50 rounded-full";
              zIndex = 5;
            }

            // TOOLTIP YANG DIPERBARUI
            const tooltipText = [
              `Combo: #${note.comboIndex}`,
              `Lane: ${note.position}`,
              `Time: ${note.number}`,
              note.gap ? `Gap: +${note.gap}` : "Gap: Start",
            ].join(" | ");

            return (
              <div
                key={`${note.id}-${idx}`}
                className={`absolute -translate-x-1/2 -translate-y-1/2 select-none transition-transform hover:scale-110 cursor-help ${noteClass}`}
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPosition}px`,
                  zIndex: zIndex,
                }}
                title={tooltipText} // <--- TAMPILKAN DI SINI
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BeatmapVisualizer;
