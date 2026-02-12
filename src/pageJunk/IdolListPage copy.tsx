import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import QnAModal from "../components/QnAModal";
import { Character } from "../interfaces/Character";
import {
  getGiftItemImageUrl,
  getSpecialGiftItemImageUrl,
  getGroupImageUrl,
} from "../utils/imageUtils";
import { QnASource } from "../interfaces/QnA";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Info,
  Gift,
  Lock,
} from "lucide-react";

const getCharacterImageUrl = (
  characterName: string,
  type: "icon" | "sprite1" | "sprite2" | "banner",
) => {
  return `https://diveidolypapi.my.id/api/img/character/${type}/${encodeURIComponent(
    characterName.toLowerCase(),
  )}`;
};

const allowedGroups = [
  "Tsuki no Tempest",
  "Sunny Peace",
  "TRINITYAiLE",
  "LizNoir",
  "IIIX",
  "Mana Nagase",
  "Collaboration",
];

const preloadImages = async (imageUrls: string[]) => {
  const promises = imageUrls.map((src) => {
    return new Promise((resolve, _reject) => {
      const img = new Image();
      img.src = src;
      img.onload = resolve;
      img.onerror = resolve;
    });
  });
  await Promise.all(promises);
};

const IdolListPage: React.FC = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [selectedIdol, setSelectedIdol] = useState<Character | null>(null);
  const [showQnA, setShowQnA] = useState(false);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [qnaSources, setQnaSources] = useState<any[]>([]);
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);
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

  const groupBy = <T, K extends keyof any>(
    array: T[],
    keyExtractor: (item: T) => K,
  ) => {
    return array.reduce(
      (acc, current) => {
        const key = keyExtractor(current);
        (acc[key] = acc[key] || []).push(current);
        return acc;
      },
      {} as Record<K, T[]>,
    );
  };

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(
          "https://diveidolypapi.my.id/api/characters",
        );
        if (!response.ok) throw new Error("Failed to fetch characters");
        const data: Character[] = await response.json();
        const filteredCharacters = data.filter((idol) =>
          allowedGroups.includes(idol.groupName),
        );
        setCharacters(filteredCharacters);
        const groups = groupBy(
          filteredCharacters,
          (idol: Character) => idol.groupName,
        );
        const orderedGroupNames = allowedGroups.filter(
          (groupName) => groups[groupName],
        );
        if (orderedGroupNames.length > 0) {
          setSelectedIdol(groups[orderedGroupNames[0]][0]);
        }
        setLoading(false);
        const spriteUrls = filteredCharacters.map((char) =>
          getCharacterImageUrl(char.name, "sprite2"),
        );
        const bannerUrls = filteredCharacters.map((char) =>
          getCharacterImageUrl(char.name, "banner"),
        );
        preloadImages([...spriteUrls, ...bannerUrls]).then(() =>
          console.log("All character assets preloaded!"),
        );
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
  const hasQnAData = (characterName: string, qnaSources: QnASource[]) =>
    qnaSources.some(
      (source) => source.name.toLowerCase() === characterName.toLowerCase(),
    );

  const groups = groupBy(characters, (character) => character.groupName);
  const sortedGroups = Object.fromEntries(
    Object.entries(groups).map(([groupName, members]) => [
      groupName,
      [...members].sort((a, b) => (b.isCenter ? 1 : 0) - (a.isCenter ? 1 : 0)),
    ]),
  );
  const groupNames = allowedGroups.filter(
    (groupName) => sortedGroups[groupName],
  );
  const currentGroup = groupNames[selectedGroupIndex];
  const currentGroupMembers = sortedGroups[currentGroup] || [];

  const nextGroup = () => {
    const newIndex = (selectedGroupIndex + 1) % groupNames.length;
    setSelectedGroupIndex(newIndex);
    setSelectedIdol(sortedGroups[groupNames[newIndex]][0]);
  };

  const prevGroup = () => {
    const newIndex =
      (selectedGroupIndex - 1 + groupNames.length) % groupNames.length;
    setSelectedGroupIndex(newIndex);
    setSelectedIdol(sortedGroups[groupNames[newIndex]][0]);
  };

  const handleNavigation = (path: string) => navigate(path);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-cyan-500 font-mono animate-pulse bg-[#0f1115]">
        INITIALIZING DATABASE...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-mono bg-[#0f1115]">
        ERROR: {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 md:p-8 font-sans relative overflow-hidden selection:bg-pink-500 selection:text-white">
      {/* Background Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6">
        {/* GROUP NAVIGATION (Updated Style) */}
        <div className="flex items-center justify-between bg-[#161b22]/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-lg relative z-30">
          <button
            onClick={prevGroup}
            className="p-3 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white group"
          >
            <ChevronLeft
              size={24}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>

          <div className="text-center flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-1">
              Current Group
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter drop-shadow-md">
              {currentGroup}
            </h2>
          </div>

          <button
            onClick={nextGroup}
            className="p-3 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white group"
          >
            <ChevronRight
              size={24}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-col lg:flex-row gap-6 relative min-h-[600px]">
          {/* 1. CHARACTER LIST (Bottom Scroll - Desktop / Mobile) */}
          <div className="order-2 lg:order-1 lg:absolute lg:bottom-0 lg:left-0 z-40 w-full lg:w-auto">
            <div className="flex flex-nowrap gap-3 overflow-x-auto pb-4 pt-2 px-1 scrollbar-none lg:scrollbar-thin lg:scrollbar-thumb-gray-700 lg:scrollbar-track-transparent max-w-full lg:max-w-2xl">
              {currentGroupMembers.map((idol: Character, _index: number) => (
                <motion.div
                  key={idol.name}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedIdol(idol)}
                  className={`flex-shrink-0 cursor-pointer rounded-xl overflow-hidden relative border-2 transition-all w-16 md:w-20
                    ${selectedIdol?.name === idol.name ? "border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] ring-2 ring-white/50" : "border-transparent opacity-70 hover:opacity-100"}
                  `}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: `#${idol.color}` }}
                  ></div>
                  <img
                    src={getCharacterImageUrl(idol.name, "banner")}
                    alt={idol.name}
                    className="w-full h-auto object-cover bg-gray-900"
                    draggable="false"
                  />
                  <div className="p-1.5 bg-[#0d1117] text-center">
                    <span className="text-[9px] md:text-[10px] font-bold text-gray-300 block truncate">
                      {idol.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 2. IDOL DETAIL VIEW */}
          <div className="order-1 lg:order-2 w-full h-full relative z-10 flex flex-col lg:block">
            {selectedIdol && (
              <>
                {/* --- CARD BACKGROUND (Glassmorphism) --- */}
                <div
                  className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#161b22]/60 backdrop-blur-sm transition-all duration-500 ease-out w-full min-h-[500px] md:min-h-[600px]"
                  style={{
                    background: `linear-gradient(135deg, #${selectedIdol.color}10 0%, #161b22 60%)`,
                  }}
                >
                  {/* Character Image (Sprite) */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={selectedIdol.name}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        }}
                        src={getCharacterImageUrl(selectedIdol.name, "sprite2")}
                        alt={selectedIdol.name}
                        className={`absolute z-10 select-none object-contain pointer-events-none drop-shadow-2xl
                                ${
                                  isMobile
                                    ? "w-[140%] max-w-none -left-[20%] top-10"
                                    : "h-[110%] bottom-0 -left-10 lg:left-0"
                                }
                                ${selectedIdol.name.toLowerCase() === "snow" ? "lg:-ml-20" : ""}
                            `}
                        draggable="false"
                      />
                    </AnimatePresence>
                  </div>

                  {/* Group Logo (Background Decoration) */}
                  <div className="absolute top-10 right-0 w-2/3 h-full opacity-10 pointer-events-none select-none mix-blend-overlay">
                    <img
                      src={getGroupImageUrl(selectedIdol.groupName)}
                      alt="Group Logo"
                      className="w-full object-contain transform translate-x-20"
                    />
                  </div>

                  {/* --- INFO PANEL (Right Side on Desktop) --- */}
                  {!isMobile && (
                    <div className="absolute top-0 right-0 w-1/2 h-full p-8 flex flex-col z-20 bg-gradient-to-l from-[#0f1115] via-[#0f1115]/80 to-transparent">
                      {/* Header Name */}
                      <div className="mb-6 text-right">
                        <h1 className="text-5xl font-black text-white italic tracking-tighter leading-none mb-2 drop-shadow-lg">
                          {selectedIdol.name}{" "}
                          <span className="text-gray-500">
                            {selectedIdol.familyName}
                          </span>
                        </h1>
                        <div className="flex justify-end gap-2 flex-wrap">
                          <span className="px-3 py-1 bg-white/10 border border-white/20 rounded text-xs font-bold text-gray-300 backdrop-blur-sm">
                            CV:{" "}
                            {selectedIdol.japaneseSeiyuuName ||
                              selectedIdol.seiyuuName}
                          </span>
                          <span className="px-3 py-1 bg-white/10 border border-white/20 rounded text-xs font-bold text-gray-300 backdrop-blur-sm">
                            {selectedIdol.school || "Unknown School"}
                          </span>
                        </div>
                      </div>

                      {/* Description Box */}
                      <div
                        className="bg-[#161b22]/80 border-l-4 p-4 rounded-r-xl mb-6 backdrop-blur-md shadow-lg"
                        style={{ borderLeftColor: `#${selectedIdol.color}` }}
                      >
                        <p className="text-sm text-gray-300 leading-relaxed italic">
                          "{selectedIdol.desc}"
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-[#0d1117]/80 p-4 rounded-xl border border-white/5">
                          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                            <User size={12} /> Profile
                          </h3>
                          <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex justify-between border-b border-white/5 pb-1">
                              <span>Birthday</span>{" "}
                              <span className="font-mono text-white">
                                {formatDateToDM(selectedIdol.birthdayDate) ||
                                  "-"}
                              </span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-1">
                              <span>Height</span>{" "}
                              <span className="font-mono text-white">
                                {selectedIdol.numeralStat.height || "-"} cm
                              </span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-1">
                              <span>B-W-H</span>
                              <span className="font-mono text-white">
                                {selectedIdol.numeralStat.bust}-
                                {selectedIdol.numeralStat.waist}-
                                {selectedIdol.numeralStat.hip}
                              </span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-[#0d1117]/80 p-4 rounded-xl border border-white/5">
                          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                            <Info size={12} /> Likes & Dislikes
                          </h3>
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="text-green-400 font-bold text-xs block mb-1">
                                LIKES
                              </span>
                              <p className="text-gray-300 leading-tight">
                                {selectedIdol.like}
                              </p>
                            </div>
                            <div>
                              <span className="text-red-400 font-bold text-xs block mb-1">
                                DISLIKES
                              </span>
                              <p className="text-gray-300 leading-tight">
                                {selectedIdol.dislike}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-auto flex flex-wrap justify-end gap-3">
                        {hasQnAData(selectedIdol.name, qnaSources) && (
                          <button
                            onClick={() => openQnA(selectedIdol)}
                            className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold text-sm shadow-lg shadow-pink-500/20 transition-all active:scale-95"
                          >
                            VIEW Q&A
                          </button>
                        )}
                        <button
                          onClick={() => handleNavigation("/stat")}
                          className="px-5 py-2 bg-[#1f2937] hover:bg-[#374151] text-white rounded-lg font-bold text-sm border border-white/10 transition-all"
                        >
                          VIEW STATS
                        </button>
                        <button className="px-4 py-2 bg-[#0d1117] text-gray-500 rounded-lg font-bold text-sm border border-white/5 cursor-not-allowed flex items-center gap-2">
                          <Lock size={12} /> GALLERY
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- MOBILE INFO (Slide Up) --- */}
                  {isMobile && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-20 pb-6 px-6 z-20">
                      <h1 className="text-3xl font-black text-white italic mb-2">
                        {selectedIdol.name}
                      </h1>
                      <div className="flex gap-2 mb-4">
                        <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold text-white backdrop-blur">
                          {selectedIdol.groupName}
                        </span>
                        <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold text-white backdrop-blur">
                          {formatDateToDM(selectedIdol.birthdayDate)}
                        </span>
                      </div>
                      <button
                        onClick={() => setIsRightMenuOpen(true)}
                        className="w-full py-3 bg-white text-black font-black text-sm rounded-xl uppercase tracking-widest hover:bg-gray-200 transition-colors"
                      >
                        Open Data File
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- MOBILE DETAIL MODAL (Slide Over) --- */}
      {isMobile && selectedIdol && (
        <div
          className={`fixed inset-0 z-50 transition-transform duration-300 ease-out ${isRightMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsRightMenuOpen(false)}
          ></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-[#161b22] border-l border-white/10 shadow-2xl overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white italic">
                IDOL DATA
              </h2>
              <button
                onClick={() => setIsRightMenuOpen(false)}
                className="p-2 bg-white/10 rounded-full text-white"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-[#0d1117] p-4 rounded-xl border-l-4 border-pink-500">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {selectedIdol.desc}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">
                  Profile
                </h3>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <span className="block text-gray-500 text-xs">Height</span>
                    {selectedIdol.numeralStat.height} cm
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs">Weight</span>
                    {selectedIdol.numeralStat.weight} kg
                  </div>
                  <div className="col-span-2">
                    <span className="block text-gray-500 text-xs">
                      Three Sizes
                    </span>
                    {selectedIdol.numeralStat.bust} /{" "}
                    {selectedIdol.numeralStat.waist} /{" "}
                    {selectedIdol.numeralStat.hip}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">
                  Preferences
                </h3>
                <div>
                  <span className="text-green-400 text-xs font-bold block">
                    LIKES
                  </span>
                  <p className="text-sm text-gray-300">{selectedIdol.like}</p>
                </div>
                <div>
                  <span className="text-red-400 text-xs font-bold block">
                    DISLIKES
                  </span>
                  <p className="text-sm text-gray-300">
                    {selectedIdol.dislike}
                  </p>
                </div>
              </div>

              {getGiftItemImageUrl(selectedIdol.name) && (
                <div className="bg-[#0d1117] p-4 rounded-xl border border-white/10 text-center">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center justify-center gap-2">
                    <Gift size={12} /> Favorite Gifts
                  </h3>
                  <div className="flex justify-center gap-3">
                    <img
                      src={getSpecialGiftItemImageUrl(selectedIdol.name)}
                      className="w-12 h-12 bg-white rounded-lg p-1"
                      alt="Gift"
                    />
                    <img
                      src={getGiftItemImageUrl(selectedIdol.name, 1)}
                      className="w-12 h-12 bg-white rounded-lg p-1"
                      alt="Gift"
                    />
                    <img
                      src={getGiftItemImageUrl(selectedIdol.name)}
                      className="w-12 h-12 bg-white rounded-lg p-1"
                      alt="Gift"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 space-y-3">
                {hasQnAData(selectedIdol.name, qnaSources) && (
                  <button
                    onClick={() => {
                      setIsRightMenuOpen(false);
                      openQnA(selectedIdol);
                    }}
                    className="w-full py-3 bg-pink-600 rounded-lg font-bold text-white text-sm"
                  >
                    OPEN Q&A
                  </button>
                )}
                <button
                  onClick={() => handleNavigation("/stat")}
                  className="w-full py-3 bg-[#1f2937] rounded-lg font-bold text-gray-300 text-sm border border-white/10"
                >
                  VIEW STATS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQnA && selectedIdol && (
        <div className="fixed inset-0 flex z-50 items-center justify-center">
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
