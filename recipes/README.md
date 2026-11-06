# recipes/ — 外部创作配方与技能库（按需查阅）

从 GitHub 高质量视频创作项目搬运来的方法论原文，供 Agent **按需检索**，不默认通读。组件接口看 `remotion-components/`，提炼后的核心规则看 `remotion-components/PLAYBOOK.md`，本目录是全文参考。

## shotcraft/ — 镜头配方卡 + 判例式审美准则

搬运自 [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft)（Apache-2.0，见 LICENSE，提交 2026-11 时点）。

| 路径 | 内容 | 何时读 |
|---|---|---|
| `shots/<opening/rhythm/transition/typography/camera/ui-entrance/data/effects/interaction/outro>/xxx.md` | 124 张镜头配方卡：意图 / 动效核心 / **参数表（含"调节手感"列）** / 声音钉帧 / 已知坑 | 做某类镜头前查对应分类 1-2 张卡，照参数起点再调 |
| `aesthetic-rules.md` | 判例式审美准则：规则 + 判例（用户返工原话）+ 自检问题，编号 R/Q/S/C/P | 交付前逐条自检；有意违反须写进项目说明 |
| `music-beat-sync.md` | 拍点方法论：测 BPM → 网格验收门槛 → beatF 编排 | 配乐类视频分镜前 |
| `sequences/` | 全片骨架桥段（能量弧、段位时长占比） | 定整片结构时 |
| `pipeline.md`、`sound-design.md`、`sfx-sourcing.md` 等 | 流程 / 声音设计 / 素材来源 | 对应环节需要时 |

注意：卡片里「参考实现」的源码路径指向上游仓库的 `demos/`，本仓库只搬了文档；需要源码时把上游克隆到 `out/gh/video-shotcraft`（out/ 不进 git）。

## 未搬运的来源

- **opus-video-prompts**（joeseesun/opus-video-prompts）：无 LICENSE，不整体复制；其六段式提示词模板与禁用清单已提炼进 `remotion-components/PLAYBOOK.md`。
- **motion-skills**（iart-ai/motion-skills，MIT）：meta 仓库，50 个技能包在外部子仓库，与 Remotion 直接相关的部分已由 shotcraft 卡覆盖；需要时再按包名克隆。
- **remocn**（Remocn/remocn，MIT）：组件源码库，Confetti/Karaoke/BarChart 即提炼自它；更多组件（转场 presentation、radial-bars 等）可按需回访 `out/gh/remocn/registry/remocn/`。
