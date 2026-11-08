// text/06 Typewriter.tsx — 通用打字机：任意文本按帧逐字出现，可带闪烁光标（▍）。
// 与 03 Bubble 的区别：无气泡、无退场，只是个内联文字块，排版与退出由外层控制；
// 与 code-display 打字系列的区别：不挑代码内容，任何字符串都能打。依赖：base/theme.ts。
import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../base/theme";

export const Typewriter: React.FC<{
  text: string;
  /** 开始打字帧 */
  delay?: number;
  /** 每个字的帧数 */
  per?: number;
  /** 是否显示光标（打完自动消失） */
  cursor?: boolean;
  cursorColor?: string;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, per = 4, cursor = true, cursorColor = C.inkSoft, style }) => {
  const frame = useCurrentFrame();
  const chars = [...text];
  const shown = Math.max(0, Math.min(chars.length, Math.floor((frame - delay) / per)));
  const blink = Math.sin(frame / 8) > -0.2;
  return (
    <div style={{ display: "flex", alignItems: "baseline", ...style }}>
      <span>{chars.slice(0, shown).join("")}</span>
      {cursor && shown < chars.length && (
        <span style={{ opacity: blink ? 1 : 0.15, color: cursorColor }}>▍</span>
      )}
    </div>
  );
};
