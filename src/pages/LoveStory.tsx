import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ChevronLeft,
  Volume2,
  Play,
  Pause,
  SkipForward,
  Map,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPlaceholderImageUrl } from "../utils/imageUtils";
import StrategyGuide from "../components/MoshikoiTimelineGuide";

// --- TYPES ---
interface ChoiceOption {
  text: string;
  route: ScriptLine[]; // Nested script
}

interface ScriptLine {
  type: "dialogue" | "choice_selection" | "anchor" | "jump";
  speakerCode?: string | null;
  speakerName?: string;
  iconUrl?: string | null;
  text?: string;
  voiceUrl?: string | null;
  choices?: ChoiceOption[]; // Untuk type: choice_selection
  nextLabel?: string;
  labelName?: string;
}

interface Episode {
  id: string;
  title: string;
  fileName: string;
}

interface EventGroup {
  id: string;
  title: string;
  episodes: Episode[];
}

// --- CONFIG ---
const API_BASE = "https://diveidolypapi.my.id/api/lovestory";
const R2_DOMAIN = "https://api.diveidolypapi.my.id";

// --- MAPPING SPRITE ---
const SPRITE_MAP: Record<string, string> = {
  rio: "rio",
  aoi: "aoi",
  ai: "ai",
  kkr: "kokoro",
  rui: "rui",
  yu: "yu",
  smr: "sumire",
  mna: "mana",
  ktn: "kotono",
  skr: "sakura",
  rei: "rei",
  ngs: "nagisa",
  hrk: "haruko",
  ski: "saki",
  suz: "suzu",
  mei: "mei",
  szk: "shizuku",
  chs: "chisa",
  chk: "chika",
  cca: "cocoa",
  chn: "chino",
  mhk: "miho",
  kan: "kana",
  kor: "fran",
  mana: "mana",
  saegusa: "saegusa",
  asakura: "asakura",
  koh: "kohei",
  kohei: "kohei",
  stm: "satomi",
};

// --- ENGINE STATE INTERFACE ---
interface StackFrame {
  script: ScriptLine[];
  index: number;
}

const LoveStoryPage: React.FC = () => {
  const navigate = useNavigate();

  // Data State
  const [events, setEvents] = useState<EventGroup[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // --- STACK-BASED ENGINE STATE ---
  // Kita menyimpan array of context. [MainStory, SubRoute, SubSubRoute...]
  const [executionStack, setExecutionStack] = useState<StackFrame[]>([]);
  const [currentEpisodeTitle, setCurrentEpisodeTitle] = useState("");

  // Helper: Get Current Line from Top of Stack
  const currentFrame = executionStack[executionStack.length - 1];
  const currentLine = currentFrame
    ? currentFrame.script[currentFrame.index]
    : undefined;

  // Typewriter State
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Controls
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typeIntervalRef = useRef<number | null>(null);

  const [showGuide, setShowGuide] = useState(false);

  // --- 1. FETCH INDEX ---
  useEffect(() => {
    axios
      .get(`${API_BASE}/index.json`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Index Error:", err));
  }, []);

  // --- 2. LOAD EPISODE ---
  const loadEpisode = async (episodeId: string, title: string) => {
    try {
      // Reset State
      setExecutionStack([]); // Clear stack
      setIsAutoPlay(false);
      setIsTyping(false);
      setDisplayedText("");
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const res = await axios.get(`${API_BASE}/stories/${episodeId}.json`);

      // Init Stack dengan Main Script
      setExecutionStack([{ script: res.data.script, index: 0 }]);
      setCurrentEpisodeTitle(title);
    } catch (err) {
      console.error("Story Load Error:", err);
    }
  };

  // --- 3. ENGINE LOGIC: ADVANCE ---
  const advance = () => {
    if (executionStack.length === 0) return;

    // Clone stack agar immutable update
    const newStack = [...executionStack];
    const top = newStack[newStack.length - 1];
    const line = top.script[top.index];

    // Block jika sedang di Choice (User wajib memilih)
    if (line && line.type === "choice_selection") return;

    // Cek apakah masih bisa maju di frame ini?
    if (top.index < top.script.length - 1) {
      top.index++;
      setExecutionStack(newStack);
    } else {
      // End of current frame (Route selesai)
      if (newStack.length > 1) {
        // Jika ini sub-route, POP stack (kembali ke parent)
        newStack.pop();
        // Parent saat ini masih menunjuk ke 'choice_selection' yang memicu route ini
        // Kita harus majukan parent 1 langkah agar tidak looping memilih lagi
        const parent = newStack[newStack.length - 1];
        parent.index++;
        setExecutionStack(newStack);
      } else {
        // End of Main Story
        console.log("End of Story");
        // Bisa tambahkan UI "End" di sini
      }
    }
  };

  // --- 4. ENGINE LOGIC: HANDLE CHOICE ---
  const handleChoice = (route: ScriptLine[]) => {
    // Push Route Baru ke Stack
    setExecutionStack([...executionStack, { script: route, index: 0 }]);
  };

  // --- 5. EFFECT: PLAY LINE (Audio & Text) ---
  useEffect(() => {
    if (!currentLine) return;

    // Reset Audio & Typing saat baris berubah
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingAudio(false);

    // Play Audio
    if (currentLine.voiceUrl) {
      const audio = new Audio(currentLine.voiceUrl);
      audioRef.current = audio;
      setIsPlayingAudio(true);
      audio.play().catch(() => setIsPlayingAudio(false));
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
    }

    // Typewriter Effect
    if (currentLine.type === "dialogue") {
      const fullText = currentLine.text || "";
      setDisplayedText("");
      setIsTyping(true);

      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);

      let charIndex = 0;
      typeIntervalRef.current = window.setInterval(() => {
        charIndex++;
        setDisplayedText(fullText.slice(0, charIndex));
        if (charIndex >= fullText.length) {
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          setIsTyping(false);
        }
      }, 25); // Speed typing
    } else {
      // Untuk choice/jump/anchor tidak perlu ngetik
      setIsTyping(false);
      setDisplayedText("");
    }

    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, [currentLine]); // Dependency: saat currentLine berubah (karena stack/index berubah)

  // --- 6. AUTO PLAY & SKIP LOGIC ---
  useEffect(() => {
    if (!isAutoPlay || !currentLine) return;
    if (currentLine.type === "choice_selection") return;

    if (!isTyping && !isPlayingAudio) {
      const timer = setTimeout(() => {
        if (isAutoPlay) advance();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAutoPlay, isTyping, isPlayingAudio, currentLine]);

  // Handle Box Click (Finish Type / Advance)
  const handleBoxClick = () => {
    if (!currentLine) return;
    if (currentLine.type === "choice_selection") return; // Klik tidak efek saat choice

    if (isTyping) {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      setDisplayedText(currentLine.text || "");
      setIsTyping(false);
    } else {
      advance();
    }
  };

  // Logic Skip (Cerdas)
  const handleSkip = () => {
    setIsAutoPlay(false);

    // Kita perlu mencari 'choice_selection' di frame aktif
    const top = executionStack[executionStack.length - 1];
    const nextChoiceIndex = top.script.findIndex(
      (line, idx) => idx > top.index && line.type === "choice_selection",
    );

    if (nextChoiceIndex !== -1) {
      // Lompat ke pilihan
      const newStack = [...executionStack];
      newStack[newStack.length - 1].index = nextChoiceIndex;
      setExecutionStack(newStack);
    } else {
      // Tidak ada pilihan lagi di frame ini, lompat ke akhir frame
      // (Nanti advance() akan handle pop stack)
      const newStack = [...executionStack];
      newStack[newStack.length - 1].index = top.script.length - 1;
      setExecutionStack(newStack);
    }
  };

  // --- HELPER UI ---
  const getSpriteUrl = (code?: string | null) => {
    if (!code) return null;
    const lower = code.toLowerCase();
    if (
      ["unknown", "narration", "manager", "mob", "koh", "kohei"].includes(lower)
    )
      return null;
    const filename = SPRITE_MAP[lower] || lower;
    return `${R2_DOMAIN}/spriteCharacter/sprite-${filename}-02.png`;
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden relative">
      {/* SIDEBAR */}
      <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col z-50 shadow-xl flex-shrink-0">
        <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-bold text-lg bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Moshikoi Stories
          </h1>
        </div>

        {/* Tombol Buka Guide */}
        <button
          onClick={() => setShowGuide(!showGuide)}
          className={`p-2 rounded-full transition ${showGuide ? "bg-pink-600 text-white" : "hover:bg-gray-800 text-gray-400"}`}
          title="Strategy Guide"
        >
          <Map size={20} />
        </button>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {events.map((event) => (
            <div key={event.id} className="mb-2">
              <button
                onClick={() =>
                  setSelectedEventId(
                    selectedEventId === event.id ? null : event.id,
                  )
                }
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex justify-between items-center ${selectedEventId === event.id ? "bg-pink-900/30 text-pink-300" : "hover:bg-gray-800 text-gray-300"}`}
              >
                {event.title}
                <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-500">
                  {event.episodes.length} Eps
                </span>
              </button>
              {selectedEventId === event.id && (
                <div className="mt-1 ml-2 border-l-2 border-gray-700 pl-2 space-y-1 animate-in slide-in-from-left-2 duration-200">
                  {event.episodes.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => loadEpisode(ep.id, ep.title)}
                      className={`block w-full text-left text-sm px-3 py-2 rounded transition ${currentEpisodeTitle === ep.title ? "bg-pink-600 text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
                    >
                      {ep.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN STAGE */}
      <main className="flex-1 relative bg-gray-950 flex flex-col items-center justify-center overflow-hidden">
        {!currentLine ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 select-none animate-pulse">
            <div className="text-6xl mb-4">💌</div>
            <p className="text-xl tracking-widest">SELECT A STORY TO BEGIN</p>
          </div>
        ) : (
          <>
            {/* BACKGROUND */}
            <div className="absolute inset-0 bg-[url('/assets/bg_school.jpg')] bg-cover bg-center opacity-40 transition-opacity duration-1000"></div>

            {/* SPRITE LAYER */}
            {currentLine.speakerCode &&
              getSpriteUrl(currentLine.speakerCode) && (
                <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-10">
                  <img
                    key={currentLine.speakerCode}
                    src={getSpriteUrl(currentLine.speakerCode)!}
                    alt={currentLine.speakerCode}
                    className="h-[80%] lg:h-[90%] object-contain drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700"
                  />
                </div>
              )}

            {/* CHOICE SELECTION OVERLAY */}
            {currentLine.type === "choice_selection" && currentLine.choices && (
              <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
                <p className="text-pink-300 font-bold tracking-[0.2em] text-lg mb-2 drop-shadow-md">
                  MAKE A CHOICE
                </p>
                {currentLine.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChoice(choice.route)}
                    className="w-[90%] max-w-2xl bg-gradient-to-r from-gray-900/90 to-gray-800/90 border border-pink-500/30 hover:border-pink-400 text-white text-lg px-8 py-6 rounded-xl font-medium transition-all transform hover:scale-105 hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] active:scale-95 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-pink-600/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10">
                      {choice.text.replace("text=", " ")}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* TEXT BOX */}
            {currentLine.type === "dialogue" && (
              <div
                onClick={handleBoxClick}
                className="absolute bottom-4 left-4 right-4 lg:bottom-8 lg:left-32 lg:right-32 h-[30vh] max-h-[250px] z-40 cursor-pointer group"
              >
                <div className="w-full h-full bg-gray-900/95 border-2 border-gray-700 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md hover:border-pink-500/30 transition-colors">
                  {/* Name Tag */}
                  {currentLine.speakerName && (
                    <div className="absolute -top-[1px] -left-[1px] bg-gradient-to-r from-pink-600 to-purple-600 px-8 py-2 rounded-br-2xl shadow-lg z-10 flex items-center gap-3">
                      {currentLine.iconUrl && (
                        <img
                          src={currentLine.iconUrl}
                          alt="icon"
                          className="w-6 h-6 rounded-full border border-white/50"
                          onError={(e) => {
                            e.currentTarget.src =
                              getPlaceholderImageUrl("square");
                          }}
                        />
                      )}
                      <span className="font-bold text-white tracking-wider text-lg lg:text-xl">
                        {currentLine.speakerName}
                      </span>
                      {isPlayingAudio && (
                        <Volume2
                          size={18}
                          className="text-white animate-pulse"
                        />
                      )}
                    </div>
                  )}

                  {/* Text Content */}
                  <div
                    className={`relative z-10 mt-6 h-full overflow-y-auto scrollbar-hide ${!currentLine.speakerName ? "mt-2 italic text-gray-300 text-center flex items-center justify-center h-full" : ""}`}
                  >
                    <p className="text-xl lg:text-2xl leading-relaxed text-gray-100 whitespace-pre-line drop-shadow-md font-medium">
                      {displayedText}
                      {isTyping && (
                        <span className="inline-block w-2 h-6 bg-pink-500 ml-1 animate-pulse align-middle" />
                      )}
                    </p>
                  </div>

                  {!isTyping && (
                    <div className="absolute bottom-4 right-6 text-pink-500 animate-bounce">
                      ▼
                    </div>
                  )}
                </div>

                {/* CONTROLS */}
                <div className="absolute -top-12 right-0 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAutoPlay(!isAutoPlay);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-lg transition-all ${isAutoPlay ? "bg-green-600 text-white hover:bg-green-500" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                  >
                    {isAutoPlay ? <Pause size={14} /> : <Play size={14} />}
                    AUTO
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSkip();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 shadow-lg"
                  >
                    SKIP <SkipForward size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* RENDER STRATEGY GUIDE OVERLAY */}
      {showGuide && selectedEventId && (
        <StrategyGuide
          eventId={selectedEventId}
          onClose={() => setShowGuide(false)}
        />
      )}
    </div>
  );
};

export default LoveStoryPage;
