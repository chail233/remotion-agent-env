// 底部字幕：caps = [开始帧, 结束帧, 文本][]，命中区间的那条显示，淡入 + 上浮。
// 白色胶囊底；dark 为深色版（夜景），serif 改用宋体。文本支持「」和 `code` 小语法（见 RichText）。
// 默认水平居中、y=968（1920×1080 下靠近底部），用 y/style 放画面任意位置。依赖：base/theme.ts、text/RichText.tsx。
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F, clamp } from "./theme";
import { RichText } from "./RichText";

export type Cap = [number, number, string];

export const Captions: React.FC<{
  caps: Cap[];
  dark?: boolean;
  serif?: boolean;
  y?: number;
  /** 覆盖外层容器样式（自由排布：改 left/right/top/width 等，默认横屏全宽居中） */
  style?: React.CSSProperties;
}> = ({ caps, dark, serif, y = 968, style }) => {
  const frame = useCurrentFrame();
  const cur = caps.find(([a, b]) => frame >= a && frame < b);
  if (!cur) return null;
  const [a, b, text] = cur;
  const op = Math.min(
    interpolate(frame, [a, a + 8], [0, 1], clamp),
    interpolate(frame, [b - 8, b], [1, 0], clamp),
  );
  const rise = interpolate(frame, [a, a + 10], [12, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        display: "flex",
        justifyContent: "center",
        opacity: op,
        transform: `translateY(${rise}px)`,
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: serif ? F.serif : F.sans,
          fontSize: 38,
          fontWeight: serif ? 600 : 500,
          color: dark ? "#FFF6EC" : C.ink,
          background: dark ? "rgba(20,16,30,0.45)" : "rgba(255,252,247,0.92)",
          padding: "14px 40px",
          borderRadius: 999,
          boxShadow: dark ? "none" : "0 8px 24px rgba(80,50,20,0.12)",
          letterSpacing: 1,
          maxWidth: 1700,
          textAlign: "center",
        }}
      >
        <RichText text={text} accent={dark ? C.gold : C.clayDark} codeColor={dark ? C.pink : C.rose} />
      </div>
    </div>
  );
};
