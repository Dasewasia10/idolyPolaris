import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ChevronLeft,
  Volume2,
  Play,
  Pause,
  SkipForward,
  Map,
  Menu,
  History,
  User,
} from "lucide-react";
import { getPlaceholderImageUrl } from "../utils/imageUtils";
import StrategyGuide from "../components/MoshikoiTimelineGuide";
import LogModal from "../components/LogModal";

// --- TYPES ---
interface ChoiceOption {
  text: string;
  route: ScriptLine[];
}

interface ScriptLine {
  type: "dialogue" | "choice_selection" | "anchor" | "jump";
  speakerCode?: string | null;
  speakerName?: string;
  iconUrl?: string | null;
  text?: string;
  voiceUrl?: string | null;
  choices?: ChoiceOption[];
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
  // Data State
  const [events, setEvents] = useState<EventGroup[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Stack-Based Engine
  const [executionStack, setExecutionStack] = useState<StackFrame[]>([]);
  const [currentEpisodeTitle, setCurrentEpisodeTitle] = useState("");

  const currentFrame = executionStack[executionStack.length - 1];
  const currentLine = currentFrame
    ? currentFrame.script[currentFrame.index]
    : undefined;

  /// --- LOG & HISTORY STATE (BARU) ---
  const [history, setHistory] = useState<ScriptLine[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Typewriter State
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Controls
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typeIntervalRef = useRef<number | null>(null);

  const [isSidebarOpen, setSidebarOpen] = useState(true); // Toggle Sidebar
  //
  // --- USERNAME STATE ---
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("idoly_username") || "Manager";
  });

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
      setExecutionStack([]);
      setHistory([]);
      setIsAutoPlay(false);
      setIsTyping(false);
      setDisplayedText("");
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const res = await axios.get(`${API_BASE}/stories/${episodeId}.json`);
      setExecutionStack([{ script: res.data.script, index: 0 }]);
      setCurrentEpisodeTitle(title);
      // Auto close sidebar on mobile when playing
      if (window.innerWidth < 1024) setSidebarOpen(false);
    } catch (err) {
      console.error("Story Load Error:", err);
    }
  };

  // --- 3. ENGINE LOGIC ---
  const advance = () => {
    if (executionStack.length === 0) return;
    const newStack = [...executionStack];
    const top = newStack[newStack.length - 1];
    const line = top.script[top.index];

    if (line && line.type === "choice_selection") return;

    if (top.index < top.script.length - 1) {
      top.index++;
      setExecutionStack(newStack);
    } else {
      if (newStack.length > 1) {
        newStack.pop();
        const parent = newStack[newStack.length - 1];
        parent.index++;
        setExecutionStack(newStack);
      } else {
        console.log("End of Story");
      }
    }
  };

  const handleChoice = (route: ScriptLine[]) => {
    setExecutionStack([...executionStack, { script: route, index: 0 }]);
  };

  // --- EFFECT: PLAY LINE (AUDIO + TEXT + HISTORY) ---
  useEffect(() => {
    if (!currentLine) return;

    // 1. CLEANUP PREVIOUS STATE
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }

    // 2. DETEKSI APAKAH ADA VOICE/TEXT (Agar AutoPlay tidak jalan duluan)
    const hasVoice = !!currentLine.voiceUrl;
    const hasText = currentLine.type === "dialogue" && !!currentLine.text;

    // Set state "sedang sibuk" SEBELUM proses async dimulai
    // Ini kunci agar AutoPlay tidak menyela
    setIsPlayingAudio(hasVoice);
    setIsTyping(hasText);
    setDisplayedText("");

    // 3. HANDLE AUDIO
    if (hasVoice && currentLine.voiceUrl) {
      const audio = new Audio(currentLine.voiceUrl);
      audioRef.current = audio;

      // Play audio
      audio.play().catch((err) => {
        console.warn("Audio play failed:", err);
        setIsPlayingAudio(false); // Matikan flag jika gagal play
      });

      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
    }

    // 4. HANDLE TEXT (TYPEWRITER)
    if (hasText && currentLine.text) {
      // UBAH DI SINI: Gunakan parseText()
      const fullText = parseText(currentLine.text);
      let charIndex = 0;

      typeIntervalRef.current = window.setInterval(() => {
        charIndex++;
        setDisplayedText(fullText.slice(0, charIndex));
        if (charIndex >= fullText.length) {
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          setIsTyping(false);
        }
      }, 25);

      // 5. ADD TO HISTORY
      setHistory((prev) => {
        const last = prev[prev.length - 1];
        // Kita simpan versi yang SUDAH diproses (parsed) ke dalam history
        // Agar di Log nanti namanya muncul benar, bukan "{user}"
        const processedLine = {
          ...currentLine,
          text: fullText, // Text yang sudah diganti
          speakerName: parseText(currentLine.speakerName), // Speaker juga diganti
        };

        if (
          last &&
          last.text === processedLine.text &&
          last.speakerName === processedLine.speakerName
        ) {
          return prev;
        }
        return [...prev, processedLine];
      });
    }

    // Cleanup saat component unmount atau ganti line
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeIntervalRef.current) {
        clearInterval(typeIntervalRef.current);
      }
    };
  }, [currentLine]); // Dependency hanya currentLine

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

  const handleBoxClick = () => {
    if (!currentLine) return;
    if (currentLine.type === "choice_selection") return;

    if (isTyping) {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      setDisplayedText(currentLine.text || "");
      setIsTyping(false);
    } else {
      advance();
    }
  };

  const handleSkip = () => {
    setIsAutoPlay(false);
    const top = executionStack[executionStack.length - 1];
    const nextChoiceIndex = top.script.findIndex(
      (line, idx) => idx > top.index && line.type === "choice_selection",
    );

    if (nextChoiceIndex !== -1) {
      const newStack = [...executionStack];
      newStack[newStack.length - 1].index = nextChoiceIndex;
      setExecutionStack(newStack);
    } else {
      const newStack = [...executionStack];
      newStack[newStack.length - 1].index = top.script.length - 1;
      setExecutionStack(newStack);
    }
  };

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

  // Helper: Replace placeholder {user} dengan nama asli
  const parseText = (text?: string) => {
    if (!text) return "";
    // Regex global (/g) agar mengganti semua {user} jika muncul lebih dari sekali
    return text.replace(/{user}/g, userName);
  };

  // Handler Ganti Nama (Simple Prompt)
  const handleChangeName = () => {
    const newName = window.prompt("Enter your Manager name:", userName);
    if (newName && newName.trim() !== "") {
      setUserName(newName);
      localStorage.setItem("idoly_username", newName);
      // Opsional: Reload episode agar text ter-refresh jika sedang di tengah dialog
      if (currentEpisodeTitle) {
        // Logika refresh ringan (set displayed text ulang)
        if (currentLine && currentLine.type === "dialogue") {
          setDisplayedText(currentLine.text?.replace(/{user}/g, newName) || "");
        }
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#0f1115] text-white font-sans overflow-hidden relative selection:bg-pink-500 selection:text-white">
      {/* BACKGROUND TEXTURE (Scanlines/Grid) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:relative z-50 h-full bg-[#161b22]/95 backdrop-blur-md border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out shadow-2xl ${isSidebarOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full lg:w-0 lg:-translate-x-0"}`}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-pink-900/20 to-transparent">
          <div>
            <div className="flex items-center gap-2 text-pink-400 mb-1">
              <Volume2 size={16} />
              <span className="text-[10px] tracking-[0.2em] font-bold uppercase">
                Visual Novel
              </span>
            </div>
            <h1 className="font-black italic text-2xl tracking-tighter text-white">
              MOSHIKOI{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                STORIES&nbsp;
              </span>
            </h1>
          </div>
        </div>

        {/* Sidebar Handler */}
        <div className="p-4 border-t border-white/10 flex flex-col gap-3 bg-[#0d1117]">
          {/* Tombol Ganti Nama */}
          <button
            onClick={handleChangeName}
            className="flex items-center justify-between w-full text-xs font-bold text-gray-400 hover:text-white transition bg-white/5 p-2 rounded border border-white/5 hover:border-pink-500/50 group"
          >
            <span className="flex items-center gap-2">
              <User size={14} /> MANAGER NAME
            </span>
            <span className="text-pink-400 group-hover:text-pink-300 truncate max-w-[100px] text-right">
              {userName}
            </span>
          </button>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-pink-400 transition pl-2"
          >
            <Map size={14} /> ROADMAP
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {events.map((event) => (
            <div key={event.id} className="group">
              <button
                onClick={() =>
                  setSelectedEventId(
                    selectedEventId === event.id ? null : event.id,
                  )
                }
                className={`w-full text-left px-4 py-3 rounded-none border-l-2 transition-all flex justify-between items-center ${
                  selectedEventId === event.id
                    ? "border-pink-500 bg-white/5 text-white"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="font-bold text-sm tracking-wide">
                  {event.title}
                </span>
                <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-gray-500 border border-white/10 font-mono">
                  {event.episodes.length}
                </span>
              </button>

              {selectedEventId === event.id && (
                <div className="bg-black/20 py-2">
                  {event.episodes.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => loadEpisode(ep.id, ep.title)}
                      className={`block w-full text-left text-xs px-6 py-2 transition-all border-l-4 ${
                        currentEpisodeTitle === ep.title
                          ? "border-pink-500 text-pink-300 bg-pink-500/10 font-bold"
                          : "border-transparent text-gray-500 hover:text-white hover:pl-7"
                      }`}
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

      {/* TOGGLE BUTTON (Mobile/Collapsed) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 left-4 z-50 p-3 bg-black/50 backdrop-blur border border-white/10 text-white hover:bg-pink-600 hover:border-pink-500 transition-all rounded-none skew-x-[-12deg]"
        >
          <Menu size={20} className="skew-x-[12deg]" />
        </button>
      )}

      {/* MAIN STAGE */}
      <main className="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden">
        {/* Toggle Sidebar Button (Desktop inside) */}
        {isSidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-1/2 left-0 z-50 p-1 bg-gray-800 text-gray-500 hover:text-white rounded-r-full shadow-lg border border-gray-700 hidden lg:block"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {!currentLine ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 select-none animate-pulse">
            <div className="w-20 h-20 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mb-6">
              <Play size={32} className="ml-1" />
            </div>
            <p className="text-xl tracking-[0.5em] font-light text-white/50">
              SELECT EPISODE
            </p>
          </div>
        ) : (
          <>
            {/* BACKGROUND */}
            <div className="absolute inset-0 bg-[url('/assets/bg_school.jpg')] bg-cover bg-center transition-all duration-1000 ease-in-out">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 opacity-80"></div>
            </div>

            {/* SPRITE LAYER */}
            {currentLine.speakerCode &&
              getSpriteUrl(currentLine.speakerCode) && (
                <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-10">
                  <img
                    key={currentLine.speakerCode}
                    src={getSpriteUrl(currentLine.speakerCode)!}
                    alt={currentLine.speakerCode}
                    className="h-[85%] lg:h-[95%] object-contain drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500"
                  />
                </div>
              )}

            {/* CHOICE SELECTION OVERLAY */}
            {currentLine.type === "choice_selection" && currentLine.choices && (
              <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                <div className="text-pink-400 font-bold tracking-[0.3em] text-sm mb-4 border-b border-pink-500/50 pb-2">
                  DECISION POINT
                </div>
                {currentLine.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChoice(choice.route)}
                    className="w-[90%] max-w-xl group relative overflow-hidden bg-gray-900 border border-white/20 px-8 py-6 transition-all hover:border-pink-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] skew-x-[-12deg]"
                  >
                    <div className="absolute inset-0 w-1 bg-pink-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    <span className="relative z-10 text-lg font-medium text-white/90 group-hover:text-white block skew-x-[12deg] text-center">
                      {choice.text.replace("text=", " ")}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* DIALOGUE UI */}
            {currentLine.type === "dialogue" && (
              <div
                onClick={handleBoxClick}
                className="absolute bottom-0 w-full z-40 cursor-pointer group flex justify-center pb-6 lg:pb-10 px-4"
              >
                <div className="w-full max-w-5xl relative">
                  {/* Speaker Name Tag - Geometric & Floating */}
                  {currentLine.speakerName && (
                    <div className="absolute -top-6 left-0 lg:left-8 z-50">
                      <div className="relative bg-white text-black px-8 py-1.5 transform skew-x-[-12deg] border-l-[6px] border-pink-600 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                        <div className="transform skew-x-[12deg] flex items-center gap-2">
                          {currentLine.iconUrl && (
                            <img
                              src={currentLine.iconUrl}
                              className="w-5 h-5 rounded-full border border-black/20"
                              alt="icon"
                              onError={(e) => {
                                e.currentTarget.src =
                                  getPlaceholderImageUrl("square");
                              }}
                            />
                          )}
                          <span className="font-bold tracking-wider text-base uppercase">
                            {/* UBAH DI SINI */}
                            {parseText(currentLine.speakerName)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Text Box - Glassmorphism, Sharp Edges */}
                  <div
                    className="relative bg-[#0f131a]/90 backdrop-blur-lg border-t border-white/10 shadow-2xl p-6 lg:p-8 min-h-[160px] lg:min-h-[180px]"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% 85%, 98% 100%, 0 100%)", // Potongan sudut kanan bawah
                    }}
                  >
                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                    {/* Text Content */}
                    <div
                      className={`relative z-10 h-full ${!currentLine.speakerName ? "flex items-center justify-center italic text-gray-400" : ""}`}
                    >
                      <p className="text-lg lg:text-xl font-medium leading-relaxed text-gray-100 whitespace-pre-line drop-shadow-md">
                        {displayedText}
                        {isTyping && (
                          <span className="inline-block w-2 h-5 bg-pink-500 ml-1 animate-pulse align-sub"></span>
                        )}
                      </p>
                    </div>

                    {/* Next Indicator */}
                    {!isTyping && (
                      <div className="absolute bottom-4 right-8 animate-bounce text-pink-500">
                        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-pink-500"></div>
                      </div>
                    )}

                    {/* Control Buttons (Floating inside/near box) */}
                    <div className="absolute top-0 right-0 flex">
                      <div className="bg-black/60 px-4 py-1 flex gap-4 rounded-bl-xl border-l border-b border-white/10 backdrop-blur">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowLog(true);
                          }}
                          className="text-[10px] font-bold text-gray-400 hover:text-white flex items-center gap-1 uppercase tracking-wider"
                        >
                          <History size={12} /> Log
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAutoPlay(!isAutoPlay);
                          }}
                          className={`text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider transition ${isAutoPlay ? "text-green-400 animate-pulse" : "text-gray-400 hover:text-white"}`}
                        >
                          {isAutoPlay ? (
                            <Pause size={12} />
                          ) : (
                            <Play size={12} />
                          )}{" "}
                          Auto
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSkip();
                          }}
                          className="text-[10px] font-bold text-gray-400 hover:text-pink-400 flex items-center gap-1 uppercase tracking-wider"
                        >
                          Skip <SkipForward size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* STRATEGY GUIDE OVERLAY */}
      {showGuide && selectedEventId && (
        <StrategyGuide
          eventId={selectedEventId}
          onClose={() => setShowGuide(false)}
        />
      )}

      {/* RENDER LOG MODAL (Full Screen Overlay) */}
      {showLog && (
        <LogModal history={history} onClose={() => setShowLog(false)} />
      )}
    </div>
  );
};

export default LoveStoryPage;
