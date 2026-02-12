import React, { useEffect, useState, useMemo, useRef } from "react";
import { Camera } from "lucide-react";
import html2canvas from "html2canvas";

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

interface ChartData {
  id: string;
  attributes: number[]; // [0] = Lane 1 Data, [1] = Lane 2 Data...
  notes: Note[];
}

interface VisualizerProps {
  chartId: string | null;
}

// Tipe Data Atribut (1=Vocal, 2=Dance, 3=Visual)
const ATTRIBUTE_COLORS: Record<
  number,
  { bg: string; border: string; text: string; note: string }
> = {
  1: {
    bg: "bg-pink-900/20",
    border: "border-pink-500/30",
    text: "text-pink-400",
    note: "bg-pink-500",
  }, // Vocal
  2: {
    bg: "bg-blue-900/20",
    border: "border-blue-500/30",
    text: "text-blue-400",
    note: "bg-blue-500",
  }, // Dance
  3: {
    bg: "bg-orange-900/20",
    border: "border-orange-500/30",
    text: "text-orange-400",
    note: "bg-orange-500",
  }, // Visual
  0: {
    bg: "bg-gray-800/20",
    border: "border-gray-700/30",
    text: "text-gray-500",
    note: "bg-gray-500",
  }, // Unknown
};

const ATTRIBUTE_NAMES: Record<number, string> = {
  1: "Vo",
  2: "Da",
  3: "Vi",
  0: "??",
};

// Mapping Visual Lane (4-2-1-3-5)
const VISUAL_LANE_MAP: Record<number, number> = {
  4: 1,
  2: 2,
  1: 3,
  3: 4,
  5: 5,
};
const DATA_LANE_MAP_INV: Record<number, number> = {
  1: 4,
  2: 2,
  3: 1,
  4: 3,
  5: 5,
};

const BeatmapVisualizer: React.FC<VisualizerProps> = ({ chartId }) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [zoom, setZoom] = useState(5);
  const [showAllNotes] = useState(false);

  // Ref untuk area yang akan di-screenshot
  const chartRef = useRef<HTMLDivElement>(null);

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

        // Response sekarang formatnya { attributes: [], notes: [] }
        const rawData = await res.json();

        // Parsing Notes
        const validNotes = rawData.notes
          .filter((n: any) => n.type !== 0)
          .sort((a: any, b: any) => a.number - b.number);

        const lastComboInLane: Record<number, number> = {};

        const processedNotes = validNotes.map((n: any, index: number) => {
          const currentCombo = index + 1;
          const lane = n.position > 0 ? n.position : 0;
          let currentGap = 0;
          if (lane > 0 && lastComboInLane[lane] !== undefined) {
            currentGap = currentCombo - lastComboInLane[lane];
          }
          if (lane > 0) lastComboInLane[lane] = currentCombo;

          return { ...n, comboIndex: currentCombo, gap: currentGap };
        });

        setChartData({ ...rawData, notes: processedNotes });
        setNotes(processedNotes);
      } catch (err) {
        console.error(err);
        setError("Failed to load beatmap.");
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [chartId]);

  // FITUR DOWNLOAD
  const handleDownload = async () => {
    if (!chartRef.current) return;
    try {
      setLoading(true);
      // html2canvas menangkap elemen DOM
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#111827", // Hex untuk bg-gray-900
        scale: 2, // Biar HD
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${chartId}-beatmap.png`;
      link.click();
    } catch (e) {
      console.error("Download failed", e);
      alert("Gagal mendownload gambar.");
    } finally {
      setLoading(false);
    }
  };

  const visibleNotes = useMemo(() => {
    if (!notes) return [];
    if (showAllNotes) return notes;
    return notes.filter((n) => n.type === 2 || n.type === 3);
  }, [notes, showAllNotes]);

  // Statistik Lane (untuk label SP/More/Less)
  const laneStats = useMemo(() => {
    const stats: Record<number, { hasSP: boolean; count: number }> = {
      1: { hasSP: false, count: 0 },
      2: { hasSP: false, count: 0 },
      3: { hasSP: false, count: 0 },
      4: { hasSP: false, count: 0 },
      5: { hasSP: false, count: 0 },
    };
    let total = 0;
    notes.forEach((n) => {
      if (n.position < 1 || n.position > 5) return;
      stats[n.position].count++;
      total++;
      if (n.type === 3) stats[n.position].hasSP = true;
    });
    return { data: stats, threshold: total / 5 };
  }, [notes]);

  if (!chartId)
    return <div className="text-gray-500 p-10 text-center">Select a song</div>;
  if (loading && !chartData)
    return (
      <div className="text-pink-400 p-10 text-center animate-pulse">
        Loading...
      </div>
    );
  if (error)
    return <div className="text-red-400 p-10 text-center">{error}</div>;

  const lastNoteNum = notes.length > 0 ? notes[notes.length - 1].number : 0;
  const TOTAL_HEIGHT = lastNoteNum * zoom + 300; // Extra padding bawah

  // RENDER LANES (Dengan Warna Atribut)
  const renderLanes = () => (
    <div className="absolute inset-0 flex pointer-events-none">
      {[1, 2, 3, 4, 5].map((visualLane) => {
        const originalDataLane = DATA_LANE_MAP_INV[visualLane];
        const stat = laneStats.data[originalDataLane];

        // Ambil Atribut (Vo/Da/Vi) dari chartData
        // Ingat: Array attributes di JSON urutannya 0-4 (Lane 1-5)
        const attrId = chartData?.attributes
          ? chartData.attributes[originalDataLane - 1]
          : 0;
        const attrStyle = ATTRIBUTE_COLORS[attrId] || ATTRIBUTE_COLORS[0];

        // Label Logic
        let label = "少";
        let labelColor = "text-gray-600";
        if (stat.hasSP) {
          label = "SP";
          labelColor = "text-pink-500 font-bold drop-shadow-md";
        } else if (stat.count > laneStats.threshold) {
          label = "多";
          labelColor = "text-gray-200";
        }

        return (
          <div
            key={visualLane}
            className={`flex-1 border-r ${attrStyle.border} ${attrStyle.bg} last:border-r-0 relative`}
          >
            {/* Header Label (Vo/Da/Vi) */}
            <div
              className={`absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center`}
            >
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${attrStyle.bg} ${attrStyle.text} border ${attrStyle.border}`}
              >
                {ATTRIBUTE_NAMES[attrId]}
              </span>
            </div>

            {/* Stat Label (SP/More/Less) */}
            <div
              className={`absolute -top-6 left-1/2 -translate-x-1/2 text-xs ${labelColor} font-mono`}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full h-full bg-gray-900 rounded-xl border border-gray-800 relative flex flex-col shadow-inner">
      {/* HEADER CONTROLS */}
      <div className="bg-gray-800 p-2 flex flex-wrap justify-between items-center px-4 border-b border-gray-700 z-50">
        <div className="flex flex-col">
          <span className="font-mono text-pink-500 font-bold text-xs">
            {chartId}
          </span>
          <span className="text-[10px] text-gray-400">
            Showing: {visibleNotes.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 bg-green-700 hover:bg-green-600 rounded text-white"
            title="Download Image"
          >
            <Camera size={14} />
          </button>
          {/* <button
            onClick={() => setShowAllNotes(!showAllNotes)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            {showAllNotes ? <Eye size={14} /> : <EyeOff size={14} />}
          </button> */}
          <div className="flex items-center gap-1 bg-gray-900/50 px-2 py-1 rounded">
            <input
              type="range"
              min="2"
              max="15"
              step="0.5"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-16 h-1 bg-gray-600 rounded cursor-pointer accent-pink-500"
            />
          </div>
        </div>
      </div>

      {/* Scrollable Area (Ini yang akan di-screenshot) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 relative">
        {/* 1. WRAPPER BARU (Pindahkan ref ke sini) */}
        {/* Kita beri padding-top (pt-24) untuk memberi ruang bagi Header yang posisinya -top-xx */}
        <div
          ref={chartRef}
          className="w-full min-h-full bg-gray-900 pt-24 pb-20 flex justify-center"
        >
          {/* 2. INNER CHART (Hapus my-16 dan ref dari sini) */}
          {/* Hapus margin vertical (my-16) karena sudah dihandle oleh padding wrapper */}
          <div
            className="relative bg-gray-900"
            style={{ width: "100%", maxWidth: "500px", height: TOTAL_HEIGHT }}
          >
            {renderLanes()}

            {/* Start Line */}
            <div className="absolute top-0 w-full border-t-2 border-pink-500/50 text-center z-0">
              <span className="bg-pink-900/50 text-pink-200 text-[9px] px-2 py-0.5 rounded-b font-bold tracking-widest">
                START
              </span>
            </div>

            {visibleNotes.map((note, idx) => {
              // Logic Visual Map (4-2-1-3-5)
              const visualLane = VISUAL_LANE_MAP[note.position] || 3;
              const leftPercent = (visualLane - 1) * 20 + 10;
              const topPosition = note.number * zoom;

              // Ambil warna berdasarkan atribut lane aslinya
              const attrId = chartData?.attributes
                ? chartData.attributes[note.position - 1]
                : 0;
              const colorTheme =
                ATTRIBUTE_COLORS[attrId] || ATTRIBUTE_COLORS[0];

              let noteClass = "";
              let content = "";
              let zIndex = 10;

              if (note.type === 2) {
                // A Skill
                noteClass = `w-8 h-8 ${colorTheme.note} border-2 border-white rounded-full shadow-lg flex items-center justify-center font-bold text-xs text-white`;
                content = note.comboIndex.toString();
                zIndex = 20;
              } else if (note.type === 3) {
                // SP Skill
                noteClass =
                  "w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 border-2 border-yellow-200 rounded-full shadow-xl flex items-center justify-center font-bold text-sm text-white animate-pulse";
                content = note.comboIndex.toString() || "SP";
                zIndex = 30;
              } else {
                // Tap
                // Ubah warna tap biar agak kelihatan di background gelap
                noteClass = "w-2 h-2 bg-white/60 rounded-full";
                zIndex = 5;
              }

              const tooltipText = [
                `Combo: #${note.comboIndex}`,
                `Lane: ${note.position}`,
                note.gap ? `Gap: +${note.gap}` : "Gap: Start",
              ].join(" | ");

              return (
                <div
                  key={`${note.id}-${idx}`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 select-none hover:scale-110 cursor-help ${noteClass}`}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPosition}px`,
                    zIndex,
                  }}
                  title={tooltipText}
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeatmapVisualizer;
