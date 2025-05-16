import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HomeContent = () => {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems = [
    {
      name: "Idol Detail",
      path: "/idolList",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-suzu-05-premium-01-full.webp",
      description: "Explore all idols and their profiles",
    },
    {
      name: "Card Overview",
      path: "/cardOverview",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-mei-05-rock-00-full.webp",
      description: "Browse all available cards",
    },
    {
      name: "Card Comparison",
      path: "/cardComparison",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-ai-05-rock-00-full.webp",
      description: "Compare cards side by side",
    },
    {
      name: "Lyrics",
      path: "/lyric",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-mana-05-idoloutfit-00-full.webp",
      description: "Find song lyrics and translations",
    },
    {
      name: "Bday Calendar",
      path: "/bdayCalendar",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-rio-05-fes-03-full.webp",
      description: "Never miss an idol's birthday",
    },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto z-10">
      {/* Welcome Banner */}
      <div className="bg-slate-700 rounded-lg p-6 text-white bg-opacity-70 mb-4">
        <h1 className="text-3xl font-bold mb-2">
          Welcome to Idoly Pride Fan-Website
        </h1>
        <p className="text-lg">Select a feature below to get started</p>
      </div>

      {/* Collage Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            onMouseEnter={() => setHoveredItem(item.path)}
            onMouseLeave={() => setHoveredItem(null)}
            className="relative h-52 rounded-xl overflow-hidden shadow-2xl cursor-pointer group transition-all duration-300 hover:shadow-pink-500/30"
          >
            {/* Background Image with Zoom Effect */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url(${item.bgImage})` }}
            >
              <div
                className={`absolute inset-0 transition-all duration-300 ${
                  hoveredItem === item.path ? "bg-black/30" : "bg-black/50"
                }`}
              />
            </div>

            {/* Animated Border Bottom */}
            <div
              className={`
              absolute bottom-0 left-0 h-1 bg-pink-500 transition-all duration-300
              ${hoveredItem === item.path ? "w-full" : "w-0"}
            `}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-6">
              <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                {item.name}
              </h3>
              <p className="text-white/90 mt-1 drop-shadow-md">
                {item.description}
              </p>

              {/* Animated Button */}
              <button
                className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-full
                transition-all duration-300 transform shadow-lg
                ${
                  hoveredItem === item.path
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-90"
                }
              `}
              >
                Explore
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeContent;
