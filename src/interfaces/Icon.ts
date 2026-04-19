import { Character } from "./Character";

export interface Icon {
  id: number;
  name: string;
  src: string;
  rawData?: Character;
}
