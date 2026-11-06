# scene/ — 场景外壳与画面框架

背景两款 / 面板两件，可任意单用或组合；位置尺寸均由 props 决定，本分类不预设版面。

| 编号 | 文件 | 角色 | 长什么样 |
|---|---|---|---|
| scene/01 | Paper.tsx | 背景 | 米白底 + 48px 淡棕方格线，铺满全屏（更完整的亮色背景栈看 scene/04，换底色传 `tint`） |
| scene/03 | Stage.tsx | 面板 | 半透明奶白圆角矩形 + 细棕描边，默认 (1060, 90, 800, 850)，位置尺寸由 props 决定 |
| scene/04 | LightBg.tsx | 背景 | 暖纸底 + 三团漂移光斑（可配色）+ 点阵 + 两角旋转几何线稿，亮色完整背景栈 |
| scene/05 | DuoPanel.tsx | 面板 | 左右双色对比面板（图标座 + 英文小字 + 标题）+ 中央金色脊线，对比/辩论类骨架 |

## 01 Paper.tsx — 纸张背景

导出 `Paper`。依赖 `./theme`。`tint` 可换底色。最简底：一层底色 + 方格线，上面叠什么由使用者定。

## 03 Stage.tsx — 舞台面板

导出 `Stage`。依赖 `./theme`。默认 (1060, 90, 800, 850)，`bg` 可换底色。

- 内部坐标相对舞台左上角
- `overflow: hidden`：超出舞台的内容会被裁掉，**飞出画面的动画元素要放在 Stage 外面**

## 04 LightBg.tsx — 亮色背景栈

导出 `LightBg`。依赖 `./theme`。与 cinema/02 深色背景栈互为亮/暗两版，单独铺底即得完整画面。

```tsx
<LightBg />  {/* 或 <LightBg tintA={C.clay} tintB={C.sky} tintC={C.gold} /> */}
```

`{tintA=clay, tintB=sky, tintC=gold, bg=C.bg, dots=true, corners=true}`：左上大光斑、右下大光斑、中部点缀光斑各占一色；`dots` 点阵网格层、`corners` 两角缓慢旋转的几何线稿装饰，都可单独关。漂移是帧号的确定性函数，可复现。默认外观取自 AIVSHuman 的「人类暖橘 × AI 青蓝」双色语言，换题材换 `tint*` 即可。

## 05 DuoPanel.tsx — 对比双栏面板

```tsx
<DuoPanel
  delay={16}
  left={{ color: C.clay, en: "HUMAN", label: "人类" }}
  right={{ color: C.sky, en: "MODEL", label: "大模型" }}
/>
```

`{left, right, top=236, height=600, width=700, inset=110, divider=true, dividerColor=gold, delay=0, headerTop=26}`。左右各一块渐变纸面板（底/描边/阴影/头部小字都从各自 `color` 派生），头部 = 图标座（`icon` 传任意 ReactNode，建议配 media/01 Icon，座底自动染 color 8%）+ `en` 等宽小字 + `label` 大标题；左栏第 `delay` 帧从左滑入，右栏自动延后 12 帧从右滑入。`divider` 是两栏之间上下的金色渐变脊线，可关可换色。

**只负责框架与头部**：正文内容（条目、卡片、连线）由调用方在面板之上另行定位叠加；面板本身不裁切内容。
