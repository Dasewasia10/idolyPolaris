import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Menu,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  X,
  GitBranch,
  CheckCircle2,
} from "lucide-react";
import Toast from "../components/Toast";

// --- Interfaces ---
// (Interface MessageHeader & MessageGroup tetap sama, tidak perlu diubah)
interface MessageHeader {
  id: string;
  title: string;
  type: number;
}

interface MessageGroup {
  id: string;
  title: string;
  groupIcon: string | null;
  characterIds: string[];
  messages: MessageHeader[];
}

interface ChatDetail {
  id: string;
  speaker: {
    isPlayer: boolean;
    characterId: string;
    icon: string | null;
    name: string;
  };
  text: string;
  isChoice: boolean;
  stamp: string | null;
  image: string | null;
  voiceUrl: string | null;
}

interface MessageData {
  id: string;
  groupId: string;
  name: string;
  background: string | null;
  details: ChatDetail[];
}

// Interface baru untuk grouping di frontend
type ProcessedMessage =
  | { type: "normal"; data: ChatDetail }
  | { type: "choice_group"; items: ChatDetail[] };

const API_BASE_URL = "https://diveidolypapi.my.id/api/messages";

const MessagePage: React.FC = () => {
  // --- STATE ---
  const [groups, setGroups] = useState<MessageGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [messageData, setMessageData] = useState<MessageData | null>(null);

  // State untuk menyimpan pilihan user: { [index_group]: index_item_yang_dipilih }
  const [selectedChoices, setSelectedChoices] = useState<
    Record<number, number>
  >({});

  // UI State
  const [isSidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 1024,
  );
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  // --- FETCH INDEX ---
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/index.json`);
        setGroups(res.data);
      } catch (error) {
        console.error("Failed to load message index:", error);
        setToastMessage("Failed to load message list.");
      }
    };
    fetchGroups();
  }, []);

  // --- FETCH DETAIL ---
  useEffect(() => {
    if (!selectedMessageId) return;

    const fetchDetail = async () => {
      setLoading(true);
      setMessageData(null);
      setSelectedChoices({}); // Reset pilihan saat ganti pesan
      try {
        const res = await axios.get(
          `${API_BASE_URL}/detail/${selectedMessageId}.json`,
        );
        setMessageData(res.data);
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
        }
      } catch (error) {
        console.error("Failed to load message detail:", error);
        setToastMessage("Failed to load message content.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [selectedMessageId]);

  // --- LOGIC GROUPING MESSAGE ---
  // Menggabungkan pesan choice yang berurutan menjadi satu grup
  const processedMessages = useMemo(() => {
    if (!messageData) return [];

    const result: ProcessedMessage[] = [];
    let currentChoiceGroup: ChatDetail[] = [];

    messageData.details.forEach((msg) => {
      if (msg.isChoice) {
        // Jika ini pesan pilihan, masukkan ke buffer grup sementara
        currentChoiceGroup.push(msg);
      } else {
        // Jika ketemu pesan biasa, tapi buffer grup masih ada isinya, simpan dulu grupnya
        if (currentChoiceGroup.length > 0) {
          result.push({ type: "choice_group", items: [...currentChoiceGroup] });
          currentChoiceGroup = [];
        }
        // Simpan pesan biasa
        result.push({ type: "normal", data: msg });
      }
    });

    // Cek sisa buffer di akhir loop
    if (currentChoiceGroup.length > 0) {
      result.push({ type: "choice_group", items: [...currentChoiceGroup] });
    }

    return result;
  }, [messageData]);

  useEffect(() => {
    document.title = "Polaris Idoly | Idol Messages";
    return () => {
      document.title = "Polaris Idoly";
    };
  }, []);

  // --- HELPER: Parse Text ---
  const parseText = (text: string) => {
    if (!text) return "";
    return text.replace(/\n/g, "<br/>");
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden font-sans">
      {/* --- MOBILE OVERLAY BACKDROP --- */}
      {/* Ini akan muncul hanya di mobile ketika sidebar terbuka */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}
      {/* --- SIDEBAR (Tetap sama) --- */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="text-blue-400" />
            Messages
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400"
          >
            <X />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-64px)] scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-500">
          {groups.map((group) => (
            <div key={group.id} className="border-b border-gray-700/50">
              <button
                onClick={() =>
                  setSelectedGroup(selectedGroup === group.id ? null : group.id)
                }
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-700 transition-colors text-left ${selectedGroup === group.id ? "bg-gray-700/50" : ""}`}
              >
                <img
                  src={group.groupIcon || "/assets/icon/chara-avatar.png"}
                  alt={group.title}
                  className="w-10 h-10 rounded-full object-cover border border-gray-600"
                  onError={(e) =>
                    (e.currentTarget.src = "/assets/icon/chara-avatar.png")
                  }
                />
                <span className="font-semibold flex-1 truncate">
                  {group.title}
                </span>
                {selectedGroup === group.id ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>

              {/* Message List (Dropdown) */}
              {selectedGroup === group.id && (
                <div className="bg-gray-900/50 py-1">
                  {group.messages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => {
                        setSelectedMessageId(msg.id);
                        // --- PERBAIKAN UTAMA: Tutup sidebar otomatis di mobile ---
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false);
                        }
                      }}
                      className={`
                        w-full text-left py-3 px-4 pl-16 text-sm hover:bg-blue-900/30 transition-colors border-l-4
                        ${selectedMessageId === msg.id ? "border-blue-500 bg-blue-900/20 text-blue-200" : "border-transparent text-gray-400"}
                      `}
                    >
                      {msg.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 relative flex flex-col h-full bg-gray-900 scrollbar-thin scrollbar-thumb-gray-600">
        {!isSidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-40 p-2 bg-gray-800 rounded-full shadow-lg text-white lg:hidden"
          >
            <Menu />
          </button>
        )}

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500 animate-pulse">
              Loading conversation...
            </div>
          ) : !messageData ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50 select-none">
              <MessageCircle size={64} className="mb-4" />
              <p>Select a message to start reading</p>
            </div>
          ) : (
            <>
              {/* Header Info */}
              <div className="absolute top-0 inset-x-0 z-10 bg-gray-900/90 backdrop-blur-md p-4 border-b border-gray-800 shadow-md flex justify-center">
                <h1 className="text-lg font-bold text-white shadow-black drop-shadow-md">
                  {messageData.name}
                </h1>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 pt-20 pb-10 space-y-4 scrollbar-minimal bg-[url('/assets/chat-bg.png')] bg-repeat bg-cover bg-center bg-blend-multiply bg-gray-800">
                {processedMessages.map((item, index) => {
                  // --- CASE 1: GROUP PILIHAN (CHOICE) ---
                  if (item.type === "choice_group") {
                    // Default pilihan pertama jika belum dipilih
                    const selectedIdx = selectedChoices[index] ?? 0;

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-end gap-2 mt-6 mb-2 animate-in fade-in slide-in-from-bottom-2"
                      >
                        <div className="flex items-center gap-2 mb-1 mr-1 opacity-70">
                          <GitBranch size={14} className="text-cyan-400" />
                          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
                            Select Option
                          </span>
                        </div>

                        {item.items.map((choice, cIdx) => {
                          const isSelected = selectedIdx === cIdx;
                          return (
                            <button
                              key={choice.id}
                              onClick={() =>
                                setSelectedChoices((prev) => ({
                                  ...prev,
                                  [index]: cIdx,
                                }))
                              }
                              className={`
                                                        relative px-6 py-3 rounded-2xl border-2 transition-all duration-300 ease-out text-sm lg:text-base font-medium max-w-[85%] lg:max-w-[60%] text-left
                                                        ${
                                                          isSelected
                                                            ? "bg-gray-900/90 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] scale-100 z-10"
                                                            : "bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-gray-800 hover:border-gray-500 scale-95 opacity-60"
                                                        }
                                                    `}
                            >
                              {isSelected && (
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-gray-900 rounded-full p-1 border border-cyan-500">
                                  <CheckCircle2
                                    size={12}
                                    className="text-cyan-400"
                                  />
                                </div>
                              )}
                              {choice.text}
                            </button>
                          );
                        })}
                      </div>
                    );
                  }

                  // --- CASE 2: PESAN NORMAL ---
                  const msg = item.data;

                  // Logic Grouping Sequence
                  // Kita perlu melihat data 'asli' sebelumnya untuk spacing, tapi karena sudah di-process,
                  // kita pakai pendekatan visual sederhana saja:
                  const prevItem = processedMessages[index - 1];
                  // Cek apakah item sebelumnya juga 'normal' dan dari speaker yang sama
                  const isSequence =
                    prevItem?.type === "normal" &&
                    prevItem.data.speaker.characterId ===
                      msg.speaker.characterId;

                  const mt = isSequence ? "mt-1" : "mt-6";
                  const isPlayer = msg.speaker.isPlayer;
                  const justify = isPlayer ? "justify-end" : "justify-start";

                  // Style Bubble
                  const bgColor = isPlayer
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-white";
                  const border = isPlayer
                    ? "border border-blue-500"
                    : "border-transparent";

                  const rounded = isPlayer
                    ? isSequence
                      ? "rounded-l-xl rounded-br-xl rounded-tr-sm"
                      : "rounded-l-xl rounded-br-xl rounded-tr-2xl"
                    : isSequence
                      ? "rounded-r-xl rounded-bl-xl rounded-tl-sm"
                      : "rounded-r-xl rounded-bl-xl rounded-tl-2xl";

                  return (
                    <div key={index} className={`flex ${justify} ${mt}`}>
                      <div
                        className={`flex items-end max-w-[85%] lg:max-w-[60%] gap-3 ${isPlayer ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {!isPlayer && (
                          <div className="flex-shrink-0 w-10">
                            {!isSequence && (
                              <img
                                src={
                                  msg.speaker.icon ||
                                  "/assets/icon/chara-avatar.png"
                                }
                                alt="Avatar"
                                className="w-10 h-10 rounded-full object-cover border border-gray-600 bg-gray-800 shadow-md"
                              />
                            )}
                          </div>
                        )}

                        <div
                          className={`flex flex-col ${isPlayer ? "items-end" : "items-start"}`}
                        >
                          {!isPlayer && !isSequence && (
                            <span className="text-xs text-gray-400 ml-1 mb-1 font-bold tracking-wide">
                              {msg.speaker.name}
                            </span>
                          )}

                          <div
                            className={`relative px-4 py-2 shadow-md break-words ${rounded} ${msg.stamp ? "bg-transparent p-0 shadow-none" : bgColor} ${border}`}
                          >
                            {msg.stamp ? (
                              <img
                                src={msg.stamp}
                                alt="Stamp"
                                className="w-32 h-auto object-contain"
                              />
                            ) : msg.image ? (
                              <div className="flex flex-col gap-2">
                                <img
                                  src={msg.image}
                                  alt="Attachment"
                                  className="max-w-60 rounded-lg border border-white/20 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() =>
                                    window.open(msg.image!, "_blank")
                                  }
                                />
                                {msg.text && (
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: parseText(msg.text),
                                    }}
                                  />
                                )}
                              </div>
                            ) : (
                              <div
                                className="text-sm lg:text-base leading-relaxed"
                                dangerouslySetInnerHTML={{
                                  __html: parseText(msg.text),
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="h-10"></div>
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
