// 批量渲染预览帧，用来快速检查画面布局（比开 Studio 拖进度条快）
// 用法：node stills.mjs --entry src/index.ts --comp Main [--scale 0.5] [--out out/stills] 120 450 900
// 依赖：@remotion/bundler、@remotion/renderer（版本与 remotion 保持一致）
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const args = process.argv.slice(2);
const opts = {};
const frames = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) opts[args[i].slice(2)] = args[++i];
  else frames.push(Number(args[i]));
}
const entry = path.resolve(opts.entry ?? "src/index.ts");
const id = opts.comp;
const outDir = path.resolve(opts.out ?? "out/stills");
const scale = Number(opts.scale ?? 0.5);
if (!id || frames.length === 0) {
  console.error("用法：node stills.mjs --entry src/index.ts --comp <合成ID> 帧号 [帧号...]");
  process.exit(1);
}

const serveUrl = await bundle({ entryPoint: entry });
const composition = await selectComposition({ serveUrl, id });
fs.mkdirSync(outDir, { recursive: true });
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(5, "0")}.jpg`);
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 80, scale });
  console.log("✓", output);
}
