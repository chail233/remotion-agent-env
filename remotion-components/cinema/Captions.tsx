// cinema/06 Captions.tsx — 深色玻璃胶囊字幕条：caps = [开始帧, 结束帧, 文本][]（元组格式与 text/01 一致），
// 命中区间的那条显示，弹簧入场（10 帧）+ 缓出退场（8 帧）+ 上浮，左侧发光色条。区间互不重叠。
// 必须挂在所有 <Sequence> 之外（合成最顶层）：它读全局帧，放进 Sequence 字幕区间会整体偏移。
// 依赖：cinema/01 theme.ts。字号 41 / maxWidth 1560 按 1920×1080 标定，style 可覆盖外层。
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, theme } from "./theme";

export type Cap = [number, number, string];

const ENTER = 10;
const EXIT = 8;

export const Captions: React.FC<{
  caps: Cap[];
  /** 左侧色条与描边颜色，默认琥珀 hero */
  accent?: string;
  style?: React.CSSProperties;
}> = ({ caps, accent = theme.colors.hero, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = caps.findIndex(([from, to]) => frame >= from && frame < to);
  if (idx < 0) return null;
  const [from, to, text] = caps[idx];
  const local = frame - from;
  const remaining = to - frame;

  const inP = spring({ frame: local, fps, config: theme.spring.snappy, durationInFrames: ENTER });
  const outP = interpolate(remaining, [0, EXIT], [0, 1], {
    easing: theme.ease.in,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(inP, outP);
  const y = interpolate(inP, [0, 1], [22, 0]);
  const scale = interpolate(inP, [0, 1], [0.97, 1]);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 42,
        ...style,
      }}
    >
      <div
        key={idx}
        style={{
          opacity,
          transform: `translateY(${y}px) scale(${scale})`,
          maxWidth: 1560,
          padding: "16px 32px 17px",
          borderRadius: 16,
          background: "linear-gradient(180deg, rgba(7,9,14,0.78) 0%, rgba(7,9,14,0.88) 100%)",
          border: `1px solid ${alpha(accent, 0.16)}`,
          boxShadow:
            "0 30px 70px -24px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            width: 4,
            alignSelf: "stretch",
            borderRadius: 4,
            background: alpha(accent, 0.85),
            boxShadow: `0 0 16px ${alpha(accent, 0.6)}`,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 41,
            fontWeight: 500,
            lineHeight: 1.4,
            letterSpacing: "0.012em",
            color: theme.colors.ink,
            textAlign: "left",
            textShadow: "0 2px 14px rgba(0,0,0,0.6)",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
