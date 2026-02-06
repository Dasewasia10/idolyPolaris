import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import domtoimage from "dom-to-image";
import axios from "axios";
import { Icon } from "../interfaces/Icon";
import { Character } from "../interfaces/Character";

import Toast from "../components/Toast";
import IDCard from "../components/IDCard";

const API_BASE_URL = "https://diveidolypapi.my.id/api";

const KTPManager: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [title, setTitle] = useState<string>("Hoshimi Production's Manager");
  const [name, setName] = useState<string>("Name / Nickname");
  const [selectedIcon, setSelectedIcon] = useState<Icon[]>([]);
  const [icons, setIcons] = useState<Icon[]>([]);
  const [selectedIdolGroup, setSelectedIdolGroup] =
    useState<string>("Tsuki no Tempest");
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [maxSelectionReached, setMaxSelectionReached] = useState(false);

  const agencies = [
    {
      key: "hoshipro",
      name: "Hoshimi Production",
      title: "Hoshimi Production's Manager",
    },
    {
      key: "vanpro",
      name: "Van Production",
      title: "Van Production's Manager",
    },
    {
      key: "pret",
      name: "Pret a Porter",
      title: "Pret a Porter's Manager",
    },
    // Tambahkan sumber lain di sini
  ];

  const groupOfIdol = [
    {
      key: "tsukisto",
      name: "Tsuki no Tempest",
      altName: "tsukisto",
    },
    {
      key: "sunnyp",
      name: "Sunny Peace",
      altName: "sunnyp",
    },
    {
      key: "triaile",
      name: "TRINITYAiLE",
      altName: "triaile",
    },
    {
      key: "liznoir",
      name: "LizNoir",
      altName: "liznoir",
    },
    {
      key: "iiix",
      name: "IIIX",
      altName: "iiix",
    },
    {
      key: "mana",
      name: "Mana Nagase",
      altName: "mana",
    },
    // Tambahkan sumber lain di sini
  ];

  const [activeAgency, setActiveAgency] = useState(agencies[0].key);

  const [profileBase64, setProfileBase64] = useState<string | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/characters`);

        // ✅ Filter hanya idol yang ada dalam grup tertentu
        const allowedGroups = [
          "Tsuki no Tempest",
          "Sunny Peace",
          "TRINITYAiLE",
          "LizNoir",
          "IIIX",
          "Mana Nagase",
        ];

        const sortedCharacters = response.data
          .filter((idol: { groupName: string }) =>
            allowedGroups.includes(idol.groupName)
          )
          .sort((a: Character, b: Character) => a.name.localeCompare(b.name));

        const processedIcons = sortedCharacters.map(
          (character: Character, index: number) => ({
            id: index + 1,
            name: character.name,
            src: getCharacterIconUrl(character.name),
          })
        );

        setIcons(processedIcons);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const getCharacterIconUrl = (characterName: string) => {
    const formattedName = characterName.toLowerCase().replace(/\s+/g, "");
    return `https://api.diveidolypapi.my.id/iconCharacter/chara-${formattedName}.png`;
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await convertFileToBase64(file);
      setProfileBase64(base64);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const saveAsPng = async () => {
    const element = document.getElementById("AipuraKtp");
    if (!element) {
      console.error("Element not found");
      return;
    }

    // Nonaktifkan background pattern sementara
    const bgPatterns = element.getElementsByClassName("bg-pattern");
    Array.from(bgPatterns).forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });

    // Pastikan semua gambar sudah dimuat
    const images = Array.from(element.getElementsByTagName("img"));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    // Tambahkan delay untuk memastikan render
    await new Promise((resolve) => setTimeout(resolve, 300));

    const originalStyle = {
      height: element.style.height,
      overflow: element.style.overflow,
    };

    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      element.style.height = "full";
      element.style.overflow = "visible";

      // Gunakan dom-to-image
      const blob = await domtoimage.toBlob(element, {
        quality: 1,
        cacheBust: false, // Nonaktifkan cache busting untuk blob URL
        style: {
          transform: "none", // Handle transform issues
        },
        filter: (node) => {
          // Skip elemen yang tidak perlu
          if ((node as HTMLElement).classList?.contains("bg-pattern")) {
            return false;
          }
          return true;
        },
        imagePlaceholder:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", // Placeholder untuk gambar error
      });
      if (!blob) {
        console.error("Blob not found");
        return;
      }

      // Simpan gambar secara lokal
      saveAs(blob, `ktp_of_${name}.png`);
      setToastMessage("Image saved successfully!");
      setIsSuccess(true);
      setUnsavedChanges(false);
    } catch (error) {
      console.error("Error:", error);
      setToastMessage("Failed to save image!");
      setIsSuccess(false);
    } finally {
      element.style.height = originalStyle.height;
      element.style.overflow = originalStyle.overflow;
      // Aktifkan kembali background pattern
      Array.from(bgPatterns).forEach((el) => {
        (el as HTMLElement).style.display = "";
      });
    }
  };

  const handleAgencyChange = (agencyKey: string) => {
    setActiveAgency(agencyKey);
    setTitle(title);
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
    <div className="h-[38rem] bg-gradient-to-br from-[#182cfc] to-[#6a11cb] rounded-2xl flex flex-col lg:flex-row gap-10 items-center lg:justify-between mt-10 lg:mt-0">
      <section
        id="leftConsole"
        className="flex flex-col gap-2 w-full lg:w-[30%] lg:h-full"
      >
        <section className="flex flex-col gap-2 w-full overflow-y-auto scrollbar-minimal rounded-2xl lg:rounded-l-2xl">
          <div className="bg-slate-900 p-2 sticky top-0 z-10">
            <h2 className="sticky flex text-center w-full items-center justify-center font-bold text-white">
              <span>Save Your ID</span>
            </h2>
            <div className="flex w-full p-4 gap-2 justify-center">
              <button
                onClick={() => saveAsPng()}
                className="bg-green-300 hover:bg-green-500 p-2 rounded-lg w-2/3"
              >
                Save
              </button>
            </div>
            <div className="flex border-b-4 border-slate-500 mx-2"></div>
          </div>
          <div className="bg-slate-900 p-2 gap-4 flex flex-col">
            <h2 className="sticky flex text-center w-full items-center justify-center font-bold text-white">
              <span>Upload Profile Image</span>
            </h2>
            <label className="flex w-full justify-center mr-4 py-2 px-4 rounded-full border-0 text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer">
              Choose File
              <input
                type="file"
                onChange={(e) => handleChange(e)}
                className="hidden"
              />
            </label>
          </div>
          <div className="bg-slate-900 p-2 relative">
            <h2 className="sticky flex text-center w-full items-center justify-center font-bold text-white">
              <span>
                Choose Your <i>Oshi</i>
              </span>
            </h2>
            <div className="flex overflow-auto w-full flex-wrap justify-around p-4 gap-2">
              {icons.map((idol) => (
                <button
                  key={idol.id}
                  onClick={() => {
                    setSelectedIcon((prevSelectedIcons) => {
                      const isAlreadySelected = prevSelectedIcons.some(
                        (selected) => selected.id === idol.id
                      );

                      if (isAlreadySelected) {
                        setMaxSelectionReached(false); // Reset pesan batas maksimal
                        return prevSelectedIcons.filter(
                          (selected) => selected.id !== idol.id
                        );
                      } else if (prevSelectedIcons.length < 3) {
                        setMaxSelectionReached(false); // Reset pesan batas maksimal
                        return [
                          ...prevSelectedIcons,
                          {
                            ...idol,
                            id: idol.id,
                            name: idol.name,
                            src: getCharacterIconUrl(idol.name),
                          },
                        ];
                      } else {
                        setMaxSelectionReached(true); // Tampilkan pesan batas maksimal
                        return prevSelectedIcons;
                      }
                    });
                    setUnsavedChanges(true);
                  }}
                  className={`p-1 rounded-full border button-click-effect ${
                    selectedIcon.some((selected) => selected.id === idol.id)
                      ? "border-blue-500 opacity-80"
                      : "border-gray-300"
                  }`}
                >
                  <img
                    src={getCharacterIconUrl(idol.name)}
                    alt={idol.name}
                    title={idol.name}
                    className="flex w-12 h-12 rounded-full"
                  />
                </button>
              ))}
            </div>
            <div className="flex absolute top-1 left-1">
              {/* Tombol Reset */}
              {selectedIcon.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedIcon([]); // Kosongkan daftar pilihan
                    setMaxSelectionReached(false); // Reset pesan batas maksimal
                    setUnsavedChanges(true); // Tandai ada perubahan yang belum disimpan
                  }}
                  className="flex px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className="bg-slate-900 p-2">
            <h2 className="sticky flex text-center w-full items-center justify-center font-bold text-white">
              <span>Choose your idol group</span>
            </h2>
            <div className="flex overflow-auto w-full flex-wrap justify-around p-2 gap-2">
              {groupOfIdol.map((group) => (
                <button
                  key={group.key}
                  onClick={() => {
                    setSelectedIdolGroup(group.name);
                    setUnsavedChanges(true);
                  }}
                  className={`p-1 rounded-full border ${
                    selectedIdolGroup === group.name
                      ? "border-blue-500 bg-white"
                      : "border-gray-300 bg-blue-500"
                  }`}
                >
                  <p className="flex py-1 w-40 text-center justify-center">
                    {group.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-slate-900 p-2">
            <h2 className="sticky flex text-center w-full items-center justify-center font-bold text-white">
              <span>Choose your agency</span>
            </h2>
            <div className="flex w-full p-4 gap-2">
              {agencies.map((agency) => (
                <button
                  key={agency.key}
                  onClick={() => {
                    handleAgencyChange(agency.key);
                    setTitle(agency.title);
                  }}
                  className={`px-4 py-2 rounded-md ${
                    activeAgency === agency.key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  {agency.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      </section>
      <section className="flex z-10 h-max flex-col lg:scale-90 scale-[80%]">
        <div className="px-4 py-2 rounded-xl flex gap-4 flex-col w-full justify-center">
          <div id="AipuraKtp">
            <IDCard
              title={title}
              group={selectedIdolGroup}
              profilePic={profileBase64}
              inputText={inputText}
              setInputText={setInputText}
              setUnsavedChanges={setUnsavedChanges}
              setName={setName}
              name={name}
              selectedIcon={selectedIcon}
            />
          </div>
        </div>
      </section>

      {toastMessage && (
        <Toast
          message={toastMessage}
          isSuccess={isSuccess}
          key={Date.now()}
          onClose={() => setToastMessage("")}
        />
      )}
      {maxSelectionReached && (
        <Toast
          message={"You can only choose max 3 oshi!"}
          isSuccess={false}
          key={Date.now()}
          onClose={() => setToastMessage("")}
        />
      )}

      <div className="flex border-b border-slate-500 mx-2 h-20 opacity-0 pointer-none lg:hidden">
        Test
      </div>
    </div>
  );
};

export default KTPManager;
