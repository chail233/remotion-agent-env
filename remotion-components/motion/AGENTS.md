# motion/ — 动画 hook

| 编号 | 文件 | 说明 |
|---|---|---|
| motion/01 | usePop.ts | 第 at 帧起弹簧 0→1（弹出缩放） |
| motion/02 | useFade.ts | 区间淡入淡出 0~1 |

两个 hook 都不依赖 theme，也不渲染任何东西。

## 01 usePop.ts

`usePop(at, damping=12, stiffness=140)` → 从第 `at` 帧起弹簧值 0→1（可轻微过冲）。
用法：`transform: scale(usePop(at))`。

- 这是 React hook：**不能在 `map`/循环回调里调用**。列表里多个弹出请像 text/03 Bubble 那样直接内联 `spring({ frame: frame - at, fps, config: {...} })`
- 手感参考：通用弹出 (12, 140)、活泼 (11, 170)、稳重 (14, 120)

## 02 useFade.ts

`useFade(from, to=1e9, len=10)` → 0~1：第 `from` 帧后 10 帧淡入，第 `to` 帧前 10 帧淡出，两端夹紧。不传 `to` 则只淡入不淡出。
用法：`opacity: useFade(60, 300)`。
针对「某元素在画面中被强调的时间窗」的区间淡变，用 code-display/01 timeline 的 `fadeWindow`（语义相同，非 hook）。
