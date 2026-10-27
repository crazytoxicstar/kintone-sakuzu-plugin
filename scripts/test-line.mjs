import { build } from "esbuild";
import { JSDOM } from "jsdom";
import path from "node:path"; import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const entry = `
import { FREE_DEMO_RECORDS } from "${root}/src/free/free-demo-data";
import { FreeEditor } from "${root}/src/free/free-view";
class P { writable=true; label="t";
  async loadRecords(){ return FREE_DEMO_RECORDS.map(r=>({...r,subs:r.subs.map(s=>({...s}))})); }
  async loadDiagram(){ return null; } async saveDiagram(){} recordUrl(){ return "#"; } }
window.__mk = async () => { const h=document.getElementById("app");
  const ed=new FreeEditor(h,new P(),0,{openInNewTab:true,sheetType:"normal"}); await ed.mount(); window.__ed=ed; return ed; };
`;
const res = await build({ stdin:{contents:entry,resolveDir:root,loader:"ts"}, bundle:true, write:false, format:"iife", platform:"browser", logLevel:"silent" });
const dom = new JSDOM(`<!doctype html><html><head></head><body><div id="app"></div></body></html>`,{pretendToBeVisual:true,runScripts:"outside-only"});
const { window } = dom;
window.requestAnimationFrame=(cb)=>setTimeout(()=>cb(Date.now()),0);
window.SVGElement.prototype.getBBox=()=>({x:0,y:0,width:80,height:20});
window.Element.prototype.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,width:900,height:560,right:900,bottom:560});
let failed=0; const assert=(c,m)=>{ if(!c){failed++;console.error("  ✗ "+m);} else console.log("  ✓ "+m); };
const countL=(d)=>(d.match(/L /g)||[]).length;
try {
  window.eval(res.outputFiles[0].text);
  const ed = await window.__mk();
  const recs = await ed.provider.loadRecords();
  const mk=(rid,x,y)=>({id:"n_"+rid,recordId:rid,x,y,w:190,h:60,shape:"rect",color:"#3498db",label:rid});
  ed.diagram.nodes.push(mk(recs[0].recordId,0,0), mk(recs[1].recordId,400,200));
  ed.render();

  console.log("[ライン：改名・L字/直線・色]");
  const lineBtn = [...window.document.querySelectorAll(".kzf-btn")].find(b=>b.textContent==="ライン");
  assert(!!lineBtn, "ボタン名が「ライン」になっている");
  // 接続モードで2ノードをクリックして線を作成
  lineBtn.dispatchEvent(new window.MouseEvent("click",{bubbles:true}));
  assert(ed.connectMode===true, "ラインで接続モードON");
  const gs = [...window.document.querySelectorAll(".kzf-node")];
  gs[0].dispatchEvent(new window.PointerEvent("pointerdown",{bubbles:true,clientX:10,clientY:10}));
  gs[1].dispatchEvent(new window.PointerEvent("pointerdown",{bubbles:true,clientX:500,clientY:300}));
  assert(ed.diagram.edges.length===1, "2ノードクリックで線が1本できる");
  const edge = ed.diagram.edges[0];
  assert(edge.routing==="elbow", "既定の経路はL字(elbow)");
  // 描画パスがL字（3セグメント）
  let path = window.document.querySelector(".kzf-edge");
  assert(countL(path.getAttribute("d"))===3, "L字は3セグメントの直角パス");

  // 経路を直線に変更（選択してプルダウン）
  const hit = window.document.querySelector(".kzf-edge-hit");
  hit.dispatchEvent(new window.PointerEvent("pointerdown",{bubbles:true,clientX:250,clientY:150}));
  const routeSel = [...window.document.querySelectorAll("select.kzf-linesel")].find(s=>[...s.options].some(o=>o.textContent==="直線"));
  assert(!!routeSel, "経路セレクト（L字/直線）がある");
  routeSel.value="straight"; routeSel.dispatchEvent(new window.Event("change",{bubbles:true}));
  assert(ed.diagram.edges[0].routing==="straight", "選択線の経路が直線になる");
  path = window.document.querySelector(".kzf-edge");
  assert(countL(path.getAttribute("d"))===1, "直線は1セグメント");

  // 色変更（スウォッチ）
  const colorInput = window.document.querySelector(".kzf-linepop input.kzf-color");
  assert(!!colorInput, "線の色スウォッチがある（文字と同様）");
  colorInput.value="#ff0000"; colorInput.dispatchEvent(new window.Event("input",{bubbles:true}));
  assert(ed.diagram.edges[0].color==="#ff0000", "選択線の色が変わる");
  assert(window.document.querySelector(".kzf-edge").getAttribute("stroke")==="#ff0000", "描画パスにstroke色が反映");

  // #XXXXXX 直接入力
  const hexInput = window.document.querySelector(".kzf-linepop input.kzf-hex");
  assert(!!hexInput, "#XXXXXX 直接入力の枠がある");
  hexInput.value="#00aa88"; hexInput.dispatchEvent(new window.Event("input",{bubbles:true}));
  assert(ed.diagram.edges[0].color==="#00aa88", "hex直接入力で線の色が変わる");
  assert(colorInput.value==="#00aa88", "hex入力でスウォッチも同期する");
  // #省略・3桁も受け付ける
  hexInput.value="abc"; hexInput.dispatchEvent(new window.Event("input",{bubbles:true}));
  assert(ed.diagram.edges[0].color==="#aabbcc", "#省略・3桁(abc)を #aabbcc として受け付ける");
} catch(e){ failed++; console.error("例外:", e&&e.stack?e.stack:e); }
console.log(failed?`\nFAILED (${failed})`:"\nALL PASS");
process.exit(failed?1:0);
