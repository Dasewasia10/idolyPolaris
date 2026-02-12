import React, { useState, useEffect, useMemo } from "react";
import BeatmapVisualizer from "../components/BeatmapVisualizer";
import { Music, Menu, Disc, Search, BarChart3, X } from "lucide-react";

interface Song {
  id: string;
  title: string;
  assetId: string;
  charts: string[];
}

const BeatmapPage: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // State untuk Sidebar Mobile
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // 1. Fetch Daftar Lagu
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch("https://diveidolypapi.my.id/api/music/songs");
        if (!res.ok) throw new Error("Failed to fetch songs");
        const data = await res.json();

        const playableSongs = data.filter(
          (song: Song) => song.charts && song.charts.length > 0,
        );

        playableSongs.sort((a: Song, b: Song) =>
          a.title.localeCompare(b.title),
        );

        setSongs(playableSongs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  const filteredSongs = useMemo(() => {
    return songs.filter((song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [songs, searchTerm]);

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    if (song.charts.length > 0) {
      setSelectedChartId(song.charts[0]);
    } else {
      setSelectedChartId(null);
    }
    // Tutup sidebar otomatis di mobile setelah memilih
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#0f1115] text-white overflow-hidden relative font-sans selection:bg-pink-500 selection:text-white">
      {/* Background Tech Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* OVERLAY BACKDROP (Mobile Only) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR: Song Library (Responsive) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-80 lg:w-[400px] bg-[#161b22]/95 backdrop-blur-md border-r border-white/10 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        {/* Header Sidebar */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-pink-900/10 to-transparent flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-xl font-black italic flex items-center gap-3 mb-4 tracking-tighter">
              <div className="p-2 bg-pink-600 rounded text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                <Music size={20} />
              </div>
              BEATMAP{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                LIBRARY&nbsp;
              </span>
            </h2>

            <div className="relative group">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search song title..."
                className="w-full bg-black/40 border border-white/20 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all text-white placeholder-gray-500"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-pink-400 transition-colors"
                size={16}
              />
            </div>
          </div>

          {/* Close Button (Mobile Only) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* List Lagu */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-3 space-y-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-500 animate-pulse">
              <Disc className="animate-spin" size={24} />
              <span className="text-xs font-mono tracking-widest">
                LOADING DATABASE...
              </span>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center p-8 text-gray-600 text-sm font-mono">
              NO DATA FOUND
            </div>
          ) : (
            filteredSongs.map((song) => {
              const isSelected = selectedSong?.id === song.id;
              return (
                <button
                  key={song.id}
                  onClick={() => handleSelectSong(song)}
                  className={`w-full text-left p-3 rounded-md mb-1 flex justify-between items-center transition-all group border-l-2 relative overflow-hidden ${
                    isSelected
                      ? "bg-gradient-to-r from-pink-600/20 to-transparent border-pink-500 text-white"
                      : "border-transparent hover:bg-white/5 text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 z-10 overflow-hidden">
                    <span
                      className={`text-xs font-mono flex-shrink-0 ${isSelected ? "text-pink-400" : "text-gray-600"}`}
                    >
                      {isSelected
                        ? "▶"
                        : String(filteredSongs.indexOf(song) + 1).padStart(
                            2,
                            "0",
                          )}
                    </span>
                    <span className="font-medium truncate text-sm tracking-wide">
                      {song.title}
                    </span>
                  </div>

                  {/* Chart Count Badge */}
                  {song.charts.length > 0 && (
                    <div
                      className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ml-2 ${isSelected ? "border-pink-500/50 text-pink-300" : "border-gray-700 text-gray-600"}`}
                    >
                      <BarChart3 size={10} />
                      {song.charts.length}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 bg-[#0d1117] text-[10px] text-gray-600 text-center font-mono border-t border-white/5">
          IDOLY PRIDE DATABASE // V.2026
        </div>
      </aside>

      {/* MAIN CONTENT: Visualizer Stage */}
      <div className="flex-1 flex flex-col relative bg-[#0a0c10] w-full">
        {/* Toggle Sidebar Button (Mobile) */}
        {!isSidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-50 p-2 bg-black/60 backdrop-blur border border-white/20 rounded-lg text-white lg:hidden shadow-lg"
          >
            <Menu size={20} />
          </button>
        )}

        {selectedSong ? (
          <>
            {/* Header Chart Info (Floating) */}
            <div className="absolute top-4 left-16 lg:left-6 right-4 z-40 flex flex-col md:flex-row justify-between items-start md:items-center pointer-events-none">
              {/* Song Info */}
              <div className="pointer-events-auto bg-gray-700/20 border border-white/10 p-3 lg:p-4 rounded-xl shadow-xl flex flex-col gap-1 min-w-[200px] max-w-[70%]">
                <span className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">
                  Selected Track
                </span>
                <h3 className="text-lg lg:text-xl font-bold text-white leading-none truncate">
                  {selectedSong.title}
                </h3>
                <p className="text-[10px] text-gray-500 font-mono mt-1">
                  ID: {selectedSong.assetId}
                </p>
              </div>

              {/* Chart Selector */}
              {selectedSong.charts.length > 1 && (
                <div className="pointer-events-auto mt-2 md:mt-0 lg:-mt-10">
                  <select
                    className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-sm text-white focus:border-pink-500 outline-none cursor-pointer hover:bg-white/10 transition-colors appearance-none font-mono"
                    value={selectedChartId || ""}
                    onChange={(e) => setSelectedChartId(e.target.value)}
                  >
                    {selectedSong.charts.map((cid) => (
                      <option
                        key={cid}
                        value={cid}
                        className="bg-gray-900 text-gray-300"
                      >
                        {cid.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* The Visualizer Area */}
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f1115]/50 to-[#0f1115] pointer-events-none z-10"></div>
              <BeatmapVisualizer chartId={selectedChartId} />
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 select-none">
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-800 flex items-center justify-center mb-6 animate-pulse">
              <Music size={64} className="opacity-20" />
            </div>
            <p className="text-xl font-light tracking-[0.5em] text-gray-700">
              SELECT A SONG
            </p>
            <p className="text-xs text-gray-800 mt-2 font-mono">
              WAITING FOR INPUT...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeatmapPage;
