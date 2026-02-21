import React, { useState, useEffect, useRef } from "react";
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";
import {
  Search,
  Download,
  ChevronDown,
  ImageIcon,
  Sparkles,
  Layers,
  Settings,
  PenTool,
  X,
} from "lucide-react";
import axios from "axios";

import Toast from "../components/Toast";
import {
  getCardAttributeImageUrl,
  getCardTypeImageUrl,
  getPlaceholderImageUrl,
} from "../utils/imageUtils";

// --- Interfaces ---
interface Card {
  uniqueId: string;
  initialTitle: string;
  title: {
    japanese: string;
    global: string;
    indo: string;
  };
  initial: number; // Rarity awal
  type: string;
  attribute: string;
  releaseDate: string;
  stats: {
    vocal: number;
    dance: number;
    visual: number;
    stamina: number;
    total: number;
  };
  images: {
    fullNormal: string;
    fullEvolved: string;
    icon: string;
  };
  skillOne?: any;
  skillTwo?: any;
  skillThree?: any;
  skillFour?: any;
  yell?: any;
  sourceName?: string;
  hasAwakening: boolean;
}

const CardDesign: React.FC = () => {
  // --- STATE ---
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Design Config
  const [level, setLevel] = useState(200);
  const [stars, setStars] = useState(5);
  const [photoQuality, setPhotoQuality] = useState(130);
  const [useEvolvedArt, setUseEvolvedArt] = useState(false);
  const [customName, setCustomName] = useState("Makino Kohei"); // Nama Player/Manager

  // Stats (Manual Override)
  const [stats, setStats] = useState({
    vocal: 0,
    dance: 0,
    visual: 0,
    stamina: 0,
  });
  const currentTotal = Math.floor(
    stats.vocal * 0.5 +
      stats.dance * 0.5 +
      stats.visual * 0.5 +
      stats.stamina * 0.8 +
      500,
  );

  // Skill Levels (Skill 1, 2, 3, 4, Yell)
  const [skillLevels, setSkillLevels] = useState([1, 1, 1, 1, 1]);

  // UI State
  const [showSelector, setShowSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  // Scaling State
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const cardRef = useRef<HTMLDivElement>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cardsRes] = await Promise.all([
          axios.get("https://beip.dasewasia.my.id/api/cards"),
        ]);

        // Flatten & Inject Source Name
        const processedCards = cardsRes.data.flatMap((source: any) => {
          const charName = source.name;
          return source.data.map((card: any) => ({
            ...card,
            sourceName: charName,
          }));
        });

        // Sort by Release Date (Newest first)
        processedCards.sort(
          (a: Card, b: Card) =>
            new Date(b.releaseDate).getTime() -
            new Date(a.releaseDate).getTime(),
        );

        setCards(processedCards);
      } catch (error) {
        console.error("Error fetching data:", error);
        setToastMessage("Failed to load cards.");
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-fill stats when card selected
  useEffect(() => {
    if (selectedCard) {
      setStats({
        vocal: selectedCard.stats.vocal,
        dance: selectedCard.stats.dance,
        visual: selectedCard.stats.visual,
        stamina: selectedCard.stats.stamina,
      });
      // Reset config
      setStars(selectedCard.initial > 5 ? 5 : selectedCard.initial);
      setUseEvolvedArt(selectedCard.hasAwakening);
    }
  }, [selectedCard]);

  // --- DYNAMIC SCALING LOGIC ---
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.offsetWidth;
        // Padding 32px (16px left + 16px right)
        const availableWidth = parentWidth - 32;
        const baseWidth = 2048; // Target width of the card

        // Calculate scale, limit max scale to 1 (don't zoom in if screen is huge)
        const newScale = Math.min(availableWidth / baseWidth, 1);
        setScale(newScale);
      }
    };

    // Run on mount and window resize
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedCard]); // Re-calculate if card changes (just in case)

  useEffect(() => {
    document.title = "Polaris Idoly | Card Designer";
    return () => {
      document.title = "Polaris Idoly";
    };
  }, []);

  // --- HANDLERS ---

  const handleDownload = async () => {
    // Menargetkan elemen canvas langsung seperti pada onclone di html2canvas
    const node =
      document.getElementById("card-canvas-target") || cardRef.current;

    if (node) {
      try {
        const blob = await domtoimage.toBlob(node, {
          // Menetapkan ukuran spesifik jika kamu butuh resolusi fix (seperti kodemu sebelumnya)
          width: 2048,
          height: 1152,
          // Menghilangkan efek transform (tilt/hover) saat di-render
          style: {
            transform: "none",
          },
        });

        if (blob) {
          // Sesuaikan nama variabel untuk nama file jika diperlukan,
          // misalnya pakai selectedCard?.title?.global jika ada
          saveAs(blob, `CardDesign_Export.png`);
        }
      } catch (error) {
        console.error("Download failed:", error);
      }
    }
  };

  // Helper untuk Image URL
  const getArtUrl = () => {
    if (!selectedCard) return "";
    return useEvolvedArt
      ? selectedCard.images.fullEvolved
      : selectedCard.images.fullNormal;
  };

  const filteredCards = cards.filter(
    (c) =>
      c.title.global.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sourceName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 lg:p-8 flex flex-col lg:flex-row gap-8 font-sans relative selection:bg-cyan-500 selection:text-black">
      {/* Background Texture (Sama seperti halaman lain) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* --- LEFT COLUMN: CONTROLS (Updated Design) --- */}
      <div className="w-full lg:w-1/3 space-y-6 relative z-10">
        {/* Header Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded text-black shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <PenTool size={20} />
          </div>
          <div>
            <span className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase block">
              Card Maker
            </span>
            <h1 className="text-2xl font-black italic tracking-tighter text-white">
              CARD{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                DESIGNER&nbsp;
              </span>
            </h1>
          </div>
        </div>

        {/* 1. Card Selector (Tech Dropdown) */}
        <div className="bg-[#161b22]/90 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-lg relative overflow-hidden">
          {/* Accent Line */}
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>

          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Layers size={14} /> Base Card Asset
          </label>
          <button
            onClick={() => setShowSelector(true)}
            className="w-full bg-black/40 border border-white/20 hover:border-blue-500 p-3 rounded-lg flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {selectedCard && (
                <img
                  src={selectedCard.images.icon}
                  className="w-8 h-8 rounded border border-white/20"
                />
              )}
              <span
                className={`truncate text-sm ${selectedCard ? "text-white font-bold" : "text-gray-500 italic"}`}
              >
                {selectedCard
                  ? `${selectedCard.sourceName} - ${selectedCard.title.global}`
                  : "Select a card to begin..."}
              </span>
            </div>
            <ChevronDown
              size={18}
              className="text-gray-500 group-hover:text-blue-400"
            />
          </button>
        </div>

        {/* 2. Visual Settings */}
        {selectedCard && (
          <div className="bg-[#161b22]/90 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-lg relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
              <ImageIcon size={14} /> Visual Parameters
            </h3>

            <div className="space-y-5">
              {/* Art Toggle */}
              {selectedCard.hasAwakening && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 font-medium">
                    Evolved Art
                  </span>
                  <button
                    onClick={() => setUseEvolvedArt(!useEvolvedArt)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${useEvolvedArt ? "bg-purple-600" : "bg-gray-700"}`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${useEvolvedArt ? "translate-x-6" : ""}`}
                    />
                  </button>
                </div>
              )}

              {/* Stars */}
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">
                  Rarity (Stars)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStars(s)}
                      className={`w-8 h-8 rounded border transition-all flex items-center justify-center font-bold text-sm ${
                        stars >= s
                          ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                          : "bg-black/40 border-white/10 text-gray-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Name */}
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">
                  Manager Name (Watermark)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors font-mono"
                  placeholder="e.g. Manager-san"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Stats & Skills */}
        {selectedCard && (
          <div className="bg-[#161b22]/90 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-lg relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
              <Settings size={14} /> Stats & Config
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">
                  Level
                </label>
                <input
                  type="number"
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none font-mono text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">
                  Photo Quality
                </label>
                <input
                  type="number"
                  value={photoQuality}
                  onChange={(e) => setPhotoQuality(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none font-mono text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {Object.keys(stats).map((key) => (
                <div key={key}>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">
                    {key}
                  </label>
                  <input
                    type="number"
                    value={stats[key as keyof typeof stats]}
                    onChange={(e) =>
                      setStats({ ...stats, [key]: Number(e.target.value) })
                    }
                    className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none font-mono text-right"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">
                Skill Levels (1 - 2 - 3 - 4 - Yell)
              </label>
              <div className="flex gap-2">
                {skillLevels.map((sl, idx) => (
                  <input
                    key={idx}
                    type="number"
                    value={sl}
                    onChange={(e) => {
                      const newLevels = [...skillLevels];
                      newLevels[idx] = Number(e.target.value);
                      setSkillLevels(newLevels);
                    }}
                    className="w-full bg-black/40 border border-white/20 rounded px-1 py-2 text-sm text-white focus:border-green-500 focus:outline-none font-mono text-center"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={!selectedCard}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95"
        >
          <Download size={20} /> INITIALIZE EXPORT
        </button>
      </div>

      {/* --- RIGHT COLUMN: PREVIEW CANVAS (UPDATED CONTAINER ONLY) --- */}
      <div
        className="w-full lg:w-2/3 bg-[#0a0c10] rounded-3xl border border-white/10 flex flex-col items-center justify-center p-8 relative overflow-hidden group shadow-2xl z-10"
        ref={containerRef}
      >
        {/* Decorative Grid on Preview Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        {/* HUD Elements */}
        <div className="absolute top-4 left-4 text-[10px] font-mono text-gray-500 tracking-widest">
          PREVIEW MODE // SCALE: {scale.toFixed(2)}
        </div>

        {!selectedCard ? (
          <div className="relative z-10 flex flex-col items-center justify-center text-gray-600 animate-pulse">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center mb-4">
              <ImageIcon size={48} />
            </div>
            <p className="font-mono text-sm tracking-[0.2em] uppercase">
              NO SIGNAL INPUT
            </p>
            <p className="text-xs mt-2 text-gray-700">
              Please select a card data source
            </p>
          </div>
        ) : (
          /* CONTAINER SCALING DINAMIS (LOGIKA TIDAK BERUBAH, HANYA STYLE WRAPPER) */
          <div
            style={{
              width: 2048 * scale,
              height: 1152 * scale,
            }}
            className="relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl ring-1 ring-white/10"
          >
            {/* ================================================================
                CORE CARD DESIGN - DO NOT TOUCH
                START OF PROTECTED ZONE 
                ================================================================
            */}
            <div
              ref={cardRef}
              id="card-canvas-target"
              style={{
                width: 2048,
                height: 1152,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              className="absolute top-0 left-0 bg-gray-900 text-white"
            >
              {/* 1. Background Image (Full Art) */}
              <img
                src={getArtUrl()}
                alt="Art"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

              {/* 2. Header Info */}
              <div className="absolute top-8 left-8 flex items-center gap-4 z-10">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 shadow-lg">
                  <img
                    src={getCardAttributeImageUrl(selectedCard.attribute)}
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 shadow-lg">
                  <img
                    src={getCardTypeImageUrl(selectedCard.type)}
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>

              {/* 3. Rarity Stars */}
              <div className="absolute top-8 right-8 flex gap-1 z-10">
                {Array.from({ length: stars }).map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-16 h-16 text-yellow-400"
                    style={{
                      filter: "drop-shadow(0px 4px 4px rgba(0,0,0,0.6))",
                    }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                ))}
              </div>

              {/* 4. Main Stats & Info */}
              <div className="absolute bottom-12 left-12 right-12 z-10">
                {/* Title & Name */}
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-blue-200 drop-shadow-md mb-2 text-shadow-lg text-shadow">
                    {selectedCard.initialTitle}
                  </h2>
                  <h1 className="text-6xl font-black text-white drop-shadow-lg leading-tight tracking-tight line-clamp-2 text-shadow">
                    {selectedCard.title.global}
                  </h1>
                  {customName && (
                    <p className="text-3xl text-gray-300 mt-2 font-mono flex items-center gap-2">
                      <Sparkles size={32} className="text-yellow-400" />{" "}
                      {customName}
                    </p>
                  )}
                </div>

                {/* --- INFO ROW: Level, Total, PQ --- */}
                <div className="flex items-end justify-between mb-8 border-b border-white/30 pb-6 gap-6">
                  {/* Level (Kiri) */}
                  <div className="flex items-baseline gap-2 text-shadow">
                    <span className="text-3xl font-bold text-gray-400">
                      Lv.
                    </span>
                    <span className="text-7xl font-black text-white italic tracking-tighter">
                      {level}
                    </span>
                  </div>

                  {/* Total Power (Tengah - BARU) */}
                  <div className="flex flex-col items-center pb-1">
                    <span className="text-8xl font-black text-white italic tracking-tighter text-shadow">
                      {currentTotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Photo Quality (Kanan) */}
                  <div className="bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20 flex flex-col items-center min-w-[140px]">
                    <span className="text-xs font-bold text-pink-800 uppercase tracking-wider mb-1">
                      Photo Quality
                    </span>
                    <span className="text-4xl font-black text-white">
                      {photoQuality}
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-8 mb-8">
                  {[
                    {
                      label: "Vocal",
                      val: stats.vocal,
                      color: "text-pink-400",
                    },
                    {
                      label: "Dance",
                      val: stats.dance,
                      color: "text-blue-400",
                    },
                    {
                      label: "Visual",
                      val: stats.visual,
                      color: "text-yellow-400",
                    },
                    {
                      label: "Stamina",
                      val: stats.stamina,
                      color: "text-green-400",
                    },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border-l-8 border-white/50"
                    >
                      <div
                        className={`text-2xl font-bold uppercase tracking-wider ${s.color}`}
                      >
                        {s.label}
                      </div>
                      <div className="text-5xl font-black text-white mt-1">
                        {s.val.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills Row */}
                <div className="flex gap-6 mt-10">
                  {[
                    selectedCard.skillOne,
                    selectedCard.skillTwo,
                    selectedCard.skillThree,
                    selectedCard.skillFour,
                    selectedCard.yell,
                  ]
                    .filter(Boolean)
                    .map((skill, idx) => (
                      <div key={idx} className="relative group w-32 h-32">
                        <img
                          src={
                            skill?.source?.initialImage ||
                            getPlaceholderImageUrl("square")
                          }
                          className="w-full h-full rounded-2xl border-4 border-white/40 bg-black/50 object-cover"
                        />
                        <div className="absolute -top-6 -right-6 bg-gray-600 text-white text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-full border-4 border-white shadow-md">
                          {skillLevels[idx]}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-sm text-center font-bold py-1.5 rounded-b-xl truncate px-2">
                          {skill?.typeSkill || "Yell"}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Watermark */}
              <div className="absolute bottom-6 right-8 text-white/30 text-3xl font-bold z-10">
                Polaris Idoly
              </div>
            </div>
            {/* ================================================================
                END OF PROTECTED ZONE 
                ================================================================
            */}
          </div>
        )}
      </div>

      {/* --- MODAL SELECTOR (UPDATED) --- */}
      {showSelector && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#161b22] border border-white/10 w-full max-w-4xl h-[80vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-transparent">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Search size={20} className="text-blue-400" /> Select Base Card
              </h2>
              <button
                onClick={() => setShowSelector(false)}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-[#0d1117] border-b border-white/10">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name, title, or character..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-12 pr-4 py-3 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {loading ? (
                <p className="col-span-full text-center py-10 text-gray-500 font-mono animate-pulse">
                  ACCESSING DATABASE...
                </p>
              ) : (
                filteredCards.slice(0, 50).map((card) => (
                  <button
                    key={card.uniqueId}
                    onClick={() => {
                      setSelectedCard(card);
                      setShowSelector(false);
                    }}
                    className="flex flex-col items-center bg-[#1f2937]/50 border border-white/5 hover:border-blue-500/50 hover:bg-[#1f2937] rounded-xl p-3 transition-all hover:scale-[1.02] group"
                  >
                    <div className="relative mb-2">
                      <img
                        src={card.images.icon}
                        className="w-20 h-20 rounded-lg object-cover shadow-lg group-hover:shadow-blue-500/20"
                        loading="lazy"
                      />
                      <div className="absolute top-0 right-0 -mr-1 -mt-1 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">
                      {card.sourceName}
                    </span>
                    <span className="text-xs text-center font-bold text-gray-200 line-clamp-2 leading-tight group-hover:text-blue-300">
                      {card.title.global}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          isSuccess={isSuccess}
          onClose={() => setToastMessage("")}
        />
      )}
    </div>
  );
};

export default CardDesign;
