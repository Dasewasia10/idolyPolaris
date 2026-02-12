import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
    { name: "Idol Messages", path: "/messages" },
    { name: "Character Comparison", path: "/stat" },
    { name: "Love Story", path: "/loveStory" },
    { name: "Beatmap", path: "/beatmaps" },
  ],

  upcoming: [
    { name: "Book Reader", path: "/bookreader" },
    { name: "Event Tracker", path: "/eventTracker" },
  ],
};

// --- 2. REUSABLE COMPONENTS ---

// Komponen untuk tombol navigasi Desktop biasa
const DesktopNavItem = ({ item, navigate, currentPath }: any) => {
  const [hover, setHover] = useState(false);
  const isActive = currentPath === item.path;

  return (
    <button
      onClick={() => navigate(item.path)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`text-center text-sm px-2 xl:py-3 justify-center flex items-center rounded-lg transition-all duration-200 self-center h-full ${
        isActive
          ? "bg-white text-black shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.5)] border-t border-slate-600"
          : hover
            ? "bg-slate-700 text-white scale-105"
            : "bg-slate-900 text-white"
      }`}
    >
      {item.name}
    </button>
  );
};

// Komponen untuk Dropdown Desktop
const DesktopDropdown = ({ title, items, navigate, currentPath }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = items.some((f: any) => currentPath === f.path);

  return (
    <div className="relative z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`text-center text-sm px-2 xl:py-3 justify-center flex items-center rounded-lg transition-all duration-200 self-center h-full ${
          isActive
            ? "bg-white text-black shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.5)] border-t border-slate-600"
            : isOpen
              ? "bg-slate-700 text-white scale-105"
              : "bg-slate-900 text-white"
        }`}
      >
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div
          className="absolute mx-auto w-48 rounded-md shadow-lg bg-slate-800 z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="py-1">
            {items.map((feature: any) => (
              <button
                key={feature.path}
                onClick={() => navigate(feature.path)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  currentPath === feature.path
                    ? "bg-white text-black"
                    : "text-white hover:bg-slate-700"
                }`}
              >
                {feature.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Komponen Item Menu Mobile
const MobileNavItem = ({ item, navigate, currentPath }: any) => (
  <button
    onClick={() => navigate(item.path)}
    className={`text-left px-4 py-3 rounded-lg transition-all duration-200 ${
      currentPath === item.path
        ? "bg-white text-black shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.5)] border-t border-slate-600"
        : "bg-slate-900 text-white hover:bg-slate-700"
    }`}
  >
    {item.name}
  </button>
);

// Komponen Dropdown Menu Mobile
const MobileDropdown = ({ title, items, navigate, currentPath }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-3 rounded-lg bg-slate-900 text-white flex justify-between items-center hover:bg-slate-700"
      >
        <span>{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="mt-2 ml-4 flex flex-col gap-2">
          {items.map((feature: any) => (
            <button
              key={feature.path}
              onClick={() => navigate(feature.path)}
              className={`text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                currentPath === feature.path
                  ? "bg-white text-black shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.5)] border-t border-slate-600"
                  : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
            >
              {feature.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Komponen Item Terkunci (Upcoming)
const LockedFeatureItem = ({ item }: { item: any }) => (
  <div className="relative text-center text-sm px-2 xl:py-3 justify-center flex items-center rounded-lg bg-slate-900 text-gray-400 cursor-not-allowed overflow-hidden self-center h-full">
    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <img
        src={`${import.meta.env.BASE_URL}assets/lock-16.png`}
        alt="locked"
        className="w-4 h-4"
      />
    </div>
    {item.name}
  </div>
);

// --- 3. MAIN COMPONENT ---
const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  const LogoButton = () => (
    <button
      onClick={() => navigate("/")}
      className="group relative flex rounded-full bg-white hover:bg-slate-300 text-black items-center justify-center w-12 h-12"
    >
      <img
        className="w-full h-full object-contain"
        src={`${import.meta.env.BASE_URL}assets/white_logo.png`}
        alt="Home"
      />
      <img
        className="absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:scale-[102%]"
        src={`${import.meta.env.BASE_URL}assets/black_logo.png`}
        alt="Home"
      />
    </button>
  );

  return (
    <div className="flex flex-col bg-slate-600 items-center">
      {/* Desktop Navigation */}
      <div className="bg-slate-800 p-4 flex gap-2 justify-between z-20 fixed top-0 w-full lg:flex">
        <LogoButton />

        <div className="flex gap-2 justify-center relative">
          {MENUS.main.map((item) => (
            <DesktopNavItem
              key={item.path}
              item={item}
              navigate={handleNavigation}
              currentPath={location.pathname}
            />
          ))}

          <DesktopDropdown
            title="Idoly Card"
            items={MENUS.card}
            navigate={handleNavigation}
            currentPath={location.pathname}
          />
          <DesktopDropdown
            title="Idoly Playground"
            items={MENUS.playground}
            navigate={handleNavigation}
            currentPath={location.pathname}
          />
          <DesktopDropdown
            title="Idoly AddOn"
            items={MENUS.addOn}
            navigate={handleNavigation}
            currentPath={location.pathname}
          />
        </div>

        <div className="flex border-l border-slate-500 mx-2"></div>

        <div className="flex-1 flex gap-2 justify-center">
          {MENUS.upcoming.map((item) => (
            <LockedFeatureItem key={item.path} item={item} />
          ))}
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="h-20 bg-slate-800 p-4 flex justify-between items-center fixed top-0 w-full z-20 lg:hidden">
        <LogoButton />
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="text-white p-2 rounded-lg bg-slate-700 hover:bg-slate-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="fixed top-20 left-0 right-0 bg-slate-800 shadow-lg z-20 lg:hidden">
          <div className="flex flex-col p-4 gap-2">
            {MENUS.main.map((item) => (
              <MobileNavItem
                key={item.path}
                item={item}
                navigate={handleNavigation}
                currentPath={location.pathname}
              />
            ))}
            <MobileDropdown
              title="Idoly Card"
              items={MENUS.card}
              navigate={handleNavigation}
              currentPath={location.pathname}
            />
            <MobileDropdown
              title="Idoly Playground"
              items={MENUS.playground}
              navigate={handleNavigation}
              currentPath={location.pathname}
            />
            <MobileDropdown
              title="Idoly AddOn"
              items={MENUS.addOn}
              navigate={handleNavigation}
              currentPath={location.pathname}
            />

            {/* Upcoming Features Mobile Display - optional logic reused from locked item style or simple list */}
            <div className="relative">
              <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-900 text-gray-400 flex justify-between items-center">
                <span>Upcoming Features</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {/* Note: In original code, upcoming dropdown logic was repeated. Here simplified visually */}
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 right-0 z-[999] transition-all duration-500 ease-in-out">
        <BirthdayReminder />
      </div>

      <div className="h-20 w-full shrink-0"></div>
    </div>
  );
};

export default MainMenu;
