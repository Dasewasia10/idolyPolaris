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
          "https://diveidolypapi.my.id/api/characters",
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

  const IMG_BASE_URL = "https://api.diveidolypapi.my.id";

  const getCardImageUrl = (
    card: { initialTitle: string; initial: number; hasAwakening?: boolean },
    type: "upper",
    isEvolved: boolean = false,
  ) => {
    const assetId = card.initialTitle; // Asumsi initialTitle = assetId (misal: ai-02-eve-00)
    const rarity = card.initial;
    const hasAwakening = card.hasAwakening ?? false;

    // Konfigurasi folder dan ekstensi
    // Full pakai .webp, sisanya .png
    const config = {
      upper: { folder: "cardUpper", ext: "png" },
    };

    const { folder, ext } = config[type];

    let index = 1; // Default index

    if (rarity < 5) {
      // KASUS 1: Rarity Rendah (2, 3, 4)
      // Base = 0, Evolved = 1
      index = isEvolved ? 1 : 0;
    } else if (rarity === 5 && hasAwakening) {
      // KASUS 2: Rarity 5 Link/Awakening
      // Base = 1, Evolved = 2
      index = isEvolved ? 2 : 1;
    } else {
      // KASUS 3: Rarity 5 Biasa (Fes/Initial)
      // Selalu 1, tidak ada evolved
      index = 1;
    }

    return `${IMG_BASE_URL}/${folder}/img_card_${type}_${index}_${assetId}.${ext}`;
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
      (char) => char.name.trim().toLowerCase() === normalizedSourceName,
    );

    // Jika tidak ditemukan, coba cari dengan partial match
    if (!character) {
      const partialMatch = characters.find(
        (char) =>
          normalizedSourceName.includes(char.name.trim().toLowerCase()) ||
          char.name.trim().toLowerCase().includes(normalizedSourceName),
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
        // HAPUS .sort() di sini! Gunakan langsung cardAfterFilter yang sudah di-sort dari parent
        cardAfterFilter.map((card) => {
          const backgroundColor = card
            ? getColorByCardAttribute(card.attribute)
            : "ffffff";
          const sourceName =
            (card as Record<string, any>)._sourceName || "Unknown Idol";

          // Gunakan uniqueId sebagai identitas unik
          const uniqueId =
            (card as Record<string, any>).uniqueId || card.initialTitle;

          // Dapatkan warna karakter
          const characterColor = getCharacterColor(sourceName);

          return (
            <div
              // GUNAKAN uniqueId, jangan index!
              key={uniqueId}
              className="flex cursor-pointer gap-4 rounded-r-lg border shadow-lg transition-all duration-500 ease-out hover:shadow-2xl bg-white hover:bg-slate-300"
              onClick={() => onSelectCard(card)}
            >
              <section className="relative inset-0 flex items-center gap-2 w-full">
                {/* Segitiga kanan bawah */}
                <div
                  className="absolute bottom-0 right-0 w-0 h-0 border-l-[50px] border-l-transparent border-b-[50px] rounded-br-lg"
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
                    src={getCardImageUrl(card, "upper")}
                    onError={(e) => {
                      e.currentTarget.src = `${import.meta.env.BASE_URL}assets/default_image.png`;
                      e.currentTarget.alt = "Image not available";
                    }}
                    alt={`Card ${uniqueId}`}
                    className="h-full w-20 object-cover transition-all duration-500 ease-out"
                  />
                </div>
                <div className="w-2/3">
                  <h3 className="text-lg font-bold">
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
