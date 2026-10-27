// 自由配置のシート種別ごとのジオメトリ（スナップ格子・セルサイズ・形状・背景パターン）。
// normal=細グリッド（左上スナップ）、square/circle=正方格子（セル中心スナップ）、honeycomb=フラットトップ六角格子。

import type { SheetType, NodeShape } from "../shared/types";

export const GRID = 20; // normal の細グリッド
export const CELL = 112; // square のセルピッチ＝ノードサイズ
export const CIRCLE_D = 104; // circle の直径＝六角最密パッキングの最近接距離
export const HEXR = 60; // honeycomb の六角形の一辺（中心→頂点）

const SVG_NS = "http://www.w3.org/2000/svg";
const SQRT3 = Math.sqrt(3);
const ROW_H = (SQRT3 / 2) * CIRCLE_D; // circle 六角最密の行間

/** ノードサイズ（セルにぴったり収まる大きさ） */
export function cellSize(sheet: SheetType): { w: number; h: number } {
  switch (sheet) {
    case "square":
      return { w: CELL, h: CELL };
    case "circle":
      return { w: CIRCLE_D, h: CIRCLE_D };
    case "honeycomb":
      return { w: 2 * HEXR, h: Math.round(SQRT3 * HEXR) }; // フラットトップ: 幅=2R, 高さ=√3R
    default:
      return { w: 190, h: 0 }; // normal は可変高（呼び出し側で算出）
  }
}

export function nodeShapeFor(sheet: SheetType): NodeShape {
  switch (sheet) {
    case "square": return "square";
    case "circle": return "ellipse";
    case "honeycomb": return "hexagon";
    default: return "roundRect";
  }
}

/** 望みの中心(cx,cy)を、シートのセル中心へスナップする（shape系のみ） */
export function snapCenter(sheet: SheetType, cx: number, cy: number): { x: number; y: number } {
  if (sheet === "square") {
    // セルの中心（(n+0.5)*CELL）へ。背景の格子セルにノードがぴったり重なる。
    const c = (v: number): number => Math.round((v - CELL / 2) / CELL) * CELL + CELL / 2;
    return { x: c(cx), y: c(cy) };
  }
  if (sheet === "circle") {
    return circleRound(cx, cy); // 六角最密パッキングの最近接中心
  }
  if (sheet === "honeycomb") {
    return hexRound(cx, cy);
  }
  return { x: cx, y: cy };
}

/** 円の六角最密パッキング（三角格子）の最近接中心へスナップ */
function circleRound(cx: number, cy: number): { x: number; y: number } {
  const p = CIRCLE_D;
  const h = ROW_H;
  let best = { x: cx, y: cy };
  let bd = Infinity;
  const jr = Math.round(cy / h);
  for (let j = jr - 1; j <= jr + 1; j++) {
    const off = (((j % 2) + 2) % 2) === 1 ? p / 2 : 0; // 奇数行は半ピッチずらす
    const ic = Math.round((cx - off) / p);
    for (const i of [ic - 1, ic, ic + 1]) {
      const x = i * p + off;
      const y = j * h;
      const d = (x - cx) ** 2 + (y - cy) ** 2;
      if (d < bd) { bd = d; best = { x, y }; }
    }
  }
  return best;
}

/** normal の左上スナップ（従来） */
export function snapTopLeft(v: number): number {
  return Math.round(v / GRID) * GRID;
}

// --- フラットトップ六角格子 ---
function hexRound(x: number, y: number): { x: number; y: number } {
  const s = HEXR;
  const q = ((2 / 3) * x) / s;
  const r = ((-1 / 3) * x + (SQRT3 / 3) * y) / s;
  // cube round
  let xc = q;
  let zc = r;
  let yc = -xc - zc;
  let rx = Math.round(xc);
  let ry = Math.round(yc);
  let rz = Math.round(zc);
  const dx = Math.abs(rx - xc);
  const dy = Math.abs(ry - yc);
  const dz = Math.abs(rz - zc);
  if (dx > dy && dx > dz) rx = -ry - rz;
  else if (dy > dz) ry = -rx - rz;
  else rz = -rx - ry;
  const cx = s * (3 / 2) * rx;
  const cy = s * SQRT3 * (rz + rx / 2);
  return { x: cx, y: cy };
}

/** フラットトップ六角形の頂点（中心(0,0)基準） */
export function hexPoints(cx: number, cy: number, r = HEXR): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i); // 0°,60°,... フラットトップ（頂点が左右）
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

/** 中心cから toward 方向に、形状の境界までの交点（エッジ始点/終点のクリップ用） */
export function clipToShape(
  sheet: SheetType,
  node: { x: number; y: number; w: number; h: number },
  toward: { x: number; y: number }
): { x: number; y: number } {
  const cx = node.x + node.w / 2;
  const cy = node.y + node.h / 2;
  const dx = toward.x - cx;
  const dy = toward.y - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  if (sheet === "circle") {
    const rad = Math.min(node.w, node.h) / 2;
    const len = Math.hypot(dx, dy);
    return { x: cx + (dx / len) * rad, y: cy + (dy / len) * rad };
  }
  if (sheet === "honeycomb") {
    const rad = (SQRT3 / 2) * (node.h / SQRT3); // 内接円半径 ≒ √3/2 * R, R=h/√3
    const len = Math.hypot(dx, dy);
    return { x: cx + (dx / len) * rad, y: cy + (dy / len) * rad };
  }
  // 矩形（square / rect）
  const hw = node.w / 2;
  const hh = node.h / 2;
  const scale = 1 / Math.max(Math.abs(dx) / hw, Math.abs(dy) / hh);
  return { x: cx + dx * scale, y: cy + dy * scale };
}

/**
 * 背景パターンを defs に追加し、背景矩形の fill に使う url(#...) を返す。
 * normal は 20px 細グリッド＋100px 太グリッド。square/circle はセル枠。honeycomb は六角セル。
 */
export function buildSheetPattern(sheet: SheetType, defs: SVGDefsElement): string {
  const mk = (tag: string): SVGElement => document.createElementNS(SVG_NS, tag) as SVGElement;
  if (sheet === "square") {
    const p = mk("pattern");
    p.setAttribute("id", "kzf-sheet"); p.setAttribute("width", String(CELL)); p.setAttribute("height", String(CELL));
    p.setAttribute("patternUnits", "userSpaceOnUse");
    const rect = mk("rect");
    rect.setAttribute("x", "0"); rect.setAttribute("y", "0"); rect.setAttribute("width", String(CELL)); rect.setAttribute("height", String(CELL));
    rect.setAttribute("fill", "none"); rect.setAttribute("class", "kzf-cell-line");
    p.appendChild(rect); defs.appendChild(p);
    return "url(#kzf-sheet)";
  }
  if (sheet === "circle") {
    // 六角最密パッキング。タイル = ピッチ×(2×行間)、2行ぶんの中心を配置して継ぎ目なく敷き詰め。
    const pit = CIRCLE_D;
    const h = ROW_H;
    const r = pit / 2 - 1;
    const p = mk("pattern");
    p.setAttribute("id", "kzf-sheet"); p.setAttribute("width", String(pit)); p.setAttribute("height", String(2 * h));
    p.setAttribute("patternUnits", "userSpaceOnUse");
    const centers: [number, number][] = [[0, 0], [pit, 0], [0, 2 * h], [pit, 2 * h], [pit / 2, h]];
    for (const [cx, cy] of centers) {
      const c = mk("circle");
      c.setAttribute("cx", String(cx)); c.setAttribute("cy", String(cy)); c.setAttribute("r", String(r));
      c.setAttribute("fill", "none"); c.setAttribute("class", "kzf-cell-line");
      p.appendChild(c);
    }
    defs.appendChild(p);
    return "url(#kzf-sheet)";
  }
  if (sheet === "honeycomb") {
    const w = 3 * HEXR; // タイル幅
    const h = Math.round(SQRT3 * HEXR); // タイル高
    const p = mk("pattern");
    p.setAttribute("id", "kzf-sheet"); p.setAttribute("width", String(w)); p.setAttribute("height", String(h));
    p.setAttribute("patternUnits", "userSpaceOnUse");
    // タイル[0,3R]×[0,√3R]。内部中心(1.5R, √3R/2)＋四隅(列0と列2は同位相=yオフセット0)。
    // 右端は 3R=列2(偶数)なので y=0 側に揃える（半ピッチずらさない）。
    for (const [cx, cy] of [[0, 0], [3 * HEXR, 0], [0, h], [3 * HEXR, h], [1.5 * HEXR, h / 2]]) {
      const poly = mk("polygon");
      poly.setAttribute("points", hexPoints(cx, cy));
      poly.setAttribute("fill", "none"); poly.setAttribute("class", "kzf-cell-line");
      p.appendChild(poly);
    }
    defs.appendChild(p);
    return "url(#kzf-sheet)";
  }
  // normal: 細グリッド + 太グリッド
  const minor = mk("pattern");
  minor.setAttribute("id", "kzf-grid"); minor.setAttribute("width", String(GRID)); minor.setAttribute("height", String(GRID));
  minor.setAttribute("patternUnits", "userSpaceOnUse");
  const mp = mk("path"); mp.setAttribute("d", `M${GRID} 0 L0 0 0 ${GRID}`); mp.setAttribute("fill", "none"); mp.setAttribute("class", "kzf-grid-line");
  minor.appendChild(mp);
  const MAJOR = GRID * 5;
  const major = mk("pattern");
  major.setAttribute("id", "kzf-sheet"); major.setAttribute("width", String(MAJOR)); major.setAttribute("height", String(MAJOR));
  major.setAttribute("patternUnits", "userSpaceOnUse");
  const bg = mk("rect"); bg.setAttribute("width", String(MAJOR)); bg.setAttribute("height", String(MAJOR)); bg.setAttribute("fill", "url(#kzf-grid)");
  const majp = mk("path"); majp.setAttribute("d", `M${MAJOR} 0 L0 0 0 ${MAJOR}`); majp.setAttribute("fill", "none"); majp.setAttribute("class", "kzf-grid-line-major");
  major.append(bg, majp);
  defs.append(minor, major);
  return "url(#kzf-sheet)";
}
