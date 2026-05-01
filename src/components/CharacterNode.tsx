import React from "react";
import { Handle, Position } from "@xyflow/react";

interface CharacterNodeProps {
  data: {
    name: string;
    image: string;
    borderColor: string;
  };
}

const CharacterNode: React.FC<CharacterNodeProps> = ({ data }) => {
  return (
    <div className="flex flex-col items-center group cursor-pointer relative">
      {/* HANDLE ATAS & BAWAH (Tetap Standar) */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="opacity-0"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="opacity-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="opacity-0"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="opacity-0"
      />

      {/* --- HANDLE KIRI (DIPICAH JADI 2 POSISI) --- */}
      {/* Posisi agak ke atas (top: 20%) */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-source-top"
        style={{ top: "20%" }}
        className="opacity-0"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target-top"
        style={{ top: "20%" }}
        className="opacity-0"
      />
      {/* Posisi agak ke bawah (top: 50%) */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-source-bottom"
        style={{ top: "50%" }}
        className="opacity-0"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target-bottom"
        style={{ top: "50%" }}
        className="opacity-0"
      />

      {/* --- HANDLE KANAN (DIPICAH JADI 2 POSISI) --- */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source-top"
        style={{ top: "20%" }}
        className="opacity-0"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target-top"
        style={{ top: "20%" }}
        className="opacity-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source-bottom"
        style={{ top: "50%" }}
        className="opacity-0"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target-bottom"
        style={{ top: "50%" }}
        className="opacity-0"
      />

      {/* --- HANDLE KIRI Standard --- */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        style={{ top: "35%" }}
        className="opacity-0 pointer-events-none"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        style={{ top: "35%" }}
        className="opacity-0 pointer-events-none"
      />

      {/* --- HANDLE KANAN Standard --- */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        style={{ top: "35%" }}
        className="opacity-0 pointer-events-none"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        style={{ top: "35%" }}
        className="opacity-0 pointer-events-none"
      />

      {/* VISUAL KARAKTER */}
      <div
        className={`w-20 h-20 rounded-full border-4 ${data.borderColor} bg-slate-800 overflow-hidden shadow-lg transition-transform hover:scale-110 relative z-10`}
      >
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="px-3 py-1 relative z-10">
        <span className="text-white text-[10px] font-bold tracking-wider whitespace-nowrap items-center">
          {data.name}
        </span>
      </div>
    </div>
  );
};

export default CharacterNode;
