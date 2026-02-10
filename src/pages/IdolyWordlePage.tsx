import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft, RotateCcw, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- CONFIG ---
const API_BASE = "https://diveidolypapi.my.id/api/wordle"; // Sesuaikan domain backend kamu

// Keyboard Layout
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
];

const IdolyWordlePage: React.FC = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [solution, setSolution] = useState(""); // Kata Jawaban (Decoded)
  const [wordLength, setWordLength] = useState(5);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing",
  );
  const [message, setMessage] = useState("");

  // Load Game Data
  useEffect(() => {
    const fetchDailyWord = async () => {
      try {
        const res = await axios.get(`${API_BASE}/daily`);
        // Decode Base64
        const decodedWord = atob(res.data.hash);

        setSolution(decodedWord);
        setWordLength(res.data.length);

        // Cek LocalStorage
        const savedData = localStorage.getItem("idolyWordleState");
        if (savedData) {
          const parsed = JSON.parse(savedData);
          // Jika tanggalnya sama dengan hari ini, load progress
          if (parsed.date === res.data.date) {
            setGuesses(parsed.guesses);
            setGameStatus(parsed.status);
          } else {
            // Hari baru, reset storage
            localStorage.removeItem("idolyWordleState");
          }
        }
      } catch (err) {
        console.error("Error fetching wordle:", err);
        setMessage("Gagal memuat kata hari ini.");
      }
    };
    fetchDailyWord();
  }, []);

  // Save Progress ke LocalStorage setiap ada perubahan guess
  useEffect(() => {
    if (solution) {
      const todayDate = new Date().toISOString().split("T")[0]; // Simple date match (bisa disesuaikan logic backend)
      localStorage.setItem(
        "idolyWordleState",
        JSON.stringify({
          date: todayDate, // Perlu sinkron dengan backend date sebenarnya idealnya
          guesses,
          status: gameStatus,
        }),
      );
    }
  }, [guesses, gameStatus, solution]);

  // --- LOGIC ---
  const handleKey = (key: string) => {
    if (gameStatus !== "playing") return;

    if (key === "DEL") {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }

    if (key === "ENTER") {
      if (currentGuess.length !== wordLength) {
        showMessage("Huruf kurang!");
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

    if (currentGuess === solution) {
      setGameStatus("won");
      showMessage("CONGRATULATIONS! 🎉");
    } else if (newGuesses.length >= 6) {
      setGameStatus("lost");
      showMessage(`Jawaban: ${solution}`);
    }

    setCurrentGuess("");
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // Keyboard Event Listener (PC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === "ENTER" || key === "BACKSPACE") {
        handleKey(key === "BACKSPACE" ? "DEL" : "ENTER");
      } else if (/^[A-Z]$/.test(key)) {
        handleKey(key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, gameStatus, wordLength]); // Deps penting agar state terbaca

  // --- HELPER: CHECK COLORS ---
  const getLetterStatus = (letter: string, index: number, word: string) => {
    const correctLetter = solution[index];

    if (letter === correctLetter) return "correct"; // Hijau
    if (solution.includes(letter)) return "present"; // Kuning
    return "absent"; // Abu
  };

  // Helper untuk warna keyboard (Global status per huruf)
  const getKeyStatus = (key: string) => {
    let status = "";
    guesses.forEach((guess) => {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key) {
          const s = getLetterStatus(guess[i], i, guess);
          if (s === "correct") return "correct"; // Prioritas tertinggi
          if (s === "present" && status !== "correct") status = "present";
          if (s === "absent" && status === "") status = "absent";
        }
      }
    });
    return status;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col items-center">
      {/* HEADER */}
      <header className="w-full max-w-lg flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-gray-800 rounded-full text-gray-400"
        >
          <ChevronLeft />
        </button>
        <h1 className="font-bold text-xl tracking-widest bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          IDOLY WORDLE
        </h1>
        <div className="w-8"></div> {/* Spacer */}
      </header>

      {/* MESSAGE TOAST */}
      {message && (
        <div className="fixed top-20 z-50 bg-white text-black font-bold px-6 py-3 rounded-lg shadow-xl animate-bounce">
          {message}
        </div>
      )}

      {/* GAME BOARD */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg p-2">
        <div
          className="grid gap-1 mb-4"
          style={{
            gridTemplateRows: `repeat(6, 1fr)`,
            // DYNAMIC COLUMN BASED ON WORD LENGTH
            gridTemplateColumns: `repeat(${wordLength}, 1fr)`,
          }}
        >
          {/* Render 6 Baris Tebakan */}
          {[...Array(6)].map((_, rowIndex) => {
            const guess = guesses[rowIndex];
            const isCurrentRow = rowIndex === guesses.length;

            return [...Array(wordLength)].map((_, colIndex) => {
              let letter = "";
              let status = "";

              if (guess) {
                // Baris yang sudah ditebak
                letter = guess[colIndex];
                status = getLetterStatus(letter, colIndex, guess);
              } else if (isCurrentRow) {
                // Baris yang sedang diketik
                letter = currentGuess[colIndex] || "";
                status = "active";
              }

              // Style Classes
              let bgClass = "bg-gray-900 border-gray-700";
              if (status === "correct")
                bgClass = "bg-green-600 border-green-600";
              if (status === "present")
                bgClass = "bg-yellow-600 border-yellow-600";
              if (status === "absent") bgClass = "bg-gray-700 border-gray-700";
              if (status === "active" && letter)
                bgClass = "bg-gray-800 border-pink-500 animate-pulse";

              return (
                <div
                  key={colIndex}
                  className={`
                                w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center 
                                border-2 font-bold text-xl sm:text-2xl rounded 
                                transition-all duration-300 transform 
                                ${bgClass}
                                ${status && status !== "active" ? "flip-in-hor-bottom" : ""}
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
      <div className="w-full max-w-2xl p-2 pb-8">
        {KEYBOARD_ROWS.map((row, i) => (
          <div key={i} className="flex justify-center gap-1 mb-1">
            {row.map((key) => {
              const status = getKeyStatus(key);
              let bgClass = "bg-gray-600 hover:bg-gray-500";
              if (status === "correct") bgClass = "bg-green-600";
              if (status === "present") bgClass = "bg-yellow-600";
              if (status === "absent") bgClass = "bg-gray-800 text-gray-500";

              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  className={`
                                  h-12 rounded font-bold text-sm sm:text-base transition-colors
                                  ${key.length > 1 ? "px-3 sm:px-4 text-xs" : "flex-1 max-w-[45px]"}
                                  ${bgClass}
                              `}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* GAME OVER OVERLAY */}
      {gameStatus !== "playing" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-2xl border border-pink-500 text-center shadow-[0_0_50px_rgba(236,72,153,0.3)]">
            <h2 className="text-3xl font-bold mb-2">
              {gameStatus === "won" ? "MANAGER SKILL EXTREME!" : "GAME OVER"}
            </h2>
            <p className="text-gray-400 mb-6">
              The word was:{" "}
              <span className="text-pink-400 font-bold text-xl">
                {solution}
              </span>
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/")}
                className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg"
              >
                Back to Menu
              </button>
              {/* Tombol Share bisa ditambahkan di sini nanti */}
            </div>
            <p className="mt-6 text-xs text-gray-500">
              Come back tomorrow for a new word!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdolyWordlePage;
