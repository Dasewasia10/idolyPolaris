import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Map,
  Star,
  AlertCircle,
  X,
} from "lucide-react";
import { LOVE_STORY_ROADMAP } from "../assets/roadmap";

interface StrategyGuideProps {
  eventId: string;
  onClose: () => void;
}

const StrategyGuide: React.FC<StrategyGuideProps> = ({ eventId, onClose }) => {
  const routes = LOVE_STORY_ROADMAP[eventId];
  const [openRouteId, setOpenRouteId] = useState<string | null>(null);

  // Background Overlay jika di mobile
  return (
    <div className="absolute inset-0 z-[60] flex justify-end pointer-events-none">
      {/* Container Sidebar */}
      <div className="pointer-events-auto w-80 lg:w-96 h-full bg-[#0f1115] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#161b22]">
          <h2 className="font-black italic text-lg flex items-center gap-2 text-white tracking-tight">
            <Map size={18} className="text-pink-500" />
            STRATEGY <span className="text-gray-500">MAP</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area dengan Scrollbar Konsisten */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {!routes ? (
            <div className="p-6 text-center text-gray-500 flex flex-col items-center">
              <AlertCircle className="mb-2 opacity-50" />
              <p className="text-xs uppercase tracking-widest">
                No Data Available
              </p>
            </div>
          ) : (
            <>
              <p className="text-[10px] text-gray-500 mb-4 uppercase tracking-widest border-b border-white/5 pb-2">
                Select an ending route
              </p>

              {routes.map((route) => (
                <div
                  key={route.id}
                  className="border border-white/10 bg-white/5 transition-all overflow-hidden"
                >
                  {/* Route Header Button */}
                  <button
                    onClick={() =>
                      setOpenRouteId(openRouteId === route.id ? null : route.id)
                    }
                    className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${openRouteId === route.id ? "bg-white/5" : ""}`}
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span
                        className={`text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider border ${getBadgeStyle(route.type)}`}
                      >
                        {route.type} END
                      </span>
                      <span className="font-bold text-sm text-gray-200">
                        {route.endingName}
                      </span>
                    </div>
                    {openRouteId === route.id ? (
                      <ChevronUp size={16} className="text-pink-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    )}
                  </button>

                  {/* Route Steps (Timeline) */}
                  {openRouteId === route.id && (
                    <div className="p-4 bg-black/20 border-t border-white/5">
                      <div className="relative border-l border-white/20 ml-2 space-y-6 my-2 pb-2">
                        {route.steps.map((step, idx) => (
                          <div key={idx} className="relative pl-6">
                            {/* Dot */}
                            <div className="absolute -left-[3px] top-2 w-1.5 h-1.5 bg-pink-500 rotate-45" />

                            {/* Content */}
                            <div className="flex flex-col">
                              <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-mono">
                                Episode {step.episode}
                              </span>
                              <div className="bg-[#1a202c] border-l-2 border-pink-500 p-3 text-xs text-gray-300 font-medium shadow-sm">
                                {step.choiceText}
                              </div>
                              {step.note && (
                                <span className="text-[10px] text-yellow-500/80 mt-1 ml-1 flex items-center gap-1">
                                  <Star size={10} fill="currentColor" />{" "}
                                  {step.note}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* End Node */}
                        <div className="relative pl-6 pt-2">
                          <div className="absolute -left-[3px] top-3 w-1.5 h-1.5 bg-gray-500 rotate-45" />
                          <div className="text-gray-500 text-[10px] uppercase tracking-widest">
                            Result:{" "}
                            <span className="text-white font-bold">
                              {route.endingName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper style untuk badge
const getBadgeStyle = (type: string) => {
  switch (type) {
    case "TRUE":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    case "GOOD":
      return "bg-green-500/10 text-green-400 border-green-500/30";
    case "BAD":
      return "bg-red-500/10 text-red-400 border-red-500/30";
    default:
      return "bg-blue-500/10 text-blue-400 border-blue-500/30";
  }
};

export default StrategyGuide;
