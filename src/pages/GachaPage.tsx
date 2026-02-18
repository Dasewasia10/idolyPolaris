import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Sparkles, Zap, History, CreditCard } from "lucide-react";
import { Card } from "../interfaces/Card";
import { getPlaceholderImageUrl } from "../utils/imageUtils";

// --- CONFIG ---
const API_BASE = "https://beip.dasewasia.my.id/api";
const BANNER_IMG_BASE = "https://apiip.dasewasia.my.id/gachaBanner";
const IMG_BASE_URL = "https://apiip.dasewasia.my.id";

interface PoolResponse {
  bannerInfo: {
    id: string;
    name: string;
    assetId: string;
    startAt: string;
    category: string;
    exchangeLimit: number;
  };
  rateUpCards: Card[];
  pool: Card[];
}

const GachaPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [bannerData, setBannerData] = useState<PoolResponse | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [history, setHistory] = useState<Card[]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    if (!id) return;
    const fetchPool = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/gachas/${id}/pool`);
        if (!res.data || !res.data.pool) throw new Error("Data pool kosong");
        setBannerData(res.data);
      } catch (err) {
        console.error("Gagal load pool:", err);
        alert("Gagal memuat data banner.");
        navigate("/gacha");
      } finally {
        setLoading(false);
      }
    };
    fetchPool();
  }, [id, navigate]);

  useEffect(() => {
    document.title = "Polaris Idoly | Gacha Terminal";
    return () => {
      document.title = "Polaris Idoly";
    };
  }, []);

  // --- 2. PREPARE POOLS ---
  const { standard5, standard4, standard3 } = useMemo(() => {
    if (!bannerData) return { standard5: [], standard4: [], standard3: [] };
    const p5 = bannerData.pool.filter((c) => Number(c.initial) === 5);
    const p4 = bannerData.pool.filter((c) => Number(c.initial) === 4);
    const p3 = bannerData.pool.filter((c) => Number(c.initial) <= 3);
    return { standard5: p5, standard4: p4, standard3: p3 };
  }, [bannerData]);

  // --- LOGIKA GACHA (TIDAK DIUBAH SAMA SEKALI) ---
  const getRandom = (arr: Card[]) => {
    if (arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const pullCard = (): Card | null => {
    if (!bannerData) return null;
    const rand = Math.random();
    const RATE_5 = 0.035;
    const RATE_4 = 0.15;
    const RATE_UP_CHANCE = 0.5;

    // 5 Star Logic
    if (rand < RATE_5) {
      if (bannerData.rateUpCards.length > 0) {
        if (Math.random() < RATE_UP_CHANCE) {
          return getRandom(bannerData.rateUpCards);
        }
      }
      if (standard5.length === 0) {
        return getRandom(bannerData.rateUpCards) || null;
      }
      return getRandom(standard5);
    }

    // 4 Star Logic
    if (rand < RATE_5 + RATE_4) {
      if (standard4.length === 0) return getRandom(standard3);
      return getRandom(standard4);
    }

    // 3 Star Logic
    if (standard3.length === 0) return null;
    return getRandom(standard3);
  };

  const handleGacha = (count: number) => {
    if (isAnimating || !bannerData) return;

    setIsAnimating(true);
    setHistory([]);

    setTimeout(() => {
      const results: Card[] = [];
      for (let i = 0; i < count; i++) {
        const c = pullCard();
        if (c) results.push(c);
      }
      setHistory(results);
      setPoints((prev) => prev + count);
      setIsAnimating(false);
    }, 1000); // Sedikit delay untuk efek "Processing"
  };

  // --- HELPER & UI LOGIC ---
  const exchangeLimit = bannerData?.bannerInfo.exchangeLimit || 200;
  const canSpark = points >= exchangeLimit;

  const getCardImageUrl = (
    card: { initialTitle: string; initial: number; hasAwakening?: boolean },
    type: "full" | "thumb" | "upper",
    isEvolved: boolean = false,
  ) => {
    const assetId = card.initialTitle;
    const rarity = card.initial;
    const hasAwakening = card.hasAwakening ?? false;

    // Config folder & ext
    const config = {
      full: { folder: "cardFull", ext: "webp" },
      thumb: { folder: "cardThumb", ext: "png" },
      upper: { folder: "cardUpper", ext: "png" },
    };
    const { folder, ext } = config[type];

    let index = 1;
    if (rarity < 5) {
      index = isEvolved ? 1 : 0;
    } else if (rarity === 5 && hasAwakening) {
      index = isEvolved ? 2 : 1;
    } else {
      index = 1;
    }

    return `${IMG_BASE_URL}/${folder}/img_card_${type}_${index}_${assetId}.${ext}`;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-pink-400 font-mono tracking-widest animate-pulse">
        INITIALIZING TERMINAL...
      </div>
    );
  if (!bannerData) return null;

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 lg:p-8 font-sans selection:bg-pink-500 selection:text-white">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/gacha")}
              className="p-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold bg-gray-800 text-gray-300 border border-gray-600 px-2 py-0.5 rounded tracking-wider uppercase">
                  {bannerData.bannerInfo.category}
                </span>
                <span className="text-[10px] font-mono text-gray-500">
                  ID: {bannerData.bannerInfo.assetId}
                </span>
              </div>
              <h1 className="text-xl font-black italic tracking-tighter text-white uppercase max-w-xl truncate">
                {bannerData.bannerInfo.name}
              </h1>
            </div>
          </div>

          {/* Points Counter */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              Exchange Pts
            </span>
            <div className="flex items-baseline gap-1 text-pink-400">
              <span className="text-3xl font-black font-mono">{points}</span>
              <span className="text-sm font-bold text-gray-600">
                / {exchangeLimit}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT: BANNER DISPLAY (7 Cols) --- */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#161b22] shadow-2xl">
              {/* Tech Borders */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-pink-500 z-20 rounded-tl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-pink-500 z-20 rounded-br-lg"></div>

              {/* Banner Image */}
              <div className="aspect-[2/1] w-full relative">
                <img
                  src={`${BANNER_IMG_BASE}/img_banner_l_gacha-${bannerData.bannerInfo.assetId}.png`}
                  alt="Banner"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getPlaceholderImageUrl("rect");
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-transparent to-transparent opacity-80 pointer-events-none"></div>
              </div>

              {/* Rate Up Mini Icons */}
              {bannerData.rateUpCards.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
                  <div>
                    <span className="text-[10px] text-pink-300 font-bold uppercase tracking-widest mb-2 block items-center gap-1">
                      <Sparkles size={12} /> Rate Up Idols
                    </span>
                    <div className="flex gap-2">
                      {bannerData.rateUpCards.map((c) => (
                        <div key={c.uniqueId} className="relative group/icon">
                          <img
                            src={getCardImageUrl(c, "thumb", false)}
                            className="w-12 h-12 rounded border border-white/20 bg-black/50"
                            alt="icon"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Exchange Action */}
            {canSpark && (
              <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/50 p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-left duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500 text-black rounded-lg shadow-lg">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-yellow-100 text-sm">
                      EXCHANGE AVAILABLE
                    </h3>
                    <p className="text-[10px] text-yellow-200/70">
                      Select your idol now.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    alert(`Exchange Berhasil! Poin dikurangi ${exchangeLimit}`);
                    setPoints((prev) => prev - exchangeLimit);
                  }}
                  className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-sm rounded shadow-lg transform active:scale-95 transition-all"
                >
                  REDEEM
                </button>
              </div>
            )}
          </div>

          {/* --- RIGHT: CONTROL DECK (5 Cols) --- */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Control Panel */}
            <div className="bg-[#161b22] border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Zap size={120} />
              </div>

              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2 flex justify-between">
                <span>Terminal Access</span>
                <span className="text-green-500 font-mono">ONLINE</span>
              </h2>

              <div className="space-y-4 relative z-10">
                {/* 1x Pull Button */}
                <button
                  onClick={() => handleGacha(1)}
                  disabled={isAnimating}
                  className="w-full group relative overflow-hidden bg-gray-800 hover:bg-gray-700 border border-white/10 rounded-lg p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <span className="block text-[10px] text-gray-400 font-mono mb-1">
                        SINGLE PULL
                      </span>
                      <span className="block text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                        INITIATE 1X
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-blue-400 font-mono font-bold text-sm">
                        1x
                      </div>
                    </div>
                  </div>
                </button>

                {/* 10x Pull Button (TECH STYLE) */}
                <button
                  onClick={() => handleGacha(10)}
                  disabled={isAnimating}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/30 hover:border-pink-500 rounded-lg p-5 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(236,72,153,0.1)] hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]"
                >
                  {/* Glint Animation */}
                  <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] group-hover:animate-[shine_1s_infinite]"></div>

                  <div className="flex items-center justify-between relative z-10">
                    <div className="text-left">
                      <span className="block text-[10px] text-pink-300 font-mono mb-1 tracking-widest">
                        MULTI PULL
                      </span>
                      <span className="block text-2xl font-black italic text-white group-hover:text-pink-100 transition-colors">
                        INITIATE 10X
                      </span>
                      {/* Deskripsi tetap simple/kosong, tidak menjanjikan guarantee */}
                      <span className="text-[10px] text-gray-400 mt-1 opacity-70">
                        Standard Rate Apply
                      </span>
                    </div>
                    <Zap
                      size={28}
                      className="text-pink-500 group-hover:text-pink-300 transition-colors drop-shadow-md"
                    />
                  </div>
                </button>
              </div>
            </div>

            {/* --- ANIMATING STATE --- */}
            {isAnimating && (
              <div className="bg-[#161b22] border border-pink-500/30 rounded-xl p-8 flex flex-col items-center justify-center text-center animate-pulse h-48 shadow-[inset_0_0_30px_rgba(236,72,153,0.1)]">
                <div className="w-12 h-12 border-4 border-t-pink-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-pink-400 font-bold tracking-widest text-lg font-mono">
                  MATERIALIZING...
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-2">
                  DECRYPTING DATA
                </p>
              </div>
            )}
          </div>
        </div>

        {/* --- SESSION RESULT --- */}
        {!isAnimating && history.length > 0 && (
          <div className="mt-12 border-t border-white/10 pt-8 animate-in slide-in-from-bottom-8 fade-in duration-700">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-900/30 rounded-lg border border-pink-500/30 text-pink-400">
                  <History size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-widest uppercase italic">
                    Acquisition Result
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono">
                    SESSION ID: {Date.now().toString().slice(-6)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistory([])}
                className="flex items-center gap-2 px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-bold text-gray-300 transition-all hover:text-white"
              >
                <span className="sr-only">Clear</span>
                RESET TERMINAL
              </button>
            </div>

            {/* GRID LAYOUT:
        - Mobile: grid-cols-2 (2 kolom)
        - Tablet: sm:grid-cols-5 (5 kolom, jadi 2 baris pas)
        - Desktop: lg:grid-cols-10 (10 kolom, SEMUA DALAM SATU BARIS)
    */}
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 lg:gap-3 pb-6">
              {history.map((card, idx) => {
                const isFiveStar = card.initial === 5;
                const isFourStar = card.initial === 4;

                return (
                  <div
                    key={`${card.uniqueId}-${idx}`}
                    className={`
              relative w-full rounded-xl overflow-hidden border transition-all hover:scale-105 cursor-pointer group bg-gray-900
              ${
                isFiveStar
                  ? "border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] ring-1 ring-pink-500/50"
                  : isFourStar
                    ? "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                    : "border-gray-700 opacity-80 hover:opacity-100 hover:border-gray-500"
              }
            `}
                    style={{
                      animationDelay: `${idx * 50}ms`,
                    }}
                    title={card.title.global}
                  >
                    {/* Rarity Badge (Top Left) */}
                    <div className="absolute top-0 left-0 z-20 px-2 py-0.5 lg:px-3 lg:py-1 bg-black/80 backdrop-blur-md rounded-br-xl border-b border-r border-white/10">
                      <span
                        className={`text-[10px] lg:text-xs font-black tracking-widest ${
                          isFiveStar
                            ? "text-pink-400 drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]"
                            : isFourStar
                              ? "text-yellow-400"
                              : "text-gray-500"
                        }`}
                      >
                        {"★".repeat(card.initial)}
                      </span>
                    </div>

                    {/* --- IMAGE SWAPPING LOGIC --- */}

                    {/* 1. MOBILE IMAGE (THUMB) - Hidden on LG screens */}
                    <img
                      src={getCardImageUrl(card, "thumb")}
                      className="lg:hidden w-full h-full object-cover"
                      alt={card.title.global}
                      loading="lazy"
                    />

                    {/* 2. DESKTOP IMAGE (UPPER) - Hidden on Mobile screens */}
                    <img
                      src={getCardImageUrl(card, "upper")}
                      className="hidden lg:block w-full h-full object-cover object-top"
                      alt={card.title.global}
                      loading="lazy"
                    />

                    {/* Gradient Overlay Text Area */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-90"></div>

                    {/* Card Info (Bottom Overlay) */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-3 z-20 flex flex-col justify-end h-1/2">
                      {/* Initial Title (ID) - Desktop Only for cleanliness */}
                      <p className="hidden lg:block text-[8px] font-mono text-gray-500 mb-0.5 truncate uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {card.initialTitle}
                      </p>
                      {/* Card Title */}
                      <p
                        className={`text-[10px] lg:text-xs font-bold line-clamp-2 leading-tight ${
                          isFiveStar ? "text-white" : "text-gray-300"
                        }`}
                      >
                        {card.title.global || card.title.japanese}
                      </p>
                    </div>

                    {/* Shine Effect untuk *5 */}
                    {isFiveStar && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/0 via-white/20 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GachaPage;
