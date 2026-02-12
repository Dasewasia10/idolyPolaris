import React, { useMemo } from "react";
import { Character } from "../interfaces/Character";
import { QnASource } from "../interfaces/QnA";
import { X, Quote, MessageCircle } from "lucide-react";

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
  const activeSource = useMemo(() => {
    const matchedSource = qnaSources.find(
      (s) => s.name.toLowerCase() === character.name.toLowerCase(),
    );
    if (!matchedSource) return null;
    const formattedData = matchedSource.data.map((item, index) => ({
      ...item,
      id: index + 1,
      question: item.question.replace(/--/g, "—"),
      reply: item.reply.replace(/--/g, "—"),
    }));
    return { ...matchedSource, data: formattedData };
  }, [qnaSources, character]);

  if (!activeSource) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200 mt-8"
      onClick={onClose}
    >
      <div
        className="bg-[#161b22] border border-white/10 w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decoration Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0d1117]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-[#161b22] shadow-[0_0_15px_rgba(255,255,255,0.1)] overflow-hidden relative group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div
                className="w-full h-full flex items-center justify-center bg-gray-800 text-xl font-black text-white/20"
                style={{ backgroundColor: character.color || "#374151" }}
              >
                {character.name.charAt(0)}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                <MessageCircle size={10} /> Interview Log
              </span>
              <h2 className="text-2xl font-black text-white leading-none tracking-tight">
                {character.name}{" "}
                <span className="text-gray-500">{character.familyName}</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0c10] space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {(activeSource.name === "Suzu" || activeSource.name === "Rui") && (
            <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl flex gap-4 items-start">
              <Quote className="text-blue-500 shrink-0 mt-1" size={20} />
              <p className="text-sm text-blue-200/80 italic font-medium leading-relaxed">
                {activeSource.name === "Suzu" &&
                  "Note: They refer to her by her surname, as a sign of respect, due to her being from a prestigious family."}
                {activeSource.name === "Rui" &&
                  '"I look forward to working with you."'}
              </p>
            </div>
          )}

          <div className="grid gap-6">
            {activeSource.data.map((item) => (
              <div
                key={item.id}
                className="relative pl-6 border-l-2 border-gray-800 hover:border-gray-600 transition-colors group"
              >
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#0a0c10] border-2 border-gray-800 group-hover:border-gray-500 transition-colors"></div>

                <div className="mb-3">
                  <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wider mb-1 block">
                    Question {item.id}
                  </span>
                  <h4 className="text-lg font-bold text-gray-200 leading-snug">
                    {item.question}
                  </h4>
                </div>

                <div className="bg-[#161b22] p-4 rounded-xl border border-white/5 relative">
                  <div className="absolute top-4 left-4 text-gray-700 opacity-20 pointer-events-none">
                    <Quote size={32} />
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed relative z-10 pl-2">
                    {item.reply}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="h-8 flex items-center justify-center opacity-30">
            <div className="w-2 h-2 rounded-full bg-gray-600 mx-1"></div>
            <div className="w-2 h-2 rounded-full bg-gray-600 mx-1"></div>
            <div className="w-2 h-2 rounded-full bg-gray-600 mx-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QnAModal;
