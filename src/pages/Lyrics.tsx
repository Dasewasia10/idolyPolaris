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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);

  const [lyric, setLyric] = useState<Lyric[]>([]);
  const [idols, setIdols] = useState<Character[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  // Gunakan string kosong sebagai initial state
  const [activeSource, setActiveSource] = useState<string>("");
  const [activeData, setActiveData] = useState<any[]>([]);
  const [videoModalIsOpen, setVideoModalIsOpen] = useState(false);
  const [videoModalIsSmall, setVideoModalIsSmall] = useState(true);

  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);

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
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const filtered = combinedFilteredTitles.flatMap((source) =>
        source.data
          .map((item: any) => ({
            sourceName: source.name,
            ...item,
          }))
          .filter(
            (item: {
              title: string;
              alternateTitle: string;
              jpTitle: string;
            }) =>
              item.title.toLowerCase().includes(value.toLowerCase()) ||
              (item.alternateTitle &&
                item.alternateTitle
                  .toLowerCase()
                  .includes(value.toLowerCase())) ||
              (item.jpTitle &&
                item.jpTitle.toLowerCase().includes(value.toLowerCase()))
          )
          .slice(0, 5)
      ); // Batasi hasil maksimal 5

      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle ketika memilih suggestion
  const handleSelectSuggestion = (selectedItem: any) => {
    // Cari sumber yang sesuai
    const selectedSource = sources.find(
      (source) => source.name === selectedItem.sourceName
    );

    if (selectedSource) {
      setActiveSource(selectedSource.name);
      setActiveData(selectedSource.data);
      setActiveCharacters(selectedSource.data[0]?.matchedCharacters || []);
    }

    setSearchTerm(selectedItem.title);
    setShowSuggestions(false);
  };

  const [activeTab, setActiveTab] = useState<"video" | "detail" | "source">(
    "video"
  );

  const [activeColumns, setActiveColumns] = useState({
    kanji: true,
    romaji: true,
    english: true,
    indonesian: true,
  });

  // Fungsi toggle kolom
  const toggleColumn = (column: keyof typeof activeColumns) => {
    setActiveColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Cek jika klik terjadi di luar kedua menu
      const leftMenu = document.getElementById("leftConsole");
      const rightMenu = document.getElementById("rightConsole");

      const isClickOutsideLeft =
        leftMenu && !leftMenu.contains(event.target as Node);
      const isClickOutsideRight =
        rightMenu && !rightMenu.contains(event.target as Node);

      // Jika salah satu menu terbuka dan klik di luar
      if (
        (isLeftMenuOpen || isRightMenuOpen) &&
        isClickOutsideLeft &&
        isClickOutsideRight
      ) {
        setIsLeftMenuOpen(false);
        setIsRightMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLeftMenuOpen, isRightMenuOpen]); // Tambahkan dependencies

  return (
    <>
      <div className="h-max w-auto z-10 flex flex-col p-4 gap-2">
        <section id="leftConsole" className="absolute">
          {/* Menu Sidebar */}
          <div
            className={`fixed left-0 top-0 h-full bg-slate-900 z-10 transition-all duration-300 ease-in-out flex mt-20 ${
              isLeftMenuOpen ? "translate-x-0 w-72" : "-translate-x-full"
            }`}
          >
            {/* Konten Menu */}
            <div className="w-full bg-slate-900 p-4 overflow-y-auto">
              <h2 className="flex font-bold text-3xl text-white py-2">
                Filter Lyrics
              </h2>
              <div className="flex flex-col gap-4">
                {/* Filter Section */}
                <div className="flex flex-col gap-2">
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

                {/* Titles Section */}
                <div className="flex flex-col gap-2">
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
            {/* Tombol Toggle yang menempel di sisi kanan sidebar */}
            <button
              onClick={() => setIsLeftMenuOpen(!isLeftMenuOpen)}
              title="Klik untuk membuka/tutup menu kiri"
              className={`absolute -right-8 top-1/3 h-16 w-8 bg-slate-900 text-white rounded-r-md hover:bg-slate-700 transition-all flex items-center justify-center`}
            >
              {isLeftMenuOpen ? "<" : ">"}
            </button>
          </div>
        </section>
        <section id="rightConsole" className="absolute">
          {/* Menu Sidebar */}
          <div
            className={`fixed right-0 top-0 h-full bg-slate-900 z-10 transition-all duration-300 ease-in-out flex mt-20 ${
              isRightMenuOpen ? "translate-x-0 w-72" : "translate-x-full"
            }`}
          >
            {/* Tombol Toggle yang menempel di sisi kiri sidebar */}
            <button
              onClick={() => setIsRightMenuOpen(!isRightMenuOpen)}
              className={`absolute -left-8 top-1/3 h-16 w-8 bg-slate-900 text-white rounded-l-md hover:bg-slate-700 transition-all flex items-center justify-center`}
            >
              {isRightMenuOpen ? ">" : "<"}
            </button>

            {/* Konten Menu */}
            <div className="w-full bg-slate-900 p-4 overflow-y-auto max-w-72">
              <h2 className="flex font-bold text-3xl text-white py-2">
                Content
              </h2>
              <div className="flex flex-col gap-4 bg-white p-4 rounded-md">
                {/* Tab Header */}
                <div className="flex gap-2 border-b border-gray-300 text-sm">
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
                      <button onClick={() => setVideoModalIsOpen(true)}>
                        <img
                          src={activeData[0]?.videoThumbnail}
                          alt="Thumbnail Video"
                          className="cursor-pointer rounded-md hover:opacity-80 transition"
                        />
                      </button>
                    </div>
                  )}

                  {activeTab === "detail" && (
                    <div className="overflow-auto max-h-[40vh] scrollbar-minimal">
                      <div className="flex flex-col gap-4">
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
                          <h3 className="text-center font-bold mb-2">
                            Details
                          </h3>
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
                          <h3 className="text-center font-bold mb-2">
                            Characters
                          </h3>
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
                    <div className="text-center p-2">
                      <p className="flex flex-col gap-2">
                        {activeData[0]?.source ? (
                          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                            <a
                              className=""
                              href={activeData[0]?.source}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Click Here
                            </a>
                          </button>
                        ) : (
                          <span className="text-gray-500">No source</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="flex gap-4 w-full max-h-40 items-center justify-between bg-slate-900 p-2 rounded-md">
          <h1 className="flex w-full font-bold text-2xl text-white px-2 justify-center">
            {activeData[0]?.title}
          </h1>
        </section>

        <div
          id="videoModal"
          className={`absolute ${
            videoModalIsOpen
              ? "fixed flex items-center justify-center z-[9999] bg-black bg-opacity-0 transition-all duration-300"
              : ""
          }`}
        >
          <div
            className={`transform ${
              videoModalIsOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
            } transition-all duration-300`}
          >
            {/* Video Modal Selalu Tersedia */}
            <VideoModal
              src={activeData[0]?.video}
              // thumbnail={activeData[0]?.videoThumbnail}
              isOpen={videoModalIsOpen}
              setIsOpen={setVideoModalIsOpen}
              isSmall={videoModalIsSmall}
              setIsSmall={setVideoModalIsSmall}
            />
          </div>
        </div>

        <section className="flex flex-col w-full mx-auto overflow-auto gap-4 scrollbar-none h-[30rem]">
          {/* Tampilkan lirik lagu */}
          {activeData.length > 0 && (
            <table className="table-auto w-full bg-white rounded-md">
              <thead className="sticky top-0 bg-slate-700 text-white">
                <tr>
                  {activeColumns.kanji && <th className="px-4 py-2">Kanji</th>}
                  {activeColumns.romaji && (
                    <th className="px-4 py-2">Romaji</th>
                  )}
                  {activeColumns.english && (
                    <th className="px-4 py-2">English</th>
                  )}
                  {activeColumns.indonesian && (
                    <th className="px-4 py-2">Indonesian</th>
                  )}
                </tr>
              </thead>
              <tbody
                className={`${
                  // Jika hanya satu kolom yang aktif, center-kan teks
                  Object.values(activeColumns).filter(Boolean).length === 1
                    ? "text-center"
                    : ""
                }`}
              >
                {activeData.map((item: any) => (
                  <React.Fragment key={item.id}>
                    {item.kanji.map((kanji: string, index: number) => (
                      <tr
                        key={`${item.id}-kanji-${index}`}
                        className="hover:text-white hover:bg-slate-700"
                      >
                        {activeColumns.kanji && (
                          <td className="border px-4 py-2">
                            {parseText(kanji)}
                          </td>
                        )}
                        {activeColumns.romaji && (
                          <td className="border px-4 py-2">
                            {parseText(item.romaji[index] || "")}
                          </td>
                        )}
                        {activeColumns.english && (
                          <td className="border px-4 py-2">
                            {parseText(item.english[index] || "")}
                          </td>
                        )}
                        {activeColumns.indonesian && (
                          <td className="border px-4 py-2">
                            {parseText(item.indonesian[index] || "")}
                          </td>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <div
          id="belowConsole"
          className="w-full flex flex-col md:flex-col lg:flex-row justify-around mx-auto py-2 items-center gap-4"
        >
          <div className="w-full lg:w-1/2 z-10">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onSelectSuggestion={handleSelectSuggestion}
              placeholderText="Search by any title"
              suggestions={filteredSuggestions}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
            />
          </div>

          {/* Toggle Controls */}
          <div className="flex gap-4 p-2 bg-gray-100 rounded-lg z-10 shadow-sm h-12 flex-col lg:flex-row">
            {/* Preset Buttons as Switch */}
            <div className="flex flex-row gap-2 border-l border-gray-200 pl-4">
              <button
                onClick={() =>
                  setActiveColumns({
                    kanji: true,
                    romaji: true,
                    english: true,
                    indonesian: true,
                  })
                }
                className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-medium shadow-xs flex items-center gap-1 ${
                  activeColumns.kanji &&
                  activeColumns.romaji &&
                  activeColumns.english &&
                  activeColumns.indonesian
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Show All
              </button>
              <button
                onClick={() =>
                  setActiveColumns({
                    kanji: true,
                    romaji: false,
                    english: false,
                    indonesian: false,
                  })
                }
                className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-medium shadow-xs flex items-center gap-1 ${
                  activeColumns.kanji &&
                  !activeColumns.romaji &&
                  !activeColumns.english &&
                  !activeColumns.indonesian
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                    clipRule="evenodd"
                  />
                </svg>
                Kanji Only
              </button>
            </div>

            <div className="border-l border-slate-500 mx-1 hidden lg:block"></div>
            {/* Column Toggles */}
            <div className="flex flex-row gap-2 items-center text-sm bg-gray-100 rounded-lg p-2">
              {Object.keys(activeColumns).map((column) => (
                <label
                  key={column}
                  className="inline-flex items-center cursor-pointer"
                >
                  {/* Input hidden untuk aksesibilitas */}
                  <input
                    type="checkbox"
                    checked={
                      activeColumns[column as keyof typeof activeColumns]
                    }
                    onChange={() =>
                      toggleColumn(column as keyof typeof activeColumns)
                    }
                    className="sr-only" // Sembunyikan input asli
                  />
                  {/* Custom checkbox dengan efek tenggelam */}
                  <div
                    className={`px-3 py-1.5 rounded-md border transition-all duration-150 select-none ${
                      activeColumns[column as keyof typeof activeColumns]
                        ? "bg-blue-600 text-white border-blue-700 shadow-inner transform scale-[0.98] inset-shadow-sm inset-shadow-blue-900"
                        : "bg-white text-gray-700 border-gray-300 shadow-sm hover:bg-gray-50"
                    }`}
                  >
                    <span className="capitalize font-medium">{column}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Lyrics;
