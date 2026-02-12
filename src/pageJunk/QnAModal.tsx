import React, { useMemo } from "react";
import { Character } from "../interfaces/Character";
import { QnASource } from "../interfaces/QnA";
import { X, Quote } from "lucide-react";

interface QnAModalProps {
  character: Character;
  onClose: () => void;
  allCharacters: Character[];
  qnaSources: QnASource[];
}

const QnAModal: React.FC<QnAModalProps> = ({
  character,
  onClose,
  qnaSources,
}) => {
  // --- LOGIC (Memoized) ---
  const activeSource = useMemo(() => {
    // 1. Cari source yang cocok
    const matchedSource = qnaSources.find(
      (s) => s.name.toLowerCase() === character.name.toLowerCase(),
    );

    if (!matchedSource) return null;

    // 2. Generate IDs & Format Text
    const formattedData = matchedSource.data.map((item, index) => ({
      ...item,
      id: index + 1,
      question: item.question.replace(/--/g, "—"),
      reply: item.reply.replace(/--/g, "—"),
    }));

    return {
      ...matchedSource,
      data: formattedData,
    };
  }, [qnaSources, character]);

  // --- RENDER ---
  if (!activeSource) return null;

  return (
    // Backdrop (Klik luar untuk close)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Box */}
      <div
        className="bg-gray-900 border border-gray-700 w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative -top-4"
        onClick={(e) => e.stopPropagation()} // Mencegah close saat klik dalam modal
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner border border-gray-600"
              style={{ backgroundColor: character.color || "#4b5563" }}
            >
              {character.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-none">
                {character.name} {character.familyName}
              </h2>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Q&A Session
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* CONTENT (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-950/50 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {/* Special Intro Notes */}
          {(activeSource.name === "Suzu" || activeSource.name === "Rui") && (
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg flex gap-3 items-start">
              <Quote className="text-blue-400 shrink-0 mt-1" size={20} />
              <p className="text-sm text-blue-200 italic leading-relaxed">
                {activeSource.name === "Suzu" &&
                  "Note: They refer to her by her surname, as a sign of respect, due to her being from a prestigious family."}
                {activeSource.name === "Rui" &&
                  '"I look forward to working with you."'}
              </p>
            </div>
          )}

          {/* Q&A List */}
          <div className="space-y-6">
            {activeSource.data.map((item) => (
              <div key={item.id} className="group">
                {/* Question */}
                <div className="flex gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700 text-pink-500 font-bold text-sm">
                    Q
                  </div>
                  <div className="bg-gray-800/80 p-3 rounded-2xl rounded-tl-none border border-gray-700 shadow-sm">
                    <h4 className="font-semibold text-gray-200 text-sm md:text-base">
                      {item.question}
                    </h4>
                  </div>
                </div>

                {/* Answer */}
                <div className="flex gap-3 flex-row-reverse">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/10 text-white font-bold text-sm shadow-md"
                    style={{ backgroundColor: character.color || "#4b5563" }}
                  >
                    A
                  </div>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-3 rounded-2xl rounded-tr-none border border-gray-700 shadow-sm max-w-[85%] text-right">
                    <p className="text-gray-300 text-sm md:text-base italic leading-relaxed">
                      "{item.reply}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Spacer */}
          <div className="h-4"></div>
        </div>
      </div>
    </div>
  );
};

export default QnAModal;
