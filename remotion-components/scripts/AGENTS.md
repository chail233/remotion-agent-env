# scripts/ — 项目外 CLI 脚本

纯 Node 脚本，**不是 Remotion 组件**，不 import 本库任何文件。接入新项目时拷到项目根目录运行。

网络注意：本机直连部分境外源（如 raw.githubusercontent.com）会报 `UNABLE_TO_VERIFY_LEAF_SIGNATURE`（代理 TLS 拦截），加 `NODE_OPTIONS=--use-system-ca` 前缀即用系统证书解决；iconify.design 实测直连无碍。

| 编号 | 文件 | 说明 |
|---|---|---|
| scripts/01 | make-audio.mjs | 程序化合成 12 种基础音效 wav（BGM 已不内置，见 audio/02 Bgm） |
| scripts/02 | stills.mjs | 打包一次、批量渲染指定帧预览图 |
| scripts/03 | fetch-icons.mjs | 从 Iconify 拉取开源图标 SVG + 许可登记（配 media/01 Icon） |
| scripts/04 | fetch-lottie.mjs | 下载 Lottie JSON 动画 + 来源/许可登记（配 media/02 LottieAnim） |
| scripts/05 | make-textures.mjs | seed 确定性生成背景/装饰纹理 SVG（配 media/03 Texture） |
| scripts/06 | make-jsfx.mjs | jsfxr 参数化生成 8-bit 复古音效 wav（依赖 jsfxr 包） |
| scripts/07 | fetch-sfx.mjs | 从 Lots of Sounds 免 key API 下载 CC0 音效 mp3 + 许可登记 |

## 01 make-audio.mjs — 合成基础音效

```bash
node scripts/make-audio.mjs --out public   # 生成 public/sfx/*.wav（总是覆盖重生成）
```

| 参数 | 说明 |
|---|---|
| `--out` | 输出目录（默认 `./public`），生成 `<out>/sfx/*.wav` |

- 音效：生成 audio/AGENTS.md 里那 12 个 wav，与 `Sfx` 的 name 一一对应
- BGM 不再内置生成（原 92 BPM lo-fi 程序化配乐已删）：背景音乐自备放 `public/bgm.wav` 或用 `<Bgm src="...">` 指任意音频，来源建议 AI 生成 / CC0 音乐包（Kenney、FreePD 等），播放置于 `audio/02 Bgm.tsx`
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

零依赖纯 SVG 生成，7 种纹理：`mesh`（多团模糊色斑渐变底）、`halftone`（波纹圆点阵）、`contour`（等高线）、`stripes`（斜条纹）、`stars`（星点尘埃场）、`grid`（蓝图方格，透明底）、`noise`（220px 胶片颗粒 tile）。同 seed 同产物（mulberry32），`public/textures/manifest.json` 记录参数；换 `--seed`/`--palette` 出变体。渲染端用 `media/03 Texture.tsx`（noise 用 `repeat="tile"`，其余 cover）。要新纹理种类：在脚本的 `gens` 表里加一个生成函数即可，其余（参数/落盘/清单）都是现成的；脚本本身也鼓励拷出去改。

## 06 make-jsfx.mjs — jsfxr 生成 8-bit 音效

```bash
node scripts/make-jsfx.mjs                                  # 全部预设 → public/sfx/*.wav
node scripts/make-jsfx.mjs --preset coin,laser --out public # 指定预设
node scripts/make-jsfx.mjs --b58 "#mLfdhR7i7BgpfdFE3drNl3TVxlr3Q" --name zap   # sfxr 分享串还原
```

| 参数 | 说明 |
|---|---|
| `--out` | 输出根目录（文件落 `<out>/sfx/`），默认 `./public` |
| `--preset` | 逗号分隔预设名（coin/laser/explosion/powerup/hurt/jump/blip/zap），默认全部 |
| `--b58` | sfxr 分享串（网上 sfxr/jsfxr 分享链接里的参数串），配 `--name` 用 |
| `--name` | b58 模式的输出文件名（默认 `zap`） |
| `--gain` | 峰值系数（统一归一到 0.85 × gain），默认 1 |
| `--force` | 覆盖已存在文件 |

- 依赖 jsfxr（package.json 里已声明）；RIFF 16-bit 立体声 44100Hz，与 make-audio.mjs 的 wav 同格式，`<Sfx name>` 直接消费
- 参数是经典 sfxr 命名（`p_env_attack`/`p_base_freq`/`wave_type`：0 方形 1 锯齿 2 正弦 3 噪声）；注意 `p_env_*` 不是秒数——时长 = x²×100000 采样，0.3≈0.17s、0.5≈0.57s、0.7≈1.1s
- 方形/锯齿/正弦固定参数可复现；**噪声波形（wave_type: 3）内部用 Math.random，重跑会略变**
- 与 01 make-audio 的 12 个 UI 音效定位互补：这里是复古游戏风的参数化生成，想换听感改脚本 `PRESETS` 表或加 b58 串

## 07 fetch-sfx.mjs — 下载 CC0 音效样本

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
