# Remotion Agent Env

一个给 **AI Agent 使用的 Remotion 动画开发环境**：锁好版本的 Remotion 工具链、可选组件库、素材/配音管线与技能库，不含成片内容。克隆即用，Agent 的操作说明在 `AGENTS.md`。

A ready-to-use Remotion workspace intended for AI agents to author and render animations in.

## 快速开始

```bash
npm install
npx remotion browser ensure   # 下载 Chrome Headless Shell（约 120MB，渲染必需）
npm run dev                   # Studio，默认 http://localhost:3000
```

本机不需要装 Chrome，也不需要装系统 ffmpeg（Remotion 自带）。Windows / macOS / Linux 均可。`src/Root.tsx` 默认不注册合成，新片自行加 `<Composition>`；`npm run compositions` 报 0 个属正常。

## 命令

| 命令                               | 用途                                                     |
| ---------------------------------- | -------------------------------------------------------- |
| `npm run dev`                      | 启动 Studio（长驻进程）                                  |
| `npm run compositions`             | 列出已注册合成；0 个合成时报 `Array of 0 length`，属正常 |
| `npm run still -- <Id> out/x.png`  | 渲染单帧，最快的视觉验证                                 |
| `npm run render -- <Id> out/x.mp4` | 渲染视频；加 `--frames=0-60` 做短片验证                  |
| `npm run bundle`                   | 产出可嵌入的静态 bundle                                  |
| `npm run typecheck`                | 类型检查（覆盖 `src/` 与 `remotion-components/`）        |
| `npm run upgrade`                  | 升级 Remotion 全家桶（保持版本一致）                     |
| `npm run format`                   | Prettier 写入格式                                        |

新增 Remotion 生态包请用 `npx remotion add <pkg>`，再用 `npx remotion versions` 校验，避免版本漂移。

## 目录

```
src/index.ts             registerRoot 入口
src/Root.tsx             合成注册处（默认空，新片在这里注册）
remotion.config.ts       入口 / public 目录 / jpeg / ANGLE 光栅化
public/                  静态资源，代码里用 staticFile("...") 引用
out/                     渲染产物（已 gitignore）
remotion-components/     本地组件库 + 素材/配音脚本（可选用）
recipes/                 外部镜头配方卡与审美准则
skills/                  Agent 技能库（Remotion 官方 + remotion-bits）
AGENTS.md                给 Agent 读的环境说明
```

## 组件库与管线

`remotion-components/` 是参数驱动的通用组件集：主题/字体、背景/面板、字幕/气泡/标签、代码/终端窗口、图表、粒子特效、转场、动效 hook、图标/Lottie/纹理、音效播放。组件总目录见 `remotion-components/AGENTS.md`，创作规则（成片质量要求、节奏/构图/反模式）见 `remotion-components/PLAYBOOK.md`。

它是工具箱不是模板：可按需取用、完全不用，或拷进 `src/` 后改样式/拆件。`tsconfig.json` 已把 `remotion-components` 纳入 include，`npm run typecheck` 直接检查整库。

常用管线（在项目根运行，`--out` 相对当前目录）：

```bash
# 配音 → 词级时间戳 + 字幕 → 场景时间轴
node remotion-components/scripts/gen-vo.mjs              # vo/script.json → public/vo/*.mp3 + meta.json
node remotion-components/scripts/build-vo-timeline.mjs   # meta.json → src/vo.ts（SCENES/CAPS/WORDS/BEATS）

# 美术素材
node remotion-components/scripts/fetch-icons.mjs --icons lucide:rocket lucide:cpu   # → public/icons
node remotion-components/scripts/make-textures.mjs --seed 7                         # → public/textures
node remotion-components/scripts/fetch-lottie.mjs --url <json直链> --name x --license MIT
node remotion-components/scripts/fetch-sfx.mjs --q "notification" --name ding       # → public/sfx

# 批量抽预览帧
node remotion-components/scripts/stills.mjs --entry src/index.ts --comp <Id> 120 450
```

生成的素材不进 git，按需重跑再生成；来源与许可见各目录的 licenses.json / manifest.json。参数说明见 `remotion-components/scripts/AGENTS.md`。

## 环境要点

- Remotion 4.0.535：core + cli + bundler + renderer + player + transitions + google-fonts + media + lottie + sfx + shapes；React 19 / TypeScript 5.9 / zod 4.5.4（zod 由 Remotion 锁定）
- Chrome Headless Shell 落在 `node_modules/.remotion/`，ffmpeg 由 Remotion 自带
- 中文字体：`base/fonts.ts` 读 `public/fonts/` 的 Noto Sans SC / Noto Serif SC / Cascadia Code，Windows 可从 `C:\Windows\Fonts` 拷入
- 配音用 `msedge-tts`（免 key），音效/BGM 按片自备，见 `remotion-components/audio/AGENTS.md`

## 已知坑

- **黑屏 / 渲染崩溃**：把 `remotion.config.ts` 的 `setChromiumOpenGlRenderer("angle")` 改成 `"swiftshader"`。
- **动画不确定**：别用 `Math.random()` / `Date.now()`，用 `random(seed)` 与 `useCurrentFrame()` 推导时间。
- **中文字形**：`@remotion/google-fonts` 的 Inter 不含 CJK；用系统字体或把 CJK 字库放进 `public/fonts/`。
- **代理网络**：脚本报 `UNABLE_TO_VERIFY_LEAF_SIGNATURE` 时，前缀 `NODE_OPTIONS=--use-system-ca` 用系统证书。

更多排查命令见 `AGENTS.md` 的「渲染异常排查」。

## 关于 AGENTS.md

`AGENTS.md` 只描述环境：装了什么、命令、环境层面的坑。它不规定动画怎么写——创作与成片要求见 `remotion-components/PLAYBOOK.md` 与 `recipes/`。
