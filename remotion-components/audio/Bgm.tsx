// audio/02 Bgm.tsx — 背景音乐：挂在合成最外层，音量沿包络淡入淡出。
// 不依赖 theme；淡出锚点取合成总时长（useVideoConfig），换片长不用改参数。
// wav 用 scripts/01 make-audio.mjs 生成到 public/。同 audio/01，不占画布布局。
import React from "react";
import { Html5Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const Bgm: React.FC<{
  /** public/ 下相对路径 */
  src?: string;
  /** 目标音量 */
  volume?: number;
  /** 淡入帧数 */
  fadeIn?: number;
  /** 淡出帧数（从合成结尾往前数） */
  fadeOut?: number;
}> = ({ src = "bgm.wav", volume = 0.95, fadeIn = 30, fadeOut = 120 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const vol = interpolate(
    frame,
    [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
    [0, volume, volume, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <Html5Audio src={staticFile(src)} volume={vol} />;
};
