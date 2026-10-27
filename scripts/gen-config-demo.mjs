// プラグイン設定画面のデモHTMLを生成（kintone不要）。__KZU_FIELDS__ でサンプルの配置マスタ項目を注入。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";

const body = fs.readFileSync(path.join(root, "plugin/html/config.html"), "utf8");
const css = fs.readFileSync(path.join(root, "plugin/css/config.css"), "utf8");
const js = fs.readFileSync(path.join(root, "plugin/js/config.js"), "utf8");

// サンプル：メンバーアプリ（人）のフィールド
const FIELDS = [
  { code: "社員番号", label: "社員番号", type: "SINGLE_LINE_TEXT" },
  { code: "氏名", label: "氏名", type: "SINGLE_LINE_TEXT" },
  { code: "部門コード", label: "部門コード", type: "SINGLE_LINE_TEXT" },
  { code: "部門名", label: "部門名", type: "SINGLE_LINE_TEXT" },
  { code: "役職名", label: "役職名", type: "SINGLE_LINE_TEXT" },
  { code: "主務区分", label: "主務区分", type: "DROP_DOWN" },
  { code: "親部門コード", label: "親部門コード", type: "SINGLE_LINE_TEXT" },
  { code: "layerCD", label: "階層コード", type: "NUMBER" },
];

// サンプル：グルーピング元アプリ（部門マスタ＝アプリ4）のフィールド
const MASTER_FIELDS = [
  { code: "Department_CD", label: "部門コード", type: "SINGLE_LINE_TEXT" },
  { code: "親部門コード", label: "親部門コード", type: "SINGLE_LINE_TEXT" },
  { code: "layerCD", label: "階層コード", type: "NUMBER" },
  { code: "表示部門名", label: "表示部門名", type: "SINGLE_LINE_TEXT" },
  { code: "部門区分", label: "部門区分", type: "DROP_DOWN" },
];

// 事前入力：固定表示（ツリー）＋外部マスタ参照（部門マスタ＝アプリ4）
const SAVED_VIEW = {
  mode: "tree",
  targetViewId: "5312001",
  label: "組織図（マスタ参照）",
  mainField: "氏名",
  subFields: ["役職名", "主務区分"],
  subShowLabel: true,
  treeIdField: "部門コード",
  treeGroupNameField: "部門名",
  treeParentField: "親部門コード",
  treeLevelField: "layerCD",
  treeMasterAppId: "4",
  treeMasterKeyField: "Department_CD",
  treeMasterParentField: "親部門コード",
  treeMasterLevelField: "layerCD",
  treeMasterNameField: "表示部門名",
  treeSortField: "",
};

const mock = `
window.__KZU_FIELDS__ = ${JSON.stringify(FIELDS)};
window.__KZU_MASTER_FIELDS__ = ${JSON.stringify(MASTER_FIELDS)};
window.kintone = {
  $PLUGIN_ID: "demo",
  app: { getId: () => 1 },
  plugin: { app: {
    getConfig: () => ({ views: JSON.stringify([${JSON.stringify(SAVED_VIEW)}]) }),
    setConfig: (payload) => {
      // 保存は行わず、保存される内容（特に副表示の順序）を画面に表示
      var views = [];
      try { views = JSON.parse(payload.views || "[]"); } catch (e) {}
      var pre = document.getElementById("kzu-demo-saved");
      if (pre) pre.textContent = JSON.stringify(views, null, 2);
      var box = document.getElementById("kzu-demo-savedwrap");
      if (box) box.style.display = "";
      window.scrollTo(0, document.body.scrollHeight);
    }
  } }
};
`;

const page = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>プラグイン設定デモ</title>
<style>${css}
body{margin:0;padding:20px;background:#eef1f4;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif}
.kzu-demo-note{max-width:980px;margin:0 auto 12px;font-size:13px;color:#6b7a86;line-height:1.7}
.kzu-demo-note b{color:#2d3b45}
.kzu-config{max-width:980px;margin:0 auto;background:#fff;padding:20px 24px;border-radius:10px}
#kzu-demo-savedwrap{max-width:980px;margin:14px auto 0;background:#0f1720;border-radius:10px;padding:14px 16px;display:none}
#kzu-demo-savedwrap h4{margin:0 0 8px;color:#e6eef5;font-size:13px}
#kzu-demo-saved{color:#9fe6c4;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;white-space:pre-wrap;margin:0}
</style></head><body>
<div class="kzu-demo-note">これは<b>ツリー編集（固定表示）の設定画面デモ</b>です（kintone不要・保存はしません）。<b>固定表示＋外部マスタ参照（部門マスタ＝アプリ4）</b>を実際の項目で事前入力してあります。グループ化キー＝部門コード、グルーピング元アプリID＝4。<b>参照先アプリ（部門マスタ）の各項目は、アプリIDを入れると項目一覧から選択</b>できます（手入力ではありません）。「グルーピング元アプリID」を空にすると自アプリ完結の欄（親・階層・グループ名）に切り替わります。「保存」で保存内容（JSON）を下に表示します。</div>
${body}
<div id="kzu-demo-savedwrap"><h4>保存される設定（デモ表示）</h4><pre id="kzu-demo-saved"></pre></div>
<script>${mock}</script>
<script>${js}</script>
</body></html>`;

fs.writeFileSync(path.join(root, "demo/config-demo.html"), page, "utf8");
console.log("wrote demo/config-demo.html");
