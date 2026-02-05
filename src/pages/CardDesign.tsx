import React, { useMemo, useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Source, Card } from "../interfaces/Card";
import { Character } from "../interfaces/Character";
import { saveAs } from "file-saver";
import domtoimage from "dom-to-image";
import axios from "axios";

import SearchBar from "../components/searchBar";
import CardList from "../components/cardList"; // Import komponen baru
import Toast from "../components/Toast";

import {
  getCardTypeImageUrl2,
  getAttributeImageUrl,
  getPlaceholderImageUrl,
} from "../utils/imageUtils";
import MaintenanceNotice from "../components/maintenanceNotice";

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

const cardStyles = {
  base: "relative mx-auto flex aspect-[2/1] h-[512px] w-[1024px] overflow-hidden rounded-xl border-4 border-black shadow-2xl",
  attributeColors: {
    Dance: "bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500",
    Vocal: "bg-gradient-to-r from-pink-900 via-pink-700 to-pink-500",
    Visual: "bg-gradient-to-r from-orange-900 via-orange-700 to-orange-500",
    default: "bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500",
  },
  title:
    "absolute top-4 left-20 z-10 rounded-lg bg-black bg-opacity-70 px-4 py-2 text-left text-2xl font-bold text-white shadow-lg",
  stars: "absolute right-4 top-4 z-10 flex gap-2 text-4xl text-yellow-400",
  statsContainer: "absolute bottom-4 left-4 right-4 z-10 flex justify-between",
  skillsSection: "grid grid-cols-2 w-1/2 gap-2",
  skillItem: "flex items-center rounded-lg bg-black bg-opacity-70 p-2 gap-4",
  statsSection:
    "flex w-1/4 flex-col gap-2 rounded-lg bg-black bg-opacity-70 p-4",
  statRow: "grid grid-cols-2 gap-4 py-1",
  statItem: "flex items-center gap-2",
  statIcon: "h-6 w-6",
  attributeBadge:
    "absolute top-4 left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full shadow-md",
  imageContainer: "absolute inset-0 flex",
};

const cardMobileStyles = {
  base: "relative mx-auto flex aspect-[3/4] h-[90vh] w-96 overflow-hidden rounded-2xl border-4 border-black shadow-2xl",
  attributeColors: {
    Dance: "bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500",
    Vocal: "bg-gradient-to-br from-pink-900 via-pink-700 to-pink-500",
    Visual: "bg-gradient-to-br from-orange-900 via-orange-700 to-orange-500",
    default: "bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500",
  },
  title:
    "absolute top-4 left-0 right-0 z-10 mx-auto w-4/5 rounded-lg bg-black bg-opacity-70 py-2 text-center text-2xl font-bold text-white shadow-lg",
  stars:
    "absolute right-4 top-4 z-10 flex flex-col gap-1 text-4xl text-yellow-400",
  statsContainer: "absolute bottom-4 left-4 right-4 z-10 flex gap-4",
  skillsSection: "flex w-1/2 flex-col gap-2",
  skillItem: "flex flex-col items-center rounded-lg bg-black bg-opacity-70 p-2",
  statsSection:
    "flex w-2/3 flex-col gap-2 rounded-lg bg-black bg-opacity-70 p-3",
  statRow: "flex items-center justify-between py-1",
  statIcon: "h-6 w-6",
  attributeBadge:
    "absolute top-20 left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full shadow-md",
};

const CardDesign: React.FC = () => {
  const openRef = useRef(null);
  const cardRef = useRef(null);
  const { cardTitle } = useParams<{ cardTitle: string }>();
  const [idols, setIdols] = useState<Character[]>([]);

  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  const [, setSelectedCards] = useState<Card[]>([]);

  const [cardSources, setCardSources] = useState<Source[]>([]);

  const [fileName, setFileName] = useState("");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [placing, setPlacing] = useState<CardWithSourceName | null>(null);

  type Language = "japanese" | "global" | "indo";
  const [primaryLanguage, setPrimaryLanguage] = useState<Language>("global");
  const [, setLoading] = useState(true);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

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
    const formattedChara = chara.toLowerCase();
    const formattedInitial = initial.toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });
    const formattedCosuName = cosuName.toLowerCase().replace(/\s+/g, "");
    const formattedCosuIndex = cosuIndex.toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });

    return `https://api.diveidolypapi.my.id/verticalImage/vertical-${formattedChara}-${formattedInitial}-${formattedCosuName}-${formattedCosuIndex}.png`;
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
    const formattedChara = chara.toLowerCase();
    const formattedInitial = initial.toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });
    const formattedCosuName = cosuName.toLowerCase().replace(/\s+/g, "");
    const formattedCosuIndex = cosuIndex.toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });

    return `https://api.diveidolypapi.my.id/sourceImage/source-${formattedChara}-${formattedInitial}-${formattedCosuName}-${formattedCosuIndex}-full.webp`;
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

    const element = document.getElementById("idolyChart");
    if (!element) return;

    const originalStyle = {
      height: element.style.height,
      overflow: element.style.overflow,
    };

    try {
      element.style.height = "full";
      element.style.overflow = "visible";

      // Gunakan dom-to-image
      const blob = await domtoimage.toBlob(element, {
        quality: 1,
        cacheBust: true,
        style: {
          transform: "none", // Handle transform issues
        },
        filter: (_node: any) => {
          // Handle filter jika diperlukan
          return true;
        },
        imagePlaceholder:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", // Placeholder untuk gambar error
      });

      if (blob) {
        saveAs(blob, `design_of_${fileName}.png`);
        setToastMessage("Image saved successfully!");
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setToastMessage("Failed to save image");
      setIsSuccess(false);
    } finally {
      element.style.height = originalStyle.height;
      element.style.overflow = originalStyle.overflow;
    }
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
    <div className="flex transition-all duration-300 ease-out flex-col lg:flex-row">
      <section className="flex flex-col h-1/3 lg:h-full w-full lg:w-1/3 gap-3 rounded-lg bg-gray-800/80 p-3 transition-all duration-300 ease-in-out items-center lg:items-stretch justify-center lg:justify-start backdrop-blur-sm">
        {/* Language Selector */}
        <div className="flex flex-col gap-2 rounded-xl border-2 border-white/30 bg-gray-900/80 p-3 h-full lg:h-fit shadow-lg">
          <p className="font-bold text-white text-sm lg:text-base">Language</p>
          <div className="flex flex-row gap-2 lg:gap-3">
            <button
              className={`rounded-lg px-3 py-1 text-sm lg:text-base transition-all duration-200 ${
                primaryLanguage === "global"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/50"
                  : "bg-white/90 hover:bg-white"
              }`}
              onClick={() => setPrimaryLanguage("global")}
            >
              EN
            </button>
            <button
              className={`rounded-lg px-3 py-1 text-sm lg:text-base transition-all duration-200 ${
                primaryLanguage === "japanese"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/50"
                  : "bg-white/90 hover:bg-white"
              }`}
              onClick={() => setPrimaryLanguage("japanese")}
            >
              JP
            </button>
            <button
              className={`rounded-lg px-3 py-1 text-sm lg:text-base transition-all duration-200 ${
                primaryLanguage === "indo"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/50"
                  : "bg-white/90 hover:bg-white"
              }`}
              onClick={() => setPrimaryLanguage("indo")}
            >
              ID
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row lg:flex-col items-center justify-center gap-2 lg:gap-3 rounded-xl border-2 border-white/30 bg-gray-900/80 p-3 h-full lg:h-fit shadow-lg">
          <button
            onClick={() => setPlacing(null)}
            className="w-24 lg:w-full rounded-lg bg-gradient-to-br from-red-500 to-red-600 p-2 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-red-500/30 active:scale-95"
          >
            Clear
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="w-24 lg:w-full rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-blue-500/30 active:scale-95"
          >
            Choose
          </button>
        </div>

        {/* Save Section */}
        <div className="flex flex-col gap-2 rounded-xl border-2 border-white/30 bg-gray-900/80 p-3 h-full lg:h-fit shadow-lg">
          <p className="font-bold text-white text-sm lg:text-base">
            Save Design
          </p>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="rounded-lg border border-white/30 bg-gray-800 p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="File name"
          />
          <button
            onClick={handleScreenshot}
            className="rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 p-2 text-white hover:from-pink-600 hover:to-rose-700 transition-all duration-200 shadow-md hover:shadow-rose-500/30 active:scale-95"
          >
            Save Screenshot
          </button>
        </div>
      </section>

      <div className="absolute flex top-40 lg:top-1/2 left-1/2 lg:left-64 -translate-x-28 lg:translate-x-0 lg:-translate-y-16"></div>
      <div className="flex w-full lg:w-4/5 p-4 h-full">
        <div className="relative flex flex-1 flex-col text-white">
          {!isMobile && placing && (
            <div
              ref={cardRef}
              className={`${cardStyles.base} ${
                cardStyles.attributeColors[
                  placing.attribute as keyof typeof cardStyles.attributeColors
                ] || cardStyles.attributeColors.default
              }`}
              id="idolyChart"
            >
              {/* Background Image Container */}
              <div className={cardStyles.imageContainer}>
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
                  alt={`Card ${placing.initialTitle}`}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-70"></div>

              {/* Attribute Badge */}
              <div
                className={cardStyles.attributeBadge}
                style={{
                  backgroundColor: getColorByCardAttribute(placing.attribute),
                }}
              >
                <img
                  src={getCardTypeImageUrl2(placing.type)}
                  alt={placing.attribute}
                  className="h-8 w-8"
                />
              </div>

              {/* Card Title */}
              <h3 className={cardStyles.title}>
                {placing.title?.[primaryLanguage]}
              </h3>

              {/* Stars Rating */}
              <div className={cardStyles.stars}>
                {generateStars(placing.initial)}
              </div>

              {/* Stats and Skills Section */}
              <div className={cardStyles.statsContainer}>
                {/* Skills Section */}
                <div className={cardStyles.skillsSection}>
                  {[
                    placing.skillOne,
                    placing.skillTwo,
                    placing.skillThree,
                    placing.skillFour,
                  ]
                    .filter((skill) => skill)
                    .map((skill, index) => (
                      <div key={index} className={cardStyles.skillItem}>
                        <img
                          src={
                            skill?.source?.initialImage ||
                            getPlaceholderImageUrl("square")
                          }
                          alt={`Skill ${index + 1}`}
                          className="h-16 w-16 border-2 border-white object-cover"
                        />
                        <div className="mt-1 text-center text-xl font-semibold">
                          {skill?.typeSkill}
                        </div>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          <span title="Stamina">⚡{skill?.staminaUsed}</span>
                          <span title="Probability">
                            🎲{skill?.probability}%
                          </span>
                          <span title="Cooldown">
                            🔄{skill?.ct === 1 ? "1x" : skill?.ct || "-"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className={cardStyles.statsSection}>
                  <div className="mb-2 text-center text-2xl font-bold">
                    TOTAL STATS: {placing.stats.total}
                  </div>

                  <div className={cardStyles.statRow}>
                    <div className={cardStyles.statItem}>
                      <img
                        src={getAttributeImageUrl("Vocal")}
                        alt="Vocal"
                        className={cardStyles.statIcon}
                      />
                      <span>{placing.stats.vocal}</span>
                    </div>

                    <div className={cardStyles.statItem}>
                      <img
                        src={getAttributeImageUrl("Dance")}
                        alt="Dance"
                        className={cardStyles.statIcon}
                      />
                      <span>{placing.stats.dance}</span>
                    </div>

                    <div className={cardStyles.statItem}>
                      <img
                        src={getAttributeImageUrl("Visual")}
                        alt="Visual"
                        className={cardStyles.statIcon}
                      />
                      <span>{placing.stats.visual}</span>
                    </div>

                    <div className={cardStyles.statItem}>
                      <img
                        src={getAttributeImageUrl("Stamina")}
                        alt="Stamina"
                        className={cardStyles.statIcon}
                      />
                      <span>{placing.stats.stamina}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isMobile && placing && (
            <div
              ref={cardRef}
              className={`${cardMobileStyles.base} ${
                cardMobileStyles.attributeColors[
                  placing.attribute as keyof typeof cardMobileStyles.attributeColors
                ] || cardMobileStyles.attributeColors.default
              }`}
              id="idolyChart"
            >
              {/* Background Image */}
              <img
                src={getCardVerticalUrl(
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
                alt={`Card ${placing.initialTitle}`}
                className="absolute h-full w-full object-cover opacity-80"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>

              {/* Attribute Badge */}
              <div
                className={cardMobileStyles.attributeBadge}
                style={{
                  backgroundColor: getColorByCardAttribute(placing.attribute),
                }}
              >
                <img
                  src={getCardTypeImageUrl2(placing.type)}
                  alt={placing.attribute}
                  className="h-8 w-8"
                />
              </div>

              {/* Card Title */}
              <h3 className={cardMobileStyles.title}>
                {placing.title?.[primaryLanguage]}
              </h3>

              {/* Stars Rating */}
              <div className={cardMobileStyles.stars}>
                {generateStars(placing.initial)
                  .split("\n")
                  .map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
              </div>

              {/* Stats and Skills Section */}
              <div className={cardMobileStyles.statsContainer}>
                {/* Skills Section */}
                <div className={cardMobileStyles.skillsSection}>
                  {[
                    placing.skillOne,
                    placing.skillTwo,
                    placing.skillThree,
                    placing.skillFour,
                  ]
                    .filter((skill) => skill)
                    .map((skill, index) => (
                      <div key={index} className={cardMobileStyles.skillItem}>
                        <img
                          src={
                            skill?.source?.initialImage ||
                            getPlaceholderImageUrl("square")
                          }
                          alt={`Skill ${index + 1}`}
                          className="h-12 w-12 border-2 border-white object-cover"
                        />
                        <div className="mt-1 text-center text-sm font-semibold">
                          {skill?.typeSkill}
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span>⚡{skill?.staminaUsed}</span>
                          <span>🎲{skill?.probability}%</span>
                          <span>
                            🔄{skill?.ct === 1 ? "Once" : skill?.ct || "NaN"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className={cardMobileStyles.statsSection}>
                  <div className="mb-2 text-center text-xl font-bold">
                    TOTAL: {placing.stats.total}
                  </div>

                  <div className={cardMobileStyles.statRow}>
                    <div className="flex items-center gap-2">
                      <img
                        src={getAttributeImageUrl("Vocal")}
                        alt="Vocal"
                        className={cardMobileStyles.statIcon}
                      />
                      <span>Vocal</span>
                    </div>
                    <span className="font-bold">{placing.stats.vocal}</span>
                  </div>

                  <div className={cardMobileStyles.statRow}>
                    <div className="flex items-center gap-2">
                      <img
                        src={getAttributeImageUrl("Visual")}
                        alt="Visual"
                        className={cardMobileStyles.statIcon}
                      />
                      <span>Visual</span>
                    </div>
                    <span className="font-bold">{placing.stats.visual}</span>
                  </div>

                  <div className={cardMobileStyles.statRow}>
                    <div className="flex items-center gap-2">
                      <img
                        src={getAttributeImageUrl("Dance")}
                        alt="Dance"
                        className={cardMobileStyles.statIcon}
                      />
                      <span>Dance</span>
                    </div>
                    <span className="font-bold">{placing.stats.dance}</span>
                  </div>

                  <div className={cardMobileStyles.statRow}>
                    <div className="flex items-center gap-2">
                      <img
                        src={getAttributeImageUrl("Stamina")}
                        alt="Stamina"
                        className={cardMobileStyles.statIcon}
                      />
                      <span>Stamina</span>
                    </div>
                    <span className="font-bold">{placing.stats.stamina}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
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

      {toastMessage && (
        <Toast
          message={toastMessage}
          isSuccess={isSuccess}
          key={Date.now()}
          onClose={() => setToastMessage("")}
        />
      )}
      <MaintenanceNotice />
    </div>
  );
};

export default CardDesign;
