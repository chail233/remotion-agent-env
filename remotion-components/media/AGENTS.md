# media/ — 外部素材消费件

消费 `scripts/` 三条素材管线产出的组件：图标（fetch-icons）、Lottie 动画（fetch-lottie）、程序化纹理（make-textures）。素材放在 `public/`，组件用 `staticFile` 引用；**素材本身不进 git，脚本按需再生成**。

| 编号 | 文件 | 角色 | 长什么样 |
|---|---|---|---|
| media/01 | Icon.tsx | 图标 | public/icons/ 的单色图标，任意上色缩放，矢量清晰 |
| media/02 | LottieAnim.tsx | 动效 | 嵌入整段 Lottie JSON 动画，进度跟时间轴 |
| media/03 | Texture.tsx | 纹理层 | public/textures/ 的 SVG 铺满全屏，可慢速漂移 |

三个组件都**无主题依赖**（与 audio/01 Sfx 同级），拷进项目后同目录摆放即可用。

## 01 Icon.tsx — 单色图标

```tsx
<Icon name="lucide-rocket" size={64} color={theme.colors.hero} />
```

原理：SVG 作为 CSS mask 载入，`backgroundColor` 就是图标颜色——所以**任何颜色/透明度/缩放都不糊**，也能随帧插值变色。`name` = public/icons/ 下文件名去 `.svg`。mask 会拍平成单色：多色图标（如品牌标）直接 `<Img src={staticFile("icons/x.svg")} />`。图标清单与许可在 `public/icons/licenses.json`（fetch-icons.mjs 自动登记）。

## 02 LottieAnim.tsx — Lottie 动画

```tsx
<LottieAnim src="lottie/pulse-dot.json" style={{ width: 320, left: 800, top: 380, position: "absolute" }} />
```

依赖 npm 包 `@remotion/lottie`（`npx remotion add @remotion/lottie`，版本必须与 remotion 一致）。`src` 是 public/ 下相对路径；加载用 delayRender 包好，渲染不会白屏。进度完全由时间轴驱动——`loop` 只在动画短于合成时才需要开；`playbackRate` 调快慢。适合：加载指示、角色小动画、图标动效等「整段专业动效」的插入。来源/许可在 `public/lottie/manifest.json`，**使用前确认 license 已登记**。

## 03 Texture.tsx — 纹理背景层

```tsx
<Texture src="textures/mesh.svg" opacity={0.8} />
<Texture src="textures/noise.svg" repeat="tile" opacity={0.06} drift={0.4} />
```

`repeat="cover"`（默认，全景纹理 mesh/contour/stars…）或 `"tile"`（noise 颗粒）。`drift` 让背景图缓慢平移（数值 = 每 100 帧移动的视口百分比）。纹理由 make-textures.mjs seed 生成，`public/textures/manifest.json` 记录了 seed/palette——想要变体改 seed 重跑即可，不要手改 SVG。

## 素材目录约定（三条管线共用）

| 目录 | 产出 | 清单文件 |
|---|---|---|
| `public/icons/` | `<prefix>-<name>.svg` | `licenses.json`（图标 → 许可映射） |
| `public/lottie/` | `<name>.json` | `manifest.json`（来源/许可/帧数） |
| `public/textures/` | `<kind>.svg` | `manifest.json`（seed/palette/尺寸） |

这些都由脚本生成、按需再生成，**不提交 git**；正式使用前检查清单里的 license 字段不为 UNSET/unknown。
