import { useMemo } from "react";

const VideoBackground = () => {
  const videoList = [
    "mov_card_full_ai-05-fest-00.mp4",
    "mov_card_full_aoi-05-fest-00.mp4",
    "mov_card_full_cca-05-goch-00.mp4",
    "mov_card_full_chk-05-sush-00.mp4",
    "mov_card_full_chn-05-goch-00.mp4",
    "mov_card_full_chs-05-flow-00.mp4",
    "mov_card_full_hrk-05-vlnt-00.mp4",
    "mov_card_full_kan-05-idol-03.mp4",
    "mov_card_full_kkr-05-pair-00.mp4",
    "mov_card_full_kor-05-xmas-00.mp4",
    "mov_card_full_ktn-05-mnab-00.mp4",
    "mov_card_full_mei-05-fest-02.mp4",
    "mov_card_full_mhk-05-idol-03.mp4",
    "mov_card_full_mna-05-prem-01.mp4",
    "mov_card_full_ngs-05-akma-00.mp4",
    "mov_card_full_rei-05-casl-02.mp4",
    "mov_card_full_rik-05-sush-00.mp4",
    "mov_card_full_rio-05-past-00.mp4",
    "mov_card_full_rui-05-prem-01.mp4",
    "mov_card_full_ski-05-xmas-00.mp4",
    "mov_card_full_skr-05-vlnt-00.mp4",
    "mov_card_full_smr-05-nurs-00.mp4",
    "mov_card_full_suz-05-prem-01.mp4",
    "mov_card_full_szk-05-yukt-00.mp4",
    "mov_card_full_ymk-05-miku-01.mp4",
    "mov_card_full_yo-05-sush-00.mp4",
    "mov_card_full_yu-05-wedd-01.mp4",
  ];

  const randomVideo = useMemo(() => {
    const index = Math.floor(Math.random() * videoList.length);
    return `https://api.diveidolypapi.my.id/videoBg/${videoList[index]}`;
  }, []); // hanya dijalankan sekali saat render pertama

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
      <video
        autoPlay
        muted
        playsInline
        className="object-cover w-full h-full"
      >
        <source src={randomVideo} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoBackground;
