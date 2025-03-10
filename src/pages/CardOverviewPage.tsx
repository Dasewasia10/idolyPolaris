import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Source, Card } from "../interfaces/Card";
import { Character } from "../interfaces/Character";
import axios from "axios";

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

const API_BASE_URL = "https://www.diveidolypapi.my.id/api";

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
  const [showSourceE, setShowSourceE] = useState<boolean>(false);

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

  // Gunakan useMemo agar filteredCards tidak dihitung ulang kecuali searchTerm atau cards berubah
  const filteredCards: CardWithSourceName[] = useMemo(() => {
    return cards
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
  }, [cards, searchTerm, primaryLanguage, sources]);
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

  const toggleMenu = (_p0: boolean) => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleOpen = (_p0: boolean) => {
    setIsOpen(!isOpen);
  };

  const toggleSourceImageOpen = (_p0: boolean) => {
    setSourceImageIsOpen(!isSourceImageOpen);
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

  const getCardIconUrl = (
    chara: string,
    initial: number,
    cosuName: string,
    cosuIndex: number
  ) => {
    // Ubah cosuName menjadi huruf kecil dan hilangkan spasi
    const formattedCosuName = cosuName.toLowerCase().replace(/\s+/g, "");

    return `https://www.diveidolypapi.my.id/api/img/card/thumb/${encodeURIComponent(
      chara.toLowerCase()
    )}/${encodeURIComponent(
      initial.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    )}/${encodeURIComponent(formattedCosuName)}/${encodeURIComponent(
      cosuIndex.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    )}`;
  };

  const getCardIconBUrl = (
    chara: string,
    initial: number,
    cosuName: string,
    cosuIndex: number
  ) => {
    // Ubah cosuName menjadi huruf kecil dan hilangkan spasi
    const formattedCosuName = cosuName.toLowerCase().replace(/\s+/g, "");

    return `https://www.diveidolypapi.my.id/api/img/card/thumbB/${encodeURIComponent(
      chara.toLowerCase()
    )}/${encodeURIComponent(
      initial.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    )}/${encodeURIComponent(formattedCosuName)}/${encodeURIComponent(
      cosuIndex.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    )}`;
  };

  const getCardIconEUrl = (
    chara: string,
    initial: number,
    cosuName: string,
    cosuIndex: number
  ) => {
    // Ubah cosuName menjadi huruf kecil dan hilangkan spasi
    const formattedCosuName = cosuName.toLowerCase().replace(/\s+/g, "");

    return `https://www.diveidolypapi.my.id/api/img/card/thumbE/${encodeURIComponent(
      chara.toLowerCase()
    )}/${encodeURIComponent(
      initial.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    )}/${encodeURIComponent(formattedCosuName)}/${encodeURIComponent(
      cosuIndex.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    )}`;
  };

  const getCardSourceUrl = (
    chara: string,
    initial: number,
    cosuName: string,
    cosuIndex: number
  ) => {
    // Ubah cosuName menjadi huruf kecil dan hilangkan spasi
    const formattedCosuName = cosuName.toLowerCase().replace(/\s+/g, "");

    return `https://www.diveidolypapi.my.id/api/img/card/source/${encodeURIComponent(
      chara.toLowerCase()
    )}/${encodeURIComponent(
      initial.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    )}/${encodeURIComponent(formattedCosuName)}/${encodeURIComponent(
      cosuIndex.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    )}`;
  };

  const getCardSourceEUrl = (
    chara: string,
    initial: number,
    cosuName: string,
    cosuIndex: number
  ) => {
    // Ubah cosuName menjadi huruf kecil dan hilangkan spasi
    const formattedCosuName = cosuName.toLowerCase().replace(/\s+/g, "");

    return `https://www.diveidolypapi.my.id/api/img/card/sourceE/${encodeURIComponent(
      chara.toLowerCase()
    )}/${encodeURIComponent(
      initial.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    )}/${encodeURIComponent(formattedCosuName)}/${encodeURIComponent(
      cosuIndex.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    )}`;
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const closeSourceImageModal = () => {
    setSourceImageIsOpen(false);
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

  return (
    <div className="transition-all duration-300 ease-out flex flex-row h-screen">
      {/* Tombol Hamburger (Muncul hanya di layar kecil, `lg:hidden`) */}
      <button
        onClick={() => toggleMenu(false)}
        className="absolute left-4 top-4 z-30 rounded bg-gray-800 p-2 text-white transition-all duration-300 ease-in-out lg:hidden"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16m-7 6h7"
          ></path>
        </svg>
      </button>

      {/* Sidebar Menu */}
      <section
        ref={menuRef}
        className={`absolute left-2 top-4 flex w-fit flex-col gap-2 rounded bg-gray-800 px-4 py-2 transition-all duration-300 ease-in-out lg:w-1/4 
    ${isMenuOpen ? "block" : "hidden"} lg:block lg:sticky`}
      >
        <div className="flex flex-row items-center justify-between">
          {/* Tombol Tutup (Hanya tampil di layar kecil, `lg:hidden`) */}
          <button
            onClick={() => toggleMenu(false)}
            className="z-10 rounded bg-gray-800 p-2 text-white lg:hidden"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
          <div className="flex items-center gap-4">
            <button
              className="px-4 py-2 bg-gray-300 hover:bg-gray-800 rounded-md hover:text-white font-semibold"
              onClick={handleBackClick}
            >
              {"<"}
            </button>
            <h1 className="flex justify-center font-bold text-3xl text-white">
              Card Overview
            </h1>
          </div>
        </div>
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
      </section>

      <div className="fixed right-4 top-4 z-20 w-1/2">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          placeholderText="Search by name or group"
        />
      </div>

      <div className="mt-24 mb-4 lg:mb-8 flex w-full flex-col gap-8 px-8 lg:mt-20 overflow-y-scroll shadow-inner">
        <CardList
          cardAfterFilter={filteredCards}
          onSelectCard={handleSelectCard}
          primaryLanguage={primaryLanguage}
        />
      </div>

      {isOpen && slot && (
        <div className="fixed inset-0 z-20 flex h-[100dvh] w-screen bg-[#00246B] bg-opacity-50">
          <div
            ref={openRef}
            className="fixed inset-0 flex h-[100dvh] w-screen p-6 lg:p-12"
          >
            <section className="flex w-fit flex-col gap-2 rounded bg-gray-800 px-4 py-2 transition-all duration-300 ease-in-out lg:px-6 lg:py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white lg:text-3xl">
                  Handler
                </h3>
                <button
                  onClick={() => {
                    toggleOpen(false);
                    closeModal();
                  }}
                  className="scale-[60%] rounded bg-red-500 p-2 text-white lg:scale-100"
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
                  <div className="mt-2 flex flex-col gap-2 rounded border-2 border-white p-4">
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
              {slot.initial === 5 && (
                <>
                  <div className="mt-2 flex flex-col gap-2 rounded border-2 border-white p-4">
                    <p className="text-white">Full Image</p>
                    <button
                      onClick={() => toggleSourceImageOpen(true)}
                      className="mt-2 flex flex-col flex-wrap content-center justify-center gap-2 rounded border-2 border-white p-2 bg-white hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <span className="font-semibold opacity-100">
                        Click Here
                      </span>
                    </button>
                  </div>
                </>
              )}
            </section>
            <div className="inset-0 mx-auto h-auto w-full overflow-y-auto rounded bg-white p-4 shadow-lg">
              <div className="flex flex-col gap-4 rounded border bg-[#00246B] p-4 text-white shadow-sm scrollbar-thin">
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
                        src={
                          showIconB && slot.initial !== 5
                            ? getCardIconBUrl(
                                slot._sourceName,
                                slot.initial,
                                slot.costumeTheme,
                                slot.costumeIndex
                              )
                            : showIconE && slot.category === "Evolution"
                            ? getCardIconEUrl(
                                slot._sourceName,
                                slot.initial,
                                slot.costumeTheme,
                                slot.costumeIndex
                              )
                            : getCardIconUrl(
                                slot._sourceName,
                                slot.initial,
                                slot.costumeTheme,
                                slot.costumeIndex
                              ) || getPlaceholderImageUrl("square")
                        }
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
          </div>
        </div>
      )}

      {isSourceImageOpen && slot && (
        <div
          ref={sourceImageRef}
          className="fixed inset-0 z-30 flex w-screen bg-[#00246B] bg-opacity-50"
        >
          <div className="fixed inset-0 flex w-screen p-2 lg:p-6">
            <div className="inset-0 mx-auto w-full overflow-y-hidden rounded bg-white p-2 shadow-lg">
              <div className="flex rounded bg-[#00246B] p-2 text-white shadow-sm scrollbar-thin">
                <div className="flex absolute flex-col">
                  <button
                    onClick={() => {
                      toggleSourceImageOpen(false);
                      closeSourceImageModal();
                    }}
                    className="scale-[60%] rounded bg-red-500 hover:bg-red-700 p-2 text-white lg:scale-100"
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
                  {slot.category == "Evolution" && (
                    <>
                      <button
                        onClick={() => setShowSourceE(!showSourceE)}
                        className="mt-2 flex flex-col flex-wrap content-center justify-center gap-2 rounded border-2 border-white p-2 bg-white hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={slot.category !== "Evolution"}
                      >
                        <span className="font-semibold opacity-100 text-black">
                          {showSourceE ? "Evolution Icon" : "Initial Icon"}
                        </span>
                      </button>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <img
                    src={
                      showSourceE && slot.category === "Evolution"
                        ? getCardSourceEUrl(
                            slot._sourceName,
                            slot.initial,
                            slot.costumeTheme,
                            slot.costumeIndex
                          )
                        : getCardSourceUrl(
                            slot._sourceName,
                            slot.initial,
                            slot.costumeTheme,
                            slot.costumeIndex
                          ) || getPlaceholderImageUrl("square")
                    }
                    onError={(e) => {
                      e.currentTarget.src = `${
                        import.meta.env.BASE_URL
                      }assets/default_image.png`;
                      e.currentTarget.alt = "Image not available";
                    }}
                    alt={`Card ${slot._sourceName}`}
                    className="h-4/5 w-auto rounded bg-white object-cover p-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardOverview;
