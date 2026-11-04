import React from "react";
import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import { loadFonts } from "./fonts";
import { Captions, type Cap } from "./cinema/Captions";
import { Reveal, Words } from "./cinema/Reveal";
import { Phase, PulseLine, SceneShell } from "./cinema/SceneShell";
import { ChapterMark, CodeChip, Counter, Dot, DotChip, Kicker, Panel } from "./cinema/UI";
import { FPS, H, theme, W } from "./cinema/theme";

loadFonts();

// CinemaKitDemo — cinema/ 套件全组件活示例（提取自 ConcurrentArt）。
// 用于 npm run still / stills.mjs 抽帧检查外观，也是新项目的接入参考。
const DUR = 240;

const CAPS: Cap[] = [
  [12, 130, "从 ConcurrentArt 提取的高质量组件，现在就位"],
  [130, 236, "光斑、颗粒、逐字级联与滚动数字，全部随帧号驱动"],
];

const CinemaKitDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = frame >= 70 ? ((frame - 70) % 60) / 60 : -1;
  return (
    <>
      <SceneShell hue={theme.colors.hero} hue2={theme.colors.blue} duration={DUR}>
        <ChapterMark
          no="01"
          title="电影感套件"
          en="Cinema Kit"
          color={theme.colors.hero}
          delay={10}
        />

        {/* 开场：眉题 + 逐字标题 + 代码芯片 */}
        <Phase from={8} to={132}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: 30,
              paddingBottom: 170,
            }}
          >
            <Reveal delay={14} y={20}>
              <Kicker>Remotion Components</Kicker>
            </Reveal>
            <Words
              text="深色电影感套件"
              hot={[2, 3, 4]}
              delay={24}
              style={{
                fontFamily: theme.fonts.display,
                fontSize: 96,
                fontWeight: 700,
                color: theme.colors.ink,
              }}
            />
            <Reveal delay={46}>
              <CodeChip
                code="npm run still -- CinemaKitDemo out/demo.png"
                accent={theme.colors.blue}
              />
            </Reveal>
          </AbsoluteFill>
        </Phase>

        {/* 后半：玻璃卡片（滚动数字 + 辉光点）与脉冲连线 */}
        <Phase from={70} to={236}>
          <Panel glowOn style={{ position: "absolute", left: 200, top: 620, width: 560 }}>
            <Kicker size={16}>Pipeline</Kicker>
            <div
              style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 12 }}
            >
              <Counter
                to={5400}
                delay={84}
                duration={60}
                color={theme.colors.hero}
                style={{
                  fontFamily: theme.fonts.display,
                  fontSize: 64,
                  fontWeight: 700,
                }}
              />
              <span
                style={{
                  color: theme.colors.dim,
                  fontFamily: theme.fonts.body,
                  fontSize: 24,
                }}
              >
                帧 · 180 秒
              </span>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 22 }}>
              {[
                theme.colors.hero,
                theme.colors.blue,
                theme.colors.violet,
                theme.colors.teal,
              ].map((c) => (
                <Dot key={c} color={c} size={14} glowSize={24} />
              ))}
            </div>
          </Panel>

          <PulseLine
            x1={1060}
            y1={730}
            x2={1700}
            y2={730}
            color={theme.colors.teal}
            width={2}
            dash
            pulse={pulse}
            opacity={0.7}
          />
          <Dot
            color={theme.colors.teal}
            size={14}
            glowSize={24}
            style={{ position: "absolute", left: 1053, top: 723 }}
          />
          <Dot
            color={theme.colors.teal}
            size={14}
            glowSize={24}
            style={{ position: "absolute", left: 1693, top: 723 }}
          />
          <div style={{ position: "absolute", left: 1000, top: 772 }}>
            <DotChip label="渲染" color={theme.colors.teal} size={22} delay={80} active />
          </div>
          <div style={{ position: "absolute", left: 1630, top: 772 }}>
            <DotChip label="输出" color={theme.colors.teal} size={22} delay={94} />
          </div>
        </Phase>
      </SceneShell>

      <Captions caps={CAPS} accent={theme.colors.hero} />
    </>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CinemaKitDemo"
    component={CinemaKitDemo}
    durationInFrames={DUR}
    fps={FPS}
    width={W}
    height={H}
  />
);
