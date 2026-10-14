// 彩色描边胶囊标签：行内元素，给概念打标签用（如「类」「实例」）。
// 定位交给外层（style 传 position/absolute 坐标）。依赖：base/theme.ts。
import React from "react";
import { C, F, hexA } from "./theme";

export const Tag: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color = C.clay, style }) => (
  <div
    style={{
      display: "inline-block",
      padding: "6px 18px",
      borderRadius: 999,
      background: hexA(color, 0.14),
      color,
      fontFamily: F.sans,
      fontWeight: 800,
      fontSize: 24,
      border: `2px solid ${hexA(color, 0.5)}`,
      ...style,
    }}
  >
    {children}
  </div>
);
