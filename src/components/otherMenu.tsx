import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OtherMenu: React.FC = () => {
  const navigate = useNavigate();
  const [, setNextUrl] = useState("");

  const listOfFeature: { [key: string]: string } = {
    loveInterestChart:
      "https://i.ibb.co.com/pLj9xXT/363771169-306583611894283-5383617724482492648-n-after-banner.jpg",
    cardComparison:
      "https://i.ibb.co.com/bNC1fpY/357398104-287014430517868-577429276462872595-n-banner.jpg",
    cardOverview:
      "https://i.ibb.co.com/VpVXbTX/363420606-306583588560952-297302075456310277-n-banner.jpg",
    idolList:
      "https://i.ibb.co.com/4dsXtV7/363774424-306583491894295-4049817885692496536-n-banner.jpg",
  };

  const handleGo = (url: string) => {
    navigate(url);
  };

  useEffect(() => {
    //Set nextUrl default ke key pertama listOfFeature
    const firstKey = Object.keys(listOfFeature)[0];
    setNextUrl(firstKey);
  }, []);

  return (
    <div className="my-4 flex flex-wrap justify-around gap-2 scrollbar-none">
      {Object.keys(listOfFeature).map((key) => (
        <section
          key={key}
          className="relative h-16 w-2/3 cursor-pointer overflow-hidden rounded-md border-4 border-slate-900 bg-slate-700 lg:h-32 lg:w-[45%]"
          onClick={() => handleGo(`/${key}`)}
        >
          <label className="transition-color absolute z-10 flex h-full w-full cursor-pointer items-center justify-center bg-slate-900 text-center text-base lg:text-2xl font-semibold text-white duration-300 ease-out hover:bg-opacity-50 hover:opacity-100 bg-opacity-30 lg:opacity-0">
            {key}
          </label>
          <img
            className="transition-color h-full w-full object-cover duration-300 ease-out hover:opacity-70"
            src={listOfFeature[key]}
            alt={key}
          />
        </section>
      ))}
    </div>
  );
};

export default OtherMenu;
