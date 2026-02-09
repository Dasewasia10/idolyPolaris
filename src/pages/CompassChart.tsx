import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import Draggable, { DraggableEventHandler } from "react-draggable";
import axios from "axios";
import { X, Download, Plus, Search, Trash2 } from "lucide-react"; // Pastikan install lucide-react atau ganti icon

// --- Interfaces ---
interface Character {
  name: string;
  japaneseName: string;
  color: string;
  // Sesuaikan dengan response API kamu jika ada field lain
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

// --- Sub-Component untuk Draggable Icon (PENTING untuk fix useRef error) ---
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

  // Handler saat drag berhenti
  const handleStop: DraggableEventHandler = (_e, data) => {
    onStop(icon.id, data.x, data.y);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      position={{ x: icon.x, y: icon.y }} // Controlled position
      onStop={handleStop}
    >
      <div
        ref={nodeRef}
        className="absolute flex flex-col items-center group cursor-grab active:cursor-grabbing w-16 z-20"
        // Style ini menempatkan titik (0,0) dragger di tengah container
        style={{
          top: "50%",
          left: "50%",
          marginLeft: "-2rem", // Setengah dari width (w-16 = 4rem)
          marginTop: "-2rem", // Setengah dari height (asumsi icon tinggi ~4rem total)
        }}
      >
        {/* Tombol Hapus (Muncul saat hover) */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Mencegah drag saat klik hapus
            onRemove(icon.id);
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-30"
          title="Remove"
        >
          <X size={12} />
        </button>

        {/* Gambar Icon */}
        <img
          src={icon.src}
          alt={icon.name}
          className="w-12 h-12 rounded-full border-2 border-white shadow-md pointer-events-none select-none"
        />

        {/* Nama Karakter */}
        <span className="mt-1 text-[10px] font-bold text-gray-700 bg-white/80 px-1 rounded shadow-sm whitespace-nowrap pointer-events-none select-none">
          {icon.name}
        </span>
      </div>
    </Draggable>
  );
};

// --- Main Component ---
const CompassChart: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeIcons, setActiveIcons] = useState<Icon[]>([]);

  const [title, setTitle] = useState("Title here");

  // State Label 4 Arah
  const [labels, setLabels] = useState<AxisLabels>({
    top: "Energetic",
    bottom: "Calm",
    left: "Introvert",
    right: "Extrovert",
  });

  const [showIconSelector, setShowIconSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const chartRef = useRef<HTMLDivElement>(null);

  // Title Page Dynamic
  useEffect(() => {
    document.title = "Polaris Idoly | Compass Chart";

    return () => {
      document.title = "Polaris Idoly";
    };
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await axios.get(
          "https://diveidolypapi.my.id/api/characters",
        );
        // Sort karakter berdasarkan nama
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
    const formattedName = characterName.toLowerCase().replace(/\s+/g, "");
    return `https://api.diveidolypapi.my.id/iconCharacter/chara-${formattedName}.png`;
  };

  // Handlers
  const handleIconDrag = (id: number, x: number, y: number) => {
    setActiveIcons((prev) =>
      prev.map((icon) => (icon.id === id ? { ...icon, x, y } : icon)),
    );
  };

  const addIconToChart = (character: Character) => {
    const newIcon: Icon = {
      id: Date.now(), // Unique ID
      name: character.name,
      src: getCharacterIconUrl(character.name),
      x: 0, // Mulai di tengah (0,0)
      y: 0,
    };
    setActiveIcons((prev) => [...prev, newIcon]);
    setShowIconSelector(false); // Opsional: tutup modal setelah pilih
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
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: "#ffffff", // Pastikan background putih
          scale: 2, // Kualitas lebih tinggi
        });
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `compass_chart-${title}.png`);
          }
        });
      } catch (error) {
        console.error("Download failed:", error);
      }
    }
  };

  // Filter Search
  const filteredCharacters = characters.filter((char) =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-900 p-4 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- KOLOM KIRI: Controls & Labels --- */}
        <div className="lg:col-span-1 space-y-6">
          <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex justify-center lg:justify-start">
            Compass Chart
          </h1>
          <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-400">
              Chart Settings
            </h2>

            {/* Axis Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex border-b border-slate-500 mx-2"></div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                  Top Label (Y+)
                </label>
                <input
                  type="text"
                  value={labels.top}
                  onChange={(e) => handleLabelChange("top", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                  Bottom Label (Y-)
                </label>
                <input
                  type="text"
                  value={labels.bottom}
                  onChange={(e) => handleLabelChange("bottom", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                  Left Label (X-)
                </label>
                <input
                  type="text"
                  value={labels.left}
                  onChange={(e) => handleLabelChange("left", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                  Right Label (X+)
                </label>
                <input
                  type="text"
                  value={labels.right}
                  onChange={(e) => handleLabelChange("right", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => setShowIconSelector(true)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                <Plus size={18} /> Add Character
              </button>

              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                <Download size={18} /> Download Chart
              </button>

              <button
                onClick={() => setActiveIcons([])}
                className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-lg font-medium transition-colors"
              >
                <Trash2 size={18} /> Clear Chart
              </button>
            </div>
          </div>
        </div>

        {/* --- KOLOM KANAN: Chart Area --- */}
        <div className="lg:col-span-2">
          <p className="text-center text-gray-400 text-sm mb-4">
            Drag icons from (+ Add Character) to position them on the spectrum.
            Double click or hover to remove.
          </p>
          <div className="bg-gray-800 p-1 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
            {/* Chart Container 
              - Ref dipasang di sini untuk capture html2canvas
              - Relative positioning untuk Draggable items
            */}
            <div
              ref={chartRef}
              className="relative w-full aspect-square bg-gray-800 overflow-hidden"
              style={{ minHeight: "500px" }}
            >
              {/* Grid Background (Optional Gimmick) */}
              <div
                className="absolute inset-0 pointer-events-none opacity-5"
                style={{
                  backgroundImage:
                    "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {/* --- AXIS LINES --- */}
              {/* Vertical Line */}
              <div className="absolute top-8 bottom-8 left-1/2 w-0.5 bg-gray-300 transform -translate-x-1/2"></div>
              {/* Horizontal Line */}
              <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>

              {/* --- AXIS LABELS --- */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-sm font-bold text-gray-600 bg-white px-2 py-1 rounded shadow-sm border">
                {labels.top}
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm font-bold text-gray-600 bg-white px-2 py-1 rounded shadow-sm border">
                {labels.bottom}
              </div>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 lg:-translate-x-1/2 text-sm font-bold text-gray-600 bg-white px-2 py-1 rounded shadow-sm border -rotate-90 md:rotate-0 lg:-rotate-90 origin-center">
                {labels.left}
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 lg:translate-x-1/2 text-sm font-bold text-gray-600 bg-white px-2 py-1 rounded shadow-sm border rotate-90 md:rotate-0 lg:rotate-90 origin-center">
                {labels.right}
              </div>

              {/* --- DRAGGABLE ICONS --- */}
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
        </div>
      </div>

      {/* --- MODAL: Icon Selector --- */}
      {showIconSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
            {/* Modal Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">Select Character</h3>
              <button
                onClick={() => setShowIconSelector(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b bg-gray-50">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search character..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Character Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredCharacters.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                  {filteredCharacters.map((char) => (
                    <button
                      key={char.name}
                      onClick={() => addIconToChart(char)}
                      className="group flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-400 transition-all">
                        <img
                          src={getCharacterIconUrl(char.name)}
                          alt={char.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs text-center font-medium text-gray-600 group-hover:text-blue-600 truncate w-full">
                        {char.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  No characters found.
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
