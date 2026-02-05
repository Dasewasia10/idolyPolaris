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

const getCharacterImageUrl = (
  characterName: string,
  type: "icon" | "sprite1" | "sprite2" | "banner"
) => {
  return `https://diveidolypapi.my.id/api/img/character/${type}/${encodeURIComponent(
    characterName.toLowerCase()
  )}`;
};

// const allowedGroups = [
//   "Tsuki no Tempest",
//   "Sunny Peace",
//   "TRINITYAiLE",
//   "LizNoir",
//   "IIIX",
//   "Mana Nagase",
// ];

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

        // const filteredCharacters = data.filter((idol) =>
        //   allowedGroups.includes(idol.groupName)
        // );
        // setCharacters(filteredCharacters);

        const birthdayCharacters = data.filter((char) => 
          char.birthdayDate && isValid(parseISO(char.birthdayDate))
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

    const weeks = [];
    let days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 md:h-20 lg:h-24 p-1 border"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const birthdayChars = getBirthdayCharacters(day, currentMonth);
      const today = new Date();
      const isToday =
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

      days.push(
        <div
          key={`day-${day}`}
          className={`h-16 md:h-20 lg:h-24 p-1 border relative group ${
            isToday ? "bg-blue-100/30 border-blue-400 border-2" : ""
          }`}
        >
          <div className={`text-right text-xs md:text-sm ${isToday ? "font-bold text-blue-800" : ""}`}>
            {day}
          </div>
          <div className="flex flex-wrap gap-0.5 md:gap-1 mt-1">
            {birthdayChars.map((char) => (
              <div key={char.id} className="relative group/avatar">
                <img
                  src={getCharacterImageUrl(char.name, "icon")}
                  alt={char.name}
                  className="w-6 h-6 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full border border-gray-200"
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 hidden group-hover/avatar:block bg-black/80 text-white p-1 rounded text-[10px] whitespace-nowrap z-50">
                  {char.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      if ((day + startDay) % 7 === 0 || day === daysInMonth) {
        // Pad the last week with empty cells if necessary
        if (day === daysInMonth && (day + startDay) % 7 !== 0) {
            const remaining = 7 - ((day + startDay) % 7);
            for(let j = 0; j < remaining; j++) {
                days.push(<div key={`empty-end-${j}`} className="h-16 md:h-20 lg:h-24 p-1 border"></div>);
            }
        }
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

  const changeMonth = (months: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + months, 1));
  };

  return (
    <div className="flex gap-2 lg:gap-6 z-10 w-full mx-auto p-4 bg-white rounded-lg shadow-md max-w-6xl max-h-[90vh] relative overflow-hidden flex-col lg:flex-row">
      {/* Background & Decoration (Sama seperti sebelumnya) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="flex flex-col lg:flex-row gap-4 w-full overflow-y-auto pr-2">
        <section className="flex flex-col flex-[3] z-10">
          <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded-xl">
            <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-white shadow-sm rounded-lg hover:bg-gray-100 transition-colors">&lt; Prev</button>
            <h2 className="text-lg font-bold text-gray-700">{format(currentDate, "MMMM yyyy")}</h2>
            <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-white shadow-sm rounded-lg hover:bg-gray-100 transition-colors">Next &gt;</button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-500 mb-2">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => <div key={d}>{d}</div>)}
          </div>

          <div className="border rounded-xl overflow-hidden shadow-inner bg-gray-50/50">
            {renderCalendar()}
          </div>
        </section>

        <aside className="flex flex-col flex-1 z-20 min-w-[250px]">
          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Birthdays This Month:</h3>
          <div className="flex flex-col gap-2 overflow-y-auto">
            {characters
              .filter(char => parseISO(char.birthdayDate).getMonth() === currentDate.getMonth())
              .sort((a, b) => parseISO(a.birthdayDate).getDate() - parseISO(b.birthdayDate).getDate())
              .map((char) => (
                <div key={char.id} className="flex items-center gap-3 p-2 hover:bg-pink-50 rounded-xl transition-all border border-transparent hover:border-pink-100">
                  <div className="relative">
                    <img
                      src={getCharacterImageUrl(char.name, "icon")}
                      alt={char.name}
                      className="w-10 h-10 rounded-full border-2 border-pink-200"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                      {parseISO(char.birthdayDate).getDate()}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm leading-none">{char.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{format(parseISO(char.birthdayDate), "MMMM do")}</p>
                  </div>
                </div>
              ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CharacterCalendar;