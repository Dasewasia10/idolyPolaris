import React from "react";
import { Card } from "../interfaces/Card";

import {
  getAttributeImageUrl,
  getCardTypeImageUrl2,
} from "../utils/imageUtils";

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

  // const getCardVerticalBUrl = (
  //   chara: string,
  //   initial: number,
  //   cosuName: string,
  //   cosuIndex: number
  // ) => {
  //   // Ubah cosuName menjadi huruf kecil dan hilangkan spasi
  //   const formattedCosuName = cosuName.toLowerCase().replace(/\s+/g, "");

  //   return `https://www.diveidolypapi.my.id/api/img/card/verticalB/${encodeURIComponent(
  //     chara.toLowerCase()
  //   )}/${encodeURIComponent(
  //     initial.toLocaleString("en-US", {
  //       minimumIntegerDigits: 2,
  //       useGrouping: false,
  //     })
  //   )}/${encodeURIComponent(formattedCosuName)}/${encodeURIComponent(
  //     cosuIndex.toLocaleString("en-US", {
  //       minimumIntegerDigits: 2,
  //       useGrouping: false,
  //     })
  //   )}`;
  // };

  // const getCardVerticalEUrl = (
  //   chara: string,
  //   initial: number,
  //   cosuName: string,
  //   cosuIndex: number
  // ) => {
  //   // Ubah cosuName menjadi huruf kecil dan hilangkan spasi
  //   const formattedCosuName = cosuName.toLowerCase().replace(/\s+/g, "");

  //   return `https://www.diveidolypapi.my.id/api/img/card/verticalE/${encodeURIComponent(
  //     chara.toLowerCase()
  //   )}/${encodeURIComponent(
  //     initial.toLocaleString("en-US", {
  //       minimumIntegerDigits: 2,
  //       useGrouping: false,
  //     })
  //   )}/${encodeURIComponent(formattedCosuName)}/${encodeURIComponent(
  //     cosuIndex.toLocaleString("en-US", {
  //       minimumIntegerDigits: 2,
  //       useGrouping: false,
  //     })
  //   )}`;
  // };

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

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
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

            return (
              <div
                key={index}
                className="flex cursor-pointer gap-4 rounded border shadow-lg transition-all duration-500 ease-out hover:shadow-2xl"
                onClick={() => onSelectCard(card)}
              >
                <section className="inset-0 flex items-center gap-4">
                  <div className="relative h-full w-20 transition-all duration-300 ease-out hover:w-24">
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
                      className="h-full w-auto rounded-r-xl object-cover transition-all duration-500 ease-out"
                    />
                  </div>
                  <div className="my-4">
                    <h3 key={index} className="text-xl font-bold">
                      {card.title?.[primaryLanguage]}
                    </h3>
                    <h4 className="text-md font-bold">{sourceName}</h4>
                    <p className="text-xl">{generateStars(card.initial)}</p>

                    <p className="text-xl">
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
                    <div className="shadow-sm">
                      <section className="text-md flex flex-col gap-2 rounded border p-2 lg:mt-2 lg:flex-row">
                        <div className="flex items-center justify-center text-center text-xl font-bold lg:justify-start">
                          {card.stats.total}
                        </div>
                        <ul className="grid grid-cols-2 grid-rows-2 gap-1">
                          <li className="grid justify-center border-x border-y p-2 text-center">
                            <span className="flex flex-row items-center font-bold">
                              <img
                                src={getAttributeImageUrl("Vocal")}
                                alt={"vocalStat"}
                                className="h-auto w-6"
                              />
                              {card.stats.vocal}
                            </span>
                          </li>
                          <li className="grid justify-center border-x border-y p-2 text-center">
                            <span className="flex flex-row items-center font-bold">
                              <img
                                src={getAttributeImageUrl("Visual")}
                                alt={"visualStat"}
                                className="h-auto w-6"
                              />
                              {card.stats.visual}
                            </span>
                          </li>
                          <li className="grid justify-center border-x border-y p-2 text-center">
                            <span className="flex flex-row items-center font-bold">
                              <img
                                src={getAttributeImageUrl("Dance")}
                                alt={"danceStat"}
                                className="h-auto w-6"
                              />
                              {card.stats.dance}
                            </span>
                          </li>
                          <li className="grid justify-center border-x border-y p-2 text-center">
                            <span className="flex flex-row items-center font-bold">
                              <img
                                src={getAttributeImageUrl("Stamina")}
                                alt={"staminaStat"}
                                className="h-auto w-6"
                              />
                              {card.stats.stamina}
                            </span>
                          </li>
                        </ul>
                      </section>
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
