// データ入出力の差し替え層。描画・編集ロジックは Provider 経由でのみ永続化する。

import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import type { TreeRecord, GroupDef, FieldChange } from "./model";

/** load の結果。groupDefs があれば外部マスタ参照（グループは groupDefs で定義）。 */
export interface LoadResult { records: TreeRecord[]; groupDefs?: GroupDef[]; }

export interface DataProvider {
  /** メンバーのレコードと、（外部マスタ参照時は）グループ定義を読み込む。 */
  load(): Promise<LoadResult>;
  /** メンバー異動を永続化する */
  apply(changes: FieldChange[]): Promise<void>;
  readonly writable: boolean;
  readonly label: string;
  /** レコード詳細画面のURL（開けない場合は null）。自由配置と同じくノードから開くのに使う。 */
  recordUrl?(recordId: string): string | null;
}

/** ノード表示の設定（設定画面の主/副フィールド）。 */
export interface DisplayConfig {
  mainField: string;
  subFields: string[];
  fieldLabels: Record<string, string>;
}

/** 外部マスタ（グルーピング元アプリ）の指定。未指定なら自アプリ完結。 */
export interface MasterConfig {
  appId: number; // グルーピング元アプリID
  keyField: string; // 部門コード（例：Department_CD）
  parentField: string; // 親部門コード
  levelField: string; // 階層コード（例：layerCD）
  nameField: string; // 部門名（例：表示部門名）
  // グループキーがルックアップのコピー先のとき、書き込む本体フィールドのキーに対応するマスタ側フィールド
  // （＝ルックアップの relatedKeyField。例：search部門名）。この値を本体フィールドに書く。
  writeKeyMasterField?: string;
}

/** 階層の指定（グループ化方式）：グループキー・親・階層・グループ名・並び順のフィールド。 */
export interface TreeKeyConfig {
  idField: string; // グループ化キー（例：部門コード）。同じ値のレコードを1ノードにまとめる＝FK
  parentField: string; // 親グループのキー（自アプリ完結時に使用。マスタ参照時は未使用）
  levelField: string; // 階層数値（自アプリ完結時に使用）
  groupNameField: string; // 箱の見出し（自アプリ完結時に使用）
  sortField: string; // 兄弟グループの並び順に使うフィールド（任意）
  master?: MasterConfig; // 指定があれば外部マスタ参照
  // グループキーがルックアップのコピー先のとき、実際に書き込むルックアップ本体フィールド（例：search部門検索）。
  // 空ならグループキーを直接書く（本体フィールド or 通常フィールドの場合）。
  idWriteField?: string;
}

function cellText(cell: any): string {
  if (!cell || cell.value == null) return "";
  const v = cell.value;
  if (Array.isArray(v)) return v.map((x) => (x && typeof x === "object" ? (x.name ?? x.code ?? "") : String(x))).join(", ");
  if (typeof v === "object") return v.name ?? v.code ?? "";
  return String(v);
}

/** kintone アプリに対する読み書き（階層コード方式） */
export class KintoneProvider implements DataProvider {
  readonly writable = true;
  readonly label = "kintone";
  private client = new KintoneRestAPIClient();
  // グループキーがルックアップのコピー先のとき：異動先グループID → 本体フィールドに書くキー値（relatedKeyField の値）
  private writeKeyMap = new Map<string, string>();

  constructor(
    private appId: number,
    private keys: TreeKeyConfig,
    private display?: DisplayConfig
  ) {}

  /** 自アプリのレコード詳細画面URL（メンバーのレコード）。 */
  recordUrl(recordId: string): string | null {
    if (!/^\d+$/.test(recordId)) return null;
    return `/k/${this.appId}/show#record=${recordId}`;
  }

  async load(): Promise<LoadResult> {
    const g = (r: any, code: string): string => (code && r[code] && r[code].value != null ? String(r[code].value) : "");
    const d = this.display;
    const k = this.keys;
    // メンバー（自アプリ）
    const records = await this.client.record.getAllRecords({ app: this.appId });
    const members: TreeRecord[] = records.map((r: any) => {
      const groupId = g(r, k.idField); // FK（部門コード）
      const parent = g(r, k.parentField);
      const levelRaw = k.levelField ? g(r, k.levelField) : "";
      const level = levelRaw === "" ? NaN : Number(levelRaw);
      const sort = k.sortField ? g(r, k.sortField) : "";
      const groupName = k.groupNameField ? cellText(r[k.groupNameField]) : "";
      const main = d && d.mainField && r[d.mainField] ? cellText(r[d.mainField]) : "";
      const subs = d ? d.subFields.filter((c) => c && r[c]).map((c) => ({ label: d.fieldLabels[c] || c, value: cellText(r[c]) })) : [];
      return { recordId: String(r.$id.value), groupId, parentId: parent, level, sortKey: sort || groupId, groupName: groupName || groupId, main, subs };
    });
    // 外部マスタ（グルーピング元アプリ）があれば、そこからグループ定義を作る
    if (this.keys.master) {
      const m = this.keys.master;
      const mrecs = await this.client.record.getAllRecords({ app: m.appId });
      const groupDefs: GroupDef[] = mrecs.map((r: any) => {
        const lv = g(r, m.levelField);
        return { groupId: g(r, m.keyField), parentId: g(r, m.parentField), level: lv === "" ? NaN : Number(lv), groupName: m.nameField ? cellText(r[m.nameField]) : "" };
      }).filter((x) => x.groupId);
      // グループキーがルックアップのコピー先なら、各グループの「本体フィールドに書くキー値」を用意する
      if (this.keys.idWriteField && m.writeKeyMasterField) {
        for (const r of mrecs as any[]) {
          const gid = g(r, m.keyField);
          if (gid) this.writeKeyMap.set(gid, g(r, m.writeKeyMasterField));
        }
      }
      return { records: members, groupDefs };
    }
    return { records: members };
  }

  async apply(changes: FieldChange[]): Promise<void> {
    if (changes.length === 0) return;
    const k = this.keys;
    // メンバー異動：
    //  - 外部マスタ参照：FK（部門コード）だけ書き換える（親・階層はマスタ側にあるため）
    //  - 自アプリ完結：部門コード・親・階層を異動先に合わせて書き換える
    // 書き込み方針：
    //  - idWriteField あり（グループキーがルックアップのコピー先）：本体フィールドに「異動先のキー値」を書く。
    //    kintone がコピー先（部門コード等）を自動更新する。
    //  - idWriteField なし：グループキーを直接書く（本体ルックアップ or 通常フィールド）。
    //    自アプリ完結時は親・階層も書く。
    const writeField = this.keys.idWriteField;
    const records = changes.map((c) => {
      if (writeField) {
        const key = this.writeKeyMap.get(c.after.groupId);
        if (key == null || key === "") {
          const err = new Error(
            `異動先の部門（${c.after.groupId}）に対応するルックアップのキー値が、グルーピング元アプリに見つかりませんでした。` +
            `マスタ側のキー項目「${this.keys.master?.writeKeyMasterField ?? ""}」をご確認ください。`
          ) as Error & { code?: string };
          err.code = "LOOKUP_KEY_NOT_FOUND";
          throw err;
        }
        return { id: c.recordId, record: { [writeField]: { value: key } } as Record<string, { value: string }> };
      }
      // 部門コードに加え、設定されていれば 親部門コード・階層・部門名 も異動先の値で更新する。
      // （マスタ参照時も自アプリ完結時も、メンバーが自前で持つこれらのフィールドを同期する）
      const record: Record<string, { value: string }> = { [k.idField]: { value: c.after.groupId } };
      if (k.parentField) record[k.parentField] = { value: c.after.parentId };
      if (k.levelField && Number.isFinite(c.after.level)) record[k.levelField] = { value: String(c.after.level) };
      if (k.groupNameField && c.after.groupName != null) record[k.groupNameField] = { value: String(c.after.groupName) };
      return { id: c.recordId, record };
    });
    try {
      await this.client.record.updateRecords({ app: this.appId, records });
    } catch (e: any) {
      // kintone が拒否した場合（例：ルックアップのキーがコピー元に存在しない等）はその理由を見せる。
      const msg = (e && (e.message || (e.errors && JSON.stringify(e.errors)))) || String(e);
      const err = new Error(`保存に失敗しました: ${msg}`) as Error & { code?: string };
      err.code = "UPDATE_REJECTED";
      throw err;
    }
    await this.verifySaved(changes);
  }

  /** 送った部門コードが実際に保存されたかを読み直して検証。食い違えば例外。 */
  private async verifySaved(changes: FieldChange[]): Promise<void> {
    const k = this.keys;
    const want = new Map(changes.map((c) => [c.recordId, c.after]));
    const ids = changes.map((c) => c.recordId).filter((id) => /^\d+$/.test(id));
    if (ids.length === 0) return;
    let mismatch = 0;
    for (let i = 0; i < ids.length; i += 100) {
      const chunk = ids.slice(i, i + 100);
      const res = await this.client.record.getRecords({
        app: this.appId,
        query: `$id in (${chunk.join(",")})`,
        fields: ["$id", k.idField, k.parentField, k.levelField].filter(Boolean),
      });
      for (const r of res.records as any[]) {
        const id = String(r.$id.value);
        const w = want.get(id);
        if (!w) continue;
        const gotG = r[k.idField]?.value != null ? String(r[k.idField].value) : "";
        if (gotG !== w.groupId) mismatch += 1;
      }
    }
    if (mismatch > 0) {
      // 送信は通ったが値が反映されていない。ルックアップは「書けない」のではなく、
      // 送る値がコピー元アプリのキー（取得条件のフィールド）に一致している必要がある。
      const err = new Error(
        "異動先の部門コードを保存できませんでした（送信は通りましたが値が反映されていません）。" +
        "部門コードがルックアップの場合、グルーピング元アプリ／キーの設定を、部門コードの参照先アプリ・キー（取得条件のフィールド）に一致させてください。" +
        "あわせて、その項目の編集権限（フィールドのアクセス権）もご確認ください。"
      ) as Error & { code?: string };
      err.code = "SAVE_NOT_REFLECTED";
      throw err;
    }
  }
}
