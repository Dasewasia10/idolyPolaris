import React, { useMemo, useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Source, Card } from "../interfaces/Card";
import { Character } from "../interfaces/Character";
import html2canvas from "html2canvas";
import axios from "axios";

import SearchBar from "../components/searchBar";
import CardList from "../components/cardList"; // Import komponen baru

import {
  getCardTypeImageUrl2,
  getAttributeImageUrl,
  getPlaceholderImageUrl,
} from "../utils/imageUtils";

interface CardWithSourceName extends Card {
  _sourceName: string;
}

const API_BASE_URL = "https://www.diveidolypapi.my.id/api";

// Function to generate unique identifier for Card
const generateCardId = (card: Card): string => {
  console.log("Processing card:", card); // Log data card
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

const CardDesign: React.FC = () => {
  const openRef = useRef(null);
  const cardRef = useRef(null);
  const { cardTitle } = useParams<{ cardTitle: string }>();
  const [idols, setIdols] = useState<Character[]>([]);

  const [, setSelectedCards] = useState<Card[]>([]);

  const [cardSources, setCardSources] = useState<Source[]>([]);

  const [fileName, setFileName] = useState("");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [placing, setPlacing] = useState<CardWithSourceName | null>(null);

  type Language = "japanese" | "global" | "indo";
  const [primaryLanguage, setPrimaryLanguage] = useState<Language>("global");
  const [, setLoading] = useState(true);

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
        sources.flatMap((source: { data: any[]; name: any }) =>
          source.data.map((card: any) => ({ ...card, sourceName: source.name }))
        )
      );
    }
  }, [sources]); // ✅ Ini hanya akan berjalan jika `sources` berubah

  useEffect(() => {
    console.log("sources", sources);
  }, [sources]); // ✅ Sekarang hanya muncul jika `sources` berubah

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

    setPlacing((prevSlot) =>
      prevSlot
        ? {
            ...prevSlot,
            cardTitle:
              filteredCardTranslations.find((t) => t.title?.[primaryLanguage])
                ?.title?.[primaryLanguage] || "----",
          }
        : null
    );

    const filteredSkillsSlot = sources.flatMap((source) =>
      source.data.filter((card: Card) => card.id === placing?.id)
    );

    const skillTranslationsByLanguageSlot = filteredSkillsSlot.reduce(
      (acc, card) => {
        const skills = [
          { key: "skillOne", data: card.skillOne },
          { key: "skillTwo", data: card.skillTwo },
          { key: "skillThree", data: card.skillThree },
          { key: "skillFour", data: card.skillFour },
        ].filter((skill) => skill.data); // Hanya ambil skill yang ada

        skills.forEach((skill) => {
          const description = Array.isArray(
            skill.data?.description?.[primaryLanguage]
          )
            ? skill.data?.description?.[primaryLanguage].join(" ") // Gabungkan array menjadi string
            : skill.data?.description?.[primaryLanguage] || "----"; // Jika bukan array, gunakan langsung

          acc[`${card.id}-${skill.key}`] = [
            {
              title: skill.data?.name?.[primaryLanguage] || "----",
              description: description, // Pastikan description adalah string atau null
            },
          ];
        });

        return acc;
      },
      {} as Record<string, { title: string; description: string | null }[]>
    );

    console.log("filteredSkillsSlot", filteredSkillsSlot);
    console.log(
      "skillTranslationsByLanguageSlot",
      skillTranslationsByLanguageSlot
    );
  }, [primaryLanguage, cards]);

  const toggleOpen = (_p0: boolean) => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (
        (openRef.current as unknown as HTMLElement) &&
        !(openRef.current as unknown as HTMLElement).contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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

  const getCardFigureBUrl = (
    chara: string,
    initial: number,
    cosuName: string,
    cosuIndex: number
  ) => {
    // Ubah cosuName menjadi huruf kecil dan hilangkan spasi
    const formattedCosuName = cosuName.toLowerCase().replace(/\s+/g, "");

    return `https://www.diveidolypapi.my.id/api/img/card/figureB/${encodeURIComponent(
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

  const getCardVerticalUrl = (
    chara: string,
    initial: number,
    cosuName: string,
    cosuIndex: number
  ) => {
    // Ubah cosuName menjadi huruf kecil dan hilangkan spasi
    const formattedCosuName = cosuName.toLowerCase().replace(/\s+/g, "");

    return `https://www.diveidolypapi.my.id/api/img/card/vertical/${encodeURIComponent(
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

  const getCardVerticalBUrl = (
    chara: string,
    initial: number,
    cosuName: string,
    cosuIndex: number
  ) => {
    // Ubah cosuName menjadi huruf kecil dan hilangkan spasi
    const formattedCosuName = cosuName.toLowerCase().replace(/\s+/g, "");

    return `https://www.diveidolypapi.my.id/api/img/card/verticalB/${encodeURIComponent(
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

  const getCardVerticalEUrl = (
    chara: string,
    initial: number,
    cosuName: string,
    cosuIndex: number
  ) => {
    // Ubah cosuName menjadi huruf kecil dan hilangkan spasi
    const formattedCosuName = cosuName.toLowerCase().replace(/\s+/g, "");

    return `https://www.diveidolypapi.my.id/api/img/card/verticalE/${encodeURIComponent(
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

  const handleScreenshot = async () => {
    if (!fileName.trim()) {
      alert("Nama file harus terisi sebelum men-download.");
      return;
    }

    await document.fonts.ready; // Pastikan font sudah dimuat

    setTimeout(() => {
      const node = cardRef.current;
      if (node) {
        html2canvas(node, {
          allowTaint: true,
          useCORS: true,
          scale: window.devicePixelRatio,
        }).then((canvas) => {
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `${fileName}.png`;
          link.click();
        });
      }
    }, 500); // Tunggu 500ms agar layout stabil
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

  const handleSelectCard = (card: CardWithSourceName) => {
    const selectedCard = {
      ...card,
      cardTitle:
        typeof card.title === "string"
          ? card.title
          : card.title?.[primaryLanguage] || "----",
      _sourceName: card._sourceName || "Unknown Source",
    };
    setPlacing(selectedCard);
    setIsOpen(true);
  };

  const getColorByCardAttribute = (cardAttribute: string): string => {
    switch (cardAttribute) {
      case "Dance":
        return "#187cfc"; // Biru
      case "Vocal":
        return "#fc44c4"; // Merah Muda
      case "Visual":
        return "#f49c1c"; // Jingga
      default:
        return "#ffffff"; // Putih
    }
  };

  const generateStars = (count: number): string => {
    return Array(count).fill("✭").join("\n");
  };

  return (
    <div className="flex h-screen w-full transition-all duration-300 ease-out flex-col lg:flex-row">
      <section className="flex h-1/3 lg:h-full w-full lg:w-1/5 gap-2 rounded bg-gray-800 px-4 py-2 transition-all duration-300 ease-in-out scrollbar scrollbar-track-black scrollbar-thumb-white lg:flex-col flex-row overflow-hidden items-center lg:items-start justify-center">
        <div className="flex flex-col absolute top-2 left-2 gap-4 w-1/4">
          <div className="flex items-center gap-4">
            <button
              className="px-4 py-2 bg-gray-300 hover:bg-gray-800 rounded-md hover:text-white font-semibold"
              onClick={handleBackClick}
            >
              {"<"}
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-2 rounded border-2 border-white p-4 lg:w-full h-full lg:h-fit">
          <p className="font-semibold text-white">Select language</p>
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
        <div className="flex lg:w-full items-center justify-center gap-4 rounded border-2 border-white p-4 lg:gap-8 h-full lg:h-fit">
          <button
            onClick={() => {
              setPlacing(null);
            }}
            className="w-24 self-center rounded bg-red-500 p-2 text-right text-white hover:bg-red-800 lg:w-max"
          >
            Clear
          </button>
          <button
            onClick={() => {
              setIsOpen(true);
            }}
            className="w-24 self-center rounded bg-blue-500 p-2 text-right text-white hover:bg-blue-800 lg:w-max"
          >
            Choose Card
          </button>
        </div>
        <div className="flex flex-col gap-4 border-2 border-white p-4 lg:w-full h-full lg:h-fit">
          <p className="font-semibold text-white">Save file name</p>
          {/* Input untuk judul file */}
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="rounded border p-2"
            placeholder="Enter file name"
          />
          {/* Screenshot Button */}
          <button
            onClick={handleScreenshot}
            className="text-bg-gray-600 rounded bg-rose-300 p-2 transition-colors duration-75 ease-in-out hover:bg-rose-700 hover:text-white"
          >
            Save Screenshot
          </button>
        </div>
      </section>

      <div className="absolute flex top-40 lg:top-1/2 left-1/2 lg:left-64 -translate-x-28 lg:translate-x-0 lg:-translate-y-16"></div>
      <div className="flex w-full lg:w-4/5 p-4 h-full">
        <div className="relative flex flex-1 flex-col">
          {placing &&
            (() => {
              // Ambil uniqueId dari placing
              const uniqueId =
                (placing as Record<string, any>).uniqueId || "Unknown";

              // Tentukan JSX yang perlu dirender
              const renderCard = (
                <div
                  ref={cardRef}
                  className="absolute mx-auto flex aspect-video h-auto w-full overflow-hidden rounded-2xl border-4 border-black bg-[#00246B] text-white"
                >
                  {placing && uniqueId && (
                    <img
                      src={getCardSourceUrl(
                        placing._sourceName,
                        placing.initial,
                        placing.costumeTheme,
                        placing.costumeIndex
                      )}
                      onError={(e) => {
                        e.currentTarget.src = `${
                          import.meta.env.BASE_URL
                        }assets/default_image.png`;
                        e.currentTarget.alt = "Image not available";
                      }}
                      alt={`Card ${uniqueId}`}
                      className="absolute h-max w-auto items-center overflow-hidden rounded-lg object-cover outline -outline-offset-8"
                    />
                  )}
                  <section className="absolute z-10 flex w-full flex-col justify-center gap-2 lg:gap-4">
                    <h3 className="w-full rounded bg-white bg-opacity-60 text-center text-xl font-bold text-black lg:py-2 lg:text-2xl">
                      {placing.title?.[primaryLanguage]}
                    </h3>
                  </section>

                  <p className="absolute right-10 bottom-4 z-10 flex gap-2 text-5xl w-16 bg-opacity-60 p-2 rounded-r-xl bg-gradient-to-l from-gray-800 to-transparent flex-row-reverse">
                    {generateStars(placing.initial)}
                  </p>

                  <section className="absolute bottom-4 z-10 mx-4 flex gap-1 text-sm items-end">
                    <div className="flex flex-col gap-2">
                      <div className="">
                        {placing.attribute && (
                          <div
                            className="flex h-auto w-24 items-center rounded-full"
                            style={{
                              backgroundColor: getColorByCardAttribute(
                                placing.attribute
                              ),
                            }}
                          >
                            <img
                              src={getCardTypeImageUrl2(placing?.type ?? "")}
                              alt={placing.attribute}
                              className="py-2 pl-4"
                            />
                          </div>
                        )}
                      </div>
                      <section className="flex items-center flex-col gap-1 w-40">
                        {[
                          placing.skillOne,
                          placing.skillTwo,
                          placing.skillThree,
                        ].map((skill, index) => (
                          <section
                            key={index}
                            className="flex rounded border-4 border-y bg-black bg-opacity-60 p-1 w-full justify-center"
                          >
                            <ul className="relative flex flex-col gap-1">
                              <li className="flex flex-col items-center justify-center p-2 text-center">
                                <img
                                  src={
                                    skill?.source?.initialImage ||
                                    getPlaceholderImageUrl("square")
                                  }
                                  alt={`IconSkill ${index + 1}`}
                                  className="h-16 w-16 rounded object-cover"
                                />
                              </li>
                              <li className="flex flex-col gap-2 font-bold">
                                <div className="flex justify-center">
                                  {skill?.typeSkill}
                                  {" / "}
                                  {skill?.staminaUsed} {" / "}
                                  {skill?.probability === undefined ||
                                  skill?.probability === null
                                    ? "NaN"
                                    : `${skill?.probability} %`}{" "}
                                  {" / "}
                                  {skill?.ct === 1
                                    ? "Just Once"
                                    : skill?.ct === 0
                                    ? "NaN"
                                    : skill?.ct}
                                </div>
                              </li>
                            </ul>
                          </section>
                        ))}
                      </section>
                    </div>
                    <section className="text-md z-10 mx-4 flex h-fit flex-col gap-2 overflow-hidden rounded border bg-black bg-opacity-50 p-2">
                      <div className="flex items-center justify-center text-center text-xl font-bold">
                        {placing.stats.total}
                      </div>

                      {(() => {
                        const attributes = [
                          { name: "Vocal", stat: placing.stats.vocal },
                          { name: "Visual", stat: placing.stats.visual },
                          { name: "Dance", stat: placing.stats.dance },
                          { name: "Stamina", stat: placing.stats.stamina },
                        ];

                        return (
                          <ul className="grid grid-cols-2 border-2">
                            {attributes.map((attribute) => (
                              <li
                                key={attribute.name}
                                className="flex items-center justify-center border p-2 text-center"
                              >
                                <img
                                  src={getAttributeImageUrl(attribute.name)}
                                  alt={`${attribute.name.toLowerCase()}Stat`}
                                  className="h-auto w-6"
                                />
                                <span className="flex flex-col items-center font-bold">
                                  {attribute.stat}
                                </span>
                              </li>
                            ))}
                          </ul>
                        );
                      })()}
                    </section>
                  </section>
                </div>
              );

              return renderCard; // Kembalikan JSX yang sudah diproses
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
            <div className="h-full max-h-[calc(100%-150px)] overflow-y-auto">
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

export default CardDesign;
