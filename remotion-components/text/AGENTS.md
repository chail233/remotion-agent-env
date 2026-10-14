# text/ — 文字与对白

| 编号 | 文件 | 角色 | 长什么样 |
|---|---|---|---|
| text/01 | Captions.tsx | 字幕 | 白色胶囊 + 阴影，38px，淡入上浮；默认 y=968 水平居中，`style` 可自由改位置 |
| text/02 | RichText.tsx | 行内语法 | 「词」→ 强调色加粗；`code` → 等宽小标签（10% 底色圆角） |
| text/03 | Bubble.tsx | 气泡 | 白色圆角对话气泡 + 三角尾巴，逐字出现 |
| text/04 | Tag.tsx | 标签 | 彩色描边胶囊（14% 底色 + 50% 描边），24px 粗体 |
| text/05 | StatBar.tsx | 数值条 | 标签 + 右端读数 + 22px 高渐变填充条 |

均依赖 `./theme`；`01 Captions` 另依赖 `./RichText`。

## 01 Captions.tsx — 字幕

```tsx
<Captions caps={[[60, 150, "第一句「强调词」"], [150, 240, "第二句带 `code`"]]} />
```

`caps: [开始帧, 结束帧, 文本][]`（类型 `Cap`），命中区间的那条显示，区间互不重叠，找不到返回 null。前后各 8 帧淡变 + 上浮 12px 淡入。`dark` 深色版（米白字深色底、金色强调），`serif` 用宋体，`y` 默认 968。`style` 覆盖外层容器（left/right/top/width 等），可放画面任意位置、任意宽度。文本支持 02 的小语法。

## 02 RichText.tsx — 行内小语法

不是定位元素，嵌在任何文字块里：`「词」` → 强调色加粗（默认 clayDark）；`` `code` `` → 代码字体小标签（默认 rose）。`accent` `codeColor` 可换色。

## 03 Bubble.tsx — 对话气泡

```tsx
<Bubble at={200} until={330} x={1300} y={400} text="两行\n气泡文字" tail="left" />
```

第 `at` 帧弹簧弹出（damping 11 / stiffness 170），默认 0.7 字/帧逐字出现（`speed`），`until` 前 8 帧淡出。`x, y` = 底边中点，尾巴尖在 y 下方约 18px；`tail` `down|left|right|none`。`color` 气泡底色（影响尾巴）、`textColor`、`fontSize`（34）、`maxWidth`（560）、`mono` 用代码字体。

## 04 Tag.tsx — 胶囊标签

行内元素。`children` 文字，`color` 默认 clay，定位靠外层容器或 `style`。

## 05 StatBar.tsx — 数值进度条

`{label, value, max=100, color=rose, width=420, x, y, icon}`，`icon` 走 emoji 字体。

**本身不做动画**：`value` 由调用方用 `interpolate` 驱动（例：`interpolate(frame, [300, 500], [30, 80], clamp)`），进度条永远和帧号同步。
