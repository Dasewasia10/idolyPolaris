import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Star,
  Music,
  Users,
  CreditCard,
  Crown,
  Gamepad2,
  Calendar,
  PenTool,
  MessageCircle,
} from "lucide-react";

const HomeContent = () => {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // --- CONFIG: DYNAMIC BENTO GRID ---
  // Kita menggunakan grid-cols-4 (desktop).
  // Item disusun agar menciptakan pola "tetris" yang asimetris.

  const menuItems = [
    // 1. HERO ITEM (Idol Directory) - Dominan di Kiri Atas
    {
      name: "Idol Directory",
      path: "/idolList",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-suzu-05-premium-01-full.webp",
      description: "Profiles, Lore & Relationships",
      size: "md:col-span-2 md:row-span-2", // Kotak Besar
      icon: <Users className="w-6 h-6 text-pink-400" />,
      color: "from-pink-900/80 to-purple-900/20", // Custom Gradient Overlay
    },
    // 2. FEATURED (Gacha) - Memanjang Horizontal
    {
      name: "Gacha Simulator",
      path: "/gacha",
      bgImage:
        "https://api.diveidolypapi.my.id/cardFull/img_card_full_1_chs-05-fest-03.webp",
      description: "Test your luck instantly",
      size: "md:col-span-2 md:row-span-1",
      icon: <Star className="w-5 h-5 text-yellow-400" />,
      color: "from-yellow-900/80 to-orange-900/20",
    },
    // 3. UTILITY (Card DB) - Kotak Kecil
    {
      name: "Card Database",
      path: "/cardOverview",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-mei-05-rock-00-full.webp",
      description: "Browse metadata",
      size: "md:col-span-1 md:row-span-1",
      icon: <CreditCard className="w-5 h-5 text-blue-400" />,
      color: "from-blue-900/80 to-cyan-900/20",
    },
    // 4. UTILITY (Comparison) - Kotak Kecil
    {
      name: "Stat Battle",
      path: "/cardComparison",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-ai-05-rock-00-full.webp",
      description: "Compare units",
      size: "md:col-span-1 md:row-span-1",
      icon: <Gamepad2 className="w-5 h-5 text-purple-400" />,
      color: "from-purple-900/80 to-indigo-900/20",
    },

    // --- ROW BARU (ASIMETRIS) ---
    // 5. MEDIA (Lyrics) - Vertikal Panjang (Kiri)
    {
      name: "Lyrics Library",
      path: "/lyric",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-mana-05-idoloutfit-00-full.webp",
      description: "Song translations & MV",
      size: "md:col-span-1 md:row-span-2", // Vertikal
      icon: <Music className="w-5 h-5 text-green-400" />,
      color: "from-green-900/80 to-emerald-900/20",
    },
    // 6. SOCIAL (Chat) - Kotak Kecil
    {
      name: "Idoly Chat",
      path: "/chat",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-aoi-05-kaito-00-full.webp",
      description: "Talk to idols",
      size: "md:col-span-1 md:row-span-1",
      icon: <MessageCircle className="w-5 h-5 text-cyan-400" />,
      color: "from-cyan-900/80 to-blue-900/20",
    },
    // 7. TOOLS (Manager ID) - Melebar (Kanan)
    {
      name: "Manager ID",
      path: "/ktp",
      bgImage:
        "https://api.diveidolypapi.my.id/cardFull/img_card_full_1_ngs-05-fest-02.webp",
      description: "Create your custom ID Card",
      size: "md:col-span-2 md:row-span-1",
      icon: <Crown className="w-5 h-5 text-amber-400" />,
      color: "from-amber-900/80 to-yellow-900/20",
    },
    // 8. TOOLS (Calendar) - Kotak Kecil (Mengisi celah Chat)
    {
      name: "Calendar",
      path: "/bdayCalendar",
      bgImage:
        "https://api.diveidolypapi.my.id/image3Character/source-rio-05-fes-03-full.webp",
      description: "Birthdays",
      size: "md:col-span-1 md:row-span-1",
      icon: <Calendar className="w-5 h-5 text-red-400" />,
      color: "from-red-900/80 to-pink-900/20",
    },
    // 9. CREATIVE (Card Design) - Melebar (Bawah)
    {
      name: "Card Studio",
      path: "/cardDesign",
      bgImage:
        "https://api.diveidolypapi.my.id/cardFull/img_card_full_1_skr-05-idol-03.webp",
      description: "Design custom cards",
      size: "md:col-span-2 md:row-span-1",
      icon: <PenTool className="w-5 h-5 text-violet-400" />,
      color: "from-violet-900/80 to-purple-900/20",
    },
  ];

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto z-10 scrollbar-minimal pb-24 relative">
      {/* Decorative Background Glows */}
      <div className="fixed top-20 left-20 w-64 h-64 bg-pink-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-20 right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* HEADER: Modern & Clean */}
      <div className="mb-10 flex flex-col items-start gap-2 animate-in slide-in-from-top-4 duration-700 relative z-10">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
          <Sparkles size={14} className="text-yellow-400 animate-pulse" />
          <span className="text-xs text-gray-300 font-bold tracking-wider uppercase">
            Fan Database
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
          POLARIS{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            HUB
          </span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-lg leading-relaxed">
          The ultimate resource for Idoly Pride managers. Explore data, create
          content, and simulate your strategy.
        </p>
      </div>

      {/* GRID LAYOUT: MASONRY STYLE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[180px] relative z-10">
        {menuItems.map((item, index) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            onMouseEnter={() => setHoveredItem(item.path)}
            onMouseLeave={() => setHoveredItem(null)}
            className={`
              relative rounded-2xl overflow-hidden cursor-pointer group 
              transition-all duration-500 border border-white/5
              ${item.size} 
              ${hoveredItem === item.path ? "scale-[1.02] shadow-2xl z-20 ring-1 ring-white/20" : "hover:border-white/10"}
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Background Image with Zoom Effect */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
              style={{ backgroundImage: `url(${item.bgImage})` }}
            >
              {/* Dynamic Gradient Overlay based on Item Color */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${item.color} mix-blend-multiply opacity-90 transition-opacity duration-500 group-hover:opacity-80`}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 opacity-80"></div>
            </div>

            {/* Content Layer */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between">
              {/* Top Icon Area */}
              <div className="flex justify-between items-start">
                <div
                  className={`p-2 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 transition-transform duration-300 ${hoveredItem === item.path ? "scale-110 rotate-3 text-white" : "text-gray-300"}`}
                >
                  {item.icon}
                </div>

                {/* Arrow Indicator */}
                <div
                  className={`
                    w-8 h-8 rounded-full bg-white text-black flex items-center justify-center
                    transition-all duration-300 transform
                    ${hoveredItem === item.path ? "opacity-100 translate-x-0 rotate-[-45deg]" : "opacity-0 -translate-x-4 rotate-0"}
                 `}
                >
                  <ArrowRight size={16} />
                </div>
              </div>

              {/* Bottom Text Area */}
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white leading-none mb-1 drop-shadow-lg">
                  {item.name}
                </h3>
                <p
                  className={`text-xs md:text-sm font-medium text-gray-300 transition-all duration-300 ${hoveredItem === item.path ? "translate-y-0 opacity-100" : "translate-y-2 opacity-60"}`}
                >
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-12"></div>
    </div>
  );
};

export default HomeContent;
