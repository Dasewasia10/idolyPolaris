import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

const MaintenanceNotice: React.FC = () => {
  const [showNotice, setShowNotice] = useState(true);
  const [progress, setProgress] = useState(100);

  const requestRef = useRef<number>();
  const startTimeRef = useRef<number | null>(null);
  const DURATION = 8000;

  useEffect(() => {
    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const newProgress = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(newProgress);

      if (elapsed >= DURATION) {
        setShowNotice(false);
      } else {
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  if (!showNotice) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] animate-in slide-in-from-left duration-500">
      <div className="bg-[#0f1115] border border-yellow-500/50 w-80 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.2)] overflow-hidden relative">
        {/* Striped Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] pointer-events-none"></div>

        <div className="p-4 flex gap-3 relative z-10">
          <div className="shrink-0 p-2 bg-yellow-500/20 rounded border border-yellow-500/50 text-yellow-500 h-fit">
            <AlertTriangle size={24} />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-bold text-yellow-100 uppercase tracking-wide">
                System Maintenance
              </h3>
              <button
                onClick={() => setShowNotice(false)}
                className="text-gray-500 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Card database is currently undergoing scheduled maintenance. Some
              data may be unavailable.
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-gray-800">
          <div
            className="h-full bg-yellow-500 transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default MaintenanceNotice;
