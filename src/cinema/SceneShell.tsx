// cinema/04 SceneShell.tsx — 场景骨架：SceneShell（五层壳：bg→内容→调色→颗粒→暗角，内容带慢视差与退场）、
// Phase（场景内时间窗块）、PulseLine（带行进脉冲点的连线）。
// 内容元素的 delay 一律相对场景开头计帧（Phase 负责窗口化，不做偏移换算）。
// 依赖：cinema/01 theme.ts、cinema/02 Background.tsx、cinema/03 Reveal.tsx。
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BgStage, Grade, Grain, Vignette } from "./Background";
import { ExitWrap } from "./Reveal";
import { alpha, theme } from "./theme";

/** 完整五层场景壳：BgStage → 内容（慢视差 + ExitWrap 退场）→ Grade → Grain → Vignette。 */
export const SceneShell: React.FC<{
  /** 主色调（光斑 / 调色） */
  hue: string;
  /** 副色调 */
  hue2: string;
  /** 场景总帧数，驱动退场时机 */
  duration: number;
  intensity?: number;
  children: React.ReactNode;
}> = ({ hue, hue2, duration, intensity = 1, children }) => {
  const frame = useCurrentFrame();
  // 内容平面的全局慢视差漂移
  const drift = Math.sin(frame / 180) * 6;
  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg, overflow: "hidden" }}>
      <BgStage hue={hue} hue2={hue2} intensity={intensity} />
      <ExitWrap duration={duration} frames={14} scaleTo={1.02}>
        <AbsoluteFill style={{ transform: `translateY(${drift}px)` }}>
          {children}
        </AbsoluteFill>
      </ExitWrap>
      <Grade hue={hue} strength={0.15} />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};

/**
 * 场景内的时间窗块：`from` 淡入、`to` 淡出（场景本地帧），窗外渲染 null。
 * fadeIn/fadeOut 传 0 关闭对应淡变。子元素 delay 相对场景开头计。
 */
export const Phase: React.FC<{
  from: number;
  to: number;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ from, to, fadeIn = 14, fadeOut = 12, children, style }) => {
  const frame = useCurrentFrame();
  const inP =
    fadeIn > 0
      ? interpolate(frame, [from, from + fadeIn], [0, 1], {
          easing: theme.ease.out,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : frame >= from
        ? 1
        : 0;
  const outP =
    fadeOut > 0
      ? interpolate(frame, [to - fadeOut, to], [1, 0], {
          easing: theme.ease.in,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const opacity = Math.min(inP, outP);
  if (frame < from - 1 || frame > to + 1) return null;
  return <AbsoluteFill style={{ opacity, ...style }}>{children}</AbsoluteFill>;
};

/** 直连线连接器（div 旋转实现，仅直线段），`pulse` 给 0..1 时在对应位置画行进发光点，-1 不画。 */
export const PulseLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
  dash?: boolean;
  /** 0..1 脉冲位置，-1 不显示 */
  pulse?: number;
  opacity?: number;
}> = ({ x1, y1, x2, y2, color, width = 1, dash = false, pulse = -1, opacity = 0.5 }) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x1,
          top: y1,
          width: len,
          height: width,
          background: color,
          opacity,
          transform: `rotate(${angle}deg)`,
          transformOrigin: "0 50%",
          borderRadius: width,
          ...(dash
            ? {
                backgroundImage: `linear-gradient(90deg, ${color} 55%, transparent 55%)`,
                backgroundSize: "14px 100%",
                backgroundRepeat: "repeat-x",
                backgroundColor: "transparent",
              }
            : {}),
        }}
      />
      {pulse >= 0 && pulse <= 1 ? (
        <div
          style={{
            position: "absolute",
            left: x1 + (x2 - x1) * pulse - 5,
            top: y1 + (y2 - y1) * pulse - 5,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 18px ${alpha(color, 0.9)}`,
          }}
        />
      ) : null}
    </>
  );
};
