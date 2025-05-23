import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BirthdayReminder from "../components/birthdayReminder";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUpcomingDropdown, setShowUpcomingDropdown] = useState(false);

  // Combined menu items
  const availableFeatures = [
    { name: "Idol Detail", path: "/idolList" },
    { name: "Card Overview", path: "/cardOverview" },
    { name: "Card Comparison", path: "/cardComparison" },
    { name: "Lyrics", path: "/lyric" },
    { name: "Bday Calendar", path: "/bdayCalendar" },
    { name: "IdolyChat", path: "/chat" },
    { name: "Love Interest Chart", path: "/loveInterestChart" },
  ];

  const upcomingFeatures = [
    { name: "Book Reader", path: "/bookreader" },
    { name: "Card Design", path: "/cardDesign" },
    { name: "KTP Manager", path: "/ktp" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  return (
    <div className="flex flex-col bg-slate-600 items-center">
      {/* Desktop Navigation */}
      <div className="h-20 bg-slate-800 p-4 flex gap-2 overflow-y-auto justify-between z-10 fixed top-0 w-full z-20 hidden lg:flex">
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

        <div className="flex gap-2 justify-center">
          {availableFeatures.map((feature) => (
            <button
              key={feature.path}
              onClick={() => handleNavigation(feature.path)}
              onMouseEnter={() => setIsHovered(feature.path)}
              onMouseLeave={() => setIsHovered(null)}
              className={`text-center text-sm px-2 xl:py-3 justify-center flex items-center rounded-lg transition-all duration-200 self-center h-full ${
                location.pathname === feature.path
                  ? "bg-white text-black shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.5)] border-t border-slate-600"
                  : isHovered === feature.path
                  ? "bg-slate-700 text-white scale-105"
                  : "bg-slate-900 text-white"
              }`}
            >
              {feature.name}
            </button>
          ))}
        </div>

        <div className="flex border-l border-slate-500 mx-2"></div>

        <div className="flex-1 flex gap-2 justify-center">
          {upcomingFeatures.map((feature) => (
            <div
              key={feature.path}
              className="relative text-center text-sm px-2 xl:py-3 justify-center flex items-center rounded-lg bg-slate-900 text-gray-400 cursor-not-allowed overflow-hidden self-center h-full"
            >
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <img
                  src={`${import.meta.env.BASE_URL}assets/lock-16.png`}
                  alt="locked-feature"
                />
              </div>
              {feature.name}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="h-20 bg-slate-800 p-4 flex justify-between items-center fixed top-0 w-full z-20 lg:hidden">
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
            {availableFeatures.map((feature) => (
              <button
                key={feature.path}
                onClick={() => handleNavigation(feature.path)}
                className={`text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === feature.path
                    ? "bg-white text-black shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.5)] border-t border-slate-600"
                    : "bg-slate-900 text-white hover:bg-slate-700"
                }`}
              >
                {feature.name}
              </button>
            ))}

            <div className="relative">
              <button
                onClick={() => setShowUpcomingDropdown(!showUpcomingDropdown)}
                className="w-full text-left px-4 py-3 rounded-lg bg-slate-900 text-gray-400 flex justify-between items-center"
              >
                <span>Upcoming Features</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transition-transform duration-200 ${
                    showUpcomingDropdown ? "rotate-180" : ""
                  }`}
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

              {showUpcomingDropdown && (
                <div className="mt-2 ml-4 flex flex-col gap-2">
                  {upcomingFeatures.map((feature) => (
                    <div
                      key={feature.path}
                      className="relative text-left px-4 py-3 rounded-lg bg-slate-900 text-gray-400 cursor-not-allowed overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <img
                          src={`${import.meta.env.BASE_URL}assets/lock-16.png`}
                          alt="locked-feature"
                          className="w-4 h-4"
                        />
                      </div>
                      {feature.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 right-0 z-[999] transition-all duration-500 ease-in-out">
        <BirthdayReminder />
      </div>
    </div>
  );
};

export default MainMenu;
