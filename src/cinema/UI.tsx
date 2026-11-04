// cinema/05 UI.tsx — 深色电影感小部件集：DotChip（发光圆点胶囊）、CodeChip（终端风芯片）、
// Counter（滚动数字）、Kicker（眉题）、ChapterMark（左上角章节标）、Panel（玻璃卡片）、Dot（发光圆点）。
// 依赖：cinema/01 theme.ts、cinema/03 Reveal.tsx（DotChip/CodeChip/ChapterMark 的入场）。
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, glow, theme } from "./theme";
import { Reveal } from "./Reveal";

/** 发光圆点 + 文字的胶囊，弹簧入场；active 时点亮边框与外发光。 */
export const DotChip: React.FC<{
  label: string;
  color?: string;
  size?: number;
  delay?: number;
  active?: boolean;
  style?: React.CSSProperties;
}> = ({
  label,
  color = theme.colors.hero,
  size = 26,
  delay = 0,
  active = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: theme.spring.snappy });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.42,
        padding: `${size * 0.32}px ${size * 0.62}px`,
        borderRadius: 999,
        border: `1px solid ${alpha(color, active ? 0.65 : 0.28)}`,
        background: alpha(color, active ? 0.16 : 0.07),
        boxShadow: active ? `0 0 26px ${alpha(color, 0.22)}` : "none",
        color: active ? color : alpha(color, 0.9),
        fontFamily: theme.fonts.body,
        fontSize: size,
        fontWeight: 600,
        letterSpacing: "0.01em",
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [14, 0])}px) scale(${interpolate(
          p,
          [0, 1],
          [0.9, 1],
        )})`,
        ...style,
      }}
    >
      <div
        style={{
          width: size * 0.34,
          height: size * 0.34,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 ${size * 0.5}px ${alpha(color, 0.8)}`,
        }}
      />
      {label}
    </div>
  );
};

/** 终端风芯片：左侧发光竖条 + ›提示符 + 等宽内容，Reveal 入场。 */
export const CodeChip: React.FC<{
  code: React.ReactNode;
  delay?: number;
  size?: number;
  style?: React.CSSProperties;
  /** 左条与提示符颜色，默认琥珀 hero */
  accent?: string;
  dim?: boolean;
}> = ({ code, delay = 0, size = 23, style, accent = theme.colors.hero, dim = false }) => {
  const c = accent;
  return (
    <Reveal delay={delay} y={20} scaleFrom={0.96} style={style}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          padding: `${size * 0.62}px ${size * 0.95}px`,
          borderRadius: 12,
          background: "rgba(8,10,15,0.72)",
          border: `1px solid ${alpha(c, dim ? 0.18 : 0.3)}`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 40px -24px rgba(0,0,0,0.9)`,
          fontFamily: theme.fonts.mono,
          fontSize: size,
          color: dim ? theme.colors.dim : theme.colors.ink,
          lineHeight: 1.25,
          letterSpacing: "0.01em",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            width: 3,
            alignSelf: "stretch",
            borderRadius: 3,
            background: c,
            boxShadow: `0 0 12px ${alpha(c, 0.8)}`,
            opacity: dim ? 0.5 : 1,
          }}
        />
        <span style={{ color: alpha(c, 0.95) }}>›</span>
        {code}
      </div>
    </Reveal>
  );
};

/** 滚动数字：duration 控制的弹簧从 from 数到 to，tabular-nums 保证数字不抖宽。 */
export const Counter: React.FC<{
  to: number;
  from?: number;
  delay?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
  color?: string;
}> = ({
  to,
  from = 0,
  delay = 0,
  duration = 40,
  decimals = 0,
  prefix = "",
  suffix = "",
  style,
  color = theme.colors.ink,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - delay,
    fps,
    durationInFrames: duration,
    config: { damping: 30, stiffness: 55, mass: 1 },
  });
  const v = from + (to - from) * p;
  return (
    <span
      style={{
        fontVariantNumeric: "tabular-nums",
        color,
        ...style,
      }}
    >
      {prefix}
      {v.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

/** 眉题：等宽字体、大字距、全大写的小号引导文字。 */
export const Kicker: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
  size?: number;
}> = ({ children, color = theme.colors.hero, style, size = 20 }) => (
  <div
    style={{
      fontFamily: theme.fonts.mono,
      fontSize: size,
      letterSpacing: "0.26em",
      textTransform: "uppercase",
      color,
      opacity: 0.85,
      ...style,
    }}
  >
    {children}
  </div>
);

/** 固定在左上角的章节标（left 92 / top 54，按 1920×1080 标定）：大号章号 + 竖线 + 标题 + 英文小字。 */
export const ChapterMark: React.FC<{
  no: string;
  title: string;
  en: string;
  color: string;
  delay?: number;
}> = ({ no, title, en, color, delay = 0 }) => (
  <Reveal
    delay={delay}
    y={-16}
    scaleFrom={0.98}
    style={{ position: "absolute", left: 92, top: 54 }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontSize: 46,
          fontWeight: 700,
          color,
          lineHeight: 1,
          textShadow: `0 0 24px ${alpha(color, 0.35)}`,
        }}
      >
        {no}
      </div>
      <div style={{ width: 1, height: 34, background: alpha(color, 0.4) }} />
      <div>
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 27,
            fontWeight: 600,
            color: theme.colors.ink,
            letterSpacing: "0.02em",
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: 14,
            letterSpacing: "0.24em",
            color: theme.colors.dim,
            marginTop: 4,
            textTransform: "uppercase",
          }}
        >
          {en}
        </div>
      </div>
    </div>
  </Reveal>
);

/** 玻璃卡片：白色渐变弱底 + 细边框 + 背景模糊；glowOn 时换成主题色外发光。 */
export const Panel: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
  pad?: number;
  glowOn?: boolean;
}> = ({ children, color = theme.colors.hero, style, pad = 28, glowOn = false }) => (
  <div
    style={{
      background:
        "linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.022) 60%, rgba(255,255,255,0.012) 100%)",
      border: `1px solid ${theme.colors.line}`,
      borderRadius: 24,
      padding: pad,
      boxShadow: glowOn
        ? `${glow(color, 0.9)}, inset 0 1px 0 rgba(255,255,255,0.06)`
        : "inset 0 1px 0 rgba(255,255,255,0.05), 0 30px 60px -40px rgba(0,0,0,0.9)",
      backdropFilter: "blur(6px)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** 发光圆点：粒子 / 进程 / 节点等最小视觉单元。 */
export const Dot: React.FC<{
  color: string;
  size?: number;
  glowSize?: number;
  style?: React.CSSProperties;
}> = ({ color, size = 12, glowSize = 18, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      boxShadow: `0 0 ${glowSize}px ${alpha(color, 0.85)}, 0 0 ${glowSize * 2.2}px ${alpha(
        color,
        0.35,
      )}`,
      ...style,
    }}
  />
);
