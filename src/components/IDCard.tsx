import React, { useState } from "react";
import { getPlaceholderImageUrl } from "../utils/imageUtils";

interface IDCardProps {
  title: string;
  group: string;
  level: string;
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
  level,
  inputText,
  setInputText,
  setUnsavedChanges,
  setName,
  name,
  selectedIcon,
}) => {
  // State lokal untuk ID (karena tidak ada di props, tapi perlu diedit user)
  const [jpId, setJpId] = useState("");
  const [globalId, setGlobalId] = useState("");

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
  // Default ke abu-abu gelap khas UI game jika tidak match
  const accentColor = matchedGroup?.color || "#374151";

  const getIdolGroupUrl = (groupName: string) => {
    return `https://apiip.dasewasia.my.id/idolGroup/group-${groupName}-circle.png`;
  };

  const groupImageUrl = matchedGroup
    ? getIdolGroupUrl(matchedGroup.altName)
    : `${import.meta.env.BASE_URL}assets/chara-avatar.png`;

  return (
    // Container Utama dengan Clip-Path untuk sudut terpotong khas Idoly Pride
    <div
      className="w-[32rem] h-[38rem] relative shadow-2xl overflow-hidden font-sans text-white"
      style={{
        background: "linear-gradient(135deg, #1f2937 0%, #0f172a 100%)", // Gradasi Abu-Hitam
        clipPath: "polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)", // Sudut potong diagonal
      }}
    >
      {/* Background Texture (Pola samar IP) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 11px)",
          }}
        ></div>
      </div>

      {/* Accent Bar di Kiri */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 z-10"
        style={{ backgroundColor: accentColor }}
      ></div>

      {/* HEADER SECTION */}
      <div className="relative z-10 pl-8 pt-8 pr-8 pb-4 flex items-center gap-5 border-b border-white/10">
        {/* Profile Picture Circle dengan Ring */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-full p-[2px] bg-gradient-to-tr from-white/50 to-transparent">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-800">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <img
                  src={getPlaceholderImageUrl("square")}
                  alt="Default"
                  className="w-full h-full object-cover opacity-50"
                />
              )}
            </div>
          </div>
          {/* Rank Badge Kecil */}
          <div className="absolute -bottom-1 -right-2 bg-[#1f2937] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/30 shadow-lg flex items-center gap-1">
            <span className="text-white/50 text-[8px]">Lv.</span>
            <span className="text-yellow-400 text-xs">{level || "0"}</span>
          </div>
        </div>

        {/* Name & Title Inputs */}
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">
            Manager Name
          </span>
          <input
            className="w-full bg-transparent text-3xl font-bold text-white placeholder-white/20 focus:outline-none border-b border-transparent focus:border-white/30 transition-colors"
            placeholder="NAME"
            value={name}
            maxLength={20}
            onChange={(e) => {
              setName(e.target.value);
              setUnsavedChanges(true);
            }}
          />
          {/* Agency Title Badge */}
          <div className="inline-block mt-1">
            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-white/80 border border-white/10">
              {title.replace("'s Manager", "")}
            </span>
          </div>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="relative z-10 p-8 space-y-6">
        {/* GROUP AFFILIATION (Card Style) */}
        <div
          className="flex items-center justify-between bg-white/5 p-3 rounded-lg border-l-2"
          style={{ borderLeftColor: accentColor }}
        >
          <span className="text-xs text-white/60 font-semibold uppercase tracking-wider">
            Affiliation
          </span>
          <div className="gap-4 flex items-center">
            <span
              className="text-lg font-bold tracking-tight"
              style={{
                color: accentColor === "#111827" ? "white" : accentColor,
              }}
            >
              {group}
            </span>
            <img
              src={groupImageUrl}
              alt="group"
              className="w-14 h-14 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* IDS (Input Fields - Functional) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/20 p-3 rounded border border-white/5">
            <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold">
              Game ID (JP)
            </label>
            <input
              type="text"
              maxLength={8}
              placeholder="ID0LYPR1"
              value={jpId}
              onChange={(e) => {
                setJpId(e.target.value);
                setUnsavedChanges(true);
              }}
              className="w-full bg-transparent text-lg font-mono text-white focus:outline-none placeholder-white/10"
            />
          </div>
          <div className="bg-black/20 p-3 rounded border border-white/5">
            <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold">
              Game ID (Global)
            </label>
            <input
              type="text"
              maxLength={8}
              placeholder="ID0LYPR1"
              value={globalId}
              onChange={(e) => {
                setGlobalId(e.target.value);
                setUnsavedChanges(true);
              }}
              className="w-full bg-transparent text-lg font-mono text-white focus:outline-none placeholder-white/10"
            />
          </div>
        </div>

        {/* SUPPORT IDOLS (Circular UI like in-game selection) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-3 bg-pink-500 rounded-full"></div>
            <span className="text-xs font-bold text-white/80 uppercase">
              Support Idols
            </span>
          </div>

          <div className="flex gap-4">
            {selectedIcon.map((icon, index) => (
              <div key={index} className="relative">
                {/* Ring Border mirip UI game */}
                <div className="w-16 h-16 rounded-full border-2 border-white/20 p-0.5 bg-black/40">
                  <img
                    src={icon.src || getPlaceholderImageUrl("square")}
                    alt={`oshi${index + 1}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
            ))}
            {/* Empty Slots */}
            {selectedIcon.length < 3 &&
              Array.from({ length: 3 - selectedIcon.length }).map(
                (_, index) => (
                  <div
                    key={selectedIcon.length + index}
                    className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center bg-white/5"
                  >
                    <span className="text-white/20 text-xl font-light">+</span>
                  </div>
                ),
              )}
          </div>
        </div>

        {/* MESSAGE AREA (Glassy) */}
        <div className="relative mt-2">
          <label className="absolute -top-2.5 left-3 px-1 bg-[#151d2e] text-[10px] text-white/40 font-bold uppercase">
            Comment
          </label>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setUnsavedChanges(true);
            }}
            placeholder="Enter status message..."
            className="w-full h-20 bg-transparent rounded border border-white/20 p-3 text-sm text-white/90 focus:outline-none focus:border-white/50 resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* FOOTER DECORATION */}
      <div className="absolute bottom-0 right-10 text-right">
        <div className="text-[10px] text-white/20 font-mono tracking-widest">
          IDOLY PRIDE // MANAGER ID
        </div>
        {/* Barcode effect */}
        <div className="flex justify-end gap-[2px] mt-1 h-2 opacity-30">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`w-[${Math.random() > 0.5 ? "1px" : "3px"}] bg-white h-full`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IDCard;
