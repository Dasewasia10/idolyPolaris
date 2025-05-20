import React, { useState, useEffect, useRef } from "react";
// import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import domtoimage from "dom-to-image";
import axios from "axios";
import TextareaAutosize from "react-textarea-autosize";

import { Message } from "../interfaces/Message";
import { Icon } from "../interfaces/Icon";
import { Stamp } from "../interfaces/Stamp";
import { Character } from "../interfaces/Character";

import Toast from "../components/Toast";

import exportToJson from "../utils/exportToJson";
import importFromJson from "../utils/importFromJson";

const API_BASE_URL = "https://diveidolypapi.my.id/api";

const ChatPage: React.FC = () => {
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [title, setTitle] = useState("Title Here");
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null);
  const [position, setPosition] = useState<"left" | "right">("left");
  const [iconGroupVisible, setIconGroupVisible] = useState(false);
  const [stampGroupVisible, setStampGroupVisible] = useState(false);
  const [deleteButtonVisible, setDeleteButtonVisible] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [icons, setIcons] = useState<Icon[]>([]);
  const [, setLoading] = useState(true);

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

  // Handlers

  // const handleBackClick = () => {
  //   if (unsavedChanges) {
  //     const confirmation = confirm(
  //       "You have unsaved changes. Are you sure you want to leave?"
  //     );
  //     if (confirmation) {
  //       window.history.back();
  //     }
  //   } else {
  //     window.history.back();
  //   }
  // };

  const stampRef = useRef<Stamp | null>(null);
  const handleStampClick = (stamp: Stamp) => {
    stampRef.current = stamp;
    setSelectedStamp(stamp);
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
    };

    setMessages([...messages, newMessage]);
    setInputText("");
    setUnsavedChanges(true);

    if (isStamp) {
      setSelectedStamp(null); // Tidak perlu setTimeout
    }
  };

  const handleDeleteMessage = (id: number) => {
    setMessages(messages.filter((msg) => msg.id !== id));
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

  return (
    <div className="bg-gray-900 text-white px-4 py-6 z-10 rounded-lg">
      <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - Controls */}
        <section className="lg:col-span-2 space-y-6 flex flex-col text-xs lg:text-base">
          <div className="flex lg:flex-col lg:space-y-4 justify-around space-x-3 lg:space-x-0">
            <div className="flex space-x-4 justify-around">
              {/* <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold"
                onClick={handleBackClick}
              >
                {"< Back"}
              </button> */}
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md w-full text-center h-full"
                onClick={() => setDeleteButtonVisible(!deleteButtonVisible)}
              >
                {deleteButtonVisible ? "Hide Delete" : "Show Delete"}
              </button>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md w-full text-center h-full"
                onClick={saveAsPng}
              >
                Save PNG
              </button>
            </div>

            <div className="flex space-x-4 justify-around">
              <button
                className="lg:px-4 lg:py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md w-full text-center h-full"
                onClick={handleExport}
              >
                Export JSON
              </button>
              <label className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md w-full text-center h-full cursor-pointer">
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

          <div className="flex space-x-4">
            <div className="flex-1 bg-gray-800 p-4 rounded-lg">
              <button
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md mb-4"
                onClick={() => setIconGroupVisible(!iconGroupVisible)}
              >
                {iconGroupVisible ? "Hide Icons" : "Show Icons"}
              </button>
              {iconGroupVisible && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto scrollbar-minimal">
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto scrollbar-minimal">
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
        </section>

        {/* Main content - Chat area */}
        <section className="lg:col-span-2 overflow-y-auto no-scrollbar">
          <div
            id="idolyMessage"
            className={`bg-gray-800 rounded-lg shadow-xl p-6 overflow-y-auto h-[19rem] scrollbar-minimal z-[9999] bg-[url('/assets/chat-bg.png')] bg-repeat bg-blend-multiply bg-cover`}
          >
            <h2>
              <TextareaAutosize
                className="w-full bg-gray-900 text-white text-2xl font-bold p-3 mb-4 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              const bubbleClass =
                msg.position === "left"
                  ? "bg-gray-700 text-white"
                  : "bg-blue-600 text-white";

              return (
                <div
                  key={msg.id}
                  className={`flex ${
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
                      className={`flex items-center space-x-3 ${
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
                      <div className="flex flex-col">
                        {/* Span nama hanya muncul jika isFirst */}
                        {isFirst && (
                          <span
                            className={`text-xs text-gray-400 mb-1 ${
                              msg.position === "right"
                                ? "text-right"
                                : "text-left"
                            }`}
                          >
                            {msg.name}
                          </span>
                        )}

                        <div
                          className={`flex justify-start px-3 py-2 mt-2 ${bubbleClass} ${
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
                          {msg.stamp ? (
                            <img
                              src={msg.stamp}
                              alt="Stamp"
                              className="w-16 h-16"
                              onError={(e) => {
                                e.currentTarget.src = `${
                                  import.meta.env.BASE_URL
                                }assets/default_image.png`;
                                e.currentTarget.alt = "Image not available";
                              }}
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
                      </div>
                    </section>

                    {deleteButtonVisible && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="text-red-500 hover:text-red-400 -translate-x-1"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow-xl mt-4">
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
                rows={3}
              />
            </div>

            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => {
                  setPosition("left");
                  setUnsavedChanges(true);
                }}
                className={`px-4 py-2 rounded-md ${
                  position === "left" ? "bg-blue-600 text-white" : "bg-gray-700"
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

            <button
              onClick={() => handleSendMessage()}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-md"
            >
              Send Message
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
    </div>
  );
};

export default ChatPage;
