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

const processCardSources = (cardSources: Source[], idols: any[]) => {
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
    idols
  );
};

const CardComparison: React.FC = () => {
  const menuRef = useRef(null);
  const openRef = useRef(null);
  const { cardTitle } = useParams<{ cardTitle: string }>();

  const [, setSelectedCards] = useState<Card[]>([]);
  const [, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [slot1, setSlot1] = useState<CardWithSourceName | null>(null);
  const [slot2, setSlot2] = useState<CardWithSourceName | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  type Language = "japanese" | "global" | "indo";
  const [primaryLanguage, setPrimaryLanguage] = useState<Language>("global");

  const [idols, setIdols] = useState<Character[]>([]);
  const [cardSources, setCardSources] = useState<Source[]>([]);

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
        setIdols(characterRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sources = useMemo(
    () => processCardSources(cardSources, idols),
    [cardSources, idols]
  ); // ✅ Sekarang hanya dihitung ulang saat `cardSources` atau `characters` berubah

  const [cards, setCards] = useState<Card[]>([]);

  // Memastikan cards diperbarui saat sources berubah
  useEffect(() => {
    if (cards.length === 0) {
      setCards(
        sources.flatMap((source) =>
          source.data.map((card: any) => ({ ...card, sourceName: source.name }))
        )
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
        const character = idols.find(
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
          _sourceName: source?.name || "mei", // Simpan _sourceName
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

        if (cardTitle) {
          const selectedCard = data.find(
            (item) =>
              item.initialTitle.toLowerCase().replace(/\s+/g, "-") === cardTitle
          );
          setSelectedCards(selectedCard ? [selectedCard] : []);
        } else {
          setSelectedCards(data);
        }
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

    setSlot1((prevSlot1) =>
      prevSlot1
        ? {
            ...prevSlot1,
            cardTitle:
              filteredCardTranslations.find((t) => t.title?.[primaryLanguage])
                ?.title?.[primaryLanguage] || "----",
          }
        : null
    );

    setSlot2((prevSlot2) =>
      prevSlot2
        ? {
            ...prevSlot2,
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
    };

    if (isMenuOpen || isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, isOpen]);

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
      _sourceName: card._sourceName || "Unknown Source", // Pastikan _sourceName disertakan
    };

    if (selectedSlot === 1) {
      setSlot1(selectedCard);
    } else if (selectedSlot === 2) {
      setSlot2(selectedCard);
    }
    setIsOpen(false);
  };

  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(true);

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

  return (
    <div className="transition-all duration-300 ease-out flex flex-col">
      {/* Tombol Hamburger (Muncul hanya di layar kecil, `lg:hidden`) */}
      <button
        onClick={() => toggleMenu(false)}
        className="fixed left-4 top-4 z-30 rounded bg-gray-800 p-2 text-white transition-all duration-300 ease-in-out lg:hidden"
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
      <section id="leftConsole" className="absolute z-20">
        {/* Menu Sidebar */}
        <div
          className={`fixed left-0 top-0 h-full bg-slate-900 z-10 transition-all duration-300 ease-in-out flex mt-20 ${
            isLeftMenuOpen ? "translate-x-0 w-72" : "-translate-x-full"
          }`}
        >
          {/* Konten Menu */}
          <div className="w-full bg-slate-900 p-4 overflow-y-auto gap-4 flex flex-col">
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
            </div>

            <div className="flex flex-col items-center justify-center gap-2 rounded border-2 py-2 px-1">
              <button
                onClick={() => {
                  setIsOpen(true);
                  setSelectedSlot(1);
                }}
                className="w-24 self-center rounded bg-blue-500 hover:bg-blue-600 p-2 text-right text-white lg:w-max"
              >
                Choose First Card
              </button>
              <button
                onClick={() => {
                  setIsOpen(true);
                  setSelectedSlot(2);
                }}
                className="w-24 self-center rounded bg-blue-500 hover:bg-blue-600 p-2 text-left text-white lg:w-max"
              >
                Choose Second Card
              </button>
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

      <div className="flex justify-between z-10 gap-4 p-4">
        <div className="flex flex-1 flex-col">
          {slot1 &&
            (() => {
              // Ambil uniqueId dari slot1
              const uniqueId =
                (slot1 as Record<string, any>).uniqueId || "Unknown";

              return (
                <div className="flex flex-col gap-4 rounded border bg-[#00246B] p-4 text-white shadow-sm h-[36rem] overflow-y-auto scrollbar-minimal">
                  <section className="flex flex-col items-center gap-4 lg:mt-4 lg:flex-row">
                    <section className="flex w-full flex-col justify-center gap-2 lg:gap-4">
                      <h3 className="w-full rounded bg-white text-center text-xl font-bold text-black lg:py-2 lg:text-2xl">
                        {slot1.title?.[primaryLanguage]}
                      </h3>
                      <div className="flex justify-evenly">
                        {slot1.type && (
                          <img
                            src={getCardTypeImageUrl(slot1.type)}
                            alt={slot1.type}
                            className="h-auto w-6 lg:w-12"
                          />
                        )}
                        {slot1.attribute && (
                          <div>
                            <img
                              src={getCardAttributeImageUrl(slot1.attribute)}
                              alt={slot1.attribute}
                              className="h-auto w-6 scale-110 rounded-full bg-white object-cover lg:w-12"
                            />
                          </div>
                        )}
                      </div>
                    </section>
                    <section className="relative h-60 w-full items-center rounded lg:w-96">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Menampilkan gambar berdasarkan slot1.uniqueId */}
                        {slot1 && uniqueId && (
                          <img
                            src={getCardIconUrl(
                              slot1._sourceName,
                              slot1.initial,
                              slot1.costumeTheme,
                              slot1.costumeIndex
                            )}
                            onError={(e) => {
                              e.currentTarget.src = `${
                                import.meta.env.BASE_URL
                              }assets/default_image.png`;
                              e.currentTarget.alt = "Image not available";
                            }}
                            alt={`Card ${uniqueId}`}
                            className="h-full w-auto rounded-lg object-cover outline outline-offset-4 lg:relative lg:h-auto lg:object-none"
                          />
                        )}
                      </div>
                    </section>
                  </section>

                  <section className="text-md grid grid-cols-1 gap-2 rounded border p-2 lg:mt-2 lg:grid-cols-1">
                    <section className="text-md grid grid-cols-1 gap-2 rounded border p-2 lg:mt-2 lg:grid-cols-2">
                      <div className="flex items-center justify-center text-center text-3xl font-bold">
                        {slot1.stats.total}
                      </div>
                      <ul className="grid grid-cols-1 gap-1 border-2 sm:grid-cols-2 lg:grid-cols-4">
                        <li className="flex w-full justify-center border-x p-2 text-center ">
                          <span className="flex flex-row flex-wrap justify-center items-center border border-x-transparent border-b-white font-bold">
                            <img
                              src={getAttributeImageUrl("Vocal")}
                              alt={"vocalStat"}
                              className="h-auto w-6 md:w-9 lg:w-10"
                            />
                            {slot1.stats.vocal}
                          </span>
                        </li>
                        <li className="flex w-full justify-center border-x p-2 text-center">
                          <span className="flex flex-row flex-wrap justify-center items-center border border-x-transparent border-b-white font-bold">
                            <img
                              src={getAttributeImageUrl("Visual")}
                              alt={"visualStat"}
                              className="h-auto w-6 md:w-9 lg:w-10"
                            />
                            {slot1.stats.visual}
                          </span>
                        </li>
                        <li className="flex w-full justify-center border-x p-2 text-center">
                          <span className="flex flex-row flex-wrap justify-center items-center border border-x-transparent border-b-white font-bold">
                            <img
                              src={getAttributeImageUrl("Dance")}
                              alt={"danceStat"}
                              className="h-auto w-6 md:w-9 lg:w-10"
                            />
                            {slot1.stats.dance}
                          </span>
                        </li>
                        <li className="flex w-full justify-center border-x p-2 text-center">
                          <span className="flex flex-row flex-wrap justify-center items-center border border-x-transparent border-b-white font-bold">
                            <img
                              src={getAttributeImageUrl("Stamina")}
                              alt={"staminaStat"}
                              className="h-auto w-6 md:w-9 lg:w-10"
                            />
                            {slot1.stats.stamina}
                          </span>
                        </li>
                      </ul>
                    </section>
                  </section>
                  <h3 className="text-xl font-bold">Skills :</h3>
                  {[slot1.skillOne, slot1.skillTwo, slot1.skillThree]
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

                  {slot1.skillFour && (
                    <section className="text-md flex flex-col rounded border-2 p-2 lg:mt-2 border-l-pink-500 border-r-purple-500 border-t-teal-300 border-b-yellow-300">
                      <div className="flex flex-col gap-1 border-2 lg:flex-row">
                        <div className="flex flex-col items-center justify-center border-x p-2 text-center">
                          <img
                            src={
                              slot1.skillFour.source?.initialImage ||
                              getPlaceholderImageUrl("square")
                            }
                            alt="Skill Four Icon"
                            className="h-20 w-20 rounded object-cover"
                          />
                        </div>
                        <ul className="grid grid-rows-2 grid-cols-2 lg:grid-rows-1 lg:grid-cols-4">
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-1">
                            <span className="border border-x-transparent border-b-white font-bold">
                              Type
                            </span>
                            {slot1.skillFour.typeSkill}
                          </li>
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-1">
                            <span className="border border-x-transparent border-b-white font-bold">
                              Stamina Cost
                            </span>
                            {slot1.skillFour.staminaUsed}
                          </li>
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-1">
                            <span className="border border-x-transparent border-b-white font-bold">
                              Probability
                            </span>
                            {slot1.skillFour.probability
                              ? `${slot1.skillFour.probability} %`
                              : "NaN"}
                          </li>
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-1">
                            <span className="border border-x-transparent border-b-white font-bold">
                              CT / Cool Time
                            </span>
                            {slot1.skillFour.ct === 1
                              ? "Just Once"
                              : slot1.skillFour.ct || "NaN"}
                          </li>
                        </ul>
                      </div>
                      <div className="p-2">
                        <h4 className="font-bold">
                          {slot1.skillFour.name?.[primaryLanguage]}
                        </h4>
                        <p>
                          {slot1.skillFour.description?.[primaryLanguage]?.join(
                            " "
                          )}
                        </p>
                      </div>
                    </section>
                  )}

                  <section className="text-md flex lg:mt-2 lg:items-center gap-2 lg:flex-row flex-col">
                    <h3 className="text-xl font-bold">Yell :</h3>
                    <div className="p-2 flex flex-col border rounded">
                      <h4 className="font-bold">
                        {slot1.yell?.name?.[primaryLanguage]}
                      </h4>
                      <p>{slot1.yell?.description?.[primaryLanguage]}</p>
                    </div>
                  </section>
                </div>
              );
            })()}
        </div>

        <div className="flex flex-1 flex-col">
          {slot2 &&
            (() => {
              // Ambil uniqueId dari slot2
              const uniqueId =
                (slot2 as Record<string, any>).uniqueId || "Unknown";

              return (
                <div className="flex flex-col gap-4 rounded border bg-[#00246B] p-4 text-white shadow-sm h-[36rem] overflow-y-auto scrollbar-minimal">
                  <section className="flex flex-col items-center gap-4 lg:mt-4 lg:flex-row">
                    <section className="flex w-full flex-col justify-center gap-2 lg:gap-4">
                      <h3 className="w-full rounded bg-white text-center text-xl font-bold text-black lg:py-2 lg:text-2xl">
                        {slot2.title?.[primaryLanguage]}
                      </h3>
                      <div className="flex justify-evenly">
                        {slot2.type && (
                          <img
                            src={getCardTypeImageUrl(slot2.type)}
                            alt={slot2.type}
                            className="h-auto w-6 lg:w-12"
                          />
                        )}
                        {slot2.attribute && (
                          <div>
                            <img
                              src={getCardAttributeImageUrl(slot2.attribute)}
                              alt={slot2.attribute}
                              className="h-auto w-6 scale-110 rounded-full bg-white object-cover lg:w-12"
                            />
                          </div>
                        )}
                      </div>
                    </section>
                    <section className="relative h-60 w-full items-center rounded lg:w-96">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Menampilkan gambar berdasarkan slot1.uniqueId */}
                        {slot2 && uniqueId && (
                          <img
                            src={getCardIconUrl(
                              slot2._sourceName,
                              slot2.initial,
                              slot2.costumeTheme,
                              slot2.costumeIndex
                            )}
                            onError={(e) => {
                              e.currentTarget.src = `${
                                import.meta.env.BASE_URL
                              }assets/default_image.png`;
                              e.currentTarget.alt = "Image not available";
                            }}
                            alt={`Card ${uniqueId}`}
                            className="h-full w-auto rounded-lg object-cover outline outline-offset-4 lg:relative lg:h-auto lg:object-none"
                          />
                        )}
                      </div>
                    </section>
                  </section>

                  <section className="text-md grid grid-cols-1 gap-2 rounded border p-2 lg:mt-2 lg:grid-cols-1">
                    <section className="text-md grid grid-cols-1 gap-2 rounded border p-2 lg:mt-2 lg:grid-cols-2">
                      <div className="flex items-center justify-center text-center text-3xl font-bold">
                        {slot2.stats.total}
                      </div>
                      <ul className="grid grid-cols-1 gap-1 border-2 sm:grid-cols-2 lg:grid-cols-4">
                        <li className="flex w-full justify-center border-x p-2 text-center ">
                          <span className="flex flex-row flex-wrap justify-center items-center border border-x-transparent border-b-white font-bold">
                            <img
                              src={getAttributeImageUrl("Vocal")}
                              alt={"vocalStat"}
                              className="h-auto w-6 md:w-9 lg:w-10"
                            />
                            {slot2.stats.vocal}
                          </span>
                        </li>
                        <li className="flex w-full justify-center border-x p-2 text-center">
                          <span className="flex flex-row flex-wrap justify-center items-center border border-x-transparent border-b-white font-bold">
                            <img
                              src={getAttributeImageUrl("Visual")}
                              alt={"visualStat"}
                              className="h-auto w-6 md:w-9 lg:w-10"
                            />
                            {slot2.stats.visual}
                          </span>
                        </li>
                        <li className="flex w-full justify-center border-x p-2 text-center">
                          <span className="flex flex-row flex-wrap justify-center items-center border border-x-transparent border-b-white font-bold">
                            <img
                              src={getAttributeImageUrl("Dance")}
                              alt={"danceStat"}
                              className="h-auto w-6 md:w-9 lg:w-10"
                            />
                            {slot2.stats.dance}
                          </span>
                        </li>
                        <li className="flex w-full justify-center border-x p-2 text-center">
                          <span className="flex flex-row flex-wrap justify-center items-center border border-x-transparent border-b-white font-bold">
                            <img
                              src={getAttributeImageUrl("Stamina")}
                              alt={"staminaStat"}
                              className="h-auto w-6 md:w-9 lg:w-10"
                            />
                            {slot2.stats.stamina}
                          </span>
                        </li>
                      </ul>
                    </section>
                  </section>
                  <h3 className="text-xl font-bold">Skills :</h3>
                  {[slot2.skillOne, slot2.skillTwo, slot2.skillThree]
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

                  {slot2.skillFour && (
                    <section className="text-md flex flex-col rounded border-2 p-2 lg:mt-2 border-l-pink-500 border-r-purple-500 border-t-teal-300 border-b-yellow-300">
                      <div className="flex flex-col gap-1 border-2 lg:flex-row">
                        <div className="flex flex-col items-center justify-center border-x p-2 text-center">
                          <img
                            src={
                              slot2.skillFour.source?.initialImage ||
                              getPlaceholderImageUrl("square")
                            }
                            alt="Skill Four Icon"
                            className="h-20 w-20 rounded object-cover"
                          />
                        </div>
                        <ul className="grid grid-rows-2 grid-cols-2 lg:grid-rows-1 lg:grid-cols-4">
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-1">
                            <span className="border border-x-transparent border-b-white font-bold">
                              Type
                            </span>
                            {slot2.skillFour.typeSkill}
                          </li>
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-1">
                            <span className="border border-x-transparent border-b-white font-bold">
                              Stamina Cost
                            </span>
                            {slot2.skillFour.staminaUsed}
                          </li>
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-1">
                            <span className="border border-x-transparent border-b-white font-bold">
                              Probability
                            </span>
                            {slot2.skillFour.probability
                              ? `${slot2.skillFour.probability} %`
                              : "NaN"}
                          </li>
                          <li className="grid grid-cols-1 border-x p-2 text-center lg:flex-1">
                            <span className="border border-x-transparent border-b-white font-bold">
                              CT / Cool Time
                            </span>
                            {slot2.skillFour.ct === 1
                              ? "Just Once"
                              : slot2.skillFour.ct || "NaN"}
                          </li>
                        </ul>
                      </div>
                      <div className="p-2">
                        <h4 className="font-bold">
                          {slot2.skillFour.name?.[primaryLanguage]}
                        </h4>
                        <p>
                          {slot2.skillFour.description?.[primaryLanguage]?.join(
                            " "
                          )}
                        </p>
                      </div>
                    </section>
                  )}

                  <section className="text-md flex lg:mt-2 lg:items-center gap-2 lg:flex-row flex-col">
                    <h3 className="text-xl font-bold">Yell :</h3>
                    <div className="p-2 flex flex-col border rounded">
                      <h4 className="font-bold">
                        {slot2.yell?.name?.[primaryLanguage]}
                      </h4>
                      <p>{slot2.yell?.description?.[primaryLanguage]}</p>
                    </div>
                  </section>
                </div>
              );
            })()}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={openRef}
            className="mx-4 h-4/5 w-full rounded bg-white p-4 shadow-lg"
          >
            <button
              onClick={() => {
                toggleOpen(false);
                closeModal();
              }}
              className="mb-4 rounded bg-red-500 p-2 text-white"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {" "}
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z"
                  fill="currentColor"
                />{" "}
              </svg>
            </button>
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              placeholderText="Search by name or group"
            />
            <div className="h-full max-h-[calc(100%-150px)] overflow-y-auto mt-4">
              <CardList
                cardAfterFilter={filteredCards}
                onSelectCard={handleSelectCard}
                primaryLanguage={primaryLanguage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardComparison;
