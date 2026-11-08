import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { loadFonts } from "../remotion-components/base/fonts";
import { C, F, FPS, H, W, clamp } from "../remotion-components/base/theme";
import { LightBg } from "../remotion-components/scene/LightBg";
import { Paper } from "../remotion-components/scene/Paper";
import { Stage } from "../remotion-components/scene/Stage";
import { Captions, type Cap } from "../remotion-components/text/Captions";
import { RichText } from "../remotion-components/text/RichText";
import { StatBar } from "../remotion-components/text/StatBar";
import { Tag } from "../remotion-components/text/Tag";
import { Typewriter } from "../remotion-components/text/Typewriter";
import {
  doneAt,
  staticLines,
  typeLines,
} from "../remotion-components/code-display/timeline";
import { CodeWindow } from "../remotion-components/code-display/CodeWindow";
import { BarChart } from "../remotion-components/chart/BarChart";
import { Sparkles } from "../remotion-components/effects/Sparkles";
import { whipPan } from "../remotion-components/transitions/WhipPan";
import { Icon } from "../remotion-components/media/Icon";
import { LottieAnim } from "../remotion-components/media/LottieAnim";
import { Texture } from "../remotion-components/media/Texture";

loadFonts();

// CoreKitDemo — 基础库活示例（亮色）：scene 背景/面板、text 文字件、code-display 打字窗口、
// chart 图表、effects 星光、transitions 转场，供 npm run still / stills.mjs 抽帧检查外观，
// 也是新项目的接入参考。
const DUR_A = 200;
const DUR_B = 200;
const TRANS = 20;
const DUR = DUR_A + DUR_B - TRANS;

const CAPS: Cap[] = [
  [14, 178, "「scene」铺背景与面板，文字交给 text/ 各件"],
  [210, 366, "code-display 按时间轴打字，图表与数值条由帧号驱动"],
];

const SceneA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <LightBg />
      {/* 左列：眉题 + 打字机标题 + 小语法行 + 弹簧标签组 */}
      <div style={{ position: "absolute", left: 150, top: 250, width: 800 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 20,
            letterSpacing: "0.26em",
            color: C.clay,
            textTransform: "uppercase",
          }}
        >
          Component Library
        </div>
        <div style={{ marginTop: 28 }}>
          <Typewriter
            text="参数驱动的通用积木"
            delay={14}
            per={3}
            style={{
              fontFamily: F.serif,
              fontSize: 76,
              fontWeight: 700,
              color: C.ink,
            }}
          />
        </div>
        <div style={{ marginTop: 32, fontSize: 30, color: C.inkSoft }}>
          <RichText text="「props」决定外观，帧号决定时间，`style` 决定位置" />
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 48 }}>
          {[
            { label: "背景", color: C.clay },
            { label: "面板", color: C.sky },
            { label: "文字", color: C.mint },
          ].map((t, i) => {
            const p = spring({
              frame: frame - 60 - i * 7,
              fps,
              config: { damping: 12, stiffness: 140 },
            });
            return (
              <div
                key={t.label}
                style={{ opacity: p, transform: `scale(${0.7 + 0.3 * p})` }}
              >
                <Tag color={t.color}>{t.label}</Tag>
              </div>
            );
          })}
        </div>
      </div>
      {/* 右侧舞台：柱状图逐根弹簧生长 */}
      <Stage x={1040} y={130} w={740} h={640}>
        <BarChart
          style={{ left: 50, top: 90 }}
          width={640}
          height={460}
          barColor={C.sky}
          delay={46}
          stagger={7}
          data={[
            { label: "背景", value: 64 },
            { label: "文字", value: 38 },
            { label: "图表", value: 81 },
          ]}
        />
      </Stage>
    </AbsoluteFill>
  );
};

const SceneB: React.FC = () => {
  const frame = useCurrentFrame();
  const codeLines = [
    ...staticLines(["// 打字时间轴由 typeLines 排期"]),
    ...typeLines(
      20,
      [
        "type Beat = { at: number; note: string };",
        "",
        "export const score = (frame: number) => {",
        "  const t = interpolate(frame, [0, 120], [0, 1]);",
        "  return Math.sin(t * Math.PI * 2);",
        "};",
      ],
      { speed: 1.5, gap: 3 },
    ),
  ];
  const done = doneAt(codeLines);
  return (
    <AbsoluteFill>
      <Paper />
      <CodeWindow
        lines={codeLines}
        x={100}
        y={110}
        w={1020}
        h={660}
        title="score.ts"
        marks={[
          {
            line: 4,
            text: "interpolate",
            from: done + 6,
            to: done + 80,
            color: C.codeKeyword,
          },
        ]}
        highlights={[{ lines: [4, 5], from: done + 11, color: C.sky }]}
      />
      {/* 右列：帧驱动的数值条 + 星光点缀 */}
      <div style={{ position: "absolute", left: 1220, top: 190, width: 580 }}>
        <Tag color={C.violet}>帧号驱动</Tag>
        <div style={{ marginTop: 42, fontSize: 28, color: C.inkSoft }}>
          <RichText text="「interpolate」给值，「spring」给手感" />
        </div>
      </div>
      <StatBar
        label="确定性"
        value={interpolate(frame, [90, 160], [8, 96], clamp)}
        color={C.mint}
        width={540}
        x={1220}
        y={430}
      />
      <StatBar
        label="可复现"
        value={interpolate(frame, [115, 185], [8, 88], clamp)}
        color={C.sky}
        width={540}
        x={1220}
        y={530}
      />
      <Sparkles at={150} x={1750} y={390} seed="corekit" />
    </AbsoluteFill>
  );
};

const CoreKitDemo: React.FC = () => (
  <>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={DUR_A}>
        <SceneA />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={whipPan({ direction: "left" })}
        timing={linearTiming({ durationInFrames: TRANS })}
      />
      <TransitionSeries.Sequence durationInFrames={DUR_B}>
        <SceneB />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <Captions caps={CAPS} />
  </>
);

// MediaKitDemo — media/ 素材管线活示例：Texture（make-textures 产物）+ Icon（fetch-icons 产物）
// + LottieAnim（fetch-lottie 产物）。先跑一遍三条管线脚本再渲染本合成。
const MEDIA_DUR = 180;

const ICONS: { name: string; label: string; color: string }[] = [
  { name: "lucide-rocket", label: "lucide", color: "#FFB35C" },
  { name: "lucide-cpu", label: "lucide", color: "#5FE3C8" },
  { name: "lucide-git-branch", label: "lucide", color: "#6FA8FF" },
  { name: "tabler-brand-react", label: "tabler", color: "#B49BFF" },
];

const MediaKitDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#07080C",
        fontFamily: '"Kit Sans", "Microsoft YaHei", sans-serif',
      }}
    >
      <Texture src="textures/mesh.svg" />
      <Texture src="textures/noise.svg" repeat="tile" opacity={0.05} drift={0.5} />

      {/* 左列：标题 + 图标行（逐个弹簧入场，mask 上色） */}
      <div style={{ position: "absolute", left: 150, top: 210, width: 700 }}>
        <div
          style={{
            fontFamily: '"Kit Mono", monospace',
            fontSize: 20,
            letterSpacing: "0.26em",
            color: "#FFB35C",
            textTransform: "uppercase",
          }}
        >
          Asset Pipelines
        </div>
        <div
          style={{
            fontFamily: '"Kit Serif", serif',
            fontSize: 76,
            fontWeight: 700,
            color: "#F3EFE7",
            marginTop: 18,
            lineHeight: 1.2,
          }}
        >
          图标 · Lottie · 程序化纹理
        </div>
        <div style={{ color: "#98A0AE", fontSize: 26, marginTop: 16, lineHeight: 1.6 }}>
          素材由脚本生成或拉取到 public/，组件只负责消费；许可登记在清单文件里。
        </div>
        <div style={{ display: "flex", gap: 34, marginTop: 64 }}>
          {ICONS.map((ic, i) => {
            const p = spring({
              frame: frame - 40 - i * 8,
              fps,
              config: { damping: 14, stiffness: 160, mass: 0.6 },
            });
            return (
              <div
                key={ic.name}
                style={{
                  textAlign: "center",
                  opacity: p,
                  transform: `scale(${0.7 + 0.3 * p})`,
                }}
              >
                <Icon name={ic.name} size={84} color={ic.color} />
                <div
                  style={{
                    fontFamily: '"Kit Mono", monospace',
                    fontSize: 17,
                    color: "#98A0AE",
                    marginTop: 14,
                    letterSpacing: "0.08em",
                  }}
                >
                  {ic.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 右列：Lottie 动画（fetch-lottie 产物）+ 网格纹理小卡（drift 演示） */}
      <div
        style={{
          position: "absolute",
          left: 1060,
          top: 200,
          width: 620,
          height: 620,
          borderRadius: 28,
          background: "rgba(8,10,15,0.72)",
          border: "1px solid rgba(255,255,255,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LottieAnim src="lottie/demo-cat.json" loop style={{ width: 460 }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 1060,
          top: 850,
          width: 620,
          height: 120,
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <Texture src="textures/grid.svg" drift={0.8} style={{ backgroundSize: "auto" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#98A0AE",
            fontFamily: '"Kit Mono", monospace',
            fontSize: 20,
            letterSpacing: "0.12em",
          }}
        >
          textures/grid.svg · drift
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="CoreKitDemo"
      component={CoreKitDemo}
      durationInFrames={DUR}
      fps={FPS}
      width={W}
      height={H}
    />
    <Composition
      id="MediaKitDemo"
      component={MediaKitDemo}
      durationInFrames={MEDIA_DUR}
      fps={FPS}
      width={W}
      height={H}
    />
  </>
);
