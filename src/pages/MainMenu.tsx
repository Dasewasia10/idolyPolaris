import React from "react";
import { useNavigate } from "react-router-dom";

import OtherMenu from "../components/otherMenu";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();

  const handleGo = (url: string) => {
    navigate(url);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-slate-600 gap-8">
        <h2 className="w-full bg-red-400 px-2 py-4 text-lg font-bold transition-all duration-500 ease-out lg:text-2xl flex justify-center">
          <span className="text-center">
            Welcome to Idoly Pride fan-Website!
          </span>
        </h2>
        <div className="flex flex-row gap-4">
          <button
            onClick={() => handleGo("/cardDesign")}
            className="flex text-2xl rounded-lg bg-black hover:bg-white text-white hover:text-black p-4"
          >
            Card Design
          </button>
          <button
            onClick={() => handleGo("/chat")}
            className="flex text-2xl rounded-lg bg-black hover:bg-white text-white hover:text-black p-4"
          >
            IdolyChat
          </button>
          {/* <button
            onClick={() => handleGo("/bookreader")}
            className="flex text-2xl rounded-lg bg-black hover:bg-white text-white hover:text-black p-4"
          >
            Reading
          </button> */}
          <button
            onClick={() => handleGo("/qna")}
            className="flex text-2xl rounded-lg bg-black hover:bg-white text-white hover:text-black p-4"
          >
            QnA
          </button>
          <button
            onClick={() => handleGo("/lyric")}
            className="flex text-2xl rounded-lg bg-black hover:bg-white text-white hover:text-black p-4"
          >
            Lyric
          </button>
          <button
            onClick={() => handleGo("/ktp")}
            className="flex text-2xl rounded-lg bg-black hover:bg-white text-white hover:text-black p-4"
          >
            KTP Manager
          </button>
        </div>
        <OtherMenu />
      </div>
    </>
  );
};

export default MainMenu;
