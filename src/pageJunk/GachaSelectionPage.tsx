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
} from "lucide-react";
import { getPlaceholderImageUrl } from "../utils/imageUtils";

// --- CONFIG ---
const BANNER_IMG_BASE = "https://api.diveidolypapi.my.id/gachaBanner";
const API_BASE = "https://diveidolypapi.my.id/api";
const ITEMS_PER_PAGE = 15; // Jumlah banner per halaman

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

  // State untuk filter kategori
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Kategori yang tersedia (Hardcoded atau derived)
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

  // Title Page Dynamic
  useEffect(() => {
    document.title = "Polaris Idoly | Gacha List";

    return () => {
      document.title = "Polaris Idoly";
    };
  }, []);

  // Filter Logic Updated
  const filteredBanners = useMemo(() => {
    let result = banners;

    // 1. Filter Validitas Aset (Pindahkan dari render ke sini)
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

    // 2. Filter Category
    if (selectedCategory !== "All") {
      if (selectedCategory === "Limited") {
        result = result.filter(
          (b) => b.category === "Rate Up" || b.category === "Limited",
        );
      } else {
        result = result.filter((b) => b.category === selectedCategory);
      }
    }

    // 3. Filter Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((b) => b.name.toLowerCase().includes(lower));
    }

    return result;
  }, [searchTerm, banners, selectedCategory]);

  // --- 3. PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredBanners.length / ITEMS_PER_PAGE);

  // Reset ke halaman 1 jika melakukan pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Ambil data untuk halaman saat ini
  const currentBanners = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBanners.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredBanners]);

  // Scroll ke atas saat ganti halaman
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- 4. SMART PAGINATION UI GENERATOR ---
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5; // Jumlah tombol angka maksimal yang muncul

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2),
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // Tombol First & Prev
    buttons.push(
      <button
        key="first"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(1)}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition"
      >
        <ChevronsLeft size={18} />
      </button>,
    );
    buttons.push(
      <button
        key="prev"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition mr-2"
      >
        <ChevronLeft size={18} />
      </button>,
    );

    // Tombol Angka (Smart)
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
            currentPage === i
              ? "bg-pink-600 text-white shadow-lg shadow-pink-500/20 scale-105"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          {i}
        </button>,
      );
    }

    // Tombol Next & Last
    buttons.push(
      <button
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition ml-2"
      >
        <ChevronRight size={18} />
      </button>,
    );
    buttons.push(
      <button
        key="last"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(totalPages)}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition"
      >
        <ChevronsRight size={18} />
      </button>,
    );

    return buttons;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 font-sans pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8 border-b border-gray-800 pb-4">
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-800 rounded-full"
              >
                <ChevronLeft />
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Gacha History
              </h1>
            </div>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-900 border border-gray-700 rounded-full py-2 px-4 pl-10 text-sm w-48 focus:w-64 transition-all outline-none focus:border-pink-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-gray-500"
              />
            </div>
          </div>

          {/* Category Tabs (Scrollable) */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-pink-600 text-white shadow-lg shadow-pink-500/30"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500 mb-4"></div>
            <p className="animate-pulse text-gray-500">Loading History...</p>
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
            <p>Tidak ada banner yang cocok dengan "{searchTerm}"</p>
          </div>
        ) : (
          <>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-500">
                {renderPaginationButtons()}
              </div>
            )}

            {/* Page Info */}
            <div className="text-center mt-4 text-xs text-gray-600 mb-8">
              Show {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredBanners.length)}{" "}
              of {filteredBanners.length} Banner(s)
            </div>

            {/* Grid Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {currentBanners.map((banner) => (
                <>
                  <div
                    key={banner.id}
                    onClick={() => navigate(`/gacha/${banner.id}`)}
                    className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] transition-all cursor-pointer relative"
                  >
                    {/* Image Banner */}
                    <div className="aspect-[2/1] w-full overflow-hidden bg-gray-800 relative">
                      <img
                        src={`${BANNER_IMG_BASE}/img_banner_l_gacha-${banner.assetId}.png`}
                        alt={banner.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src =
                            getPlaceholderImageUrl("square");
                        }}
                        loading="lazy" // Lazy loading agar ringan
                      />
                      {/* Overlay Tanggal */}
                      <div className="absolute bottom-0 left-0 right-0 ...">
                        <div className="flex items-center justify-between text-xs text-gray-300 px-2">
                          <div className="flex items-center gap-2 rounded-full bg-black/50 px-2 py-1 mb-1">
                            <Calendar size={12} className="text-pink-400" />
                            {banner.startAt
                              ? new Date(banner.startAt).toLocaleDateString()
                              : "Unknown Date"}
                          </div>
                          {/* Badge Kategori */}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              banner.category === "Fes"
                                ? "bg-red-900 text-red-200"
                                : banner.category === "Birthday"
                                  ? "bg-purple-900 text-purple-200"
                                  : "bg-gray-700 text-gray-300"
                            }`}
                          >
                            {banner.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg line-clamp-1 group-hover:text-pink-400 transition-colors text-gray-100">
                        {banner.name}
                      </h3>
                      <div className="mt-2 flex gap-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700 group-hover:border-pink-500/30 transition-colors">
                          Rate Up: {banner.pickupCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                {renderPaginationButtons()}
              </div>
            )}

            {/* Page Info */}
            <div className="text-center mt-4 text-xs text-gray-600">
              Show {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredBanners.length)}{" "}
              of {filteredBanners.length} Banner(s)
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GachaSelectPage;
