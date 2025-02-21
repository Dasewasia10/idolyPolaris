import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid"; // Pastikan heroicons telah diinstal: npm install @heroicons/react

import SearchBar from "../components/searchBar";

import { Character } from "../interfaces/Character";
// import { characters } from "../data/characters";

const IdolList: React.FC = () => {
  const navigate = useNavigate();

  const [idols, setIdols] = useState<Character[]>([]); // Gunakan tipe Character[]
  const [searchTerm, setSearchTerm] = useState<string>(""); // State untuk menyimpan nilai input pencarian
  const [selectedIdol, setSelectedIdol] = useState<Character | null>(null); // State untuk idol yang dipilih
  const [isOpen, setIsOpen] = useState(false); // State untuk modal

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

        const allowedGroups = [
          "Tsuki no Tempest",
          "Sunny Peace",
          "TRINITYAiLE",
          "LizNoir",
          "IIIX",
          "Mana Nagase",
          "Collaboration",
        ];

        const filteredIdols = data.filter((idol) =>
          allowedGroups.includes(idol.groupName)
        );
        setIdols(filteredIdols); // ✅ Simpan hanya idol dalam grup tertentu

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // ✅ Hapus `idolName` karena tidak digunakan di sini

  const handleGo = (url: string) => {
    navigate(url);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter idols berdasarkan search term
  const filteredIdols = idols.filter(
    (idol) =>
      idol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idol.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idol.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fungsi untuk membuka modal dengan data idol yang dipilih
  const openModal = (idol: Character) => {
    setSelectedIdol(idol);
    setIsOpen(true);
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setIsOpen(false);
  };

  // Fungsi untuk menggeser ke idol sebelumnya
  const prevIdol = () => {
    if (selectedIdol) {
      const currentIndex = filteredIdols.findIndex(
        (idol) => idol === selectedIdol
      );
      console.log("Current Index:", currentIndex);
      const prevIndex =
        (currentIndex - 1 + filteredIdols.length) % filteredIdols.length;
      console.log("Previous Index:", prevIndex);
      setSelectedIdol(filteredIdols[prevIndex]);
      console.log("Selected Idol:", filteredIdols[prevIndex]);
    } else {
      console.log("No selected idol");
    }
  };

  // Fungsi untuk menggeser ke idol berikutnya
  const nextIdol = () => {
    if (selectedIdol) {
      const currentIndex = filteredIdols.findIndex(
        (idol) => idol === selectedIdol
      );
      console.log("Current Index:", currentIndex);
      const nextIndex = (currentIndex + 1) % filteredIdols.length;
      console.log("Next Index:", nextIndex);
      setSelectedIdol(filteredIdols[nextIndex]);
      console.log("Selected Idol:", filteredIdols[nextIndex]);
    } else {
      console.log("No selected idol");
    }
  };

  const isColorDark = (color: string) => {
    // Remove the hash if present
    color = color.replace("#", "");

    // Convert to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Calculate brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return true if dark, false if light
    return brightness < 128;
  };

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <div className="container mx-auto p-4 transition-all duration-500 ease-out">
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-4">
        <section
          id="leftConsole"
          className="flex flex-col gap-2 w-full lg:w-[30%] lg:h-[90%]"
        >
          <div className="flex items-center">
            <button
              className="px-4 py-2 bg-gray-300 hover:bg-gray-800 rounded-md hover:text-white font-semibold"
              onClick={handleBackClick}
            >
              {"<"}
            </button>
          </div>
        </section>
        {/* Input untuk mencari idol */}
        <div className="w-full lg:w-[70%]">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            placeholderText="Search by name or group"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 transition-all duration-500 ease-out md:grid-cols-2 lg:grid-cols-4">
        {filteredIdols.map((item, index) => {
          const backgroundColor = `#${item.color}`;
          const textColor =
            item.color && isColorDark(item.color) ? "#FFFFFF" : "#000000";

          return (
            <div
              key={index}
              style={{ backgroundColor, color: textColor }}
              className="flex cursor-pointer gap-4 rounded p-4 transition-all duration-500 ease-out hover:shadow-lg hover:shadow-slate-950"
              onClick={() => openModal(item)} // Buka modal saat diklik
            >
              <img
                src={
                  `https://api.diveidolypapi.my.id/bannerCharacter/banner-${item.name.toLowerCase()}.png` ||
                  `${import.meta.env.BASE_URL}assets/default_image.png`
                }
                alt={item.name}
                onError={(e) => {
                  e.currentTarget.src = `${
                    import.meta.env.BASE_URL
                  }assets/icon/chara-avatar.webp`; // Ganti dengan URL gambar fallback
                  e.currentTarget.alt = "Image not available";
                }}
                className="h-40 w-[4.5rem] rounded object-cover transition-all duration-500 ease-out"
              />
              <ul className="text-base">
                <li>
                  <p>
                    <strong>Name:</strong> {item.name}{" "}
                    {item.familyName || "----"}
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Group Name:</strong> {item.groupName || "----"}
                  </p>
                </li>
              </ul>
              {item.isCenter ? (
                <figure className="ml-auto flex">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M50 10 Q65 30 90 50 Q65 70 50 90 Q35 70 10 50 Q35 30 50 10Z"
                      fill="white"
                      stroke="black"
                      strokeWidth="2"
                    />
                  </svg>
                </figure>
              ) : (
                ""
              )}
            </div>
          );
        })}
      </div>
      {/* Modal untuk menampilkan data lengkap idol */}
      {selectedIdol && (
        <div
          className={`fixed inset-0 z-10 first-line:overflow-y-auto ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <div
            style={{
              backgroundColor: `#${selectedIdol.color}C3`,
            }}
            className="flex min-h-screen items-center justify-center transition-all duration-500 ease-out"
          >
            <div
              className="fixed inset-0 bg-black opacity-30"
              onClick={closeModal}
            />

            <div className="absolute z-10 flex items-center gap-64 lg:gap-[420px]">
              <button
                onClick={prevIdol}
                className="rounded-full bg-gray-200 p-2 lg:p-4"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
              </button>
              <button
                onClick={nextIdol}
                className="rounded-full bg-gray-200 p-2 lg:p-4"
              >
                <ChevronRightIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            <div className="relative mx-auto max-w-lg rounded-lg bg-white p-4">
              <button
                onClick={closeModal}
                className="absolute right-0 top-0 z-20 mr-2 mt-2 text-gray-600 hover:text-gray-800"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <h2 className="mb-4 text-xl font-bold">
                {selectedIdol.familyName} {selectedIdol.name}{" "}
                {selectedIdol.isCenter ? "(Leader)" : ""}
              </h2>
              <section className="flex w-[30vh] flex-row lg:w-[50vh]">
                <img
                  src={
                    `https://api.diveidolypapi.my.id/bannerCharacter/banner-${selectedIdol.name.toLowerCase()}.png` ||
                    `${import.meta.env.BASE_URL}assets/default_image.png`
                  }
                  alt={selectedIdol.name}
                  onError={(e) => {
                    e.currentTarget.src = `${
                      import.meta.env.BASE_URL
                    }assets/icon/chara-avatar.webp`; // Ganti dengan URL gambar fallback
                    e.currentTarget.alt = "Image not available";
                  }}
                  className="mb-4 h-40 w-auto rounded-l-lg object-cover transition-all duration-300 ease-out"
                />
                <button
                  onClick={() =>
                    handleGo(
                      `/idol/${selectedIdol.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`
                    )
                  }
                  className="z-10 h-40 w-12 rounded rounded-r-xl bg-slate-600 p-2 text-lg font-bold text-white text-opacity-0 transition-all duration-500 ease-out hover:w-full hover:text-opacity-100"
                >
                  {"Details >"}
                </button>
              </section>
              <ul>
                <li>
                  <p>
                    <strong>Name:</strong> {selectedIdol.name}
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Family Name:</strong>{" "}
                    {selectedIdol.familyName || "----"}
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Group Name:</strong>{" "}
                    {selectedIdol.groupName || "----"}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdolList;
