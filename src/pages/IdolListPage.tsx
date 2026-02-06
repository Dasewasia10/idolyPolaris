import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import QnAModal from "../components/QnAModal";
import { Character } from "../interfaces/Character";
import {
  getCharacter3ImageUrl,
  getGiftItemImageUrl,
  getGroupImageUrl,
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
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [selectedIdol, setSelectedIdol] = useState<Character | null>(null);

  const [animationDirection] = useState("right");

  const [showQnA, setShowQnA] = useState(false);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [qnaSources, setQnaSources] = useState<any[]>([]);

  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "gifts" | "description"
  >("description");
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

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


  // Title Page Dynamic
  useEffect(() => {
    document.title = "Polaris Idoly | Idol Database";

    return () => {
      document.title = "Polaris Idoly";
    };
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

  const handleNavigation = (path: string) => {
    navigate(path);
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
    <div className="p-4 z-10 transition-all duration-500 ease-out gap-4 flex flex-col">
      {/* Group Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevGroup}
          accessKey="g"
          className="relative bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 transition z-10"
          title="Alt + G"
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
          {/* <div className="absolute -bottom-3 -right-5 bg-slate-500 py-3 px-1 text-white text-xs rounded-full w-12 h-5 flex items-center justify-center">
            Alt + G
          </div> */}
        </button>

        <h2 className="text-2xl font-bold text-white text-center bg-slate-800 mx-6 py-2 w-full">
          {currentGroup}
        </h2>

        <button
          onClick={nextGroup}
          accessKey="h"
          className="relative bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 transition z-10"
          title="Alt + H"
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
          {/* <div className="absolute -bottom-3 -left-5 bg-slate-500 py-3 px-1 text-white text-xs rounded-full w-12 h-5 flex items-center justify-center">
            Alt + H
          </div> */}
        </button>
      </div>

      <div className="flex">
        {/* Group Members List */}
        <div className="rounded-lg p-4 absolute z-20 bottom-12 lg:bottom-10">
          <div className="flex gap-3 transition-all duration-500 ease-out py-2">
            {currentGroupMembers.map((idol: Character, index: number) => {
              const accessKey = (index + 1).toString();

              return (
                <motion.div
                  key={idol.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedIdol(idol)}
                  className={`cursor-pointer rounded-lg overflow-hidden relative`}
                  style={{ borderTop: `4px solid ${idol.color}` }}
                  accessKey={accessKey}
                  tabIndex={0}
                  role="button"
                  title={`Alt + ${accessKey}`}
                >
                  <img
                    src={getCharacterImageUrl(idol.name, "banner")}
                    alt=""
                    className="w-12 md:w-16 lg:w-20 h-auto object-cover select-none"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable="false"
                    onDragStart={(e) => e.preventDefault()}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-idol.png";
                    }}
                    aria-hidden="true"
                  />
                  <div className="p-2 bg-slate-900 w-12 md:w-16 lg:w-20 ">
                    <h3 className="text-xs font-semibold text-white truncate">
                      {idol.name}
                    </h3>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Idol Detail View - Now always shows at least the first member */}
        <div className="w-full h-[30rem] z-0">
          {selectedIdol && (
            <section className="relative flex flex-col items-center">
              {!isMobile && (
                <div className="absolute w-20 h-20 p-2 flex flex-row gap-2 top-12 left-40 transition-all duration-500 ease-out z-20">
                  <img
                    src={getGiftItemImageUrl(selectedIdol.name)}
                    alt="Give 40pt"
                    title="Give 40pt"
                    className="w-full h-full object-cover rounded-lg shadow-lg bg-white"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable="false"
                    onDragStart={(e) => e.preventDefault()}
                    onError={(e) => {
                      e.currentTarget.src = `${
                        import.meta.env.BASE_URL
                      }assets/default_image.png`;
                      e.currentTarget.alt = "Image not available";
                    }}
                  />
                  <img
                    src={getGiftItemImageUrl(selectedIdol.name, 1)}
                    alt="Give 100pt"
                    title="Give 100pt"
                    className="w-full h-full object-cover rounded-lg shadow-lg bg-white"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable="false"
                    onDragStart={(e) => e.preventDefault()}
                    onError={(e) => {
                      e.currentTarget.src = `${
                        import.meta.env.BASE_URL
                      }assets/default_image.png`;
                      e.currentTarget.alt = "Image not available";
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  backgroundColor: `#${selectedIdol.color}`,
                  color: `${
                    isColorDark(selectedIdol.color || "#000000")
                      ? "#FFFFFF"
                      : "#000000"
                  }`,
                }}
                className={`relative rounded-lg shadow-lg border-4 border-slate-900 overflow-hidden transition-all duration-500 ease-out w-full ${
                  isMobile ? "h-[25rem]" : "h-auto"
                }`}
              >
                {/* Gambar akan mengikuti lebar parent dan height auto */}
                <img
                  src={getCharacter3ImageUrl(selectedIdol.name)}
                  alt={selectedIdol.name}
                  className={`absolute w-full h-max -translate-y-40 object-cover object-top opacity-50 select-none ${
                    isMobile ? "hidden" : "block"
                  }`}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-idol.png";
                  }}
                />
                {!isMobile && (
                  <div className="absolute top-4 left-4 text-slate-900 justify-self-center z-[50] flex flex-col gap-4">
                    {hasQnAData(selectedIdol.name, qnaSources) && (
                      <button
                        onClick={() => openQnA(selectedIdol)}
                        className="px-4 py-2 bg-slate-700 text-white rounded-full transition-all duration-300 ease-out hover:bg-slate-900 hover:ring-2 hover:ring-slate-400"
                      >
                        <span className="font-semibold px-2">QnA</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleNavigation("/stat")}
                      className="px-4 py-2 bg-slate-700 text-white rounded-full transition-all duration-300 ease-out hover:bg-slate-900 hover:ring-2 hover:ring-slate-400"
                    >
                      <span className="font-semibold px-2">Idol Stat</span>
                    </button>
                    <button className="px-4 py-2 bg-slate-700 text-white rounded-full transition-all duration-300 ease-out hover:bg-slate-900 hover:ring-2 hover:ring-slate-400 cursor-not-allowed overflow-hidden relative">
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <img
                          src={`${import.meta.env.BASE_URL}assets/lock-16.png`}
                          onContextMenu={(e) => e.preventDefault()}
                          draggable="false"
                          onDragStart={(e) => e.preventDefault()}
                          alt="locked"
                        />
                      </div>
                      <span className="font-semibold px-2">Gallery</span>
                    </button>
                    <button className="px-4 py-2 bg-slate-700 text-white rounded-full transition-all duration-300 ease-out hover:bg-slate-900 hover:ring-2 hover:ring-slate-400 cursor-not-allowed overflow-hidden relative">
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <img
                          src={`${import.meta.env.BASE_URL}assets/lock-16.png`}
                          onContextMenu={(e) => e.preventDefault()}
                          draggable="false"
                          onDragStart={(e) => e.preventDefault()}
                          alt="locked"
                        />
                      </div>
                      <span className="font-semibold px-2">Trivia</span>
                    </button>
                  </div>
                )}
                {!isMobile && (
                  <div className="absolute top-40 left-40 z-[50] max-w-xs transition-all duration-500 ease-out ring-2 rounded-lg">
                    {/* Container utama bubble dengan ekor */}
                    <div className="relative">
                      {/* Bubble utama */}
                      <div className="px-4 py-2 bg-slate-700 text-white rounded-lg">
                        <div className="whitespace-pre-line">
                          {(selectedIdol.introduction ?? []).join("\n")}
                        </div>
                      </div>

                      {/* Ekor bubble (arah kanan atas) */}
                      <div className="absolute top-4 -right-1 w-4 h-4 bg-slate-700 transform rotate-45 origin-bottom-left" />
                    </div>
                  </div>
                )}
                <div className="absolute w-2/3 h-full clip-trapezoid-with-gap right-0">
                  <div className="absolute w-full h-full clip-trapezoid-outer bg-[radial-gradient(circle_at_center,_var(--dot-color)_var(--dot-size),_transparent_var(--dot-size))] [background-size:var(--spacing)_var(--spacing)] [--dot-color:#E0E1EC] [--dot-size:3px] [--spacing:12px]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white translate-x-40" />
                  <img
                    className={`w-auto h-max object-cover justify-center rounded-lg absolute opacity-20 transition-all duration-300 ease-out select-none ${
                      selectedIdol.groupName === "Tsuki no Tempest"
                        ? "top-8 -right-52"
                        : selectedIdol.groupName === "TRINITYAiLE"
                        ? "top-0 -right-52"
                        : selectedIdol.groupName === "LizNoir"
                        ? "top-2 -right-52"
                        : "top-12 -right-52"
                    }`}
                    src={getGroupImageUrl(selectedIdol.groupName)}
                    alt="groupLogo"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable="false"
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
                {!isMobile && (
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    {/* Idol Info */}
                    <div className="relative flex-grow h-[28rem] z-30 items-end flex flex-col">
                      <h1 className="text-3xl font-bold capitalize text-slate-900">
                        {selectedIdol.name} {selectedIdol.familyName}{" "}
                        {selectedIdol.japaneseName
                          ? `(${selectedIdol.japaneseName})`
                          : ""}
                      </h1>
                      <div className="text-center flex gap-2 my-3">
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-700 text-white flex items-center">
                          <img
                            className="inline w-4 h-4 mr-2 -ml-1"
                            src={`${
                              import.meta.env.BASE_URL
                            }assets/icons8-podcast-24.png`}
                            onContextMenu={(e) => e.preventDefault()}
                            draggable="false"
                            onDragStart={(e) => e.preventDefault()}
                            alt="CV"
                          />
                          CV :{" "}
                          {selectedIdol.japaneseSeiyuuName
                            ? selectedIdol.japaneseSeiyuuName
                            : selectedIdol.seiyuuName}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-700 text-white flex items-center">
                          <img
                            className="inline w-4 h-4 mr-2 -ml-1"
                            src={`${
                              import.meta.env.BASE_URL
                            }assets/icons8-location-24.png`}
                            onContextMenu={(e) => e.preventDefault()}
                            draggable="false"
                            onDragStart={(e) => e.preventDefault()}
                            alt="school"
                          />
                          {selectedIdol.school
                            ? selectedIdol.school
                            : "Unknown"}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-700 text-white flex items-center">
                          <img
                            className="inline w-4 h-4 mr-2"
                            src={`${
                              import.meta.env.BASE_URL
                            }assets/icons8-badge-24.png`}
                            onContextMenu={(e) => e.preventDefault()}
                            draggable="false"
                            onDragStart={(e) => e.preventDefault()}
                            alt="badge"
                          />
                          {selectedIdol.badge
                            ? selectedIdol.badge +
                              " (" +
                              selectedIdol.japaneseBadge +
                              ")"
                            : "Unknown"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-10 w-full my-4">
                        <span className="col-start-7 col-span-4 px-4 py-2 text-black rounded-lg font-semibold text-justify border-slate-900 border-b-2 shadow-xl bg-white bg-opacity-10">
                          {selectedIdol.desc}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                        <div className="col-start-6 rounded-lg font-semibold p-4 font-bold flex items-end transition-all duration-300 ease-out w-24">
                          <div
                            style={{
                              backgroundColor: `#${selectedIdol.color}`,
                              color: `#${selectedIdol.color}`,
                            }}
                            className="select-none"
                          >
                            {selectedIdol.name}
                            <div className="text-xs mt-1">
                              #{selectedIdol.color}
                            </div>
                          </div>
                        </div>
                        <div className="col-start-7 col-span-2 text-black rounded-lg font-semibold p-4 font-bold">
                          <h3 className="text-lg font-bold mb-2">Profile</h3>
                          <div className="space-y-1 font-normal">
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
                        <div className="col-start-9 col-span-2 text-black rounded-lg font-semibold p-4">
                          <h3 className="text-lg font-bold mb-2 ">Details</h3>
                          <div className="space-y-1 font-normal">
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
                )}
                {isMobile && (
                  <div className="flex flex-col md:flex-row gap-3 p-3">
                    {/* Idol Info */}
                    <div className="relative flex-grow h-auto items-end flex flex-col">
                      <h1 className="text-3xl font-bold capitalize text-slate-900">
                        {selectedIdol.name} {selectedIdol.familyName}{" "}
                        {selectedIdol.japaneseName
                          ? `(${selectedIdol.japaneseName})`
                          : ""}
                      </h1>
                      <div className="text-center flex flex-col gap-1 z-10 bg-blend-multiply w-32 mt-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-700 text-white flex items-center">
                          <img
                            className="inline w-4 h-4 mr-2 -ml-1"
                            src={`${
                              import.meta.env.BASE_URL
                            }assets/icons8-podcast-24.png`}
                            onContextMenu={(e) => e.preventDefault()}
                            draggable="false"
                            onDragStart={(e) => e.preventDefault()}
                            alt="CV"
                          />
                          CV :{" "}
                          {selectedIdol.japaneseSeiyuuName
                            ? selectedIdol.japaneseSeiyuuName
                            : selectedIdol.seiyuuName}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-700 text-white flex items-center">
                          <img
                            className="inline w-4 h-4 mr-2 -ml-1"
                            src={`${
                              import.meta.env.BASE_URL
                            }assets/icons8-location-24.png`}
                            onContextMenu={(e) => e.preventDefault()}
                            draggable="false"
                            onDragStart={(e) => e.preventDefault()}
                            alt="school"
                          />
                          {selectedIdol.school
                            ? selectedIdol.school
                            : "Unknown"}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-700 text-white flex items-center">
                          <img
                            className="inline w-4 h-4 mr-2"
                            src={`${
                              import.meta.env.BASE_URL
                            }assets/icons8-badge-24.png`}
                            onContextMenu={(e) => e.preventDefault()}
                            draggable="false"
                            onDragStart={(e) => e.preventDefault()}
                            alt="badge"
                          />
                          {selectedIdol.badge
                            ? selectedIdol.badge +
                              " (" +
                              selectedIdol.japaneseBadge +
                              ")"
                            : "Unknown"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                        <div className="col-start-6 rounded-lg font-semibold p-4 font-bold flex items-end transition-all duration-300 ease-out w-24">
                          <div
                            style={{
                              backgroundColor: `#${selectedIdol.color}`,
                              color: `#${selectedIdol.color}`,
                            }}
                            className="select-none"
                          >
                            {selectedIdol.name}
                            <div className="text-xs mt-1">
                              #{selectedIdol.color}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {!isMobile && (
                <div className="absolute w-full h-[calc(100vh-3rem)] overflow-hidden -top-32 border-b-4 border-slate-900 rounded-lg">
                  <div className="relative w-full h-full transition-all duration-500 ease-out">
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
                          src={getCharacterImageUrl(
                            selectedIdol.name,
                            "sprite2"
                          )}
                          initial={{ x: 100 }}
                          animate={{ x: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            willChange: "transform",
                          }}
                          alt={selectedIdol.name}
                          className="w-auto h-auto max-w-full max-h-full z-10 select-none"
                          onContextMenu={(e) => e.preventDefault()}
                          draggable="false"
                          onDragStart={(e) => e.preventDefault()}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-idol.png";
                          }}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              )}
              {isMobile && (
                <div className="absolute max-w-[66rem] max-h-[66rem] overflow-hidden rounded-lg -left-28">
                  <div className="relative w-full h-full transition-all duration-500 ease-out">
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
                          src={getCharacterImageUrl(
                            selectedIdol.name,
                            "sprite2"
                          )}
                          initial={{ x: 100 }}
                          animate={{ x: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            willChange: "transform",
                          }}
                          alt={selectedIdol.name}
                          className="w-full h-full z-10 select-none"
                          onContextMenu={(e) => e.preventDefault()}
                          draggable="false"
                          onDragStart={(e) => e.preventDefault()}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-idol.png";
                          }}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
        {selectedIdol && isMobile && (
          <section id="rightConsole" className="absolute z-30">
            <div
              className={`fixed right-0 top-0 h-full bg-slate-900 transition-all duration-300 ease-in-out flex mt-20 ${
                isRightMenuOpen ? "translate-x-0 w-72" : "translate-x-full"
              }`}
            >
              <button
                onClick={() => setIsRightMenuOpen(!isRightMenuOpen)}
                className={`absolute top-1/3 h-16 bg-slate-900 text-white rounded-l-md hover:bg-slate-700 transition-all flex items-center justify-center py-10 ${
                  isRightMenuOpen
                    ? "w-8 -left-8"
                    : "w-16 -left-12 animate-[bounce-left_3s_infinite]"
                }`}
              >
                {isRightMenuOpen ? (
                  ">"
                ) : (
                  <span className="inline-flex items-center px-2">
                    <span className="pr-1">&lt;</span>
                    <span>Detail here</span>
                  </span>
                )}
              </button>

              <div className="w-full bg-slate-900 p-4 overflow-y-auto max-w-72">
                <h2 className="flex font-bold text-3xl text-white py-2">
                  {selectedIdol.name}
                </h2>
                <div className="flex flex-col gap-4 bg-white p-4 rounded-md">
                  <div className="flex gap-2 border-b border-gray-300 text-sm">
                    {["description", "profile", "gifts"].map((tab) => (
                      <button
                        key={tab}
                        className={`px-4 py-2 font-semibold capitalize w-fit ${
                          activeTab === tab
                            ? "border-b-4 border-blue-500 text-blue-600"
                            : "text-gray-600 truncate"
                        }`}
                        onClick={() =>
                          setActiveTab(
                            tab as "profile" | "gifts" | "description"
                          )
                        }
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div>
                    {activeTab === "description" && (
                      <div className="overflow-auto max-h-[40vh] scrollbar-minimal">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col bg-gray-200 p-4 rounded-md">
                            <h3 className="text-center font-bold mb-2">
                              Description
                            </h3>
                            <p>{selectedIdol.desc}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "profile" && (
                      <div className="overflow-auto max-h-[40vh] scrollbar-minimal space-y-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col bg-gray-200 p-4 rounded-md">
                            <h3 className="text-center font-bold mb-2">
                              Profile
                            </h3>
                            <div className="space-y-1 font-normal">
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
                          <div className="flex flex-col bg-gray-200 p-4 rounded-md">
                            <h3 className="text-center font-bold mb-2">
                              Details
                            </h3>
                            <div className="space-y-1 font-normal">
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
                        <div className="flex flex-col gap-4">
                          {hasQnAData(selectedIdol.name, qnaSources) && (
                            <button
                              onClick={() => openQnA(selectedIdol)}
                              className="px-4 py-2 bg-slate-700 text-white rounded-full transition-all duration-300 ease-out hover:bg-slate-900 hover:ring-2 hover:ring-slate-400"
                            >
                              <span className="font-semibold px-2">QnA</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleNavigation("/stat")}
                            className="px-4 py-2 bg-slate-700 text-white rounded-full transition-all duration-300 ease-out hover:bg-slate-900 hover:ring-2 hover:ring-slate-400"
                          >
                            <span className="font-semibold px-2">
                              Idol Stat
                            </span>
                          </button>
                          <button className="px-4 py-2 bg-slate-700 text-white rounded-full transition-all duration-300 ease-out hover:bg-slate-900 hover:ring-2 hover:ring-slate-400 cursor-not-allowed overflow-hidden relative">
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                              <img
                                src={`${
                                  import.meta.env.BASE_URL
                                }assets/lock-16.png`}
                                onContextMenu={(e) => e.preventDefault()}
                                draggable="false"
                                onDragStart={(e) => e.preventDefault()}
                                alt="locked"
                              />
                            </div>
                            <span className="font-semibold px-2">Gallery</span>
                          </button>
                          <button className="px-4 py-2 bg-slate-700 text-white rounded-full transition-all duration-300 ease-out hover:bg-slate-900 hover:ring-2 hover:ring-slate-400 cursor-not-allowed overflow-hidden relative">
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                              <img
                                src={`${
                                  import.meta.env.BASE_URL
                                }assets/lock-16.png`}
                                onContextMenu={(e) => e.preventDefault()}
                                draggable="false"
                                onDragStart={(e) => e.preventDefault()}
                                alt="locked"
                              />
                            </div>
                            <span className="font-semibold px-2">Trivia</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === "gifts" && (
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-center gap-4">
                          <img
                            src={getGiftItemImageUrl(selectedIdol.name)}
                            onContextMenu={(e) => e.preventDefault()}
                            draggable="false"
                            onDragStart={(e) => e.preventDefault()}
                            alt="Give 40pt"
                            className="w-16 h-16 object-cover rounded-lg shadow-lg bg-white"
                          />
                          <img
                            src={getGiftItemImageUrl(selectedIdol.name, 1)}
                            onContextMenu={(e) => e.preventDefault()}
                            draggable="false"
                            onDragStart={(e) => e.preventDefault()}
                            alt="Give 100pt"
                            className="w-16 h-16 object-cover rounded-lg shadow-lg bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
      {showQnA && selectedIdol && (
        <div className="fixed inset-0 flex z-50 translate-y-8 transition-all duration-500 ease-linear">
          <QnAModal
            character={selectedIdol}
            onClose={() => setShowQnA(false)}
            allCharacters={allCharacters}
            qnaSources={qnaSources}
          />
        </div>
      )}
    </div>
  );
};

export default IdolListPage;
