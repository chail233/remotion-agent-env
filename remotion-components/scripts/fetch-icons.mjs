#!/usr/bin/env node
// fetch-icons.mjs — 从 Iconify API 拉取开源图标 SVG 到 public/icons/，并把每个图标集的许可登记进 licenses.json。
// 纯 Node（18+，内置 fetch），无第三方依赖。生成的素材按需再生成，不进 git（.gitignore 已排除 public/icons）。
//
// 用法：
//   node remotion-components/scripts/fetch-icons.mjs --icons lucide:rocket lucide:cpu tabler:brand-react
//   node remotion-components/scripts/fetch-icons.mjs --out public --icons mdi:home --force   # 覆盖已存在
//
// 图标选型：https://icon-sets.iconify.design 按集合浏览（Lucide/Tabler/Material…多为 ISC/MIT/Apache-2.0）。
// 渲染端配套组件：remotion-components/media/01 Icon.tsx（CSS mask 单色上色）。

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const API = "https://api.iconify.design";

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const has = (name) => args.includes(`--${name}`);

const outDir = join(flag("out", "./public"), "icons");
const icons = args
  .slice(args.indexOf("--icons") + 1)
  .filter((a) => /^[a-z0-9][a-z0-9-]*:[a-z0-9-]+$/i.test(a));
const force = has("force");

if (icons.length === 0) {
  console.error('用法: node fetch-icons.mjs --icons <prefix:name> [<prefix:name> ...] [--out public] [--force]');
  console.error('示例: node fetch-icons.mjs --icons lucide:rocket lucide:cpu tabler:brand-react');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

// 既有清单存在则合并，多次调用可累积
const manifestPath = join(outDir, "licenses.json");
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : { source: "https://api.iconify.design", icons: {} };

const prefixes = [...new Set(icons.map((i) => i.split(":")[0]))];

// 拉取各图标集的许可信息
const licenses = {};
await Promise.all(
  prefixes.map(async (p) => {
    const res = await fetch(`${API}/collections?prefixes=${p}`);
    if (!res.ok) throw new Error(`图标集 ${p} 信息获取失败 (HTTP ${res.status})`);
    const data = (await res.json())[p];
    if (!data) throw new Error(`图标集 ${p} 不存在，去 https://icon-sets.iconify.design 核对前缀`);
    licenses[p] = {
      name: data.name ?? p,
      license: data.license?.spdx ?? data.license?.title ?? "unknown",
      licenseUrl: data.license?.url ?? null,
    };
  })
);

// 逐个下载 SVG（已存在且未 --force 则跳过，仅补登记）
let downloaded = 0;
for (const full of icons) {
  const [prefix, name] = full.split(":");
  const file = `${prefix}-${name}.svg`;
  const dest = join(outDir, file);
  if (!existsSync(dest) || force) {
    const res = await fetch(`${API}/${prefix}/${name}.svg`);
    if (!res.ok) throw new Error(`图标 ${full} 下载失败 (HTTP ${res.status})`);
    const svg = await res.text();
    if (!svg.includes("<svg")) throw new Error(`图标 ${full} 返回内容不是 SVG，检查名称拼写`);
    writeFileSync(dest, svg, "utf8");
    downloaded += 1;
  }
  manifest.icons[full] = { file, collection: prefix, license: licenses[prefix].license, fetchedAt: new Date().toISOString().slice(0, 10) };
}

manifest.collections = { ...(manifest.collections ?? {}), ...licenses };
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

console.log(`完成：新下载 ${downloaded} 个，共 ${icons.length} 个 → ${outDir}`);
console.log(`许可登记 → ${manifestPath}`);
for (const [p, l] of Object.entries(licenses)) console.log(`  ${p}: ${l.name} — ${l.license}`);
