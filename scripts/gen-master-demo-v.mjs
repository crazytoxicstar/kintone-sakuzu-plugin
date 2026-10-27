import { build } from "esbuild";
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const rows = fs.readFileSync(process.argv[2],"utf8").trim().split(/\r?\n/).slice(1).map(l=>l.match(/"([^"]*)"/g).map(s=>s.slice(1,-1)));
const members = rows.map((r,i)=>({recordId:r[0]+"#"+i, groupId:r[5], parentId:"", level:NaN, sortKey:r[5], groupName:"", main:r[1], subs:[{label:"役職",value:r[4]},{label:"区分",value:r[8]}]}));
const dept = new Map();
for (const r of rows){ if(!dept.has(r[5])) dept.set(r[5],{groupId:r[5],parentId:r[6],level:Number(r[7]),groupName:r[3]}); }
const names = {"D02100":"第一営業部"};
for (const d of [...dept.values()]){ if(d.parentId && !dept.has(d.parentId)){ dept.set(d.parentId,{groupId:d.parentId,parentId:d.parentId.replace(/\d00$/,"000"),level:d.level-1,groupName:names[d.parentId]||d.parentId}); } }
if(dept.has("D02100")) dept.get("D02100").parentId="D02000";
const groupDefs=[...dept.values()];
const entry = `
import { TreeEditor } from "${root}/src/tree/view";
const MEMBERS=${JSON.stringify(members)}; const DEFS=${JSON.stringify(groupDefs)};
class P { writable=true; label="デモ（メモリ内）"; recs=MEMBERS;
  async load(){ return {records:this.recs, groupDefs:DEFS}; }
  async apply(ch){ for(const c of ch){ const r=this.recs.find(x=>x.recordId===c.recordId); if(r) r.groupId=c.after.groupId; } }
}
const host=document.getElementById("app");
new TreeEditor(host, new P(), "vertical").mount().catch(e=>{console.error(e);host.textContent="初期化失敗";});
`;
const res = await build({stdin:{contents:entry,resolveDir:root,loader:"ts"},bundle:true,write:false,format:"iife",platform:"browser",logLevel:"silent"});
const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>縦向きツリーデモ</title>
<style>*{box-sizing:border-box}body{margin:0;padding:16px;background:#eef1f4;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif;color:#2d3b45}
h1{font-size:16px;margin:0 0 4px}.lead{font-size:12.5px;color:#6b7a86;margin:0 0 12px;line-height:1.7}</style></head><body>
<h1>縦向きツリーデモ（マスタ参照・実メンバー）</h1>
<p class="lead">縦並び（上→下）。親は子の中央に揃います。部門マスタ参照で空の第一営業部も繋がり宙ぶらりんなし。メンバーを別部門枠へドラッグで異動（メモリ内のみ）。</p>
<div id="app"></div>
<script>"use strict";
${res.outputFiles[0].text}
</script></body></html>`;
fs.writeFileSync(path.join(root,"demo/master-demo-vertical.html"), html);
console.log("wrote demo/master-demo-vertical.html");
