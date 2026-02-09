import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import {
  Search,
  Download,
  ChevronDown,
  ImageIcon,
  Sparkles,
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

  // Skill Levels (Skill 1, 2, 3, Yell)
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
          axios.get("https://diveidolypapi.my.id/api/cards"),
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
    if (!cardRef.current || !selectedCard) return;
    setToastMessage("Generating image...");

    try {
      // Tunggu render
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        // PENTING: Paksa ukuran canvas sesuai ukuran asli kartu (1000x1400)
        windowWidth: 2048,
        windowHeight: 1152,
        // Scale 1 atau 2 tergantung resolusi yang dimau (2 = HD)
        scale: 1,

        // Fungsi ini memastikan elemen yang dicapture TIDAK terkena scale CSS dari preview
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById("card-canvas-target");
          if (el) {
            // Reset semua transformasi CSS agar gambar tidak gepeng
            el.style.transform = "none";
          }
        },
      });

      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `card_design_${selectedCard.uniqueId}.png`);
          setToastMessage("Image downloaded!");
          setIsSuccess(true);
        }
      });
    } catch (error) {
      console.error(error);
      setToastMessage("Failed to generate image.");
      setIsSuccess(false);
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
    <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-8 flex flex-col lg:flex-row gap-8 font-sans">
      {/* --- LEFT COLUMN: CONTROLS --- */}
      <div className="w-full lg:w-1/3 space-y-6 overflow-y-auto no-scrollbar">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Card Designer
        </h1>

        {/* 1. Card Selector */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <label className="block text-sm text-gray-400 mb-2">
            Select Base Card
          </label>
          <button
            onClick={() => setShowSelector(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded-lg flex items-center justify-between transition-colors"
          >
            <span className="truncate">
              {selectedCard
                ? `${selectedCard.sourceName} - ${selectedCard.title.global}`
                : "Choose a card..."}
            </span>
            <ChevronDown size={18} />
          </button>
        </div>

        {/* 2. Visual Settings */}
        {selectedCard && (
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-4">
            <h3 className="font-bold text-lg border-b border-gray-700 pb-2">
              Visual Settings
            </h3>

            {/* Art Toggle */}
            {selectedCard.hasAwakening && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Use Evolved Art</span>
                <button
                  onClick={() => setUseEvolvedArt(!useEvolvedArt)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${useEvolvedArt ? "bg-blue-600" : "bg-gray-600"}`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${useEvolvedArt ? "translate-x-6" : ""}`}
                  />
                </button>
              </div>
            )}

            {/* Stars */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Rarity (Stars)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStars(s)}
                    className={`w-8 h-8 rounded flex items-center justify-center font-bold transition-all ${
                      stars >= s
                        ? "bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                        : "bg-gray-700 text-gray-500"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Player Name (Watermark)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:border-blue-500 outline-none"
                placeholder="e.g. Manager-san"
              />
            </div>
          </div>
        )}

        {/* 3. Stats & Skills */}
        {selectedCard && (
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-4">
            <h3 className="font-bold text-lg border-b border-gray-700 pb-2">
              Stats & Levels
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400">Level</label>
                <input
                  type="number"
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Photo Quality</label>
                <input
                  type="number"
                  value={photoQuality}
                  onChange={(e) => setPhotoQuality(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.keys(stats).map((key) => (
                <div key={key}>
                  <label className="text-xs text-gray-400 capitalize">
                    {key}
                  </label>
                  <input
                    type="number"
                    value={stats[key as keyof typeof stats]}
                    onChange={(e) =>
                      setStats({ ...stats, [key]: Number(e.target.value) })
                    }
                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Skill Levels (1, 2, 3, 4, Yell)
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
                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-center"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={!selectedCard}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg"
        >
          <Download size={20} /> Export Image
        </button>
      </div>

      {/* --- RIGHT COLUMN: PREVIEW CANVAS --- */}
      <div
        className="w-full lg:w-2/3 bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-start p-4 relative"
        ref={containerRef} // Reference untuk menghitung width
      >
        {!selectedCard ? (
          <div className="self-center my-auto text-center text-gray-500">
            <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
            <p>Select a card to start designing</p>
          </div>
        ) : (
          /* CONTAINER SCALING DINAMIS */
          /* Kita set height container secara eksplisit berdasarkan scale
             agar container parent tidak collapse atau memiliki scrollbar berlebih.
             Height = (Tinggi Asli * Scale) + padding
          */
          <div
            style={{
              width: 2048 * scale,
              height: 1152 * scale,
            }}
            className="relative overflow-hidden shadow-2xl rounded-3xl" // Rounded di sini untuk tampilan preview
          >
            {/* CANVAS UTAMA */}
            <div
              ref={cardRef}
              id="card-canvas-target"
              style={{
                width: 2048,
                height: 1152,
                transform: `scale(${scale})`,
                transformOrigin: "top left", // Penting agar scaling mulai dari pojok kiri atas container
              }}
              className="absolute top-0 left-0 bg-gray-900 text-white"
            >
              {/* 1. Background Image (Full Art) */}
              <img
                src={getArtUrl()}
                alt="Art"
                crossOrigin="anonymous"
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
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 shadow-lg">
                  <img
                    src={getCardTypeImageUrl(selectedCard.type)}
                    className="w-16 h-16 object-contain"
                    crossOrigin="anonymous"
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
                    // Ganti warna di sini (text-yellow-400)
                    className="w-16 h-16 text-yellow-400"
                    // Style filter ini dibaca sempurna oleh html2canvas untuk shadow
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
                          crossOrigin="anonymous"
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
          </div>
        )}
      </div>

      {/* --- MODAL SELECTOR --- */}
      {showSelector && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 w-full max-w-4xl h-[80vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
              <h2 className="text-xl font-bold">Select a Card</h2>
              <button
                onClick={() => setShowSelector(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-gray-500"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by name or title..."
                  className="w-full bg-gray-900 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 scrollbar-thin">
              {loading ? (
                <p className="col-span-full text-center py-10">
                  Loading cards...
                </p>
              ) : (
                filteredCards.slice(0, 50).map((card) => (
                  <button
                    key={card.uniqueId}
                    onClick={() => {
                      setSelectedCard(card);
                      setShowSelector(false);
                    }}
                    className="flex flex-col items-center bg-gray-700 hover:bg-gray-600 rounded-lg p-2 transition-all hover:scale-105"
                  >
                    <img
                      src={card.images.icon}
                      className="w-20 h-20 rounded-md object-cover mb-2"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                    <span className="text-xs text-center font-bold text-blue-300 truncate w-full">
                      {card.sourceName}
                    </span>
                    <span className="text-[10px] text-center text-gray-300 line-clamp-2 leading-tight">
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
