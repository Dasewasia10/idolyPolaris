import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { Icon } from "../interfaces/Icon";
import { Character } from "../interfaces/Character";

import Toast from "../components/Toast";
import IDCard from "../components/IDCard";

const KTPManager: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [title, setTitle] = useState<string>("Hoshimi Production's Manager");
  const [name, setName] = useState<string>("Nama / Nickname");
  const [selectedIcon, setSelectedIcon] = useState<Icon[]>([]);
  const [idols, setIdols] = useState<Character[]>([]);
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

  const [file, setFile] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://diveidolypapi.my.id/api/characters"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data: Character[] = await response.json();

        // ✅ Filter hanya idol yang ada dalam grup tertentu
        const allowedGroups = [
          "Tsuki no Tempest",
          "Sunny Peace",
          "TRINITYAiLE",
          "LizNoir",
          "IIIX",
          "Mana Nagase",
          "Collaboration",
        ];

        const filteredIdols = data
          .filter((idol) => allowedGroups.includes(idol.groupName))
          .sort((a, b) => a.name.localeCompare(b.name)); // Urutkan berdasarkan nama idol

        setIdols(filteredIdols); // ✅ Simpan hanya idol dalam grup tertentu

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.log("Fetching error", error);
      }
    };

    fetchData();
  }, []);

  const getCharacterIconUrl = (characterName: string) => {
    return `https://diveidolypapi.my.id/api/img/character/icon/${encodeURIComponent(
      characterName.toLowerCase()
    )}`;
  };

  const generateIds = (data: any[]) =>
    data.map((item, index) => ({ ...item, id: index + 1 }));

  const idolsWithIds = generateIds(idols);

  const getCharacterIcon = (character: Character): Icon => {
    const idol = idolsWithIds.find((idol) => idol.name === character.name);
    return {
      id: idol ? idol.id : -1, // Gunakan ID dari idolsWithIds atau fallback ke -1 jika tidak ditemukan
      name: character.name,
      src: getCharacterIconUrl(character.name),
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files);
    if (e.target.files && e.target.files.length > 0) {
      setFile(URL.createObjectURL(e.target.files[0]));
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

  const saveAsPng = async () => {
    const element = document.getElementById("AipuraKtp");
    if (!element) {
      console.error("Element not found");
      return;
    }

    const originalOverflow = element.style.overflow;
    element.style.overflow = "visible";

    try {
      const canvas = await html2canvas(element, {
        useCORS: true, // Aktifkan opsi ini
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve)
      );
      if (!blob) {
        console.error("Blob not found");
        return;
      }

      // Simpan gambar secara lokal
      saveAs(blob, `ktp_of_${name}.png`);

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
    <div className="h-screen bg-slate-400 flex flex-col lg:flex-row p-4 gap-10 items-center lg:items-start">
      <div className="absolute left-1/3 top-16 flex h-fit w-24 flex-col gap-2 bg-white p-4 transition-all duration-500 ease-out text-black opacity-0 lg:opacity-100">
        <span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="-rotate-90"
          >
            <path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 4.702z" />
          </svg>
        </span>
        <p>You can scroll this</p>
      </div>
      <section
        id="leftConsole"
        className="flex flex-col gap-2 w-full lg:w-[30%] lg:h-[90%]"
      >
        <div className="flex items-center">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-800 rounded-md hover:text-white font-semibold"
            onClick={handleBackClick}
          >
            {"<"}
          </button>
        </div>
        <section className="flex flex-col gap-2 w-full overflow-y-auto no-scrollbar">
          <div className="bg-slate-900 p-2 sticky top-0 z-10 border-b-slate-400 border-b-8">
            <h2 className="sticky flex text-right font-bold text-white">
              <span>Simpan KTP-mu!</span>
            </h2>
            <div className="flex w-full p-4 gap-2 justify-center">
              <button
                onClick={() => saveAsPng()}
                className="bg-green-300 hover:bg-green-500 p-2 rounded-lg w-2/3"
              >
                Save Your Aipura KTP
              </button>
            </div>
          </div>
          <div className="bg-slate-900 p-2">
            <h2 className="sticky flex text-right font-bold text-white">
              <span>Upload Foto Profil</span>
            </h2>
            <div className="flex w-full p-4 gap-2 justify-center">
              <input
                type="file"
                onChange={(e) => handleChange(e)}
                className="w-24 h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          </div>
          <div className="bg-slate-900 p-2">
            <h2 className="sticky flex text-right font-bold text-white">
              <span>
                Pilih <i>oshi</i>-mu!
              </span>
            </h2>
            <div className="flex overflow-auto w-full flex-wrap justify-around p-4">
              {idols.map((idol) => (
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
                        return [...prevSelectedIcons, getCharacterIcon(idol)];
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
            <div className="flex items-center justify-center">
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
                  Reset Pilihan
                </button>
              )}
            </div>
          </div>
          <div className="bg-slate-900 p-2">
            <h2 className="sticky flex text-right font-bold text-white">
              <span>Pilih group idol-mu!</span>
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
            <h2 className="sticky flex text-right font-bold text-white">
              <span>Pilih agensi-mu!</span>
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
      <section className="flex z-10 h-max flex-col lg:absolute lg:left-1/2 lg:scale-100 scale-[60%] md:scale-75 lg:top-1/2 lg:-translate-y-1/2">
        <div className="px-4 py-2 rounded-xl flex gap-4 flex-col w-full justify-center">
          <div id="AipuraKtp">
            <IDCard
              title={title}
              group={selectedIdolGroup}
              profilePic={file}
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
          message={"Anda hanya dapat memilih maksimal 3 karakter."}
          isSuccess={false}
          key={Date.now()}
          onClose={() => setToastMessage("")}
        />
      )}
      <div className="opacity-0">----</div>
    </div>
  );
};

export default KTPManager;
