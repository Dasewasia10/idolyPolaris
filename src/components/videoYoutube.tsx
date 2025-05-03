//import { useState } from "react";
import Draggable from "react-draggable";

interface VideoModalProps {
  src?: string;
  thumbnail?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isSmall: boolean;
  setIsSmall: (small: boolean) => void;
}

export default function VideoModal({
  src,
  // thumbnail,
  isOpen,
  setIsOpen,
  isSmall,
  setIsSmall,
}: VideoModalProps) {
  // const handleThumbnailClick = () => {
  //   if (!src) {
  //     alert("Video source is not available.");
  //     return;
  //   }
  //   setIsOpen(true);
  // };

  const toggleSize = () => {
    setIsSmall(!isSmall);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Thumbnail + Logo YouTube */}
      {/* <div className="relative cursor-pointer" onClick={handleThumbnailClick}>
        <img
          src={thumbnail || "assets/default_image.png"}
          alt="YouTube Thumbnail"
          className="w-80 rounded-md shadow-lg"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md">
          <img
            src="assets/Youtube_Logo.png"
            alt="YouTube Logo"
            className="w-6 md:w-10 lg:w-16 opacity-90"
          />
        </div>
      </div> */}

      {/* Draggable Modal */}
      {isOpen && (
        <Draggable>
          <div className="fixed top-0 left-0 bg-white p-4 rounded-lg shadow-lg z-50 w-auto h-auto">
            <div className="flex justify-between py-1">
              <button
                className={`text-gray-600 hover:text-gray-900 ${
                  isSmall ? "text-sm" : "text-xl"
                }`}
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                ✖
              </button>
              <button
                className={`text-gray-600 hover:text-gray-900 ${
                  isSmall ? "text-sm" : "text-xl"
                }`}
                onClick={toggleSize}
                title={isSmall ? "Expand" : "Shrink"}
              >
                {isSmall ? "🔍" : "🔎"}
              </button>
            </div>
            <iframe
              width={isSmall ? "200" : "560"}
              height={isSmall ? "108" : "315"}
              src={`${src}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </Draggable>
      )}
    </div>
  );
}

