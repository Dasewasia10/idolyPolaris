import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import html2canvas from "html2canvas";

import { Character } from "../interfaces/Character";

const LoveInterestChart: React.FC = () => {
  const menuRef = useRef(null);
  const chartRef = useRef(null);
  const draggableRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  const [idols, setIdols] = useState<Character[]>([]);
  const [positions, setPositions] = useState<{
    [key: number]: { x: number; y: number };
  }>({});
  const [fileName, setFileName] = useState("");
  const [isRendered, setIsRendered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [title, setTitle] = useState("Title here");
  const [top, setTop] = useState("Top");
  const [bottom, setBottom] = useState("Bottom");
  const [left, setLeft] = useState("Left");
  const [right, setRight] = useState("Right");

  const [highestZIndex, setHighestZIndex] = useState(1);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPositionChanged, setIsPositionChanged] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://www.diveidolypapi.my.id/api/characters"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data: Character[] = await response.json();

        // ✅ Filter hanya idol yang ada dalam grup tertentu
        const allowedGroups = [
          "Tsuki no Tempest",
          "Sunny Peace",
          "TRINITYAiLE",
          "LizNoir",
          "IIIX",
          "Mana Nagase",
        ];

        const filteredIdols = data
          .filter((idol) => allowedGroups.includes(idol.groupName))
          .sort((a, b) => a.name.localeCompare(b.name)); // Urutkan berdasarkan nama idol

        setIdols(filteredIdols); // ✅ Simpan hanya idol dalam grup tertentu
        setIsRendered(true);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isPositionChanged) {
        event.preventDefault();
        event.returnValue = ""; // Standar untuk beberapa browser
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isPositionChanged]);

  const navigate = useNavigate();

  const handleBackClick = () => {
    const message = isPositionChanged
      ? "Anda telah mengubah posisi. Apakah Anda yakin ingin kembali? Perubahan tidak akan tersimpan."
      : "Apakah Anda yakin ingin kembali?";

    if (window.confirm(message)) {
      navigate("/");
    }
  };

  const handleScreenshot = () => {
    if (!fileName.trim()) {
      alert("Nama file harus terisi sebelum men-download.");
      return;
    }

    const node = chartRef.current;
    if (node && isRendered) {
      html2canvas(node, {
        allowTaint: true, // Izinkan gambar yang terkontaminasi CORS
        useCORS: true, // Coba gunakan CORS
        logging: true, // Aktifkan logging untuk debugging
        scale: window.devicePixelRatio, // Sesuaikan dengan DPI perangkat
      })
        .then((canvas) => {
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `${fileName}.png`;
          link.click();
        })
        .catch((error) => {
          console.error("Error capturing screenshot:", error);
          alert("Gagal mengambil screenshot. Pastikan gambar dapat diakses.");
        });
    }
  };

  const handleStop = (
    _e: DraggableEvent,
    data: DraggableData,
    index: number
  ) => {
    setPositions((prev) => ({
      ...prev,
      [index]: { x: data.x, y: data.y },
    }));
    setIsPositionChanged(true);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (
        menuRef.current &&
        !(menuRef.current as HTMLElement).contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const clickHandlerDraggable = (index: number) => {
    setHighestZIndex((prev) => prev + 1);
    setActiveIndex(index);
  };

  const getCharacterIconUrl = (characterName: string) => {
    return `https://www.diveidolypapi.my.id/api/img/character/icon/${encodeURIComponent(
      characterName
    )}`;
  };

  return (
    <div className="relative h-dvh w-dvw bg-[#182cfc] lg:h-screen lg:w-screen">
      {!isMenuOpen && (
        <div className="absolute left-4 top-12 flex h-fit w-24 flex-col gap-2 bg-white p-4 transition-all duration-500 ease-out lg:h-60">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 4.702z" />
            </svg>
          </span>
          <p>Click here for customize and come back</p>
        </div>
      )}
      {!isMenuOpen && (
        <button
          onClick={toggleMenu}
          className="absolute left-4 top-4 z-20 rounded bg-gray-800 p-2 text-white transition-all duration-300 ease-in-out"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
      )}
      {isMenuOpen && (
        <section
          ref={menuRef}
          className="absolute left-2 top-4 z-30 flex w-fit flex-col gap-2 rounded bg-gray-800 px-4 py-2 transition-all duration-300 ease-in-out"
        >
          <div className="flex flex-row items-center justify-between">
            <button
              onClick={toggleMenu}
              className="z-10 rounded bg-gray-800 p-2 text-white"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-800 rounded-md hover:text-white font-semibold"
                onClick={handleBackClick}
              >
                {"<"}
              </button>
            </div>
          </div>
          <p className="mt-4 pl-1 font-semibold text-white">Save file name</p>
          <div className="flex gap-4">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="rounded border p-2"
              placeholder="Enter file name"
            />
            <button
              onClick={handleScreenshot}
              className="text-bg-gray-600 rounded bg-rose-300 p-2 transition-colors duration-300 ease-in-out hover:bg-rose-700 hover:text-white"
            >
              Save Screenshot
            </button>
          </div>
          <div
            id="custom-title"
            className="mt-4 flex flex-col gap-4 border border-white p-2"
          >
            <label htmlFor="title-custom" className="font-semibold text-white">
              Custom title
            </label>
            <input
              id="title-custom"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded border p-2"
              placeholder="Enter title"
            />
          </div>
          <div
            id="custom-label"
            className="mt-4 flex flex-col gap-4 border border-white p-2"
          >
            <p className="font-semibold text-white">Custom label</p>
            <input
              type="text"
              value={top}
              onChange={(e) => setTop(e.target.value)}
              className="rounded border p-2"
              placeholder="Enter top label"
            />
            <input
              type="text"
              value={bottom}
              onChange={(e) => setBottom(e.target.value)}
              className="rounded border p-2"
              placeholder="Enter bottom label"
            />
            <input
              type="text"
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              className="rounded border p-2"
              placeholder="Enter left label"
            />
            <input
              type="text"
              value={right}
              onChange={(e) => setRight(e.target.value)}
              className="rounded border p-2"
              placeholder="Enter right label"
            />
          </div>
        </section>
      )}

      <section
        ref={chartRef}
        className="absolute bottom-12 z-20 h-1/2 w-full scale-95 bg-white lg:right-2 lg:top-1 lg:h-screen lg:w-2/3"
      >
        <section className="absolute left-0 top-0 flex flex-wrap gap-2 lg:w-[50%]">
          <div className="text-warp absolute min-w-12 max-w-32 border-4 border-black p-4 text-center font-bold">
            {title}
          </div>
          {idols.map((item, index) => (
            <Draggable
              onMouseDown={() => clickHandlerDraggable(index)}
              key={index}
              defaultPosition={positions[index] || { x: 0, y: 0 }}
              onStop={(e, data) => handleStop(e, data, index)}
              nodeRef={
                draggableRefs.current[index] as React.RefObject<HTMLDivElement>
              }
            >
              <div
                ref={
                  draggableRefs.current[index] ||
                  (draggableRefs.current[index] = React.createRef())
                }
                style={{
                  zIndex: activeIndex === index ? highestZIndex : 1,
                }}
              >
                <img
                  src={getCharacterIconUrl(item.name?.toLowerCase() || "mei")}
                  alt={`icon-${index}`}
                  crossOrigin="anonymous"
                  className="h-8 w-auto lg:h-16"
                />
              </div>
            </Draggable>
          ))}
        </section>
        <section className="">
          <div className="absolute left-1/2 top-0 h-full w-px scale-90 bg-black"></div>
          <div className="absolute left-0 top-1/2 h-px w-full scale-75 bg-black"></div>
          <div className="text-warp absolute left-1/2 top-2 -translate-x-1/2 transform text-center">
            {top}
          </div>
          <div className="text-warp absolute bottom-2 left-1/2 -translate-x-1/2 transform text-center">
            {bottom}
          </div>
          <div className="text-warp absolute left-2 top-1/2 w-20 -translate-y-1/2 transform text-left">
            {left}
          </div>
          <div className="text-warp absolute right-2 top-1/2 w-20 -translate-y-1/2 transform text-right">
            {right}
          </div>
        </section>
      </section>

      <div className="absolute z-10 h-screen w-screen bg-[#182cfc] bg-opacity-0"></div>
      <img
        src="https://raw.githubusercontent.com/765Pro-Hoshimi/IDOLY-PRIDE-Logo/5e7f4e7a6b7889a12e266f1be1306cd6b2178a65/Logo/idoly-pride-logo-full-white.svg"
        alt="Idoly-Pride-Logo-White"
        crossOrigin="anonymous"
        className="absolute -right-4 -top-4 h-32 w-auto transition-all duration-500 ease-out lg:-left-2 lg:top-1/2 lg:h-60"
      />
    </div>
  );
};

export default LoveInterestChart;
