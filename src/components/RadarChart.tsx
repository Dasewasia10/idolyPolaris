import React from "react";

interface RadarChartProps {
  userTraits: Record<string, number>;
  idolTraits: Record<string, number>;
  // Tambahan opsional: Warna tema idol/grup (contoh: "#eab308" untuk Sunny Peace)
  idolThemeColor?: string; 
}

const TRAITS = [
  "Extrovert",
  "Judging",
  "Logic",
  "Confidence",
  "Ambition",
  "Composure",
  "Unique",
  "Empathy",
];

export const RadarChart: React.FC<RadarChartProps> = ({
  userTraits,
  idolTraits,
  idolThemeColor = "#9ca3af", // Default warna abu-abu
}) => {
  const size = 300;
  const center = size / 2;
  const radius = size / 2 - 40;

  const getPoint = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const distance = (value / 100) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  };

  const userPoints = TRAITS.map((t, i) =>
    getPoint(userTraits[t] || 0, i, TRAITS.length),
  )
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
    
  const idolPoints = TRAITS.map((t, i) =>
    getPoint(idolTraits[t] || 0, i, TRAITS.length),
  )
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="relative w-full flex items-center justify-center font-sans">
      <svg className="w-full h-auto max-w-[300px]" viewBox={`0 0 ${size} ${size}`}>
        {/* Draw Web Grid */}
        {gridLevels.map((level) => {
          const points = TRAITS.map((_, i) =>
            getPoint(100 * level, i, TRAITS.length),
          )
            .map((p) => `${p.x},${p.y}`)
            .join(" ");
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Draw Spokes */}
        {TRAITS.map((_, i) => {
          const p = getPoint(100, i, TRAITS.length);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Idol Polygon (Base) - Ditambah transition */}
        <polygon
          points={idolPoints}
          fill={idolThemeColor}
          fillOpacity="0.2"
          stroke={idolThemeColor}
          strokeWidth="2"
          strokeDasharray="4 4"
          className="transition-all duration-700 ease-in-out"
        />

        {/* User Polygon (Active) - Ditambah transition */}
        <polygon
          points={userPoints}
          fill="rgba(6, 182, 212, 0.5)"
          stroke="#06b6d4"
          strokeWidth="2"
          className="transition-all duration-700 ease-in-out"
        />

        {/* Axis Labels */}
        {TRAITS.map((t, i) => {
          const p = getPoint(120, i, TRAITS.length);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              fill="#9ca3af"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {t}
            </text>
          );
        })}
      </svg>
    </div>
  );
};