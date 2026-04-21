import React, { useState, useRef, useEffect } from "react";
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";
import IDCard from "../components/IDCard";
import { Icon } from "../interfaces/Icon";
import axios from "axios";
import Toast from "../components/Toast";
import {
  Camera,
  User,
  Briefcase,
  Star,
  Download,
  ChevronDown,
  CreditCard,
  LayoutTemplate,
  ImageIcon,
  X,
} from "lucide-react";

// --- Fungsi Image Utils Baru ---
export const getCharacterImageUrl = (
  characterName: string,
  type: "icon" | "sprite1" | "sprite2" | "banner",
) => {
  const baseUrl = "https://apiip.dasewasia.my.id";
  const formattedName = encodeURIComponent(characterName.toLowerCase());

  switch (type) {
    case "icon":
      return `${baseUrl}/iconCharacter/chara-${formattedName}.png`;
    case "banner":
      return `${baseUrl}/bannerCharacter/banner-${formattedName}.webp`;
    case "sprite1":
      return `${baseUrl}/spriteCharacter/sprite-${formattedName}-01.webp`;
    case "sprite2":
      return `${baseUrl}/spriteCharacter/sprite-${formattedName}-02.webp`;
    default:
      return "";
  }
};

const KTPManager: React.FC = () => {
  // State untuk data kartu
  const [managerName, setManagerName] = useState("");
  const [inputText, setInputText] = useState("");
  const [jpId, setJpId] = useState("");
  const [group, setGroup] = useState("Mana Nagase");
  const [level, setLevel] = useState("100");
  const [rank, setRank] = useState("C1");
  const [activeAgency, setActiveAgency] = useState(
    "Hoshimi Production's Manager",
  );
  const [profilePic, setProfilePic] = useState<string | undefined>(undefined);
  const [selectedIcons, setSelectedIcons] = useState<Icon[]>([]);

  // STATE BARU: Pemilihan Desain Template
  const [activeTemplate, setActiveTemplate] = useState<
    "classic" | "meishi" | "vertical" | "profile"
  >("classic");

  // State UI/UX
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);
  const [icons, setIcons] = useState<Icon[]>([]);
  const [showIconSelector, setShowIconSelector] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // State CardList
  const [bgCardUrl, setBgCardUrl] = useState<string>("");
  const [cards, setCards] = useState<any[]>([]);
  const [showCardModal, setShowCardModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const response = await axios.get(
          "https://beip.dasewasia.my.id/api/characters",
        );

        const processedIcons = response.data.map((char: any, index: number) => {
          let displayName = char.name;
          let assetName = char.name.toLowerCase().replace(/\s+/g, "");

          if (char.name.toLowerCase() === "snow") {
            displayName = "Snow Miku";
            assetName = "smiku";
          }

          return {
            id: index,
            name: displayName,
            src: `https://apiip.dasewasia.my.id/iconCharacter/chara-${assetName}.png`,
            // Simpan data mentah karakter untuk dipakai di template 3 (Profile)
            rawData: char,
          };
        });

        setIcons(processedIcons);
      } catch (error) {
        console.error("Error fetching icons:", error);
      }
    };
    fetchIcons();
  }, []);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await axios.get("https://beip.dasewasia.my.id/api/cards");
        const processedCards = res.data.flatMap((source: any) =>
          source.data.map((card: any) => ({
            ...card,
            sourceName: source.name,
          })),
        );
        setCards(processedCards);
      } catch (error) {
        console.error("Error fetching cards:", error);
      }
    };
    fetchCards();
  }, []);

  useEffect(() => {
    document.title = "Polaris Idoly | ID Manager";
    return () => {
      document.title = "Polaris Idoly";
    };
  }, []);

  // Handler Upload Foto Profil
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setToastMessage("Image too large (max 2MB)");
        setIsSuccess(false);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
        setUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler Download Kartu
  const handleDownload = async () => {
    const scale = 5;
    if (!cardRef.current) return;

    try {
      const node = cardRef.current;
      const blob = await domtoimage.toBlob(node, {
        width: node.clientWidth * scale,
        height: node.clientHeight * scale,
        quality: 1,
        cacheBust: true,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: node.clientWidth + "px",
          height: node.clientHeight + "px",
          margin: "0",
        },
        imagePlaceholder:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      });

      if (blob) {
        saveAs(
          blob,
          `id_card_${activeTemplate}_${managerName || "manager"}.png`,
        );
        setToastMessage("ID Card downloaded successfully!");
        setIsSuccess(true);
        setUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Download failed:", error);
      setToastMessage("Failed to generate image. Try again.");
      setIsSuccess(false);
    }
  };

  const toggleIconSelection = (icon: Icon) => {
    // Tentukan limit berdasarkan template
    const maxIcons =
      activeTemplate === "vertical" || activeTemplate === "profile" ? 1 : 3;

    if (selectedIcons.find((i) => i.id === icon.id)) {
      setSelectedIcons(selectedIcons.filter((i) => i.id !== icon.id));
    } else {
      if (selectedIcons.length < maxIcons) {
        setSelectedIcons([...selectedIcons, icon]);
      } else {
        // Berikan pesan error yang sesuai
        setToastMessage(
          maxIcons === 1
            ? "Can only select 1 Oshi for this template"
            : "Can only select 3 Oshi for this template",
        );
        setIsSuccess(false);
      }
    }
    setUnsavedChanges(true);
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
          setUnsavedChanges(false);
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [unsavedChanges]);

  // Fungsi penyesuaian skala agar tidak keluar dari container
  const getPreviewScale = () => {
    if (activeTemplate === "meishi" || activeTemplate === "profile") {
      // Lebar 800px: Butuh pengecilan ekstrem di mobile
      return "scale-[0.30] sm:scale-[0.55] md:scale-[0.70] xl:scale-[0.80]";
    }
    if (activeTemplate === "vertical") {
      // Lebar 400px: Aman dengan skala sedang
      return "scale-[0.65] sm:scale-[0.80] md:scale-[0.90] xl:scale-100";
    }
    // Default (Classic - Lebar 512px)
    return "scale-[0.55] sm:scale-[0.70] md:scale-[0.80] xl:scale-100";
  };

  return (
    // PERBAIKAN PADDING: px-4 pt-4 pb-24 lg:px-8 lg:pt-8 lg:pb-24
    <div className="min-h-screen bg-[#0f1115] text-white px-4 pt-4 pb-24 lg:px-8 lg:pt-8 lg:pb-24 flex flex-col lg:flex-row gap-8 font-sans relative selection:bg-blue-500 selection:text-white">
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* --- LEFT COLUMN: INPUT TERMINAL --- */}
      <div className="flex-1 space-y-6 max-w-xl relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded text-black shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <CreditCard size={20} />
          </div>
          <div>
            <span className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase block">
              Registration
            </span>
            <h1 className="text-2xl font-black italic tracking-tighter text-white">
              MANAGER{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                ID CARD&nbsp;
              </span>
            </h1>
          </div>
        </div>

        {/* FITUR BARU: Template Selector */}
        <div className="bg-[#161b22]/90 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-lg relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
            <LayoutTemplate size={14} /> Layout Design
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(["classic", "meishi", "vertical", "profile"] as const).map(
              (tmpl) => (
                <button
                  key={tmpl}
                  onClick={() => setActiveTemplate(tmpl)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                    activeTemplate === tmpl
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                      : "bg-black/40 text-gray-500 border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {tmpl}
                </button>
              ),
            )}
          </div>
        </div>

        {/* FITUR BACKGROUND ART (Hanya muncul jika Meishi dipilih) */}
        {activeTemplate === "meishi" && (
          <div className="bg-[#161b22]/90 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-lg relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ImageIcon size={14} /> Background Art
            </h3>
            <button
              onClick={() => setShowCardModal(true)}
              className="w-full bg-black/40 border border-white/20 hover:border-pink-500 rounded-lg p-3 flex items-center justify-between transition-all group"
            >
              <span className="text-sm text-gray-300 group-hover:text-white">
                {bgCardUrl
                  ? "Change Background Card..."
                  : "Select Background Card"}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
          </div>
        )}

        {/* 1. Profile Upload */}
        {activeTemplate === "classic" && (
          <div className="bg-[#161b22]/90 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>

            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Camera size={14} /> Profile Data
            </label>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                id="profile-upload"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="profile-upload"
                className="flex items-center justify-between w-full bg-black/40 border border-white/20 hover:border-blue-500 border-dashed rounded-lg p-3 cursor-pointer transition-all group-hover:bg-black/60"
              >
                <span className="text-sm text-gray-400 group-hover:text-blue-300">
                  {profilePic ? "Change Photo..." : "Upload Profile Photo"}
                </span>
                <div className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded text-xs font-bold border border-blue-500/50">
                  BROWSE
                </div>
              </label>
            </div>
          </div>
        )}

        {/* 2. Basic Info */}
        <div className="bg-[#161b22]/90 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-lg relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>

          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
            <User size={14} /> Basic Information
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">
                Manager Name
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => {
                  setManagerName(e.target.value);
                  setUnsavedChanges(true);
                }}
                placeholder="ENTER NAME"
                maxLength={20}
                className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none transition-colors font-mono tracking-wide"
              />
            </div>
            {activeTemplate !== "profile" && activeTemplate !== "vertical" && (
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">
                  Level
                </label>
                <input
                  type="number"
                  value={level}
                  onChange={(e) => {
                    if (e.target.value.length <= 3) {
                      setLevel(e.target.value);
                      setUnsavedChanges(true);
                    }
                  }}
                  placeholder="LV"
                  className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none transition-colors text-center font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            )}
            {activeTemplate === "meishi" && (
              <>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">
                    Game Id
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    placeholder="ID0LYPR1"
                    value={jpId}
                    onChange={(e) => {
                      setJpId(e.target.value);
                      setUnsavedChanges(true);
                    }}
                    className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none transition-colors font-mono tracking-wide"
                  />
                </div>
                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">
                    Rank
                  </label>
                  <div className="relative">
                    <select
                      value={rank}
                      onChange={(e) => {
                        setRank(e.target.value);
                        setUnsavedChanges(true);
                      }}
                      className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none appearance-none cursor-pointer text-center font-bold"
                    >
                      {[
                        "C1",
                        "C2",
                        "C3",
                        "B1",
                        "B2",
                        "B3",
                        "S1",
                        "S2",
                        "S3",
                        "G1",
                        "G2",
                        "G3",
                        "Pl",
                        "Di",
                        "BIG4",
                      ].map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2 top-3 text-gray-500 pointer-events-none"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. Affiliation */}
        {(activeTemplate === "classic" ||
          activeTemplate === "meishi" ||
          activeTemplate === "vertical") && (
          <div className="bg-[#161b22]/90 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-lg relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
              <Briefcase size={14} /> Affiliation Data
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">
                  Agency
                </label>
                <div className="relative">
                  <select
                    value={activeAgency}
                    onChange={(e) => {
                      setActiveAgency(e.target.value);
                      setUnsavedChanges(true);
                    }}
                    className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="Hoshimi Production's Manager">
                      Hoshimi Production
                    </option>
                    <option value="Van Production's Manager">
                      Van Production
                    </option>
                    <option value="Prêt-à Porter's Manager">
                      Prêt-à Porter
                    </option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-3 text-gray-500 pointer-events-none"
                  />
                </div>
              </div>

              {activeTemplate !== "vertical" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">
                    Main Group
                  </label>
                  <div className="relative">
                    <select
                      value={group}
                      onChange={(e) => {
                        setGroup(e.target.value);
                        setUnsavedChanges(true);
                      }}
                      className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="Mana Nagase">Mana Nagase</option>
                      <option value="Tsuki no Tempest">Tsuki no Tempest</option>
                      <option value="Sunny Peace">Sunny Peace</option>
                      <option value="TRINITYAiLE">TRINITYAiLE</option>
                      <option value="LizNoir">LizNoir</option>
                      <option value="IIIX">IIIX</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-3 text-gray-500 pointer-events-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Support Idols (Muncul di semua template, tapi teksnya kita sesuaikan) */}
        <div className="bg-[#161b22]/90 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-lg relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Star size={14} />
              {/* Teks dinamis sesuai template */}
              {activeTemplate === "vertical" || activeTemplate === "profile"
                ? `Main Character (${selectedIcons.length > 0 ? 1 : 0}/1)`
                : `Support Idols (${selectedIcons.length}/3)`}
            </h3>
            <button
              onClick={() => {
                setShowIconSelector(!showIconSelector);
                setUnsavedChanges(true);
              }}
              className="text-[10px] bg-pink-900/30 text-pink-300 border border-pink-500/30 px-2 py-1 rounded hover:bg-pink-900/50 transition"
            >
              {showIconSelector ? "CLOSE LIST" : "OPEN LIST"}
            </button>
          </div>

          {showIconSelector ? (
            <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {icons.map((icon) => {
                const isSelected = selectedIcons.find((i) => i.id === icon.id);
                return (
                  <button
                    key={icon.id}
                    onClick={() => toggleIconSelection(icon)}
                    className={`p-1 rounded-lg transition-all border border-transparent ${
                      isSelected
                        ? "bg-pink-600/20 border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                        : "hover:bg-white/10 hover:border-white/20"
                    }`}
                    title={icon.name}
                  >
                    <img
                      src={icon.src}
                      alt={icon.name}
                      className="w-full aspect-square rounded-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex gap-2">
              {selectedIcons.length === 0 && (
                <span className="text-sm text-gray-600 italic">
                  No idols selected.
                </span>
              )}
              {selectedIcons.map((icon) => (
                <img
                  key={icon.id}
                  src={icon.src}
                  className="w-10 h-10 rounded-full border border-pink-500/50"
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleDownload}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
        >
          <Download size={20} /> INITIALIZE PRINT
        </button>
      </div>

      {/* --- RIGHT COLUMN: PREVIEW --- */}
      <div className="flex-1 bg-[#0a0c10] rounded-3xl border border-white/10 flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-2xl z-10 min-h-[500px]">
        {/* Ubah baris ini untuk menerapkan skala dinamis */}
        <div
          className={`transform origin-top transition-transform duration-300 mt-10 lg:mt-0 ${getPreviewScale()}`}
        >
          <div
            ref={cardRef}
            data-card-capture="true"
            className="w-fit h-fit shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden bg-gray-900 mx-auto ring-1 ring-white/10"
          >
            {/* TERUSKAN PROP TEMPLATE KE KOMPONEN IDCARD */}
            <IDCard
              title={activeAgency}
              group={group}
              // @ts-ignore
              level={level}
              rank={rank}
              profilePic={profilePic}
              inputText={inputText}
              setInputText={setInputText}
              jpId={jpId}
              setJpId={setJpId}
              setUnsavedChanges={setUnsavedChanges}
              setName={setManagerName}
              name={managerName}
              selectedIcon={selectedIcons}
              // Prop baru untuk desain
              template={activeTemplate}
              getSpriteUrl={(name, type) => getCharacterImageUrl(name, type)}
              bgUrl={bgCardUrl}
            />
          </div>
        </div>
      </div>

      {/* --- MODAL CARD SELECTOR --- */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#161b22] border border-white/10 w-full max-w-4xl h-[80vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-pink-900/20 to-transparent">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Background Art Selection
              </h2>
              <button
                onClick={() => setShowCardModal(false)}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-[#0d1117] border-b border-white/10">
              <input
                type="text"
                placeholder="Search card by title or idol name..."
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:ring-1 focus:ring-pink-500 outline-none text-white font-mono"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 scrollbar-thin">
              {cards
                .filter(
                  (c) =>
                    c.title.global
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    c.sourceName
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                )
                .slice(0, 50)
                .map((card) => (
                  <button
                    key={card.uniqueId}
                    onClick={() => {
                      // Mengambil gambar full art card evolved (atau normal jika tidak ada)
                      const url =
                        card.images.fullEvolved || card.images.fullNormal;
                      setBgCardUrl(url);
                      setShowCardModal(false);
                    }}
                    className="flex flex-col items-center bg-[#1f2937]/50 border border-white/5 hover:border-pink-500 rounded-xl p-3 transition-all hover:scale-[1.02]"
                  >
                    <img
                      src={card.images.icon}
                      className="w-20 h-20 rounded-lg object-cover mb-2 shadow-lg"
                      crossOrigin="anonymous"
                    />
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      {card.sourceName}
                    </span>
                    <span className="text-xs text-center font-bold text-gray-200 line-clamp-2 mt-1">
                      {card.title.global}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

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

export default KTPManager;
