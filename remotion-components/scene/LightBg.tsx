// scene/04 LightBg.tsx — 亮色完整背景栈：暖纸底 + 三团缓慢漂移的模糊光斑（可配色）+
// 细点阵网格 + 两角缓慢旋转的几何线稿装饰。
// 所有漂移都是帧号的确定性函数，可复现。依赖：base/theme.ts。坐标按 1920×1080 标定。
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, hexA } from "../base/theme";

export const LightBg: React.FC<{
  /** 左上大光斑色（默认 clay 陶土橙） */
  tintA?: string;
  /** 右下大光斑色（默认 sky 青蓝） */
  tintB?: string;
  /** 中部点缀光斑色（默认 gold） */
  tintC?: string;
  /** 纸底色 */
  bg?: string;
  /** 点阵网格层 */
  dots?: boolean;
  /** 角落旋转几何装饰 */
  corners?: boolean;
}> = ({ tintA = C.clay, tintB = C.sky, tintC = C.gold, bg = C.bg, dots = true, corners = true }) => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 95) * 46;
  const d2 = Math.cos(frame / 125) * 40;
  const d3 = Math.sin(frame / 150 + 2) * 34;
  const rot = frame * 0.02;
  const dotsCss = `radial-gradient(${hexA(C.ink, 0.1)} 1.6px, transparent 1.6px)`;
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <div
        style={{
          position: "absolute",
          width: 1250,
          height: 1250,
          borderRadius: "50%",
          top: -480,
          left: -320 + d1,
          filter: "blur(90px)",
          background: `radial-gradient(circle, ${hexA(tintA, 0.15)}, transparent 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1150,
          height: 1150,
          borderRadius: "50%",
          bottom: -460,
          right: -300 + d2,
          filter: "blur(100px)",
          background: `radial-gradient(circle, ${hexA(tintB, 0.14)}, transparent 64%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 720,
          height: 720,
          borderRadius: "50%",
          top: 240 + d3,
          left: 720,
          filter: "blur(110px)",
          background: `radial-gradient(circle, ${hexA(tintC, 0.11)}, transparent 60%)`,
        }}
      />
      {dots && <AbsoluteFill style={{ backgroundImage: dotsCss, backgroundSize: "46px 46px", opacity: 0.5 }} />}
      {corners && (
        <>
          <svg
            width="360"
            height="360"
            viewBox="0 0 100 100"
            style={{ position: "absolute", top: -110, right: -110, opacity: 0.5, transform: `rotate(${rot}deg)` }}
          >
            <circle cx="50" cy="50" r="46" fill="none" stroke={C.ink} strokeOpacity="0.12" strokeWidth="0.8" strokeDasharray="3 4" />
            <circle cx="50" cy="50" r="34" fill="none" stroke={tintA} strokeOpacity="0.18" strokeWidth="0.8" />
          </svg>
          <svg
            width="300"
            height="300"
            viewBox="0 0 100 100"
            style={{ position: "absolute", bottom: -90, left: -90, opacity: 0.5, transform: `rotate(${-rot * 0.8}deg)` }}
          >
            <rect x="18" y="18" width="64" height="64" rx="12" fill="none" stroke={tintB} strokeOpacity="0.16" strokeWidth="0.9" strokeDasharray="4 3" />
            <circle cx="50" cy="50" r="14" fill="none" stroke={C.ink} strokeOpacity="0.1" strokeWidth="0.8" />
          </svg>
        </>
      )}
    </AbsoluteFill>
  );
};
