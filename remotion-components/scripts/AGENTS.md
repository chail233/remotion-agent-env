# scripts/ — 项目外 CLI 脚本

纯 Node 脚本，**不是 Remotion 组件**，不 import 本库任何文件。接入新项目时拷到项目根目录运行。

网络注意：本机直连部分境外源（如 raw.githubusercontent.com）会报 `UNABLE_TO_VERIFY_LEAF_SIGNATURE`（代理 TLS 拦截），加 `NODE_OPTIONS=--use-system-ca` 前缀即用系统证书解决；iconify.design 实测直连无碍。

| 编号 | 文件 | 说明 |
|---|---|---|
| scripts/01 | stills.mjs | 打包一次、批量渲染指定帧预览图 |
| scripts/02 | fetch-icons.mjs | 从 Iconify 拉取开源图标 SVG + 许可登记（配 media/01 Icon） |
| scripts/03 | fetch-lottie.mjs | 下载 Lottie JSON 动画 + 来源/许可登记（配 media/02 LottieAnim） |
| scripts/04 | make-textures.mjs | seed 确定性生成背景/装饰纹理 SVG（配 media/03 Texture） |
| scripts/05 | fetch-sfx.mjs | 从 Lots of Sounds 免 key API 下载 CC0 音效 mp3 + 许可登记 |
| scripts/06 | gen-vo.mjs | 逐场配音 + 词级时间戳 + 标点感知字幕切分（msedge-tts，免 key） |
| scripts/07 | build-vo-timeline.mjs | 把配音元数据排成场景时间轴，生成 SCENES/CAPS/WORDS/BEATS 的 TS 模块 |

音频合成脚本（原 make-audio / make-jsfx）已移除：音效按每条视频自选来源，见 `audio/AGENTS.md` 03 节。jsfxr 依赖仍声明在 package.json，供自写音效合成脚本使用；旧脚本可从本仓 git 历史找回。

## 01 stills.mjs — 批量抽帧预览

```bash
node scripts/stills.mjs --entry src/index.ts --comp Main [--scale 0.5] [--out out/stills] 120 450 900
```

打包一次连续渲染多个指定帧（默认缩到 0.5 倍），比在 Studio 里拖进度条找画面问题快得多。Agent 校验成片构图时应优先用它。
依赖：项目里要装有 `@remotion/bundler`、`@remotion/renderer`（与 remotion 同版本）。

## 02 fetch-icons.mjs — 拉取 Iconify 图标

```bash
node scripts/fetch-icons.mjs --icons lucide:rocket lucide:cpu tabler:brand-react [--out public] [--force]
```

从 `api.iconify.design` 逐个下载 SVG 到 `public/icons/<prefix>-<name>.svg`，并把每个图标集的名称/SPDX 许可合并登记进 `public/icons/licenses.json`（多次调用累积；重复文件默认跳过）。选型浏览 https://icon-sets.iconify.design 。渲染端用 `media/01 Icon.tsx` 单色上色，多色图标直接 `<Img>`。**消费前查一眼 licenses.json 的 license 字段**。

## 03 fetch-lottie.mjs — 下载 Lottie 动画

```bash
node scripts/fetch-lottie.mjs --url <json直链> --name pulse-dot --license "Lottie Files License" [--out public] [--credit 出处]
```

下载 → 校验 Lottie 必需字段（v/fr/ip/op/layers）→ 存 `public/lottie/<name>.json`，来源/许可/帧数登记进 `public/lottie/manifest.json`。一次一个动画、清单累积；`--license` 不传会标 UNSET 并警告，正式使用必须补。渲染端用 `media/02 LottieAnim.tsx`。

## 04 make-textures.mjs — 程序化纹理

```bash
node scripts/make-textures.mjs [--kinds mesh,halftone,contour,stripes,stars,grid,noise] [--seed 7] \
  [--palette "#07080C,#FFB35C,#6FA8FF"] [--w 1920 --h 1080] [--prefix cinema-] [--out public/textures]
```

零依赖纯 SVG 生成，7 种纹理：`mesh`（多团模糊色斑渐变底）、`halftone`（波纹圆点阵）、`contour`（等高线）、`stripes`（斜条纹）、`stars`（星点尘埃场）、`grid`（蓝图方格，透明底）、`noise`（220px 胶片颗粒 tile）。同 seed 同产物（mulberry32），`public/textures/manifest.json` 记录参数；换 `--seed`/`--palette` 出变体。渲染端用 `media/03 Texture.tsx`（noise 用 `repeat="tile"`，其余 cover）。要新纹理种类：在脚本的 `gens` 表里加一个生成函数即可，其余（参数/落盘/清单）都是现成的；脚本本身也鼓励拷出去改。

## 05 fetch-sfx.mjs — 下载 CC0 音效样本

```bash
node scripts/fetch-sfx.mjs --q "notification ding" --list                    # 只看搜索结果
node scripts/fetch-sfx.mjs --q "notification ding" --name ding               # 下载第 0 个 → public/sfx/ding.mp3
node scripts/fetch-sfx.mjs --id fs-11587 --name microwave-ding               # 按 id 直下
```

| 参数 | 说明 |
|---|---|
| `--q` / `--tags` | 搜索词 / 逗号分隔标签（与 `--id` 二选一） |
| `--index` | 取搜索结果的第几个（默认 0；先 `--list` 挑） |
| `--id` | 直接指定样本 id（如 `fs-11587`） |
| `--name` | 输出文件名（默认用样本 id） |
| `--out` / `--force` / `--list` | 输出根目录 / 覆盖 / 只列不下载 |

- 来源 Lots of Sounds 免 key 样本 API（https://github.com/lotsofsounds/free-sound-effects-api），样本集 **CC0 免署名**；来源与日期登记进 `public/sfx/licenses.json`（累积）
- 产物是 **mp3**：`<Sfx>` 只认 .wav，mp3 用 `<Audio src={staticFile("sfx/x.mp3")}/>` 播；长于 2s 的样本也走 `<Audio>`（`Sfx` 的 120 帧窗口会截断）
- 网络注意：文件 CDN（files.lotsofsounds.com，CloudFront）在部分网络 TLS 握手慢，脚本已内置 30s 超时 × 3 次重试；API 主机直连无碍
- 更多全目录检索/下载需其付费 key（`x-api-key`），本脚本不涉及；更大的 CC0 库还有 Kenney（整包 zip）、Freesound（需 OAuth key）

## 06 gen-vo.mjs — 配音 + 词级时间戳

```bash
node scripts/gen-vo.mjs [--script vo/script.json] [--out public/vo] [--meta public/vo/meta.json]
node scripts/gen-vo.mjs --voices zh-CN     # 列出可用音色（zh-CN / en-US / ja-JP …）
```

从 `vo/script.json` 逐场合成配音，产出 `public/vo/<id>.mp3` 与 `public/vo/meta.json`。用 npm 包 **msedge-tts**（Edge Read Aloud，免 key、无需 Python），音频固定 24kHz/48kbps 单声道 mp3，词边界时间戳由服务端返回。

```json
{
  "voice": "zh-CN-XiaoxiaoNeural",
  "rate": "+10%",
  "fps": 30,
  "scenes": [
    {
      "id": "s01",
      "title": "钩子",
      "text": "你的电脑，不会掷骰子。",
      "lead": 26,
      "tail": 46,
      "transition": 20,
      "beats": { "titleAt": ["骰子", 2.4] }
    }
  ]
}
```

- 必填只有 `scenes[].id` 与 `scenes[].text`；`voice` 默认 `zh-CN-XiaoxiaoNeural`，`rate` 默认 `+0%`，`fps` 默认 30。场景上还可写 `pitch` / `volume` 覆盖全局
- `lead` / `tail` / `transition` / `beats` 会原样带进 meta，供 07 排时间轴
- 字幕自动切分：中文默认每条约 26 字、英文约 42 字符（可用顶层 `captionMaxChars` 覆盖）；按词时间戳做标点感知对齐，跳过标点/空格，中英文都不漂移
- `durSec` 取**最后一个词的结束时间**，TTS 尾部静音由场景 `tail` 吸收；重跑会覆盖同名 mp3 与 meta
- 输出目录默认 `public/vo/`（已 gitignore）；`vo/script.json` 是源文件，建议进 git

## 07 build-vo-timeline.mjs — 场景时间轴

```bash
node scripts/build-vo-timeline.mjs [--meta public/vo/meta.json] [--out src/vo.ts]
```

读 06 产出的 meta，按每场 `lead + ceil(durSec × fps) + tail` 算时长，再按 `transition` 扣重叠排出全局起点，生成可直接 import 的 TS 模块：

| 导出 | 内容 |
|---|---|
| `FPS` / `TOTAL` | 帧率与全片总帧数 |
| `SCENES` | `{ id, title, start, dur, lead, tail, voF }[]` |
| `VO_SEQ` | `{ id, from }[]`：每场配音的全局起点 |
| `CAPS` | `[起帧, 止帧, 文本][]`：字幕 |
| `WORDS` | `[文本, 起帧, 止帧][]`：词级时间，配 `text/07 Karaoke` |
| `BEATS` | `Record<场景id, Record<锚点名, 场景本地帧>>`：由词 token 自动对齐 |

- 默认参数：`lead=26`、`tail=46`、`transition=20` 帧；最后一场转场恒为 0
- `beats` 写法 `{ "titleAt": ["骰子", 2.4] }`：先精确匹配词 token，再退化为包含，找不到用兜底秒数；换配音后锚点自动跟随
- 生成文件默认 `src/vo.ts`，头部标注 AUTO-GENERATED；不要手改，重跑 06 + 07 即可
