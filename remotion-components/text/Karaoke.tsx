// text/07 Karaoke.tsx — 卡拉OK逐词字幕：整行词按 [文本, 起帧, 止帧] 排期，扫色/浮出两种风格。
// fill：全部词常驻，当前词从左到右填色（clipPath），过去的词保持高亮 —— 唱词/旁白强调。
// appear：未到的词隐藏，当前词带轻微弹出 —— TikTok 式跟随口播。
// 词级时间可从 @remotion/captions 的 words 或 whisper 词戳换算成帧。依赖：base/theme.ts。
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F, clamp } from "../base/theme";

export type KaraokeWord = [text: string, from: number, to: number];

export const Karaoke: React.FC<{
  words: KaraokeWord[];
  /** 未激活/已完成底色（fill 模式下过去词也用 activeColor 常驻） */
  color?: string;
  /** 当前词的填色 */
  activeColor?: string;
  mode?: "fill" | "appear";
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  style?: React.CSSProperties;
}> = ({
  words,
  color = C.ink,
  activeColor = C.gold,
  mode = "fill",
  fontSize = 64,
  fontWeight = 800,
  fontFamily = F.sans,
  style,
}) => {
  const frame = useCurrentFrame();
  const idx = words.findIndex(([, from, to]) => frame >= from && frame < to);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.3em", lineHeight: 1.25, fontSize, fontWeight, fontFamily, color, ...style }}>
      {words.map(([text, from, to], i) => {
        const past = frame >= to;
        const current = i === idx;
        const progress = current ? interpolate(frame, [from, to], [0, 1], clamp) : past ? 1 : 0;
        const pop = current ? interpolate(frame, [from, from + 4], [1.14, 1], clamp) : 1;
        const visible = mode === "fill" || past || current;
        return (
          <span
            key={i}
            style={{
              position: "relative",
              display: "inline-block",
              opacity: visible ? 1 : 0,
              transform: `scale(${pop})`,
              transformOrigin: "50% 80%",
            }}
          >
            {text}
            {current && progress > 0 && (
              <span aria-hidden style={{ position: "absolute", inset: 0, color: activeColor, clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` }}>
                {text}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};
