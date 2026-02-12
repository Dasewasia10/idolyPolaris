import React, { useState, useEffect, useMemo } from "react";
import BeatmapVisualizer from "../components/BeatmapVisualizer";
import SearchBar from "../components/searchBar"; // Reuse komponen searchbarmu
import { Music, Map as MapIcon } from "lucide-react";

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

  // 1. Fetch Daftar Lagu
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch("https://diveidolypapi.my.id/api/music/songs");
        if (!res.ok) throw new Error("Failed to fetch songs");
        const data = await res.json();

        // FILTER: Hanya ambil lagu yang punya chart
        const playableSongs = data.filter(
          (song: Song) => song.charts && song.charts.length > 0,
        );

        // Sort by title
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

  // Filter Search
  const filteredSongs = useMemo(() => {
    return songs.filter((song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [songs, searchTerm]);

  // Handle Pilih Lagu
  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    // Auto select chart pertama
    if (song.charts.length > 0) {
      setSelectedChartId(song.charts[0]);
    } else {
      setSelectedChartId(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-950 text-white overflow-hidden pt-6 pb-10 px-4 gap-4">
      {/* SIDEBAR: Song List */}
      <div className="w-full lg:w-1/3 flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden h-full">
        <div className="p-4 border-b border-gray-800 bg-gray-900 z-10 shadow-md">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-pink-400">
            <Music size={24} /> Beatmap Library
          </h2>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            placeholderText="Search song title..."
          />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 p-2">
          {loading ? (
            <div className="text-center p-4 text-gray-500">
              Loading songs...
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center p-4 text-gray-500">No songs found.</div>
          ) : (
            filteredSongs.map((song) => (
              <button
                key={song.id}
                onClick={() => handleSelectSong(song)}
                className={`w-full text-left p-3 rounded-lg mb-1 flex justify-between items-center transition-all ${
                  selectedSong?.id === song.id
                    ? "bg-pink-600 text-white shadow-lg"
                    : "hover:bg-gray-800 text-gray-300"
                }`}
              >
                <span className="font-medium truncate">{song.title}</span>
                {song.charts.length > 1 && (
                  <span className="text-xs bg-black/20 px-2 py-1 rounded-full">
                    {song.charts.length} Charts
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* MAIN CONTENT: Visualizer */}
      <div className="flex-1 flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden h-full relative">
        {selectedSong ? (
          <>
            {/* Header Chart */}
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center shadow-md z-10">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedSong.title}
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  {selectedSong.assetId}
                </p>
              </div>

              {/* Selector jika ada banyak chart (Easy/Normal/Hard/Ex) */}
              {selectedSong.charts.length > 1 && (
                <select
                  className="bg-gray-900 border border-gray-600 rounded px-3 py-1 text-sm focus:border-pink-500 outline-none"
                  value={selectedChartId || ""}
                  onChange={(e) => setSelectedChartId(e.target.value)}
                >
                  {selectedSong.charts.map((cid) => (
                    <option key={cid} value={cid}>
                      {cid}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* The Visualizer */}
            <div className="flex-1 bg-black/20 p-4 overflow-hidden relative">
              <BeatmapVisualizer chartId={selectedChartId} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
            <MapIcon size={64} className="mb-4 opacity-20" />
            <p>Select a song to view beatmap</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeatmapPage;
