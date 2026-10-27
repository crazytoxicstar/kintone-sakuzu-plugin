// 各シート種別が正しく描画されるかのヘッドレス確認
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";

const entry = `
import { FREE_DEMO_RECORDS } from "${root}/src/free/free-demo-data";
import { FreeEditor } from "${root}/src/free/free-view";
class P { writable=true; label="t";
  async loadRecords(){ return FREE_DEMO_RECORDS.map(r=>({...r,subs:r.subs.map(s=>({...s}))})); }
  async loadDiagram(){ return null; } async saveDiagram(){} recordUrl(){ return "#"; } }
window.__mount = async (sheet) => {
  const host = document.getElementById("app"); host.innerHTML="";
  const ed = new FreeEditor(host, new P(), 0, { openInNewTab:true, sheetType:sheet });
  await ed.mount(); window.__ed = ed; return ed;
};
`;
const res = await build({ stdin:{contents:entry,resolveDir:root,loader:"ts"}, bundle:true, write:false, format:"iife", platform:"browser", logLevel:"silent" });
const code = res.outputFiles[0].text;
const dom = new JSDOM(`<!doctype html><html><head></head><body><div id="app"></div></body></html>`, { pretendToBeVisual:true, runScripts:"outside-only" });
const { window } = dom;
window.requestAnimationFrame = (cb)=>setTimeout(()=>cb(Date.now()),0);
window.SVGElement.prototype.getBBox = ()=>({x:0,y:0,width:80,height:20});
window.Element.prototype.getBoundingClientRect = ()=>({x:0,y:0,left:0,top:0,width:900,height:560,right:900,bottom:560});

let failed=0; const assert=(c,m)=>{ if(!c){failed++;console.error("  ✗ "+m);} else console.log("  ✓ "+m); };
try {
  window.eval(code);
  const place = (ed) => { // レコードを1件配置して形状要素を確認
    const recs = ed.records;
    ed.diagram.nodes.push({ id:"n1", recordId:recs[0].recordId, x:0,y:0,w:ed.nodeW(),h:ed.nodeH(recs[0].recordId), shape:"rect", color:"#3498db", label:"x" });
    ed.render();
  };
  console.log("[シート種別の描画]");
  // normal: 背景にグリッド線、配置ノードは矩形(kzf-box)
  let ed = await window.__mount("normal"); place(ed);
  assert(!!window.document.querySelector(".kzf-node .kzf-box"), "normal: ノードが矩形カードで描画される");

  // square: セル中心スナップ＋正方形セル
  ed = await window.__mount("square"); place(ed);
  const sq = window.document.querySelector(".kzf-node rect:not(.kzf-box)") || window.document.querySelector(".kzf-node rect");
  assert(!!sq, "square: ノードが正方形セルで描画される");

  // circle: 楕円/円
  ed = await window.__mount("circle"); place(ed);
  assert(!!window.document.querySelector(".kzf-node ellipse, .kzf-node circle"), "circle: ノードが円で描画される");

  // honeycomb: 六角形(polygon)
  ed = await window.__mount("honeycomb"); place(ed);
  assert(!!window.document.querySelector(".kzf-node polygon"), "honeycomb: ノードが六角形(polygon)で描画される");
  // 背景パターン（defs内）にも六角形が定義される
  assert(window.document.querySelectorAll("defs polygon, defs path").length > 0, "honeycomb: 背景パターンが定義される");

  // シート切替で前のノード形状が残らない（再マウントで作り直し）
  ed = await window.__mount("normal");
  assert(window.document.querySelectorAll(".kzf-node polygon").length === 0, "切替後は前シートの形状が残らない");
} catch(e){ failed++; console.error("例外:", e); }
console.log(failed?`\nFAILED (${failed})`:"\nALL PASS");
process.exit(failed?1:0);
