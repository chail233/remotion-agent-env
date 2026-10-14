// 控制台窗口：绿色 ❯ 提示符逐字打出命令，随后出现以 ←（或 ✖）开头的结果行，超高自动滚动。
// 结果的出现帧号可用 timeline.ts 的 consoleOutAt 反推，用来同步舞台动画。
// 依赖：base/theme.ts、code-display/timeline.ts、code-display/WindowChrome.tsx、code-display/colorize.tsx。
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F, clamp } from "./theme";
import { DEFAULT_SPEED, consoleOutAt, type ConsoleEntry } from "./timeline";
import { WindowChrome } from "./WindowChrome";
import { ColorizedText } from "./colorize";

export const ConsoleWindow: React.FC<{
  entries: ConsoleEntry[];
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
  lineHeight?: number;
  title?: string;
}> = ({ entries, x, y, w, h, fontSize = 24, lineHeight = 38, title = "控制台 · 运行结果" }) => {
  const frame = useCurrentFrame();
  type Row = { kind: "cmd" | "ok" | "error" | "info"; text: string; at: number; full: string };
  const rows: Row[] = [];
  for (const e of entries) {
    if (frame < e.at) continue;
    const n = Math.floor((frame - e.at) * DEFAULT_SPEED);
    rows.push({ kind: "cmd", text: e.cmd.slice(0, n), at: e.at, full: e.cmd });
    const oa = consoleOutAt(e);
    if (e.out !== undefined && frame >= oa) {
      e.out.split("\n").forEach((o) => rows.push({ kind: e.kind ?? "ok", text: o, at: oa, full: o }));
    }
  }
  const viewH = h - 44 - 24;
  const heights = rows.map((r) =>
    interpolate(frame, [r.at - 1, r.at + 4], [0, lineHeight], clamp),
  );
  const total = heights.reduce((a, b) => a + b, 0);
  const scroll = Math.max(0, total - viewH);
  let acc = 0;
  return (
    <WindowChrome x={x} y={y} w={w} h={h} title={title} style={{ background: "#161513" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", fontFamily: F.mono, fontSize }}>
        <div style={{ position: "absolute", left: 24, right: 24, top: 12 - scroll }}>
          {rows.map((r, i) => {
            const top = acc;
            acc += heights[i];
            const colorMap = { ok: C.codeString, error: C.error, info: "#A9C7A0" } as const;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top,
                  height: lineHeight,
                  display: "flex",
                  alignItems: "center",
                  whiteSpace: "pre",
                  opacity: heights[i] / lineHeight,
                }}
              >
                {r.kind === "cmd" ? (
                  <>
                    <span style={{ color: C.mint, marginRight: 14 }}>❯</span>
                    <ColorizedText text={r.text} marks={[]} />
                  </>
                ) : (
                  <span style={{ color: colorMap[r.kind], paddingLeft: 4 }}>
                    {r.kind === "error" ? "✖ " : "← "}
                    {r.text}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </WindowChrome>
  );
};
