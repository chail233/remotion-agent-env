// effects/05 Particles.tsx — 确定性上升微粒场：n 个圆点在 area 内缓缓上浮 + 左右摇摆，
// 个体透明度按正弦呼吸。常驻氛围件（非一过性），形态由 seed 决定（remotion random，
// 同 seed 同形态，渲染可复现）。常垫在内容层之下铺氛围。依赖：base/theme.ts（默认色/画布）。
import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C, H, W } from "../base/theme";

export const Particles: React.FC<{
  n?: number;
  seed?: number;
  color?: string;
  /** 分布区域（画布像素坐标），默认全屏 */
  area?: { x: number; y: number; w: number; h: number };
  /** 基准直径 px（个体在 0.4~1.3 倍间浮动） */
  size?: number;
  /** 上浮速度倍率 */
  speed?: number;
  /** 基准透明度（个体按正弦再乘 0.4~1） */
  opacity?: number;
}> = ({
  n = 24,
  seed = 1,
  color = C.ink,
  area = { x: 0, y: 0, w: W, h: H },
  size = 6,
  speed = 1,
  opacity = 0.25,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const x0 = area.x + random(`${seed}-x${i}`) * area.w;
        const ph = random(`${seed}-p${i}`) * Math.PI * 2;
        const r = size * (0.4 + random(`${seed}-r${i}`) * 0.9);
        const dx = Math.sin(frame / (46 * speed) + ph) * 22;
        const dy = ((frame * speed * (0.3 + random(`${seed}-s${i}`) * 0.5)) % (area.h + 160)) - 80;
        const o = opacity * (0.4 + 0.6 * Math.abs(Math.sin(frame / 40 + ph)));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x0 + dx,
              top: area.y + area.h - dy,
              width: r,
              height: r,
              borderRadius: "50%",
              background: color,
              opacity: o,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
