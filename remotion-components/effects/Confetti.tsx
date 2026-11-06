// effects/06 Confetti.tsx — 彩带炸开：n 片彩纸从 origin 以抛物线喷出、翻转、飘落，lifetime 后自灭。
// 物理与形态由 seed 决定（mulberry32 确定性 PRNG，同 seed 同画面，渲染可复现）。
// 一过性特效：只管给 at，结束不用管。依赖：base/theme.ts（默认色板）。
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./theme";

export const CONFETTI_COLORS = [C.clay, C.pink, C.gold, C.mint, C.sky, C.violet];

type Piece = {
  angle: number;
  speed: number;
  color: string;
  size: number;
  rot0: number;
  spin: number;
  drift: number;
};

/** mulberry32：确定性 PRNG，返回产出 [0,1) 的函数 */
const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const makePieces = (count: number, seed: number, colors: string[]): Piece[] => {
  const rand = mulberry32(seed);
  const out: Piece[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      angle: rand() * Math.PI * 2,
      speed: 0.35 + 0.65 * rand(),
      color: colors[Math.floor(rand() * colors.length)],
      size: 0.7 + 0.6 * rand(),
      rot0: rand() * Math.PI * 2,
      spin: (rand() - 0.5) * 0.6,
      drift: (rand() - 0.5) * 2,
    });
  }
  return out;
};

export const Confetti: React.FC<{
  /** 彩纸片数 */
  n?: number;
  /** 起爆帧 */
  at?: number;
  /** 全程帧数，之后画面恢复干净 */
  lifetime?: number;
  /** 炸点（画布 0~1 比例） */
  originX?: number;
  originY?: number;
  /** 初速（px/帧，按 720p 基准随画布缩放） */
  power?: number;
  /** 重力（px/帧²，同上缩放） */
  gravity?: number;
  /** 基准片宽 px */
  size?: number;
  colors?: string[];
  seed?: number;
}> = ({
  n = 140,
  at = 0,
  lifetime = 90,
  originX = 0.5,
  originY = 0.5,
  power = 17,
  gravity = 0.45,
  size = 13,
  colors = CONFETTI_COLORS,
  seed = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const tt = frame - at;
  if (tt < 0 || tt > lifetime) return null;

  const sc = height / 720;
  const ox = width * originX;
  const oy = height * originY;
  const opacity = interpolate(tt, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    * interpolate(tt, [lifetime * 0.7, lifetime], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {makePieces(n, seed, colors).map((p, i) => {
        const vx = Math.cos(p.angle) * p.speed * power + p.drift;
        const vy = Math.sin(p.angle) * p.speed * power;
        const x = ox + vx * tt * sc;
        const y = oy + (vy * tt + 0.5 * gravity * tt * tt) * sc;
        const rot = p.rot0 + p.spin * tt;
        const flutter = Math.cos(p.rot0 + p.spin * tt * 1.6);
        const w = size * p.size * sc;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: w * 0.62,
              borderRadius: 2,
              background: p.color,
              opacity,
              transform: `translate(-50%, -50%) rotate(${rot}rad) scale(${flutter}, 1)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
