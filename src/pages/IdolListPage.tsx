import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QnAModal from "../components/QnaModal";
import { Character } from "../interfaces/Character";
import {
  getGroupImageUrl,
  getMusicJacketGroupImageUrl,
} from "../utils/imageUtils";
import { QnASource } from "../interfaces/QnA";

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

const IdolListPage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [selectedIdol, setSelectedIdol] = useState<Character | null>(null);

  const [animationDirection] = useState("right");

  const [showQnA, setShowQnA] = useState(false);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [qnaSources, setQnaSources] = useState<any[]>([]);


  function formatDateToDM(dateString: string): string {
    const [_year, month, day] = dateString.split("-");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dayNumber = parseInt(day);
    let suffix = "th";

    if (dayNumber % 100 >= 11 && dayNumber % 100 <= 13) {
      suffix = "th";
    } else {
      switch (dayNumber % 10) {
        case 1:
          suffix = "st";
          break;
        case 2:
          suffix = "nd";
          break;
        case 3:
          suffix = "rd";
          break;
        default:
          suffix = "th";
          break;
      }
    }

    return `${monthNames[parseInt(month) - 1]} ${dayNumber}${suffix}`;
  }

  // Group characters by groupName
  const groupBy = <T, K extends keyof any>(
    array: T[],
    keyExtractor: (item: T) => K
  ) => {
    return array.reduce((acc, current) => {
      const key = keyExtractor(current);
      (acc[key] = acc[key] || []).push(current);
      return acc;
    }, {} as Record<K, T[]>);
  };

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

        const groups = groupBy(
          filteredCharacters,
          (idol: Character) => idol.groupName
        );
        const orderedGroupNames = allowedGroups.filter(
          (groupName) => groups[groupName]
        );

        if (orderedGroupNames.length > 0) {
          setSelectedIdol(groups[orderedGroupNames[0]][0]);
        }

        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charactersRes, qnaRes] = await Promise.all([
          fetch("https://www.diveidolypapi.my.id/api/characters"),
          fetch("https://www.diveidolypapi.my.id/api/qnas"),
        ]);

        const charactersData = await charactersRes.json();
        const qnaData = await qnaRes.json();

        setAllCharacters(charactersData);
        setQnaSources(Array.isArray(qnaData) ? qnaData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const openQnA = (idol: Character) => {
    setSelectedIdol(idol);
    setShowQnA(true);
  };

  const hasQnAData = (characterName: string, qnaSources: QnASource[]) => {
    return qnaSources.some(
      (source) => source.name.toLowerCase() === characterName.toLowerCase()
    );
  };

  const groups = groupBy(characters, (character) => character.groupName);

  // Urutkan member dalam setiap group - center pertama
  const sortedGroups = Object.fromEntries(
    Object.entries(groups).map(([groupName, members]) => [
      groupName,
      [...members].sort((a, b) => (b.isCenter ? 1 : 0) - (a.isCenter ? 1 : 0)),
    ])
  );
  const groupNames = allowedGroups.filter(
    (groupName) => sortedGroups[groupName]
  );

  const currentGroup = groupNames[selectedGroupIndex];
  const currentGroupMembers = sortedGroups[currentGroup] || [];

  const nextGroup = () => {
    const newIndex = (selectedGroupIndex + 1) % groupNames.length;
    setSelectedGroupIndex(newIndex);
    // Auto-select first member of new group
    setSelectedIdol(sortedGroups[groupNames[newIndex]][0]);
  };

  const prevGroup = () => {
    const newIndex =
      (selectedGroupIndex - 1 + groupNames.length) % groupNames.length;
    setSelectedGroupIndex(newIndex);
    // Auto-select first member of new group
    setSelectedIdol(sortedGroups[groupNames[newIndex]][0]);
  };

  const isColorDark = (color: string) => {
    // Remove the hash if present
    color = color.replace("#", "");

    // Convert to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Calculate brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return true if dark, false if light
    return brightness < 128;
  };

  if (loading)
    return <div className="text-white text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center py-8">Error: {error}</div>;

  return (
    <div className="p-4 z-10 transition-all duration-500 ease-out">
      {/* Group Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevGroup}
          className="bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 transition z-20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-white text-center bg-slate-800 mx-6 py-2 w-full">
          {currentGroup}
        </h2>

        <button
          onClick={nextGroup}
          className="bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 transition z-20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="flex">
        {/* Group Members List */}
        <div className="rounded-lg p-4 absolute z-20 bottom-10">
          <div className="flex gap-3 transition-all duration-500 ease-out">
            {currentGroupMembers.map((idol: Character) => (
              <motion.div
                key={idol.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedIdol(idol)}
                className={`cursor-pointer rounded-lg overflow-hidden`}
                style={{ borderTop: `4px solid ${idol.color}` }}
              >
                <img
                  src={getCharacterImageUrl(idol.name, "banner")}
                  alt={idol.name}
                  className="w-20 h-max object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-idol.png";
                  }}
                />
                <div className="p-2 bg-slate-900">
                  <h3 className="text-xs font-semibold text-white truncate">
                    {idol.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Idol Detail View - Now always shows at least the first member */}
        <div className="z-10 w-full h-[30rem]">
          {selectedIdol && (
            <section className="relative flex flex-col items-center">
              <div
                style={{
                  backgroundColor: `#${selectedIdol.color}`,
                  color: `${
                    isColorDark(selectedIdol.color || "#000000")
                      ? "#FFFFFF"
                      : "#000000"
                  }`,
                }}
                className="relative rounded-lg shadow-lg border-4 border-slate-900 overflow-hidden transition-all duration-500 ease-out"
              >
                {/* Gambar akan mengikuti lebar parent dan height auto */}
                <img
                  src={getMusicJacketGroupImageUrl(selectedIdol.groupName)}
                  alt={selectedIdol.groupName}
                  className="absolute w-full h-max -translate-y-40 object-cover object-top opacity-50"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-idol.png";
                  }}
                />
                <img
                  className={`w-auto h-[24rem] object-cover justify-center mx-auto rounded-lg absolute left-0 right-0 ${
                    selectedIdol.groupName === "Tsuki no Tempest"
                      ? "top-16"
                      : "top-12"
                  }`}
                  src={getGroupImageUrl(selectedIdol.groupName)}
                  alt="groupLogo"
                />
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  {/* Idol Info */}
                  <div className="flex-grow h-[28rem] z-30">
                    <h1 className="text-3xl font-bold capitalize">
                      {selectedIdol.name} {selectedIdol.familyName}{" "}
                      {selectedIdol.japaneseName
                        ? `(${selectedIdol.japaneseName})`
                        : ""}
                    </h1>
                    <div className="flex gap-2 my-3">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-700 text-white">
                        VA :{" "}
                        {selectedIdol.japaneseSeiyuuName
                          ? selectedIdol.japaneseSeiyuuName
                          : selectedIdol.seiyuuName}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-700 text-white">
                        {selectedIdol.school ? selectedIdol.school : "Unknown"}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-700 text-white">
                        {selectedIdol.badge
                          ? selectedIdol.badge +
                            " (" +
                            selectedIdol.japaneseBadge +
                            ")"
                          : "Unknown"}
                      </span>
                    </div>
                    <div className="bg-white w-2/3 px-4 py-2 text-black rounded-lg">
                      {selectedIdol.desc}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-6">
                      <div className="col-start-1 text-slate-900 justify-self-center">
                        {hasQnAData(selectedIdol.name, qnaSources) && (
                          <button
                            onClick={() => openQnA(selectedIdol)}
                            className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-800 border-white border-2"
                          >
                            View QnA
                          </button>
                        )}
                      </div>
                      <div className="col-start-3 text-slate-900 bg-white rounded-lg p-4">
                        <h3 className="text-lg font-bold mb-2">Profile</h3>
                        <div className="space-y-1">
                          <p>
                            <span className="font-medium">Birthday:</span>{" "}
                            {formatDateToDM(selectedIdol.birthdayDate)}
                          </p>
                          <p>
                            <span className="font-medium">Height:</span>{" "}
                            {selectedIdol.numeralStat.height} cm
                          </p>
                          <p>
                            <span className="font-medium">Weight:</span>{" "}
                            {selectedIdol.numeralStat.weight} kg
                          </p>
                          <p>
                            <span className="font-medium">B/W/H:</span>{" "}
                            {selectedIdol.numeralStat.bust}/
                            {selectedIdol.numeralStat.waist}/
                            {selectedIdol.numeralStat.hip}
                          </p>
                        </div>
                      </div>
                      <div className="col-start-4 text-slate-900 bg-white rounded-lg p-4">
                        <h3 className="text-lg font-bold mb-2 ">Details</h3>
                        <div className="space-y-1">
                          <p>
                            <span className="font-medium">Like:</span>{" "}
                            {selectedIdol.like}
                          </p>
                          <p>
                            <span className="font-medium">Dislike:</span>{" "}
                            {selectedIdol.dislike}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute w-full h-[39.5rem] overflow-hidden -top-32 border-b-4 border-slate-900 rounded-lg half-right-border">
                <div className="absolute w-max transition-all duration-500 ease-out overflow-hidden translate-x-80 right-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedIdol.name}
                      custom={animationDirection}
                      initial={{
                        x: animationDirection === "right" ? 300 : -300,
                        opacity: 0,
                      }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{
                        x: animationDirection === "right" ? -300 : 300,
                        opacity: 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <motion.img
                        src={getCharacterImageUrl(selectedIdol.name, "sprite2")}
                        initial={{ x: 100 }}
                        animate={{ x: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          willChange: "transform",
                        }}
                        alt={selectedIdol.name}
                        className="w-max h-[66rem] z-10"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-idol.png";
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
      {showQnA && selectedIdol && (
        <QnAModal
          character={selectedIdol}
          onClose={() => setShowQnA(false)}
          allCharacters={allCharacters}
          qnaSources={qnaSources}
        />
      )}
    </div>
  );
};

export default IdolListPage;
