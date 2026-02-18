import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import { Character } from "../interfaces/Character";
import { Icon } from "../interfaces/Icon";

const API_BASE_URL = "https://beip.dasewasia.my.id/api";

const CharacterComparisonPage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [icons, setIcons] = useState<Icon[]>([]);
  const [sortBy, setSortBy] = useState<
    "age" | "height" | "weight" | "bust" | "waist" | "hips"
  >("age");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/characters`);

        const allowedGroups = [
          "Tsuki no Tempest",
          "Sunny Peace",
          "TRINITYAiLE",
          "LizNoir",
          "IIIX",
          "Mana Nagase",
        ];

        const filteredCharacters = response.data
          .filter((char: Character) => allowedGroups.includes(char.groupName))
          .map((char: Character) => ({
            ...char,
            age: calculateAge(char.birthdayDate),
          }));

        setCharacters(filteredCharacters);

        const processedIcons = filteredCharacters.map((char: Character) => ({
          id: char.id,
          name: char.name,
          src: getCharacterIconUrl(char.name),
          group: char.groupName,
        }));

        setIcons(processedIcons);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    document.title = "Polaris Idoly | Idol Stat Comparison";
    return () => {
      document.title = "Polaris Idoly";
    };
  }, []);

  const getCharacterIconUrl = (characterName: string) => {
    const formattedName = characterName.toLowerCase().replace(/\s+/g, "");
    return `https://apiip.dasewasia.my.id/iconCharacter/chara-${formattedName}.png`;
  };

  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday);
    const currentDate = new Date("2020-04-01");
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    if (
      currentDate.getMonth() < birthDate.getMonth() ||
      (currentDate.getMonth() === birthDate.getMonth() &&
        currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getSortedCharacters = () => {
    return [...characters].sort((a, b) => {
      switch (sortBy) {
        case "age":
          return b.age - a.age;
        case "height":
          return (b.numeralStat?.height || 0) - (a.numeralStat?.height || 0);
        case "weight":
          return (b.numeralStat?.weight || 0) - (a.numeralStat?.weight || 0);
        case "bust":
          return (b.numeralStat?.bust || 0) - (a.numeralStat?.bust || 0);
        case "waist":
          return (b.numeralStat?.waist || 0) - (a.numeralStat?.waist || 0);
        case "hips":
          return (b.numeralStat?.hip || 0) - (a.numeralStat?.hip || 0);
        default:
          return 0;
      }
    });
  };

  const getMaxValue = () => {
    switch (sortBy) {
      case "age":
        return Math.max(...characters.map((c) => c.age), 30);
      case "height":
        return Math.max(
          ...characters.map((c) => c.numeralStat?.height || 0),
          180,
        );
      case "weight":
        return Math.max(
          ...characters.map((c) => c.numeralStat?.weight || 0),
          60,
        );
      case "bust":
        return Math.max(...characters.map((c) => c.numeralStat?.bust || 0), 90);
      default:
        return 100;
    }
  };

  const getValue = (character: Character) => {
    switch (sortBy) {
      case "age":
        return character.age;
      case "height":
        return character.numeralStat?.height || 0;
      case "weight":
        return character.numeralStat?.weight || 0;
      case "bust":
        return character.numeralStat?.bust || 0;
      case "waist":
        return character.numeralStat?.waist || 0;
      case "hips":
        return character.numeralStat?.hip || 0;
      default:
        return 0;
    }
  };

  const getStatLabel = () => {
    switch (sortBy) {
      case "age":
        return "AGE (y.o)";
      case "height":
        return "HEIGHT (cm)";
      case "weight":
        return "WEIGHT (kg)";
      case "bust":
        return "BUST (cm)";
      case "waist":
        return "WAIST (cm)";
      case "hips":
        return "HIPS (cm)";
      default:
        return "";
    }
  };

  // Warna gradasi yang lebih soft/mature
  const getGradientColor = () => {
    switch (sortBy) {
      case "age":
        return "bg-blue-500";
      case "height":
        return "bg-emerald-500";
      case "weight":
        return "bg-amber-500";
      case "bust":
        return "bg-pink-500";
      case "waist":
        return "bg-indigo-500";
      case "hips":
        return "bg-violet-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans relative overflow-hidden">
      {/* Background Texture ala Idoly Pride */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      {/* Decorative Blur Orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12">
        {/* HEADER SECTION */}
        <header className="mb-12 border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-end">
          <div>
            <span className="text-xs font-bold tracking-[0.3em] text-blue-400 uppercase block mb-1">
              Hoshimi Production Database
            </span>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-tight text-white">
              CHARACTER{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                COMPARISON&nbsp;
              </span>
            </h1>
            <p className="mt-2 text-[14px] text-white/60 font-mono">
              Analyze and compare the physical attributes of Hoshimi Production
              idols.
            </p>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <div className="text-[10px] text-white/40 font-mono">
              SYSTEM.VER.2026
            </div>
            <div className="text-[10px] text-white/40 font-mono">
              AUTHORIZED ACCESS
            </div>
          </div>
        </header>

        {/* SORTING CONTROLS (Skewed Tabs Style) */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
          {(["age", "height", "weight", "bust", "waist", "hips"] as const).map(
            (type) => (
              <button
                key={type}
                onClick={() => setSortBy(type)}
                className={`
                  relative px-8 py-2 font-bold text-sm uppercase tracking-wider transition-all duration-300
                  transform skew-x-[-12deg] border border-white/10
                  ${
                    sortBy === type
                      ? "bg-white text-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.3)] border-white"
                      : "bg-slate-800/50 text-white/60 hover:bg-slate-700 hover:text-white hover:border-white/30"
                  }
                `}
              >
                <span className="block transform skew-x-[12deg]">{type}</span>
              </button>
            ),
          )}
        </div>

        {/* DATA LIST CONTAINER */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-tl-3xl rounded-br-3xl overflow-hidden p-1">
          {/* Header Bar within Container */}
          <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
            <h2 className="text-lg font-bold flex items-center gap-2 italic">
              <span className="w-1 h-6 bg-blue-500 block transform skew-x-[-12deg]"></span>
              RANKING // <span className="text-blue-400">{getStatLabel()}</span>
            </h2>
            <div className="hidden md:flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-white/20 rounded-full"></div>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {getSortedCharacters().map((character, index) => {
                const icon = icons.find((i) => i.name === character.name);
                const value = getValue(character);
                const maxValue = getMaxValue();
                const percentage = (value / maxValue) * 100;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    key={character.name}
                    className="group relative flex items-center bg-[#151e32] hover:bg-[#1e2943] border-l-4 transition-colors duration-300 pr-4 py-2"
                    style={{ borderLeftColor: `#${character.color}` }}
                  >
                    {/* Background striping effect on hover */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"></div>

                    {/* Rank */}
                    <div className="w-12 text-center flex-shrink-0">
                      <span
                        className={`font-mono text-xl font-bold ${index < 3 ? "text-yellow-400" : "text-white/30"}`}
                      >
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                    </div>

                    {/* Avatar Ring */}
                    <div className="relative flex-shrink-0 mr-4">
                      <div className="w-12 h-12 rounded-full border border-white/20 p-0.5 bg-black/20">
                        <img
                          src={icon?.src}
                          alt={character.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Info & Bar */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Name */}
                      <div className="md:col-span-3 flex flex-col justify-center">
                        <span className="font-bold text-sm tracking-wide text-white group-hover:text-blue-200 transition-colors">
                          {character.name.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                          {character.groupName}
                        </span>
                      </div>

                      {/* Bar Visualization */}
                      <div className="md:col-span-8 h-full flex items-center">
                        <div className="w-full h-8 bg-black/40 skew-x-[-12deg] relative overflow-hidden border border-white/5">
                          {/* Grid line inside bar */}
                          <div
                            className="absolute inset-0 w-full h-full"
                            style={{
                              backgroundImage:
                                "linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.1) 95%)",
                              backgroundSize: "10% 100%",
                            }}
                          ></div>

                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className={`h-full ${getGradientColor()} relative opacity-90`}
                          >
                            <div className="absolute top-0 right-0 w-1 h-full bg-white/50"></div>
                          </motion.div>
                        </div>
                      </div>

                      {/* Value */}
                      <div className="md:col-span-1 text-right">
                        <span className="font-mono text-lg font-bold text-white">
                          {value}
                        </span>
                        <span className="text-[10px] text-white/40 ml-1">
                          {sortBy === "age"
                            ? ""
                            : sortBy === "weight"
                              ? "kg"
                              : "cm"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Decoration */}
        <div className="mt-8 flex justify-between items-center opacity-30 border-t border-white/10 pt-4">
          <div className="h-1 w-20 bg-white/50"></div>
          <div className="text-[10px] font-mono tracking-widest">
            HOSHIMI PRODUCTION // DATABASE
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterComparisonPage;
