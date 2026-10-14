# Remotion 动画生产环境

这个工作区是 Agent 制作 Remotion 动画的**生产环境**。本文件只说明环境，不约束动画内容怎么写。

## 环境构成

- Remotion 4.0.535：core + cli + bundler + player + transitions + google-fonts + media
- React 19、TypeScript 5.9、zod 4.5.4（版本由 Remotion 锁定）
- Chrome Headless Shell 已下载到 `node_modules/.remotion/`，本机无需装 Chrome
- Remotion 自带 ffmpeg，不依赖系统 ffmpeg
- 渲染产物放 `out/`（已 gitignore）；静态资源放 `public/`
- 系统字体可用（如 Microsoft YaHei）；`@remotion/google-fonts` 的 Inter 不含中日韩字形
- `remotion-components/`：本地通用组件库（非 npm 包），可选用，见下节

## 命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动 Studio（长驻进程，后台方式跑；默认 http://localhost:3000） |
| `npm run compositions` | 列出已注册合成；0 个合成时报 `Array of 0 length`，属正常 |
| `npm run still -- <Id> out/x.png` | 渲染单帧，最快的视觉验证 |
| `npm run render -- <Id> out/x.mp4` | 渲染视频；加 `--frames=0-60` 做短片验证 |
| `npm run typecheck` | 类型检查 |
| `npm run upgrade` | 升级 Remotion 全家桶 |

入口 `src/index.ts` → `src/Root.tsx`（当前未注册任何合成）。

新增 Remotion 包用 `npx remotion add <pkg>` 以保证版本一致，`npx remotion versions` 校验。

## 组件库 remotion-components/

本地组件库（不是 npm 包）：`base` 主题/字体、`scene` 背景/外壳/面板、`text` 字幕/气泡/标签/进度条、`code-display` 代码与终端窗口、`effects` 粒子、`characters` 像素角色、`motion` hook、`audio` 音效、`scripts` 素材生成与批量预览。总目录见 `remotion-components/AGENTS.md`，各分类目录下另有外观说明表。

- **按需取用**：它是工具箱不是模板。可以只用一部分、完全不用，也可以把文件拷进 `src/` 后随意改样式、拆件、重组。库的默认外观不构成对创意与设计的约束——方案与组件冲突时改组件。
- **不参与 `npm run typecheck`**：库内 import 写成同目录形式（`./theme`），放在原目录解析不到；拷进 `src/` 的同一目录（或统一改 import 路径）后即纳入检查。拷贝时 `base/theme.ts` 基本必带，`code-display/` 还依赖 `timeline.ts` 与 `colorize.tsx`。
- **依赖已就绪**：`scripts/stills.mjs` 需要的 `@remotion/bundler`、`@remotion/renderer`（4.0.535）已装并在 package.json 里声明。
- **字体素材**：`base/fonts.ts` 读 `public/fonts/NotoSansSC-VF.ttf`、`NotoSerifSC-VF.ttf`、`CascadiaCode.ttf`，本机 `C:\Windows\Fonts` 三个都在，需要时自行拷入：

  ```bash
  mkdir -p public/fonts && cp /c/Windows/Fonts/{NotoSansSC-VF,NotoSerifSC-VF,CascadiaCode}.ttf public/fonts/
  ```

- **素材与预览脚本**（在项目根运行，`--out` 相对当前目录）：

  ```bash
  node remotion-components/scripts/make-audio.mjs --out public --duration <总秒数>   # 生成 public/bgm.wav + public/sfx/*.wav
  node remotion-components/scripts/stills.mjs --entry src/index.ts --comp <Id> 120 450   # 批量抽预览帧
  ```

- `npm run format` 已用 `.prettierignore` 跳过 `remotion-components/`，不会改写库本体。

## 渲染异常排查

- 黑屏 / 崩溃：把 `remotion.config.ts` 的 `setChromiumOpenGlRenderer("angle")` 改成 `"swiftshader"`。
- 单帧复现：`npm run still -- <Id> out/debug.png --frame=<n>`。
- 详细日志：`npm run render -- <Id> out/x.mp4 --log=verbose`。
