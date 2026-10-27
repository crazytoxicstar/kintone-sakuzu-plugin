// 自由配置モードのデータ層。元アプリのレコード（パレット素材・表示値）と、
// 図データアプリに保存するレイアウトJSONの読み書き、親子関係の書き戻しを担う。

import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import type { Diagram, ViewConfig } from "../shared/types";
import { pickDiagramForView } from "./fig-select";

/** パレット／ノードに表示する1レコード分のデータ */
export interface FreeRecord {
  recordId: string; // 元アプリの$id
  main: string; // 主表示の値
  subs: { label: string; value: string }[]; // 副表示（フィールド名: 値）
}

export interface FreeProvider {
  readonly writable: boolean;
  readonly label: string;
  loadRecords(): Promise<FreeRecord[]>;
  loadDiagram(): Promise<Diagram | null>;
  saveDiagram(diagram: Diagram): Promise<void>;
  /** レコード詳細のURL（新規タブで開く用）。不可なら null */
  recordUrl(recordId: string): string | null;
}

/** 図データアプリのフィールドコード（既定。設定で上書き） */
export const FIG_FIELDS = { name: "name", data: "data", sourceApp: "source_app" };

/** 値→表示文字列（配列系・ユーザー選択などを素直に文字列化） */
function fieldToText(cell: any): string {
  if (!cell || cell.value == null) return "";
  const v = cell.value;
  if (Array.isArray(v)) {
    return v
      .map((x) => (x && typeof x === "object" ? (x.name ?? x.code ?? JSON.stringify(x)) : String(x)))
      .join(", ");
  }
  if (typeof v === "object") return v.name ?? v.code ?? "";
  return String(v);
}

export class KintoneFreeProvider implements FreeProvider {
  readonly writable = true;
  readonly label = "kintone";
  private client = new KintoneRestAPIClient();
  private figRecordId: string | null = null;

  constructor(
    private sourceApp: number,
    private figApp: number,
    private cfg: ViewConfig,
    private viewQuery: string,
    private fieldLabels: Record<string, string>, // コード→フィールド名
    private figFields: { name: string; data: string; source: string }, // 図アプリのフィールドコード（全ビュー共通）
    private viewId: string // このカスタマイズビューのID（ビューごとに図を分けるキー）
  ) {}

  private neededFields(): string[] {
    const set = new Set<string>(["$id"]);
    if (this.cfg.mainField) set.add(this.cfg.mainField);
    for (const f of this.cfg.subFields) if (f) set.add(f);
    return [...set];
  }

  async loadRecords(): Promise<FreeRecord[]> {
    const records = await this.client.record.getAllRecords({
      app: this.sourceApp,
      fields: this.neededFields(),
      condition: stripOrderLimit(this.viewQuery),
    });
    return records.map((r: any) => {
      const id = String(r.$id.value);
      const mainCode = this.cfg.mainField;
      const main = mainCode && r[mainCode] ? fieldToText(r[mainCode]) : `#${id}`;
      const subs = this.cfg.subFields
        .filter((c) => c && r[c])
        .map((c) => ({ label: this.fieldLabels[c] || c, value: fieldToText(r[c]) }));
      return { recordId: id, main: main || `#${id}`, subs };
    });
  }

  private figName(): string { return this.figFields.name || FIG_FIELDS.name; }
  private figData(): string { return this.figFields.data || FIG_FIELDS.data; }
  private figSource(): string { return this.figFields.source || FIG_FIELDS.sourceApp; }

  async loadDiagram(): Promise<Diagram | null> {
    // 同じ元アプリの図レコードを全件取得し、viewId が一致するものを採用（ビューごとに別図）
    const records = await this.client.record.getAllRecords({
      app: this.figApp,
      condition: `${this.figSource()} = ${this.sourceApp}`,
    });
    const picked = pickDiagramForView(records as any[], this.figData(), this.viewId);
    if (!picked) { this.figRecordId = null; return null; }
    this.figRecordId = picked.recordId;
    if (picked.adoptedLegacy) picked.diagram.viewId = this.viewId; // 旧データをこのビューへ引き継ぐ
    return picked.diagram;
  }

  async saveDiagram(diagram: Diagram): Promise<void> {
    diagram.viewId = this.viewId; // このビューの図として保存
    const record: Record<string, { value: string }> = {
      [this.figName()]: { value: diagram.name },
      [this.figData()]: { value: JSON.stringify(diagram) },
      [this.figSource()]: { value: String(diagram.sourceAppId) },
    };
    if (this.figRecordId) {
      await this.client.record.updateRecord({ app: this.figApp, id: this.figRecordId, record });
    } else {
      const resp = await this.client.record.addRecord({ app: this.figApp, record });
      this.figRecordId = String(resp.id);
    }
  }

  recordUrl(recordId: string): string | null {
    return `/k/${this.sourceApp}/show#record=${recordId}`;
  }
}

/**
 * getQuery() の order by / limit / offset 句を除去し、filter 条件だけを返す。
 * 絞り込みが無い一覧では getQuery() が先頭から "order by ... limit ..." を返すため、
 * 行頭でも確実に落とす（先頭空白を要求しない）。
 */
function stripOrderLimit(q: string | null): string {
  if (!q) return "";
  let s = q;
  const oi = s.search(/\border\s+by\b/i);
  if (oi >= 0) s = s.slice(0, oi);
  const li = s.search(/\blimit\b/i);
  if (li >= 0) s = s.slice(0, li);
  const fi = s.search(/\boffset\b/i);
  if (fi >= 0) s = s.slice(0, fi);
  return s.trim();
}
