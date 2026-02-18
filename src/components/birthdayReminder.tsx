import React, { useState, useEffect, useRef } from "react";
import {
  format,
  parseISO,
  startOfDay,
  differenceInCalendarDays,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Character } from "../interfaces/Character";
import { X, Gift } from "lucide-react";

const BirthdayReminder: React.FC = () => {
  const [showReminder, setShowReminder] = useState(false);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Character[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(100);

  const requestRef = useRef<number>();
  const startTimeRef = useRef<number | null>(null);
  const DURATION_PER_CHAR = 5000;

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(
          "https://beip.dasewasia.my.id/api/characters",
        );
        const data: Character[] = await response.json();
        const nowInJST = toZonedTime(new Date(), "Asia/Tokyo");
        const todayStart = startOfDay(nowInJST);

        const upcoming = data.filter((char) => {
          const bdayDate = parseISO(char.birthdayDate);
          const bdayThisYear = new Date(
            todayStart.getFullYear(),
            bdayDate.getMonth(),
            bdayDate.getDate(),
          );
          const diff = differenceInCalendarDays(bdayThisYear, todayStart);
          return diff >= 0 && diff <= 3; // Fokus 3 hari ke depan saja agar lebih relevan
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

  useEffect(() => {
    if (!showReminder || upcomingBirthdays.length === 0) return;
    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const newProgress = Math.max(
        0,
        100 - (elapsed / DURATION_PER_CHAR) * 100,
      );
      setProgress(newProgress);

      if (elapsed >= DURATION_PER_CHAR) {
        if (currentIndex < upcomingBirthdays.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          startTimeRef.current = null;
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

  const currentCharacter = upcomingBirthdays[currentIndex];
  const bdayDate = parseISO(currentCharacter.birthdayDate);
  const nowInJST = toZonedTime(new Date(), "Asia/Tokyo");
  const todayStart = startOfDay(nowInJST);
  const bdayThisYear = new Date(
    todayStart.getFullYear(),
    bdayDate.getMonth(),
    bdayDate.getDate(),
  );
  const daysDiff = differenceInCalendarDays(bdayThisYear, todayStart);

  const getMessage = () => {
    if (daysDiff === 0) return "HAPPY BIRTHDAY!";
    if (daysDiff === 1) return "BIRTHDAY TOMORROW";
    return `BIRTHDAY IN ${daysDiff} DAYS`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right duration-500">
      <div className="bg-[#161b22] border border-pink-500/50 w-72 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.3)] overflow-hidden relative group">
        {/* Progress Bar Top */}
        <div className="h-1 w-full bg-gray-800">
          <div
            className="h-full bg-pink-500 transition-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4 flex gap-4 items-center">
          {/* Avatar with Glow */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-pink-500 rounded-full blur opacity-50 animate-pulse"></div>
            <img
              src={`https://beip.dasewasia.my.id/api/img/character/icon/${encodeURIComponent(currentCharacter.name.toLowerCase())}`}
              alt={currentCharacter.name}
              className="w-14 h-14 rounded-full border-2 border-white relative z-10 bg-gray-800 object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-pink-400 tracking-widest uppercase mb-0.5 flex items-center gap-1">
                <Gift size={10} /> Reminder
              </span>
              <button
                onClick={() => setShowReminder(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <h4 className="text-white font-bold truncate leading-tight">
              {currentCharacter.name}
            </h4>
            <p className="text-xs font-mono text-pink-200 mt-1">
              {getMessage()}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {format(bdayThisYear, "MMMM do")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthdayReminder;
