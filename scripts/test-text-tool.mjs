// 文字ツールのヘッドレステスト（jsdom + esbuild）
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";

// テスト用エントリを文字列からバンドル
const entry = `
import { FREE_DEMO_RECORDS } from "${root}/src/free/free-demo-data";
import { FreeEditor } from "${root}/src/free/free-view";
class P {
  writable = true; label = "t";
  async loadRecords(){ return FREE_DEMO_RECORDS.map(r=>({...r,subs:r.subs.map(s=>({...s}))})); }
  async loadDiagram(){ return null; }
  async saveDiagram(){}
  recordUrl(){ return "#"; }
}
window.__mkEditor = async () => {
  const host = document.getElementById("app");
  const ed = new FreeEditor(host, new P(), 0, { openInNewTab:true, sheetType:"normal" });
  await ed.mount();
  window.__ed = ed;
  return ed;
};
`;

const res = await build({
  stdin: { contents: entry, resolveDir: root, loader: "ts" },
  bundle: true, write: false, format: "iife", platform: "browser", logLevel: "silent",
});
const code = res.outputFiles[0].text;

const dom = new JSDOM(`<!doctype html><html><head></head><body><div id="app"></div></body></html>`, {
  pretendToBeVisual: true, runScripts: "outside-only",
});
const { window } = dom;
// 最低限のスタブ
// window.prompt は使わない（アプリ内ダイアログ実装の検証のため意図的にエラーにする）
window.prompt = () => { throw new Error("window.prompt must not be used"); };
window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
window.SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 80, height: 20 });
window.Element.prototype.getBoundingClientRect = function () {
  return { x: 0, y: 0, left: 0, top: 0, width: 900, height: 560, right: 900, bottom: 560 };
};

let failed = 0;
const assert = (cond, msg) => { if (!cond) { failed++; console.error("  ✗ " + msg); } else console.log("  ✓ " + msg); };

try {
  window.eval(code);
  const ed = await window.__ed ?? await window.__mkEditor();
  const diagram = ed.diagram;

  console.log("[文字ツール]");
  // 1) ツールバーに文字ボタンとポップが存在
  const textBtn = [...window.document.querySelectorAll(".kzf-btn")].find((b) => b.textContent === "文字");
  assert(!!textBtn, "ツールバーに「文字」ボタンがある");
  assert(window.document.querySelectorAll(".kzf-decobtn").length === 3, "装飾ボタン(B/I/U)が3つある");
  assert(!!window.document.querySelector(".kzf-color"), "色ピッカーがある");
  assert(!!window.document.querySelector("select.kzf-linesel"), "大きさセレクトがある");

  // 2) 文字モードON
  textBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert(ed.textMode === true, "クリックで文字モードがONになる");

  // 3) 背景クリックでアプリ内入力ダイアログが開き、OKで文字が配置される
  const svg = window.document.querySelector(".kzf-svg");
  const rects = [...svg.querySelectorAll("rect")];
  const bg = rects.find((r) => r.getAttribute("width") === "200000") || rects[0];
  const tick = () => new Promise((r) => setTimeout(r, 0));
  // placeText は非同期：pointerdown→モーダルのinputに入力→OK
  const placeText = async (cx, cy, value) => {
    bg.dispatchEvent(new window.PointerEvent("pointerdown", { bubbles: true, clientX: cx, clientY: cy }));
    await tick();
    const input = window.document.querySelector(".kzf-overlay input.kzf-textinput");
    if (!input) return false;
    input.value = value;
    const ok = window.document.querySelector(".kzf-overlay .kzf-primary");
    ok.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await tick();
    return true;
  };
  const opened = await placeText(200, 150, "見出しテキスト");
  assert(opened, "背景クリックでアプリ内入力ダイアログ(window.prompt非依存)が開く");
  const texts = diagram.shapes.filter((s) => s.type === "text");
  assert(texts.length === 1, "OKで文字シェイプが1つ追加される");
  assert(texts[0].text === "見出しテキスト", "入力テキストが反映される");
  assert(texts[0].fontSize === "m", "既定サイズは中(m)");
  assert(window.document.querySelector(".kzf-overlay") == null, "確定後はダイアログが閉じる");

  // 4) SVGに<text>が描画される
  assert(window.document.querySelectorAll(".kzf-text text").length === 1, "SVGにtext要素が描画される");

  // 5) 装飾（太字）を既定に反映してから新規配置
  const boldBtn = window.document.querySelector(".kzf-decobtn.kzf-deco-b");
  boldBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert(ed.textDefaults.bold === true, "太字トグルで既定がboldになる");
  await placeText(300, 200, "二つ目");
  const t2 = diagram.shapes.filter((s) => s.type === "text");
  assert(t2.length === 2, "2つ目の文字が追加される");
  assert(t2[1].bold === true, "2つ目の文字はboldで配置される");

  // 5b) キャンセルすると配置されない
  bg.dispatchEvent(new window.PointerEvent("pointerdown", { bubbles: true, clientX: 350, clientY: 250 }));
  await tick();
  const cancelBtn = window.document.querySelector(".kzf-overlay .kzf-ghost");
  cancelBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await tick();
  assert(diagram.shapes.filter((s) => s.type === "text").length === 2, "キャンセル時は文字が増えない");

  // 6) サイズ変更（大）→既定font-sizeが l（文字ツールのサイズselectを特定）
  const sizeSel = [...window.document.querySelectorAll("select.kzf-linesel")].find(
    (s) => [...s.options].some((o) => o.value === "l" && o.textContent === "大")
  );
  assert(!!sizeSel, "文字ツールのサイズselectが特定できる");
  sizeSel.value = "l"; sizeSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(ed.textDefaults.fontSize === "l", "サイズ=大が既定に反映される");

  // 6b) ダブルクリックで再編集（内容を書き換え）
  const firstText = window.document.querySelector(".kzf-text");
  firstText.dispatchEvent(new window.MouseEvent("dblclick", { bubbles: true }));
  await tick();
  const editInput = window.document.querySelector(".kzf-overlay input.kzf-textinput");
  assert(!!editInput, "ダブルクリックで編集ダイアログが開く");
  assert(editInput.value === "見出しテキスト", "既存のテキストが初期値に入る");
  editInput.value = "編集後テキスト";
  window.document.querySelector(".kzf-overlay .kzf-primary").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await tick();
  assert(diagram.shapes.some((s) => s.type === "text" && s.text === "編集後テキスト"), "再編集で内容が書き換わる");
  assert(diagram.shapes.filter((s) => s.type === "text").length === 2, "再編集で件数は増減しない");

  // 6c) 選択中にEnterキーで再編集できる
  const sel1 = window.document.querySelector(".kzf-text");
  sel1.dispatchEvent(new window.PointerEvent("pointerdown", { bubbles: true, clientX: 200, clientY: 150 }));
  window.document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await tick();
  assert(!!window.document.querySelector(".kzf-overlay input.kzf-textinput"), "Enterキーで編集ダイアログが開く");
  window.document.querySelector(".kzf-overlay .kzf-ghost").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await tick();

  // 6d) 編集で空にすると削除される
  const beforeCnt = diagram.shapes.filter((s) => s.type === "text").length;
  const delTarget = window.document.querySelector(".kzf-text");
  delTarget.dispatchEvent(new window.MouseEvent("dblclick", { bubbles: true }));
  await tick();
  const clrInput = window.document.querySelector(".kzf-overlay input.kzf-textinput");
  clrInput.value = "";
  window.document.querySelector(".kzf-overlay .kzf-primary").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await tick();
  assert(diagram.shapes.filter((s) => s.type === "text").length === beforeCnt - 1, "編集で空にすると文字が削除される");

  // 7) 文字を選択してから削除（残りを配置して確認）
  await placeText(220, 160, "削除用");
  const g = window.document.querySelector(".kzf-text");
  g.dispatchEvent(new window.PointerEvent("pointerdown", { bubbles: true, clientX: 200, clientY: 150 }));
  assert(ed.selShape != null, "文字クリックで選択される");
  const delBtn = [...window.document.querySelectorAll(".kzf-btn")].find((b) => b.textContent === "削除");
  delBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert(diagram.shapes.filter((s) => s.type === "text").length === 1, "削除で選択中の文字が1つ減る");

  // 8) 文字モードと接続モードは排他
  const connBtn = [...window.document.querySelectorAll(".kzf-btn")].find((b) => b.textContent === "ライン");
  if (connBtn) {
    if (!ed.textMode) textBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    connBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    assert(ed.textMode === false, "接続モードONで文字モードが解除される");
  }
  if (ed.textMode) textBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  if (ed.connectMode) connBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

  console.log("\n[パレット（選択リスト）の副表示]");
  const recs = await ed.provider.loadRecords();
  const withSubs = recs.find((r) => r.subs && r.subs.length) || recs[0];
  // パレット項目に主表示＋副表示が横並びで入る
  const palItems = [...window.document.querySelectorAll(".kzf-pal-item")];
  assert(palItems.length > 0, "パレットにレコードが並ぶ");
  const palMain = palItems[0].querySelector(".kzf-pal-main");
  const palSub = palItems[0].querySelector(".kzf-pal-sub");
  const palLine = palItems[0].querySelector(".kzf-pal-line");
  assert(!!palMain && palMain.textContent.length > 0, "パレット項目に主表示が出る");
  assert(withSubs.subs.length === 0 || (!!palSub && palSub.textContent.length > 0), "パレット項目に副表示が横並びで出る");
  // 省略はCSS（text-overflow:ellipsis）で行うため1行コンテナである
  assert(!!palLine, "主表示＋副表示は1行コンテナ(.kzf-pal-line)に入る");

  console.log("\n[配置カードは元の仕様（副表示は下に積む）]");
  diagram.nodes.length = 0; diagram.edges.length = 0; ed.selNodes.clear();
  const mkNode = (rid, x, y) => ({ id: "node_" + rid, recordId: rid, x, y, w: 190, h: 60, shape: "rect", color: "#3498db", label: rid });
  diagram.nodes.push(mkNode(withSubs.recordId, 0, 0));
  ed.render();
  const nodeG = window.document.querySelector(".kzf-node");
  assert(!!nodeG.querySelector("text.kzf-main"), "カードは主表示を独立したtextで描画（元の仕様）");
  if (withSubs.subs.length) {
    assert(nodeG.querySelectorAll("text.kzf-sub").length === Math.min(withSubs.subs.length, 5), "副表示は下に積まれる(.kzf-sub)");
  }
  assert(nodeG.querySelector("tspan.kzf-sub-inline") == null, "横並びtspanは使われない（元の仕様に復帰）");

  console.log("\n[重なり禁止]");
  // クリーンな状態でノードを2つ用意
  diagram.nodes.length = 0; diagram.edges.length = 0; ed.selNodes.clear();
  diagram.nodes.push(mkNode(recs[0].recordId, 0, 0));
  diagram.nodes.push(mkNode(recs[1].recordId, 400, 0));
  ed.render();
  assert(ed.wouldOverlap(10, 10, 190, 60, new Set()) === true, "既存ノードに重なる位置はwouldOverlap=true");
  assert(ed.wouldOverlap(400, 0, 190, 60, "node_" + recs[1].recordId) === false, "自分自身は除外して判定できる");
  assert(ed.wouldOverlap(0, 200, 190, 60, new Set()) === false, "離れた位置はwouldOverlap=false");
  // resolvePlacement は重なる希望位置を空き位置へずらす
  const resolved = ed.resolvePlacement(5, 5, 190, 60);
  assert(ed.wouldOverlap(resolved.x, resolved.y, 190, 60, new Set()) === false, "resolvePlacementは重ならない位置を返す");

  console.log("\n[まとめて選択・削除]");
  // Shift相当の追加選択
  ed.selectNode("node_" + recs[0].recordId);
  ed.selectNode("node_" + recs[1].recordId, true);
  assert(ed.selNodes.size === 2, "追加選択で2ノードが選択される");
  // 範囲選択（全ノードを囲む矩形）: startMarquee をpointerdown/move/upで再現
  ed.selNodes.clear(); ed.render();
  const svg2 = window.document.querySelector(".kzf-svg");
  const bg2 = [...svg2.querySelectorAll("rect")].find((r) => r.getAttribute("width") === "200000");
  // 範囲選択モードON
  const marqueeBtn = [...window.document.querySelectorAll(".kzf-btn")].find((b) => b.textContent === "選択");
  assert(!!marqueeBtn, "ツールバーに「選択」ボタンがある");
  marqueeBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert(ed.marqueeMode === true, "範囲選択モードがONになる");
  bg2.dispatchEvent(new window.PointerEvent("pointerdown", { bubbles: true, clientX: 10, clientY: 10 }));
  window.dispatchEvent(new window.PointerEvent("pointermove", { bubbles: true, clientX: 890, clientY: 550 }));
  window.dispatchEvent(new window.PointerEvent("pointerup", { bubbles: true, clientX: 890, clientY: 550 }));
  assert(ed.selNodes.size === 2, "範囲選択で矩形内の2ノードが選択される");
  // 一括削除
  const delBtn2 = [...window.document.querySelectorAll(".kzf-btn")].find((b) => b.textContent === "削除");
  delBtn2.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert(diagram.nodes.length === 0, "選択した2ノードが一括削除される");
  // selectAllNodes
  diagram.nodes.push(mkNode(recs[0].recordId, 0, 0), mkNode(recs[1].recordId, 400, 0), mkNode(recs[2].recordId, 0, 200));
  ed.render(); ed.selectAllNodes();
  assert(ed.selNodes.size === 3, "selectAllNodesで全ノードが選択される");
} catch (e) {
  failed++; console.error("例外:", e);
}

console.log(failed ? `\nFAILED (${failed})` : "\nALL PASS");
process.exit(failed ? 1 : 0);
