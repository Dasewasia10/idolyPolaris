import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  getStraightPath,
  EdgeProps,
} from "@xyflow/react";

export default function MultilineEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerStart,
    markerEnd,
    data,
  } = props;

  let edgePath, labelX, labelY;

  // Cek dari properti 'data' apakah kita ingin garis lurus atau melengkung
  if (data?.isStraight) {
    [edgePath, labelX, labelY] = getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });
  } else {
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  }

  // Pecah teks berdasarkan \n jika ada
  const labelText = typeof data?.label === "string" ? data.label : "";
  const lines = labelText.split("\n");

  return (
    <>
      {/* 1. Gambar Garisnya (SVG) */}
      <BaseEdge path={edgePath} markerStart={markerStart} markerEnd={markerEnd} style={style} id={id} />

      {/* 2. Render Label menggunakan HTML/Div murni */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all", // Agar bisa di-klik jika diperlukan
          }}
          className="nodrag nopan"
        >
          {/* Bebas kustomisasi dengan Tailwind */}
          <div
            className="bg-white text-[10px] text-center rounded p-1 text-black"
          >
            {lines.map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i !== lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
