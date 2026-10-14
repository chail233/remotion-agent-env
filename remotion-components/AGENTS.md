# remotion-components — Remotion 通用组件库

用于**任意类型** Remotion 视频的通用组件集，一个组件一个文件，按用途分类。每个组件都是纯参数驱动的渲染件：位置、尺寸、颜色、时间全是 props 或 props 化的常量，**怎么排布、用在什么题材由使用者决定**，本库不预设版式。

本文档面向 Agent：只描述「组件是什么、参数含义、内部行为」，不规定使用方式。选型看各分类 AGENTS.md 里的外观描述表。

**选择性使用**：本库是工具箱不是模板——按需取用，可用一部分、全不用，也可改样式、拆件或重新组合。组件的默认外观与既有搭配**不应影响原设计与创意**：先有创作方案，再决定组件如何服务于它；方案与组件冲突时改组件，而不是迁就组件改方案。

## 接口事实（改代码前必须知道）

- 所有坐标/字号默认值按 **1920×1080** 画布标定（`base/01 theme` 的 `W/H/FPS` 常量可自取）；换画布尺寸时缩放外层容器或改 props
- 动画**只依赖当前帧号**（`useCurrentFrame`），时间参数一律用**帧**；在 `<Series.Sequence>` 或 `<AbsoluteFill>` 里都是本地帧，无外部时钟
- **依赖规则**：除 `audio/01 Sfx` 和 `scripts/` 外，所有组件都依赖 `base/01 theme`；库内 import 一律写成同目录形式（`./theme`、`./timeline`…）。接入项目时把这些文件放同一目录，或统一改 import 路径
- 少数文件之间有依赖，各文件头注释和分类 AGENTS.md 已标明，拷贝时一起带上
- 依赖版本：`remotion@4.0.535 @remotion/cli@4.0.535 react@19.1.0 react-dom@19.1.0`，dev 依赖 `@remotion/bundler @remotion/renderer` 同版本；`tsconfig.json` 的 `lib` 需含 `"DOM", "DOM.Iterable"`

## 组件总目录

| 编号 | 文件 | 一句话说明 |
|---|---|---|
| base/01 | theme.ts | 配色/字体/画布常量 + hexA/clamp 工具，全库必带 |
| base/02 | fonts.ts | loadFonts()：加载中/西/代码三套字体 |
| characters/01 | Clawdia.tsx | 像素风方块角色（SVG），9 表情 × 4 头饰 × 5 手持物，可换色 |
| scene/01 | Paper.tsx | 背景：米白底 + 淡棕方格线，全屏 |
| scene/02 | Scene.tsx | 外壳：章节卡片 + 页眉 + 首尾淡入淡出 |
| scene/03 | Stage.tsx | 面板：半透明圆角矩形，裁切超出内容，位置尺寸任意 |
| code-display/01 | timeline.ts | 逻辑：打字时间轴排期工具（typeLines/doneAt…），无渲染 |
| code-display/02 | colorize.tsx | 逻辑：TS 语法高亮 + 着色文本渲染 |
| code-display/03 | WindowChrome.tsx | 窗口：macOS 风格深色外框，可装任意内容 |
| code-display/04 | CodeWindow.tsx | 窗口：逐行打字的代码编辑器，行号/高亮/滚动 |
| code-display/05 | ConsoleWindow.tsx | 窗口：终端风格，命令逐字打出 + 结果行 |
| text/01 | Captions.tsx | 字幕：胶囊底横排文本，按帧区间切换，y 可调 |
| text/02 | RichText.tsx | 行内语法：「词」强调、`code` 小标签 |
| text/03 | Bubble.tsx | 气泡：逐字弹出的对话气泡，4 种尾巴朝向 |
| text/04 | Tag.tsx | 标签：彩色描边胶囊（行内元素） |
| text/05 | StatBar.tsx | 数值：进度条 + 标签 + 读数，value 外部驱动 |
| effects/01 | HeartBurst.tsx | 特效：爱心从一点炸开上飘（约 70 帧自灭） |
| effects/02 | Sparkles.tsx | 特效：星光绕圈扩散自转（约 50 帧自灭） |
| effects/03 | HeartShape.tsx | 形状：单个爱心 SVG，静态件 |
| motion/01 | usePop.ts | hook：第 at 帧弹簧 0→1（弹出缩放） |
| motion/02 | useFade.ts | hook：区间淡入淡出 0~1 |
| audio/01 | Sfx.tsx | 音效：第 at 帧播 public/sfx/<name>.wav（12 种） |
| scripts/01 | make-audio.mjs | CLI：程序化合成 BGM + 12 音效 wav（无版权素材） |
| scripts/02 | stills.mjs | CLI：打包一次批量抽指定帧预览图 |

## 接入新项目（Agent 操作清单）

1. 拷 `base/theme.ts`、`base/fonts.ts` + 需要的组件文件进项目（同目录摆放则 import 不用改）
2. `scripts/*.mjs` 拷到项目根目录，`node scripts/make-audio.mjs --out public --duration <总秒数>` 生成 `public/bgm.wav` 和 `public/sfx/*.wav`
3. 字体：从 `C:\Windows\Fonts` 拷 `NotoSansSC-VF.ttf`、`NotoSerifSC-VF.ttf`、`CascadiaCode.ttf` 进 `public/fonts/`，在根组件模块顶层调用一次 `loadFonts()`；不需要这套字体就不装，组件会走 F 里的系统回退
4. BGM 用 `<Html5Audio src={staticFile("bgm.wav")} />` 挂在合成最外层，音量自定（0.55 时整片约 -19 LUFS）

## 技术备忘（与用法无关的事实）

- 同一秒的画面由帧号决定：`帧 = 秒 × FPS`；`doneAt` / `consoleOutAt` 可从文本长度反推各阶段帧号
- 跨点位移可用 `interpolate` + `Easing.inOut(Easing.cubic)`，叠 `sin(p·π)` 得抛物线；注意被 overflow:hidden 的面板裁切
- remotion 的 `random(seed)` 稳定可复现，特效随机形态由 seed 决定
- emoji 在 Windows 无头 Chrome 里可正常渲染（Segoe UI Emoji）
- Remotion 首次渲染会自动下载 Chrome Headless Shell，国内网络可成功
