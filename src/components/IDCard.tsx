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
    },
    {
      key: "sunnyp",
      name: "Sunny Peace",
      altName: "sunnyp",
    },
    {
      key: "triaile",
      name: "TRINITYAiLE",
      altName: "triaile",
    },
    {
      key: "liznoir",
      name: "LizNoir",
      altName: "liznoir",
    },
    {
      key: "iiix",
      name: "IIIX",
      altName: "iiix",
    },
    {
      key: "mana",
      name: "Mana Nagase",
      altName: "mana",
    },
  ];

  const matchedGroup = groupOfIdol.find((g) => g.name === group);

  const getIdolGroupUrl = (groupName: string) => {
    return `https://api.diveidolypapi.my.id/idolGroup/group-${groupName}-circle.png`;
  };

  const groupImageUrl = matchedGroup
    ? getIdolGroupUrl(matchedGroup.altName)
    : `${import.meta.env.BASE_URL}assets/icon/chara-avatar.png`;

  return (
    <div className="w-[32rem] h-[38rem] bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl shadow-2xl overflow-hidden relative border-4 border-white/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-striped-brick.png')]"></div>
      </div>

      {/* Header Section */}
      <div className="relative h-32 bg-gradient-to-r from-blue-700/70 to-purple-700/70 flex items-center justify-center p-6">
        <div className="absolute -bottom-6 left-6 w-24 h-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                if (img.src.startsWith("blob:")) {
                  // Simpan blob URL sementara
                  const blobUrl = img.src;
                  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                }
              }}
            />
          ) : (
            <img
              src={`${getPlaceholderImageUrl("square")}`}
              alt="Default Profile"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="absolute -bottom-8 left-24 w-8 h-8">
          <img
            src={groupImageUrl}
            crossOrigin="anonymous"
            alt="idolgroup"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `${
                import.meta.env.BASE_URL
              }assets/default_image.png`;
            }}
          />
        </div>

        <div className="ml-28 gap-2 flex flex-col">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">
            {title.toUpperCase()}
          </h1>
          <div className="flex items-center">
            <span className="text-sm text-white/80 font-medium">{group}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 pt-10 z-10">
        {/* Name Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/70 mb-1">
            MANAGER NAME
          </label>
          <input
            className="w-full bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-xl font-bold text-white border-b-2 border-white/30 focus:outline-none focus:border-blue-400 transition-colors"
            placeholder="Your Name"
            value={name}
            maxLength={20}
            onChange={(e) => {
              setName(e.target.value);
              setUnsavedChanges(true);
            }}
          />
        </div>

        {/* ID Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              JP ID
            </label>
            <input
              type="text"
              maxLength={8}
              className="w-full bg-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              GLOBAL ID
            </label>
            <input
              type="text"
              maxLength={8}
              className="w-full bg-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Oshi Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/70 mb-2">
            MY OSHI ({selectedIcon.length}/3)
          </label>
          <div className="flex gap-3">
            {selectedIcon.map((icon, index) => (
              <div key={index} className="relative group">
                <img
                  src={icon.src || `${getPlaceholderImageUrl("square")}`}
                  crossOrigin="anonymous"
                  alt={`oshi${index + 1}`}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white/80 shadow-md transition-transform group-hover:scale-110"
                />
              </div>
            ))}
            {selectedIcon.length < 3 &&
              Array.from({ length: 3 - selectedIcon.length }).map(
                (_, index) => (
                  <div
                    key={selectedIcon.length + index}
                    className="h-12 w-12 rounded-full bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center"
                  >
                    <span className="text-white/50 text-2xl">+</span>
                  </div>
                ),
              )}
          </div>
        </div>

        {/* Signature Section */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">
            SIGNATURE / MESSAGE
          </label>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setUnsavedChanges(true);
            }}
            placeholder="Write your signature or favorite quote..."
            className="w-full h-24 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
    </div>
  );
};

export default IDCard;
