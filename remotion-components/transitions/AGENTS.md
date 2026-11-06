# transitions/ — 转场套件（配 @remotion/transitions）

一组 `TransitionPresentation` 工厂，供 `<TransitionSeries>` 的 `<TransitionSeries.Transition>` 消费。**本目录是依赖例外**：依赖已安装的 `@remotion/transitions`（环境自带），不依赖 `base/theme`——转场作用在两个场景之上，颜色语义自持（黑/白/暖光），需要配色时传 props。

来源：提炼自 [remocn](https://github.com/remotion-dev/remocn)（MIT）。

## 用法

```tsx
import { TransitionSeries, Transition } from "@remotion/transitions";
import { whipPan } from "./transitions/WhipPan"; // 拷入项目后按实际路径

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={whipPan({ direction: "left" })}
    timing={timingUtils.linearTiming({ durationInFrames: 20 })} // 时长决定转场节奏
  />
  <TransitionSeries.Sequence durationInFrames={90}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

- 转场帧数（timing 的 durationInFrames）会**占用**前后序列各自的总时长，排日程时留出余量
- 每个转场的 presentationProgress 0→1、entering/exiting 都由 `<Transition>` 驱动，组件内部自处理两侧场景，无需手动插值
- 单独预览某个转场：临时合成里放两个纯色/文字场景 + 该转场，抽帧看 p≈0.25/0.5/0.75

## 外观速查

| 文件 | 名称 | 一句话 | 特征参数 |
| ---- | ---- | ------ | -------- |
| 01 | WhipPan | 甩镜：两场同向高速滑过，中段拖影+运动模糊 | direction, blur |
| 02 | LightLeak | 漏光：暖光斑漂入、切换点烧白、缓慢冷却 | colors, origin, intensity |
| 03 | IrisWipe | 光圈：圆收成点再张开，经典默片语法 | centerX/centerY, holdRadius, color |
| 04 | ZoomBlur | 缩放虚化：出场远去模糊、入场推近落定 | blur, rise |
| 05 | PageTurn | 翻页：出场页绕底角掀起旋出，poses 停格顿挫 | angle, origin, poses |
| 06 | Hyperspace | 超空间：星场加速成流线、白闪切换、缓焦落定 | stars, streakColor, flash |
