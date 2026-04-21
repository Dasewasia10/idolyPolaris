import React, { useState, useEffect } from "react";
import { Globe, Users, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
// resonanceData からアイドルデータを取得してメンバーアイコンとスプライトを自動表示させます
import { idolPersonalities } from "../data/resonanceData";

// 画像取得ユーティリティ（既存のものと同じロジック）
const getCharacterImageUrl = (
  characterName: string,
  type: "icon" | "sprite1" | "sprite2" | "banner",
) => {
  const baseUrl = "https://apiip.dasewasia.my.id";
  const formattedName = encodeURIComponent(characterName.toLowerCase());

  switch (type) {
    case "icon":
      return `${baseUrl}/iconCharacter/chara-${formattedName}.png`;
    case "banner":
      return `${baseUrl}/bannerCharacter/banner-${formattedName}.webp`;
    case "sprite1":
      return `${baseUrl}/spriteCharacter/sprite-${formattedName}-01.webp`;
    case "sprite2":
      return `${baseUrl}/spriteCharacter/sprite-${formattedName}-02.webp`;
    default:
      return "";
  }
};

const getIdolGroupUrl = (groupName: string) => {
  return `https://apiip.dasewasia.my.id/idolGroup/group-${groupName}-circle.png`;
};

// --- グループの公式ロアデータ（3ヶ国語対応） ---
const groupLoreData = [
  {
    id: "sunnyp",
    name: "Sunny Peace",
    themeColor: "#F69941",
    desc: {
      japanese:
        "太陽のような眩しさで観客を自然と笑顔にする、光溢れるアイドルグループ。\n\n「明るく楽しい」点に注目が集まりやすいが、川咲さくらの歌唱力、一ノ瀬怜のダンススキルといった実力面での評価も高い。アイドル歴が長く安定感を高める佐伯遙子、守りたくなるようなキュートさが魅力の白石千紗や、豊富なアイドル知識を武器にする兵藤雫など、それぞれの個性がより魅力を高めている。\n\n昼を司る太陽の光は、どんな空でも明るく照らす。",
      global:
        "An idol group overflowing with light that naturally brings smiles to the audience with a dazzling brightness like the sun.\n\nWhile their \"bright and fun\" aspect draws attention, they are also highly evaluated for their abilities, such as Sakura Kawasaki's singing ability and Rei Ichinose's dance skills. Haruko Saeki, who enhances stability with her long history as an idol, Chisa Shiraishi, whose charm is her protective cuteness, and Shizuku Hyodo, who uses her abundant idol knowledge as a weapon; each individuality enhances their charm.\n\nThe light of the sun that rules the day illuminates any sky brightly.",
      indo: 'Grup idol penuh cahaya yang secara alami membawa senyuman kepada penonton dengan kilau seperti matahari.\n\nMeski aspek "cerah dan menyenangkan" mereka mudah menarik perhatian, mereka juga sangat dihargai karena kemampuan mereka, seperti kemampuan bernyanyi Sakura Kawasaki dan keterampilan menari Rei Ichinose. Haruko Saeki yang memberikan stabilitas dengan pengalamannya, Chisa Shiraishi yang daya tariknya adalah kelucuan yang membuat orang ingin melindunginya, dan Shizuku Hyodo yang menggunakan pengetahuan idolnya sebagai senjata; masing-masing kepribadian meningkatkan daya tarik mereka.\n\nCahaya matahari yang menguasai siang hari menerangi langit mana pun dengan cerah.',
    },
  },
  {
    id: "tsukisto",
    name: "Tsuki no Tempest",
    themeColor: "#5C88DA",
    desc: {
      japanese:
        "夜闇に輝く月のように静謐な存在感と、嵐のような激しい闘志を持つ五人組。\n\nどこか儚さを感じさせる楽曲と、パワフルなダンスパフォーマンスが存在感を放つ。長瀬琴乃・伊吹渚による息のあったダンス、正確無比な白石沙季の技術力が軸となっている。加えて、成宮すずの観客を盛り上げるスキルや早坂芽衣の無邪気な姿と、クールなパフォーマンス姿のギャップも見逃せない。\n\n夜を司る月の引力は、大きな嵐を巻き起こす。",
      global:
        "A five-member group with a tranquil presence like the moon shining in the dark night and a fierce fighting spirit like a storm.\n\nTheir somewhat ephemeral songs and powerful dance performances exude a strong presence. The synchronized dance by Kotono Nagase and Nagisa Ibuki, and the unparalleled technical skills of Saki Shiraishi serve as their core. In addition, Suzu Narumiya's skill to hype up the audience and the gap between Mei Hayasaka's innocent nature and cool performance cannot be missed.\n\nThe gravitational pull of the moon that rules the night stirs up a massive storm.",
      indo: "Grup beranggotakan lima orang dengan kehadiran tenang seperti bulan yang bersinar di kegelapan malam dan semangat bertarung yang sengit layaknya badai.\n\nLagu-lagu mereka yang agak fana dan penampilan tarian yang kuat memancarkan kehadiran yang luar biasa. Tarian yang sinkron dari Kotono Nagase dan Nagisa Ibuki, serta keterampilan teknis Saki Shiraishi yang tak tertandingi menjadi inti mereka. Selain itu, keterampilan Suzu Narumiya untuk memeriahkan penonton dan celah antara sifat polos Mei Hayasaka dan penampilannya yang keren tidak boleh dilewatkan.\n\nTarikan gravitasi bulan yang menguasai malam membangkitkan badai besar.",
    },
  },
  {
    id: "triaile",
    name: "TRINITYAiLE",
    themeColor: "#FFD700", // Gold-ish
    desc: {
      japanese:
        "TRINITYAiLEとは”三つの翼”の意。\n\n「百年に一人の天才」と言わしめる絶対的センター・天動瑠依を筆頭に、京都弁の参謀・鈴村優、元トップ子役・奥山すみれによる完全無欠なパフォーマンスは必見。すでに新人では異例の知名度を誇るが、三人の見据える空は遥かに高い。\n\n彼女たちの翼はさらなる高みへと、羽ばたいていく。",
      global:
        'TRINITYAiLE means "three wings".\n\nLed by the absolute center Rui Tendo, hailed as a "once-in-a-century genius," the flawless performances by the Kyoto-dialect strategist Yuu Suzumura and former top child actress Sumire Okuyama are a must-see. Although they already boast exceptional popularity for rookies, the sky the three look toward is much higher.\n\nTheir wings will flap to even greater heights.',
      indo: 'TRINITYAiLE berarti "tiga sayap".\n\nDipimpin oleh center mutlak Rui Tendo, yang dipuji sebagai "jenius sekali dalam seratus tahun," penampilan tanpa cela oleh ahli strategi beraksen Kyoto Yuu Suzumura dan mantan aktris cilik papan atas Sumire Okuyama wajib disaksikan. Meskipun mereka sudah memiliki popularitas yang luar biasa untuk ukuran pendatang baru, langit yang dipandang ketiganya jauh lebih tinggi.\n\nSayap mereka akan mengepak ke tingkat yang lebih tinggi lagi.',
    },
  },
  {
    id: "liznoir",
    name: "LizNoir",
    themeColor: "#AE5287",
    desc: {
      japanese:
        "比類なきパフォーマンスで魅了する四人組グループ。\n\n力強い楽曲をベースに、震天動地の熱い空間をつくりあげる。口数少なく、アグレッシブなスタイルを信条とする神崎莉央・井川葵と、会場全体のテンションを上げる小美山愛・赤崎こころのギャップは唯一無二。\n\nステージに咲く四輪の“LizNoir”は、美しく咲き誇る。",
      global:
        'A four-member group that captivates with unparalleled performances.\n\nBased on powerful songs, they create an earth-shattering, heated atmosphere. The gap between Rio Kanzaki and Aoi Igawa, who speak little and believe in an aggressive style, and Ai Komiyama and Kokoro Akazaki, who raise the tension of the entire venue, is one-of-a-kind.\n\nThe four "LizNoir" blooming on stage bloom beautifully.',
      indo: 'Grup beranggotakan empat orang yang memikat dengan penampilan tak tertandingi.\n\nBerbasis pada lagu-lagu yang kuat, mereka menciptakan suasana panas yang mengguncang bumi. Perbedaan antara Rio Kanzaki dan Aoi Igawa, yang sedikit bicara dan percaya pada gaya agresif, serta Ai Komiyama dan Kokoro Akazaki, yang meningkatkan ketegangan seluruh tempat, adalah satu-satunya di dunia.\n\nKeempat "LizNoir" yang mekar di atas panggung akan mekar dengan indah.',
    },
  },
  {
    id: "iiix",
    name: "IIIX",
    themeColor: "#474744",
    desc: {
      japanese:
        "アイドル界に突如現れた新生。\n\nすでに圧倒的知名度を誇る3人がグループを結成し、またたく間に業界を席巻。世代を超えて愛されるトップモデルのfran、中高生から圧倒的な支持を得るkana、そして第13回NEXT VENUSグランプリの覇者mihoによるドリームグループ。\n\nアイドルらしからぬパワフルな楽曲と、他を寄せ付けない圧倒的なカリスマ性でアイドル界を新時代へ導いてゆく。",
      global:
        "A supernova that suddenly appeared in the idol world.\n\nThree individuals who already boasted overwhelming popularity formed a group and swept the industry in the blink of an eye. A dream group consisting of top model fran, loved across generations, kana, who has overwhelming support from middle and high school students, and miho, the champion of the 13th NEXT VENUS Grand Prix.\n\nWith powerful songs uncharacteristic of idols and unapproachable, overwhelming charisma, they lead the idol world into a new era.",
      indo: "Supernova yang tiba-tiba muncul di dunia idol.\n\nTiga individu yang sudah membanggakan popularitas luar biasa membentuk grup dan menyapu industri dalam sekejap mata. Grup impian yang terdiri dari model top fran, dicintai lintas generasi; kana, yang mendapat dukungan luar biasa dari siswa SMP dan SMA; dan miho, juara NEXT VENUS Grand Prix ke-13.\n\nDengan lagu-lagu kuat yang tidak biasa bagi idol dan karisma luar biasa yang tidak dapat didekati, mereka memimpin dunia idol ke era baru.",
    },
  },
  {
    id: "mana",
    name: "Mana Nagase",
    themeColor: "#F252B0",
    desc: {
      japanese:
        "グループが主流となったアイドル界に、彗星の如く現れたソロアイドル。\n\nなによりファンを思いやり、常に過去の自分を超えるパフォーマンスを見せる。誰もが一度見たら忘れられない、人を惹きつける力をもっている。\n\n歴史に名を刻む「星降る奇跡」は、最高峰を見据えている。",
      global:
        'A solo idol who appeared like a comet in an idol world where groups became mainstream.\n\nShe cares for her fans above all else and always shows performances that exceed her past self. She possesses a power to attract people that no one can forget once they see it.\n\nThe "Miracle of Falling Stars" whose name is etched in history looks toward the highest peak.',
      indo: 'Idol solo yang muncul seperti komet di dunia idol di mana grup menjadi arus utama.\n\nDia peduli pada penggemarnya di atas segalanya dan selalu menunjukkan penampilan yang melampaui masa lalunya. Dia memiliki kekuatan untuk menarik orang yang tidak akan bisa dilupakan siapa pun setelah melihatnya.\n\n"Keajaiban Bintang Jatuh" yang namanya terukir dalam sejarah menatap ke puncak tertinggi.',
    },
  },
];

const GroupDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [primaryLanguage, setPrimaryLanguage] = useState<
    "japanese" | "global" | "indo"
  >("global");

  const activeGroup = groupLoreData[activeGroupIndex];

  // resonanceData.ts から現在のグループに所属するメンバーを抽出
  const members = idolPersonalities.filter(
    (idol) => idol.group === activeGroup.name,
  );

  // ページタイトル更新
  useEffect(() => {
    document.title = `Polaris Idoly | ${activeGroup.name}`;
  }, [activeGroup]);

  return (
    <div className="min-h-full bg-[#0f1115] text-white p-4 lg:p-8 font-sans relative selection:bg-cyan-500 overflow-hidden">
      {/* Background Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Dynamic Background Glow based on Group Color */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 pointer-events-none z-0 transition-colors duration-1000"
        style={{ backgroundColor: activeGroup.themeColor }}
      ></div>

      <div className="max-w-[1600px] mx-auto h-full flex flex-col relative z-10 pb-16 lg:pb-0">
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-[#161b22] border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <span className="text-[10px] text-cyan-500 font-bold tracking-[0.2em] uppercase block">
                Database Archive
              </span>
              <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white">
                GROUP{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  PROFILES&nbsp;
                </span>
              </h1>
            </div>
          </div>

          <div className="flex gap-1 bg-[#161b22] p-1 rounded-lg border border-white/10 shrink-0">
            {(["japanese", "global", "indo"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setPrimaryLanguage(lang)}
                className={`px-3 md:px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                  primaryLanguage === lang
                    ? "bg-cyan-600 text-white shadow-lg"
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Globe size={10} />
                  {lang === "japanese" ? "JP" : lang === "global" ? "EN" : "ID"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* GROUP SELECTOR TABS */}
        <div className="lg:absolute z-50 flex flex-wrap gap-2 mb-10 justify-center lg:justify-end lg:right-4 lg:top-24 lg:max-w-96">
          {groupLoreData.map((group, index) => (
            <button
              key={group.id}
              onClick={() => setActiveGroupIndex(index)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
                activeGroupIndex === index
                  ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  : "bg-[#161b22] text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              {group.name}
            </button>
          ))}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch lg:max-h-[40vh] z-20">
          {/* LEFT PANEL: TEXT & ICONS */}
          <div className="lg:col-span-7 flex flex-col bg-[#161b22]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden h-fit">
            {/* Top Accent Line */}
            <div
              className="absolute top-0 left-0 w-full h-2 transition-colors duration-1000"
              style={{ backgroundColor: activeGroup.themeColor }}
            ></div>

            <div className="flex items-center gap-6 mb-8">
              <img
                src={getIdolGroupUrl(activeGroup.id)}
                alt={`${activeGroup.name} Logo`}
                className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-xl"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div>
                <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white drop-shadow-md">
                  {activeGroup.name}
                </h2>
              </div>
            </div>

            <div className="flex mb-4">
              <p className="text-gray-300 text-sm md:text-base leading-loose whitespace-pre-wrap font-medium">
                {activeGroup.desc[primaryLanguage]}
              </p>
            </div>

            {/* MEMBER ICONS (Desktop & Mobile) */}
            <div className="pt-8 border-t border-white/10">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users size={14} /> Affiliated Members
              </h3>
              <div className="flex flex-wrap gap-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full p-[2px] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] -mr-8"
                      style={{
                        background: `linear-gradient(to bottom right, ${activeGroup.themeColor}, transparent)`,
                      }}
                    >
                      <img
                        src={getCharacterImageUrl(member.id, "icon")}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover bg-gray-900"
                        crossOrigin="anonymous"
                      />
                    </div>
                    {/* <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">
                      {member.name.split(" ")[0]}{" "}
                    </span> */}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: SPRITES */}
          <div className="hidden lg:col-span-5 lg:flex relative items-end justify-center overflow-visible">
            <div className="flex items-end justify-center w-full h-[75vh] relative">
              {members.map((member, idx) => {
                const isCenter = idx === Math.floor(members.length / 2);
                const zIndex = isCenter
                  ? 50
                  : 40 - Math.abs(idx - Math.floor(members.length / 2));

                // Karena kita akan memperbesar gambar, margin negatif harus disesuaikan
                // agar antar karakter tetap ada tumpang tindih yang pas.
                const marginClass =
                  idx === 0 ? "" : "-ml-[15rem] xl:-ml-[12rem]";

                return (
                  <div
                    key={member.id}
                    className={`relative h-full w-[500px] overflow-hidden flex items-end justify-center ${marginClass}`}
                    style={{ zIndex: zIndex }}
                  >
                    <img
                      src={getCharacterImageUrl(member.id, "sprite2")}
                      alt={member.name}
                      className="h-full w-auto max-w-none object-cover object-center -translate-y-[5%] drop-shadow-2xl transition-all duration-500 scale-[0.8] hover:scale-100 origin-bottom"
                      crossOrigin="anonymous"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailPage;
