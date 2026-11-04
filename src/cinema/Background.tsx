// cinema/02 Background.tsx — 深色电影感背景栈：BgStage（三层底色渐变 + 双漂移光斑 + 点阵网格 + 地平线 + 尘埃）
// 与三个收尾层 Grade（柔光调色）/ Grain（动态颗粒）/ Vignette（暗角）。常经 cinema/04 SceneShell 组合，也可单独铺底。
// 所有漂移都是帧号的确定性函数，可复现。依赖：cinema/01 theme.ts。坐标按 1920×1080（theme 的 W/H）标定。
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { alpha, H, theme, W } from "./theme";

/** 确定性伪随机，[0,1)：同一输入永远同一输出，粒子形态可复现 */
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type BgProps = {
  /** 主光斑颜色，默认琥珀 hero */
  hue?: string;
  /** 副光斑颜色，默认蓝 blue */
  hue2?: string;
  /** 0..1 光斑整体强度 */
  intensity?: number;
  grid?: boolean;
  dust?: boolean;
};

/**
 * 背景栈第一层。永远不是纯色：两团缓慢漂移的模糊光斑、一层细点阵网格、
 * 一条低地平线（约 78% 高度）和缓缓上浮的尘埃。
 */
export const BgStage: React.FC<BgProps> = ({
  hue = theme.colors.hero,
  hue2 = theme.colors.blue,
  intensity = 1,
  grid = true,
  dust = true,
}) => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 61) * 54;
  const d2 = Math.cos(frame / 77) * 44;
  const d3 = Math.sin(frame / 43 + 1.7) * 28;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 120% 90% at 50% 42%, ${theme.colors.bgAlt} 0%, ${theme.colors.bg} 55%, ${theme.colors.bgDeep} 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1350,
          height: 1350,
          left: -380 + d1,
          top: -520 + d3,
          borderRadius: "50%",
          filter: "blur(80px)",
          opacity: 0.55 * intensity,
          background: `radial-gradient(circle, ${alpha(hue, 0.32)} 0%, ${alpha(
            hue,
            0.08,
          )} 46%, transparent 68%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1050,
          height: 1050,
          right: -330 - d2,
          bottom: -430 + d1 * 0.4,
          borderRadius: "50%",
          filter: "blur(90px)",
          opacity: 0.5 * intensity,
          background: `radial-gradient(circle, ${alpha(hue2, 0.26)} 0%, ${alpha(
            hue2,
            0.06,
          )} 50%, transparent 70%)`,
        }}
      />
      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.075) 1px, transparent 1.6px)",
            backgroundSize: "46px 46px",
            backgroundPosition: `${(frame * 0.22) % 46}px ${(frame * 0.12) % 46}px`,
            opacity: 0.35,
            maskImage:
              "radial-gradient(ellipse 62% 58% at 50% 46%, black 20%, transparent 78%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 62% 58% at 50% 46%, black 20%, transparent 78%)",
          }}
        />
      ) : null}
      {/* 低地平线：一条横向渐隐的 1px 亮线，约在 78% 高度 */}
      <div
        style={{
          position: "absolute",
          left: "6%",
          right: "6%",
          top: Math.round(H * 0.783),
          height: 1,
          background: `linear-gradient(90deg, transparent, ${alpha(
            hue,
            0.35,
          )}, transparent)`,
          opacity: 0.5,
        }}
      />
      {dust ? <Dust hue={hue} hue2={hue2} /> : null}
    </AbsoluteFill>
  );
};

const Dust: React.FC<{ hue: string; hue2: string }> = ({ hue, hue2 }) => {
  const frame = useCurrentFrame();
  const count = 34;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = rnd(i + 3) * W;
        const baseY = rnd(i + 91) * H;
        const speed = 0.12 + rnd(i + 17) * 0.34;
        const y = (baseY - frame * speed + H * 2) % H;
        const s = 1.4 + rnd(i + 41) * 2.6;
        const o = 0.05 + rnd(i + 7) * 0.16;
        const c = i % 5 === 0 ? hue2 : theme.colors.ink;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(frame / 90 + i) * 8,
              top: y,
              width: s,
              height: s,
              borderRadius: "50%",
              background: c,
              opacity: o,
              boxShadow: i % 4 === 0 ? `0 0 ${s * 5}px ${alpha(hue, 0.5)}` : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** 内容之上的柔光调色：主色 soft-light 罩 + 上下压暗 */
export const Grade: React.FC<{ hue: string; strength?: number }> = ({
  hue,
  strength = 0.16,
}) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{ backgroundColor: hue, mixBlendMode: "soft-light", opacity: strength }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(2,3,6,0.42) 0%, transparent 20%, transparent 66%, rgba(2,3,6,0.55) 100%)",
      }}
    />
  </AbsoluteFill>
);

/** 动态胶片颗粒：SVG feTurbulence 噪点平铺，随帧漂移，overlay 混合 */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: noise,
        backgroundSize: "220px",
        backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
        opacity: 0.055,
        mixBlendMode: "overlay",
      }}
    />
  );
};

/** 四周暗角：椭圆径向渐变压暗边缘 */
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at 50% 48%, transparent 52%, rgba(0,0,0,0.30) 88%, rgba(0,0,0,0.52) 100%)",
    }}
  />
);
