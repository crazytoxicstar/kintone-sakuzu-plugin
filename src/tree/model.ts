// 固定表示（ツリー）のドメインモデル（グループ化・隣接リスト方式）。
// 同じグループキー（例：部門コード）のレコードを1ノード（箱）にまとめ、中にメンバーとして並べる。
// 親子はグループの親フィールド（例：親部門コード）、段は階層フィールド（数値）で決める。
// ツリー編集（ドラッグ）で変えられるのは親だけ。階層は変更しない。

import { compareCode } from "./hierarchy";

/** 箱の中に並ぶ1人（1レコード）。表示は主表示1つ＋副表示最大5つ（従来どおり）。 */
export interface Member {
  recordId: string; // kintoneの$id（親フィールドの書き戻しキー）
  main: string; // 主表示（例：氏名）
  subs: { label: string; value: string }[]; // 副表示（最大5）
}

/** 1ノード＝1グループ（例：部門）。 */
export interface TreeNode {
  nodeId: string; // グループキー（例：部門コード）
  parentId: string; // 親グループキー（空＝最上位）
  level: number; // 階層（数値）。NaN＝未設定
  sortKey: string; // 兄弟の並び順キー
  groupName: string; // 箱の見出し（例：部門名）
  members: Member[]; // この箱に属する人（直属メンバー）
}

/** メンバー1人の異動（所属グループを変える）。部門コード・親・階層・部門名をまとめて書き換える。 */
export interface FieldChange {
  recordId: string;
  before: { groupId: string; parentId: string; level: number; groupName?: string };
  after: { groupId: string; parentId: string; level: number; groupName?: string };
}

/** 付け替え可否の判定結果。reason は不可の理由。 */
export type ReparentCheck =
  | { ok: true }
  | { ok: false; reason: "self" | "noop" | "cycle" | "level" | "level-unknown" };

/** provider が読み込む1レコード（人）。これをグループキーで集約してノードにする。 */
export interface TreeRecord {
  recordId: string;
  groupId: string; // グループキー（部門コード）
  parentId: string; // 親グループキー（親部門コード）。マスタ参照時は未使用
  level: number; // 階層。マスタ参照時は未使用
  sortKey: string; // 並び順
  groupName: string; // グループ名（部門名）。マスタ参照時は未使用
  main: string; // 主表示（氏名）
  subs: { label: string; value: string }[]; // 副表示（最大5）
}

/** グルーピング元（部門マスタ等）が定義する1グループ。外部マスタ参照時に使う。 */
export interface GroupDef {
  groupId: string; // 部門コード
  parentId: string; // 親部門コード
  level: number; // 階層
  groupName: string; // 部門名
}

export class TreeModel {
  private byId = new Map<string, TreeNode>();
  private order: TreeNode[] = []; // 読み込み順（安定ソートの最終タイブレーク）
  private _emptyKey = 0; // グループキーが空のレコード数
  private _selfLoop = 0; // 親に自分自身
  private _missingParent = 0; // 親キーが実在しない（孤立）
  private _unknownGroup = 0; // マスタに無いグループキーを持つメンバー数
  private _minLevel = NaN;

  /** records: 各レコード（人）。groupDefs があればそれでグループ（部門ツリー）を定義し、メンバーを配置する（外部マスタ参照）。
   *  groupDefs が無ければ records 自身からグループを生成する（自アプリ完結）。 */
  constructor(records: TreeRecord[], groupDefs?: GroupDef[]) {
    const groups = new Map<string, TreeNode>();
    // 1) マスタ指定があれば、まず全グループ（メンバー0でも）を作る
    if (groupDefs) {
      for (const d of groupDefs) {
        if (!d.groupId || groups.has(d.groupId)) continue;
        const g = { nodeId: d.groupId, parentId: d.parentId || "", level: d.level, sortKey: d.groupId, groupName: d.groupName || d.groupId, members: [] };
        groups.set(d.groupId, g);
        this.order.push(g);
      }
    }
    // 2) メンバーを配置（マスタ未指定時はメンバーからグループを生成）
    for (const r of records) {
      if (!r.groupId) { this._emptyKey += 1; continue; }
      let g = groups.get(r.groupId);
      if (!g) {
        g = { nodeId: r.groupId, parentId: r.parentId || "", level: r.level, sortKey: r.sortKey || r.groupId, groupName: r.groupName || r.groupId, members: [] };
        groups.set(r.groupId, g);
        this.order.push(g);
        if (groupDefs) this._unknownGroup += 1; // マスタに無いキー
      }
      g.members.push({ recordId: r.recordId, main: r.main, subs: r.subs });
    }
    // 3) 親の健全化とレベル最小値
    const keySet = new Set(groups.keys());
    for (const g of this.order) {
      if (g.parentId === g.nodeId) { this._selfLoop += 1; g.parentId = ""; }
      else if (g.parentId && !keySet.has(g.parentId)) { this._missingParent += 1; }
      if (Number.isFinite(g.level)) this._minLevel = Number.isNaN(this._minLevel) ? g.level : Math.min(this._minLevel, g.level);
    }
    this.byId = groups;
  }

  list(): TreeNode[] { return [...this.order]; }
  get(nodeId: string): TreeNode | undefined { return this.byId.get(nodeId); }

  /** 直属メンバー数 */
  memberCount(nodeId: string): number { return this.byId.get(nodeId)?.members.length ?? 0; }
  /** 配下すべて（自分含む）のメンバー合計 */
  subtreeMemberCount(nodeId: string): number {
    let n = this.memberCount(nodeId);
    for (const d of this.descendants(nodeId)) n += this.memberCount(d);
    return n;
  }

  private cmp(a: TreeNode, b: TreeNode): number {
    const s = compareCode(a.sortKey, b.sortKey);
    if (s !== 0) return s;
    return this.order.indexOf(a) - this.order.indexOf(b);
  }

  childrenOf(nodeId: string): TreeNode[] {
    return this.order.filter((n) => n.parentId === nodeId && n.nodeId !== nodeId).sort((a, b) => this.cmp(a, b));
  }

  roots(): TreeNode[] {
    return this.order.filter((n) => !n.parentId || n.parentId === n.nodeId || !this.byId.has(n.parentId)).sort((a, b) => this.cmp(a, b));
  }

  descendants(nodeId: string): string[] {
    const out: string[] = []; const seen = new Set<string>();
    const walk = (id: string): void => {
      if (seen.has(id)) return; seen.add(id);
      for (const c of this.childrenOf(id)) { out.push(c.nodeId); walk(c.nodeId); }
    };
    walk(nodeId);
    return out;
  }

  hasChildren(nodeId: string): boolean {
    return this.order.some((n) => n.parentId === nodeId && n.nodeId !== nodeId);
  }

  /** 表示段（0始まり）。階層フィールドの値（最小レベルを0段目に）。未設定なら親子の深さ。 */
  rowOf(nodeId: string): number {
    const n = this.byId.get(nodeId);
    if (n && Number.isFinite(n.level) && Number.isFinite(this._minLevel)) return n.level - this._minLevel;
    let d = 0; let cur = n; const seen = new Set<string>();
    while (cur && cur.parentId && this.byId.has(cur.parentId) && !seen.has(cur.nodeId)) { seen.add(cur.nodeId); d += 1; cur = this.byId.get(cur.parentId); }
    return d;
  }

  wouldCycle(nodeId: string, targetId: string): boolean {
    if (nodeId === targetId) return true;
    return this.descendants(nodeId).includes(targetId);
  }

  /** target を node の新しい親グループにできるか（親は上位階層のみ・階層は変更しない）。 */
  canReparent(nodeId: string, targetId: string): ReparentCheck {
    if (nodeId === targetId) return { ok: false, reason: "self" };
    const node = this.byId.get(nodeId); const target = this.byId.get(targetId);
    if (!node || !target) return { ok: false, reason: "self" };
    if (target.nodeId === node.parentId) return { ok: false, reason: "noop" };
    if (this.wouldCycle(nodeId, targetId)) return { ok: false, reason: "cycle" };
    if (!Number.isFinite(node.level) || !Number.isFinite(target.level)) return { ok: false, reason: "level-unknown" };
    if (target.level < node.level) return { ok: true };
    return { ok: false, reason: "level" };
  }

  private reachableFromRoots(): Set<string> {
    const reach = new Set<string>();
    for (const r of this.roots()) { reach.add(r.nodeId); for (const d of this.descendants(r.nodeId)) reach.add(d); }
    return reach;
  }

  /** データ健全性。空キー・自己ループ・孤立親・循環・階層未設定・階層逆転・マスタ未登録キー。 */
  diagnostics(): { emptyKey: number; selfLoop: number; missingParent: number; cycle: number; levelMissing: number; levelOrder: number; unknownGroup: number } {
    const reach = this.reachableFromRoots();
    const cycle = this.order.filter((n) => !reach.has(n.nodeId)).length;
    const levelMissing = this.order.filter((n) => !Number.isFinite(n.level)).length;
    const levelOrder = this.order.filter((n) => {
      const p = n.parentId && this.byId.get(n.parentId);
      return p && Number.isFinite(n.level) && Number.isFinite(p.level) && p.level >= n.level;
    }).length;
    return { emptyKey: this._emptyKey, selfLoop: this._selfLoop, missingParent: this._missingParent, cycle, levelMissing, levelOrder, unknownGroup: this._unknownGroup };
  }

  displayRoots(): TreeNode[] {
    const roots = this.roots();
    const reach = this.reachableFromRoots();
    const extra = this.order.filter((n) => !reach.has(n.nodeId)).sort((a, b) => this.cmp(a, b));
    return [...roots, ...extra];
  }

  /** recordId のメンバーが今属するグループ（ノード）を返す。 */
  groupOfMember(recordId: string): TreeNode | undefined {
    return this.order.find((g) => g.members.some((m) => m.recordId === recordId));
  }

  /** メンバーを別の部門（targetGroupId）へ異動＝そのレコードの部門コード・親・階層を対象部門の値に書き換える。 */
  planMoveMember(recordId: string, targetGroupId: string): FieldChange[] {
    const src = this.groupOfMember(recordId);
    const target = this.byId.get(targetGroupId);
    if (!src || !target) return [];
    if (src.nodeId === targetGroupId) return []; // 同じ部門＝異動なし
    return [{
      recordId,
      before: { groupId: src.nodeId, parentId: src.parentId, level: src.level, groupName: src.groupName },
      after: { groupId: target.nodeId, parentId: target.parentId, level: target.level, groupName: target.groupName },
    }];
  }

  /** 変更セットをメモリ上のモデルへ適用（メンバーを対象部門へ移す）。 */
  apply(changes: FieldChange[]): void {
    for (const c of changes) {
      let mem: Member | undefined;
      for (const g of this.order) {
        const i = g.members.findIndex((m) => m.recordId === c.recordId);
        if (i >= 0) { mem = g.members.splice(i, 1)[0]; break; }
      }
      if (!mem) continue;
      const tg = this.byId.get(c.after.groupId);
      if (tg) tg.members.push(mem);
    }
  }

  static invert(changes: FieldChange[]): FieldChange[] {
    return changes.map((c) => ({ recordId: c.recordId, before: c.after, after: c.before }));
  }
}
