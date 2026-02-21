import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Play,
  Pause,
  Menu,
  History,
  User,
  X,
  ArrowRight,
  Album,
} from "lucide-react";
import { getPlaceholderImageUrl } from "../utils/imageUtils";
import LogModal from "../components/LogModal";

// --- TYPES ---
interface ScriptLine {
  type: "dialogue" | "background" | "bgm" | "sfx";
  speakerCode?: string | null;
  speakerName?: string;
  iconUrl?: string | null;
  text?: string;
  voiceUrl?: string | null;
  src?: string;
  action?: "play" | "stop";
  bgName?: string;
  startTime?: number;
  sfxList?: { src: string; delay: number }[];
}

interface Story {
  id: string;
  title: string;
  epNum: number;
  fileName: string;
}

interface CharacterGroup {
  id: string;
  name: string;
  stories: Story[];
}

interface StackFrame {
  script: ScriptLine[];
  index: number;
}

// --- CONFIG ---
// Pastikan endpoint ini sesuai dengan folder output backend Anda
const API_BASE = "https://beip.dasewasia.my.id/api/extrastory";
const R2_DOMAIN = "https://apiip.dasewasia.my.id";

// --- MAPPING SPRITE (Sama dengan LoveStory) ---
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

const ExtraStoryPage: React.FC = () => {
  // Data State
  const [characters, setCharacters] = useState<CharacterGroup[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);

  // Stack-Based Engine
  const [executionStack, setExecutionStack] = useState<StackFrame[]>([]);

  const currentFrame = executionStack[executionStack.length - 1];
  const currentLine = currentFrame
    ? currentFrame.script[currentFrame.index]
    : undefined;

  // UI State
  const [history, setHistory] = useState<ScriptLine[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("idoly_username") || "Manager";
  });
  const [currentBg, setCurrentBg] = useState<string | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typeIntervalRef = useRef<number | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxTimersRef = useRef<number[]>([]);

  // End Episode State
  const [isEpisodeFinished, setIsEpisodeFinished] = useState(false);
  const [nextStories, setNextStories] = useState<Story[]>([]);

  // --- 1. FETCH INDEX (Extra) ---
  useEffect(() => {
    // Mengambil index_extra.json yang dihasilkan script backend
    axios
      .get(`${API_BASE}/index_extra.json`)
      .then((res) => setCharacters(res.data))
      .catch((err) => console.error("Extra Index Error:", err));
  }, []);

  // --- CLEANUP AUDIO ---
  useEffect(() => {
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      sfxTimersRef.current.forEach((id) => clearTimeout(id));
    };
  }, []);

  // --- 2. LOAD STORY ---
  const loadStory = async (storyId: string, _title: string) => {
    try {
      // Reset States
      setExecutionStack([]);
      setHistory([]);
      setIsAutoPlay(false);
      setIsTyping(false);
      setDisplayedText("");
      setIsEpisodeFinished(false);
      setNextStories([]);

      setCurrentBg(null);
      // Reset Audio
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Fetch JSON Story
      const res = await axios.get(`${API_BASE}/stories/${storyId}.json`);
      setExecutionStack([{ script: res.data.script, index: 0 }]);
      setCurrentStoryId(storyId);
      if (window.innerWidth < 1024) setSidebarOpen(false);
    } catch (err) {
      console.error("Story Load Error:", err);
    }
  };

  // --- LOGIC: DETEKSI NEXT STORY (LINEAR) ---
  const handleStoryEnd = () => {
    if (isEpisodeFinished) return;
    setIsEpisodeFinished(true);

    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    sfxTimersRef.current.forEach((id) => clearTimeout(id));

    if (!selectedCharId || !currentStoryId) return; // Cek ID
    const currentChar = characters.find((c) => c.id === selectedCharId);
    if (!currentChar) return;

    // Cari index berdasarkan ID (Pasti Akurat)
    const currentIndex = currentChar.stories.findIndex(
      (s) => s.id === currentStoryId,
    );

    if (currentIndex === -1) return;

    const nextStory = currentChar.stories[currentIndex + 1];
    if (nextStory) {
      setNextStories([nextStory]);
    }
  };

  // --- ENGINE LOGIC ---
  const advance = () => {
    if (isEpisodeFinished) return;

    setExecutionStack((prevStack) => {
      const newStack = [...prevStack];
      const top = { ...newStack[newStack.length - 1] };

      if (top.index >= top.script.length - 1) {
        // Story Selesai
        setTimeout(handleStoryEnd, 0);
        return prevStack;
      }

      top.index += 1;
      newStack[newStack.length - 1] = top;
      return newStack;
    });
  };

  // --- EFFECT: PLAY LINE ---
  useEffect(() => {
    sfxTimersRef.current.forEach((id) => clearTimeout(id));
    sfxTimersRef.current = [];

    if (!currentLine) return;

    // Background
    if (currentLine.type === "background" && currentLine.src) {
      setCurrentBg(currentLine.src);
      advance();
      return;
    }

    // BGM
    if (currentLine.type === "bgm") {
      if (currentLine.action === "stop") {
        if (bgmRef.current) {
          bgmRef.current.pause();
          bgmRef.current = null;
        }
      } else if (currentLine.action === "play" && currentLine.src) {
        if (bgmRef.current) bgmRef.current.pause();
        const newBgm = new Audio(currentLine.src);
        newBgm.loop = true;
        newBgm.volume = 0.5;
        newBgm.play().catch((e) => console.warn("BGM Error", e));
        bgmRef.current = newBgm;
      }
      advance();
      return;
    }

    // SFX
    if (
      currentLine.type === "dialogue" &&
      currentLine.sfxList &&
      currentLine.sfxList.length > 0
    ) {
      currentLine.sfxList.forEach((sfx) => {
        const timerId = window.setTimeout(() => {
          const audio = new Audio(sfx.src);
          audio.volume = 0.7;
          audio.play().catch((e) => console.warn("SFX Error", e));
        }, sfx.delay);
        sfxTimersRef.current.push(timerId);
      });
    }

    if (currentLine.type === "sfx" && currentLine.src) {
      const sfx = new Audio(currentLine.src);
      sfx.volume = 0.7;
      sfx.loop = false;
      sfx.play().catch((e) => console.warn("SFX Error", e));
      advance();
      return;
    }

    // Reset Audio/Typing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }

    const hasVoice = !!currentLine.voiceUrl;
    const hasText = currentLine.type === "dialogue" && !!currentLine.text;

    setIsPlayingAudio(hasVoice);
    setIsTyping(hasText);
    setDisplayedText("");

    // Voice Playback
    if (hasVoice && currentLine.voiceUrl) {
      const audio = new Audio(currentLine.voiceUrl);
      audioRef.current = audio;
      audio.play().catch(() => setIsPlayingAudio(false));
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
    }

    // Text Typewriter
    if (hasText && currentLine.text) {
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

      setHistory((prev) => {
        const last = prev[prev.length - 1];
        const processedLine = {
          ...currentLine,
          text: fullText,
          speakerName: parseText(currentLine.speakerName),
        };
        // Mencegah duplikasi history jika re-render
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

    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, [currentLine]);

  // Auto Play Logic
  useEffect(() => {
    if (!isAutoPlay || !currentLine) return;

    if (!isTyping && !isPlayingAudio) {
      const timer = setTimeout(() => {
        if (isAutoPlay) advance();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAutoPlay, isTyping, isPlayingAudio, currentLine]);

  // Handle User Click
  const handleBoxClick = () => {
    if (!currentLine) return;

    if (isTyping) {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      setDisplayedText(parseText(currentLine.text) || "");
      setIsTyping(false);
    } else {
      advance();
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
    return `${R2_DOMAIN}/spriteCharacter/sprite-${filename}-01.png`;
  };

  const getSpriteStyle = (code?: string | null) => {
    if (!code) return "";
    const lower = code.toLowerCase();
    if (["kor"].includes(lower)) {
      let style = "lg:translate-y-80";
      if (lower === "mhk") {
        style += "lg:translate-y-96"; //somehow not working
      } else {
        style += "";
      }
      return style;
    }
    return "";
  };

  const parseText = (text?: string) => {
    if (!text) return "";
    return text.replace(/{user}/g, userName);
  };

  const handleChangeName = () => {
    const newName = window.prompt("Enter your Manager name:", userName);
    if (newName && newName.trim() !== "") {
      setUserName(newName);
      localStorage.setItem("idoly_username", newName);
      if (currentLine && currentLine.type === "dialogue") {
        setDisplayedText(currentLine.text?.replace(/{user}/g, newName) || "");
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#0f1115] text-white font-sans overflow-hidden relative selection:bg-pink-500 selection:text-white">
      {/* MOBILE BTN */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="fixed top-20 left-4 z-[100] lg:hidden p-3 bg-pink-600 text-white rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)] border border-white/20 transition-transform active:scale-95 hover:bg-pink-500"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[40] bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* BACKGROUND TEXTURE */}
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
        className={`
        fixed inset-y-0 top-16 lg:top-0 left-0 z-[50] w-72 bg-[#0d1117] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl
        lg:relative lg:translate-x-0 lg:z-0 lg:shadow-none
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-pink-900/20 to-transparent">
          <div>
            <div className="flex items-center gap-2 text-pink-400 mb-1">
              <Album size={16} />
              <span className="text-[10px] tracking-[0.2em] font-bold uppercase">
                Idol Story
              </span>
            </div>
            <h1 className="font-black italic text-2xl tracking-tighter text-white">
              EXTRA{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                STORY&nbsp;
              </span>
            </h1>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex flex-col gap-3 bg-[#0d1117]">
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
        </div>

        {/* CHARACTER LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {characters.map((char) => (
            <div key={char.id} className="group">
              <button
                onClick={() =>
                  setSelectedCharId(selectedCharId === char.id ? null : char.id)
                }
                className={`w-full text-left px-3 py-3 rounded-lg transition-all flex items-center gap-3 border ${
                  selectedCharId === char.id
                    ? "border-pink-500 bg-white/5 text-white"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                }`}
                title={char.name}
              >
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-sm tracking-wide block truncate">
                    {char.name}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {char.stories.length} Stories
                  </span>
                </div>
              </button>

              {selectedCharId === char.id && (
                <div className="ml-6 mt-2 pl-4 border-l-2 border-white/10 space-y-1">
                  {char.stories.map((story) => (
                    <button
                      key={story.id + story.epNum}
                      onClick={() => loadStory(story.id, story.title)}
                      className={`block w-full text-left text-xs px-4 py-2 rounded transition-all ${
                        currentStoryId === story.id
                          ? "text-pink-300 bg-pink-500/10 font-bold"
                          : "text-gray-500 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {story.title + story.epNum}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN STAGE */}
      <main className="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden">
        {!currentLine ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 select-none animate-pulse">
            <div className="w-20 h-20 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mb-6">
              <Play size={32} className="ml-1" />
            </div>
            <p className="text-xl tracking-[0.5em] font-light text-white/50">
              SELECT STORY
            </p>
          </div>
        ) : (
          <>
            {/* BACKGROUND */}
            <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
              <div className="absolute inset-0 bg-[#0f1115]"></div>
              {currentBg && (
                <div
                  className="absolute inset-0 bg-cover bg-center animate-in fade-in duration-1000"
                  style={{ backgroundImage: `url('${currentBg}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 opacity-60"></div>
                </div>
              )}
            </div>

            {/* SPRITE */}
            {currentLine.speakerCode &&
              getSpriteUrl(currentLine.speakerCode) && (
                <div
                  className={`absolute inset-0 flex items-end justify-center pointer-events-none z-10  scale-[200%] lg:scale-[150%] translate-y-4 lg:translate-y-32 ${getSpriteStyle(currentLine.speakerCode)}`}
                >
                  <img
                    key={currentLine.speakerCode}
                    src={getSpriteUrl(currentLine.speakerCode)!}
                    alt={currentLine.speakerCode}
                    className="h-[85%] lg:h-[95%] object-contain drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500"
                  />
                </div>
              )}

            {/* DIALOGUE */}
            {currentLine.type === "dialogue" && (
              <div
                onClick={handleBoxClick}
                className="absolute bottom-0 w-full z-40 cursor-pointer group flex justify-center pb-6 lg:pb-10 px-4"
              >
                <div className="w-full max-w-5xl relative">
                  {/* Name Tag */}
                  {currentLine.speakerName && (
                    <div className="absolute -top-6 left-0 lg:left-8 z-50">
                      <div className="relative bg-white text-black px-8 py-1.5 transform skew-x-[-12deg] border-l-[6px] border-pink-600 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                        <div className="transform skew-x-[12deg] flex items-center gap-2">
                          {currentLine.iconUrl && (
                            <img
                              src={currentLine.iconUrl}
                              className="w-8 h-8 rounded-full border border-black/20"
                              alt="icon"
                              onError={(e) => {
                                e.currentTarget.src =
                                  getPlaceholderImageUrl("square");
                              }}
                            />
                          )}
                          <span className="font-bold tracking-wider text-base uppercase">
                            {parseText(currentLine.speakerName)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Text Box */}
                  <div
                    className="relative bg-[#0f131a]/90 backdrop-blur-lg border-t border-white/10 shadow-2xl p-6 lg:p-8 min-h-[160px] lg:min-h-[180px]"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% 85%, 98% 100%, 0 100%)",
                    }}
                  >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

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

                    {!isTyping && (
                      <div className="absolute bottom-4 right-8 animate-bounce text-pink-500">
                        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-pink-500"></div>
                      </div>
                    )}

                    {/* Controls (No Skip) */}
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* --- END STORY OVERLAY --- */}
        {isEpisodeFinished && (
          <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="max-w-2xl w-full p-8 bg-[#0f131a] border border-white/10 shadow-2xl rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>

              <h2 className="text-3xl font-black italic text-white mb-2 tracking-tighter">
                STORY COMPLETED
              </h2>
              {/* <p className="text-gray-400 mb-6 text-sm">Extra Level Updated!</p> */}

              <div className="space-y-3">
                {nextStories.length > 0 ? (
                  <>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Next Story:
                    </p>
                    {nextStories.map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() => {
                          setIsEpisodeFinished(false);
                          loadStory(ep.id, ep.title);
                        }}
                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500 transition-all group"
                      >
                        <span className="font-bold text-lg text-white group-hover:text-pink-400 transition-colors">
                          {ep.title + ep.epNum}
                        </span>
                        <ArrowRight className="text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="p-4 bg-white/5 border border-white/5 text-center text-gray-500">
                    Extra Story Completed.
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => {
                    setIsEpisodeFinished(false);
                    setExecutionStack([
                      { script: executionStack[0].script, index: 0 },
                    ]);
                  }}
                  className="text-xs text-gray-500 hover:text-white underline"
                >
                  Replay Story
                </button>
                <button
                  onClick={() => {
                    setIsEpisodeFinished(false);
                    setExecutionStack([]);
                  }}
                  className="text-xs text-gray-500 hover:text-white underline"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {showLog && (
        <LogModal history={history} onClose={() => setShowLog(false)} />
      )}
    </div>
  );
};

export default ExtraStoryPage;
