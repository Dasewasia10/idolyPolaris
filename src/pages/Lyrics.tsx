import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Character } from "../interfaces/Character";
import { Lyric } from "../interfaces/Lyric";
import VideoModal from "../components/videoYoutube";
import SearchBar from "../components/searchBar";
import {
  Play,
  ArrowLeft,
  Languages,
  Info,
  X,
  ExternalLink,
  Calendar,
  Mic2,
  Music,
  User,
  Disc,
  ListMusic,
  Mic,
} from "lucide-react";

const API_BASE_URL = "https://beip.dasewasia.my.id/api";

// --- INTERFACES ---
interface ExtendedLyric extends Lyric {
  matchedCharacters: {
    name: string;
    character: Character | null;
  }[];
}

const getCharacterIconUrl = (characterName: string) => {
  return `https://apiip.dasewasia.my.id/iconCharacter/chara-${encodeURIComponent(
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

// --- COMPONENT: Song Info Modal (Tech Style) ---
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
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 mt-5"
      onClick={onClose}
    >
      <div
        className="bg-[#161b22] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>

        {/* Header Modal */}
        <div className="flex justify-between items-center p-5 border-b border-white/10 bg-[#0d1117]">
          <h3 className="text-lg font-black text-white flex items-center gap-3 italic tracking-tighter">
            <div className="p-1.5 bg-cyan-900/30 rounded border border-cyan-500/30 text-cyan-400">
              <Info size={18} />
            </div>
            METADATA INFO
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* 1. Titles */}
          <div className="text-center space-y-2 border-b border-white/5 pb-6">
            <h2 className="text-2xl font-bold text-white leading-tight font-jp">
              {song.title}
            </h2>
            {song.jpTitle && (
              <p className="text-gray-400 text-sm font-jp tracking-wide">
                {song.jpTitle}
              </p>
            )}
            {song.alternateTitle && (
              <p className="text-xs text-cyan-500/70 font-mono mt-1">
                ALT: {song.alternateTitle}
              </p>
            )}
          </div>

          {/* 2. Credits Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "RELEASE", val: song.releaseDate, icon: Calendar },
              { label: "LYRICIST", val: song.lyricist, icon: Mic2 },
              { label: "COMPOSER", val: song.composer, icon: Music },
              { label: "ARRANGER", val: song.arranger, icon: User },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#0d1117] p-3 rounded-lg border border-white/5 flex flex-col gap-1"
              >
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <item.icon size={10} /> {item.label}
                </span>
                <span
                  className="text-sm font-medium text-gray-200 truncate"
                  title={item.val || "-"}
                >
                  {item.val || "N/A"}
                </span>
              </div>
            ))}
          </div>

          {/* 3. Group & Artists */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2 mb-3">
              VOCAL UNIT
            </h4>
            <div className="flex flex-col items-center gap-4">
              {/* Group Image */}
              {song.altGroup && (
                <div className="flex items-center gap-4 bg-gray-800/50 pr-4 rounded-full border border-white/5">
                  <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-cyan-500 to-purple-500">
                    <img
                      src={`https://apiip.dasewasia.my.id/idolGroup/group-${song.altGroup}-circle.png`}
                      alt={song.group}
                      className="w-full h-full object-contain rounded-full bg-[#161b22]"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    {song.group}
                  </span>
                </div>
              )}

              {/* Characters List */}
              <div className="flex flex-wrap justify-center gap-2">
                {song.matchedCharacters.map((charObj, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-[#0d1117] pr-3 py-1 pl-1 rounded-full border border-white/10 hover:border-cyan-500/50 transition-colors"
                  >
                    <div
                      className="w-6 h-6 rounded-full overflow-hidden bg-gray-700"
                      style={{
                        backgroundColor: charObj.character?.color
                          ? `#${charObj.character.color}`
                          : "#374151",
                      }}
                    >
                      <img
                        src={getCharacterIconUrl(charObj.name.toLowerCase())}
                        alt={charObj.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs text-gray-300 font-bold">
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
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all"
              >
                <ExternalLink size={16} />
                EXTERNAL SOURCE
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
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [videoSrc, setVideoSrc] = useState("");
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isVideoSmall, setIsVideoSmall] = useState(false);

  // Column Toggle State
  const [activeColumns, setActiveColumns] = useState({
    kanji: true,
    romaji: true,
    english: true,
    indonesian: true,
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

  useEffect(() => {
    document.title = "Polaris Idoly | Lyrics Database";
    return () => {
      document.title = "Polaris Idoly";
    };
  }, []);

  // Process Data
  const processedData = useMemo(
    () => matchWithCharacters(lyricsData, characters),
    [lyricsData, characters],
  );

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

  // --- HELPER: Parse Markdown ---
  const parseLyrics = (text: string) => {
    if (!text) return "";

    // 1. Bold: **teks** -> <b>teks</b>
    // Kita beri warna lebih terang/putih untuk bold agar kontras
    const boldRegex = /\*\*(.+?)\*\*/g;

    // 2. Italic: *teks* -> <i>teks</i>
    // Kita beri warna aksen (misal pink/cyan) agar terlihat beda
    const italicRegex = /\*(.+?)\*/g;

    // 3. Underline: __teks__ -> <u>teks</u> (Opsional)
    const underlineRegex = /__(.+?)__/g;

    return text
      .replace(boldRegex, '<b class="text-white font-extrabold">$1</b>')
      .replace(italicRegex, '<i class="text-pink-400 not-italic">$1</i>') // Saya pakai warna pink biar estetik, hapus class jika ingin italic miring biasa
      .replace(underlineRegex, "<u>$1</u>");
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen bg-[#0f1115] text-white font-sans overflow-hidden relative selection:bg-cyan-500 selection:text-white">
      {/* Background Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* SIDEBAR LIST */}
      <aside
        className={`
        flex-col w-full md:w-[350px] lg:w-[420px] border-r border-white/10 bg-[#161b22]/95 backdrop-blur-md z-30 transition-transform duration-300
        ${selectedSong ? "hidden md:flex" : "flex"} 
      `}
      >
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-cyan-900/10 to-transparent sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-600 rounded text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              <ListMusic size={20} />
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase block">
                Database
              </span>
              <h1 className="text-xl font-black italic tracking-tighter text-white">
                LYRICS{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  ARCHIVE&nbsp;
                </span>
              </h1>
            </div>
          </div>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            placeholderText="Search song title..."
          />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-10 text-cyan-500 animate-pulse gap-2">
              <Disc className="animate-spin" size={24} />
              <span className="text-xs font-mono tracking-widest">
                LOADING TRACKS...
              </span>
            </div>
          ) : filteredSongs.length > 0 ? (
            filteredSongs.map((song, idx) => (
              <div
                key={idx}
                onClick={() => handleSongClick(song)}
                className={`group p-3 rounded-lg cursor-pointer transition-all border relative overflow-hidden ${
                  selectedSong?.title === song.title
                    ? "bg-gradient-to-r from-cyan-900/30 to-transparent border-cyan-500/50 shadow-[inset_3px_0_0_#06b6d4]"
                    : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3
                      className={`font-bold text-sm mb-0.5 truncate ${selectedSong?.title === song.title ? "text-cyan-400" : "text-gray-300 group-hover:text-white"}`}
                    >
                      {song.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono truncate">
                      {song.jpTitle || "No JP Title"}
                    </p>
                  </div>
                  {selectedSong?.title === song.title && (
                    <div className="flex gap-[2px] items-end h-4">
                      <div className="w-0.5 bg-cyan-500 animate-[bounce_1s_infinite] h-2"></div>
                      <div className="w-0.5 bg-cyan-500 animate-[bounce_1.2s_infinite] h-3"></div>
                      <div className="w-0.5 bg-cyan-500 animate-[bounce_0.8s_infinite] h-1.5"></div>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1 relative z-10">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${
                      selectedSong?.title === song.title
                        ? "bg-cyan-950 text-cyan-300 border-cyan-500/30"
                        : "bg-[#0d1117] text-gray-500 border-white/10"
                    }`}
                  >
                    {song.group}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-600 py-10 text-xs font-mono">
              NO TRACKS FOUND
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className={`
        flex-1 flex flex-col bg-[#0a0c10] relative overflow-hidden z-20
        ${!selectedSong ? "hidden md:flex" : "flex fixed inset-0 md:static"}
      `}
      >
        {selectedSong ? (
          <>
            {/* Player Header */}
            <header className="flex-shrink-0 bg-[#161b22]/95 backdrop-blur-md border-b border-white/10 p-4 md:p-6 flex flex-col gap-4 shadow-xl relative z-30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedSong(null)}
                    className="md:hidden p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white border border-transparent hover:border-white/10"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <div>
                    <h2 className="text-xl md:text-3xl font-black text-white leading-none italic tracking-tight">
                      {selectedSong.title}
                    </h2>
                    <p className="text-sm text-gray-400 font-medium mt-1 font-jp tracking-wide">
                      {selectedSong.jpTitle}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsInfoOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0d1117] hover:bg-[#1f2937] text-gray-300 border border-white/10 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    <Info size={16} />
                    <span className="hidden sm:inline">Details</span>
                  </button>

                  {selectedSong.video && (
                    <button
                      onClick={() => openVideo(selectedSong.video)}
                      className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                      <Play size={16} fill="currentColor" />
                      <span className="hidden sm:inline">Play MV</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                {/* Artist Icons */}
                <div className="flex -space-x-2 overflow-hidden py-1 pl-1">
                  {selectedSong.matchedCharacters.length > 0 ? (
                    selectedSong.matchedCharacters.map((charObj, idx) => (
                      <div
                        key={idx}
                        className="relative group/char cursor-help transition-transform hover:-translate-y-1 hover:z-10"
                      >
                        <div
                          className="w-10 h-10 rounded-full border-2 border-[#161b22] bg-gray-800 flex items-center justify-center overflow-hidden shadow-lg"
                          style={{
                            backgroundColor: charObj.character?.color
                              ? `#${charObj.character.color}`
                              : "#374151",
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
                        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover/char:opacity-100 whitespace-nowrap pointer-events-none transition-opacity font-bold uppercase tracking-wider border border-white/10">
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

                {/* View Options */}
                <div className="flex items-center bg-[#0d1117] p-1 rounded-lg border border-white/5">
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1 border-r border-white/5">
                    <Languages size={14} /> View
                  </div>
                  {(
                    Object.keys(activeColumns) as Array<
                      keyof typeof activeColumns
                    >
                  ).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => toggleColumn(lang)}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                        activeColumns[lang]
                          ? "bg-cyan-900/40 text-cyan-400 shadow-inner"
                          : "text-gray-500 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {lang === "indonesian" ? "INDO" : lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            {/* Lyrics Table Container */}
            <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-[#0a0c10]">
              <div className="min-w-full inline-block align-middle">
                <table className="min-w-full divide-y divide-white/5">
                  <thead className="bg-[#0f1115] sticky top-0 z-10 shadow-lg after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-cyan-500/30">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest w-12 text-center font-mono"
                      >
                        Line
                      </th>
                      {activeColumns.kanji && (
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest min-w-[200px]"
                        >
                          ORIGINAL
                        </th>
                      )}
                      {activeColumns.romaji && (
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-[10px] font-bold text-pink-400 uppercase tracking-widest min-w-[200px]"
                        >
                          ROMAJI
                        </th>
                      )}
                      {activeColumns.english && (
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-[10px] font-bold text-blue-400 uppercase tracking-widest min-w-[200px]"
                        >
                          ENGLISH
                        </th>
                      )}
                      {activeColumns.indonesian && (
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-[10px] font-bold text-green-400 uppercase tracking-widest min-w-[200px]"
                        >
                          INDONESIAN
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#0a0c10]">
                    {Array.from({
                      length: Math.max(
                        selectedSong.kanji?.length || 0,
                        selectedSong.romaji?.length || 0,
                        selectedSong.english?.length || 0,
                      ),
                    }).map((_, index) => (
                      <tr
                        key={index}
                        className="hover:bg-white/[0.03] transition-colors duration-150 group"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-xs text-center text-gray-700 font-mono group-hover:text-cyan-500">
                          {(index + 1).toString().padStart(2, "0")}
                        </td>

                        {/* KANJI COLUMN */}
                        {activeColumns.kanji && (
                          <td
                            className="px-6 py-4 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-jp font-medium selection:bg-white/20"
                            dangerouslySetInnerHTML={{
                              __html: parseLyrics(
                                selectedSong.kanji?.[index] || "",
                              ),
                            }}
                          />
                        )}

                        {/* ROMAJI COLUMN */}
                        {activeColumns.romaji && (
                          <td
                            className="px-6 py-4 text-sm text-pink-100/80 leading-relaxed whitespace-pre-wrap font-medium selection:bg-pink-500/20"
                            dangerouslySetInnerHTML={{
                              __html: parseLyrics(
                                selectedSong.romaji?.[index] || "",
                              ),
                            }}
                          />
                        )}

                        {/* ENGLISH COLUMN */}
                        {activeColumns.english && (
                          <td
                            className="px-6 py-4 text-sm text-blue-100/70 leading-relaxed whitespace-pre-wrap italic selection:bg-blue-500/20"
                            dangerouslySetInnerHTML={{
                              __html: parseLyrics(
                                selectedSong.english?.[index] || "",
                              ),
                            }}
                          />
                        )}

                        {/* INDONESIAN COLUMN */}
                        {activeColumns.indonesian && (
                          <td
                            className="px-6 py-4 text-sm text-green-100/70 leading-relaxed whitespace-pre-wrap italic selection:bg-green-500/20"
                            dangerouslySetInnerHTML={{
                              __html: parseLyrics(
                                (selectedSong as any).indonesian?.[index] || "",
                              ),
                            }}
                          />
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="h-24 md:h-0"></div>
            </div>
          </>
        ) : (
          /* EMPTY STATE */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-8 text-center select-none">
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-800 flex items-center justify-center mb-6 animate-pulse">
              <Mic size={64} className="opacity-20" />
            </div>
            <h2 className="text-xl font-bold text-gray-500 mb-2 tracking-widest uppercase">
              No Track Selected
            </h2>
            <p className="max-w-xs mx-auto text-xs text-gray-600 font-mono">
              Please select a song from the database to load lyric data and
              media resources.
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

export default Lyrics;
