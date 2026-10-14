// 文字小语法渲染器（不是定位元素，放进行内即可）：「词」→ 强调色加粗，`code` → 代码字体小标签。
// Captions、Bubble 之外的自定义文字块想套用同一语法时也用它。依赖：base/theme.ts。
import React from "react";
import { C, F, hexA } from "./theme";

export const RichText: React.FC<{
  text: string;
  accent?: string;
  codeColor?: string;
}> = ({ text, accent = C.clayDark, codeColor = C.rose }) => {
  const parts = text.split(/(「[^」]*」|`[^`]*`)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("「"))
          return (
            <span key={i} style={{ color: accent, fontWeight: 800 }}>
              {p}
            </span>
          );
        if (p.startsWith("`"))
          return (
            <span
              key={i}
              style={{
                fontFamily: F.mono,
                color: codeColor,
                fontWeight: 600,
                padding: "0 6px",
                margin: "0 2px",
                background: hexA(codeColor, 0.1),
                borderRadius: 8,
              }}
            >
              {p.slice(1, -1)}
            </span>
          );
        return <span key={i}>{p}</span>;
      })}
    </>
  );
};
