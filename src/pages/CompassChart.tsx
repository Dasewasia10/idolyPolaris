import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import Draggable, { DraggableEventHandler } from "react-draggable";
import axios from "axios";
import { X, Download, Plus, Search, Trash2, Share2, Move } from "lucide-react";

// --- Interfaces ---
interface Character {
  name: string;
  japaneseName: string;
  color: string;
}

interface Icon {
  id: number;
  name: string;
  src: string;
  x: number;
  y: number;
}

interface AxisLabels {
  top: string;
  bottom: string;
  left: string;
  right: string;
}

// --- Sub-Component Draggable Icon ---
interface DraggableIconProps {
  icon: Icon;
  onStop: (id: number, x: number, y: number) => void;
  onRemove: (id: number) => void;
}

const DraggableIcon: React.FC<DraggableIconProps> = ({
  icon,
  onStop,
  onRemove,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleStop: DraggableEventHandler = (_e, data) => {
    onStop(icon.id, data.x, data.y);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      position={{ x: icon.x, y: icon.y }}
      onStop={handleStop}
    >
      <div
        ref={nodeRef}
        className="absolute flex flex-col items-center group cursor-grab active:cursor-grabbing w-16 z-20"
        style={{
          top: "50%",
          left: "50%",
          marginLeft: "-2rem",
          marginTop: "-2rem",
        }}
      >
        {/* Remove Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(icon.id);
          }}
          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-lg z-30 scale-75 hover:scale-100"
          title="Remove Data"
        >
          <X size={12} />
        </button>

        {/* Icon Image with Tech Ring */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full border border-cyan-500/50 animate-pulse"></div>
          <img
            src={icon.src}
            alt={icon.name}
            crossOrigin="anonymous"
            className="w-12 h-12 rounded-full border-2 border-white/20 bg-black/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] pointer-events-none select-none object-cover"
          />
        </div>

        {/* Name Tag */}
        <div className="mt-1 px-2 py-0.5 bg-black/70 border border-white/10 rounded text-[9px] font-bold text-cyan-100 tracking-wider backdrop-blur-sm pointer-events-none select-none whitespace-nowrap">
          {icon.name}
        </div>

        {/* Connector Line (Visual Gimmick) */}
        <div className="absolute top-1/2 left-1/2 w-full h-[1px] bg-cyan-500/20 -z-10 hidden group-active:block"></div>
      </div>
    </Draggable>
  );
};

// --- Main Component ---
const CompassChart: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeIcons, setActiveIcons] = useState<Icon[]>([]);
  const [title, setTitle] = useState("LOVING MANAGER");

  const [labels, setLabels] = useState<AxisLabels>({
    top: "CLOSE",
    bottom: "FAR",
    left: "PASSIVE",
    right: "ACTIVE",
  });

  const [showIconSelector, setShowIconSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Polaris Idoly | Compass Chart";
    const fetchCharacters = async () => {
      try {
        const response = await axios.get(
          "https://beip.dasewasia.my.id/api/characters",
        );
        const sorted = response.data.sort((a: Character, b: Character) =>
          a.name.localeCompare(b.name),
        );
        setCharacters(sorted);
      } catch (error) {
        console.error("Error fetching characters:", error);
      }
    };
    fetchCharacters();
  }, []);

  const getCharacterIconUrl = (characterName: string) => {
    let assetName = characterName.toLowerCase().replace(/\s+/g, "");

    if (characterName.toLowerCase() === "snow") {
      assetName = "smiku";
    }

    return `https://apiip.dasewasia.my.id/iconCharacter/chara-${assetName}.png`;
  };

  const handleIconDrag = (id: number, x: number, y: number) => {
    setActiveIcons((prev) =>
      prev.map((icon) => (icon.id === id ? { ...icon, x, y } : icon)),
    );
  };

  const addIconToChart = (character: Character) => {
    const newIcon: Icon = {
      id: Date.now(),
      name: character.name,
      src: getCharacterIconUrl(character.name),
      x: 0,
      y: 0,
    };
    setActiveIcons((prev) => [...prev, newIcon]);
    setShowIconSelector(false);
  };

  const removeIconFromChart = (id: number) => {
    setActiveIcons((prev) => prev.filter((icon) => icon.id !== id));
  };

  const handleLabelChange = (key: keyof AxisLabels, value: string) => {
    setLabels((prev) => ({ ...prev, [key]: value }));
  };

  const handleDownload = async () => {
    if (chartRef.current) {
      try {
        // Trik agar background transparan saat download tidak hitam pekat, tapi sesuai style
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: "#0f1115",
          scale: 2,
        });
        canvas.toBlob((blob) => {
          if (blob) saveAs(blob, `compass_chart-${title}.png`);
        });
      } catch (error) {
        console.error("Download failed:", error);
      }
    }
  };

  const filteredCharacters = characters.filter((char) =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 lg:p-8 font-sans overflow-hidden relative selection:bg-cyan-500 selection:text-black">
      {/* Background Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* --- LEFT PANEL: CONTROLS --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-600 rounded text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              <Share2 size={24} />
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase block">
                Relationship
              </span>
              <h1 className="text-2xl font-black italic tracking-tighter text-white">
                COMPASS{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  CHART&nbsp;
                </span>
              </h1>
            </div>
          </div>

          <div className="bg-[#161b22]/90 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden">
            {/* Decorative Line */}
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>

            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">
              Parameters
            </h2>

            <div className="space-y-5">
              <div className="group">
                <label className="text-[10px] font-bold text-cyan-500 uppercase mb-1 block">
                  Chart Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                      Top Axis (Y+)
                    </label>
                    <input
                      type="text"
                      value={labels.top}
                      onChange={(e) => handleLabelChange("top", e.target.value)}
                      className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                      Left Axis (X-)
                    </label>
                    <input
                      type="text"
                      value={labels.left}
                      onChange={(e) =>
                        handleLabelChange("left", e.target.value)
                      }
                      className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                      Bottom Axis (Y-)
                    </label>
                    <input
                      type="text"
                      value={labels.bottom}
                      onChange={(e) =>
                        handleLabelChange("bottom", e.target.value)
                      }
                      className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                      Right Axis (X+)
                    </label>
                    <input
                      type="text"
                      value={labels.right}
                      onChange={(e) =>
                        handleLabelChange("right", e.target.value)
                      }
                      className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => setShowIconSelector(true)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded font-bold text-sm tracking-wide shadow-lg transition-all"
              >
                <Plus size={16} /> ADD CHARACTER
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded font-bold text-xs tracking-wide transition-all border border-gray-600"
                >
                  <Download size={14} /> EXPORT PNG
                </button>
                <button
                  onClick={() => setActiveIcons([])}
                  className="px-4 bg-red-900/50 hover:bg-red-900/80 border border-red-800 text-red-200 rounded transition-all"
                  title="Clear All"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: CHART AREA --- */}
        <div className="lg:col-span-8">
          <div className="bg-[#0a0c10] border border-white/10 rounded-xl p-1 shadow-2xl relative overflow-hidden group">
            {/* Header Overlay */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-50">
              <div className="text-[10px] font-mono text-cyan-500">
                COORDINATE SYSTEM // V.2026
              </div>
              <div className="text-[10px] font-mono text-gray-500">
                IDOLY PRIDE DATABASE
              </div>
            </div>

            {/* CHART CANVAS */}
            <div
              ref={chartRef}
              className="relative w-full aspect-square bg-[#0a0c10] overflow-hidden"
              style={{ minHeight: "600px" }}
            >
              {/* Radar Grid Background */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Circular Grids */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full border border-white/5"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full border border-white/5"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full border border-white/5"></div>

                {/* Crosshair Lines */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-cyan-500/20"></div>
                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-cyan-500/20"></div>

                {/* Diagonal Lines (Optional) */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/5 rotate-45"></div>
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/5 -rotate-45"></div>
              </div>

              {/* Title Overlay in Chart */}
              <div className="absolute top-4 right-4 text-right pointer-events-none opacity-40">
                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">
                  {title}
                </h3>
              </div>

              {/* Axis Labels (Styled) */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)] pointer-events-none backdrop-blur-sm">
                {labels.top}
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)] pointer-events-none backdrop-blur-sm">
                {labels.bottom}
              </div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-center px-3 py-1 bg-black/60 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)] pointer-events-none backdrop-blur-sm">
                {labels.left}
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 origin-center px-3 py-1 bg-black/60 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)] pointer-events-none backdrop-blur-sm">
                {labels.right}
              </div>

              {/* Active Icons */}
              {activeIcons.map((icon) => (
                <DraggableIcon
                  key={icon.id}
                  icon={icon}
                  onStop={handleIconDrag}
                  onRemove={removeIconFromChart}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 font-mono">
            <Move size={14} />
            <span>DRAG ICONS TO POSITION</span>
            <span className="mx-2 text-gray-700">|</span>
            <span>DOUBLE TAP TO REMOVE</span>
          </div>
        </div>
      </div>

      {/* --- MODAL SELECTOR --- */}
      {showIconSelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#161b22] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] border border-white/10">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-900/20 to-transparent">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Search size={18} className="text-cyan-400" />
                SELECT TARGET
              </h3>
              <button
                onClick={() => setShowIconSelector(false)}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-white/10 bg-[#0d1117]">
              <input
                type="text"
                placeholder="Search by name..."
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {filteredCharacters.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {filteredCharacters.map((char) => (
                    <button
                      key={char.name}
                      onClick={() => addIconToChart(char)}
                      className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-cyan-500/30"
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-cyan-400 transition-all shadow-lg">
                        <img
                          src={getCharacterIconUrl(char.name)}
                          alt={char.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-[10px] text-center font-bold text-gray-400 group-hover:text-cyan-400 truncate w-full uppercase tracking-wide">
                        {char.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 font-mono text-xs">
                  NO DATA FOUND
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompassChart;
