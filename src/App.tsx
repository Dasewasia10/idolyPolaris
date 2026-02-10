import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
// import { DarkModeProvider, DarkModeContext } from "./context/DarkMode";
// import { HistoryProvider, useHistory } from "./context/History";
import { Outlet } from "react-router-dom";

// // import BookReader from "./pages/BookReader";
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
import MaintenanceNotice from "./components/maintenanceNotice";
import LoveStoryPage from "./pages/LoveStory";
import IdolyWordlePage from "./pages/IdolyWordlePage";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-[32rem] xl:min-h-[37rem] bg-slate-600">
      <VideoBackground />
      <MainMenu />
      <div className="flex-grow px-4 mb-0 lg:mb-10 xl:py-3 z-10 rounded-lg">
        <Outlet /> {/* Konten utama akan mengambil sisa space yang tersedia */}
      </div>
      {/* <MaintenanceNotice /> */}
      <footer className="fixed bottom-0 left-0 right-0 bg-neutral-100 dark:bg-neutral-900 py-1 mt-auto z-10">
        <div className="container mx-auto px-4 text-center flex flex-col lg:flex-row items-center lg:justify-around xl:flex-col">
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            © 2019 IDOLY PRIDE • All official content belongs to respective
            rights holders
          </p>
          <p className="text-neutral-500 dark:text-neutral-500 text-xs mt-1">
            Fan-made website • Not affiliated with the official project
          </p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  //const { darkMode } = useContext(DarkModeContext);
  //const { addHistoryEntry } = useHistory();

  return (
    // <DarkModeProvider>
    //<HistoryProvider>
    <div className="mt-20 mb-20 lg:mb-0">
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
            <Route path="/wordle" element={<IdolyWordlePage />} />
          </Route>

          {/* <Route path="/bookreader" element={<BookReader />} /> */}

          {/* <Route path="/test" element={<MainMenuTest />} /> */}
        </Routes>
      </Router>
    </div>
    //   </HistoryProvider>
    // </DarkModeProvider>
  );
};

export default App;
