// 自由配置デモの単体HTMLを、ビルド済み demo/free-demo.js を埋め込んで再生成する。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const js = fs.readFileSync(path.join(root, "demo/free-demo.js"), "utf8");

const demos = [
  { file: "free-demo-standalone", sheet: "normal", title: "自由配置デモ（ノーマル）", cell: "20pxグリッド。" },
  { file: "free-square", sheet: "square", title: "自由配置デモ（正方形シート）", cell: "正方形セル。" },
  { file: "free-circle", sheet: "circle", title: "六角最密の円セル。", cellTitle: "自由配置デモ（円形シート）", cell: "六角最密の円セル。" },
  { file: "free-honeycomb", sheet: "honeycomb", title: "自由配置デモ（ハニカム）", cell: "六角セル。" },
];

// 円のタイトル補正
demos[2].title = "自由配置デモ（円形シート）";

const leadFor = (cell) =>
  `${cell}左の<b>選択リストに主表示＋副表示を横並び</b>表示（入りきらない分は…で省略／ホバーで全文）。レコードを<b>ドラッグ</b>で配置（オブジェクト同士は<b>重ねて置けません</b>）。<b>ライン</b>（線ツール）＝<b>▾プルダウン</b>で経路（L字／直線）・線種・始点・終点・色を指定。` +
  `<b>文字ツール</b>＝「文字」でキャンバスをクリックして注釈を追加（大きさ=大中小／太字・斜体・下線／色）。配置済みの文字は<b>ダブルクリック（または選択してEnter）で再編集</b>、空にすると削除。` +
  `<b>選択</b>＝ドラッグで矩形選択（Shiftクリックで追加選択／Ctrl+Aで全選択）。選択後に「削除」またはDeleteキーで<b>まとめて削除</b>。各ツールボタンにはアイコン付き。`;

const page = (d) => `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${d.title}</title>
<style>*{box-sizing:border-box}body{margin:0;padding:20px;background:#eef1f4;color:#2d3b45;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif}
.page{max-width:1180px;margin:0 auto}h1{font-size:18px;margin:0 0 6px}.lead{font-size:13px;color:#6b7a86;line-height:1.7;margin:0 0 16px}.lead b{color:#2d3b45}</style></head><body>
<div class="page"><h1>${d.title}</h1><p class="lead">${leadFor(d.cell)}</p>
<div id="app"></div></div>
<script>window.__KZF_SHEET__=${JSON.stringify(d.sheet)};</script><script>${js}</script></body></html>`;

for (const d of demos) {
  fs.writeFileSync(path.join(root, `demo/${d.file}.html`), page(d), "utf8");
  console.log("wrote demo/" + d.file + ".html");
}

// シート種別を画面上で切り替えられる統合デモ
const switchJs = fs.readFileSync(path.join(root, "demo/free-demo-switch.js"), "utf8");
const switchPage = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>自由配置デモ（シート切替）</title>
<style>*{box-sizing:border-box}body{margin:0;padding:20px;background:#eef1f4;color:#2d3b45;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif}
.page{max-width:1180px;margin:0 auto}h1{font-size:18px;margin:0 0 6px}.lead{font-size:13px;color:#6b7a86;line-height:1.7;margin:0 0 12px}.lead b{color:#2d3b45}
.bar{display:flex;align-items:center;gap:10px;margin:0 0 14px}.bar label{font-size:13px;color:#34495e;font-weight:600}
#sheet{height:34px;padding:0 10px;border:1px solid #c4c4c4;border-radius:6px;font-size:13px;background:#fff;color:#2d3b45}</style></head><body>
<div class="page"><h1>自由配置デモ（シート切替）</h1>
<p class="lead">${leadFor("")}シート種別（<b>ノーマル／正方形／円形／ハニカム</b>）はプルダウンで切り替えられます。切替で描画し直します。</p>
<div class="bar"><label for="sheet">シート種別</label><select id="sheet"></select></div>
<div id="app"></div></div>
<script>${switchJs}</script></body></html>`;
fs.writeFileSync(path.join(root, "demo/free-demo-switch.html"), switchPage, "utf8");
console.log("wrote demo/free-demo-switch.html");
