import React, { useState, useEffect } from "react";
import { Card } from "../interfaces/Card";
import { Character } from "../interfaces/Character";

import { getCardTypeImageUrl2 } from "../utils/imageUtils";

interface CardWithSourceName extends Card {
  _sourceName: string;
}

interface CardListProps {
  cardAfterFilter: CardWithSourceName[];
  onSelectCard: (card: CardWithSourceName) => void;
  primaryLanguage: "japanese" | "global" | "indo";
}

const CardList: React.FC<CardListProps> = ({
  cardAfterFilter,
  onSelectCard,
  primaryLanguage,
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(
          "https://diveidolypapi.my.id/api/characters"
        );
        if (!response.ok) throw new Error("Failed to fetch characters");

        const data = await response.json();
        setCharacters(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchCharacters();
  }, []);

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

  const getColorByCardAttribute = (cardAttribute: string): string => {
    switch (cardAttribute) {
      case "Dance":
        return "187cfc"; // Blue
      case "Vocal":
        return "fc44c4"; // Pink
      case "Visual":
        return "f49c1c"; // Orange
      default:
        return "ffffff"; // White
    }
  };

  const generateStars = (count: number): string => {
    return "✭".repeat(count);
  };

  // Fungsi untuk mendapatkan warna karakter berdasarkan sourceName
  const getCharacterColor = (sourceName: string): string => {
    // Normalisasi nama untuk mencocokkan (case insensitive, hapus spasi ekstra)
    const normalizedSourceName = sourceName.trim().toLowerCase();

    const character = characters.find(
      (char) => char.name.trim().toLowerCase() === normalizedSourceName
    );

    // Jika tidak ditemukan, coba cari dengan partial match
    if (!character) {
      const partialMatch = characters.find(
        (char) =>
          normalizedSourceName.includes(char.name.trim().toLowerCase()) ||
          char.name.trim().toLowerCase().includes(normalizedSourceName)
      );
      return partialMatch?.color || "#ffffff"; // Default white jika tidak ditemukan
    }

    return character.color || "#ffffff";
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 transition-all duration-500 ease-out">
      {cardAfterFilter.length === 0 ? (
        <p>No cards available</p>
      ) : (
        [...cardAfterFilter]
          .sort((a, b) => a.initialTitle.localeCompare(b.initialTitle)) // ✅ Urutkan berdasarkan initialTitle
          .map((card, index) => {
            const backgroundColor = card
              ? getColorByCardAttribute(card.attribute)
              : "ffffff";
            const sourceName =
              (card as Record<string, any>)._sourceName || "Unknown Idol";
            const uniqueId =
              (card as Record<string, any>).uniqueId || "Unknown";

            // Dapatkan warna karakter
            const characterColor = getCharacterColor(sourceName);
            
            return (
              <div
                key={index}
                className="flex cursor-pointer gap-4 rounded-r-lg border shadow-lg transition-all duration-500 ease-out hover:shadow-2xl bg-white hover:bg-slate-300"
                onClick={() => onSelectCard(card)}
              >
                <section className="relative inset-0 flex items-center gap-2 w-full">
                  {/* Segitiga kanan bawah */}
                  <div
                    className="absolute bottom-0 right-0 w-0 h-0  border-l-[50px] border-l-transparent border-b-[50px] rounded-br-lg"
                    style={{
                      borderBottomColor: `#${characterColor}`,
                    }}
                  />
                  <div className="relative h-full w-20 transition-all duration-300 ease-out">
                    {card.type && (
                      <img
                        src={getCardTypeImageUrl2(card.type)}
                        alt={card.type}
                        className="absolute h-auto w-4 lg:w-6"
                        style={{
                          backgroundColor: `#${backgroundColor}`,
                        }}
                      />
                    )}
                    <img
                      src={getCardVerticalUrl(
                        card._sourceName,
                        card.initial,
                        card.costumeTheme,
                        card.costumeIndex
                      )}
                      onError={(e) => {
                        e.currentTarget.src = `${
                          import.meta.env.BASE_URL
                        }assets/default_image.png`;
                        e.currentTarget.alt = "Image not available";
                      }}
                      alt={`Card ${uniqueId}`}
                      className="h-full w-20 object-cover transition-all duration-500 ease-out"
                    />
                  </div>
                  <div className="w-2/3">
                    <h3 key={index} className="text-lg font-bold">
                      {card.title?.[primaryLanguage]}
                    </h3>
                    <h4 className="text-sm font-semibold">{sourceName}</h4>
                    <p className="text-xl">{generateStars(card.initial)}</p>

                    <p className="text-sm">
                      {[
                        card.skillOne,
                        card.skillTwo,
                        card.skillThree,
                        card.skillFour,
                      ]
                        .filter(Boolean)
                        .map((skill) => skill?.typeSkill?.replace(/,/g, " /"))
                        .join(" / ")}
                    </p>
                  </div>
                </section>
              </div>
            );
          })
      )}
    </div>
  );
};

export default CardList;
