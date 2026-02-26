import React from "react";
import { HashRouter as Router, Routes, Route, Outlet } from "react-router-dom";

// Pages Import
import KTPManager from "./pages/KTPManager";
import CompassChart from "./pages/CompassChart";
import Lyrics from "./pages/Lyrics";
import MainMenu from "./pages/MainMenu";
import IdolListPage from "./pages/IdolListPage";
import VideoBackground from "./components/videoBackground";
import HomeContent from "./pages/HomeContent";
import BdayCalendar from "./pages/BdayCalendar";
import CardOverviewPage from "./pages/CardOverviewPage";
import CardComparison from "./pages/CardComparison";
import ChatPage from "./pages/Chat";
import CharacterStatsPage from "./pages/CharacterStatPage";
import CardDesign from "./pages/CardDesign";
import MessagePage from "./pages/MessagePage";
import LoveStoryPage from "./pages/LoveStory";
import BondStoryPage from "./pages/BondStory";
import ExtraStoryPage from "./pages/ExtraStory";
import MainStoryPage from "./pages/MainStory";
import CardStoryPage from "./pages/CardStory";
import IdolyWordlePage from "./pages/IdolyWordlePage";
import GachaPage from "./pages/GachaPage";
import GachaSelectPage from "./pages/GachaSelectionPage";
import BeatmapPage from "./pages/BeatmapPage";
import ManaDiary from "./pages/ManaDiary";

const MainLayout = () => {
  return (
    // UBAH: Background utama jadi gelap (#0f1115) agar match dengan halaman lain
    <div className="flex flex-col min-h-screen bg-[#0f1115] text-white relative font-sans selection:bg-pink-500 selection:text-white">
      {/* Video Background (Opsional, pastikan z-index rendah) */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <VideoBackground />
      </div>

      {/* Main Menu (Navbar) - Fixed Top */}
      <MainMenu />

      {/* Content Area */}
      {/* pb-20 untuk memberi ruang bagi footer agar konten paling bawah tidak tertutup */}
      <div className="flex-grow z-10 w-full pb-16">
        <Outlet />
      </div>

      {/* FOOTER (Perbaikan Utama) */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f1115]/80 backdrop-blur-md border-t border-white/10 py-2">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-1">
          <div className="text-center md:text-left">
            <p className="text-[10px] text-gray-500 font-mono">
              © 2019 PROJECT IDOLY PRIDE
            </p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-[10px] text-gray-600 font-mono">
              FAN-MADE DATABASE • NOT AFFILIATED WITH QUALIARTS/CYBERAGENT
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomeContent />} />
          <Route path="idolList" element={<IdolListPage />} />
          <Route path="/lyric" element={<Lyrics />} />
          <Route path="/bdayCalendar" element={<BdayCalendar />} />
          <Route path="/cardOverview" element={<CardOverviewPage />} />
          <Route path="/cardComparison" element={<CardComparison />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/compassChart" element={<CompassChart />} />
          <Route path="/ktp" element={<KTPManager />} />
          <Route path="/stat" element={<CharacterStatsPage />} />
          <Route path="/cardDesign" element={<CardDesign />} />
          <Route path="/messages" element={<MessagePage />} />
          <Route path="/lovestory" element={<LoveStoryPage />} />
          <Route path="/bondstory" element={<BondStoryPage />} />
          <Route path="/extrastory" element={<ExtraStoryPage />} />
          <Route path="/mainstory" element={<MainStoryPage />} />
          <Route path="/cardstory" element={<CardStoryPage />} />
          <Route path="/wordle" element={<IdolyWordlePage />} />
          <Route path="/gacha" element={<GachaSelectPage />} />
          <Route path="/gacha/:id" element={<GachaPage />} />
          <Route path="/beatmaps" element={<BeatmapPage />} />
          <Route path="/diary" element={<ManaDiary />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
