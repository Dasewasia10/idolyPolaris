import React from "react";
import { Card } from "../interfaces/Card";
import {
  getCardTypeImageUrl2,
  getAttributeImageUrl,
  getPlaceholderImageUrl,
} from "../utils/imageUtils";

interface CardDesignProps {
  card: Card;
  primaryLanguage: string;
}

const CardDesign: React.FC<CardDesignProps> = ({ card, primaryLanguage }) => {
  const getColorByCardAttribute = (cardAttribute: string): string => {
    switch (cardAttribute) {
      case "Dance":
        return "#187cfc";
      case "Vocal":
        return "#fc44c4";
      case "Visual":
        return "#f49c1c";
      default:
        return "#ffffff";
    }
  };

  const generateStars = (count: number): JSX.Element => {
    return (
      <div className="flex">
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <span key={i} className="text-yellow-400">
              ✭
            </span>
          ))}
      </div>
    );
  };

  return (
    <div className="relative aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl border-4 border-black bg-gradient-to-b from-[#00246B] to-[#000D24] shadow-2xl">
      {/* Card Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={card.sourceUrl || getPlaceholderImageUrl("card")}
          alt={`${card.title?.[primaryLanguage]} Card`}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = getPlaceholderImageUrl("card");
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* Card Content */}
      <div className="relative z-10 flex h-full flex-col p-4">
        {/* Card Header */}
        <div className="mb-4 text-center">
          <h3 className="rounded-lg bg-white/80 py-2 text-2xl font-bold text-black backdrop-blur-sm">
            {card.title?.[primaryLanguage] || "No Title"}
          </h3>
        </div>

        {/* Card Stars */}
        <div className="absolute right-4 top-16 rounded-l-lg bg-black/60 px-2 py-1">
          {generateStars(card.initial)}
        </div>

        {/* Card Attribute */}
        {card.attribute && (
          <div
            className="absolute left-4 top-16 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: getColorByCardAttribute(card.attribute) }}
          >
            <img
              src={getCardTypeImageUrl2(card.type)}
              alt={card.attribute}
              className="h-8 w-8"
            />
          </div>
        )}

        {/* Card Stats */}
        <div className="mt-auto rounded-lg bg-black/60 p-3 backdrop-blur-sm">
          <div className="mb-2 text-center text-xl font-bold">
            Total: {card.stats?.total || 0}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "Vocal", value: card.stats?.vocal },
              { name: "Visual", value: card.stats?.visual },
              { name: "Dance", value: card.stats?.dance },
              { name: "Stamina", value: card.stats?.stamina },
            ].map((stat) => (
              <div
                key={stat.name}
                className="flex items-center justify-center gap-2"
              >
                <img
                  src={getAttributeImageUrl(stat.name)}
                  alt={stat.name}
                  className="h-6 w-6"
                />
                <span className="font-bold">{stat.value || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Skills */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
          {[card.skillOne, card.skillTwo, card.skillThree].map(
            (skill, index) =>
              skill && (
                <div
                  key={index}
                  className="flex flex-col items-center rounded-lg bg-black/60 p-2 backdrop-blur-sm"
                >
                  <img
                    src={
                      skill.source?.initialImage ||
                      getPlaceholderImageUrl("skill")
                    }
                    alt={`Skill ${index + 1}`}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="mt-1 text-xs font-bold text-center">
                    {skill.typeSkill} / {skill.staminaUsed} /{" "}
                    {skill.probability}%
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDesign;
