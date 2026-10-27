// プラグインのデスクトップエントリ。設定の mode で「組織ツリー編集」「自由配置」を切り替える。

import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import { parseConfig } from "./shared/types";
import { KintoneProvider } from "./tree/providers";
import { TreeEditor } from "./tree/view";
import { KintoneFreeProvider } from "./free/data";
import { FreeEditor } from "./free/free-view";

const PLUGIN_ID = kintone.$PLUGIN_ID;
const ROOT_ID = "kintone-zu-root";

function errorText(err: unknown): string {
  const e = err as any;
  // rest-api-client の KintoneRestAPIError は message/errors を持つ
  if (e && typeof e === "object") {
    if (e.message) return String(e.message);
    try { return JSON.stringify(e); } catch { /* noop */ }
  }
  return String(err);
}

function fail(root: HTMLElement, err: unknown, step = ""): void {
  console.error("[kintone-zu] 初期化に失敗", step, err);
  root.innerHTML = "";
  const box = document.createElement("div");
  box.style.cssText = "padding:16px;font-family:sans-serif;color:#b3261e;background:#fdecea;border:1px solid #f5c6c2;border-radius:8px;";
  const h = document.createElement("div");
  h.style.cssText = "font-weight:700;margin-bottom:6px;";
  h.textContent = "図の初期化に失敗しました" + (step ? `（失敗箇所: ${step}）` : "");
  const msg = document.createElement("div");
  msg.style.cssText = "font-size:13px;color:#7a1d17;white-space:pre-wrap;word-break:break-all;";
  msg.textContent = errorText(err);
  box.append(h, msg);
  root.appendChild(box);
}

kintone.events.on("app.record.index.show", (event: any) => {
  const config = parseConfig(kintone.plugin.app.getConfig(PLUGIN_ID));
  const view = config.views.find((v) => v.targetViewId && Number(v.targetViewId) === event.viewId);
  if (!view) return event;

  const root = document.getElementById(ROOT_ID);
  if (!root) {
    console.warn(`[kintone-zu] カスタマイズビューに <div id="${ROOT_ID}"></div> が見つかりません。`);
    return event;
  }
  if (root.dataset.kzMounted === "1") return event;
  root.dataset.kzMounted = "1";

  const appId = kintone.app.getId();
  if (!appId) return event;

  void (async () => {
    let step = "";
    try {
      const client = new KintoneRestAPIClient();

      // ① フォーム定義（表示項目のフィールド名解決）
      step = "①フィールド定義の取得（この元アプリのフォーム設定を読む権限が必要）";
      const form = await client.app.getFormFields({ app: appId });
      const labels: Record<string, string> = {};
      for (const [code, def] of Object.entries(form.properties as Record<string, any>)) {
        labels[code] = def.label || code;
      }

      if (view.mode === "tree" || view.mode === "treeh") {
        const useMaster = !!view.treeMasterAppId;
        if (!view.treeIdField) {
          fail(root, new Error("固定表示には「グループ化キー」の指定が必要です（プラグイン設定で指定してください）。"), "②グループ化キーの設定確認");
          return;
        }
        if (!useMaster && (!view.treeParentField || !view.treeLevelField)) {
          fail(root, new Error("自アプリ完結の固定表示には「親フィールド」「階層フィールド」が必要です（またはグルーピング元アプリを指定してください）。"), "②親・階層フィールドの設定確認");
          return;
        }
        step = "②レコードの取得";
        // グループキーがルックアップのコピー先かを判定する。
        // コピー先は kintone がAPI書き込みを無視するため、本体フィールド（ルックアップ）へキー値を書く必要がある。
        let idWriteField: string | undefined;
        let writeKeyMasterField: string | undefined;
        if (useMaster && view.treeIdField) {
          for (const [code, def] of Object.entries(form.properties as Record<string, any>)) {
            const lk = (def as any).lookup;
            if (!lk || !Array.isArray(lk.fieldMappings)) continue;
            const hit = lk.fieldMappings.find((mp: any) => mp.field === view.treeIdField);
            // ルックアップの参照先がグルーピング元アプリと同一のときだけ、本体フィールド方式に切り替える
            const sameApp = lk.relatedApp && String(lk.relatedApp.app) === String(view.treeMasterAppId);
            if (hit && sameApp) {
              idWriteField = code; // 例：search部門検索（ルックアップ本体）
              writeKeyMasterField = lk.relatedKeyField; // 例：search部門名（マスタ側のキー項目）
              // eslint-disable-next-line no-console
              console.log(`[kintone-zu] グループキー「${view.treeIdField}」はルックアップ「${code}」のコピー先です。異動時は本体フィールド「${code}」にマスタのキー「${writeKeyMasterField}」の値を書き込みます。`);
              break;
            }
          }
        }
        const master = useMaster
          ? { appId: Number(view.treeMasterAppId), keyField: view.treeMasterKeyField, parentField: view.treeMasterParentField, levelField: view.treeMasterLevelField, nameField: view.treeMasterNameField, writeKeyMasterField }
          : undefined;
        const provider = new KintoneProvider(
          appId,
          { idField: view.treeIdField, parentField: view.treeParentField, levelField: view.treeLevelField, groupNameField: view.treeGroupNameField, sortField: view.treeSortField, master, idWriteField },
          { mainField: view.mainField, subFields: view.subFields, fieldLabels: labels }
        );
        const direction = view.mode === "treeh" ? "horizontal" : "vertical";
        await new TreeEditor(root, provider, direction, view.subShowLabel, view.openRecordInNewTab).mount();
        return;
      }

      // 自由配置モード（図データアプリは全ビュー共通設定）
      const figApp = Number(config.figAppId);
      if (!figApp) {
        root.textContent = "自由配置モードには「図データアプリID」の設定が必要です（プラグイン設定の先頭で指定）。";
        return;
      }
      const query = kintone.app.getQuery() || "";
      const provider = new KintoneFreeProvider(appId, figApp, view, query, labels, {
        name: config.figNameField, data: config.figDataField, source: config.figSourceField,
      }, String(event.viewId));
      const editor = new FreeEditor(root, provider, appId, {
        openInNewTab: view.openRecordInNewTab,
        sheetType: view.sheetType,
        showSubLabel: view.subShowLabel,
      });
      // mount 内で ③元レコード取得 → ④図データ読込 の順。どちらで落ちたか provider が判別。
      step = "③元レコードの取得 または ④図データアプリの読込";
      await editor.mount();
    } catch (e) {
      fail(root, e, step);
    }
  })();
  return event;
});
