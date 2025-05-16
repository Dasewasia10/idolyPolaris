// components/QnAModal.tsx
import React from "react";
import { Character } from "../interfaces/Character";
import { QnASource } from "../interfaces/QnA";

interface QnAModalProps {
  character: Character;
  onClose: () => void;
  allCharacters: Character[];
  qnaSources: QnASource[];
}

const QnAModal: React.FC<QnAModalProps> = ({
  character,
  onClose,
  allCharacters,
  qnaSources,
}) => {
  const formatText = (text: string) => text.replace(/--/g, "—");

  const generateIds = (data: any[]) =>
    data.map((item, index) => ({ ...item, id: index + 1 }));

  const matchWithCharacters = (
    qnaSources: QnASource[],
    characters: Character[]
  ) =>
    qnaSources.map((source) => {
      const matchedCharacter = characters.find(
        (char) => char.name.toLowerCase() === source.name.toLowerCase()
      );
      return {
        key: source.name,
        name: source.name,
        data: generateIds(source.data),
        familyName: matchedCharacter?.familyName || "Unknown",
        character: matchedCharacter || null,
      };
    });

  const sources = matchWithCharacters(qnaSources, allCharacters);
  const activeSource =
    sources.find((s) => s.name === character.name) || sources[0];

  return (
    <div className="flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-5/6 h-4/5 flex flex-col p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 -right-12 px-3 py-2 rounded-full bg-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-4">
            {activeSource?.name === "Suzu" && (
              <p className="italic">
                Note: They refer to her by her surname, as a sign of respect,
                due to her being from a prestigious family.
              </p>
            )}
            {activeSource?.name === "Rui" && (
              <p className="italic">"I look forward to working with you."</p>
            )}
            {activeSource?.data.map((item, index) => (
              <div
                key={index}
                className="mb-4 p-4 bg-gray-100 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <h4 className="font-semibold">{formatText(item.question)}</h4>
                <p className="italic mt-2">{item.reply}</p>
                <div className="border-b border-slate-500"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QnAModal;
