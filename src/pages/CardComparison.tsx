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
  Globe,
  Zap,
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
  type: "thumb",
  isEvolved: boolean = false,
) => {
  const assetId = card.initialTitle;
  const rarity = card.initial;
  const hasAwakening = card.hasAwakening ?? false;
  const config = { thumb: { folder: "cardThumb", ext: "png" } };
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

const CardComparison: React.FC = () => {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [card1, setCard1] = useState<Card | null>(null);
  const [card2, setCard2] = useState<Card | null>(null);
  const [primaryLanguage, setPrimaryLanguage] = useState<
    "japanese" | "global" | "indo"
  >("global");

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
        setAllCards(flattenedCards);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- COMPONENT: Searchable Select ---
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
            className="w-full bg-[#0a0c10] border border-white/20 text-white px-10 py-3 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors placeholder-gray-600 font-mono text-sm"
          />
          <Search
            size={16}
            className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-cyan-400 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setIsOpen(false);
              }}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {isOpen && (searchTerm || filteredOptions.length > 0) && (
          <div className="absolute z-50 w-full mt-2 bg-[#161b22] border border-white/10 rounded-lg shadow-2xl max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {filteredOptions.slice(0, 100).map((card) => (
              <div
                key={card.uniqueId}
                onClick={() => {
                  onSelect(card);
                  setSearchTerm("");
                  setIsOpen(false);
                }}
                className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 flex items-center gap-3 transition-colors group"
              >
                <div className="relative">
                  <img
                    src={getCardImageUrl(card, "thumb")}
                    alt="icon"
                    className="w-10 h-10 rounded border border-white/10 bg-black object-cover"
                  />
                  {/* Rarity Dot */}
                  <div
                    className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${card.initial === 5 ? "bg-pink-500" : "bg-yellow-500"}`}
                  ></div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-200 truncate group-hover:text-cyan-300 transition-colors">
                    {card.title.global || card.title.japanese}
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono truncate">
                    {card.initialTitle}
                  </p>
                </div>
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="p-4 text-gray-500 text-center text-xs font-mono">
                NO DATA FOUND
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

  // --- COMPONENT: Card Slot ---
  const CardSlot = ({
    card,
    setCard,
    placeholder,
    compareCard,
  }: {
    card: Card | null;
    setCard: (c: Card | null) => void;
    placeholder: string;
    compareCard: Card | null;
  }) => {
    if (!card) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-[#161b22]/50 rounded-2xl border-2 border-dashed border-white/10 hover:border-cyan-500/50 transition-all group">
          <div className="mb-6 p-6 rounded-full bg-[#0d1117] border border-white/5 text-gray-600 group-hover:text-cyan-500 group-hover:scale-110 transition-all shadow-xl">
            <Plus size={32} />
          </div>
          <div className="w-full max-w-xs relative z-10">
            <SearchableSelect
              options={allCards}
              onSelect={setCard}
              placeholder={placeholder}
            />
          </div>
          <p className="mt-4 text-xs text-gray-600 font-mono uppercase tracking-widest">
            Select Data Source
          </p>
        </div>
      );
    }

    const maxStat = 150000;
    const skills = [
      card.skillOne,
      card.skillTwo,
      card.skillThree,
      card.skillFour,
      card.yell,
    ].filter(Boolean);

    return (
      <div className="relative bg-[#161b22] rounded-xl border border-white/10 overflow-hidden shadow-2xl flex flex-col h-full group">
        {/* Header Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-0"></div>

        {/* Remove Button */}
        <button
          onClick={() => setCard(null)}
          className="absolute top-3 right-3 z-20 p-2 bg-black/50 hover:bg-red-900/80 rounded-lg text-gray-400 hover:text-white transition-colors border border-white/10 backdrop-blur-sm"
        >
          <X size={16} />
        </button>

        {/* --- TOP INFO --- */}
        <div className="relative p-6 flex gap-5 border-b border-white/5 z-10">
          {/* Thumb */}
          <div className="flex-shrink-0 relative">
            <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 rounded-full"></div>
            <img
              src={getCardImageUrl(card, "thumb")}
              alt="thumb"
              className="relative w-24 h-24 rounded-xl border-2 border-white/10 shadow-2xl object-cover bg-[#0a0c10]"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/150x150?text=No+Image";
              }}
            />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/80 border border-white/20 text-[9px] text-white px-2 py-0.5 rounded font-mono truncate max-w-full shadow-lg">
              {card.initialTitle}
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${card.initial === 5 ? "bg-pink-900/30 text-pink-300 border-pink-500/30" : "bg-yellow-900/30 text-yellow-300 border-yellow-500/30"}`}
              >
                {"★".repeat(card.initial)}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                IDOL_DB
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight mb-3 line-clamp-2 hover:text-cyan-400 transition-colors">
              {card.title?.[primaryLanguage] || card.title?.global}
            </h2>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-white/10">
                <img
                  src={getAttributeImageUrl(card.attribute)}
                  alt={card.attribute}
                  className="w-4 h-4"
                />
                <span className="text-[10px] font-bold text-gray-300 uppercase">
                  {card.attribute}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-white/10">
                <img
                  src={getCardTypeImageUrl(card.type)}
                  alt={card.type}
                  className="w-4 h-4"
                />
                <span className="text-[10px] font-bold text-gray-300 uppercase">
                  {card.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="p-6 flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent space-y-6 bg-[#0d1117]/50">
          {/* STATS */}
          <div className="bg-[#0a0c10] p-4 rounded-xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
              <Activity size={64} />
            </div>

            <div className="flex justify-between items-end mb-5 pb-3 border-b border-white/5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Zap size={14} className="text-yellow-500" /> Power Level
              </span>
              <span className="text-2xl font-black text-white font-mono tracking-tighter">
                {card.stats.total.toLocaleString()}
              </span>
            </div>

            <div className="space-y-3">
              {(["vocal", "dance", "visual", "stamina"] as const).map(
                (stat) => {
                  const info = getStatColorInfo(stat);
                  const value = card.stats[stat];
                  // Compare logic (jika ada card lawan)
                  const compareValue = compareCard
                    ? compareCard.stats[stat]
                    : 0;
                  const diff = compareCard ? value - compareValue : 0;
                  const percent = Math.min((value / maxStat) * 100, 100);

                  return (
                    <div key={stat} className="relative">
                      <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                        <span
                          className={`flex items-center gap-1 ${info.text}`}
                        >
                          {info.icon} {stat}
                        </span>
                        <div className="flex gap-2 font-mono">
                          <span className="text-white">
                            {value.toLocaleString()}
                          </span>
                          {compareCard && diff !== 0 && (
                            <span
                              className={`${diff > 0 ? "text-green-400" : "text-red-400"}`}
                            >
                              {diff > 0 ? "+" : ""}
                              {diff}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${info.color} rounded-full`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                },
              )}
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
                  className={`p-4 rounded-lg border text-sm transition-all relative group/skill overflow-hidden
                    ${isYell ? "bg-purple-900/10 border-purple-500/20" : "bg-[#161b22] border-white/10"}
                    ${isSkillFour ? "border-yellow-500/30 bg-yellow-900/5" : ""}
                `}
                >
                  {/* Hover Highlight */}
                  <div className="absolute left-0 top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-0 group-hover/skill:opacity-100 transition-opacity"></div>

                  <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                    <h4
                      className={`font-bold text-sm ${isYell ? "text-purple-300" : isSkillFour ? "text-yellow-300" : "text-pink-300"}`}
                    >
                      {isYell && (
                        <span className="text-[10px] bg-purple-500 text-black px-1 rounded mr-2 font-black">
                          P
                        </span>
                      )}
                      {skill?.name?.[primaryLanguage] || skill?.name?.global}
                    </h4>

                    {/* Tags */}
                    <div className="flex gap-1 flex-wrap justify-end">
                      {"typeSkill" in skill && skill.typeSkill && (
                        <span className="text-[9px] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800/50 uppercase font-mono">
                          {skill.typeSkill}
                        </span>
                      )}
                      {"ct" in skill && (
                        <span className="text-[9px] bg-[#0d1117] text-gray-400 px-1.5 py-0.5 rounded border border-white/10 font-mono">
                          CT:{skill.ct}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-400 text-xs leading-relaxed font-sans">
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
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-cyan-500 font-mono tracking-widest animate-pulse">
        LOADING CARD DATA...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 md:p-8 font-sans selection:bg-cyan-500 selection:text-white">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-900/30 border border-cyan-500/30 rounded text-cyan-400">
              <Activity size={24} />
            </div>
            <div>
              <span className="text-[10px] text-cyan-500 font-bold tracking-[0.2em] uppercase block">
                Analysis Module
              </span>
              <h1 className="text-3xl font-black italic tracking-tighter text-white">
                CARD{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  COMPARISON&nbsp;
                </span>
              </h1>
            </div>
          </div>

          <div className="flex gap-1 bg-[#161b22] p-1 rounded-lg border border-white/10">
            {(["japanese", "global", "indo"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setPrimaryLanguage(lang)}
                className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                  primaryLanguage === lang
                    ? "bg-cyan-600 text-white shadow-lg"
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Globe size={10} />{" "}
                  {lang === "japanese" ? "JP" : lang === "global" ? "EN" : "ID"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* COMPARISON STAGE */}
        <div className="flex-1 relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-stretch">
          <CardSlot
            card={card1}
            setCard={setCard1}
            placeholder="ADD UNIT A"
            compareCard={card2}
          />

          {/* VS Divider */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center pointer-events-none">
            <div className="bg-[#0f1115] p-2 rounded-full border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-3 rounded-full shadow-inner">
                <Swords size={24} className="text-white" />
              </div>
            </div>
            <div className="h-24 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent absolute -z-10"></div>
          </div>

          <CardSlot
            card={card2}
            setCard={setCard2}
            placeholder="ADD UNIT B"
            compareCard={card1}
          />
        </div>
      </div>
    </div>
  );
};

export default CardComparison;
