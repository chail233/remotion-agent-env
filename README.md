# Remotion Agent Env

一个给 **AI Agent 使用的 Remotion 动画开发环境**（toolchain only，不含动画内容）。
克隆即用：依赖已锁版本、渲染用浏览器自动下载、Agent 的操作说明放在 `AGENTS.md`。

A ready-to-use Remotion workspace intended for AI agents to author and render animations in.
It ships the toolchain and conventions, **not** demo compositions — `src/Root.tsx` is a placeholder.

## 快速开始

```bash
npm install
npx remotion browser ensure   # 下载 Chrome Headless Shell（约 120MB，渲染必需）
npm run dev                   # Studio，默认 http://localhost:3000
```

本机不需要装 Chrome，也不需要装系统 ffmpeg（Remotion 自带）。Windows / macOS / Linux 均可。

## 环境构成

| 组成 | 说明 |
| --- | --- |
| `remotion` + `@remotion/cli` / `bundler` / `renderer` / `player` / `transitions` / `google-fonts` / `media` | 全部 **4.0.535**，Remotion 要求各包与主包同版本 |
| React 19.3 / TypeScript 5.9 / zod 4.5.4 | zod 版本由 Remotion 锁定，不要手动升 |
| Chrome Headless Shell | 落在 `node_modules/.remotion/`，不进仓库 |
| `remotion-components/` | 本地通用组件库，**可选用**，见下文 |

## 命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动 Studio（长驻进程） |
| `npm run compositions` | 列出已注册合成；0 个合成时会报 `Array of 0 length`，属正常 |
| `npm run still -- <Id> out/x.png` | 渲染单帧，最快的视觉验证 |
| `npm run render -- <Id> out/x.mp4` | 渲染视频；加 `--frames=0-60` 做短片验证 |
| `npm run bundle` | 产出可嵌入的静态 bundle |
| `npm run typecheck` | 类型检查 |
| `npm run upgrade` | 升级 Remotion 全家桶（保持版本一致） |
| `npm run format` | Prettier 写入格式 |

新增 Remotion 生态包请用 `npx remotion add <pkg>`，再用 `npx remotion versions` 校验，避免版本漂移。

## 目录

```
src/index.ts             registerRoot 入口
src/Root.tsx             合成注册处（当前为占位）
remotion.config.ts       入口 / public 目录 / jpeg / ANGLE 光栅化
public/                  静态资源，代码里用 staticFile("...") 引用
out/                     渲染产物（已 gitignore）
remotion-components/     本地组件库
AGENTS.md                给 Agent 读的环境说明
```

## remotion-components —— 可选用的组件库

`remotion-components/` 是一份参数驱动的通用组件集（主题与字体、背景/外壳/面板、字幕/气泡/标签/进度条、代码与终端窗口、粒子特效、像素角色、动效 hook、音效与批量预览脚本）。总目录见 `remotion-components/AGENTS.md`，每个分类目录下另有外观说明表。

用法上的三个事实：

- **工具箱不是模板**：可以只用一部分、完全不用，也可以拷进 `src/` 之后随意改样式、拆件、重组。它的默认外观不应影响你的设计与创意。
- **不参与 `npm run typecheck`**：库内 import 写成同目录形式（`./theme`），放在原目录解析不到；拷进 `src/` 同一目录（或统一改 import 路径）后即纳入检查。拷贝时 `base/theme.ts` 基本必带，`code-display/` 还依赖 `timeline.ts` 与 `colorize.tsx`。
- **坐标按 1920×1080 标定**，换画布尺寸时缩放外层容器或改 props；时间参数一律用帧。

素材脚本在项目根运行（`--out` 相对当前目录）：

```bash
node remotion-components/scripts/make-audio.mjs --out public --duration 120   # 程序化合成 public/bgm.wav + public/sfx/*.wav
node remotion-components/scripts/stills.mjs --entry src/index.ts --comp <Id> 120 450   # 批量抽预览帧
```

`base/fonts.ts` 需要 `public/fonts/` 下有 `NotoSansSC-VF.ttf`、`NotoSerifSC-VF.ttf`、`CascadiaCode.ttf`（Windows 用户在 `C:\Windows\Fonts` 里就有，自行拷入即可）。

## 已知坑

- **黑屏 / 渲染崩溃**：把 `remotion.config.ts` 里的 `setChromiumOpenGlRenderer("angle")` 改成 `"swiftshader"`（无独显或驱动异常时更稳）。
- **中文字形**：`@remotion/google-fonts` 的 Inter 不含 CJK；用系统字体（Microsoft YaHei）或把 CJK 字库放进 `public/fonts/` 用 `@font-face` + `staticFile()` 加载。
- **确定性渲染**：动画里别用 `Math.random()` / `Date.now()`，用 Remotion 的 `random(seed)` 与由 `useCurrentFrame()` 推导的时间。
- **版本**：`zod` 必须与 Remotion 要求一致（当前 4.5.4），`npx remotion versions` 会直接告诉你哪个不对。

## 关于 AGENTS.md

`AGENTS.md` 只描述环境：装了什么、命令、环境层面的坑。它不规定动画怎么写——创作约束留给使用者，不写进项目文件。
