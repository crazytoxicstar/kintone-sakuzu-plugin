// グループ化＋メンバー異動のテスト：同キーを1部門に集約、メンバーを別部門へ動かすと部門コード等を書き換える。
import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";

const res = await build({
  stdin: { contents: `export { TreeModel } from "${root}/src/tree/model";`, resolveDir: root, loader: "ts" },
  bundle: true, write: false, format: "cjs", platform: "node", logLevel: "silent",
});
const mod = { exports: {} };
new Function("module", "exports", res.outputFiles[0].text)(mod, mod.exports);
const { TreeModel } = mod.exports;

let failed = 0;
const assert = (c, m) => { if (!c) { failed++; console.error("  ✗ " + m); } else console.log("  ✓ " + m); };

// 1レコード＝1人。rec(社員, 部門, 親部門, 階層, 部門名, 氏名)
const rec = (id, g, p, lv, gn, nm) => ({ recordId: id, groupId: g, parentId: p, level: lv, sortKey: g, groupName: gn, main: nm, subs: [] });
const recs = [
  rec("E1", "D0", "", 1, "代表", "佐藤"),
  rec("E2", "D1", "D0", 2, "管理本部", "伊藤"),
  rec("E3", "D1", "D0", 2, "管理本部", "田中"), // 同じ部門に2人
  rec("E4", "D2", "D0", 2, "営業本部", "山本"),
  rec("E5", "D21", "D2", 3, "第一営業部", "中村"),
];
const m = new TreeModel(recs);

console.log("[グループ化：同じ部門コードは1つの部門枠に集約]");
assert(m.list().length === 4, "部門数は4（D0,D1,D2,D21）:" + m.list().length);
assert(m.memberCount("D1") === 2, "管理本部は2人");
assert(m.get("D1").members.map((x) => x.main).join(",") === "伊藤,田中", "メンバーが箱の中に入る");

console.log("[部門ツリー：親/階層で親子と段]");
assert(m.roots().map((n) => n.nodeId).join(",") === "D0", "最上位はD0");
assert(m.childrenOf("D0").map((n) => n.nodeId).join(",") === "D1,D2", "D0の子はD1,D2");
assert(m.rowOf("D0") === 0 && m.rowOf("D2") === 1 && m.rowOf("D21") === 2, "段は階層フィールド");
assert(m.subtreeMemberCount("D2") === 2, "営業本部配下は2名");

console.log("[メンバー異動：別部門へ動かすと部門コード・親・階層を異動先に合わせる]");
const ch = m.planMoveMember("E3", "D2"); // 田中を管理本部→営業本部へ
assert(ch.length === 1 && ch[0].recordId === "E3", "対象は本人1件のみ");
assert(ch[0].after.groupId === "D2" && ch[0].after.parentId === "D0" && ch[0].after.level === 2, "異動先D2の値に書き換え");
m.apply(ch);
assert(m.memberCount("D1") === 1 && m.memberCount("D2") === 2, "管理1・営業2に変わる");
assert(m.groupOfMember("E3").nodeId === "D2", "田中の所属がD2に");

console.log("[同じ部門への異動・存在しない部門は変更なし]");
assert(m.planMoveMember("E3", "D2").length === 0, "同じ部門へは異動なし");
assert(m.planMoveMember("E3", "NONE").length === 0, "存在しない部門へは変更なし");

console.log("[外部マスタ参照：メンバーのいない中間部門も表示・配下が宙ぶらりんにならない]");
// メンバーは D11(第一営業部配下) にしかいないが、マスタで D1→D11 の階層を定義
const defs = [
  { groupId: "D0", parentId: "", level: 1, groupName: "代表" },
  { groupId: "D1", parentId: "D0", level: 2, groupName: "営業本部" },
  { groupId: "D11", parentId: "D1", level: 3, groupName: "第一営業部" },
  { groupId: "D111", parentId: "D11", level: 4, groupName: "首都圏" },
];
// メンバーは首都圏(D111)にだけ在籍。第一営業部(D11)は空。
const mm = new TreeModel([rec("E9", "D111", "", 4, "", "田所")], defs);
assert(mm.list().length === 4, "マスタの全部門（空含む）がノードになる:" + mm.list().length);
assert(mm.get("D11").members.length === 0, "第一営業部は空ノード");
assert(mm.get("D111").parentId === "D11" && mm.get("D11").parentId === "D1", "首都圏→第一営業部→営業本部と繋がる（宙ぶらりんにならない）");
assert(mm.roots().map((n) => n.nodeId).join(",") === "D0", "最上位はD0のみ（孤立なし）");
// マスタに無いキーのメンバーは検知
const unk = new TreeModel([rec("E", "NOPE", "", 2, "", "X")], defs);
assert(unk.diagnostics().unknownGroup === 1, "マスタ未登録の部門コードを検知");

console.log("[データ不備]");
const miss = new TreeModel([rec("E", "X", "NOPE", 2, "孤立", "A")]);
assert(miss.diagnostics().missingParent === 1, "親キーが実在しない部門を検知");
const emp = new TreeModel([rec("E", "", "", 1, "キー空", "A")]);
assert(emp.diagnostics().emptyKey === 1, "グループキー空のレコードを検知");
const cyc = new TreeModel([rec("a", "A", "B", 1, "A", "x"), rec("b", "B", "A", 1, "B", "y")]);
assert(cyc.descendants("A").length <= 2, "循環でも無限ループしない");

console.log(failed ? `\nFAILED (${failed})` : "\nALL PASS");
process.exit(failed ? 1 : 0);
