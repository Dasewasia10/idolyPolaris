import React, { useEffect, useRef } from "react";
import { X, Volume2 } from "lucide-react";

// Definisikan ulang tipe ScriptLine di sini atau import dari types central
interface ScriptLine {
  speakerName?: string;
  text?: string;
  voiceUrl?: string | null;
}

interface LogModalProps {
  history: ScriptLine[];
  onClose: () => void;
}

const LogModal: React.FC<LogModalProps> = ({ history, onClose }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll ke bawah saat dibuka
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  const playVoice = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 mt-4">
      <div
        className="w-full max-w-4xl h-[80vh] bg-[#0f131a] border border-white/10 shadow-2xl relative flex flex-col"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 95%, 98% 100%, 0 100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161b22]">
          <h2 className="text-xl font-bold tracking-widest text-white italic">
            LOG <span className="text-pink-500">HISTORY</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 mt-20 italic">
              No history yet.
            </div>
          ) : (
            history.map((line, index) => (
              <div
                key={index}
                className="flex flex-col gap-1 border-b border-white/5 pb-4 last:border-0"
              >
                {/* Speaker Name */}
                {line.speakerName && (
                  <span className="text-sm font-bold text-pink-400 uppercase tracking-wide">
                    {line.speakerName}
                  </span>
                )}

                {/* Text & Voice Button */}
                <div className="flex justify-between items-start gap-4">
                  <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">
                    {line.text}
                  </p>

                  {line.voiceUrl && (
                    <button
                      onClick={() => playVoice(line.voiceUrl!)}
                      className="p-2 rounded-full bg-white/5 hover:bg-pink-600 hover:text-white text-gray-500 transition-all flex-shrink-0"
                      title="Replay Voice"
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Footer Decoration */}
        <div className="h-1 w-full bg-gradient-to-r from-pink-600 to-purple-600"></div>
      </div>
    </div>
  );
};

export default LogModal;
