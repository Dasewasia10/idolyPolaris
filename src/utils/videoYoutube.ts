// Fungsi untuk memformat URL YouTube dengan parameter yang diinginkan
export const getYouTubeUrl = (url: string | undefined, isMobile: boolean) => {
  if (!url) return "";

  // Konversi URL normal ke URL embed jika diperlukan
  let videoId = url;
  if (url.includes("youtube.com/watch?v=")) {
    videoId = url.split("v=")[1].split("&")[0];
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  }

  const baseUrl = "https://www.youtube.com/embed/";
  const params = new URLSearchParams();

  // Parameter dasar
  params.append("autoplay", "1");
  params.append("rel", "0"); // Menyembunyikan video terkait di akhir

  if (isMobile) {
    // Untuk mobile: sembunyikan kontrol dan tampilkan audio saja
    params.append("controls", "0");
    params.append("showinfo", "0");
    params.append("modestbranding", "1");
  } else {
    // Untuk desktop: tampilkan kontrol normal
    params.append("controls", "1");
  }

  return `${baseUrl}${videoId}?${params.toString()}`;
};
