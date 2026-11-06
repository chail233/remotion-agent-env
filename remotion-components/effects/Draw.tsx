// effects/04 Draw.tsx — SVG 路径描画：一条 path 按 delay→delay+dur 从起点画到终点，画完常驻。
// 常驻件（非一过性）。绝对定位铺满父容器，父容器需有定位上下文；viewBox 0 0 100 100，
// 即 d 里的坐标按父容器百分比走，preserveAspectRatio="none" + non-scaling-stroke
// 让路径随容器拉伸、线宽不变形。依赖：base/theme.ts（默认色）。
import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C, clamp } from "./theme";

export const Draw: React.FC<{
  /** SVG path 的 d 字符串（0~100 百分比坐标系，如 "M10,50 Q50,5 90,50"） */
  d: string;
  /** 线宽 px，不随容器缩放 */
  w?: number;
  color?: string;
  /** 开始描画帧 */
  delay?: number;
  /** 描画时长（帧） */
  dur?: number;
  /** dasharray 总长，须不小于路径实长，默认 300；路径很长画不满时调大 */
  dash?: string;
  style?: React.CSSProperties;
}> = ({ d, w = 3, color = C.ink, delay = 0, dur = 30, dash, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + dur], [0, 1], {
    easing: Easing.bezier(0.83, 0, 0.17, 1),
    ...clamp,
  });
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", ...style }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
        strokeDasharray={dash ?? "300"}
        strokeDashoffset={300 * (1 - p)}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
