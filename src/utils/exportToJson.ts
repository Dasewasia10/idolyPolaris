import { saveAs } from "file-saver";

const exportToJson = (title: string, messages: Array<any>) => {
  const data = {
    title,
    messages,
  };

  const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  saveAs(jsonBlob, `${title}.json`);
};

export default exportToJson;