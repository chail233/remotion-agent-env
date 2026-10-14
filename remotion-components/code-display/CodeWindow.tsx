// 逐行打字的代码编辑器窗口：深色 macOS 外框、行号、语法高亮、橙色块状光标。
// 每行有自己的开始帧 at，可以在中间插入新行（下面的行会被平滑挤开）；内容超高时自动滚动。
// 依赖：base/theme.ts、code-display/timeline.ts（CodeLine 等）、code-display/WindowChrome.tsx、code-display/colorize.tsx。
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F, clamp, hexA } from "./theme";
import { ALWAYS, fadeWindow, visibleText, type CodeLine, type Highlight, type Mark } from "./timeline";
import { WindowChrome } from "./WindowChrome";
import { ColorizedText } from "./colorize";

export const CodeWindow: React.FC<{
  lines: CodeLine[];
  marks?: Mark[];
  highlights?: Highlight[];
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  fontSize?: number;
  lineHeight?: number;
  lineNumbers?: boolean;
}> = ({
  lines,
  marks = [],
  highlights = [],
  x,
  y,
  w,
  h,
  title = "main.ts",
  fontSize = 26,
  lineHeight = 40,
  lineNumbers = true,
}) => {
  const frame = useCurrentFrame();
  const padTop = 18;
  const viewH = h - 44 - padTop * 2;

  const heights = lines.map((l) =>
    l.at === ALWAYS
      ? lineHeight
      : interpolate(frame, [l.at - 6, l.at], [0, lineHeight], clamp),
  );
  const tops: number[] = [];
  let acc = 0;
  for (const hh of heights) {
    tops.push(acc);
    acc += hh;
  }
  const scroll = Math.max(0, acc - viewH);

  // 光标位于最近开始打字的那一行
  let cursorLine = -1;
  let latest = -Infinity;
  lines.forEach((l, i) => {
    if (l.at <= frame && l.at >= latest && l.at !== ALWAYS) {
      latest = l.at;
      cursorLine = i;
    }
  });

  let shown = 0;
  return (
    <WindowChrome x={x} y={y} w={w} h={h} title={title}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          fontFamily: F.mono,
          fontSize,
        }}
      >
        <div style={{ position: "absolute", left: 0, right: 0, top: padTop - scroll }}>
          {highlights.map((hl, i) => {
            const a = fadeWindow(frame, hl.from, hl.to);
            if (a <= 0) return null;
            const t0 = tops[hl.lines[0]] ?? 0;
            const t1 = (tops[hl.lines[1]] ?? 0) + (heights[hl.lines[1]] ?? 0);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 8,
                  right: 8,
                  top: t0 - 2,
                  height: t1 - t0 + 4,
                  borderRadius: 10,
                  background: hexA(hl.color ?? C.gold, 0.14 * a),
                  borderLeft: `5px solid ${hexA(hl.color ?? C.gold, a)}`,
                }}
              />
            );
          })}
          {lines.map((l, i) => {
            const text = visibleText(frame, l);
            if (text === null) return null;
            shown++;
            const lineMarks = marks
              .filter((m) => m.line === i)
              .map((m) => {
                const start = l.t.indexOf(m.text);
                return {
                  start,
                  end: start + m.text.length,
                  alpha: fadeWindow(frame, m.from, m.to),
                  color: m.color ?? C.gold,
                };
              })
              .filter((m) => m.start >= 0 && m.alpha > 0);
            const typing = text.length < l.t.length;
            const isCursor = i === cursorLine;
            const cursorOn = typing || Math.floor(frame / 15) % 2 === 0;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: tops[i],
                  height: lineHeight,
                  left: 0,
                  right: 0,
                  display: "flex",
                  alignItems: "center",
                  whiteSpace: "pre",
                  opacity: heights[i] / lineHeight,
                }}
              >
                {lineNumbers && (
                  <div
                    style={{
                      width: 64,
                      textAlign: "right",
                      paddingRight: 22,
                      color: "#5E5751",
                      fontSize: fontSize * 0.75,
                      flexShrink: 0,
                    }}
                  >
                    {shown}
                  </div>
                )}
                <div style={{ paddingLeft: lineNumbers ? 0 : 24 }}>
                  <ColorizedText text={text} marks={lineMarks} />
                  {isCursor && cursorOn && (
                    <span
                      style={{
                        display: "inline-block",
                        width: fontSize * 0.55,
                        height: fontSize * 1.15,
                        background: C.clay,
                        verticalAlign: "middle",
                        marginLeft: 2,
                        opacity: 0.9,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WindowChrome>
  );
};
