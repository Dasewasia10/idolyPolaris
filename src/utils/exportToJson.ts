import { saveAs } from "file-saver";
import { Message } from "../interfaces/Message";

const exportToJson = (title: string, messages: Message[]) => {
  // 1. Fungsi untuk memendekkan URL Icon
  const shortenIconUrl = (url: string) => {
    // Pola: .../iconCharacter/chara-{name}.png
    const match = url.match(/chara-(.+?)\.png$/);
    return match ? `icon:${match[1]}` : url; // Jika cocok jadi 'icon:ai', jika tidak biarkan url asli (misal base64)
  };

  // 2. Fungsi untuk memendekkan URL Stamp
  const shortenStampUrl = (url: string | undefined) => {
    if (!url) return undefined;
    // Pola: .../stampChat/stamp_{name}-{expression}.webp
    const match = url.match(/stamp_(.+?)\.webp$/);
    return match ? `stamp:${match[1]}` : url;
  };

  // 3. Proses semua pesan sebelum disimpan
  const optimizedMessages = messages.map((msg) => ({
    ...msg,
    icon: shortenIconUrl(msg.icon),
    stamp: shortenStampUrl(msg.stamp),
    // ReplyTo juga punya icon, kita pendekkan juga jika ada
    replyTo: msg.replyTo
      ? {
          ...msg.replyTo,
          // Note: replyTo di interface kamu mungkin tidak menyimpan icon,
          // tapi jika nanti menyimpan, logicnya sama.
        }
      : undefined,
  }));

  // 4. Simpan File
  const blob = new Blob([JSON.stringify(optimizedMessages, null, 2)], {
    type: "application/json",
  });
  saveAs(blob, `chat_${title}.json`);
};

export default exportToJson;
