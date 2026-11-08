#!/usr/bin/env node
// fetch-sfx.mjs — 从 Lots of Sounds 免 key 样本 API 搜索并下载 CC0 音效到 public/sfx/*.mp3，许可登记进 licenses.json。
// 纯 Node（18+，内置 fetch）。来源：https://github.com/lotsofsounds/free-sound-effects-api
// （样本集 CC0、无需 API key；全目录检索/下载需付费 key，本脚本只用免 key 端点）。
// 用法：
//   node remotion-components/scripts/fetch-sfx.mjs --q "notification ding" --name ding
//   node remotion-components/scripts/fetch-sfx.mjs --q "whoosh transition" --list      # 只看搜索结果不下载
//   node remotion-components/scripts/fetch-sfx.mjs --id fs-11587 --name microwave-ding
// 参数：
//   --q        搜索词（与 --id 二选一）
//   --tags     逗号分隔标签，可与 --q 同用
//   --id       直接指定样本 id（如 fs-11587）
//   --index    取搜索结果的第几个（默认 0；先 --list 挑好再下）
//   --name     输出文件名（不带扩展名；默认用样本 id）
//   --out      输出根目录（文件落 <out>/sfx/），默认 ./public
//   --list     只打印搜索结果，不下载
//   --force    覆盖已存在文件
// 消费端：下载的是 mp3，Sfx.tsx 只认 .wav——mp3 用 <Audio src={staticFile("sfx/x.mp3")}/> 播
// （长于 2s 的样本也建议直接 <Audio>，Sfx.tsx 的 120 帧窗口会截断更长的音频）。

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const API = "https://api.lotsofsounds.com/api/v1/sounds/sample";
// 文件 CDN（files.lotsofsounds.com，CloudFront）在部分网络下 TLS 握手很慢，默认重试几次
const fetchRetry = async (url, tries = 3) => {
  let lastErr;
  for (let k = 0; k < tries; k++) {
    try {
      return await fetch(url, { signal: AbortSignal.timeout(30000) });
    } catch (e) {
      lastErr = e;
      console.log(`  (第 ${k + 1} 次请求失败：${e.cause?.code ?? e.name}，重试)`);
    }
  }
  throw lastErr;
};

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const has = (name) => args.includes(`--${name}`);

const OUT = flag("out", "./public");
const LIST = has("list");
const FORCE = has("force");
const q = flag("q", null);
const tags = flag("tags", null);
const id = flag("id", null);
const index = Number(flag("index", 0));
const name = flag("name", null);

if (!q && !tags && !id) {
  console.error("用法: node fetch-sfx.mjs --q <搜索词> [--tags a,b] [--index 0] [--name <slug>] [--out public] [--list] [--force] ｜ 或 --id fs-11587 --name <slug>");
  process.exit(1);
}

const sfxDir = join(OUT, "sfx");
mkdirSync(sfxDir, { recursive: true });

// 既有清单存在则合并，多次调用可累积
const manifestPath = join(sfxDir, "licenses.json");
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : { source: "https://api.lotsofsounds.com/api/v1/sounds/sample", license: "CC0-1.0", sounds: {} };

// 搜索（--id 模式跳过）
let pick = id ? { id, name: name ?? id } : null;
if (!pick) {
  const params = new URLSearchParams({ limit: "12" });
  if (q) params.set("q", q);
  if (tags) params.set("tags", tags);
  const res = await fetchRetry(`${API}?${params}`);
  if (!res.ok) throw new Error(`搜索失败 (HTTP ${res.status})`);
  const { data } = await res.json();
  if (!data?.length) {
    console.error("没有匹配结果，换个搜索词试试");
    process.exit(1);
  }
  for (const [i, s] of data.entries()) {
    console.log(`[${i}] ${s.id}  ${(s.duration ?? 0).toFixed(1)}s  ${s.name}  —  ${(s.description ?? "").slice(0, 60)}  [${(s.tags ?? []).join(",")}]`);
  }
  pick = data[index];
  if (!pick) {
    console.error(`--index ${index} 超出范围（0..${data.length - 1}）`);
    process.exit(1);
  }
}

const file = `${name ?? pick.id}.mp3`;
const dest = join(sfxDir, file);

if (LIST) {
  console.log(`(--list 模式，未下载；选中 [${index}] ${pick.id} ${pick.name}，加 --name <slug> 落盘)`);
  process.exit(0);
}

if (existsSync(dest) && !FORCE) {
  console.log(`跳过 ${dest}（已存在，--force 覆盖）`);
  process.exit(0);
}

// 拿临时流地址再下载音频
const streamRes = await fetchRetry(`${API}/${pick.id}/stream`);
if (!streamRes.ok) throw new Error(`stream 信息获取失败 (HTTP ${streamRes.status})`);
const { data: streamInfo } = await streamRes.json();
if (!streamInfo?.stream_url) throw new Error("响应里没有 stream_url");

const audioRes = await fetchRetry(streamInfo.stream_url);
if (!audioRes.ok) throw new Error(`音频下载失败 (HTTP ${audioRes.status})`);
const audio = Buffer.from(await audioRes.arrayBuffer());
if (audio.length < 1000) throw new Error(`音频过小（${audio.length}B），可能下载不完整`);
writeFileSync(dest, audio);

manifest.sounds[file] = {
  id: pick.id,
  title: pick.name,
  license: "CC0-1.0",
  via: "https://www.lotsofsounds.com",
  fetchedAt: new Date().toISOString().slice(0, 10),
};
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

console.log(`✓ sfx/${file}（${(audio.length / 1024).toFixed(0)} KB，${pick.name}）`);
console.log(`许可登记 → ${manifestPath}（CC0，无需署名）`);
