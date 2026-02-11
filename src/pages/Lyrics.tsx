import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Character } from "../interfaces/Character";
import { Lyric } from "../interfaces/Lyric";
import VideoModal from "../components/videoYoutube";
import SearchBar from "../components/searchBar";
import {
  Play,
  ChevronRight,
  ArrowLeft,
  Languages,
  Info,
  X,
  ExternalLink,
  Calendar,
  Mic2,
  Music,
  User,
} from "lucide-react";

const API_BASE_URL = "https://diveidolypapi.my.id/api";

// --- INTERFACES ---
interface ExtendedLyric extends Lyric {
  matchedCharacters: {
    name: string;
    character: Character | null;
  }[];
}

const getCharacterIconUrl = (characterName: string) => {
  return `https://api.diveidolypapi.my.id/iconCharacter/chara-${encodeURIComponent(
    characterName,
  )}.png`;
};

// --- HELPER FUNCTIONS ---
const matchWithCharacters = (
  lyricsData: any[],
  characters: Character[],
): { groupName: string; data: ExtendedLyric[] }[] =>
  lyricsData.map((source) => {
    const matchedData = source.data.map((item: Lyric) => {
      const characterNames = Array.isArray(item.character)
        ? item.character
        : [];

      const matchedCharacters = characterNames.map((charName) => {
        if (!charName) return { name: "Unknown", character: null };
        const matched = characters.find(
          (char) => char.name?.toLowerCase() === charName.toLowerCase(),
        );
        return {
          name: charName,
          character: matched || null,
        };
      });

      return { ...item, matchedCharacters };
    });
    return { ...source, data: matchedData };
  });

// --- COMPONENT: Song Info Modal (NEW) ---
const SongInfoModal = ({
  isOpen,
  onClose,
  song,
}: {
  isOpen: boolean;
  onClose: () => void;
  song: ExtendedLyric | null;
}) => {
  if (!isOpen || !song) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900 sticky top-0">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Info size={20} className="text-blue-400" />
            Song Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {/* 1. Titles */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-white leading-tight">
              {song.title}
            </h2>
            {song.jpTitle && (
              <p className="text-gray-400 font-jp">{song.jpTitle}</p>
            )}
            {song.alternateTitle && (
              <p className="text-sm text-gray-500 italic">
                ({song.alternateTitle})
              </p>
            )}
          </div>

          {/* 2. Credits Grid */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-xs uppercase tracking-wider font-bold flex items-center gap-1">
                <Calendar size={12} /> Release Date
              </span>
              <span className="text-gray-200 font-medium">
                {song.releaseDate || "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-xs uppercase tracking-wider font-bold flex items-center gap-1">
                <Mic2 size={12} /> Lyricist
              </span>
              <span className="text-gray-200 font-medium">
                {song.lyricist || "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-xs uppercase tracking-wider font-bold flex items-center gap-1">
                <Music size={12} /> Composer
              </span>
              <span className="text-gray-200 font-medium">
                {song.composer || "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-xs uppercase tracking-wider font-bold flex items-center gap-1">
                <User size={12} /> Arranger
              </span>
              <span className="text-gray-200 font-medium">
                {song.arranger || "-"}
              </span>
            </div>
          </div>

          {/* 3. Group & Artists */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-400 border-b border-gray-800 pb-1">
              PERFORMED BY
            </h4>
            <div className="flex flex-col items-center gap-4">
              {/* Group Image (Logic dari snippet kamu) */}
              {song.altGroup && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-gray-800 p-1 border border-gray-700 shadow-lg">
                    <img
                      src={`https://api.diveidolypapi.my.id/idolGroup/group-${song.altGroup}-circle.png`}
                      alt={song.group}
                      className="w-full h-full object-contain rounded-full"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-300">
                    {song.group}
                  </span>
                </div>
              )}

              {/* Characters List */}
              <div className="flex flex-wrap justify-center gap-2">
                {song.matchedCharacters.map((charObj, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-gray-800 pr-3 rounded-full border border-gray-700"
                  >
                    <div
                      className="w-8 h-8 rounded-full border border-gray-600 overflow-hidden bg-gray-700"
                      style={{
                        backgroundColor: charObj.character?.color || "#374151",
                      }}
                    >
                      <img
                        src={getCharacterIconUrl(charObj.name.toLowerCase())}
                        alt={charObj.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs text-gray-300 font-medium">
                      {charObj.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Source Link */}
          {song.source && (
            <div className="pt-2">
              <a
                href={song.source}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all hover:shadow-lg shadow-blue-500/20"
              >
                <ExternalLink size={18} />
                View Source of Lyric
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Lyrics: React.FC = () => {
  // Data State
  const [lyricsData, setLyricsData] = useState<any[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [selectedSong, setSelectedSong] = useState<ExtendedLyric | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals State
  const [isInfoOpen, setIsInfoOpen] = useState(false); // New State for Info Modal
  const [videoSrc, setVideoSrc] = useState("");
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isVideoSmall, setIsVideoSmall] = useState(false);

  // Column Toggle State
  const [activeColumns, setActiveColumns] = useState({
    kanji: true,
    romaji: true,
    english: true,
    indonesian: true, // Asumsi ada field indonesian
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [lyricsRes, charsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/lyrics`),
          axios.get(`${API_BASE_URL}/characters`),
        ]);
        setLyricsData(lyricsRes.data);
        setCharacters(charsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process Data
  const processedData = useMemo(
    () => matchWithCharacters(lyricsData, characters),
    [lyricsData, characters],
  );

  // Flatten & Filter
  const allSongs = useMemo(() => {
    return processedData.flatMap((group) =>
      group.data.map((song) => ({
        ...song,
        group: song.group || group.groupName,
      })),
    );
  }, [processedData]);

  const filteredSongs = useMemo(() => {
    if (!searchTerm) return allSongs;
    const lower = searchTerm.toLowerCase();
    return allSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(lower) ||
        song.jpTitle?.toLowerCase().includes(lower),
    );
  }, [allSongs, searchTerm]);

  // --- HANDLERS ---
  const handleSongClick = (song: ExtendedLyric) => {
    setSelectedSong(song);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openVideo = (url?: string) => {
    if (!url) return;
    let embedUrl = url;
    if (url.includes("watch?v=")) {
      embedUrl = url.replace("watch?v=", "embed/");
    } else if (url.includes("youtu.be/")) {
      embedUrl = url.replace("youtu.be/", "www.youtube.com/embed/");
    }
    setVideoSrc(embedUrl);
    setIsVideoOpen(true);
    setIsVideoSmall(false);
  };

  const toggleColumn = (column: keyof typeof activeColumns) => {
    setActiveColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">
      {/* SIDEBAR LIST */}
      <aside
        className={`
        flex-col w-full md:w-[350px] lg:w-[400px] border-r border-gray-800 bg-gray-900/50 backdrop-blur-sm z-20
        ${selectedSong ? "hidden md:flex" : "flex"} 
      `}
      >
        <div className="p-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Song Lyrics
          </h1>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            placeholderText="Search song title..."
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-pink-500"></div>
            </div>
          ) : filteredSongs.length > 0 ? (
            filteredSongs.map((song, idx) => (
              <div
                key={idx}
                onClick={() => handleSongClick(song)}
                className={`group p-3 rounded-lg cursor-pointer transition-all border border-transparent hover:border-gray-700 hover:bg-gray-800 ${selectedSong?.title === song.title ? "bg-gray-800 border-pink-500/50 shadow-md" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3
                      className={`font-bold text-sm mb-1 ${selectedSong?.title === song.title ? "text-pink-400" : "text-gray-200 group-hover:text-white"}`}
                    >
                      {song.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono truncate">
                      {song.jpTitle}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`mt-1 text-gray-600 ${selectedSong?.title === song.title ? "text-pink-500" : "group-hover:text-gray-400"}`}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400 border border-gray-600/30">
                    {song.group}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-10 text-sm">
              No songs found.
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className={`
        flex-1 flex flex-col bg-gray-950 relative overflow-hidden
        ${!selectedSong ? "hidden md:flex" : "flex fixed inset-0 md:static z-30"}
      `}
      >
        {selectedSong ? (
          <>
            <header className="flex-shrink-0 bg-gray-900/90 backdrop-blur border-b border-gray-800 p-4 flex flex-col gap-4 shadow-lg z-20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedSong(null)}
                    className="md:hidden p-2 -ml-2 hover:bg-gray-800 rounded-full text-gray-300"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                      {selectedSong.title}
                    </h2>
                    <p className="text-sm text-gray-400 font-medium mt-1">
                      {selectedSong.jpTitle}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* TOMBOL INFO BARU */}
                  <button
                    onClick={() => setIsInfoOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-full font-bold text-sm transition-all"
                    title="Song Details"
                  >
                    <Info size={18} />
                    <span className="hidden sm:inline">Info</span>
                  </button>

                  {selectedSong.video && (
                    <button
                      onClick={() => openVideo(selectedSong.video)}
                      className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-full font-bold text-sm shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                      <Play size={16} fill="currentColor" />
                      <span className="hidden sm:inline">Play Video</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                {/* Singers List */}
                <div className="flex -space-x-2 overflow-hidden py-1">
                  {selectedSong.matchedCharacters.length > 0 ? (
                    selectedSong.matchedCharacters.map((charObj, idx) => (
                      <div
                        key={idx}
                        className="relative group/char cursor-help"
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-700 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
                          style={{
                            backgroundColor:
                              charObj.character?.color || "#374151",
                          }}
                        >
                          <img
                            src={getCharacterIconUrl(
                              charObj.name.toLowerCase(),
                            )}
                            alt={charObj.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/char:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                          {charObj.name}
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 italic">
                      Unknown Artist
                    </span>
                  )}
                </div>

                {/* Language Toggles */}
                <div className="flex items-center gap-2 bg-gray-800/50 p-1 rounded-lg border border-gray-700/50 self-start sm:self-auto">
                  <Languages size={16} className="ml-2 text-gray-400" />
                  <div className="h-4 w-px bg-gray-700 mx-1"></div>
                  {(
                    Object.keys(activeColumns) as Array<
                      keyof typeof activeColumns
                    >
                  ).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => toggleColumn(lang)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        activeColumns[lang]
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-400 hover:text-white hover:bg-gray-700"
                      }`}
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            {/* Lyrics Content (Table) */}
            <div className="flex-1 overflow-auto bg-gray-950 relative scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
              <div className="min-w-full inline-block align-middle">
                <div className="border-t border-gray-800">
                  <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-gray-900 sticky top-0 z-10 shadow-lg">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-12 text-center"
                        >
                          #
                        </th>
                        {activeColumns.kanji && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider min-w-[200px]"
                          >
                            Kanji / Original
                          </th>
                        )}
                        {activeColumns.romaji && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-bold text-pink-400 uppercase tracking-wider min-w-[200px]"
                          >
                            Romaji
                          </th>
                        )}
                        {activeColumns.english && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-bold text-blue-400 uppercase tracking-wider min-w-[200px]"
                          >
                            English
                          </th>
                        )}
                        {activeColumns.indonesian && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-bold text-green-400 uppercase tracking-wider min-w-[200px]"
                          >
                            Indonesian
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-gray-950 divide-y divide-gray-800/50">
                      {Array.from({
                        length: Math.max(
                          selectedSong.kanji?.length || 0,
                          selectedSong.romaji?.length || 0,
                          selectedSong.english?.length || 0,
                        ),
                      }).map((_, index) => (
                        <tr
                          key={index}
                          className="hover:bg-white/5 transition-colors duration-150 group"
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-xs text-center text-gray-600 font-mono group-hover:text-pink-500">
                            {index + 1}
                          </td>
                          {activeColumns.kanji && (
                            <td className="px-6 py-4 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-jp">
                              {selectedSong.kanji?.[index] || ""}
                            </td>
                          )}
                          {activeColumns.romaji && (
                            <td className="px-6 py-4 text-sm text-pink-100/90 leading-relaxed whitespace-pre-wrap font-medium">
                              {selectedSong.romaji?.[index] || ""}
                            </td>
                          )}
                          {activeColumns.english && (
                            <td className="px-6 py-4 text-sm text-blue-100/80 leading-relaxed whitespace-pre-wrap italic">
                              {selectedSong.english?.[index] || ""}
                            </td>
                          )}
                          {activeColumns.indonesian && (
                            <td className="px-6 py-4 text-sm text-green-100/80 leading-relaxed whitespace-pre-wrap italic">
                              {(selectedSong as any).indonesian?.[index] || ""}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="h-20 md:h-0"></div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-8 text-center">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <MusicIcon />
            </div>
            <h2 className="text-2xl font-bold text-gray-400 mb-2">
              Select a Song
            </h2>
            <p className="max-w-xs mx-auto">
              Choose a song from the list to view lyrics, translations, and play
              the music video.
            </p>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}
      <VideoModal
        isOpen={isVideoOpen}
        setIsOpen={setIsVideoOpen}
        src={videoSrc}
        isSmall={isVideoSmall}
        setIsSmall={setIsVideoSmall}
      />

      <SongInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        song={selectedSong}
      />
    </div>
  );
};

const MusicIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);

export default Lyrics;
