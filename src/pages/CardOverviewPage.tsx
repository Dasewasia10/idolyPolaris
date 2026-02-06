import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Source, Card } from "../interfaces/Card";
import { Character } from "../interfaces/Character";
import axios from "axios";
import Select from "react-select";

import SearchBar from "../components/searchBar";
import CardList from "../components/cardList"; // Import komponen baru

import {
  getCardAttributeImageUrl,
  getCardTypeImageUrl,
  getAttributeImageUrl,
  getPlaceholderImageUrl,
} from "../utils/imageUtils";

interface CardWithSourceName extends Card {
  _sourceName: string;
}

const API_BASE_URL = "https://diveidolypapi.my.id/api";

// Function to generate unique identifier for Card
const generateCardId = (card: Card): string => {
  const globalTitleWords = (card.title?.global ?? "NewCard").split(" ");
  const firstTwoWords = globalTitleWords.slice(0, 2).join("");
  return `${card.initialTitle}-${firstTwoWords}`;
};

const matchWithCharacters = (cardSources: Source[], characters: any[]) =>
  cardSources.map((source) => {
    const matched = characters.find(
      (char) => char.name.toLowerCase() === source.name.toLowerCase()
    );
    return {
      key: source.name,
      name: source.name,
      data: source.data,
      character: matched || null,
    };
  });

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
            }
          : undefined,
        battleCommentary: item.battleCommentary,
        explanation: item.explanation,
      })),
    })),
    characters
  );
};

const CardOverview: React.FC = () => {
  const menuRef = useRef(null);
  const openRef = useRef(null);
  const sourceImageRef = useRef(null);
  const { cardTitle } = useParams<{ cardTitle: string }>();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [cardSources, setCardSources] = useState<Source[]>([]);
  const [, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSourceImageOpen, setSourceImageIsOpen] = useState(false);
  const [slot, setSlot] = useState<CardWithSourceName | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  type Language = "japanese" | "global" | "indo";
  const [primaryLanguage, setPrimaryLanguage] = useState<Language>("global");

  const [showIconB, setShowIconB] = useState<boolean>(false);
  const [showIconE, setShowIconE] = useState<boolean>(false);
  const [showSource, setShowSource] = useState<boolean>(false);
  const [showSourceE, setShowSourceE] = useState<boolean>(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State untuk filter
  const [selectedGroup, setSelectedGroup] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedSourceName, setSelectedSourceName] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedAttribute, setSelectedAttribute] = useState<string[]>([]);

  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cardRes, characterRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/cards`), // Ganti dengan endpoint API yang sesuai
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

  // Title Page Dynamic
  useEffect(() => {
    document.title = "Polaris Idoly | Card Overview";

    return () => {
      document.title = "Polaris Idoly";
    };
  }, []);

  const sources = useMemo(
    () => processCardSources(cardSources, characters),
    [cardSources, characters]
  ); // ✅ Sekarang hanya dihitung ulang saat `cardSources` atau `characters` berubah

  const [cards, setCards] = useState<Card[]>([]);

  // Memastikan cards diperbarui saat sources berubah
  useEffect(() => {
    if (cards.length === 0) {
      setCards(
        sources.flatMap((source) => {
          return Array.isArray(source.data)
            ? source.data.map((card: any) => ({
                ...card,
                sourceName: source.name,
              }))
            : [];
        })
      );
    }
  }, [sources]); // ✅ Ini hanya akan berjalan jika `sources` berubah

  // Fungsi untuk mengaplikasikan filter
  const applyFilters = (cards: CardWithSourceName[]) => {
    return cards.filter((card) => {
      // Ambil karakter yang sesuai dengan _sourceName
      const character = characters.find(
        (char) => char.name.toLowerCase() === card._sourceName.toLowerCase()
      );

      // Cek apakah kartu termasuk dalam group yang dipilih
      const matchesGroup =
        selectedGroup.length === 0 ||
        selectedGroup.some((group) => group.value === character?.groupName);

      // Cek apakah kartu sesuai dengan nama karakter yang dipilih
      const matchesSourceName =
        selectedSourceName.length === 0 ||
        selectedSourceName.some((source) => source.value === card._sourceName);

      // Cek apakah kartu sesuai dengan type yang dipilih
      const matchesType =
        selectedType.length === 0 || selectedType.includes(card.type);

      // Cek apakah kartu sesuai dengan attribute yang dipilih
      const matchesAttribute =
        selectedAttribute.length === 0 ||
        selectedAttribute.includes(card.attribute);

      return (
        matchesGroup && matchesSourceName && matchesType && matchesAttribute
      );
    });
  };

  // Gunakan useMemo agar filteredCards tidak dihitung ulang kecuali searchTerm atau cards berubah
  const filteredCards: CardWithSourceName[] = useMemo(() => {
    const filteredBySearch = cards
      .filter((card) => {
        // Ambil sourceName dari sources berdasarkan initialTitle
        const source = sources.find((source) =>
          source.data.some((c: Card) => c.initialTitle === card.initialTitle)
        );

        const sourceName = source?.name || "Unknown Source";

        // Cari karakter berdasarkan sourceName yang sudah ditemukan
        const character = characters.find(
          (char) =>
            sourceName && char.name.toLowerCase() === sourceName.toLowerCase()
        );

        const nameMatches = character
          ? character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.japaneseName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            character.groupName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            character.seiyuuName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            character.japaneseSeiyuuName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (character.familyName &&
              character.familyName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))
          : false;

        return (
          card.initialTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.title.japanese
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          card.title.global?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.title.indo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.attribute.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nameMatches
        );
      })
      .map((card) => {
        // Ambil kembali sourceName agar bisa dipakai di _sourceName
        const source = sources.find((source) =>
          source.data.some((c: Card) => c.initialTitle === card.initialTitle)
        );

        return {
          ...card,
          title: {
            ...card.title,
            [primaryLanguage]: card.title?.[primaryLanguage] || "Unknown Title",
          },
          _sourceName: source?.name || "Unknown Source", // Simpan _sourceName
        };
      });

    return applyFilters(filteredBySearch);
  }, [
    cards,
    searchTerm,
    primaryLanguage,
    sources,
    selectedGroup,
    selectedSourceName,
    selectedType,
    selectedAttribute,
    characters, // Tambahkan characters sebagai dependency
  ]);

  // ✅ Sekarang hanya dihitung ulang jika dependensi berubah

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        // Pastikan cardSources sudah didefinisikan
        const data: Card[] = cardSources.flatMap((source) =>
          source.data.map((item) => ({
            ...item,
            sourceName: source.name,
          }))
        );
        setCards(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cardTitle]);

  useEffect(() => {
    const filteredCardTranslations = cards.filter(
      (t) =>
        t.title?.[primaryLanguage] ||
        t.description?.[primaryLanguage] ||
        t.battleCommentary?.[primaryLanguage] ||
        t.explanation?.[primaryLanguage]
    );

    setSlot((prevSlot) =>
      prevSlot
        ? {
            ...prevSlot,
            cardTitle:
              filteredCardTranslations.find((t) => t.title?.[primaryLanguage])
                ?.title?.[primaryLanguage] || "----",
          }
        : null
    );
  }, [primaryLanguage, cards]);

  const toggleOpen = (_p0: boolean) => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (
        (menuRef.current as unknown as HTMLElement) &&
        !(menuRef.current as unknown as HTMLElement).contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
      if (
        (openRef.current as unknown as HTMLElement) &&
        !(openRef.current as unknown as HTMLElement).contains(event.target)
      ) {
        setIsOpen(false);
      }
      if (
        (sourceImageRef.current as unknown as HTMLElement) &&
        !(sourceImageRef.current as unknown as HTMLElement).contains(
          event.target
        )
      ) {
        setSourceImageIsOpen(false);
      }
    };

    if (isMenuOpen || isOpen || isSourceImageOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, isOpen, isSourceImageOpen]);

  const IMG_BASE_URL = "https://api.diveidolypapi.my.id";

  const getCardImageUrl = (
  assetId: string,
  type: "full" | "thumb" | "upper",
  isEvolved: boolean = false
) => {
  // Konfigurasi folder dan ekstensi berdasarkan tipe
  const config = {
    full: { folder: "cardFull", ext: "webp" },
    thumb: { folder: "cardThumb", ext: "png" },
    upper: { folder: "cardUpper", ext: "png" },
  };

  const { folder, ext } = config[type];

  // Logika Index: 
  // 1 = Normal (Pre-bloom)
  // 2 = Evolved (Post-bloom)
  // Catatan: Jika thumb di R2 kamu benar-benar mulai dari 0, ubah '1' menjadi '0' di baris bawah.
  // Tapi standar Idoly Pride biasanya 1 dan 2.
  const index = isEvolved ? 2 : 1; 

  return `${IMG_BASE_URL}/${folder}/img_card_${type}_${index}_${assetId}.${ext}`;
};

  const getCardCosuUrl = (
    chara: string,
    cosuName: string,
    cosuIndex: number
  ) => {
    // Ubah cosuName menjadi huruf kecil dan hilangkan spasi
    const formattedCosuName = cosuName.toLowerCase().replace(/\s+/g, "");

    return `https://www.diveidolypapi.my.id/api/img/card/cosu/${encodeURIComponent(
      chara.toLowerCase()
    )}/${encodeURIComponent(formattedCosuName)}/${encodeURIComponent(
      cosuIndex.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    )}`;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleSelectCard = (card: CardWithSourceName) => {
    const selectedCard = {
      ...card,
      cardTitle:
        typeof card.title === "string"
          ? card.title
          : card.title?.[primaryLanguage] || "----",
      _sourceName: card._sourceName || "Unknown Source",
    };
    setSlot(selectedCard);
    setIsOpen(true);
  };

  // Ambil daftar group yang unik dari data karakter
  const uniqueGroups = useMemo(() => {
    const groups = new Set<string>();
    characters.forEach((char) => {
      if (char.groupName) {
        groups.add(char.groupName);
      }
    });
    return Array.from(groups);
  }, [characters]);

  // Format data untuk react-select (group)
  const groupOptions = uniqueGroups.map((group) => ({
    value: group,
    label: group,
  }));

  // Format data untuk react-select (karakter)
  const characterOptions = characters.map((char) => ({
    value: char.name,
    label: char.name,
  }));

  // Handler untuk tombol toggle type
  const handleTypeToggle = (type: string) => {
    if (selectedType.includes(type)) {
      setSelectedType((prev) => prev.filter((t) => t !== type));
    } else {
      setSelectedType((prev) => [...prev, type]);
    }
  };

  // Handler untuk tombol toggle attribute
  const handleAttributeToggle = (attribute: string) => {
    if (selectedAttribute.includes(attribute)) {
      setSelectedAttribute((prev) => prev.filter((a) => a !== attribute));
    } else {
      setSelectedAttribute((prev) => [...prev, attribute]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Cek jika klik terjadi di luar kedua menu
      const leftMenu = document.getElementById("leftConsole");

      const isClickOutsideLeft =
        leftMenu && !leftMenu.contains(event.target as Node);

      // Jika salah satu menu terbuka dan klik di luar
      if (isLeftMenuOpen && isClickOutsideLeft) {
        setIsLeftMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLeftMenuOpen]); // Tambahkan dependencies

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)"); // Sesuaikan dengan breakpoint lg Anda

    const handleResize = (e: MediaQueryListEvent) => {
      if (e.matches) {
        // Jika ukuran layar menjadi desktop (lg), tutup sidebar
        setIsSidebarOpen(false);
      }
    };

    // Tambahkan listener
    mediaQuery.addEventListener("change", handleResize);

    // Bersihkan listener saat komponen unmount
    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  return (
    <div className="transition-all duration-300 ease-out flex flex-col z-10 gap-8 items-center w-full mt-10 lg:mt-0">
      <section id="leftConsole" className="absolute">
        {/* Menu Sidebar */}
        <div
          className={`fixed left-0 top-0 h-full bg-slate-900 z-10 transition-all duration-300 ease-in-out flex mt-20 ${
            isLeftMenuOpen ? "translate-x-0 w-72 lg:w-96" : "-translate-x-full"
          }`}
        >
          {/* Konten Menu */}
          <div className="w-full bg-slate-900 p-4 overflow-y-auto">
            <h2 className="flex font-bold text-3xl text-white py-2">Handler</h2>
            <div className="flex flex-col gap-4">
              <div className="mt-2 flex flex-col gap-2 rounded border-2 border-white p-4">
                <p className="text-white">Select language</p>
                <div className="flex flex-row gap-4">
                  <button
                    className={`rounded px-4 py-1 hover:bg-blue-300 ${
                      primaryLanguage === "global"
                        ? "bg-blue-500 text-white"
                        : "bg-white"
                    }`}
                    onClick={() => setPrimaryLanguage("global")}
                  >
                    en
                  </button>
                  <button
                    className={`rounded px-4 py-1 hover:bg-blue-300 ${
                      primaryLanguage === "japanese"
                        ? "bg-blue-500 text-white"
                        : "bg-white"
                    }`}
                    onClick={() => setPrimaryLanguage("japanese")}
                  >
                    jp
                  </button>
                  <button
                    className={`rounded px-4 py-1 hover:bg-blue-300 ${
                      primaryLanguage === "indo"
                        ? "bg-blue-500 text-white"
                        : "bg-white"
                    }`}
                    onClick={() => setPrimaryLanguage("indo")}
                  >
                    id
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-col gap-4 rounded border-2 border-white p-4">
                {/* Filter Group (Multi-Select Dropdown) */}
                <div>
                  <p className="text-white">Select Group</p>
                  <Select
                    isMulti
                    options={groupOptions}
                    value={selectedGroup}
                    onChange={(selected) =>
                      setSelectedGroup(
                        selected as { value: string; label: string }[]
                      )
                    }
                    className="mt-2"
                    classNamePrefix="select"
                    placeholder="Select groups..."
                  />
                </div>

                {/* Filter Character (Multi-Select Dropdown) */}
                <div>
                  <p className="text-white">Select Character</p>
                  <Select
                    isMulti
                    options={characterOptions}
                    value={selectedSourceName}
                    onChange={(selected) =>
                      setSelectedSourceName(
                        selected as { value: string; label: string }[]
                      )
                    }
                    className="mt-2"
                    classNamePrefix="select"
                    placeholder="Select characters..."
                  />
                </div>

                {/* Filter Type (Tombol Toggle) */}
                <div>
                  <p className="text-white">Select Type</p>
                  <div className="mt-2 flex flex-row flex-wrap gap-2">
                    {["Scorer", "Buffer", "Supporter"].map((type) => (
                      <button
                        key={type}
                        className={`rounded px-4 py-2 hover:bg-blue-300 ${
                          selectedType.includes(type)
                            ? "bg-blue-500 text-white"
                            : "bg-white"
                        }`}
                        onClick={() => handleTypeToggle(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Attribute (Tombol Toggle) */}
                <div>
                  <p className="text-white">Select Attribute</p>
                  <div className="mt-2 flex flex-row flex-wrap gap-2">
                    {["Vocal", "Dance", "Visual"].map((attribute) => (
                      <button
                        key={attribute}
                        className={`rounded px-4 py-2 hover:bg-blue-300 ${
                          selectedAttribute.includes(attribute)
                            ? "bg-blue-500 text-white"
                            : "bg-white"
                        }`}
                        onClick={() => handleAttributeToggle(attribute)}
                      >
                        {attribute}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Tombol Toggle yang menempel di sisi kanan sidebar */}
          <button
            onClick={() => setIsLeftMenuOpen(!isLeftMenuOpen)}
            title="Klik untuk membuka/tutup menu kiri"
            className={`absolute -right-8 top-1/3 h-16 w-8 bg-slate-900 text-white rounded-r-md hover:bg-slate-700 transition-all flex items-center justify-center`}
          >
            {isLeftMenuOpen ? "<" : ">"}
          </button>
        </div>
      </section>

      <div className="z-0 w-2/3">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          placeholderText="Search by name or title or group"
        />
      </div>

      <div className="flex w-full flex-col gap-4 overflow-y-scroll shadow-inner h-[33rem] p-2 scrollbar-minimal">
        <CardList
          cardAfterFilter={filteredCards}
          onSelectCard={handleSelectCard}
          primaryLanguage={primaryLanguage}
        />
      </div>

      {isOpen && slot && (
        <div className="fixed inset-0 items-center justify-center z-30 flex bg-[#00246B] bg-opacity-50 pt-40 lg:pt-20 xl:pt-0">
          <div
            ref={openRef}
            className="isolate relative flex h-[42rem] w-full p-6 lg:p-12 lg:flex-row flex-col"
          >
            {/* Tombol toggle sidebar untuk mobile */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="fixed bottom-40 right-4 z-40 rounded-full bg-blue-500 p-3 text-white shadow-lg lg:hidden"
            >
              {isSidebarOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
            <section
              className={`z-40 flex flex-col w-fit gap-2 rounded bg-gray-800 px-4 py-2 transition-all duration-300 ease-in-out lg:px-6 lg:py-4 mt-20 lg:mt-0 ${
                isSidebarOpen ? "fixed left-4 top-4" : "hidden lg:block"
              }`}
            >
              <div className="flex items-center justify-between lg:mb-5">
                <h3 className="flex text-xl font-bold text-white lg:text-3xl">
                  Handler
                </h3>
                <button
                  onClick={() => {
                    toggleOpen(false);
                    closeModal();
                  }}
                  className="scale-[60%] rounded bg-red-500 hover:bg-red-700 p-2 text-white lg:scale-100 lg:block hidden"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex">
                  <div className="flex flex-col gap-2 rounded border-2 border-white p-4">
                    <p className="text-white">Select language</p>
                    <div className="flex flex-row gap-4">
                      <button
                        className={`rounded px-4 py-1 hover:bg-blue-300 ${
                          primaryLanguage === "global"
                            ? "bg-blue-500 text-white"
                            : "bg-white"
                        }`}
                        onClick={() => setPrimaryLanguage("global")}
                      >
                        en
                      </button>
                      <button
                        className={`rounded px-4 py-1 hover:bg-blue-300 ${
                          primaryLanguage === "japanese"
                            ? "bg-blue-500 text-white"
                            : "bg-white"
                        }`}
                        onClick={() => setPrimaryLanguage("japanese")}
                      >
                        jp
                      </button>
                      <button
                        className={`rounded px-4 py-1 hover:bg-blue-300 ${
                          primaryLanguage === "indo"
                            ? "bg-blue-500 text-white"
                            : "bg-white"
                        }`}
                        onClick={() => setPrimaryLanguage("indo")}
                      >
                        id
                      </button>
                    </div>
                  </div>
                </div>
                {slot.category == "Evolution" && (
                  <>
                    <div className="mt-2 flex flex-col gap-2 rounded border-2 border-white p-4">
                      <p className="text-white">Evolution Icon</p>
                      <button
                        onClick={() => setShowIconE(!showIconE)}
                        className="mt-2 flex flex-col flex-wrap content-center justify-center gap-2 rounded border-2 border-white p-2 bg-white hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={slot.category !== "Evolution"}
                      >
                        <span className="font-semibold opacity-100">
                          {showIconE ? "Evolution Icon" : "Initial Icon"}
                        </span>
                      </button>
                    </div>
                  </>
                )}
                {/* Periksa apakah slot memiliki iconImageB yang valid */}
                {slot.initial !== 5 && (
                  <>
                    <div className="flex flex-col gap-2 rounded border-2 border-white p-4">
                      <p className="text-white">Trained Icon</p>
                      <button
                        onClick={() => setShowIconB(!showIconB)}
                        className="mt-2 flex flex-col flex-wrap content-center justify-center gap-2 rounded border-2 border-white p-2 bg-white hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={slot.initial === 5}
                      >
                        <span className="font-semibold opacity-100">
                          {showIconB ? "Non-*5 Icon" : "Trained Icon"}
                        </span>
                      </button>
                    </div>
                  </>
                )}
                {slot.category == "Evolution" && (
                  <>
                    <div className="flex flex-col gap-2 rounded border-2 border-white p-4 lg:block hidden">
                      <p className="text-white">Evolution Image</p>
                      <button
                        onClick={() => setShowSourceE(!showSourceE)}
                        className="mt-2 flex flex-col flex-wrap content-center justify-center gap-2 rounded border-2 border-white p-2 bg-white hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={slot.category !== "Evolution"}
                      >
                        <span className="font-semibold opacity-100 text-black">
                          {showSourceE ? "Evolution Image" : "Initial Image"}
                        </span>
                      </button>
                    </div>
                  </>
                )}
                {(slot.initial == 5 || 4) && (
                  <div className="flex flex-col gap-2 rounded border-2 border-white p-4 lg:hidden block">
                    <p className="text-white">Full Image</p>
                    <button
                      onClick={() => {
                        setShowSource(!showSource);
                      }}
                      className="mt-2 flex flex-col flex-wrap content-center justify-center gap-2 rounded border-2 border-white p-2 bg-white hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <span className="font-semibold text-black">
                        {showSource ? "Hide Image" : "Show Image"}
                      </span>
                    </button>
                    {slot.category == "Evolution" && (
                      <button
                        onClick={() => {
                          setShowSourceE(!showSourceE);
                        }}
                        className="mt-2 flex flex-col flex-wrap content-center justify-center gap-2 rounded border-2 border-white p-2 bg-white hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <span className="font-semibold text-black">
                          {showSourceE
                            ? "Hide Evolution Image"
                            : "Show Evolution Image"}
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </section>

            {showSource && (
              <div className="flex justify-center absolute z-40 lg:hidden block left-0 top-4">
                <img
                  src={getCardImageUrl(slot.initialTitle, "full", false)}
                  alt={`Source ${slot.initialTitle}`}
                  className="max-w-full h-auto rounded-lg border-2 border-white"
                  onError={(e) => {
                    e.currentTarget.src = `${
                      import.meta.env.BASE_URL
                    }assets/default_image.png`;
                    e.currentTarget.alt = "Image not available";
                  }}
                />
              </div>
            )}
            {showSourceE && (
              <div className="flex justify-center absolute z-40 lg:hidden block left-0 top-4">
                <img
                  src={getCardImageUrl(slot.initialTitle, "full", true)}
                  alt={`Source ${slot.initialTitle}`}
                  className="max-w-full h-auto rounded-lg border-2 border-white"
                  onError={(e) => {
                    e.currentTarget.src = `${
                      import.meta.env.BASE_URL
                    }assets/default_image.png`;
                    e.currentTarget.alt = "Image not available";
                  }}
                />
              </div>
            )}
            <div className="inset-0 mx-auto h-auto w-full overflow-y-auto rounded bg-white p-4 shadow-lg scrollbar-minimal relative mb-36 lg:mb-0">
              {/* Gambar fixed (diam) */}
              <div className="sticky top-0 z-0 hidden lg:block">
                <img
                  // UPDATE DISINI: Logika toggle Normal/Evolved
                  src={getCardImageUrl(
                    slot.initialTitle, 
                    "full", 
                    showSourceE && slot.category === "Evolution" // Cek flag evolved
                  )}
                  onError={(e) => {
                    e.currentTarget.src = `${
                      import.meta.env.BASE_URL
                    }assets/default_image.png`;
                    e.currentTarget.alt = "Image not available";
                  }}
                  alt={`Card ${slot.initialTitle}`}
                  className="h-full w-auto rounded bg-white object-cover p-1"
                />
              </div>
              {/* Pita Scroll - hanya tampil di desktop */}
              <div
                className="sticky bottom-0 z-10 hidden lg:flex justify-center py-2 -translate-y-16 lg:translate-y-0"
                onClick={() => {
                  const mainContent = document.getElementById("main-content");
                  mainContent?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className="cursor-pointer rounded-b-lg bg-blue-500 px-6 py-1 text-white shadow-md hover:bg-blue-600 flex flex-col items-center">
                  <span>Scroll ke Konten</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 animate-bounce"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div
                id="main-content"
                className="relative z-20 gap-4 flex flex-col rounded border bg-[#00246B] p-4 text-white shadow-sm"
              >
                <section className="flex flex-col items-center justify-around gap-4 lg:mt-4 lg:flex-row">
                  <section className="flex w-full flex-col justify-center gap-2 lg:gap-4">
                    <h3 className="w-full rounded bg-white text-center text-xl font-bold text-black lg:py-2 lg:text-2xl">
                      {slot.title?.[primaryLanguage]}
                    </h3>
                    <div className="flex items-center justify-evenly">
                      {slot.type && (
                        <img
                          src={getCardTypeImageUrl(slot.type)}
                          alt={slot.type}
                          className="h-auto w-8 lg:w-12"
                        />
                      )}
                      {slot.attribute && (
                        <img
                          src={getCardAttributeImageUrl(slot.attribute)}
                          alt={slot.attribute}
                          className="h-auto w-8 scale-110 rounded-full bg-white object-cover lg:w-12"
                        />
                      )}
                      <div id="costume-icon" className="">
                        {slot.initial === 5 &&
                          (() => {
                            const uniqueId =
                              (slot as Record<string, any>).uniqueId ||
                              "Unknown";
                            return (
                              <img
                                src={getCardCosuUrl(
                                  slot._sourceName,
                                  slot.costumeTheme,
                                  slot.costumeIndex
                                )}
                                onError={(e) => {
                                  e.currentTarget.src = `${
                                    import.meta.env.BASE_URL
                                  }assets/default_image.png`;
                                  e.currentTarget.alt = "Image not available";
                                }}
                                alt={`Card ${uniqueId}`}
                                className="h-auto w-10 rounded bg-white object-cover p-1 lg:w-20"
                              />
                            );
                          })()}
                      </div>
                    </div>
                  </section>
                  <div className="relative h-60 w-full items-center rounded lg:w-96">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        // UPDATE DISINI: Logika Icon (Thumb)
                        // showIconB (Trained) atau showIconE (Evolved) memicu gambar index 2
                        src={getCardImageUrl(
                          slot.initialTitle, 
                          "thumb", 
                          (showIconB && slot.initial !== 5) || (showIconE && slot.category === "Evolution")
                        )}
                        onError={(e) => {
                          e.currentTarget.src = `${
                            import.meta.env.BASE_URL
                          }assets/default_image.png`;
                          e.currentTarget.alt = "Image not available";
                        }}
                        alt={`Card ${slot.initialTitle}`}
                        className="h-full w-auto rounded-lg object-cover outline outline-offset-4 lg:relative lg:h-auto lg:object-none"
                    />
                    </div>
                  </div>
                </section>
                <section className="text-md grid grid-cols-1 gap-2 rounded border p-2 lg:mt-2 lg:grid-cols-1">
                  <section className="text-md grid grid-cols-1 gap-2 rounded border p-2 lg:mt-2 lg:grid-cols-2">
                    <div className="flex items-center justify-center text-center text-3xl font-bold">
                      {slot.stats.total}
                    </div>
                    <ul className="grid grid-cols-1 gap-1 border-2 sm:grid-cols-2 lg:grid-cols-4">
                      <li className="flex w-full justify-center border-x p-2 text-center ">
                        <span className="flex flex-row flex-wrap justify-center items-center border border-x-transparent border-b-white font-bold">
                          <img
                            src={getAttributeImageUrl("Vocal")}
                            alt={"vocalStat"}
                            className="h-auto w-6 md:w-9 lg:w-10"
                          />
                          {slot.stats.vocal}
                        </span>
                      </li>
                      <li className="flex w-full justify-center border-x p-2 text-center">
                        <span className="flex flex-row flex-wrap justify-center items-center border border-x-transparent border-b-white font-bold">
                          <img
                            src={getAttributeImageUrl("Visual")}
                            alt={"visualStat"}
                            className="h-auto w-6 md:w-9 lg:w-10"
                          />
                          {slot.stats.visual}
                        </span>
                      </li>
                      <li className="flex w-full justify-center border-x p-2 text-center">
                        <span className="flex flex-row flex-wrap justify-center items-center border border-x-transparent border-b-white font-bold">
                          <img
                            src={getAttributeImageUrl("Dance")}
                            alt={"danceStat"}
                            className="h-auto w-6 md:w-9 lg:w-10"
                          />
                          {slot.stats.dance}
                        </span>
                      </li>
                      <li className="flex w-full justify-center border-x p-2 text-center">
                        <span className="flex flex-row flex-wrap justify-center items-center border border-x-transparent border-b-white font-bold">
                          <img
                            src={getAttributeImageUrl("Stamina")}
                            alt={"staminaStat"}
                            className="h-auto w-6 md:w-9 lg:w-10"
                          />
                          {slot.stats.stamina}
                        </span>
                      </li>
                    </ul>
                  </section>
                </section>
                <h3 className="text-xl font-bold">Skills :</h3>
                {[slot.skillOne, slot.skillTwo, slot.skillThree]
                  .filter(Boolean)
                  .map((skill, index) => (
                    <section
                      key={index}
                      className="text-md flex flex-col rounded border p-2 lg:mt-2"
                    >
                      <div className="flex flex-col gap-1 border-2 lg:flex-row">
                        <div className="flex flex-col items-center border-x p-2 text-center">
                          <img
                            src={
                              skill?.source?.initialImage ||
                              getPlaceholderImageUrl("square")
                            }
                            alt={`IconSkillOne ${index + 1}`}
                            className="h-20 w-20 rounded object-cover"
                          />
                        </div>
                        <ul className="grid grid-rows-2 grid-cols-2 lg:grid-rows-1 lg:grid-cols-4 w-full">
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-grow lg:justify-center">
                            <span className="border border-x-transparent border-b-white font-bold">
                              Type
                            </span>
                            {skill?.typeSkill}
                          </li>
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-grow lg:justify-center">
                            <span className="border border-x-transparent border-b-white font-bold">
                              Stamina Cost
                            </span>
                            {skill?.staminaUsed}
                          </li>
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-grow lg:justify-center">
                            <span className="border border-x-transparent border-b-white font-bold">
                              Probability
                            </span>
                            {skill?.probability === undefined ||
                            skill?.probability === null
                              ? "NaN"
                              : `${skill?.probability} %`}
                          </li>
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-grow lg:justify-center">
                            <span className="border border-x-transparent border-b-white font-bold">
                              CT / Cool Time
                            </span>
                            {skill?.ct === 1
                              ? "Just Once"
                              : skill?.ct === 0
                              ? "NaN"
                              : skill?.ct}
                          </li>
                        </ul>
                      </div>
                      <div className="p-2">
                        <h4 className="font-bold">
                          {skill?.name?.[primaryLanguage]}
                        </h4>
                        <p>
                          {skill?.description?.[primaryLanguage]?.map(
                            (line, index) => (
                              <p key={index}>{line}</p>
                            )
                          )}
                        </p>
                      </div>
                    </section>
                  ))}

                {slot.skillFour && (
                  <>
                    <h3 className="text-xl font-bold">Kizuna Skills :</h3>
                    <section className="text-md flex flex-col rounded border-2 p-2 lg:mt-2 border-l-pink-500 border-r-purple-500 border-t-teal-300 border-b-yellow-300">
                      <div className="flex flex-col gap-1 border-2 lg:flex-row">
                        <div className="flex flex-col items-center justify-center border-x p-2 text-center">
                          <img
                            src={
                              slot.skillFour.source?.initialImage ||
                              getPlaceholderImageUrl("square")
                            }
                            alt="Skill Four Icon"
                            className="h-20 w-20 rounded object-cover"
                          />
                        </div>
                        <ul className="grid grid-rows-2 grid-cols-2 lg:grid-rows-1 lg:grid-cols-4 w-full">
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-1">
                            <span className="border border-x-transparent border-b-white font-bold">
                              Type
                            </span>
                            {slot.skillFour.typeSkill}
                          </li>
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-1">
                            <span className="border border-x-transparent border-b-white font-bold">
                              Stamina Cost
                            </span>
                            {slot.skillFour.staminaUsed}
                          </li>
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-1">
                            <span className="border border-x-transparent border-b-white font-bold">
                              Probability
                            </span>
                            {slot.skillFour.probability
                              ? `${slot.skillFour.probability} %`
                              : "NaN"}
                          </li>
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-1">
                            <span className="border border-x-transparent border-b-white font-bold">
                              CT / Cool Time
                            </span>
                            {slot.skillFour.ct === 1
                              ? "Just Once"
                              : slot.skillFour.ct || "NaN"}
                          </li>
                        </ul>
                      </div>
                      <div className="p-2">
                        <h4 className="font-bold">
                          {slot.skillFour.name?.[primaryLanguage]}
                        </h4>
                        <p>
                          {slot.skillFour.description?.[primaryLanguage]?.join(
                            " "
                          )}
                        </p>
                      </div>
                    </section>
                  </>
                )}

                <section className="text-md flex lg:mt-2 lg:items-center gap-2 lg:flex-row flex-col">
                  <h3 className="text-xl font-bold">Yell/Cheer :</h3>
                  <div className="p-2 flex flex-col border rounded">
                    <h4 className="font-bold">
                      {slot.yell?.name?.[primaryLanguage]}
                    </h4>
                    <p>{slot.yell?.description?.[primaryLanguage]}</p>
                  </div>
                </section>
              </div>
            </div>
            {/* Tombol close untuk mobile */}
            <button
              onClick={() => {
                toggleOpen(false);
                closeModal();
              }}
              className="fixed bottom-20 right-4 z-40 lg:hidden rounded-full bg-red-500 p-3 text-white shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
        </div>
      )}
    </div>
  );
};

export default CardOverview;
