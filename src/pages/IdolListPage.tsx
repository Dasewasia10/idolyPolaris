import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import QnAModal from "../components/QnAModal";
import { Character } from "../interfaces/Character";
import {
  getCharacter3ImageUrl,
  getGiftItemImageUrl,
  getSpecialGiftItemImageUrl,
  getGroupImageUrl,
} from "../utils/imageUtils";
import { QnASource } from "../interfaces/QnA";
import {
  ChevronLeft,
  ChevronRight,
  Mic2,
  MapPin,
  Award,
  Heart,
  MessageCircle,
  BarChart2,
  Image as ImageIcon,
} from "lucide-react";

const getCharacterImageUrl = (
  characterName: string,
  type: "icon" | "sprite1" | "sprite2" | "banner",
) => {
  const baseUrl = "https://apiip.dasewasia.my.id";
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
  const [activeTab, setActiveTab] = useState<"profile" | "gifts" | "desc">(
    "desc",
  );

  // Deteksi Mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    if (dayNumber % 100 >= 11 && dayNumber % 100 <= 13) suffix = "th";
    else {
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
          "https://beip.dasewasia.my.id/api/characters",
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

        if (orderedGroupNames.length > 0)
          setSelectedIdol(groups[orderedGroupNames[0]][0]);
        setLoading(false);

        const spriteUrls = filteredCharacters.map((char) =>
          getCharacterImageUrl(char.name, "sprite2"),
        );
        const bannerUrls = filteredCharacters.map((char) =>
          getCharacterImageUrl(char.name, "banner"),
        );
        preloadImages([...spriteUrls, ...bannerUrls]);
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
          fetch("https://beip.dasewasia.my.id/api/characters"),
          fetch("https://beip.dasewasia.my.id/api/qnas"),
        ]);
        const charactersData = await charactersRes.json();
        const qnaData = await qnaRes.json();
        setAllCharacters(charactersData);
        setQnaSources(Array.isArray(qnaData) ? qnaData : []);
      } catch (error) {
        console.error(error);
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
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-cyan-500 font-mono tracking-widest animate-pulse">
        LOADING DATABASE...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-red-500 font-mono">
        ERROR: {error}
      </div>
    );

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#0f1115] text-white font-sans relative overflow-hidden selection:bg-pink-500 selection:text-white flex flex-col gap-6">
      {/* Background Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* --- HEADER NAVIGATION (GROUP SELECTOR) --- */}
      <div className="flex items-center justify-between bg-[#161b22]/80 backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-xl z-20 relative">
        <button
          onClick={prevGroup}
          className="p-3 bg-[#0d1117] hover:bg-[#1f2937] rounded-xl text-gray-400 hover:text-white transition-all border border-white/5 active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex-1 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] block mb-1">
            Current Unit
          </span>
          <h2 className="text-xl lg:text-3xl font-black italic text-white uppercase tracking-tighter drop-shadow-md">
            {currentGroup}
          </h2>
        </div>

        <button
          onClick={nextGroup}
          className="p-3 bg-[#0d1117] hover:bg-[#1f2937] rounded-xl text-gray-400 hover:text-white transition-all border border-white/5 active:scale-95"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative z-10 flex-1">
        {/* --- MAIN DISPLAY AREA --- */}
        <div className="w-full relative min-h-[600px] lg:h-[750px] flex-1 mb-20">
          {selectedIdol && (
            <section className="relative h-full w-full">
              {/* GIFT ICONS (Floating) */}
              {!isMobile && getGiftItemImageUrl(selectedIdol.name) && (
                <div className="absolute top-4 right-4 z-30 flex gap-2 p-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
                  <img
                    src={getSpecialGiftItemImageUrl(selectedIdol.name)}
                    alt="Gift"
                    className="w-10 h-10 object-cover bg-white/10 rounded-lg"
                  />
                  <img
                    src={getGiftItemImageUrl(selectedIdol.name, 1)}
                    alt="Gift"
                    className="w-10 h-10 object-cover bg-white/10 rounded-lg"
                  />
                  <img
                    src={getGiftItemImageUrl(selectedIdol.name)}
                    alt="Gift"
                    className="w-10 h-10 object-cover bg-white/10 rounded-lg"
                  />
                </div>
              )}

              {/* CARD CONTAINER */}
              <div
                className="relative rounded-2xl overflow-hidden h-screen w-full border border-white/10 shadow-2xl bg-[#161b22] transition-all duration-500"
                style={{
                  boxShadow: `0 0 30px -10px #${selectedIdol.color}`,
                  borderColor: `#${selectedIdol.color}40`,
                }}
              >
                {!isMobile && (
                  <img
                    src={getCharacter3ImageUrl(selectedIdol.name)}
                    alt={selectedIdol.name}
                    className={`absolute w-full h-max object-cover object-top opacity-50 select-none ${
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
                )}
                {/* IDOL SPRITE (BG) */}
                <div className="absolute inset-0 z-0 -translate-x-96 lg:translate-x-0">
                  {/* Gradient Overlay based on chara color */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `linear-gradient(135deg, #${selectedIdol.color} 0%, transparent 100%)`,
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-transparent opacity-90"></div>

                  {/* Character Sprite */}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedIdol.name}
                      src={getCharacterImageUrl(selectedIdol.name, "sprite2")}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.4 }}
                      className={`absolute w-auto h-[120%] max-w-none object-cover select-none z-0
                            ${isMobile ? "left-1/2 -translate-x-1/2" : "right-[-10%] top-[-10%]"}
                        `}
                      draggable="false"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://beip.dasewasia.my.id/api/img/character/sprite2/satomi";
                      }}
                    />
                  </AnimatePresence>
                </div>

                {/* --- SIDEBAR BUTTONS (DESKTOP) --- */}
                {!isMobile && (
                  <div className="absolute top-8 left-8 z-40 flex flex-col gap-3">
                    {hasQnAData(selectedIdol.name, qnaSources) && (
                      <button
                        onClick={() => openQnA(selectedIdol)}
                        className="group flex items-center gap-3 bg-black/60 hover:bg-pink-600/80 backdrop-blur-md text-white pl-3 pr-5 py-2 rounded-full border border-white/10 transition-all hover:border-pink-500"
                      >
                        <MessageCircle size={18} />{" "}
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Interview
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => handleNavigation("/stat")}
                      className="group flex items-center gap-3 bg-black/60 hover:bg-cyan-600/80 backdrop-blur-md text-white pl-3 pr-5 py-2 rounded-full border border-white/10 transition-all hover:border-cyan-500"
                    >
                      <BarChart2 size={18} />{" "}
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Statistics
                      </span>
                    </button>
                    <button className="group flex items-center gap-3 bg-black/40 text-gray-500 pl-3 pr-5 py-2 rounded-full border border-white/5 cursor-not-allowed">
                      <ImageIcon size={18} />{" "}
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Gallery
                      </span>
                    </button>
                  </div>
                )}

                {/* --- INTRODUCTION BUBBLE --- */}
                {!isMobile && selectedIdol.introduction && (
                  <div className="absolute top-1/3 left-12 z-30 max-w-sm animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
                    <div className="relative bg-black/70 backdrop-blur-md border border-white/10 text-gray-200 px-5 py-4 rounded-xl rounded-tl-none shadow-lg">
                      <p className="text-sm italic leading-relaxed font-medium">
                        "{(selectedIdol.introduction ?? []).join(" ")}"
                      </p>
                      <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t border-l border-white/30 rounded-tl-none"></div>
                    </div>
                  </div>
                )}

                {/* --- GROUP LOGO (Watermark) --- */}
                <div className="absolute bottom-40 right-[-50px] opacity-10 pointer-events-none rotate-12 z-0">
                  <img
                    src={getGroupImageUrl(selectedIdol.groupName)}
                    alt="logo"
                    className="w-96 h-auto grayscale invert"
                  />
                </div>

                {/* --- INFO PANEL (Overlay Bottom) --- */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-32 pb-8 px-6 lg:px-10 z-20">
                  {/* Name & Header */}
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-white border border-white/10 uppercase tracking-wider">
                          {selectedIdol.groupName}
                        </span>
                        <div className="h-px w-10 bg-white/20"></div>
                      </div>
                      <h1
                        className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-none"
                        style={{
                          textShadow: `0 0 30px #${selectedIdol.color}`,
                        }}
                      >
                        {selectedIdol.name}{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600">
                          {selectedIdol.familyName}
                        </span>
                      </h1>
                      {selectedIdol.japaneseName && (
                        <p className="text-sm text-gray-500 font-mono mt-1 tracking-widest">
                          {selectedIdol.japaneseName}
                        </p>
                      )}
                    </div>

                    {/* Badges CV/School */}
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1f2937] border border-white/10 text-xs text-gray-300">
                        <Mic2 size={14} className="text-pink-500" />
                        <span className="font-bold">
                          CV:{" "}
                          {selectedIdol.japaneseSeiyuuName ||
                            selectedIdol.seiyuuName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1f2937] border border-white/10 text-xs text-gray-300">
                        <MapPin size={14} className="text-blue-500" />
                        <span>{selectedIdol.school || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1f2937] border border-white/10 text-xs text-gray-300">
                        <Award size={14} className="text-yellow-500" />
                        <span>
                          {selectedIdol.badge
                            ? `${selectedIdol.badge} (${selectedIdol.japaneseBadge})`
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
                    {/* Column 1: Description */}
                    <div className="lg:col-span-1 hidden lg:block">
                      <p
                        className="text-gray-400 leading-relaxed text-xs line-clamp-4 border-l-2 pl-3"
                        style={{ borderColor: `#${selectedIdol.color}` }}
                      >
                        {selectedIdol.desc}
                      </p>
                    </div>

                    {/* Column 2: Physical Stats */}
                    <div className="lg:col-span-1 grid grid-cols-2 gap-y-2 gap-x-4">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-gray-500 text-xs uppercase">
                          Birthday
                        </span>{" "}
                        <span className="font-mono">
                          {formatDateToDM(selectedIdol.birthdayDate) || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-gray-500 text-xs uppercase">
                          Height
                        </span>{" "}
                        <span className="font-mono">
                          {selectedIdol.numeralStat.height || "-"} cm
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-gray-500 text-xs uppercase">
                          Weight
                        </span>{" "}
                        <span className="font-mono">
                          {selectedIdol.numeralStat.weight || "-"} kg
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-gray-500 text-xs uppercase">
                          B-W-H
                        </span>{" "}
                        <span className="font-mono">
                          {selectedIdol.numeralStat.bust}/
                          {selectedIdol.numeralStat.waist}/
                          {selectedIdol.numeralStat.hip}
                        </span>
                      </div>
                    </div>

                    {/* Column 3: Likes/Dislikes */}
                    <div className="lg:col-span-1 space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1">
                          <Heart size={10} /> Likes
                        </span>
                        <p className="text-gray-300">{selectedIdol.like}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                          Dislikes
                        </span>
                        <p className="text-gray-300">{selectedIdol.dislike}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* --- CAROUSEL (BOTTOM) --- */}
        <div className="fixed bottom-10 left-0 right-0 z-40 p-4 bg-gradient-to-t from-black via-black/90 to-transparent lg:static lg:bg-transparent lg:p-0 lg:w-auto lg:h-[750px] lg:flex lg:flex-col lg:justify-center">
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden scrollbar-minimal p-2 lg:max-h-[600px] lg:w-24">
            {currentGroupMembers.map((idol: Character, _index: number) => (
              <button
                key={idol.name}
                onClick={() => setSelectedIdol(idol)}
                className={`relative flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 group
                    ${
                      selectedIdol?.name === idol.name
                        ? "border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-110 z-10"
                        : "border-white/20 opacity-60 hover:opacity-100 hover:scale-105"
                    }
                  `}
              >
                <img
                  src={getCharacterImageUrl(idol.name, "icon")}
                  alt={idol.name}
                  className="w-full h-full object-cover bg-gray-800"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/70 text-[8px] text-center text-white font-bold py-0.5 uppercase truncate">
                  {idol.name}
                </div>
                {/* Color Indicator */}
                <div
                  className="absolute top-0 right-0 w-3 h-3 rounded-bl-lg"
                  style={{ backgroundColor: `#${idol.color}` }}
                ></div>
              </button>
            ))}
          </div>
        </div>

        {/* --- MOBILE DRAWER (DETAILS) --- */}
        {selectedIdol && isMobile && (
          <div
            className={`fixed inset-y-0 right-0 w-80 bg-[#161b22] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ${isRightMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <button
              onClick={() => setIsRightMenuOpen(!isRightMenuOpen)}
              className="absolute top-1/2 -left-8 w-8 h-16 bg-[#161b22] border-l border-y border-white/10 rounded-l-lg flex items-center justify-center text-white"
            >
              {isRightMenuOpen ? <ChevronRight /> : <ChevronLeft />}
            </button>

            <div className="h-full overflow-y-auto p-6">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">
                {selectedIdol.name}
              </h2>

              {/* Tabs Mobile */}
              <div className="flex gap-2 mb-6 mt-40">
                {["desc", "profile"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg border ${activeTab === tab ? "bg-white text-black border-white" : "text-gray-400 border-white/10"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === "desc" && (
                <p className="text-sm text-gray-300 leading-relaxed">
                  {selectedIdol.desc}
                </p>
              )}

              {activeTab === "profile" && (
                <div className="space-y-4 text-sm text-gray-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 text-xs block">
                        Height
                      </span>{" "}
                      {selectedIdol.numeralStat.height} cm
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block">
                        Weight
                      </span>{" "}
                      {selectedIdol.numeralStat.weight} kg
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block">
                      Birthday
                    </span>{" "}
                    {formatDateToDM(selectedIdol.birthdayDate)}
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block">Likes</span>{" "}
                    {selectedIdol.like}
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block">
                      Dislikes
                    </span>{" "}
                    {selectedIdol.dislike}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3">
                {hasQnAData(selectedIdol.name, qnaSources) && (
                  <button
                    onClick={() => openQnA(selectedIdol)}
                    className="w-full py-3 bg-slate-800 rounded-lg text-sm font-bold text-white border border-white/10"
                  >
                    OPEN Q&A
                  </button>
                )}
                <button
                  onClick={() => handleNavigation("/stat")}
                  className="w-full py-3 bg-slate-800 rounded-lg text-sm font-bold text-white border border-white/10"
                >
                  VIEW STATS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showQnA && selectedIdol && (
        <div className="z-[60] flex items-center justify-center p-4">
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
