# code-display/ — 代码展示

代码与终端内容展示的成套组件（窗口位置尺寸全部由 props 决定）。文件间接依赖：`04 CodeWindow`/`05 ConsoleWindow` → `03 WindowChrome` + `01 timeline` + `02 colorize`；拷贝时整套带上（外加 `./theme`）。

| 编号 | 文件 | 角色 | 长什么样 |
|---|---|---|---|
| 01 | timeline.ts | 逻辑（无渲染） | 打字时间轴排期函数 + 数据结构定义 |
| 02 | colorize.tsx | 逻辑（渲染件） | TS 语法高亮，暖色配色，支持中文标识符 |
| 03 | WindowChrome.tsx | 窗口 | 深色 macOS 外框：红黄绿圆点 + 居中标题 |
| 04 | CodeWindow.tsx | 窗口 | 03 外壳 + 行号 + 高亮逐行打字的代码编辑器 |
| 05 | ConsoleWindow.tsx | 窗口 | 03 外壳 + 绿色 ❯ 命令逐字打出 + ← 结果行 |

## 01 timeline.ts — 打字时间轴（纯逻辑，无 React）

| 导出 | 说明 |
|---|---|
| `typeLines(start, texts, {speed?, gap?})` | 生成连续打字的行组：每行在上行打完后开始。`speed` 每帧字符数（默认 1.3），`gap` 行间停帧（默认 4） |
| `staticLines(texts)` | 一开始就完整显示的行（内部 `at = ALWAYS`） |
| `doneAt(lines)` | 整组打完的帧号，用来衔接后续动画/音效 |
| `consoleOutAt(entry)` | 控制台某条结果出现的帧号（不填 `outAt` 则 = 命令打完 + 12 帧），供外部按帧号同步 |
| `visibleText(frame, line)` | 某行在某帧应显示的文本（未开始返回 null）。组件内部用 |
| `fadeWindow(frame, from, to?, len?)` | 区间可见度 0~1（两端 8 帧淡变）。marks/highlights 内部用 |
| 类型 `CodeLine` `Mark` `Highlight` `ConsoleEntry` | 组件 props 用的数据结构 |
| `DEFAULT_SPEED` = 1.3 | 全库打字速度约定 |
| `ALWAYS` = -99999 | `at` 的「静态行」哨兵值 |

排期套路：`typeLines` 生成代码行 → `doneAt` 算打完帧号 → 排画面动画 → 音效再对齐动画。

## 02 colorize.tsx — 语法高亮

导出 `colorize(line)`（逐字符颜色数组：TS 关键字/类型/字符串/数字/注释，**支持中文标识符**）和 `ColorizedText`（渲染着色文本，`marks: LineMark[]` 给行内文字段加发光框）。想做「非窗口」的代码展示时复用它。

## 03 WindowChrome.tsx — 通用窗口外框

导出 `WindowChrome`：`x y w h title children style`（style 可覆盖背景等）。内容区在 44px 标题栏下方，从绝对定位 (0,0) 开始。可单独拿来装别的内容。

## 04 CodeWindow.tsx — 逐行打字的编辑器

导出 `CodeWindow`。每行有开始帧 `at`，**可在中间插行**（下面的行被平滑挤开）；内容超高自动滚动；橙色块状光标跟着正在打的行。

```tsx
<CodeWindow
  lines={[...staticLines(["class Demo {"]), ...typeLines(146, ["  constructor(name: string) {"])]}
  x={60} y={90} w={980} h={650} fontSize={24} lineHeight={36}
  marks={[{ line: 1, text: "constructor", from: 184, to: 320, color: C.codeKeyword }]}
  highlights={[{ lines: [3, 4], from: 450, to: 560, color: C.sky }]}
/>
```

props：`lines` `marks` `highlights` `x y w h` `title`（默认 "main.ts"）`fontSize`（26）`lineHeight`（40）`lineNumbers`（true）。
`marks` 给行内一段文字加发光框（`text` 匹配该行**第一次**出现处）；`highlights` 给连续行加整行背景条 + 左边色条。
注意：Cascadia Code 把 `>=` `=>` 渲染成连字（显示 ≥、⇒）。

## 05 ConsoleWindow.tsx — 运行结果控制台

导出 `ConsoleWindow`。结果行 `←` 前缀（error 为红色 ✖），多行结果用 `\n`，超高自动滚动。

props：`entries: ConsoleEntry[]`（`{at, cmd, out?, outAt?, kind?: "ok"|"error"|"info"}`）`x y w h` `fontSize`（24）`lineHeight`（38）`title`（默认「控制台 · 运行结果」）。kind 配色：ok 黄（默认）、error 红、info 灰绿。
