// 爱心炸开特效：第 at 帧起，count 颗爱心从 (x, y) 向四周散开并上飘，全程约 70 帧后自动消失。
// seed 不同散开的形状就不同；坐标是父容器绝对坐标（相对 Stage 时传舞台内坐标）。
// 依赖：base/theme.ts、effects/HeartShape.tsx。
import React from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { C, clamp } from "./theme";
import { HeartShape } from "./HeartShape";

export const HeartBurst: React.FC<{
  at: number;
  x: number;
  y: number;
  count?: number;
  seed?: string;
  spread?: number;
  colors?: string[];
}> = ({ at, x, y, count = 14, seed = "h", spread = 260, colors = [C.rose, C.pink, "#F6B1C3", C.clay] }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 70) return null;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const ang = random(`${seed}a${i}`) * Math.PI * 2;
        const dist = spread * (0.45 + random(`${seed}d${i}`) * 0.55);
        const p = interpolate(t, [0, 45], [0, 1], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 3) });
        const px = x + Math.cos(ang) * dist * p;
        const py = y + Math.sin(ang) * dist * p * 0.8 - t * 1.2;
        const sz = 22 + random(`${seed}s${i}`) * 30;
        const op = interpolate(t, [0, 6, 45, 70], [0, 1, 1, 0], clamp);
        return (
          <HeartShape
            key={i}
            size={sz}
            color={colors[i % colors.length]}
            style={{
              position: "absolute",
              left: px - sz / 2,
              top: py - sz / 2,
              opacity: op,
              transform: `rotate(${(random(`${seed}r${i}`) - 0.5) * 50}deg) scale(${0.6 + p * 0.5})`,
            }}
          />
        );
      })}
    </>
  );
};
