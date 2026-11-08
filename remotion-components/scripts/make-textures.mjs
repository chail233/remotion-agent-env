#!/usr/bin/env node
// make-textures.mjs — 程序化生成背景/装饰纹理 SVG 到 public/textures/，与程序化音效合成同一哲学：
// 纯代码合成、seed 确定性（同参数永远同产物）、零第三方依赖、无版权素材。不进 git，按需再生成。
//
// 用法：
//   node remotion-components/scripts/make-textures.mjs                          # 全部种类，默认深色调色板
//   node remotion-components/scripts/make-textures.mjs --kinds mesh,stars --seed 42 \
//     --palette "#07080C,#FFB35C,#6FA8FF" --prefix cinema- --out public/textures
//
// 渲染端用法见 remotion-components/media/AGENTS.md（<Img>、backgroundImage 或 03 Texture.tsx 铺底）。

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};

const outDir = flag("out", "./public/textures");
const seed = Number(flag("seed", 7));
const W = Number(flag("w", 1920));
const H = Number(flag("h", 1080));
const palette = flag("palette", "#07080C,#0C0F16,#F3EFE7,#FFB35C,#6FA8FF,#B49BFF").split(",").map((s) => s.trim());
const prefix = flag("prefix", "");
const allKinds = ["mesh", "halftone", "contour", "stripes", "stars", "grid", "noise"];
const kinds = (flag("kinds", allKinds.join(",")) || "").split(",").map((k) => k.trim()).filter(Boolean);

if (!kinds.every((k) => allKinds.includes(k))) {
  console.error(`未知种类。可选：${allKinds.join(", ")}`);
  process.exit(1);
}

// mulberry32：确定性 PRNG，同 seed 同序列
const rng = (() => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const between = (lo, hi) => lo + rng() * (hi - lo);

const svgHead = (defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n<defs>${defs}</defs>\n`;

const hexA = (hex, a) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// —— mesh：多团模糊色斑交融的 mesh gradient（全景底图，直接当背景）——
const mesh = () => {
  const blobs = 12 + Math.floor(rng() * 5);
  const defs = `<filter id="blur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${Math.round(W * 0.055)}"/></filter>\n`;
  let body = `<rect width="${W}" height="${H}" fill="${palette[0]}"/>\n`;
  body += `<g filter="url(#blur)">\n`;
  for (let i = 0; i < blobs; i++) {
    const cx = W * (0.12 + 0.76 * rng());
    const cy = H * (0.12 + 0.76 * rng());
    const r = Math.round(Math.min(W, H) * between(0.22, 0.42));
    const c = pick(palette.slice(1));
    body += `<circle cx="${Math.round(cx)}" cy="${Math.round(cy)}" r="${r}" fill="${hexA(c, between(0.16, 0.4))}"/>\n`;
  }
  body += `</g>\n`;
  return svgHead(defs) + body + `</svg>\n`;
};

// —— halftone：半径随平滑场起伏的圆点阵（波纹质感，适合盖在深底上）——
const halftone = () => {
  const s = 30;
  const p1 = between(0, Math.PI * 2);
  const p2 = between(0, Math.PI * 2);
  const c = palette[2] ?? "#F3EFE7";
  let body = `<rect width="${W}" height="${H}" fill="${palette[0]}"/>\n`;
  for (let y = s / 2; y < H; y += s) {
    for (let x = s / 2; x < W; x += s) {
      const t = Math.sin((x / W) * Math.PI * 3 + p1) * Math.cos((y / H) * Math.PI * 3 + p2);
      const r = ((t + 1) / 2) * (s * 0.38);
      if (r < 0.4) continue;
      body += `<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}" fill="${hexA(c, 0.16 + 0.5 * ((t + 1) / 2))}"/>\n`;
    }
  }
  return svgHead() + body + `</svg>\n`;
};

// —— contour：同心起伏的等高线（科技感装饰，低透明度叠底）——
const contour = () => {
  const levels = 9 + Math.floor(rng() * 5);
  const c = palette[3] ?? palette[palette.length - 1];
  const cx = W * between(0.35, 0.65);
  const cy = H * between(0.35, 0.65);
  const p1 = between(0, Math.PI * 2);
  const p2 = between(0, Math.PI * 2);
  const base = Math.min(W, H) * 0.06;
  const gap = Math.min(W, H) * 0.055;
  let body = `<rect width="${W}" height="${H}" fill="${palette[0]}"/>\n`;
  for (let l = 0; l < levels; l++) {
    const pts = [];
    for (let a = 0; a <= 128; a++) {
      const th = (a / 128) * Math.PI * 2;
      const wob = 1 + 0.2 * Math.sin(3 * th + p1) + 0.13 * Math.sin(5 * th + p2) + 0.07 * Math.sin(8 * th + l * 0.7);
      const r = (base + l * gap) * wob;
      pts.push(`${(cx + Math.cos(th) * r).toFixed(1)},${(cy + Math.sin(th) * r).toFixed(1)}`);
    }
    body += `<polyline points="${pts.join(" ")}" fill="none" stroke="${hexA(c, 0.42 * (1 - l / levels) + 0.06)}" stroke-width="1.2"/>\n`;
  }
  return svgHead() + body + `</svg>\n`;
};

// —— stripes：斜向渐隐条纹（速度感/秩序感装饰）——
const stripes = () => {
  const angle = pick([30, 45, 60]);
  const c = palette[3] ?? palette[palette.length - 1];
  const gap = between(26, 44);
  const defs = `<pattern id="st" width="${gap}" height="${gap}" patternTransform="rotate(${angle})" patternUnits="userSpaceOnUse">
  <rect width="${gap * 0.42}" height="${gap}" fill="${hexA(c, 0.1)}"/>
</pattern>\n`;
  return svgHead(defs) + `<rect width="${W}" height="${H}" fill="${palette[0]}"/>\n<rect width="${W}" height="${H}" fill="url(#st)"/>\n</svg>\n`;
};

// —— stars：随机星点/尘埃场（全景，可当夜景底）——
const stars = () => {
  const n = 150 + Math.floor(rng() * 80);
  const defs = `<radialGradient id="soft"><stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/><stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>\n`;
  let body = `<rect width="${W}" height="${H}" fill="${palette[0]}"/>\n`;
  for (let i = 0; i < n; i++) {
    const x = between(0, W);
    const y = between(0, H);
    const r = between(0.5, 2.1);
    const c = pick(palette.slice(1));
    if (rng() < 0.08) {
      const gr = r * between(4, 7);
      body += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${gr.toFixed(1)}" fill="url(#soft)" opacity="${between(0.1, 0.3).toFixed(2)}"/>\n`;
    }
    body += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${hexA(c, between(0.2, 0.85).toFixed(2))}"/>\n`;
  }
  return svgHead(defs) + body + `</svg>\n`;
};

// —— grid：细方格 + 加粗主线（蓝图感，透明底）——
const grid = () => {
  const s = 48;
  const c = palette[2] ?? "#F3EFE7";
  let body = "";
  for (let x = s; x < W; x += s) body += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${hexA(c, x % (s * 4) === 0 ? 0.14 : 0.06)}" stroke-width="1"/>\n`;
  for (let y = s; y < H; y += s) body += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${hexA(c, y % (s * 4) === 0 ? 0.14 : 0.06)}" stroke-width="1"/>\n`;
  return svgHead() + body + `</svg>\n`;
};

// —— noise：无缝感胶片颗粒平铺 tile（220×220，CSS background-size 平铺）——
const noise = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.92" numOctaves="2" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.6 0.6 0.6 0 0"/></filter>
<rect width="220" height="220" filter="url(#n)"/>
</svg>\n`;
  return svg;
};

mkdirSync(outDir, { recursive: true });
const gens = { mesh, halftone, contour, stripes, stars, grid, noise };
const notes = { noise: "220×220 tile，CSS background-size 平铺；其余为全景图，cover 铺满" };

for (const k of kinds) {
  const file = `${prefix}${k}.svg`;
  writeFileSync(join(outDir, file), gens[k](), "utf8");
  console.log(`生成 ${file}（seed=${seed}）${notes[k] ? "— " + notes[k] : ""}`);
}

writeFileSync(
  join(outDir, "manifest.json"),
  JSON.stringify({ generator: "remotion-components/scripts/make-textures.mjs", seed, palette, width: W, height: H, generated: kinds }, null, 2) + "\n",
  "utf8"
);
console.log(`完成 → ${outDir}（manifest.json 记录了 seed 与调色板，改 --seed 可再生成变体）`);
