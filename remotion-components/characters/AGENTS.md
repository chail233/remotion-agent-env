# characters/ — 角色

| 编号 | 文件 | 说明 |
|---|---|---|
| characters/01 | Clawdia.tsx | 像素风方块小人（SVG），表情/头饰/手持物全 props 化 |

## 01 Clawdia.tsx

导出 `Clawdia`（SVG，viewBox 160×150）、类型 `Expression` / `Accessory` / `Holding`。依赖 `./theme`。自带待机动画：呼吸起伏、约每 3 秒眨一次眼——不需要任何驱动。

```tsx
<Clawdia size={300} expression="happy" accessory="glasses" holding="laptop" wave />
```

| 属性 | 取值 | 说明 |
|---|---|---|
| `size` | 数字，默认 320 | 宽度 px，高度 ≈ size × 0.94 |
| `girl` | 布尔，默认 true | 女版（蝴蝶结、睫毛、腮红、身体偏暖 #E07F62）/ 素色版 |
| `expression` | `normal` `happy` `love` `surprised` `shy` `angry` `wink` `closed` `proud` | happy 是 ^^ 眼，love 爱心眼，angry 是 >< 眼，shy 眯眼加大腮红，wink 只闭右眼 |
| `accessory` | `none` `beret` `glasses` `chef` | 贝雷帽/圆眼镜/厨师帽；戴帽子时自动隐藏蝴蝶结 |
| `holding` | `none` `laptop` `flower` `book` `pan` | 手持物；flower 拿在会挥动的右手上 |
| `ghost` | 0~1 | 1 = 流动的虚线轮廓 + 问号（「还不存在」），1→0 插值即「实体化」 |
| `wave` | 布尔 | 挥右手 |
| `lookX` | 约 -1~1 | 眼睛向左/右看（瞳孔和腮红整体平移） |
| `color` | 颜色 | 换身体颜色，可做路人、配角 |
| `bow` | 布尔 | 强制显示/隐藏蝴蝶结 |
| `blinkSeed` | 数字 | 同屏多个角色时错开眨眼时间 |
| `style` | CSSProperties | 透传给外层 svg（定位用） |

内部子件 `Bow` / `Flower` 未导出，是角色本体的一部分。

多角色同屏：用 `color` 换身体颜色区分个体，`blinkSeed` 错开眨眼。
