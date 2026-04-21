import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Card, Source } from "../interfaces/Card";
import {
  getAttributeImageUrl,
  getCardTypeImageUrl,
  getCardTypeImageUrl2,
} from "../utils/imageUtils";
import {
  Search,
  Plus,
  X,
  Mic,
  Music,
  Ribbon,
  Heart,
  Activity,
  Globe,
  Zap,
  Columns,
  LayoutGrid,
} from "lucide-react";

// --- HELPER: Render Text with Line Breaks ---
const renderWithBr = (text?: string | string[]) => {
  if (!text) return null;
  if (Array.isArray(text)) {
    return text.map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  }
  return text.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
};

const IMG_BASE_URL = "https://apiip.dasewasia.my.id";

const getCardImageUrl = (
  card: { initialTitle: string; initial: number; hasAwakening?: boolean },
  type: "thumb" | "upper",
  isEvolved: boolean = false,
) => {
  const assetId = card.initialTitle;
  const rarity = card.initial;
  const hasAwakening = card.hasAwakening ?? false;
  const config = {
    thumb: { folder: "cardThumb", ext: "webp" },
    upper: { folder: "cardUpper", ext: "webp" },
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

const getColorByCardAttribute = (cardAttribute: string): string => {
  switch (cardAttribute) {
    case "Dance":
      return "187cfc";
    case "Vocal":
      return "fc44c4";
    case "Visual":
      return "f49c1c";
    default:
      return "ffffff";
  }
};

// Interface yang diextend untuk menampung nama source
interface CardWithSource extends Card {
  _sourceName: string;
}

const CardComparison: React.FC = () => {
  const [allCards, setAllCards] = useState<CardWithSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [primaryLanguage, setPrimaryLanguage] = useState<
    "japanese" | "global" | "indo"
  >("global");

  // --- STATE COMPARISON ---
  const [compareMode, setCompareMode] = useState<2 | 4>(2);
  const [cardSlots, setCardSlots] = useState<(CardWithSource | null)[]>([
    null,
    null,
  ]);

  // --- STATE MODAL SELECTOR ---
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const API_BASE_URL = "https://beip.dasewasia.my.id/api";

  useEffect(() => {
    document.title = "Polaris Idoly | Card Comparison";
    const fetchData = async () => {
      setLoading(true);
      try {
        const cardRes = await axios.get(`${API_BASE_URL}/cards`);
        const sources: Source[] = cardRes.data;
        const flattenedCards = sources.flatMap((source) =>
          source.data.map((card) => ({ ...card, _sourceName: source.name })),
        );
        setAllCards(flattenedCards as CardWithSource[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleModeChange = (mode: 2 | 4) => {
    setCompareMode(mode);
    setCardSlots((prev) => {
      if (mode === 2) return [prev[0], prev[1]];
      if (mode === 4)
        return [
          prev[0] || null,
          prev[1] || null,
          prev[2] || null,
          prev[3] || null,
        ];
      return prev;
    });
  };

  const handleSelectCard = (card: CardWithSource) => {
    if (activeSlotIndex !== null) {
      const newSlots = [...cardSlots];
      newSlots[activeSlotIndex] = card;
      setCardSlots(newSlots);
    }
    setActiveSlotIndex(null);
    setSearchQuery("");
  };

  const handleRemoveCard = (index: number) => {
    const newSlots = [...cardSlots];
    newSlots[index] = null;
    setCardSlots(newSlots);
  };

  const filteredCards = useMemo(() => {
    if (!searchQuery) return allCards;
    const lower = searchQuery.toLowerCase();
    return allCards.filter(
      (c) =>
        c.title.global?.toLowerCase().includes(lower) ||
        c.title.japanese?.toLowerCase().includes(lower) ||
        c.initialTitle.toLowerCase().includes(lower) ||
        c._sourceName.toLowerCase().includes(lower),
    );
  }, [allCards, searchQuery]);

  // --- COMPONENT: Card Slot ---
  const CardSlot = ({
    card,
    index,
    baseCard,
  }: {
    card: CardWithSource | null;
    index: number;
    baseCard: CardWithSource | null;
  }) => {
    const placeholder = `ADD UNIT ${String.fromCharCode(65 + index)}`; // A, B, C, D

    if (!card) {
      return (
        <div
          onClick={() => setActiveSlotIndex(index)}
          className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-[#161b22]/50 rounded-2xl border-2 border-dashed border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer group"
        >
          <div className="mb-4 p-6 rounded-full bg-[#0d1117] border border-white/5 text-gray-600 group-hover:text-cyan-500 group-hover:scale-110 transition-all shadow-xl">
            <Plus size={32} />
          </div>
          <p className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
            {placeholder}
          </p>
          <p className="mt-2 text-[10px] text-gray-600 font-mono uppercase tracking-widest text-center">
            Click to assign
            <br />
            data source
          </p>
        </div>
      );
    }

    const skills = [
      card.skillOne,
      card.skillTwo,
      card.skillThree,
      card.skillFour,
      card.yell,
    ].filter(Boolean);
    const isBase = baseCard === null || card.uniqueId === baseCard.uniqueId;

    return (
      <div className="relative bg-[#161b22] rounded-xl border border-white/10 overflow-hidden shadow-2xl flex flex-col h-full group">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-0"></div>

        <button
          onClick={() => handleRemoveCard(index)}
          className="absolute top-3 right-3 z-20 p-2 bg-black/50 hover:bg-red-900/80 rounded-lg text-gray-400 hover:text-white transition-colors border border-white/10 backdrop-blur-sm"
        >
          <X size={16} />
        </button>

        {/* Change Card Button (Hover Overlay) */}
        <button
          onClick={() => setActiveSlotIndex(index)}
          className="absolute top-3 right-14 z-20 p-2 bg-black/50 hover:bg-cyan-900/80 rounded-lg text-gray-400 hover:text-white transition-colors border border-white/10 backdrop-blur-sm"
          title="Change Unit"
        >
          <Search size={16} />
        </button>

        {/* --- TOP INFO --- */}
        <div className="relative p-4 md:p-6 flex flex-col xl:flex-row gap-4 md:gap-5 border-b border-white/5 z-10">
          <div className="flex-shrink-0 relative self-start">
            <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 rounded-full"></div>
            <img
              src={getCardImageUrl(card, "thumb")}
              alt="thumb"
              className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 border-white/10 shadow-2xl object-cover bg-[#0a0c10]"
            />
            <div className="absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 bg-black/80 border border-white/20 text-[8px] md:text-[9px] text-white px-2 py-0.5 rounded font-mono truncate max-w-full shadow-lg">
              {card.initialTitle}
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${card.initial === 5 ? "bg-pink-900/30 text-pink-300 border-pink-500/30" : "bg-yellow-900/30 text-yellow-300 border-yellow-500/30"}`}
              >
                {"★".repeat(card.initial)}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                {card._sourceName}
              </span>
              {index === 0 && compareMode === 4 && (
                <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold uppercase ml-auto">
                  Base Unit
                </span>
              )}
            </div>
            <h2 className="text-base md:text-lg font-bold text-white leading-tight mb-3 line-clamp-2 hover:text-cyan-400 transition-colors">
              {card.title?.[primaryLanguage] || card.title?.global}
            </h2>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-white/10">
                <img
                  src={getAttributeImageUrl(card.attribute)}
                  alt={card.attribute}
                  className="w-3 h-3 md:w-4 md:h-4"
                />
                <span className="text-[9px] md:text-[10px] font-bold text-gray-300 uppercase">
                  {card.attribute}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-white/10">
                <img
                  src={getCardTypeImageUrl(card.type)}
                  alt={card.type}
                  className="w-3 h-3 md:w-4 md:h-4"
                />
                <span className="text-[9px] md:text-[10px] font-bold text-gray-300 uppercase">
                  {card.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="p-4 md:p-6 flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent space-y-6 bg-[#0d1117]/50">
          {/* STATS */}
          <div className="bg-[#0a0c10] p-4 rounded-xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
              <Activity size={64} />
            </div>

            <div className="flex justify-between items-end mb-4 border-b border-white/5 pb-2">
              <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1 md:gap-2">
                <Zap size={14} className="text-yellow-500" /> Power Level
              </span>
              {/* Total dipindahkan ke tengah Doughnut Chart, atau dibiarkan kosong di sini agar lebih bersih */}
            </div>

            {/* Flex Container: Kiri Grid, Kanan Pie Chart */}
            {/* Menggunakan flex-col lalu 2xl:flex-row agar tidak bertumpuk saat mode 4 Kartu di layar kecil */}
            <div className="flex flex-col 2xl:flex-row items-center gap-5 mt-2">
              <div className="grid grid-cols-2 gap-2 w-full 2xl:w-3/5">
                {(["vocal", "dance", "visual", "stamina"] as const).map(
                  (stat) => {
                    const info = getStatColorInfo(stat);
                    const value = card.stats[stat];
                    const compareValue = baseCard ? baseCard.stats[stat] : 0;
                    const diff = !isBase && baseCard ? value - compareValue : 0;

                    return (
                      <div
                        key={stat}
                        className="bg-[#161b22] p-2 rounded-lg border border-white/5 flex flex-col items-center justify-center text-center shadow-inner relative"
                      >
                        <span
                          className={`flex items-center gap-1 text-[9px] md:text-[10px] uppercase font-bold mb-1 ${info.text}`}
                        >
                          {info.icon} {stat}
                        </span>
                        <span className="text-sm md:text-base font-black text-white font-mono tracking-tight">
                          {value.toLocaleString()}
                        </span>

                        {/* INDIKATOR SELISIH (DIFF) */}
                        {!isBase && baseCard && diff !== 0 ? (
                          <span
                            className={`text-[9px] font-bold leading-none mt-1 ${diff > 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {diff > 0 ? "+" : ""}
                            {diff.toLocaleString()}
                          </span>
                        ) : (
                          // Spacer transparan agar kotak tidak berubah ukuran jika tidak ada diff
                          <span className="text-[9px] font-bold leading-none mt-1 opacity-0">
                            -
                          </span>
                        )}
                      </div>
                    );
                  },
                )}
              </div>

              <div className="w-full 2xl:w-2/5 flex justify-center items-center mt-4 2xl:mt-0 flex-col">
                {(() => {
                  const totalStat = card.stats.total;
                  const compareTotal = baseCard ? baseCard.stats.total : 0;
                  const totalDiff =
                    !isBase && baseCard ? totalStat - compareTotal : 0;

                  return (
                    <>
                      <span className="font-black text-3xl lg:text-4xl font-mono text-white tracking-tighter">
                        {totalStat.toLocaleString()}
                      </span>

                      {/* Indikator Selisih (Diff) */}
                      {!isBase && baseCard && totalDiff !== 0 ? (
                        <span
                          className={`text-xs md:text-sm font-bold leading-none mt-2 ${totalDiff > 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {totalDiff > 0 ? "+" : ""}
                          {totalDiff.toLocaleString()}
                        </span>
                      ) : (
                        // Spacer transparan agar UI tidak melompat jika tidak ada diff
                        <span className="text-xs md:text-sm font-bold leading-none mt-2 opacity-0">
                          -
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* SKILLS */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="w-1 h-1 bg-cyan-500 rounded-full"></span> Skill
              Set
            </h3>
            {skills.map((skill, idx) => {
              if (!skill) return null;
              const isYell = !("typeSkill" in skill);
              const isSkillFour = skill === card.skillFour;

              return (
                <div
                  key={idx}
                  className={`p-3 md:p-4 rounded-lg border text-sm transition-all relative group/skill overflow-hidden
                    ${isYell ? "bg-purple-900/10 border-purple-500/20" : "bg-[#161b22] border-white/10"}
                    ${isSkillFour ? "border-yellow-500/30 bg-yellow-900/5" : ""}
                `}
                >
                  <div className="absolute left-0 top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-0 group-hover/skill:opacity-100 transition-opacity"></div>

                  <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start mb-2 gap-2">
                    <h4
                      className={`font-bold text-xs md:text-sm leading-snug ${isYell ? "text-purple-300" : isSkillFour ? "text-yellow-300" : "text-pink-300"}`}
                    >
                      {isYell && (
                        <span className="text-[9px] bg-purple-500 text-black px-1 rounded mr-2 font-black">
                          Y/C
                        </span>
                      )}
                      {skill?.name?.[primaryLanguage] || skill?.name?.global}
                    </h4>
                    <div className="flex gap-1 flex-wrap shrink-0">
                      {"typeSkill" in skill && skill.typeSkill && (
                        <span className="text-[8px] md:text-[9px] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800/50 uppercase font-mono">
                          {skill.typeSkill.split(",")[0]}
                        </span>
                      )}
                      {"ct" in skill && (
                        <span className="text-[8px] md:text-[9px] bg-[#0d1117] text-gray-400 px-1.5 py-0.5 rounded border border-white/10 font-mono">
                          CT:{skill.ct}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-400 text-[10px] md:text-xs leading-relaxed font-sans">
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

  if (loading)
    return (
      <div className="h-full bg-[#0f1115] flex items-center justify-center text-cyan-500 font-mono tracking-widest animate-pulse">
        LOADING CARD DATA...
      </div>
    );

  return (
    <div className="min-h-full bg-[#0f1115] text-white p-4 md:p-8 font-sans selection:bg-cyan-500 selection:text-white">
      <div className="max-w-[1600px] mx-auto h-full flex flex-col">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3 text-center lg:text-left">
            <div className="p-2 bg-cyan-900/30 border border-cyan-500/30 rounded text-cyan-400">
              <Activity size={24} />
            </div>
            <div>
              <span className="text-[10px] text-cyan-500 font-bold tracking-[0.2em] uppercase block">
                Analysis Module
              </span>
              <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white">
                CARD{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  COMPARISON&nbsp;
                </span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {/* Mode Toggle */}
            <div className="flex gap-1 bg-[#161b22] p-1 rounded-lg border border-white/10">
              <button
                onClick={() => handleModeChange(2)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${compareMode === 2 ? "bg-purple-600 text-white shadow-lg" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
              >
                <Columns size={14} /> 2 Cards
              </button>
              <button
                onClick={() => handleModeChange(4)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${compareMode === 4 ? "bg-purple-600 text-white shadow-lg" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
              >
                <LayoutGrid size={14} /> 4 Cards
              </button>
            </div>

            {/* Language Toggle */}
            <div className="flex gap-1 bg-[#161b22] p-1 rounded-lg border border-white/10">
              {(["japanese", "global", "indo"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setPrimaryLanguage(lang)}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${primaryLanguage === lang ? "bg-cyan-600 text-white shadow-lg" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
                >
                  <span className="flex items-center gap-1">
                    <Globe size={10} />{" "}
                    {lang === "japanese"
                      ? "JP"
                      : lang === "global"
                        ? "EN"
                        : "ID"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COMPARISON STAGE */}
        <div
          className={`flex-1 grid gap-4 md:gap-6 items-stretch mb-16 ${compareMode === 2 ? "grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto w-full" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4 w-full"}`}
        >
          {cardSlots.map((card, index) => (
            <div key={index} className="relative">
              <CardSlot
                card={card}
                index={index}
                baseCard={
                  compareMode === 4
                    ? cardSlots[0]
                    : index === 0
                      ? cardSlots[1]
                      : cardSlots[0]
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL SELECTOR (Desain Premium ala CardList) --- */}
      {activeSlotIndex !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-2 md:px-4 animate-in fade-in duration-200 backdrop-blur-sm my-auto">
          <div className="bg-[#0f1115] border border-white/10 w-full max-w-5xl h-4/5 max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-transparent">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Search size={18} className="text-cyan-400" /> Select Unit for
                Slot {String.fromCharCode(65 + activeSlotIndex)}
              </h2>
              <button
                onClick={() => setActiveSlotIndex(null)}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-[#0d1117] border-b border-white/10">
              <div className="relative max-w-md mx-auto">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name, title, or idol..."
                  className="w-full bg-black/40 border border-white/10 rounded-full pl-12 pr-4 py-3 focus:ring-1 focus:ring-cyan-500 outline-none text-white transition-all font-mono text-sm shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Grid Content (Using CardList styling logic) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0a0c10] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                  <p className="col-span-full text-center py-10 text-cyan-500 font-mono animate-pulse">
                    ACCESSING DATABASE...
                  </p>
                ) : filteredCards.length === 0 ? (
                  <p className="col-span-full text-center py-10 text-gray-500 font-mono">
                    NO DATA FOUND
                  </p>
                ) : (
                  filteredCards.slice(0, 100).map((card) => {
                    const bgColor = getColorByCardAttribute(card.attribute);
                    return (
                      <div
                        key={card.uniqueId}
                        onClick={() => handleSelectCard(card)}
                        className="relative group flex cursor-pointer gap-3 rounded-xl border border-white/10 bg-[#161b22] hover:bg-[#1f2937] hover:border-cyan-500/50 shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-cyan-500/10 overflow-hidden p-2"
                      >
                        {/* Accent Triangle */}
                        <div
                          className="absolute bottom-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-b-[40px] rounded-br-xl z-0 opacity-50 group-hover:opacity-100 transition-opacity"
                          style={{
                            borderBottomColor: `#${bgColor || "333"}`,
                          }}
                        />

                        <div className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0">
                          {/* Type Icon */}
                          <div className="absolute -top-1 -left-1 z-10 p-0.5 rounded bg-black/50 backdrop-blur-sm border border-white/10">
                            <img
                              src={getCardTypeImageUrl2(card.type)}
                              alt={card.type}
                              className="h-3 w-3 md:h-4 md:w-4"
                              style={{
                                backgroundColor: `#${bgColor}`,
                                borderRadius: "2px",
                              }}
                            />
                          </div>
                          <div className="h-full w-full rounded-lg overflow-hidden border border-white/10 bg-black">
                            <img
                              src={getCardImageUrl(card, "thumb")}
                              alt="Card"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                            />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 z-10 py-1 flex flex-col justify-center">
                          <h3 className="text-xs md:text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                            {card.title.global || card.title.japanese}
                          </h3>
                          <h4 className="text-[9px] md:text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1 truncate">
                            {card._sourceName}
                          </h4>
                          <div
                            className={`text-xs ${card.initial === 5 ? "text-pink-400 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]" : "text-yellow-400"}`}
                          >
                            {"★".repeat(card.initial)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardComparison;
