# base/ — 基础依赖

全库唯一「必须携带」的一层，任何组件都要连同这两个文件（或等价物）一起接入。

| 编号 | 文件 | 说明 |
|---|---|---|
| base/01 | theme.ts | 配色、字体栈、画布常量、颜色/插值小工具 |
| base/02 | fonts.ts | loadFonts() 字体加载 |

## 01 theme.ts

| 导出 | 说明 |
|---|---|
| `C` | 配色表。主色 `clay` #D97757（陶土橙）、`pink`/`rose`（粉/玫红），辅助色 `mint` `sky` `gold` `violet`；纸张底 `bg`/`bgDeep`、正文 `ink`/`inkSoft`；`editor*` 是编辑器窗口底色，`code*` 是语法高亮色；`error` |
| `F` | 字体栈：`sans` 黑体、`serif` 宋体（标题用）、`mono` 代码（中文回退黑体）、`emoji`。首选家族名 `Kit *` 由 fonts.ts 注册 |
| `FPS` `W` `H` | 30 / 1920 / 1080 |
| `hexA(hex, alpha)` | `#RRGGBB` → `rgba(...)`，alpha 自动夹紧 0~1。全库透明度都用它 |
| `clamp` | `interpolate` 两端夹紧参数，全库统一用它 |

**换主题/换风格只改这个文件**：组件里的颜色都来自 `C`（个别硬编码色如窗口红黄绿圆点是字面量）。

## 02 fonts.ts

| 导出 | 说明 |
|---|---|
| `loadFonts()` | 从 `public/fonts/` 加载 NotoSansSC-VF / NotoSerifSC-VF / CascadiaCode，注册为 `Kit Sans/Serif/Mono`。在根组件所在模块顶层调一次，幂等；内部 `delayRender` 等字体就绪 |

需要文件：`C:\Windows\Fonts` 下的 `NotoSansSC-VF.ttf`、`NotoSerifSC-VF.ttf`、`CascadiaCode.ttf` → `public/fonts/`。
`F` 里的家族名与 fonts.ts 的注册名耦合，改名两边都要改。tsconfig `lib` 需含 `"DOM", "DOM.Iterable"`。
