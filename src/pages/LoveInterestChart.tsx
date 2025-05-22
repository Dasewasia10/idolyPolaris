import React, { useRef, useState, useEffect } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import axios from "axios";
import domtoimage from "dom-to-image";

import { Character } from "../interfaces/Character";
import { Icon } from "../interfaces/Icon";

const API_BASE_URL = "https://diveidolypapi.my.id/api";

const LoveInterestChart: React.FC = () => {
  const menuRef = useRef(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const draggableRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  const [icons, setIcons] = useState<Icon[]>([]);
  const [positions, setPositions] = useState<{
    [key: number]: { x: number; y: number };
  }>({});
  const [fileName, setFileName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [title, setTitle] = useState("Title here");
  const [top, setTop] = useState("Top");
  const [bottom, setBottom] = useState("Bottom");
  const [left, setLeft] = useState("Left");
  const [right, setRight] = useState("Right");

  const [highestZIndex, setHighestZIndex] = useState(1);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPositionChanged, setIsPositionChanged] = useState(false);

  const getCharacterIconUrl = (characterName: string) => {
    const formattedName = characterName.toLowerCase().replace(/\s+/g, "");
    return `https://api.diveidolypapi.my.id/iconCharacter/chara-${formattedName}.png`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/characters`);

        // ✅ Filter hanya idol yang ada dalam grup tertentu
        const allowedGroups = [
          "Tsuki no Tempest",
          "Sunny Peace",
          "TRINITYAiLE",
          "LizNoir",
          "IIIX",
          "Mana Nagase",
        ];

        const sortedCharacters = response.data
          .filter((idol: { groupName: string }) =>
            allowedGroups.includes(idol.groupName)
          )
          .sort((a: Character, b: Character) => a.name.localeCompare(b.name));

        const processedIcons = sortedCharacters.map(
          (character: Character, index: number) => ({
            id: index + 1,
            name: character.name,
            src: getCharacterIconUrl(character.name),
          })
        );

        setIcons(processedIcons);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isPositionChanged) {
        event.preventDefault();
        event.returnValue = ""; // Standar untuk beberapa browser
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isPositionChanged]);

  const handleScreenshot = () => {
    if (!fileName.trim()) {
      alert("Nama file harus terisi sebelum men-download.");
      return;
    }

    const node = chartRef.current;

    if (node) {
      // Konfigurasi dom-to-image
      const options = {
        quality: 1, // Kualitas maksimum (0-1)
        bgcolor: "#ffffff", // Warna background jika ada elemen transparan
        style: {
          transform: "none", // Handle transform issues
          filter: "none", // Handle CSS filters
        },
        width: node.clientWidth, // Lebar elemen
        height: node.clientHeight, // Tinggi elemen
        cacheBust: true, // Hindari cache
      };

      domtoimage
        .toPng(node, options)
        .then((dataUrl) => {
          // Buat link download
          const link = document.createElement("a");
          link.download = `${fileName}.png`;
          link.href = dataUrl;
          link.click();

          // Bersihkan memori
          URL.revokeObjectURL(dataUrl);
        })
        .catch((error) => {
          console.error("Error generating image:", error);
          alert(
            "Gagal mengambil screenshot. Coba lagi atau periksa konsol untuk detail."
          );
        });
    }
  };

  const handleStop = (
    _e: DraggableEvent,
    data: DraggableData,
    index: number
  ) => {
    setPositions((prev) => ({
      ...prev,
      [index]: { x: data.x, y: data.y },
    }));
    setIsPositionChanged(true);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (
        menuRef.current &&
        !(menuRef.current as HTMLElement).contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const clickHandlerDraggable = (index: number) => {
    setHighestZIndex((prev) => prev + 1);
    setActiveIndex(index);
  };

  return (
    <div className="relative h-[38rem] w-full bg-gradient-to-br from-[#182cfc] to-[#6a11cb] overflow-hidden">
      {/* Floating Menu Button */}
      {!isMenuOpen && (
        <button
          onClick={toggleMenu}
          className="absolute left-4 top-4 z-20 rounded-full bg-white/20 p-3 backdrop-blur-md transition-all duration-300 hover:bg-white/30"
        >
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      )}

      {/* Customization Panel */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute left-4 top-4 z-30 w-80 rounded-xl bg-gray-800/90 backdrop-blur-lg shadow-2xl transition-all duration-300"
        >
          <div className="p-4">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
              <h2 className="text-xl font-bold text-white">
                Customization Panel
              </h2>
              <button
                onClick={toggleMenu}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Save Section */}
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  File Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Enter file name"
                  />
                  <button
                    onClick={handleScreenshot}
                    className="rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 font-medium text-white transition-all hover:from-pink-600 hover:to-rose-600 hover:shadow-lg"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Title Customization */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Chart Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Enter title"
                />
              </div>

              {/* Axis Labels */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Axis Labels
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={top}
                    onChange={(e) => setTop(e.target.value)}
                    className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Top"
                  />
                  <input
                    type="text"
                    value={bottom}
                    onChange={(e) => setBottom(e.target.value)}
                    className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Bottom"
                  />
                  <input
                    type="text"
                    value={left}
                    onChange={(e) => setLeft(e.target.value)}
                    className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Left"
                  />
                  <input
                    type="text"
                    value={right}
                    onChange={(e) => setRight(e.target.value)}
                    className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Right"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div
        ref={chartRef}
        className="absolute bottom-6 left-1/2 z-20 h-[55%] w-[95%] -translate-x-1/2 transform rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl lg:right-6 lg:top-1/2 lg:left-auto lg:h-[80%] lg:w-[60%] lg:-translate-y-1/2 lg:translate-x-0"
      >
        {/* Title */}
        <div className="absolute left-1/2 -top-12 -translate-x-1/2 transform rounded-full bg-white/80 px-6 py-2 text-center text-lg font-bold shadow-md backdrop-blur-sm">
          {title}
        </div>

        {/* Icons Grid */}
        <div className="absolute left-0 top-0 flex flex-wrap gap-4 p-4 lg:w-[50%]">
          {icons.map((item, index) => (
            <Draggable
              key={index}
              defaultPosition={positions[index] || { x: 0, y: 0 }}
              onStop={(e, data) => handleStop(e, data, index)}
              nodeRef={draggableRefs.current[index]}
              onMouseDown={() => clickHandlerDraggable(index)}
            >
              <div
                ref={draggableRefs.current[index]}
                className={`transition-transform duration-200 ${
                  activeIndex === index ? "scale-110" : "scale-100"
                }`}
                style={{
                  zIndex: activeIndex === index ? highestZIndex : 1,
                }}
              >
                <img
                  src={getCharacterIconUrl(item.name)}
                  alt={`icon-${index}`}
                  className="h-10 w-auto cursor-move rounded-full border-2 border-white shadow-md transition-all hover:border-blue-400 lg:h-14"
                />
              </div>
            </Draggable>
          ))}
        </div>

        {/* Chart Axes and Labels */}
        <div className="h-full w-full">
          {/* Center Lines */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 transform bg-gray-300"></div>
          <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 transform bg-gray-300"></div>

          {/* Axis Labels */}
          <div className="absolute left-1/2 top-2 -translate-x-1/2 transform rounded-full bg-blue-500/90 px-4 py-1 text-sm font-semibold text-white shadow-md">
            {top}
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 transform rounded-full bg-blue-500/90 px-4 py-1 text-sm font-semibold text-white shadow-md">
            {bottom}
          </div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 transform -rotate-90 rounded-full bg-blue-500/90 px-4 py-1 text-sm font-semibold text-white shadow-md">
            {left}
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 transform rotate-90 rounded-full bg-blue-500/90 px-4 py-1 text-sm font-semibold text-white shadow-md">
            {right}
          </div>
        </div>
      </div>

      {/* Logo */}
      <img
        src="https://raw.githubusercontent.com/765Pro-Hoshimi/IDOLY-PRIDE-Logo/5e7f4e7a6b7889a12e266f1be1306cd6b2178a65/Logo/idoly-pride-logo-full-white.svg"
        alt="Idoly-Pride-Logo"
        className="absolute left-0 top-1/2 h-24 w-auto opacity-90 lg:h-40"
      />

      {/* Helper Tooltip */}
      {!isMenuOpen && (
        <div className="absolute left-4 top-12 max-w-xs rounded-xl bg-white/20 p-4 backdrop-blur-md transition-all duration-500">
          <div className="flex items-center gap-2 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 4.702z" />
            </svg>
            <p className="text-sm">
              Click the menu button to customize your chart
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoveInterestChart;
