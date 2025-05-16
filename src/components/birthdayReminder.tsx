import React, { useState, useEffect, useRef } from "react";
import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Character } from "../interfaces/Character";

const getCharacterImageUrl = (
  characterName: string,
  type: "icon" | "sprite1" | "sprite2" | "banner"
) => {
  return `https://diveidolypapi.my.id/api/img/character/${type}/${encodeURIComponent(
    characterName.toLowerCase()
  )}`;
};

const BirthdayReminder: React.FC = () => {
  const [showReminder, setShowReminder] = useState(false);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Character[]>([]);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(100);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  const duration = 10000; // 10 detik untuk animasi progress bar

  // Fetch data karakter
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://diveidolypapi.my.id/api/characters"
        );
        const data: Character[] = await response.json();

        const nowInJST = toZonedTime(new Date(), "Asia/Tokyo");
        const upcoming = data.filter((char) => {
          const bdayDate = parseISO(char.birthdayDate);
          const bdayThisYear = new Date(
            nowInJST.getFullYear(),
            bdayDate.getMonth(),
            bdayDate.getDate()
          );

          const diffInDays = Math.floor(
            (bdayThisYear.getTime() - nowInJST.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          return diffInDays >= -1 && diffInDays <= 28;
        });

        setUpcomingBirthdays(upcoming);
        setShowReminder(upcoming.length > 0);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching characters:", error);
        setIsLoading(false);
      }
    };

    fetchCharacters();

    const interval = setInterval(fetchCharacters, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Animasi progress bar
  useEffect(() => {
    if (!showReminder) return;

    const animateProgress = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const remaining = Math.max(0, duration - elapsed);
      const newProgress = (remaining / duration) * 100;

      setProgress(newProgress);

      if (remaining > 0) {
        animationRef.current = requestAnimationFrame(animateProgress);
      } else {
        setShowReminder(false);
      }
    };

    startTimeRef.current = Date.now();
    animationRef.current = requestAnimationFrame(animateProgress);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showReminder]);

  // Rotasi karakter setiap 10 detik jika ada multiple birthdays
  useEffect(() => {
    if (!showReminder || upcomingBirthdays.length === 0) return;

    const duration = 10000; // 10 detik
    const startTime = Date.now();
    let animationFrameId: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);

      setProgress(newProgress);

      if (newProgress > 0) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        setShowReminder(false);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [showReminder, upcomingBirthdays.length]);

  const handleClose = () => {
    setShowReminder(false);
    localStorage.setItem(
      "lastReminderClose",
      new Date().toISOString().split("T")[0]
    );
  };

  if (isLoading || !showReminder || upcomingBirthdays.length === 0) {
    return null;
  }

  const currentCharacter = upcomingBirthdays[currentCharacterIndex];
  const bdayDate = parseISO(currentCharacter.birthdayDate);
  const nowInJST = toZonedTime(new Date(), "Asia/Tokyo");
  const bdayThisYear = new Date(
    nowInJST.getFullYear(),
    bdayDate.getMonth(),
    bdayDate.getDate()
  );

  const daysDiff = Math.floor(
    (bdayThisYear.getTime() - nowInJST.getTime()) / (1000 * 60 * 60 * 24)
  );

  let message = "";
  if (daysDiff === 0) {
    message = `Today is ${currentCharacter.name}'s birthday! 🎉`;
  } else if (daysDiff === -1) {
    message = `Yesterday was ${currentCharacter.name}'s birthday!`;
  } else if (daysDiff > 0) {
    message = `${currentCharacter.name}'s birthday is in ${daysDiff} days!`;
  } else {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up transition-all duration-500 ease-in-out animate-slide-in-right">
      <div className="bg-white rounded-lg shadow-xl border border-pink-200 w-64 overflow-hidden">
        <div className="bg-pink-500 p-2 text-white font-bold flex justify-between items-center">
          <span>🎂 Birthday Reminder</span>
          <button
            onClick={handleClose}
            className="text-white hover:text-pink-200"
          >
            ×
          </button>
        </div>

        <div className="p-4 flex items-center gap-3">
          <img
            src={getCharacterImageUrl(currentCharacter.name, "icon")}
            alt={currentCharacter.name}
            className="w-12 h-12 rounded-full border-2 border-pink-400"
          />
          <div>
            <p className="font-medium">{message}</p>
            <p className="text-sm text-gray-600">
              {format(bdayThisYear, "MMMM do")}
            </p>
          </div>
        </div>

        {/* Progress bar yang berkurang secara animasi */}
        <div className="h-1.5 w-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-pink-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {upcomingBirthdays.length > 1 && (
          <div className="bg-gray-50 p-2 flex justify-center gap-1">
            {upcomingBirthdays.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentCharacterIndex(index);
                  setProgress(100);
                  startTimeRef.current = Date.now();
                }}
                className={`w-2 h-2 rounded-full ${
                  index === currentCharacterIndex
                    ? "bg-pink-500"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthdayReminder;
