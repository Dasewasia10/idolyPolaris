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

export const getPlaceholderImageUrl = (typeName: string): string => {
  const placeholderImages: { [key: string]: string } = {
    square: "https://fakeimg.pl/500x500?text=None+To+View+Here&font=bebas",
  };

  return placeholderImages[typeName];
};
