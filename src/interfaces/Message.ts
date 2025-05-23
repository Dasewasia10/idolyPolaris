interface ReplyReference {
  id: number;
  text: string;
  name: string;
}

export interface Message {
  id: number;
  text: string;
  name: string;
  icon: string;
  position: "left" | "right";
  stamp?: string; // Tambahkan stamp opsional
  replyTo?: ReplyReference;
  isCall?: boolean; // Tambahkan field baru untuk identifikasi call
  callDuration?: string; // Durasi panggilan
  callBgColor?: string; // Tambahkan properti untuk warna background
  callIconColor?: string; // Tambahkan properti untuk warna icon
  reactions?: {
    [emoji: string]: string[]; // Key: emoji, Value: array of user IDs/names
  };
}
