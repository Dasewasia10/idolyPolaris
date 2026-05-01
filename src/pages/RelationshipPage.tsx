import React, { useEffect, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css"; // Wajib di-import agar tidak berantakan

import CharacterNode from "../components/CharacterNode";
import MultilineEdge from "../components/MultilineEdge";
import { initialNodes, initialEdges } from "../data/relationshipData";

const RelationshipPage: React.FC = () => {
  // Setup state untuk node dan edge
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Mendaftarkan custom node
  const nodeTypes = useMemo(() => ({ character: CharacterNode }), []);

  // 2. Daftarkan multiline ke edgeTypes
  const edgeTypes = useMemo(() => ({ multiline: MultilineEdge }), []);

  // --- CHEAT CODE UNTUK HOT RELOAD ---
  // Hapus atau biarkan saja saat sudah masuk tahap produksi (deploy Vercel)
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-[#0a0a0f] flex flex-col">
      {/* Header Info */}
      <div className="absolute top-20 left-10 z-10 pointer-events-none">
        <h1 className="text-4xl font-bold italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-md">
          RELATIONSHIP CHART
        </h1>
        <p className="text-gray-400 text-xs tracking-widest uppercase mt-2">
          Idoly Pride Character Correlations (Not really compatible with mobile)
        </p>
        <p className="text-gray-400 text-[10px] tracking-wide mt-2">
          Work In Progress (WIP) - Make it as canon as possible, but maybe it's still got bias. Tell me if you find something wrong or missing!
        </p>
      </div>

      {/* Kanvas Diagram */}
      <div className="flex-1 w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.5}
          maxZoom={2}
          className="bg-[#0a0a0f] bottom-10"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={2}
            color="#1e293b"
          />
          <Controls className="bg-slate-900 border-cyan-500 fill-cyan-400 text-black" />
          <MiniMap
            nodeColor={(node) => {
              switch (node.data.borderColor) {
                case "border-pink-400":
                  return "#f472b6";
                case "border-blue-400":
                  return "#60a5fa";
                case "border-red-400":
                  return "#f87171";
                default:
                  return "#cbd5e1";
              }
            }}
            className="bg-slate-900 border border-white/10"
            maskColor="rgba(0,0,0, 0.7)"
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default RelationshipPage;
