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
    // Tambahkan sumber lain di sini
  ];

  // Cari grup yang sesuai
  const matchedGroup = groupOfIdol.find((g) => g.name === group);

  const getIdolGroupUrl = (characterName: string) => {
    const originalUrl = `https://api.diveidolypapi.my.id/idolGroup/group-${characterName}-circle.png`;
    return `https://diveidolypapi.my.id/api/proxy/image?url=${encodeURIComponent(
      originalUrl
    )}`;
  };

  // Gunakan matchedGroup untuk mendapatkan URL gambar
  const groupImageUrl = matchedGroup
    ? getIdolGroupUrl(matchedGroup.altName)
    : `${import.meta.env.BASE_URL}assets/icon/chara-avatar.png`; // Fallback image

  return (
    <div className="h-2/3 max-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl flex flex-col items-center p-4 relative gap-3">
      {/* Foto Profil */}
      <div>
        <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-white shadow-lg">
          <img
            src={profilePic || `${getPlaceholderImageUrl("square")}`}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Logo Group */}
        <div
          className={`absolute left-1/2 -translate-y-12 translate-x-6 w-16 h-16}`}
        >
          <img
            src={groupImageUrl}
            alt="idolgroup"
            crossOrigin="anonymous"
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback jika gambar error
              (e.target as HTMLImageElement).src = `${
                import.meta.env.BASE_URL
              }assets/default_image.png`;
            }}
          />
        </div>
      </div>

      {/* Nama */}
      <input
        className="appearance-none border-none bg-transparent text-lg font-bold mt-2 whitespace-pre-wrap text-center"
        title={"Nama / Nickname"}
        placeholder={"Nama / Nickname"}
        value={name}
        maxLength={20}
        onChange={(e) => {
          setName(e.target.value);
          setUnsavedChanges(true);
        }}
      />

      {/* Agensi */}
      <p className="text-base italic text-gray-200">{title}</p>

      {/* ID Game */}
      <div className="flex items-center mt-2 text-xs gap-2">
        <div className="">
          <h4 className="font-bold">JP ID :</h4>
          <input
            type="text"
            maxLength={8}
            className="rounded h-max text-base pl-2 text-black"
          />
        </div>
        <div className="">
          <h4 className="font-bold">Global ID :</h4>
          <input
            type="text"
            maxLength={8}
            className="rounded h-max text-base pl-2 text-black"
          />
        </div>
      </div>

      {/* Oshi (max 3) */}
      <div className="flex text-white items-center gap-2 flex-col">
        <h3 className="italic pr-2 text-sm">Oshi :</h3>
        <div className="flex gap-2">
          {selectedIcon.map((icon, index) => (
            <img
              key={index}
              src={icon.src || `${getPlaceholderImageUrl("square")}`}
              alt={`oshi${index + 1}`}
              crossOrigin="anonymous"
              className="h-12 w-12 rounded-full"
            />
          ))}
          {selectedIcon.length < 3 &&
            Array.from({ length: 3 - selectedIcon.length }).map((_, index) => (
              <img
                key={selectedIcon.length + index}
                src={`${import.meta.env.BASE_URL}assets/icon/chara-avatar.png`}
                alt={`oshi${selectedIcon.length + index + 1}`}
                crossOrigin="anonymous"
                className="flex h-12 w-12 rounded-full"
              />
            ))}
        </div>
      </div>

      {/* Rant */}
      <textarea
        value={inputText}
        onChange={(e) => {
          setInputText(e.target.value);
          setUnsavedChanges(true);
        }}
        placeholder="Type your signature, motivation, or just rant. Anything is fine!"
        className="w-full border border-gray-300 rounded-md p-2 text-black"
      />
    </div>
  );
};

export default IDCard;
