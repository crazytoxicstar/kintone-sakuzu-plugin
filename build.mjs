// esbuild で desktop / config をそれぞれ単一JSにバンドルして plugin/js/ に出力する。
import esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const common = {
  bundle: true,
  format: "iife",
  target: "es2019",
  legalComments: "none",
  logLevel: "info",
};

const builds = [
  // プラグイン本体（モードで組織ツリー/自由配置を分岐）
  { entryPoints: ["src/entry.ts"], outfile: "plugin/js/desktop.js" },
  { entryPoints: ["src/config/config.ts"], outfile: "plugin/js/config.js" },
  // 単体デモ（kintone不要）
  { entryPoints: ["demo/demo.ts"], outfile: "demo/demo.js" }, // 組織ツリー
  { entryPoints: ["demo/free-demo.ts"], outfile: "demo/free-demo.js" }, // 自由配置
  { entryPoints: ["demo/free-demo-switch.ts"], outfile: "demo/free-demo-switch.js" }, // 自由配置（シート切替）
];

if (watch) {
  for (const b of builds) {
    const ctx = await esbuild.context({ ...common, ...b });
    await ctx.watch();
  }
  console.log("watching for changes...");
} else {
  await Promise.all(builds.map((b) => esbuild.build({ ...common, ...b })));
  console.log("build done -> plugin/js/");
}
