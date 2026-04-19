import React, { useState } from "react";
import { getGroupImageUrl, getPlaceholderImageUrl } from "../utils/imageUtils";
import { Icon } from "../interfaces/Icon"; // Pastikan import ini benar

interface IDCardProps {
  title: string;
  group: string;
  level: string;
  profilePic?: string;
  inputText: string;
  jpId: string;
  rank?: string;
  setJpId: (id: string) => void;
  setInputText: (text: string) => void;
  setUnsavedChanges: (status: boolean) => void;
  setName: (name: string) => void;
  name: string;
  selectedIcon: Icon[];
  selectedCharacter?: Icon;
  template: "vertical" | "profile" | "classic" | "meishi";
  getSpriteUrl: (idolName: string, spriteType: "sprite1" | "sprite2") => string;
  bgUrl?: string;
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
  template,
  getSpriteUrl,
  bgUrl,
  selectedCharacter,
  jpId,
  setJpId,
  rank,
}) => {
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
  const accentColor = matchedGroup?.color || "#374151";

  const getIdolGroupUrl = (groupName: string) => {
    return `https://apiip.dasewasia.my.id/idolGroup/group-${groupName}-circle.png`;
  };

  const groupImageUrl = matchedGroup
    ? getIdolGroupUrl(matchedGroup.altName)
    : `${import.meta.env.BASE_URL}assets/chara-avatar.png`;

  // Mengambil karakter utama (idol pertama yang diklik user)
  const mainCharacter = selectedCharacter || selectedIcon[0];

  // ==========================================
  // TEMPLATE 1: MEISHI (Card Name - In-Game Style)
  // ==========================================
  if (template === "meishi") {
    return (
      <div className="w-[800px] h-[450px] bg-[#1a1a2e] border-2 border-white/20 relative overflow-hidden flex flex-col shadow-2xl">
        {/* Latar Belakang dari Card yang dipilih user */}
        {bgUrl ? (
          <img
            src={bgUrl}
            className="absolute inset-0 w-full h-full object-cover z-0"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 font-mono tracking-widest bg-gray-900 z-0">
            PLEASE SELECT BACKGROUND CARD
          </div>
        )}

        {/* Shadow Overlay agar teks terbaca */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none z-0" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-0" />

        {/* Top Info (ID, Nama, Level) */}
        <div className="relative z-10 p-8 flex flex-col justify-start">
          <div className="text-white/80 font-mono text-lg tracking-widest mb-1 drop-shadow-md uppercase">
            {jpId || "ID0LYPR1"}
          </div>
          <h2 className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">
            {name || "Manager"}
          </h2>
          <div className="flex items-baseline gap-2 text-white mt-1 drop-shadow-md">
            <span className="text-3xl font-bold opacity-80">Lv</span>
            <span className="text-6xl font-black">{level || "0"}</span>
          </div>
        </div>

        {/* Bottom Info (Icons & Text) */}
        <div className="relative z-10 p-8 flex flex-col justify-end h-full -translate-y-2">
          <span className="text-sm text-white/80 font-bold drop-shadow-md mb-2">
            Main Idols
          </span>
          <div className="flex items-center justify-between">
            {/* Icons */}
            <div className="w-full">
              <div className="flex gap-3 bg-slate-600/80 px-2 py-1 rounded-lg mb-3 h-20 max-w-72">
                {selectedIcon.map((icon, idx) => (
                  <div key={idx} className="p-1 shadow-lg">
                    <img
                      src={icon.src}
                      className="w-16 h-16 rounded-lg object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                ))}
              </div>
              <textarea
                value={inputText}
                maxLength={100}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setUnsavedChanges(true);
                }}
                placeholder="Enter status message..."
                className="w-2/3 h-20 bg-transparent rounded border border-white/20 p-3 text-sm text-white/90 focus:outline-none focus:border-white/50 resize-none leading-relaxed"
              />
            </div>

            {/* Signature / Right Watermark */}
            <div className="text-right flex flex-col items-end translate-y-10">
              <h3 className="absolute bottom-0 right-0 text-6xl font-serif text-white/40 -rotate-6 select-none">
                {mainCharacter?.rawData?.japaneseName || ""}
              </h3>
              <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold tracking-widest text-2xl border border-white/20">
                {rank || "C1"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 2: VERTICAL (Idol Poster Style)
  // ==========================================
  if (template === "vertical") {
    // Mengambil warna karakter (tanpa # dari rawData) atau warna abu-abu sebagai default
    const charColor = mainCharacter?.rawData?.color
      ? `#${mainCharacter.rawData.color}`
      : "#9ca3af";

    return (
      <div className="w-[400px] h-[600px] border-[16px] border-blue-900 relative overflow-hidden flex flex-col font-sans bg-white">
        {/* Container Latar Belakang Warna Karakter */}
        <div
          className="absolute inset-0 z-0 transition-colors duration-500"
          style={{ backgroundColor: charColor }}
        >
          {/* Latar Belakang Geometris (Low-Poly Segitiga Dinamis) */}
          <svg
            className="w-full h-full object-cover"
            preserveAspectRatio="none"
            viewBox="0 0 100 150"
          >
            <polygon points="0,0 60,0 40,40" fill="#ffffff" fillOpacity="0.5" />
            <polygon
              points="60,0 100,0 100,30"
              fill="#ffffff"
              fillOpacity="0.2"
            />
            <polygon
              points="60,0 100,30 40,40"
              fill="#000000"
              fillOpacity="0.0"
            />
            <polygon points="0,0 40,40 0,50" fill="#ffffff" fillOpacity="0.2" />
            <polygon
              points="0,50 40,40 30,90"
              fill="#000000"
              fillOpacity="0.0"
            />
            <polygon
              points="40,40 100,30 80,80"
              fill="#000000"
              fillOpacity="0.15"
            />
            <polygon
              points="40,40 80,80 30,90"
              fill="#000000"
              fillOpacity="0.3"
            />
            <polygon
              points="100,30 100,90 80,80"
              fill="#000000"
              fillOpacity="0.0"
            />
            <polygon
              points="0,50 30,90 0,120"
              fill="#000000"
              fillOpacity="0.15"
            />
            <polygon
              points="0,120 30,90 40,150"
              fill="#000000"
              fillOpacity="0.3"
            />
            <polygon
              points="30,90 80,80 60,130"
              fill="#000000"
              fillOpacity="0.15"
            />
            <polygon
              points="30,90 60,130 40,150"
              fill="#000000"
              fillOpacity="0.0"
            />
            <polygon
              points="80,80 100,90 100,150"
              fill="#000000"
              fillOpacity="0.3"
            />
            <polygon
              points="80,80 100,150 60,130"
              fill="#000000"
              fillOpacity="0.5"
            />
            <polygon
              points="0,120 40,150 0,150"
              fill="#000000"
              fillOpacity="0.0"
            />
            <polygon
              points="40,150 60,130 100,150"
              fill="#000000"
              fillOpacity="0.15"
            />
          </svg>
        </div>

        {/* Aksen Segitiga Gelap (Overlay diagonal hitam transparan) */}
        <div
          className="absolute inset-0 z-0 bg-gradient-to-tr from-black/40 via-black/10 to-transparent"
          style={{ clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0% 100%)" }}
        ></div>

        {/* Aksen Putih Miring (Slanted White Block) */}
        <div className="absolute w-[200%] h-full bg-white bottom-0 right-0 transform origin-bottom-right -rotate-[45deg] -translate-y-48 translate-x-96 shadow-[0_-8px_25px_rgba(0,0,0,0.3)]">
          {/* Tekstur Garis-garis diagonal (Stripes) */}
          <div className="absolute inset-0 opacity-15"></div>
        </div>

        <img
          className="absolute opacity-60 w-auto h-96 -right-40 bottom-4 object-cover"
          src={getGroupImageUrl(mainCharacter?.rawData?.groupName || "")}
          alt=""
        />

        {/* Tekstur Titik-titik (Dot Pattern) */}
        <div
          className="absolute inset-0 z-0 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.4,
          }}
        ></div>

        {/* Frame Overlay (Garis batas tech/sudut L) */}
        <div className="absolute inset-6 h-[25.5rem] border-2 border-blue-900/20 z-0 pointer-events-none">
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-900"></div>
          <div className="absolute top-96 -left-1 w-6 h-6 border-l-4 border-b-4 border-blue-900"></div>
          <div className="absolute top-96 -right-1 w-6 h-6 border-r-4 border-b-4 border-blue-900"></div>
        </div>

        {/* Teks Rotasi Nama Idol */}
        <div className="absolute right-3 top-8 text-left z-20 flex flex-col items-center">
          <h2
            className="text-4xl font-black text-gray-800 leading-none drop-shadow-lg tracking-tight [-webkit-text-stroke:1px_white]"
            style={{ writingMode: "vertical-rl" }}
          >
            {mainCharacter?.name.toUpperCase() || "SELECT"}
            <br />
            {mainCharacter?.name !== "miho" &&
            mainCharacter?.name !== "kana" &&
            mainCharacter?.name !== "fran"
              ? mainCharacter?.rawData?.familyName.toUpperCase()
              : ""}
          </h2>
          <span
            className="text-xs font-bold text-white mt-2 tracking-widest drop-shadow-md bg-gray-800 pt-1 pb-3"
            style={{ writingMode: "vertical-rl" }}
          >
            {mainCharacter?.name !== "miho" &&
            mainCharacter?.name !== "kana" &&
            mainCharacter?.name !== "fran"
              ? mainCharacter?.rawData?.japaneseName || "IDOL"
              : ""}
          </span>
        </div>

        <div className="absolute bottom-20 text-white bg-gray-700 pl-2 pr-6 py-2 z-20">
          <span className="uppercase font-bold tracking-wide">
            {name || "Manager"}
          </span>
        </div>
        {/* Sprite Character */}
        {mainCharacter && (
          <img
            src={getSpriteUrl(mainCharacter.name, "sprite1")}
            className="absolute left-1/2 -translate-x-1/2 -translate-y-12 h-[200%] w-auto max-w-none z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
            crossOrigin="anonymous"
          />
        )}

        {/* Footer Banner */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#1b3a8b] text-white px-3 py-4 z-20 flex items-end justify-between border-t border-white/20 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
          <div>
            <div className="text-2xl font-black tracking-widest font-mono">
              IDOLY PRIDE
            </div>
            <div className="text-[8px] tracking-[0.3em] opacity-80">
              {title.toUpperCase() || "NO AGENCY"}
            </div>
          </div>
          <div className="text-[8px] text-right font-mono opacity-60">
            © 2019 Project IDOLY PRIDE
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 3: PROFILE (Data List Style)
  // ==========================================
  if (template === "profile") {
    const charData = mainCharacter?.rawData;

    return (
      <div className="w-[800px] h-[450px] flex bg-white relative font-sans shadow-xl overflow-hidden">
        <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-[140px] font-black text-gray-50 opacity-60 z-0 select-none whitespace-nowrap tracking-tighter">
          {mainCharacter?.name || "IDOLY"}
        </div>

        {/* Area Kiri: Sprite & Warna Aksen */}
        <div
          className="w-4/12 relative overflow-hidden border-r-4 border-gray-100"
          style={{ backgroundColor: `#${charData?.color || "eab308"}` }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 20px, #ffffff 20px, #ffffff 40px)",
            }}
          ></div>

          {mainCharacter && (
            <img
              src={getSpriteUrl(mainCharacter.name, "sprite2")}
              /* PERBAIKAN SKALA: Menggunakan h-[115%] w-auto max-w-none agar tidak memotong ke samping */
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 h-[200%] w-auto max-w-none object-bottom drop-shadow-2xl z-10"
              crossOrigin="anonymous"
            />
          )}
        </div>

        {/* Area Kanan: Data Profil */}
        <div className="w-8/12 p-10 flex flex-col justify-center relative z-10">
          <img
            className="absolute opacity-40 mix-blend-overlay w-40 h-auto left-1/2"
            src={getGroupImageUrl(mainCharacter?.rawData?.groupName || "")}
            alt=""
          />
          <div className="flex justify-between items-end border-b-2 border-gray-100 pb-2 mb-6">
            <div className="text-sm font-extrabold text-gray-600 uppercase tracking-widest">
              {name || "Manager"}
            </div>
            <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest border-b border-yellow-400 pb-1">
              Profile Data
            </div>
          </div>

          <div className="text-5xl font-black text-gray-800 mb-8 text-center tracking-tight">
            {charData?.japaneseName || "SELECT IDOL"}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-gray-100 pb-2">
              <span className="text-sm font-bold text-pink-400">Birthday</span>
              <span className="text-lg font-bold text-gray-700">
                {charData?.birthdayDate
                  ? (() => {
                      const [, m, d] = charData.birthdayDate.split("-");
                      return `${parseInt(m)}月${parseInt(d)}日`;
                    })()
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-end border-b border-gray-100 pb-2">
              <span className="text-sm font-bold text-pink-400">Height</span>
              <span className="text-lg font-bold text-gray-700">
                {charData?.numeralStat?.height
                  ? `${charData.numeralStat.height}cm`
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-end border-b border-gray-100 pb-2">
              <span className="text-sm font-bold text-pink-400">Hobby</span>
              <span className="text-base font-bold text-gray-700 truncate max-w-[60%] text-right">
                {charData?.like || "-"}
              </span>
            </div>
            <div className="flex justify-between items-end border-b border-gray-100 pb-2">
              <span className="text-sm font-bold text-pink-400">Group</span>
              <span className="text-lg font-bold text-gray-700">
                {charData?.groupName ? `${charData.groupName}` : "-"}
              </span>
            </div>
            <div className="flex justify-between items-end border-b border-gray-100 pb-2">
              <span className="text-sm font-bold text-pink-400 uppercase">
                Production
              </span>
              <span className="text-base font-bold text-gray-700">
                {charData?.groupName === "IIIX"
                  ? "Van Production"
                  : "Hoshimi Production"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE DEFAULT: CLASSIC (KTP Hitam Aslimu)
  // ==========================================
  return (
    <div
      className="w-[32rem] h-[38rem] relative shadow-2xl overflow-hidden font-sans text-white"
      style={{
        background: "linear-gradient(135deg, #1f2937 0%, #0f172a 100%)",
        clipPath: "polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)",
      }}
    >
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 11px)",
          }}
        ></div>
      </div>

      {/* Accent Bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 z-10"
        style={{ backgroundColor: accentColor }}
      ></div>

      {/* HEADER SECTION */}
      <div className="relative z-10 pl-8 pt-8 pr-8 pb-4 flex items-center gap-5 border-b border-white/10">
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
                  crossOrigin="anonymous"
                />
              )}
            </div>
          </div>
          <div className="absolute -bottom-1 -right-2 bg-[#1f2937] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/30 shadow-lg flex items-center gap-1">
            <span className="text-white/50 text-[8px]">Lv.</span>
            <span className="text-yellow-400 text-xs">{level || "0"}</span>
          </div>
        </div>

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
          <div className="inline-block mt-1">
            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-white/80 border border-white/10">
              {title.replace("'s Manager", "")}
            </span>
          </div>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="relative z-10 p-8 space-y-6">
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
              crossOrigin="anonymous"
            />
          </div>
        </div>

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
                <div className="w-16 h-16 rounded-full border-2 border-white/20 p-0.5 bg-black/40">
                  <img
                    src={icon.src || getPlaceholderImageUrl("square")}
                    alt={`oshi${index + 1}`}
                    className="w-full h-full rounded-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
            ))}
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

        <div className="relative mt-2">
          <label className="absolute -top-2.5 left-3 px-1 bg-[#151d2e] text-[10px] text-white/40 font-bold uppercase">
            Comment
          </label>
          <textarea
            value={inputText}
            maxLength={100}
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
