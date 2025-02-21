export interface Card {
  id?: number;
  initialTitle: string;
  title: {
    japanese?: string;
    global?: string;
    indo?: string;
  };
  description: {
    japanese?: Array<string>;
    global?: Array<string>;
    indo?: Array<string>;
  };
  releaseDate: string;
  category: string;
  costumeTheme: string;
  type: "Scorer" | "Buffer" | "Supporter";
  attribute: "Dance" | "Vocal" | "Visual";
  hasAwakening?: boolean;
  initial: number;
  stats: {
    dance: number;
    vocal: number;
    visual: number;
    stamina: number;
    total: number;
  };
  skillOne: {
    typeSkill: "SP" | "A" | "P";
    name: {
      japanese?: string;
      global?: string;
      indo?: string;
    };
    description: {
      japanese?: Array<string>;
      global?: Array<string>;
      indo?: Array<string>;
    };
    ct: number;
    staminaUsed: number;
    probability?: number;
    source?: {
      initialImage: string;
      topRightImage?: string;
      bottomRightImage?: string;
      color: string;
    };
  };
  skillTwo: {
    typeSkill: "SP" | "A" | "P";
    name: {
      japanese?: string;
      global?: string;
      indo?: string;
    };
    description: {
      japanese?: Array<string>;
      global?: Array<string>;
      indo?: Array<string>;
    };
    ct: number;
    staminaUsed: number;
    probability?: number;
    source?: {
      initialImage: string;
      topRightImage?: string;
      bottomRightImage?: string;
      color: string;
    };
  };
  skillThree: {
    typeSkill: "SP" | "A" | "P";
    name: {
      japanese?: string;
      global?: string;
      indo?: string;
    };
    description: {
      japanese?: Array<string>;
      global?: Array<string>;
      indo?: Array<string>;
    };
    ct: number;
    staminaUsed: number;
    probability?: number;
    source?: {
      initialImage: string;
      topRightImage?: string;
      bottomRightImage?: string;
      color: string;
    };
  };
  skillFour?: {
    typeSkill: "SP" | "A" | "P";
    name: {
      japanese?: string;
      global?: string;
      indo?: string;
    };
    description: {
      japanese?: Array<string>;
      global?: Array<string>;
      indo?: Array<string>;
    };
    ct: number;
    staminaUsed: number;
    probability?: number;
    source?: {
      initialImage: string;
      topRightImage?: string;
      bottomRightImage?: string;
      color: string;
    };
  };
  yell?: {
    name?: {
      japanese?: string;
      global?: string;
      indo?: string;
    };
    description?: {
      japanese?: string;
      global?: string;
      indo?: string;
    };
    source?: {
      initialImage: string;
      topRightImage?: string;
      bottomRightImage?: string;
      color: string;
    };
  };
  imageSource: {
    costumeIcon?: string;
    figureImageB?: string;
    iconImage: string;
    iconImageB?: string;
    sourceImage: string;
    verticalImage: string;
    verticalImageB?: string;
  };
  battleCommentary?: {
    japanese?: Array<string>;
    global?: Array<string>;
    indo?: Array<string>;
  };
  explanation?: {
    japanese?: Array<string>;
    global?: Array<string>;
    indo?: Array<string>;
  };
}

export interface Source {
  name: string;
  data: Card[];
}