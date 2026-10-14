// 星光扩散特效：第 at 帧起，count 颗四角星绕 (x, y) 一圈向外扩散并自转，全程约 50 帧后自动消失。
// 金色与白色交替；seed 控制随机抖动。依赖：base/theme.ts。
import React from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { C, clamp } from "./theme";

export const Sparkles: React.FC<{
  at: number;
  x: number;
  y: number;
  count?: number;
  seed?: string;
  r?: number;
}> = ({ at, x, y, count = 12, seed = "s", r = 220 }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 50) return null;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const ang = (i / count) * Math.PI * 2 + random(`${seed}${i}`) * 0.4;
        const p = interpolate(t, [0, 30], [0.2, 1], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 2) });
        const op = interpolate(t, [0, 5, 30, 50], [0, 1, 1, 0], clamp);
        const sz = 18 + random(`${seed}z${i}`) * 22;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(ang) * r * p - sz / 2,
              top: y + Math.sin(ang) * r * p - sz / 2,
              width: sz,
              height: sz,
              opacity: op,
              transform: `rotate(${t * 6}deg)`,
            }}
          >
            <svg viewBox="-10 -10 20 20" width={sz} height={sz}>
              <path d="M0 -10 L2.4 -2.4 L10 0 L2.4 2.4 L0 10 L-2.4 2.4 L-10 0 L-2.4 -2.4 Z" fill={i % 2 ? C.gold : "#fff"} />
            </svg>
          </div>
        );
      })}
    </>
  );
};
