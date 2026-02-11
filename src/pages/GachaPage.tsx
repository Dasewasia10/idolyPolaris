import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
// Pastikan path interface ini benar
import { Card } from "../interfaces/Card";
import { getPlaceholderImageUrl } from "../utils/imageUtils";

// --- CONFIG ---
const API_BASE = "https://diveidolypapi.my.id/api";
const BANNER_IMG_BASE = "https://api.diveidolypapi.my.id/gachaBanner";
const IMG_BASE_URL = "https://api.diveidolypapi.my.id";

// Interface Response dari Backend (/api/gachas/:id/pool)
interface PoolResponse {
  bannerInfo: {
    id: string;
    name: string;
    assetId: string;
    startAt: string;
    category: string;
    exchangeLimit: number;
  };
  rateUpCards: Card[]; // Kartu yang sedang Rate Up
  pool: Card[]; // Pool Standar (sudah difilter tanggal & limited)
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

  // --- 1. FETCH DATA POOL ---
  useEffect(() => {
    if (!id) return;

    const fetchPool = async () => {
      setLoading(true);
      try {
        console.log("Fetching Pool for Banner ID:", id);
        const res = await axios.get(`${API_BASE}/gachas/${id}/pool`);

        console.log("Pool Data Received:", res.data);

        // Validasi data sedikit agar tidak blank screen
        if (!res.data || !res.data.pool) {
          throw new Error("Data pool kosong");
        }

        setBannerData(res.data);
      } catch (err) {
        console.error("Gagal load pool gacha:", err);
        // Jangan langsung navigate, biarkan user baca errornya dulu atau coba lagi
        alert(
          "Gagal memuat data banner. Pastikan backend berjalan dan ID banner valid.",
        );
        navigate("/gacha");
      } finally {
        setLoading(false);
      }
    };

    fetchPool();
  }, [id, navigate]);

  // Title Page Dynamic
  useEffect(() => {
    document.title = "Polaris Idoly | Gacha Poll";

    return () => {
      document.title = "Polaris Idoly";
    };
  }, []);

  // --- 2. PREPARE POOLS (Memoized) ---
  // Kita memisahkan pool standar berdasarkan rarity untuk memudahkan logika gacha
  const { standard5, standard4, standard3 } = useMemo(() => {
    if (!bannerData) return { standard5: [], standard4: [], standard3: [] };

    // Filter manual menggunakan Number() untuk keamanan tipe data
    const p5 = bannerData.pool.filter((c) => Number(c.initial) === 5);
    const p4 = bannerData.pool.filter((c) => Number(c.initial) === 4);
    // Masukkan bintang 1, 2, 3 ke pool Common
    const p3 = bannerData.pool.filter((c) => Number(c.initial) <= 3);

    return { standard5: p5, standard4: p4, standard3: p3 };
  }, [bannerData]);

  // --- LOGIKA GACHA ---
  const getRandom = (arr: Card[]) => {
    if (arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const pullCard = (): Card | null => {
    if (!bannerData) return null;

    const rand = Math.random();
    const RATE_5 = 0.035; // 3.5%
    const RATE_4 = 0.15; // 15%
    const RATE_UP_CHANCE = 0.5; // 50% chance jika dapat *5 dan ada Rate Up

    // --- BINTANG 5 ---
    if (rand < RATE_5) {
      // 1. Cek Rate Up
      if (bannerData.rateUpCards.length > 0) {
        // Menang 50/50?
        if (Math.random() < RATE_UP_CHANCE) {
          return getRandom(bannerData.rateUpCards); // HORE! Dapat Rate Up
        }
      }

      // 2. Spook (Kalah Rate Up atau Banner Biasa)
      // Ambil dari standard5 pool
      // Fallback: Jika standard5 kosong (misal game baru rilis), paksa ambil rateup atau null
      if (standard5.length === 0) {
        return getRandom(bannerData.rateUpCards) || null;
      }

      console.log("Standard5 Pool:", standard5);
      console.log("Total Standard5 Cards:", bannerData.rateUpCards.length);
      return getRandom(standard5);
    }

    // --- BINTANG 4 ---
    if (rand < RATE_5 + RATE_4) {
      if (standard4.length === 0) return getRandom(standard3); // Safety fallback
      return getRandom(standard4);
    }

    // --- BINTANG 3 ---
    if (standard3.length === 0) return null; // Harusnya gak mungkin terjadi
    return getRandom(standard3);
  };

  const handleGacha = (count: number) => {
    if (isAnimating || !bannerData) return;

    setIsAnimating(true);
    setHistory([]);

    // Delay simulasi server/animasi
    setTimeout(() => {
      const results: Card[] = [];
      for (let i = 0; i < count; i++) {
        const c = pullCard();
        if (c) results.push(c);
      }
      setHistory(results);
      setPoints((prev) => prev + count);
      setIsAnimating(false);
    }, 800);
  };

  // Helper Spark
  const exchangeLimit = bannerData?.bannerInfo.exchangeLimit || 200;
  const canSpark = points >= exchangeLimit;

  const getCardImageUrl = (
    card: { initialTitle: string; initial: number; hasAwakening?: boolean },
    type: "full" | "thumb" | "upper",
    isEvolved: boolean = false,
  ) => {
    const assetId = card.initialTitle; // Asumsi initialTitle = assetId (misal: ai-02-eve-00)
    const rarity = card.initial;
    const hasAwakening = card.hasAwakening ?? false;

    // Konfigurasi folder dan ekstensi
    // Full pakai .webp, sisanya .png
    const config = {
      full: { folder: "cardFull", ext: "webp" },
      thumb: { folder: "cardThumb", ext: "png" },
      upper: { folder: "cardUpper", ext: "png" },
    };

    const { folder, ext } = config[type];

    let index = 1; // Default index

    if (rarity < 5) {
      // KASUS 1: Rarity Rendah (2, 3, 4)
      // Base = 0, Evolved = 1
      index = isEvolved ? 1 : 0;
    } else if (rarity === 5 && hasAwakening) {
      // KASUS 2: Rarity 5 Link/Awakening
      // Base = 1, Evolved = 2
      index = isEvolved ? 2 : 1;
    } else {
      // KASUS 3: Rarity 5 Biasa (Fes/Initial)
      // Selalu 1, tidak ada evolved
      index = 1;
    }

    return `${IMG_BASE_URL}/${folder}/img_card_${type}_${index}_${assetId}.${ext}`;
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
        <p className="animate-pulse text-gray-400">
          Menyiapkan Time Machine Gacha...
        </p>
      </div>
    );
  }

  if (!bannerData) return null;

  return (
    <div className="bg-gray-950 text-white p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* HEADER & NAV */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/gacha")}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate text-gray-100">
              {bannerData.bannerInfo.name}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  bannerData.bannerInfo.category === "Fes"
                    ? "bg-red-900 text-red-200"
                    : bannerData.bannerInfo.category === "Birthday"
                      ? "bg-purple-900 text-purple-200"
                      : bannerData.bannerInfo.category === "Kizuna"
                        ? "bg-indigo-900 text-indigo-200"
                        : "bg-gray-800 text-gray-400"
                }`}
              >
                {bannerData.bannerInfo.category}
              </span>
              <p className="text-xs text-gray-500">Spark: {exchangeLimit} Pt</p>
            </div>
          </div>
        </div>

        {/* BANNER AREA */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-800 mb-8 bg-gray-900 group max-w-3xl mx-auto">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-900/20 to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

          {/* Banner Image */}
          <div className="w-full h-max relative">
            <img
              src={`${BANNER_IMG_BASE}/img_banner_l_gacha-${bannerData.bannerInfo.assetId}.png`}
              alt="Banner"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = getPlaceholderImageUrl("rect");
              }}
            />
          </div>

          {/* Rate Up Info Badge (Overlay) */}
          {bannerData.rateUpCards.length > 0 && (
            <div className="absolute bottom-4 left-4 flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-pink-400 drop-shadow-md bg-black/60 px-2 py-1 rounded w-fit">
                Featured Idols
              </span>
              <div className="flex gap-2">
                {bannerData.rateUpCards.map((c) => (
                  <div
                    key={c.uniqueId}
                    className="relative group/icon cursor-help"
                  >
                    <img
                      src={getCardImageUrl(c, "thumb", false)}
                      className="w-12 h-12 rounded border-2 border-pink-500 shadow-lg bg-gray-800"
                      alt="icon"
                    />
                    {/* Tooltip Nama */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/icon:opacity-100 transition-opacity pointer-events-none">
                      {c.title.global}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spark Counter */}
          <div
            className={`absolute top-4 right-4 backdrop-blur px-4 py-2 rounded-full border shadow-lg z-10 transition-colors ${
              canSpark
                ? "bg-yellow-500/90 border-yellow-300 text-black animate-pulse"
                : "bg-black/80 border-white/20 text-white"
            }`}
          >
            <span className="font-bold text-lg">{points}</span>
            <span className="text-xs opacity-80 ml-1">
              / {exchangeLimit} Pt
            </span>
          </div>
        </div>

        {/* SPARK BUTTON (Jika Poin Cukup) */}
        {canSpark && (
          <div className="flex justify-center mb-6 animate-bounce">
            <button
              onClick={() => {
                alert(`Exchange Berhasil! Poin dikurangi ${exchangeLimit}`);
                setPoints((prev) => prev - exchangeLimit);
              }}
              className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.6)] hover:scale-105 transition-transform"
            >
              EXCHANGE NOW ({exchangeLimit} Pt)
            </button>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => handleGacha(1)}
            disabled={isAnimating}
            className="w-36 py-3 bg-gray-100 hover:bg-white text-blue-900 font-bold rounded-xl shadow-[0_4px_0_rgb(209,213,219)] hover:shadow-[0_2px_0_rgb(209,213,219)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pull 1x
          </button>

          <button
            onClick={() => handleGacha(10)}
            disabled={isAnimating}
            className="w-44 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_4px_0_rgb(157,23,77)] hover:shadow-[0_2px_0_rgb(157,23,77)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all flex flex-col items-center leading-tight disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">Pull 10x</span>
            <span className="text-[10px] opacity-90 font-medium">
              SR Not Guaranteed
            </span>
          </button>
        </div>

        {/* RESULTS GRID */}
        {history.length > 0 && (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-gray-800 flex-1"></div>
              <h3 className="text-lg font-bold text-gray-400">GACHA RESULT</h3>
              <div className="h-px bg-gray-800 flex-1"></div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-10 gap-4">
              {history.map((card, idx) => {
                const isRateUp = bannerData.rateUpCards.some(
                  (r) => r.uniqueId === card.uniqueId,
                );
                const isFiveStar = card.initial === 5;
                const isFourStar = card.initial === 4;

                return (
                  <div
                    key={`${card.uniqueId}-${idx}`}
                    className={`
                            relative rounded-lg p-2 border-2 flex flex-col items-center transition-transform hover:scale-105 bg-gray-800
                            ${isFiveStar ? "border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] scale-105 z-10" : ""}
                            ${isFourStar ? "border-yellow-500" : ""}
                            ${!isFiveStar && !isFourStar ? "border-gray-700 opacity-80 hover:opacity-100" : ""}
                        `}
                    style={{
                      animationDelay: `${idx * 50}ms`, // Efek muncul berurutan
                    }}
                  >
                    {/* Rate Up Badge */}
                    {isRateUp && (
                      <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg z-20 shadow-sm">
                        PICK UP
                      </div>
                    )}

                    <div className="relative w-full aspect-square mb-2 bg-gray-900 rounded min-h-60">
                      <img
                        src={getCardImageUrl(card, "upper")}
                        alt={card.title.global}
                        className="w-full h-full object-cover"
                      />
                      {/* Stars Overlay */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1 pt-4 text-center">
                        <span
                          className={`text-xs tracking-tighter drop-shadow-md ${isFiveStar ? "text-pink-400" : "text-yellow-400"}`}
                        >
                          {"★".repeat(card.initial)}
                        </span>
                      </div>
                    </div>

                    <p
                      className={`text-[10px] text-center line-clamp-2 leading-tight w-full px-1 mb-1 ${isFiveStar ? "font-bold text-pink-200" : "text-gray-300"}`}
                    >
                      {card.title.global || card.title.japanese}
                    </p>
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
