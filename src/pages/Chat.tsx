import React, { useState, useEffect, useRef } from "react";
import { saveAs } from "file-saver";
import domtoimage from "dom-to-image";
import axios from "axios";
import TextareaAutosize from "react-textarea-autosize";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Smile } from "lucide-react"; // atau icon smile dari library lain

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [title, setTitle] = useState("Title Here");
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
    null
  );

  // Helper functions
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

  // Data fetching
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
          (a: Character, b: Character) => a.name.localeCompare(b.name)
        );

        const processedIcons = sortedCharacters.map(
          (character: Character, index: number) => ({
            id: index + 1,
            name: character.name,
            src: getCharacterIconUrl(character.name),
          })
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

  const handleAddCallLog = () => {
    if (!selectedIcon || icons.length < 2) {
      setToastMessage("Need to choose atleast one character to create call log");
      setIsSuccess(false);
      return;
    }

    const availableReceivers = icons.filter(
      (icon) => icon.id !== selectedIcon.id
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
        Math.random() * 60
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

  const handleClearCallLog = () => {
    if (callLogs.length < 2) {
      setToastMessage("There's no call logs!");
      setIsSuccess(false);
      return;
    }

    setCallLogs([]);
  };

  const handleSendMessage = (isStamp = false) => {
    if (!selectedIcon) {
      setToastMessage("Please select a character icon first");
      setIsSuccess(false);
      return;
    }

    // Gunakan ref sebagai fallback
    const effectiveStamp = isStamp ? selectedStamp || stampRef.current : null;

    const newMessage: Message = {
      id: Date.now(),
      text: isStamp ? "" : inputText,
      name: selectedIcon.name,
      icon: selectedIcon.src,
      position,
      stamp: isStamp ? effectiveStamp?.src : undefined,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.text,
            name: replyingTo.name,
          }
        : undefined,
    };

    setMessages([...messages, newMessage]);
    setInputText("");
    setReplyingTo(null);
    setUnsavedChanges(true);

    if (isStamp) {
      setSelectedStamp(null);
    }
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
        setUnsavedChanges(true); // Mark as changed karena kita mengosongkan pesan
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
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    };

    const newMessage: Message = {
      id: Date.now(),
      text: "",
      name: selectedIcon.name,
      icon: selectedIcon.src,
      position,
      isCall: true,
      callDuration: getRandomDuration(),
      callBgColor: "#3B82F6", // Warna default (blue-500)
      callIconColor: "#FFFFFF", // Warna default (putih)
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

          // Jika sudah ada reaction dengan emoji ini, tambahkan user
          // Di sini saya menggunakan nama user sebagai contoh, bisa diganti dengan ID user
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
      })
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
            (user) => user !== (selectedIcon?.name || "")
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
      })
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

      // Gunakan dom-to-image
      const blob = await domtoimage.toBlob(element, {
        quality: 1,
        cacheBust: true,
        style: {
          transform: "none", // Handle transform issues
        },
        filter: (_node: any) => {
          // Handle filter jika diperlukan
          return true;
        },
        imagePlaceholder:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", // Placeholder untuk gambar error
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
        setIsSuccess
      );
    }
  };

  // Before unload effect
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        event.preventDefault();
        event.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEmojiOpen]);

  return (
    <div className="bg-gray-900 text-white px-4 py-6 z-10 rounded-lg mt-10 lg:mt-0">
      <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - Controls */}
        <section className="space-y-6 flex flex-col text-xs lg:text-base">
          <div className="flex flex-col justify-around gap-4">
            <div className="flex gap-4 justify-around flex-col">
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md w-full text-center h-full"
                onClick={handleClearMessage}
              >
                Clear Message
              </button>
              <div className="flex border-b border-slate-500 mx-2"></div>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md w-full text-center h-full"
                onClick={() => setReplyButtonVisible(!replyButtonVisible)}
              >
                {replyButtonVisible ? "Hide Reply" : "Show Reply"}
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md w-full text-center h-full"
                onClick={() => setDeleteButtonVisible(!deleteButtonVisible)}
              >
                {deleteButtonVisible ? "Hide Delete" : "Show Delete"}
              </button>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md w-full text-center h-full"
                onClick={() => setEmojiButtonVisible(!emojiButtonVisible)}
              >
                {emojiButtonVisible
                  ? "Hide Emoji in Message"
                  : "Show Emoji in Message"}
              </button>
              <div className="flex border-b border-slate-500 mx-2"></div>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md w-full text-center h-full"
                onClick={saveAsPng}
              >
                Save PNG
              </button>
            </div>

            <div className="flex gap-4 flex-col lg:flex-row">
              <button
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md w-full text-center"
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
          </div>
        </section>

        {/* Main content - Chat area */}
        <section className="lg:col-span-2 overflow-y-auto no-scrollbar">
          <div
            id="idolyMessage"
            className={`bg-gray-800 rounded-lg shadow-xl p-6 overflow-y-auto h-[22rem] scrollbar-minimal z-[9999] bg-[url('/assets/chat-bg.png')] bg-repeat bg-blend-multiply bg-cover`}
          >
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

            {messages.map((msg, index) => {
              const isFirst =
                index === 0 || messages[index - 1].name !== msg.name;
              const isLast =
                index === messages.length - 1 ||
                messages[index + 1].name !== msg.name;
              const isMiddle = !isFirst && !isLast;
              const bubbleClass = msg.stamp
                ? "-m-4 scale-125"
                : msg.position === "left"
                ? "bg-gray-700 text-white"
                : "bg-blue-600 text-white";

              return (
                <div
                  key={msg.id}
                  className={`flex text-sm lg:text-base ${
                    msg.position === "left" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`flex items-start max-w-xs lg:max-w-md space-x-2 ${
                      msg.position === "right"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    <section
                      className={`flex items-center ${
                        msg.position === "right"
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      }`}
                    >
                      <div>
                        <img
                          src={msg.icon}
                          alt={msg.name}
                          className={`w-12 h-12 rounded-full ${
                            isFirst ? "" : "opacity-0"
                          }`}
                        />
                      </div>
                      <div
                        className={`flex flex-col ${
                          msg.position === "left" ? "ml-3" : "mr-3"
                        }`}
                      >
                        {/* Reply indicator */}
                        {msg.replyTo && (
                          <div
                            className={`text-xs text-gray-400 mb-1 flex items-center w-24 lg:w-48 ${
                              msg.position === "right"
                                ? "justify-end"
                                : "justify-start"
                            } ${index === 0 ? "" : "mt-2"}`}
                          >
                            <span className="mr-1 mt-1">
                              ↩ Replying to {msg.replyTo.name}
                            </span>
                            <div className="max-w-xs truncate">
                              "{msg.replyTo.text}"
                            </div>
                          </div>
                        )}
                        {/* Span nama hanya muncul jika isFirst */}
                        {isFirst && (
                          <span
                            className={`text-xs text-gray-400 mb-1 ${
                              msg.position === "right"
                                ? "text-right"
                                : "text-left"
                            } ${index === 0 ? "" : "mt-3"} ${
                              msg.reactions ? "mb-2" : ""
                            } ${msg.replyTo ? "-mt-[0.01rem]" : ""}`}
                          >
                            {msg.name}
                          </span>
                        )}

                        <div
                          className={`relative flex justify-start px-3 py-2 ${bubbleClass} ${
                            msg.position === "left"
                              ? isFirst
                                ? "rounded-br-lg rounded-t-lg"
                                : isMiddle
                                ? "rounded-r-lg"
                                : "rounded-tr-lg rounded-b-lg"
                              : isFirst
                              ? "text-white rounded-bl-lg rounded-t-lg"
                              : isMiddle
                              ? "text-white rounded-l-lg"
                              : "text-white rounded-tl-lg rounded-b-lg"
                          } max-w-[14rem] break-words`}
                        >
                          <div className={`relative`}>
                            {msg.isCall ? (
                              <div className="flex flex-col items-center text-white px-3 py-2">
                                <CallIcon
                                  color={msg.callIconColor || "white"}
                                  size={24}
                                />
                                <span className="text-sm mt-2">
                                  {msg.callDuration || "00:00"}
                                </span>
                              </div>
                            ) : msg.stamp ? (
                              <img
                                src={msg.stamp}
                                alt="Stamp"
                                className="w-24 h-24 object-contain"
                              />
                            ) : (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: parseText(msg.text),
                                }}
                                className="prose prose-invert"
                              />
                            )}
                          </div>

                          {/* Menampilkan reactions yang sudah ada */}
                          {msg.reactions &&
                            Object.entries(msg.reactions).map(
                              ([emoji, users]) => (
                                <div
                                  key={emoji}
                                  className="absolute -bottom-2 left-0 bg-gray-600 rounded-full px-2 py-0.5 text-xs flex items-center cursor-pointer"
                                  title={users.join(", ")}
                                  onClick={() =>
                                    handleRemoveReaction(msg.id, emoji)
                                  }
                                >
                                  <span>{emoji}</span>
                                  {users.length > 1 && (
                                    <span className="ml-1">{users.length}</span>
                                  )}
                                </div>
                              )
                            )}
                        </div>
                      </div>
                    </section>

                    <div className="flex flex-col -translate-x-1">
                      {emojiButtonVisible && (
                        <div className="flex items-center mt-1 space-x-1">
                          {/* Tombol untuk menambahkan reaction */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowReactionPicker(
                                showReactionPicker === msg.id ? null : msg.id
                              );
                            }}
                            className="text-gray-400 hover:text-gray-300 text-xs"
                          >
                            <Smile size={14} />
                          </button>

                          {/* Reaction picker */}
                          {showReactionPicker === msg.id && (
                            <div className="absolute top-full left-0">
                              <EmojiPicker
                                onEmojiClick={(emojiData) =>
                                  handleAddReaction(msg.id, emojiData)
                                }
                                width={300}
                                height={350}
                                previewConfig={{ showPreview: false }}
                                searchDisabled
                                skinTonesDisabled
                                reactionsDefaultOpen
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {deleteButtonVisible && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          ×
                        </button>
                      )}
                      {replyButtonVisible && (
                        <button
                          onClick={() => handleReplyClick(msg)}
                          className="text-gray-400 hover:text-gray-300 text-xs"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow-xl mt-4">
            {replyingTo && (
              <div className="bg-gray-700 p-2 rounded mb-2 flex justify-between items-center">
                <div className="text-xs">
                  Replying to <b>{replyingTo.name}</b>:{" "}
                  {replyingTo.text.substring(0, 30)}...
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  ×
                </button>
              </div>
            )}
            <div className="flex items-center space-x-2 mb-4">
              <img
                src={
                  selectedIcon?.src ||
                  `${import.meta.env.BASE_URL}assets/icon/chara-avatar.png`
                }
                alt="Selected icon"
                className="w-10 h-10 rounded-full"
              />
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setUnsavedChanges(true);
                }}
                placeholder="Type a message... Use *italic*, **bold**, or __underline__ syntax."
                className="flex-1 p-2 rounded border border-gray-600 bg-gray-700 text-white"
                rows={1}
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker(true)}
                className="right-2 bottom-2 text-gray-400 hover:text-white"
              >
                <Smile size={20} />
              </button>
              {showEmojiPicker && (
                <div
                  ref={emojiRef}
                  className="absolute bottom-20 right-12 z-50"
                >
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="right-2 bottom-2 text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    width={300}
                    height={350}
                    previewConfig={{ showPreview: false }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-around">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => {
                    setPosition("left");
                    setUnsavedChanges(true);
                  }}
                  className={`px-4 py-2 rounded-md ${
                    position === "left"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700"
                  }`}
                >
                  Left
                </button>
                <button
                  onClick={() => {
                    setPosition("right");
                    setUnsavedChanges(true);
                  }}
                  className={`px-4 py-2 rounded-md ${
                    position === "right"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700"
                  }`}
                >
                  Right
                </button>
              </div>
              <div>
                <button
                  onClick={handleAddCallObject}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white"
                >
                  Add Call
                </button>
              </div>
            </div>

            <button
              onClick={() => handleSendMessage()}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-md"
            >
              Send Message
            </button>
          </div>
        </section>

        {/* Right sidebar - Controls */}
        <section className="flex">
          <div className="flex gap-4 flex-col w-full">
            <div className="flex-1 bg-gray-800 p-4 rounded-lg">
              <button
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md mb-4"
                onClick={() => setIconGroupVisible(!iconGroupVisible)}
              >
                {iconGroupVisible ? "Hide Icons" : "Show Icons"}
              </button>
              {iconGroupVisible && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-h-44 overflow-y-auto scrollbar-minimal">
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
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            getCharacterIconUrl("default");
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 bg-gray-800 p-4 rounded-lg">
              <button
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md mb-4"
                onClick={() => setStampGroupVisible(!stampGroupVisible)}
              >
                {stampGroupVisible ? "Hide Stamps" : "Show Stamps"}
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
                      className={`p-1 rounded-md transition-all ${
                        selectedStamp?.id === stamp.id
                          ? "ring-2 ring-blue-500 transform scale-105"
                          : "hover:ring-1 hover:ring-gray-400"
                      }`}
                    >
                      <img
                        src={stamp.src}
                        alt={`${stamp.character} ${stamp.expression}`}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getStampUrl(
                            "default",
                            "error"
                          );
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="relative">
            <button
              className="fixed bottom-20 left-8 z-20 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md items-center flex gap-4"
              onClick={() => setShowCallLogModal(true)}
            >
              <CallIcon color={"white"} size={24} />
              <span className="hidden lg:block">Call Logs</span>
            </button>
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
      />
    </div>
  );
};

export default ChatPage;
