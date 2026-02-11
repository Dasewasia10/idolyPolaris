import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Card, Source } from "../interfaces/Card";
import { getAttributeImageUrl, getCardTypeImageUrl } from "../utils/imageUtils";
import {
  Search,
  Plus,
  X,
  Swords,
  Mic,
  Music,
  Ribbon,
  Heart,
  Activity,
} from "lucide-react";

// --- HELPER: Render Text with Line Breaks ---
const renderWithBr = (text?: string | string[]) => {
  if (!text) return null;

  // Jika array (Skill description), kita map langsung
  if (Array.isArray(text)) {
    return text.map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  }

  // Jika string (Yell description), split newline manual
  return text.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
};

const IMG_BASE_URL = "https://api.diveidolypapi.my.id";

const getCardImageUrl = (
  card: { initialTitle: string; initial: number; hasAwakening?: boolean },
  type: "thumb",
  isEvolved: boolean = false,
) => {
  const assetId = card.initialTitle; // Asumsi initialTitle = assetId (misal: ai-02-eve-00)
  const rarity = card.initial;
  const hasAwakening = card.hasAwakening ?? false;

  // Konfigurasi folder dan ekstensi
  // Full pakai .webp, sisanya .png
  const config = {
    thumb: { folder: "cardThumb", ext: "png" },
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

// --- HELPER: Stat Bar Colors ---
const getStatColorInfo = (type: "vocal" | "dance" | "visual" | "stamina") => {
  switch (type) {
    case "vocal":
      return {
        color: "bg-pink-500",
        text: "text-pink-400",
        icon: <Mic size={14} />,
      };
    case "dance":
      return {
        color: "bg-blue-500",
        text: "text-blue-400",
        icon: <Music size={14} />,
      };
    case "visual":
      return {
        color: "bg-yellow-400",
        text: "text-yellow-400",
        icon: <Ribbon size={14} />,
      };
    case "stamina":
      return {
        color: "bg-green-500",
        text: "text-green-400",
        icon: <Heart size={14} />,
      };
  }
};

const CardComparison: React.FC = () => {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [card1, setCard1] = useState<Card | null>(null);
  const [card2, setCard2] = useState<Card | null>(null);
  // State Bahasa
  const [primaryLanguage, setPrimaryLanguage] = useState<
    "japanese" | "global" | "indo"
  >("global");

  const API_BASE_URL = "https://diveidolypapi.my.id/api";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cardRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/cards`),
          // axios.get(`${API_BASE_URL}/characters`), // Characters belum dipakai di logic ini
        ]);
        const sources: Source[] = cardRes.data;

        const flattenedCards = sources.flatMap((source) =>
          source.data.map((card) => ({
            ...card,
            _sourceName: source.name,
          })),
        );
        setAllCards(flattenedCards);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- KOMPONEN: Searchable Select (Dark Theme) ---
  const SearchableSelect = ({
    options,
    onSelect,
    placeholder,
  }: {
    options: Card[];
    onSelect: (card: Card) => void;
    placeholder: string;
  }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const filteredOptions = useMemo(() => {
      if (!searchTerm) return options;
      const lower = searchTerm.toLowerCase();
      return options.filter(
        (c) =>
          c.title.global?.toLowerCase().includes(lower) ||
          c.title.japanese?.toLowerCase().includes(lower) ||
          c.initialTitle.toLowerCase().includes(lower),
      );
    }, [options, searchTerm]);

    return (
      <div className="relative w-full">
        <div className="relative group">
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full bg-gray-800 border border-gray-700 text-white px-10 py-3 rounded-lg focus:outline-none focus:border-pink-500 transition-colors placeholder-gray-500"
          />
          <Search
            size={18}
            className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-pink-400 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setIsOpen(false);
              }}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {isOpen && (searchTerm || filteredOptions.length > 0) && (
          <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-80 overflow-y-auto custom-scrollbar">
            {filteredOptions.slice(0, 100).map((card) => (
              <div
                key={card.uniqueId}
                onClick={() => {
                  onSelect(card);
                  setSearchTerm("");
                  setIsOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer border-b border-gray-700/50 flex items-center gap-3 transition-colors"
              >
                <img
                  src={getCardImageUrl(card, "thumb")}
                  alt="icon"
                  className="w-8 h-8 rounded-sm border border-gray-600"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-200 truncate">
                    {card.title.global || card.title.japanese}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {card.initialTitle} - {"★".repeat(card.initial)}
                  </p>
                </div>
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="p-4 text-gray-500 text-center text-sm">
                No cards found.
              </div>
            )}
          </div>
        )}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
        )}
      </div>
    );
  };

  // --- KOMPONEN: Card Slot ---
  const CardSlot = ({
    card,
    setCard,
    placeholder,
  }: {
    card: Card | null;
    setCard: (c: Card | null) => void;
    placeholder: string;
  }) => {
    if (!card) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-700 hover:border-pink-500/50 transition-colors">
          <div className="mb-4 p-4 rounded-full bg-gray-800 text-gray-500">
            <Plus size={32} />
          </div>
          <div className="w-full max-w-xs relative z-10">
            <SearchableSelect
              options={allCards}
              onSelect={setCard}
              placeholder={placeholder}
            />
          </div>
        </div>
      );
    }

    // --- LOGIC STATS ---
    const maxStat = 150000; // Skala max untuk progress bar

    // --- LOGIC SKILLS ---
    const skills = [
      card.skillOne,
      card.skillTwo,
      card.skillThree,
      card.skillFour,
      card.yell,
    ].filter(Boolean);

    return (
      <div className="relative bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-lg flex flex-col h-full">
        {/* Remove Button */}
        <button
          onClick={() => setCard(null)}
          className="absolute top-2 right-2 z-20 p-1.5 bg-gray-800/80 hover:bg-red-900/80 rounded-full text-gray-400 hover:text-white transition-colors border border-gray-700"
        >
          <X size={16} />
        </button>

        {/* --- TOP SECTION (Image + Info) --- */}
        <div className="flex p-4 gap-4 bg-gradient-to-br from-gray-800 to-gray-900 border-b border-gray-800">
          {/* Thumbnail Image */}
          <div className="flex-shrink-0 relative">
            <img
              src={getCardImageUrl(card, "thumb")}
              alt="thumb"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg border-2 border-gray-700 shadow-md object-cover bg-gray-800"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/150x150?text=No+Image";
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-[10px] text-white py-0.5 rounded-b-sm truncate px-1">
              {card.initialTitle}
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h2 className="text-lg sm:text-xl font-bold text-white leading-tight mb-1 line-clamp-2">
              {card.title?.[primaryLanguage] || card.title?.global}
            </h2>
            <div className="text-yellow-400 text-base mb-2 drop-shadow-sm">
              {"★".repeat(card.initial)}
            </div>

            <div className="flex items-center gap-3">
              {/* Attribute */}
              <div className="flex items-center gap-1.5 bg-gray-800 px-2 py-1 rounded-md border border-gray-700">
                <img
                  src={getAttributeImageUrl(card.attribute)}
                  alt={card.attribute}
                  className="w-5 h-5"
                />
                <span className="text-xs font-semibold text-gray-200">
                  {card.attribute}
                </span>
              </div>
              {/* Type */}
              <div className="flex items-center gap-1.5 bg-gray-800 px-2 py-1 rounded-md border border-gray-700">
                <img
                  src={getCardTypeImageUrl(card.type)}
                  alt={card.type}
                  className="w-5 h-5"
                />
                <span className="text-xs text-gray-300">{card.type}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          {/* --- STATS SECTION (Horizontal Bar & Total) --- */}
          <div className="mb-6 bg-gray-800/30 p-3 rounded-lg border border-gray-800">
            {/* Total Stats */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
              <div className="flex items-center gap-2 text-gray-300 font-bold">
                <Activity size={16} className="text-pink-500" />
                TOTAL POWER
              </div>
              <span className="text-xl font-black text-white">
                {card.stats.total.toLocaleString()}
              </span>
            </div>

            {/* Stat Bars */}
            {(["vocal", "dance", "visual", "stamina"] as const).map((stat) => {
              const info = getStatColorInfo(stat);
              const value = card.stats[stat];
              const percent = Math.min((value / maxStat) * 100, 100);

              return (
                <div key={stat} className="mb-2 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <div
                      className={`flex items-center gap-1.5 font-bold uppercase ${info.text}`}
                    >
                      {info.icon}
                      {stat}
                    </div>
                    <span className="text-white font-mono">
                      {value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${info.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- SKILLS & YELL SECTION --- */}
          <div className="space-y-3 flex-1">
            <h3 className="text-sm font-bold text-gray-400 border-b border-gray-800 pb-1 mb-2">
              SKILLS & YELL
            </h3>
            {skills.map((skill, idx) => {
              // Guard Clause: Lewati jika skill tidak ada
              if (!skill) return null;

              // Cek apakah ini Yell? (Yell tidak punya typeSkill)
              const isYell = !("typeSkill" in skill);
              // Cek apakah ini Skill 4? (Special Styling)
              const isSkillFour = skill === card.skillFour;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-sm transition-all
                                ${isYell ? "bg-purple-900/10 border-purple-500/30" : "bg-gray-800/40 border-gray-700"}
                                ${isSkillFour ? "border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.1)] bg-yellow-900/10" : ""}
                            `}
                >
                  <div className="flex flex-wrap justify-between items-start mb-1.5 gap-2">
                    {/* Nama Skill */}
                    <h4
                      className={`font-bold text-base ${isYell ? "text-purple-300" : isSkillFour ? "text-yellow-300" : "text-pink-300"}`}
                    >
                      {isYell ? "[YELL] " : ""}
                      {skill?.name?.[primaryLanguage] || skill?.name?.global}
                    </h4>

                    <div className="flex gap-1 flex-wrap justify-end">
                      {/* Type Skill Badge (Safe Check) */}
                      {"typeSkill" in skill && skill.typeSkill && (
                        <span
                          className="text-[10px] bg-blue-900/50 text-blue-200 px-1.5 py-0.5 rounded border border-blue-800 whitespace-nowrap truncate max-w-[150px]"
                          title={skill.typeSkill}
                        >
                          {skill.typeSkill}
                        </span>
                      )}
                      {/* STA Badge (Safe Check) */}
                      {"staminaUsed" in skill && (
                        <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded border border-gray-600 whitespace-nowrap">
                          STA: {skill.staminaUsed}
                        </span>
                      )}
                      {/* Probability Badge (Safe Check) */}
                      {"probability" in skill && skill.probability !== 100 && (
                        <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded border border-gray-600 whitespace-nowrap">
                          Probability: {skill.probability}
                        </span>
                      )}
                      {/* CT Badge (Safe Check) */}
                      {"ct" in skill && (
                        <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded border border-gray-600 whitespace-nowrap">
                          CT: {skill.ct}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Deskripsi Skill */}
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-xs sm:text-sm pl-1 border-l-2 border-gray-700">
                    {renderWithBr(
                      skill?.description?.[primaryLanguage] ||
                        skill?.description?.global,
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
        <p className="text-gray-400 font-medium">Loading Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {/* HEADER & LANGUAGE TOGGLE */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 pb-4 border-b border-gray-800">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              Card Comparison
            </h1>
          </div>
          {/* Language Toggle */}
          <div className="flex gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800">
            {(["japanese", "global", "indo"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setPrimaryLanguage(lang)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  primaryLanguage === lang
                    ? "bg-pink-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {lang === "japanese" ? "JP" : lang === "global" ? "EN" : "ID"}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN COMPARISON GRID */}
        <div className="flex-1 relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-stretch">
          {/* Card 1 */}
          <CardSlot
            card={card1}
            setCard={setCard1}
            placeholder="Select Card 1"
          />

          {/* VS Indicator */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center pointer-events-none">
            <div className="bg-gray-900 p-3 rounded-full border-2 border-gray-700 shadow-xl">
              <Swords size={24} className="text-pink-500" />
            </div>
          </div>

          {/* Card 2 */}
          <CardSlot
            card={card2}
            setCard={setCard2}
            placeholder="Select Card 2"
          />
        </div>
      </div>
    </div>
  );
};

export default CardComparison;
