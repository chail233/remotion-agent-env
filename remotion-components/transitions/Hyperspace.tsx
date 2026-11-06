// transitions/06 Hyperspace.tsx — 超空间跳跃转场：星场从中心加速拉伸成光速流线，白闪覆盖切换点，下一场从轻微虚焦中安定下来。
// 星点由 remotion random(seed) 确定，渲染可复现。适合科幻、加速蒙太奇、"进入下一章"。自包含，不依赖 theme。
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import React from "react";
import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useVideoConfig,
} from "remotion";

export type HyperspaceProps = {
  /** 星点数量 */
  stars?: number;
  /** 主流线颜色 */
  streakColor?: string;
  /** 少量彩色流线的颜色 */
  accentColor?: string;
  /** 彩色流线占比 0~1 */
  accentRatio?: number;
  /** 切换点白闪；false 则穿过流线硬切 */
  flash?: boolean;
  /** 白闪颜色 */
  flashColor?: string;
};

export const hyperspaceDefaults: Required<HyperspaceProps> = {
  stars: 260,
  streakColor: "#FFFFFF",
  accentColor: "#E5322D",
  accentRatio: 0.14,
  flash: true,
  flashColor: "#FFFFFF",
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// 对数半径行进：星点分布在中心射线族上，半径按 exp(travel) 增长，
// 呈现"消失点附近慢、边缘处疾冲"的透视感
const JUMP = 3.2;
const COAST = 1.1;
const CUT = 0.62;
// 起跳前星点的缓慢漂移量
const SPOOL = 0.22;
const MAX_TAIL = 0.94;

type Star = { angle: number; logR: number; accent: boolean; weight: number };

function travelAt(p: number) {
  if (p <= CUT) {
    // 蓄力：慢速线性漂移交给四次方冲刺，起步不突兀
    const t = p / CUT;
    return { travel: SPOOL * t + (JUMP - SPOOL) * t ** 4, speed: t ** 3 };
  }
  const q = (p - CUT) / (1 - CUT);
  const ease = 1 - (1 - q) ** 2;
  return { travel: JUMP + COAST * ease, speed: 0.7 * (1 - q) };
}

function Starfield({
  stars,
  progress,
  streakColor,
  accentColor,
  opacity,
  stride,
}: {
  stars: Star[];
  progress: number;
  streakColor: string;
  accentColor: string;
  opacity: number;
  stride: number;
}) {
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;
  const diag = Math.hypot(width, height) / 2;
  const unit = Math.min(width, height) / 720;
  const { travel, speed } = travelAt(progress);
  // 流线长度随速度平方增长
  const tail = Math.min(MAX_TAIL, 0.006 + MAX_TAIL * speed ** 2);

  const lines: React.ReactNode[] = [];
  stars.forEach((star, i) => {
    if (i % stride !== 0) return;
    const r = Math.exp(star.logR + travel);
    const r0 = r * (1 - tail);
    if (r0 > diag * 1.05) return;
    const near = Math.min(1, r / (diag * 0.12));
    const alpha = (0.25 + 0.75 * near) * opacity;
    const cos = Math.cos(star.angle);
    const sin = Math.sin(star.angle);
    lines.push(
      <line
        key={i}
        x1={cx + cos * r0}
        y1={cy + sin * r0}
        x2={cx + cos * r}
        y2={cy + sin * r}
        stroke={star.accent ? accentColor : streakColor}
        strokeOpacity={alpha}
        strokeWidth={(0.8 + star.weight * 2.4 * near) * unit}
        strokeLinecap="round"
      />,
    );
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      {lines}
    </svg>
  );
}

const HyperspacePresentation: React.FC<
  TransitionPresentationComponentProps<HyperspaceProps>
> = ({
  children,
  presentationProgress,
  presentationDirection,
  passedProps,
}) => {
  const {
    stars: count,
    streakColor,
    accentColor,
    accentRatio,
    flash,
    flashColor,
  } = { ...hyperspaceDefaults, ...passedProps };
  const { width, height } = useVideoConfig();
  const diag = Math.hypot(width, height) / 2;
  const p = presentationProgress;

  const stars = useMemo<Star[]>(() => {
    const minLog = Math.log(Math.max(2, diag * 0.015));
    const maxLog = Math.log(diag);
    return Array.from({ length: Math.max(0, Math.round(count)) }, (_, i) => ({
      angle: random(`hyperspace-a-${i}`) * Math.PI * 2,
      logR: minLog + random(`hyperspace-r-${i}`) * (maxLog - minLog),
      accent: random(`hyperspace-c-${i}`) < accentRatio,
      weight: random(`hyperspace-w-${i}`),
    }));
  }, [count, accentRatio, diag]);

  if (presentationDirection === "exiting") {
    const t = Math.min(1, p / CUT);
    // 四次方推进：星点蓄力期几乎不动，随后猛冲
    const push = 1 + 0.42 * t ** 4;
    const dim = interpolate(t, [0, 1], [1, 0.45], {
      ...clamp,
      easing: Easing.in(Easing.quad),
    });
    const fieldIn = interpolate(t, [0, 0.45], [0, 1], {
      ...clamp,
      easing: Easing.inOut(Easing.quad),
    });
    const white = flash
      ? interpolate(t, [0.72, 1], [0, 1], {
          ...clamp,
          easing: Easing.in(Easing.quad),
        })
      : 0;
    return (
      <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
        <AbsoluteFill
          style={{ transform: `scale(${push})`, filter: `brightness(${dim})` }}
        >
          {children}
        </AbsoluteFill>
        <Starfield
          stars={stars}
          progress={Math.min(p, CUT)}
          streakColor={streakColor}
          accentColor={accentColor}
          opacity={fieldIn}
          stride={1}
        />
        <AbsoluteFill style={{ backgroundColor: flashColor, opacity: white }} />
      </AbsoluteFill>
    );
  }

  if (p < CUT) {
    return <AbsoluteFill style={{ opacity: 0 }}>{children}</AbsoluteFill>;
  }

  // 抵达：白闪停留一拍后缓慢溶解，场景从轻微放大 + 虚焦中落定，跳跃后有喘息感
  const q = (p - CUT) / (1 - CUT);
  const unit = Math.min(width, height);
  const soft = Easing.bezier(0.22, 1, 0.36, 1);
  const settle = interpolate(q, [0, 1], [1.06, 1], { ...clamp, easing: soft });
  const blur = interpolate(q, [0, 0.75], [unit * 0.018, 0], {
    ...clamp,
    easing: soft,
  });
  const white = flash
    ? interpolate(q, [0, 0.1, 1], [1, 1, 0], {
        ...clamp,
        easing: Easing.inOut(Easing.sin),
      })
    : 0;
  const fade = interpolate(q, [0, 0.45], [0.8, 0], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${settle})`,
          filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      <Starfield
        stars={stars}
        progress={p}
        streakColor={streakColor}
        accentColor={accentColor}
        opacity={fade}
        stride={5}
      />
      <AbsoluteFill style={{ backgroundColor: flashColor, opacity: white }} />
    </AbsoluteFill>
  );
};

export function hyperspace(
  props: HyperspaceProps = {},
): TransitionPresentation<HyperspaceProps> {
  return { component: HyperspacePresentation, props };
}
