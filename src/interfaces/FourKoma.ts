export interface FourKoma {
  id?: number;
  label: string;
  language: string;
  title: string;
  src: string;
  part?: "first" | "second";
  character: string[];
}
