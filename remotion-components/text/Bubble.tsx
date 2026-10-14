// 对话气泡：第 at 帧弹簧弹出并逐字出现（speed 字/帧），until 帧前 8 帧淡出。
// x, y 是气泡底边中点，尾巴尖在 y 下面约 18px；tail 取 down/left/right/none；文本可用 \n 换行。
// 依赖：base/theme.ts（弹出逻辑已内联，与原 motion/usePop 相同参数）。
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, clamp } from "./theme";

export const Bubble: React.FC<{
  at: number;
  until?: number;
  text: string;
  x: number;
  y: number;
  tail?: "left" | "right" | "down" | "none";
  color?: string;
  textColor?: string;
  fontSize?: number;
  maxWidth?: number;
  speed?: number;
  mono?: boolean;
}> = ({
  at,
  until = 1e9,
  text,
  x,
  y,
  tail = "down",
  color = "#fff",
  textColor = C.ink,
  fontSize = 34,
  maxWidth = 560,
  speed = 0.7,
  mono,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 170 } });
  const out = interpolate(frame, [until - 8, until], [1, 0], clamp);
  if (frame < at || frame >= until) return null;
  const n = Math.floor((frame - at) * speed) + 1;
  const shown = Array.from(text).slice(0, n).join("");
  const origin = tail === "left" ? "0% 100%" : tail === "right" ? "100% 100%" : "50% 100%";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -100%) scale(${pop * out})`,
        transformOrigin: origin,
        opacity: out,
      }}
    >
      <div
        style={{
          position: "relative",
          background: color,
          color: textColor,
          fontFamily: mono ? F.mono : F.sans,
          fontSize,
          fontWeight: 600,
          padding: "16px 28px",
          borderRadius: 26,
          boxShadow: "0 10px 28px rgba(80,50,20,0.16)",
          maxWidth,
          whiteSpace: "pre-wrap",
          width: "max-content",
          lineHeight: 1.45,
        }}
      >
        <span style={{ visibility: "hidden" }}>{text}</span>
        <span style={{ position: "absolute", left: 28, top: 16, right: 28 }}>{shown}</span>
        {tail !== "none" && (
          <div
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              borderLeft: "14px solid transparent",
              borderRight: "14px solid transparent",
              borderTop: `20px solid ${color}`,
              bottom: -18,
              left: tail === "left" ? 34 : tail === "right" ? undefined : "50%",
              right: tail === "right" ? 34 : undefined,
              marginLeft: tail === "down" ? -14 : 0,
            }}
          />
        )}
      </div>
    </div>
  );
};
