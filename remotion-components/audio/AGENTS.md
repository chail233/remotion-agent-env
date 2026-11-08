# audio/ — 音效播放

| 编号 | 文件 | 说明 |
|---|---|---|
| audio/01 | Sfx.tsx | 第 at 帧播放 public/sfx/<name>.wav |
| audio/02 | Bgm.tsx | BGM 音量包络：淡入/淡出锚定合成总长 |

两个组件都不依赖 theme，也不占画布布局。

## 01 Sfx.tsx

```tsx
<Sfx at={146} name="typing" /> <Sfx at={330} name="ding" volume={0.8} />
```

内部是 `<Sequence layout="none">` + `<Html5Audio>`，持续 120 帧，不占画布布局。实际音量 = `volume × 1.5`（封顶 1），默认 volume 0.6。

唯一不依赖 theme 的文件——但依赖 wav 资源存在：用 scripts/01 make-audio.mjs 生成。

可用音效 12 个（name → 听感 → 适用场景）：

| name | 听起来 | 适合用在 |
|---|---|---|
| `pop` | 短促上滑的「啵」 | 元素弹出、气泡出现 |
| `typing` | 一串键盘声（约 1.2 秒） | 开始打一段代码 |
| `magic` | 快速上行琶音加沙沙声 | 变身、生成 |
| `sparkle` | 几声高音叮铃 | 星光、庆祝 |
| `ding` | 单声铃 | 得到结果、答对 |
| `love` | 三音上行铃 | 爱心、心动时刻 |
| `whoosh` | 风声扫过 | 飞入、转场 |
| `stamp` | 低沉一下 | 盖章、强调 |
| `error` | 两声嗡嗡 | 报错、禁止 |
| `unlock` | 咔哒 + 铃声 | 解锁、打开 |
| `flip` | 短促翻动声 | 翻卡片 |
| `shatter` | 玻璃碎片叮当 | 破碎、消散 |

## 02 Bgm.tsx

```tsx
<Bgm />  {/* 挂在合成最外层；等价 <Bgm src="bgm.wav" volume={0.95} fadeIn={30} fadeOut={120} /> */}
```

音量沿包络走：前 `fadeIn` 帧从 0 淡入到 `volume`，合成结尾前 `fadeOut` 帧淡出到 0（锚点取 `useVideoConfig` 的总时长，换片长不用改参数）。BGM 文件自备放 `public/bgm.wav` 或 `src` 指任意音频（来源：AI 生成 / CC0 音乐包，如 Kenney、FreePD）；音量参考：0.55 时整片约 -19 LUFS。

## 03 音效素材从哪来（public/sfx/ 放什么）

| 来源 | 命令 / 用法 | 产物 | 特点 |
|---|---|---|---|
| scripts/01 make-audio.mjs | `make-audio.mjs --out public` | 上表 12 个 wav | 纯代码合成，与 `Sfx` 的 name 一一对应；BGM 已不内置 |
| scripts/06 make-jsfx.mjs | `make-jsfx.mjs --preset coin,laser` | 8 个 8-bit 预设 wav（另支持 sfxr b58 串） | 复古游戏风，参数可调；`<Sfx name="coin"/>` 直接用 |
| scripts/07 fetch-sfx.mjs | `fetch-sfx.mjs --q "…" --name x` | CC0 mp3，登记进 `public/sfx/licenses.json` | 真实录音质感；mp3 用 `<Audio src={staticFile("sfx/x.mp3")}/>` 播 |
| `@remotion/sfx`（已装，免署名） | `import { whoosh, ding } from "@remotion/sfx"` → `<Audio src={whoosh}/>` | 官方托管 32 个直链 | 工具音+梗音（wilhelm-scream、vine-boom…），适合彩蛋 |

- `Sfx` 只认 `public/sfx/<name>.wav`，且 Sequence 窗口 120 帧（30fps 下 4s）——更长或 mp3 的音频一律直接 `<Audio>`
- 配音（TTS）与字幕转录管线见 `skills/remotion-markup/` 的 `voiceover.md`、`transcribe-captions.md`；各脚本参数详见 `scripts/AGENTS.md` 06/07 节
