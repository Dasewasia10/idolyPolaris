import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
// Import Interface Card
import { Source, Card } from "../interfaces/Card";

const API_BASE_URL = "https://diveidolypapi.my.id/api";
const IMG_BASE_URL = "https://api.diveidolypapi.my.id";

const GachaSimulation: React.FC = () => {
  // --- STATE ---
  const [points, setPoints] = useState<number>(0);
  const [history, setHistory] = useState<Card[]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Data State
  const [loading, setLoading] = useState(true);
  const [rawSources, setRawSources] = useState<Source[]>([]); // Data mentah dari API

  // Banner State
  const [featuredCard, setFeaturedCard] = useState<Card | null>(null);

  // --- 1. FETCH DATA DARI API ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch API /cards yang mengembalikan Source[]
        const res = await axios.get(`${API_BASE_URL}/cards`);

        console.log("Raw API Response:", res.data); // Debugging

        if (Array.isArray(res.data)) {
          setRawSources(res.data);
        } else {
          console.error("Format data API salah!", res.data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Gagal ambil data kartu:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. FLATTEN DATA (Source[] -> Card[]) ---
  // Kita gabungkan semua kartu dari berbagai karakter menjadi satu array besar
  const allCards = useMemo(() => {
    if (rawSources.length === 0) return [];

    // FlatMap: Ambil array 'data' dari setiap source dan gabung
    const flattened = rawSources.flatMap((source) => source.data);

    console.log(`Total Kartu Terkumpul: ${flattened.length}`);
    return flattened;
  }, [rawSources]);

  // --- 3. MEMPROSES POOL (Berdasarkan allCards yang sudah di-flat) ---
  const { pool5, pool4, pool3 } = useMemo(() => {
    if (allCards.length === 0) return { pool5: [], pool4: [], pool3: [] };

    // Pastikan konversi tipe data aman (Number)
    const p5 = allCards.filter((c) => Number(c.initial) === 5);
    const p4 = allCards.filter((c) => Number(c.initial) === 4);
    // Masukkan bintang 1, 2, 3 ke pool3 (Common)
    const p3 = allCards.filter((c) => Number(c.initial) <= 3);

    console.log(
      `Pool Stats -> ★5: ${p5.length}, ★4: ${p4.length}, ★3: ${p3.length}`,
    );

    return { pool5: p5, pool4: p4, pool3: p3 };
  }, [allCards]);

  // --- 4. SET FEATURED CARD ---
  useEffect(() => {
    // Jalankan hanya jika data sudah siap dan banner belum diset
    if (pool5.length > 0 && !featuredCard) {
      const targetId = "smr-05-nurs-00"; // Target Banner: Sumire Nurse

      const specificFeatured = pool5.find((c) => c.uniqueId === targetId);

      if (specificFeatured) {
        console.log("✅ BANNER SET:", specificFeatured.title.global);
        setFeaturedCard(specificFeatured);
      } else {
        console.warn("⚠️ Target banner tidak ketemu, pakai random ★5");
        setFeaturedCard(pool5[0]);
      }
    }
  }, [pool5, featuredCard]);

  // --- LOGIKA GACHA ---
  const getRandomCard = (cards: Card[]) => {
    if (cards.length === 0) return null;
    return cards[Math.floor(Math.random() * cards.length)];
  };

  const pullCard = (): Card | null => {
    // Safety check
    if (pool3.length === 0) return null; // Minimal harus ada kartu bintang 3

    const rand = Math.random(); // 0.0 - 1.0
    const RATE_5 = 0.035; // 3.5%
    const RATE_4 = 0.15; // 15%
    const RATE_UP_CHANCE = 0.5; // 50% chance jika dapat *5

    // Bintang 5
    if (pool5.length > 0 && rand < RATE_5) {
      // Cek Rate Up
      if (featuredCard && Math.random() < RATE_UP_CHANCE) {
        return featuredCard;
      }
      // Spook (Non-rate up)
      const spookPool = pool5.filter(
        (c) => c.uniqueId !== featuredCard?.uniqueId,
      );
      return (
        getRandomCard(spookPool.length > 0 ? spookPool : pool5) || featuredCard!
      );
    }

    // Bintang 4
    if (pool4.length > 0 && rand < RATE_5 + RATE_4) {
      return getRandomCard(pool4)!;
    }

    // Bintang 3 (Sisanya)
    return getRandomCard(pool3)!;
  };

  const handleGacha = (count: number) => {
    if (isAnimating || !featuredCard) return;

    setIsAnimating(true);
    setHistory([]); // Reset tampilan

    // Delay simulasi server/animasi
    setTimeout(() => {
      const results: Card[] = [];
      for (let i = 0; i < count; i++) {
        const card = pullCard();
        if (card) results.push(card);
      }

      setHistory(results);
      setPoints((prev) => prev + count);
      setIsAnimating(false);
    }, 800);
  };

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
  return (
    <div className="bg-gray-900 text-white p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* HEADER / BANNER */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl overflow-hidden shadow-2xl mb-8 border border-white/10 relative min-h-[150px]">
          {loading ? (
            <div className="flex items-center justify-center h-48 animate-pulse text-gray-400">
              <p>Mengunduh Data Gacha...</p>
            </div>
          ) : featuredCard ? (
            <div className="p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 animate-in fade-in duration-500">
              {/* Visual Banner */}
              <div className="relative group flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75"></div>
                <img
                  src={getCardImageUrl(featuredCard, "thumb")}
                  alt={featuredCard.title.global}
                  className="relative w-32 h-32 md:w-40 md:h-40 rounded-lg object-cover border-2 border-white shadow-lg bg-gray-800"
                />
                <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg z-10">
                  PICK UP
                </div>
              </div>

              {/* Info Text */}
              <div className="text-center md:text-left z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md mb-1">
                  {featuredCard.title.global || featuredCard.title.japanese}
                </h2>
                <p className="text-blue-200 italic mb-2 text-sm md:text-base">
                  {featuredCard.title.japanese}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-pink-500/20 border border-pink-500/50 rounded-full text-xs text-pink-200">
                    {featuredCard.attribute}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-xs text-blue-200">
                    {featuredCard.type}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-red-400">
              <p>Data Kartu Siap, tapi Banner Gagal Load.</p>
            </div>
          )}

          {/* Spark Counter */}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            <span className="text-yellow-400 font-bold text-lg">{points}</span>
            <span className="text-xs text-gray-300 ml-1">/ 200 Pt</span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex justify-center gap-4 mb-5">
          <button
            onClick={() => handleGacha(1)}
            disabled={isAnimating || !featuredCard}
            className="px-8 py-2 bg-white text-blue-900 font-bold rounded-full shadow-lg hover:bg-blue-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Pull 1x
          </button>
          <button
            onClick={() => handleGacha(10)}
            disabled={isAnimating || !featuredCard}
            className="px-8 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-full shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex flex-col items-center leading-tight"
          >
            <span>Pull 10x</span>
            <span className="text-[10px] font-normal opacity-80">
              SR not guaranteed
            </span>
          </button>
        </div>

        {/* RESULTS GRID */}
        {history.length > 0 && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            <h3 className="text-xl font-bold mb-4 text-center border-b border-gray-700 pb-2">
              Result
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-10 gap-4">
              {history.map((card, idx) => (
                <div
                  key={`${card.uniqueId}-${idx}`}
                  className={`relative rounded-lg p-2 border-2 flex flex-col items-center transition-transform hover:scale-105 bg-gray-800 ${
                    card.initial === 5
                      ? "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                      : card.initial === 4
                        ? "border-yellow-500"
                        : "border-gray-600"
                  }`}
                >
                  <div className="relative w-full aspect-square mb-2">
                    <img
                      src={getCardImageUrl(card, "upper")}
                      alt={card.title.global}
                      className="w-full h-full object-cover rounded shadow-sm bg-gray-900"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/200x200?text=No+Img";
                      }}
                    />
                    <div className="absolute -bottom-2 left-0 right-0 flex justify-center">
                      <div className="bg-black/80 px-2 rounded-full text-yellow-400 text-xs tracking-tighter border border-white/10">
                        {"★".repeat(card.initial)}
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] sm:text-xs font-bold text-center line-clamp-2 leading-tight min-h-[2.5em] flex items-center justify-center">
                    {card.title.global || card.title.japanese}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GachaSimulation;
