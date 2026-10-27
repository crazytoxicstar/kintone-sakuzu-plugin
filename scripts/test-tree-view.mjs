// グループ化ツリーの描画テスト（jsdom）：部門枠＋従来の見た目のメンバー箱が描かれる。
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import path from "node:path"; import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const entry = `
import { TreeEditor } from "${root}/src/tree/view";
const RECS = [
  {recordId:"E1",groupId:"D0",parentId:"",level:1,sortKey:"D0",groupName:"代表",main:"佐藤",subs:[{label:"役職",value:"社長"}]},
  {recordId:"E2",groupId:"D1",parentId:"D0",level:2,sortKey:"D1",groupName:"管理本部",main:"伊藤",subs:[]},
  {recordId:"E3",groupId:"D1",parentId:"D0",level:2,sortKey:"D1",groupName:"管理本部",main:"田中",subs:[]},
  {recordId:"E4",groupId:"D2",parentId:"D0",level:2,sortKey:"D2",groupName:"営業本部",main:"山本",subs:[]},
];
class P { writable=true; label="t"; recs=RECS;
  async load(){ return {records:this.recs}; }
  async apply(ch){ for(const c of ch){ const r=this.recs.find(x=>x.recordId===c.recordId); if(r){r.groupId=c.after.groupId;r.parentId=c.after.parentId;r.level=c.after.level;} } }
  recordUrl(id){ return "/k/1/show#record="+id; }
}
window.__mount = async (dir) => { const h=document.getElementById("app"); h.innerHTML="";
  const ed=new TreeEditor(h,new P(),dir); await ed.mount(); window.__ed=ed; return ed; };
`;
const res = await build({ stdin:{contents:entry,resolveDir:root,loader:"ts"}, bundle:true, write:false, format:"iife", platform:"browser", logLevel:"silent" });
const dom = new JSDOM(`<!doctype html><html><head></head><body><div id="app"></div></body></html>`,{pretendToBeVisual:true,runScripts:"outside-only"});
const { window } = dom;
window.requestAnimationFrame=(cb)=>setTimeout(()=>cb(Date.now()),0);
window.Element.prototype.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,width:900,height:640,right:900,bottom:640});
let failed=0; const assert=(c,m)=>{ if(!c){failed++;console.error("  ✗ "+m);} else console.log("  ✓ "+m); };
try {
  window.eval(res.outputFiles[0].text);
  console.log("[グループ化ツリー描画]");
  const ed = await window.__mount("vertical");
  assert(window.document.querySelectorAll(".kzt-node").length === 3, "部門枠は3（D0,D1,D2）");
  assert(window.document.querySelectorAll(".kzt-member").length === 4, "メンバー箱は4（従来の見た目）");
  assert(window.document.querySelectorAll(".kzt-open").length === 4, "各メンバー箱にレコードを開く↗が付く");
  // ノード本体のクリック（移動なし）でレコードが開く
  let opened = null; window.open = (u) => { opened = u; return null; };
  const mem = window.document.querySelector(".kzt-member");
  mem.dispatchEvent(new window.MouseEvent("pointerdown", { clientX: 12, clientY: 12, bubbles: true }));
  window.dispatchEvent(new window.Event("pointerup"));
  assert(opened && String(opened).includes("show#record="), "ノード本体のクリックでレコードが開く:" + opened);
  assert(window.document.querySelectorAll(".kzt-edge").length > 0, "部門どうしの親子エッジが描かれる");
  assert(ed.model.roots().length === 1, "最上位は1（代表）");
  await window.__mount("horizontal");
  assert(window.document.querySelectorAll(".kzt-member").length > 0, "横向きでも描画できる");
} catch(e){ failed++; console.error("例外:", e && e.stack ? e.stack : e); }
console.log(failed?`\nFAILED (${failed})`:"\nALL PASS");
process.exit(failed?1:0);
