import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Calendar,
  Search,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from "lucide-react";
import { getPlaceholderImageUrl } from "../utils/imageUtils";

// --- CONFIG ---
const BANNER_IMG_BASE = "https://api.diveidolypapi.my.id/gachaBanner";
const API_BASE = "https://diveidolypapi.my.id/api";
const ITEMS_PER_PAGE = 15;

interface GachaBanner {
  id: string;
  name: string;
  assetId: string;
  startAt: string;
  pickupCount: number;
  category: string;
}

const GachaSelectPage: React.FC = () => {
  const navigate = useNavigate();

  // Data State
  const [banners, setBanners] = useState<GachaBanner[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Standard",
    "Limited",
    "Fest",
    "Birthday",
    "Diamond",
    "Kizuna",
    "Rerun",
  ];

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${API_BASE}/gachas`);
        setBanners(res.data);
      } catch (err) {
        console.error("Gagal load banner:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    document.title = "Polaris Idoly | Gacha Archives";
    return () => {
      document.title = "Polaris Idoly";
    };
  }, []);

  // Filter Logic
  const filteredBanners = useMemo(() => {
    let result = banners;

    result = result.filter((b) => {
      const forbiddenKeywords = [
        "step",
        "dream",
        "select",
        "item",
        "continuous",
        "rev-rockon",
        "rev-select",
      ];
      const isKeywordValid = !forbiddenKeywords.some((word) =>
        b.assetId?.toLowerCase().includes(word),
      );
      const isLengthValid = b.assetId?.length > 1;
      const hasStartDate = b.startAt !== null;

      return isKeywordValid && isLengthValid && hasStartDate;
    });

    if (selectedCategory !== "All") {
      if (selectedCategory === "Limited") {
        result = result.filter(
          (b) => b.category === "Rate Up" || b.category === "Limited",
        );
      } else {
        result = result.filter((b) => b.category === selectedCategory);
      }
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((b) => b.name.toLowerCase().includes(lower));
    }

    return result;
  }, [searchTerm, banners, selectedCategory]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredBanners.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const currentBanners = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBanners.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredBanners]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2),
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // Button Base Style
    const btnBase =
      "p-2 rounded bg-[#161b22] border border-white/10 hover:border-pink-500 hover:text-pink-400 transition-all disabled:opacity-30 disabled:hover:border-white/10 disabled:cursor-not-allowed";

    buttons.push(
      <button
        key="first"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(1)}
        className={btnBase}
      >
        <ChevronsLeft size={16} />
      </button>,
    );
    buttons.push(
      <button
        key="prev"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className={`${btnBase} mr-2`}
      >
        <ChevronLeft size={16} />
      </button>,
    );

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 rounded font-bold text-sm border transition-all ${
            currentPage === i
              ? "bg-pink-600 border-pink-500 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]"
              : "bg-[#161b22] border-white/10 text-gray-400 hover:text-white hover:border-white/30"
          }`}
        >
          {i}
        </button>,
      );
    }

    buttons.push(
      <button
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className={`${btnBase} ml-2`}
      >
        <ChevronRight size={16} />
      </button>,
    );
    buttons.push(
      <button
        key="last"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(totalPages)}
        className={btnBase}
      >
        <ChevronsRight size={16} />
      </button>,
    );

    return buttons;
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 font-sans pb-20 relative selection:bg-pink-500 selection:text-white">
      {/* Background Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8 border-b border-white/10 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 border border-white/10 bg-white/5 rounded hover:bg-white/10 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <span className="text-[10px] font-bold text-pink-500 tracking-[0.2em] uppercase">
                  Recruitment
                </span>
                <h1 className="text-3xl font-black italic tracking-tighter text-white">
                  GACHA{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                    ARCHIVES&nbsp;
                  </span>
                </h1>
              </div>
            </div>

            {/* Search */}
            <div className="relative group">
              <input
                type="text"
                placeholder="Search banner name..."
                className="bg-[#161b22] border border-white/20 rounded py-2 px-4 pl-10 text-sm w-full md:w-64 focus:w-72 transition-all outline-none focus:border-pink-500 focus:shadow-[0_0_10px_rgba(236,72,153,0.2)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-pink-400 transition-colors"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
            <Filter size={16} className="text-gray-500 mr-2 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-1.5 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? "bg-pink-600 border-pink-500 text-white shadow-lg"
                    : "bg-[#161b22] border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-pink-400 animate-pulse font-mono tracking-widest">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            LOADING DATABASE...
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="text-center py-20 bg-[#161b22]/50 rounded-xl border border-dashed border-white/10">
            <p className="text-gray-500 font-mono">
              NO DATA FOUND FOR QUERY "{searchTerm}"
            </p>
          </div>
        ) : (
          <>
            {/* Grid Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {currentBanners.map((banner) => (
                <div
                  key={banner.id}
                  onClick={() => navigate(`/gacha/${banner.id}`)}
                  className="group relative bg-[#161b22] rounded-xl overflow-hidden border border-white/10 hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] transition-all cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="aspect-[2/1] w-full overflow-hidden bg-gray-900 relative">
                    <img
                      src={`${BANNER_IMG_BASE}/img_banner_l_gacha-${banner.assetId}.png`}
                      alt={banner.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = getPlaceholderImageUrl("rect");
                      }}
                      loading="lazy"
                    />

                    {/* Overlay Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-end">
                      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-white/10">
                        <Calendar size={12} className="text-pink-400" />
                        <span className="text-[10px] text-gray-200 font-mono">
                          {banner.startAt
                            ? new Date(banner.startAt).toLocaleDateString()
                            : "Unknown"}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                          banner.category === "Fes"
                            ? "bg-red-900/80 text-red-100 border-red-500"
                            : banner.category === "Birthday"
                              ? "bg-purple-900/80 text-purple-100 border-purple-500"
                              : "bg-gray-800/80 text-gray-300 border-gray-600"
                        }`}
                      >
                        {banner.category}
                      </span>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-4 relative">
                    <h3 className="font-bold text-sm text-gray-200 line-clamp-1 group-hover:text-pink-400 transition-colors mb-2">
                      {banner.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-1 bg-pink-500 rounded-full"></div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                        Pick Up:{" "}
                        <span className="text-gray-300">
                          {banner.pickupCount}
                        </span>
                      </span>
                    </div>

                    {/* Hover Decoration */}
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-[0_0_5px_#ec4899]"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className="flex gap-2">{renderPaginationButtons()}</div>
                <div className="text-[10px] text-gray-500 font-mono">
                  DISPLAYING {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredBanners.length,
                  )}{" "}
                  OF {filteredBanners.length} RECORDS
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GachaSelectPage;
