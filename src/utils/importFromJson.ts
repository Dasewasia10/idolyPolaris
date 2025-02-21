const importFromJson = async (file: File, setTitle: Function, setMessages: Function, setToastMessage: Function, setIsSuccess: Function) => {
  try {
    // Cek apakah file adalah JSON
    if (file.type !== "application/json") {
      throw new Error("File must be a JSON file");
    }

    const text = await file.text();
    const data = JSON.parse(text);

    // Validasi format JSON
    if (!data.title || !data.messages) {
      throw new Error("Invalid JSON format: Missing 'title' or 'messages'");
    }

    // Validasi properti 'messages'
    if (!Array.isArray(data.messages)) {
      throw new Error("Invalid JSON format: 'messages' should be an array");
    }

    // Validasi setiap elemen dalam 'messages'
    data.messages.forEach((message: any, index: number) => {
      if (
        typeof message.id !== "number" ||
        typeof message.text !== "string" ||
        typeof message.name !== "string" ||
        typeof message.icon !== "string" ||
        typeof message.position !== "string"
      ) {
        throw new Error(`Invalid JSON format: Message at index ${index} has invalid properties`);
      }
    });

    // Jika semua validasi berhasil, set title dan messages
    setTitle(data.title);
    setMessages(data.messages);

    // Menampilkan Toast success
    setToastMessage("Import Successful!");
    setIsSuccess(true);
  } catch (error: any) {
    console.error("Failed to import JSON:", error);
    // Menampilkan Toast error
    setToastMessage(`Error: ${error.message}`);
    setIsSuccess(false);
  }
};

export default importFromJson;
