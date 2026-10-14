// TypeScript 语法高亮（逐字符着色，支持中文标识符）+ 着色文本渲染器。
// ColorizedText 的 marks 参数用于给行内一段文字加发光框（CodeWindow 的 marks 会转换成它）。
// 注意：Cascadia Code 会把 >=、=> 渲染成连字（显示成 ≥、⇒）。依赖：base/theme.ts。
import React from "react";
import { C, hexA } from "./theme";

const KEYWORDS = new Set([
  "class", "constructor", "new", "const", "let", "return", "private", "public",
  "protected", "extends", "super", "if", "else", "for", "of", "while", "interface",
  "implements", "readonly", "true", "false", "function", "import", "export",
]);
const TYPES = new Set(["string", "number", "boolean", "void", "any"]);

/** 返回与 line 等长的颜色数组，每个字符一个颜色 */
export const colorize = (line: string): string[] => {
  const colors: string[] = new Array(line.length).fill(C.codeText);
  const re =
    /(\/\/.*$)|("(?:[^"\\]|\\.)*"?)|(`[^`]*`?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$一-龥][\w$一-龥]*)|(\S)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    let col = C.codeText;
    if (m[1]) col = C.codeComment;
    else if (m[2] || m[3]) col = C.codeString;
    else if (m[4]) col = C.codeNumber;
    else if (m[5]) {
      const w = m[5];
      const after = line.slice(m.index + w.length).trimStart();
      const before = line.slice(0, m.index).trimEnd();
      if (w === "this") col = C.codeThis;
      else if (KEYWORDS.has(w)) col = C.codeKeyword;
      else if (TYPES.has(w)) col = C.codeType;
      else if (/^[A-Z]/.test(w)) col = C.codeClass;
      else if (after.startsWith("(")) col = C.codeFunc;
      else if (before.endsWith(".")) col = "#F0D9C8";
    } else if (m[6]) {
      col = "#BDB4AA";
    }
    for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = col;
  }
  return colors;
};

/** 行内强调框：字符区间 + 可见度 + 颜色（由 CodeWindow 从 Mark 换算而来） */
export type LineMark = { start: number; end: number; alpha: number; color: string };

type Run = { text: string; color: string; mark: number };

export const ColorizedText: React.FC<{ text: string; marks: LineMark[] }> = ({
  text,
  marks,
}) => {
  const colors = colorize(text);
  const markOf = (i: number) => marks.findIndex((m) => i >= m.start && i < m.end);
  const runs: Run[] = [];
  for (let i = 0; i < text.length; i++) {
    const mk = markOf(i);
    const last = runs[runs.length - 1];
    if (last && last.color === colors[i] && last.mark === mk) last.text += text[i];
    else runs.push({ text: text[i], color: colors[i], mark: mk });
  }
  // 同一个标记里的多个颜色片段，包进同一个高亮框
  const groups: { mark: number; runs: Run[] }[] = [];
  for (const r of runs) {
    const g = groups[groups.length - 1];
    if (g && g.mark === r.mark) g.runs.push(r);
    else groups.push({ mark: r.mark, runs: [r] });
  }
  return (
    <>
      {groups.map((g, i) => {
        const m = g.mark >= 0 ? marks[g.mark] : null;
        const inner = g.runs.map((r, j) => (
          <span key={j} style={{ color: r.color }}>
            {r.text}
          </span>
        ));
        if (!m) return <React.Fragment key={i}>{inner}</React.Fragment>;
        return (
          <span
            key={i}
            style={{
              background: hexA(m.color, 0.3 * m.alpha),
              boxShadow: `0 0 0 3px ${hexA(m.color, 0.9 * m.alpha)}`,
              borderRadius: 6,
            }}
          >
            {inner}
          </span>
        );
      })}
    </>
  );
};
