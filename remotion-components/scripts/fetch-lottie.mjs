#!/usr/bin/env node
// fetch-lottie.mjs — 下载 Lottie JSON 动画到 public/lottie/，校验格式并把来源/许可登记进 manifest.json。
// 纯 Node（18+，内置 fetch），无第三方依赖。生成的素材按需再生成，不进 git（.gitignore 已排除 public/lottie）。
//
// 用法（一次一个动画，多个就多跑几次，清单会累积）：
//   node remotion-components/scripts/fetch-lottie.mjs --url <lottie-json 的直链> --name pulse-dot --license MIT
//
// 素材来源：https://lottiefiles.com 免费区（逐个动画页上标许可，常见 Lottie Files License / CC0，须逐条登记）、
// 自制（Bodymovin/AE 导出，license 填 proprietary-self）。
// 渲染端配套组件：remotion-components/media/02 LottieAnim.tsx。

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};

const url = flag("url");
const name = flag("name");
const license = flag("license", "UNSET-须补登");
const credit = flag("credit", "");
const outDir = join(flag("out", "./public"), "lottie");

if (!url || !name) {
  console.error("用法: node fetch-lottie.mjs --url <json直链> --name <文件名> [--license SPDX|说明] [--credit 出处] [--out public]");
  console.error('示例: node fetch-lottie.mjs --url https://assets5.lottiefiles.com/packages/lf20_xxx.json --name pulse-dot --license "Lottie Files License"');
  process.exit(1);
}
if (!/^[a-z0-9][a-z0-9-]*$/i.test(name)) {
  console.error(`--name 只允许字母数字连字符（用作文件名）: ${name}`);
  process.exit(1);
}

const res = await fetch(url);
if (!res.ok) throw new Error(`下载失败 (HTTP ${res.status}): ${url}`);
const raw = await res.text();
if (raw.length > 8 * 1024 * 1024) {
  console.warn("警告：文件超过 8MB，Lottie 过大会拖慢渲染，考虑换更简单的动画或用 dotlottie 压缩");
}

let data;
try {
  data = JSON.parse(raw);
} catch {
  throw new Error("内容不是合法 JSON —— 确认 --url 指向 .json 动画数据本身，而不是网页");
}
for (const key of ["v", "fr", "ip", "op", "layers"]) {
  if (!(key in data)) throw new Error(`JSON 缺少 Lottie 必需字段 "${key}" —— 不是 Lottie 动画数据`);
}

mkdirSync(outDir, { recursive: true });
const dest = join(outDir, `${name}.json`);
writeFileSync(dest, JSON.stringify(data), "utf8");

const manifestPath = join(outDir, "manifest.json");
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : { assets: {} };
manifest.assets[name] = {
  file: `${name}.json`,
  source: url,
  license,
  credit,
  fps: data.fr,
  width: data.w,
  height: data.h,
  durationInFrames: Math.round(data.op - data.ip),
  fetchedAt: new Date().toISOString().slice(0, 10),
};
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

console.log(`完成：${name}.json（${data.w}×${data.h} @${data.fr}fps，${Math.round(data.op - data.ip)} 帧）→ ${outDir}`);
console.log(`来源与许可已登记 → ${manifestPath}（license: ${license}）`);
if (license.startsWith("UNSET")) console.warn("注意：license 未登记，正式使用前必须补上");
