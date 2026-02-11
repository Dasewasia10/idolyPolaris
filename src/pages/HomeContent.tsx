import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Star,
  Music,
  Users,
  CreditCard,
} from "lucide-react";

const HomeContent = () => {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // LOGIC GRID BARU:
  // Total Grid: 4 Kolom.
  // Item disusun agar menutup celah dengan sempurna.

  const menuItems = [
    // --- ROW 1 (Top Section - The Database) ---
    {
      name: "Idol Directory",
      path: "/idolList",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-suzu-05-premium-01-full.webp",
      description: "Profiles & Lore",
      size: "md:col-span-2 md:row-span-2", // KOTAK BESAR (Jantung Aplikasi)
      icon: <Users className="w-5 h-5 text-pink-400" />,
    },
    {
      name: "Gacha Sim",
      path: "/gacha",
      bgImage:
        "https://api.diveidolypapi.my.id/cardFull/img_card_full_1_chs-05-fest-03.webp",
      description: "Test your luck",
      size: "md:col-span-2 md:row-span-1", // MELEBAR (Header Kanan)
      icon: <Star className="w-5 h-5 text-yellow-400" />,
    },
    {
      name: "Card Database",
      path: "/cardOverview",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-mei-05-rock-00-full.webp",
      description: "Browse cards",
      size: "md:col-span-1 md:row-span-1", // KOTAK KECIL
      icon: <CreditCard className="w-5 h-5 text-blue-400" />,
    },
    {
      name: "Comparison",
      path: "/cardComparison",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-ai-05-rock-00-full.webp",
      description: "Stat battle",
      size: "md:col-span-1 md:row-span-1", // KOTAK KECIL
      icon: <CreditCard className="w-5 h-5 text-purple-400" />,
    },

    // --- ROW 2 (Mid Section - Content) ---
    {
      name: "Lyrics Library",
      path: "/lyric",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-mana-05-idoloutfit-00-full.webp",
      description: "Song translations",
      size: "md:col-span-2 md:row-span-1", // MELEBAR (Penyeimbang Kiri)
      icon: <Music className="w-5 h-5 text-green-400" />,
    },
    {
      name: "Idoly Chat",
      path: "/chat",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-aoi-05-kaito-00-full.webp",
      description: "Talk to idols",
      size: "md:col-span-1 md:row-span-1",
      icon: null,
    },
    {
      name: "Bday Calendar",
      path: "/bdayCalendar",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-rio-05-fes-03-full.webp",
      description: "Important dates",
      size: "md:col-span-1 md:row-span-1",
      icon: null,
    },

    // --- ROW 3 (Bottom Section - Tools) ---
    {
      name: "Manager ID",
      path: "/ktp",
      bgImage:
        "https://api.diveidolypapi.my.id/cardFull/img_card_full_1_ngs-05-fest-02.webp",
      description: "Create ID",
      size: "md:col-span-1 md:row-span-1",
      icon: null,
    },
    {
      name: "Card Design",
      path: "/cardDesign",
      bgImage:
        "https://api.diveidolypapi.my.id/cardFull/img_card_full_1_skr-05-idol-03.webp",
      description: "Custom art",
      size: "md:col-span-1 md:row-span-1",
      icon: null,
    },
    {
      name: "Idol Messages",
      path: "/messages",
      bgImage:
        "https://api.diveidolypapi.my.id/cardFull/img_card_full_1_mhk-05-fest-02.webp",
      description: "Incoming SMS",
      size: "md:col-span-2 md:row-span-1", // MELEBAR (Penutup Bawah Kanan)
      icon: null,
    },
  ];

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto z-10 scrollbar-minimal lg:-mb-10 pb-24">
      {/* HEADER: Lebih bersih dan to-the-point */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4 animate-in slide-in-from-top-4 duration-700 bg-slate-700 bg-opacity-80 px-6 py-8 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            IDOLY PRIDE <span className="text-pink-500">HUB</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base mt-1">
            Database, Tools, and Community Resources.
          </p>
        </div>
        <div className="hidden md:block">
          <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 px-3 py-1.5 rounded-full text-xs text-slate-300">
            <Sparkles size={14} className="text-yellow-400" />
            <span>Unofficial Fan Site</span>
          </div>
        </div>
      </div>

      {/* GRID LAYOUT: Lebih Rapi & Tertata */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[160px]">
        {menuItems.map((item, index) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            onMouseEnter={() => setHoveredItem(item.path)}
            onMouseLeave={() => setHoveredItem(null)}
            className={`
              relative rounded-xl overflow-hidden cursor-pointer group 
              transition-all duration-300 border border-gray-800
              ${item.size} 
              ${hoveredItem === item.path ? "ring-2 ring-pink-500 shadow-xl shadow-pink-500/20 z-10 scale-[1.01]" : "hover:border-gray-600"}
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url(${item.bgImage})` }}
            >
              {/* Overlay Gradient: Gelap di bawah agar teks terbaca */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent transition-opacity duration-300 ${hoveredItem === item.path ? "opacity-80" : "opacity-90"}`}
              />
            </div>

            {/* Content: Minimalis di pojok kiri bawah */}
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <div className="flex justify-between items-end">
                <div>
                  {/* Icon Header (Optional) */}
                  {item.icon && (
                    <div className="mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      {item.icon}
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white leading-none drop-shadow-md group-hover:text-pink-200 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1.5 line-clamp-1 font-medium group-hover:text-white transition-colors">
                    {item.description}
                  </p>
                </div>

                {/* Arrow yg muncul halus saat hover */}
                <div
                  className={`
                    bg-white/10 backdrop-blur-md p-2 rounded-full text-white 
                    transition-all duration-300 transform 
                    ${hoveredItem === item.path ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}
                `}
                >
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Spacer */}
      <div className="h-8"></div>
    </div>
  );
};

export default HomeContent;
