// ツリーレイアウト（可変サイズ対応）。各ノードは箱（部門）で、メンバー数により高さ・幅が変わる。
// depth（段）＝階層フィールドの値（model.rowOf）。cross（兄弟方向）＝サイズを積んでパッキング。

import type { TreeModel } from "./model";

export const NODE_W = 190; // 後方互換（未使用の既定値）
export const NODE_H = 66;
const DEPTH_GAP = 48; // 段と段のすき間
const CROSS_GAP = 20; // 兄弟どうしのすき間

export type Direction = "vertical" | "horizontal";

export interface NodeBox { left: number; top: number; }
export interface Size { w: number; h: number; }

export interface LayoutResult {
  pos: Map<string, NodeBox>;
  width: number;
  height: number;
  direction: Direction;
}

export interface LayoutOptions {
  direction?: Direction;
  collapsed?: Set<string>; // 子を隠すノード（葉として扱う）
  sizeOf: (nodeId: string) => Size; // 各ノードの箱サイズ
}

export function layoutTree(model: TreeModel, opts: LayoutOptions): LayoutResult {
  const direction = opts.direction ?? "vertical";
  const collapsed = opts.collapsed ?? new Set<string>();
  const sizeOf = opts.sizeOf;
  const vert = direction === "vertical";
  const depthSize = (id: string): number => (vert ? sizeOf(id).h : sizeOf(id).w);
  const crossSize = (id: string): number => (vert ? sizeOf(id).w : sizeOf(id).h);

  // 段ごとの depth 座標（その段までの最大 depthSize を積む）
  const placedRows = new Map<number, number>(); // row -> max depthSize
  const allIds = model.list().map((n) => n.nodeId);
  for (const id of allIds) {
    const row = model.rowOf(id);
    placedRows.set(row, Math.max(placedRows.get(row) ?? 0, depthSize(id)));
  }
  const maxRow = Math.max(0, ...placedRows.keys());
  const rowStart: number[] = [];
  let acc = 0;
  for (let r = 0; r <= maxRow; r++) {
    rowStart[r] = acc;
    acc += (placedRows.get(r) ?? 0) + DEPTH_GAP;
  }
  const spanDepth = acc;

  // cross 方向のパッキング（サイズ可変）
  const crossCenter = new Map<string, number>();
  let cursor = 0;
  const visiting = new Set<string>();
  const place = (nodeId: string): number => {
    if (crossCenter.has(nodeId) || visiting.has(nodeId)) {
      const c = cursor + crossSize(nodeId) / 2; cursor += crossSize(nodeId) + CROSS_GAP; return c;
    }
    visiting.add(nodeId);
    const children = collapsed.has(nodeId) ? [] : model.childrenOf(nodeId).filter((ch) => !crossCenter.has(ch.nodeId));
    let c: number;
    if (children.length === 0) {
      c = cursor + crossSize(nodeId) / 2;
      cursor += crossSize(nodeId) + CROSS_GAP;
    } else {
      const start = cursor;
      const xs = children.map((ch) => place(ch.nodeId));
      // 縦並びは親を子の中央に。横並びは先頭の子に合わせる（上揃え・従来どおり）。
      c = vert ? (xs[0] + xs[xs.length - 1]) / 2 : xs[0];
      // 親の箱が子の範囲より大きいときは、親の箱の分だけ cursor を進める（重なり防止）
      const used = cursor - start;
      if (crossSize(nodeId) > used) cursor = start + crossSize(nodeId) + CROSS_GAP;
    }
    crossCenter.set(nodeId, c);
    visiting.delete(nodeId);
    return c;
  };

  for (const root of model.displayRoots()) {
    if (crossCenter.has(root.nodeId)) continue;
    place(root.nodeId);
    cursor += CROSS_GAP; // ルート間に余白
  }

  const pos = new Map<string, NodeBox>();
  for (const [id, c] of crossCenter) {
    const s = sizeOf(id);
    const depthPos = rowStart[model.rowOf(id)] ?? 0;
    if (vert) pos.set(id, { left: c - s.w / 2, top: depthPos });
    else pos.set(id, { left: depthPos, top: c - s.h / 2 });
  }

  const spanCross = Math.max(cursor, 1);
  const width = vert ? spanCross : spanDepth;
  const height = vert ? spanDepth : spanCross;
  return { pos, width, height, direction };
}
