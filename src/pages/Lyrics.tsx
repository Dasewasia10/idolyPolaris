import React, { useState, useEffect } from "react";

import { Lyric } from "../interfaces/Lyric";
import { Character } from "../interfaces/Character";

import VideoModal from "../components/videoYoutube";
import SearchBar from "../components/searchBar";

const matchWithCharacters = (lyricsData: any[], characters: any[]) =>
  lyricsData.map((source) => {
    // Proses setiap item di dalam source.data
    const matchedData = source.data.map((item: { character: any }) => {
      // Pastikan item.character ada dan merupakan array
      const characterNames = Array.isArray(item.character)
        ? item.character
        : [];

      const matchedCharacters = characterNames.map((charName) => {
        const matched = characters.find(
          (char) => char.name?.toLowerCase() === charName?.toLowerCase()
        );
        return {
          name: charName,
          character: matched || null,
        };
      });

      return {
        ...item,
        matchedCharacters, // Tambahkan daftar karakter yang cocok ke item
      };
    });

    return {
      ...source,
      data: matchedData, // Perbarui source.data dengan matchedCharacters
    };
  });

const Lyrics: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>(""); // State untuk menyimpan nilai input pencarian

  const [lyric, setLyric] = useState<Lyric[]>([]);
  const [idols, setIdols] = useState<Character[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  // Gunakan string kosong sebagai initial state
  const [activeSource, setActiveSource] = useState<string>("");
  const [activeData, setActiveData] = useState<any[]>([]);
  const [videoModalIsOpen, setVideoModalIsOpen] = useState(false);
  const [videoModalIsSmall, setVideoModalIsSmall] = useState(false);

  useEffect(() => {
    const fetchLyrics = async () => {
      try {
        const response = await fetch(
          "https://www.diveidolypapi.my.id/api/lyrics"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch lyrics data");
        }
        const data = await response.json();
        setLyric(data); // Simpan data lirik ke state
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchLyrics();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://www.diveidolypapi.my.id/api/characters"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data: Character[] = await response.json();

        const filteredIdols = data.sort((a, b) => a.name.localeCompare(b.name)); // Urutkan berdasarkan nama idol

        setIdols(filteredIdols); // ✅ Simpan hanya idol dalam grup tertentu

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const generateIds = (data: any[]) =>
    data.map((item, index) => ({ ...item, id: index + 1 }));

  const getCharacterIconUrl = (characterName: string) => {
    return `https://api.diveidolypapi.my.id/iconCharacter/chara-${encodeURIComponent(
      characterName
    )}.png`;
  };

  const processLyrics = (lyricsData: any[]) => {
    return lyricsData.map((source) => ({
      ...source,
      data: generateIds(
        source.data.map(
          (item: {
            alternateTitle: any;
            jpTitle: any;
            group: any;
            character: any;
            lyricist: any;
            composer: any;
            arranger: any;
          }) => ({
            ...item,
            alternateTitle: item.alternateTitle,
            jpTitle: item.jpTitle,
            group: item.group,
            character: item.character || [], // Berikan array kosong sebagai default
            lyricist: item.lyricist,
            composer: item.composer,
            arranger: item.arranger,
          })
        )
      ),
    }));
  };

  // Gunakan fungsi ini setelah data lirik di-fetch
  useEffect(() => {
    if (lyric?.length > 0) {
      const processedLyrics = processLyrics(lyric);
      const matchedLyrics = matchWithCharacters(processedLyrics, idols);
      setSources(matchedLyrics);

      if (matchedLyrics.length > 0 && matchedLyrics[0].data?.length > 0) {
        setActiveSource(matchedLyrics[0].name);
        setActiveData(matchedLyrics[0].data);
        setActiveCharacters(matchedLyrics[0].data[0]?.matchedCharacters || []);
      }
    }
  }, [lyric, idols]);

  useEffect(() => {
    if (activeSource && sources.length > 0) {
      const selectedSource = sources.find(
        (source) => source.name === activeSource
      );
      if (selectedSource) {
        setActiveData(selectedSource.data || []);
        setActiveCharacters(selectedSource.data[0]?.matchedCharacters || []);
      }
    }
  }, [activeSource, sources]);

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    null
  );

  const filteredTitleByGroup = selectedGroup
    ? sources.filter((title) =>
        title.data.some((item: any) =>
          item.group?.toLowerCase().includes(selectedGroup.toLowerCase())
        )
      )
    : sources;

  const filteredTitleByCharacter = selectedCharacter
    ? sources.filter((title) =>
        title.data.some((item: any) =>
          item.character?.some((char: string) =>
            char?.toLowerCase().includes(selectedCharacter.toLowerCase())
          )
        )
      )
    : sources;

  const combinedFilteredTitles = sources.filter(
    (title) =>
      (searchTerm === "" ||
        title.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        title.data.some((item: any) =>
          item.alternateTitle?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        title.data.some((item: any) =>
          item.jpTitle?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        title.data.some((item: any) =>
          item.lyricist?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        title.data.some((item: any) =>
          item.composer?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        title.data.some((item: any) =>
          item.arranger?.toLowerCase().includes(searchTerm.toLowerCase())
        )) &&
      (selectedGroup === "" || filteredTitleByGroup.includes(title)) &&
      (selectedCharacter === "" || filteredTitleByCharacter.includes(title))
  );

  // const [activeSource, setActiveSource] = useState<string>(
  //   sources.length > 0 ? sources[0].name : ""
  // );

  // const activeData =
  //   sources.length > 0 && activeSource
  //     ? sources.find((source) => source.name === activeSource)?.data || []
  //     : [];

  const [activeCharacters, setActiveCharacters] = useState<any[]>([]);

  useEffect(() => {
    if (activeSource && sources.length > 0) {
      const activeLyric = sources.find(
        (source) => source.name === activeSource
      );
      if (activeLyric) {
        const matchedCharacters = matchWithCharacters([activeLyric], idols);
        setActiveCharacters(
          matchedCharacters[0]?.data[0]?.matchedCharacters || []
        );
      }
    }
  }, [activeSource, sources, idols]);

  const parseText = (text: string) => {
    // Regex untuk pola formatting dengan aturan yang benar
    const bold = /(?<!\*)\*\*(.+?)\*\*(?!\*)/g; // Hanya mencocokkan teks antara ** dan **
    const italic = /(?<!\*)\*(.+?)\*(?!\*)/g; // Hanya mencocokkan teks antara * dan * tanpa double asterisk
    const underline = /__(.+?)__/g; // Hanya mencocokkan teks antara __ dan __

    const htmlText = text
      .replace(bold, "<strong>$1</strong>")
      .replace(italic, "<em>$1</em>")
      .replace(underline, "<u>$1</u>");

    return <span dangerouslySetInnerHTML={{ __html: htmlText }} />;
  };

  const uniqueGroups = Array.from(
    new Set(
      sources.flatMap((source) => source.data.map((item: any) => item.group))
    )
  );

  const uniqueCharacters = Array.from(
    new Set(
      sources.flatMap((source) =>
        source.data.flatMap((item: any) => item.character)
      )
    )
  );

  const handleGroupFilter = (group: string) => {
    setSelectedGroup(group);
    setSelectedCharacter(null);
  };

  const handleCharacterFilter = (character: string) => {
    setSelectedCharacter(character);
    setSelectedGroup(null);
  };

  const handleSourceChange = (sourceKey: string) => {
    setActiveSource(sourceKey);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const [activeTab, setActiveTab] = useState<"video" | "detail" | "source">(
    "video"
  );

  return (
    <>
      <div className="h-screen bg-slate-400 flex p-4 gap-2">
        <section id="leftConsole" className="flex flex-col gap-4 w-1/2">
          <div className="flex items-center gap-4 h-12 w-full">
            <button
              className="px-4 py-2 bg-gray-300 hover:bg-gray-800 rounded-md hover:text-white font-semibold"
              onClick={handleBackClick}
            >
              {"<"}
            </button>
            <h1 className="flex font-bold text-3xl">Lyrics</h1>
            <div className="flex-1 min-w-[200px]">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                placeholderText="Search by title or detail"
              />
            </div>
          </div>
          <section className="bg-slate-900 p-2 flex flex-col gap-2 w-full overflow-y-auto no-scrollbar">
            <div className="w-full bg-slate-900 sticky top-0 z-10">
              <div className="flex justify-between p-4 gap-4">
                {/* Filter di kiri */}
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <h2 className="text-left font-bold text-white">Filter</h2>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-2">
                      <select
                        className="p-2 rounded-md bg-gray-300 flex-1"
                        value={selectedGroup || ""}
                        onChange={(e) => handleGroupFilter(e.target.value)}
                      >
                        <option value="">All Groups</option>
                        {uniqueGroups.map((group, index) => (
                          <option key={index} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <select
                        className="p-2 rounded-md bg-gray-300 flex-1"
                        value={selectedCharacter || ""}
                        onChange={(e) => handleCharacterFilter(e.target.value)}
                      >
                        <option value="">All Characters</option>
                        {uniqueCharacters.map((character, index) => (
                          <option key={index} value={character}>
                            {character}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Titles di kanan */}
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <h2 className="text-left font-bold text-white">Titles</h2>
                  <select
                    value={activeSource}
                    onChange={(e) => handleSourceChange(e.target.value)}
                    className="p-2 rounded-md bg-gray-300 text-black"
                  >
                    {combinedFilteredTitles.map((source) => (
                      <option key={source.name} value={source.name}>
                        {source.data[0].title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-md p-4">
            {/* Tab Header */}
            <div className="flex gap-4 border-b border-gray-300 mb-4">
              {["video", "detail", "source"].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 font-semibold capitalize ${
                    activeTab === tab
                      ? "border-b-4 border-blue-500 text-blue-600"
                      : "text-gray-600"
                  }`}
                  onClick={() =>
                    setActiveTab(tab as "video" | "detail" | "source")
                  }
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === "video" && (
                <div className="flex flex-col items-center gap-4">
                  <VideoModal
                    src={activeData[0]?.video}
                    thumbnail={activeData[0]?.videoThumbnail}
                    isOpen={videoModalIsOpen}
                    setIsOpen={setVideoModalIsOpen}
                    isSmall={videoModalIsSmall}
                    setIsSmall={setVideoModalIsSmall}
                  />
                </div>
              )}

              {activeTab === "detail" && (
                <div className="overflow-auto max-h-[40vh]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="flex flex-col bg-gray-200 p-4 rounded-md">
                      <h3 className="text-center font-bold mb-2">Title</h3>
                      <div className="flex flex-col text-center divide-y divide-gray-700">
                        <span>{activeData[0]?.title}</span>
                        {activeData[0]?.alternateTitle && (
                          <span>{activeData[0]?.alternateTitle}</span>
                        )}
                        {activeData[0]?.jpTitle && (
                          <span>{activeData[0]?.jpTitle}</span>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col bg-gray-200 p-4 rounded-md">
                      <h3 className="text-center font-bold mb-2">Details</h3>
                      <div className="flex flex-col divide-y divide-gray-700">
                        <span>
                          <b>Release Date:</b> {activeData[0]?.releaseDate}
                        </span>
                        <span>
                          <b>Lyricist:</b> {activeData[0]?.lyricist}
                        </span>
                        <span>
                          <b>Composer:</b> {activeData[0]?.composer}
                        </span>
                        <span>
                          <b>Arranger:</b> {activeData[0]?.arranger}
                        </span>
                      </div>
                    </div>

                    {/* Performance Grouping */}
                    <div className="flex flex-col items-center bg-gray-200 p-4 rounded-md">
                      <h3 className="text-center font-bold mb-2">
                        Performance Grouping
                      </h3>
                      {activeData[0]?.group && (
                        <img
                          src={`https://api.diveidolypapi.my.id/idolGroup/group-${activeData[0]?.altGroup}-circle.png`}
                          alt={activeData[0]?.group}
                          className="w-12 h-auto"
                        />
                      )}
                    </div>

                    {/* Characters */}
                    <div className="flex flex-col items-center bg-gray-200 p-4 rounded-md">
                      <h3 className="text-center font-bold mb-2">Characters</h3>
                      <div className="flex justify-center gap-1 flex-wrap">
                        {activeCharacters.map((char, index) => (
                          <img
                            key={char.name}
                            src={getCharacterIconUrl(
                              char.name?.toLowerCase() || "mei"
                            )}
                            alt={`Character ${index}`}
                            className="rounded-full border-2 border-gray-700 w-8 h-8"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "source" && (
                <div className="text-center p-4">
                  <p>
                    <strong>Sumber Lirik:</strong>{" "}
                    {activeData[0]?.source ? (
                      <a
                        className="text-blue-600 hover:underline"
                        href={activeData[0]?.source}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Klik Di Sini
                      </a>
                    ) : (
                      <span className="text-gray-500">Tidak tersedia</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </section>
        </section>

        <section className="flex flex-col w-full overflow-auto gap-4 scrollbar-none w-1/2">
          {/* Tampilkan lirik lagu */}
          {activeData.length > 0 && (
            <table className="table-auto w-full bg-white rounded-md">
              <thead className="sticky top-0 bg-gray-200">
                <tr>
                  <th className="px-4 py-2">Kanji</th>
                  <th className="px-4 py-2">Romaji</th>
                  <th className="px-4 py-2">English</th>
                  <th className="px-4 py-2">Indonesian</th>
                </tr>
              </thead>
              <tbody>
                {activeData.map((item: any) => (
                  <React.Fragment key={item.id}>
                    {item.kanji.map((kanji: string, index: number) => (
                      <tr
                        key={`${item.id}-kanji-${index}`}
                        className="hover:text-white hover:bg-slate-700"
                      >
                        <td className="border px-4 py-2">{parseText(kanji)}</td>
                        <td className="border px-4 py-2">
                          {parseText(item.romaji[index] || "")}
                        </td>
                        <td className="border px-4 py-2">
                          {parseText(item.english[index] || "")}
                        </td>
                        <td className="border px-4 py-2">
                          {parseText(item.indonesian[index] || "")}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
};

export default Lyrics;
