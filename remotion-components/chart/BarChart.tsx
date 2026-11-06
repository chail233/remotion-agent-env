// chart/01 BarChart.tsx — 帧驱动柱状图：柱子逐根弹簧生长（错峰 stagger），数值与标签随柱浮出。
// 纯 SVG + remotion spring，无图表库依赖；数据变化或时间轴回退都天然可复现。
// 依赖：base/theme.ts。宽高即容器尺寸，放哪由外层定位。
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, hexA } from "./theme";

export const BarChart: React.FC<{
  data: { label: string; value: number }[];
  /** 容器宽高（画布 px） */
  width?: number;
  height?: number;
  barColor?: string;
  /** 第一根柱的生长起始帧 */
  delay?: number;
  /** 相邻柱错峰帧数 */
  stagger?: number;
  /** 柱顶是否显示数值 */
  showValues?: boolean;
  style?: React.CSSProperties;
}> = ({
  data,
  width = 1000,
  height = 520,
  barColor = C.clay,
  delay = 0,
  stagger = 5,
  showValues = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const padding = 56;
  const labelSpace = 44;
  const valueSpace = showValues ? 40 : 0;
  const innerW = width - padding * 2;
  const innerH = height - padding - labelSpace - valueSpace;
  const max = Math.max(...data.map((d) => d.value));
  const barW = (innerW - 18 * (data.length - 1)) / data.length;
  const baseY = padding + innerH + valueSpace;

  return (
    <div style={{ position: "absolute", width, height, ...style }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line x1={padding} x2={padding + innerW} y1={baseY} y2={baseY} stroke={hexA(C.ink, 0.25)} strokeWidth={2} />
        {data.map((d, i) => {
          const target = (d.value / max) * innerH;
          const x = padding + i * (barW + 18);
          const grow = spring({
            frame: frame - delay - i * stagger,
            fps,
            config: { damping: 12, stiffness: 100, mass: 0.8 },
          });
          return (
            <g key={i}>
              <rect
                x={x}
                y={baseY - target}
                width={barW}
                height={target}
                rx={7}
                fill={barColor}
                style={{
                  transformOrigin: `${x + barW / 2}px ${baseY}px`,
                  transform: `scaleY(${grow})`,
                  filter: `drop-shadow(0 4px 16px ${hexA(barColor, 0.33)})`,
                }}
              />
              {showValues && (
                <text
                  x={x + barW / 2}
                  y={baseY - target - 12}
                  fill={C.ink}
                  fontSize={20}
                  fontWeight={700}
                  textAnchor="middle"
                  fontFamily={F.mono}
                  opacity={grow}
                >
                  {d.value.toLocaleString()}
                </text>
              )}
              <text
                x={x + barW / 2}
                y={baseY + 30}
                fill={C.inkSoft}
                fontSize={18}
                textAnchor="middle"
                fontFamily={F.sans}
                opacity={grow}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
