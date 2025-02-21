export interface Character {
  id?: number;
  name: string;
  japaneseName: string;
  familyName: string;
  desc: string;
  birthdayDate: string;
  isCenter?: boolean;
  color?: string;
  school?: string;
  fourKomaDesc: string;
  deceasedStatus: boolean;
  groupName: string;
  numeralStat: {
    height: number;
    weight: number;
    hip?: number;
    bust?: number;
    waist?: number;
  };
  badge?: string;
  japaneseBadge?: string;
  seiyuuName: string;
  japaneseSeiyuuName: string;
  mbti?: string;
  srcImage?: {
    iconCharacter?: string;
    spriteCharacter1?: string;
    spriteCharacter2?: string;
    bannerCharacter?: string;
    birthdayCharacter?: string;
    loadingCharacter?: string;
    plateCharacter?: string;
    signatureCharacter?: string;
  };
  like?: string;
  dislike?: string;
}
