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
const ITEMS_PER_PAGE = 30; // Limit 20 Card

// --- HELPER IMAGE URL GENERATOR (Lokal untuk Modal di Page ini) ---
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
  // Jika backend sudah menyediakan link costume (dari script sync-data.mjs), pakai itu.
  if (card.images?.costume) {
    return card.images.costume;
  }

  // Jika tidak ada, return gambar transparan atau placeholder
  return `${import.meta.env.BASE_URL}assets/default_image.png`;
};

// Function to generate unique identifier for Card
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

// --- STYLE SELECT DARK MODE ---
const customSelectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: "#1f2937", // bg-gray-800
    borderColor: "#374151", // border-gray-700
    color: "white",
    minHeight: "42px",
  }),
  singleValue: (base: any) => ({ ...base, color: "white" }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: "#374151",
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: "white",
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: "#9ca3af",
    ":hover": {
      backgroundColor: "#ef4444",
      color: "white",
    },
  }),
  menu: (base: any) => ({ ...base, backgroundColor: "#1f2937", zIndex: 50 }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? "#374151" : "#1f2937",
    color: "white",
  }),
  input: (base: any) => ({ ...base, color: "white" }),
  placeholder: (base: any) => ({ ...base, color: "#9ca3af" }),
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
              // TAMBAHKAN INI SECARA EKSPLISIT AGAR AMAN
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

  // --- DATA STATE ---
  const [characters, setCharacters] = useState<Character[]>([]);
  const [cardSources, setCardSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FILTER STATE ---
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

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);

  // --- MODAL STATE ---
  const [selectedCard, setSelectedCard] = useState<CardWithSourceName | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEvolvedView, setIsEvolvedView] = useState(false); // Untuk toggle gambar di modal
  const [primaryLanguage, setPrimaryLanguage] = useState<
    "japanese" | "global" | "indo"
  >("global");

  // --- FETCH DATA ---
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
    if (charParam !== selectedCharacter) {
      setSelectedCharacter(charParam);
    }
  }, [searchParams]);

  // --- PROCESSING DATA ---
  const sources = useMemo(
    () => processCardSources(cardSources, characters),
    [cardSources, characters],
  );

  const allCards = useMemo(() => {
    return sources.flatMap((source) =>
      source.data.map((card) => ({
        ...card,
        _sourceName: source.name,
      })),
    );
  }, [sources]);

  // --- FILTER OPTIONS CALCULATION (RESTORED LOGIC) ---

  // 1. Group Options
  const groupOptions = useMemo(() => {
    const groups = new Set<string>();
    characters.forEach((char) => {
      if (char.groupName) {
        groups.add(char.groupName);
      }
    });
    return Array.from(groups).map((group) => ({
      value: group,
      label: group,
    }));
  }, [characters]);

  // 2. Character Options (dengan Count)
  const characterOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    allCards.forEach((card) => {
      if (card._sourceName) {
        counts[card._sourceName] = (counts[card._sourceName] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        value: name,
        label: `${name} (${count})`,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [allCards]);

  // 3. Category Options (dengan Count)
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

  // --- FILTERING LOGIC ---
  const filteredCards = useMemo(() => {
    let result = allCards;

    if (selectedCharacter) {
      result = result.filter(
        (card) =>
          card._sourceName.toLowerCase() === selectedCharacter.toLowerCase(),
      );
    }
    if (selectedRarity) {
      result = result.filter((card) => card.initial === selectedRarity);
    }
    if (selectedAttribute) {
      result = result.filter(
        (card) =>
          card.attribute.toLowerCase() === selectedAttribute.toLowerCase(),
      );
    }
    if (selectedType) {
      result = result.filter(
        (card) => card.type.toLowerCase() === selectedType.toLowerCase(),
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (card) =>
          card.title?.global?.toLowerCase().includes(query) ||
          card.title?.japanese?.toLowerCase().includes(query) ||
          card.title?.indo?.toLowerCase().includes(query),
      );
    } // Filter 3: Advanced Multi Selects (RESTORED)

    // a. Groups
    if (selectedGroups.length > 0) {
      const selectedGroupValues = selectedGroups.map((g) => g.value);
      result = result.filter((card) => {
        // Cari data karakter dari kartu ini
        const charData = characters.find((c) => c.name === card._sourceName);
        // Cek apakah groupName karakter ini ada di list yg dipilih
        return (
          charData &&
          charData.groupName &&
          selectedGroupValues.includes(charData.groupName)
        );
      });
    }

    // b. Characters (Specific)
    if (selectedCharacters.length > 0) {
      const selectedCharValues = selectedCharacters.map((c) => c.value);
      result = result.filter((card) =>
        selectedCharValues.includes(card._sourceName),
      );
    }

    // c. Categories
    if (selectedCategories.length > 0) {
      const selectedCatValues = selectedCategories.map((c) => c.value);
      result = result.filter((card) =>
        selectedCatValues.includes(card.category || "Unknown"),
      );
    }

    // Default Sorting: Newest Release Date
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredCards.length / ITEMS_PER_PAGE);

  // Reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCharacter,
    selectedRarity,
    selectedAttribute,
    selectedType,
    searchQuery,
  ]);

  // Potong data sesuai halaman
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCards.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCards, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll ke bagian atas list (bukan paling atas halaman)
      const listElement = document.getElementById("card-list-top");
      if (listElement) {
        listElement.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // --- HANDLER UI ---
  const handleCharacterClick = (charName: string) => {
    if (selectedCharacter === charName) {
      setSelectedCharacter(null);
      setSearchParams({});
    } else {
      setSelectedCharacter(charName);
      setSearchParams({ character: charName });
    }
  };

  const handleCardClick = (card: CardWithSourceName) => {
    setSelectedCard(card);
    setIsModalOpen(true);
    setIsEvolvedView(false); // Reset view ke normal saat buka modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const renderWithBr = (text?: string | string[]) => {
    if (!text) return null;

    // Jika datanya Array (misal: ["Line 1", "Line 2"]), kita map langsung
    if (Array.isArray(text)) {
      return text.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ));
    }

    // Jika datanya String (misal: "Line 1\nLine 2"), kita split dulu
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  // --- PAGINATION COMPONENT ---
  const Pagination = () => {
    if (totalPages <= 1) return null;

    // Logic range halaman (Smart Pagination)
    const getPageNumbers = () => {
      const delta = 1;
      const range = [];
      const rangeWithDots = [];
      for (let i = 1; i <= totalPages; i++) {
        if (
          i === 1 ||
          i === totalPages ||
          (i >= currentPage - delta && i <= currentPage + delta)
        ) {
          range.push(i);
        }
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
      <div className="flex justify-center items-center gap-2 py-6 animate-in fade-in duration-300">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30"
        >
          <ChevronsLeft size={18} />
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30 mr-2"
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
            className={`min-w-[32px] h-8 px-2 rounded text-sm font-bold transition-all ${
              pageNum === currentPage
                ? "bg-pink-600 text-white scale-110"
                : typeof pageNum !== "number"
                  ? "text-gray-500 bg-transparent"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30 ml-2"
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white font-sans">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header & Filters */}
        <header className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur-md border-b border-gray-800 shadow-md">
          <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="relative">
              <SearchBar
                searchTerm={searchQuery}
                onSearchChange={handleSearchChange}
                placeholderText="Search by name or title or group"
              />
            </div>

            {/* Filter Controls */}
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
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "white",
                  }),
                  singleValue: (base) => ({ ...base, color: "white" }),
                  menu: (base) => ({ ...base, backgroundColor: "#1f2937" }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "#374151" : "#1f2937",
                    color: "white",
                  }),
                }}
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
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                  }),
                  singleValue: (base) => ({ ...base, color: "white" }),
                  menu: (base) => ({ ...base, backgroundColor: "#1f2937" }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "#374151" : "#1f2937",
                    color: "white",
                  }),
                }}
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
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                  }),
                  singleValue: (base) => ({ ...base, color: "white" }),
                  menu: (base) => ({ ...base, backgroundColor: "#1f2937" }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "#374151" : "#1f2937",
                    color: "white",
                  }),
                }}
              />
              {/* Groups */}
              <Select
                isMulti
                options={groupOptions}
                value={selectedGroups}
                onChange={(selected) =>
                  setSelectedGroups(
                    selected as MultiValue<{
                      value: string;
                      label: string;
                    }>,
                  )
                }
                placeholder="Select Groups..."
                classNamePrefix="select"
                styles={customSelectStyles}
              />

              {/* Characters (Multi) */}
              <Select
                isMulti
                options={characterOptions}
                value={selectedCharacters}
                onChange={(selected) =>
                  setSelectedCharacters(
                    selected as MultiValue<{
                      value: string;
                      label: string;
                      count?: number;
                    }>,
                  )
                }
                placeholder="Select Characters..."
                classNamePrefix="select"
                styles={customSelectStyles}
              />

              {/* Categories */}
              <Select
                isMulti
                options={categoryOptions}
                value={selectedCategories}
                onChange={(selected) =>
                  setSelectedCategories(
                    selected as MultiValue<{
                      value: string;
                      label: string;
                      count?: number;
                    }>,
                  )
                }
                placeholder="Select Categories..."
                classNamePrefix="select"
                styles={customSelectStyles}
              />
            </div>

            {/* Language Toggle */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setPrimaryLanguage("japanese")}
                  className={`px-3 py-1 rounded text-base transition-colors ${primaryLanguage === "japanese" ? "bg-pink-600" : "bg-gray-700 hover:bg-gray-600"}`}
                >
                  JP
                </button>
                <button
                  onClick={() => setPrimaryLanguage("global")}
                  className={`px-3 py-1 rounded text-base transition-colors ${primaryLanguage === "global" ? "bg-pink-600" : "bg-gray-700 hover:bg-gray-600"}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setPrimaryLanguage("indo")}
                  className={`px-3 py-1 rounded text-base transition-colors ${primaryLanguage === "indo" ? "bg-pink-600" : "bg-gray-700 hover:bg-gray-600"}`}
                >
                  ID
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Card List Area */}
        <main
          className="flex-1 p-4 md:p-8 bg-gray-950/50 text-gray-800"
          id="card-list-top"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4 text-gray-400 text-sm">
              <p>
                Found{" "}
                <span className="text-pink-400 font-bold">
                  {filteredCards.length}
                </span>{" "}
                cards
              </p>
              <p>
                Page {currentPage} of {totalPages || 1}
              </p>
            </div>

            {/* TOP PAGINATION */}
            <Pagination />

            {/* LIST */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : filteredCards.length > 0 ? (
              <CardList
                cardAfterFilter={paginatedCards}
                onSelectCard={handleCardClick}
                primaryLanguage={primaryLanguage}
              />
            ) : (
              <div className="text-center py-20 text-gray-500 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
                <p className="text-lg">No cards found matching your filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedAttribute(null);
                    setSelectedRarity(null);
                    setSelectedType(null);
                    setSelectedCharacter(null);
                    setSearchParams({});
                  }}
                  className="mt-4 text-pink-400 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* BOTTOM PAGINATION */}
            <Pagination />
          </div>
        </main>
      </div>

      {/* --- MODAL DETAIL (Disesuaikan Image Source-nya) --- */}
      {isModalOpen && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-7xl rounded-2xl bg-gray-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
              <div className="flex gap-2">
                <button
                  onClick={() => setPrimaryLanguage("japanese")}
                  className={`px-3 py-1 rounded text-xs transition-colors ${primaryLanguage === "japanese" ? "bg-pink-600" : "bg-gray-700 hover:bg-gray-600"}`}
                >
                  JP
                </button>
                <button
                  onClick={() => setPrimaryLanguage("global")}
                  className={`px-3 py-1 rounded text-xs transition-colors ${primaryLanguage === "global" ? "bg-pink-600" : "bg-gray-700 hover:bg-gray-600"}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setPrimaryLanguage("indo")}
                  className={`px-3 py-1 rounded text-xs transition-colors ${primaryLanguage === "indo" ? "bg-pink-600" : "bg-gray-700 hover:bg-gray-600"}`}
                >
                  ID
                </button>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content Modal */}
            <div className="flex flex-col lg:flex-row max-h-[30rem]">
              {/* Kiri: Gambar */}
              <div className="lg:w-1/2 p-6 bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center relative">
                <div className="relative w-full">
                  {/* LOGIC GAMBAR:
                        - Jika Bintang 5: Ikuti state toggle (isEvolvedView). Default false (Base).
                        - Jika Bintang < 5: Paksa true (karena biasanya gambar ada di index 1/evolved, index 0 kosong).
                    */}
                  <img
                    src={getCardImageUrl(
                      selectedCard,
                      "full",
                      selectedCard.initial === 5 ? isEvolvedView : true,
                    )}
                    className="w-full h-auto rounded-xl shadow-[0_0_25px_rgba(0,0,0,0.5)] border border-gray-700"
                    alt="Card Art"
                    onError={(e) => {
                      // Hapus fallback ke thumb, langsung ke placeholder jika gagal
                      e.currentTarget.src = getPlaceholderImageUrl("rect");
                    }}
                  />

                  {/* Toggle Evolution Button 
                        HANYA MUNCUL JIKA INITIAL == 5 (Punya Base & Evolved)
                    */}
                  {selectedCard.initial === 5 && (
                    <button
                      onClick={() => setIsEvolvedView(!isEvolvedView)}
                      className="absolute bottom-4 right-4 bg-black/60 hover:bg-pink-600 text-white p-2.5 rounded-full backdrop-blur-sm transition-all border border-white/20 shadow-lg group"
                      title="Switch Art"
                    >
                      {/* Icon Refresh/Switch */}
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

              {/* Kanan: Info (Tetap seperti sebelumnya) */}
              <div className="lg:w-1/2 p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={getCardTypeImageUrl(selectedCard.type)}
                          className="w-6 h-6"
                          alt={selectedCard.type}
                        />
                        <img
                          src={getAttributeImageUrl(selectedCard.attribute)}
                          className="w-6 h-6"
                          alt={selectedCard.attribute}
                        />
                        <span className="text-yellow-400 font-bold text-lg">
                          {"★".repeat(selectedCard.initial)}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {selectedCard.title?.[primaryLanguage] ||
                          selectedCard.title?.global}
                      </h2>
                      <p className="text-gray-400 italic mb-4">
                        {selectedCard.initialTitle}
                      </p>
                    </div>
                    {getCardCosuUrl(selectedCard) !=
                      `${import.meta.env.BASE_URL}assets/default_image.png` && (
                      <div id="costume-icon" className="h-20 w-auto mr-6">
                        {selectedCard.initial === 5 && (
                          <img
                            // Gunakan fungsi getCardCosuUrl yang baru
                            src={getCardCosuUrl(selectedCard)}
                            alt={`Costume ${selectedCard.uniqueId}`}
                            className="h-auto w-10 rounded bg-white object-cover p-1 lg:w-20"
                            onError={(e) => {
                              e.currentTarget.src = `${
                                import.meta.env.BASE_URL
                              }assets/default_image.png`;
                              e.currentTarget.alt = "Image not available";
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* --- STATS SECTION --- */}
                  <div className="mb-6 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    {/* Total Stats */}
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                      <div className="flex items-center gap-2 text-gray-300 font-bold">
                        <Activity size={18} className="text-pink-500" />
                        TOTAL POWER
                      </div>
                      <span className="text-xl font-black text-white">
                        {selectedCard.stats.total.toLocaleString()}
                      </span>
                    </div>

                    {/* Stat Bars Horizontal */}
                    {(["vocal", "dance", "visual", "stamina"] as const).map(
                      (stat) => {
                        const info = getStatColorInfo(stat);
                        const value = selectedCard.stats[stat];
                        const maxStat = 150000; // Standard max stat
                        const percent = Math.min((value / maxStat) * 100, 100);

                        return (
                          <div key={stat} className="mb-3 last:mb-0">
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
                      },
                    )}
                  </div>
                </div>

                {/* --- SKILLS & YELL SECTION --- */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-400 border-b border-gray-800 pb-1 mb-2">
                    SKILLS & YELL
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
                      // Guard Clause: Lewati jika null/undefined
                      if (!skill) return null;

                      // Logic Check
                      const isYell = !("typeSkill" in skill);
                      const isSkillFour = skill === selectedCard.skillFour;

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
                              {skill?.name?.[primaryLanguage] ||
                                skill?.name?.global}
                            </h4>

                            <div className="flex gap-1 flex-wrap justify-end">
                              {/* Type Skill Badge (Cek property 'typeSkill') */}
                              {"typeSkill" in skill && skill.typeSkill && (
                                <span
                                  className="text-[10px] bg-blue-900/50 text-blue-200 px-1.5 py-0.5 rounded border border-blue-800 whitespace-nowrap"
                                  title={skill.typeSkill}
                                >
                                  {skill.typeSkill}
                                </span>
                              )}
                              {/* CT Badge (Cek property 'ct') */}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default CardOverviewPage;
