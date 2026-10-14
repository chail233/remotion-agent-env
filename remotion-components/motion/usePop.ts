// 弹簧动画 hook：第 at 帧起从 0 弹到 1（overshoot 由 damping/stiffness 控制）。
// 典型用法：transform: scale(usePop(at))。注意这是 hook，不要在 map 回调里调用；
// map 里要多个弹出值时，参考 text/Bubble.tsx 直接内联 spring({ frame: frame - at, ... })。
// 参数约定：damping 12 / stiffness 140 是通用弹出，Bubble 用 (11, 170)，Scene 章节卡用 (14, 120)。
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const usePop = (at: number, damping = 12, stiffness = 140) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping, stiffness } });
};
