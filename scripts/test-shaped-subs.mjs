// 形状セル（ハニカム等）の副表示：先頭が空でも後続の非空の副を表示することを確認。
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import path from "node:path"; import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const entry = `
import { FreeEditor } from "${root}/src/free/free-view";
window.__mk = async (sheet, subs) => { const h=document.getElementById("app"); h.innerHTML="";
  class P { writable=true; label="t";
    async loadRecords(){ return [{recordId:"1",main:"鈴木 健治",subs}]; }
    async loadDiagram(){ return null; } async saveDiagram(){} recordUrl(){ return "#"; } }
  const ed=new FreeEditor(h,new P(),0,{openInNewTab:true,sheetType:sheet}); await ed.mount();
  ed.diagram.nodes.push({id:"n1",recordId:"1",x:0,y:0,w:ed.nodeW(),h:ed.nodeH("1"),shape:"hexagon",color:"#3498db",label:"鈴木 健治"});
  ed.render(); window.__ed=ed; return ed; };
`;
const res = await build({ stdin:{contents:entry,resolveDir:root,loader:"ts"}, bundle:true, write:false, format:"iife", platform:"browser", logLevel:"silent" });
const dom = new JSDOM(`<!doctype html><html><head></head><body><div id="app"></div></body></html>`,{pretendToBeVisual:true,runScripts:"outside-only"});
const { window } = dom;
window.requestAnimationFrame=(cb)=>setTimeout(()=>cb(Date.now()),0);
window.Element.prototype.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,width:900,height:560,right:900,bottom:560});
let failed=0; const assert=(c,m)=>{ if(!c){failed++;console.error("  ✗ "+m);} else console.log("  ✓ "+m); };
const subTexts=()=>[...window.document.querySelectorAll(".kzf-node text.kzf-sub")].map(t=>t.textContent);
try {
  window.eval(res.outputFiles[0].text);
  console.log("[形状セルの副表示（先頭が空でも表示）]");
  await window.__mk("honeycomb", [{label:"社員番号",value:""},{label:"部門",value:"経営管理本部"},{label:"区分",value:"主務"}]);
  const s = subTexts();
  assert(s.includes("経営管理本部"), "先頭(社員番号)が空でも、後続の非空の副が表示される："+JSON.stringify(s));
  assert(!s.includes(""), "空の副は表示しない");
  await window.__mk("square", [{label:"a",value:"X"},{label:"b",value:"Y"}]);
  assert(subTexts().length >= 1, "正方形セルでも副が表示される");
  await window.__mk("honeycomb", [{label:"a",value:""},{label:"b",value:""}]);
  assert(subTexts().length === 0, "すべて空なら副は出ない（主表示のみ）");
} catch(e){ failed++; console.error("例外:", e&&e.stack?e.stack:e); }
console.log(failed?`\nFAILED (${failed})`:"\nALL PASS");
process.exit(failed?1:0);
