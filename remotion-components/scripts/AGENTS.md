# scripts/ — 项目外 CLI 脚本

纯 Node 脚本，**不是 Remotion 组件**，不 import 本库任何文件。接入新项目时拷到项目根目录运行。

网络注意：本机直连部分境外源（如 raw.githubusercontent.com）会报 `UNABLE_TO_VERIFY_LEAF_SIGNATURE`（代理 TLS 拦截），加 `NODE_OPTIONS=--use-system-ca` 前缀即用系统证书解决；iconify.design 实测直连无碍。

| 编号 | 文件 | 说明 |
|---|---|---|
| scripts/01 | make-audio.mjs | 程序化合成背景音乐 + 12 种音效 wav |
| scripts/02 | stills.mjs | 打包一次、批量渲染指定帧预览图 |
| scripts/03 | fetch-icons.mjs | 从 Iconify 拉取开源图标 SVG + 许可登记（配 media/01 Icon） |
| scripts/04 | fetch-lottie.mjs | 下载 Lottie JSON 动画 + 来源/许可登记（配 media/02 LottieAnim） |
| scripts/05 | make-textures.mjs | seed 确定性生成背景/装饰纹理 SVG（配 media/03 Texture） |

## 01 make-audio.mjs — 合成 BGM + 音效

```bash
node scripts/make-audio.mjs --out public --duration 384 --ending 336  # 336 秒起转抒情尾声
node scripts/make-audio.mjs --out public --duration 120               # 全程轻快 lo-fi
node scripts/make-audio.mjs --out public --sfx-only                   # 只生成音效
```

| 参数 | 说明 |
|---|---|
| `--out` | 输出目录（默认 `./public`），生成 `<out>/bgm.wav` 和 `<out>/sfx/*.wav` |
| `--duration` | BGM 总长（秒）；不传则只生成音效 |
| `--ending` | 抒情尾声开始的秒数；不传则全程轻快、自然收尾 |
| `--drums-in` | 鼓点进入秒数（默认 13，之前只有钢琴和 pad） |
| `--sfx-only` | 只生成音效 |

- BGM：92 BPM lo-fi，王道进行和弦（Fmaj7–G–Em7–Am7…），电钢琴、贝斯、铃声琶音、轻鼓；带 `--ending` 时转 70 BPM 抒情钢琴，落在 Cadd9
- 音效：生成 audio/AGENTS.md 里那 12 个 wav，与 `Sfx` 的 name 一一对应
- 纯代码合成（44100Hz PCM），无任何采样/版权素材；无第三方依赖，只用 node 内置 fs/path

## 02 stills.mjs — 批量抽帧预览

```bash
node scripts/stills.mjs --entry src/index.ts --comp Main [--scale 0.5] [--out out/stills] 120 450 900
```

打包一次连续渲染多个指定帧（默认缩到 0.5 倍），比在 Studio 里拖进度条找画面问题快得多。Agent 校验成片构图时应优先用它。
依赖：项目里要装有 `@remotion/bundler`、`@remotion/renderer`（与 remotion 同版本）。

## 03 fetch-icons.mjs — 拉取 Iconify 图标

```bash
node scripts/fetch-icons.mjs --icons lucide:rocket lucide:cpu tabler:brand-react [--out public] [--force]
```

从 `api.iconify.design` 逐个下载 SVG 到 `public/icons/<prefix>-<name>.svg`，并把每个图标集的名称/SPDX 许可合并登记进 `public/icons/licenses.json`（多次调用累积；重复文件默认跳过）。选型浏览 https://icon-sets.iconify.design 。渲染端用 `media/01 Icon.tsx` 单色上色，多色图标直接 `<Img>`。**消费前查一眼 licenses.json 的 license 字段**。

## 04 fetch-lottie.mjs — 下载 Lottie 动画

```bash
node scripts/fetch-lottie.mjs --url <json直链> --name pulse-dot --license "Lottie Files License" [--out public] [--credit 出处]
```

下载 → 校验 Lottie 必需字段（v/fr/ip/op/layers）→ 存 `public/lottie/<name>.json`，来源/许可/帧数登记进 `public/lottie/manifest.json`。一次一个动画、清单累积；`--license` 不传会标 UNSET 并警告，正式使用必须补。渲染端用 `media/02 LottieAnim.tsx`。

## 05 make-textures.mjs — 程序化纹理

```bash
node scripts/make-textures.mjs [--kinds mesh,halftone,contour,stripes,stars,grid,noise] [--seed 7] \
  [--palette "#07080C,#FFB35C,#6FA8FF"] [--w 1920 --h 1080] [--prefix cinema-] [--out public/textures]
```

零依赖纯 SVG 生成，7 种纹理：`mesh`（多团模糊色斑渐变底）、`halftone`（波纹圆点阵）、`contour`（等高线）、`stripes`（斜条纹）、`stars`（星点尘埃场）、`grid`（蓝图方格，透明底）、`noise`（220px 胶片颗粒 tile）。同 seed 同产物（mulberry32），`public/textures/manifest.json` 记录参数；换 `--seed`/`--palette` 出变体。渲染端用 `media/03 Texture.tsx`（noise 用 `repeat="tile"`，其余 cover）。
