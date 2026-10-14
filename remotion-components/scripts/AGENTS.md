# scripts/ — 项目外 CLI 脚本

纯 Node 脚本，**不是 Remotion 组件**，不 import 本库任何文件。接入新项目时拷到项目根目录运行。

| 编号 | 文件 | 说明 |
|---|---|---|
| scripts/01 | make-audio.mjs | 程序化合成背景音乐 + 12 种音效 wav |
| scripts/02 | stills.mjs | 打包一次、批量渲染指定帧预览图 |

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
