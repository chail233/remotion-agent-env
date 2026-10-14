import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./src/index.ts");
Config.setPublicDir("./public");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Windows: "angle" 使用 GPU 光栅化，比 swiftshader 快；渲染异常时可改回 "swiftshader"
Config.setChromiumOpenGlRenderer("angle");
