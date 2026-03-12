import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import {
  Menu,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  X,
  CheckCircle2,
  MoreVertical,
  User,
  PlayCircle,
} from "lucide-react";
import Toast from "../components/Toast";

// --- Interfaces Disesuaikan dengan Output sync-eventstory.mjs ---
interface EpisodeIndex {
  id: string;
  title: string;
  fileName: string;
}

interface EventGroup {
  id: string;
  title: string;
  episodes: EpisodeIndex[];
}

// Struktur data satu baris script dari JSON
interface ScriptLine {
  type: string; // "dialogue", "background", "bgm", "choice_selection", dll
  speakerCode?: string;
  speakerName?: string;
  iconUrl?: string | null;
  voiceUrl?: string | null;
  text?: string;
  src?: string; // Untuk bg/bgm
  choices?: { text: string; route: ScriptLine[] }[];
}

// Struktur data file JSON episode
interface EventStoryData {
  id: string;
  title: string;
  script: ScriptLine[];
}

// --- Logic Grouping Chat ---
type ProcessedMessage =
  | { type: "normal"; data: ScriptLine }
  | { type: "choice_group"; items: { text: string; route: ScriptLine[] }[] }
  | { type: "system"; text: string }; // Untuk Background/BGM change info (opsional)

const API_BASE_URL = "https://beip.dasewasia.my.id/api/eventstory";

const MessagePage: React.FC = () => {
  // --- STATE ---
  const [groups, setGroups] = useState<EventGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(
    null,
  );
  const [storyData, setStoryData] = useState<EventStoryData | null>(null);
  const [selectedChoices, setSelectedChoices] = useState<
    Record<number, number>
  >({});

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("idoly_username") || "Manager";
  });

  const [isSidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 1024,
  );
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Ref untuk Audio Voice agar bisa diputar manual
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- FETCH INDEX ---
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/index.json`);
        setGroups(res.data);
      } catch (error) {
        console.error("Failed to load event index:", error);
        setToastMessage("Failed to load event list.");
      }
    };
    fetchGroups();
  }, []);

  // --- FETCH DETAIL ---
  useEffect(() => {
    if (!selectedEpisodeId) return;

    const fetchDetail = async () => {
      setLoading(true);
      setStoryData(null);
      setSelectedChoices({});
      try {
        // Menggunakan format .json karena itu yang di-generate backend
        const res = await axios.get(
          `${API_BASE_URL}/stories/${selectedEpisodeId}.json`,
        );
        setStoryData(res.data);
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
        }
      } catch (error) {
        console.error("Failed to load episode detail:", error);
        setToastMessage("Failed to load episode content.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [selectedEpisodeId]);

  // --- LOGIC GROUPING UNTUK TAMPILAN CHAT ---
  const processedMessages = useMemo(() => {
    if (!storyData || !storyData.script) return [];

    const result: ProcessedMessage[] = [];

    storyData.script.forEach((line) => {
      if (line.type === "choice_selection" && line.choices) {
        result.push({ type: "choice_group", items: line.choices });
      } else if (line.type === "dialogue") {
        result.push({ type: "normal", data: line });
        // } else if (line.type === "background") {
        //   // Kita bisa menampilkan pergantian background sebagai pesan sistem (opsional)
        //   result.push({
        //     type: "system",
        //     text: `[Scene Changed to: ${line.bgName || "New Location"}]`,
        //   });
      }
    });

    return result;
  }, [storyData]);

  useEffect(() => {
    document.title = "Polaris Idoly | Event Log";
    return () => {
      document.title = "Polaris Idoly";
    };
  }, []);

  // Hentikan audio jika berpindah episode
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedEpisodeId]);

  const parseText = (text?: string) => {
    if (!text) return "";
    return text.replace(/{user}/g, userName).replace(/\n/g, "<br/>");
  };

  const handleChangeName = () => {
    const newName = window.prompt("Enter your Manager name:", userName);
    if (newName && newName.trim() !== "") {
      setUserName(newName);
      localStorage.setItem("idoly_username", newName);
    }
  };

  const playVoice = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audio.play().catch((e) => console.warn("Failed to play voice", e));
    audioRef.current = audio;
  };

  return (
    <div className="flex h-screen bg-[#0f1115] text-white overflow-hidden font-sans relative selection:bg-cyan-500 selection:text-black">
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-[#161b22]/95 backdrop-blur-md border-r border-white/10 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0`}
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#0d1117]">
          <div>
            <span className="text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase block mb-1">
              Event Logs
            </span>
            <h2 className="text-xl font-black italic tracking-tighter text-white flex items-center gap-2">
              <MessageCircle size={20} className="text-cyan-500" /> STORY
              ARCHIVE
            </h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
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

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {groups.map((group) => (
            <div key={group.id} className="border-b border-white/5">
              <button
                onClick={() =>
                  setSelectedGroup(selectedGroup === group.id ? null : group.id)
                }
                className={`w-full flex items-center gap-3 p-4 transition-all text-left group hover:bg-white/5 ${selectedGroup === group.id ? "bg-white/5" : ""}`}
              >
                <span className="font-bold text-sm text-gray-300 group-hover:text-white flex-1 tracking-wide line-clamp-2">
                  {group.title}
                </span>
                {selectedGroup === group.id ? (
                  <ChevronDown size={14} className="text-cyan-400 shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-gray-600 shrink-0" />
                )}
              </button>

              {selectedGroup === group.id && (
                <div className="bg-[#0a0c10] py-1 shadow-inner">
                  {group.episodes.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => {
                        setSelectedEpisodeId(ep.id);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={`block w-full text-left py-3 px-4 pl-8 text-xs transition-all border-l-2 ${
                        selectedEpisodeId === ep.id
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-100 font-bold"
                          : "border-transparent text-gray-500 hover:text-white hover:pl-9 hover:bg-white/5"
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

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 relative flex flex-col h-full bg-[#0a0c10]">
        {!isSidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-40 p-2 bg-[#161b22] border border-white/10 rounded text-white shadow-lg lg:hidden"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-pulse gap-2">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-mono tracking-widest uppercase">
                Decrypting Record...
              </span>
            </div>
          ) : !storyData ? (
            <div className="flex flex-col items-center justify-center h-full text-white/20 select-none">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center mb-4">
                <MessageCircle size={48} />
              </div>
              <p className="text-sm tracking-[0.2em] uppercase font-bold">
                No Record Selected
              </p>
            </div>
          ) : (
            <>
              {/* Header Chat */}
              <div className="absolute top-0 inset-x-0 z-20 bg-[#161b22]/90 backdrop-blur-md p-3 border-b border-white/10 shadow-lg flex justify-between items-center">
                <div className="flex-1 text-center lg:text-left lg:pl-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">
                      Episode Title
                    </span>
                    <h1 className="text-base font-bold text-white tracking-wide">
                      {storyData.title}
                    </h1>
                  </div>
                </div>
                <div className="flex gap-3 pr-4 text-gray-500">
                  <MoreVertical
                    size={18}
                    className="hover:text-white cursor-pointer transition"
                  />
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 pt-20 pb-10 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('/assets/chat-bg.png')] bg-cover bg-center mix-blend-overlay z-0"></div>

                <div className="relative z-10 flex flex-col gap-4 max-w-4xl mx-auto">
                  {processedMessages.map((item, index) => {
                    // --- SYSTEM MESSAGE (BGM/Background Info) ---
                    if (item.type === "system") {
                      return (
                        <div key={index} className="flex justify-center my-4">
                          <span className="bg-black/50 text-gray-500 border border-white/5 text-[10px] px-4 py-1 rounded-full uppercase tracking-widest">
                            {item.text}
                          </span>
                        </div>
                      );
                    }

                    // --- CHOICE GROUP ---
                    if (item.type === "choice_group") {
                      const selectedIdx = selectedChoices[index] ?? 0;
                      return (
                        <div
                          key={index}
                          className="flex flex-col items-end gap-3 mt-4 mb-2 animate-in slide-in-from-right-4 fade-in duration-300"
                        >
                          <div className="flex items-center gap-2 mr-1 opacity-80">
                            <span className="h-[1px] w-8 bg-cyan-500/50"></span>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-cyan-400">
                              Response Options
                            </span>
                          </div>

                          {item.items.map((choice, cIdx) => {
                            const isSelected = selectedIdx === cIdx;
                            return (
                              <button
                                key={cIdx}
                                onClick={() =>
                                  setSelectedChoices((prev) => ({
                                    ...prev,
                                    [index]: cIdx,
                                  }))
                                }
                                className={`
                                  relative px-6 py-3 transition-all duration-300 ease-out text-sm font-medium text-left transform skew-x-[-10deg] border
                                  ${isSelected ? "bg-cyan-900/40 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "bg-[#1f2937]/60 border-white/10 text-gray-400 hover:bg-[#1f2937] hover:border-white/30"}
                                `}
                              >
                                {isSelected && (
                                  <div className="absolute -left-2 top-1/2 -translate-y-1/2">
                                    <CheckCircle2
                                      size={14}
                                      className="text-cyan-400 drop-shadow-md"
                                    />
                                  </div>
                                )}
                                <span className="block transform skew-x-[10deg]">
                                  {choice.text}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    }

                    // --- NORMAL MESSAGE (DIALOGUE) ---
                    if (item.type === "normal") {
                      const msg = item.data;
                      // Anggap karakter "koh" atau "unknown" tanpa nama sebagai Player (MC)
                      const isPlayer =
                        msg.speakerCode === "koh" ||
                        (!msg.speakerName && msg.speakerCode === "unknown");

                      const prevItem = processedMessages[index - 1];
                      const isSequence =
                        prevItem?.type === "normal" &&
                        prevItem.data.speakerCode === msg.speakerCode;

                      const justify = isPlayer
                        ? "justify-end"
                        : "justify-start";
                      const align = isPlayer ? "items-end" : "items-start";

                      return (
                        <div key={index} className={`flex ${justify} group`}>
                          <div
                            className={`flex ${align} max-w-[85%] lg:max-w-[70%] gap-3 ${isPlayer ? "flex-row-reverse" : "flex-row"}`}
                          >
                            {!isPlayer && (
                              <div className="flex-shrink-0 w-10 h-10 mt-1">
                                {!isSequence && (
                                  <img
                                    src={
                                      msg.iconUrl || "/assets/chara-avatar.png"
                                    }
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full object-cover border border-white/10 bg-[#1f2937]"
                                    onError={(e) =>
                                      (e.currentTarget.src =
                                        "/assets/chara-avatar.png")
                                    }
                                  />
                                )}
                              </div>
                            )}

                            <div className={`flex flex-col ${align}`}>
                              {!isPlayer && !isSequence && msg.speakerName && (
                                <span className="text-[10px] text-gray-400 ml-1 mb-1 font-bold tracking-wider uppercase">
                                  {msg.speakerName}
                                </span>
                              )}

                              <div
                                className={`relative px-4 py-2.5 shadow-sm text-sm lg:text-base leading-relaxed break-words group/bubble
                                    ${
                                      isPlayer
                                        ? "bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-l-xl rounded-tr-xl rounded-br-sm border border-cyan-500/30"
                                        : "bg-[#1f2937] text-gray-200 rounded-r-xl rounded-tl-xl rounded-bl-sm border border-white/5"
                                    }
                                `}
                              >
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: parseText(msg.text),
                                  }}
                                />

                                {/* Tombol Play Audio jika ada voiceUrl */}
                                {!isPlayer && msg.voiceUrl && (
                                  <button
                                    onClick={() => playVoice(msg.voiceUrl!)}
                                    className="absolute -right-8 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 opacity-0 group-hover/bubble:opacity-100 transition-opacity"
                                    title="Play Voice"
                                  >
                                    <PlayCircle size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                  <div className="h-10"></div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {toastMessage && (
        <Toast
          message={toastMessage}
          isSuccess={false}
          onClose={() => setToastMessage("")}
        />
      )}
    </div>
  );
};

export default MessagePage;
