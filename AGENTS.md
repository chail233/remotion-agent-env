# Remotion 动画生产环境

这个工作区是 Agent 制作 Remotion 动画的**生产环境**。本文件只说明环境，不约束动画内容怎么写。

## 环境构成

- Remotion 4.0.535：core + cli + bundler + player + transitions + google-fonts + media + lottie + sfx
- React 19、TypeScript 5.9、zod 4.5.4（版本由 Remotion 锁定）
- Chrome Headless Shell 已下载到 `node_modules/.remotion/`，本机无需装 Chrome
- Remotion 自带 ffmpeg，不依赖系统 ffmpeg
- 渲染产物放 `out/`（已 gitignore）；静态资源放 `public/`
- 系统字体可用（如 Microsoft YaHei）；`@remotion/google-fonts` 的 Inter 不含中日韩字形
- `remotion-components/`：本地通用组件库（非 npm 包），可选用，见下节
- `skills/`：Agent 技能库（Remotion 官方技能 + remotion-bits），见下节

## 命令

| 命令                               | 用途                                                            |
| ---------------------------------- | --------------------------------------------------------------- |
| `npm run dev`                      | 启动 Studio（长驻进程，后台方式跑；默认 http://localhost:3000） |
| `npm run compositions`             | 列出已注册合成；0 个合成时报 `Array of 0 length`，属正常        |
| `npm run still -- <Id> out/x.png`  | 渲染单帧，最快的视觉验证                                        |
| `npm run render -- <Id> out/x.mp4` | 渲染视频；加 `--frames=0-60` 做短片验证                         |
| `npm run typecheck`                | 类型检查                                                        |
| `npm run upgrade`                  | 升级 Remotion 全家桶                                            |

入口 `src/index.ts` → `src/Root.tsx`（已注册 `CinemaKitDemo` 与 `MediaKitDemo` 两个演示合成；`MediaKitDemo` 依赖素材，渲染前先跑一遍下面三条素材管线）。

新增 Remotion 包用 `npx remotion add <pkg>` 以保证版本一致，`npx remotion versions` 校验。

## 组件库 remotion-components/

本地组件库（不是 npm 包）：`base` 主题/字体、`scene` 背景/外壳/面板、`text` 字幕/气泡/标签/进度条、`code-display` 代码与终端窗口、`effects` 粒子、`motion` hook、`media` 图标/Lottie/纹理消费件、`audio` 音效、`cinema` 深色电影感套件、`scripts` 素材生成与批量预览。总目录见 `remotion-components/AGENTS.md`，各分类目录下另有外观说明表。创作规则（节奏/拍点/构图/反模式）见 `remotion-components/PLAYBOOK.md`；外部配方卡与审美准则全文在 `recipes/`（按需查阅）。

- **按需取用**：它是工具箱不是模板。可以只用一部分、完全不用，也可以把文件拷进 `src/` 后随意改样式、拆件、重组。库的默认外观不构成对创意与设计的约束——方案与组件冲突时改组件。
- **可直接引用，也可拷进 `src/` 改**：库内 import 写成同目录形式（`./theme`），原地可解析——演示合成就是直接从 `src/Root.tsx` 引用 `remotion-components/` 的（这些文件因此被 `npm run typecheck` 传递检查）。想改样式/拆件时把文件拷进 `src/` 的同一目录再动。拷贝时 `base/theme.ts` 基本必带；`code-display/` 还依赖 `timeline.ts` 与 `colorize.tsx`；`cinema/` 自带独立 theme 整目录一起拷；`media/` 免 theme 但素材要先用脚本生成到 public/。
- **依赖已就绪**：`scripts/stills.mjs` 需要的 `@remotion/bundler`、`@remotion/renderer`（4.0.535）已装并在 package.json 里声明。
- **字体素材**：`base/fonts.ts` 读 `public/fonts/NotoSansSC-VF.ttf`、`NotoSerifSC-VF.ttf`、`CascadiaCode.ttf`，本机 `C:\Windows\Fonts` 三个都在，需要时自行拷入：

  ```bash
  mkdir -p public/fonts && cp /c/Windows/Fonts/{NotoSansSC-VF,NotoSerifSC-VF,CascadiaCode}.ttf public/fonts/
  ```

- **素材与预览脚本**（在项目根运行，`--out` 相对当前目录；美术素材不必全靠手画，优先走这三条管线）：

  ```bash
  node remotion-components/scripts/make-audio.mjs --out public                      # 生成 public/sfx/*.wav（12 个基础音效，配 Sfx）
  node remotion-components/scripts/fetch-icons.mjs --icons lucide:rocket lucide:cpu  # Iconify 图标 → public/icons（配 media/Icon）
  node remotion-components/scripts/make-textures.mjs --seed 7                        # 程序化纹理 SVG → public/textures（配 media/Texture）
  node remotion-components/scripts/make-jsfx.mjs                                     # jsfxr 8-bit 音效 → public/sfx/*.wav（配 Sfx）
  node remotion-components/scripts/fetch-sfx.mjs --q "notification" --name ding      # CC0 音效样本 → public/sfx/*.mp3（配 Audio）
  node remotion-components/scripts/fetch-lottie.mjs --url <json直链> --name x --license MIT   # Lottie → public/lottie（配 media/LottieAnim）
  node remotion-components/scripts/stills.mjs --entry src/index.ts --comp <Id> 120 450   # 批量抽预览帧
  ```

  生成的素材不进 git，按需重跑再生成；来源与许可见各目录下的 licenses.json / manifest.json。管线的完整参数说明在 `remotion-components/scripts/AGENTS.md`，消费组件（上色/播放/铺底）在 `remotion-components/media/AGENTS.md`。

- **音效/配乐来源**（消费端汇总见 `remotion-components/audio/AGENTS.md`）：12 个基础音效用 make-audio（上表）；补量走 make-jsfx（8-bit 预设与 sfxr 分享串）和 fetch-sfx（CC0 样本 mp3，`<Audio src={staticFile("sfx/x.mp3")}/>` 播）；官方 `@remotion/sfx`（已装）提供 32 个免署名直链音效，`import { whoosh } from "@remotion/sfx"` 后 `<Audio src={whoosh}/>` 直接用。**BGM 不再内置生成**：自备放 `public/bgm.wav`（AI 生成 / CC0 音乐包如 Kenney、FreePD），`<Bgm />` 播放并自动淡入淡出。配音 TTS 与字幕转录按 `skills/remotion-markup/` 的 `voiceover.md`、`transcribe-captions.md`。

- `npm run format` 已用 `.prettierignore` 跳过 `remotion-components/`，不会改写库本体。

## 技能库 skills/

`skills/` 存放 Agent 技能，每个子目录一个，入口是 `SKILL.md`（目录与用途总表、来源出处见 `skills/README.md`）。**接到任务后，动手前先到这里查有无对应技能：命中就先读完该技能的 `SKILL.md` 及其引用的专题卡，再按里面的做法做。**

- **Remotion 官方 13 个**（vendor 自 [remotion-dev/skills](https://github.com/remotion-dev/skills) @ `a2824c6`）：
  - `remotion-best-practices`：总纲，内嵌其余技能的完整副本，不确定用哪个就读它
  - 常用：`remotion-create`（新建项目/合成）、`remotion-markup`（合成/动画/媒体/音频/字体/时序/转场等 30+ 专题卡）、`remotion-studio`（起预览）、`remotion-render`（渲染视频/静帧）
  - 专项：`remotion-maps`（地图动画）、`remotion-captions`（字幕）、`remotion-interactivity`（Studio 内可交互）、`remotion-docs`（检索官方文档）、`remotion-multimedia`（Mediabunny 取媒体元数据）、`remotion-saas`（应用集成架构）、`remotion-upgrade`（升级）、`remotion-license`（许可证）
- **remotion-bits**：示例优先的创作工作流（MCP → CLI → 直读目录的回退链），出处见其 `SKILL.md`。
- 技能是文档不是代码：用法是按需读文件，不参与构建、不可 import。技能内的命令是通用写法（`npx remotion …`），在本环境对应上表中的 `npm run …`。

## 渲染异常排查

- 黑屏 / 崩溃：把 `remotion.config.ts` 的 `setChromiumOpenGlRenderer("angle")` 改成 `"swiftshader"`。
- 单帧复现：`npm run still -- <Id> out/debug.png --frame=<n>`。
- 详细日志：`npm run render -- <Id> out/x.mp4 --log=verbose`。
