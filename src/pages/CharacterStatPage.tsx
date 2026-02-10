import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import { Character } from "../interfaces/Character";
import { Icon } from "../interfaces/Icon";

const API_BASE_URL = "https://diveidolypapi.my.id/api";

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

  // Title Page Dynamic
  useEffect(() => {
    document.title = "Polaris Idoly | Idol Stat Comparison";

    return () => {
      document.title = "Polaris Idoly";
    };
  }, []);

  const getCharacterIconUrl = (characterName: string) => {
    const formattedName = characterName.toLowerCase().replace(/\s+/g, "");
    return `https://api.diveidolypapi.my.id/iconCharacter/chara-${formattedName}.png`;
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
          return b.age - a.age; // Umur tertua ke termuda
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
        return "Age (per April 1st, 2020)";
      case "height":
        return "Height (cm)";
      case "weight":
        return "Weight (kg)";
      case "bust":
        return "Bust (cm)";
      case "waist":
        return "Bust (cm)";
      case "hips":
        return "Bust (cm)";
      default:
        return "";
    }
  };

  const getGradientColor = () => {
    switch (sortBy) {
      case "age":
        return "from-blue-400 to-indigo-600";
      case "height":
        return "from-green-400 to-teal-600";
      case "weight":
        return "from-yellow-400 to-orange-500";
      case "bust":
        return "from-pink-400 to-rose-500";
      case "waist":
        return "from-slate-400 to-slate-600";
      case "hips":
        return "from-emerald-400 to-emerald-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#0f172a] min-h-screen text-slate-200">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500 mb-2">
            Character Comparison
          </h1>
          <p className="text-slate-400">
            Analyze and compare the physical attributes of Hoshimi Production
            idols.
          </p>
        </header>

        {/* Sorting Controls - Improved UI */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 bg-slate-800/50 p-2 rounded-2xl backdrop-blur-sm border border-slate-700">
          {(["age", "height", "weight", "bust", "waist", "hips"] as const).map(
            (type) => (
              <button
                key={type}
                onClick={() => setSortBy(type)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 capitalize ${
                  sortBy === type
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105"
                    : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {type}
              </button>
            ),
          )}
        </div>

        {/* Comparison Chart Container */}
        <div className="bg-slate-800/30 backdrop-blur-md rounded-3xl p-4 md:p-8 border border-slate-700/50 shadow-2xl">
          <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
              {getStatLabel()}
            </h2>
          </div>

          <div className="space-y-5">
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
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    key={character.name} // Gunakan name karena ID mungkin sama
                    className="group relative flex items-center gap-4"
                  >
                    {/* Rank Number */}
                    <div className="w-6 text-slate-500 font-mono text-sm">
                      {(index + 1).toString().padStart(2, "0")}
                    </div>

                    {/* Avatar with Group Color Ring */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="absolute -inset-1 rounded-full opacity-20 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: `#${character.color}` }}
                      ></div>
                      <img
                        src={icon?.src}
                        alt={character.name}
                        className="relative w-12 h-12 rounded-full border-2 border-slate-900 object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <div>
                          <span className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                            {character.name}
                          </span>
                          <span className="ml-2 text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-2 py-0.5 bg-slate-900 rounded-md">
                            {character.groupName}
                          </span>
                        </div>
                        <div className="text-sm font-black font-mono text-blue-400">
                          {value}
                          <span className="text-[10px] text-slate-500 ml-0.5">
                            {sortBy === "age" ? "y.o" : "unit"}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar with Glow */}
                      <div className="w-full bg-slate-900/50 rounded-full h-3 overflow-hidden border border-slate-700/30">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: "circOut" }}
                          className={`h-full bg-gradient-to-r ${getGradientColor()} relative`}
                        >
                          <div className="absolute top-0 right-0 w-4 h-full bg-white/20 blur-sm"></div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterComparisonPage;
