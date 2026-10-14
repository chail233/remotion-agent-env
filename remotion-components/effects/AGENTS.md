# effects/ — 一过性特效

短时自发动画：给 `at`（开始帧）和 `x, y`（父容器坐标）就自己演完并消失，**不用管结束时间**。均依赖 `./theme`；`01 HeartBurst` 另依赖 `./HeartShape`。

| 编号 | 文件 | 长什么样 | 时长 |
|---|---|---|---|
| effects/01 | HeartBurst.tsx | 十几颗粉/玫红爱心从一点向四周炸开、边散边上飘，缓出曲线 | 约 70 帧 |
| effects/02 | Sparkles.tsx | 金/白四角星绕一圈向外扩散并自转，闪完后消失 | 约 50 帧 |
| effects/03 | HeartShape.tsx | 单个 SVG 爱心，静态形状件 | 不限 |

## 01 HeartBurst.tsx — 爱心炸开

`{at, x, y, count=14, seed="h", spread=260, colors=[rose, pink, 浅粉, clay]}`
`seed` 不同散开的形状就不同（remotion `random`，同 seed 渲染可复现）。

## 02 Sparkles.tsx — 星光扩散

`{at, x, y, count=12, seed="s", r=220}`（r = 扩散半径）。

## 03 HeartShape.tsx — 单个爱心

`{size, color=rose, style}`（viewBox 坐标系）。做常驻爱心或自定义轨迹动画时用它；01 内部复用的也是它。

提醒：特效放在带 overflow:hidden 的面板（scene/03 Stage）里会被裁边，超出面板的粒子要挂在外面。
