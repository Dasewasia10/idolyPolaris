import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dotWave } from "ldrs";

import { Character } from "../interfaces/Character";
import { getGroupImageUrl } from "../utils/imageUtils";
// import { characters } from "../data/characters";

dotWave.register("l-dot-wave");

const IdolDetailPage: React.FC = () => {
  const { idolName } = useParams<{ idolName: string }>();
  const [idol, setIdol] = useState<Character | null>(null);
  const [selectedIdol, setSelectedIdol] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/idolList"); // Navigasi ke halaman sebelumnya
  };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://www.diveidolypapi.my.id/api/characters"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data: Character[] = await response.json();
        const specificIdol = data.find(
          (idol) => idol.name.toLowerCase().replace(/\s+/g, "-") === idolName
        );

        const allowedGroups = [
          "Tsuki no Tempest",
          "Sunny Peace",
          "TRINITYAiLE",
          "LizNoir",
          "IIIX",
          "Mana Nagase",
          "Collaboration",
        ];

        const filteredIdols = data.filter((idol) =>
          allowedGroups.includes(idol.groupName)
        );

        setSelectedIdol(filteredIdols); // ✅ Hanya menyimpan idol dari grup yang diperbolehkan

        // ✅ Hanya filter tampilan utama, tetapi tidak mengubah `selectedIdol`
        if (specificIdol && allowedGroups.includes(specificIdol.groupName)) {
          setIdol(specificIdol);
        } else {
          setIdol(null); // Jika tidak ada, tampilkan "There's None Idol Data!"
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [idolName]);

  if (!idol) {
    return (
      <>
        <p>There's None Idol Data!</p>
      </>
    );
  }

  const getCharacterIconUrl = (characterName: string) => {
    return `https://www.diveidolypapi.my.id/api/img/character/icon/${encodeURIComponent(
      characterName
    )}`;
  };

  const getCharacterSprite1Url = (characterName: string) => {
    return `https://www.diveidolypapi.my.id/api/img/character/sprite1/${encodeURIComponent(
      characterName
    )}`;
  };

  const getCharacterSprite2Url = (characterName: string) => {
    return `https://www.diveidolypapi.my.id/api/img/character/sprite2/${encodeURIComponent(
      characterName
    )}`;
  };
  
  const getCharacterBannerUrl = (characterName: string) => {
    return `https://www.diveidolypapi.my.id/api/img/character/banner/${encodeURIComponent(
      characterName
    )}`;
  };

  const listOfIdol = () => {
    return selectedIdol.map((item, index) => {
      return (
        <div
          key={index}
          className="flex cursor-pointer rounded px-4 py-2"
          onClick={() =>
            navigate(`/idol/${item.name.toLowerCase().replace(/\s+/g, "-")}`)
          }
        >
          <div className="lg:text-md z-10 flex w-16 flex-row items-center gap-2 rounded rounded-r-xl bg-slate-600 px-2 py-1 text-sm font-bold text-white text-opacity-0 transition-all duration-500 ease-out hover:w-full hover:text-opacity-100 lg:w-20 lg:gap-4 lg:px-4 lg:py-2">
            <img
              src={getCharacterIconUrl(item.name.toLowerCase())}
              alt={item.name}
              onError={(e) => {
                e.currentTarget.src = getCharacterIconUrl("kohei"); // Ganti dengan URL gambar fallback
                e.currentTarget.alt = "Image not available";
              }}
              className="h-6 w-auto rounded-full object-cover lg:h-12"
            />
            <div className="text-left">
              {item.name} <br /> {item.familyName}
            </div>
          </div>
        </div>
      );
    });
  };

  const isColorDark = (color: string) => {
    color = color.replace("#", "");
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  const formatDate = (dateString: string): string => {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    //const year = date.getFullYear(); pakai ${year} di return bila ingin digunakan

    return `${day} ${month}`;
  };

  return (
    <div
      style={{
        backgroundColor: `#${idol.color}`,
        color: idol.color && isColorDark(idol.color) ? "#FFFFFF" : "#000000",
      }}
      className="relative mx-auto flex h-screen flex-row gap-4 p-4 transition-all duration-500 ease-out"
    >
      {(loading || !idol) && (
        <div className="absolute left-0 right-0 z-20 mx-auto w-max self-center">
          <l-dot-wave size="80" speed="1" color={`#${idol.color}`} />
        </div>
      )}
      {/* {Background image represented the group of the idol} */}
      <img
        src={getGroupImageUrl(idol.groupName)}
        alt={idol.groupName}
        className="absolute left-0 right-0 mx-auto h-60 w-auto self-center opacity-60 transition-all duration-500 ease-out lg:h-[30rem]"
      />
      {idol.groupName === "IIIX" && (
        <img
          src={getGroupImageUrl(idol.groupName)}
          alt={idol.groupName}
          className="absolute left-0 right-0 mx-auto h-60 w-auto self-center rounded-xl bg-white bg-opacity-90 px-6 py-4 transition-all duration-500 ease-out lg:h-[30rem]"
        />
      )}
      {idol.groupName === "Mana Nagase" && (
        <img
          src={getGroupImageUrl(idol.groupName)}
          alt={idol.groupName}
          className="absolute left-0 right-0 mx-auto h-60 w-auto self-center rounded-xl bg-white bg-opacity-90 px-6 py-4 transition-all duration-500 ease-out lg:h-[30rem]"
        />
      )}
      {(idol.name === "Cocoa" || idol.name === "Chino") && (
        <img
          src={getGroupImageUrl("Gochiusa")}
          alt={"Collaboration"}
          className="absolute left-0 right-0 mx-auto h-60 w-auto self-center opacity-60 transition-all duration-500 ease-out lg:h-[30rem]"
        />
      )}
      {(idol.name === "Riko" ||
        idol.name === "Chika" ||
        idol.name === "Yo") && (
        <img
          src={getGroupImageUrl("Aqours")}
          alt={"Collaboration"}
          className="absolute left-0 right-0 mx-auto h-auto w-[30rem] self-center opacity-60 transition-all duration-500 ease-out"
        />
      )}
      {idol.name === "Miku" && (
        <img
          src={getGroupImageUrl("Miku")}
          alt={"Collaboration"}
          className="absolute left-0 right-0 mx-auto h-auto w-[30rem] self-center opacity-60 transition-all duration-500 ease-out"
        />
      )}
      <section
        id="leftConsole"
        className="flex flex-col absolute top-2 left-2 gap-4 w-1/4"
      >
        <div className="flex items-center gap-4">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-800 rounded-md hover:text-white font-semibold"
            onClick={handleBackClick}
          >
            {"<"}
          </button>
        </div>
      </section>
      <div
        className={`z-10 w-full rounded border bg-opacity-70 p-4 shadow-sm h-full overflow-y-auto no-scrollbar ml-24 ${
          idol.color && isColorDark(idol.color)
            ? "bg-slate-700"
            : "bg-slate-100"
        }`}
      >
        <h1 className="mb-4 text-2xl font-medium">
          {idol.familyName} {idol.name} ({idol.japaneseName || "----"})
        </h1>
        <section className="flex flex-row gap-4">
          <img
            src={getCharacterSprite1Url(idol.name.toLowerCase())}
            alt={idol.name}
            onError={(e) => {
              e.currentTarget.src = `${
                import.meta.env.BASE_URL
              }assets/default_image.png`;
              e.currentTarget.alt = "Image not available";
              setImageError(true); // Set state menjadi true
            }}
            className={`mb-4 h-40 rounded object-cover ${
              imageError ? "w-20" : "w-auto"
            }`}
          />
          <img
            src={getCharacterSprite2Url(idol.name.toLowerCase())}
            alt={idol.name}
            onError={(e) => {
              e.currentTarget.src = `${
                import.meta.env.BASE_URL
              }assets/default_image.png`;
              e.currentTarget.alt = "Image not available";
              setImageError(true); // Set state menjadi true
            }}
            className={`mb-4 h-40 rounded object-cover ${
              imageError ? "w-20" : "w-auto"
            }`}
          />
          <img
            src={getCharacterIconUrl(idol.name.toLowerCase())}
            alt={idol.name}
            onError={(e) => {
              e.currentTarget.src = `${
                import.meta.env.BASE_URL
              }assets/default_image.png`;
              e.currentTarget.alt = "Image not available";
            }}
            className="mb-4 h-32 w-auto rounded object-cover"
          />
        </section>
        <ul>
          <li>
            <p>
              <strong>Group Name:</strong> {idol.groupName || "----"}
            </p>
          </li>
          <li>
            <p>
              <strong>Is Center:</strong> {idol.isCenter ? "Yes" : "No"}
            </p>
          </li>
          <li>
            <p>
              <strong>Color:</strong> {idol.color || "----"}
            </p>
          </li>
          <li>
            <p>
              <strong>H/W:</strong> {idol.numeralStat.height || 0} cm/
              {idol.numeralStat.weight || 0} kg
            </p>
          </li>
          <li>
            <p>
              <strong>Birthday Date:</strong>{" "}
              {idol.birthdayDate ? formatDate(idol.birthdayDate) : "----"}
            </p>
          </li>
          <li>
            <p>
              <strong>B/W/H:</strong> {idol.numeralStat.bust || 0}/
              {idol.numeralStat.waist || 0}/{idol.numeralStat.hip || 0}
            </p>
          </li>
          <li>
            <p>
              <strong>Seiyuu:</strong> {idol.seiyuuName || "----"} (
              {idol.japaneseSeiyuuName || "----"})
            </p>
          </li>
          <li>
            <p>
              <strong>Badge:</strong> {idol.badge || "----"} (
              {idol.japaneseBadge || "----"})
            </p>
          </li>
          <li>
            <p>
              <strong>MBTI:</strong> {idol.mbti || "----"}
            </p>
          </li>
        </ul>
      </div>
      <section className="absolute right-8 top-8 z-10 h-[36rem] opacity-0 transition-all duration-500 ease-out md:opacity-100 lg:opacity-100">
        <img
          src={getCharacterBannerUrl(idol.name.toLowerCase())}
          alt={idol.name}
          onError={(e) => {
            e.currentTarget.src = `${
              import.meta.env.BASE_URL
            }assets/default_image.png`;
            e.currentTarget.alt = "Image not available";
            setImageError(true); // Set state menjadi true
          }}
          className="mb-4 h-3/4 w-auto rounded object-cover"
        />
      </section>
      <section className="absolute left-0 top-20 h-80 overflow-y-auto overflow-x-hidden scrollbar-none lg:h-[25rem]">
        {listOfIdol()}
      </section>
      <div className="absolute left-4 bottom-16 flex h-fit w-24 flex-col gap-2 bg-white p-4 transition-all duration-500 ease-out text-black">
        <span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 4.702z" />
          </svg>
        </span>
        <p>You can scroll this</p>
      </div>
    </div>
  );
};

export default IdolDetailPage;
