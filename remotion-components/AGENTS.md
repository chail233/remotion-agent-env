# remotion-components — Remotion 通用组件库

用于**任意类型** Remotion 视频的通用组件集，一个组件一个文件，按用途分类。每个组件都是纯参数驱动的渲染件：位置、尺寸、颜色、时间全是 props 或 props 化的常量，**怎么排布、用在什么题材由使用者决定**，本库不预设版式。

本文档面向 Agent：只描述「组件是什么、参数含义、内部行为」，不规定使用方式。选型看各分类 AGENTS.md 里的外观描述表；**节奏、拍点、构图等创作规则看 PLAYBOOK.md**。

**选择性使用**：本库是工具箱不是模板——按需取用，可用一部分、全不用，也可改样式、拆件或重新组合。组件的默认外观与既有搭配**不应影响原设计与创意**：先有创作方案，再决定组件如何服务于它；方案与组件冲突时改组件，而不是迁就组件改方案。

## 接口事实（改代码前必须知道）

- 所有坐标/字号默认值按 **1920×1080** 画布标定（`base/01 theme` 的 `W/H/FPS` 常量可自取）；换画布尺寸时缩放外层容器或改 props
- 动画**只依赖当前帧号**（`useCurrentFrame`），时间参数一律用**帧**；在 `<Series.Sequence>` 或 `<AbsoluteFill>` 里都是本地帧，无外部时钟
- **依赖规则**：除 `audio/`（音频件）、`media/`（素材消费件）、`scripts/`、`transitions/`（依赖已装的 `@remotion/transitions`）和 `effects/07 Spotlight`（自包含）外，所有组件都依赖 `base/01 theme`；跨分类依赖统一写 `../base/theme`（同目录依赖如 `./timeline` 保持同目录形式），**整库原地可解析**。拷进项目时整目录拷走，或拷后统一改 import 路径
- 少数文件之间有依赖，各文件头注释和分类 AGENTS.md 已标明，拷贝时一起带上
- 依赖版本：`remotion@4.0.535 @remotion/cli@4.0.535 react@19.1.0 react-dom@19.1.0`，dev 依赖 `@remotion/bundler @remotion/renderer` 同版本；`tsconfig.json` 的 `lib` 需含 `"DOM", "DOM.Iterable"`

## 组件总目录

| 编号 | 文件 | 一句话说明 |
|---|---|---|
| base/01 | theme.ts | 配色/字体/画布常量 + hexA/clamp 工具，全库必带 |
| base/02 | fonts.ts | loadFonts()：加载中/西/代码三套字体 |
| scene/01 | Paper.tsx | 背景：米白底 + 淡棕方格线，全屏 |
| scene/03 | Stage.tsx | 面板：半透明圆角矩形，裁切超出内容，位置尺寸任意 |
| scene/04 | LightBg.tsx | 背景：暖纸底 + 三团漂移光斑 + 点阵 + 旋转角饰，亮色完整背景栈 |
| scene/05 | DuoPanel.tsx | 面板：左右双色对比面板（图标座 + 小字 + 标题）+ 中央脊线 |
| chart/01 | BarChart.tsx | 图表：柱状图逐根弹簧生长，数值/标签随柱浮出，纯 SVG |
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
| text/06 | Typewriter.tsx | 打字机：任意文本逐字打出 + 闪烁光标，打完常驻 |
| text/07 | Karaoke.tsx | 卡拉OK字幕：逐词扫色/浮出两种模式，词级帧区间驱动 |
| effects/01 | HeartBurst.tsx | 特效：爱心从一点炸开上飘（约 70 帧自灭） |
| effects/02 | Sparkles.tsx | 特效：星光绕圈扩散自转（约 50 帧自灭） |
| effects/03 | HeartShape.tsx | 形状：单个爱心 SVG，静态件 |
| effects/04 | Draw.tsx | 描画：SVG 路径按帧从起点画到终点（常驻），百分比坐标铺满父容器 |
| effects/05 | Particles.tsx | 微粒：n 颗圆点在指定区域上浮摇摆（常驻氛围层），seed 可复现 |
| effects/06 | Confetti.tsx | 彩带：n 片彩纸从炸点抛物线喷出翻转飘落，约 lifetime 帧自灭 |
| effects/07 | Spotlight.tsx | 特效：追光搜寻甩动后落定照亮 children，深色舞台开场，自包含 |
| transitions/01 | WhipPan.tsx | 转场：甩镜，两场同向高速滑过 + 拖影运动模糊 |
| transitions/02 | LightLeak.tsx | 转场：暖光斑漂入、切换点烧白、缓慢冷却，硬切藏在过曝下 |
| transitions/03 | IrisWipe.tsx | 转场：圆形光圈收成点再张开，圆心/停留半径可调 |
| transitions/04 | ZoomBlur.tsx | 转场：缩放虚化推拉，最轻量的镜头推拉语法 |
| transitions/05 | PageTurn.tsx | 转场：翻页绕底角掀起旋出，poses 停格顿挫 |
| transitions/06 | Hyperspace.tsx | 转场：星场加速成流线 + 白闪切换 + 缓焦落定，seed 可复现 |
| motion/01 | usePop.ts | hook：第 at 帧弹簧 0→1（弹出缩放） |
| motion/02 | useFade.ts | hook：区间淡入淡出 0~1 |
| media/01 | Icon.tsx | 图标：public/icons/ 的 SVG 单色上色（mask 原理），由 scripts/02 拉取 |
| media/02 | LottieAnim.tsx | 动效：嵌入 Lottie JSON，进度跟时间轴，由 scripts/03 下载 |
| media/03 | Texture.tsx | 纹理：public/textures/ 的 SVG 铺底可漂移，由 scripts/04 生成 |
| audio/01 | Sfx.tsx | 音效：第 at 帧播 public/sfx/<name>.wav（name = 放进去的文件名，文件自备） |
| audio/02 | Bgm.tsx | 音乐：BGM 音量包络，淡入/淡出锚定合成总长，挂合成最外层 |
| scripts/01 | stills.mjs | CLI：打包一次批量抽指定帧预览图 |
| scripts/02 | fetch-icons.mjs | CLI：Iconify 拉图标 SVG + 许可登记 → public/icons |
| scripts/03 | fetch-lottie.mjs | CLI：下载 Lottie JSON + 来源/许可登记 → public/lottie |
| scripts/04 | make-textures.mjs | CLI：seed 确定性生成 7 种纹理 SVG → public/textures |
| scripts/05 | fetch-sfx.mjs | CLI：Lots of Sounds 下载 CC0 音效 mp3 + 许可登记 → public/sfx |
| scripts/06 | gen-vo.mjs | CLI：msedge-tts 逐场配音 + 词级时间戳 + 字幕切分 → public/vo |
| scripts/07 | build-vo-timeline.mjs | CLI：配音元数据 → src/vo.ts（场景/字幕/词级时间/节拍） |

## 接入新项目（Agent 操作清单）

1. 把需要的分类目录整目录拷进项目（跨分类 import 指向 `../base/theme`，保持目录结构即可），或拷散文件后统一改 import 路径
2. `scripts/*.mjs` 拷到项目根目录，按第 5、6 步的管线生成/拉取素材；音效与 BGM 文件自备或下载（见 `audio/AGENTS.md` 03 节）
3. 字体：从 `C:\Windows\Fonts` 拷 `NotoSansSC-VF.ttf`、`NotoSerifSC-VF.ttf`、`CascadiaCode.ttf` 进 `public/fonts/`，在根组件模块顶层调用一次 `loadFonts()`；不需要这套字体就不装，组件会走 F 里的系统回退
4. BGM 用 `audio/02 Bgm` 挂在合成最外层（`<Bgm />`，默认 public/bgm.wav，音量/淡入淡出可调；0.55 时整片约 -19 LUFS）
5. **美术素材走三条管线**（见 `media/AGENTS.md` 与 `scripts/AGENTS.md` 02–04），产出到 public/ 后用 `media/01–03` 组件消费；生成/下载的素材**不进 git**，clone 后按需重跑脚本；正式使用前核对各清单文件里的 license 字段
6. **需要旁白/字幕时**：写 `vo/script.json` → `scripts/06 gen-vo.mjs` 出 mp3 与词级时间戳 → `scripts/07 build-vo-timeline.mjs` 出 `src/vo.ts`（场景起点/字幕/词级时间/节拍）；`CAPS` 喂 `text/01 Captions`，`WORDS` 喂 `text/07 Karaoke`。含 `lead/tail/transition` 的场景时长由 07 自动计算，不要再手排帧号

## 技术备忘（与用法无关的事实）

- 同一秒的画面由帧号决定：`帧 = 秒 × FPS`；`doneAt` / `consoleOutAt` 可从文本长度反推各阶段帧号
- 跨点位移可用 `interpolate` + `Easing.inOut(Easing.cubic)`，叠 `sin(p·π)` 得抛物线；注意被 overflow:hidden 的面板裁切
- remotion 的 `random(seed)` 稳定可复现，特效随机形态由 seed 决定
- emoji 在 Windows 无头 Chrome 里可正常渲染（Segoe UI Emoji）
- Remotion 首次渲染会自动下载 Chrome Headless Shell，国内网络可成功
