import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Source, Card } from "../interfaces/Card";
import { Character } from "../interfaces/Character";
import axios from "axios";
import Select, { MultiValue } from "react-select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mic,
  Music,
  Ribbon,
  Heart,
  Activity,
  Database,
  X,
} from "lucide-react";

import SearchBar from "../components/searchBar";
import CardList from "../components/cardList";

import {
  getCardTypeImageUrl,
  getAttributeImageUrl,
  getPlaceholderImageUrl,
} from "../utils/imageUtils";

interface CardWithSourceName extends Card {
  _sourceName: string;
}

const API_BASE_URL = "https://diveidolypapi.my.id/api";
const IMG_BASE_URL = "https://api.diveidolypapi.my.id";
const ITEMS_PER_PAGE = 30;

// --- HELPER IMAGE URL (Sama) ---
const getCardImageUrl = (
  card: Card,
  type: "full" | "thumb" | "upper",
  isEvolved: boolean = false,
) => {
  const assetId = card.initialTitle;
  const rarity = card.initial;
  const hasAwakening = card.hasAwakening ?? false;
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

const getCardCosuUrl = (card: any) => {
  if (card.images?.costume) return card.images.costume;
  return `${import.meta.env.BASE_URL}assets/default_image.png`;
};

const generateCardId = (card: Card): string => {
  const globalTitleWords = (card.title?.global ?? "NewCard").split(" ");
  const firstTwoWords = globalTitleWords.slice(0, 2).join("");
  return `${card.initialTitle}-${firstTwoWords}`;
};

const matchWithCharacters = (cardSources: Source[], characters: any[]) =>
  cardSources.map((source) => {
    const matched = characters.find(
      (char) => char.name.toLowerCase() === source.name.toLowerCase(),
    );
    return {
      key: source.name,
      name: source.name,
      data: source.data,
      character: matched || null,
    };
  });

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

// --- STYLE SELECT DARK MODE (Updated) ---
const customSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: "#161b22", // Darker bg
    borderColor: state.isFocused ? "#3b82f6" : "#30363d",
    color: "white",
    minHeight: "42px",
    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
    "&:hover": { borderColor: "#3b82f6" },
  }),
  singleValue: (base: any) => ({ ...base, color: "white" }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: "#1f2937",
    border: "1px solid #374151",
  }),
  multiValueLabel: (base: any) => ({ ...base, color: "#e5e7eb" }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: "#9ca3af",
    ":hover": { backgroundColor: "#ef4444", color: "white" },
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: "#161b22",
    border: "1px solid #30363d",
    zIndex: 50,
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? "#1f2937" : "#161b22",
    color: "white",
    cursor: "pointer",
    ":active": { backgroundColor: "#3b82f6" },
  }),
  input: (base: any) => ({ ...base, color: "white" }),
  placeholder: (base: any) => ({ ...base, color: "#6b7280" }),
};

const processCardSources = (cardSources: Source[], characters: any[]) => {
  return matchWithCharacters(
    cardSources.map((source) => ({
      ...source,
      data: source.data.map((item) => ({
        ...item,
        sourceName: source.name,
        uniqueId: generateCardId(item),
        initialTitle: item.initialTitle,
        titles: [item.title],
        descriptions: [item.description],
        messages: item.message ? [item.message] : [],
        releaseDate: item.releaseDate,
        category: item.category,
        costumeTheme: item.costumeTheme,
        type: item.type,
        attribute: item.attribute,
        hasAwakening: item.hasAwakening,
        initial: item.initial,
        stats: item.stats,
        skillOne: {
          ...item.skillOne,
          name: item.skillOne.name,
          description: item.skillOne.description,
          source: item.skillOne.source,
        },
        skillTwo: {
          ...item.skillTwo,
          name: item.skillTwo.name,
          description: item.skillTwo.description,
          source: item.skillTwo.source,
        },
        skillThree: {
          ...item.skillThree,
          name: item.skillThree.name,
          description: item.skillThree.description,
          source: item.skillThree.source,
        },
        skillFour: item.skillFour && {
          ...item.skillFour,
          name: item.skillFour.name,
          description: item.skillFour.description,
          source: item.skillFour.source,
        },
        yell: item.yell
          ? {
              ...item.yell,
              name: item.yell.name || { japanese: "", global: "", indo: "" },
              description: item.yell.description || {
                japanese: "",
                global: "",
                indo: "",
              },
              source: item.yell.source,
            }
          : undefined,
        battleCommentary: item.battleCommentary,
        explanation: item.explanation,
      })),
    })),
    characters,
  );
};

const CardOverviewPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [cardSources, setCardSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    searchParams.get("character"),
  );
  const [selectedRarity, setSelectedRarity] = useState<number | null>(null);
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(
    null,
  );
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<
    MultiValue<{ value: string; label: string }>
  >([]);
  const [selectedCharacters, setSelectedCharacters] = useState<
    MultiValue<{ value: string; label: string; count?: number }>
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<
    MultiValue<{ value: string; label: string; count?: number }>
  >([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState<CardWithSourceName | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEvolvedView, setIsEvolvedView] = useState(false);
  const [primaryLanguage, setPrimaryLanguage] = useState<
    "japanese" | "global" | "indo"
  >("global");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cardRes, characterRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/cards`),
          axios.get(`${API_BASE_URL}/characters`),
        ]);
        setCardSources(cardRes.data);
        setCharacters(characterRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const charParam = searchParams.get("character");
    if (charParam !== selectedCharacter) setSelectedCharacter(charParam);
  }, [searchParams]);

  const sources = useMemo(
    () => processCardSources(cardSources, characters),
    [cardSources, characters],
  );
  const allCards = useMemo(
    () =>
      sources.flatMap((source) =>
        source.data.map((card) => ({ ...card, _sourceName: source.name })),
      ),
    [sources],
  );

  const groupOptions = useMemo(() => {
    const groups = new Set<string>();
    characters.forEach((char) => {
      if (char.groupName) groups.add(char.groupName);
    });
    return Array.from(groups).map((group) => ({ value: group, label: group }));
  }, [characters]);

  const characterOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    allCards.forEach((card) => {
      if (card._sourceName)
        counts[card._sourceName] = (counts[card._sourceName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({
        value: name,
        label: `${name} (${count})`,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [allCards]);

  const categoryOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    allCards.forEach((card) => {
      const cat = card.category || "Unknown";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([cat, count]) => ({
        value: cat,
        label: `${cat} (${count})`,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [allCards]);

  const filteredCards = useMemo(() => {
    let result = allCards;
    if (selectedCharacter)
      result = result.filter(
        (card) =>
          card._sourceName.toLowerCase() === selectedCharacter.toLowerCase(),
      );
    if (selectedRarity)
      result = result.filter((card) => card.initial === selectedRarity);
    if (selectedAttribute)
      result = result.filter(
        (card) =>
          card.attribute.toLowerCase() === selectedAttribute.toLowerCase(),
      );
    if (selectedType)
      result = result.filter(
        (card) => card.type.toLowerCase() === selectedType.toLowerCase(),
      );
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (card) =>
          card.title?.global?.toLowerCase().includes(query) ||
          card.title?.japanese?.toLowerCase().includes(query) ||
          card.title?.indo?.toLowerCase().includes(query),
      );
    }
    if (selectedGroups.length > 0) {
      const selectedGroupValues = selectedGroups.map((g) => g.value);
      result = result.filter((card) => {
        const charData = characters.find((c) => c.name === card._sourceName);
        return (
          charData &&
          charData.groupName &&
          selectedGroupValues.includes(charData.groupName)
        );
      });
    }
    if (selectedCharacters.length > 0) {
      const selectedCharValues = selectedCharacters.map((c) => c.value);
      result = result.filter((card) =>
        selectedCharValues.includes(card._sourceName),
      );
    }
    if (selectedCategories.length > 0) {
      const selectedCatValues = selectedCategories.map((c) => c.value);
      result = result.filter((card) =>
        selectedCatValues.includes(card.category || "Unknown"),
      );
    }
    return result.sort(
      (a, b) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
    );
  }, [
    allCards,
    characters,
    selectedCharacter,
    selectedRarity,
    selectedAttribute,
    selectedType,
    searchQuery,
    selectedGroups,
    selectedCharacters,
    selectedCategories,
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);
  const totalPages = Math.ceil(filteredCards.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCharacter,
    selectedRarity,
    selectedAttribute,
    selectedType,
    searchQuery,
    selectedGroups,
    selectedCharacters,
    selectedCategories,
  ]);

  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCards.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCards, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const listElement = document.getElementById("card-list-top");
      if (listElement)
        listElement.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCardClick = (card: CardWithSourceName) => {
    setSelectedCard(card);
    setIsModalOpen(true);
    setIsEvolvedView(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const renderWithBr = (text?: string | string[]) => {
    if (!text) return null;
    if (Array.isArray(text))
      return text.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ));
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;
    const getPageNumbers = () => {
      const delta = 1;
      const range = [];
      const rangeWithDots = [];
      for (let i = 1; i <= totalPages; i++) {
        if (
          i === 1 ||
          i === totalPages ||
          (i >= currentPage - delta && i <= currentPage + delta)
        )
          range.push(i);
      }
      let l;
      for (let i of range) {
        if (l) {
          if (i - l === 2) rangeWithDots.push(l + 1);
          else if (i - l !== 1) rangeWithDots.push("...");
        }
        rangeWithDots.push(i);
        l = i;
      }
      return rangeWithDots;
    };

    return (
      <div className="flex justify-center items-center gap-2 py-6">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded bg-[#161b22] border border-white/10 text-gray-400 hover:text-white disabled:opacity-30"
        >
          <ChevronsLeft size={18} />
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded bg-[#161b22] border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 mr-2"
        >
          <ChevronLeft size={18} />
        </button>
        {getPageNumbers().map((pageNum, idx) => (
          <button
            key={idx}
            onClick={() =>
              typeof pageNum === "number" && handlePageChange(pageNum)
            }
            disabled={typeof pageNum !== "number"}
            className={`min-w-[32px] h-8 px-2 rounded text-sm font-bold border transition-all ${pageNum === currentPage ? "bg-cyan-600 border-cyan-500 text-white shadow-lg" : typeof pageNum !== "number" ? "text-gray-500 bg-transparent border-transparent" : "bg-[#161b22] border-white/10 text-gray-400 hover:bg-[#1f2937]"}`}
          >
            {pageNum}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded bg-[#161b22] border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 ml-2"
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded bg-[#161b22] border border-white/10 text-gray-400 hover:text-white disabled:opacity-30"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#0f1115] text-white font-sans relative selection:bg-cyan-500 selection:text-white">
      {/* Background Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header & Filters */}
        <header className="sticky top-0 z-30 bg-[#0f1115]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
          <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            {/* Title & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-600 rounded text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                  <Database size={20} />
                </div>
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase block">
                    Card Database
                  </span>
                  <h1 className="text-2xl font-black italic tracking-tighter text-white">
                    IDOL{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                      ARCHIVE&nbsp;
                    </span>
                  </h1>
                </div>
              </div>

              <div className="w-full md:w-auto relative group">
                <SearchBar
                  searchTerm={searchQuery}
                  onSearchChange={handleSearchChange}
                  placeholderText="Search card name / title..."
                />
              </div>
            </div>

            {/* Filter Controls (Grid Layout) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Select
                options={[
                  { value: null, label: "All Rarities" },
                  { value: 5, label: "★ 5" },
                  { value: 4, label: "★ 4" },
                  { value: 3, label: "★ 3" },
                  { value: 2, label: "★ 2" },
                  { value: 1, label: "★ 1" },
                ]}
                placeholder="Rarity"
                onChange={(opt) => setSelectedRarity(opt?.value || null)}
                styles={customSelectStyles}
              />
              <Select
                options={[
                  { value: null, label: "All Attributes" },
                  { value: "Vocal", label: "Vocal" },
                  { value: "Dance", label: "Dance" },
                  { value: "Visual", label: "Visual" },
                ]}
                placeholder="Attribute"
                onChange={(opt) => setSelectedAttribute(opt?.value || null)}
                styles={customSelectStyles}
              />
              <Select
                options={[
                  { value: null, label: "All Types" },
                  { value: "Scorer", label: "Scorer" },
                  { value: "Buffer", label: "Buffer" },
                  { value: "Supporter", label: "Supporter" },
                ]}
                placeholder="Type"
                onChange={(opt) => setSelectedType(opt?.value || null)}
                styles={customSelectStyles}
              />
              <Select
                isMulti
                options={groupOptions}
                value={selectedGroups}
                onChange={(s) => setSelectedGroups(s as MultiValue<any>)}
                placeholder="Groups..."
                styles={customSelectStyles}
              />
              <Select
                isMulti
                options={characterOptions}
                value={selectedCharacters}
                onChange={(s) => setSelectedCharacters(s as MultiValue<any>)}
                placeholder="Characters..."
                styles={customSelectStyles}
              />
              <Select
                isMulti
                options={categoryOptions}
                value={selectedCategories}
                onChange={(s) => setSelectedCategories(s as MultiValue<any>)}
                placeholder="Categories..."
                styles={customSelectStyles}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8" id="card-list-top">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-white/5 text-gray-400 text-xs font-mono">
              <p>
                QUERY RESULT:{" "}
                <span className="text-cyan-400 font-bold">
                  {filteredCards.length}
                </span>{" "}
                RECORDS FOUND
              </p>
              <p>
                PAGE {currentPage} / {totalPages || 1}
              </p>
            </div>

            <Pagination />

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-cyan-500 font-mono tracking-widest animate-pulse">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                ACCESSING DATABASE...
              </div>
            ) : filteredCards.length > 0 ? (
              <CardList
                cardAfterFilter={paginatedCards}
                onSelectCard={handleCardClick}
                primaryLanguage={primaryLanguage}
              />
            ) : (
              <div className="text-center py-20 text-gray-500 bg-[#161b22] rounded-xl border border-dashed border-white/10 font-mono">
                <p>NO DATA MATCHING FILTERS</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedAttribute(null);
                    setSelectedRarity(null);
                    setSelectedType(null);
                    setSelectedCharacter(null);
                    setSearchParams({});
                  }}
                  className="mt-4 text-cyan-400 hover:underline"
                >
                  RESET FILTERS
                </button>
              </div>
            )}

            <Pagination />
          </div>
        </main>
      </div>

      {/* --- MODAL DETAIL --- */}
      {isModalOpen && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-7xl rounded-2xl bg-[#161b22] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#0d1117]">
              <div className="flex gap-2">
                {(["japanese", "global", "indo"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setPrimaryLanguage(lang)}
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${primaryLanguage === lang ? "bg-cyan-600 text-white" : "bg-[#1f2937] text-gray-400 hover:text-white"}`}
                  >
                    {lang === "japanese"
                      ? "JP"
                      : lang === "global"
                        ? "EN"
                        : "ID"}
                  </button>
                ))}
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
              {/* Left: Image (Dark) */}
              <div className="lg:w-1/2 bg-[#0a0c10] flex items-center justify-center p-6 relative group">
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                <div className="relative w-full max-w-md">
                  <img
                    src={getCardImageUrl(
                      selectedCard,
                      "full",
                      selectedCard.initial === 5 ? isEvolvedView : true,
                    )}
                    className="w-full h-auto rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                    alt="Card Art"
                    onError={(e) => {
                      e.currentTarget.src = getPlaceholderImageUrl("rect");
                    }}
                  />
                  {selectedCard.initial === 5 && (
                    <button
                      onClick={() => setIsEvolvedView(!isEvolvedView)}
                      className="absolute bottom-4 right-4 bg-black/80 text-cyan-400 p-3 rounded-full backdrop-blur border border-cyan-500/50 hover:bg-cyan-500 hover:text-white transition-all shadow-lg"
                    >
                      <svg
                        className={`w-5 h-5 transition-transform duration-500 ${isEvolvedView ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Info (Scrollable) */}
              <div className="lg:w-1/2 bg-[#161b22] p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={getCardTypeImageUrl(selectedCard.type)}
                        className="w-5 h-5"
                        alt={selectedCard.type}
                      />
                      <img
                        src={getAttributeImageUrl(selectedCard.attribute)}
                        className="w-5 h-5"
                        alt={selectedCard.attribute}
                      />
                      <span
                        className={`text-lg font-bold ${selectedCard.initial === 5 ? "text-pink-400 drop-shadow-md" : "text-yellow-400"}`}
                      >
                        {"★".repeat(selectedCard.initial)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white leading-tight">
                      {selectedCard.title?.[primaryLanguage] ||
                        selectedCard.title?.global}
                    </h2>
                    <p className="text-sm text-gray-500 font-mono mt-1 uppercase tracking-wide">
                      {selectedCard.initialTitle}
                    </p>
                  </div>
                  {getCardCosuUrl(selectedCard) !==
                    `${import.meta.env.BASE_URL}assets/default_image.png` &&
                    selectedCard.initial === 5 && (
                      <img
                        src={getCardCosuUrl(selectedCard)}
                        alt="costume"
                        className="w-16 h-auto rounded border border-white/20 bg-black/50 py-2 px-1 mr-2"
                      />
                    )}
                </div>

                {/* Stats */}
                <div className="bg-[#0d1117] p-4 rounded-xl border border-white/10">
                  <div className="flex justify-between items-end mb-4 border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      {" "}
                      <Activity size={14} className="text-cyan-500" />{" "}
                      Performance
                    </span>
                    <span className="text-xl font-black text-white font-mono">
                      {selectedCard.stats.total.toLocaleString()}
                    </span>
                  </div>
                  {(["vocal", "dance", "visual", "stamina"] as const).map(
                    (stat) => {
                      const info = getStatColorInfo(stat);
                      const value = selectedCard.stats[stat];
                      const percent = Math.min((value / 150000) * 100, 100);
                      return (
                        <div key={stat} className="mb-3 last:mb-0">
                          <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                            <span
                              className={`flex items-center gap-1 ${info.text}`}
                            >
                              {info.icon} {stat}
                            </span>
                            <span className="text-white font-mono">
                              {value.toLocaleString()}
                            </span>
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

                {/* Skills */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2 mb-3">
                    Skill Data
                  </h3>
                  {[
                    selectedCard.skillOne,
                    selectedCard.skillTwo,
                    selectedCard.skillThree,
                    selectedCard.skillFour,
                    selectedCard.yell,
                  ]
                    .filter(Boolean)
                    .map((skill, idx) => {
                      if (!skill) return null;
                      const isYell = !("typeSkill" in skill);
                      const isSkillFour = skill === selectedCard.skillFour;
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border text-sm transition-all ${isYell ? "bg-purple-900/10 border-purple-500/20" : "bg-[#0d1117] border-white/5 hover:border-white/20"} ${isSkillFour ? "border-yellow-500/30 bg-yellow-900/5" : ""}`}
                        >
                          <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                            <h4
                              className={`font-bold text-sm ${isYell ? "text-purple-300" : isSkillFour ? "text-yellow-300" : "text-pink-300"}`}
                            >
                              {isYell && (
                                <span className="text-[9px] bg-purple-600 text-white px-1 rounded mr-2">
                                  PASSIVE
                                </span>
                              )}
                              {skill?.name?.[primaryLanguage] ||
                                skill?.name?.global}
                            </h4>
                            <div className="flex gap-1 flex-wrap justify-end">
                              {"typeSkill" in skill && skill.typeSkill && (
                                <span className="text-[9px] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800/50">
                                  {skill.typeSkill}
                                </span>
                              )}
                              {"ct" in skill && (
                                <span className="text-[9px] bg-[#1f2937] text-gray-400 px-1.5 py-0.5 rounded border border-white/10 font-mono">
                                  CT:{skill.ct}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed font-sans border-l-2 border-white/10 pl-2">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default CardOverviewPage;
