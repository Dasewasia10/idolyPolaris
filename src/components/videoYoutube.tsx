import { useRef } from "react";
import Draggable from "react-draggable";
import { X, Minimize2, Maximize2, GripHorizontal } from "lucide-react";

interface VideoModalProps {
  src?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isSmall: boolean;
  setIsSmall: (small: boolean) => void;
}

export default function VideoModal({
  src,
  isOpen,
  setIsOpen,
  isSmall,
  setIsSmall,
}: VideoModalProps) {
  // FIX: Menggunakan nodeRef untuk menghilangkan warning deprecated findDOMNode
  const nodeRef = useRef<HTMLDivElement>(null);

  const toggleSize = () => {
    setIsSmall(!isSmall);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-end sm:items-start justify-end sm:justify-start sm:p-4 top-20 left-0">
      {/* FIX: Tambahkan nodeRef di sini */}
      <Draggable handle=".drag-handle" bounds="body" nodeRef={nodeRef}>
        {/* FIX: Tambahkan ref={nodeRef} di sini */}
        <div
          ref={nodeRef}
          className="pointer-events-auto bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 w-full sm:w-auto"
        >
          {/* Header / Drag Handle */}
          <div className="drag-handle cursor-grab active:cursor-grabbing bg-gradient-to-r from-gray-800 to-gray-900 p-2 flex justify-between items-center border-b border-gray-700 select-none">
            <div className="flex items-center gap-2 text-gray-400">
              <GripHorizontal size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">
                YouTube Player
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white transition-colors"
                onClick={toggleSize}
                title={isSmall ? "Expand" : "Shrink"}
              >
                {isSmall ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-md text-gray-400 transition-colors"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Iframe Container */}
          <div
            className={`transition-all duration-300 ease-in-out bg-black ${isSmall ? "w-[280px] h-[158px]" : "w-full sm:w-[560px] aspect-video"}`}
          >
            <iframe
              width="100%"
              height="100%"
              src={`${src}?autoplay=1&enablejsapi=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </Draggable>
    </div>
  );
}
