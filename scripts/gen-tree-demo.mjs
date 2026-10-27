// 固定表示（隣接リスト＋階層レベル方式）のスタンドアロンデモを生成する。
// ・各ノードは階層フィールド(level)の値の段に固定表示される
// ・ドラッグで変えられるのは親だけ。親にできるのは「自分より上位の階層」のノードのみ（同階層・下位はエラー）
// ・親→孫（段飛ばし）も表現できる
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";

// id / 親id / 階層(level) / 名称。段は level の値で決まる。
const DATA = [
  { recordId: "1", id: "S", parent: "", level: 1, name: "社長" },
  { recordId: "2", id: "A", parent: "S", level: 2, name: "管理本部" },
  { recordId: "3", id: "B", parent: "S", level: 2, name: "営業本部" },
  { recordId: "4", id: "A1", parent: "A", level: 3, name: "人事部" },
  { recordId: "5", id: "A2", parent: "A", level: 3, name: "経理部" },
  { recordId: "6", id: "B1", parent: "B", level: 3, name: "第一営業部" },
  { recordId: "7", id: "B1a", parent: "B1", level: 4, name: "第一営業課" },
  // 親→孫（段飛ばし）：社長(1)の直下に3層目を置く。段は3段目のまま、線が2段目を飛ばす。
  { recordId: "8", id: "P", parent: "S", level: 3, name: "社長直轄プロジェクト室" },
];

const entry = `
import { TreeEditor } from "${root}/src/tree/view";
const DATA = ${JSON.stringify(DATA)};
class P {
  writable = true;
  label = "デモ（メモリ内・kintoneには書き込みません）";
  nodes = DATA.map((d) => ({ recordId: d.recordId, nodeId: d.id, parentId: d.parent, level: d.level, sortKey: d.id, label: d.name, main: d.name, subs: [ { label: "ID", value: d.id }, { label: "親ID", value: d.parent }, { label: "階層", value: String(d.level) } ] }));
  async load() { return this.nodes.map((n) => ({ ...n, subs: n.subs.map((s) => ({ ...s })) })); }
  async apply(changes) { for (const c of changes) { const n = this.nodes.find((x) => x.recordId === c.recordId); if (n) n.parentId = c.after.parent; } }
}
const host = document.getElementById("app");
new TreeEditor(host, new P(), "vertical").mount().catch((e) => { console.error(e); host.textContent = "初期化に失敗しました。"; });
`;

const res = await build({ stdin: { contents: entry, resolveDir: root, loader: "ts" }, bundle: true, write: false, format: "iife", platform: "browser", logLevel: "silent" });
const js = res.outputFiles[0].text;

const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>固定表示（階層）デモ</title>
<style>*{box-sizing:border-box}body{margin:0;padding:20px;background:#eef1f4;color:#2d3b45;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif}
.page{max-width:1180px;margin:0 auto}h1{font-size:18px;margin:0 0 6px}
.lead{font-size:13px;color:#6b7a86;line-height:1.8;margin:0 0 14px}.lead b{color:#2d3b45}
.legend{font-size:12.5px;line-height:1.9;background:#fff;border:1px solid #d7dee4;border-radius:8px;padding:10px 14px;margin:0 0 16px}
.legend code{background:#f0f3f6;padding:1px 6px;border-radius:4px}.legend b{color:#2d3b45}
.note{font-size:12.5px;color:#6b7a86;line-height:1.8;margin:14px 0 0}.note b{color:#2d3b45}</style></head><body>
<div class="page"><h1>固定表示（階層レベル方式）デモ</h1>
<p class="lead">各ノードは<b>階層フィールドの値の段</b>に固定表示されます（社長=1段目、本部=2段目…）。<b>社長直轄プロジェクト室</b>は階層3のまま社長(1)の直下にぶら下がる例で、線が2段目を飛ばします（＝親→孫）。各カードに <code>ID</code>・<code>親ID</code>・<code>階層</code> を表示しています。</p>
<div class="legend">
<b>ドラッグで試せること（変わるのは親フィールドだけ・階層は不変）</b><br>
<b>OK</b>：人事部(階層3)を <b>営業本部(2)</b> の上にドロップ → 上位階層なので親にできる<br>
<b>OK</b>：第一営業課(4)を <b>管理本部(2)</b> にドロップ → 段飛ばしで付け替え（階層4のまま）<br>
<b>NG</b>：人事部(3)を <b>経理部(3)</b> にドロップ → 同じ階層なのでエラー（トースト表示）<br>
<b>NG</b>：営業本部(2)を <b>人事部(3)</b> にドロップ → 下位の階層の下へは不可（逆転防止）
</div>
<div id="app"></div>
<p class="note"><b>ドロップ先の枠色：</b>緑＝付け替え可能／赤＝不可。赤にドロップすると理由（同階層・下位／循環など）がトーストで出ます。階層（レベル）を変えたいときは、ツリーではなくレコードを直接編集する運用です（このデモはメモリ内のみ・kintoneには書き込みません）。</p>
</div>
<script>"use strict";
${js}
</script></body></html>`;

const out = path.join(root, "demo/tree-level-demo.html");
fs.writeFileSync(out, html);
console.log("wrote " + out);
