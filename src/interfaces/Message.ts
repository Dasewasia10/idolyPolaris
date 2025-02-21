export interface Message {
  id: number;
  text: string;
  name: string;
  icon: string;
  position: "left" | "right";
  stamp?: string; // Tambahkan stamp opsional
}
