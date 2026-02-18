import React, { useState, useRef, useEffect } from "react";
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";
import IDCard from "../components/IDCard"; // Pastikan path import sesuai
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
} from "lucide-react";

// --- KTP Manager ---
const KTPManager: React.FC = () => {
  // State untuk data kartu
  const [managerName, setManagerName] = useState("");
  const [inputText, setInputText] = useState("");
  const [group, setGroup] = useState("Mana Nagase");
  const [level, setLevel] = useState("100");
  const [activeAgency, setActiveAgency] = useState(
    "Hoshimi Production's Manager",
  );
  const [profilePic, setProfilePic] = useState<string | undefined>(undefined);
  const [selectedIcons, setSelectedIcons] = useState<Icon[]>([]);

  // State UI/UX
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);
  const [icons, setIcons] = useState<Icon[]>([]);
  const [showIconSelector, setShowIconSelector] = useState(false);

  // Ref untuk elemen kartu yang akan di-capture
  const cardRef = useRef<HTMLDivElement>(null);

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
    if (!cardRef.current) return;

    try {
      const node = cardRef.current;
      const blob = await domtoimage.toBlob(node, {
        quality: 1,
        cacheBust: true,
        style: {
          transform: "none",
          margin: "0",
        },
      });

      if (blob) {
        saveAs(blob, `id_card_${managerName || "manager"}.png`);
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
    if (selectedIcons.find((i) => i.id === icon.id)) {
      setSelectedIcons(selectedIcons.filter((i) => i.id !== icon.id));
    } else {
      if (selectedIcons.length < 3) {
        setSelectedIcons([...selectedIcons, icon]);
      } else {
        setToastMessage("Max 3 Oshi selected");
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

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 lg:p-8 flex flex-col lg:flex-row gap-8 font-sans relative selection:bg-blue-500 selection:text-white">
      {/* Background Texture */}
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
        {/* Header Title */}
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

        {/* 1. Profile Upload */}
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
                className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none transition-colors text-center font-mono"
              />
            </div>
          </div>
        </div>

        {/* 3. Affiliation */}
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
                  <option value="Prêt-à Porter's Manager">Prêt-à Porter</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-3 text-gray-500 pointer-events-none"
                />
              </div>
            </div>

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
          </div>
        </div>

        {/* 4. Support Idols (Oshi) */}
        <div className="bg-[#161b22]/90 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-lg relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>

          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Star size={14} /> Support Idols ({selectedIcons.length}/3)
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

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
        >
          <Download size={20} /> INITIALIZE PRINT
        </button>
      </div>

      {/* --- RIGHT COLUMN: PREVIEW --- */}
      <div className="flex-1 bg-[#0a0c10] rounded-3xl border border-white/10 flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-2xl z-10">
        {/* Decorative Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        <div className="absolute top-4 left-6 text-[10px] font-mono text-gray-500 tracking-widest flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          PREVIEW MODE
        </div>

        {/* Wrapper Scaler */}
        <div className="transform origin-top transition-transform duration-300 scale-[0.55] sm:scale-[0.70] md:scale-[0.80] xl:scale-100 mt-10 lg:mt-0">
          {/* Capture Target (DO NOT MODIFY STRUCTURE) */}
          <div
            ref={cardRef}
            data-card-capture="true"
            className="w-fit h-fit shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden bg-gray-900 mx-auto ring-1 ring-white/10"
          >
            <IDCard
              title={activeAgency}
              group={group}
              // [NOTE] level props di IDCard mungkin belum ada di interface asli yang kamu miliki,
              // tapi saya teruskan sesuai kode lama kamu.
              // @ts-ignore
              level={level}
              profilePic={profilePic}
              inputText={inputText}
              setInputText={setInputText}
              setUnsavedChanges={setUnsavedChanges}
              setName={setManagerName}
              name={managerName}
              selectedIcon={selectedIcons}
            />
          </div>
        </div>
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

export default KTPManager;
