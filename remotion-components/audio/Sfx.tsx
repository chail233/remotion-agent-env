// 音效播放组件：在第 at 帧播放 public/sfx/<name>.wav（可用来源清单见 audio/AGENTS.md 与 scripts/AGENTS.md 06/07 节）。
// 实际音量 = volume × 1.5（封顶 1）；内部用 Sequence 包裹，持续 120 帧，layout="none" 不占画布。
// 唯一不依赖 theme 的组件——只需要 remotion 和 public/sfx 资源（make-audio/make-jsfx 生成，fetch-sfx 下载的是 mp3 走 <Audio>）。
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
