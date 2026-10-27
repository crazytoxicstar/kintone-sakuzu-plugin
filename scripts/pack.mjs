// plugin/ ディレクトリを署名付き .plugin(zip) にパッケージングする。
// 秘密鍵 private.ppk を再利用することで、再ビルドしてもプラグインIDが固定される
// （＝kintone上で「同じプラグインの更新」として扱われ、設定も引き継がれる）。
import { existsSync, mkdirSync, readdirSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginDir = join(root, "plugin");
const distDir = join(root, "dist");
const outFile = join(distDir, "plugin.zip");
const ppkFile = join(root, "private.ppk");
const bin = join(root, "node_modules", "@kintone", "plugin-packer", "bin", "cli.js");

if (!existsSync(join(pluginDir, "js", "desktop.js"))) {
  console.error("plugin/js がありません。先に `npm run build` を実行してください。");
  process.exit(1);
}
mkdirSync(distDir, { recursive: true });

const firstRun = !existsSync(ppkFile);
// 生成された .ppk は packer のバージョンによって dist/ か プロジェクト直下に置かれる。両方を監視する。
const scanDirs = [distDir, root];
const ppkSnapshot = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".ppk")) : [];
const before = new Set(scanDirs.flatMap((d) => ppkSnapshot(d).map((f) => join(d, f))));

const args = [bin, pluginDir, "--out", outFile];
if (!firstRun) args.push("--ppk", ppkFile);

const r = spawnSync(process.execPath, args, { stdio: "inherit" });
if (r.status !== 0) process.exit(r.status ?? 1);

if (firstRun) {
  const generated = scanDirs
    .flatMap((d) => ppkSnapshot(d).map((f) => join(d, f)))
    .filter((p) => !before.has(p) && resolve(p) !== resolve(ppkFile));
  if (generated.length >= 1) {
    renameSync(generated[0], ppkFile);
    console.log("秘密鍵を private.ppk として保存しました（次回以降は同じ鍵で署名＝プラグインID固定）。");
    console.log("※ private.ppk は紛失・流出しないよう安全に保管してください。");
  }
}
console.log(`packed -> ${outFile}`);
