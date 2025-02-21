import React, { useState, useEffect } from "react";
import { Character } from "../interfaces/Character";
import { QnASource } from "../interfaces/QnA";

interface SourceWithCharacter extends QnASource {
  key: string;
  familyName: string;
  icon: string;
  character: Character | null;
}

const matchWithCharacters = (
  qnaSources: QnASource[],
  characters: Character[]
): SourceWithCharacter[] =>
  qnaSources.map((source) => {
    const matchedCharacter = characters.find(
      (char) => char.name.toLowerCase() === source.name.toLowerCase()
    );
    return {
      key: source.name, // Tambahkan key
      name: source.name,
      data: source.data,
      familyName: matchedCharacter?.familyName || "Unknown", // Tambahkan familyName
      icon:
        matchedCharacter?.icon ||
        `${import.meta.env.BASE_URL}assets/icon/chara-avatar.webp`, // Tambahkan icon
      character: matchedCharacter || null, // Tambahkan character
    };
  });

const QnAPage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [qnaSources, setQnaSources] = useState<QnASource[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charactersRes, qnaRes] = await Promise.all([
          fetch("https://www.diveidolypapi.my.id/api/characters"),
          fetch("https://www.diveidolypapi.my.id/api/qnas"),
        ]);

        if (!charactersRes.ok || !qnaRes.ok) {
          throw new Error("Gagal mengambil data");
        }

        const charactersData = await charactersRes.json();
        const qnaData = await qnaRes.json();

        // Pastikan qnaData adalah array
        const formattedQnaData: QnASource[] = Array.isArray(qnaData)
          ? qnaData.map((qna) => ({
              name: qna.name,
              data: Array.isArray(qna.data) ? qna.data : [],
            }))
          : [];

        setCharacters(charactersData);
        setQnaSources(formattedQnaData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const formatText = (text: string) => text.replace(/--/g, "—");

  const generateIds = (data: any[]) =>
    data.map((item, index) => ({ ...item, id: index + 1 }));

  const sources = matchWithCharacters(
    qnaSources.map((source) => ({
      ...source,
      data: generateIds(source.data),
    })),
    characters
  );

  const [activeSource, setActiveSource] = useState<SourceWithCharacter | null>(
    null
  );

  useEffect(() => {
    if (sources.length > 0 && !activeSource) {
      setActiveSource(sources[0]); // Set activeSource hanya jika belum di-set
    }
  }, [sources, activeSource]); // Jalankan hanya saat sources atau activeSource berubah

  const activeData = activeSource?.data || [];

  const handleSourceChange = (sourceKey: string) => {
    const selectedSource = sources.find((source) => source.key === sourceKey);
    if (selectedSource) {
      setActiveSource(selectedSource); // Update activeSource dengan objek sumber yang dipilih
    }
  };

  const handleBackClick = () => {
    window.history.back();
  };

  return (
    <>
      <div className="h-screen bg-slate-400 flex flex-col items-center p-4">
        <section
          id="leftConsole"
          className="flex flex-col absolute top-2 left-2 gap-4 w-1/4"
        >
          <div className="flex items-center gap-4">
            <button
              className="px-4 py-2 bg-gray-300 hover:bg-gray-800 rounded-md hover:text-white font-semibold"
              onClick={handleBackClick}
            >
              {"<"}
            </button>
          </div>
        </section>
        <section
          id="content"
          className="p-4 flex flex-col gap-4 h-full w-full pl-10"
        >
          <div className="flex items-center gap-4 ml-2">
            <img
              className="flex w-20 h-20 rounded-full"
              src={
                sources.length > 0
                  ? `https://api.diveidolypapi.my.id/iconCharacter/chara-${activeSource?.name.toLowerCase()}.png`
                  : "" // Fallback jika sources masih kosong
              }
              alt=""
            />
            <div>
              <h3 className="text-xl font-bold">{`${activeSource?.name}'s QnA`}</h3>
              <p className="text-lg">
                Family Name: {activeSource?.familyName || "Unknown"}
              </p>
              {activeSource?.name === "Suzu" && (
                <p className="italic">
                  Note: They refer to her by her surname, as a sign of respect,
                  due to her being from a prestigious family.
                </p>
              )}
              {activeSource?.name === "Rui" && (
                <p className="italic">"I look forward to working with you."</p>
              )}
            </div>
          </div>
          <ul className="h-full overflow-y-auto no-scrollbar">
            {activeData.map((item, index) => (
              <li
                key={index}
                className="w-2/3 hover:w-[90%] hover:bg-blue-300 mb-2 bg-white p-2 duration-300 ease-in-out rounded-r-lg"
              >
                <h4 className="font-semibold">{formatText(item.question)}</h4>
                <p className="italic">{item.reply}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Pemilihan sumber bacaan */}
        <div
          id="chooseSources"
          className="flex flex-col gap-2 overflow-y-auto h-4/5 no-scrollbar absolute right-4"
        >
          {sources.map((source) => (
            <button
              key={source.key}
              onClick={() => handleSourceChange(source.key)}
              className={`px-4 py-2 rounded-md ${
                activeSource?.key === source.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300"
              }`}
            >
              {source.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default QnAPage;
