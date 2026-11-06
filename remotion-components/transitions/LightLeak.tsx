// transitions/02 LightLeak.tsx — 漏光转场：暖色光斑从画面边缘漂入，在切换点烧白，随后冷却露出下一场。
// 硬切藏在过曝峰下（p=0.5 处高斯白闪），适合回忆闪回、日光外景、情绪段落。自包含，不依赖 theme。
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import React from "react";
import { AbsoluteFill, Easing, interpolate, useVideoConfig } from "remotion";

export type LightLeakOrigin = "left" | "right" | "top" | "bottom";

export type LightLeakProps = {
  /** 光斑颜色，最暖在前；最后一个作为烧白色调 */
  colors?: string[];
  /** 光斑漂入的边缘 */
  origin?: LightLeakOrigin;
  /** 光斑与烧白强度 0~1 */
  intensity?: number;
};

export const lightLeakDefaults: Required<LightLeakProps> = {
  colors: ["#FF5A1F", "#E5322D", "#FFB347", "#FFF3E0"],
  origin: "left",
  intensity: 1,
};

// 每个光斑：沿漂移轴的偏移、横轴位置、尺寸、强度
const FLARES = [
  { along: 0, across: 0.3, size: 0.85, alpha: 1 },
  { along: -0.18, across: 0.78, size: 0.7, alpha: 0.85 },
  { along: 0.12, across: 0.55, size: 0.55, alpha: 0.9 },
  { along: -0.32, across: 0.12, size: 0.6, alpha: 0.7 },
  { along: 0.05, across: 0.95, size: 0.5, alpha: 0.6 },
];

// 热度曲线：切入前烧到最热，切过后缓慢冷却
function heat(p: number) {
  if (p <= 0.5) return Easing.in(Easing.quad)(p / 0.5);
  return 1 - Easing.out(Easing.quad)((p - 0.5) / 0.5);
}

function Leak({
  p,
  colors,
  origin,
  intensity,
}: {
  p: number;
  colors: string[];
  origin: LightLeakOrigin;
  intensity: number;
}) {
  const { width, height } = useVideoConfig();
  const k = heat(p) * intensity;
  const span = Math.max(width, height);
  const drift = interpolate(p, [0, 1], [-0.25, 1.05], {
    easing: Easing.bezier(0.3, 0.1, 0.5, 0.9),
  });
  const palette = colors.length > 0 ? colors : lightLeakDefaults.colors;
  const blowout = palette[palette.length - 1];
  // 切换点处的窄峰把画面推到近白
  const flash = Math.exp(-(((p - 0.5) / 0.1) ** 2)) * intensity;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {FLARES.map((f, i) => {
        let along = drift + f.along;
        if (origin === "right" || origin === "bottom") along = 1 - along;
        const horizontal = origin === "left" || origin === "right";
        const x = (horizontal ? along : f.across) * width;
        const y = (horizontal ? f.across : along) * height;
        const color = palette[i % Math.max(1, palette.length - 1)];
        return (
          <AbsoluteFill
            key={f.across}
            style={{
              mixBlendMode: "screen",
              // 开方让光斑进入时就够热；靠漂移而非淡入淡出卖质感
              opacity: Math.min(1, Math.sqrt(k) * f.alpha * 1.1),
              background: `radial-gradient(circle ${span * f.size}px at ${x}px ${y}px, color-mix(in srgb, ${color} 55%, ${blowout}) 0%, ${color} 22%, color-mix(in srgb, ${color} 55%, transparent) 45%, transparent 72%)`,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{ backgroundColor: blowout, opacity: Math.min(0.96, flash) }}
      />
    </AbsoluteFill>
  );
}

const LightLeakPresentation: React.FC<
  TransitionPresentationComponentProps<LightLeakProps>
> = ({
  children,
  presentationProgress,
  presentationDirection,
  passedProps,
}) => {
  const { colors, origin, intensity } = {
    ...lightLeakDefaults,
    ...passedProps,
  };
  const p = presentationProgress;
  const k = heat(p) * intensity;
  // 过曝峰下硬切：p>=0.5 起下一场完全接管画面
  const visible = presentationDirection === "exiting" ? p < 0.5 : p >= 0.5;

  return (
    <AbsoluteFill style={{ opacity: visible ? 1 : 0 }}>
      <AbsoluteFill
        style={{
          // 平方让画面只在贴近切换点时才烧起来
          filter: `brightness(${1 + k * k * 1.6}) saturate(${1 + k * 0.4})`,
        }}
      >
        {children}
      </AbsoluteFill>
      {visible && k > 0.001 ? (
        <Leak p={p} colors={colors} origin={origin} intensity={intensity} />
      ) : null}
    </AbsoluteFill>
  );
};

export function lightLeak(
  props: LightLeakProps = {},
): TransitionPresentation<LightLeakProps> {
  return { component: LightLeakPresentation, props };
}
