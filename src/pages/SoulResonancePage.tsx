import React, { useState } from "react";
import {
  resonanceQuestions,
  idolPersonalities,
  Trait,
  IdolPersonality,
} from "../data/resonanceData";
import { RadarChart } from "../components/RadarChart";
import {
  HeartPulse,
  Sparkles,
  RefreshCcw,
  Save,
  List,
  X,
  Globe,
  ChevronLeft,
} from "lucide-react"; // Tambahkan Globe
import { saveAs } from "file-saver";
import domtoimage from "dom-to-image";
import Toast from "../components/Toast";

const uiTranslations = {
  japanese: {
    title: "ソウル・レゾナンス",
    desc: "「8つの心理機能が織りなす心の深淵へ。あなたの魂の本質と鏡合わせのアイドルを見つけ出しませんか。」",
    disclaimer:
      "注意：結果は100%正確というわけではありません。お遊び程度に（話半分で）捉えてくださいね。楽しんで！",
    startBtn: "分析開始",
    phase: "フェーズ",
    agree: "同意する",
    disagree: "同意しない",
    back: "戻る",
  },
  global: {
    title: "Soul Resonance",
    desc: '"Navigate the eight realms of your psyche to discover the idol who mirrors the true essence of your soul."',
    disclaimer:
      "Note: The results are most likely not 100% accurate, so please take it with a grain of salt. Have fun!",
    startBtn: "START ANALYSIS",
    phase: "PHASE",
    agree: "Agree",
    disagree: "Disagree",
    back: "Back",
  },
  indo: {
    title: "Soul Resonance",
    desc: '"Telusuri delapan dimensi kepribadianmu dan temukan sosok idola yang menjadi cerminan sejati dari relung jiwamu."',
    disclaimer:
      "Catatan: Kemungkinan besar hasil tidak 100% akurat, jadi mohon untuk tidak terlalu dianggap serius. Have fun!",
    startBtn: "MULAI ANALISIS",
    phase: "FASE",
    agree: "Setuju",
    disagree: "Tidak",
    back: "Kembali",
  },
};

const SoulResonancePage: React.FC = () => {
  const [step, setStep] = useState<"start" | "quiz" | "result">("start");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [history, setHistory] = useState<Record<Trait, number>[]>([]);
  const [primaryLanguage, setPrimaryLanguage] = useState<
    "japanese" | "global" | "indo"
  >("global");

  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  // Default nilai tengah (50) untuk semua trait di awal
  const [userTraits, setUserTraits] = useState<Record<Trait, number>>({
    Extrovert: 50,
    Judging: 50,
    Logic: 50,
    Confidence: 50,
    Ambition: 50,
    Composure: 50,
    Empathy: 50,
    Unique: 50,
  });

  const [topMatches, setTopMatches] = useState<
    { idol: IdolPersonality; syncRate: number }[]
  >([]);

  const [allMatches, setAllMatches] = useState<
    { idol: IdolPersonality; syncRate: number }[]
  >([]);
  const [showAllMatches, setShowAllMatches] = useState(false);

  const startTest = () => {
    const initialState = {
      Extrovert: 50,
      Judging: 50,
      Logic: 50,
      Confidence: 50,
      Ambition: 50,
      Composure: 50,
      Empathy: 50,
      Unique: 50,
    };
    setUserTraits(initialState);
    setHistory([initialState]); // Inisialisasi riwayat dengan nilai awal
    setCurrentQIndex(0);
    setStep("quiz");
  };

  const handleAnswer = (value: number) => {
    const question = resonanceQuestions[currentQIndex];
    const multiplier = 10;
    let points = value * multiplier;
    if (question.invert) points = -points;

    setUserTraits((prev) => {
      let newVal = prev[question.trait] + points;
      if (newVal > 100) newVal = 100;
      if (newVal < 0) newVal = 0;

      const newState = { ...prev, [question.trait]: newVal };

      // Simpan state baru ke riwayat
      setHistory((prevHistory) => {
        // Hapus masa depan jika user kembali lalu menjawab pertanyaan baru
        const currentHistory = prevHistory.slice(0, currentQIndex + 1);
        return [...currentHistory, newState];
      });

      return newState;
    });

    if (currentQIndex < resonanceQuestions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      calculateResult();
    }
  };

  const handleUndo = () => {
    if (currentQIndex > 0) {
      const prevIndex = currentQIndex - 1;
      setCurrentQIndex(prevIndex);
      // Pulihkan state ke kondisi sebelum pertanyaan ini dijawab
      setUserTraits(history[prevIndex]);
    }
  };

  const calculateResult = () => {
    // PENTING: Karena setState React bersifat asinkron, kita pakai referensi terakhir
    // Kita anggap userTraits sudah cukup akurat di render terakhir ini untuk perhitungan

    const results = idolPersonalities.map((idol) => {
      let sumOfSquaredDiffs = 0;
      const TRAITS: Trait[] = [
        "Extrovert",
        "Judging",
        "Logic",
        "Confidence",
        "Ambition",
        "Composure",
        "Empathy",
        "Unique",
      ];

      TRAITS.forEach((t) => {
        // PERBAIKAN ALGORITMA: Menggunakan Kuadrat Selisih (Squared Difference)
        // Ini memberikan penalti eksponensial pada perbedaan yang besar,
        // mencegah idol dengan nilai "rata-rata" selalu menang.
        const diff = userTraits[t] - idol.traits[t];
        sumOfSquaredDiffs += diff * diff;
      });

      // Euclidean Distance = Akar dari jumlah kuadrat selisih
      const distance = Math.sqrt(sumOfSquaredDiffs);

      // Max Distance teoritis adalah akar dari (100^2 * 8) = akar(80000) ≈ 282.84
      const maxDistance = Math.sqrt(10000 * 8);

      // Konversi jarak menjadi Persentase Sync Rate
      const syncRate = ((maxDistance - distance) / maxDistance) * 100;

      return { idol, syncRate };
    });

    // Urutkan dari sync rate tertinggi
    results.sort((a, b) => b.syncRate - a.syncRate);
    setTopMatches(results.slice(0, 4));
    setAllMatches(results);
    setStep("result");
  };

  const getCharacterIconUrl = (characterName: string) => {
    let assetName = characterName.toLowerCase().replace(/\s+/g, "");

    if (characterName.toLowerCase() === "snow") {
      assetName = "smiku";
    }
    return `https://apiip.dasewasia.my.id/iconCharacter/chara-${assetName}.png`;
  };

  const saveAsPng = async () => {
    const element = document.getElementById("idolyResonanceResult");
    const scale = 3;
    if (!element) return;
    const originalStyle = {
      height: element.style.height,
      overflow: element.style.overflow,
    };
    try {
      element.style.height = "auto";
      element.style.overflow = "visible";
      const blob = await domtoimage.toBlob(element, {
        width: element.clientWidth * scale,
        height: element.clientHeight * scale,
        quality: 1,
        cacheBust: true,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: element.clientWidth + "px",
          height: element.clientHeight + "px",
        },
        filter: (_node: any) => true,
        imagePlaceholder:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      });
      if (blob) {
        saveAs(blob, `my_resonance.png`);
        setToastMessage("Image saved successfully!");
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setToastMessage("Failed to save image");
      setIsSuccess(false);
    } finally {
      element.style.height = originalStyle.height;
      element.style.overflow = originalStyle.overflow;
    }
  };

  return (
    <div className="min-h-full bg-[#0f1115] text-white flex flex-col items-center justify-center p-4 lg:p-8 font-sans">
      <div
        id="idolyResonanceResult"
        className={`w-full bg-[#161b22] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative transition-all duration-500 mb-16 ${step === "result" ? "max-w-6xl" : "max-w-3xl"}`}
      >
        {/* --- START SCREEN --- */}
        {step === "start" && (
          <div className="px-4 py-6 flex flex-col items-center text-center">
            {/* Tombol Toggle Bahasa */}
            <div className="flex gap-1 bg-[#161b22] p-1 rounded-lg border border-white/10 sm:flex mx-auto w-fit mb-8">
              {(["japanese", "global", "indo"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setPrimaryLanguage(lang)}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    primaryLanguage === lang
                      ? "bg-cyan-600 text-white shadow-lg"
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Globe size={10} />
                    {lang === "japanese"
                      ? "JP"
                      : lang === "global"
                        ? "EN"
                        : "ID"}
                  </span>
                </button>
              ))}
            </div>

            <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center border border-cyan-500/50 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <HeartPulse size={48} className="text-cyan-400" />
            </div>

            <h1 className="text-4xl font-black italic tracking-tighter mb-4 uppercase">
              {uiTranslations[primaryLanguage].title}
            </h1>

            <p className="text-gray-400 max-w-lg mb-8 leading-relaxed">
              {uiTranslations[primaryLanguage].desc}
              <br />
              <span className="text-xs text-gray-500 italic">
                {uiTranslations[primaryLanguage].disclaimer}
              </span>
            </p>

            <button
              onClick={startTest}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-12 rounded-xl shadow-lg transition-transform active:scale-95 tracking-widest"
            >
              {uiTranslations[primaryLanguage].startBtn}
            </button>
          </div>
        )}

        {/* --- QUIZ SCREEN --- */}
        {step === "quiz" && (
          <>
            {/* Tombol Toggle Bahasa */}
            <div className="flex gap-1 bg-[#161b22] p-1 rounded-lg border border-white/10 flex-row mx-auto w-fit my-4 z-10 relative">
              {(["japanese", "global", "indo"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setPrimaryLanguage(lang)}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    primaryLanguage === lang
                      ? "bg-cyan-600 text-white shadow-lg"
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Globe size={10} />
                    {lang === "japanese"
                      ? "JP"
                      : lang === "global"
                        ? "EN"
                        : "ID"}
                  </span>
                </button>
              ))}
            </div>

            <div className="px-6 py-4 md:px-12 md:pb-12 flex flex-col items-center">
              {/* HEADER KUIS & Progress Bar */}
              <div className="flex w-full justify-between items-center mb-8 gap-4">
                {/* Tombol Kembali (Mundur) */}
                <button
                  onClick={handleUndo}
                  disabled={currentQIndex === 0}
                  title={uiTranslations[primaryLanguage].back}
                  className={`flex items-center gap-1 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${
                    currentQIndex === 0
                      ? "text-gray-700 cursor-not-allowed"
                      : "text-cyan-500 hover:text-cyan-400"
                  }`}
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:block">{uiTranslations[primaryLanguage].back}</span>
                </button>

                <div className="flex-1 max-w-sm flex items-center gap-4">
                  <span className="uppercase text-[10px] md:text-xs font-mono text-gray-500 whitespace-nowrap">
                    {uiTranslations[primaryLanguage].phase} {currentQIndex + 1}{" "}
                    / {resonanceQuestions.length}
                  </span>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full transition-all duration-500"
                      style={{
                        width: `${(currentQIndex / resonanceQuestions.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Teks Pertanyaan */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-12 md:mb-16 leading-relaxed min-h-[120px] flex items-center justify-center text-gray-200">
                "{resonanceQuestions[currentQIndex].text[primaryLanguage]}"
              </h2>

              {/* --- KONTROL JAWABAN --- */}
              <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
                {/* Label Kiri & Kanan Terjemahan */}
                <div className="flex justify-between items-center w-full px-2">
                  <span className="text-green-400 font-bold text-xs md:text-sm uppercase tracking-widest">
                    {uiTranslations[primaryLanguage].agree}
                  </span>
                  <span className="text-red-400 font-bold text-xs md:text-sm uppercase tracking-widest">
                    {uiTranslations[primaryLanguage].disagree}
                  </span>
                </div>

                {/* Barisan Tombol */}
                <div className="flex justify-between items-center w-full bg-black/20 p-4 md:p-6 rounded-full border border-white/5">
                  <button
                    onClick={() => handleAnswer(1)}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full border-[5px] md:border-[6px] border-green-500 hover:bg-green-500/20 active:scale-90 transition-all shrink-0"
                  ></button>
                  <button
                    onClick={() => handleAnswer(0.5)}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-full border-4 md:border-[5px] border-green-400 hover:bg-green-400/20 active:scale-90 transition-all shrink-0"
                  ></button>
                  <button
                    onClick={() => handleAnswer(0)}
                    className="w-8 h-8 md:w-12 md:h-12 rounded-full border-[3px] md:border-4 border-gray-500 hover:bg-gray-500/20 active:scale-90 transition-all shrink-0"
                  ></button>
                  <button
                    onClick={() => handleAnswer(-0.5)}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-full border-4 md:border-[5px] border-red-400 hover:bg-red-400/20 active:scale-90 transition-all shrink-0"
                  ></button>
                  <button
                    onClick={() => handleAnswer(-1)}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full border-[5px] md:border-[6px] border-red-500 hover:bg-red-500/20 active:scale-90 transition-all shrink-0"
                  ></button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* --- RESULT SCREEN --- */}
        {step === "result" && topMatches.length > 0 && (
          <div className="flex flex-col lg:flex-row bg-[#0f1115] w-full min-h-[80vh]">
            {/* PANEL KIRI: Top 1 Match (Banner + Radar) */}
            <div className="w-full lg:w-2/5 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-white/10 bg-[#161b22] pt-12 pb-8 px-6 lg:px-10 relative overflow-hidden">
              {/* Efek Cahaya */}
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={100} />
              </div>

              <span className="text-gray-500 font-bold tracking-widest text-xs mb-2 uppercase text-center z-10">
                Your Best Soul Resonance Match
              </span>
              <h1 className="text-5xl lg:text-6xl font-black text-white italic tracking-tighter mb-8 text-center drop-shadow-lg z-10">
                {topMatches[0].idol.name}
              </h1>

              <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-6 bg-gray-800 z-10 relative shrink-0">
                <img
                  src={getCharacterIconUrl(topMatches[0].idol.id)}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>

              <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-xl w-full text-center z-10 mb-8">
                <p className="text-gray-300 text-sm leading-relaxed mb-4 font-bold">
                  "{topMatches[0].idol.desc[primaryLanguage]}"
                  <br />
                  <br />
                  <span className="font-normal text-sm">
                    {topMatches[0].idol.idolDesc[primaryLanguage]}
                  </span>
                </p>
                <span className="inline-block bg-cyan-900/30 text-cyan-400 px-4 py-1.5 rounded font-bold uppercase tracking-wider text-xs border border-cyan-500/30">
                  MBTI: {topMatches[0].idol.mbti}
                </span>
              </div>

              {/* Radar Chart Khusus Top 1 */}
              <div className="w-full bg-[#0f1115] rounded-2xl p-4 md:p-6 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)] z-10">
                <div className="text-center mb-2">
                  <span className="text-cyan-400 font-bold text-base">
                    Sync Rate {topMatches[0].syncRate.toFixed(1)}%
                  </span>
                </div>
                <RadarChart
                  userTraits={userTraits}
                  idolTraits={topMatches[0].idol.traits}
                  idolThemeColor={topMatches[0].idol.themeColor}
                />
              </div>
            </div>

            {/* PANEL KANAN: Top 2, 3, 4 (Runner Ups) */}
            <div className="w-full lg:w-3/5 p-6 md:p-10 bg-[#0f1115] flex flex-col h-full">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h3 className="flex-1 text-center lg:text-left text-sm font-bold text-gray-400 tracking-widest uppercase flex items-center justify-center lg:justify-start gap-2">
                  <Sparkles size={16} /> Other High Resonance Matches
                </h3>

                <div className="flex flex-col gap-4 lg:items-end items-center">
                  {/* Tombol Toggle Bahasa */}
                  <div className="flex gap-1 bg-[#161b22] p-1 rounded-lg border border-white/10 sm:flex justify-end w-fit">
                    {(["japanese", "global", "indo"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setPrimaryLanguage(lang)}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                          primaryLanguage === lang
                            ? "bg-cyan-600 text-white shadow-lg"
                            : "text-gray-500 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <Globe size={10} />
                          {lang === "japanese"
                            ? "JP"
                            : lang === "global"
                              ? "EN"
                              : "ID"}
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* Tombol Retake dipindah ke atas kanan di desktop agar mudah dijangkau */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => setShowAllMatches(true)}
                      className="flex items-center justify-center gap-2 text-blue-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider border border-blue-700 hover:border-blue-500 px-4 py-2 rounded-lg bg-[#161b22]"
                    >
                      <List size={14} /> View All
                    </button>
                    <button
                      onClick={startTest}
                      className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg bg-[#161b22]"
                    >
                      <RefreshCcw size={14} /> Retake
                    </button>
                    <button
                      onClick={saveAsPng}
                      className="flex items-center justify-center gap-2 text-green-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider border border-green-700 hover:border-green-500 px-4 py-2 rounded-lg bg-[#161b22]"
                    >
                      <Save size={14} /> Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable list untuk 3 idol sisa */}
              <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                {/* Hanya melakukan map dari urutan ke-2 (index 1) sampai akhir */}
                {topMatches.slice(1).map((match, idx) => (
                  <div
                    key={idx}
                    className="bg-[#161b22] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center"
                  >
                    <div className="w-full md:w-1/3 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-4">
                      <div className="flex items-center md:items-start gap-4 md:flex-col">
                        <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-lg bg-gray-800 text-gray-400 shrink-0">
                          {/* Angka peringkat 2, 3, 4 */}
                          {idx + 2}
                        </div>
                        <img
                          src={getCharacterIconUrl(match.idol.id)}
                          className="w-16 h-16 rounded-full border border-white/20 hidden md:block"
                          crossOrigin="anonymous"
                        />
                      </div>

                      <div className="text-right md:text-left mt-0 md:mt-4">
                        <h4 className="font-bold text-xl mb-1">
                          {match.idol.name}
                        </h4>
                        <span className="text-xs text-gray-400 font-mono inline-block bg-white/5 px-2 py-1 rounded">
                          Sync Rate {match.syncRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full md:w-2/3">
                      <RadarChart
                        userTraits={userTraits}
                        idolTraits={match.idol.traits}
                        idolThemeColor={match.idol.themeColor}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- TAMBAHKAN KODE MODAL ALL MATCHES DI SINI --- */}
      {showAllMatches && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 backdrop-blur-sm my-8 lg:mt-16">
          <div className="bg-[#161b22] border border-white/10 w-full max-w-4xl h-[80vh] md:h-[85vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
            {/* Header Modal */}
            <div className="px-10 py-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-transparent">
              <div>
                <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">
                  All Resonance Matches
                </h2>
                <p className="text-xs text-gray-400 font-mono tracking-widest mt-1">
                  FULL DATABASE SYNC RATES
                </p>
              </div>
              <button
                onClick={() => setShowAllMatches(false)}
                className="p-2 bg-gray-800 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition border border-gray-700 hover:border-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tombol Toggle Bahasa */}
            <div className="flex gap-1 bg-[#161b22] p-1 rounded-lg border border-white/10 sm:flex mx-auto w-fit my-4">
              {(["japanese", "global", "indo"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setPrimaryLanguage(lang)}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    primaryLanguage === lang
                      ? "bg-cyan-600 text-white shadow-lg"
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Globe size={10} />
                    {lang === "japanese"
                      ? "JP"
                      : lang === "global"
                        ? "EN"
                        : "ID"}
                  </span>
                </button>
              ))}
            </div>

            {/* List Karakter */}
            <div className="overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 scrollbar-thin scrollbar-thumb-gray-700">
              {allMatches.map((match, idx) => (
                <div
                  key={idx}
                  /* PERBAIKAN: Tambahkan min-w-0 agar flexbox tidak dipaksa melebar oleh RadarChart */
                  className="bg-[#0f1115] border border-white/5 rounded-xl p-4 flex flex-col hover:border-blue-500/50 transition-colors group min-w-0"
                >
                  <div className="gap-4 flex flex-col w-full">
                    <section className="flex items-center gap-3 md:gap-4">
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm shrink-0 ${idx === 0 ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-400"}`}
                      >
                        {idx + 1}
                      </div>
                      <img
                        src={getCharacterIconUrl(match.idol.id)}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/10 group-hover:border-blue-400 transition-colors bg-gray-900 shrink-0"
                        crossOrigin="anonymous"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base md:text-lg truncate group-hover:text-blue-300 transition-colors">
                          {match.idol.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-gray-300 shrink-0">
                            {match.idol.mbti}
                          </span>
                          <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-wider shrink-0">
                            SYNC: {match.syncRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </section>

                    <section className="flex">
                      <div className="bg-white/5 border border-white/10 px-4 py-4 rounded-xl w-full text-center z-10">
                        <p className="text-gray-300 text-xs md:text-sm leading-relaxed font-bold whitespace-pre-wrap">
                          "{match.idol.desc[primaryLanguage]}"
                          <br />
                          <br />
                          <span className="font-normal text-xs md:text-sm">
                            {match.idol.idolDesc[primaryLanguage]}
                          </span>
                        </p>
                      </div>
                    </section>

                    {/* PERBAIKAN RADAR: Pastikan w-full overflow-hidden agar SVG bisa me-resize diri */}
                    <div className="w-full md:w-2/3 mx-auto flex justify-center overflow-hidden">
                      <RadarChart
                        userTraits={userTraits}
                        idolTraits={match.idol.traits}
                        idolThemeColor={match.idol.themeColor}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          isSuccess={isSuccess}
          onClose={() => setToastMessage("")}
        />
      )}
    </div>
  );
};

export default SoulResonancePage;
