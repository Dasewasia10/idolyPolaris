import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Map,
  Star,
  AlertCircle,
} from "lucide-react";
import { LOVE_STORY_ROADMAP } from "../assets/roadmap";

interface StrategyGuideProps {
  eventId: string; // ID Event (misal "2305")
  onClose: () => void;
}

const StrategyGuide: React.FC<StrategyGuideProps> = ({ eventId, onClose }) => {
  const routes = LOVE_STORY_ROADMAP[eventId];
  const [openRouteId, setOpenRouteId] = useState<string | null>(null);

  if (!routes) {
    return (
      <div className="p-6 text-center text-gray-400">
        <AlertCircle className="mx-auto mb-2" />
        <p>No guide available for this story yet.</p>
      </div>
    );
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "TRUE":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "GOOD":
        return "bg-green-500/20 text-green-300 border-green-500/50";
      case "BAD":
        return "bg-red-500/20 text-red-300 border-red-500/50";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/50";
    }
  };

  return (
    <div className="absolute inset-y-0 right-0 w-80 lg:w-96 bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-950">
        <h2 className="font-bold text-lg flex items-center gap-2 text-white">
          <Map size={18} className="text-pink-400" />
          Strategy Roadmap
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white px-2"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        <p className="text-xs text-gray-500 mb-4 italic">
          Select an ending to view the required choices.
        </p>

        {routes.map((route) => (
          <div
            key={route.id}
            className="border border-gray-700 rounded-xl overflow-hidden bg-gray-800/30"
          >
            {/* Route Header */}
            <button
              onClick={() =>
                setOpenRouteId(openRouteId === route.id ? null : route.id)
              }
              className="w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors"
            >
              <div className="flex flex-col items-start gap-1">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded border font-bold ${getBadgeColor(route.type)}`}
                >
                  {route.type} END
                </span>
                <span className="font-bold text-sm text-gray-200">
                  {route.endingName}
                </span>
              </div>
              {openRouteId === route.id ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {/* Route Steps (Timeline) */}
            {openRouteId === route.id && (
              <div className="bg-gray-900/50 p-4 border-t border-gray-700">
                <div className="relative border-l-2 border-gray-700 ml-2 space-y-6 my-2">
                  {route.steps.map((step, idx) => (
                    <div key={idx} className="relative pl-6">
                      {/* Dot */}
                      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]" />

                      {/* Content */}
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Episode {step.episode}
                        </span>
                        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-pink-200 font-medium shadow-sm">
                          {step.choiceText}
                        </div>
                        {step.note && (
                          <span className="text-[10px] text-yellow-500/80 mt-1 ml-1 flex items-center gap-1">
                            <Star size={10} /> {step.note}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* End Node */}
                  <div className="relative pl-6 pt-2">
                    <div className="absolute -left-[5px] top-3 w-2.5 h-2.5 bg-gray-500 rounded-full" />
                    <div className="text-gray-400 text-xs italic">
                      Reaching:{" "}
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
      </div>
    </div>
  );
};

export default StrategyGuide;
