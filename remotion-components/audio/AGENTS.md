# audio/ — 音频播放

| 编号 | 文件 | 说明 |
|---|---|---|
| audio/01 | Sfx.tsx | 第 at 帧播放 public/sfx/&lt;name&gt;.wav |
| audio/02 | Bgm.tsx | BGM 音量包络：淡入/淡出锚定合成总长 |

两个组件都不依赖 theme，也不占画布布局。**库里不预置任何音频素材**：音效与 BGM 文件按每条视频的需要另行准备（来源见第 03 节）。

## 01 Sfx.tsx

```tsx
<Sfx at={146} name="pop" /> <Sfx at={330} name="whoosh" volume={0.8} />
```

内部是 `<Sequence layout="none">` + `<Html5Audio>`，持续 120 帧，不占画布布局。实际音量 = `volume × 1.5`（封顶 1），默认 volume 0.6。

`name` 对应 `public/sfx/<name>.wav`——目录里放了什么文件就能播什么 name，文件由使用者准备（自写脚本合成、下载样本都行）。

## 02 Bgm.tsx

```tsx
<Bgm />  {/* 挂在合成最外层；等价 <Bgm src="bgm.wav" volume={0.95} fadeIn={30} fadeOut={120} /> */}
```

音量沿包络走：前 `fadeIn` 帧从 0 淡入到 `volume`，合成结尾前 `fadeOut` 帧淡出到 0（锚点取 `useVideoConfig` 的总时长，换片长不用改参数）。BGM 文件自备放 `public/bgm.wav` 或 `src` 指任意音频（来源：AI 生成 / CC0 音乐包，如 Kenney、FreePD）；音量参考：0.55 时整片约 -19 LUFS。

## 03 音频素材从哪来（按需准备）

| 来源 | 用法 | 产物 | 特点 |
|---|---|---|---|
| `@remotion/sfx`（已装，免署名） | `import { whoosh, ding } from "@remotion/sfx"` → `<Audio src={whoosh}/>` | 官方托管 32 个直链 | 零准备成本；工具音 + 梗音（wilhelm-scream、vine-boom…），适合彩蛋 |
| scripts/05 fetch-sfx.mjs | `fetch-sfx.mjs --q "…" --name x` | CC0 mp3，登记进 `public/sfx/licenses.json` | 按关键词搜真实质感样本，先 `--list` 挑再下 |
| scripts/06 + 07（配音） | `gen-vo.mjs` → `build-vo-timeline.mjs` | `public/vo/*.mp3` + 词级时间戳 + `src/vo.ts` | 免 key（msedge-tts）；中英文配音、字幕、场景时间轴一次生成 |
| 自写合成脚本 | jsfxr（依赖已声明）或纯 PCM 写 wav | `public/sfx/*.wav` | 参数完全自定义；本仓 git 历史里有 make-audio / make-jsfx 两个合成脚本可作参考 |
| BGM | 自备放 `public/bgm.wav`，或 `<Bgm src>` 指任意音频 | — | AI 生成 / CC0 音乐包（Kenney、FreePD 等），按内容情绪选曲 |

- `Sfx` 只认 `public/sfx/<name>.wav`，且 Sequence 窗口 120 帧（30fps 下 4s）——更长或 mp3 的音频一律直接 `<Audio>`
- 配音（TTS）走 `scripts/06 gen-vo.mjs` + `scripts/07 build-vo-timeline.mjs`（msedge-tts，免 key；产出 mp3、词级时间戳、字幕与场景时间轴）；付费方案与字幕转录另见 `skills/remotion-markup/` 的 `voiceover.md`、`transcribe-captions.md`；各脚本参数详见 `scripts/AGENTS.md`
