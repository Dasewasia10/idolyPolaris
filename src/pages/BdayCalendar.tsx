import React, { useState, useEffect } from "react";
import {
  format,
  getDaysInMonth,
  startOfMonth,
  getDay,
  parseISO,
} from "date-fns";
import { Character } from "../interfaces/Character";

const getCharacterImageUrl = (
  characterName: string,
  type: "icon" | "sprite1" | "sprite2" | "banner"
) => {
  return `https://diveidolypapi.my.id/api/img/character/${type}/${encodeURIComponent(
    characterName.toLowerCase()
  )}`;
};

const allowedGroups = [
  "Tsuki no Tempest",
  "Sunny Peace",
  "TRINITYAiLE",
  "LizNoir",
  "IIIX",
  "Mana Nagase",
];

const CharacterCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [characters, setCharacters] = useState<Character[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(
          "https://diveidolypapi.my.id/api/characters"
        );
        if (!response.ok) throw new Error("Failed to fetch characters");

        const data: Character[] = await response.json();

        const filteredCharacters = data.filter((idol) =>
          allowedGroups.includes(idol.groupName)
        );
        setCharacters(filteredCharacters);

        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  // Fungsi untuk mendapatkan karakter yang berulang tahun pada tanggal tertentu
  const getBirthdayCharacters = (day: number, month: number) => {
    return characters.filter((char) => {
      const bdayDate = parseISO(char.birthdayDate);
      return bdayDate.getDate() === day && bdayDate.getMonth() === month;
    });
  };

  // Render kalender
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const startDay = getDay(monthStart);
    const daysInMonth = getDaysInMonth(currentDate);
    const currentMonth = currentDate.getMonth();
    // const currentYear = currentDate.getFullYear();

    const weeks = [];
    let days = [];

    // Tambahkan hari kosong untuk minggu pertama
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 p-1 border"></div>);
    }

    // Render setiap hari dalam bulan
    for (let day = 1; day <= daysInMonth; day++) {
      const birthdayChars = getBirthdayCharacters(day, currentMonth);

      days.push(
        <div key={`day-${day}`} className="h-24 p-1 border relative group">
          <div className="text-right">{day}</div>
          <div className="flex flex-wrap gap-1">
            {birthdayChars.map((char) => (
              <div key={char.id} className="relative">
                <img
                  src={getCharacterImageUrl(char.name, "icon")}
                  alt={char.name}
                  className="w-16 h-16 rounded-full border border-gray-300 transition-transform"
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-white p-1 rounded shadow-md text-xs whitespace-nowrap z-10">
                  {char.name}'s Birthday
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      // Mulai baris baru setiap minggu
      if ((day + startDay) % 7 === 0 || day === daysInMonth) {
        weeks.push(
          <div key={`week-${day}`} className="grid grid-cols-7">
            {days}
          </div>
        );
        days = [];
      }
    }

    return weeks;
  };

  // Navigasi bulan
  const changeMonth = (months: number) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + months, 1)
    );
  };

  return (
    <div className="flex gap-10 z-10 justify-center w-full mx-auto p-4 bg-white rounded-lg shadow-md max-w-5xl max-h-[38rem] mt-2 relative overflow-hidden">
      {/* Background dengan pola dots */}
      <div
        className="absolute w-full h-[36rem] clip-trapezoid-outer 
          bg-[radial-gradient(circle_at_center,_var(--dot-color)_var(--dot-size),_transparent_var(--dot-size))] 
          [background-size:var(--spacing)_var(--spacing)] 
          [--dot-color:#E0E1EC] 
          [--dot-size:3px] [--spacing:12px]"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white" />

      {/* Pinggir kiri */}
      <div className="absolute inset-0 bottom-0 left-0 w-8 h-full bg-blue-400" />

      {/* Segitiga kanan atas */}
      <div className="absolute top-0 right-0 w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="100,0 100,100 0,0" className="fill-blue-400" />
        </svg>
      </div>

      <section className="w-full max-w-2xl z-10">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            &lt; Prev
          </button>
          <h2 className="text-xl font-bold p-2 rounded-lg w-max bg-gradient-to-r from-transparent via-white to-transparent text-center px-10">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Next &gt;
          </button>
        </div>
        {/* Header hari */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-semibold p-2">
              {day}
            </div>
          ))}
        </div>
        {/* Kalender */}
        <div className="border rounded-lg overflow-hidden h-[30rem]">
          {renderCalendar()}
        </div>
      </section>

      {/* Legenda */}
      <div className="mt-6 z-20">
        <h3 className="font-bold mb-2">Birthdays This Month:</h3>
        {characters.filter((char) => {
          const bdayDate = parseISO(char.birthdayDate);
          return bdayDate.getMonth() === currentDate.getMonth();
        }).length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {characters
              .filter((char) => {
                const bdayDate = parseISO(char.birthdayDate);
                return bdayDate.getMonth() === currentDate.getMonth();
              })
              .sort((a, b) => {
                const aDate = parseISO(a.birthdayDate).getDate();
                const bDate = parseISO(b.birthdayDate).getDate();
                return aDate - bDate;
              })
              .map((char) => (
                <div
                  key={char.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                >
                  <div className="relative">
                    <img
                      src={getCharacterImageUrl(char.name, "icon")}
                      alt={char.name}
                      className="w-10 h-10 rounded-full border-2 border-pink-400"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {parseISO(char.birthdayDate).getDate()}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{char.name}</p>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(char.birthdayDate), "MMMM do")}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500">No birthdays this month</p>
        )}
      </div>
    </div>
  );
};

export default CharacterCalendar;
