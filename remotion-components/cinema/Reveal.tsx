// cinema/03 Reveal.tsx — 入场/退场原语：Reveal（单弹簧入场）、Words（逐字弹簧级联）、ExitWrap（场景末尾加速退场）。
// 一切只依赖当前帧与 fps；Words 对中文按字、拉丁文按词（byWord）级联，空格不占级联序号。
// 依赖：cinema/01 theme.ts。
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";

/**
 * 高级入场：透明度 + 位移 + 缩放（+可选模糊）由同一个弹簧驱动，p 从 0→1。
 * delay 之前完全不可见；config 默认 smooth 弹簧。
 */
export const Reveal: React.FC<{
  delay?: number;
  y?: number;
  x?: number;
  scaleFrom?: number;
  blur?: number;
  config?: { damping: number; stiffness: number; mass: number };
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({
  delay = 0,
  y = 38,
  x = 0,
  scaleFrom = 0.965,
  blur = 0,
  config = theme.spring.smooth,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config });
  return (
    <div
      style={{
        opacity: p,
        transform: `translate(${interpolate(p, [0, 1], [x, 0])}px, ${interpolate(
          p,
          [0, 1],
          [y, 0]
        )}px) scale(${interpolate(p, [0, 1], [scaleFrom, 1])})`,
        filter: blur > 0 ? `blur(${interpolate(p, [0, 1], [blur, 0])}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 逐字弹簧级联标题。`hot` 给出需要发光高亮的字符序号（按可见字符计数），
 * `per` 是每字错开的帧数。中文按字、`byWord` 时按空格分词。
 */
export const Words: React.FC<{
  text: string;
  delay?: number;
  per?: number;
  style?: React.CSSProperties;
  charStyle?: React.CSSProperties;
  /** 需要高亮发光的字符序号（按可见字符计） */
  hot?: number[];
  hotColor?: string;
  /** 拉丁文本按空格分词级联 */
  byWord?: boolean;
  entranceY?: number;
}> = ({
  text,
  delay = 0,
  per = 2.4,
  style,
  charStyle,
  hot = [],
  hotColor = theme.colors.hero,
  byWord = false,
  entranceY = 34,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const units = byWord ? text.split(" ") : Array.from(text);
  let visible = -1;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", ...style }}>
      {units.map((u, i) => {
        if (!byWord) visible += 1;
        const idx = byWord ? i : visible;
        const p = spring({
          frame: frame - delay - idx * per,
          fps,
          config: theme.spring.snappy,
        });
        const isSpace = u === " ";
        const isHot = hot.includes(idx);
        return (
          <span
            key={`${u}-${i}`}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              opacity: isSpace ? 1 : p,
              color: isHot ? hotColor : undefined,
              transform: isSpace
                ? undefined
                : `translateY(${interpolate(p, [0, 1], [entranceY, 0])}px) scale(${interpolate(
                    p,
                    [0, 1],
                    [0.9, 1]
                  )}) rotate(${interpolate(p, [0, 1], [1.2, 0])}deg)`,
              filter: isHot ? `drop-shadow(0 0 22px ${hotColor}55)` : undefined,
              ...charStyle,
            }}
          >
            {u}
          </span>
        );
      })}
    </div>
  );
};

/**
 * 场景退场包裹层：在时长 `duration` 的最后 `frames` 帧内加速淡出并微放大，
 * 结束点定在 duration-2（保证最后一帧仍可见再切走）。每个场景的内容都包在它里面。
 */
export const ExitWrap: React.FC<{
  duration: number;
  frames?: number;
  scaleTo?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ duration, frames = 16, scaleTo = 1.025, children, style }) => {
  const frame = useCurrentFrame();
  const start = duration - frames;
  const o = interpolate(frame, [start, duration - 2], [1, 0], {
    easing: theme.ease.in,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const s = interpolate(frame, [start, duration - 2], [1, scaleTo], {
    easing: theme.ease.in,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: o,
        transform: `scale(${s})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
