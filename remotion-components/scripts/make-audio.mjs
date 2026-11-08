#!/usr/bin/env node
// make-audio.mjs — 程序化合成 12 种基础音效到 public/sfx/*.wav（纯代码生成，无版权问题）。
// 不再内置 BGM 生成：背景音乐从外部来源放 public/bgm.wav（AI 生成 / CC0 音乐包 / 自备），
// 播放端用 remotion-components/audio/Bgm.tsx（淡入淡出包络，锚定合成总长）。
// 用法：
//   node make-audio.mjs --out public
// 参数：
//   --out   输出目录（生成 <out>/sfx/*.wav，总是覆盖重生成），默认 ./public
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const OUT = path.resolve(arg("out", "public"));
const SR = 44100;

// ---------- 工具 ----------
const writeWav = (file, left, right = left) => {
  const n = left.length;
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
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    buf.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(r * 32767), 46 + i * 4);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
};

let seed = 12345;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rnd() * 2 - 1;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const TAU = Math.PI * 2;

const normalize = (arrs, peak = 0.89) => {
  let m = 0;
  for (const a of arrs) for (const v of a) m = Math.max(m, Math.abs(v));
  if (m === 0) return;
  const k = peak / m;
  for (const a of arrs) for (let i = 0; i < a.length; i++) a[i] *= k;
};

// 在 buffer 的 t 秒处叠加一个由 fn(localT) 生成、长 dur 秒的声音
const add = (buf, t, dur, fn, gain = 1) => {
  const s = Math.floor(t * SR);
  const n = Math.floor(dur * SR);
  for (let i = 0; i < n; i++) {
    const j = s + i;
    if (j < 0 || j >= buf.length) continue;
    buf[j] += fn(i / SR) * gain;
  }
};

// ---------- 乐器 ----------
const bell = (f, decay = 5) => (t) =>
  Math.min(1, t / 0.003) * Math.exp(-t * decay) * (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * 2.76 * f * t) * Math.exp(-t * 6));

// 简易混响：几条反馈延迟
const reverb = (buf, mix = 0.22) => {
  const delays = [0.0297, 0.0371, 0.0411, 0.0437].map((d) => Math.floor(d * SR * 3.1));
  const out = new Float32Array(buf.length);
  const lines = delays.map((d) => ({ d, b: new Float32Array(d), i: 0 }));
  for (let n = 0; n < buf.length; n++) {
    let wet = 0;
    for (const L of lines) {
      const y = L.b[L.i];
      L.b[L.i] = buf[n] + y * 0.72;
      L.i = (L.i + 1) % L.d;
      wet += y;
    }
    out[n] = buf[n] + (wet / lines.length) * mix;
  }
  return out;
};

// ---------- 音效 ----------
const sfx = (name, dur, build, peak = 0.85) => {
  const buf = new Float32Array(Math.ceil(dur * SR));
  build(buf);
  const wet = reverb(buf, 0.18);
  normalize([wet], peak);
  writeWav(path.join(OUT, `sfx/${name}.wav`), wet);
  console.log(`✓ sfx/${name}.wav`);
};

sfx("pop", 0.3, (buf) => {
  add(buf, 0, 0.25, (t) => {
    const ph = TAU * (320 * t + 4500 * t * t);
    return Math.sin(ph) * Math.exp(-t * 28);
  });
});

sfx("typing", 1.4, (buf) => {
  let t = 0;
  while (t < 1.2) {
    const a = 0.5 + rnd() * 0.5;
    const f = 1800 + rnd() * 1400;
    add(buf, t, 0.03, (x) => (noise() * 0.6 + Math.sin(TAU * f * x) * 0.4) * Math.exp(-x * 260) * a);
    t += 0.06 + rnd() * 0.05;
  }
}, 0.6);

sfx("magic", 1.8, (buf) => {
  [72, 76, 79, 84, 88, 91, 96].forEach((m, k) => add(buf, k * 0.055, 1.4, bell(mtof(m), 4), 0.5));
  add(buf, 0, 1.2, (t) => noise() * Math.sin((Math.PI * t) / 1.2) * 0.08);
});

sfx("sparkle", 1.4, (buf) => {
  const scale = [84, 86, 88, 91, 93, 96, 98];
  for (let k = 0; k < 7; k++) add(buf, k * 0.065 + rnd() * 0.02, 1, bell(mtof(scale[Math.floor(rnd() * scale.length)]), 7), 0.4);
});

sfx("ding", 1.5, (buf) => {
  add(buf, 0, 1.4, bell(mtof(88), 3.5), 0.7);
  add(buf, 0, 1.4, bell(mtof(95), 4.5), 0.25);
});

sfx("whoosh", 0.8, (buf) => {
  let lp = 0;
  add(buf, 0, 0.7, (t) => {
    const cut = 0.02 + 0.25 * Math.sin((Math.PI * t) / 0.7);
    lp += (noise() - lp) * cut;
    return lp * Math.sin((Math.PI * t) / 0.7);
  });
}, 0.7);

sfx("stamp", 0.6, (buf) => {
  add(buf, 0, 0.5, (t) => Math.sin(TAU * (70 * t + 40 * (1 - Math.exp(-t * 30)))) * Math.exp(-t * 12));
  add(buf, 0, 0.08, (t) => noise() * Math.exp(-t * 60) * 0.6);
});

sfx("error", 0.6, (buf) => {
  const sq = (f, t) => (Math.sin(TAU * f * t) > 0 ? 1 : -1);
  [0, 0.17].forEach((s) =>
    add(buf, s, 0.13, (t) => (sq(196, t) + sq(207, t)) * 0.25 * Math.min(1, t / 0.005) * Math.min(1, (0.13 - t) / 0.02)),
  );
}, 0.55);

sfx("love", 1.6, (buf) => {
  [79, 84, 88].forEach((m, k) => add(buf, k * 0.12, 1.3, bell(mtof(m), 3.2), 0.5));
  add(buf, 0.38, 1.1, bell(mtof(96), 4), 0.2);
});

sfx("unlock", 1.4, (buf) => {
  add(buf, 0, 0.03, (t) => noise() * Math.exp(-t * 200));
  add(buf, 0.02, 0.2, (t) => Math.sin(TAU * 2300 * t) * Math.exp(-t * 40) * 0.4);
  add(buf, 0.09, 0.03, (t) => noise() * Math.exp(-t * 200) * 0.8);
  add(buf, 0.2, 1.1, bell(mtof(84), 3), 0.4);
  add(buf, 0.3, 1.0, bell(mtof(91), 3), 0.3);
});

sfx("flip", 0.3, (buf) => {
  let lp = 0;
  add(buf, 0, 0.22, (t) => {
    lp += (noise() - lp) * 0.3;
    return lp * Math.sin((Math.PI * t) / 0.22) ** 2;
  });
}, 0.5);

sfx("shatter", 1.2, (buf) => {
  for (let k = 0; k < 18; k++) {
    const f = 2000 + rnd() * 4000;
    add(buf, rnd() * 0.5, 0.4, (t) => Math.sin(TAU * f * t) * Math.exp(-t * 18), 0.25);
  }
  add(buf, 0, 0.2, (t) => noise() * Math.exp(-t * 25) * 0.4);
}, 0.6);
