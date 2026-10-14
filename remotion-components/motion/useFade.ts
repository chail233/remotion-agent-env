// 淡入淡出 hook：返回 0~1，在第 from 帧后 len 帧内淡入，第 to 帧前 len 帧内淡出。
// to 不传则永不淡出；len 默认 10 帧。
import { interpolate, useCurrentFrame } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const useFade = (from: number, to = 1e9, len = 10) => {
  const frame = useCurrentFrame();
  return Math.min(
    interpolate(frame, [from, from + len], [0, 1], clamp),
    interpolate(frame, [to - len, to], [1, 0], clamp),
  );
};
