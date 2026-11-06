// transitions/04 ZoomBlur.tsx — 缩放虚化转场：出场放大远去 + 模糊，入场从远处带虚化推近落定。最轻量的"镜头推拉"语法。
// 自包含，不依赖 theme。
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import React from "react";
import { AbsoluteFill } from "remotion";

export type ZoomBlurProps = {
  /** 峰值模糊半径 px */
  blur?: number;
  /** 伴随的纵向位移 px（>0 时出场上升、入场从下方落定） */
  rise?: number;
};

const ZoomBlurPresentation: React.FC<
  TransitionPresentationComponentProps<ZoomBlurProps>
> = ({
  children,
  presentationProgress,
  presentationDirection,
  passedProps,
}) => {
  const { blur = 16, rise = 0 } = passedProps;
  const entering = presentationDirection === "entering";
  const p = presentationProgress;

  const style: React.CSSProperties = entering
    ? {
        opacity: p,
        transform: `scale(${0.9 + p * 0.1})${
          rise > 0 ? ` translateY(${(1 - p) * rise}px)` : ""
        }`,
        filter: p < 1 ? `blur(${(1 - p) * blur}px)` : undefined,
      }
    : {
        opacity: 1 - p,
        transform: `scale(${1 + p * 0.12})${
          rise > 0 ? ` translateY(${-p * rise}px)` : ""
        }`,
        filter: p > 0 ? `blur(${p * blur}px)` : undefined,
      };

  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

export function zoomBlur(
  props: ZoomBlurProps = {},
): TransitionPresentation<ZoomBlurProps> {
  return { component: ZoomBlurPresentation, props };
}
