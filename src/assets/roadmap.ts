export interface GuideStep {
  episode: number;
  choiceText: string;
  note?: string; // Catatan tambahan
}

export interface EndingRoute {
  id: string;
  endingName: string; // Nama Ending (Jepang / Indo)
  type: "TRUE" | "GOOD" | "BAD" | "NORMAL";
  steps: GuideStep[];
}

// Key-nya adalah Event ID (2305, 2311, dst)
export const LOVE_STORY_ROADMAP: Record<string, EndingRoute[]> = {
  // ============================================================
  // MOSHIKOI 2305 (Rei Ichinose)
  // ============================================================
  "2305": [
    // --- EARLY BAD END ---
    {
      id: "end-otoku",
      endingName: "オトクオトク (Diskon End)",
      type: "BAD",
      steps: [
        { episode: 1, choiceText: "一ノ瀬さんを追いかけない", note: "Tamat instan di Ep 1" }
      ]
    },
    // --- MAIN ROUTE A (Theme Park) ---
    {
      id: "end-yumeoi",
      endingName: "夢追い (Pengejar Mimpi)",
      type: "BAD",
      steps: [
        { episode: 1, choiceText: "一ノ瀬さんを追いかける" },
        { episode: 6, choiceText: "テーマパークに怜を誘う", note: "Ajak ke Theme Park" },
        { episode: 6, choiceText: "行く" },
        { episode: 8, choiceText: "告白する", note: "Confess di Ep 8" }
      ]
    },
    {
      id: "end-together",
      endingName: "これからも一緒に (Bersama Selamanya)",
      type: "BAD",
      steps: [
        { episode: 6, choiceText: "テーマパークに怜を誘う" },
        { episode: 6, choiceText: "行く" },
        { episode: 8, choiceText: "告白しない", note: "Tidak confess di Ep 8" }
      ]
    },
    // --- MAIN ROUTE B (Timing) ---
    {
      id: "end-timing",
      endingName: "恋はタイミング (Cinta itu Timing)",
      type: "BAD",
      steps: [
        { episode: 6, choiceText: "行かない", note: "Tidak pergi ke Theme Park" },
        { episode: 7, choiceText: "告白する", note: "Confess terlalu cepat" }
      ]
    },
    {
      id: "end-hated",
      endingName: "嫌われ (Dibenci)",
      type: "BAD",
      steps: [
        { episode: 6, choiceText: "行かない" },
        { episode: 7, choiceText: "見送る", note: "Hanya mengantar pulang" }
      ]
    },
    {
      id: "end-misunderstand",
      endingName: "勘違い (Salah Paham)",
      type: "BAD",
      steps: [
        { episode: 6, choiceText: "行かない" },
        { episode: 7, choiceText: "なんでこんなことに" }
      ]
    },
    // --- TRUE ROUTE (Mahasiswa) ---
    {
      id: "end-univ",
      endingName: "大学生 (Mahasiswa)",
      type: "NORMAL",
      steps: [
        { episode: 6, choiceText: "一人でテーマパークに行く", note: "Pilih pergi sendiri (PENTING)" },
        { episode: 8, choiceText: "大学に行こう" }
      ]
    },
    {
      id: "end-true",
      endingName: "TRUE END",
      type: "TRUE",
      steps: [
        { episode: 6, choiceText: "一人でテーマパークに行く", note: "Syarat: Route Mahasiswa" },
        { episode: 8, choiceText: "キャストになろう", note: "Ajak jadi Cast (Idol)" }
      ]
    },
    {
      id: "end-sayonara",
      endingName: "さよなら (Selamat Tinggal)",
      type: "BAD",
      steps: [
        { episode: 6, choiceText: "一人でテーマパークに行く" },
        { episode: 8, choiceText: "俺には分からない" }
      ]
    }
  ],

  // ============================================================
  // MOSHIKOI 2311 (Nagisa Ibuki)
  // ============================================================
  "2311": [
    {
      id: "end-suzuki",
      endingName: "スズキスズキ (Suzuki Suzuki)",
      type: "BAD",
      steps: [
        { episode: 2, choiceText: "断る", note: "Tolak tawaran di Ep 2" }
      ]
    },
    {
      id: "end-true",
      endingName: "TRUE END",
      type: "TRUE",
      steps: [
        { episode: 8, choiceText: "挑戦するように勧める", note: "Semua pilihan 1-7 positif" }
      ]
    },
    {
      id: "end-fulfilling",
      endingName: "充実した日々 (Hari Memuaskan)",
      type: "GOOD",
      steps: [
        { episode: 8, choiceText: "やめるように助言する", note: "Syarat: Route TRUE" }
      ]
    },
    {
      id: "end-novel",
      endingName: "小説の糧 (Bahan Novel)",
      type: "NORMAL",
      steps: [
        { episode: 8, choiceText: "他社からのオファーを話す", note: "Syarat: Route TRUE" }
      ]
    }
  ],

  // ============================================================
  // MOSHIKOI 2405 (Mei Hayasaka)
  // ============================================================
  "2405": [
    // --- EARLY BAD ---
    {
      id: "end-buwa",
      endingName: "ブワッブワッ (Nangis)",
      type: "BAD",
      steps: [
        { episode: 3, choiceText: "恋を教えない", note: "Tidak mengajari cinta" }
      ]
    },
    // --- ROUTE A (Ekiden) ---
    {
      id: "end-club",
      endingName: "部活よりも恋愛 (Cinta > Klub)",
      type: "BAD",
      steps: [
        { episode: 1, choiceText: "一緒に遊ぶ" },
        { episode: 3, choiceText: "恋を教える" },
        { episode: 6, choiceText: "告白する" },
        { episode: 7, choiceText: "うまくいくと伝える" },
        { episode: 8, choiceText: "陸上は続けない" }
      ]
    },
    {
      id: "end-ekiden",
      endingName: "駅伝優勝 (Juara Estafet)",
      type: "GOOD",
      steps: [
        { episode: 8, choiceText: "芽衣に判断を委ねる", note: "Syarat: Route A" }
      ]
    },
    {
      id: "end-true",
      endingName: "TRUE END",
      type: "TRUE",
      steps: [
        { episode: 8, choiceText: "陸上を再開する", note: "Syarat: Route A" }
      ]
    },
    // --- ROUTE B (Promise) ---
    {
      id: "end-promise",
      endingName: "結婚約束 (Janji Nikah)",
      type: "GOOD",
      steps: [
        { episode: 3, choiceText: "恋を教える" },
        { episode: 6, choiceText: "告白する" },
        { episode: 7, choiceText: "分からないと伝える" },
        { episode: 8, choiceText: "必ずまた会いに行くと約束する" }
      ]
    },
    {
      id: "end-friend",
      endingName: "お友達からよろしく (Teman)",
      type: "NORMAL",
      steps: [
        { episode: 7, choiceText: "分からないと伝える", note: "Syarat: Route B" },
        { episode: 8, choiceText: "別れることを伝える" }
      ]
    },
    // --- ROUTE C (Apology) ---
    {
      id: "end-apology",
      endingName: "謝罪 (Permintaan Maaf)",
      type: "BAD",
      steps: [
        { episode: 3, choiceText: "恋を教える" },
        { episode: 6, choiceText: "告白しない" },
        { episode: 7, choiceText: "謝罪する" }
      ]
    },
    {
      id: "end-ignore",
      endingName: "未読無視 (Read Ignore)",
      type: "BAD",
      steps: [
        { episode: 6, choiceText: "告白しない", note: "Syarat: Route C" },
        { episode: 7, choiceText: "告白する" }
      ]
    }
  ],

  // ============================================================
  // MOSHIKOI 2411 (Yu Suzumura)
  // ============================================================
  "2411": [
    // --- EARLY BAD ---
    {
      id: "end-suzuki3",
      endingName: "スズキスズキスズキ (Suzuki x3)",
      type: "BAD",
      steps: [
        { episode: 4, choiceText: "思い切って告白する", note: "Nekat confess di Ep 4" }
      ]
    },
    // --- ROUTE A (True/Idol) ---
    {
      id: "end-true",
      endingName: "TRUE END",
      type: "TRUE",
      steps: [
        { episode: 4, choiceText: "名前で呼んでみる" },
        { episode: 5, choiceText: "してみてもいいか尋ねる" },
        { episode: 6, choiceText: "待ってないと嘘をつく" },
        { episode: 7, choiceText: "電話に出る" },
        { episode: 8, choiceText: "俺との結婚" }
      ]
    },
    {
      id: "end-ally",
      endingName: "永遠に君の味方 (Sekutu Abadi)",
      type: "GOOD",
      steps: [
        { episode: 8, choiceText: "役者として、海外進出！", note: "Syarat: Route A" }
      ]
    },
    {
      id: "end-interpret",
      endingName: "解釈違い (Salah Tafsir)",
      type: "BAD",
      steps: [
        { episode: 8, choiceText: "劇場アニメのゲスト声優出演", note: "Syarat: Route A" }
      ]
    },
    // --- ROUTE B (Secret) ---
    {
      id: "end-secret",
      endingName: "秘密の恋愛 (Cinta Rahasia)",
      type: "NORMAL",
      steps: [
        { episode: 4, choiceText: "告白を我慢する" },
        { episode: 6, choiceText: "優先輩と呼ぶ", note: "Panggil Yu-senpai" },
        { episode: 7, choiceText: "電話に出る" },
        { episode: 8, choiceText: "このまま隠し通す" }
      ]
    },
    {
      id: "end-friend",
      endingName: "かけがえのない友達 (Teman Berharga)",
      type: "GOOD",
      steps: [
        { episode: 8, choiceText: "今が別れ時なのかも", note: "Syarat: Route B" }
      ]
    },
    {
      id: "end-single",
      endingName: "生涯独身 (Jomblo Seumur Hidup)",
      type: "BAD",
      steps: [
        { episode: 8, choiceText: "優に委ねる", note: "Syarat: Route B" }
      ]
    },
    // --- ROUTE C (Fear) ---
    {
      id: "end-kowai",
      endingName: "コワイコワイ (Seram)",
      type: "BAD",
      steps: [
        { episode: 4, choiceText: "告白を我慢する" },
        { episode: 7, choiceText: "電話に出ない" },
        { episode: 8, choiceText: "電話に出る" }
      ]
    },
    {
      id: "end-bubble",
      endingName: "泡沫の夢 (Mimpi Semu)",
      type: "BAD",
      steps: [
        { episode: 7, choiceText: "電話に出ない", note: "Syarat: Route C" },
        { episode: 8, choiceText: "電話に出ない" }
      ]
    }
  ],

  // ============================================================
  // MINTSUKU 2505 (Rui, Chisa, Sumire, Nagisa)
  // ============================================================
  "2505": [
    // --- RUI ROUTE ---
    {
      id: "end-lovelove",
      endingName: "ラブラブ大魔王 (Love King)",
      type: "TRUE",
      steps: [
        { episode: 1, choiceText: "ルイ" },
        { episode: 2, choiceText: "ルイ達のことが知りたい" },
        { episode: 3, choiceText: "ルイ" },
        { episode: 4, choiceText: "ルイが好きだから" },
        { episode: 4, choiceText: "ずっとルイのそばにいる" }
      ]
    },
    {
      id: "end-demon",
      endingName: "悪魔召喚 (Summon Demon)",
      type: "BAD",
      steps: [
        { episode: 4, choiceText: "ずっとルイのそばにいる", note: "Jika poin Rui kurang" }
      ]
    },
    // --- CHISA ROUTE ---
    {
      id: "end-chisa",
      endingName: "人間さんと仲良し (Teman Manusia)",
      type: "GOOD",
      steps: [
        { episode: 1, choiceText: "チサ" },
        { episode: 2, choiceText: "怖い" },
        { episode: 3, choiceText: "チサ" },
        { episode: 4, choiceText: "チサが好きだから" },
        { episode: 4, choiceText: "自分の心に従おう" }
      ]
    },
    {
      id: "end-oblivion",
      endingName: "忘却 (Terlupakan)",
      type: "BAD",
      steps: [
        { episode: 4, choiceText: "戦おう", note: "Syarat: Route Chisa" }
      ]
    },
    // --- SUMIRE ROUTE ---
    {
      id: "end-sumire-new",
      endingName: "新しい関係 (Hubungan Baru)",
      type: "GOOD",
      steps: [
        { episode: 1, choiceText: "ヴィオレットって？" },
        { episode: 2, choiceText: "すみれ達と帰る" },
        { episode: 3, choiceText: "手を握る" },
        { episode: 4, choiceText: "行く" },
        { episode: 4, choiceText: "すみれに究極魔法を教える" }
      ]
    },
    {
      id: "end-sumire-magic",
      endingName: "解けない魔法 (Sihir Abadi)",
      type: "BAD",
      steps: [
        { episode: 4, choiceText: "すみれに究極魔法を教えない", note: "Syarat: Route Sumire" }
      ]
    },
    // --- NAGISA ROUTE ---
    {
      id: "end-nagisa-cat",
      endingName: "魔法少女にゃぎさ (Magical Nyagisa)",
      type: "GOOD",
      steps: [
        { episode: 3, choiceText: "渚" },
        { episode: 4, choiceText: "渚は家族だから" },
        { episode: 4, choiceText: "絶対に認めない" }
      ]
    },
    {
      id: "end-bell",
      endingName: "鈴の音 (Suara Lonceng)",
      type: "BAD",
      steps: [
        { episode: 4, choiceText: "渚とお別れする", note: "Syarat: Route Nagisa" }
      ]
    },
    // --- BAD ENDINGS (Ep 5) ---
    {
      id: "end-lonely",
      endingName: "一人ぼっち (Sendirian)",
      type: "BAD",
      steps: [
        { episode: 4, choiceText: "お互いの話を聞く" },
        { episode: 5, choiceText: "魔法少女を選ぶ" }
      ]
    },
    {
      id: "end-bomber",
      endingName: "ボンバー (Bomber)",
      type: "BAD",
      steps: [
        { episode: 5, choiceText: "サキュバスを選ぶ" }
      ]
    },
    {
      id: "end-slap",
      endingName: "ビンタ×４ (Tamparan x4)",
      type: "BAD",
      steps: [
        { episode: 5, choiceText: "やっぱりどちらも選べない" }
      ]
    }
  ]
};