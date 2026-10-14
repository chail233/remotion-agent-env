// 单个爱心 SVG（viewBox 坐标系，color 默认玫红）。尺寸由 size 控制，定位用 style 传入。
// 依赖：base/theme.ts。
import React from "react";
import { C } from "./theme";

export const HeartShape: React.FC<{
  size: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ size, color = C.rose, style }) => (
  <svg width={size} height={size} viewBox="-10 -10 20 18" style={style}>
    <path d="M0 7 C -9 0, -9 -8, -4 -8 C -1.5 -8, 0 -5.5, 0 -4 C 0 -5.5, 1.5 -8, 4 -8 C 9 -8, 9 0, 0 7 Z" fill={color} />
  </svg>
);
