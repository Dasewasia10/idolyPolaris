import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Lock } from "lucide-react"; // Gunakan Lucide Icons
import BirthdayReminder from "../components/birthdayReminder";

// --- 1. DATA DEFINITION ---
const MENUS = {
  main: [
    { name: "Idol Details", path: "/idolList" },
    { name: "Lyrics", path: "/lyric" },
    { name: "Bday Calendar", path: "/bdayCalendar" },
  ],
  card: [
    { name: "Card Overview", path: "/cardOverview" },
    { name: "Card Comparison", path: "/cardComparison" },
  ],
  playground: [
    { name: "IdolyChat", path: "/chat" },
    { name: "Compass Chart", path: "/compassChart" },
    { name: "ID Manager", path: "/ktp" },
    { name: "Card Design", path: "/cardDesign" },
    { name: "Idoly Wordle", path: "/wordle" },
    { name: "Gacha Simulator", path: "/gacha" },
  ],
  addOn: [
    { name: "Mana's Diary", path: "/diary" },
    { name: "Character Comparison", path: "/stat" },
    { name: "Idol Messages", path: "/messages" },
    { name: "Beatmap", path: "/beatmaps" },
  ],
  stories: [
    { name: "Love Story", path: "/loveStory" },
    { name: "Bond Story", path: "/bondStory" },
    { name: "Extra Story", path: "/extraStory" },
    { name: "Main Story", path: "/mainStory" },
  ],
  upcoming: [
    { name: "Book Reader", path: "/bookreader" },
    { name: "Event Tracker", path: "/eventTracker" },
  ],
};

// --- 2. COMPONENTS ---

const DesktopNavItem = ({ item, isActive, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap
      ${
        isActive
          ? "bg-white text-black shadow-lg"
          : "text-gray-300 hover:bg-slate-700 hover:text-white"
      }`}
  >
    {item.name}
  </button>
);

const DesktopDropdown = ({ title, items, currentPath, navigate }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = items.some((item: any) => item.path === currentPath);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handler agar tidak langsung menutup saat mouse tidak sengaja meleset sedikit
  const handleMouseEnter = () => {
    // Batalkan timer tutup jika user kembali hover ke tombol/menu
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Set timer untuk menutup menu (memberi waktu user menyeberang celah)
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div
      className="relative h-full flex items-center" // Tambahkan h-full & flex items-center agar area hover konsisten
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap
          ${
            isActive || isOpen
              ? "bg-slate-700 text-white"
              : "text-gray-300 hover:bg-slate-700 hover:text-white"
          }`}
      >
        {title}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        // PERBAIKAN UTAMA DI SINI:
        // 1. Ubah 'mt-1' menjadi 'pt-4' (padding-top) untuk membuat jembatan transparan
        // 2. 'top-[80%]' agar area padding tumpang tindih sedikit dengan tombol
        <div className="absolute top-[80%] left-0 pt-4 w-48 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Container asli dropdown dibungkus di dalam area padding */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
            {items.map((item: any) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`block w-full text-left px-4 py-2.5 text-sm transition-colors
                  ${
                    currentPath === item.path
                      ? "bg-slate-700 text-white font-bold border-l-4 border-blue-500"
                      : "text-gray-300 hover:bg-slate-700/50 hover:text-white"
                  }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LockedFeatureItem = ({ item }: { item: any }) => (
  <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-slate-900/50 rounded-lg border border-slate-800 cursor-not-allowed select-none opacity-60">
    <Lock size={12} />
    <span className="text-xs">{item.name}</span>
  </div>
);

// --- MAIN MENU ---
const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const handleNav = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  // Tutup menu mobile saat resize ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setShowMobileMenu(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const LogoButton = () => (
    <button onClick={() => handleNav("/")} className="group relative w-10 h-10">
      <div className="absolute inset-0 bg-white rounded-full transition-transform group-hover:scale-110 duration-300"></div>
      <img
        src={`${import.meta.env.BASE_URL}assets/black_logo.png`}
        alt="Home"
        className="absolute inset-0 w-full h-full object-contain p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      <img
        src={`${import.meta.env.BASE_URL}assets/white_logo.png`} // Asumsi logo putih untuk default state
        alt="Home"
        className="absolute inset-0 w-full h-full object-contain p-2 group-hover:opacity-0 transition-opacity duration-300 invert"
      />
    </button>
  );

  return (
    <>
      {/* NAVBAR CONTAINER */}
      <nav className="fixed top-0 w-full z-[100] bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            {/* LEFT: LOGO */}
            <div className="flex-shrink-0 flex items-center">
              <LogoButton />
              <span className="ml-3 font-bold text-white text-lg tracking-tight hidden sm:block">
                POLARIS <span className="text-blue-400">IDOLY</span>
              </span>
            </div>

            {/* CENTER: DESKTOP MENU */}
            <div className="hidden lg:flex items-center gap-1">
              {MENUS.main.map((item) => (
                <DesktopNavItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  onClick={() => handleNav(item.path)}
                />
              ))}

              <div className="w-px h-6 bg-slate-700 mx-2"></div>

              <DesktopDropdown
                title="Cards"
                items={MENUS.card}
                currentPath={location.pathname}
                navigate={handleNav}
              />
              <DesktopDropdown
                title="Playground"
                items={MENUS.playground}
                currentPath={location.pathname}
                navigate={handleNav}
              />
              <DesktopDropdown
                title="Add-Ons"
                items={MENUS.addOn}
                currentPath={location.pathname}
                navigate={handleNav}
              />
              <DesktopDropdown
                title="Stories"
                items={MENUS.stories}
                currentPath={location.pathname}
                navigate={handleNav}
              />
            </div>

            {/* RIGHT: LOCKED / MOBILE TOGGLE */}
            <div className="flex items-center gap-4">
              {/* Upcoming (Desktop Only) */}
              <div className="hidden xl:flex items-center gap-2">
                {MENUS.upcoming.map((item) => (
                  <LockedFeatureItem key={item.path} item={item} />
                ))}
              </div>

              {/* Mobile Toggle Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {showMobileMenu && (
          <div className="lg:hidden bg-slate-900 border-t border-slate-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-2 pt-2 pb-6 space-y-1">
              {MENUS.main.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium
                    ${location.pathname === item.path ? "bg-slate-800 text-white" : "text-gray-300 hover:bg-slate-800 hover:text-white"}`}
                >
                  {item.name}
                </button>
              ))}

              {/* Mobile Accordions */}
              {["Cards", "Playground", "Add-Ons", "Stories"].map(
                (section, _idx) => {
                  const items =
                    section === "Cards"
                      ? MENUS.card
                      : section === "Playground"
                        ? MENUS.playground
                        : section === "Stories"
                          ? MENUS.stories
                          : MENUS.addOn;
                  const isExpanded = mobileExpanded === section;

                  return (
                    <div
                      key={section}
                      className="border-t border-slate-800 pt-2 mt-2"
                    >
                      <button
                        onClick={() =>
                          setMobileExpanded(isExpanded ? null : section)
                        }
                        className="flex items-center justify-between w-full px-3 py-2 text-base font-bold text-gray-400 uppercase tracking-wider hover:text-white"
                      >
                        {section}
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="pl-4 space-y-1 mt-1 bg-slate-900/50">
                          {items.map((item: any) => (
                            <button
                              key={item.path}
                              onClick={() => handleNav(item.path)}
                              className={`block w-full text-left px-3 py-2 rounded-md text-sm
                              ${location.pathname === item.path ? "text-blue-400 font-semibold" : "text-gray-400 hover:text-white"}`}
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}
      </nav>

      {/* BIRTHDAY REMINDER (Floating) */}
      <div className="fixed bottom-4 right-4 z-50">
        <BirthdayReminder />
      </div>

      {/* Spacer agar konten tidak tertutup Navbar */}
      <div className="h-16 w-full"></div>
    </>
  );
};

export default MainMenu;
