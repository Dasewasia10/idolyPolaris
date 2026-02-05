import React, { useState, useEffect, useRef } from "react";
import { format, parseISO, startOfDay, differenceInCalendarDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Character } from "../interfaces/Character";

const BirthdayReminder: React.FC = () => {
  const [showReminder, setShowReminder] = useState(false);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Character[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(100);
  
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number | null>(null);
  const DURATION_PER_CHAR = 5000; // 5 detik per karakter

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch("https://diveidolypapi.my.id/api/characters");
        const data: Character[] = await response.json();

        // Gunakan Waktu JST (Japan Standard Time) sebagai acuan
        const nowInJST = toZonedTime(new Date(), "Asia/Tokyo");
        const todayStart = startOfDay(nowInJST);

        const upcoming = data.filter((char) => {
          const bdayDate = parseISO(char.birthdayDate);
          const bdayThisYear = new Date(
            todayStart.getFullYear(),
            bdayDate.getMonth(),
            bdayDate.getDate()
          );

          const diff = differenceInCalendarDays(bdayThisYear, todayStart);
          // Rentang H-7 sampai H+1 (Kemarin)
          return diff >= -1 && diff <= 7;
        });

        if (upcoming.length > 0) {
          setUpcomingBirthdays(upcoming);
          setShowReminder(true);
        }
      } catch (error) {
        console.error("Error fetching characters:", error);
      }
    };

    fetchCharacters();
  }, []);

  // Single Loop Animation Logic
  useEffect(() => {
    if (!showReminder || upcomingBirthdays.length === 0) return;

    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      
      const newProgress = Math.max(0, 100 - (elapsed / DURATION_PER_CHAR) * 100);
      setProgress(newProgress);

      if (elapsed >= DURATION_PER_CHAR) {
        // Jika masih ada karakter berikutnya, pindah index. Jika habis, tutup.
        if (currentIndex < upcomingBirthdays.length - 1) {
          setCurrentIndex(prev => prev + 1);
          startTimeRef.current = null; // Reset waktu untuk karakter berikutnya
        } else {
          setShowReminder(false);
        }
      } else {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [showReminder, currentIndex, upcomingBirthdays.length]);

  if (!showReminder || upcomingBirthdays.length === 0) return null;

  // Render Data
  const currentCharacter = upcomingBirthdays[currentIndex];
  const bdayDate = parseISO(currentCharacter.birthdayDate);
  const nowInJST = toZonedTime(new Date(), "Asia/Tokyo");
  const todayStart = startOfDay(nowInJST);
  const bdayThisYear = new Date(todayStart.getFullYear(), bdayDate.getMonth(), bdayDate.getDate());
  
  const daysDiff = differenceInCalendarDays(bdayThisYear, todayStart);

  const getMessage = () => {
    if (daysDiff === 0) return `Today is ${currentCharacter.name}'s birthday! 🎉`;
    if (daysDiff === -1) return `Yesterday was ${currentCharacter.name}'s birthday!`;
    if (daysDiff === 1) return `${currentCharacter.name}'s birthday is tomorrow!`;
    return `${currentCharacter.name}'s birthday is in ${daysDiff} days!`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-white rounded-lg shadow-xl border border-pink-200 w-72 overflow-hidden">
        {/* Header */}
        <div className="bg-pink-500 p-2 text-white font-bold flex justify-between items-center">
          <span className="text-sm flex items-center gap-1">🎂 Birthday Reminder</span>
          <button onClick={() => setShowReminder(false)} className="hover:text-pink-200">×</button>
        </div>

        {/* Content */}
        <div className="p-4 flex items-center gap-3">
          <img
            src={`https://diveidolypapi.my.id/api/img/character/icon/${encodeURIComponent(currentCharacter.name.toLowerCase())}`}
            alt={currentCharacter.name}
            className="w-14 h-14 rounded-full border-2 border-pink-400 object-cover"
          />
          <div className="flex-1">
            <p className="font-bold text-gray-800 leading-tight">{getMessage()}</p>
            <p className="text-xs text-gray-500 mt-1">
              {format(bdayThisYear, "MMMM do")}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100">
          <div
            className="h-full bg-pink-500 transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Pagination Indicator */}
        {upcomingBirthdays.length > 1 && (
          <div className="bg-gray-50 p-1.5 flex justify-center gap-1.5">
            {upcomingBirthdays.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full ${i === currentIndex ? 'bg-pink-500' : 'bg-gray-300'}`} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthdayReminder;