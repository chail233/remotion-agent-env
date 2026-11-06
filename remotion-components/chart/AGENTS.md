# chart/ — 数据图表

帧驱动的图表动画：数据是普通 props，生长进度由帧号 + spring 驱动，回退/跳帧都天然可复现。纯 SVG，无图表库依赖。

| 编号 | 文件 | 说明 |
|---|---|---|
| chart/01 | BarChart.tsx | 柱状图：柱子逐根弹簧生长（错峰 stagger），数值与标签随柱浮出 |

## 01 BarChart.tsx — 柱状图

```tsx
<BarChart
  style={{ left: 460, top: 280 }}
  data={[{ label: "人类", value: 42 }, { label: "AI", value: 87 }]}
/>
```

`{data, width=1000, height=520, barColor=clay, delay=0, stagger=5, showValues=true, style}`。`data` 是 `{label, value}[]`；第 1 根柱第 `delay` 帧起生长，之后每根错峰 `stagger` 帧（damping 12 / stiffness 100）。定位靠 `style`（组件本体是 absolute 容器，宽高即 props）。

- `showValues`：柱顶 mono 数值随柱浮出（自动 toLocaleString）
- 数值条/读数类需求看 text/05 StatBar；滚动数字在 cinema/05 Counter
- 创作提示：柱子出现顺序按数据叙事排（先主角后对比），stagger 5~8 帧手感自然，别让全部柱同帧炸出
