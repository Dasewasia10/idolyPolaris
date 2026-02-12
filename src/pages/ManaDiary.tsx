import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar as CalendarIcon,
  Globe,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import axios from "axios";

const API_BASE = "https://diveidolypapi.my.id/api/manaDiary";
const R2_BASE_URL = "https://api.diveidolypapi.my.id";

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
  const [currentDate, setCurrentDate] = useState(new Date(2016, 5, 1)); // Juni 2016
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

  // 1. FETCH DATA
  useEffect(() => {
    axios
      .get(`${API_BASE}/diaryMana.json`)
      .then((res) => {
        const data = res.data;
        setEntries(data);

        // AUTO SELECT: Pilih entry pertama kali ditemukan agar kanan tidak kosong
        if (data.length > 0) {
          // Cari entry yang paling awal (biasanya index 0 kalau backend udah sort, tapi kita cari aman)
          const firstEntry = data.find(
            (e: DiaryEntry) => e.year === "2016" && e.month === "06",
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
      <div className="flex h-screen items-center justify-center bg-slate-950 text-blue-300 animate-pulse">
        Opening Records...
      </div>
    );

  return (
    <div className=" bg-slate-950 text-slate-200 font-sans pb-20 px-4">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-8 pt-10">
        <h1 className="text-3xl font-bold text-blue-200 mb-2 font-serif flex justify-center items-center gap-2">
          <BookOpen className="text-pink-400" />
          Mana's Diary
        </h1>

        {/* Language Switcher */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setLanguage(language === "jp" ? "en" : "jp")}
            className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 rounded-full border border-slate-700 hover:border-pink-500 transition-all text-sm"
          >
            <Globe size={14} />
            <span
              className={
                language === "jp" ? "text-pink-300 font-bold" : "text-slate-400"
              }
            >
              JP
            </span>
            <span className="text-slate-600">|</span>
            <span
              className={
                language === "en" ? "text-blue-300 font-bold" : "text-slate-400"
              }
            >
              EN
            </span>
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* --- LEFT COLUMN: CALENDAR (5 cols) --- */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden sticky top-24">
            {/* Month Navigation */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-700 rounded-full transition-colors"
              >
                <ChevronLeft className="text-slate-400" />
              </button>
              <h2 className="text-lg font-bold text-slate-200 font-serif">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-700 rounded-full transition-colors"
              >
                <ChevronRight className="text-slate-400" />
              </button>
            </div>

            {/* Days Grid */}
            <div className="p-4">
              <div className="grid grid-cols-7 mb-2 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-[10px] text-slate-500 font-bold uppercase tracking-wider py-2"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {[...Array(firstDayOfMonth)].map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const entry = getEntryForDay(day);
                  const hasEntry = !!entry;
                  const isSelected =
                    selectedEntry && entry && selectedEntry.date === entry.date;

                  return (
                    <button
                      key={day}
                      disabled={!hasEntry}
                      onClick={() => entry && setSelectedEntry(entry)}
                      className={`
                        relative h-9 w-full rounded-md flex items-center justify-center text-sm font-medium transition-all duration-200
                        ${
                          isSelected
                            ? "bg-pink-500 text-white ring-2 ring-pink-300 ring-offset-2 ring-offset-slate-900"
                            : hasEntry
                              ? "bg-blue-900/20 text-blue-200 hover:bg-blue-800 border border-blue-500/20"
                              : "text-slate-700 cursor-default"
                        }
                      `}
                    >
                      {day}
                      {hasEntry && !isSelected && (
                        <span className="absolute bottom-1 w-1 h-1 bg-pink-400 rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-950/50 text-center text-[10px] text-slate-500 border-t border-slate-800">
              Days with dots have diary entries.
            </div>
          </div>
          <div className="lg:col-span-2"></div>
          {/* --- RIGHT COLUMN: IMAGE VIEWER (7 cols) --- */}
          <div className="lg:col-span-5">
            {selectedEntry ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-2xl relative group">
                {/* Header Card */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-slate-900/90 to-transparent z-10 flex justify-between items-start rounded-t-2xl">
                  <div className="flex items-center gap-2 text-blue-200 bg-slate-950/50 backdrop-blur px-3 py-1 rounded-full border border-slate-700/50">
                    <CalendarIcon size={14} />
                    <span className="font-bold text-sm">
                      {new Date(selectedEntry.date).toLocaleDateString(
                        undefined,
                        { dateStyle: "long" },
                      )}
                    </span>
                  </div>
                  {/* Open Original (New Tab) */}
                  <a
                    href={getImageUrl(selectedEntry)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-950/50 backdrop-blur rounded-full hover:bg-pink-500 hover:text-white text-slate-400 transition-colors"
                    title="Open Full Size"
                  >
                    <Maximize2 size={16} />
                  </a>
                </div>

                {/* Image Container */}
                <div className="relative bg-[#fdfbf7] rounded-xl overflow-hidden min-h-[100px] flex items-center justify-center">
                  {/* Paper Texture Overlay */}
                  <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none mix-blend-multiply" />

                  <img
                    src={getImageUrl(selectedEntry)}
                    alt={`Diary ${selectedEntry.date}`}
                    className="w-max h-full object-contain max-h-[32rem]" // Constraint height biar gak kegedean
                    loading="lazy"
                  />
                </div>

                {/* Footer Info */}
                <div className="mt-2 text-right px-2">
                  <span className="text-[10px] text-slate-600 font-mono">
                    File:{" "}
                    {language === "jp"
                      ? selectedEntry.filename
                      : selectedEntry.filename.replace(".png", ".jpg")}
                  </span>
                </div>
              </div>
            ) : (
              // Empty State
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-600 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                <BookOpen size={48} className="mb-4 opacity-20" />
                <p>Select a date to read Mana's diary.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManaDiaryPage;
