# skills/

本目录存放 Agent 技能(Skill),每个子目录一个,入口为 `SKILL.md`。

## remotion-*(Remotion 官方)

来源:[remotion-dev/skills](https://github.com/remotion-dev/skills) @ commit `a2824c6`(package 版本 4.0.541),2026-11-07 原样拷贝,官方安装方式为 `npx skills add remotion-dev/skills`。

| 目录 | 用途 |
| --- | --- |
| `remotion-best-practices` | 总纲,内嵌其余各技能的完整副本,不确定用哪个时读它 |
| `remotion-create` | 新建 Remotion 项目或合成(含 Tailwind、视频版式) |
| `remotion-markup` | React 标记最佳实践:合成、动画、布局、字体、媒体、音频、时序、转场等(内嵌 `remotion-maps`) |
| `remotion-studio` | 启动 Studio 预览 |
| `remotion-render` | 渲染视频或静帧(含透明视频) |
| `remotion-maps` | 地图动画:Mapbox / MapLibre / MapTiler / GeoJSON / CesiumJS,含各技术卡与示例资源 |
| `remotion-captions` | 字幕:转录、导入 SRT、展示 |
| `remotion-interactivity` | 让代码在 Studio 中可交互/可编辑 |
| `remotion-docs` | 检索 Remotion 文档并取回 Markdown |
| `remotion-upgrade` | 升级 Remotion 全家桶与技能本身 |
| `remotion-multimedia` | 浏览器端多媒体处理(Mediabunny):取视频/音频元数据 |
| `remotion-saas` | Remotion 驱动的应用/产品集成架构(Player、Lambda 渲染) |
| `remotion-license` | Remotion 许可证相关说明 |

## remotion-bits

示例优先的 Remotion 创作工作流(MCP / CLI / 目录回退链),先前单独 vendor,出处见其 `SKILL.md`。

## 更新方式

重新执行拷贝即可覆盖 `remotion-*` 各目录(如 `git clone --depth 1` 后复制其 `skills/` 下同名目录);`remotion-bits` 不受影响。
