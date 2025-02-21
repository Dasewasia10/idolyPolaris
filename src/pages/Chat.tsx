import React, { useState, useEffect } from "react";
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";
import TextareaAutosize from "react-textarea-autosize";

import { Message } from "../interfaces/Message";
import { Icon } from "../interfaces/Icon";
import { Stamp } from "../interfaces/Stamp";
import { Character } from "../interfaces/Character";

import exportToJson from "../utils/exportToJson";
import importFromJson from "../utils/importFromJson";

import Toast from "../components/Toast";

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [title, setTitle] = useState<string>("Title Here");
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null);
  const [position, setPosition] = useState<"left" | "right">("left");
  const [iconGroupVisible, setIconGroupVisible] = useState<boolean>(false);
  const [stampGroupVisible, setStampGroupVisible] = useState<boolean>(false);
  const [deleteButtonVisible, setDeleteButtonVisible] =
    useState<boolean>(false);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [icons, setIcons] = useState<Icon[]>([]);
  const [, setIdols] = useState<Character[]>([]);

  const [, setLoading] = useState(true);

  const parseText = (text: string) => {
    // Regex untuk pola formatting dengan aturan yang benar
    const bold = /(?<!\*)\*\*(.+?)\*\*(?!\*)/g; // Hanya mencocokkan teks antara ** dan **
    const italic = /(?<!\*)\*(.+?)\*(?!\*)/g; // Hanya mencocokkan teks antara * dan * tanpa double asterisk
    const underline = /__(.+?)__/g; // Hanya mencocokkan teks antara __ dan __

    const htmlText = text
      .replace(bold, "<b>$1</b>")
      .replace(italic, "<i>$1</i>")
      .replace(underline, "<u>$1</u>");

    return htmlText;
  };

  useEffect(() => {
    // Fetch stamps data
    fetch("https://diveidolypapi.my.id/api/stamp")
      .then((response) => response.json())
      .then((data) => {
        const formattedStamps = data.map((stamp: Stamp) => ({
          ...stamp,
          src: `https://api.diveidolypapi.my.id/stampChat/stamp_${stamp.character.toLowerCase()}-${stamp.expression.toLowerCase()}.webp`,
        }));
        setStamps(formattedStamps);
        console.log("formattedStamps: ", formattedStamps);
      });
    console.log("stamp: ", stamps);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://www.diveidolypapi.my.id/api/characters"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data: Character[] = await response.json();
        const filteredIdols = data.sort((a, b) => a.name.localeCompare(b.name)); // Urutkan berdasarkan nama idol

        // ✅ Generate IDs untuk idols
        const generateIds = (data: any[]) =>
          data.map((item, index) => ({ ...item, id: index + 1 }));

        const idolsWithIds = generateIds(filteredIdols);

        const getCharacterIconUrl = (characterName: string) => {
          return `https://api.diveidolypapi.my.id/iconCharacter/chara-${encodeURIComponent(
            characterName
          ).toLowerCase()}.png`;
        };

        // ✅ Simpan idols dengan ID ke state
        setIdols(idolsWithIds);

        // ✅ Buat daftar icons dari idolsWithIds
        const icons = idolsWithIds.map((idol) => ({
          id: idol.id, // Gunakan ID yang sudah di-generate
          name: idol.name,
          src: getCharacterIconUrl(idol.name), // Gunakan fungsi untuk menghasilkan URL icon
        }));

        // ✅ Simpan daftar icons ke state
        setIcons(icons);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStampClick = (stamp: Stamp) => {
    console.log("Selected stamp:", stamp);
    setSelectedStamp(stamp);
  };

  const handleSendMessage = (isStamp = false) => {
    if (!selectedIcon) return;

    const newMessage: Message = {
      id: Date.now(),
      text: isStamp ? "" : inputText, // Kosongkan teks jika ini stamp
      name: selectedIcon.name,
      icon: selectedIcon.src,
      position,
      stamp: isStamp ? selectedStamp?.src : undefined, // Tambahkan stamp jika ada
    };

    console.log("Sending message:", newMessage); // Debugging log

    setMessages([...messages, newMessage]);
    setInputText("");
    if (isStamp) {
      setTimeout(() => setSelectedStamp(null), 0); // Reset setelah pembaruan selesai
    }
  };

  const handleBackClick = () => {
    if (unsavedChanges) {
      const confirmation = confirm(
        "Anda mungkin memiliki perubahan yang belum disimpan. Anda yakin ingin kembali?"
      );
      if (confirmation) {
        setUnsavedChanges(false); // Mengatur kembali ke false setelah konfirmasi
        window.history.back();
      }
    } else {
      window.history.back();
    }
  };

  const handleDeleteMessage = (id: number) => {
    setMessages(messages.filter((msg) => msg.id !== id));
  };

  const saveAsPng = async () => {
    const element = document.getElementById("idolyMessage");
    if (!element) {
      console.error("Element not found");
      return;
    }

    // Simpan overflow asli
    const originalOverflow = element.style.overflow;

    try {
      // Ubah overflow menjadi visible untuk merender seluruh konten
      element.style.overflow = "visible";

      // Gunakan dom-to-image untuk membuat gambar dari elemen
      const blob = await domtoimage.toBlob(element);
      if (!blob) {
        console.error("Blob not found");
        return;
      }

      // Simpan gambar secara lokal
      saveAs(blob, `conversation_of_${title}.png`);

      setUnsavedChanges(false);

      setToastMessage("Gambar telah tersimpan!");
      setIsSuccess(true);
    } catch (error) {
      console.error("Error:", error);
      setToastMessage("Failed to save image!");
      setIsSuccess(false);
    } finally {
      // Kembalikan overflow ke nilai asli
      element.style.overflow = originalOverflow;
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

  useEffect(() => {
    const handleBeforeUnload = (event: {
      preventDefault: () => void;
      returnValue: string;
    }) => {
      if (unsavedChanges) {
        const confirmationMessage =
          "Anda mungkin memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin meninggalkan halaman ini?";
        event.preventDefault();
        event.returnValue = confirmationMessage;
        const leavePage = window.confirm(confirmationMessage);
        if (leavePage) {
          setUnsavedChanges(false); // Mengatur kembali ke false jika pengguna meninggalkan halaman
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [unsavedChanges]);

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="h-full w-full max-w-screen bg-slate-700 rounded-lg shadow-md p-4 flex justify-evenly gap-10">
        <section className="flex flex-col flex-1">
          <div className="my-4 flex gap-4">
            <button
              className="px-4 py-2 bg-gray-300 hover:bg-gray-800 rounded-md hover:text-white font-semibold"
              onClick={handleBackClick}
            >
              {"<"}
            </button>
            <button
              onClick={() => setDeleteButtonVisible(!deleteButtonVisible)}
              className="bg-red-300 hover:bg-red-500 p-2 rounded-lg w-2/3"
            >
              {deleteButtonVisible ? "Hide Delete" : "Show Delete"}
            </button>
            <button
              onClick={() => saveAsPng()}
              className="bg-green-300 hover:bg-green-500 p-2 rounded-lg w-2/3"
            >
              Save Conversation
            </button>
          </div>
          <div className="my-4 flex justify-around w-full bg-white rounded-md p-2 items-center">
            <button
              className="bg-orange-300 hover:bg-orange-500 p-2 rounded-md"
              onClick={handleExport}
            >
              Export to JSON
            </button>
            <input
              className="w-40"
              type="file"
              accept="application/json"
              onChange={handleImport}
            />
          </div>
          <div className="flex flex-col lg:flex-row-reverse gap-10 justify-around">
            <div className="flex flex-1 flex-col">
              <button
                onClick={() => setIconGroupVisible(!iconGroupVisible)}
                className="w-full bg-blue-500 text-white py-2 rounded-md mb-4"
              >
                {iconGroupVisible ? "Hide Icons" : "Show Icons"}
              </button>
              {iconGroupVisible && (
                <div className="flex overflow-auto w-full flex-wrap justify-around mb-4">
                  {icons.map((icon) => (
                    <button
                      key={icon.id}
                      onClick={() => {
                        setSelectedIcon(icon);
                        setUnsavedChanges(true);
                      }}
                      className={`p-1 rounded-full border ${
                        selectedIcon?.id === icon.id
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      <img
                        src={icon.src}
                        alt={icon.name}
                        title={icon.name}
                        className="flex w-12 h-12 rounded-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <button
                onClick={() => setStampGroupVisible(!stampGroupVisible)}
                className="w-full bg-emerald-500 text-white py-2 rounded-md mb-4"
              >
                {stampGroupVisible ? "Hide Stamps" : "Show Stamps"}
              </button>
              {stampGroupVisible && (
                <div className="flex w-full flex-wrap justify-around overflow-y-auto h-80 lg:h-full m-2">
                  {stamps.map((stamp) => (
                    <button
                      key={stamp.id}
                      onMouseDown={() => handleStampClick(stamp)}
                      onMouseUp={() => handleSendMessage(true)}
                      onClick={() => {
                        setUnsavedChanges(true);
                      }}
                      className={`p-1 rounded-md border ${
                        selectedStamp?.id === stamp.id
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      <img
                        src={stamp.src || "https://placehold.co/600x400"}
                        alt={stamp.character + stamp.expression}
                        title={stamp.character + " " + stamp.expression}
                        className="flex w-12 h-12 rounded-md"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="flex flex-col justify-between w-96">
          <div
            id="idolyMessage"
            className="mb-4 space-y-2 shadow-lg p-4 rounded-md h-auto overflow-y-auto bg-blend-multiply bg-repeat bg-[url('/assets/chat_bg_text.png')]"
          >
            <h1 className="bg-slate-900 text-white p-2 rounded-md pl-3">
              <TextareaAutosize
                className="w-full h-auto appearance-none border-none bg-transparent font-bold text-xl break-words whitespace-pre-wrap"
                title={"Input title here"}
                placeholder={"Input title here"}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setUnsavedChanges(true);
                }}
              />
            </h1>
            {messages.map((msg, index) => {
              const isFirstMessageByUser =
                index === 0 || messages[index - 1].name !== msg.name;
              const isLastMessageByUser =
                index === messages.length - 1 ||
                messages[index + 1].name !== msg.name;
              const isMiddleMessageByUser =
                !isFirstMessageByUser && !isLastMessageByUser;

              return (
                <div
                  key={msg.id}
                  className={`flex z-10 ${
                    msg.position === "left" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`flex items-center space-x-2 ${
                      msg.position === "right"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    <section
                      className={`flex items-center ${
                        isFirstMessageByUser ? "h-16" : ""
                      }`}
                    >
                      <img
                        src={msg.icon}
                        alt={msg.name}
                        className={`w-12 h-12 rounded-full ${
                          isFirstMessageByUser ? "" : "opacity-0"
                        }`}
                      />
                    </section>
                    <section>
                      {isFirstMessageByUser && (
                        <span
                          className={`flex text-black text-xs pb-1 ${
                            msg.position === "left"
                              ? ""
                              : "flex-row-reverse space-x-reverse"
                          }`}
                        >
                          {msg.name}
                        </span>
                      )}
                      <div
                        className={`flex justify-start p-2 ${
                          msg.position === "left"
                            ? isFirstMessageByUser
                              ? "bg-gray-300 rounded-br-lg rounded-t-lg"
                              : isMiddleMessageByUser
                              ? "bg-gray-300 rounded-r-lg"
                              : "bg-gray-300 rounded-tr-lg rounded-b-lg"
                            : isFirstMessageByUser
                            ? "bg-green-600 text-white rounded-bl-lg rounded-t-lg"
                            : isMiddleMessageByUser
                            ? "bg-green-600 text-white rounded-l-lg"
                            : "bg-green-600 text-white rounded-tl-lg rounded-b-lg"
                        } max-w-[16rem] break-words`}
                      >
                        {msg.stamp ? (
                          <img
                            src={msg.stamp}
                            alt="stamp"
                            className="w-16 h-16"
                          />
                        ) : (
                          <div
                            className="text-left"
                            dangerouslySetInnerHTML={{
                              __html: parseText(msg.text),
                            }}
                          ></div>
                        )}
                      </div>
                    </section>
                    {deleteButtonVisible && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col bg-slate-800 p-2 rounded-lg shadow-md">
            <div className="flex gap-2 items-center mb-2">
              <img
                src={
                  selectedIcon
                    ? selectedIcon.src
                    : `${import.meta.env.BASE_URL}assets/icon/chara-avatar.webp`
                }
                alt="icon"
                className="h-12 w-12 rounded-full"
              />
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setUnsavedChanges(true);
                }}
                placeholder="Type a message... Use *italic*, **bold**, or __underline__ syntax."
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div className="mb-4 flex space-x-4">
              <button
                onClick={() => {
                  setPosition("left");
                  setUnsavedChanges(true);
                }}
                className={`px-4 py-2 rounded-md ${
                  position === "left" ? "bg-blue-500 text-white" : "bg-gray-200"
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
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                Right
              </button>
            </div>
            <button
              onClick={() => {
                handleSendMessage();
                setUnsavedChanges(true);
              }}
              className="w-full bg-green-500 text-white py-2 rounded-md"
            >
              Send
            </button>
          </div>
        </section>
        {toastMessage && <Toast message={toastMessage} isSuccess={isSuccess} />}
      </div>
    </div>
  );
};

export default ChatPage;
