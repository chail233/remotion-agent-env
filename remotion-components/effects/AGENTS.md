# effects/ — 一过性特效

短时自发动画：给 `at`（开始帧）和 `x, y`（父容器坐标）就自己演完并消失，**不用管结束时间**（04/05 例外，是常驻件）。均依赖 `./theme`；`01 HeartBurst` 另依赖 `./HeartShape`。

| 编号 | 文件 | 长什么样 | 时长 |
|---|---|---|---|
| effects/01 | HeartBurst.tsx | 十几颗粉/玫红爱心从一点向四周炸开、边散边上飘，缓出曲线 | 约 70 帧 |
| effects/02 | Sparkles.tsx | 金/白四角星绕一圈向外扩散并自转，闪完后消失 | 约 50 帧 |
| effects/03 | HeartShape.tsx | 单个 SVG 爱心，静态形状件 | 不限 |
| effects/04 | Draw.tsx | SVG 路径描画：从起点画到终点，画完常驻 | `dur` 帧后常驻 |
| effects/05 | Particles.tsx | 确定性上升微粒场，常驻氛围层 | 常驻 |
| effects/06 | Confetti.tsx | 彩带炸开：抛物线喷出、翻转飘落 | `lifetime` 帧（默认 90） |

## 01 HeartBurst.tsx — 爱心炸开

`{at, x, y, count=14, seed="h", spread=260, colors=[rose, pink, 浅粉, clay]}`
`seed` 不同散开的形状就不同（remotion `random`，同 seed 渲染可复现）。

## 02 Sparkles.tsx — 星光扩散

`{at, x, y, count=12, seed="s", r=220}`（r = 扩散半径）。

## 03 HeartShape.tsx — 单个爱心

`{size, color=rose, style}`（viewBox 坐标系）。做常驻爱心或自定义轨迹动画时用它；01 内部复用的也是它。

## 04 Draw.tsx — 路径描画（常驻件）

`{d, w=3, color=ink, delay=0, dur=30, dash="300", style}`。`d` 是 SVG path 字符串，**0~100 百分比坐标系**；组件绝对定位铺满父容器（父容器需有定位上下文），`preserveAspectRatio="none"` + non-scaling-stroke 让路径随容器拉伸、线宽不变形。第 `delay` 帧起 `dur` 帧内从起点画到终点，之后常驻。路径很长画不满时把 `dash` 调大（须 ≥ 路径实长）。

## 05 Particles.tsx — 微粒场（常驻件）

`{n=24, seed=1, color=ink, area=全屏, size=6, speed=1, opacity=0.25}`。`n` 颗圆点在 `area`（画布像素坐标 `{x,y,w,h}`）内缓缓上浮 + 左右摇摆，透明度按正弦呼吸；形态由 `seed` 决定（remotion `random`，同 seed 可复现）。常垫在内容层之下铺氛围。

## 06 Confetti.tsx — 彩带炸开

`{n=140, at=0, lifetime=90, originX=0.5, originY=0.5, power=17, gravity=0.45, size=13, colors=[clay,pink,gold,mint,sky,violet], seed=1}`。`originX/Y` 是画布 0~1 比例炸点；彩纸抛物线喷出、翻转（flutter）飘落，`lifetime` 后画面恢复干净。形态由 `seed` 决定（内置 mulberry32，同 seed 可复现）。庆祝、高潮、揭晓时刻用；连发时 `at` 错开、`originX` 分散。

提醒：特效放在带 overflow:hidden 的面板（scene/03 Stage）里会被裁边，超出面板的粒子要挂在外面。
