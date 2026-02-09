import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Play, SkipForward, Rewind, MessageCircle } from "lucide-react";

// Types
interface ScriptLine {
  type: "dialogue" | "choice" | "anchor" | "jump";
  speaker?: string;
  text?: string;
  voiceUrl?: string;
  // For choices
  nextLabel?: string;
  labelName?: string;
}

interface StoryIndex {
  loveId: string;
  title: string;
  episodes: { episode: number; storyId: string }[];
}

const LoveStoryPage: React.FC = () => {
  const [stories, setStories] = useState<StoryIndex[]>([]);
  const [currentScript, setCurrentScript] = useState<ScriptLine[]>([]);

  // Player State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load List
  useEffect(() => {
    axios
      .get("https://diveidolypapi.my.id/api/lovestory/index.json")
      .then((res) => setStories(res.data));
  }, []);

  // Load Episode
  const loadEpisode = async (storyId: string) => {
    const res = await axios.get(
      `https://diveidolypapi.my.id/api/lovestory/stories/${storyId}.json`,
    );
    setCurrentScript(res.data.script);
    setCurrentIndex(0);
  };

  // Logic Player
  const currentLine = currentScript[currentIndex];

  useEffect(() => {
    if (!currentLine) return;

    // Handle Logic JUMP otomatis (jika type jump/anchor, langsung next)
    if (currentLine.type === "anchor") {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    if (currentLine.type === "jump") {
      const targetIndex = currentScript.findIndex(
        (l) => l.type === "anchor" && l.labelName === currentLine.nextLabel,
      );
      if (targetIndex !== -1) setCurrentIndex(targetIndex);
      return;
    }

    // Handle Audio
    if (currentLine.voiceUrl) {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(currentLine.voiceUrl);
      audioRef.current.play();

      // Jika Autoplay, lanjut setelah audio selesai
      if (isAutoPlay) {
        audioRef.current.onended = () => advance();
      }
    }
  }, [currentIndex, currentScript, isAutoPlay]);

  const advance = () => {
    if (currentIndex < currentScript.length - 1) {
      // Jangan advance jika sedang di Choice
      if (currentLine.type === "choice") return;
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleChoice = (nextLabel: string) => {
    const targetIndex = currentScript.findIndex(
      (l) => l.type === "anchor" && l.labelName === nextLabel,
    );
    if (targetIndex !== -1) setCurrentIndex(targetIndex);
    else setCurrentIndex((prev) => prev + 1); // Fallback
  };

  // --- RENDER ---
  return (
    <div className="h-screen flex bg-gray-900 text-white">
      {/* Sidebar (Simplified) */}
      <div className="w-64 bg-gray-800 overflow-y-auto border-r border-gray-700 p-4">
        <h2 className="font-bold mb-4">Moshikoi Stories</h2>
        {stories.map((story) => (
          <div key={story.loveId} className="mb-4">
            <div className="font-semibold text-sm text-gray-400 mb-2">
              {story.title}
            </div>
            <div className="space-y-1">
              {story.episodes.map((ep) => (
                <button
                  key={ep.storyId}
                  onClick={() => loadEpisode(ep.storyId)}
                  className="block w-full text-left text-xs p-2 rounded hover:bg-gray-700 bg-gray-900"
                >
                  Episode {ep.episode}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Visual Novel Stage */}
      <div className="flex-1 relative bg-black flex flex-col items-center justify-center">
        {!currentLine ? (
          <div className="text-gray-500">Select an episode to start</div>
        ) : (
          <>
            {/* Background (Placeholder) */}
            <div className="absolute inset-0 bg-[url('/assets/bg_placeholder.jpg')] bg-cover opacity-50"></div>

            {/* Choices Overlay */}
            {/* Kita perlu mengumpulkan semua choice berturut-turut */}
            {currentLine.type === "choice" && (
              <div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center gap-4">
                {/* Render current choice & look ahead for siblings */}
                {currentScript
                  .slice(currentIndex)
                  .filter((l, i, arr) => {
                    // Trik sederhana: ambil item selama tipenya choice berturut-turut
                    // (Implementasi real butuh logic grouping yg lebih rapi di parser, tapi ini quick fix)
                    return (
                      l.type === "choice" &&
                      (i === 0 || arr[i - 1].type === "choice")
                    );
                  })
                  .map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChoice(choice.nextLabel!)}
                      className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                    >
                      {choice.text}
                    </button>
                  ))}
              </div>
            )}

            {/* Text Box Area */}
            <div
              className="absolute bottom-10 left-10 right-10 h-40 bg-gray-900/90 border-2 border-white/20 rounded-xl p-6 flex flex-col z-10 cursor-pointer hover:bg-gray-900"
              onClick={advance}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-yellow-400 text-xl">
                  {currentLine.speaker}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAutoPlay(!isAutoPlay);
                    }}
                  >
                    {isAutoPlay ? (
                      <span className="text-green-400 font-bold">AUTO ON</span>
                    ) : (
                      <span className="text-gray-500">AUTO OFF</span>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-lg leading-relaxed">{currentLine.text}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoveStoryPage;
