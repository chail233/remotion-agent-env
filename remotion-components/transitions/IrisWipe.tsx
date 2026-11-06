// transitions/03 IrisWipe.tsx — 光圈擦除：圆形光圈从全画面收成一个点（可停留 holdRadius）再闭死，下半程从点重新张开露出下一场。
// 经典卡通/默片语法；centerX/centerY 可把光圈锚在主角或道具上。自包含，不依赖 theme。
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";

export type IrisWipeProps = {
  /** 光圈外填充色 */
  color?: string;
  /** 光圈圆心横向位置 0~1 */
  centerX?: number;
  /** 光圈圆心纵向位置 0~1 */
  centerY?: number;
  /** 收拢后停留的圆点半径（占对角线百分比） */
  holdRadius?: number;
};

export const irisWipeDefaults: Required<IrisWipeProps> = {
  color: "#000000",
  centerX: 0.5,
  centerY: 0.5,
  holdRadius: 12,
};

// circle() 的百分比按对角线/sqrt(2) 解析，150% 保证任意圆心都盖满画面
const COVER = 150;
// 光圈完全闭死、开始在下一场打开的进度点
const CUT = 0.5;

// 单条平滑曲线代替逐段关键帧：圆从画面外冲入、减速成点、再闭合，全程不停顿
// （逐段 easing 会在每个关键点降速到零，看起来像卡顿）
function closingRadius(u: number, hold: number) {
  return hold * (1 - u ** 3) + (COVER - hold) * (1 - u) ** 5;
}

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const IrisWipePresentation: React.FC<
  TransitionPresentationComponentProps<IrisWipeProps>
> = ({
  children,
  presentationProgress,
  presentationDirection,
  passedProps,
}) => {
  const { color, centerX, centerY, holdRadius } = {
    ...irisWipeDefaults,
    ...passedProps,
  };
  const p = presentationProgress;
  const at = `${centerX * 100}% ${centerY * 100}%`;

  if (presentationDirection === "exiting") {
    const radius = closingRadius(Math.min(1, p / CUT), holdRadius);
    return (
      <AbsoluteFill style={{ backgroundColor: color }}>
        <AbsoluteFill style={{ clipPath: `circle(${radius}% at ${at})` }}>
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  const radius = interpolate(p, [CUT, 1], [0, COVER], {
    ...clamp,
    easing: Easing.bezier(0.45, 0, 0.75, 0.6),
  });
  return (
    <AbsoluteFill style={{ clipPath: `circle(${radius}% at ${at})` }}>
      {children}
    </AbsoluteFill>
  );
};

export function irisWipe(
  props: IrisWipeProps = {},
): TransitionPresentation<IrisWipeProps> {
  return { component: IrisWipePresentation, props };
}
