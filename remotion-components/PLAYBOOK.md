# remotion-components/PLAYBOOK.md — 创作模式手册

组件接口看各分类 AGENTS.md；**怎么排得好看、节奏怎么定、何时用什么**读本文。
规则提炼自 GitHub 高质量项目：video-shotcraft（124 张镜头配方卡 + 判例式审美准则，17k★）、opus-video-prompts（可复制提示词 + 54 案例）、motion-skills（50 个动效技能包），已按本库帧号/spring 习惯换算。

## 节奏与拍点

- **音乐先行**：先测真实 BPM/相位再分镜，时间线用拍号 `beatF(n) = n * (60 / BPM * FPS)` 表达，不写裸帧号。BPM 标量偏差可达 2%，别拿整数 BPM 直接算。
- **落定后必须呼吸**：字标/字卡 hold ≥1s（30fps 即 ≥30 帧）；批量动效收尾静止 0.5s。排时间线先划走 hold 预算再排动效。
- **节奏宁慢勿快**：开场主体动作弧 ≥3s；初版默认整体放慢一档——返工全指向"放慢"，几乎没有"太慢"。
- **卡点管时机不管幅度**：全画面级节拍冲击全片 ≤3 处、间隔 ≥16 拍，其余拍点只动元素层。
- **能量骨架四段式**（promo 类）：开场 8–12%（低）→ 单主角立传 12–15%（质感最高）→ 功能爬升 55–65%（高⇄低交替，呼吸字卡每张 50–55 帧、全片 2–4 张）→ 峰值收场 13–16%。

## 镜头与构图

- **开场只给一个主角**：单元素 + 完整动作弧（聚焦→悬浮→归位），群舞撑不起第一印象。
- **信息密集镜头正视**；文字特写才用侧向水平机位；禁全局一刀切风格化倾斜。
- **飞入元素终点必须是布局真实槽位**，不悬浮在页面上方（DuoPanel/Stage 里排内容同理）。
- **禁 handheld shake**。文字发糊先查栅格化链路（`rasterize 2–4x` + CSS zoom），景深不是清晰度解法。

## 文字动效

- **字不动、属性动**：在场型文字（已有 Typewriter/Karaoke 承接入场）靠字重/填色/位移表达节拍，不让字本身乱跳。
- **要读的文字有最低字高**：字幕 ≥5.2% 帧高（1080p ≥56px），辅助文字 ≥3%；按渲染帧实际像素验收，读不清宁可删。
- **逐字/逐词节奏**：逐字 3–4 帧/字（Typewriter `per`），逐词填色 18–33 帧/词（Karaoke 词区间），随口语速度走。

## 字幕与配音

- **>3s 无解说段落必须补 caption**（text/01 或 cinema/06）。
- **拟音优先于装饰音**：画面动作配真实物件声；SFX 逐拍钉帧，连发用双样本交替 + 音量递减 + 间隔渐紧防"机枪感"；音效时长 = 动作时长。

## 转场

- **硬切当乐器**：连闪定格切点间隔渐紧（如 22f→18f）读作快门连拍；切串全片 ≤1 次，切完 hold 给平常两倍；真硬切不要加 2f 交叉淡化。

## 反模式（Banned list）

粒子爆炸滥用 · RGB split · 镜头光晕 · 霓虹辉光 · 弹跳缓动（bouncy 弹簧用滥）· 网格地板 · 闪光背景 · 逐元素 glint 群发 · 光效溢出圆角 · 匀速直线运动 · "模板味"。
每条可以有意违反，但须写进项目说明作为风格声明。

## 确定性与交付自检

- **禁 `Math.random()` / `Date.now()`**：随机形态一律 seed 派生（remotion `random(seed)`，Confetti/Particles/HeartBurst 内置 seed prop）。
- **交付前渲关键帧自检**：start/mid/end 三帧拼图检查（`node remotion-components/scripts/stills.mjs --entry src/index.ts --comp <Id> 0 <中段> <结尾>`），自己先看再交，首检不交给用户。

## 来源与延伸

本文是浓缩版。配方卡全文（124 张镜头卡，含参数表与调节手感）、判例式审美准则、拍点方法论在本仓库 `recipes/`（搬运自 video-shotcraft，Apache-2.0），按需查阅：
- 某类镜头怎么排：`recipes/shotcraft/shots/<分类>/` 查卡
- 交付前自检：`recipes/shotcraft/aesthetic-rules.md` 逐条过
- 配乐视频分镜前：`recipes/shotcraft/music-beat-sync.md`

其他来源（方法论已吸收，原文未搬运）：opus-video-prompts 的六段式提示词与禁用清单（无 LICENSE）、motion-skills 技能包（MIT，外部子仓库）、remocn 组件库（MIT，Confetti/Karaoke/BarChart 提炼自它）。
