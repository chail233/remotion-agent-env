// transitions/05 PageTurn.tsx — 翻页转场：出场页以底角为轴掀起、上移并旋出画面，下一场静止承接。
// poses 参数把连续运动量化成逐帧停格，模拟实体书翻页的顿挫感。自包含，不依赖 theme。
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";

// 掀起高度略超一屏（1.28 倍），保证旋转时页角完全离场
const LIFT_RATIO = 1.28;

/** progress(0~1) 量化到 poses 档停格（poses=1 时等效连续） */
export function pageTurnPose(progress: number, poses: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  const eased = clamped ** 3;
  if (poses <= 1) return eased >= 1 ? 1 : 0;
  const bucket = Math.min(poses - 1, Math.floor(eased * poses));
  return bucket / (poses - 1);
}

export type PageTurnProps = {
  /** 掀页旋转角（度，负值向左上掀） */
  angle?: number;
  /** 页轴锚点（transform-origin） */
  origin?: string;
  /** 停格档数；1 = 连续运动，8 = 默认的逐格顿挫 */
  poses?: number;
};

const PageTurnPresentation: React.FC<
  TransitionPresentationComponentProps<PageTurnProps>
> = ({
  children,
  presentationProgress,
  presentationDirection,
  passedProps,
}) => {
  const { height } = useVideoConfig();
  const { angle = -7, origin = "18% 100%", poses = 8 } = passedProps;

  if (presentationDirection === "entering") {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const pose = pageTurnPose(presentationProgress, poses);

  return (
    <AbsoluteFill
      style={{
        zIndex: 2,
        transformOrigin: origin,
        translate: `0 ${-pose * height * LIFT_RATIO}px`,
        rotate: `${angle * pose}deg`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export function pageTurn(
  props: PageTurnProps = {},
): TransitionPresentation<PageTurnProps> {
  return { component: PageTurnPresentation, props };
}
