// 舞台：半透明圆角面板，位置尺寸任意（默认 (1060, 90, 800, 850)），内部坐标相对面板左上角，
// 超出部分会被 overflow:hidden 裁掉。依赖：base/theme.ts。
import React from "react";
import { C, hexA } from "./theme";

export const Stage: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  children: React.ReactNode;
  bg?: string;
}> = ({
  x = 1060,
  y = 90,
  w = 800,
  h = 850,
  children,
  bg = "rgba(255,252,247,0.75)",
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 28,
      background: bg,
      border: `2px solid ${hexA("#C9B9A3", 0.45)}`,
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);
