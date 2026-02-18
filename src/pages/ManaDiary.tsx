import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileText,
  Clock,
} from "lucide-react";
import axios from "axios";

const API_BASE = "https://beip.dasewasia.my.id/api/manaDiary";
const R2_BASE_URL = "https://apiip.dasewasia.my.id";

interface DiaryEntry {
  filename: string;
  date: string; // "2016-06-01"
  year: string;
  month: string;
  day: string;
}

const ManaDiaryPage: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"jp" | "en">("jp");

  // State
  const [currentDate, setCurrentDate] = useState(new Date(2016, 4, 1)); // Juni 2016
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

  // 1. FETCH DATA
  useEffect(() => {
    axios
      .get(`${API_BASE}/diaryMana.json`)
      .then((res) => {
        const data = res.data;
        setEntries(data);

        if (data.length > 0) {
          const firstEntry = data.find(
            (e: DiaryEntry) => e.year === "2016" && e.month === "05",
          );
          if (firstEntry) setSelectedEntry(firstEntry);
          else setSelectedEntry(data[0]);
        }
      })
      .catch((err) => console.error("Gagal load diary manifest:", err))
      .finally(() => setLoading(false));
  }, []);

  // 2. LOGIKA URL GAMBAR
  const getImageUrl = (entry: DiaryEntry) => {
    if (language === "jp") {
      return `${R2_BASE_URL}/diaryManaJapanese/${entry.filename}`;
    } else {
      const jpgFilename = entry.filename.replace(".png", ".jpg");
      return `${R2_BASE_URL}/diaryManaGlobal/${jpgFilename}`;
    }
  };

  // 3. LOGIKA KALENDER
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const getEntryForDay = (day: number) => {
    const yearStr = currentDate.getFullYear().toString();
    const monthStr = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");

    return entries.find(
      (e) =>
        (e.year === yearStr || e.year === yearStr.slice(2)) &&
        e.month === monthStr &&
        e.day === dayStr,
    );
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f172a] text-pink-400 font-mono tracking-widest animate-pulse">
        ACCESSING ARCHIVE...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 font-sans pb-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(236, 72, 153, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(236, 72, 153, 0.05) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>
      {/* Decorative Gradient Orbs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-pink-600/20 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed top-1/2 -right-40 w-[30rem] h-[30rem] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-10 relative z-10">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6 mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-pink-400 mb-1">
              <span className="text-[10px] tracking-[0.3em] font-bold uppercase">
                Private Archive
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter text-white flex items-center gap-3">
              MANA'S{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                DIARY&nbsp;
              </span>
            </h1>
          </div>

          {/* Language Switcher (Skewed Style) */}
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage("jp")}
              className={`px-6 py-2 transform skew-x-[-12deg] font-bold text-sm transition-all border border-white/10 ${
                language === "jp"
                  ? "bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                  : "bg-slate-900/50 text-slate-500 hover:text-white"
              }`}
            >
              <span className="block transform skew-x-[12deg]">JAPANESE</span>
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-6 py-2 transform skew-x-[-12deg] font-bold text-sm transition-all border border-white/10 ${
                language === "en"
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  : "bg-slate-900/50 text-slate-500 hover:text-white"
              }`}
            >
              <span className="block transform skew-x-[12deg]">GLOBAL</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* --- LEFT COLUMN: CALENDAR (5 cols) --- */}
          <div className="lg:col-span-5 sticky top-24">
            {/* Calendar Container */}
            <div
              className="bg-[#161b22]/90 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)",
              }}
            >
              {/* Month Navigation */}
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-pink-900/20 to-transparent border-b border-white/5">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-white/5 rounded transition-colors text-gray-400 hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                  <span className="block text-xs text-pink-400 font-bold tracking-widest uppercase">
                    Select Date
                  </span>
                  <h2 className="text-xl font-bold text-white font-mono tracking-tight">
                    {currentDate
                      .toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                      .toUpperCase()}
                  </h2>
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-white/5 rounded transition-colors text-gray-400 hover:text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Days Grid */}
              <div className="p-6">
                <div className="grid grid-cols-7 mb-4 text-center">
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-[10px] text-gray-500 font-bold tracking-wider"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {[...Array(firstDayOfMonth)].map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const entry = getEntryForDay(day);
                    const hasEntry = !!entry;
                    const isSelected =
                      selectedEntry &&
                      entry &&
                      selectedEntry.date === entry.date;

                    return (
                      <button
                        key={day}
                        disabled={!hasEntry}
                        onClick={() => entry && setSelectedEntry(entry)}
                        className={`
                          relative h-10 w-full flex items-center justify-center text-sm font-bold transition-all duration-200 group
                          ${
                            isSelected
                              ? "bg-pink-600 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)] border border-pink-400"
                              : hasEntry
                                ? "bg-slate-800/50 text-white hover:bg-pink-900/30 hover:border-pink-500/50 border border-transparent"
                                : "text-gray-700 cursor-default"
                          }
                        `}
                        // Membuat sudut sedikit miring
                        style={{
                          clipPath:
                            "polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)",
                        }}
                      >
                        {day}
                        {hasEntry && !isSelected && (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-pink-500 rounded-full shadow-[0_0_5px_#ec4899]"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-6 py-3 bg-[#0d1117] text-[10px] text-gray-500 border-t border-white/5 flex items-center gap-2 font-mono">
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></div>
                AVAILABLE RECORDS
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: IMAGE VIEWER (7 cols) --- */}
          <div className="lg:col-span-7">
            {selectedEntry ? (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Meta Info Bar */}
                <div className="flex items-center justify-between bg-white/5 border border-white/10 px-4 py-2 rounded-t-lg backdrop-blur">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-pink-300">
                      <CalendarIcon size={14} />
                      <span className="text-sm font-mono font-bold">
                        {selectedEntry.date}
                      </span>
                    </div>
                    <div className="h-4 w-[1px] bg-white/10"></div>
                    <div className="flex items-center gap-2 text-blue-300">
                      <FileText size={14} />
                      <span className="text-xs font-mono uppercase tracking-wide">
                        {language === "jp" ? "Original" : "Translated"}
                      </span>
                    </div>
                  </div>
                  <a
                    href={getImageUrl(selectedEntry)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition"
                    title="Maximize"
                  >
                    <Maximize2 size={16} />
                  </a>
                </div>

                {/* Image Container - Looks like a file viewer */}
                <div className="relative bg-[#1a1d26] border border-white/10 p-2 shadow-2xl">
                  {/* Decorative Corners */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-pink-500/50"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-pink-500/50"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-pink-500/50"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-pink-500/50"></div>

                  <div className="bg-[#fdfbf7] relative overflow-hidden flex items-center justify-center min-h-[400px]">
                    {/* Paper Texture Overlay */}
                    <div className="absolute inset-0 bg-yellow-900/5 pointer-events-none mix-blend-multiply opacity-50" />

                    <img
                      src={getImageUrl(selectedEntry)}
                      alt={`Diary ${selectedEntry.date}`}
                      className="w-full h-auto max-h-[70vh] object-contain shadow-inner"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono px-2">
                  <span>FILE: {selectedEntry.filename}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> SYSTEM TIME:{" "}
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ) : (
              // Empty State
              <div className="h-[400px] flex flex-col items-center justify-center text-gray-600 bg-white/5 rounded-xl border border-white/10 border-dashed">
                <BookOpen size={48} className="mb-4 opacity-20" />
                <p className="font-mono text-sm tracking-widest uppercase">
                  Select data to retrieve
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManaDiaryPage;
