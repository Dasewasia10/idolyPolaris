import React, { useState, useEffect, useRef } from "react";

const MaintenanceNotice: React.FC = () => {
  const [showNotice, setShowNotice] = useState(true);
  const [progress, setProgress] = useState(100);
  
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number | null>(null);
  const DURATION = 8000; // 8 detik agar user sempat membaca pesan yang agak panjang

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
    // Posisi di kiri (left-4)
    <div className="fixed bottom-4 left-4 z-50 animate-fade-in-up">
      <div className="bg-white rounded-lg shadow-xl border border-blue-200 w-80 overflow-hidden">
        
        {/* Header - Biru Cantik */}
        <div className="bg-blue-600 p-2 text-white font-bold flex justify-between items-center">
          <span className="text-sm flex items-center gap-2">
            <span className="animate-pulse">🛠️</span> System Update
          </span>
          <button onClick={() => setShowNotice(false)} className="hover:text-blue-200 text-xl leading-none">×</button>
        </div>

        {/* Content */}
        <div className="p-4 flex items-start gap-3">
          {/* Gambar/Icon di sisi kiri teks */}
          <div className="flex-shrink-0 mt-1">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-300">
               {/* Kamu bisa ganti <img> jika ada icon spesifik */}
               <span className="text-2xl">🚧</span>
            </div>
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 leading-snug">
              All card pages & related features will be in maintenance mode. 
              Expect some bugs or glitches, but bear with me!
            </p>
            <p className="text-[10px] text-blue-500 font-bold mt-2 uppercase tracking-wider">
              Thank you for your patience!
            </p>
          </div>
        </div>

        {/* Progress Bar - Biru */}
        <div className="h-1.5 w-full bg-gray-100">
          <div
            className="h-full bg-blue-500 transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default MaintenanceNotice;