// 図データをビューごとに分ける選択ロジックの検証。
import { build } from "esbuild";
import path from "node:path"; import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const res = await build({ stdin:{contents:`export { pickDiagramForView } from "${root}/src/free/fig-select";`,resolveDir:root,loader:"ts"}, bundle:true, write:false, format:"cjs", platform:"node", logLevel:"silent"  });
const m={exports:{}}; new Function("module","exports",res.outputFiles[0].text)(m,m.exports);
const { pickDiagramForView } = m.exports;
let failed=0; const assert=(c,x)=>{ if(!c){failed++;console.error("  ✗ "+x);} else console.log("  ✓ "+x); };
const rec=(id,viewId,name)=>({ "$id":{value:String(id)}, data:{value:JSON.stringify({viewId,name,nodes:[]})} });

console.log("[ビューごとに別の図]");
const records=[ rec(1,"2100","A図"), rec(2,"2200","B図"), rec(3,"2300","C図") ];
const p=pickDiagramForView(records,"data","2200");
assert(p && p.recordId==="2" && p.diagram.name==="B図", "viewId一致の図を選ぶ（2200→B図）");
assert(p && p.adoptedLegacy===false, "一致時はlegacy扱いではない");
const none=pickDiagramForView(records,"data","9999");
assert(none===null, "一致が無ければnull（そのビューは新規＝空キャンバス）");

console.log("\n[旧データ（viewId未設定）の引き継ぎ]");
const legacy=[ rec(5,undefined,"旧図") ];
const lp=pickDiagramForView(legacy,"data","2100");
assert(lp && lp.recordId==="5" && lp.adoptedLegacy===true, "viewId未設定の旧図を1件だけ引き継ぐ");
// 旧図があっても、現ビューの図が別にあればそちらを優先
const mix=[ rec(5,undefined,"旧図"), rec(6,"2100","新A図") ];
const mp=pickDiagramForView(mix,"data","2100");
assert(mp && mp.recordId==="6" && mp.adoptedLegacy===false, "viewId一致を旧データより優先");

console.log(failed?`\nFAILED (${failed})`:"\nALL PASS");
process.exit(failed?1:0);
