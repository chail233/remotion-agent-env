// 米白方格纸背景（全屏）。不用 Scene 外壳、单独搭场景时铺这张底。依赖：base/theme.ts。
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, hexA } from "./theme";

export const Paper: React.FC<{ tint?: string }> = ({ tint = C.bg }) => (
  <AbsoluteFill
    style={{
      background: tint,
      backgroundImage: `linear-gradient(${hexA("#C9B9A3", 0.18)} 1px, transparent 1px), linear-gradient(90deg, ${hexA("#C9B9A3", 0.18)} 1px, transparent 1px)`,
      backgroundSize: "48px 48px",
    }}
  />
);
