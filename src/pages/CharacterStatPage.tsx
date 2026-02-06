import React, { useState, useEffect } from "react";
import axios from "axios";
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
          180
        );
      case "weight":
        return Math.max(
          ...characters.map((c) => c.numeralStat?.weight || 0),
          60
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

  const getColor = () => {
    switch (sortBy) {
      case "age":
        return "bg-blue-500";
      case "height":
        return "bg-green-500";
      case "weight":
        return "bg-yellow-500";
      case "bust":
        return "bg-pink-500";
      case "waist":
        return "bg-slate-500";
      case "hips":
        return "bg-emerald-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        Character Comparison
      </h1>

      {/* Sorting Controls */}
      <div className="grid justify-center gap-4 mb-8 grid-cols-2 lg:grid-cols-6">
        <button
          onClick={() => setSortBy("age")}
          className={`px-4 py-2 rounded-lg ${
            sortBy === "age" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Sort by Age
        </button>
        <button
          onClick={() => setSortBy("height")}
          className={`px-4 py-2 rounded-lg ${
            sortBy === "height" ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
        >
          Sort by Height
        </button>
        <button
          onClick={() => setSortBy("weight")}
          className={`px-4 py-2 rounded-lg ${
            sortBy === "weight" ? "bg-yellow-500 text-black" : "bg-gray-200"
          }`}
        >
          Sort by Weight
        </button>
        <button
          onClick={() => setSortBy("bust")}
          className={`px-4 py-2 rounded-lg ${
            sortBy === "bust" ? "bg-pink-500 text-white" : "bg-gray-200"
          }`}
        >
          Sort by Bust
        </button>
        <button
          onClick={() => setSortBy("waist")}
          className={`px-4 py-2 rounded-lg ${
            sortBy === "waist" ? "bg-pink-500 text-white" : "bg-gray-200"
          }`}
        >
          Sort by Waist
        </button>
        <button
          onClick={() => setSortBy("hips")}
          className={`px-4 py-2 rounded-lg ${
            sortBy === "hips" ? "bg-pink-500 text-white" : "bg-gray-200"
          }`}
        >
          Sort by Hips
        </button>
      </div>

      {/* Comparison Chart */}
      <div className="bg-slate-700 p-6 rounded-lg shadow-lg text-white">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {getStatLabel()}
        </h2>

        <div className="space-y-6">
          {getSortedCharacters().map((character) => {
            const icon = icons.find((icon) => icon.name === character.name);
            const value = getValue(character);
            const maxValue = getMaxValue();
            const percentage = (value / maxValue) * 100;

            return (
              <div key={character.id} className="flex lg:items-center flex-col lg:flex-row">
                {/* Character Icon and Name */}
                <div className="flex items-center w-48">
                  {icon && (
                    <img
                      src={icon.src}
                      alt={character.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  )}
                  <div>
                    <div className="font-medium">{character.name}</div>
                    <div className="text-xs text-white/80">
                      {character.groupName}
                    </div>
                  </div>
                </div>

                {/* Stat Value */}
                <div className="w-16 text-right pr-4 hidden lg:block">
                  <span className="font-bold">{value}</span>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 lg:mt-0 mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className={`${getColor()} h-6 rounded-full flex items-center justify-end transition-all duration-300 ease-in-out`}
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-white text-xs pr-2">{value}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CharacterComparisonPage;
