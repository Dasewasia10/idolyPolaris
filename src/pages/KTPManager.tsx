import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import IDCard from "../components/IDCard"; // Pastikan path import sesuai
import { Icon } from "../interfaces/Icon"; // Sesuaikan dengan interface Icon kamu
import axios from "axios";
import Toast from "../components/Toast"; // Komponen Toast opsional

// Definisikan tipe untuk Icon jika belum ada
// interface Icon {
//   id: number;
//   name: string;
//   src: string;
// }

const KTPManager: React.FC = () => {
  // State untuk data kartu
  const [managerName, setManagerName] = useState("");
  const [inputText, setInputText] = useState("");
  const [group, setGroup] = useState("Mana Nagase");
  const [activeAgency, setActiveAgency] = useState(
    "Hoshimi Production's Manager",
  );
  const [profilePic, setProfilePic] = useState<string | undefined>(undefined);
  const [selectedIcons, setSelectedIcons] = useState<Icon[]>([]);

  // State UI/UX
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);
  const [icons, setIcons] = useState<Icon[]>([]); // Data master icon untuk pilihan
  const [showIconSelector, setShowIconSelector] = useState(false);

  // Ref untuk elemen kartu yang akan di-capture
  const cardRef = useRef<HTMLDivElement>(null);

  // Load data icon (opsional, sesuaikan dengan API kamu)
  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const response = await axios.get(
          "https://diveidolypapi.my.id/api/characters",
        );
        // Proses response untuk mendapatkan array icon
        // Contoh sederhana:
        const processedIcons = response.data.map(
          (char: any, index: number) => ({
            id: index,
            name: char.name,
            src: `https://api.diveidolypapi.my.id/iconCharacter/chara-${char.name.toLowerCase().replace(/\s+/g, "")}.png`,
          }),
        );
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
        // Limit 2MB
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
      // Tunggu sebentar untuk memastikan aset ter-load
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // Resolusi tinggi (Retina)
        useCORS: true,
        allowTaint: true,
        // PENTING: Opsi ini mencegah gambar terpotong di layar HP
        windowWidth: 1200,
        windowHeight: 1200,
        // PENTING: Memastikan elemen yang di-capture ukurannya normal (scale 1)
        onclone: (clonedDoc) => {
          // Cari elemen yang di-capture di dalam DOM tiruan (cloned)
          // Kita cari berdasarkan class atau struktur, tapi karena kita capture cardRef,
          // clonedDoc.body akan berisi elemen tersebut.

          // Trik: Kita paksa elemen wrapper di dalam clone untuk reset transform
          // agar hasil download tetap ukuran asli (tidak mengecil/terpotong)
          const clonedCard = clonedDoc.querySelector(
            '[data-card-capture="true"]',
          );
          if (clonedCard) {
            (clonedCard as HTMLElement).style.transform = "none";
          }
        },
      });

      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `id_card_${managerName || "manager"}.png`);
          setToastMessage("ID Card downloaded successfully!");
          setIsSuccess(true);
          setUnsavedChanges(false);
        }
      });
    } catch (error) {
      console.error("Download failed:", error);
      setToastMessage("Failed to generate image");
      setIsSuccess(false);
    }
  };

  // Handler Select Icon (Oshi)
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
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col lg:flex-row gap-8">
      {/* Kolom Kiri: Form Input */}
      <div className="flex-1 space-y-6 max-w-xl">
        <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex justify-center lg:justify-start">
          Manager ID Creator
        </h1>

        {/* Upload Foto */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700 cursor-pointer"
          />
        </div>

        {/* Input Nama & Pesan (Sudah di-handle di dalam IDCard, tapi kita perlu state lift-up) */}
        {/* Di sini IDCard menerima props untuk update state parent */}

        {/* Group Selector */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Group Affiliation
          </label>
          <select
            value={group}
            onChange={(e) => {
              setGroup(e.target.value);
              setUnsavedChanges(true);
            }}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Mana Nagase">Mana Nagase</option>
            <option value="Tsuki no Tempest">Tsuki no Tempest</option>
            <option value="Sunny Peace">Sunny Peace</option>
            <option value="TRINITYAiLE">TRINITYAiLE</option>
            <option value="LizNoir">LizNoir</option>
            <option value="IIIX">IIIX</option>
          </select>
        </div>

        {/* Agency Selector */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Agency Affiliation
          </label>
          <select
            value={activeAgency}
            onChange={(e) => {
              setActiveAgency(e.target.value);
              setUnsavedChanges(true);
            }}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Hoshimi Production's Manager">
              Hoshimi Production
            </option>
            <option value="Van Production's Manager">Van Production</option>
            <option value="Prêt-à Porter's Manager">Prêt-à Porter</option>
          </select>
        </div>

        {/* Oshi Selector Trigger */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-400">
              Select Oshi (Max 3)
            </label>
            <button
              onClick={() => {
                setShowIconSelector(!showIconSelector);
                setUnsavedChanges(true);
              }}
              className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
            >
              {showIconSelector ? "Hide List" : "Show List"}
            </button>
          </div>

          {showIconSelector && (
            <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-900 rounded-lg">
              {icons.map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => toggleIconSelection(icon)}
                  className={`p-1 rounded-lg transition-all ${
                    selectedIcons.find((i) => i.id === icon.id)
                      ? "bg-blue-600 ring-2 ring-blue-400"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <img
                    src={icon.src}
                    alt={icon.name}
                    className="w-10 h-10 rounded-full mx-auto"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleDownload}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition hover:scale-105 active:scale-95"
          >
            Download ID Card
          </button>
        </div>
      </div>

      {/* Kolom Kanan: Preview Kartu */}
      <div className="flex-1 flex items-start justify-center bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-700 p-4 lg:p-8 min-h-[500px] overflow-hidden">
        {/* Wrapper Scaler: 
            Ini yang bertugas mengecilkan tampilan di layar HP agar muat.
            - origin-top: Agar mengecil ke arah atas-tengah
            - scale-[0.6]: Di HP ukurannya 60%
            - sm:scale-75: Di Tablet ukurannya 75%
            - xl:scale-100: Di Layar besar ukurannya 100%
        */}
        <div className="transform origin-top transition-transform duration-300 scale-[0.55] sm:scale-[0.70] md:scale-[0.80] xl:scale-100 mt-4 lg:mt-0">
          {/* Capture Target:
              Ini adalah elemen ASLI yang ukurannya tetap 32rem (512px).
              Kita pasang ref di sini.
              data-card-capture digunakan oleh onclone di atas untuk identifikasi.
          */}
          <div
            ref={cardRef}
            data-card-capture="true"
            className="w-fit h-fit shadow-2xl rounded-2xl overflow-hidden bg-gray-900 mx-auto"
          >
            <IDCard
              title={activeAgency}
              group={group}
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
