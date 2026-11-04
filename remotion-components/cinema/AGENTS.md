# cinema/ — 深色电影感套件

来源：从 ConcurrentArt（并发主题成片）提取的实战组件，**只保留了在原片 8 个场景中实际使用且打磨到位的部分**。整体气质：近黑底 + 双色漂移光斑 + 胶片颗粒 + 发光强调，适合技术讲解 / 叙事纪录片类视频。

| 编号 | 文件 | 角色 | 长什么样 |
|---|---|---|---|
| cinema/01 | theme.ts | token | 近黑三层底色、琥珀 hero + teal/blue/violet/orange 辅色、4 条缓动曲线、4 组弹簧、alpha/glow 工具 |
| cinema/02 | Background.tsx | 背景 | 深色渐变底 + 两团慢漂移模糊光斑 + 点阵网格 + 地平线 + 上浮尘埃；另有调色/颗粒/暗角三个全屏收尾层 |
| cinema/03 | Reveal.tsx | 动效 | Reveal 单弹簧入场；Words 逐字级联标题；ExitWrap 场景末尾加速退场 |
| cinema/04 | SceneShell.tsx | 外壳 | 五层场景壳（bg→内容→调色→颗粒→暗角）+ 慢视差；Phase 时间窗块；PulseLine 带脉冲点的连线 |
| cinema/05 | UI.tsx | 部件 | 发光圆点胶囊、终端风芯片、滚动数字、眉题、左上角章节标、玻璃卡片、发光圆点 |
| cinema/06 | Captions.tsx | 字幕 | 底部深色玻璃胶囊字幕条 + 左侧发光色条，弹簧入缓动出 |

## 接口事实

- **自带独立 theme**：组件只 import `./theme`（本目录的 01），与 `base/01 theme.ts` 不混用。拷贝时把整个 cinema/ 目录放同一目录即可，无需 base/theme.ts
- **字体**：`theme.fonts` 首选 `Kit Serif/Kit Sans/Kit Mono`（base/02 fonts.ts 注册的族名），需按库接入清单准备 `public/fonts/` 三个 ttf；不装则走系统回退（Microsoft YaHei 等）
- 所有坐标/字号按 **1920×1080** 标定；动画只依赖当前帧（帧参数），与库总规则一致
- 组件内部节奏默认用 `theme.spring.snappy`（入场）/`smooth`（大件入场）；改手感优先换 `config`/`spring` 预设而不是逐个调参数

## 01 theme.ts — token 源

`theme.colors`：底色三级 `bg #07080C / bgAlt / bgDeep`；文字 `ink / dim / mute`；强调 `hero`（琥珀，标题与收益时刻）+ `heroSoft`；辅色 `orange / teal / blue / violet`；语义 `danger / ok`；表面 `surface / surfaceStrong / line / lineSoft`（白色系透明度）。
`theme.fonts`：`display`（宋体衬线）/ `body`（黑体正文）/ `mono`（等宽）。
`theme.ease`：`out`（主力入场）/ `inOut` / `in`（退场）/ `glide`。
`theme.spring`：`snappy`（小件入场）/ `smooth`（默认大件）/ `bouncy` / `soft`。
工具：`alpha(hex, a)` → rgba 字符串；`glow(hex, strength?)` → 双层外发光 box-shadow。另有 `FPS / W / H` 画布常量。

## 02 Background.tsx — 背景栈

```tsx
<BgStage hue={theme.colors.hero} hue2={theme.colors.blue} intensity={1} />
```

- `BgStage` `{hue?=hero, hue2?=blue, intensity?=1, grid?=true, dust?=true}`：三层径向底色渐变 → 两团 80–90px 模糊光斑（周期 61/77/43 帧的正弦漂移）→ 46px 点阵网格（径向蒙版聚焦中部）→ 78% 高度地平线 → 34 粒上浮尘埃（`rnd` 确定性随机，粒子形态可复现）。`intensity` 0~1 缩放光斑
- `Grade` `{hue, strength?=0.16}`：主色 soft-light 罩 + 上下压暗，盖在内容**之上**做整体调色
- `Grain`：SVG feTurbulence 噪点 220px 平铺，随帧漂移，overlay 混合，透明度 0.055
- `Vignette`：椭圆径向暗角
- 导出 `rnd(n)` 确定性伪随机，供场景内其他粒子复用

层序参考 SceneShell：BgStage 在内容下，Grade/Grain/Vignette 依次盖在内容上。

## 03 Reveal.tsx — 入场/退场原语

```tsx
<Reveal delay={10} y={38} blur={6}>
  <h1>标题</h1>
</Reveal>
<Words text="并发不是魔法" hot={[2, 3]} delay={20} />
```

- `Reveal` `{delay?=0, y?=38, x?=0, scaleFrom?=0.965, blur?=0, config?=smooth, style, children}`：一个弹簧同时驱动透明度/位移/缩放/模糊。最常用的入场包裹层
- `Words` `{text, delay?=0, per?=2.4, style, charStyle, hot?=[], hotColor?=hero, byWord?=false, entranceY?=34}`：逐字 snappy 弹簧级联（translateY+scale+rotate 1.2°→0）。中文按字级联，`byWord` 按空格分词；空格不占序号；`hot` 序号（按可见字符计）的字符染 hotColor 并带 drop-shadow 发光
- `ExitWrap` `{duration, frames?=16, scaleTo?=1.025, children, style}`：绝对定位铺满层，在时长 `duration` 的最后 `frames` 帧加速淡出并放大到 scaleTo（结束点 duration-2）。每个场景内容都应包在它里面

## 04 SceneShell.tsx — 场景骨架

```tsx
<SceneShell hue={theme.colors.teal} hue2={theme.colors.violet} duration={800}>
  <ChapterMark no="01" title="线程" en="THREADS" color={theme.colors.teal} delay={10} />
  <Phase from={20} to={400}>
    <CodeChip code="new Thread(r).start()" delay={30} accent={theme.colors.teal} />
  </Phase>
</SceneShell>
```

- `SceneShell` `{hue, hue2, duration, intensity?=1, children}`：BgStage → 内容（`sin(frame/180)*6` 慢视差 + ExitWrap 14 帧退场）→ Grade(0.15) → Grain → Vignette。一个场景 = 一个 SceneShell，hue/hue2 决定该章色彩
- `Phase` `{from, to, fadeIn?=14, fadeOut?=12, children, style}`：场景本地帧的时间窗，窗外返回 null；`fadeIn/fadeOut` 传 0 关闭淡变。**子元素 delay 相对场景开头计，不做偏移换算**
- `PulseLine` `{x1,y1,x2,y2, color, width?=1, dash?=false, pulse?=-1, opacity?=0.5}`：div 旋转实现直连线（不支持曲线），`pulse` 0..1 在线段对应位置画 10px 发光点（配合 `interpolate(frame,…) + Math.sin` 来回巡游），-1 不画

## 05 UI.tsx — 部件集

- `DotChip` `{label, color?=hero, size?=26, delay?=0, active?=false, style}`：发光圆点胶囊，snappy 弹簧入场；`active` 点亮边框与外发光
- `CodeChip` `{code, delay?=0, size?=23, style, accent?=hero, dim?=false}`：左侧发光竖条 + `›` 提示符 + 等宽内容的深色玻璃芯片，Reveal 入场
- `Counter` `{to, from?=0, delay?=0, duration?=40, decimals?=0, prefix?="", suffix?="", style, color?=ink}`：duration 弹簧滚动数字，tabular-nums；`toLocaleString("en-US")` 千分位
- `Kicker` `{children, color?=hero, style, size?=20}`：等宽 0.26em 字距全大写眉题
- `ChapterMark` `{no, title, en, color, delay?=0}`：固定在左上角（left 92 / top 54）的章节标：衬线大章号 + 竖线 + 标题 + 英文小字，Reveal 从上方入场。换画布需调内部定位
- `Panel` `{children, color?=hero, style, pad?=28, glowOn?=false}`：玻璃卡片（白渐变弱底 + 细边框 + backdrop blur）；`glowOn` 换主题色外发光
- `Dot` `{color, size?=12, glowSize?=18, style}`：双层辉光圆点，粒子/进程/节点的最小单元

## 06 Captions.tsx — 字幕条

```tsx
// 挂在合成最顶层、所有 <Sequence> 之外
<Captions
  accent={theme.colors.hero}
  caps={[[20, 140, "第一句旁白"], [140, 260, "第二句旁白"]]}
/>
```

`caps: [开始帧, 结束帧, 文本][]`（类型 `Cap`，与 text/01 格式一致），命中区间的那条显示、互不重叠、区间外 null。入场为 10 帧 snappy 弹簧（上浮 22px + scale 0.97→1），退场 8 帧 ease.in。`accent` 控制左侧色条与描边。**必须放所有 Sequence 之外读全局帧**，否则字幕区间整体偏移。纯文本渲染，不支持 text/02 的小语法。
