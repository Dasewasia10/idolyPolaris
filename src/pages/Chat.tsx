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
  Settings,
  Download,
  FileJson,
  MessageSquare,
  Users,
  Sticker,
} from "lucide-react";

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

const API_BASE_URL = "https://beip.dasewasia.my.id/api";

const ChatPage: React.FC = () => {
  const emojiRef = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [title, setTitle] = useState("Title Here");
  const [titleVisible, setTitleVisible] = useState(true);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null);
  const [position, setPosition] = useState<"left" | "right">("left");

  const [iconGroupVisible, setIconGroupVisible] = useState(true); // Default open
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
    return `https://apiip.dasewasia.my.id/stampChat/stamp_${formattedCharacter}-${formattedExpression}.webp`;
  };

  const getCharacterIconUrl = (characterName: string) => {
    let assetName = characterName.toLowerCase().replace(/\s+/g, "");

    if (characterName.toLowerCase() === "snow") {
      assetName = "smiku";
    }
    return `https://apiip.dasewasia.my.id/iconCharacter/chara-${assetName}.png`;
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

  const handleDeleteCallLog = (id: number) => {
    setCallLogs((prevLogs) => prevLogs.filter((log) => log.id !== id));
    setUnsavedChanges(true);
  };

  const handleClearCallLog = () => {
    if (callLogs.length < 1) {
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

  // -- Component Tombol Control --
  const ControlButton = ({
    onClick,
    label,
    active,
    icon: Icon,
    color,
  }: any) => (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-bold transition-all border
        ${
          active
            ? `bg-${color}-900/40 border-${color}-500 text-${color}-400 shadow-[0_0_10px_rgba(var(--${color}-500),0.2)]`
            : "bg-[#1f2937] border-white/10 text-gray-400 hover:bg-[#374151] hover:text-white"
        }
      `}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 lg:p-8 font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        {/* --- LEFT SIDEBAR: CONTROLS --- */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded text-black shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              <MessageSquare size={20} />
            </div>
            <div>
              <span className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase block">
                Messaging System
              </span>
              <h1 className="text-2xl font-black italic tracking-tighter text-white">
                IDOLY{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  CHAT&nbsp;
                </span>
              </h1>
            </div>
          </div>

          <div className="bg-[#161b22]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg">
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Settings size={12} /> View Settings
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <ControlButton
                onClick={() => setTitleVisible(!titleVisible)}
                label={titleVisible ? "Hide Title" : "Show Title"}
                active={titleVisible}
                icon={titleVisible ? Eye : EyeOff}
                color="blue"
              />
              <ControlButton
                onClick={() => setReplyButtonVisible(!replyButtonVisible)}
                label="Reply Btn"
                active={replyButtonVisible}
                icon={Reply}
                color="green"
              />
              <ControlButton
                onClick={() => setDeleteButtonVisible(!deleteButtonVisible)}
                label="Delete Btn"
                active={deleteButtonVisible}
                icon={Trash2}
                color="red"
              />
              <ControlButton
                onClick={() => setEmojiButtonVisible(!emojiButtonVisible)}
                label="React Btn"
                active={emojiButtonVisible}
                icon={Smile}
                color="yellow"
              />
            </div>
          </div>

          <div className="bg-[#161b22]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg">
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <FileJson size={12} /> Data I/O
            </h2>

            <div className="flex flex-col gap-2">
              <button
                onClick={saveAsPng}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
              >
                <Download size={14} /> EXPORT IMAGE
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExport}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 rounded-lg transition-colors border border-white/5"
                >
                  SAVE JSON
                </button>
                <label className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 rounded-lg transition-colors border border-white/5 text-center cursor-pointer">
                  LOAD JSON
                  <input
                    type="file"
                    accept="application/json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setShowCallLogModal(true)}
              className="w-full bg-purple-900/30 border border-purple-500/30 hover:bg-purple-900/50 text-purple-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Phone size={16} /> OPEN CALL LOGS
            </button>
            <button
              onClick={handleClearMessage}
              className="w-full bg-red-900/30 border border-red-500/30 hover:bg-red-900/50 text-red-300 font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all text-xs"
            >
              <Trash2 size={14} /> RESET CHAT
            </button>
          </div>
        </section>

        {/* --- CENTER: CHAT CANVAS --- */}
        <section className="lg:col-span-2 flex flex-col gap-4 relative">
          {/* Main Monitor Frame */}
          <div className="relative bg-black rounded-xl p-1 shadow-2xl ring-1 ring-white/10">
            {/* Decorative HUD Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-blue-500 rounded-b opacity-50"></div>

            {/* THE CHAT CANVAS (INTERNAL STRUCTURE UNTOUCHED) */}
            <div
              id="idolyMessage"
              className="bg-gray-800 rounded-lg shadow-inner overflow-y-auto h-[500px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900 relative z-10 p-6"
              style={{
                backgroundImage: "url('/assets/chat-bg.png')",
                backgroundRepeat: "repeat",
                backgroundBlendMode: "multiply",
                backgroundSize: "cover",
              }}
            >
              {/* --- START: PROTECTED CONTENT (LOGIC & MAPPING) --- */}
              {titleVisible && (
                <div className="mb-6 relative group animate-in fade-in slide-in-from-top-2 duration-300 bg-gradient-to-b from-gray-900 to-transparent py-3">
                  {/* Decorative Left Bar */}
                  <div className="absolute left-0 top-1 bottom-1 w-1 bg-gray-700 rounded-full group-focus-within:bg-blue-500 group-focus-within:shadow-[0_0_10px_#3b82f6] transition-all duration-300"></div>

                  <div className="pl-4">
                    {/* Label Kecil ala Terminal */}
                    <label className="block text-[10px] font-mono font-bold text-gray-500 tracking-[0.2em] uppercase mb-1 group-focus-within:text-blue-400 transition-colors">
                      Session Subject //
                    </label>

                    {/* Input Field yang menyatu dengan background */}
                    <TextareaAutosize
                      className="w-full bg-transparent text-white text-2xl lg:text-3xl font-black italic tracking-tight placeholder-gray-600 border-b border-transparent focus:border-blue-500/50 focus:outline-none resize-none transition-all leading-tight"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setUnsavedChanges(true);
                      }}
                      placeholder="UNTITLED_SESSION"
                      maxRows={2}
                    />
                  </div>
                </div>
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

                let bubbleClass = msg.stamp
                  ? "p-0 scale-100 bg-transparent shadow-none"
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
                                  onClick={() =>
                                    window.open(msg.image, "_blank")
                                  }
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
                            {" "}
                            <Reply size={14} />{" "}
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
                            {" "}
                            <Smile size={14} />{" "}
                          </button>
                        )}
                        {deleteButtonVisible && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            {" "}
                            <Trash2 size={14} />{" "}
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
              {/* --- END: PROTECTED CONTENT --- */}
            </div>
          </div>

          {/* INPUT TERMINAL (Redesigned) */}
          <div className="bg-[#161b22] p-4 rounded-xl border border-white/10 shadow-lg relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l"></div>

            {replyingTo && (
              <div className="bg-[#0f1115] p-2 rounded mb-3 flex justify-between items-center text-xs border-l-2 border-blue-500">
                <div className="truncate text-gray-400">
                  Replying to{" "}
                  <span className="font-bold text-blue-300">
                    {replyingTo.name}
                  </span>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-gray-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedImage && (
              <div className="relative w-fit mb-3 group">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="h-16 rounded border border-gray-600"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="flex items-end gap-3">
              <div className="relative group">
                <img
                  src={
                    selectedIcon?.src ||
                    `${import.meta.env.BASE_URL}assets/chara-avatar.png`
                  }
                  alt="Selected"
                  className="w-10 h-10 rounded-full border border-white/20 bg-black object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#161b22] rounded-full"></div>
              </div>

              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setUnsavedChanges(true);
                  }}
                  placeholder="Input command or message..."
                  className="w-full p-3 pr-10 rounded-lg border border-white/10 bg-[#0f1115] text-white focus:border-blue-500 focus:outline-none resize-none font-mono text-sm shadow-inner"
                  rows={2}
                />
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute bottom-3 right-3 text-gray-500 hover:text-yellow-400 transition-colors"
                >
                  <Smile size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <div className="flex gap-2 items-center">
                <div className="bg-[#0f1115] p-1 rounded-lg flex border border-white/5">
                  <button
                    onClick={() => setPosition("left")}
                    className={`px-3 py-1 text-[10px] font-bold rounded ${position === "left" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-white"}`}
                  >
                    L
                  </button>
                  <button
                    onClick={() => setPosition("right")}
                    className={`px-3 py-1 text-[10px] font-bold rounded ${position === "right" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-white"}`}
                  >
                    R
                  </button>
                </div>

                <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-green-400 transition"
                  title="Image"
                >
                  {" "}
                  <ImageIcon size={16} />{" "}
                </button>
                <button
                  onClick={handleAddVoiceNote}
                  className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-pink-400 transition"
                  title="Voice"
                >
                  {" "}
                  <Mic size={16} />{" "}
                </button>
                <button
                  onClick={handleAddCallObject}
                  className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-blue-400 transition"
                  title="Call"
                >
                  {" "}
                  <CallIcon color="currentColor" size={16} />{" "}
                </button>
              </div>

              <button
                onClick={() => handleSendMessage()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                SEND
              </button>
            </div>

            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50 shadow-2xl rounded-xl overflow-hidden border border-white/20">
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

        {/* --- RIGHT SIDEBAR: ASSETS --- */}
        <section className="flex flex-col gap-4 h-[calc(100vh-100px)] lg:sticky lg:top-4">
          {/* Character Selector */}
          <div
            className={`bg-[#161b22]/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${iconGroupVisible ? "flex-1" : "h-auto"}`}
          >
            <button
              className="w-full bg-[#0d1117] hover:bg-[#1f2937] text-gray-300 px-4 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-between border-b border-white/5 transition-colors"
              onClick={() => setIconGroupVisible(!iconGroupVisible)}
            >
              <div className="flex items-center gap-2">
                <Users size={14} className="text-blue-400" /> Characters
              </div>
              <span>{iconGroupVisible ? "−" : "+"}</span>
            </button>

            {iconGroupVisible && (
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <div className="grid grid-cols-4 gap-2">
                  {icons.map((icon) => (
                    <button
                      key={icon.id}
                      onClick={() => {
                        setSelectedIcon(icon);
                        setUnsavedChanges(true);
                      }}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative group ${
                        selectedIcon?.id === icon.id
                          ? "border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                          : "border-transparent hover:border-white/20"
                      }`}
                      title={icon.name}
                    >
                      <img
                        src={icon.src}
                        alt={icon.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-white/10 transition-colors"></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stamp Selector */}
          <div
            className={`bg-[#161b22]/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${stampGroupVisible ? "flex-1" : "h-auto"}`}
          >
            <button
              className="w-full bg-[#0d1117] hover:bg-[#1f2937] text-gray-300 px-4 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-between border-b border-white/5 transition-colors"
              onClick={() => setStampGroupVisible(!stampGroupVisible)}
            >
              <div className="flex items-center gap-2">
                <Sticker size={14} className="text-pink-400" /> Stamps
              </div>
              <span>{stampGroupVisible ? "−" : "+"}</span>
            </button>

            {stampGroupVisible && (
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <div className="grid grid-cols-3 gap-2">
                  {stamps.map((stamp) => (
                    <button
                      key={stamp.id}
                      onClick={() => {
                        handleStampClick(stamp);
                        handleSendMessage(true);
                      }}
                      className="aspect-square bg-[#0f1115] rounded-lg p-1 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all flex items-center justify-center"
                    >
                      <img
                        src={stamp.src}
                        alt="stamp"
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          isSuccess={isSuccess}
          onClose={() => setToastMessage("")}
        />
      )}

      <CallLogModal
        isOpen={showCallLogModal}
        onClose={() => setShowCallLogModal(false)}
        callLogs={callLogs}
        selectedIcon={selectedIcon}
        icons={icons}
        addCallLog={handleAddCallLog}
        clearCallLog={handleClearCallLog}
        onDeleteLog={handleDeleteCallLog}
      />
    </div>
  );
};

export default ChatPage;
