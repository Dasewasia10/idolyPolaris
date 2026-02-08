import React, { useState, useEffect, useRef } from "react";
import { saveAs } from "file-saver";
import domtoimage from "dom-to-image";
import axios from "axios";
import TextareaAutosize from "react-textarea-autosize";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import {
  Smile,
  Image as ImageIcon,
  Mic,
  Play,
  X,
  Trash2,
  Reply,
  Eye,
  EyeOff,
  Phone,
} from "lucide-react"; // Tambah icon Eye, EyeOff, Phone

import { Message } from "../interfaces/Message";
import { Icon } from "../interfaces/Icon";
import { Stamp } from "../interfaces/Stamp";
import { Character } from "../interfaces/Character";
import { CallLog } from "../interfaces/CallLog";

import CallIcon from "../components/CallIcon";
import CallLogModal from "../components/CallLogModal";
import Toast from "../components/Toast";

import exportToJson from "../utils/exportToJson";
import importFromJson from "../utils/importFromJson";

const API_BASE_URL = "https://diveidolypapi.my.id/api";

const ChatPage: React.FC = () => {
  const emojiRef = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [title, setTitle] = useState("Title Here");
  // STATE BARU: Toggle Judul
  const [titleVisible, setTitleVisible] = useState(true);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null);
  const [position, setPosition] = useState<"left" | "right">("left");

  const [iconGroupVisible, setIconGroupVisible] = useState(false);
  const [stampGroupVisible, setStampGroupVisible] = useState(false);
  const [deleteButtonVisible, setDeleteButtonVisible] = useState(false);
  const [replyButtonVisible, setReplyButtonVisible] = useState(false);
  const [emojiButtonVisible, setEmojiButtonVisible] = useState(false);

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [icons, setIcons] = useState<Icon[]>([]);
  const [, setLoading] = useState(true);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [showCallLogModal, setShowCallLogModal] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(
    null,
  );

  // --- Helper Functions ---
  const parseText = (text: string) => {
    const bold = /(?<!\*)\*\*(.+?)\*\*(?!\*)/g;
    const italic = /(?<!\*)\*(.+?)\*(?!\*)/g;
    const underline = /__(.+?)__/g;
    return text
      .replace(bold, "<b>$1</b>")
      .replace(italic, "<i>$1</i>")
      .replace(underline, "<u>$1</u>");
  };

  const getStampUrl = (character: string, expression: string) => {
    const formattedCharacter = character.toLowerCase().replace(/\s+/g, "");
    const formattedExpression = expression.toLowerCase().replace(/\s+/g, "");
    return `https://api.diveidolypapi.my.id/stampChat/stamp_${formattedCharacter}-${formattedExpression}.webp`;
  };

  const getCharacterIconUrl = (characterName: string) => {
    const formattedName = characterName.toLowerCase().replace(/\s+/g, "");
    return `https://api.diveidolypapi.my.id/iconCharacter/chara-${formattedName}.png`;
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stampsRes, charactersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/stamps`),
          axios.get(`${API_BASE_URL}/characters`),
        ]);

        const processedStamps = stampsRes.data.map((stamp: Stamp) => ({
          ...stamp,
          src: getStampUrl(stamp.character, stamp.expression),
        }));

        const sortedCharacters = charactersRes.data.sort(
          (a: Character, b: Character) => a.name.localeCompare(b.name),
        );

        const processedIcons = sortedCharacters.map(
          (character: Character, index: number) => ({
            id: index + 1,
            name: character.name,
            src: getCharacterIconUrl(character.name),
          }),
        );

        setStamps(processedStamps);
        setIcons(processedIcons);
      } catch (error) {
        console.error("Error fetching data:", error);
        setToastMessage("Failed to load data");
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    document.title = "Polaris Idoly | Idoly Chat";
    return () => {
      document.title = "Polaris Idoly";
    };
  }, []);

  // --- Handlers ---
  const stampRef = useRef<Stamp | null>(null);
  const handleStampClick = (stamp: Stamp) => {
    stampRef.current = stamp;
    setSelectedStamp(stamp);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleReplyClick = (message: Message) => {
    setReplyingTo(message);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setToastMessage("Image too large! Max 1MB.");
        setIsSuccess(false);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddVoiceNote = () => {
    if (!selectedIcon) {
      setToastMessage("Please select a character icon first");
      setIsSuccess(false);
      return;
    }
    const seconds = Math.floor(Math.random() * 55) + 5;
    const duration = `0:${seconds.toString().padStart(2, "0")}`;
    const newMessage: Message = {
      id: Date.now(),
      text: "",
      name: selectedIcon.name,
      icon: selectedIcon.src,
      position,
      isVoiceNote: true,
      voiceDuration: duration,
    };
    setMessages([...messages, newMessage]);
    setUnsavedChanges(true);
  };

  // --- Call Log Handlers ---
  const handleAddCallLog = () => {
    if (!selectedIcon || icons.length < 2) {
      setToastMessage(
        "Need to choose atleast one character to create call log",
      );
      setIsSuccess(false);
      return;
    }
    const availableReceivers = icons.filter(
      (icon) => icon.id !== selectedIcon.id,
    );
    if (availableReceivers.length === 0) {
      setToastMessage("No available receivers");
      setIsSuccess(false);
      return;
    }
    const receiver =
      availableReceivers[Math.floor(Math.random() * availableReceivers.length)];
    const newCallLog: CallLog = {
      id: Date.now(),
      caller: selectedIcon,
      receiver,
      duration: `${Math.floor(Math.random() * 5) + 1}:${Math.floor(
        Math.random() * 60,
      )
        .toString()
        .padStart(2, "0")}`,
      timestamp: new Date().toISOString(),
    };
    setCallLogs([newCallLog, ...callLogs]);
    setToastMessage("Call log added!");
    setIsSuccess(true);
    setUnsavedChanges(true);
  };

  // LOGIC HAPUS SATU LOG (Penting untuk perbaikanmu)
  const handleDeleteCallLog = (id: number) => {
    setCallLogs((prevLogs) => prevLogs.filter((log) => log.id !== id));
    setUnsavedChanges(true);
  };

  const handleClearCallLog = () => {
    if (callLogs.length < 1) {
      // Ubah < 2 jadi < 1 agar bisa hapus meski cuma 1
      setToastMessage("There's no call logs!");
      setIsSuccess(false);
      return;
    }
    setCallLogs([]);
    setToastMessage("Call logs cleared!");
    setIsSuccess(true);
  };

  const handleSendMessage = (isStamp = false) => {
    if (!selectedIcon) {
      setToastMessage("Please select a character icon first");
      setIsSuccess(false);
      return;
    }
    if (!inputText.trim() && !isStamp && !selectedImage) {
      return;
    }
    const effectiveStamp = isStamp ? selectedStamp || stampRef.current : null;
    const newMessage: Message = {
      id: Date.now(),
      text: isStamp ? "" : inputText,
      name: selectedIcon.name,
      icon: selectedIcon.src,
      position,
      stamp: isStamp ? effectiveStamp?.src : undefined,
      image: selectedImage || undefined,
      replyTo: replyingTo
        ? { id: replyingTo.id, text: replyingTo.text, name: replyingTo.name }
        : undefined,
    };
    setMessages([...messages, newMessage]);
    setInputText("");
    setSelectedImage(null);
    setReplyingTo(null);
    setUnsavedChanges(true);
    if (isStamp) setSelectedStamp(null);
  };

  const handleDeleteMessage = (id: number) => {
    setMessages(messages.filter((msg) => msg.id !== id));
    setUnsavedChanges(true);
  };

  const handleClearMessage = () => {
    if (messages.length > 0) {
      if (window.confirm("Are you sure you want to clear all messages?")) {
        setMessages([]);
        setTitle("Title Here");
        setToastMessage("All messages have been cleared");
        setIsSuccess(true);
        setUnsavedChanges(true);
      }
    } else {
      setToastMessage("No messages to clear");
      setIsSuccess(false);
    }
  };

  const handleAddCallObject = () => {
    if (!selectedIcon) {
      setToastMessage("Please select a character icon first");
      setIsSuccess(false);
      return;
    }
    const getRandomDuration = () => {
      const minutes = Math.floor(Math.random() * 5) + 1;
      const seconds = Math.floor(Math.random() * 60);
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };
    const newMessage: Message = {
      id: Date.now(),
      text: "",
      name: selectedIcon.name,
      icon: selectedIcon.src,
      position,
      isCall: true,
      callDuration: getRandomDuration(),
      callBgColor: "#3B82F6",
      callIconColor: "#FFFFFF",
    };
    setMessages([...messages, newMessage]);
    setUnsavedChanges(true);
  };

  const handleAddReaction = (messageId: number, emojiData: EmojiClickData) => {
    setMessages(
      messages.map((msg) => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || {};
          const emoji = emojiData.emoji;
          if (reactions[emoji]) {
            if (!reactions[emoji].includes(selectedIcon?.name || "")) {
              reactions[emoji] = [
                ...reactions[emoji],
                selectedIcon?.name || "",
              ];
            }
          } else {
            reactions[emoji] = [selectedIcon?.name || ""];
          }
          return { ...msg, reactions };
        }
        return msg;
      }),
    );
    setShowReactionPicker(null);
    setUnsavedChanges(true);
  };

  const handleRemoveReaction = (messageId: number, emoji: string) => {
    setMessages(
      messages.map((msg) => {
        if (msg.id === messageId && msg.reactions?.[emoji]) {
          const newReactions = { ...msg.reactions };
          const filteredUsers = newReactions[emoji].filter(
            (user) => user !== (selectedIcon?.name || ""),
          );
          if (filteredUsers.length === 0) {
            delete newReactions[emoji];
          } else {
            newReactions[emoji] = filteredUsers;
          }
          return {
            ...msg,
            reactions: Object.keys(newReactions).length
              ? newReactions
              : undefined,
          };
        }
        return msg;
      }),
    );
    setUnsavedChanges(true);
  };

  const saveAsPng = async () => {
    const element = document.getElementById("idolyMessage");
    if (!element) return;
    const originalStyle = {
      height: element.style.height,
      overflow: element.style.overflow,
    };
    try {
      element.style.height = "auto";
      element.style.overflow = "visible";
      const blob = await domtoimage.toBlob(element, {
        quality: 1,
        cacheBust: true,
        style: { transform: "none" },
        filter: (_node: any) => true,
        imagePlaceholder:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      });
      if (blob) {
        saveAs(blob, `conversation_${title}.png`);
        setToastMessage("Image saved successfully!");
        setIsSuccess(true);
        setUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setToastMessage("Failed to save image");
      setIsSuccess(false);
    } finally {
      element.style.height = originalStyle.height;
      element.style.overflow = originalStyle.overflow;
    }
  };

  const handleExport = () => {
    exportToJson(title, messages);
    setUnsavedChanges(false);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importFromJson(
        file,
        setTitle,
        setMessages,
        setToastMessage,
        setIsSuccess,
      );
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        event.preventDefault();
        event.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [unsavedChanges]);

  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (
        (emojiRef.current as unknown as HTMLElement) &&
        !(emojiRef.current as unknown as HTMLElement).contains(event.target)
      ) {
        setIsEmojiOpen(false);
      }
    };
    if (isEmojiOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEmojiOpen]);

  return (
    <div className="bg-gray-900 text-white px-4 py-6 z-10 rounded-lg mt-10 lg:mt-0">
      <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Menu Controls */}
        <section className="space-y-6 flex flex-col text-xs lg:text-base">
          <div className="flex flex-col justify-around gap-4">
            <div className="flex gap-4 justify-around flex-col">
              {/* BUTTONS GROUP: Actions */}
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md w-full"
                onClick={handleClearMessage}
              >
                Clear Message
              </button>

              <div className="flex border-b border-slate-500 mx-2"></div>

              {/* Toggle Judul (BARU) */}
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md w-full flex items-center justify-center gap-2"
                onClick={() => setTitleVisible(!titleVisible)}
              >
                {titleVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                {titleVisible ? "Hide Title" : "Show Title"}
              </button>

              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md w-full"
                onClick={() => setReplyButtonVisible(!replyButtonVisible)}
              >
                {replyButtonVisible ? "Hide Reply" : "Show Reply"}
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md w-full"
                onClick={() => setDeleteButtonVisible(!deleteButtonVisible)}
              >
                {deleteButtonVisible ? "Hide Delete" : "Show Delete"}
              </button>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md w-full"
                onClick={() => setEmojiButtonVisible(!emojiButtonVisible)}
              >
                {emojiButtonVisible ? "Hide Emoji Action" : "Show Emoji Action"}
              </button>

              <div className="flex border-b border-slate-500 mx-2"></div>

              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md w-full"
                onClick={saveAsPng}
              >
                Save PNG
              </button>
            </div>

            <div className="flex gap-4 flex-col lg:flex-row">
              <button
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md w-full"
                onClick={handleExport}
              >
                Export JSON
              </button>
              <label className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md w-full text-center cursor-pointer">
                Import JSON
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex border-b border-slate-500 mx-2"></div>
            
            <button
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md w-full flex items-center justify-center gap-2"
              onClick={() => setShowCallLogModal(true)}
            >
              <Phone size={16} />
              Call History
            </button>
          </div>
        </section>

        {/* Center - Chat Canvas */}
        <section className="lg:col-span-2 overflow-y-auto no-scrollbar">
          <div
            id="idolyMessage"
            className="bg-gray-800 rounded-lg shadow-xl p-6 overflow-y-auto h-[22rem] scrollbar-minimal z-[9999] bg-[url('/assets/chat-bg.png')] bg-repeat bg-blend-multiply bg-cover"
          >
            {/* Conditional Rendering Title */}
            {titleVisible && (
              <h2>
                <TextareaAutosize
                  className="w-full bg-gray-900 text-white text-lg lg:text-2xl font-bold p-3 mb-4 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setUnsavedChanges(true);
                  }}
                  placeholder="Chat Title"
                />
              </h2>
            )}

            {messages.map((msg, index) => {
              const isSequence =
                index > 0 && messages[index - 1].name === msg.name;
              const containerMargin = isSequence ? "mt-1" : "mt-6";
              const showName = !isSequence;

              const bubbleRadius =
                msg.position === "left"
                  ? isSequence
                    ? "rounded-tl-md rounded-tr-2xl rounded-br-2xl rounded-bl-md"
                    : "rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-none"
                  : isSequence
                    ? "rounded-tr-md rounded-tl-2xl rounded-bl-2xl rounded-br-md"
                    : "rounded-tr-2xl rounded-tl-2xl rounded-bl-2xl rounded-br-none";

              // Warna dan style dasar bubble
              let bubbleClass = msg.stamp
                ? // --- PERBAIKAN STAMP ---
                  // Hapus '-m-4'. Ubah scale jadi 'scale-100' atau hapus saja.
                  // Gunakan 'p-0' agar gambar pas di container, dan 'bg-transparent'.
                  "p-0 scale-100 bg-transparent shadow-none"
                : msg.position === "left"
                  ? "bg-gray-700 text-white"
                  : "bg-blue-600 text-white";

              if (!msg.stamp) {
                bubbleClass += ` ${bubbleRadius} px-4 py-2`;
              }

              return (
                <div
                  key={msg.id}
                  className={`flex text-sm lg:text-base ${containerMargin} ${msg.position === "left" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`flex items-end max-w-xs lg:max-w-md gap-2 ${msg.position === "right" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className="flex-shrink-0 w-10">
                      {!isSequence && (
                        <img
                          src={msg.icon}
                          alt={msg.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                    </div>

                    <div
                      className={`flex flex-col ${msg.position === "left" ? "items-start" : "items-end"}`}
                    >
                      {showName && (
                        <span
                          className={`text-xs text-gray-400 mb-1 ml-1 ${msg.position === "right" ? "text-right mr-1" : "text-left"}`}
                        >
                          {msg.name}
                        </span>
                      )}

                      {msg.replyTo && (
                        <div
                          className={`text-xs text-gray-300 bg-gray-600 bg-opacity-50 p-2 rounded-md mb-1 border-l-2 border-blue-400 w-fit max-w-full`}
                        >
                          <span className="font-bold opacity-75">
                            {msg.replyTo.name}
                          </span>
                          <div className="truncate opacity-75">
                            {msg.replyTo.text || "Media/Stamp"}
                          </div>
                        </div>
                      )}

                      <div
                        className={`relative ${bubbleClass} max-w-[16rem] lg:max-w-[20rem] break-words shadow-sm`}
                      >
                        {msg.isCall ? (
                          <div className="flex flex-col items-center min-w-[100px]">
                            <CallIcon
                              color={msg.callIconColor || "white"}
                              size={24}
                            />
                            <span className="text-sm mt-1 font-semibold">
                              Call Ended
                            </span>
                            <span className="text-xs opacity-80">
                              {msg.callDuration}
                            </span>
                          </div>
                        ) : msg.isVoiceNote ? (
                          <div className="flex items-center gap-3 min-w-[160px] py-1">
                            <div className="bg-white text-blue-600 rounded-full p-2 flex items-center justify-center">
                              <Play size={16} fill="currentColor" />
                            </div>
                            <div className="flex flex-col flex-1 justify-center gap-1">
                              <div className="h-1 bg-white/50 rounded-full w-full overflow-hidden">
                                <div className="h-full bg-white w-2/3 rounded-full"></div>
                              </div>
                              <span className="text-xs font-mono opacity-90">
                                {msg.voiceDuration || "0:00"}
                              </span>
                            </div>
                          </div>
                        ) : msg.stamp ? (
                          <img
                            src={msg.stamp}
                            alt="Stamp"
                            className="w-24 h-24 object-contain"
                          />
                        ) : (
                          <div className="flex flex-col gap-2">
                            {msg.image && (
                              <img
                                src={msg.image}
                                alt="Uploaded"
                                className="rounded-lg max-h-60 object-cover w-full cursor-pointer"
                                onClick={() => window.open(msg.image, "_blank")}
                              />
                            )}
                            {msg.text && (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: parseText(msg.text),
                                }}
                                className="prose prose-invert prose-p:my-0 leading-snug"
                              />
                            )}
                          </div>
                        )}

                        {msg.reactions &&
                          Object.keys(msg.reactions).length > 0 && (
                            <div
                              className={`absolute -bottom-3 ${msg.position === "left" ? "left-2" : "right-2"} flex gap-1`}
                            >
                              {Object.entries(msg.reactions).map(
                                ([emoji, users]) => (
                                  <div
                                    key={emoji}
                                    onClick={() =>
                                      handleRemoveReaction(msg.id, emoji)
                                    }
                                    className="bg-gray-700 border border-gray-600 rounded-full px-1.5 py-0.5 text-[10px] flex items-center cursor-pointer hover:bg-gray-600 shadow-sm"
                                  >
                                    <span>{emoji}</span>
                                    {users.length > 1 && (
                                      <span className="ml-1 font-bold">
                                        {users.length}
                                      </span>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-end gap-1 mb-2">
                      {replyButtonVisible && (
                        <button
                          onClick={() => handleReplyClick(msg)}
                          className="text-gray-500 hover:text-blue-400 transition-colors"
                          title="Reply"
                        >
                          <Reply size={14} />
                        </button>
                      )}
                      {emojiButtonVisible && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowReactionPicker(
                              showReactionPicker === msg.id ? null : msg.id,
                            );
                          }}
                          className="text-gray-500 hover:text-yellow-400 transition-colors"
                          title="React"
                        >
                          <Smile size={14} />
                        </button>
                      )}
                      {deleteButtonVisible && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    {showReactionPicker === msg.id && (
                      <div className="absolute z-50 mt-8">
                        <EmojiPicker
                          onEmojiClick={(e) => handleAddReaction(msg.id, e)}
                          width={250}
                          height={300}
                          searchDisabled
                          skinTonesDisabled
                          previewConfig={{ showPreview: false }}
                        />
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowReactionPicker(null)}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow-xl mt-4">
            {replyingTo && (
              <div className="bg-gray-700 p-2 rounded mb-2 flex justify-between items-center text-sm border-l-4 border-blue-500">
                <div className="truncate">
                  <span className="font-bold text-blue-300">
                    {replyingTo.name}
                  </span>
                  : {replyingTo.text || "Media"}
                </div>
                <button onClick={() => setReplyingTo(null)}>
                  <X size={16} />
                </button>
              </div>
            )}

            {selectedImage && (
              <div className="relative w-fit mb-2 group">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="h-24 rounded-lg border border-gray-600"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="flex items-end space-x-2 mb-2">
              <img
                src={
                  selectedIcon?.src ||
                  `${import.meta.env.BASE_URL}assets/icon/chara-avatar.png`
                }
                alt="Selected"
                className="w-10 h-10 rounded-full border border-gray-600 bg-gray-900"
              />

              <div className="flex-1 flex flex-col gap-2 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setUnsavedChanges(true);
                  }}
                  placeholder="Type a message..."
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-1 focus:ring-blue-500 resize-none scrollbar-minimal"
                  rows={2}
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    <Smile size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-700 pt-3">
              <div className="flex gap-1">
                <div className="bg-gray-700 rounded-lg p-1 flex">
                  <button
                    onClick={() => setPosition("left")}
                    className={`px-3 py-1 text-xs rounded ${position === "left" ? "bg-gray-600 text-white font-bold shadow" : "text-gray-400 hover:text-white"}`}
                  >
                    Left
                  </button>
                  <button
                    onClick={() => setPosition("right")}
                    className={`px-3 py-1 text-xs rounded ${position === "right" ? "bg-blue-600 text-white font-bold shadow" : "text-gray-400 hover:text-white"}`}
                  >
                    Right
                  </button>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-green-400 bg-gray-700 hover:bg-gray-600 rounded-full transition-all"
                    title="Upload Image"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <button
                    onClick={handleAddVoiceNote}
                    className="p-2 text-gray-400 hover:text-pink-400 bg-gray-700 hover:bg-gray-600 rounded-full transition-all"
                    title="Add Voice Note"
                  >
                    <Mic size={18} />
                  </button>
                  <button
                    onClick={handleAddCallObject}
                    className="p-2 text-gray-400 hover:text-blue-400 bg-gray-700 hover:bg-gray-600 rounded-full transition-all"
                    title="Add Call"
                  >
                    <CallIcon color="currentColor" size={18} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleSendMessage()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg transform active:scale-95 transition-all"
              >
                Send
              </button>
            </div>

            {showEmojiPicker && (
              <div
                className="absolute bottom-20 right-4 z-50 shadow-2xl rounded-xl overflow-hidden"
                ref={emojiRef}
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={300}
                  height={400}
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
          </div>
        </section>

        {/* Right Sidebar - Selection */}
        <section className="flex flex-col gap-4">
          <div className="bg-gray-800 p-4 rounded-lg flex-1 overflow-hidden flex flex-col">
            <button
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md mb-4 font-semibold"
              onClick={() => setIconGroupVisible(!iconGroupVisible)}
            >
              {iconGroupVisible ? "▲ Hide Characters" : "▼ Show Characters"}
            </button>
            {iconGroupVisible && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-h-44 overflow-y-auto scrollbar-minimal py-2">
                {icons.map((icon) => (
                  <button
                    key={icon.id}
                    onClick={() => {
                      setSelectedIcon(icon);
                      setUnsavedChanges(true);
                    }}
                    className={`p-1 rounded-full transition-all ${
                      selectedIcon?.id === icon.id
                        ? "ring-2 ring-blue-500 transform scale-105"
                        : "hover:ring-1 hover:ring-gray-400"
                    }`}
                  >
                    <img
                      src={icon.src}
                      alt={icon.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800 p-4 rounded-lg flex-1 overflow-hidden flex flex-col">
            <button
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md mb-4 font-semibold"
              onClick={() => setStampGroupVisible(!stampGroupVisible)}
            >
              {stampGroupVisible ? "▲ Hide Stamps" : "▼ Show Stamps"}
            </button>
            {stampGroupVisible && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-h-44 overflow-y-auto scrollbar-minimal">
                {stamps.map((stamp) => (
                  <button
                    key={stamp.id}
                    onClick={() => {
                      handleStampClick(stamp);
                      handleSendMessage(true);
                    }}
                    className="aspect-square bg-gray-700 rounded p-1 hover:bg-gray-600 transition-colors"
                  >
                    <img
                      src={stamp.src}
                      alt="stamp"
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tombol Call History dihapus dari sini karena sudah pindah ke kiri */}
        </section>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          isSuccess={isSuccess}
          onClose={() => setToastMessage("")}
        />
      )}

      {/* UPDATE MODAL PROPS: Pastikan CallLogModal support onDeleteLog */}
      <CallLogModal
        isOpen={showCallLogModal}
        onClose={() => setShowCallLogModal(false)}
        callLogs={callLogs}
        selectedIcon={selectedIcon}
        icons={icons}
        addCallLog={handleAddCallLog}
        clearCallLog={handleClearCallLog}
        onDeleteLog={handleDeleteCallLog} // <--- PASTIKAN PROPS INI DITERIMA DI CallLogModal
      />
    </div>
  );
};

export default ChatPage;
