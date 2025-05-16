import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BirthdayReminder from "../components/birthdayReminder";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  // Combined menu items
  const availableFeatures = [
    { name: "Idol Detail", path: "/idolList" },
    { name: "Card Overview", path: "/cardOverview" },
    { name: "Card Comparison", path: "/cardComparison" },
    { name: "Lyrics", path: "/lyric" },
    { name: "Bday Calendar", path: "/bdayCalendar" },
  ];

  const upcomingFeatures = [
    { name: "Love Interest Chart", path: "/loveInterestChart" },
    { name: "Book Reader", path: "/bookreader" },
    { name: "Card Design", path: "/cardDesign" },
    { name: "IdolyChat", path: "/chat" },
    { name: "KTP Manager", path: "/ktp" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col bg-slate-600 items-center">
      {/* Sidebar Navigation */}
      <div className="h-20 bg-slate-800 p-4 flex gap-2 overflow-y-auto justify-center z-10 fixed top-0 w-full z-20">
        <button
          onClick={() => navigate("/")}
          className="flex rounded-full bg-white hover:bg-slate-300 text-black items-center justify-center mr-10"
        >
          <img
            className="w-12 h-12"
            src={`${import.meta.env.BASE_URL}assets/white_logo.png`}
            alt=""
          />
        </button>
        {availableFeatures.map((feature) => (
          <button
            key={feature.path}
            onClick={() => handleNavigation(feature.path)}
            onMouseEnter={() => setIsHovered(feature.path)}
            onMouseLeave={() => setIsHovered(null)}
            className={`text-left px-2 py-3 rounded-lg transition-all duration-200 ${
              location.pathname === feature.path
                ? "bg-white text-black scale-105"
                : isHovered === feature.path
                ? "bg-slate-700 text-white scale-105"
                : "bg-slate-900 text-white"
            }`}
          >
            {feature.name}
          </button>
        ))}

        <div className="border-l border-slate-500 mx-4"></div>
        {upcomingFeatures.map((feature) => (
          <div
            key={feature.path}
            className="relative text-left px-2 py-3 rounded-lg bg-slate-900 text-gray-400 cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <img
                src={`${import.meta.env.BASE_URL}assets/lock-16.png`}
                alt=""
              />
            </div>
            {feature.name}
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 right-0 z-[999] transition-all duration-500 ease-in-out">
        <BirthdayReminder />
      </div>
    </div>
  );
};

export default MainMenu;
