// scene/05 DuoPanel.tsx — 双色对比双栏面板：左右两块带渐变底、描边、阴影和头部
// （图标座 + 英文小字 + 标题）的面板 + 可选中央渐变脊线。对比/辩论类画面的骨架件；
// 只负责框架与头部，正文内容由调用方在面板之上另行定位叠加。依赖：base/theme.ts。
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, W, hexA } from "../base/theme";

export type DuoSide = {
  /** 主题色：面板渐变/描边/阴影/头部小字都从它派生 */
  color: string;
  /** 头部图标，任意 ReactNode（建议配 media/01 Icon，或 emoji）；座底色自动取 color 8% */
  icon?: React.ReactNode;
  /** 头部英文/等宽小字，如 "HUMAN" */
  en?: string;
  /** 头部标题 */
  label: string;
};

export const DuoPanel: React.FC<{
  left: DuoSide;
  right: DuoSide;
  /** 面板顶边 y，默认 236 */
  top?: number;
  /** 面板高，默认 600 */
  height?: number;
  /** 单栏宽，默认 700 */
  width?: number;
  /** 两栏距画面左右边缘的距离，默认 110 */
  inset?: number;
  /** 中央渐变脊线（默认 gold） */
  divider?: boolean;
  dividerColor?: string;
  /** 左栏入场帧，右栏自动延后 12 帧，从画面两侧滑入 */
  delay?: number;
  /** 头部离面板顶的距离，默认 26 */
  headerTop?: number;
}> = ({
  left,
  right,
  top = 236,
  height = 600,
  width = 700,
  inset = 110,
  divider = true,
  dividerColor = C.gold,
  delay = 0,
  headerTop = 26,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pl = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 90, mass: 1 } });
  const pr = spring({ frame: frame - delay - 12, fps, config: { damping: 20, stiffness: 90, mass: 1 } });

  const side = (spec: DuoSide, rightSide: boolean, p: number) => ({
    position: "absolute" as const,
    [rightSide ? "right" : "left"]: inset,
    top,
    width,
    height,
    borderRadius: 34,
    background: `linear-gradient(165deg, ${hexA(spec.color, 0.05)}, rgba(255,253,247,0.94))`,
    border: `2px solid ${hexA(spec.color, 0.22)}`,
    boxShadow: `0 34px 80px -34px ${hexA(spec.color, 0.27)}`,
    opacity: p,
    transform: `translateX(${interpolate(p, [0, 1], [rightSide ? 90 : -90, 0])}px)`,
  });

  const header = (spec: DuoSide) => (
    <div
      style={{
        position: "absolute",
        top: headerTop,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      {spec.icon && (
        <div
          style={{
            width: 74,
            height: 74,
            borderRadius: 22,
            background: hexA(spec.color, 0.08),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {spec.icon}
        </div>
      )}
      {spec.en && (
        <span style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.3em", color: spec.color }}>
          {spec.en}
        </span>
      )}
      <span style={{ fontFamily: F.serif, fontSize: 30, fontWeight: 900, color: C.ink }}>{spec.label}</span>
    </div>
  );

  return (
    <>
      <div style={side(left, false, pl)}>{header(left)}</div>
      <div style={side(right, true, pr)}>{header(right)}</div>
      {divider && (
        <div
          style={{
            position: "absolute",
            left: W / 2 - 1.5,
            top: top + 14,
            width: 3,
            height: height - 20,
            background: `linear-gradient(180deg, transparent, ${hexA(dividerColor, 0.53)}, transparent)`,
            borderRadius: 3,
          }}
        />
      )}
    </>
  );
};
