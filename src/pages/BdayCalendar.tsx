import React, { useState, useEffect } from "react";
import {
  format,
  getDaysInMonth,
  startOfMonth,
  getDay,
  parseISO,
  isValid,
} from "date-fns";
import { Character } from "../interfaces/Character";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalIcon,
  Gift,
  Moon,
  Sun,
} from "lucide-react";

const getCharacterImageUrl = (
  characterName: string,
  type: "icon" | "sprite1" | "sprite2" | "banner",
) => {
  const baseUrl = "https://api.diveidolypapi.my.id";
  const formattedName = encodeURIComponent(characterName.toLowerCase());

  switch (type) {
    case "icon":
      return `${baseUrl}/iconCharacter/chara-${formattedName}.png`;
    case "banner":
      return `${baseUrl}/bannerCharacter/banner-${formattedName}.png`;
    case "sprite1":
      return `${baseUrl}/spriteCharacter/sprite-${formattedName}-01.png`;
    case "sprite2":
      return `${baseUrl}/spriteCharacter/sprite-${formattedName}-02.png`;
    default:
      // Fallback aman jika tipe tidak dikenali
      return "";
  }
};

const CharacterCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [characters, setCharacters] = useState<Character[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // --- STATE DARK MODE DENGAN LOCAL STORAGE ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Cek localStorage saat pertama kali render
    const savedTheme = localStorage.getItem("idolyCalendarTheme");
    return savedTheme === "dark"; // Default false jika null
  });

  // Efek untuk menyimpan tema setiap kali berubah
  useEffect(() => {
    localStorage.setItem("idolyCalendarTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(
          "https://diveidolypapi.my.id/api/characters",
        );
        if (!response.ok) throw new Error("Failed to fetch characters");
        const data: Character[] = await response.json();
        const birthdayCharacters = data.filter(
          (char) => char.birthdayDate && isValid(parseISO(char.birthdayDate)),
        );
        setCharacters(birthdayCharacters);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };
    fetchCharacters();
  }, []);

  useEffect(() => {
    document.title = "Polaris Idoly | Birthday Calendar";
    return () => {
      document.title = "Polaris Idoly";
    };
  }, []);

  const getBirthdayCharacters = (day: number, month: number) => {
    return characters.filter((char) => {
      const bdayDate = parseISO(char.birthdayDate);
      return bdayDate.getDate() === day && bdayDate.getMonth() === month;
    });
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const startDay = getDay(monthStart);
    const daysInMonth = getDaysInMonth(currentDate);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const weeks = [];
    let days = [];

    const SPECIAL_EVENTS = [
      {
        day: 1,
        month: 0,
        name: "Oshougatsu (New Year)",
        color: "text-red-500",
      },
      { day: 14, month: 1, name: "Valentine's Day", color: "text-pink-400" },
      { day: 14, month: 2, name: "White Day", color: "text-blue-300" },
      {
        day: 29,
        month: 3,
        name: "Golden Week Starts",
        color: "text-yellow-500",
      },
      {
        day: 5,
        month: 4,
        name: "Children's Day (GW End)",
        color: "text-yellow-600",
      },
      { day: 7, month: 6, name: "Tanabata", color: "text-purple-400" },
      { day: 31, month: 9, name: "Halloween", color: "text-orange-500" },
      { day: 24, month: 11, name: "Christmas Eve", color: "text-green-500" },
      { day: 25, month: 11, name: "Christmas Day", color: "text-red-600" },
    ];

    // Empty cells at start
    for (let i = 0; i < startDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className={`h-20 lg:h-24 border-r border-b ${
            isDarkMode
              ? "bg-gray-900/30 border-gray-800"
              : "bg-gray-50/50 border-gray-100"
          }`}
        ></div>,
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const birthdayChars = getBirthdayCharacters(day, currentMonth);
      const today = new Date();
      const isToday =
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

      // Cek apakah hari ini Anniversary (24 Juni)
      const isAnniversary = day === 24 && currentMonth === 5;

      // Cek event jepang lainnya
      const holiday = SPECIAL_EVENTS.find(
        (e) => e.day === day && e.month === currentMonth,
      );

      days.push(
        <div
          key={`day-${day}`}
          className={`h-20 lg:h-24 p-1 border-r border-b relative group transition-all hover:z-10 
            ${
              isDarkMode
                ? "border-gray-800 bg-gray-900 hover:bg-gray-800 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                : "border-gray-200 bg-white hover:shadow-lg hover:border-blue-300"
            }
            ${
              isToday
                ? isDarkMode
                  ? "bg-blue-900/20 shadow-[inset_0_0_20px_rgba(37,99,235,0.2)]"
                  : "bg-blue-50/50 ring-2 ring-blue-400 ring-inset"
                : ""
            }
          `}
        >
          {/* Day Number */}
          <div className="flex justify-end">
            {isAnniversary && (
              <span className="text-[7px] lg:text-[9px] font-black text-yellow-500 leading-none uppercase">
                ✨ {getAnniversaryText(currentYear)}
              </span>
            )}
            {holiday && (
              <span className="text-[7px] lg:text-[8px] font-bold text-pink-500 leading-none uppercase">
                {holiday.name}
              </span>
            )}
            <span
              className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                isToday
                  ? "bg-blue-600 text-white font-bold"
                  : isDarkMode
                    ? "text-gray-400 group-hover:text-white"
                    : "text-gray-500"
              }`}
            >
              {day}
            </span>
          </div>

          {/* Character Icons */}
          <div className="flex flex-wrap content-end gap-1 h-full pb-4 px-1">
            {birthdayChars.map((char) => (
              <div
                key={char.id}
                className="relative group/avatar transition-transform hover:scale-125 hover:z-20"
              >
                <img
                  src={getCharacterImageUrl(char.name, "icon")}
                  alt={char.name}
                  className={`w-12 h-12 rounded-full border-2 object-cover ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800"
                      : "border-white bg-gray-100 shadow-md"
                  }`}
                />
                {/* Tooltip */}
                <div
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/avatar:block px-2 py-1 rounded text-[10px] whitespace-nowrap z-50 font-bold shadow-xl ${
                    isDarkMode
                      ? "bg-blue-600 text-white"
                      : "bg-gray-900 text-white"
                  }`}
                >
                  {char.name}
                  <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${
                      isDarkMode ? "border-t-blue-600" : "border-t-gray-900"
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>,
      );

      if ((day + startDay) % 7 === 0 || day === daysInMonth) {
        // Pad end
        if (day === daysInMonth && (day + startDay) % 7 !== 0) {
          const remaining = 7 - ((day + startDay) % 7);
          for (let j = 0; j < remaining; j++) {
            days.push(
              <div
                key={`empty-end-${j}`}
                className={`h-20 lg:h-24 border-r border-b ${
                  isDarkMode
                    ? "bg-gray-900/30 border-gray-800"
                    : "bg-gray-50/50 border-gray-100"
                }`}
              ></div>,
            );
          }
        }
        weeks.push(
          <div
            key={`week-${day}`}
            className="grid grid-cols-7 border-l border-t"
            style={{ borderColor: isDarkMode ? "#1f2937" : "#e5e7eb" }}
          >
            {days}
          </div>,
        );
        days = [];
      }
    }

    return weeks;
  };

  const changeMonth = (months: number) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + months, 1),
    );
  };

  const getAnniversaryText = (viewYear: number) => {
    const startYear = 2021;
    const yearDiff = viewYear - startYear;

    if (yearDiff <= 0) return "Game Launch";

    // Logika penambahan suffix (st, nd, rd, th)
    const j = yearDiff % 10,
      k = yearDiff % 100;
    if (j === 1 && k !== 11) return `${yearDiff}st Anniversary`;
    if (j === 2 && k !== 12) return `${yearDiff}nd Anniversary`;
    if (j === 3 && k !== 13) return `${yearDiff}rd Anniversary`;
    return `${yearDiff}th Anniversary`;
  };

  return (
    <div
      className={`transition-colors duration-500 min-h-screen p-4 flex flex-col items-center ${isDarkMode ? "bg-[#0f1115]" : "bg-gray-100"}`}
    >
      <div
        className={`flex gap-4 lg:gap-8 z-10 w-full mx-auto p-6 rounded-2xl shadow-xl max-w-7xl max-h-[90vh] relative overflow-hidden flex-col lg:flex-row font-sans transition-colors duration-500 ${
          isDarkMode
            ? "bg-[#161b22] text-gray-200 border border-white/10"
            : "bg-white text-gray-800"
        }`}
      >
        {/* --- TOGGLE DARK MODE --- */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`absolute top-4 right-4 z-50 p-2 rounded-full transition-all duration-300 ${
            isDarkMode
              ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }`}
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* --- BACKGROUND ELEMENTS --- */}
        {/* Grid Pattern */}
        <div
          className={`absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-500 ${isDarkMode ? "opacity-5" : "opacity-10"}`}
          style={{
            backgroundImage: isDarkMode
              ? "radial-gradient(#ffffff 1px, transparent 1px)"
              : "radial-gradient(#e5e7eb 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Trapezoid Decoration */}
        <div
          className={`absolute w-full h-[36rem] clip-trapezoid-outer 
            [background-size:var(--spacing)_var(--spacing)] 
            [--dot-size:3px] [--spacing:12px] transition-all duration-500`}
          style={{
            backgroundImage: `radial-gradient(circle at center, var(--dot-color) var(--dot-size), transparent var(--dot-size))`,
            // @ts-ignore
            "--dot-color": isDarkMode ? "#374151" : "#E0E1EC",
          }}
        />

        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-r pointer-events-none transition-colors duration-500 ${
            isDarkMode
              ? "from-[#161b22] via-transparent to-[#161b22]"
              : "from-white via-transparent to-white"
          }`}
        />

        {/* Side Accent */}
        <div className="absolute inset-0 bottom-0 left-0 w-2 h-full bg-blue-500" />

        {/* Top Right Triangle */}
        <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="100,0 100,100 0,0" className="fill-blue-400" />
          </svg>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full overflow-hidden relative z-10">
          {/* --- MAIN CALENDAR SECTION --- */}
          <section className="flex flex-col flex-[3] h-full overflow-hidden">
            {/* Header Controls */}
            <div
              className={`flex justify-between items-center mb-6 p-4 rounded-xl shadow-lg border transition-colors duration-300 ${
                isDarkMode
                  ? "bg-[#0d1117] border-white/10"
                  : "bg-gray-900 text-white border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md">
                  <CalIcon size={20} />
                </div>
                <div>
                  <h2
                    className={`text-xl font-bold tracking-tight uppercase ${isDarkMode ? "text-white" : "text-white"}`}
                  >
                    {format(currentDate, "MMMM yyyy")}
                  </h2>
                  <span className="text-[10px] text-gray-400 font-mono tracking-widest">
                    SCHEDULE SYSTEM
                  </span>
                </div>
              </div>

              <div
                className={`flex gap-1 p-1 rounded-lg border transition-colors ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="w-[1px] bg-gray-700 my-1"></div>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 text-center mb-2">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, i) => (
                <div
                  key={d}
                  className={`text-xs font-black tracking-widest py-2 rounded-t-md ${
                    i === 0
                      ? "text-red-500"
                      : i === 6
                        ? "text-blue-500"
                        : isDarkMode
                          ? "text-gray-500"
                          : "text-gray-400"
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid Container */}
            <div
              className={`border rounded-xl shadow-inner scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent flex-1 transition-colors duration-300 ${
                isDarkMode
                  ? "bg-[#0d1117] border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              {renderCalendar()}
            </div>
          </section>

          {/* --- SIDEBAR LIST --- */}
          <aside
            className={`flex flex-col flex-1 min-w-[280px] border rounded-xl p-4 shadow-lg h-full overflow-hidden transition-colors duration-300 ${
              isDarkMode
                ? "bg-[#0d1117] border-white/10"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div
              className={`flex items-center gap-2 mb-4 pb-3 border-b ${isDarkMode ? "border-white/10" : "border-gray-200"}`}
            >
              <Gift className="text-pink-500" size={20} />
              <h3
                className={`font-bold uppercase tracking-wide text-sm ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
              >
                Birthdays List
              </h3>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {characters
                .filter(
                  (char) =>
                    parseISO(char.birthdayDate).getMonth() ===
                    currentDate.getMonth(),
                )
                .sort(
                  (a, b) =>
                    parseISO(a.birthdayDate).getDate() -
                    parseISO(b.birthdayDate).getDate(),
                )
                .map((char) => (
                  <div
                    key={char.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all border shadow-sm hover:shadow-md group ${
                      isDarkMode
                        ? "bg-[#161b22] border-white/5 hover:border-blue-500/30 hover:bg-[#1f2937]"
                        : "bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    {/* Date Badge */}
                    <div
                      className={`flex flex-col items-center justify-center min-w-[3rem] h-12 rounded-lg transition-colors ${
                        isDarkMode
                          ? "bg-gray-800 text-gray-400 group-hover:bg-blue-900/30 group-hover:text-blue-400"
                          : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                      }`}
                    >
                      <span className="text-lg font-black leading-none">
                        {parseISO(char.birthdayDate).getDate()}
                      </span>
                      <span className="text-[9px] uppercase font-bold opacity-60">
                        {format(parseISO(char.birthdayDate), "MMM")}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-bold text-sm truncate ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
                      >
                        {char.name}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono mt-0.5">
                        Idoly Pride
                      </p>
                    </div>

                    {/* Mini Avatar */}
                    <img
                      src={getCharacterImageUrl(char.name, "icon")}
                      alt={char.name}
                      className={`w-8 h-8 rounded-full border bg-gray-50 ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}
                    />
                  </div>
                ))}

              {characters.filter(
                (char) =>
                  parseISO(char.birthdayDate).getMonth() ===
                  currentDate.getMonth(),
              ).length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm italic">
                  No birthdays this month.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CharacterCalendar;
