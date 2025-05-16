import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
// import { DarkModeProvider, DarkModeContext } from "./context/DarkMode";
// import { HistoryProvider, useHistory } from "./context/History";

import { Outlet } from "react-router-dom";

// import MainMenu from "./pages/tetttt";
// import ChatPage from "./pages/Chat";
// // import BookReader from "./pages/BookReader";
// import QnAPage from "./pages/ListOfQnA";
// import KTPManager from "./pages/KTPManager";

// import IdolDetailPage from "./pages/IdolDetailPage";
// import LoveInterestChart from "./pages/LoveInterestChart";
// import CardComparison from "./pages/CardComparison";
// import CardOverviewPage from "./pages/CardOverviewPage";
// //import CardDesign from "./pages/CardDesign (desperated)";

// import CardDesign from "./pages/CardDesign";
// import Lyrics from "./pages/Lyrics";

import MainMenu from "./pages/MainMenu";
import IdolListPage from "./pages/IdolListPage";
import VideoBackground from "./components/videoBackground";
import HomeContent from "./pages/HomeContent";

const MainLayout = () => {
  return (
    <div className="flex flex-col bg-slate-600">
      <VideoBackground />
      <MainMenu />
      <Outlet /> {/* Ini akan menampilkan konten yang sesuai dengan route */}
      <footer className="fixed bottom-0 left-0 right-0 bg-neutral-100 dark:bg-neutral-900 py-1 mt-auto z-0">
        <div className="container mx-auto px-4 text-center">
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
    <div className="mt-20">
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomeContent />} />
            <Route path="idolList" element={<IdolListPage />} />{" "}
          </Route>
          {/* <Route path="/chat" element={<ChatPage />} /> */}
          {/* <Route path="/bookreader" element={<BookReader />} /> */}
          {/* <Route path="/qna" element={<QnAPage />} /> */}
          {/* <Route path="/ktp" element={<KTPManager />} /> */}
          {/* Pass the historyData to the History component */}

          {/* <Route path="/idol/:idolName" element={<IdolDetailPage />} /> */}
          {/* <Route path="/loveInterestChart" element={<LoveInterestChart />} /> */}
          {/* <Route path="/cardComparison" element={<CardComparison />} /> */}
          {/* <Route path="/cardOverview" element={<CardOverviewPage />} /> */}
          {/* <Route path="/cardDesign" element={<CardDesign />} /> */}
          {/* <Route path="/lyric" element={<Lyrics />} /> */}

          {/* <Route path="/test" element={<MainMenuTest />} /> */}
        </Routes>
      </Router>
    </div>
    //   </HistoryProvider>
    // </DarkModeProvider>
  );
};

export default App;
