// media/03 Texture.tsx — 把 public/textures/*.svg 铺满全屏当背景层（cover），可选慢速漂移与透明度。
// 纹理由 scripts/05 make-textures.mjs seed 确定性生成（manifest.json 记录参数）。常垫在内容层之下、
// 其他背景之上。无主题依赖。drift 单位：每 100 帧平移一个视口百分比（0 关闭）。
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { staticFile } from "remotion";

export const Texture: React.FC<{
  /** public/ 下相对路径，如 "textures/mesh.svg" */
  src: string;
  opacity?: number;
  /** 背景平铺方式：cover（默认，全景纹理）或 tile（noise 类 tile） */
  repeat?: "cover" | "tile";
  /** 慢速漂移强度，0 关闭 */
  drift?: number;
  style?: React.CSSProperties;
}> = ({ src, opacity = 1, repeat = "cover", drift = 0, style }) => {
  const frame = useCurrentFrame();
  const url = staticFile(src);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity,
        backgroundImage: `url(${url})`,
        backgroundSize: repeat === "cover" ? "cover" : "220px 220px",
        backgroundRepeat: repeat === "cover" ? "no-repeat" : "repeat",
        backgroundPosition:
          drift > 0
            ? `${((frame * drift) / 100) % 100}% ${((frame * drift * 0.6) / 100) % 100}%`
            : "center",
        ...style,
      }}
    />
  );
};
