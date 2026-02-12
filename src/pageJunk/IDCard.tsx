import React from "react";
import { getPlaceholderImageUrl } from "../utils/imageUtils";

interface IDCardProps {
  title: string;
  group: string;
  profilePic?: string;
  inputText: string;
  setInputText: (text: string) => void;
  setUnsavedChanges: (status: boolean) => void;
  setName: (name: string) => void;
  name: string;
  selectedIcon: { src: string }[];
}

const IDCard: React.FC<IDCardProps> = ({
  title,
  profilePic,
  group,
  inputText,
  setInputText,
  setUnsavedChanges,
  setName,
  name,
  selectedIcon,
}) => {
  const groupOfIdol = [
    {
      key: "tsukisto",
      name: "Tsuki no Tempest",
      altName: "tsukisto",
      color: "#5c88da",
    },
    { key: "sunnyp", name: "Sunny Peace", altName: "sunnyp", color: "#f69941" },
    {
      key: "triaile",
      name: "TRINITYAiLE",
      altName: "triaile",
      color: "#ace3ef",
    },
    { key: "liznoir", name: "LizNoir", altName: "liznoir", color: "#9563bf" },
    { key: "iiix", name: "IIIX", altName: "iiix", color: "#ffffff" },
    { key: "mana", name: "Mana Nagase", altName: "mana", color: "#ff69b4" },
  ];

  const matchedGroup = groupOfIdol.find((g) => g.name === group);
  const accentColor = matchedGroup?.color || "#3b82f6";

  const getIdolGroupUrl = (groupName: string) => {
    return `https://api.diveidolypapi.my.id/idolGroup/group-${groupName}-circle.png`;
  };

  const groupImageUrl = matchedGroup
    ? getIdolGroupUrl(matchedGroup.altName)
    : `${import.meta.env.BASE_URL}assets/icon/chara-avatar.png`;

  return (
    <div className="w-[32rem] h-[38rem] bg-[#0a0f1e] rounded-3xl shadow-2xl overflow-hidden relative border-[1px] border-white/10 text-white font-sans">
      {/* 1. Background Pattern & Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[25rem] h-[25rem] bg-purple-600/20 blur-[100px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      </div>

      {/* 2. Top Header - Angled Design */}
      <div className="relative z-10 h-36 overflow-hidden">
        {/* Diagonal Background Accent */}
        <div
          className="absolute inset-0 opacity-40 translate-y-[-20%] skew-y-[-6deg]"
          style={{ backgroundColor: accentColor }}
        ></div>

        <div className="relative flex items-center h-full px-8 pt-4 justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.3em] text-white/60 font-bold uppercase">
              Authorized Access
            </span>
            <h1 className="text-2xl font-black italic tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              {title.replace("'s Manager", "").toUpperCase()}
            </h1>
            <div
              className="h-[2px] w-12 mt-1"
              style={{ backgroundColor: accentColor }}
            ></div>
          </div>
          <img
            src={groupImageUrl}
            alt="group"
            className="w-14 h-14 object-contain drop-shadow-lg"
          />
        </div>
      </div>

      {/* 3. Profile Avatar - Floating Style */}
      <div className="absolute top-28 left-8 z-20 flex items-end gap-4">
        <div className="w-28 h-28 rounded-2xl border-2 border-white/20 bg-[#1a2035] shadow-2xl overflow-hidden rotate-[-3deg]">
          <img
            src={profilePic || getPlaceholderImageUrl("square")}
            alt="Profile"
            className="w-full h-full object-cover rotate-[3deg] scale-110"
          />
        </div>
        <div className="mb-2">
          <span className="text-[10px] font-bold text-white/40 uppercase block mb-1">
            Rank
          </span>
          <div className="px-3 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-200 rounded-sm text-black font-black text-sm italic">
            PRO MANAGER
          </div>
        </div>
      </div>

      {/* 4. Content Area */}
      <div className="relative z-10 px-8 pt-24 space-y-5">
        {/* Manager Name Container */}
        <div
          className="bg-white/5 backdrop-blur-md rounded-xl p-4 border-l-4 border-white/30"
          style={{ borderLeftColor: accentColor }}
        >
          <label className="text-[9px] font-bold text-white/40 tracking-widest block mb-1">
            IDENTIFIED NAME
          </label>
          <input
            className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none placeholder:text-white/10"
            placeholder="ENTER NAME"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setUnsavedChanges(true);
            }}
          />
        </div>

        {/* ID Info - Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#161b2e] rounded-lg p-3 border border-white/5">
            <span className="text-[8px] font-bold text-white/30 block mb-1 tracking-widest uppercase">
              Member Group
            </span>
            <span className="text-sm font-bold text-blue-300 truncate block">
              {group}
            </span>
          </div>
          <div className="bg-[#161b2e] rounded-lg p-3 border border-white/5">
            <span className="text-[8px] font-bold text-white/30 block mb-1 tracking-widest uppercase">
              Global Access
            </span>
            <span className="text-sm font-mono font-bold text-green-400 block">
              ID-P-2026
            </span>
          </div>
        </div>

        {/* Oshi Section - Stylish Display */}
        <div>
          <label className="text-[9px] font-bold text-white/40 tracking-widest block mb-3 uppercase">
            Top Support Character
          </label>
          <div className="flex gap-4">
            {selectedIcon.map((icon, index) => (
              <div key={index} className="relative">
                <div
                  className="absolute -inset-1 rounded-full blur-[4px] opacity-50"
                  style={{ backgroundColor: accentColor }}
                ></div>
                <img
                  src={icon.src}
                  alt="oshi"
                  className="relative h-14 w-14 rounded-full border-2 border-white/50 object-cover shadow-lg"
                />
              </div>
            ))}
            {selectedIcon.length < 3 &&
              Array.from({ length: 3 - selectedIcon.length }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 w-14 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center bg-white/5"
                >
                  <div className="w-1 h-3 bg-white/10 rounded-full"></div>
                  <div className="w-3 h-1 bg-white/10 rounded-full absolute"></div>
                </div>
              ))}
          </div>
        </div>

        {/* Message Box */}
        <div className="relative">
          <div className="absolute top-0 right-0 opacity-10">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H11.017C9.91244 16 9.01701 16.8954 9.01701 18L9.01701 21H14.017Z" />
            </svg>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setUnsavedChanges(true);
            }}
            placeholder="Type status message..."
            className="w-full h-24 bg-black/30 rounded-xl p-4 text-xs italic text-white/80 border border-white/10 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
          />
        </div>
      </div>

      {/* Side Decorative Bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 opacity-50"
        style={{ backgroundColor: accentColor }}
      ></div>

      {/* Decorative Corner Text */}
      <div className="absolute bottom-4 right-8">
        <span className="text-[8px] font-mono text-white/20 tracking-tighter uppercase">
          Dive Idoly PAPI // System.v.2026
        </span>
      </div>
    </div>
  );
};

export default IDCard;
