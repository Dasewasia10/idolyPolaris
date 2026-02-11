import React from "react";
import Draggable from "react-draggable";
import { X, Maximize2, Minimize2, GripHorizontal } from "lucide-react";

interface VideoModalProps {
  src?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isSmall: boolean;
  setIsSmall: (small: boolean) => void;
}

const VideoModal: React.FC<VideoModalProps> = ({
  src,
  isOpen,
  setIsOpen,
  isSmall,
  setIsSmall,
}) => {
  if (!isOpen || !src) return null;

  const toggleSize = () => {
    setIsSmall(!isSmall);
  };

  return (
    // Wrapper z-index sangat tinggi agar selalu di atas lirik
    <div className="fixed z-[100] top-0 left-0 pointer-events-none">
      <Draggable handle=".drag-handle" bounds="body">
        <div
          className={`pointer-events-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isSmall ? "w-[300px]" : "w-[90vw] max-w-2xl"
          }`}
        >
          {/* Header / Drag Handle */}
          <div className="drag-handle bg-gray-800 p-2 flex justify-between items-center cursor-move group hover:bg-gray-750 transition-colors">
            <div className="flex items-center gap-2 text-gray-400 group-hover:text-white">
              <GripHorizontal size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">
                YouTube Player
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleSize}
                className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-blue-400 transition-colors"
                title={isSmall ? "Expand" : "Minimize"}
              >
                {isSmall ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400 transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Video Container */}
          <div className="relative w-full aspect-video bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`${src}?autoplay=1&modestbranding=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default VideoModal;
