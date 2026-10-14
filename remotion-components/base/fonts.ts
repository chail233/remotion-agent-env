// 字体加载。在根组件所在模块顶层调用一次 loadFonts() 即可，重复调用会被忽略。
// 需要 public/fonts/ 下有：NotoSansSC-VF.ttf、NotoSerifSC-VF.ttf、CascadiaCode.ttf
//（Windows 可从 C:\Windows\Fonts 拷贝）。注册出的家族名 'Kit Sans/Serif/Mono' 即 theme.ts 里 F 的首选字体。
// tsconfig 的 lib 需包含 "DOM", "DOM.Iterable"（document.fonts.add 用到）。
import { continueRender, delayRender, staticFile } from "remotion";

const fonts: { family: string; file: string; weight: string }[] = [
  { family: "Kit Sans", file: "fonts/NotoSansSC-VF.ttf", weight: "100 900" },
  { family: "Kit Serif", file: "fonts/NotoSerifSC-VF.ttf", weight: "200 900" },
  { family: "Kit Mono", file: "fonts/CascadiaCode.ttf", weight: "200 700" },
];

let started = false;

export const loadFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("加载字体", { timeoutInMilliseconds: 120000 });
  Promise.all(
    fonts.map(async (f) => {
      const face = new FontFace(f.family, `url(${staticFile(f.file)})`, {
        weight: f.weight,
      });
      await face.load();
      document.fonts.add(face);
    }),
  )
    .catch((err) => console.error("字体加载失败", err))
    .finally(() => continueRender(handle));
};
