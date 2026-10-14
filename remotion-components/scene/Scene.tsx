// 场景外壳：纸张背景 + 开场章节卡片 + 页眉 + 首尾淡入淡出。依赖：base/theme.ts。
// 章节卡片占第 0~62 帧，正文在第 52~66 帧淡入——场景内动画请从第 60 帧之后开始排。
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, F, clamp, hexA } from "./theme";

/** 米白方格纸背景（与 scene/Paper.tsx 是同一实现，此处内联以便本文件单拷可用） */
const Paper: React.FC<{ tint?: string }> = ({ tint = C.bg }) => (
  <AbsoluteFill
    style={{
      background: tint,
      backgroundImage: `linear-gradient(${hexA("#C9B9A3", 0.18)} 1px, transparent 1px), linear-gradient(90deg, ${hexA("#C9B9A3", 0.18)} 1px, transparent 1px)`,
      backgroundSize: "48px 48px",
    }}
  />
);

export const Scene: React.FC<{
  no: string;
  title: string;
  duration: number;
  children: React.ReactNode;
  /** 是否播放开场章节卡片 */
  intro?: boolean;
  /** 右上角的小字，传 null 隐藏 */
  brand?: React.ReactNode;
}> = ({ no, title, duration, children, intro = true, brand = null }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], clamp);
  const fadeOut = interpolate(frame, [duration - 14, duration], [1, 0], clamp);
  const cardIn = spring({ frame: frame - 2, fps, config: { damping: 14, stiffness: 120 } });
  const cardOut = interpolate(frame, [46, 62], [1, 0], clamp);
  const headIn = interpolate(frame, [54, 70], [0, 1], clamp);
  const contentIn = intro ? interpolate(frame, [52, 66], [0, 1], clamp) : 1;
  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      <Paper />
      <AbsoluteFill style={{ opacity: contentIn }}>{children}</AbsoluteFill>
      {/* 页眉 */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 22,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: headIn,
          transform: `translateX(${(1 - headIn) * -30}px)`,
          fontFamily: F.sans,
        }}
      >
        <div
          style={{
            background: C.clay,
            color: "#fff",
            fontWeight: 800,
            fontSize: 20,
            padding: "4px 14px",
            borderRadius: 999,
            letterSpacing: 2,
          }}
        >
          第 {no} 章
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.ink }}>{title}</div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 26,
          fontFamily: F.mono,
          fontSize: 20,
          color: C.inkSoft,
          opacity: headIn * 0.8,
        }}
      >
        {brand}
      </div>
      {/* 章节卡片 */}
      {intro && cardOut > 0 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: cardOut,
            transform: `scale(${0.85 + cardIn * 0.15 - (1 - cardOut) * 0.1})`,
          }}
        >
          <div
            style={{
              fontFamily: F.sans,
              fontSize: 34,
              fontWeight: 800,
              color: C.clay,
              letterSpacing: 10,
              opacity: cardIn,
            }}
          >
            CHAPTER {no}
          </div>
          <div
            style={{
              fontFamily: F.serif,
              fontSize: 96,
              fontWeight: 800,
              color: C.ink,
              marginTop: 16,
              opacity: cardIn,
            }}
          >
            {title}
          </div>
          <div
            style={{
              width: 260 * cardIn,
              height: 6,
              borderRadius: 3,
              background: C.pink,
              marginTop: 28,
            }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
