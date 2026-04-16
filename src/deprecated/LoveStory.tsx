import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import {
  Heart,
  Play,
  Pause,
  SkipForward,
  Map,
  Menu,
  History,
  User,
  X,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  Monitor,
} from "lucide-react";
import { getPlaceholderImageUrl } from "../utils/imageUtils";
import StrategyGuide from "../components/MoshikoiTimelineGuide";
import LogModal from "../components/LogModal";
import { LOVE_STORY_ROADMAP } from "../assets/roadmap";

// --- TYPES ---
interface ChoiceOption {
  text: string;
  route: ScriptLine[];
}

interface ScriptLine {
  type:
    | "dialogue"
    | "choice_selection"
    | "anchor"
    | "jump"
    | "background"
    | "bgm"
    | "sfx";
  speakerCode?: string | null;
  speakerName?: string;
  iconUrl?: string | null;
  text?: string;
  voiceUrl?: string | null;
  choices?: ChoiceOption[];
  nextLabel?: string;
  labelName?: string;
  src?: string;
  action?: "play" | "stop";
  bgName?: string;
  startTime?: number;
  sfxList?: { src: string; delay: number }[];
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
const API_BASE = "https://beip.dasewasia.my.id/api/lovestory";
const R2_DOMAIN = "https://apiip.dasewasia.my.id";

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

interface StackFrame {
  script: ScriptLine[];
  index: number;
}

const LoveStoryPage: React.FC = () => {
  // Data State
  const [events, setEvents] = useState<EventGroup[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isChatMode, setIsChatMode] = useState(false);

  // Stack-Based Engine
  const [executionStack, setExecutionStack] = useState<StackFrame[]>([]);
  const [currentEpisodeTitle, setCurrentEpisodeTitle] = useState("");

  const currentFrame = executionStack[executionStack.length - 1];
  const currentLine = currentFrame
    ? currentFrame.script[currentFrame.index]
    : undefined;

  // UI State
  const [history, setHistory] = useState<ScriptLine[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
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
  const [nextEpisodes, setNextEpisodes] = useState<Episode[]>([]);
  const [activeRouteInfo, setActiveRouteInfo] = useState<string | null>(null);

  // --- 1. FETCH INDEX ---
  useEffect(() => {
    axios
      .get(`${API_BASE}/index.json`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Index Error:", err));
  }, []);

  // --- FIX 2: GLOBAL AUDIO CLEANUP (Saat ganti page/komponen mati) ---
  useEffect(() => {
    return () => {
      // Matikan BGM
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
      // Matikan Voice
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Clear SFX Timers
      sfxTimersRef.current.forEach((id) => clearTimeout(id));
    };
  }, []);

  // --- 2. LOAD EPISODE ---
  const loadEpisode = async (episodeId: string, title: string) => {
    try {
      setExecutionStack([]);
      setHistory([]);
      setIsAutoPlay(false);
      setIsTyping(false);
      setDisplayedText("");
      setIsEpisodeFinished(false);
      setActiveRouteInfo(null);
      setNextEpisodes([]);

      setCurrentBg(null);
      // Reset Audio saat load episode baru
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const res = await axios.get(`${API_BASE}/stories/${episodeId}.json`);
      setExecutionStack([{ script: res.data.script, index: 0 }]);
      setCurrentEpisodeTitle(title);
      if (window.innerWidth < 1024) setSidebarOpen(false);
    } catch (err) {
      console.error("Story Load Error:", err);
    }
  };

  // --- FIX 1: LOGIC NAVIGASI YANG LEBIH ROBUST ---
  const handleEpisodeEnd = () => {
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

    if (!selectedEventId || !currentEpisodeTitle) return;
    const currentGroup = events.find((e) => e.id === selectedEventId);
    if (!currentGroup) return;

    const currentIndex = currentGroup.episodes.findIndex(
      (ep) => ep.title === currentEpisodeTitle,
    );

    if (currentIndex === -1) return;

    const currentEpObj = currentGroup.episodes[currentIndex];

    const parseId = (id: string) => {
      const parts = id.split("_");
      if (parts.length < 5) return { ep: 999, part: 999 };
      return { ep: parseInt(parts[3]), part: parseInt(parts[4]) };
    };

    const currentMeta = parseId(currentEpObj.id);
    let nextParts: Episode[] = [];
    let nextEpisodes: Episode[] = [];

    // Scan episodes selanjutnya
    for (let i = currentIndex + 1; i < currentGroup.episodes.length; i++) {
      const targetEp = currentGroup.episodes[i];
      const targetMeta = parseId(targetEp.id);

      if (targetMeta.ep > currentMeta.ep + 1) break; // Stop jika loncat terlalu jauh

      // Case A: Part Selanjutnya (2.1 -> 2.2)
      if (
        targetMeta.ep === currentMeta.ep &&
        targetMeta.part === currentMeta.part + 1
      ) {
        nextParts.push(targetEp);
      }

      // Case B: Episode Selanjutnya (2.1 -> 3.1, 3.2, etc)
      if (targetMeta.ep === currentMeta.ep + 1) {
        nextEpisodes.push(targetEp);
      }
    }

    let finalSuggestions: Episode[] = [];

    // Prioritas: Jika ada Part selanjutnya (Linear), ambil itu.
    // TAPI, jika TIDAK ADA Part selanjutnya (berarti episode ini selesai),
    // Tampilkan SEMUA Episode berikutnya (untuk handle cabang 3.1 dan 3.2).
    if (nextParts.length > 0) {
      finalSuggestions = nextParts;
    } else {
      // Ini memperbaiki masalah Mintsuku 2.1:
      // Karena tidak ada 2.2, dia akan otomatis mengambil 3.1 DAN 3.2
      finalSuggestions = nextEpisodes;
    }

    // Fallback Terakhir: Jika logic di atas gagal total (misal format nama file aneh)
    if (
      finalSuggestions.length === 0 &&
      currentIndex + 1 < currentGroup.episodes.length
    ) {
      finalSuggestions.push(currentGroup.episodes[currentIndex + 1]);
    }

    setNextEpisodes(finalSuggestions);

    // Roadmap Hint Logic
    const routes = LOVE_STORY_ROADMAP[selectedEventId];
    if (routes) {
      const userChoices = history
        .filter((h) => h.type === "dialogue" && h.speakerName === "Choice")
        .map((h) => h.text);

      let matchedRouteName = null;
      for (const route of routes) {
        const matchCount = route.steps.filter((step) =>
          userChoices.includes(step.choiceText),
        ).length;
        if (matchCount > 0) matchedRouteName = route.endingName;
      }
      setActiveRouteInfo(
        matchedRouteName ? `Possible Route: ${matchedRouteName}` : null,
      );
    }
  };

  // --- 3. ENGINE LOGIC ---
  const advance = () => {
    if (isEpisodeFinished) return;

    setExecutionStack((prevStack) => {
      const newStack = [...prevStack];
      const top = { ...newStack[newStack.length - 1] };

      if (top.index >= top.script.length - 1) {
        if (newStack.length > 1) {
          newStack.pop();
          const parentTop = { ...newStack[newStack.length - 1] };
          parentTop.index += 1;
          newStack[newStack.length - 1] = parentTop;
          return newStack;
        } else {
          // Main story finished
          // Panggil handleEpisodeEnd di luar render cycle agar aman
          // (Sebenarnya aman disini karena trigger state update)
          setTimeout(handleEpisodeEnd, 0);
          return prevStack;
        }
      }

      top.index += 1;
      newStack[newStack.length - 1] = top;
      return newStack;
    });
  };

  // --- UPDATE: HANDLE CHOICE (FIX SKIP STUCK) ---
  const handleChoice = (choiceIndex: number) => {
    if (!currentLine || !currentLine.choices) return;
    const selectedChoice = currentLine.choices[choiceIndex];

    // 1. Simpan ke History
    setHistory((prev) => [
      ...prev,
      {
        type: "dialogue",
        speakerName: "Choice",
        text: selectedChoice.text,
      } as ScriptLine,
    ]);

    // 3. Navigasi
    if (selectedChoice.route && selectedChoice.route.length > 0) {
      setExecutionStack((prev) => [
        ...prev,
        { script: selectedChoice.route!, index: 0 },
      ]);
    } else {
      advance();
    }

    // 2. Reset Engine State (PENTING untuk memperbaiki tombol Skip macet)
    setIsTyping(false);
    setIsAutoPlay(false);
    setDisplayedText("");
  };

  const processedLoveMessages = useMemo(() => {
    if (executionStack.length === 0) return [];

    const fullScript = executionStack[0].script;
    const result: any[] = [];

    const processLines = (lines: ScriptLine[]) => {
      lines.forEach((line) => {
        if (line.type === "dialogue") {
          // Proses penggantian {user} di sini
          const processedText = line.text?.replace(/{user}/g, userName) || "";
          const processedSpeaker =
            line.speakerName?.replace(/{user}/g, userName) || "";

          // Identifikasi apakah ini Manager/Player
          const isPlayer =
            line.speakerCode?.toLowerCase() === "manager" ||
            line.speakerCode?.toLowerCase() === "koh";

          result.push({
            ...line,
            text: processedText,
            speakerName: processedSpeaker,
            isPlayer, // Flag untuk styling rata kanan
          });
        } else if (line.type === "choice_selection") {
          line.choices?.forEach((choice) => {
            // Label Pemisah Rute
            result.push({
              type: "system_label",
              text: `ROUTE: ${choice.text.replace(/{user}/g, userName)}`,
            });
            if (choice.route) {
              processLines(choice.route);
            }
          });
        }
      });
    };

    processLines(fullScript);
    return result;
  }, [executionStack, userName]); // Tambahkan userName sebagai dependency

  // --- EFFECT: PLAY LINE ---
  useEffect(() => {
    // Cleanup SFX timer agar tidak bocor ke slide berikutnya
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

    // SFX (Parallel with Dialogue)
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

    // SFX (Standalone)
    if (currentLine.type === "sfx" && currentLine.src) {
      const sfx = new Audio(currentLine.src);
      sfx.volume = 0.7;
      sfx.loop = false;
      sfx.play().catch((e) => console.warn("SFX Error", e));
      advance();
      return;
    }

    // Cleanup prev audio/typing
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

    // Voice
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

  // Auto Play
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

  // Handle User Click
  const handleBoxClick = () => {
    if (!currentLine) return;
    if (currentLine.type === "choice_selection") return;

    if (isTyping) {
      // Instant Finish
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      setDisplayedText(parseText(currentLine.text) || "");
      setIsTyping(false);
    } else {
      advance();
    }
  };

  // const handleSkip = () => {
  //   setIsAutoPlay(false);
  //   const top = executionStack[executionStack.length - 1];

  //   // Cari pilihan berikutnya
  //   const nextChoiceIndex = top.script.findIndex(
  //     (line, idx) => idx > top.index && line.type === "choice_selection",
  //   );

  //   const newStack = [...executionStack];
  //   if (nextChoiceIndex !== -1) {
  //     newStack[newStack.length - 1].index = nextChoiceIndex;
  //   } else {
  //     // Jika tidak ada pilihan lagi, lompat ke akhir (yang akan men-trigger handleEpisodeEnd)
  //     newStack[newStack.length - 1].index = top.script.length - 1;
  //   }

  //   setExecutionStack(newStack);

  //   // Reset typing state agar tombol skip tidak macet setelah skip selesai
  //   setIsTyping(false);
  // };

  const fastForwardToChoice = () => {
    setExecutionStack((prevStack) => {
      const newStack = [...prevStack];
      const top = { ...newStack[newStack.length - 1] };
      const newHistory: ScriptLine[] = [];

      let i = top.index;
      while (i < top.script.length) {
        const line = top.script[i];

        // Masukkan ke history sementara agar tidak hilang saat skip
        if (line.type === "dialogue") {
          newHistory.push({
            ...line,
            text: parseText(line.text),
            speakerName: parseText(line.speakerName),
          });
        }

        // Berhenti jika ketemu pilihan
        if (line.type === "choice_selection") {
          top.index = i;
          break;
        }
        i++;
      }

      setHistory((prev) => [...prev, ...newHistory]);
      newStack[newStack.length - 1] = top;
      return newStack;
    });
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

  // --- FIX 3: HELPER UNTUK SPRITE STYLE ---
  // Fungsi ini menentukan posisi berdasarkan kode karakter
  const getSpriteStyle = (code?: string | null) => {
    if (!code) return "";
    const lower = code.toLowerCase();

    // Sumire (smr) & Rui (rui) geser ke kiri (-translate-x)
    if (["smr"].includes(lower)) {
      let style = "-translate-x-16 lg:-translate-x-20";
      // Rui lebih naik sedikit (y-40 vs y-60)
      if (lower === "rui") {
        style +=
          "-translate-x-16 lg:-translate-x-20 translate-y-40 lg:translate-y-60";
      } else {
        style += "translate-y-60 lg:translate-y-1/2";
      }
      return style;
    }

    // Default (Tengah/Bawah)
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
              <Heart size={16} />
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

      {/* MAIN STAGE */}
      <main className="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden">
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
            {/* Tombol Switch Mode */}
            <div className="absolute top-4 right-4 z-50 flex gap-2">
              <button
                onClick={() => setIsChatMode(!isChatMode)}
                className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl"
              >
                {isChatMode ? (
                  <>
                    <Monitor size={14} /> VN Mode
                  </>
                ) : (
                  <>
                    <MessageCircle size={14} /> Chat Mode
                  </>
                )}
              </button>
            </div>

            {/* --- MODE VN (ORIGINAL) --- */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${isChatMode ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
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
                    className={`absolute inset-0 flex items-end justify-center pointer-events-none z-10 scale-[200%] lg:scale-[150%] translate-y-4 lg:translate-y-32 ${getSpriteStyle(currentLine.speakerCode)}`}
                  >
                    <img
                      key={currentLine.speakerCode}
                      src={getSpriteUrl(currentLine.speakerCode)!}
                      alt={currentLine.speakerCode}
                      className="h-[85%] lg:h-[95%] object-contain drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500"
                    />
                  </div>
                )}

              {/* CHOICE SELECTION */}
              {currentLine.type === "choice_selection" &&
                currentLine.choices && (
                  <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                    <div className="text-pink-400 font-bold tracking-[0.3em] text-sm mb-4 border-b border-pink-500/50 pb-2">
                      DECISION POINT
                    </div>
                    {currentLine.choices.map((choice, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChoice(idx)}
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

                      {/* Controls */}
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
                              fastForwardToChoice();
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
            </div>

            {/* --- MODE CHAT (TAMBAHAN BARU) --- */}
            {isChatMode && (
              <div className="absolute inset-0 z-40 bg-[#0a0c10] flex flex-col animate-in fade-in duration-500">
                {/* Header Tetap Sama */}
                <div className="p-4 border-b border-white/10 bg-[#161b22]/90 backdrop-blur-md">
                  <h2 className="text-sm font-bold text-pink-400 tracking-widest uppercase">
                    Transcript Mode
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  <div className="max-w-4xl mx-auto flex flex-col gap-6">
                    {processedLoveMessages.map((msg, idx) => {
                      // Tampilan Label Rute
                      if (msg.type === "system_label") {
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-4 my-4 opacity-50"
                          >
                            <div className="h-[1px] flex-1 bg-pink-500/20"></div>
                            <span className="text-[9px] font-black tracking-[0.3em] text-pink-500 uppercase">
                              {msg.text}
                            </span>
                            <div className="h-[1px] flex-1 bg-pink-500/20"></div>
                          </div>
                        );
                      }

                      const align = msg.isPlayer ? "items-end" : "items-start";
                      const justify = msg.isPlayer
                        ? "justify-end text-right"
                        : "justify-start text-left";

                      return (
                        <div
                          key={idx}
                          className={`flex ${justify} animate-in fade-in duration-300`}
                        >
                          <div
                            className={`flex ${align} max-w-[85%] lg:max-w-[70%] gap-3 ${msg.isPlayer ? "flex-row-reverse" : "flex-row"}`}
                          >
                            {/* Avatar Karakter (Hanya muncul jika bukan Player) */}
                            {!msg.isPlayer && (
                              <div className="flex-shrink-0 w-10 h-10">
                                <img
                                  src={
                                    msg.iconUrl || "/assets/chara-avatar.png"
                                  }
                                  className="w-10 h-10 rounded-full object-cover border border-pink-500/20 bg-[#1f2937]"
                                  alt=""
                                />
                              </div>
                            )}

                            <div className={`flex flex-col ${align}`}>
                              <span
                                className={`text-[10px] mb-1 font-bold tracking-wider uppercase ${msg.isPlayer ? "text-gray-400" : "text-pink-400"}`}
                              >
                                {msg.speakerName}
                              </span>
                              <div
                                className={`px-4 py-2.5 text-sm lg:text-base leading-relaxed rounded-xl shadow-sm border ${
                                  msg.isPlayer
                                    ? "bg-gradient-to-br from-pink-600 to-purple-700 text-white rounded-tr-sm border-pink-400/30"
                                    : "bg-[#1f2937] text-gray-200 rounded-tl-sm border-white/5"
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* --- END EPISODE OVERLAY --- */}
        {isEpisodeFinished && (
          <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="max-w-2xl w-full p-8 bg-[#0f131a] border border-white/10 shadow-2xl rounded-xl relative overflow-y-auto max-h-[40rem] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>

              <h2 className="text-3xl font-black italic text-white mb-2 tracking-tighter">
                EPISODE FINISHED
              </h2>
              <p className="text-gray-400 mb-6 text-sm">
                Current progress saved.
              </p>

              {activeRouteInfo && (
                <div className="mb-6 p-3 bg-pink-500/10 border border-pink-500/30 rounded flex items-center gap-3">
                  <CheckCircle className="text-pink-400" size={20} />
                  <span className="text-pink-200 font-bold text-sm tracking-wide">
                    {activeRouteInfo}
                  </span>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Continue to:
                </p>

                {nextEpisodes.length > 0 ? (
                  nextEpisodes.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => {
                        setIsEpisodeFinished(false);
                        loadEpisode(ep.id, ep.title);
                      }}
                      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500 transition-all group"
                    >
                      <span className="font-bold text-lg text-white group-hover:text-pink-400 transition-colors">
                        {ep.title}
                      </span>
                      <ArrowRight className="text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
                    </button>
                  ))
                ) : (
                  <div className="p-4 bg-white/5 border border-white/5 text-center text-gray-500">
                    No further episodes found. (End of Event)
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
                  Replay Episode
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

      {showGuide && selectedEventId && (
        <StrategyGuide
          eventId={selectedEventId}
          onClose={() => setShowGuide(false)}
        />
      )}

      {showLog && (
        <LogModal history={history} onClose={() => setShowLog(false)} />
      )}
    </div>
  );
};

export default LoveStoryPage;
