// 図データのスキーマ定義（図データアプリに保存するJSONの構造）
// このファイルが「元アプリのレコード」と「図」を結ぶ契約。各マイルストーンはこれを拡張していく。

export const DIAGRAM_SCHEMA_VERSION = 1;

/** ノードの形状 */
export type NodeShape = "rect" | "roundRect" | "ellipse" | "diamond" | "square" | "hexagon";

/** 自由配置のシート種別（セルの敷き詰め方＝スナップ先） */
export type SheetType = "normal" | "square" | "circle" | "honeycomb";

/** エッジ（線）の種類 */
export type EdgeStyle = "solid" | "dashed" | "dotted" | "double";
export type EdgeArrow = "none" | "to" | "both"; // 旧データ互換用
/** 端点の記号（始点/終点に個別指定） */
export type EdgeMarker = "none" | "arrow" | "openArrow" | "dot" | "box";
/** 線の経路（L字＝直角 / 直線） */
export type EdgeRouting = "elbow" | "straight";

/** 元アプリのレコードを図上に配置した「ノード」 */
export interface DiagramNode {
  id: string; // 図内で一意（recordId とは別。同じレコードを複数置ける）
  recordId: string; // 元アプリのレコード番号（$id）
  x: number;
  y: number;
  w: number;
  h: number;
  shape: NodeShape;
  color: string; // 枠/塗りの基調色（hex）
  label: string; // 表示ラベル（既定はレコードの代表フィールド値）
}

/** ノード間を結ぶ線 */
export interface DiagramEdge {
  id: string;
  from: string; // DiagramNode.id
  to: string; // DiagramNode.id
  label?: string;
  style?: EdgeStyle;
  startMarker?: EdgeMarker; // 始点の記号
  endMarker?: EdgeMarker; // 終点の記号
  arrow?: EdgeArrow; // 旧データ互換（startMarker/endMarker 未設定時に参照）
  routing?: EdgeRouting; // 経路（L字＝elbow / 直線＝straight）。既定 elbow
  color?: string; // 線の色（hex）。未指定は既定色
}

/** 文字の大きさ（大中小） */
export type TextSize = "s" | "m" | "l";

/** レコードに紐づかない自由図形（枠・テキスト・直線） */
export interface FreeShape {
  id: string;
  type: "rect" | "text" | "line";
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  color?: string;
  // テキスト用スタイル（type==="text"）。フォントはゴシック固定。
  fontSize?: TextSize; // 既定 m
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

/** キャンバスの表示状態（ズーム/パン） */
export interface DiagramView {
  zoom: number;
  panX: number;
  panY: number;
}

/** 1枚の図 = 図データアプリの1レコードに格納される本体 */
export interface Diagram {
  schemaVersion: number;
  id: string;
  name: string;
  sourceAppId: number; // どの元アプリのレコードを使った図か
  viewId?: string; // どのカスタマイズビューの図か（ビューごとに別の図を保持するためのキー）
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  shapes: FreeShape[];
  view: DiagramView;
  updatedAt: string; // ISO8601
}

/** プラグイン設定（kintone.plugin.app に保存。setConfigは文字列のみ保持するためJSON化して格納する） */
/** 1つのカスタマイズビューに対する図の設定 */
export interface ViewConfig {
  mode: "tree" | "treeh" | "free"; // 組織ツリー（縦）/ 組織ツリー（横）/ 自由配置
  sheetType: SheetType; // 自由配置のシート種別（normal=通常／square／circle／honeycomb）
  targetViewId: string; // 図を描画する対象のカスタマイズビューID
  label: string; // 設定画面での識別名（任意。例「組織図」「エスカレーションフロー」）
  // --- 自由配置モードの表示・挙動 ---
  mainField: string; // 主表示（ノード見出し）に使うフィールドコード（1つ）
  subFields: string[]; // 副表示に使うフィールドコード（最大5）
  subShowLabel: boolean; // 副表示でフィールド名を表示するか（true＝「ラベル: 値」／false＝値のみ）
  openRecordInNewTab: boolean; // クリックでレコードを新規タブに開く
  // --- 固定表示（ツリー）：グループキーで同一グループのレコードを1ノードにまとめ、親/階層で親子と段を決める ---
  treeIdField: string; // グループ化キー（例：部門コード）。同じ値のレコードは1ノード（箱）にまとめ、中にメンバーとして並べる
  treeParentField: string; // 親グループのキーを入れるフィールド（例：親部門コード。空＝最上位）。ドラッグ付け替えでメンバー全員分を書き換える
  treeLevelField: string; // 階層（レベル）を表す数値フィールド（例：1,2,3…小さいほど上位）。固定・読み取り専用。表示段と配置制約に使う
  treeGroupNameField: string; // 箱の見出し（グループ名。例：部門名）に使うフィールド（自アプリ完結時）
  treeSortField: string; // 兄弟グループの並び順に使うフィールド（任意。空ならキーの自然順）
  // --- グルーピング元アプリ（部門マスタ等）をビューごとに指定（任意）。指定があれば外部マスタ参照、空なら自アプリ完結 ---
  treeMasterAppId: string; // グルーピング元アプリID（空＝自アプリ完結）
  treeMasterKeyField: string; // マスタの部門コード（例：Department_CD）
  treeMasterParentField: string; // マスタの親部門コード
  treeMasterLevelField: string; // マスタの階層コード（例：layerCD）
  treeMasterNameField: string; // マスタの部門名（例：表示部門名）
}

/** 1アプリに複数ビューを持てる。ビューごとに別の図を定義する。
 * 図データアプリの設定は全ビュー共通なのでプラグイン単位で1つだけ持つ。 */
export interface PluginConfig {
  views: ViewConfig[];
  // 図データ（JSON）の保存先アプリ（自由配置モードで使用。全ビュー共通）
  figAppId: string;
  figNameField: string; // 既定 name
  figDataField: string; // 既定 data
  figSourceField: string; // 既定 source_app
}

function toStrArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (typeof v === "string") {
    try {
      const a = JSON.parse(v);
      return Array.isArray(a) ? a.map((x) => String(x)) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** 1ビュー分のオブジェクトを正規化（既定値で埋める） */
export function normalizeView(o: Record<string, any>): ViewConfig {
  const mode: ViewConfig["mode"] = o.mode === "free" ? "free" : o.mode === "treeh" ? "treeh" : "tree";
  const st = o.sheetType;
  const sheetType: SheetType = st === "square" || st === "circle" || st === "honeycomb" ? st : "normal";
  return {
    mode,
    sheetType,
    targetViewId: o.targetViewId != null ? String(o.targetViewId) : "",
    label: o.label != null ? String(o.label) : "",
    mainField: o.mainField ?? "",
    subFields: toStrArray(o.subFields).slice(0, 5),
    subShowLabel: o.subShowLabel !== false && o.subShowLabel !== "false", // 既定ON（従来どおりラベル付き）
    openRecordInNewTab: o.openRecordInNewTab !== false && o.openRecordInNewTab !== "false",
    treeIdField: o.treeIdField ?? "",
    treeParentField: o.treeParentField ?? "",
    treeLevelField: o.treeLevelField ?? "",
    treeGroupNameField: o.treeGroupNameField ?? "",
    treeSortField: o.treeSortField ?? "",
    treeMasterAppId: o.treeMasterAppId != null ? String(o.treeMasterAppId) : "",
    treeMasterKeyField: o.treeMasterKeyField ?? "",
    treeMasterParentField: o.treeMasterParentField ?? "",
    treeMasterLevelField: o.treeMasterLevelField ?? "",
    treeMasterNameField: o.treeMasterNameField ?? "",
  };
}

export function emptyView(): ViewConfig {
  return normalizeView({ mode: "tree" });
}

/**
 * 保存済み設定を読み込む。新形式は "views"（JSON配列）。
 * 旧形式（単一ビューのフラットキー）は1要素の配列へ移行する。
 */
export function parseConfig(raw: Record<string, string> | null | undefined): PluginConfig {
  const r = raw || {};
  let views: ViewConfig[] = [];
  let parsed: any[] = [];
  if (r.views) {
    try {
      const arr = JSON.parse(r.views);
      if (Array.isArray(arr)) { parsed = arr; views = arr.map((o) => normalizeView(o)); }
    } catch {
      /* fallthrough */
    }
  }
  if (views.length === 0 && r.targetViewId) {
    // 旧形式（単一ビューのフラットキー）から移行
    parsed = [r];
    views = [normalizeView(r)];
  }
  // 図データアプリ設定（全ビュー共通）。トップレベルのキーを優先し、
  // 無ければ旧データ（各ビューに入っていた値）の最初の非空値を引き継ぐ。
  const firstOf = (key: string): string => {
    for (const o of parsed) { const v = o && o[key]; if (v != null && String(v) !== "") return String(v); }
    return "";
  };
  return {
    views,
    figAppId: r.figAppId != null && r.figAppId !== "" ? String(r.figAppId) : firstOf("figAppId"),
    figNameField: r.figNameField || firstOf("figNameField") || "name",
    figDataField: r.figDataField || firstOf("figDataField") || "data",
    figSourceField: r.figSourceField || firstOf("figSourceField") || "source_app",
  };
}

/** PluginConfig を setConfig 用の文字列マップへ（views をJSON文字列で、図アプリ設定は個別キーで保存） */
export function serializeConfig(c: PluginConfig): Record<string, string> {
  return {
    views: JSON.stringify(c.views.map((v) => normalizeView(v))),
    figAppId: c.figAppId || "",
    figNameField: c.figNameField || "name",
    figDataField: c.figDataField || "data",
    figSourceField: c.figSourceField || "source_app",
  };
}

/** 書き戻し先（子の参照フィールド）に指定できるフィールド種別 */
export const WRITABLE_REF_TYPES = [
  "SINGLE_LINE_TEXT",
  "NUMBER",
  "LINK",
  "DROP_DOWN",
  "RADIO_BUTTON",
  "DATE",
  "MULTI_LINE_TEXT",
];

/** 表示に使える（値を持つ）フィールド種別。レイアウトや書込専用の自動項目を除く。 */
export const DISPLAY_TYPES = [
  "SINGLE_LINE_TEXT",
  "MULTI_LINE_TEXT",
  "RICH_TEXT",
  "NUMBER",
  "CALC",
  "LINK",
  "DATE",
  "TIME",
  "DATETIME",
  "DROP_DOWN",
  "RADIO_BUTTON",
  "CHECK_BOX",
  "MULTI_SELECT",
  "USER_SELECT",
  "ORGANIZATION_SELECT",
  "GROUP_SELECT",
  "RECORD_NUMBER",
];

/** 空の図を1枚生成する */
export function createEmptyDiagram(sourceAppId: number, name = "新しい図"): Diagram {
  return {
    schemaVersion: DIAGRAM_SCHEMA_VERSION,
    id: `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    sourceAppId,
    nodes: [],
    edges: [],
    shapes: [],
    view: { zoom: 1, panX: 0, panY: 0 },
    updatedAt: new Date().toISOString(),
  };
}
