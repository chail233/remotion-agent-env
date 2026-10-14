// 数值进度条：标签 + 右端数值 + 渐变填充条。位置尺寸由 x/y/width 决定，本身不做动画——
// value 由调用方驱动（传 interpolate 结果即可与帧号同步）。依赖：base/theme.ts。
import React from "react";
import { C, F, hexA } from "./theme";

export const StatBar: React.FC<{
  label: string;
  value: number;
  max?: number;
  color?: string;
  width?: number;
  x: number;
  y: number;
  icon?: string;
}> = ({ label, value, max = 100, color = C.rose, width = 420, x, y, icon }) => (
  <div style={{ position: "absolute", left: x, top: y, width, fontFamily: F.sans }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 700, color: C.ink, marginBottom: 8 }}>
      <span>
        {icon && <span style={{ fontFamily: F.emoji, marginRight: 8 }}>{icon}</span>}
        {label}
      </span>
      <span style={{ fontFamily: F.mono, color }}>{Math.round(value)}</span>
    </div>
    <div style={{ height: 22, borderRadius: 11, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
      <div
        style={{
          width: `${(value / max) * 100}%`,
          height: "100%",
          borderRadius: 11,
          background: `linear-gradient(90deg, ${hexA(color, 0.7)}, ${color})`,
        }}
      />
    </div>
  </div>
);
