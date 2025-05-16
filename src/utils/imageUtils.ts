// src/utils/imageUtils.ts
export const getGroupImageUrl = (groupName: string): string => {
  const groupImages: { [key: string]: string } = {
    "Tsuki no Tempest":
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727214/Tsuki_Logo_m2cywh.png",
    "Sunny Peace":
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727210/Sunny_Logo_zo3nm5.png",
    TRINITYAiLE:
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727212/TRINITYAiLE_Logo_zz8ti9.png",
    LizNoir:
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727209/LizNoir_Logo_wzslxc.png",
    "Mana Nagase":
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727209/Mana_Logo_ket6vy.png",
    IIIX: "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727209/IIIX_Logo_iwc2mt.png",
    Gochiusa:
      "https://api.diveidolypapi.my.id/idolGroup/group-gochiusa-full.jpg",
    Aqours: "https://api.diveidolypapi.my.id/idolGroup/group-aquors-full.png",
    Miku: "https://api.diveidolypapi.my.id/idolGroup/group-miku-full.png",
  };

  return groupImages[groupName] || "";
};

export const getCardAttributeImageUrl = (attributeName: string): string => {
  const attributeImages: { [key: string]: string } = {
    Dance:
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727190/Dance_lipjkh.png",
    Vocal:
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727193/Vocal_egbyet.png",
    Visual:
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727193/Visual_lcurdo.png",
  };

  return attributeImages[attributeName] || "";
};

export const getCardTypeImageUrl = (typeName: string): string => {
  const typeImages: { [key: string]: string } = {
    Scorer:
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727174/scorer-color_k6lxzq.png",
    Buffer:
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727174/buffer-color_t2jgbo.png",
    Supporter:
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727175/supporter-color_qnhj59.png",
  };

  return typeImages[typeName] || "";
};

export const getCardTypeImageUrl2 = (typeName2: string): string => {
  const typeImages2: { [key: string]: string } = {
    Scorer:
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727174/scorer-white_zqujnv.png",
    Buffer:
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727174/buffer-white_ra0vwg.png",
    Supporter:
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727175/supporter-white_sv2p2s.png",
  };

  return typeImages2[typeName2] || "";
};

export const getAttributeImageUrl = (typeName: string): string => {
  const attributeImages: { [key: string]: string } = {
    Dance:
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727190/Dance_lipjkh.png",
    Vocal:
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727193/Vocal_egbyet.png",
    Visual:
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727193/Visual_lcurdo.png",
    Stamina:
      "https://res.cloudinary.com/dzxqhtaxf/image/upload/v1724727190/Stamina_kyp9ut.png",
  };

  return attributeImages[typeName] || "";
};

export const getMusicJacketGroupImageUrl = (groupName: string): string => {
  const groupImages: { [key: string]: string } = {
    "Tsuki no Tempest":
      "https://api.diveidolypapi.my.id/musicJacket/img_music_jacket_moon-001.png",
    "Sunny Peace":
      "https://api.diveidolypapi.my.id/musicJacket/img_music_jacket_sun-001.png",
    TRINITYAiLE:
      "https://api.diveidolypapi.my.id/musicJacket/img_music_jacket_tri-001.png",
    LizNoir:
      "https://api.diveidolypapi.my.id/musicJacket/img_music_jacket_liz-001.png",
    IIIX: "https://api.diveidolypapi.my.id/musicJacket/img_music_jacket_thrx-001.png",
    "Mana Nagase":
      "https://api.diveidolypapi.my.id/musicJacket/img_music_jacket_mna-003.png",
  };
  return groupImages[groupName] || "";
};

export const getCharacter3ImageUrl = (characterName: string): string => {
  const characterImages: { [key: string]: string } = {
    Kotono:
      "https://api.diveidolypapi.my.id/image3Character/source-kotono-05-fes-01-full.webp",
    Nagisa:
      "https://api.diveidolypapi.my.id/image3Character/source-nagisa-05-fes-02-full.webp",
    Mei: "https://api.diveidolypapi.my.id/image3Character/source-mei-05-rock-00-full.webp",
    Suzu: "https://api.diveidolypapi.my.id/image3Character/source-suzu-05-premium-01-full.webp",
    Saki: "https://api.diveidolypapi.my.id/image3Character/source-saki-05-birthday-01-full.webp",
    Sakura:
      "https://api.diveidolypapi.my.id/image3Character/source-sakura-05-cheerleader-00-full.webp",
    Shizuku:
      "https://api.diveidolypapi.my.id/image3Character/source-shizuku-05-yuru-00-full.webp",
    Chisa:
      "https://api.diveidolypapi.my.id/image3Character/source-chisa-05-pair-00-full.webp",
    Haruko:
      "https://api.diveidolypapi.my.id/image3Character/source-haruko-05-fes-00-full.webp",
    Rei: "https://api.diveidolypapi.my.id/image3Character/source-rei-05-rock-00-full.webp",
    Rui: "https://api.diveidolypapi.my.id/image3Character/source-rui-05-fes-01-full.webp",
    Sumire:
      "https://api.diveidolypapi.my.id/image3Character/source-sumire-05-fes-00-full.webp",
    Yu: "https://api.diveidolypapi.my.id/image3Character/source-yu-05-fes-00-full.webp",
    Rio: "https://api.diveidolypapi.my.id/image3Character/source-rio-05-fes-03-full.webp",
    Aoi: "https://api.diveidolypapi.my.id/image3Character/source-aoi-05-fes-00-full.webp",
    Ai: "https://api.diveidolypapi.my.id/image3Character/source-ai-05-rock-00-full.webp",
    Kokoro:
      "https://api.diveidolypapi.my.id/image3Character/source-kokoro-05-fes-00-full.webp",
    fran: "https://api.diveidolypapi.my.id/image3Character/source-fran-05-idoloutfit-03-full.webp",
    kana: "https://api.diveidolypapi.my.id/image3Character/source-kana-05-china-00-full.webp",
    miho: "https://api.diveidolypapi.my.id/image3Character/source-miho-05-idoloutfit-00-full.webp",
    Mana: "https://api.diveidolypapi.my.id/image3Character/source-mana-05-idoloutfit-00-full.webp",
  };

  return characterImages[characterName] || "";
};

export const getGiftItemImageUrl = (
  characterName: string,
  index: number = 0
): string => {
  // Mapping tipe hadiah untuk setiap karakter
  const characterGiftTypes: Record<string, string> = {
    Kotono: "stoic",
    Nagisa: "sweet",
    Mei: "sweet",
    Suzu: "snack",
    Saki: "adult",
    Sakura: "snack",
    Shizuku: "snack",
    Chisa: "snack",
    Haruko: "adult",
    Rei: "stoic",
    Rui: "stoic",
    Sumire: "snack",
    Yu: "adult",
    Rio: "sweet",
    Aoi: "stoic",
    Ai: "stoic",
    Kokoro: "sweet",
    fran: "adult",
    kana: "sweet",
    miho: "adult",
    Mana: "rice",
  };

  const type = characterGiftTypes[characterName];
  if (!type) return "";

  // Validasi index antara 0-1 (untuk memilih gambar pertama atau kedua)
  const validatedIndex = Math.max(0, Math.min(1, index));
  const indexStr = validatedIndex === 0 ? "01" : "02";

  return `https://api.diveidolypapi.my.id/giftItem/img_item_thumb_enjoy-present-${type}-${indexStr}-01.png`;
};

export const getPlaceholderImageUrl = (typeName: string): string => {
  const placeholderImages: { [key: string]: string } = {
    square: "https://fakeimg.pl/500x500?text=None+To+View+Here&font=bebas",
  };

  return placeholderImages[typeName];
};
