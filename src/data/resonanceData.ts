// src/data/resonanceData.ts

export type Trait =
  | "Extrovert"
  | "Judging"
  | "Logic"
  | "Confidence"
  | "Ambition"
  | "Composure"
  | "Empathy"
  | "Unique";

export interface LocalizedText {
  japanese: string;
  global: string;
  indo: string;
}

export interface IdolPersonality {
  id: string;
  name: string;
  group: string;
  mbti: string;
  desc: LocalizedText;
  idolDesc: LocalizedText;
  traits: Record<Trait, number>;
  themeColor: string;
}

// ==============================================
// Data Karakter Lengkap Idoly Pride (Optimized for Euclidean Distance)
// ==============================================
export const idolPersonalities: IdolPersonality[] = [
  // --- TSUKI NO TEMPEST ---
  {
    id: "kotono",
    name: "Kotono Nagase",
    group: "Tsuki no Tempest",
    mbti: "ISTJ",
    desc: {
      japanese: "真面目で努力家。プロ意識を保ち、憧れの人の影を追うために、しばしば自分の感情を隠します。",
      global: "Serious and hardworking. You often hide your feelings to maintain professionalism and chase the shadow of the person you admire.",
      indo: "Serius dan pekerja keras. Kamu sering menyembunyikan perasaanmu demi menjaga profesionalitas dan mengejar bayang-bayang sosok yang kamu kagumi."
    },
    idolDesc: {
      japanese: "大きな後悔を背負い戦う、孤独なアイドル。\n元々友人が多いタイプではないが、数年前のある出来事をきっかけに、さらに人との関わりを断つようになる。\n以降、一心不乱にアイドルを目指し、ひとりで練習に励むようになる。",
      global: "A girl who aspired to become an idol, inheriting the will of her older sister, Mana Nagase. At the time of the group's formation, she often isolated herself by avoiding communication with others. However, she grew through overcoming hardships with her fellow members and is now a leading presence among them.",
      indo: "Mewarisi tekad mendiang kakaknya, Mana Nagase, ia bertarung memikul penyesalan besar sebagai idol yang kesepian. Awalnya, sebuah insiden di masa lalu membuatnya menutup diri dan berlatih sendirian dalam diam. Namun, melewati berbagai rintangan bersama rekan-rekannya telah mengubahnya menjadi sosok pemimpin yang tangguh bagi grupnya."
    },
    // Kotono: Sangat Judging, Ambisius, namun rendah di Unique (karena mengejar bayang-bayang kakaknya)
    traits: { Extrovert: 20, Judging: 95, Logic: 80, Confidence: 40, Ambition: 90, Composure: 75, Empathy: 55, Unique: 15 },
    themeColor: "#5C88DA",
  },
  {
    id: "nagisa",
    name: "Nagisa Ibuki",
    group: "Tsuki no Tempest",
    mbti: "ISFJ",
    desc: {
      japanese: "とても協力的で思いやりのある親友。他人のことを深く気遣いますが、自分の能力に自信を持てないこともあります。",
      global: "A highly supportive and attentive best friend. You care deeply about others, though sometimes you lack confidence in your own abilities.",
      indo: "Sahabat yang sangat suportif dan penuh perhatian. Kamu sangat peduli pada orang lain, meski terkadang kurang percaya diri dengan kemampuanmu sendiri."
    },
    idolDesc: {
      japanese: "友を想いアイドルを志した優しき少女。\n朗らかな笑顔で周囲を包み込む。自分に正直な琴乃の姿に惹かれ、ふたりは親友となった。\nそんな琴乃をサポートしたいと思い、アイドルを志した。",
      global: "A girl who became an idol to support her best friend, Kotono. She has a rich imagination and sometimes shows unexpected curiosity. Although she once lost confidence due to her lack of strengths as an idol, she continues to push forward daily, drawing strength from her desire to support Kotono.",
      indo: "Seorang gadis lembut yang terjun ke dunia idol murni untuk mendukung sahabat terbaiknya, Kotono, yang kejujurannya sangat ia kagumi. Senyum cerianya selalu menghangatkan orang di sekitarnya. Walau sempat kehilangan kepercayaan diri karena merasa tak memiliki kelebihan sebagai idol, keinginannya untuk terus mendukung Kotono menjadi sumber kekuatan terbesarnya."
    },
    // Nagisa: Sangat Empati, Sangat rendah Confidence dan Logic (lebih pakai perasaan)
    traits: { Extrovert: 50, Judging: 75, Logic: 15, Confidence: 15, Ambition: 40, Composure: 60, Empathy: 95, Unique: 30 },
    themeColor: "#F56D9E",
  },
  {
    id: "saki",
    name: "Saki Shiraishi",
    group: "Tsuki no Tempest",
    mbti: "ENFJ",
    desc: {
      japanese: "頼りになる「お姉さん」のような存在。グループの力学にとても敏感で、常に周囲に調和をもたらそうと努めています。",
      global: "A reliable 'older sister' figure. You are very sensitive to group dynamics and always strive to create harmony around you.",
      indo: "Sosok 'kakak' yang bisa diandalkan. Kamu sangat peka terhadap dinamika kelompok dan selalu berusaha menciptakan harmoni di sekitarmu."
    },
    idolDesc: {
      japanese: "妹想いで真面目に生きてきた、頭脳明晰な少女。絵に描いたような優等生で、学校では生徒会長も務める。\nそんな彼女が初めて、優等生な生き方から脱却すべく自ら憧れの世界へ飛び込む。",
      global: "An exemplary student who also serves as the student council president at school and acts as the organizer of Moon Tempest. In the past, she struggled with her overprotectiveness toward her younger sister, Chisa, but now, they trust each other and walk their respective paths.",
      indo: "Seorang siswi teladan yang brilian, organisator sejati, dan ketua OSIS di sekolahnya. Terdorong oleh rasa sayang yang besar pada adiknya, Chisa, ia memutuskan untuk keluar dari zona nyamannya yang serba sempurna dan melompat ke dunia yang ia kagumi. Kini, ia belajar untuk mempercayai sang adik dan berjalan di jalurnya sendiri."
    },
    // Saki: Sangat Judging (Terencana), Empati tinggi, Composure tinggi (Bisa diandalkan)
    traits: { Extrovert: 80, Judging: 90, Logic: 65, Confidence: 75, Ambition: 70, Composure: 85, Empathy: 90, Unique: 40 },
    themeColor: "#6ACEB9",
  },
  {
    id: "suzu",
    name: "Suzu Narumiya",
    group: "Tsuki no Tempest",
    mbti: "ENFP",
    desc: {
      japanese: "エキセントリックでエレガントな少女！非常に高い自信を持ち、常に自分の個性を世界に示したいと思っています。",
      global: "An eccentric elegant girl! You have incredibly high self-confidence and always want to show your uniqueness to the world.",
      indo: "Gadis elegan yang eksentrik! Kamu punya kepercayaan diri yang luar biasa tinggi dan selalu ingin menunjukkan keunikanmu pada dunia."
    },
    idolDesc: {
      japanese: "ドジでいじられやすいお嬢様。生意気で高飛車な態度が目立つが、不思議と不快感を与えず周囲からは温かく見守られている。\nあるトラブルから、半ば逃げるように星見プロダクションを訪れる。",
      global: "A clumsy, easily teased young lady who adores Mana. Pressured by her parents to study abroad, she visited the agency as if escaping. Later, she overcame her tendency to run away, gained her parents' approval to continue her activities, and now plays a significant role in energizing Hoshimi Production.",
      indo: "Seorang nona besar yang ceroboh dan mudah dijahili. Sikapnya yang terkadang angkuh dan sombong anehnya tidak membuat orang kesal, melainkan justru mengundang kehangatan. Berawal dari pelariannya ke agensi untuk menghindari tekanan orang tuanya agar sekolah ke luar negeri, ia kini berhasil membuktikan tekadnya dan menjadi sumber energi utama di Hoshimi Production."
    },
    // Suzu: Sangat Unique, Extrovert tinggi, Judging sangat rendah (Spontan/Kabur)
    traits: { Extrovert: 85, Judging: 10, Logic: 25, Confidence: 90, Ambition: 65, Composure: 30, Empathy: 75, Unique: 100 },
    themeColor: "#F2EE56",
  },
  {
    id: "mei",
    name: "Mei Hayasaka",
    group: "Tsuki no Tempest",
    mbti: "ESFP",
    desc: {
      japanese: "自由で自発的、そして少しおっちょこちょい。あなたの存在は常に周りの人々に喜びと笑いをもたらします。",
      global: "Free, spontaneous, and slightly clumsy. Your presence always brings joy and laughter to those around you.",
      indo: "Bebas, spontan, dan sedikit ceroboh. Kehadiranmu selalu membawa keceriaan dan tawa bagi orang-orang di sekitarmu."
    },
    idolDesc: {
      japanese: "何をしでかすか予測不能で無邪気な少女。\n直感に従って生きており、誰に対しても臆さず接する反面、人を思いやり、心を寄せることができる優しさを併せ持つ。",
      global: "A carefree and unpredictable girl who lives by following her intuition. She joined the agency simply because it 'seemed fun.' However, after being deeply impressed by Mana's attitude as an idol, she became serious about aiming to be like her.",
      indo: "Gadis polos yang bertindak berdasarkan intuisinya dan tak bisa ditebak kelakuannya. Ia bergabung dengan agensi hanya karena merasa 'itu terlihat menyenangkan'. Di balik sifatnya yang tak kenal takut, ia menyimpan kelembutan hati yang tulus. Setelah melihat keteguhan Mana sebagai idol, pandangannya berubah dan ia mulai serius mengejar mimpinya."
    },
    // Mei: Sangat Spontan (Judging 0), Extrovert mentok, Logic sangat rendah
    traits: { Extrovert: 100, Judging: 0, Logic: 10, Confidence: 75, Ambition: 45, Composure: 20, Empathy: 85, Unique: 85 },
    themeColor: "#E03E52",
  },

  // --- SUNNY PEACE ---
  {
    id: "sakura",
    name: "Sakura Kawasaki",
    group: "Sunny Peace",
    mbti: "ENFP",
    desc: {
      japanese: "エネルギーと純真さに満ちています。みんなを笑顔にするために、常に直感と心に従って行動します。",
      global: "Full of energy and innocence. You always act following your intuition and heart to make everyone smile.",
      indo: "Penuh energi dan kepolosan. Kamu selalu bertindak mengikuti intuisi dan hatimu untuk membuat semua orang tersenyum."
    },
    idolDesc: {
      japanese: "何気ない日々を大切にする、天真爛漫な少女。\n過去の経験から、心の機微を感じ取り、寄り添ってあげられる優しさを持つ。",
      global: "A cheerful idol who cherishes everyday life. She gained popularity due to her voice being strikingly similar to Mana's, but eventually began questioning performing on stage with Mana's voice. Overcoming her struggles, she chose to break away from Mana’s voice and move forward toward her own future.",
      indo: "Gadis riang yang sangat menghargai keseharian. Berbekal pengalaman masa lalunya, ia memiliki kepekaan emosional dan empati yang tinggi. Awalnya, ia meraih popularitas karena suaranya yang sangat mirip dengan Mana, yang memicu krisis identitas saat ia berdiri di atas panggung. Namun, ia berhasil mengatasi pergulatan batinnya dan memutuskan untuk maju menyambut masa depannya sendiri."
    },
    // Sakura: Empati Mentok (100), Logic rendah, Extrovert tinggi
    traits: { Extrovert: 90, Judging: 15, Logic: 20, Confidence: 75, Ambition: 70, Composure: 25, Empathy: 100, Unique: 80 },
    themeColor: "#F69941",
  },
  {
    id: "rei",
    name: "Rei Ichinose",
    group: "Sunny Peace",
    mbti: "ESTJ",
    desc: {
      japanese: "断固としており、非常に競争心が強いです。自分に高い基準を設け、間違っていることを指摘することを躊躇しませんが、心の底では深く気にかけています。",
      global: "Assertive and highly competitive. You have high standards for yourself and don't hesitate to point out what's wrong, even though you care deeply inside.",
      indo: "Tegas dan sangat kompetitif. Kamu memiliki standar tinggi untuk dirimu sendiri dan tidak ragu menegur hal yang salah, meski di dalam hatimu kamu sangat peduli."
    },
    idolDesc: {
      japanese: "ダンスが大好きな高校3年生。\n上昇志向が強く、人一倍負けず嫌い。プロ意識が高いことから、彼女にとっての『正論』が、周囲には攻撃的な意見で押し付けるように聞こえ、衝突することも。",
      global: "A highly skilled dancer who won a dance competition. She aspired to be an idol to gain her parents' recognition for dance as a profession. Initially, she often clashed with her members due to her high standards, but she eventually found a way to guide them through her expertise.",
      indo: "Siswi SMA tahun ketiga yang sangat mencintai tari dan merupakan juara kompetisi menari. Sangat ambisius dan membenci kekalahan, ia menjadi idol demi mendapat pengakuan orang tuanya atas profesi penari. Profesionalismenya yang tinggi sering membuat argumen logisnya terdengar agresif, memicu konflik dengan anggota lain, sebelum akhirnya ia belajar membimbing mereka dengan keahliannya."
    },
    // Rei: Logic sangat tinggi (Tegas/Pro), Ambisius, Empati rendah (Terlihat galak di awal)
    traits: { Extrovert: 60, Judging: 95, Logic: 95, Confidence: 70, Ambition: 95, Composure: 75, Empathy: 20, Unique: 30 },
    themeColor: "#ACE3EF",
  },
  {
    id: "haruko",
    name: "Haruko Saeki",
    group: "Sunny Peace",
    mbti: "ESFJ",
    desc: {
      japanese: "経験豊富で母性的な温かさに満ちています。常に自分の利益よりもチームの幸福を優先します。",
      global: "Experienced and full of maternal warmth. You always put the team's well-being above your personal interests.",
      indo: "Berpengalaman dan penuh kehangatan keibuan. Kamu selalu menempatkan kesejahteraan tim di atas kepentingan pribadimu."
    },
    idolDesc: {
      japanese: "一見クールビューティーだが、中身は地味な遅咲きアイドル。\n数年前にソロデビューを果たすも全く芽が出ていなかった苦労人。\n自らにアイドルとしての才がないと思いながらも、夢に向かい突き進む。",
      global: "The caring older sister figure of the group and the leader of Sunny Peace. She was the first idol to join Hoshimi Production and knew Mana personally. At one point, she nearly gave up on her dream, but her determination to not betray those who believed in her strengthened her resolve to continue as an idol.",
      indo: "Di balik penampilannya yang keren, ia adalah sosok 'kakak' yang membumi bagi grupnya. Merupakan idol pertama di Hoshimi Production dan mengenal Mana secara personal, ia adalah pekerja keras yang gagal bersinar meski telah debut solo bertahun-tahun lalu. Hampir menyerah karena merasa tak berbakat, dorongan untuk tidak mengecewakan orang yang mempercayainya membuatnya bangkit kembali."
    },
    // Haruko: Composure tinggi (Dewasa), Empati tinggi, Unique rendah (Membumi/Normal)
    traits: { Extrovert: 70, Judging: 85, Logic: 50, Confidence: 55, Ambition: 80, Composure: 90, Empathy: 95, Unique: 20 },
    themeColor: "#C1A7E2",
  },
  {
    id: "chisa",
    name: "Chisa Shiraishi",
    group: "Sunny Peace",
    mbti: "INFP",
    desc: {
      japanese: "とてもシャイですが、豊かな内面の世界を持っています。共感力が非常に高いですが、勇敢に行動するには後押しが必要です。",
      global: "Very shy but with a rich inner world. Your empathy is very high, although you need a push to act bravely.",
      indo: "Sangat pemalu namun memiliki dunia batin yang kaya. Empatimu sangat tinggi, meski kamu butuh dorongan untuk tampil berani."
    },
    idolDesc: {
      japanese: "いつも姉の影に隠れているような、気弱で臆病な性格。\n姉に守られ続けてきたが故に、姉とは対照的に内向きな子に育ってきた。\n殻を破り、自らのコンプレックスを克服するため、事務所の門を叩く。",
      global: "A timid and shy girl who decided to become an idol to change herself. At first, she could only follow behind her older sister, but through her idol activities, she gradually gained confidence and resolved to walk her own path alongside her sister.",
      indo: "Gadis penakut yang terbiasa bersembunyi di balik bayang-bayang kakaknya yang protektif. Bertolak belakang dengan sang kakak, ia tumbuh menjadi anak yang tertutup. Namun, tekadnya untuk menghancurkan cangkangnya dan mengubah diri membawanya mengetuk pintu agensi, di mana ia perlahan menemukan keberanian untuk berdiri sejajar dengan kakaknya."
    },
    // Chisa: Sangat Introvert (E: 5), Confidence sangat rendah (Pemalu), Empati tinggi
    traits: { Extrovert: 5, Judging: 30, Logic: 35, Confidence: 10, Ambition: 50, Composure: 15, Empathy: 95, Unique: 70 },
    themeColor: "#E7BBD2",
  },
  {
    id: "shizuku",
    name: "Shizuku Hyodo",
    group: "Sunny Peace",
    mbti: "INTP",
    desc: {
      japanese: "無口で分析的、マイペース。どんな状況でも非常に論理的で冷静、かつ観察力があります。",
      global: "Quiet, analytical, and moves at your own pace. You are highly logical, calm, and observant in any situation.",
      indo: "Pendiam, analitis, dan memiliki ritmenya sendiri (my pace). Kamu sangat logis, tenang, dan observatif dalam segala situasi."
    },
    idolDesc: {
      japanese: "根暗なアイドルオタクで、基本的には影を潜めている。\nしかし、ことアイドルの話になると饒舌になる。\n年上の古参ファンからも一目置かれるような、アイドルオタク界では有名人。",
      global: "A reserved idol otaku who struggles with smiling. Upon joining, she lacked confidence in her idol abilities due to poor conversational skills and limited emotional expression. However, she bonded with Chisa, who shared similar concerns, and they continue to grow together by supporting each other.",
      indo: "Seorang otaku idol yang suram dan canggung berekspresi. Di keseharian ia nyaris tak terlihat, namun akan berbicara panjang lebar saat membahas idol—membuatnya menjadi sosok terkenal bahkan di kalangan penggemar veteran. Sempat kehilangan kepercayaan diri karena minimnya kemampuan komunikasinya, ia menemukan kekuatan melalui ikatannya dengan Chisa yang memiliki kekhawatiran serupa."
    },
    // Shizuku: Sangat Introvert (E: 5), Unique sangat tinggi (Otaku), Logic tinggi
    traits: { Extrovert: 5, Judging: 40, Logic: 95, Confidence: 45, Ambition: 40, Composure: 85, Empathy: 50, Unique: 95 },
    themeColor: "#99C99B",
  },

  // --- TRINITYAiLE ---
  {
    id: "rui",
    name: "Rui Tendo",
    group: "TRINITYAiLE",
    mbti: "INTJ",
    desc: {
      japanese: "絶対的な完璧主義者。論理的で戦略的であり、他の誰も真似できないほどの高い野心と基準を持っています。",
      global: "The absolute perfectionist. You are logical, strategic, and possess the highest ambition and standards that rarely anyone can match.",
      indo: "Sang perfeksionis absolut. Kamu logis, strategis, dan memiliki ambisi serta standar tertinggi yang jarang bisa disamai orang lain."
    },
    idolDesc: {
      japanese: "ダンス、歌、パフォーマンスの全てにおいて秀でている天才アイドル。\nしかし実態は、圧倒的な努力に裏打ちされた確かな実力。\nある人物に認められるため、苦しい道でも歩みを止めることはない。",
      global: "The absolute center of TRINITYAiLE. Though praised as a genius, her talent is actually backed by relentless effort. Her poised demeanor makes her seem flawless, but she has her quirks, such as suddenly falling asleep and being a picky eater.",
      indo: "Center mutlak dari TRINITYAiLE yang unggul dalam vokal, tari, dan performa. Meski sering dipuja sebagai jenius yang tak bercela, bakatnya sejatinya dibentuk oleh kerja keras yang mengerikan. Didorong oleh keinginan untuk diakui oleh seseorang, ia tidak pernah berhenti melangkah, meski di balik layar ia menyimpan kebiasaan unik seperti pilih-pilih makanan dan tiba-tiba tertidur."
    },
    // Rui: Ambisi Mentok (100), Logic Mentok (100), Judging tinggi (Perfeksionis), Empati rendah
    traits: { Extrovert: 35, Judging: 95, Logic: 100, Confidence: 90, Ambition: 100, Composure: 85, Empathy: 20, Unique: 65 },
    themeColor: "#FCFAF1",
  },
  {
    id: "yu",
    name: "Yuu Suzumura",
    group: "TRINITYAiLE",
    mbti: "ISFJ",
    desc: {
      japanese: "穏やかで観察力があり、常に陰からサポートします。伝統と調和を維持するための強い基盤を持っています。",
      global: "Calm, observant, and always there to support from behind. You have a strong foundation in maintaining tradition and harmony.",
      indo: "Tenang, observatif, dan selalu ada untuk mendukung dari belakang. Kamu memiliki fondasi yang kuat dalam mempertahankan tradisi dan keharmonisan."
    },
    idolDesc: {
      japanese: "京都出身で、いつでも冷静なTRINITYAiLEのまとめ役。\n父は大企業の社長、母は有名女優のサラブレッドお嬢様。\n瑠依に魅了されたひとりで、常に彼女を第一に考え行動する。",
      global: "A Kyoto native and the cool-headed leader of TRINITYAiLE. She is the daughter of a major corporation's president and a famous actress. Enchanted by Rui, she prioritizes her above all else. This devotion is well-known among fans, and many are drawn to her dedication.",
      indo: "Gadis berdarah murni dari Kyoto, putri seorang presiden perusahaan besar dan aktris terkenal. Ia adalah sosok tenang yang bertugas menjaga keutuhan TRINITYAiLE. Terpikat pesona Rui, dedikasinya untuk selalu memprioritaskan sang Center di atas segalanya sangat terkenal di kalangan penggemar, membuat banyak orang kagum pada kesetiaannya."
    },
    // Yuu: Composure sangat tinggi (Tenang/Yamato Nadeshiko), Extrovert menengah
    traits: { Extrovert: 45, Judging: 85, Logic: 60, Confidence: 60, Ambition: 70, Composure: 95, Empathy: 80, Unique: 45 },
    themeColor: "#AECE6E",
  },
  {
    id: "sumire",
    name: "Sumire Okuyama",
    group: "TRINITYAiLE",
    mbti: "ESFJ",
    desc: {
      japanese: "謙虚で努力家。時々自分の才能を疑うことがあっても、あなたの努力と共感力は皆に認められています。",
      global: "Humble and hardworking. Although you sometimes doubt your own talent, your hard work and empathy are acknowledged by everyone.",
      indo: "Rendah hati dan pekerja keras. Meskipun terkadang kamu meragukan bakatmu sendiri, kerja keras dan empatimu diakui oleh semua orang."
    },
    idolDesc: {
      japanese: "中学生とは思えないほどしっかりとした、元天才子役。\n実家山形から通っているが、その苦労をおくびにもださずに笑顔を見せる。\n普段は中学生らしいハツラツさを見せ、気を抜くと方言が出てしまうことも。",
      global: "A former child prodigy actress who became an idol for the sake of her family. She is mature beyond her years for a middle schooler and has an exceptional ability to remember faces and names. However, among those she trusts, she sometimes shows a more innocent side fitting for her age.",
      indo: "Mantan aktris cilik ajaib yang terjun ke dunia idol demi keluarganya. Rutin pulang-pergi dari kampung halamannya di Yamagata, ia menyembunyikan semua kelelahannya di balik senyuman. Memiliki ingatan luar biasa akan wajah dan nama, ia sangat dewasa untuk anak seusianya, walau terkadang kepolosannya dan logat daerahnya akan keluar saat ia merasa aman."
    },
    // Sumire: Confidence rendah (Sering meragukan diri), Empati tinggi
    traits: { Extrovert: 65, Judging: 75, Logic: 55, Confidence: 25, Ambition: 65, Composure: 50, Empathy: 85, Unique: 50 },
    themeColor: "#FFE495",
  },

  // --- LIZNOIR ---
  {
    id: "rio",
    name: "Rio Kanzaki",
    group: "LizNoir",
    mbti: "ENTJ",
    desc: {
      japanese: "カリスマ的で支配的なセンター。トップに立つために生まれ、非常に野心的で敗北を許しません。",
      global: "A charismatic and dominant Center. You are born to be at the top, highly ambitious, and do not accept defeat.",
      indo: "Sang Center yang karismatik dan dominan. Kamu lahir untuk berada di puncak, sangat ambisius, dan tidak menerima kekalahan."
    },
    idolDesc: {
      japanese: "勝利に貪欲で、攻撃的なスタイルを持つLizNoir不動のセンター。\n活動休止を経て、ある因縁を断ち切る為に復活した。誰よりも強い覚悟で、アイドル業界の頂点を目指す。",
      global: "The relentless center of LizNoir, driven by a hunger for victory. She was meant to compete against Mana in the Grand Prix finals but lost her purpose when Mana passed away, leading to a temporary hiatus. However, after new members joined, her mindset shifted, and she has since grown.",
      indo: "Center permanen LizNoir yang sangat lapar akan kemenangan dan memiliki gaya agresif. Seharusnya ia berhadapan dengan Mana di final Grand Prix, namun kehilangan arah saat saingannya itu meninggal, yang berujung pada masa hiatusnya. Setelah memotong belenggu masa lalu dan menyambut anggota baru, ia kini mengincar puncak industri idol dengan tekad yang tak tertandingi."
    },
    // Rio: Ambisi & Confidence Mentok (100), Empati sangat rendah (Dominan)
    traits: { Extrovert: 80, Judging: 85, Logic: 90, Confidence: 100, Ambition: 100, Composure: 85, Empathy: 15, Unique: 65 },
    themeColor: "#AE5287",
  },
  {
    id: "aoi",
    name: "Aoi Igawa",
    group: "LizNoir",
    mbti: "ISTP",
    desc: {
      japanese: "冷静で分析的。あまり口数は多くなく、行動を好み、周囲の人々の感情の安定柱としての役割を果たします。",
      global: "Cold, calm, and analytical. You don't talk much, prefer action, and serve as a stabilizing pillar for the emotions of those around you.",
      indo: "Dingin, tenang, dan analitis. Kamu tidak banyak bicara, lebih suka bertindak, dan merupakan tiang penyeimbang bagi emosi orang di sekitarmu."
    },
    idolDesc: {
      japanese: "感情の起伏が少なく、常に冷静なLizNoirのブレーン。\n自分の考えをストレートに表現するが、態度はクール。\nデビュー前から苦楽を共にした神崎莉央の最大の理解者である。",
      global: "The calm and analytical brain of LizNoir, with little emotional fluctuation. She shares a strong bond of trust with Rio, and even when their group faced a hiatus, she rejected the idea of adding new members and waited for her. She has the exceptional ability to perfectly replicate any dance she sees once.",
      indo: "Otak di balik LizNoir yang jarang menunjukkan fluktuasi emosi. Ia mengutarakan pikirannya dengan jujur namun tetap elegan. Memiliki kemampuan luar biasa untuk meniru tarian apa pun hanya dengan sekali lihat, ia adalah orang yang paling memahami Rio sejak sebelum debut, bahkan menolak penambahan anggota baru demi menunggu kembalinya sang Center."
    },
    // Aoi: Composure Mentok (100) (Selalu Tenang), Sangat Introvert (E: 10)
    traits: { Extrovert: 10, Judging: 35, Logic: 95, Confidence: 85, Ambition: 70, Composure: 100, Empathy: 40, Unique: 75 },
    themeColor: "#6F77CC",
  },
  {
    id: "ai",
    name: "Ai Komiyama",
    group: "LizNoir",
    mbti: "ESFJ",
    desc: {
      japanese: "騒がしく泣き虫ですが、外見にはとても気を使います。注目を浴びたがりますが、実はとても優しく繊細な心を持っています。",
      global: "Noisy, a crybaby, but cares a lot about appearance. You crave attention, but your heart is actually very soft and sensitive.",
      indo: "Berisik, cengeng, tapi sangat peduli pada penampilan. Kamu haus akan perhatian, namun hatimu sebenarnya sangat lembut dan sensitif."
    },
    idolDesc: {
      japanese: "人を笑顔にすることが大好きな、LizNoirのムードメーカー。\n確かな技術力を持っているが、肝心な時にとんでもない不器用さを見せる。\n冗談が通じ辛く、こころの言うことを信じすぎる節がある。",
      global: "LizNoir's mood-maker who loves making people smile. She has been friends with Kokoro since their training days and is often teased by her. Although highly skilled, she has a habit of making mistakes at crucial moments, which frequently leads to scolding from Rio.",
      indo: "Sang pencair suasana di LizNoir yang sangat suka membuat orang tersenyum. Memiliki keterampilan yang solid, ia entah bagaimana sering melakukan kesalahan konyol di momen-momen penting yang membuatnya dimarahi Rio. Bersahabat dengan Kokoro sejak masa pelatihan, ia sering menjadi korban kejahilan temannya karena sifatnya yang terlalu mudah percaya."
    },
    // Ai: Logic sangat rendah (Banyak blunder/cengeng), Extrovert dan Empati tinggi
    traits: { Extrovert: 95, Judging: 60, Logic: 15, Confidence: 75, Ambition: 80, Composure: 30, Empathy: 90, Unique: 65 },
    themeColor: "#7ECCEE",
  },
  {
    id: "kokoro",
    name: "Kokoro Akazaki",
    group: "LizNoir",
    mbti: "ESFP",
    desc: {
      japanese: "純粋で単刀直入、屈託がない。あなたの存在は沈黙を破り、多くの人に好かれる自然な魅力を持っています。",
      global: "Pure, blunt, and carefree. Your presence breaks the silence and you have a natural charm that many people like.",
      indo: "Murni, blak-blakan, dan tanpa beban. Kehadiranmu memecah keheningan dan kamu punya pesona alami yang disukai banyak orang."
    },
    idolDesc: {
      japanese: "人懐っこくお調子者な、LizNoirの切り込み隊長。\n時折放つトゲのある物言いが、底を見えなくさせる。愛とはお互いを認め合う仲だが、良からぬことを吹き込みがち。",
      global: "The mischievous and sociable forward of LizNoir. She and Ai acknowledge each other's strengths but often engage in playful mischief. With a charm and cuteness previously unseen in LizNoir, she brings a fresh new energy to the group.",
      indo: "Ujung tombak LizNoir yang sangat ramah dan suka mencari perhatian. Terkadang lidahnya yang tajam membuat isi hatinya sulit ditebak. Ia dan Ai saling mengakui kemampuan satu sama lain, walau ia gemar membisikkan ide-ide jahil. Dengan kelucuannya, ia membawa angin segar dan daya tarik yang belum pernah ada sebelumnya ke dalam LizNoir."
    },
    // Kokoro: Judging sangat rendah (Jahil/Bebas), Confidence tinggi
    traits: { Extrovert: 95, Judging: 10, Logic: 35, Confidence: 90, Ambition: 85, Composure: 50, Empathy: 75, Unique: 85 },
    themeColor: "#FC9BB3",
  },

  // --- IIIX ---
  {
    id: "fran",
    name: "Fran",
    group: "IIIX",
    mbti: "ESFP",
    desc: {
      japanese: "攻撃的で自信に満ちている。富や贅沢（あるいは達成）は具体的な行動で追求すべきだと信じています。",
      global: "Aggressive and confident. You believe that wealth and luxury (or achievements) must be pursued with concrete actions.",
      indo: "Agresif dan percaya diri. Kamu percaya bahwa harta dan kemewahan (atau pencapaian) harus dikejar dengan tindakan nyata."
    },
    idolDesc: {
      japanese: "抜群のスタイルを持つ、天才肌で努力を知らないカリスマ。\nⅢⅩのセンターで、パリコレへの出場経験もあるトップモデル出身。\nある理由から極端にお金に執着している。",
      global: "A charismatic genius with an outstanding figure who has never known hard work. As the center of IIIX, she has experience walking the runway at Paris Fashion Week. For some reason, she has an extreme obsession with money.",
      indo: "Center dari IIIX yang memiliki karisma jenius dan proporsi tubuh luar biasa tanpa perlu bersusah payah. Ia adalah mantan model papan atas yang pernah berjalan di panggung Paris Fashion Week. Di balik auranya yang menyilaukan, ia memiliki obsesi ekstrem terhadap uang karena sebuah alasan tersembunyi."
    },
    // Fran: Judging rendah (Foya-foya/Spontan), Confidence sangat tinggi, Logic menengah
    traits: { Extrovert: 90, Judging: 20, Logic: 45, Confidence: 95, Ambition: 90, Composure: 60, Empathy: 40, Unique: 90 },
    themeColor: "#474744",
  },
  {
    id: "kana",
    name: "Kana",
    group: "IIIX",
    mbti: "ESTP",
    desc: {
      japanese: "真のゲーマーのように狡猾で競争心が強い。表面上はリラックスしていますが、勝つための鋭い戦略を持っています。",
      global: "Cunning and highly competitive like a true gamer. You are relaxed on the surface, but have sharp strategies to win.",
      indo: "Licik dan sangat kompetitif bagai pemain game sungguhan. Kamu santai di permukaan, tetapi punya strategi tajam untuk menang."
    },
    idolDesc: {
      japanese: "裏表が激しいが、ずば抜けたセンスを持つ小悪魔アイドル。\n大人気モデル出身で、小さい頃から数々の雑誌の表紙を飾っている。\n承認欲求が高く、SNSのフォロワーは200万以上。",
      global: "A devilish idol with an intense dual personality and exceptional talent. She was a highly popular model from a young age, gracing countless magazine covers. She has a strong desire for recognition and boasts over two million followers on social media.",
      indo: "Idol kecil-kecil cabai rawit dengan bakat luar biasa dan kepribadian ganda yang mencolok. Memulai karir sebagai model cilik super populer, ia telah menghiasi nezliczona banyak sampul majalah. Digerakkan oleh rasa haus akan pengakuan, pesonanya telah berhasil memikat lebih dari dua juta pengikut di media sosial."
    },
    // Kana: Logic cukup tinggi (Licik/Strategis), Empati sangat rendah (Bermuka dua)
    traits: { Extrovert: 85, Judging: 25, Logic: 75, Confidence: 85, Ambition: 95, Composure: 75, Empathy: 15, Unique: 80 },
    themeColor: "#474744",
  },
  {
    id: "miho",
    name: "Miho",
    group: "IIIX",
    mbti: "ISTJ",
    desc: {
      japanese: "ロボットのように冷徹で効率的。結果のみを追求し、わずかな感情も効率を妨げることを許しません。",
      global: "Cold and efficient like a robot. You only pursue results and do not let even the slightest emotion hinder your efficiency.",
      indo: "Dingin dan efisien layaknya robot. Kamu hanya mengejar hasil dan tidak membiarkan emosi sekecil apa pun menghalangi efisiensimu."
    },
    idolDesc: {
      japanese: "抱負な経験と知識を活かして活動に励む理論派。\nBIG4に手が届く寸前で突如解散した、人気二人組アイドルのメンバーだった過去を持つ。\nグループのブレーン的存在で基本的に温厚だが、執念深い一面も。",
      global: "A logical idol who leverages her vast experience and knowledge. She was once part of a popular idol duo that was on the verge of reaching BIG4 status before suddenly disbanding. As the strategist of her current group, she is generally calm but has a persistent and tenacious side.",
      indo: "Seorang pemikir logis yang mengandalkan segudang pengalaman dan pengetahuannya. Di masa lalu, ia adalah bagian dari duo idol populer yang nyaris mencapai status BIG4 sebelum bubar secara tiba-tiba. Bertindak sebagai ahli strategi bagi IIIX, ia umumnya bersikap tenang, namun menyimpan sisi pendendam dan keuletan yang luar biasa."
    },
    // Miho: Logic Mentok (100) (Robot), Empati Mentok Bawah (0) (Tidak peduli perasaan)
    traits: { Extrovert: 20, Judging: 95, Logic: 100, Confidence: 80, Ambition: 90, Composure: 95, Empathy: 0, Unique: 45 },
    themeColor: "#474744",
  },

  // --- LEGEND ---
  {
    id: "mana",
    name: "Mana Nagase",
    group: "Mana Nagase",
    mbti: "ENFJ",
    desc: {
      japanese: "かけがえのない伝説。並外れたカリスマ性、天を突く野心、しかし誰の心にも響く共感力を持っています。",
      global: "The irreplaceable legend. You possess extraordinary charisma, ambition that pierces the sky, yet empathy that touches anyone's heart.",
      indo: "Sang legenda yang tak tergantikan. Kamu memiliki kharisma luar biasa, ambisi yang menembus langit, namun empati yang menyentuh hati siapa saja."
    },
    idolDesc: {
      japanese: "そこにいるだけで、周囲を笑顔にしてくれるアイドル。手が届かないようなスター性を感じさせる一方で、飾らない親しみやすさも持ち合わせる稀有な存在。",
      global: "A legendary idol known as the \"Miracle of Falling Stars.\" She passed away only a year and a half after her debut, but during that short time, she set numerous records and left behind many legends. Even after her death, she continues to inspire countless idols.",
      indo: "Seorang idol legendaris yang dijuluki \"Keajaiban Bintang Jatuh\". Hanya dengan kehadirannya, ia mampu membuat semua orang tersenyum. Di balik pesona bintangnya yang terasa tak tergapai, ia memiliki kehangatan dan keramahan yang langka. Meski telah tiada satu setengah tahun usai debutnya, rekor dan legenda yang ia torehkan terus menginspirasi banyak idol hingga hari ini."
    },
    // Mana: Hampir sempurna di Traits Positif (Legend), Sangat Tinggi Empati dan Ambisi
    traits: { Extrovert: 95, Judging: 80, Logic: 65, Confidence: 100, Ambition: 100, Composure: 90, Empathy: 100, Unique: 95 },
    themeColor: "#F252B0",
  },
];

export interface Question {
  id: number;
  text: LocalizedText;
  trait: Trait;
  invert: boolean;
}

// ==============================================
// Daftar Pertanyaan (Adopsi dari 8D Gakumas)
// ==============================================
export const resonanceQuestions: Question[] = [
  // --- Extrovert (E) ---
  {
    id: 1,
    trait: "Extrovert",
    invert: false,
    text: {
      japanese:
        "混雑したイベントで、知り合いがいなくても自然と見知らぬ人に話しかけられる。",
      global:
        "At a crowded event, even without acquaintances, you naturally strike up conversations.",
      indo: "Di acara yang ramai, meskipun tidak ada kenalan, kamu secara alami akan mengajak orang tak dikenal mengobrol.",
    },
  },
  {
    id: 2,
    trait: "Extrovert",
    invert: true,
    text: {
      japanese:
        "忙しい1週間を終えた後、一人静かに回復したい。外に誘われると疲れる。",
      global:
        "After a busy week, you prefer to recover quietly alone; going out feels exhausting.",
      indo: "Setelah minggu yang sibuk, kamu lebih suka memulihkan diri sendirian; diajak keluar terasa sangat melelahkan.",
    },
  },
  {
    id: 3,
    trait: "Extrovert",
    invert: true,
    text: {
      japanese:
        "チームのアイスブレイクでは通常受け身で参加し、自ら場を盛り上げることは少ない。",
      global:
        "In team icebreakers, you are usually a passive participant and rarely take the lead.",
      indo: "Dalam permainan kelompok atau team-building, kamu biasanya pasif dan jarang mengambil inisiatif mencairkan suasana.",
    },
  },
  {
    id: 4,
    trait: "Extrovert",
    invert: false,
    text: {
      japanese:
        "趣味の多くは、一人で行うものではなく、他人と一緒に楽しむものである。",
      global:
        "Most of your hobbies require others to participate rather than being solitary activities.",
      indo: "Sebagian besar hobimu mengharuskan partisipasi orang lain (seperti olahraga tim) daripada dilakukan sendirian.",
    },
  },
  {
    id: 5,
    trait: "Extrovert",
    invert: false,
    text: {
      japanese:
        "嬉しい時、最初の反応はすぐにSNSでシェアするか、友達に連絡することだ。",
      global:
        "When happy, your first reaction is to immediately share it on social media or call a friend.",
      indo: "Saat sedang senang, reaksi pertamamu adalah membagikannya di media sosial atau menghubungi teman.",
    },
  },

  // --- Judging (J) ---
  {
    id: 6,
    trait: "Judging",
    invert: false,
    text: {
      japanese:
        "休日の旅行でも、詳細なスケジュールを立てる。完全な行き当たりばったりの行動は好まない。",
      global:
        "Even on vacation, you make detailed itineraries and dislike completely spontaneous plans.",
      indo: "Bahkan saat liburan, kamu membuat jadwal perjalanan yang detail dan kurang suka dengan rencana dadakan.",
    },
  },
  {
    id: 7,
    trait: "Judging",
    invert: true,
    text: {
      japanese:
        "締め切りに対し、ついつい先延ばしにし、最後の2日間まで放置してしまう。",
      global:
        "Facing a deadline, you usually procrastinate until the last two days.",
      indo: "Menghadapi tenggat waktu yang penting, kamu sering menunda pekerjaan hingga dua hari terakhir.",
    },
  },
  {
    id: 8,
    trait: "Judging",
    invert: false,
    text: {
      japanese:
        "厳格な個人的な習慣を持っており、予期せぬ事態が起きてもそれを破ることは少ない。",
      global:
        "You have strict personal habits and rarely break them even in unexpected situations.",
      indo: "Kamu memiliki kebiasaan pribadi yang ketat (misal waktu tidur) dan jarang melanggarnya meski ada hal tak terduga.",
    },
  },
  {
    id: 9,
    trait: "Judging",
    invert: false,
    text: {
      japanese:
        "机やデスクトップは常に整理整頓されており、探し物で無駄な時間を費やすことはない。",
      global:
        "Your desk or desktop is highly organized; you never waste time looking for things.",
      indo: "Meja kerjamu atau desktop komputer selalu tertata rapi; kamu tidak pernah membuang waktu mencari barang.",
    },
  },
  {
    id: 10,
    trait: "Judging",
    invert: true,
    text: {
      japanese:
        "「型にはまった計画」よりも「その時の状態」を重視し、気の向くままに進める。",
      global:
        "You believe 'current state' is more important than 'rigid plans', preferring to work spontaneously.",
      indo: "Kamu merasa 'kondisi (mood) saat ini' lebih penting daripada 'rencana kaku', dan lebih suka bekerja secara spontan.",
    },
  },

  // --- Logic (T) ---
  {
    id: 11,
    trait: "Logic",
    invert: false,
    text: {
      japanese:
        "友人が理不尽な目に遭った時、ただ一緒に文句を言うのではなく、まず客観的な善悪を分析する。",
      global:
        "When a friend complains about injustice, you prioritize objective analysis over just agreeing.",
      indo: "Saat teman menangis karena ketidakadilan, kamu lebih memilih menganalisis fakta secara objektif daripada langsung ikut marah.",
    },
  },
  {
    id: 12,
    trait: "Logic",
    invert: false,
    text: {
      japanese:
        "高価な商品を買う前は、スペック比較を行い、衝動買いすることはない。",
      global:
        "Before buying expensive items, you make detailed comparisons instead of impulse buying.",
      indo: "Sebelum membeli barang mahal, kamu membuat perbandingan detail dan tidak akan terbeli hanya karena rayuan promosi.",
    },
  },
  {
    id: 13,
    trait: "Logic",
    invert: true,
    text: {
      japanese:
        "映画や小説でキャラクターに深く感情移入して涙を流しやすく、数日間気分に影響する。",
      global:
        "Watching movies, you deeply empathize with characters, which can affect your mood for days.",
      indo: "Saat menonton film/novel, kamu sangat mudah berempati dengan karakter hingga menangis dan mood-mu terbawa berhari-hari.",
    },
  },
  {
    id: 14,
    trait: "Logic",
    invert: true,
    text: {
      japanese:
        "「直感」や「運命」を信じ、厳密な論理よりも正しい選択に導いてくれると考える。",
      global:
        "You believe in 'intuition' or 'destiny', thinking they guide you better than strict logic.",
      indo: "Kamu percaya pada 'intuisi' atau 'takdir', merasa bahwa hal itu sering menuntunmu lebih baik daripada logika kaku.",
    },
  },
  {
    id: 15,
    trait: "Logic",
    invert: false,
    text: {
      japanese:
        "人生の重大な選択において、現在の好みよりも、客観的な将来性や利益を最優先する。",
      global:
        "Facing major choices, you prioritize objective benefits and prospects over current preferences.",
      indo: "Menghadapi pilihan besar dalam hidup, kamu memprioritaskan keuntungan objektif dan prospek daripada preferensi saat ini.",
    },
  },

  // --- Confidence (C) ---
  {
    id: 16,
    trait: "Confidence",
    invert: true,
    text: {
      japanese:
        "重要な発表の前は、十分な準備をしていても「失敗したらどうしよう」と緊張する。",
      global:
        "Before an important performance, despite full preparation, you feel nervous about messing up.",
      indo: "Sebelum presentasi/penampilan penting, meskipun sudah bersiap matang, kamu tetap gugup dan takut mengacaukannya.",
    },
  },
  {
    id: 17,
    trait: "Confidence",
    invert: true,
    text: {
      japanese:
        "能力に疑問を投げかけられた時、反論するのではなく「自分が間違っているのでは」と反省する。",
      global:
        "When questioned, your first reaction is to self-reflect rather than firmly rebutting.",
      indo: "Ketika kemampuanmu diragukan, reaksi pertamamu adalah merenung dan menyalahkan diri sendiri, bukan dengan tegas membantahnya.",
    },
  },
  {
    id: 18,
    trait: "Confidence",
    invert: false,
    text: {
      japanese:
        "自分がやると決めたことなら、最終的には大多数の人よりも上手くやれると信じる。",
      global:
        "You believe whatever you decide to do, you will eventually do it better than most people.",
      indo: "Kamu yakin bahwa apa pun yang kamu putuskan untuk dilakukan, pada akhirnya kamu akan melakukannya lebih baik dari kebanyakan orang.",
    },
  },
  {
    id: 19,
    trait: "Confidence",
    invert: true,
    text: {
      japanese:
        "同世代の人が驚くべき成果を上げたのを見ると、無力感を感じることがある。",
      global:
        "Seeing peers achieve amazing things, you often feel a sense of powerlessness.",
      indo: "Melihat teman sebaya mencapai hal-hal luar biasa, kamu sering merasa tidak berdaya dan berpikir tidak akan pernah mencapai level itu.",
    },
  },
  {
    id: 20,
    trait: "Confidence",
    invert: false,
    text: {
      japanese:
        "会議で、自分の意見が上司全員と違っていても、ためらわずに堂々と発言できる。",
      global:
        "In a meeting, even if your view contradicts authorities, you will speak it out without hesitation.",
      indo: "Dalam sebuah rapat, bahkan jika pandanganmu bertentangan dengan semua senior/otoritas, kamu akan mengungkapkannya tanpa ragu.",
    },
  },

  // --- Ambition (M) ---
  {
    id: 21,
    trait: "Ambition",
    invert: false,
    text: {
      japanese: "試合に参加するなら、心の底から1位になりたいと願う。",
      global:
        "Whenever you join a contest, you genuinely desire to win first place.",
      indo: "Asalkan ikut kompetisi, meski hanya laga persahabatan, kamu dari lubuk hati terdalam sangat ingin menjadi juara pertama.",
    },
  },
  {
    id: 22,
    trait: "Ambition",
    invert: true,
    text: {
      japanese:
        "「出世する」ことにあまり興味がなく、平凡で穏やかな日常を送れれば十分だと思っている。",
      global:
        "You have little interest in 'standing out', feeling that a peaceful daily life is enough.",
      indo: "Kamu tidak terlalu tertarik untuk 'menonjol'; menurutmu hidup biasa-biasa saja yang damai sudah cukup.",
    },
  },
  {
    id: 23,
    trait: "Ambition",
    invert: false,
    text: {
      japanese:
        "ライバルが成果を上げるのを見ると、強い競争心が刺激され「絶対に超えてやる」と誓う。",
      global:
        "Seeing rivals achieve success triggers your strong competitive spirit to surpass them.",
      indo: "Melihat rival atau teman mencapai kesuksesan akan memicu semangat kompetitifmu untuk melampaui mereka.",
    },
  },
  {
    id: 24,
    trait: "Ambition",
    invert: true,
    text: {
      japanese:
        "「そこそこでいい」という考えを持っており、トップの成績のために身を削る気はない。",
      global:
        "In studies/career, you hold a 'passing is fine' mindset, unwilling to burn out for top ranks.",
      indo: "Dalam belajar atau karir, kamu memiliki pola pikir 'lulus saja cukup', tidak sudi mengorbankan segalanya demi peringkat teratas.",
    },
  },
  {
    id: 25,
    trait: "Ambition",
    invert: false,
    text: {
      japanese:
        "自分の現在の能力の限界を超える挑戦的な目標を設定し、それによって自分を成長させる。",
      global:
        "You set challenging goals beyond your current capability to force yourself to grow.",
      indo: "Kamu terbiasa menetapkan target yang jauh melebihi kemampuanmu saat ini untuk memaksa dirimu berkembang.",
    },
  },

  // --- Composure / Optimism (O) ---
  {
    id: 26,
    trait: "Composure",
    invert: false,
    text: {
      japanese:
        "挫折に直面してもすぐに立ち直り、最終的には良い方向に向かうと信じている。",
      global:
        "When facing setbacks, you quickly adjust and believe things will eventually turn out fine.",
      indo: "Saat menghadapi kegagalan, kamu selalu bisa dengan cepat menyesuaikan pola pikir dan percaya semuanya akan membaik.",
    },
  },
  {
    id: 27,
    trait: "Composure",
    invert: true,
    text: {
      japanese:
        "未知の環境や挑戦に直面した時、習慣的に最悪の事態を想定してしまう。",
      global:
        "Facing unknown environments or challenges, you habitually imagine the worst-case scenarios first.",
      indo: "Menghadapi lingkungan atau tantangan baru yang tidak diketahui, kamu terbiasa memikirkan kemungkinan terburuk terlebih dahulu.",
    },
  },
  {
    id: 28,
    trait: "Composure",
    invert: false,
    text: {
      japanese:
        "極度のストレスを感じる逆境でも、ちょっとした幸せを見つけることができる。",
      global:
        "Even in highly stressful adversity, you can find small things to be happy about.",
      indo: "Bahkan dalam tekanan dan kesulitan yang ekstrem, kamu bisa menemukan hal-hal kecil untuk disyukuri.",
    },
  },
  {
    id: 29,
    trait: "Composure",
    invert: true,
    text: {
      japanese:
        "未来への不安に押し潰されそうになり、まだ起きていない問題を心配することがよくある。",
      global:
        "You are often overwhelmed by anxiety about the future, worrying about problems that haven't happened.",
      indo: "Kamu sering kewalahan oleh kecemasan tentang masa depan, mengkhawatirkan masalah yang bahkan belum terjadi.",
    },
  },
  {
    id: 30,
    trait: "Composure",
    invert: false,
    text: {
      japanese:
        "「なんとかなる」という気楽さがあり、一時的な失敗で全てを否定することはない。",
      global:
        "You have a relaxed 'things will work out' attitude and don't let temporary failures define everything.",
      indo: "Kamu memiliki sifat santai 'semua akan ada jalannya', dan tidak membiarkan kegagalan sementara mendefinisikan segalanya.",
    },
  },

  // --- Empathy (A) ---
  {
    id: 31,
    trait: "Empathy",
    invert: false,
    text: {
      japanese:
        "グループ作業で誰かが足を引っ張った場合、すぐに責めるのではなく、困難がないか考え助けようとする。",
      global:
        "If someone lags in group work, you prioritize considering if they have difficulties and offer help.",
      indo: "Jika seseorang tertinggal dalam kerja kelompok, kamu akan memprioritaskan untuk membantunya, bukan langsung menyalahkannya.",
    },
  },
  {
    id: 32,
    trait: "Empathy",
    invert: false,
    text: {
      japanese:
        "頼み事を断るのが苦手で、他人のために自分を犠牲にし、休息時間を削ってしまう。",
      global:
        "It's hard to refuse requests; sometimes you compromise yourself to help others.",
      indo: "Kamu sangat sulit menolak permintaan orang lain, bahkan terkadang mengorbankan waktu pribadimu demi membantu mereka.",
    },
  },
  {
    id: 33,
    trait: "Empathy",
    invert: true,
    text: {
      japanese:
        "競技において「勝つ」ことが唯一の目的であり、人情を気にせずルールで許される手段を使う。",
      global:
        "In competition, winning is the sole purpose, using any allowed means regardless of feelings.",
      indo: "Dalam kompetisi, 'menang' adalah satu-satunya tujuan. Kamu bersedia menggunakan cara apa pun sesuai aturan tanpa mempedulikan perasaan lawan.",
    },
  },
  {
    id: 34,
    trait: "Empathy",
    invert: false,
    text: {
      japanese:
        "ニュースで見知らぬ人の不幸を見ると、強く感情移入し、本当に悲しくなる。",
      global:
        "Seeing strangers' misfortunes on the news, you feel strong empathy and real sadness.",
      indo: "Melihat kemalangan orang tak dikenal di berita, kamu merasakan empati yang kuat dan kesedihan yang nyata.",
    },
  },
  {
    id: 35,
    trait: "Empathy",
    invert: false,
    text: {
      japanese:
        "チームにおいては、個人的な突出した成績よりも、温かい雰囲気を維持することの方が重要だと考える。",
      global:
        "You believe maintaining a warm atmosphere in a team is more important than individual results.",
      indo: "Menurutmu dalam sebuah tim, menjaga suasana hangat dan hubungan baik jauh lebih penting daripada hasil individu yang menonjol.",
    },
  },

  // --- Unique (U) ---
  {
    id: 36,
    trait: "Unique",
    invert: false,
    text: {
      japanese:
        "誰もが当然と思っている常識やルールに対して、「なぜそうしなければならないのか」と疑問に思う。",
      global:
        "For common sense or rigid rules, you can't help but question 'Why must it be this way?'.",
      indo: "Terhadap aturan atau kebiasaan umum yang dianggap wajar, kamu tidak bisa menahan diri untuk bertanya 'Mengapa harus begini?'.",
    },
  },
  {
    id: 37,
    trait: "Unique",
    invert: false,
    text: {
      japanese:
        "服装や趣味において、自分が多数派と同じだと気づくと、少しつまらなく感じてわざと変えたくなる。",
      global:
        "In fashion or hobbies, if you find yourself the same as most people, you want to change.",
      indo: "Dalam hal gaya pakaian atau hobi, jika kamu menyadari bahwa kamu sama dengan kebanyakan orang, kamu akan merasa bosan dan ingin mengubahnya.",
    },
  },
  {
    id: 38,
    trait: "Unique",
    invert: false,
    text: {
      japanese:
        "「先の見えた」安定した生活を非常に嫌い、未知で変化に富んだ未来を強く渇望している。",
      global:
        "You reject a predictable life, yearning more for a future full of unknowns and variables.",
      indo: "Kamu menolak keras kehidupan yang stabil dan terprediksi, serta lebih mendambakan masa depan yang penuh ketidaktahuan.",
    },
  },
  {
    id: 39,
    trait: "Unique",
    invert: false,
    text: {
      japanese:
        "完璧な経験法則があっても、あえて自分自身で全く新しい道を試したくなる。",
      global:
        "Faced with perfect experience, you still like to try finding a brand new path.",
      indo: "Meskipun sudah ada cara atau pengalaman sempurna yang ditinggalkan pendahulu, kamu tetap suka mencoba mencari jalan baru yang aneh.",
    },
  },
  {
    id: 40,
    trait: "Unique",
    invert: true,
    text: {
      japanese:
        "社会の伝統的な期待（順調に進学し、仕事に就くなど）に従うことが、最も無难なルートだと考える。",
      global:
        "You believe conforming to society's traditional expectations is the safest life path.",
      indo: "Kamu percaya bahwa mengikuti ekspektasi tradisional masyarakat (seperti sekolah lalu bekerja normal) adalah jalur hidup yang paling aman dan layak dikejar.",
    },
  },
];
