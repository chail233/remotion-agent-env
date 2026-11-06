// effects/07 Spotlight.tsx — 追光开场：光束在舞台上搜寻、划过、最后 spring 落定在中心，照亮其上的内容（children）。
// 用于章节标题、产品揭幕。自包含（深色舞台语义，不依赖 theme）。
import React from "react";
import { useId } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type SpotlightProps = {
  /** 光束落定后照亮的内容（lockup、标题等） */
  children: React.ReactNode;
  /** 光锥与地面光池颜色 */
  beamColor?: string;
  /** 舞台底色 */
  stageColor?: string;
  /** 未照亮时内容的亮度 0~1 */
  dim?: number;
  /** 整体时间倍速 */
  speed?: number;
};

export const spotlightDefaults = {
  beamColor: "#FFFFFF",
  stageColor: "#111111",
  dim: 0.16,
  speed: 1,
};

const SEARCH = 12;
const SWING = 26;
const HOUSE = 38;
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export function Spotlight(props: SpotlightProps) {
  const { children, beamColor, stageColor, dim, speed } = {
    ...spotlightDefaults,
    ...props,
  };
  const uid = `spotlight-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame * Math.max(0, speed);

  // 光束落点（宽度比例）：左搜寻 → 右甩 → 中心落定
  let target: number;
  if (t < SEARCH) {
    target = interpolate(t, [0, SEARCH], [0.14, 0.27], {
      ...clamp,
      easing: Easing.inOut(Easing.sin),
    });
  } else if (t < SWING) {
    target = interpolate(t, [SEARCH, SWING], [0.27, 0.74], {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    });
  } else {
    const land = spring({
      frame: t - SWING,
      fps,
      config: { damping: 11, stiffness: 120, mass: 0.8 },
    });
    target = 0.74 + (0.5 - 0.74) * land;
  }

  const tx = target * width;
  const apexX = width / 2;
  const apexY = -height * 0.12;
  const floorY = height * 0.8;
  const spread = width * 0.27;
  const apexHalf = width * 0.012;

  const beamOn = interpolate(t, [0, 5], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const house = interpolate(t, [HOUSE, HOUSE + 12], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  // 内容亮度由光束落点对中心的覆盖度决定
  const coverage = Math.max(0, 1 - Math.abs(target - 0.5) / 0.3);
  const lit = Math.max(
    dim,
    dim + (1 - dim) * Easing.inOut(Easing.quad)(coverage) * beamOn,
  );
  const brightness =
    t >= SWING + 10 ? Math.max(lit, Math.min(1, lit + house)) : lit;
  const blur = width * 0.012;

  return (
    <AbsoluteFill style={{ backgroundColor: stageColor }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% 40%, ${beamColor} 0%, transparent 70%)`,
          opacity: 0.09 * house,
        }}
      />
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient
            id={`${uid}-beam`}
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={apexY}
            x2={0}
            y2={floorY}
          >
            <stop offset="0" stopColor={beamColor} stopOpacity={0.55} />
            <stop offset="0.6" stopColor={beamColor} stopOpacity={0.2} />
            <stop offset="1" stopColor={beamColor} stopOpacity={0.12} />
          </linearGradient>
          <radialGradient id={`${uid}-pool`}>
            <stop offset="0" stopColor={beamColor} stopOpacity={0.45} />
            <stop offset="0.6" stopColor={beamColor} stopOpacity={0.14} />
            <stop offset="1" stopColor={beamColor} stopOpacity={0} />
          </radialGradient>
          <filter
            id={`${uid}-soft`}
            x={-width}
            y={-height}
            width={width * 3}
            height={height * 3}
            filterUnits="userSpaceOnUse"
          >
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>
        <g opacity={beamOn * (1 - 0.35 * house)}>
          <ellipse
            cx={tx}
            cy={floorY}
            rx={spread * 1.25}
            ry={height * 0.07}
            fill={`url(#${uid}-pool)`}
          />
          <polygon
            points={`${apexX - apexHalf},${apexY} ${apexX + apexHalf},${apexY} ${tx + spread},${floorY} ${tx - spread},${floorY}`}
            fill={`url(#${uid}-beam)`}
            filter={`url(#${uid}-soft)`}
          />
        </g>
      </svg>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          filter: `brightness(${brightness})`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
