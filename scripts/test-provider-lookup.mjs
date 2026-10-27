// グループキーがルックアップのコピー先のとき、異動の書き込みが
// 「コピー先(dept_code)」ではなく「ルックアップ本体(search部門検索)」へ、正しいキー値で行われることを実証する。
import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";

// @kintone/rest-api-client をスタブに差し替えてバンドル（ネットワーク無し）
const stub = {
  name: "stub-krc",
  setup(b) {
    b.onResolve({ filter: /^@kintone\/rest-api-client$/ }, () => ({ path: "krc", namespace: "stub" }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({
      contents: "export class KintoneRestAPIClient{ constructor(){ this.record = globalThis.__STUB_RECORD__; this.app = {}; } }",
      loader: "js",
    }));
  },
};
const res = await build({
  stdin: { contents: `export { KintoneProvider } from "${root}/src/tree/providers";`, resolveDir: root, loader: "ts" },
  bundle: true, write: false, format: "cjs", platform: "node", logLevel: "silent", plugins: [stub],
});
const mod = { exports: {} };
new Function("module", "exports", "require", res.outputFiles[0].text)(mod, mod.exports, () => ({}));
const { KintoneProvider } = mod.exports;

let failed = 0;
const assert = (c, m) => { if (!c) { failed++; console.error("  ✗ " + m); } else console.log("  ✓ " + m); };

// メンバーアプリ(=1)：田中(E3=レコード3)は現在 D1。dept_code はルックアップのコピー先。
const memberRecs = [
  { $id: { value: "3" }, dept_code: { value: "D1" }, 氏名: { value: "田中" } },
];
// グルーピング元アプリ(=4)：Department_CD と、ルックアップのキー search部門名 を持つ
const masterRecs = [
  { $id: { value: "10" }, Department_CD: { value: "D0" }, search部門名: { value: "代表名" }, 親部門コード: { value: "" }, layerCD: { value: "1" }, 表示部門名: { value: "代表" } },
  { $id: { value: "11" }, Department_CD: { value: "D1" }, search部門名: { value: "管理名" }, 親部門コード: { value: "D0" }, layerCD: { value: "2" }, 表示部門名: { value: "管理本部" } },
  { $id: { value: "12" }, Department_CD: { value: "D2" }, search部門名: { value: "営業名" }, 親部門コード: { value: "D0" }, layerCD: { value: "2" }, 表示部門名: { value: "営業本部" } },
];

const calls = { updates: [] };
let verifyValue = "D2"; // getRecords が返す dept_code（kintone がコピー先を自動更新した想定）
globalThis.__STUB_RECORD__ = {
  getAllRecords: async ({ app }) => (app === 4 ? masterRecs : memberRecs),
  updateRecords: async ({ app, records }) => { calls.updates.push({ app, records }); return { records: [] }; },
  getRecords: async () => ({ records: [{ $id: { value: "3" }, dept_code: { value: verifyValue } }] }),
};

const master = { appId: 4, keyField: "Department_CD", parentField: "親部門コード", levelField: "layerCD", nameField: "表示部門名", writeKeyMasterField: "search部門名" };
const keys = { idField: "dept_code", parentField: "", levelField: "", groupNameField: "", sortField: "", master, idWriteField: "search部門検索" };

try {
  const p = new KintoneProvider(1, keys, { mainField: "氏名", subFields: [], fieldLabels: {} });
  const loaded = await p.load();

  console.log("[ルックアップのコピー先：本体フィールドへキー値を書く]");
  assert(loaded.groupDefs && loaded.groupDefs.length === 3, "マスタから3部門を読む");

  // 田中(3)を D1 → D2 へ異動
  const change = { recordId: "3", before: { groupId: "D1", parentId: "D0", level: 2 }, after: { groupId: "D2", parentId: "D0", level: 2 } };
  await p.apply([change]);

  assert(calls.updates.length === 1, "updateRecords が1回呼ばれる");
  const payload = calls.updates[0];
  assert(payload.app === 1, "書き込み先は自アプリ(=1)。参照先アプリ(4)ではない:" + payload.app);
  const rec = payload.records[0].record;
  assert(!!rec["search部門検索"], "ルックアップ本体フィールド search部門検索 に書く");
  assert(rec["search部門検索"].value === "営業名", "本体に書く値は異動先D2のキー search部門名=営業名:" + JSON.stringify(rec["search部門検索"]));
  assert(!rec["dept_code"], "コピー先 dept_code は直接書かない（kintoneが自動更新）");
  assert(payload.records[0].id === "3", "対象レコードは本人(3)");

  console.log("[検証：コピー先が異動先に更新されていれば成功]");
  // verifyValue=D2 なので verifySaved は例外を投げないはず（ここまで到達＝成功）
  assert(true, "保存検証を通過（dept_code が D2 に更新済み）");

  console.log("[異動先のキーがマスタに無い場合は明確に失敗]");
  let threw = "";
  try {
    await p.apply([{ recordId: "3", before: { groupId: "D1" }, after: { groupId: "D999", parentId: "", level: 2 } }]);
  } catch (e) { threw = (e && e.code) || ""; }
  assert(threw === "LOOKUP_KEY_NOT_FOUND", "キー未発見は LOOKUP_KEY_NOT_FOUND で失敗:" + threw);

  console.log("[検証：反映されていなければ例外]");
  verifyValue = "D1"; // 更新されなかった想定
  let threw2 = "";
  try {
    await p.apply([change]);
  } catch (e) { threw2 = (e && e.code) || ""; }
  assert(threw2 === "SAVE_NOT_REFLECTED", "未反映は SAVE_NOT_REFLECTED で失敗:" + threw2);

  console.log("\n[素のFK（マスタ参照）：異動で部門コード・親・階層・部門名をまとめて更新]");
  // 部門コードが素のフィールド（ルックアップのコピー先ではない）。idWriteField なし。
  const keys2 = { idField: "dept_code", parentField: "親部門コード", levelField: "階層コード", groupNameField: "部門名", sortField: "", master, idWriteField: undefined };
  const p2 = new KintoneProvider(1, keys2, { mainField: "氏名", subFields: [], fieldLabels: {} });
  await p2.load();
  verifyValue = "D2";
  calls.updates.length = 0;
  // 異動先D2（親D0・階層2・部門名「営業本部」）。after.groupName はモデルが target から埋める。
  const ch2 = { recordId: "3", before: { groupId: "D1", parentId: "D0", level: 2, groupName: "管理本部" }, after: { groupId: "D2", parentId: "D0", level: 2, groupName: "営業本部" } };
  await p2.apply([ch2]);
  assert(calls.updates.length === 1, "updateRecords が1回呼ばれる");
  const rec2 = calls.updates[0].records[0].record;
  assert(rec2["dept_code"]?.value === "D2", "部門コードを異動先に更新");
  assert(rec2["親部門コード"]?.value === "D0", "親部門コードを異動先に更新");
  assert(rec2["階層コード"]?.value === "2", "階層コードを異動先に更新");
  assert(rec2["部門名"]?.value === "営業本部", "部門名を異動先に更新");
} catch (e) {
  failed++; console.error("例外:", e && e.stack ? e.stack : e);
}
console.log(failed ? `\nFAILED (${failed})` : "\nALL PASS");
process.exit(failed ? 1 : 0);
