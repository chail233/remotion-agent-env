// 打字时间轴的纯逻辑工具（无 React），配合 code-display/CodeWindow、ConsoleWindow 使用。
// 约定：DEFAULT_SPEED = 每帧打 1.3 个字符，CodeWindow/ConsoleWindow 内部共用同一值。
// 典型排期：typeLines 生成代码行 → doneAt 算打完帧号 → console 条目 → consoleOutAt 拿结果帧号，
// 再用这些帧号对齐舞台动画和音效。依赖：base/theme.ts（颜色）、remotion（interpolate）。
import { interpolate } from "remotion";
import { clamp } from "./theme";

export type CodeLine = { t: string; at: number; speed?: number };
export type Mark = {
  line: number;
  text: string;
  from: number;
  to?: number;
  color?: string;
};
export type Highlight = {
  lines: [number, number];
  from: number;
  to?: number;
  color?: string;
};
export type ConsoleEntry = {
  at: number;
  cmd: string;
  out?: string;
  outAt?: number;
  kind?: "ok" | "error" | "info";
};

export const DEFAULT_SPEED = 1.3;
/** at 等于这个值表示「一开始就完整显示」，不打字 */
export const ALWAYS = -99999;

/** 生成一组连续打字的代码行：每一行在上一行打完后开始 */
export const typeLines = (
  start: number,
  texts: string[],
  opts: { speed?: number; gap?: number } = {},
): CodeLine[] => {
  const speed = opts.speed ?? DEFAULT_SPEED;
  const gap = opts.gap ?? 4;
  let t = start;
  return texts.map((text) => {
    const line = { t: text, at: t, speed };
    t += Math.ceil(text.trimStart().length / speed) + (text.trim() ? gap : 2);
    return line;
  });
};

export const staticLines = (texts: string[]): CodeLine[] =>
  texts.map((t) => ({ t, at: ALWAYS }));

/** 一组代码行全部打完的时刻 */
export const doneAt = (lines: CodeLine[]) =>
  Math.max(
    ...lines.map(
      (l) => l.at + Math.ceil(l.t.trimStart().length / (l.speed ?? DEFAULT_SPEED)),
    ),
  );

/** 某行在 frame 时刻应显示的文本（还没开始则返回 null） */
export const visibleText = (frame: number, l: CodeLine) => {
  if (frame < l.at) return null;
  const indent = l.t.length - l.t.trimStart().length;
  const n = Math.floor((frame - l.at) * (l.speed ?? DEFAULT_SPEED));
  return l.t.slice(0, indent + Math.max(0, n));
};

/** 控制台某条目结果出现的帧号 */
export const consoleOutAt = (e: ConsoleEntry) =>
  e.outAt ?? e.at + Math.ceil(e.cmd.length / DEFAULT_SPEED) + 12;

/** 高亮/标记在 [from, to] 区间内的可见度 0~1（两端 8 帧淡变） */
export const fadeWindow = (frame: number, from: number, to?: number, len = 8) => {
  const a = interpolate(frame, [from, from + len], [0, 1], clamp);
  const b = to === undefined ? 1 : interpolate(frame, [to - len, to], [1, 0], clamp);
  return Math.min(a, b);
};
