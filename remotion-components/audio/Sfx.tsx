// 音效播放组件：在第 at 帧播放 public/sfx/<name>.wav——放进去什么文件就有什么 name，
// 音频由使用者按需准备（来源清单见 audio/AGENTS.md）。
// 实际音量 = volume × 1.5（封顶 1）；内部用 Sequence 包裹，持续 120 帧，layout="none" 不占画布。
// 不依赖 theme——只需要 remotion 和 public/sfx 资源；mp3 或超过 120 帧的音频改用 <Audio> 直接播。
import React from "react";
import { Html5Audio, Sequence, staticFile } from "remotion";

export const Sfx: React.FC<{ at: number; name: string; volume?: number }> = ({
  at,
  name,
  volume = 0.6,
}) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={120} layout="none">
    <Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={Math.min(1, volume * 1.5)} />
  </Sequence>
);
