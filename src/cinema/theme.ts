// cinema/01 theme.ts — 深色电影感套件的唯一 token 源：配色 / 字体 / 缓动曲线 / 弹簧配置 + alpha/glow 工具。
// 与 base/01 theme.ts 相互独立、不混用：本套件组件只 import 本文件，拷贝时整个 cinema/ 目录一起带。
// 自带画布常量 W/H/FPS（默认 1920×1080@30fps），换画布尺寸时改这里并等比缩放各组件 props。
// 字体族名对齐库约定（base/02 fonts.ts 注册出的 Kit Serif/Sans/Mono），附系统回退链。
import { Easing } from "remotion";

export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const theme = {
  colors: {
    bg: "#07080C",
    bgAlt: "#0C0F16",
    bgDeep: "#040509",
    ink: "#F3EFE7",
    dim: "#98A0AE",
    mute: "#5B6272",
    hero: "#FFB35C", // 琥珀 — 标题、强调、收益时刻
    heroSoft: "rgba(255, 179, 92, 0.14)",
    orange: "#F0874A",
    teal: "#5FE3C8",
    blue: "#6FA8FF",
    violet: "#B49BFF",
    danger: "#FF6B6B",
    ok: "#8BE28B",
    surface: "rgba(255,255,255,0.045)",
    surfaceStrong: "rgba(255,255,255,0.075)",
    line: "rgba(255,255,255,0.10)",
    lineSoft: "rgba(255,255,255,0.055)",
  },
  fonts: {
    display: '"Kit Serif", "Noto Serif SC", serif',
    body: '"Kit Sans", "Noto Sans SC", "Microsoft YaHei", sans-serif',
    mono: '"Kit Mono", "Cascadia Code", Consolas, monospace',
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
    glide: Easing.bezier(0.4, 0, 0.2, 1),
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
    soft: { damping: 26, stiffness: 55, mass: 1.1 },
  },
} as const;

/** hex（3/6 位）+ 透明度 → rgba() 字符串 */
export const alpha = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/** 双层外发光 box-shadow，strength 缩放半径与浓度 */
export const glow = (hex: string, strength = 1) =>
  `0 0 ${28 * strength}px ${alpha(hex, 0.45 * strength)}, 0 0 ${80 * strength}px ${alpha(
    hex,
    0.22 * strength,
  )}`;
