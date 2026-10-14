// 像素风小 Claude 角色。依赖：base/theme.ts（C）。
// 用法与属性说明见 characters/README.md。自带待机动画（呼吸 + 约每 3 秒眨眼），只吃当前帧号。
import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "./theme";

export type Expression =
  | "normal"
  | "happy"
  | "love"
  | "surprised"
  | "shy"
  | "angry"
  | "wink"
  | "closed"
  | "proud";

export type Accessory = "none" | "beret" | "glasses" | "chef";
export type Holding = "none" | "laptop" | "flower" | "book" | "pan";

type Props = {
  size?: number;
  girl?: boolean;
  expression?: Expression;
  accessory?: Accessory;
  holding?: Holding;
  /** 0 = 实体，1 = 只有虚线轮廓（尚未实例化） */
  ghost?: number;
  wave?: boolean;
  color?: string;
  blinkSeed?: number;
  lookX?: number;
  bow?: boolean;
  style?: React.CSSProperties;
};

const INK = "#231F1C";

// 女版小 Claude：像素风的陶土色小家伙，戴着粉色蝴蝶结
export const Clawdia: React.FC<Props> = ({
  size = 320,
  girl = true,
  expression = "normal",
  accessory = "none",
  holding = "none",
  ghost = 0,
  wave = false,
  color,
  blinkSeed = 0,
  lookX = 0,
  bow,
  style,
}) => {
  const frame = useCurrentFrame();
  const body = color ?? (girl ? "#E07F62" : C.clay);
  const showBow = bow ?? (girl && accessory !== "beret" && accessory !== "chef");

  const breathe = 1 + Math.sin((frame + blinkSeed * 7) / 11) * 0.018;
  const cycle = (frame + blinkSeed * 37) % 96;
  const blinking =
    cycle < 5 && (expression === "normal" || expression === "proud");
  const armAngle = wave ? Math.sin(frame * 0.45) * 28 - 20 : Math.sin(frame / 14) * 3;
  const leftArmAngle = Math.sin(frame / 14 + 1) * 3;

  const lx = lookX * 4;

  const eye = (cx: number, side: "l" | "r") => {
    const e =
      expression === "wink" && side === "r" ? "happy" : expression;
    const x = cx + lx;
    if (blinking || e === "closed") {
      return <rect x={x - 6} y={63} width={12} height={3.5} fill={INK} />;
    }
    switch (e) {
      case "happy":
      case "wink":
        return (
          <path
            d={`M${x - 7} ${68} L${x} ${59} L${x + 7} ${68}`}
            stroke={INK}
            strokeWidth={4.2}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        );
      case "love": {
        const s = 1.15;
        return (
          <path
            transform={`translate(${x} ${64}) scale(${s})`}
            d="M0 7 C -9 0, -9 -8, -4 -8 C -1.5 -8, 0 -5.5, 0 -4 C 0 -5.5, 1.5 -8, 4 -8 C 9 -8, 9 0, 0 7 Z"
            fill={C.rose}
          />
        );
      }
      case "surprised":
        return (
          <g>
            <rect x={x - 6.5} y={52} width={13} height={22} fill={INK} />
            <rect x={x - 3} y={55} width={4} height={5} fill="#fff" />
          </g>
        );
      case "shy":
        return (
          <path
            d={`M${x - 7} ${61} Q${x} ${70} ${x + 7} ${61}`}
            stroke={INK}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
        );
      case "angry": {
        const d =
          side === "l"
            ? `M${x - 6} ${57} L${x + 5} ${64} L${x - 6} ${71}`
            : `M${x + 6} ${57} L${x - 5} ${64} L${x + 6} ${71}`;
        return (
          <path
            d={d}
            stroke={INK}
            strokeWidth={4.2}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        );
      }
      default:
        return (
          <g>
            <rect x={x - 5} y={55} width={10} height={18} fill={INK} />
            <rect x={x - 3} y={57} width={3} height={4} fill="#fff" opacity={0.85} />
          </g>
        );
    }
  };

  const lashes = (cx: number, dir: -1 | 1) => {
    if (!girl) return null;
    if (!["normal", "surprised", "proud"].includes(expression) || blinking) return null;
    const ox = cx + lx + dir * 5;
    return (
      <g stroke={INK} strokeWidth={2.4} strokeLinecap="round">
        <line x1={ox} y1={56} x2={ox + dir * 5} y2={51} />
        <line x1={ox} y1={60} x2={ox + dir * 6} y2={57} />
      </g>
    );
  };

  const mouth = () => {
    const x = 80 + lx;
    switch (expression) {
      case "happy":
      case "love":
      case "wink":
      case "proud":
        return (
          <path
            d={`M${x - 6} 80 Q${x} 87 ${x + 6} 80`}
            stroke={INK}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
        );
      case "surprised":
        return <ellipse cx={x} cy={84} rx={4} ry={5} fill={INK} />;
      case "shy":
        return (
          <path
            d={`M${x - 4} 82 Q${x} 85 ${x + 4} 82`}
            stroke={INK}
            strokeWidth={2.6}
            fill="none"
            strokeLinecap="round"
          />
        );
      case "angry":
        return (
          <path
            d={`M${x - 6} 84 L${x - 2} 81 L${x + 2} 84 L${x + 6} 81`}
            stroke={INK}
            strokeWidth={2.6}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      default:
        return null;
    }
  };

  const blushOpacity = !girl
    ? expression === "shy" || expression === "love"
      ? 0.5
      : 0
    : expression === "shy" || expression === "love"
      ? 0.95
      : 0.6;
  const blushR = expression === "shy" || expression === "love" ? 10 : 7.5;

  const solid = (
    <g>
      {/* 腿 */}
      <g fill={body} shapeRendering="crispEdges">
        <rect x={38} y={102} width={9} height={17} />
        <rect x={53} y={102} width={9} height={17} />
        <rect x={98} y={102} width={9} height={17} />
        <rect x={113} y={102} width={9} height={17} />
      </g>
      {/* 左臂 */}
      <g transform={`rotate(${leftArmAngle} 31 74)`}>
        <rect x={13} y={66} width={20} height={16} fill={body} shapeRendering="crispEdges" />
      </g>
      {/* 右臂 */}
      <g transform={`rotate(${-armAngle} 129 74)`}>
        <rect x={127} y={66} width={20} height={16} fill={body} shapeRendering="crispEdges" />
        {holding === "flower" && <Flower x={142} y={40} />}
      </g>
      {/* 身体 */}
      <rect x={30} y={42} width={100} height={62} fill={body} shapeRendering="crispEdges" />
      {/* 高光 */}
      <rect x={34} y={46} width={92} height={5} fill="#fff" opacity={0.12} />
      {/* 腮红 */}
      <ellipse cx={47 + lx} cy={80} rx={blushR} ry={blushR * 0.55} fill={C.pink} opacity={blushOpacity} />
      <ellipse cx={113 + lx} cy={80} rx={blushR} ry={blushR * 0.55} fill={C.pink} opacity={blushOpacity} />
      {eye(60, "l")}
      {eye(100, "r")}
      {lashes(60, -1)}
      {lashes(100, 1)}
      {mouth()}
      {accessory === "glasses" && (
        <g stroke={INK} strokeWidth={3} fill="rgba(255,255,255,0.18)">
          <circle cx={60 + lx} cy={64} r={14} />
          <circle cx={100 + lx} cy={64} r={14} />
          <line x1={74 + lx} y1={62} x2={86 + lx} y2={62} />
          <line x1={46 + lx} y1={62} x2={31} y2={58} />
          <line x1={114 + lx} y1={62} x2={129} y2={58} />
        </g>
      )}
      {showBow && <Bow />}
      {accessory === "beret" && (
        <g transform="rotate(-12 72 40)">
          <rect x={69} y={22} width={6} height={8} fill="#5E3E8F" />
          <ellipse cx={72} cy={38} rx={40} ry={11} fill={C.violet} />
          <ellipse cx={72} cy={41} rx={36} ry={5} fill="#7D63B5" />
        </g>
      )}
      {accessory === "chef" && (
        <g stroke="#D9D3CB" strokeWidth={2}>
          <circle cx={62} cy={22} r={13} fill="#fff" />
          <circle cx={98} cy={22} r={13} fill="#fff" />
          <circle cx={80} cy={14} r={16} fill="#fff" />
          <rect x={58} y={20} width={44} height={22} fill="#fff" stroke="none" />
          <rect x={58} y={34} width={44} height={9} fill="#F3EEE7" />
        </g>
      )}
      {holding === "laptop" && (
        <g>
          <rect x={46} y={74} width={68} height={30} rx={3} fill="#4A4F57" />
          <rect x={50} y={78} width={60} height={22} fill="#2C3138" />
          <path
            transform="translate(80 89) scale(0.55)"
            d="M0 7 C -9 0, -9 -8, -4 -8 C -1.5 -8, 0 -5.5, 0 -4 C 0 -5.5, 1.5 -8, 4 -8 C 9 -8, 9 0, 0 7 Z"
            fill={C.pink}
          />
          <rect x={40} y={104} width={80} height={6} rx={2} fill="#8E949C" />
        </g>
      )}
      {holding === "book" && (
        <g>
          <rect x={52} y={82} width={56} height={28} rx={2} fill="#7A5AB5" />
          <rect x={79} y={82} width={2} height={28} fill="#5E3E8F" />
          <rect x={56} y={86} width={20} height={2} fill="#E8DDF8" />
          <rect x={56} y={91} width={16} height={2} fill="#E8DDF8" />
          <rect x={84} y={86} width={20} height={2} fill="#E8DDF8" />
          <rect x={84} y={91} width={14} height={2} fill="#E8DDF8" />
        </g>
      )}
      {holding === "pan" && (
        <g>
          <rect x={112} y={88} width={34} height={6} rx={3} fill="#6B4A33" />
          <ellipse cx={92} cy={92} rx={24} ry={9} fill="#3A3A3E" />
          <ellipse cx={92} cy={89} rx={20} ry={6} fill="#55555B" />
          <circle cx={88} cy={88} r={5} fill="#FFF8E7" />
          <circle cx={88} cy={88} r={2.5} fill={C.gold} />
        </g>
      )}
    </g>
  );

  const outline = (
    <g
      fill="none"
      stroke={C.inkSoft}
      strokeWidth={2.5}
      strokeDasharray="6 5"
      strokeDashoffset={-frame * 0.6}
    >
      <rect x={38} y={102} width={9} height={17} />
      <rect x={53} y={102} width={9} height={17} />
      <rect x={98} y={102} width={9} height={17} />
      <rect x={113} y={102} width={9} height={17} />
      <rect x={13} y={66} width={20} height={16} />
      <rect x={127} y={66} width={20} height={16} />
      <rect x={30} y={42} width={100} height={62} fill="rgba(255,255,255,0.35)" />
      <text
        x={80}
        y={83}
        textAnchor="middle"
        fontSize={26}
        fill={C.inkSoft}
        stroke="none"
        fontFamily="sans-serif"
        fontWeight={700}
      >
        ?
      </text>
    </g>
  );

  return (
    <svg
      width={size}
      height={(size * 150) / 160}
      viewBox="0 0 160 150"
      style={{ overflow: "visible", ...style }}
    >
      <ellipse cx={80} cy={124} rx={56} ry={6} fill="#000" opacity={0.08 * (1 - ghost)} />
      <g transform={`translate(80 120) scale(1 ${breathe}) translate(-80 -120)`}>
        {ghost < 1 && <g opacity={1 - ghost}>{solid}</g>}
        {ghost > 0 && <g opacity={ghost}>{outline}</g>}
      </g>
    </svg>
  );
};

const Bow: React.FC = () => (
  <g transform="rotate(-14 112 40)">
    <path d="M112 40 L94 29 L95 51 Z" fill={C.pink} stroke={C.rose} strokeWidth={2} strokeLinejoin="round" />
    <path d="M112 40 L130 29 L129 51 Z" fill={C.pink} stroke={C.rose} strokeWidth={2} strokeLinejoin="round" />
    <rect x={107} y={35} width={10} height={10} rx={2} fill={C.rose} />
  </g>
);

const Flower: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <line x1={x - 4} y1={y + 34} x2={x} y2={y + 6} stroke="#4E9A63" strokeWidth={3} />
    {[0, 72, 144, 216, 288].map((a) => (
      <circle
        key={a}
        cx={x + Math.cos((a * Math.PI) / 180) * 7}
        cy={y + Math.sin((a * Math.PI) / 180) * 7}
        r={6}
        fill={C.rose}
      />
    ))}
    <circle cx={x} cy={y} r={4.5} fill={C.gold} />
  </g>
);
