import { Message } from "../interfaces/Message";

const API_BASE_URL = "https://api.diveidolypapi.my.id";

const importFromJson = (
  file: File,
  setTitle: (title: string) => void,
  setMessages: (msgs: Message[]) => void,
  setToastMessage: (msg: string) => void,
  setIsSuccess: (success: boolean) => void,
) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target?.result as string);

      // Ambil title dari nama file (opsional, sesuaikan logic lamamu)
      const fileName = file.name.replace("chat_", "").replace(".json", "");
      setTitle(fileName);

      // --- LOGIC RECONSTRUCT URL ---
      const restoreIconUrl = (shortCode: string) => {
        if (shortCode.startsWith("icon:")) {
          const name = shortCode.replace("icon:", "");
          return `${API_BASE_URL}/iconCharacter/chara-${name}.png`;
        }
        return shortCode; // Kembalikan apa adanya jika itu Base64 atau URL lain
      };

      const restoreStampUrl = (shortCode: string | undefined) => {
        if (!shortCode) return undefined;
        if (shortCode.startsWith("stamp:")) {
          const name = shortCode.replace("stamp:", "");
          return `${API_BASE_URL}/stampChat/stamp_${name}.webp`;
        }
        return shortCode;
      };

      // Proses data JSON yang masuk
      const restoredMessages = json.map((msg: any) => ({
        ...msg,
        icon: restoreIconUrl(msg.icon),
        stamp: restoreStampUrl(msg.stamp),
      }));

      setMessages(restoredMessages);
      setToastMessage("Chat imported successfully!");
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      setToastMessage("Invalid JSON file");
      setIsSuccess(false);
    }
  };

  reader.readAsText(file);
};

export default importFromJson;
