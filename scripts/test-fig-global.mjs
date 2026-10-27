// 図データアプリ設定がプラグイン単位（全ビュー共通）になったことの検証：移行・保存・読み込み。
import { build } from "esbuild";
import path from "node:path"; import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const res = await build({ stdin:{contents:`export * from "${root}/src/shared/types";`,resolveDir:root,loader:"ts"}, bundle:true, write:false, format:"cjs", platform:"node", logLevel:"silent" });
const m={exports:{}}; new Function("module","exports",res.outputFiles[0].text)(m,m.exports);
const { parseConfig, serializeConfig } = m.exports;
let failed=0; const assert=(c,x)=>{ if(!c){failed++;console.error("  ✗ "+x);} else console.log("  ✓ "+x); };

console.log("[図データアプリ設定＝全ビュー共通]");
// 新形式：トップレベルのキーで保持
const saved = serializeConfig({ views:[{mode:"free",sheetType:"normal",targetViewId:"10"}], figAppId:"128", figNameField:"name", figDataField:"data", figSourceField:"source_app" });
assert(saved.figAppId==="128", "serializeでfigAppIdがトップレベルに保存される");
const back = parseConfig(saved);
assert(back.figAppId==="128", "parseでfigAppIdをトップレベルから読む");
assert(back.views.length===1 && !("figAppId" in back.views[0]), "ビューにはfigAppIdを持たない");

console.log("\n[旧データからの移行]");
// 旧：各ビューのJSON内にfigAppIdが入っていた
const legacy = { views: JSON.stringify([{mode:"free",sheetType:"honeycomb",targetViewId:"10",figAppId:"6",figNameField:"zu_name",figDataField:"zu_data",figSourceField:"src"}]) };
const mig = parseConfig(legacy);
assert(mig.figAppId==="6", "旧ビュー内のfigAppIdをグローバルへ移行("+mig.figAppId+")");
assert(mig.figNameField==="zu_name" && mig.figDataField==="zu_data" && mig.figSourceField==="src", "フィールドコードも移行");
assert(mig.views[0].mode==="free" && mig.views[0].sheetType==="honeycomb", "ビュー側のmode/sheetTypeは維持");

console.log("\n[未設定の既定値]");
const def = parseConfig({ views: JSON.stringify([{mode:"tree",targetViewId:"1"}]) });
assert(def.figNameField==="name" && def.figDataField==="data" && def.figSourceField==="source_app", "既定は name/data/source_app");
assert(def.figAppId==="", "図アプリ未設定は空");

console.log(failed?`\nFAILED (${failed})`:"\nALL PASS");
process.exit(failed?1:0);
