#!/usr/bin/env node
// make-jsfx.mjs — 用 jsfxr（sfxr 移植，参数化 8-bit 合成）生成复古游戏风音效到 public/sfx/*.wav。
// 依赖 jsfxr（package.json dependencies）。方形/锯齿/正弦波形参数固定时输出可复现；
// 噪声波形（wave_type: 3）内部用 Math.random，重跑结果会略变。
// 用法：
//   node remotion-components/scripts/make-jsfx.mjs                                   # 生成全部预设
//   node remotion-components/scripts/make-jsfx.mjs --preset coin,laser --out public  # 指定预设
//   node remotion-components/scripts/make-jsfx.mjs --b58 "#mLfdhR7i7BgpfdFE3drNl3TVxlr3Q" --name zap   # sfxr 分享串
// 参数：
//   --out      输出根目录（文件落 <out>/sfx/），默认 ./public
//   --preset   逗号分隔预设名（coin/laser/explosion/powerup/hurt/jump/blip/zap），默认全部
//   --b58      sfxr 分享串（# 开头可省略，网上 sfxr 分享链接里的参数串），配 --name 使用
//   --name     b58 模式的输出文件名（默认 zap）
//   --gain     音量系数（峰值归一到 0.85 × gain），默认 1
//   --force    覆盖已存在文件
// 参数字段是经典 sfxr 命名（p_env_attack、p_base_freq、wave_type 等），调参参考 https://github.com/grumdrum/jsfxr 与 sfxr 通用文档。
// 消费端：<Sfx name="coin"/>（读 public/sfx/coin.wav），见 remotion-components/audio/AGENTS.md。

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { jsfxr } from "jsfxr";

const SR = 44100;

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const has = (name) => args.includes(`--${name}`);

const OUT = flag("out", "./public");
const GAIN = Number(flag("gain", 1));
const FORCE = has("force");

// RIFF 16-bit 立体声 WAV 写出（与 make-audio.mjs 同一格式约定）
const writeWav = (file, mono) => {
  const n = mono.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, mono[i]));
    const s = Math.round(v * 32767);
    buf.writeInt16LE(s, 44 + i * 4);
    buf.writeInt16LE(s, 46 + i * 4);
  }
  writeFileSync(file, buf);
};

// 经典 sfxr 参数（sfxr.js 移植版命名）；内置预设，可整体替换或用 --b58 引外部参数串。
// 注意 p_env_* 不是秒数：时长 = x²×100000 采样 ≈ (x·0.441)² 秒——0.3≈0.17s、0.5≈0.57s、0.7≈1.1s。
const PRESETS = {
  // 双音上行「叮咚」——拾取、加分
  coin: { wave_type: 0, p_env_attack: 0, p_env_sustain: 0.12, p_env_decay: 0.35, p_env_punch: 0.3, p_base_freq: 0.58, p_freq_ramp: 0.2, p_arp_speed: 0.1, p_arp_mod: 0.3 },
  // 高频下扫——发射、划过
  laser: { wave_type: 1, p_env_attack: 0, p_env_sustain: 0.18, p_env_decay: 0.3, p_env_punch: 0.2, p_base_freq: 0.7, p_freq_ramp: -0.55 },
  // 低频噪声爆——爆炸、撞击
  explosion: { wave_type: 3, p_env_sustain: 0.25, p_env_decay: 0.55, p_env_punch: 0.4, p_base_freq: 0.1, p_freq_ramp: -0.1, p_lpf_freq: 0.4, p_lpf_ramp: 0.4 },
  // 长上行——升级、充能
  powerup: { wave_type: 0, p_env_sustain: 0.25, p_env_decay: 0.5, p_base_freq: 0.35, p_freq_ramp: 0.45, p_freq_dramp: 0.2, p_duty: 0.4 },
  // 短下扫——受击、报错
  hurt: { wave_type: 1, p_env_sustain: 0.1, p_env_decay: 0.3, p_env_punch: 0.2, p_base_freq: 0.5, p_freq_ramp: -0.4 },
  // 快速上滑——跳跃、出现
  jump: { wave_type: 0, p_env_sustain: 0.15, p_env_decay: 0.3, p_base_freq: 0.3, p_freq_ramp: 0.4, p_duty: 0.3 },
  // 短高频——按钮、选中
  blip: { wave_type: 0, p_env_sustain: 0.12, p_env_decay: 0.15, p_base_freq: 0.75, p_duty: 0.6 },
  // 正弦下扫加相位——传送、消散
  zap: { wave_type: 2, p_env_sustain: 0.12, p_env_decay: 0.45, p_base_freq: 0.8, p_freq_ramp: -0.7, p_pha_offset: 0.3, p_pha_ramp: -0.3 },
};

// 从 sfxr 参数生成 -1..1 单声道 Float32
const generate = (synthdef) => {
  const base = new jsfxr.Params();
  delete base.oldParams;
  const p = { ...base, ...synthdef, sound_vol: 0.5, sample_rate: SR, sample_size: 16 };
  const { normalized } = new jsfxr.SoundEffect(p).getRawBuffer();
  return Float32Array.from(normalized);
};

// 峰值归一（与 make-audio.mjs 一致的手感：0.85 × gain）
const normalize = (arr, peak) => {
  let m = 0;
  for (const v of arr) m = Math.max(m, Math.abs(v));
  if (m > 0) for (let i = 0; i < arr.length; i++) arr[i] = (arr[i] / m) * peak;
  return arr;
};

const jobs = [];
const wanted = flag("preset", null);
const b58 = flag("b58", null);
if (b58) {
  jobs.push([flag("name", "zap"), b58]);
} else {
  const names = wanted ? wanted.split(",").map((s) => s.trim()) : Object.keys(PRESETS);
  for (const n of names) {
    if (!PRESETS[n]) {
      console.error(`未知预设 ${n}，可选：${Object.keys(PRESETS).join(" / ")}`);
      process.exit(1);
    }
    jobs.push([n, PRESETS[n]]);
  }
}
if (jobs.length === 0) {
  console.error("用法: node make-jsfx.mjs [--preset coin,laser] [--b58 <sfxr分享串> --name zap] [--out public] [--gain 1] [--force]");
  process.exit(1);
}

mkdirSync(join(OUT, "sfx"), { recursive: true });
for (const [name, synthdef] of jobs) {
  const dest = join(OUT, "sfx", `${name}.wav`);
  if (existsSync(dest) && !FORCE) {
    console.log(`跳过 ${dest}（已存在，--force 覆盖）`);
    continue;
  }
  const mono = normalize(generate(synthdef), 0.85 * GAIN);
  writeWav(dest, mono);
  console.log(`✓ sfx/${name}.wav（${(mono.length / SR).toFixed(2)}s）`);
}
