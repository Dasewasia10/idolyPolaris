import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
// import { DarkModeProvider, DarkModeContext } from "./context/DarkMode";
// import { HistoryProvider, useHistory } from "./context/History";

import MainMenu from "./pages/MainMenu";
import ChatPage from "./pages/Chat";
// import BookReader from "./pages/BookReader";
import QnAPage from "./pages/ListOfQnA";
import KTPManager from "./pages/KTPManager";

import IdolDetailPage from "./pages/IdolDetailPage";
import LoveInterestChart from "./pages/LoveInterestChart";
import CardComparison from "./pages/CardComparison";
import CardOverviewPage from "./pages/CardOverviewPage";
//import CardDesign from "./pages/CardDesign (desperated)";
import IdolList from "./pages/IdolList";

import CardDesign from "./pages/CardDesign";
import Lyrics from "./pages/Lyrics";

const App: React.FC = () => {
  //const { darkMode } = useContext(DarkModeContext);
  //const { addHistoryEntry } = useHistory();

  return (
    // <DarkModeProvider>
    //<HistoryProvider>
    <div className="flex flex-col">
      {/* <AppBar /> */}
      <div
      //className={`flex-auto ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}
      >
        <Router>
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/chat" element={<ChatPage />} />
            {/* <Route path="/bookreader" element={<BookReader />} /> */}
            <Route path="/qna" element={<QnAPage />} />
            <Route path="/ktp" element={<KTPManager />} />
            {/* Pass the historyData to the History component */}

            <Route path="/idol/:idolName" element={<IdolDetailPage />} />
            <Route path="/loveInterestChart" element={<LoveInterestChart />} />
            <Route path="/cardComparison" element={<CardComparison />} />
            <Route path="/cardOverview" element={<CardOverviewPage />} />
            <Route path="/cardDesign" element={<CardDesign />} />
            <Route path="/idolList" element={<IdolList />} />
            <Route path="/lyric" element={<Lyrics />} />
          </Routes>
        </Router>
      </div>
    </div>
    //   </HistoryProvider>
    // </DarkModeProvider>
  );
};

export default App;
