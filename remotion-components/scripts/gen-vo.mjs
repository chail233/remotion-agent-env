// scripts/06 gen-vo.mjs — 逐场配音 + 词级时间戳 + 标点感知字幕切分（msedge-tts，免 key）。
//
// 输入：vo/script.json
//   {
//     "voice": "zh-CN-XiaoxiaoNeural", "rate": "+10%", "pitch": "+0Hz", "volume": "+0%",
//     "fps": 30, "captionMaxChars": 26,          // 后两项可选
//     "scenes": [
//       { "id": "s01", "title": "钩子", "text": "……",
//         "lead": 26, "tail": 46, "transition": 20,   // 时间轴参数，可选
//         "beats": { "hitAt": ["关键词", 3.2] } }      // 词级节拍锚点，可选
//     ]
//   }
// 输出：public/vo/<id>.mp3 + public/vo/meta.json
//
// 用法（项目根运行）：
//   node remotion-components/scripts/gen-vo.mjs
//   node remotion-components/scripts/gen-vo.mjs --script vo/script.json --out public/vo
//   node remotion-components/scripts/gen-vo.mjs --voices zh-CN     # 列出可用音色
//
// 只依赖 msedge-tts（package.json 已声明），无需 Python、无需 API key。
// 词边界时间戳来自 Edge Read Aloud API；音频格式固定 24kHz/48kbps 单声道 mp3。
// 时长取「最后一个词的结束时间」：TTS 尾部静音由场景 tail 留白吸收，不把静音算进语速。

import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const ARGV = process.argv.slice(2);

const opt = (name, fallback) => {
  const i = ARGV.indexOf(`--${name}`);
  return i >= 0 && ARGV[i + 1] && !ARGV[i + 1].startsWith("--") ? ARGV[i + 1] : fallback;
};
const fromCwd = (p) => path.resolve(process.cwd(), p);

const DEFAULT_SCRIPT = "vo/script.json";
const DEFAULT_OUT = "public/vo";
const DEFAULT_META = "public/vo/meta.json";
const FORMAT = OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3;

const PUNCT_RE = /[\s，。！？；：、（）()\[\]{}《》“”‘’"'…—·,.!?;:]/;
const PUNCT_G = /[\s，。！？；：、（）()\[\]{}《》“”‘’"'…—·,.!?;:]/g;
const SENTENCE_PUNCT = new Set("。！？；：.!?;:");
const CLAUSE_PUNCT = new Set("，、：,;");

/* ------------------------------ 字幕切分 ------------------------------ */

/** 中文字幕 26 字、英文 42 字符；文本含三成以上汉字即按中文算。 */
const autoMaxChars = (text) => {
  const cjk = (text.match(/[\u3400-\u9fff]/g) || []).length;
  return cjk / Math.max(1, text.length) > 0.3 ? 26 : 42;
};

/**
 * 把整段文本切成字幕条，返回的 [start,end) 覆盖原文（含标点/空格），
 * 这样后续能按字符下标把词时间戳映射回字幕条。
 */
const splitCues = (text, maxChars) => {
  const cues = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const len = i + 1 - start;
    const hard = SENTENCE_PUNCT.has(ch);
    const soft = CLAUSE_PUNCT.has(ch) || ch === " ";
    if (hard || (soft && len >= Math.ceil(maxChars * 0.6)) || len >= maxChars) {
      cues.push({ start, end: i + 1, text: text.slice(start, i + 1).trim() });
      start = i + 1;
    }
  }
  if (start < text.length) {
    cues.push({ start, end: text.length, text: text.slice(start).trim() });
  }
  return cues.filter((c) => c.text);
};

/**
 * 把词级时间戳按「非标点字符」顺序对齐到字幕条。
 * 旧做法按 token 长度直接累加，遇到标点/空格会累积漂移；这里逐字符跳过标点，
 * 并把 token 自身的标点（如 don't 的撇号）一并忽略，中英文都不会错位。
 */
const alignCues = (text, cues, words) => {
  const chunkOf = new Array(text.length).fill(-1);
  cues.forEach((c, k) => {
    for (let i = c.start; i < c.end; i++) chunkOf[i] = k;
  });
  const out = cues.map((c) => ({ text: c.text, start: null, end: null }));
  let ptr = 0;
  for (const w of words) {
    const token = w.t.replace(PUNCT_G, "");
    if (!token) continue;
    while (ptr < text.length && PUNCT_RE.test(text[ptr])) ptr++;
    const firstChar = ptr;
    let matched = 0;
    while (ptr < text.length && matched < token.length) {
      if (!PUNCT_RE.test(text[ptr])) matched++;
      ptr++;
    }
    let k = firstChar < text.length ? chunkOf[firstChar] : -1;
    if (k < 0) k = out.length - 1;
    if (k < 0) break;
    if (out[k].start === null) out[k].start = w.start;
    out[k].end = w.end;
  }
  // 纯标点/空格条没有词：从左右邻居借时间，避免字幕闪断
  for (let k = 0; k < out.length; k++) {
    if (out[k].start !== null) continue;
    const left = out.slice(0, k).reverse().find((c) => c.start !== null);
    const right = out.slice(k + 1).find((c) => c.start !== null);
    if (left) {
      out[k].start = left.end;
      out[k].end = left.end + 0.3;
    } else if (right) {
      out[k].start = Math.max(0, right.start - 0.3);
      out[k].end = right.start;
    }
  }
  return out.filter((c) => c.start !== null && c.text);
};

/* ------------------------------ 配音 ------------------------------ */

const pickProsody = (scene, cfg) => ({
  rate: scene.rate ?? cfg.rate ?? "+0%",
  pitch: scene.pitch ?? cfg.pitch ?? "+0Hz",
  volume: scene.volume ?? cfg.volume ?? "+0%",
});

const synthScene = async (tts, scene, cfg, mp3) => {
  const { audioStream, metadataStream } = tts.toStream(scene.text, pickProsody(scene, cfg));
  const items = [];
  let badChunks = 0;
  metadataStream.on("data", (chunk) => {
    try {
      items.push(...(JSON.parse(chunk.toString()).Metadata ?? []));
    } catch {
      badChunks++;
    }
  });
  const metadataDone = new Promise((resolve, reject) => {
    if (metadataStream.destroyed || metadataStream.readableEnded) return resolve();
    metadataStream.once("close", resolve);
    metadataStream.once("error", reject);
  });
  await Promise.all([
    pipeline(audioStream, fs.createWriteStream(mp3)),
    metadataDone,
  ]);

  const words = items
    .filter((x) => x.Type === "WordBoundary")
    .map((x) => ({
      t: String(x.Data?.text?.Text ?? ""),
      start: x.Data.Offset / 1e7,
      end: (x.Data.Offset + x.Data.Duration) / 1e7,
    }))
    .filter((w) => w.t && w.end > w.start);
  if (words.length === 0) {
    throw new Error(`场景 ${scene.id} 没拿到词级时间戳，请重试或检查文本`);
  }
  if (badChunks > 0) {
    console.warn(`  ! ${scene.id}: ${badChunks} 个元数据块解析失败，已跳过`);
  }
  return words;
};

/* ------------------------------ 主流程 ------------------------------ */

const listVoices = async (filter) => {
  const tts = new MsEdgeTTS();
  const voices = await tts.getVoices();
  tts.close();
  const q = filter.toLowerCase();
  const hits = voices.filter(
    (v) => v.Locale.toLowerCase().includes(q) || v.ShortName.toLowerCase().includes(q),
  );
  if (hits.length === 0) {
    console.log(`没有匹配 “${filter}” 的音色`);
    return;
  }
  for (const v of hits) console.log(`${v.ShortName.padEnd(34)} ${v.Gender.padEnd(8)} ${v.Locale}`);
  console.log(`\n共 ${hits.length} 个；在 vo/script.json 的 voice 字段填 ShortName。`);
};

const main = async () => {
  const voicesIndex = ARGV.indexOf("--voices");
  if (voicesIndex >= 0) {
    const next = ARGV[voicesIndex + 1];
    await listVoices(next && !next.startsWith("--") ? next : "zh-CN");
    return;
  }

  const scriptPath = fromCwd(opt("script", DEFAULT_SCRIPT));
  const outDir = fromCwd(opt("out", DEFAULT_OUT));
  const metaPath = fromCwd(opt("meta", DEFAULT_META));

  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(scriptPath, "utf8"));
  } catch (err) {
    throw new Error(`读不到配音脚本 ${scriptPath}：${err.message}`);
  }
  const scenes = Array.isArray(cfg.scenes) ? cfg.scenes : [];
  if (scenes.length === 0) throw new Error("vo 脚本里没有 scenes");
  const ids = new Set();
  for (const s of scenes) {
    if (!s.id || !/^[A-Za-z0-9._-]+$/.test(s.id)) {
      throw new Error(`场景 id 缺失或含非法字符：${JSON.stringify(s.id)}`);
    }
    if (ids.has(s.id)) throw new Error(`场景 id 重复：${s.id}`);
    ids.add(s.id);
    if (!s.text || !s.text.trim()) throw new Error(`场景 ${s.id} 没有 text`);
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(path.dirname(metaPath), { recursive: true });

  const tts = new MsEdgeTTS();
  await tts.setMetadata(cfg.voice ?? "zh-CN-XiaoxiaoNeural", FORMAT, { wordBoundaryEnabled: true });

  const meta = { voice: cfg.voice ?? "zh-CN-XiaoxiaoNeural", rate: cfg.rate ?? "+0%", fps: cfg.fps ?? 30, scenes: [] };
  let speech = 0;

  try {
    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      const mp3 = path.join(outDir, `${s.id}.mp3`);
      const words = await synthScene(tts, s, cfg, mp3);
      const maxChars = cfg.captionMaxChars ?? autoMaxChars(s.text);
      const caps = alignCues(s.text, splitCues(s.text, maxChars), words);
      const durSec = words[words.length - 1].end;
      speech += durSec;
      const entry = {
        id: s.id,
        title: s.title ?? "",
        text: s.text,
        durSec: Math.round(durSec * 1000) / 1000,
        words,
        caps,
      };
      for (const key of ["lead", "tail", "transition", "beats"]) {
        if (s[key] !== undefined) entry[key] = s[key];
      }
      meta.scenes.push(entry);
      console.log(
        `[${String(i + 1).padStart(2)}/${scenes.length}] ${s.id.padEnd(4)} ${durSec.toFixed(2)}s  ` +
          `${words.length} words  ${caps.length} caps`,
      );
    }
  } finally {
    tts.close();
  }

  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 1) + "\n");
  console.log(`\n语音总长 ${speech.toFixed(1)}s`);
  console.log(`音频 → ${path.relative(process.cwd(), outDir)}/`);
  console.log(`元数据 → ${path.relative(process.cwd(), metaPath)}`);
};

main().catch((err) => {
  console.error(`配音生成失败：${err.message}`);
  process.exit(1);
});
