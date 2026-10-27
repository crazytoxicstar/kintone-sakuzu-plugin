// プラグイン設定画面。1アプリに複数のカスタマイズビュー設定（ViewConfig）を持てる。
// 各ビューごとに、モード・対象ビューID・表示項目・（自由配置の）図アプリ/書き戻しを指定する。

import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import type { PluginConfig, ViewConfig } from "../shared/types";
import { parseConfig, serializeConfig, emptyView, DISPLAY_TYPES } from "../shared/types";

const PLUGIN_ID = kintone.$PLUGIN_ID;

function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`element not found: ${id}`);
  return el as T;
}
function elc<T extends HTMLElement = HTMLElement>(tag: string, cls = ""): T {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e as T;
}

interface FieldInfo { code: string; label: string; type: string; lookup?: boolean; }

// グループ化キー・親は「書き込める」必要がある。計算・レコード番号は書けないので不可。
// ルックアップは REST API 経由で値を更新できる（UIの編集ロックはAPIには無関係）ため許可する。
const TREE_CODE_NG_TYPES = ["CALC", "RECORD_NUMBER"];
const isTreeCodeField = (f: FieldInfo): boolean => !TREE_CODE_NG_TYPES.includes(f.type);

/** 1ビュー分のカードを生成し、現在値を集める collect() を返す */
interface Card { el: HTMLElement; collect: () => ViewConfig; }

(() => {
  const viewsBox = byId("kzu-views");
  const addBtn = byId<HTMLButtonElement>("kzu-add");
  const saveBtn = byId<HTMLButtonElement>("kzu-save");
  const cancelBtn = byId<HTMLButtonElement>("kzu-cancel");
  const fieldsNote = byId("kzu-fields-note");
  const countEl = byId("kzu-count");
  const errEl = byId("kzu-error");

  const saved: PluginConfig = parseConfig(kintone.plugin.app.getConfig(PLUGIN_ID));

  const showError = (msg: string): void => { errEl.textContent = msg; errEl.style.display = msg ? "block" : "none"; };
  const isPositiveInt = (v: string): boolean => /^[1-9][0-9]*$/.test(v.trim());

  let displayable: FieldInfo[] = [];
  const cards: Card[] = [];

  // --- 図データアプリ設定（全ビュー共通・画面先頭に1箇所） ---
  const figAppInput = elc<HTMLInputElement>("input", "kzu-config-input");
  figAppInput.type = "number"; figAppInput.min = "1"; figAppInput.placeholder = "例: 128"; figAppInput.value = saved.figAppId;
  const figNameInput = elc<HTMLInputElement>("input", "kzu-config-input"); figNameInput.type = "text"; figNameInput.placeholder = "name"; figNameInput.value = saved.figNameField;
  const figDataInput = elc<HTMLInputElement>("input", "kzu-config-input"); figDataInput.type = "text"; figDataInput.placeholder = "data"; figDataInput.value = saved.figDataField;
  const figSourceInput = elc<HTMLInputElement>("input", "kzu-config-input"); figSourceInput.type = "text"; figSourceInput.placeholder = "source_app"; figSourceInput.value = saved.figSourceField;
  (() => {
    const sec = elc("div", "kzu-global-fig");
    const fieldG = (labelHtml: string, note: string, control: HTMLElement): HTMLElement => {
      const f = elc("div", "kzu-config-field");
      const lab = elc("label", "kzu-config-label"); lab.innerHTML = labelHtml; f.appendChild(lab);
      if (note) { const p = elc("p", "kzu-config-note"); p.innerHTML = note; f.appendChild(p); }
      f.appendChild(control); return f;
    };
    // 開閉できるヘッダー
    const header = elc<HTMLButtonElement>("button", "kzu-global-header"); header.type = "button";
    const caret = elc("span", "kzu-global-caret"); caret.textContent = "▾";
    const title = elc("span", "kzu-global-title"); title.textContent = "図データアプリ（自由配置の保存先・全ビュー共通）";
    header.append(caret, title);
    const body = elc("div", "kzu-global-body");
    const figCodes = elc("div", "kzu-figcodes");
    const codeRow = (t: string, inp: HTMLElement): HTMLElement => { const l = elc("label"); l.append(document.createTextNode(t), inp); return l; };
    figCodes.append(codeRow("名前", figNameInput), codeRow("データ", figDataInput), codeRow("元アプリID", figSourceInput));
    body.append(
      fieldG('図データアプリID<span class="kzu-req">（自由配置を使うなら必須）</span>',
        "図のレイアウト(JSON)を保存する専用アプリ。複数行テキスト <code>data</code>／文字列1行 <code>name</code>／数値 <code>source_app</code> を用意。<b>全ビュー共通</b>なのでここで1回だけ指定します。", figAppInput),
      fieldG("図データアプリのフィールドコード", "ラベルを日本語にするとコードは別名になります。図アプリ側の実コードを入力してください。", figCodes)
    );
    // 図アプリIDが既に設定済みなら初期状態を閉じる（設定済みで普段は畳んでおける）
    let open = !saved.figAppId;
    const sync = (): void => { body.style.display = open ? "" : "none"; caret.textContent = open ? "▾" : "▸"; sec.classList.toggle("kzu-collapsed", !open); };
    header.addEventListener("click", () => { open = !open; sync(); });
    sec.append(header, body);
    sync();
    viewsBox.parentElement!.insertBefore(sec, viewsBox);
  })();

  const opt = (code: string, label: string): HTMLOptionElement => {
    const o = document.createElement("option"); o.value = code; o.textContent = label ? `${label}（${code}）` : "（なし）"; return o;
  };
  const fillSelect = (sel: HTMLSelectElement, list: FieldInfo[], selected: string): void => {
    sel.innerHTML = "";
    for (const f of list) sel.appendChild(opt(f.code, f.label));
    sel.value = selected;
  };
  // 先頭に空欄（＝未指定）を置く任意選択用。
  const fillSelectOptional = (sel: HTMLSelectElement, list: FieldInfo[], selected: string, blankLabel: string): void => {
    sel.innerHTML = "";
    const blank = document.createElement("option"); blank.value = ""; blank.textContent = blankLabel; sel.appendChild(blank);
    for (const f of list) sel.appendChild(opt(f.code, f.label));
    sel.value = selected;
  };

  // ---- カード生成 ----
  function buildCard(init: ViewConfig, index: number): Card {
    const card = elc("div", "kzu-card");

    const head = elc("div", "kzu-card-head");
    const title = elc("span", "kzu-card-title");
    title.textContent = `ビュー ${index + 1}`;
    const del = elc<HTMLButtonElement>("button", "kzu-card-del");
    del.type = "button"; del.textContent = "削除";
    head.append(title, del);
    card.appendChild(head);

    const field = (labelHtml: string, note: string, control: HTMLElement): HTMLElement => {
      const f = elc("div", "kzu-config-field");
      const lab = elc("label", "kzu-config-label"); lab.innerHTML = labelHtml;
      f.appendChild(lab);
      if (note) { const p = elc("p", "kzu-config-note"); p.innerHTML = note; f.appendChild(p); }
      f.appendChild(control);
      return f;
    };

    // 識別名
    const labelInput = elc<HTMLInputElement>("input", "kzu-config-input");
    labelInput.type = "text"; labelInput.placeholder = "例: 組織図 / エスカレーションフロー"; labelInput.value = init.label;

    // レイアウト（固定表示／自由配置）＋ その横に種別セレクト
    const layoutSel = elc<HTMLSelectElement>("select", "kzu-config-input");
    [["fixed", "固定表示"], ["free", "自由配置"]].forEach(([v, t]) => {
      const o = document.createElement("option"); o.value = v; o.textContent = t; layoutSel.appendChild(o);
    });
    // 種別セレクト（レイアウトに応じて選択肢が変わる）
    const kindSel = elc<HTMLSelectElement>("select", "kzu-config-input");
    const FIXED_KINDS: [string, string][] = [["tree", "縦並び"], ["treeh", "横向き"]];
    const FREE_KINDS: [string, string][] = [["normal", "標準"], ["square", "正方形"], ["circle", "円"], ["honeycomb", "ハニカム"]];
    const fillKind = (layout: string, selected: string): void => {
      const list = layout === "free" ? FREE_KINDS : FIXED_KINDS;
      kindSel.innerHTML = "";
      for (const [v, t] of list) { const o = document.createElement("option"); o.value = v; o.textContent = t; kindSel.appendChild(o); }
      kindSel.value = list.some(([v]) => v === selected) ? selected : list[0][0];
    };
    // 選択 → {mode, sheetType}
    const parseLayout = (): { mode: ViewConfig["mode"]; sheetType: ViewConfig["sheetType"] } => {
      if (layoutSel.value === "free") return { mode: "free", sheetType: kindSel.value as ViewConfig["sheetType"] };
      return { mode: kindSel.value as ViewConfig["mode"], sheetType: "normal" };
    };
    const isFreeValue = (): boolean => layoutSel.value === "free";
    // 初期値：mode=free なら自由配置＋シート種別、それ以外は固定表示＋縦/横
    if (init.mode === "free") { layoutSel.value = "free"; fillKind("free", init.sheetType); }
    else { layoutSel.value = "fixed"; fillKind("fixed", init.mode); }
    // レイアウト変更で種別の選択肢を入れ替え
    layoutSel.addEventListener("change", () => fillKind(layoutSel.value, ""));
    // レイアウト＋種別を横並びにまとめた1コントロール
    const layoutRow = elc("div", "kzu-layout-row");
    layoutRow.append(layoutSel, kindSel);

    // 対象ビューID
    const viewIdInput = elc<HTMLInputElement>("input", "kzu-config-input");
    viewIdInput.type = "number"; viewIdInput.min = "1"; viewIdInput.placeholder = "例: 5312000"; viewIdInput.value = init.targetViewId;

    // 主表示
    const mainSel = elc<HTMLSelectElement>("select", "kzu-config-input");
    fillSelect(mainSel, displayable, init.mainField);

    // 副表示（チェックで選択＋表示順を指定、最大5）
    const subsWrap = elc("div", "kzu-subs");
    const subsBox = elc("div", "kzu-checks");
    const subOrderBox = elc("div", "kzu-suborder");
    const labelOf = (code: string): string => { const f = displayable.find((x) => x.code === code); return f ? `${f.label}（${code}）` : code; };
    // 選択順＝表示順。保存済みの順序を保持する。
    let subOrder: string[] = init.subFields.filter((c) => displayable.some((f) => f.code === c)).slice(0, 5);
    const subChecks = (): HTMLInputElement[] => Array.from(subsBox.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
    const enforceSubLimit = (): void => {
      const atLimit = subOrder.length >= 5;
      for (const c of subChecks()) c.disabled = atLimit && !c.checked;
    };
    const renderOrder = (): void => {
      subOrderBox.innerHTML = "";
      if (subOrder.length === 0) { subOrderBox.appendChild(elc("div", "kzu-suborder-empty")).textContent = "（未選択）表示したいフィールドにチェックを入れてください"; enforceSubLimit(); return; }
      subOrder.forEach((code, i) => {
        const row = elc("div", "kzu-suborder-row");
        const num = elc("span", "kzu-suborder-num"); num.textContent = String(i + 1);
        const name = elc("span", "kzu-suborder-name"); name.textContent = labelOf(code);
        const up = elc<HTMLButtonElement>("button", "kzu-suborder-btn"); up.type = "button"; up.textContent = "▲"; up.disabled = i === 0;
        const down = elc<HTMLButtonElement>("button", "kzu-suborder-btn"); down.type = "button"; down.textContent = "▼"; down.disabled = i === subOrder.length - 1;
        up.addEventListener("click", () => { [subOrder[i - 1], subOrder[i]] = [subOrder[i], subOrder[i - 1]]; renderOrder(); });
        down.addEventListener("click", () => { [subOrder[i + 1], subOrder[i]] = [subOrder[i], subOrder[i + 1]]; renderOrder(); });
        row.append(num, name, up, down);
        subOrderBox.appendChild(row);
      });
      enforceSubLimit();
    };
    for (const f of displayable) {
      const lab = elc("label", "kzu-check");
      const cb = elc<HTMLInputElement>("input"); cb.type = "checkbox"; cb.value = f.code;
      cb.checked = subOrder.includes(f.code);
      cb.addEventListener("change", () => {
        if (cb.checked) { if (!subOrder.includes(f.code) && subOrder.length < 5) subOrder.push(f.code); }
        else { subOrder = subOrder.filter((c) => c !== f.code); }
        renderOrder();
      });
      lab.append(cb, document.createTextNode(` ${f.label}（${f.code}）`));
      subsBox.appendChild(lab);
    }
    const orderTitle = elc("div", "kzu-suborder-title"); orderTitle.textContent = "表示順（▲▼で並べ替え）";
    // 副表示でフィールド名を出すか（ON＝「ラベル: 値」／OFF＝値のみ）
    const subLabelChk = elc<HTMLInputElement>("input"); subLabelChk.type = "checkbox"; subLabelChk.checked = init.subShowLabel;
    const subLabelLab = elc("label", "kzu-config-checkline");
    subLabelLab.append(subLabelChk, document.createTextNode(" 副表示にフィールド名を表示する（OFFで値のみ）"));
    subsWrap.append(subsBox, orderTitle, subOrderBox, subLabelLab);
    renderOrder();

    // --- 固定表示（ツリー）専用：親フィールドで親子、並び順フィールドで兄弟順（隣接リスト方式） ---
    const fixedWrap = elc("div", "kzu-fixed-only");
    // グループ化キー：同じ値のレコードを1ノード（箱）にまとめる（例：部門コード）。
    // メンバー異動で書き換えるため書き込み可能なものだけ。
    const treeIdSel = elc<HTMLSelectElement>("select", "kzu-config-input");
    const idWritable = displayable.filter((f) => isTreeCodeField(f) || f.code === init.treeIdField);
    fillSelect(treeIdSel, idWritable, init.treeIdField);
    // 部門名フィールド（メンバー側）：箱の見出し／異動時に異動先の部門名を書き込む。任意（空＝書かない）。
    const treeGroupNameSel = elc<HTMLSelectElement>("select", "kzu-config-input");
    fillSelectOptional(treeGroupNameSel, displayable, init.treeGroupNameField, "（指定なし＝更新しない）");
    // 親部門コードフィールド（メンバー側）：書き込み可能なもの（計算・レコード番号を除外。ルックアップはAPIで書けるので可）。
    // 異動時に異動先の親部門コードを書き込む。任意（空＝書かない）。保存済みの指定が除外対象でも消えないよう現在値は残す。
    const treeParentSel = elc<HTMLSelectElement>("select", "kzu-config-input");
    const writableFields = displayable.filter((f) => isTreeCodeField(f) || f.code === init.treeParentField);
    fillSelectOptional(treeParentSel, writableFields, init.treeParentField, "（指定なし＝更新しない）");
    // 階層コードフィールド（メンバー側）：数値のみ。異動時に異動先の階層を書き込む。任意（空＝書かない）。
    const treeLevelSel = elc<HTMLSelectElement>("select", "kzu-config-input");
    const numberFields = displayable.filter((f) => f.type === "NUMBER" || f.code === init.treeLevelField);
    fillSelectOptional(treeLevelSel, numberFields, init.treeLevelField, "（指定なし＝更新しない）");
    // 並び順フィールド：任意（空欄可。読み取りのみ）
    const treeSortSel = elc<HTMLSelectElement>("select", "kzu-config-input");
    fillSelectOptional(treeSortSel, displayable, init.treeSortField, "（指定なし＝IDの順）");
    // --- グルーピング元アプリ（部門マスタ等。任意・ビューごと） ---
    const mAppInput = elc<HTMLInputElement>("input", "kzu-config-input"); mAppInput.type = "number"; mAppInput.min = "1"; mAppInput.placeholder = "例: 4（空＝自アプリ完結）"; mAppInput.value = init.treeMasterAppId; mAppInput.style.width = "180px";
    // アプリIDを入れたら参照先アプリ名を表示（入力ミス防止）
    const mAppRow = elc("div", "kzu-appid-row"); mAppRow.append(mAppInput);
    const mAppNameEl = elc("div", "kzu-appid-name"); mAppRow.append(mAppNameEl);
    const isDemo = !!(window as any).__KZU_FIELDS__;
    // 参照先アプリの各項目は手入力ではなく「選択」。アプリIDを入れると参照先の項目一覧から選べる。
    const mKeySel = elc<HTMLSelectElement>("select", "kzu-config-input");
    const mParentSel = elc<HTMLSelectElement>("select", "kzu-config-input");
    const mLevelSel = elc<HTMLSelectElement>("select", "kzu-config-input");
    const mNameSel = elc<HTMLSelectElement>("select", "kzu-config-input");
    const mMasterStatus = elc("div", "kzu-master-status");
    // 保存済みのコードが一覧に無くても選択が消えないよう補う
    const withSaved = (list: FieldInfo[], code: string): FieldInfo[] =>
      code && !list.some((f) => f.code === code) ? [...list, { code, label: code, type: "" }] : list;
    // 参照先アプリの項目でセレクトを満たす（現在の選択は保持）
    const fillMasterSelects = (fields: FieldInfo[]): void => {
      const disp = fields.filter((f) => DISPLAY_TYPES.includes(f.type) || f.type === "");
      const nums = fields.filter((f) => f.type === "NUMBER" || f.type === "");
      const kv = mKeySel.value || init.treeMasterKeyField;
      const pv = mParentSel.value || init.treeMasterParentField;
      const lv = mLevelSel.value || init.treeMasterLevelField;
      const nv = mNameSel.value || init.treeMasterNameField;
      fillSelectOptional(mKeySel, withSaved(disp, kv), kv, "（選択してください）");
      fillSelectOptional(mParentSel, withSaved(disp, pv), pv, "（選択してください）");
      fillSelectOptional(mLevelSel, withSaved(nums, lv), lv, "（選択してください）");
      fillSelectOptional(mNameSel, withSaved(disp, nv), nv, "（選択してください）");
    };
    fillMasterSelects([]); // 読込前は保存済みの値だけ（round-trip を壊さない）
    const masterFieldHook = (window as any).__KZU_MASTER_FIELDS__ as FieldInfo[] | undefined;
    let masterLoadToken = 0;
    // 参照先アプリの項目一覧を取得してセレクトに反映
    const loadMasterFields = (): void => {
      const id = mAppInput.value.trim();
      if (!/^\d+$/.test(id)) { mMasterStatus.textContent = ""; mMasterStatus.className = "kzu-master-status"; return; }
      if (isDemo) {
        if (masterFieldHook && Array.isArray(masterFieldHook)) {
          fillMasterSelects(masterFieldHook.slice().sort((a, b) => a.label.localeCompare(b.label, "ja")));
          mMasterStatus.textContent = "（デモ）参照先アプリの項目から選択できます"; mMasterStatus.className = "kzu-master-status kzu-master-status-ok";
        } else {
          mMasterStatus.textContent = "（デモのため項目一覧は取得しません。実機では選択できます）"; mMasterStatus.className = "kzu-master-status";
        }
        return;
      }
      const token = ++masterLoadToken;
      mMasterStatus.textContent = "参照先アプリの項目を読み込み中…"; mMasterStatus.className = "kzu-master-status";
      new KintoneRestAPIClient().app.getFormFields({ app: Number(id) })
        .then((form: any) => {
          if (token !== masterLoadToken) return; // 古い応答は無視
          const fields: FieldInfo[] = Object.entries(form.properties as Record<string, any>)
            .map(([code, def]) => ({ code, label: def.label || code, type: def.type as string, lookup: !!def.lookup }))
            .sort((a, b) => a.label.localeCompare(b.label, "ja"));
          fillMasterSelects(fields);
          mMasterStatus.textContent = `参照先アプリの項目 ${fields.length} 件から選択できます`; mMasterStatus.className = "kzu-master-status kzu-master-status-ok";
        })
        .catch(() => {
          if (token !== masterLoadToken) return;
          mMasterStatus.textContent = "参照先アプリの項目を取得できませんでした（IDや権限を確認）。選択済みのコードはそのまま使えます。"; mMasterStatus.className = "kzu-master-status kzu-master-status-ng";
        });
    };
    let appNameTimer = 0;
    const updateAppName = (): void => {
      const id = mAppInput.value.trim();
      if (!/^\d+$/.test(id)) { mAppNameEl.textContent = ""; mAppNameEl.className = "kzu-appid-name"; return; }
      if (isDemo) { mAppNameEl.textContent = "（デモのためアプリ名取得は省略）"; mAppNameEl.className = "kzu-appid-name"; return; }
      mAppNameEl.textContent = "確認中…"; mAppNameEl.className = "kzu-appid-name";
      new KintoneRestAPIClient().app.getApp({ id: Number(id) })
        .then((app: any) => { mAppNameEl.textContent = "アプリ名：" + app.name; mAppNameEl.className = "kzu-appid-name kzu-appid-ok"; })
        .catch(() => { mAppNameEl.textContent = "アプリが見つかりません（IDや閲覧権限を確認）"; mAppNameEl.className = "kzu-appid-name kzu-appid-ng"; });
    };
    // アプリID入力（デバウンス）でアプリ名と項目一覧を更新
    mAppInput.addEventListener("input", () => { window.clearTimeout(appNameTimer); appNameTimer = window.setTimeout(() => { updateAppName(); loadMasterFields(); }, 400); });
    const masterWrap = elc("div", "kzu-master-only");
    masterWrap.append(
      field("グルーピング元アプリの部門コード", "マスタ側のキー（例：Department_CD）。メンバーのグループ化キーの値と突き合わせます。", mKeySel),
      field("グルーピング元アプリの親部門コード", "マスタ側の親キー（例：親部門コード）。", mParentSel),
      field("グルーピング元アプリの階層コード", "マスタ側の階層（数値。例：layerCD）。", mLevelSel),
      field("グルーピング元アプリの部門名", "枠の見出しに使うマスタ側の名称（例：表示部門名）。", mNameSel),
      mMasterStatus
    );
    const treeGuide = elc("div", "kzu-tree-guide");
    treeGuide.innerHTML =
      "<b>同じグループ化キー（例：部門コード）のレコードを1つの部門の枠にまとめ</b>、枠の中にメンバー（人）を従来の見た目（主表示＋副表示）で並べます。メンバーを別の部門枠へドラッグして<b>異動</b>できます（グループ化キーが書き換わります）。<br>" +
      "部門ツリー（親子・段・名称）の作り方は、下の「部門ツリーの元（グルーピング元）」で選びます。";

    // このアプリ（メンバー側）の欄。異動時に書き換えるフィールドをここで指定する。
    const selfAppGroup = elc("div", "kzu-subsec");
    const selfAppTitle = elc("div", "kzu-subsec-title"); selfAppTitle.textContent = "このアプリ（メンバー）の設定";
    const memberWriteHint = elc("div", "kzu-config-note");
    selfAppGroup.append(
      selfAppTitle,
      field('グループ化キー（FK）<span class="kzu-req">（必須・書込可）</span>',
        "同じ値のレコードを1つの部門枠にまとめるキー（例：部門コード）。メンバー異動で書き換わります。", treeIdSel),
      field("並び順フィールド", "兄弟部門の並び順に使うフィールド（任意）。未指定ならキーの順。", treeSortSel),
      memberWriteHint,
      field("部門名フィールド", "異動時にこのフィールドへ異動先の部門名を書き込みます（例：部門名）。", treeGroupNameSel),
      field("親部門コードフィールド", "異動時に異動先の親部門コードを書き込みます（例：親部門コード）。", treeParentSel),
      field("階層コードフィールド（数値）", "異動時に異動先の階層コードを書き込みます（例：階層コード）。", treeLevelSel)
    );

    // 部門ツリーの元（グルーピング元）：別アプリ参照 or 自アプリ完結。枠で囲って別アプリの設定だと分かるように。
    const masterSection = elc("div", "kzu-master-section");
    const masterTitle = elc("div", "kzu-master-section-title"); masterTitle.textContent = "部門ツリーの元（グルーピング元）";
    const masterLead = elc("div", "kzu-master-section-lead");
    masterLead.innerHTML = "アプリIDを<b>指定</b>すると、別アプリ（部門マスタ等）から部門ツリーを作ります（以下は<b>参照先アプリ側</b>のフィールドコード）。メンバーのいない中間部門も表示でき、配下が宙ぶらりんになりません。<br>アプリIDを<b>空</b>にすると、このアプリのレコードだけで完結します（親・階層・部門名は上の「このアプリ（メンバー）の設定」のフィールドを使用）。";
    masterSection.append(
      masterTitle, masterLead,
      field("グルーピング元アプリID", "空＝自アプリ完結。指定すると、そのアプリから部門ツリーを作ります。", mAppRow),
      masterWrap
    );
    fixedWrap.append(treeGuide, selfAppGroup, masterSection);

    // マスタ指定の有無で、参照先の項目欄とメンバー側フィールドの必須／任意を切り替え
    const syncMaster = (): void => {
      const useMaster = !!mAppInput.value.trim();
      masterWrap.style.display = useMaster ? "" : "none";
      memberWriteHint.textContent = useMaster
        ? "部門名・親部門コード・階層コードは任意です。指定すると、異動時に異動先（マスタ）の値でメンバーの各フィールドを更新します。空欄なら部門コードだけ更新します。"
        : "自アプリ完結では、部門名・親部門コード・階層コードが必須です（ツリーの見出し・親子・段に使います）。";
    };
    mAppInput.addEventListener("input", syncMaster);
    syncMaster();
    updateAppName();      // 初期表示：保存済みIDのアプリ名を確認
    loadMasterFields();   // 初期表示：保存済みIDの参照先項目を読み込み、セレクトに反映

    // --- 自由配置専用（図データアプリ設定は全ビュー共通なのでここには置かない） ---
    const freeWrap = elc("div", "kzu-free-only");

    // レコードを開く設定は固定表示・自由配置どちらでも使うので共通欄に置く
    const newtab = elc<HTMLInputElement>("input"); newtab.type = "checkbox"; newtab.checked = init.openRecordInNewTab;
    const newtabLab = elc("label", "kzu-config-checkline"); newtabLab.append(newtab, document.createTextNode(" ノードのレコードを新しいタブで開く（↗）"));

    card.append(
      field("識別名", "設定画面での区別用（任意）。", labelInput),
      field("レイアウト", "固定表示（縦並び／横向き）または自由配置（標準／正方形／円／ハニカム）。右の種別はレイアウトに応じて切り替わります。", layoutRow),
      field('対象ビューID<span class="kzu-req">（必須）</span>', "図を描画するカスタマイズビュー（一覧）のID。", viewIdInput),
      field('主表示フィールド<span class="kzu-req">（未指定なら階層コード）</span>', "ノードの見出しに使うフィールド。", mainSel),
      field('副表示フィールド<span class="kzu-req">（最大5）</span>', "チェックで選び、▲▼で表示順を指定します。ノードには選んだ順に表示されます。", subsWrap),
      field("レコードを開く", "固定表示・自由配置とも、ノード右上の↗でレコードを開けます。", newtabLab),
      fixedWrap,
      freeWrap
    );

    const syncMode = (): void => {
      const free = isFreeValue();
      freeWrap.style.display = free ? "" : "none";
      fixedWrap.style.display = free ? "none" : "";
    };
    layoutSel.addEventListener("change", syncMode);
    syncMode();

    del.addEventListener("click", () => {
      const i = cards.findIndex((c) => c.el === card);
      if (i >= 0) cards.splice(i, 1);
      card.remove();
      renumber();
    });

    return {
      el: card,
      collect: (): ViewConfig => ({
        ...parseLayout(), // レイアウト＋種別 から mode と sheetType を決める
        targetViewId: viewIdInput.value.trim(),
        label: labelInput.value.trim(),
        mainField: mainSel.value,
        subFields: subOrder.slice(0, 5),
        subShowLabel: subLabelChk.checked,
        openRecordInNewTab: newtab.checked,
        treeIdField: treeIdSel.value,
        treeParentField: treeParentSel.value,
        treeLevelField: treeLevelSel.value,
        treeGroupNameField: treeGroupNameSel.value,
        treeSortField: treeSortSel.value,
        treeMasterAppId: mAppInput.value.trim(),
        treeMasterKeyField: mKeySel.value,
        treeMasterParentField: mParentSel.value,
        treeMasterLevelField: mLevelSel.value,
        treeMasterNameField: mNameSel.value,
      }),
    };
  }

  function renumber(): void {
    cards.forEach((c, i) => {
      const t = c.el.querySelector(".kzu-card-title");
      if (t) t.textContent = `ビュー ${i + 1}`;
    });
    updateCount();
  }

  function updateCount(): void {
    const n = cards.length;
    let note = `ビュー ${n} 件`;
    if (n > 30) note += "（30件を超えています。設定が重くなる場合があります）";
    countEl.textContent = note;
    countEl.style.color = n > 30 ? "#b3261e" : "#8a98a3";
  }

  function addCard(init: ViewConfig): void {
    const card = buildCard(init, cards.length);
    cards.push(card);
    viewsBox.appendChild(card.el);
    renumber();
  }

  // ---- フィールド取得 → カード描画 ----
  (async () => {
    // デモ用フック：window.__KZU_FIELDS__ が与えられていれば API を呼ばずそれを使う（本番では未設定）
    const injected = (window as any).__KZU_FIELDS__ as FieldInfo[] | undefined;
    if (injected && Array.isArray(injected)) {
      const fields = injected.slice().sort((a, b) => a.label.localeCompare(b.label, "ja"));
      displayable = fields.filter((f) => DISPLAY_TYPES.includes(f.type));
      fieldsNote.textContent = `（デモ）フィールド ${fields.length} 件`;
      const inits0 = saved.views.length ? saved.views : [emptyView()];
      for (const v of inits0) addCard(v);
      return;
    }
    const appId = kintone.app.getId();
    if (!appId) { fieldsNote.textContent = "アプリIDが取得できませんでした。"; return; }
    try {
      const client = new KintoneRestAPIClient();
      const form = await client.app.getFormFields({ app: appId });
      const fields: FieldInfo[] = Object.entries(form.properties as Record<string, any>)
        .map(([code, def]) => ({ code, label: def.label || code, type: def.type as string, lookup: !!def.lookup }))
        .sort((a, b) => a.label.localeCompare(b.label, "ja"));
      displayable = fields.filter((f) => DISPLAY_TYPES.includes(f.type));
      fieldsNote.textContent = `フィールド ${fields.length} 件を読み込みました。`;
    } catch (e) {
      console.error(e);
      fieldsNote.textContent = "フィールド一覧の取得に失敗しました。アプリの権限を確認してください。";
    }
    // 保存済みビュー（無ければ空カード1枚）
    const inits = saved.views.length ? saved.views : [emptyView()];
    for (const v of inits) addCard(v);
  })();

  addBtn.addEventListener("click", () => addCard(emptyView()));

  saveBtn.addEventListener("click", () => {
    const views = cards.map((c) => c.collect());
    if (views.length === 0) { showError("少なくとも1つのビューを設定してください。"); return; }
    const seen = new Set<string>();
    for (let i = 0; i < views.length; i++) {
      const v = views[i];
      if (!isPositiveInt(v.targetViewId)) { showError(`ビュー ${i + 1}: 対象ビューIDは正の整数で入力してください。`); return; }
      if (seen.has(v.targetViewId)) { showError(`ビュー ${i + 1}: 対象ビューID ${v.targetViewId} が重複しています。`); return; }
      seen.add(v.targetViewId);
      if (v.mode === "free") {
        if (!isPositiveInt(figAppInput.value)) { showError("自由配置を使うビューがあります。画面先頭の「図データアプリID」を正の整数で入力してください。"); return; }
        if (!v.mainField) { showError(`ビュー ${i + 1}: 主表示フィールドを選択してください。`); return; }
      } else {
        // 固定表示（ツリー・グループ化）
        if (!v.treeIdField) { showError(`ビュー ${i + 1}: グループ化キーを選択してください。`); return; }
        const kf = displayable.find((x) => x.code === v.treeIdField);
        if (kf && !isTreeCodeField(kf)) {
          showError(`ビュー ${i + 1}: グループ化キーには書き込み可能なフィールドを指定してください（計算・レコード番号は不可。ルックアップは可）。メンバー異動で書き換えます。`);
          return;
        }
        const useMaster = !!v.treeMasterAppId;
        if (useMaster) {
          // 外部マスタ参照：マスタのアプリIDと各フィールドが必要
          if (!isPositiveInt(v.treeMasterAppId)) { showError(`ビュー ${i + 1}: グルーピング元アプリIDは正の整数で入力してください。`); return; }
          if (!v.treeMasterKeyField || !v.treeMasterParentField || !v.treeMasterLevelField || !v.treeMasterNameField) {
            showError(`ビュー ${i + 1}: グルーピング元アプリの 部門コード・親部門コード・階層コード・部門名 を入力してください。`); return;
          }
        } else {
          // 自アプリ完結：親・階層・グループ名が必要、親は書込可、階層は数値
          if (!v.treeGroupNameField) { showError(`ビュー ${i + 1}: グループ名フィールドを選択してください（またはグルーピング元アプリを指定）。`); return; }
          if (!v.treeParentField) { showError(`ビュー ${i + 1}: 親フィールドを選択してください（またはグルーピング元アプリを指定）。`); return; }
          if (!v.treeLevelField) { showError(`ビュー ${i + 1}: 階層フィールドを選択してください（またはグルーピング元アプリを指定）。`); return; }
          const lf = displayable.find((x) => x.code === v.treeLevelField);
          if (lf && lf.type !== "NUMBER") { showError(`ビュー ${i + 1}: 階層フィールドには数値フィールドを指定してください。`); return; }
          if (v.treeParentField === v.treeIdField) { showError(`ビュー ${i + 1}: グループ化キーと親フィールドには別のフィールドを指定してください。`); return; }
          const pf = displayable.find((x) => x.code === v.treeParentField);
          if (pf && !isTreeCodeField(pf)) {
            showError(`ビュー ${i + 1}: 親フィールドには書き込み可能なフィールドを指定してください（計算・レコード番号は不可。ルックアップは可）。`);
            return;
          }
        }
      }
    }

    // --- ガードレール：設定サイズ（1値=最大65,535文字）とビュー数のソフト上限 ---
    const VALUE_LIMIT = 65535; // setConfig の1値あたり最大文字数
    const WARN = 0.8;
    const SOFT_CAP = 30; // 設定画面の操作性の目安
    const payload = serializeConfig({
      views,
      figAppId: figAppInput.value.trim(),
      figNameField: figNameInput.value.trim() || "name",
      figDataField: figDataInput.value.trim() || "data",
      figSourceField: figSourceInput.value.trim() || "source_app",
    });
    const size = payload.views.length;
    if (size > VALUE_LIMIT) {
      showError(`設定サイズが上限（65,535文字）を超えました（現在 ${size.toLocaleString()} 文字）。ビュー数または副表示フィールドを減らしてください。`);
      return;
    }
    showError("");
    if (views.length > SOFT_CAP || size > VALUE_LIMIT * WARN) {
      const okProceed = window.confirm(
        `ビュー ${views.length} 件・設定サイズ 約 ${size.toLocaleString()} 文字です。\n` +
          `多すぎると設定画面が重くなり、保存上限（65,535文字）にも近づきます。このまま保存しますか？`
      );
      if (!okProceed) return;
    }

    kintone.plugin.app.setConfig(payload, () => {
      const appId = kintone.app.getId();
      window.location.href = `/k/admin/app/${appId}/plugin/`;
    });
  });

  cancelBtn.addEventListener("click", () => history.back());
})();
