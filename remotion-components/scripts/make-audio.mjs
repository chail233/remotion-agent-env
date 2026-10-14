// 合成背景音乐和音效（纯代码生成，无版权问题）
// 用法：
//   node make-audio.mjs --out public --duration 384 --ending 336
//   node make-audio.mjs --out public --sfx-only
// 参数：
//   --out       输出目录（生成 <out>/bgm.wav 和 <out>/sfx/*.wav），默认 ./public
//   --duration  背景音乐总长（秒），不传则只生成音效
//   --ending    抒情尾声开始的秒数，默认不要尾声（全程轻快 lo-fi，最后自然收尾）
//   --drums-in  鼓点进入的秒数，默认 13（之前只有钢琴和 pad）
//   --sfx-only  只生成音效
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
const epiano = (f, hold) => (t) => {
  const env = Math.min(1, t / 0.008) * Math.exp(-t * 1.6) * (t > hold ? Math.exp(-(t - hold) * 8) : 1);
  const trem = 1 + 0.06 * Math.sin(TAU * 4.5 * t);
  return (
    env *
    trem *
    (Math.sin(TAU * f * t) + 0.32 * Math.sin(TAU * 2 * f * t + 0.3) + 0.1 * Math.sin(TAU * 3 * f * t) + 0.05 * Math.sin(TAU * 4.01 * f * t))
  );
};
const bell = (f, decay = 5) => (t) =>
  Math.min(1, t / 0.003) * Math.exp(-t * decay) * (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * 2.76 * f * t) * Math.exp(-t * 6));
const bass = (f, hold) => (t) => {
  const env = Math.min(1, t / 0.01) * Math.exp(-t * 1.2) * (t > hold ? Math.exp(-(t - hold) * 10) : 1);
  return env * (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * 2 * f * t));
};
const pad = (f, dur) => (t) => {
  const env = Math.min(1, t / 1.2) * Math.min(1, Math.max(0, (dur - t) / 1.2));
  let v = 0;
  for (const d of [-0.12, 0, 0.13]) v += Math.sin(TAU * f * Math.pow(2, d / 12) * t) + 0.2 * Math.sin(TAU * 2 * f * Math.pow(2, d / 12) * t);
  return (env * v) / 3;
};
const kick = (t) => {
  const f = 45 + 75 * Math.exp(-t * 28);
  const ph = TAU * (45 * t + (75 / 28) * (1 - Math.exp(-t * 28)));
  return Math.sin(ph) * Math.exp(-t * 9) * (f > 0 ? 1 : 0);
};
const makeSnare = () => {
  let lp = 0;
  return (t) => {
    lp += (noise() - lp) * 0.35;
    return lp * Math.exp(-t * 22) * 0.9 + Math.sin(TAU * 185 * t) * Math.exp(-t * 30) * 0.5;
  };
};
const makeHat = () => {
  let prev = 0;
  return (t) => {
    const n = noise();
    const hp = n - prev;
    prev = n;
    return hp * Math.exp(-t * 70);
  };
};

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

// ---------- 背景音乐 ----------
const makeBgm = (total, endingArg, drumsIn) => {
const hasEnding = endingArg !== undefined;
const endingStart = hasEnding ? Number(endingArg) : total;
console.log(`背景音乐总长 ${total.toFixed(1)}s` + (hasEnding ? `，尾声从 ${endingStart.toFixed(1)}s 开始` : "，无尾声"));
const len = Math.ceil((total + 1) * SR);
const keys = new Float32Array(len);
const low = new Float32Array(len);
const drums = new Float32Array(len);

const CH = {
  Fmaj7: { n: [53, 57, 60, 64], b: 41 },
  G: { n: [55, 59, 62, 65], b: 43 },
  Em7: { n: [52, 55, 59, 62], b: 40 },
  Am7: { n: [57, 60, 64, 67], b: 45 },
  Dm7: { n: [50, 53, 57, 60], b: 38 },
  Cmaj7: { n: [55, 59, 60, 64], b: 36 },
  Cadd9: { n: [55, 60, 62, 64], b: 36 },
};

// 主段：92 BPM，王道进行
const mainProg = ["Fmaj7", "G", "Em7", "Am7", "Dm7", "Em7", "Fmaj7", "G"];
const BPM = 92;
const beat = 60 / BPM;
const bar = beat * 4;
const mainEnd = hasEnding ? endingStart - 0.5 : total;
const snare = makeSnare();
const hat = makeHat();
let b = 0;
for (let t0 = 0; t0 < mainEnd; t0 += bar, b++) {
  const c = CH[mainProg[b % mainProg.length]];
  const fadeOut = Math.min(1, Math.max(0, (mainEnd - t0) / (bar * 1.5)));
  const g = 0.9 * fadeOut;
  // 和弦
  c.n.forEach((m, k) => {
    add(keys, t0 + k * 0.012, bar, epiano(mtof(m), beat * 1.6), 0.17 * g);
    add(keys, t0 + beat * 2.5 + k * 0.01, bar * 0.6, epiano(mtof(m), beat * 1.2), 0.1 * g);
  });
  // 贝斯
  add(low, t0, beat * 2.4, bass(mtof(c.b), beat * 2), 0.42 * g);
  add(low, t0 + beat * 2.5, beat * 1.4, bass(mtof(c.b + (b % 2 ? 7 : 12)), beat * 1.1), 0.3 * g);
  // 琶音
  const arp = [c.n[0] + 12, c.n[1] + 12, c.n[2] + 12, c.n[3] + 12, c.n[2] + 12, c.n[1] + 12, c.n[3] + 12, c.n[2] + 24];
  arp.forEach((m, k) => {
    const swing = k % 2 ? beat * 0.08 : 0;
    add(keys, t0 + k * (beat / 2) + swing, 0.8, bell(mtof(m), 6), (t0 < drumsIn ? 0.05 : 0.065) * g);
  });
  // 鼓
  if (t0 >= drumsIn - 0.01) {
    add(drums, t0, 0.5, kick, 0.55 * g);
    add(drums, t0 + beat * 2.5, 0.5, kick, 0.4 * g);
    add(drums, t0 + beat, 0.3, snare, 0.22 * g);
    add(drums, t0 + beat * 3, 0.3, snare, 0.22 * g);
    for (let k = 0; k < 8; k++) {
      const swing = k % 2 ? beat * 0.08 : 0;
      add(drums, t0 + k * (beat / 2) + swing, 0.08, hat, (k % 2 ? 0.07 : 0.1) * g);
    }
  } else if (t0 + bar > drumsIn - 0.01 && t0 < drumsIn) {
    // 进鼓前的小过门
    [0, 0.25, 0.5, 0.75].forEach((x, k) => add(drums, t0 + beat * (3 + x), 0.2, snare, (0.08 + k * 0.04) * g));
  }
}
// 开场垫底的 pad
for (let t0 = 0, k = 0; t0 < drumsIn; t0 += bar, k++) {
  const c = CH[mainProg[k % mainProg.length]];
  c.n.forEach((m) => add(keys, t0, bar + 1.2, pad(mtof(m), bar + 1.2), 0.05));
}

if (hasEnding) {
// 尾声：70 BPM，抒情钢琴 + pad
const EB = 60 / 70;
const ebar = EB * 4;
const endProg = ["Fmaj7", "Em7", "Dm7", "Cmaj7", "Fmaj7", "G", "Em7", "Am7", "Dm7", "Em7", "Fmaj7", "G"];
const endLen = total - endingStart;
const finalAt = endingStart + Math.max(ebar * 8, Math.floor((endLen - 8) / ebar) * ebar);
let eb = 0;
for (let t0 = endingStart; t0 < finalAt - 0.01; t0 += ebar, eb++) {
  const c = CH[endProg[eb % endProg.length]];
  const fi = Math.min(1, (t0 - endingStart + ebar) / (ebar * 1.5));
  c.n.forEach((m, k) => {
    add(keys, t0, ebar + 1.5, pad(mtof(m), ebar + 1.5), 0.06 * fi);
    add(keys, t0 + k * 0.05, ebar, epiano(mtof(m), EB * 2.5), 0.12 * fi);
  });
  add(low, t0, ebar, bass(mtof(c.b), EB * 3), 0.3 * fi);
  // 慢琶音
  const arp = [c.n[0] + 12, c.n[2] + 12, c.n[3] + 12, c.n[1] + 24, c.n[3] + 12, c.n[2] + 12];
  arp.forEach((m, k) => add(keys, t0 + EB * 0.5 + k * (EB * 0.58), 1.6, bell(mtof(m), 3.2), 0.06 * fi));
}
// 终止和弦
CH.Cadd9.n.forEach((m, k) => {
  add(keys, finalAt + k * 0.07, 8, epiano(mtof(m), 6), 0.15);
  add(keys, finalAt, 8, pad(mtof(m), 8), 0.07);
  add(keys, finalAt + 0.4 + k * 0.18, 4, bell(mtof(m + 24), 2), 0.05);
});
add(low, finalAt, 8, bass(mtof(36), 6), 0.32);
}

const wetKeys = reverb(keys, 0.35);
const L = new Float32Array(len);
const R = new Float32Array(len);
for (let i = 0; i < len; i++) {
  const v = wetKeys[i] + low[i] + drums[i];
  L[i] = v + keys[i] * 0.05;
  R[i] = v - keys[i] * 0.05;
}
normalize([L, R], 0.85);
writeWav(path.join(OUT, "bgm.wav"), L, R);
console.log(`✓ ${path.join(OUT, "bgm.wav")}`);
};

if (!args.includes("--sfx-only") && arg("duration") !== undefined) {
  makeBgm(Number(arg("duration")), arg("ending"), Number(arg("drums-in", 13)));
}

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
