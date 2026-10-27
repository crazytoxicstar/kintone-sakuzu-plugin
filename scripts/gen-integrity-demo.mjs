// ②整合性チェックの表示を確認するためのスタンドアロンデモHTMLを生成する。
// わざと不備（重複ID・空ID・自己ループ・孤立・循環）を混ぜたデータで固定表示ツリーを描画し、
// 画面上部の⚠警告と、不備ノードが最上位に逃がされる様子を確認できる。
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";

// 各ノード：id / 親id / 階層(level) / 並び順 / 名称。sub に ID・親ID・階層 を出して突き合わせやすくする。
const DATA = [
  // --- 正常な組織（これは普通にぶら下がる） ---
  { recordId: "1", id: "D1", parent: "", level: 1, sort: "1", name: "経営" },
  { recordId: "2", id: "D11", parent: "D1", level: 2, sort: "1", name: "管理本部" },
  { recordId: "3", id: "D111", parent: "D11", level: 3, sort: "1", name: "人事部" },
  { recordId: "4", id: "D12", parent: "D1", level: 2, sort: "2", name: "営業本部" },
  { recordId: "5", id: "D121", parent: "D12", level: 3, sort: "1", name: "第一営業部" },
  // --- ③ID重複：D111 が2件（後の1件は無視される） ---
  { recordId: "6", id: "D111", parent: "D11", level: 3, sort: "2", name: "人事部（重複・無視される）" },
  // --- ①ID空：表示されない ---
  { recordId: "7", id: "", parent: "D1", level: 2, sort: "9", name: "ID空（表示されない）" },
  // --- ②自己ループ：親に自分自身 → 最上位へ ---
  { recordId: "8", id: "SELF", parent: "SELF", level: 2, sort: "1", name: "自己ループ部（親＝自分）" },
  // --- ④孤立：親IDが実在しない → 最上位へ ---
  { recordId: "9", id: "ORPH", parent: "NOEXIST", level: 3, sort: "1", name: "孤立部（親IDが無い）" },
  // --- ⑤循環：CYCA↔CYCB → 最上位へ ---
  { recordId: "10", id: "CYCA", parent: "CYCB", level: 2, sort: "1", name: "循環A（親＝B）" },
  { recordId: "11", id: "CYCB", parent: "CYCA", level: 3, sort: "1", name: "循環B（親＝A）" },
];

const entry = `
import { TreeEditor } from "${root}/src/tree/view";
const DATA = ${JSON.stringify(DATA)};
class P {
  writable = true;
  label = "デモ（メモリ内・kintoneには書き込みません）";
  nodes = DATA.map((d) => ({ recordId: d.recordId, nodeId: d.id, parentId: d.parent, level: d.level, sortKey: d.sort, label: d.name, main: d.name, subs: [ { label: "ID", value: d.id }, { label: "親ID", value: d.parent }, { label: "階層", value: String(d.level) } ] }));
  async load() { return this.nodes.map((n) => ({ ...n, subs: n.subs.map((s) => ({ ...s })) })); }
  async apply(changes) { for (const c of changes) { const n = this.nodes.find((x) => x.recordId === c.recordId); if (n) n.parentId = c.after.parent; } }
}
const host = document.getElementById("app");
const ed = new TreeEditor(host, new P(), "vertical");
ed.mount().then(() => {
  // 読み込み時の整合性チェック結果を、見やすいバナーにしてページ上部へ出す（本体のステータス行にも同じ内容が出ます）。
  const dg = ed.model.diagnostics();
  const msgs = [];
  if (dg.duplicateIds) msgs.push("IDに重複があります（同じIDは先に読み込んだ1件のみ有効）");
  if (dg.emptyIds > 0) msgs.push("IDが空のレコードが" + dg.emptyIds + "件あり表示できません");
  if (dg.selfLoop > 0) msgs.push("親に自分自身を指定したレコードが" + dg.selfLoop + "件あります（最上位として表示）");
  if (dg.missingParent > 0) msgs.push("親IDが見つからないレコードが" + dg.missingParent + "件あります（最上位として表示）");
  if (dg.cycle > 0) msgs.push("親子が循環しているレコードが" + dg.cycle + "件あります（暫定で最上位に並べています）");
  const banner = document.getElementById("integrity-banner");
  if (banner) {
    if (msgs.length === 0) { banner.className = "banner ok"; banner.textContent = "⚠ 検知なし（データは正常です）"; }
    else { banner.className = "banner ng"; banner.innerHTML = "<b>⚠ 整合性チェックで " + msgs.length + " 件検知しました</b><ul>" + msgs.map((m) => "<li>" + m + "</li>").join("") + "</ul>"; }
  }
}).catch((e) => { console.error(e); host.textContent = "初期化に失敗しました。"; });
`;

const res = await build({
  stdin: { contents: entry, resolveDir: root, loader: "ts" },
  bundle: true, write: false, format: "iife", platform: "browser", logLevel: "silent",
});
const js = res.outputFiles[0].text;

const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>整合性チェック デモ</title>
<style>*{box-sizing:border-box}body{margin:0;padding:20px;background:#eef1f4;color:#2d3b45;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif}
.page{max-width:1180px;margin:0 auto}h1{font-size:18px;margin:0 0 6px}
.lead{font-size:13px;color:#6b7a86;line-height:1.8;margin:0 0 14px}.lead b{color:#2d3b45}
.legend{font-size:12.5px;line-height:1.9;background:#fff;border:1px solid #d7dee4;border-radius:8px;padding:10px 14px;margin:0 0 16px}
.legend code{background:#f0f3f6;padding:1px 6px;border-radius:4px}
.legend .ok{color:#3a7a3a}.legend .ng{color:#c0392b}
.banner{border-radius:8px;padding:12px 16px;margin:0 0 16px;font-size:13px;line-height:1.7}
.banner.ng{background:#fdecea;border:1px solid #f5b7b1;color:#a93226}
.banner.ok{background:#eafaf1;border:1px solid #abebc6;color:#1e8449}
.banner ul{margin:8px 0 0;padding-left:20px}.banner li{margin:2px 0}
.note{font-size:12.5px;color:#6b7a86;line-height:1.8;margin:14px 0 0}.note b{color:#2d3b45}</style></head><body>
<div class="page"><h1>整合性チェック デモ（固定表示）</h1>
<p class="lead">わざと不備を混ぜたデータで固定表示ツリーを描画しています。不備は<b>読み込み時に自動で検知</b>し（操作で出るものではありません）、下の赤いバナーと、ツリー下部のステータス行に⚠警告を出します。不備のあるノードは<b>最上位へ逃がして</b>表示します（データ自体は自動修正しません）。各ノードには <code>ID</code> と <code>親ID</code> を表示しています。</p>
<div id="integrity-banner" class="banner ng">読み込み中…</div>
<div class="legend">
<b>仕込んだ不備</b><br>
<span class="ok">正常</span>：経営(D1) → 管理本部(D11) → 人事部(D111)、営業本部(D12) → 第一営業部(D121)<br>
<span class="ng">ID重複</span>：<code>D111</code> が2件 → 後の「人事部（重複）」は無視<br>
<span class="ng">ID空</span>：親D1配下の1件 → 表示されない<br>
<span class="ng">自己ループ</span>：<code>SELF</code> の親が自分自身 → 最上位へ<br>
<span class="ng">孤立</span>：<code>ORPH</code> の親 <code>NOEXIST</code> が存在しない → 最上位へ<br>
<span class="ng">循環</span>：<code>CYCA</code>↔<code>CYCB</code> が相互に親 → 両方を最上位へ（無限ループしない）
</div>
<div id="app"></div>
<p class="note"><b>操作で出るチェック（①）も試せます：</b>ノードを<b>自分の配下のノードへドラッグ</b>すると「自分の配下へは移動できません」とトーストが出て移動できません。正常にドラッグできた場合は、確認モーダルを経て親フィールドが書き換わります（このデモはメモリ内のみ・kintoneには書き込みません）。</p>
</div>
<script>"use strict";
${js}
</script></body></html>`;

const out = path.join(root, "demo/tree-integrity-demo.html");
fs.writeFileSync(out, html);
console.log("wrote " + out);
