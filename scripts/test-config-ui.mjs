// 設定画面(config.js)を kintone モックで実際に描画し、シート種別が選択できるか実証する。
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";

const html = fs.readFileSync(path.join(root, "plugin/html/config.html"), "utf8");
const js = fs.readFileSync(path.join(root, "plugin/js/config.js"), "utf8");

let failed = 0;
const assert = (c, m) => { if (!c) { failed++; console.error("  ✗ " + m); } else console.log("  ✓ " + m); };

// 指定の保存設定でconfig画面を描画し、windowを返す
async function renderConfig(savedConfig, injectFields, masterFields) {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>${html}</body></html>`, {
    pretendToBeVisual: true, runScripts: "outside-only",
  });
  const { window } = dom;
  window.kintone = {
    $PLUGIN_ID: "testplugin",
    app: { getId: () => 1 },
    plugin: { app: { getConfig: () => savedConfig, setConfig: () => {} } },
  };
  window.fetch = () => Promise.reject(new Error("no network in test"));
  if (injectFields) window.__KZU_FIELDS__ = injectFields; // APIを呼ばずフィールドを注入
  if (masterFields) window.__KZU_MASTER_FIELDS__ = masterFields; // 参照先アプリの項目を注入
  window.eval(js);
  await new Promise((r) => setTimeout(r, 50));
  return window;
}

// 指定の wrap 内で、ラベルに sub を含む .kzu-config-field の select を返す
const selIn = (wrap, sub) => [...wrap.querySelectorAll(".kzu-config-field")]
  .find((f) => (f.querySelector(".kzu-config-label")?.textContent || "").includes(sub))?.querySelector("select");

try {
  const window = await renderConfig({}); // 新規（設定なし）

  console.log("[設定画面：レイアウト＋種別の2セレクト]");
  const card = window.document.querySelector(".kzu-card");
  assert(!!card, "ビュー設定カードが描画される");

  // レイアウト行に2つのセレクト（レイアウト／種別）が横並び
  const row = window.document.querySelector(".kzu-layout-row");
  assert(!!row, "レイアウト行(.kzu-layout-row)がある");
  const [layoutSel, kindSel] = [...row.querySelectorAll("select")];
  assert(!!layoutSel && !!kindSel, "レイアウトと種別の2セレクトが横並びにある");

  // レイアウトは「固定表示」「自由配置」の2種
  const layoutTexts = [...layoutSel.options].map((o) => o.textContent);
  assert(layoutTexts.join(",") === "固定表示,自由配置", "レイアウトは固定表示／自由配置の2種：" + layoutTexts.join("/"));

  // 固定表示のとき種別は 縦並び／横向き
  layoutSel.value = "fixed"; layoutSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert([...kindSel.options].map((o) => o.textContent).join(",") === "縦並び,横向き", "固定表示の種別は縦並び／横向き");
  const freeWrap = window.document.querySelector(".kzu-free-only");
  const fixedWrap = window.document.querySelector(".kzu-fixed-only");
  assert(freeWrap.style.display === "none", "固定表示では自由配置専用欄は隠れる");
  assert(!!fixedWrap && fixedWrap.style.display !== "none", "固定表示ではグループ化キー・グループ名・親・階層・並び順の欄が表示される");
  // 固定表示（自アプリ側）：グループ化キー・並び順・部門名・親部門コード・階層コードがセレクトで選べる
  assert(!!selIn(fixedWrap, "グループ化キー"), "グループ化キーがセレクトで選べる");
  assert(!!selIn(fixedWrap, "並び順"), "並び順フィールドがセレクトで選べる");
  assert(!!selIn(fixedWrap, "部門名フィールド"), "部門名フィールド（メンバー側）がセレクトで選べる");
  assert(!!selIn(fixedWrap, "親部門コードフィールド"), "親部門コードフィールド（メンバー側）がセレクトで選べる");
  assert(!!selIn(fixedWrap, "階層コードフィールド"), "階層コードフィールド（メンバー側）がセレクトで選べる");
  // 参照先アプリ（グルーピング元）の4項目も手入力ではなくセレクト
  assert(!!selIn(fixedWrap, "グルーピング元アプリの部門コード") && selIn(fixedWrap, "グルーピング元アプリの部門コード").tagName === "SELECT", "グルーピング元アプリの部門コードはセレクト（手入力ではない）");
  assert(!!selIn(fixedWrap, "グルーピング元アプリの親部門コード"), "グルーピング元アプリの親部門コードはセレクト");
  assert(!!selIn(fixedWrap, "グルーピング元アプリの階層コード"), "グルーピング元アプリの階層コードはセレクト");
  assert(!!selIn(fixedWrap, "グルーピング元アプリの部門名"), "グルーピング元アプリの部門名はセレクト");
  // 副表示フィールド名の表示ON/OFFトグルがあり、既定ON
  const subLabelChk = [...card.querySelectorAll('input[type="checkbox"]')].find((c) => (c.parentElement?.textContent || "").includes("フィールド名"));
  assert(!!subLabelChk && subLabelChk.checked === true, "副表示フィールド名の表示トグルがあり既定ON");

  // 自由配置のとき種別は 標準／正方形／円／ハニカム
  layoutSel.value = "free"; layoutSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert([...kindSel.options].map((o) => o.textContent).join(",") === "標準,正方形,円,ハニカム", "自由配置の種別は標準／正方形／円／ハニカム");
  assert(freeWrap.style.display !== "none", "自由配置では図アプリ等の欄が表示される");
  assert(fixedWrap.style.display === "none", "自由配置では階層キーの欄は隠れる");

  // ハニカムを選べる
  kindSel.value = "honeycomb"; kindSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(kindSel.value === "honeycomb", "自由配置＞ハニカムを選択できる");

  console.log("\n[保存済み設定の復元（round-trip）]");
  // 旧データ構造（mode=free, sheetType=honeycomb）が正しく復元される
  const w2 = await renderConfig({ views: JSON.stringify([{ mode: "free", sheetType: "honeycomb", targetViewId: "10", figAppId: "128" }]) });
  const row2 = w2.document.querySelector(".kzu-layout-row");
  const [lay2, kind2] = [...row2.querySelectorAll("select")];
  assert(lay2.value === "free", "保存済みの自由配置がレイアウト=自由配置で復元される");
  assert(kind2.value === "honeycomb", "保存済みのハニカムが種別=ハニカムで復元される");

  // 固定表示（横向き＝treeh）の復元
  const w3 = await renderConfig({ views: JSON.stringify([{ mode: "treeh", targetViewId: "11" }]) });
  const [lay3, kind3] = [...w3.document.querySelector(".kzu-layout-row").querySelectorAll("select")];
  assert(lay3.value === "fixed", "保存済みの組織ツリー横がレイアウト=固定表示で復元される");
  assert(kind3.value === "treeh", "種別=横向きで復元される");

  console.log("\n[グループ化キー・親：書き込み不可の項目を除外／階層は数値のみ]");
  const fields = [
    { code: "dept_code", label: "部門コード", type: "SINGLE_LINE_TEXT" },
    { code: "parent_code", label: "親部門コード", type: "SINGLE_LINE_TEXT" },
    { code: "level_num", label: "階層", type: "NUMBER" },
    { code: "calc_code", label: "計算コード", type: "CALC" },
    { code: "lookup_code", label: "ルックアップ部門", type: "SINGLE_LINE_TEXT", lookup: true },
    { code: "recno", label: "レコード番号", type: "RECORD_NUMBER" },
  ];
  const w4 = await renderConfig({}, fields);
  const fixedWrap4 = w4.document.querySelector(".kzu-fixed-only");
  // ラベルで各セレクトを特定（並び順の配置変更に強くする）
  const selByLabel = (sub) => [...fixedWrap4.querySelectorAll(".kzu-config-field")]
    .find((f) => (f.querySelector(".kzu-config-label")?.textContent || "").includes(sub))?.querySelector("select");
  const idSel = selByLabel("グループ化キー");
  const parentSel = selByLabel("親部門コードフィールド");
  const levelSel = selByLabel("階層コードフィールド");
  const sortSel = selByLabel("並び順");
  const idCodes = [...idSel.options].map((o) => o.value);
  const parentCodes = [...parentSel.options].map((o) => o.value);
  // グループ化キーはメンバー異動で書き換えるので書き込み可能なものだけ
  assert(idCodes.includes("dept_code"), "書き込み可能な文字列はグループ化キーに選べる");
  assert(!idCodes.includes("calc_code") && !idCodes.includes("recno"), "計算・レコード番号はグループ化キーに選べない");
  // 親フィールドは書き込みが必要なので計算/レコード番号を除外。ルックアップはAPIで書けるので許可。
  assert(parentCodes.includes("parent_code"), "書き込み可能な文字列フィールドは親フィールドの選択肢に出る");
  assert(!parentCodes.includes("calc_code"), "計算フィールドは親フィールドの選択肢から除外される");
  assert(parentCodes.includes("lookup_code"), "ルックアップフィールドは親フィールドに選べる（APIで書き込み可能）");
  assert(idCodes.includes("lookup_code"), "ルックアップフィールドはグループ化キーに選べる（APIで書き込み可能）");
  assert(!parentCodes.includes("recno"), "レコード番号は親フィールドの選択肢から除外される");
  // 階層フィールドは数値フィールドのみ
  const levelCodes = [...levelSel.options].map((o) => o.value);
  assert(levelCodes.includes("level_num"), "数値フィールドは階層フィールドに選べる");
  assert(!levelCodes.includes("dept_code") && !levelCodes.includes("calc_code"), "数値でないフィールドは階層フィールドに選べない");
  // 並び順は任意なので先頭に空欄（未指定）がある
  assert([...sortSel.options].some((o) => o.value === ""), "並び順フィールドは未指定（空欄）を選べる");

  console.log("\n[グルーピング元アプリ：参照先の項目一覧から選択できる]");
  const masterFields = [
    { code: "Department_CD", label: "部門CD", type: "SINGLE_LINE_TEXT" },
    { code: "親部門コード", label: "親部門CD", type: "SINGLE_LINE_TEXT" },
    { code: "layerCD", label: "階層", type: "NUMBER" },
    { code: "表示部門名", label: "部門名", type: "SINGLE_LINE_TEXT" },
    { code: "備考", label: "備考", type: "MULTI_LINE_TEXT" },
  ];
  const savedMaster = {
    mode: "tree", targetViewId: "5", treeIdField: "部門コード",
    treeMasterAppId: "4", treeMasterKeyField: "Department_CD",
    treeMasterParentField: "親部門コード", treeMasterLevelField: "layerCD", treeMasterNameField: "表示部門名",
  };
  const w5 = await renderConfig({ views: JSON.stringify([savedMaster]) }, fields, masterFields);
  const fixedWrap5 = w5.document.querySelector(".kzu-fixed-only");
  const mKey = selIn(fixedWrap5, "グルーピング元アプリの部門コード");
  const mParent = selIn(fixedWrap5, "グルーピング元アプリの親部門コード");
  const mLevel = selIn(fixedWrap5, "グルーピング元アプリの階層コード");
  const mName = selIn(fixedWrap5, "グルーピング元アプリの部門名");
  const vals = (sel) => [...sel.options].map((o) => o.value);
  // 参照先アプリの項目が選択肢に並ぶ
  assert(vals(mKey).includes("Department_CD") && vals(mKey).includes("備考"), "部門コードの選択肢に参照先の項目が並ぶ");
  // 保存済みの値が選択状態で復元される
  assert(mKey.value === "Department_CD", "保存済みの部門コードが選択状態で復元される");
  assert(mParent.value === "親部門コード", "保存済みの親部門コードが選択状態で復元される");
  assert(mName.value === "表示部門名", "保存済みの部門名が選択状態で復元される");
  // 階層コードは数値フィールドのみ（文字列は出ない）
  assert(vals(mLevel).includes("layerCD"), "階層コードに数値フィールドが出る");
  assert(!vals(mLevel).includes("Department_CD") && !vals(mLevel).includes("備考"), "階層コードに数値以外は出ない");
  assert(mLevel.value === "layerCD", "保存済みの階層コードが選択状態で復元される");
} catch (e) {
  failed++; console.error("例外:", e && e.stack ? e.stack : e);
}
console.log(failed ? `\nFAILED (${failed})` : "\nALL PASS");
process.exit(failed ? 1 : 0);
