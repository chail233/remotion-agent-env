# audio/ — 音效播放

| 编号 | 文件 | 说明 |
|---|---|---|
| audio/01 | Sfx.tsx | 第 at 帧播放 public/sfx/<name>.wav |

## 01 Sfx.tsx

```tsx
<Sfx at={146} name="typing" /> <Sfx at={330} name="ding" volume={0.8} />
```

内部是 `<Sequence layout="none">` + `<Html5Audio>`，持续 120 帧，不占画布布局。实际音量 = `volume × 1.5`（封顶 1），默认 volume 0.6。

唯一不依赖 theme 的文件——但依赖 wav 资源存在：用 scripts/01 make-audio.mjs `--sfx-only` 生成。

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

BGM 不由本组件负责：`<Html5Audio src={staticFile("bgm.wav")} />` 挂在合成最外层，音量自定（见根 AGENTS.md）。
