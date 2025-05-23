import React, { useRef, useState, useEffect } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import axios from "axios";
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";

import Toast from "../components/Toast";

import { Character } from "../interfaces/Character";
import { Icon } from "../interfaces/Icon";

const API_BASE_URL = "https://diveidolypapi.my.id/api";

const LoveInterestChart: React.FC = () => {
  const draggableRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  const [icons, setIcons] = useState<Icon[]>([]);
  const [positions, setPositions] = useState<{
    [key: number]: { x: number; y: number };
  }>({});
  const [fileName, setFileName] = useState("");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

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

  const handleScreenshot = async () => {
    const element = document.getElementById("idolyChart");
    if (!element) return;

    const originalStyle = {
      height: element.style.height,
      overflow: element.style.overflow,
    };

    try {
      element.style.height = "full";
      element.style.overflow = "visible";

      // Gunakan dom-to-image
      const blob = await domtoimage.toBlob(element, {
        quality: 1,
        cacheBust: true,
        style: {
          transform: "none", // Handle transform issues
        },
        filter: (_node: any) => {
          // Handle filter jika diperlukan
          return true;
        },
        imagePlaceholder:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", // Placeholder untuk gambar error
      });

      if (blob) {
        saveAs(blob, `conversation_${title}.png`);
        setToastMessage("Image saved successfully!");
        setIsSuccess(true);
        setUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setToastMessage("Failed to save image");
      setIsSuccess(false);
    } finally {
      element.style.height = originalStyle.height;
      element.style.overflow = originalStyle.overflow;
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

  // Before unload effect
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        event.preventDefault();
        event.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [unsavedChanges]);

  const clickHandlerDraggable = (index: number) => {
    setHighestZIndex((prev) => prev + 1);
    setActiveIndex(index);
  };

  return (
    <div className="relative lg:h-[38rem] w-full bg-gradient-to-br from-[#182cfc] to-[#6a11cb] overflow-hidden flex flex-col lg:flex-row items-center lg:justify-between gap-20">
      {/* Customization Panel */}
      <div className="z-30 w-80 lg:h-full rounded-xl lg:rounded-r-xl bg-gray-800/90 backdrop-blur-lg shadow-2xl transition-all duration-300 m-4 lg:m-0 justify-center flex">
        <div className="p-4">
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

      {/* Chart Container */}
      <div
        id="idolyChart"
        className="z-20 h-96 w-full lg:w-1/2 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl translate-x-0 lg:-translate-x-20"
      >
        {/* Title */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 transform rounded-full bg-white/80 px-6 py-2 text-center text-lg font-bold shadow-md backdrop-blur-sm z-10">
          {title}
        </div>

        {/* Icons Grid */}
        <div className="absolute left-0 top-0 flex flex-wrap gap-4 p-4 lg:w-[75%] z-20">
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
          <div className="absolute left-1/2 top-12 -translate-x-1/2 transform rounded-full bg-blue-500/90 px-4 py-1 text-sm font-semibold text-white shadow-md">
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

      {toastMessage && (
        <Toast
          message={toastMessage}
          isSuccess={isSuccess}
          onClose={() => setToastMessage("")}
        />
      )}
    </div>
  );
};

export default LoveInterestChart;
