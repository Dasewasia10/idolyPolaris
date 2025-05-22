import { Icon } from "./Icon";

export interface CallLog {
  id: number;
  caller: Icon; // Menggunakan interface Icon yang sudah ada
  receiver: Icon;
  duration: string; // Format: "mm:ss"
  timestamp: string; // ISO format
}
