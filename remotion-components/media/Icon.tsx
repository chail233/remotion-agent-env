// media/01 Icon.tsx — 单色图标：把 public/icons/<name>.svg 作为 CSS mask 载入，backgroundColor 即颜色，
// 矢量缩放不发糊、随帧改色改透明度都行。图标由 scripts/03 fetch-icons.mjs 从 Iconify 拉取，许可见 public/icons/licenses.json。
// 注意：mask 会拍平成单色，多色图标请直接 <Img src={staticFile("icons/x.svg")} />。
// 无主题依赖（audio/Sfx 同级的免 theme 组件）。name = 文件名去 .svg，如 "lucide-rocket"。
import React from "react";
import { staticFile } from "remotion";

export const Icon: React.FC<{
  /** 图标文件名（public/icons/ 下，去 .svg），如 "lucide-rocket" */
  name: string;
  /** 边长 px（正方形，图标 contain 居中） */
  size?: number;
  /** 图标颜色（mask 上色） */
  color?: string;
  style?: React.CSSProperties;
}> = ({ name, size = 48, color = "#F3EFE7", style }) => {
  const url = staticFile(`icons/${name}.svg`);
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        display: "inline-block",
        flexShrink: 0,
        ...style,
      }}
    />
  );
};
