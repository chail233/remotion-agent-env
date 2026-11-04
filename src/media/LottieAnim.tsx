// media/02 LottieAnim.tsx — 嵌入 Lottie JSON 动画（依赖 @remotion/lottie，与 remotion 同版本）。
// src 传 public/ 下相对路径（staticFile），进度完全跟随 Remotion 时间轴；JSON 由 scripts/04 fetch-lottie.mjs
// 下载并登记来源/许可（public/lottie/manifest.json）。播放速度用 playbackRate 调，不需要 keyframe 对帧。
// 无主题依赖。
import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { Lottie, type LottieAnimationData } from "@remotion/lottie";

export const LottieAnim: React.FC<{
  /** public/ 下相对路径，如 "lottie/pulse-dot.json" */
  src: string;
  /** 动画结束后是否循环（默认 false：尾帧停在最后一格） */
  loop?: boolean;
  /** 播放速度倍率 */
  playbackRate?: number;
  style?: React.CSSProperties;
}> = ({ src, loop = false, playbackRate = 1, style }) => {
  const [data, setData] = useState<LottieAnimationData | null>(null);

  useEffect(() => {
    const handle = delayRender(`加载 Lottie ${src}`, { timeoutInMilliseconds: 60000 });
    let alive = true;
    fetch(staticFile(src))
      .then((r) => r.json())
      .then((json: LottieAnimationData) => {
        if (!alive) return;
        setData(json);
        continueRender(handle);
      })
      .catch((err) => {
        console.error(`Lottie 加载失败 ${src}`, err);
        continueRender(handle);
      });
    return () => {
      alive = false;
    };
  }, [src]);

  if (!data) return null;
  return (
    <Lottie animationData={data} loop={loop} playbackRate={playbackRate} style={style} />
  );
};
