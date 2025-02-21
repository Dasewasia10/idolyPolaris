export interface Lyric {
  title: string;
  alternateTitle?: string;
  jpTitle: string;
  kanji: Array<string | null>;
  romaji: Array<string | null>;
  english: Array<string | null>;
  indonesian: Array<string | null>;
  character: Array<string | null>;
  group: string;
  altGroup: string;
  releaseDate: string;
  lyricist: string;
  composer: string;
  arranger: string;
  video?: string;
  videoThumbnail?: string;
  source?: string;
}
