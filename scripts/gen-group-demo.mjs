// 添付CSVを部門コードでグループ化し、部門枠＋メンバー（従来の箱）で表示。メンバーをドラッグで別部門へ異動できるデモ。
import { build } from "esbuild";
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const rows = fs.readFileSync(process.argv[2],"utf8").trim().split(/\r?\n/).slice(1).map(l=>l.match(/"([^"]*)"/g).map(s=>s.slice(1,-1)));
// 0社員番号 1氏名 2部門検索 3部門名 4役職名 5部門コード 6親部門コード 7階層コード 8主務区分
const recs = rows.map((r,i)=>({recordId:r[0]+"#"+i, groupId:r[5], parentId:r[6], level:Number(r[7]), sortKey:r[5], groupName:r[3], main:r[1], subs:[{label:"役職",value:r[4]},{label:"区分",value:r[8]}]}));
const entry = `
import { TreeEditor } from "${root}/src/tree/view";
const RECS = ${JSON.stringify(recs)};
class P { writable=true; label="デモ（メモリ内・kintoneには書き込みません）"; recs=RECS;
  async load(){ return this.recs; }
  async apply(ch){ for(const c of ch){ const r=this.recs.find(x=>x.recordId===c.recordId); if(r){ r.groupId=c.after.groupId; r.parentId=c.after.parentId; r.level=c.after.level; const s=this.recs.find(x=>x.groupId===c.after.groupId&&x!==r); if(s) r.groupName=s.groupName; } } }
  recordUrl(id){ return "/k/1/show#record="+id; } // デモ用（↗の表示確認。実クリックはkintone上で有効）
}
const host=document.getElementById("app");
new TreeEditor(host, new P(), "horizontal").mount().catch(e=>{console.error(e);host.textContent="初期化失敗";});
`;
const res = await build({stdin:{contents:entry,resolveDir:root,loader:"ts"},bundle:true,write:false,format:"iife",platform:"browser",logLevel:"silent"});
const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>部門グループ＋メンバー異動デモ</title>
<style>*{box-sizing:border-box}body{margin:0;padding:16px;background:#eef1f4;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif;color:#2d3b45}
h1{font-size:16px;margin:0 0 4px}.lead{font-size:12.5px;color:#6b7a86;margin:0 0 12px;line-height:1.7}</style></head><body>
<h1>部門グループ＋メンバー異動デモ（実データ）</h1>
<p class="lead">部門コードでグループ化し、部門の枠の中にメンバーを従来の見た目（主＋副）で並べています。<b>メンバーを別の部門枠へドラッグ</b>すると、その人の部門コード・親・階層が異動先に書き換わります（メモリ内のみ・kintoneには書き込みません）。</p>
<div id="app"></div>
<script>"use strict";
${res.outputFiles[0].text}
</script></body></html>`;
fs.writeFileSync(path.join(root,"demo/group-demo.html"), html);
console.log("wrote demo/group-demo.html / records:", recs.length);
