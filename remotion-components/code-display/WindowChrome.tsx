// macOS 风格深色窗口外框：三个圆点 + 居中标题，CodeWindow/ConsoleWindow 共用，
// 也可以单独拿来装别的内容。内容区在标题栏（44px）下方。依赖：base/theme.ts。
import React from "react";
import { C, F } from "./theme";

export const WindowChrome: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ x, y, w, h, title, children, style }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      background: C.editor,
      borderRadius: 18,
      boxShadow: "0 24px 60px rgba(60,40,20,0.28), 0 4px 12px rgba(0,0,0,0.15)",
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        height: 44,
        background: C.editorBar,
        display: "flex",
        alignItems: "center",
        padding: "0 18px",
        gap: 10,
        position: "relative",
      }}
    >
      {["#F2605A", "#F5BE4F", "#5BC46A"].map((c) => (
        <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
      ))}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          textAlign: "center",
          color: "#A79E94",
          fontFamily: F.mono,
          fontSize: 19,
        }}
      >
        {title}
      </div>
    </div>
    <div style={{ position: "absolute", top: 44, left: 0, right: 0, bottom: 0 }}>{children}</div>
  </div>
);
