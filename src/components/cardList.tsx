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
    const assetId = card.initialTitle;
    const rarity = card.initial;
    const hasAwakening = card.hasAwakening ?? false;
    const config = { upper: { folder: "cardUpper", ext: "png" } };
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

  const generateStars = (count: number): string => "★".repeat(count);

  const getCharacterColor = (sourceName: string): string => {
    const normalizedSourceName = sourceName.trim().toLowerCase();
    const character = characters.find(
      (char) => char.name.trim().toLowerCase() === normalizedSourceName,
    );
    if (!character) {
      const partialMatch = characters.find(
        (char) =>
          normalizedSourceName.includes(char.name.trim().toLowerCase()) ||
          char.name.trim().toLowerCase().includes(normalizedSourceName),
      );
      return partialMatch?.color || "ffffff";
    }
    return character.color || "ffffff";
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
      {cardAfterFilter.length === 0 ? (
        <p className="col-span-full text-center text-gray-500 font-mono py-10">
          NO DATA FOUND
        </p>
      ) : (
        cardAfterFilter.map((card) => {
          const backgroundColor = card
            ? getColorByCardAttribute(card.attribute)
            : "ffffff";
          const sourceName =
            (card as Record<string, any>)._sourceName || "Unknown Idol";
          const uniqueId =
            (card as Record<string, any>).uniqueId || card.initialTitle;
          const characterColor = getCharacterColor(sourceName);

          return (
            <div
              key={uniqueId}
              className="relative group flex cursor-pointer gap-4 rounded-xl border border-white/10 bg-[#161b22] hover:bg-[#1f2937] hover:border-cyan-500/50 shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-cyan-500/10 overflow-hidden"
              onClick={() => onSelectCard(card)}
            >
              <section className="relative inset-0 flex items-center gap-3 w-full p-2">
                {/* --- SEGITIGA KANAN BAWAH (DIPERTAHANKAN) --- */}
                <div
                  className="absolute bottom-0 right-0 w-0 h-0 border-l-[50px] border-l-transparent border-b-[50px] rounded-br-xl z-0"
                  style={{
                    borderBottomColor: `#${characterColor}`,
                  }}
                />

                {/* Image Section */}
                <div className="relative h-full w-20 flex-shrink-0">
                  {/* Type Icon (Kecil di kiri atas foto) */}
                  {card.type && (
                    <div className="absolute -top-1 -left-1 z-10 p-0.5 rounded bg-black/50 backdrop-blur-sm border border-white/10">
                      <img
                        src={getCardTypeImageUrl2(card.type)}
                        alt={card.type}
                        className="h-4 w-4"
                        style={{
                          backgroundColor: `#${backgroundColor}`,
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                  )}
                  {/* Card Image */}
                  <div className="h-full w-full rounded-lg overflow-hidden border border-white/10 bg-black">
                    <img
                      src={getCardImageUrl(card, "upper")}
                      onError={(e) => {
                        e.currentTarget.src = `${import.meta.env.BASE_URL}assets/default_image.png`;
                        e.currentTarget.alt = "Image not available";
                      }}
                      alt={`Card ${uniqueId}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0 z-10">
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                    {card.title?.[primaryLanguage] || card.title?.global}
                  </h3>
                  <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                    {sourceName}
                  </h4>
                  <div
                    className={`text-sm ${card.initial === 5 ? "text-pink-400 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]" : "text-yellow-400"}`}
                  >
                    {generateStars(card.initial)}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {[
                      card.skillOne,
                      card.skillTwo,
                      card.skillThree,
                      card.skillFour,
                    ]
                      .filter(Boolean)
                      .slice(0, 3) // Tampilkan max 3 skill biar gak penuh
                      .map((skill, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-1.5 py-0.5 bg-black/40 border border-white/10 rounded text-gray-300"
                        >
                          {skill?.typeSkill?.split(",")[0]}{" "}
                          {/* Ambil tipe pertama aja */}
                        </span>
                      ))}
                  </div>
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
