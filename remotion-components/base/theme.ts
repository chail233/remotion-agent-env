// 全库唯一的基础依赖：配色、字体栈、画布常量、两个小工具。
// 除 scripts/ 外，本库每个组件文件都 `import { C, F, ... } from "./theme"`（路径按项目结构调整）。
// 换主题只改这一个文件；字体家族名 'Kit *' 来自 base/fonts.ts 的 loadFonts()。

export const C = {
  bg: "#F5F0E8",
  bgDeep: "#EDE5D8",
  ink: "#2B2622",
  inkSoft: "#6B625A",
  clay: "#D97757",
  clayDark: "#B85C3E",
  pink: "#EE8FA6",
  pinkSoft: "#F9D3DC",
  rose: "#E25A7A",
  mint: "#5FB49C",
  sky: "#6C9BD2",
  gold: "#E8B04B",
  violet: "#9A7FD1",
  // 代码编辑器配色
  editor: "#1E1C1A",
  editorBar: "#2A2725",
  editorLine: "#34302D",
  codeText: "#E8E2D9",
  codeKeyword: "#E98A6B",
  codeType: "#7FC8B4",
  codeString: "#E8C27A",
  codeNumber: "#C79BE8",
  codeComment: "#8A8178",
  codeFunc: "#8BB8F0",
  codeClass: "#F2A7BC",
  codeThis: "#F07D9A",
  error: "#F0605A",
};

export const F = {
  sans: "'Kit Sans', 'Noto Sans SC', 'Microsoft YaHei', sans-serif",
  serif: "'Kit Serif', 'Noto Serif SC', 'SimSun', serif",
  mono: "'Kit Mono', 'Cascadia Code', Consolas, 'Kit Sans', 'Noto Sans SC', 'Segoe UI Emoji', monospace",
  emoji: "'Segoe UI Emoji', 'Noto Color Emoji', sans-serif",
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;

/** #RRGGBB -> rgba(r,g,b,alpha)，alpha 自动夹紧到 0~1 */
export const hexA = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
};

/** interpolate 的两端夹紧参数，全库统一用它 */
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
