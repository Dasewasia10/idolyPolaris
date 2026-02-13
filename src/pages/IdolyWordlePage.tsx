import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft, HelpCircle, Trophy, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- CONFIG ---
const API_BASE = "https://diveidolypapi.my.id/api/wordle";

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
];

const IdolyWordlePage: React.FC = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [solution, setSolution] = useState("");
  const [wordLength, setWordLength] = useState(5);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing",
  );
  const [message, setMessage] = useState("");
  const [isRevealing, setIsRevealing] = useState(false);

  // Load Game
  useEffect(() => {
    const fetchDailyWord = async () => {
      try {
        const now = new Date();
        const localMidnight = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const localDayIndex = Math.floor(localMidnight.getTime() / 86400000);

        const res = await axios.get(`${API_BASE}/daily?day=${localDayIndex}`);
        const decodedWord = atob(res.data.hash);

        setSolution(decodedWord);
        setWordLength(res.data.length);

        const savedData = localStorage.getItem("idolyWordleState");
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.dayIndex === localDayIndex) {
            setGuesses(parsed.guesses);
            setGameStatus(parsed.status);
          } else {
            localStorage.removeItem("idolyWordleState");
          }
        }
      } catch (err) {
        console.error("Error:", err);
        setMessage("Connection Error. Please refresh.");
      }
    };
    fetchDailyWord();
  }, []);

  // Save Progress
  useEffect(() => {
    if (solution) {
      const now = new Date();
      const localDayIndex = Math.floor(
        new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() /
          86400000,
      );
      localStorage.setItem(
        "idolyWordleState",
        JSON.stringify({
          dayIndex: localDayIndex,
          guesses,
          status: gameStatus,
        }),
      );
    }
  }, [guesses, gameStatus, solution]);

  // Logic
  const handleKey = (key: string) => {
    if (gameStatus !== "playing" || isRevealing) return;

    if (key === "DEL") {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }

    if (key === "ENTER") {
      if (currentGuess.length !== wordLength) {
        showMessage("Not enough letters!");
        return;
      }
      submitGuess();
      return;
    }

    if (currentGuess.length < wordLength) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  const submitGuess = () => {
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess("");
    setIsRevealing(true);

    if (currentGuess === solution) {
      setTimeout(() => {
        setGameStatus("won");
        setIsRevealing(false);
      }, 2000);
    } else if (newGuesses.length >= 6) {
      setTimeout(() => {
        setGameStatus("lost");
        setIsRevealing(false);
      }, 2000);
    } else {
      setTimeout(() => {
        setIsRevealing(false);
      }, 1500);
    }
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === "ENTER" || key === "BACKSPACE")
        handleKey(key === "BACKSPACE" ? "DEL" : "ENTER");
      else if (/^[A-Z]$/.test(key)) handleKey(key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, gameStatus, wordLength, isRevealing]);

  // Colors Logic
  const getLetterStatus = (letter: string, index: number) => {
    if (letter === solution[index]) return "correct";
    if (solution.includes(letter)) return "present";
    return "absent";
  };

  const getKeyStatus = (key: string) => {
    let bestStatus = "";
    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key) {
          const s = getLetterStatus(key, i);
          if (s === "correct") return "correct";
          if (s === "present") bestStatus = "present";
          if (s === "absent" && bestStatus === "") bestStatus = "absent";
        }
      }
    }
    return bestStatus;
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white font-sans flex flex-col items-center relative overflow-hidden selection:bg-pink-500 selection:text-white">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600/30 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 blur-[100px] rounded-full"></div>
      </div>

      {/* HEADER */}
      <header className="w-full max-w-lg flex items-center justify-between p-6 z-10">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"
        >
          <ChevronLeft />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-pink-500 tracking-[0.3em] uppercase">
            Daily Challenge
          </span>
          <h1 className="font-black text-2xl tracking-tighter italic bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            IDOLY WORDLE&nbsp;
          </h1>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-white/10 rounded-full text-gray-400">
            <HelpCircle size={20} />
          </button>
        </div>
      </header>

      {/* TOAST MESSAGE */}
      {message && (
        <div className="fixed top-24 z-50 bg-white/90 backdrop-blur text-black font-bold px-6 py-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-in fade-in slide-in-from-top-4">
          {message}
        </div>
      )}

      {/* GAME BOARD */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg p-4 z-10">
        <div
          className="grid gap-2 mb-4 w-full aspect-[5/6] max-h-[450px]"
          style={{
            gridTemplateRows: `repeat(6, 1fr)`,
            gridTemplateColumns: `repeat(${wordLength}, 1fr)`,
          }}
        >
          {[...Array(6)].map((_, rowIndex) => {
            const guess = guesses[rowIndex];
            const isCurrentRow = rowIndex === guesses.length;

            // --- LOGIKA PEWARNAAN YANG DIPERBAIKI ---
            let rowStatuses = Array(wordLength).fill("absent"); // Default abu-abu

            if (guess) {
              const solutionChars = solution.split("");
              const guessChars = guess.split("");

              // 1. Pass Pertama: Cari yang "CORRECT" (Hijau) dulu
              guessChars.forEach((char, i) => {
                if (char === solutionChars[i]) {
                  rowStatuses[i] = "correct";
                  solutionChars[i] = ""; // Tandai huruf ini sudah terpakai
                }
              });

              // 2. Pass Kedua: Cari yang "PRESENT" (Kuning)
              guessChars.forEach((char, i) => {
                if (rowStatuses[i] !== "correct") {
                  // Jika belum hijau
                  const indexInSolution = solutionChars.indexOf(char);
                  if (indexInSolution !== -1) {
                    rowStatuses[i] = "present";
                    solutionChars[indexInSolution] = ""; // Pakai jatah huruf ini
                  }
                }
              });
            }
            // ----------------------------------------

            return [...Array(wordLength)].map((_, colIndex) => {
              let letter = "";
              let status = "";

              if (guess) {
                letter = guess[colIndex];
                status = rowStatuses[colIndex]; // Gunakan hasil hitungan di atas
              } else if (isCurrentRow) {
                letter = currentGuess[colIndex] || "";
                status = "active";
              }

              // IDOLY STYLE TILES
              let borderClass = "border-2 border-white/10 bg-white/5";
              let textClass = "text-white";
              let glowClass = "";

              if (status === "correct") {
                borderClass = "border-green-500 bg-green-500/20";
                textClass = "text-green-400";
              } else if (status === "present") {
                borderClass = "border-yellow-500 bg-yellow-500/20";
                textClass = "text-yellow-400";
              } else if (status === "absent") {
                borderClass = "border-gray-700 bg-black/40";
                textClass = "text-gray-600";
              } else if (status === "active" && letter) {
                borderClass = "border-pink-500 bg-pink-500/10";
                textClass = "text-white";
              }

              return (
                <div
                  key={colIndex}
                  className={`
                    flex items-center justify-center 
                    text-3xl font-black rounded-lg
                    transition-all duration-500 transform
                    ${borderClass} ${textClass} ${glowClass}
                    ${status && status !== "active" ? "flip-in-hor-bottom" : ""}
                    ${status === "active" && letter ? "scale-105" : "scale-100"}
                  `}
                >
                  {letter}
                </div>
              );
            });
          })}
        </div>
      </main>

      {/* KEYBOARD */}
      <div className="w-full max-w-2xl p-2 pb-8 z-10">
        {KEYBOARD_ROWS.map((row, i) => (
          <div key={i} className="flex justify-center gap-1.5 mb-2">
            {row.map((key) => {
              const status = getKeyStatus(key);

              let bgClass =
                "bg-[#1f2937] text-gray-300 border-b-4 border-[#111827] hover:bg-gray-600 hover:border-gray-800"; // Default Key
              if (status === "correct")
                bgClass = "bg-green-600 text-white border-b-4 border-green-800";
              else if (status === "present")
                bgClass =
                  "bg-yellow-600 text-white border-b-4 border-yellow-800";
              else if (status === "absent")
                bgClass = "bg-black text-gray-700 border-b-4 border-black/50";

              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  className={`
                    h-14 rounded-lg font-bold text-sm sm:text-base transition-all active:border-b-0 active:translate-y-1
                    ${key.length > 1 ? "px-4 text-xs font-black tracking-widest" : "flex-1 max-w-[50px]"}
                    ${bgClass}
                  `}
                >
                  {key === "DEL" ? "DEL" : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* RESULT OVERLAY (LIVE RESULT STYLE) */}
      {gameStatus !== "playing" && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-in fade-in duration-500">
          <div className="bg-[#161b22] p-1 rounded-3xl border border-white/10 shadow-2xl max-w-sm w-full mx-4 overflow-hidden relative">
            {/* Banner Header */}
            <div
              className={`h-24 flex items-center justify-center relative overflow-hidden rounded-t-[20px] ${gameStatus === "won" ? "bg-gradient-to-r from-pink-600 to-purple-600" : "bg-gray-800"}`}
            >
              {/* Pattern */}
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]"></div>
              <h2 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-md relative z-10">
                {gameStatus === "won" ? "BIG SUCCESS!" : "FAILED..."}
              </h2>
            </div>

            <div className="p-8 text-center space-y-6">
              <div className="space-y-1">
                <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                  Secret Word
                </p>
                <div className="text-3xl font-mono font-bold text-white tracking-widest border-b-2 border-white/20 pb-2 inline-block">
                  {solution}
                </div>
              </div>

              {gameStatus === "won" ? (
                <div className="flex justify-center gap-2">
                  <Trophy
                    size={48}
                    className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                  />
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  Don't give up! Try again tomorrow.
                </p>
              )}

              <div className="pt-4">
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  RETURN TO MENU
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdolyWordlePage;
