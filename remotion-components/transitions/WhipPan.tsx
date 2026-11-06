// transitions/01 WhipPan.tsx — 甩镜转场：两个场景沿同一方向高速滑过，中段加拉伸拖影 + 运动模糊。
// 配 @remotion/transitions 的 <TransitionSeries> 使用（用法见本目录 AGENTS.md）。自包含，不依赖 theme。
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";

const clampOpts = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export type WhipPanProps = {
  /** 甩动方向 */
  direction?: "left" | "right" | "up" | "down";
  /** 峰值模糊半径 px */
  blur?: number;
};

const WhipPanPresentation: React.FC<
  TransitionPresentationComponentProps<WhipPanProps>
> = ({
  children,
  presentationProgress,
  presentationDirection,
  passedProps,
}) => {
  const { direction = "left", blur = 24 } = passedProps;
  const entering = presentationDirection === "entering";
  const p = presentationProgress;

  const travel = interpolate(p, [0, 1], [0, 1], {
    ...clampOpts,
    easing: Easing.bezier(0.7, 0, 0.2, 1),
  });
  // 中段速度最快：正弦速度曲线驱动拖影与模糊，进出两端自然归零
  const velocity = Math.sin(Math.PI * travel);

  const axis: "x" | "y" =
    direction === "left" || direction === "right" ? "x" : "y";
  const sign = direction === "left" || direction === "up" ? -1 : 1;

  const offset = entering ? (travel - 1) * 110 * sign : travel * 110 * sign;
  const stretch = 1 + velocity * 0.12;

  const translate = axis === "x" ? `${offset}%` : `0 ${offset}%`;
  const smear = axis === "x" ? `${stretch} 1` : `1 ${stretch}`;

  return (
    <AbsoluteFill
      style={{
        translate,
        scale: smear,
        filter: `blur(${velocity * blur}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export function whipPan(
  props: WhipPanProps = {},
): TransitionPresentation<WhipPanProps> {
  return { component: WhipPanPresentation, props };
}
