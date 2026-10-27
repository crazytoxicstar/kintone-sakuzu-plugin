// 自由配置モードのエディタ。レコードをパレットからキャンバスへ配置し、移動・線で接続し、
// 主/副フィールドを表示、クリックでレコードを開き、線でつないだ親子関係を任意で元レコードへ書き戻す。

import type { Diagram, DiagramEdge, DiagramNode, SheetType, EdgeStyle, EdgeMarker, EdgeRouting, FreeShape, TextSize } from "../shared/types";
import { createEmptyDiagram } from "../shared/types";
import type { FreeProvider, FreeRecord } from "./data";
import { injectFreeCss, FREE_CSS } from "./free-styles";
import { snapCenter, snapTopLeft, cellSize, nodeShapeFor, clipToShape, buildSheetPattern, hexPoints, GRID } from "./sheet";

const SVG_NS = "http://www.w3.org/2000/svg";

/** 色フィールド（スウォッチ＋#XXXXXX入力）の操作インターフェース */
interface ColorField {
  el: HTMLElement;
  get(): string;
  set(v: string): void;
}

/** #RGB / #RRGGBB（#は省略可）を #rrggbb へ正規化。不正なら null。 */
function normHex(v: string): string | null {
  let s = (v || "").trim();
  if (s && s[0] !== "#") s = "#" + s;
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(s)) return ("#" + s[1] + s[1] + s[2] + s[2] + s[3] + s[3]).toLowerCase();
  return null;
}
// ノード寸法はグリッド(20px)の倍数に揃える＝スナップ時に辺がグリッド線に乗る
const NODE_W = 200; // 10セル
const HEAD_H = 40; // 主表示の帯（2セル）
const SUB_H = 20; // 副表示1行（1セル）
const PAD_B = 0; // 余白はグリッドに含めるため0

export interface FreeOptions {
  openInNewTab: boolean;
  sheetType: SheetType; // normal / square / circle / honeycomb
  showSubLabel?: boolean; // 副表示でフィールド名を出すか（通常配置のみ。既定true）
}

interface VB { x: number; y: number; w: number; h: number; }

export class FreeEditor {
  private root: HTMLElement;
  private svg!: SVGSVGElement;
  private scene!: SVGGElement;
  private edgeLayer!: SVGGElement;
  private nodeLayer!: SVGGElement;
  private shapeLayer!: SVGGElement; // 自由図形（文字など）
  private printLayer!: SVGGElement; // 印刷ページ境界のオーバーレイ（印刷パネル表示中のみ）
  // 印刷設定
  private printOn = false;
  private printPanel?: HTMLElement;
  private printCountEl?: HTMLElement;
  private printPaper = "A4";
  private printOrient = "land";
  private printScale = 1;
  private palListEl!: HTMLElement;
  private searchEl!: HTMLInputElement;
  private statusEl!: HTMLElement;
  private toastEl!: HTMLElement;
  private connectBtn!: HTMLButtonElement;
  private delBtn!: HTMLButtonElement;

  private records: FreeRecord[] = [];
  private recMap = new Map<string, FreeRecord>();
  private diagram!: Diagram;
  private vb: VB = { x: 0, y: 0, w: 1000, h: 560 };
  private fitW = 1000;
  private fitH = 560;
  private zoomSlider?: HTMLInputElement;
  private zoomLabel?: HTMLElement;

  private connectMode = false;
  private snapEnabled = true; // グリッドスナップ
  private snapBtn?: HTMLButtonElement;
  // 線ツールの既定（新規線に適用。選択中の線があればそれにも反映）
  private edgeDefaults: { style: EdgeStyle; startMarker: EdgeMarker; endMarker: EdgeMarker; routing: EdgeRouting; color: string } = {
    style: "solid", startMarker: "none", endMarker: "arrow", routing: "elbow", color: "#8595a0",
  };
  private lineSel?: HTMLSelectElement;
  private startSel?: HTMLSelectElement;
  private endSel?: HTMLSelectElement;
  private routeSel?: HTMLSelectElement;
  private lineColor?: ColorField;
  private caretBtn?: HTMLButtonElement;
  private linePop?: HTMLElement;
  private connectSrc: string | null = null; // 接続の始点ノード
  private selNodes = new Set<string>(); // 選択中のノード（複数可）
  private selEdge: string | null = null;
  private selShape: string | null = null; // 選択中の文字/図形
  private marqueeMode = false; // 範囲選択モード（ドラッグで矩形選択）
  private marqueeBtn?: HTMLButtonElement;
  private canvasWrap!: HTMLElement;
  private textMode = false; // 文字配置モード
  private textBtn?: HTMLButtonElement;
  private textDefaults: { fontSize: TextSize; bold: boolean; italic: boolean; underline: boolean; color: string } = {
    fontSize: "m", bold: false, italic: false, underline: false, color: "#2d3b45",
  };
  private txtSizeSel?: HTMLSelectElement;
  private txtBold?: HTMLButtonElement;
  private txtItalic?: HTMLButtonElement;
  private txtUnderline?: HTMLButtonElement;
  private txtColor?: ColorField;
  private textPop?: HTMLElement;
  private textCaret?: HTMLButtonElement;
  private dirty = false;

  constructor(
    host: HTMLElement,
    private provider: FreeProvider,
    private sourceAppId: number,
    private opts: FreeOptions
  ) {
    injectFreeCss(host.ownerDocument || document);
    this.root = host;
  }

  async mount(): Promise<void> {
    this.records = await this.provider.loadRecords();
    this.recMap = new Map(this.records.map((r) => [r.recordId, r]));
    const loaded = await this.provider.loadDiagram();
    this.diagram = loaded ?? createEmptyDiagram(this.sourceAppId, "図1");
    this.buildDom();
    this.resizeToWindow();
    this.renderPalette();
    this.render();
    this.baselineView();
    window.addEventListener("resize", () => this.resizeToWindow());
    document.addEventListener("fullscreenchange", () => this.resizeToWindow());
  }

  /** SVGの高さをブラウザのウィンドウ下端まで追従させる */
  private resizeToWindow(): void {
    const rect = this.svg.getBoundingClientRect();
    const bottomGap = 48;
    const h = Math.max(320, Math.round(window.innerHeight - rect.top - bottomGap));
    this.svg.style.height = h + "px";
    this.palListEl.style.maxHeight = h + "px";
  }

  private toggleFullscreen(): void {
    const doc = document as any;
    const el = this.root as any;
    if (!doc.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen();
    } else if (doc.exitFullscreen) {
      doc.exitFullscreen();
    }
  }

  private get shaped(): boolean { return this.opts.sheetType !== "normal"; }

  private nodeW(): number {
    return this.shaped ? cellSize(this.opts.sheetType).w : NODE_W;
  }
  private nodeH(recordId: string): number {
    if (this.shaped) return cellSize(this.opts.sheetType).h;
    const rec = this.recMap.get(recordId);
    const subs = rec ? this.visibleSubs(rec).length : 0;
    return HEAD_H + (subs > 0 ? subs * SUB_H + PAD_B : PAD_B);
  }

  /** 表示する副（値が空のものは除外、最大5件） */
  private visibleSubs(rec: FreeRecord): { label: string; value: string }[] {
    return rec.subs.filter((s) => s.value != null && String(s.value).trim() !== "").slice(0, 5);
  }

  /** ドロップ/移動時の配置を算出（shape系はセル中心スナップ、normalは左上グリッド） */
  private placeAt(desiredX: number, desiredY: number, w: number, h: number): { x: number; y: number } {
    if (this.shaped) {
      const c = snapCenter(this.opts.sheetType, desiredX + w / 2, desiredY + h / 2);
      return { x: c.x - w / 2, y: c.y - h / 2 };
    }
    if (this.snapEnabled) return { x: snapTopLeft(desiredX), y: snapTopLeft(desiredY) };
    return { x: desiredX, y: desiredY };
  }

  /** 指定位置にノードを置くと他ノードと重なるか（shaped=同一セル / normal=矩形交差） */
  private wouldOverlap(x: number, y: number, w: number, h: number, excludeIds: Set<string> | string): boolean {
    const skip = (id: string): boolean =>
      typeof excludeIds === "string" ? id === excludeIds : excludeIds.has(id);
    for (const n of this.diagram.nodes) {
      if (skip(n.id)) continue;
      if (this.shaped) {
        // セル中心にスナップ済み＝左上が一致すれば同一セル
        if (Math.abs(n.x - x) < 1 && Math.abs(n.y - y) < 1) return true;
      } else {
        const gap = 1; // 辺が接する程度は許容
        if (x < n.x + n.w - gap && x + w > n.x + gap && y < n.y + n.h - gap && y + h > n.y + gap) return true;
      }
    }
    return false;
  }

  /** 希望位置にスナップし、重なる場合は近くの空き位置へずらして返す */
  private resolvePlacement(desiredX: number, desiredY: number, w: number, h: number, excludeId?: string): { x: number; y: number } {
    const skip = new Set<string>(excludeId ? [excludeId] : []);
    const base = this.placeAt(desiredX, desiredY, w, h);
    if (!this.wouldOverlap(base.x, base.y, w, h, skip)) return base;
    const step = this.shaped ? Math.min(cellSize(this.opts.sheetType).w, cellSize(this.opts.sheetType).h) : GRID;
    // 中心から外側へリング状に空きセルを探索
    for (let ring = 1; ring <= 80; ring++) {
      for (let dy = -ring; dy <= ring; dy++) {
        for (let dx = -ring; dx <= ring; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue; // リング境界のみ
          const cand = this.placeAt(desiredX + dx * step, desiredY + dy * step, w, h);
          if (!this.wouldOverlap(cand.x, cand.y, w, h, skip)) return cand;
        }
      }
    }
    return base; // 空きが見つからない場合は基準位置
  }

  // ---- DOM ----
  private buildDom(): void {
    this.root.classList.add("kzf-root");
    this.root.innerHTML = "";

    const bar = el("div", "kzf-toolbar");
    const brand = spanText("kzf-brand", "レコード図（自由配置）");
    const spacer = el("span", "kzf-spacer");
    // 線ツール「ライン」（＋ ▾プルダウンで 経路・線種・始点・終点・色）をひとまとまりに
    const lineTool = el("div", "kzf-linetool");
    this.connectBtn = btn("ライン", () => this.toggleConnect(), ICONS.line);
    this.caretBtn = btn("▾", () => this.toggleLinePop());
    this.caretBtn.classList.add("kzf-caret");
    this.routeSel = this.mkLineSelect([["elbow", "L字"], ["straight", "直線"]], this.edgeDefaults.routing);
    this.lineSel = this.mkLineSelect([["solid", "実線"], ["dashed", "破線"], ["dotted", "点線"], ["double", "二重線"]], this.edgeDefaults.style);
    const markerOpts: [string, string][] = [["none", "なし"], ["arrow", "▶ 矢印"], ["openArrow", "▷ 白抜き"], ["dot", "● 丸"], ["box", "■ 四角"]];
    this.startSel = this.mkLineSelect(markerOpts, this.edgeDefaults.startMarker);
    this.endSel = this.mkLineSelect(markerOpts, this.edgeDefaults.endMarker);
    this.lineColor = this.mkColorField(this.edgeDefaults.color, () => this.applyEdgeStyleFromUi());
    this.routeSel.addEventListener("change", () => this.applyEdgeStyleFromUi());
    this.lineSel.addEventListener("change", () => this.applyEdgeStyleFromUi());
    this.startSel.addEventListener("change", () => this.applyEdgeStyleFromUi());
    this.endSel.addEventListener("change", () => this.applyEdgeStyleFromUi());
    this.linePop = el("div", "kzf-linepop");
    this.linePop.style.display = "none";
    const popRow = (label: string, ctrl: HTMLElement): HTMLElement => {
      const r = el("label", "kzf-poprow"); r.append(spanText("kzf-poplabel", label), ctrl); return r;
    };
    this.linePop.append(
      popRow("経路", this.routeSel), popRow("線種", this.lineSel),
      popRow("始点", this.startSel), popRow("終点", this.endSel), popRow("色", this.lineColor.el)
    );
    lineTool.append(this.connectBtn, this.caretBtn, this.linePop);

    // 文字ツール（「文字」＋ ▾プルダウンで 大きさ・装飾・色）
    const textTool = el("div", "kzf-linetool");
    this.textBtn = btn("文字", () => this.toggleTextMode(), ICONS.text);
    this.textCaret = btn("▾", () => this.toggleTextPop());
    this.textCaret.classList.add("kzf-caret");
    this.txtSizeSel = this.mkLineSelect([["s", "小"], ["m", "中"], ["l", "大"]], this.textDefaults.fontSize);
    this.txtBold = this.mkDecoBtn("B", "kzf-deco-b", () => this.toggleDeco("bold"));
    this.txtItalic = this.mkDecoBtn("I", "kzf-deco-i", () => this.toggleDeco("italic"));
    this.txtUnderline = this.mkDecoBtn("U", "kzf-deco-u", () => this.toggleDeco("underline"));
    this.txtColor = this.mkColorField(this.textDefaults.color, () => this.applyTextStyleFromUi());
    this.txtSizeSel.addEventListener("change", () => this.applyTextStyleFromUi());
    this.textPop = el("div", "kzf-linepop");
    this.textPop.style.display = "none";
    const trow = (label: string, ctrl: HTMLElement): HTMLElement => { const r = el("label", "kzf-poprow"); r.append(spanText("kzf-poplabel", label), ctrl); return r; };
    const decoWrap = el("div", "kzf-decowrap"); decoWrap.append(this.txtBold, this.txtItalic, this.txtUnderline);
    this.textPop.append(trow("大きさ", this.txtSizeSel), trow("装飾", decoWrap), trow("色", this.txtColor.el));
    textTool.append(this.textBtn, this.textCaret, this.textPop);

    // プルダウン外クリックで閉じる（線・文字とも）
    document.addEventListener("pointerdown", (ev) => {
      const t = ev.target as Node;
      if (this.linePop && this.linePop.style.display !== "none" && !lineTool.contains(t)) this.closeLinePop();
      if (this.textPop && this.textPop.style.display !== "none" && !textTool.contains(t)) this.closeTextPop();
    });
    this.marqueeBtn = btn("選択", () => this.toggleMarquee(), ICONS.select);
    this.delBtn = btn("削除", () => this.deleteSelection(), ICONS.trash);
    this.delBtn.disabled = true;
    const saveBtn = btn("保存", () => void this.save(), ICONS.save);
    const fsBtn = btn("全画面", () => this.toggleFullscreen(), ICONS.fullscreen);
    this.snapBtn = btn(this.shaped ? "セルに整列" : "グリッド: ON", () => this.toggleSnap(), ICONS.grid);
    this.snapBtn.classList.add("kzf-on");
    if (this.shaped) this.snapBtn.disabled = true;
    // ボタン群は左寄せ。ブランド名は右端へ。
    bar.append(this.snapBtn, lineTool, textTool, this.marqueeBtn, this.delBtn, btn("全体表示", () => this.fit(), ICONS.fit), btn("印刷", () => this.togglePrint()), fsBtn, saveBtn, spacer, brand);
    this.root.appendChild(bar);

    const body = el("div", "kzf-body");
    const palette = el("div", "kzf-palette");
    this.searchEl = document.createElement("input");
    this.searchEl.className = "kzf-search";
    this.searchEl.placeholder = "レコードを検索";
    this.searchEl.addEventListener("input", () => this.renderPalette());
    this.palListEl = el("div", "kzf-pal-list");
    palette.append(this.searchEl, this.palListEl);
    body.appendChild(palette);

    const wrap = el("div", "kzf-canvas-wrap");
    this.canvasWrap = wrap;
    this.svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
    this.svg.classList.add("kzf-svg");
    this.svg.setAttribute("width", "100%");
    this.defs();
    const bg = document.createElementNS(SVG_NS, "rect");
    bg.setAttribute("x", "-100000"); bg.setAttribute("y", "-100000");
    bg.setAttribute("width", "200000"); bg.setAttribute("height", "200000");
    bg.setAttribute("fill", this.bgFill);
    bg.addEventListener("pointerdown", (e) => this.onBgDown(e));
    this.svg.appendChild(bg);
    this.scene = gEl(); this.edgeLayer = gEl(); this.nodeLayer = gEl(); this.shapeLayer = gEl(); this.printLayer = gEl();
    this.scene.append(this.edgeLayer, this.nodeLayer, this.shapeLayer, this.printLayer);
    this.svg.appendChild(this.scene);
    this.svg.addEventListener("dragover", (e) => e.preventDefault());
    this.svg.addEventListener("drop", (e) => this.onDrop(e));
    this.svg.addEventListener("wheel", (e) => this.onWheel(e), { passive: false });
    wrap.appendChild(this.svg);
    wrap.appendChild(this.buildZoomBar());
    wrap.appendChild(this.buildPrintPanel());
    this.toastEl = el("div", "kzf-toast");
    wrap.appendChild(this.toastEl);
    body.appendChild(wrap);
    this.root.appendChild(body);

    this.statusEl = el("div", "kzf-status");
    this.root.appendChild(this.statusEl);

    this.bindPan();
    document.addEventListener("keydown", (e) => {
      if (document.activeElement === this.searchEl) return;
      if ((e.key === "Enter" || e.key === "F2") && this.selShape) {
        e.preventDefault();
        void this.editText(this.selShape); // 選択中の文字をEnter/F2で再編集
      } else if ((e.key === "Delete" || e.key === "Backspace") && (this.selNodes.size || this.selEdge || this.selShape)) {
        e.preventDefault();
        this.deleteSelection();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        this.selectAllNodes();
      } else if (e.key === "Escape") {
        this.clearSelection(); this.render();
      }
    });
    this.updateStatus();
  }

  private bgFill = "url(#kzf-sheet)";
  private defs(): void {
    const defs = document.createElementNS(SVG_NS, "defs") as SVGDefsElement;
    // シート種別に応じた背景パターン（normal=グリッド / square / circle / honeycomb）
    this.bgFill = buildSheetPattern(this.opts.sheetType, defs);
    for (const m of buildEdgeMarkers()) defs.appendChild(m);
    this.svg.appendChild(defs);
  }

  // ---- パレット ----
  private renderPalette(): void {
    const q = (this.searchEl?.value || "").trim();
    const placed = new Set(this.diagram.nodes.map((n) => n.recordId));
    const items = this.records.filter((r) => !q || r.main.includes(q) || r.recordId.includes(q));
    this.palListEl.innerHTML = "";
    if (items.length === 0) {
      this.palListEl.appendChild(spanText("kzf-pal-empty", "該当レコードなし"));
      return;
    }
    for (const r of items) {
      const it = el("div", "kzf-pal-item" + (placed.has(r.recordId) ? " kzf-placed" : ""));
      // 主表示＋副表示を1行で横並び（はみ出しはCSSの…で省略）
      const line = el("div", "kzf-pal-line");
      line.appendChild(spanText("kzf-pal-main", r.main));
      const subs = r.subs.map((s) => s.value).filter((v) => v !== "" && v != null);
      if (subs.length) line.appendChild(spanText("kzf-pal-sub", subs.join(" / ")));
      it.appendChild(line);
      it.title = subs.length ? `${r.main} ｜ ${subs.join(" / ")}` : r.main; // 全文はツールチップで
      it.draggable = true;
      it.addEventListener("dragstart", (e) => {
        e.dataTransfer?.setData("text/kzf-record", r.recordId);
        e.dataTransfer?.setData("text/plain", r.recordId);
      });
      this.palListEl.appendChild(it);
    }
  }

  private onDrop(e: DragEvent): void {
    e.preventDefault();
    const rid = e.dataTransfer?.getData("text/kzf-record") || e.dataTransfer?.getData("text/plain");
    if (!rid) return;
    const rec = this.recMap.get(rid);
    if (!rec) return;
    const p = this.toScene(e.clientX, e.clientY);
    const w = this.nodeW();
    const h = this.nodeH(rid);
    const pos = this.resolvePlacement(p.x - w / 2, p.y - h / 2, w, h);
    const node: DiagramNode = {
      id: `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      recordId: rec.recordId,
      x: pos.x, y: pos.y, w, h,
      shape: nodeShapeFor(this.opts.sheetType), color: "#3498db", label: rec.main,
    };
    this.diagram.nodes.push(node);
    this.markDirty();
    this.render();
    this.renderPalette();
  }

  // ---- 描画 ----
  private render(): void {
    this.edgeLayer.innerHTML = "";
    this.nodeLayer.innerHTML = "";
    const byId = new Map(this.diagram.nodes.map((n) => [n.id, n]));
    for (const edge of this.diagram.edges) {
      const a = byId.get(edge.from); const b = byId.get(edge.to);
      if (!a || !b) continue;
      this.edgeLayer.appendChild(this.renderEdge(edge, a, b));
    }
    for (const n of this.diagram.nodes) this.nodeLayer.appendChild(this.renderNode(n));
    this.shapeLayer.innerHTML = "";
    for (const sh of this.diagram.shapes) {
      if (sh.type === "text") this.shapeLayer.appendChild(this.renderText(sh));
    }
    if (this.printOn) this.renderPageGrid(); // 印刷プレビュー中は境界も更新
    this.updateStatus();
  }

  private renderText(sh: FreeShape): SVGGElement {
    const g = gEl();
    g.setAttribute("class", "kzf-text" + (sh.id === this.selShape ? " kzf-sel" : ""));
    g.setAttribute("transform", `translate(${sh.x} ${sh.y})`);
    g.dataset.shape = sh.id;
    const px = sh.fontSize === "l" ? 24 : sh.fontSize === "s" ? 12 : 16;
    const t = document.createElementNS(SVG_NS, "text");
    t.setAttribute("x", "0"); t.setAttribute("y", String(px)); // ベースライン
    t.setAttribute("font-family", '"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif');
    t.setAttribute("font-size", String(px));
    t.setAttribute("fill", sh.color || "#2d3b45");
    if (sh.bold) t.setAttribute("font-weight", "700");
    if (sh.italic) t.setAttribute("font-style", "italic");
    if (sh.underline) t.setAttribute("text-decoration", "underline");
    t.textContent = sh.text || "";
    // 当たり判定／選択枠（概算幅：全角は約1文字幅、半角は約0.6文字幅）
    let approxW = 0;
    for (const ch of sh.text || "") approxW += (ch.charCodeAt(0) > 0xff ? 1.02 : 0.6) * px;
    approxW = Math.max(16, approxW);
    const box = document.createElementNS(SVG_NS, "rect");
    box.setAttribute("class", "kzf-text-box");
    box.setAttribute("x", "-5"); box.setAttribute("y", String(-3));
    box.setAttribute("width", String(approxW + 10)); box.setAttribute("height", String(px + 10));
    g.append(box, t);
    g.addEventListener("pointerdown", (e) => this.onShapeDown(e, sh.id));
    // ダブルクリックで再編集（当たり判定は透明の枠全体）
    g.addEventListener("dblclick", (e) => { e.stopPropagation(); e.preventDefault(); void this.editText(sh.id); });
    return g;
  }

  private async editText(shapeId: string): Promise<void> {
    const sh = this.diagram.shapes.find((s) => s.id === shapeId);
    if (!sh) return;
    const text = await this.promptText("テキストを編集", sh.text || "");
    if (text == null) return;
    if (text === "") { this.diagram.shapes = this.diagram.shapes.filter((s) => s.id !== shapeId); }
    else sh.text = text;
    this.markDirty();
    this.render();
  }

  private onShapeDown(e: PointerEvent, id: string): void {
    e.stopPropagation(); e.preventDefault();
    this.selectShape(id);
    const sh = this.diagram.shapes.find((s) => s.id === id)!;
    const start = this.toScene(e.clientX, e.clientY);
    const ox = start.x - sh.x; const oy = start.y - sh.y;
    let moved = false;
    const move = (ev: PointerEvent): void => {
      const p = this.toScene(ev.clientX, ev.clientY);
      const pos = this.placeAt(p.x - ox, p.y - oy, 0, 0);
      sh.x = pos.x; sh.y = pos.y; moved = true;
      const g = this.shapeLayer.querySelector(`[data-shape="${id}"]`) as SVGGElement | null;
      g?.setAttribute("transform", `translate(${sh.x} ${sh.y})`);
    };
    const up = (): void => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (moved) this.markDirty();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  private selectShape(id: string): void {
    this.selShape = id; this.selNodes.clear(); this.selEdge = null; this.delBtn.disabled = false;
    const sh = this.diagram.shapes.find((s) => s.id === id);
    if (sh && sh.type === "text") { this.loadTextUi(sh); this.openTextPop(); this.toast("ダブルクリックまたはEnterで文字を編集"); }
    this.render();
  }

  private renderNode(n: DiagramNode): SVGGElement {
    const rec = this.recMap.get(n.recordId);
    const h = this.nodeH(n.recordId);
    n.h = h; n.w = this.nodeW();
    const g = gEl();
    let cls = "kzf-node";
    if (this.selNodes.has(n.id)) cls += " kzf-sel";
    if (n.id === this.connectSrc) cls += " kzf-connect-src";
    g.setAttribute("class", cls);
    g.setAttribute("transform", `translate(${n.x} ${n.y})`);
    g.dataset.node = n.id;

    if (this.shaped) {
      // 形状セル：中央にラベル（主表示＋副表示）を配置。副は空値を除いて上位から表示。
      g.appendChild(this.shapeEl(n));
      const cx = n.w / 2;
      const subVals = rec ? this.visibleSubs(rec).map((s) => s.value) : [];
      const maxSub = Math.max(1, Math.min(5, Math.floor((h - 28) / 14))); // セル高に応じて表示行数（最大5）
      const lines = subVals.slice(0, maxSub);
      const lineH = 14;
      const total = 1 + lines.length;
      let y = h / 2 - ((total - 1) * lineH) / 2 + 4; // 全体を中央寄せ（4は基線補正）
      const main = document.createElementNS(SVG_NS, "text");
      main.setAttribute("class", "kzf-main"); main.setAttribute("x", String(cx));
      main.setAttribute("y", String(y)); main.setAttribute("text-anchor", "middle");
      main.textContent = truncate(rec ? rec.main : n.label, this.maxChars());
      g.appendChild(main);
      for (const v of lines) {
        y += lineH;
        const sub = document.createElementNS(SVG_NS, "text");
        sub.setAttribute("class", "kzf-sub"); sub.setAttribute("x", String(cx)); sub.setAttribute("y", String(y));
        sub.setAttribute("text-anchor", "middle");
        sub.textContent = truncate(v, this.maxChars());
        g.appendChild(sub);
      }
    } else {
      const box = document.createElementNS(SVG_NS, "rect");
      box.setAttribute("class", "kzf-box");
      box.setAttribute("width", String(n.w)); box.setAttribute("height", String(h));
      box.setAttribute("rx", "8");
      const bar = document.createElementNS(SVG_NS, "rect");
      bar.setAttribute("x", "0"); bar.setAttribute("y", "0"); bar.setAttribute("width", "6");
      bar.setAttribute("height", String(h)); bar.setAttribute("rx", "3"); bar.setAttribute("fill", n.color);
      const main = document.createElementNS(SVG_NS, "text");
      main.setAttribute("class", "kzf-main"); main.setAttribute("x", "16"); main.setAttribute("y", "25");
      main.textContent = rec ? rec.main : n.label;
      g.append(box, bar, main);
      if (rec) {
        this.visibleSubs(rec).forEach((s, i) => {
          const t = document.createElementNS(SVG_NS, "text");
          t.setAttribute("class", "kzf-sub"); t.setAttribute("x", "16"); t.setAttribute("y", String(HEAD_H + 13 + i * SUB_H));
          t.textContent = this.opts.showSubLabel === false ? s.value : `${s.label}: ${s.value}`;
          g.appendChild(t);
        });
      }
    }

    // レコードを開く（右上の ↗）。shape系はセル右上寄りに配置。
    if (this.provider.recordUrl(n.recordId)) {
      const open = document.createElementNS(SVG_NS, "text");
      open.setAttribute("class", "kzf-open");
      open.setAttribute("x", String(n.w - (this.shaped ? 16 : 10)));
      open.setAttribute("y", String(this.shaped ? 18 : 17));
      open.setAttribute("text-anchor", "end");
      open.textContent = "↗";
      open.addEventListener("pointerdown", (ev) => { ev.stopPropagation(); this.openRecord(n.recordId); });
      g.appendChild(open);
    }

    g.addEventListener("pointerdown", (e) => this.onNodeDown(e, n.id));
    return g;
  }

  private maxChars(): number {
    // セル幅から収まる全角文字数の目安（13pxフォント）
    return Math.max(3, Math.floor((this.nodeW() - 18) / 13));
  }

  private shapeEl(n: DiagramNode): SVGElement {
    const w = n.w; const h = n.h;
    if (this.opts.sheetType === "circle") {
      const e = document.createElementNS(SVG_NS, "ellipse");
      e.setAttribute("class", "kzf-box"); e.setAttribute("cx", String(w / 2)); e.setAttribute("cy", String(h / 2));
      e.setAttribute("rx", String(w / 2 - 1)); e.setAttribute("ry", String(h / 2 - 1));
      e.style.fill = tint(n.color);
      return e;
    }
    if (this.opts.sheetType === "honeycomb") {
      const poly = document.createElementNS(SVG_NS, "polygon");
      poly.setAttribute("class", "kzf-box");
      poly.setAttribute("points", hexPoints(w / 2, h / 2, Math.min(w / 2, h / Math.sqrt(3))));
      poly.style.fill = tint(n.color);
      return poly;
    }
    // square
    const r = document.createElementNS(SVG_NS, "rect");
    r.setAttribute("class", "kzf-box"); r.setAttribute("width", String(w - 2)); r.setAttribute("height", String(h - 2));
    r.setAttribute("x", "1"); r.setAttribute("y", "1"); r.setAttribute("rx", "4");
    r.style.fill = tint(n.color);
    return r;
  }

  private openRecord(recordId: string): void {
    const url = this.provider.recordUrl(recordId);
    if (!url) return;
    if (this.opts.openInNewTab) window.open(url, "_blank");
    else window.location.href = url;
  }

  private edgePath(a: DiagramNode, b: DiagramNode, routing: EdgeRouting = "elbow"): string {
    const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
    const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
    const p1 = clipToShape(this.opts.sheetType, a, bc);
    const p2 = clipToShape(this.opts.sheetType, b, ac);
    if (routing === "straight") return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
    // L字（直角）：長い軸の方向に先に伸ばし、中間で折れる3セグメント
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    if (Math.abs(dx) >= Math.abs(dy)) {
      const midX = (p1.x + p2.x) / 2;
      return `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
    }
    const midY = (p1.y + p2.y) / 2;
    return `M ${p1.x} ${p1.y} L ${p1.x} ${midY} L ${p2.x} ${midY} L ${p2.x} ${p2.y}`;
  }

  // 1本の線を <g data-edge> として生成（線種・両端の記号を反映）
  private renderEdge(edge: DiagramEdge, a: DiagramNode, b: DiagramNode): SVGGElement {
    const g = gEl();
    g.setAttribute("class", "kzf-edge-g" + (edge.id === this.selEdge ? " kzf-sel" : ""));
    g.dataset.edge = edge.id;
    const d = this.edgePath(a, b, edge.routing || "elbow");
    const m = resolveMarkers(edge);
    const style = edge.style || "solid";
    const color = edge.color || "";

    const mkPath = (cls: string): SVGPathElement => {
      const p = document.createElementNS(SVG_NS, "path") as SVGPathElement;
      p.setAttribute("class", cls); p.setAttribute("d", d);
      // 色は presentation 属性で指定（選択時のCSSハイライトが優先されるように）
      if (color && !cls.includes("inner")) p.setAttribute("stroke", color);
      return p;
    };
    if (style === "double") {
      g.appendChild(mkPath("kzf-edge kzf-edge-outer"));
      g.appendChild(mkPath("kzf-edge kzf-edge-inner"));
    } else {
      const p = mkPath("kzf-edge kzf-edge-" + style);
      if (m.start !== "none") p.setAttribute("marker-start", `url(#kzf-m-${m.start})`);
      if (m.end !== "none") p.setAttribute("marker-end", `url(#kzf-m-${m.end})`);
      g.appendChild(p);
    }
    if (style === "double") {
      // 記号は外側パスに付与
      const outer = g.querySelector(".kzf-edge-outer") as SVGPathElement;
      if (m.start !== "none") outer.setAttribute("marker-start", `url(#kzf-m-${m.start})`);
      if (m.end !== "none") outer.setAttribute("marker-end", `url(#kzf-m-${m.end})`);
    }
    // クリック当たり判定（透明の太線）
    const hit = mkPath("kzf-edge-hit");
    g.appendChild(hit);
    hit.addEventListener("pointerdown", (ev) => { ev.stopPropagation(); this.selectEdge(edge.id); });
    return g;
  }

  // ---- ノード操作 ----
  private onNodeDown(e: PointerEvent, id: string): void {
    e.stopPropagation(); e.preventDefault();
    if (this.connectMode) { this.handleConnectClick(id); return; }
    const additive = e.shiftKey || e.ctrlKey || e.metaKey;
    if (additive) { this.selectNode(id, true); return; } // 追加選択のみ（ドラッグしない）
    // すでに複数選択に含まれるノードを掴んだ場合は選択を保ったまま一括移動
    if (!(this.selNodes.has(id) && this.selNodes.size > 1)) this.selectNode(id);

    const anchor = this.diagram.nodes.find((n) => n.id === id)!;
    const groupIds = new Set(this.selNodes); // 移動対象（単体なら1つ）
    const group = this.diagram.nodes.filter((n) => groupIds.has(n.id));
    const start = this.toScene(e.clientX, e.clientY);
    const ox = start.x - anchor.x; const oy = start.y - anchor.y;
    // 各ノードのアンカーからの相対オフセット（剛体移動）
    const rel = new Map(group.map((n) => [n.id, { dx: n.x - anchor.x, dy: n.y - anchor.y }]));
    let moved = false;
    const move = (ev: PointerEvent): void => {
      const p = this.toScene(ev.clientX, ev.clientY);
      const ap = this.placeAt(p.x - ox, p.y - oy, anchor.w, anchor.h);
      // 候補位置を算出し、選択外ノードと重なるものがあれば移動しない（＝重なり禁止）
      const cand = group.map((n) => {
        const r = rel.get(n.id)!;
        return { n, x: ap.x + r.dx, y: ap.y + r.dy };
      });
      const blocked = cand.some((c) => this.wouldOverlap(c.x, c.y, c.n.w, c.n.h, groupIds));
      if (blocked) return; // ブロック：直前の有効位置を維持
      for (const c of cand) {
        c.n.x = c.x; c.n.y = c.y;
        const g = this.nodeLayer.querySelector(`[data-node="${c.n.id}"]`) as SVGGElement | null;
        g?.setAttribute("transform", `translate(${c.n.x} ${c.n.y})`);
        this.refreshEdgesOf(c.n.id);
      }
      moved = true;
    };
    const up = (): void => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (moved) this.markDirty();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  private refreshEdgesOf(nodeId: string): void {
    const byId = new Map(this.diagram.nodes.map((n) => [n.id, n]));
    for (const edge of this.diagram.edges) {
      if (edge.from !== nodeId && edge.to !== nodeId) continue;
      const a = byId.get(edge.from); const b = byId.get(edge.to);
      if (!a || !b) continue;
      const g = this.edgeLayer.querySelector(`[data-edge="${edge.id}"]`);
      if (!g) continue;
      const d = this.edgePath(a, b, edge.routing || "elbow");
      g.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));
    }
  }

  // 1つ目クリック=始点、2つ目=終点。矢印は始点→終点（図のみ。レコードは変更しない）。
  private handleConnectClick(id: string): void {
    if (!this.connectSrc) { this.connectSrc = id; this.render(); return; }
    if (this.connectSrc === id) { this.connectSrc = null; this.render(); return; }
    const fromId = this.connectSrc;
    const toId = id;
    this.connectSrc = null;
    const exists = this.diagram.edges.some(
      (e) => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)
    );
    if (!exists) this.addEdge(fromId, toId);
    this.render();
  }

  private addEdge(fromId: string, toId: string): void {
    const edge: DiagramEdge = {
      id: `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      from: fromId, to: toId,
      style: this.edgeDefaults.style,
      startMarker: this.edgeDefaults.startMarker,
      endMarker: this.edgeDefaults.endMarker,
      routing: this.edgeDefaults.routing,
      color: this.edgeDefaults.color,
    };
    this.diagram.edges.push(edge);
    this.markDirty();
  }

  // 色フィールド：スウォッチ（color input）＋ #XXXXXX 直接入力。双方向同期。
  private mkColorField(initial: string, onChange: () => void): ColorField {
    const wrap = el("div", "kzf-colorfield");
    const swatch = document.createElement("input");
    swatch.type = "color"; swatch.className = "kzf-color"; swatch.value = initial;
    const hex = document.createElement("input");
    hex.type = "text"; hex.className = "kzf-hex"; hex.maxLength = 7; hex.value = initial; hex.placeholder = "#RRGGBB"; hex.spellcheck = false;
    swatch.addEventListener("input", () => { hex.value = swatch.value; onChange(); });
    hex.addEventListener("input", () => {
      const n = normHex(hex.value);
      if (n) { swatch.value = n; onChange(); }
    });
    // 入力途中の不正値はフォーカスを外したときにスウォッチの値へ戻す
    hex.addEventListener("blur", () => { hex.value = swatch.value; });
    wrap.append(swatch, hex);
    return {
      el: wrap,
      get: () => swatch.value,
      set: (v: string) => { const n = normHex(v) || v; swatch.value = n; hex.value = n; },
    };
  }

  // 線ツール用の小さなセレクト
  private mkLineSelect(options: [string, string][], selected: string): HTMLSelectElement {
    const s = document.createElement("select");
    s.className = "kzf-linesel";
    for (const [v, t] of options) {
      const o = document.createElement("option"); o.value = v; o.textContent = t; s.appendChild(o);
    }
    s.value = selected;
    return s;
  }

  private toggleLinePop(): void {
    if (!this.linePop) return;
    if (this.linePop.style.display === "none") this.openLinePop();
    else this.closeLinePop();
  }
  private openLinePop(): void {
    if (!this.linePop) return;
    this.linePop.style.display = "";
    this.caretBtn?.classList.add("kzf-on");
  }
  private closeLinePop(): void {
    if (!this.linePop) return;
    this.linePop.style.display = "none";
    this.caretBtn?.classList.remove("kzf-on");
  }

  // ---- 文字ツール ----
  private mkDecoBtn(label: string, cls: string, onClick: () => void): HTMLButtonElement {
    const b = document.createElement("button");
    b.className = "kzf-decobtn " + cls; b.textContent = label; b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }

  private toggleTextMode(): void {
    this.textMode = !this.textMode;
    this.textBtn?.classList.toggle("kzf-on", this.textMode);
    this.svg.classList.toggle("kzf-text-mode", this.textMode);
    if (this.textMode) {
      // 文字モード中は接続・範囲選択モードを解除
      if (this.connectMode) this.toggleConnect();
      if (this.marqueeMode) this.toggleMarquee();
      this.toast("キャンバスをクリックして文字を配置");
    }
  }

  private toggleTextPop(): void {
    if (!this.textPop) return;
    if (this.textPop.style.display === "none") this.openTextPop();
    else this.closeTextPop();
  }
  private openTextPop(): void { if (this.textPop) { this.textPop.style.display = ""; this.textCaret?.classList.add("kzf-on"); } }
  private closeTextPop(): void { if (this.textPop) { this.textPop.style.display = "none"; this.textCaret?.classList.remove("kzf-on"); } }

  private toggleDeco(which: "bold" | "italic" | "underline"): void {
    this.textDefaults[which] = !this.textDefaults[which];
    this.syncDecoButtons();
    this.applyTextStyleFromUi();
  }
  private syncDecoButtons(): void {
    this.txtBold?.classList.toggle("kzf-on", this.textDefaults.bold);
    this.txtItalic?.classList.toggle("kzf-on", this.textDefaults.italic);
    this.txtUnderline?.classList.toggle("kzf-on", this.textDefaults.underline);
  }

  private applyTextStyleFromUi(): void {
    this.textDefaults.fontSize = (this.txtSizeSel?.value as TextSize) || "m";
    this.textDefaults.color = this.txtColor?.get() || "#2d3b45";
    if (this.selShape) {
      const sh = this.diagram.shapes.find((s) => s.id === this.selShape && s.type === "text");
      if (sh) {
        sh.fontSize = this.textDefaults.fontSize;
        sh.bold = this.textDefaults.bold;
        sh.italic = this.textDefaults.italic;
        sh.underline = this.textDefaults.underline;
        sh.color = this.textDefaults.color;
        this.markDirty();
        this.render();
      }
    }
  }

  private loadTextUi(sh: FreeShape): void {
    this.textDefaults = {
      fontSize: sh.fontSize || "m",
      bold: !!sh.bold, italic: !!sh.italic, underline: !!sh.underline,
      color: sh.color || "#2d3b45",
    };
    if (this.txtSizeSel) this.txtSizeSel.value = this.textDefaults.fontSize;
    if (this.txtColor) this.txtColor.set(this.textDefaults.color);
    this.syncDecoButtons();
  }

  /** アプリ内テキスト入力ダイアログ（サンドボックス環境で window.prompt が使えないため自前実装）。OKで文字列、キャンセルで null。 */
  private promptText(title: string, initial: string): Promise<string | null> {
    return new Promise((resolve) => {
      const overlay = el("div", "kzf-overlay");
      const modal = el("div", "kzf-modal");
      const h = document.createElement("h3"); h.textContent = title;
      const input = document.createElement("input");
      input.type = "text"; input.className = "kzf-textinput"; input.value = initial;
      const actions = el("div", "kzf-actions");
      const cancel = document.createElement("button");
      cancel.className = "kzf-ghost"; cancel.type = "button"; cancel.textContent = "キャンセル";
      const ok = document.createElement("button");
      ok.className = "kzf-primary"; ok.type = "button"; ok.textContent = "OK";
      actions.append(cancel, ok);
      modal.append(h, input, actions);
      overlay.appendChild(modal);
      this.canvasWrap.appendChild(overlay);
      let done = false;
      const close = (val: string | null): void => {
        if (done) return; done = true;
        overlay.remove();
        resolve(val);
      };
      cancel.addEventListener("click", () => close(null));
      ok.addEventListener("click", () => close(input.value));
      input.addEventListener("keydown", (ev) => {
        ev.stopPropagation();
        if (ev.key === "Enter") { ev.preventDefault(); close(input.value); }
        else if (ev.key === "Escape") { ev.preventDefault(); close(null); }
      });
      overlay.addEventListener("pointerdown", (ev) => { if (ev.target === overlay) close(null); });
      setTimeout(() => { input.focus(); input.select(); }, 0);
    });
  }

  private async placeText(scenePt: { x: number; y: number }): Promise<void> {
    const text = await this.promptText("テキストを入力", "テキスト");
    if (text == null || text === "") return;
    const pos = this.placeAt(scenePt.x, scenePt.y, 0, 0);
    const sh: FreeShape = {
      id: `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      type: "text", x: pos.x, y: pos.y, w: 0, h: 0, text,
      fontSize: this.textDefaults.fontSize, bold: this.textDefaults.bold,
      italic: this.textDefaults.italic, underline: this.textDefaults.underline,
      color: this.textDefaults.color,
    };
    this.diagram.shapes.push(sh);
    this.markDirty();
    this.render();
  }

  // セレクトの値を、既定＋（選択中の線があれば）その線へ反映
  private applyEdgeStyleFromUi(): void {
    const style = (this.lineSel?.value as EdgeStyle) || "solid";
    const startMarker = (this.startSel?.value as EdgeMarker) || "none";
    const endMarker = (this.endSel?.value as EdgeMarker) || "none";
    const routing = (this.routeSel?.value as EdgeRouting) || "elbow";
    const color = this.lineColor?.get() || "#8595a0";
    this.edgeDefaults = { style, startMarker, endMarker, routing, color };
    if (this.selEdge) {
      const edge = this.diagram.edges.find((e) => e.id === this.selEdge);
      if (edge) { edge.style = style; edge.startMarker = startMarker; edge.endMarker = endMarker; edge.routing = routing; edge.color = color; this.markDirty(); this.render(); }
    }
  }

  // 選択中の線の設定をセレクトに読み込む
  private loadEdgeUi(edge: DiagramEdge): void {
    const m = resolveMarkers(edge);
    if (this.lineSel) this.lineSel.value = edge.style || "solid";
    if (this.startSel) this.startSel.value = m.start;
    if (this.endSel) this.endSel.value = m.end;
    if (this.routeSel) this.routeSel.value = edge.routing || "elbow";
    if (this.lineColor) this.lineColor.set(edge.color || "#8595a0");
  }

  private toggleConnect(): void {
    this.connectMode = !this.connectMode;
    this.connectSrc = null;
    this.connectBtn.classList.toggle("kzf-on", this.connectMode);
    this.svg.classList.toggle("kzf-connect", this.connectMode);
    // 接続モード中は文字・範囲選択モードを解除
    if (this.connectMode && this.textMode) {
      this.textMode = false;
      this.textBtn?.classList.remove("kzf-on");
      this.svg.classList.remove("kzf-text-mode");
    }
    if (this.connectMode && this.marqueeMode) {
      this.marqueeMode = false;
      this.marqueeBtn?.classList.remove("kzf-on");
      this.svg.classList.remove("kzf-marquee-mode");
    }
    this.clearSelection();
    this.render();
    if (this.connectMode) {
      this.toast("つなぐ2つのノードを順にクリック");
    }
  }

  private toggleSnap(): void {
    if (this.shaped) return; // セル固定のため切替不可
    this.snapEnabled = !this.snapEnabled;
    if (this.snapBtn) {
      this.snapBtn.textContent = `グリッド: ${this.snapEnabled ? "ON" : "OFF"}`;
      this.snapBtn.classList.toggle("kzf-on", this.snapEnabled);
    }
    if (this.snapEnabled) {
      // 既存ノードを一括でグリッドに吸着
      for (const n of this.diagram.nodes) {
        const pos = this.placeAt(n.x, n.y, n.w, n.h);
        n.x = pos.x; n.y = pos.y;
      }
      this.markDirty();
      this.render();
    }
  }

  private selectNode(id: string, additive = false): void {
    if (additive) {
      if (this.selNodes.has(id)) this.selNodes.delete(id); else this.selNodes.add(id);
    } else {
      this.selNodes.clear(); this.selNodes.add(id);
    }
    this.selEdge = null; this.selShape = null;
    this.delBtn.disabled = this.selNodes.size === 0;
    this.render();
  }
  private selectAllNodes(): void {
    this.selNodes = new Set(this.diagram.nodes.map((n) => n.id));
    this.selEdge = null; this.selShape = null;
    this.delBtn.disabled = this.selNodes.size === 0;
    this.render();
  }
  private selectEdge(id: string): void {
    this.selEdge = id; this.selNodes.clear(); this.selShape = null; this.delBtn.disabled = false;
    const edge = this.diagram.edges.find((e) => e.id === id);
    if (edge) { this.loadEdgeUi(edge); this.openLinePop(); } // 選択時はプルダウンを開いて即編集
    this.render();
  }
  private clearSelection(): void { this.selNodes.clear(); this.selEdge = null; this.selShape = null; this.delBtn.disabled = true; }

  private deleteSelection(): void {
    if (this.selNodes.size) {
      const ids = this.selNodes;
      this.diagram.nodes = this.diagram.nodes.filter((n) => !ids.has(n.id));
      this.diagram.edges = this.diagram.edges.filter((e) => !ids.has(e.from) && !ids.has(e.to));
    } else if (this.selEdge) {
      this.diagram.edges = this.diagram.edges.filter((e) => e.id !== this.selEdge);
    } else if (this.selShape) {
      this.diagram.shapes = this.diagram.shapes.filter((s) => s.id !== this.selShape);
    } else return;
    this.clearSelection();
    this.markDirty();
    this.render();
    this.renderPalette();
  }

  private async save(): Promise<void> {
    this.diagram.updatedAt = new Date().toISOString();
    this.diagram.view = { zoom: 1, panX: this.vb.x, panY: this.vb.y };
    try {
      await this.provider.saveDiagram(this.diagram);
    } catch (err) {
      console.error("[kintone-zu] 保存に失敗", err);
      this.toast("保存に失敗しました（権限/フィールド構成を確認）");
      return;
    }
    this.dirty = false;
    this.toast("保存しました");
    this.updateStatus();
  }

  private markDirty(): void { this.dirty = true; this.updateStatus(); }

  private updateStatus(): void {
    const n = this.diagram.nodes.length; const e = this.diagram.edges.length;
    const sel = this.selNodes.size > 1 ? `　選択中 ${this.selNodes.size}` : "";
    this.statusEl.textContent =
      `ノード ${n} / 線 ${e}${sel}　保存先: ${this.provider.label}` + (this.dirty ? "（未保存の変更あり）" : "");
  }

  // ---- パン/ズーム ----
  private applyVB(): void {
    this.svg.setAttribute("viewBox", `${this.vb.x} ${this.vb.y} ${this.vb.w} ${this.vb.h}`);
    this.updateZoomUi();
  }
  /** 配置物の外接矩形（余白込み）。無ければ既定サイズ。 */
  private contentBox(): VB {
    if (this.diagram.nodes.length === 0) return { x: 0, y: 0, w: 1000, h: 560 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of this.diagram.nodes) {
      minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.w); maxY = Math.max(maxY, n.y + n.h);
    }
    const pad = 60;
    return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
  }

  /** 全体表示：配置物全体がちょうど収まる倍率にする。 */
  private fit(): void {
    this.vb = this.contentBox();
    this.fitW = this.vb.w; this.fitH = this.vb.h;
    this.applyVB();
    this.updateZoomUi();
  }

  /** 初期表示：ノードを一定サイズで表示し、配置物の左上を起点にする（フィットのように拡大しすぎない）。 */
  private baselineView(tries = 0): void {
    const cb = this.contentBox();
    this.fitW = cb.w; this.fitH = cb.h; // ズーム%の基準（全体表示＝100%）
    const r = this.svg.getBoundingClientRect();
    // レイアウト未確定でサイズが取れないうちは数フレーム待つ（無限ループは避ける）。
    let vpW = r.width, vpH = r.height;
    if ((!vpW || !vpH) && tries < 10) { requestAnimationFrame(() => this.baselineView(tries + 1)); return; }
    if (!vpW || !vpH) { vpW = 1200; vpH = 620; } // 取れなければ既定値で表示
    const TARGET_PX = 120;                   // ノード1枚の表示幅の目安
    const scale = TARGET_PX / this.nodeW();  // 画面px / シーン単位
    const w = vpW / scale, h = vpH / scale;
    let x = 0, y = 0;
    if (this.diagram.nodes.length) {
      let minX = Infinity, minY = Infinity;
      for (const n of this.diagram.nodes) { minX = Math.min(minX, n.x); minY = Math.min(minY, n.y); }
      const m = this.nodeW() * 0.5;          // 左上に少し余白
      x = minX - m; y = minY - m;
    }
    this.vb = { x, y, w, h };
    this.applyVB();
    this.updateZoomUi();
  }

  // ===== 印刷（ページ境界プレビュー＋分割印刷） =====
  private buildPrintPanel(): HTMLElement {
    const p = el("div", "kzf-printpanel"); p.style.display = "none";
    const row = (label: string, opts: [string, string][], val: string, on: (v: string) => void): HTMLElement => {
      const wr = el("label", "kzf-pp-row"); wr.append(spanText("kzf-pp-lb", label));
      const s = document.createElement("select"); s.className = "kzf-pp-sel";
      for (const [v, t] of opts) { const o = document.createElement("option"); o.value = v; o.textContent = t; if (v === val) o.selected = true; s.appendChild(o); }
      s.addEventListener("change", () => on(s.value)); wr.append(s); return wr;
    };
    this.printCountEl = spanText("kzf-pp-count", "—");
    const actions = el("div", "kzf-pp-actions");
    actions.append(this.printCountEl, btn("印刷する", () => this.doPrint()), btn("閉じる", () => this.togglePrint(false)));
    p.append(
      spanText("kzf-pp-title", "印刷（A4などに分割）"),
      row("用紙", [["A4", "A4"], ["A3", "A3"]], this.printPaper, (v) => { this.printPaper = v; this.renderPageGrid(); }),
      row("向き", [["land", "横"], ["port", "縦"]], this.printOrient, (v) => { this.printOrient = v; this.renderPageGrid(); }),
      row("縮尺", [["0.5", "50%"], ["0.75", "75%"], ["1", "100%"], ["1.25", "125%"], ["1.5", "150%"]], String(this.printScale), (v) => { this.printScale = Number(v); this.renderPageGrid(); }),
      actions
    );
    this.printPanel = p; return p;
  }

  private togglePrint(force?: boolean): void {
    this.printOn = force === undefined ? !this.printOn : force;
    if (this.printPanel) this.printPanel.style.display = this.printOn ? "" : "none";
    this.renderPageGrid();
  }

  /** 印刷の基準矩形＝配置物の外接矩形（原点＝左上）。余白は付けない。 */
  private printBox(): { x: number; y: number; w: number; h: number } {
    if (!this.diagram.nodes.length) return { x: 0, y: 0, w: 800, h: 600 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of this.diagram.nodes) { minX = Math.min(minX, n.x); minY = Math.min(minY, n.y); maxX = Math.max(maxX, n.x + n.w); maxY = Math.max(maxY, n.y + n.h); }
    return { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
  }

  private printTiles(): { pw: number; ph: number; s: number; uWmm: number; uHmm: number; stepW: number; stepH: number; cols: number; rows: number; ox: number; oy: number } {
    const paper = this.printPaper === "A3" ? [297, 420] : [210, 297];
    const [pw, ph] = this.printOrient === "port" ? paper : [paper[1], paper[0]];
    const s = this.printScale, PXMM = 96 / 25.4, M = 10, HD = 8;
    const uWmm = pw - M * 2, uHmm = ph - M * 2 - HD;
    const stepW = (uWmm * PXMM) / s, stepH = (uHmm * PXMM) / s;
    const cb = this.printBox();
    const cols = Math.max(1, Math.ceil(cb.w / stepW)), rows = Math.max(1, Math.ceil(cb.h / stepH));
    return { pw, ph, s, uWmm, uHmm, stepW, stepH, cols, rows, ox: cb.x, oy: cb.y };
  }

  /** ページ境界オーバーレイをシーンに描く（印刷パネル表示中のみ）。 */
  private renderPageGrid(): void {
    if (!this.printLayer) return;
    if (!this.printOn) { this.printLayer.innerHTML = ""; return; }
    const t = this.printTiles(), total = t.cols * t.rows;
    const lf = Math.max(16, t.stepW * 0.028);
    let g = "";
    for (let r = 0; r < t.rows; r++) for (let c = 0; c < t.cols; c++) {
      const x = t.ox + c * t.stepW, y = t.oy + r * t.stepH;
      g += `<rect class="kzf-pgfill" x="${x}" y="${y}" width="${t.stepW}" height="${t.stepH}"/>`
        + `<rect class="kzf-pgline" x="${x}" y="${y}" width="${t.stepW}" height="${t.stepH}"/>`
        + `<text class="kzf-pglabel" x="${x + lf * 0.5}" y="${y + lf * 1.4}" font-size="${lf}">${r + 1}-${c + 1}（${r * t.cols + c + 1}/${total}）</text>`;
    }
    this.printLayer.innerHTML = g;
    if (this.printCountEl) this.printCountEl.textContent = `${total}枚（横${t.cols}×縦${t.rows}）`;
  }

  /** 別ウィンドウにページを並べて印刷する。 */
  private doPrint(): void {
    const t = this.printTiles(), total = t.cols * t.rows;
    const content = this.edgeLayer.outerHTML + this.nodeLayer.outerHTML + this.shapeLayer.outerHTML;
    const paperName = this.printPaper + (this.printOrient === "port" ? "縦" : "横");
    const today = new Date().toLocaleDateString("ja-JP");
    let pages = "";
    for (let r = 0; r < t.rows; r++) for (let c = 0; c < t.cols; c++) {
      const x0 = t.ox + c * t.stepW, y0 = t.oy + r * t.stepH, k = r * t.cols + c + 1;
      pages += `<div class="pp"><div class="pp-in"><div class="pp-head">`
        + `<span>${paperName}・${Math.round(t.s * 100)}%・${today}</span><span>ページ ${r + 1}-${c + 1} ／ ${k}/${total}</span></div>`
        + `<svg class="pp-svg" xmlns="${SVG_NS}" width="${t.uWmm}mm" height="${t.uHmm}mm" viewBox="${x0} ${y0} ${t.stepW} ${t.stepH}" preserveAspectRatio="xMinYMin meet">`
        + `<rect x="${x0}" y="${y0}" width="${t.stepW}" height="${t.stepH}" fill="#ffffff"/>${content}</svg></div></div>`;
    }
    const w = window.open("", "_blank");
    if (!w) { this.toast("ポップアップがブロックされました。印刷するには許可してください。"); return; }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>印刷</title><style>${FREE_CSS}
@page{ size:${t.pw}mm ${t.ph}mm; margin:0; }
html,body{margin:0;background:#fff;}
.pp{width:${t.pw}mm;height:${t.ph}mm;overflow:hidden;page-break-after:always;}
.pp:last-child{page-break-after:auto;}
.pp-in{box-sizing:border-box;width:100%;height:100%;padding:10mm;display:flex;flex-direction:column;}
.pp-head{font-size:9pt;color:#44555f;border-bottom:1px solid #ccc;padding-bottom:2mm;margin-bottom:2mm;display:flex;justify-content:space-between;}
.pp-svg{flex:1;}
.kzf-open{display:none;}
</style></head><body>${pages}</body></html>`);
    w.document.close(); w.focus();
    setTimeout(() => { try { w.print(); } catch { /* noop */ } }, 400);
  }

  private buildZoomBar(): HTMLElement {
    const bar = el("div", "kzf-zoombar");
    const plus = document.createElement("button");
    plus.className = "kzf-zbtn"; plus.textContent = "＋";
    plus.addEventListener("click", () => this.zoomStep(1));
    const slider = document.createElement("input");
    slider.type = "range"; slider.min = "20"; slider.max = "400"; slider.value = "100";
    slider.className = "kzf-zslider";
    slider.addEventListener("input", () => this.applyZoomPct(Number(slider.value)));
    const minus = document.createElement("button");
    minus.className = "kzf-zbtn"; minus.textContent = "−";
    minus.addEventListener("click", () => this.zoomStep(-1));
    const label = el("div", "kzf-zlabel"); label.textContent = "100%";
    bar.append(plus, slider, minus, label);
    this.zoomSlider = slider; this.zoomLabel = label;
    return bar;
  }
  private zoomPct(): number { return this.fitW > 0 ? Math.round((this.fitW / this.vb.w) * 100) : 100; }
  private applyZoomPct(pct: number): void {
    const p = Math.min(400, Math.max(20, pct));
    const cx = this.vb.x + this.vb.w / 2, cy = this.vb.y + this.vb.h / 2;
    const nw = (this.fitW * 100) / p, nh = (this.fitH * 100) / p;
    this.vb = { x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh };
    this.applyVB();
  }
  private zoomStep(dir: number): void { this.applyZoomPct(this.zoomPct() * (dir > 0 ? 1.25 : 0.8)); }
  private updateZoomUi(): void {
    const p = this.zoomPct();
    if (this.zoomSlider) this.zoomSlider.value = String(Math.min(400, Math.max(20, p)));
    if (this.zoomLabel) this.zoomLabel.textContent = p + "%";
  }
  private toScene(cx: number, cy: number): { x: number; y: number } {
    const r = this.svg.getBoundingClientRect();
    const scale = Math.min(r.width / this.vb.w, r.height / this.vb.h);
    const offX = (r.width - this.vb.w * scale) / 2;
    const offY = (r.height - this.vb.h * scale) / 2;
    return { x: this.vb.x + (cx - r.left - offX) / scale, y: this.vb.y + (cy - r.top - offY) / scale };
  }
  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    const f = e.deltaY < 0 ? 0.9 : 1 / 0.9;
    const p = this.toScene(e.clientX, e.clientY);
    this.vb.x = p.x - (p.x - this.vb.x) * f; this.vb.y = p.y - (p.y - this.vb.y) * f;
    this.vb.w *= f; this.vb.h *= f; this.applyVB();
  }
  private panning = false;
  private panLast = { x: 0, y: 0 };
  private onBgDown(e: PointerEvent): void {
    if (this.textMode) {
      const pt = this.toScene(e.clientX, e.clientY);
      void this.placeText(pt);
      return; // 文字配置後はパン開始しない
    }
    if (this.connectMode) { this.connectSrc = null; this.render(); }
    if (this.marqueeMode) { this.startMarquee(e); return; } // 範囲選択モード＝矩形ドラッグ
    this.clearSelection(); this.render();
    this.panning = true; this.panLast = { x: e.clientX, y: e.clientY };
    this.svg.classList.add("kzf-pan");
  }

  /** 範囲選択（ラバーバンド）。矩形に交差するノードをまとめて選択する。 */
  private startMarquee(e: PointerEvent): void {
    const additive = e.shiftKey || e.ctrlKey || e.metaKey;
    if (!additive) { this.selNodes.clear(); this.selEdge = null; this.selShape = null; }
    const start = this.toScene(e.clientX, e.clientY);
    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("class", "kzf-marquee");
    this.scene.appendChild(rect);
    const box = { x: start.x, y: start.y, w: 0, h: 0 };
    const apply = (ev: PointerEvent): void => {
      const p = this.toScene(ev.clientX, ev.clientY);
      box.x = Math.min(start.x, p.x); box.y = Math.min(start.y, p.y);
      box.w = Math.abs(p.x - start.x); box.h = Math.abs(p.y - start.y);
      rect.setAttribute("x", String(box.x)); rect.setAttribute("y", String(box.y));
      rect.setAttribute("width", String(box.w)); rect.setAttribute("height", String(box.h));
    };
    const up = (): void => {
      window.removeEventListener("pointermove", apply);
      window.removeEventListener("pointerup", up);
      rect.remove();
      for (const n of this.diagram.nodes) {
        if (box.x < n.x + n.w && box.x + box.w > n.x && box.y < n.y + n.h && box.y + box.h > n.y) {
          this.selNodes.add(n.id);
        }
      }
      this.delBtn.disabled = this.selNodes.size === 0;
      this.render();
    };
    window.addEventListener("pointermove", apply);
    window.addEventListener("pointerup", up);
  }

  private toggleMarquee(): void {
    this.marqueeMode = !this.marqueeMode;
    this.marqueeBtn?.classList.toggle("kzf-on", this.marqueeMode);
    this.svg.classList.toggle("kzf-marquee-mode", this.marqueeMode);
    if (this.marqueeMode) {
      // 範囲選択中は接続・文字モードを解除
      if (this.connectMode) this.toggleConnect();
      if (this.textMode) {
        this.textMode = false;
        this.textBtn?.classList.remove("kzf-on");
        this.svg.classList.remove("kzf-text-mode");
      }
      this.toast("ドラッグで範囲選択（Shiftで追加選択）");
    }
  }
  private bindPan(): void {
    window.addEventListener("pointermove", (e) => {
      if (!this.panning) return;
      const r = this.svg.getBoundingClientRect();
      const scale = Math.min(r.width / this.vb.w, r.height / this.vb.h);
      this.vb.x -= (e.clientX - this.panLast.x) / scale;
      this.vb.y -= (e.clientY - this.panLast.y) / scale;
      this.panLast = { x: e.clientX, y: e.clientY }; this.applyVB();
    });
    window.addEventListener("pointerup", () => { this.panning = false; this.svg.classList.remove("kzf-pan"); });
  }

  private toastTimer = 0;
  private toast(msg: string): void {
    this.toastEl.textContent = msg; this.toastEl.classList.add("kzf-show");
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toastEl.classList.remove("kzf-show"), 2600);
  }
}

function truncate(s: string, max: number): string {
  if (!s) return "";
  return s.length > max ? s.slice(0, Math.max(1, max - 1)) + "…" : s;
}
// 形状セルの塗り（アクセント色の淡色）
function tint(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return "#eef5fb";
  const r = parseInt(m[1].slice(0, 2), 16), g = parseInt(m[1].slice(2, 4), 16), b = parseInt(m[1].slice(4, 6), 16);
  const mix = (c: number): number => Math.round(c + (255 - c) * 0.86);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

function el(tag: string, cls: string): HTMLElement { const e = document.createElement(tag); e.className = cls; return e; }
function spanText(cls: string, text: string): HTMLElement { const s = el("span", cls); s.textContent = text; return s; }
function gEl(): SVGGElement { return document.createElementNS(SVG_NS, "g") as SVGGElement; }
// ツールバー用の16pxインラインアイコン（currentColor で文字色に追従）
const ICONS: Record<string, string> = {
  grid: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="2.5" width="11" height="11" rx="1"/><path d="M2.5 6.2H13.5M2.5 9.8H13.5M6.2 2.5V13.5M9.8 2.5V13.5"/></svg>`,
  line: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4.5 11.5 11.5 4.5"/><circle cx="4.5" cy="11.5" r="1.6" fill="currentColor" stroke="none"/><circle cx="11.5" cy="4.5" r="1.6" fill="currentColor" stroke="none"/></svg>`,
  text: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M4 4H12M8 4V12.5M6.3 12.5H9.7"/></svg>`,
  select: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="2.5" width="11" height="11" rx="1" stroke-dasharray="2.2 2"/></svg>`,
  trash: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5H13M6 4.5V3H10V4.5M4.5 4.5 5.2 13H10.8L11.5 4.5M7 7V11M9 7V11"/></svg>`,
  fit: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6V3H6M10 3H13V6M13 10V13H10M6 13H3V10"/></svg>`,
  fullscreen: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 6.5 13 3M13 3H10M13 3V6"/><path d="M6.5 9.5 3 13M3 13H6M3 13V10"/></svg>`,
  save: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.5V9.5M5.3 6.8 8 9.5 10.7 6.8"/><path d="M3 11.5V13H13V11.5"/></svg>`,
};

function btn(label: string, onClick: () => void, icon?: string): HTMLButtonElement {
  const b = document.createElement("button"); b.className = "kzf-btn"; b.type = "button";
  if (icon) {
    b.classList.add("kzf-iconbtn"); b.innerHTML = icon;
    const s = document.createElement("span"); s.className = "kzf-btn-label"; s.textContent = label; b.appendChild(s);
  } else {
    b.textContent = label;
  }
  b.addEventListener("click", onClick); return b;
}

// 旧データ(arrow)互換を含めて始点/終点の記号を解決
function resolveMarkers(edge: DiagramEdge): { start: EdgeMarker; end: EdgeMarker } {
  const legacyEnd: EdgeMarker = edge.arrow === "none" ? "none" : "arrow";
  const legacyStart: EdgeMarker = edge.arrow === "both" ? "arrow" : "none";
  return {
    start: edge.startMarker ?? legacyStart,
    end: edge.endMarker ?? legacyEnd,
  };
}

// エッジ端点のマーカー定義（両端で共用。auto-start-reverseで向きを反転）
function buildEdgeMarkers(): SVGMarkerElement[] {
  const NS = "http://www.w3.org/2000/svg";
  const COLOR = "#8595a0";
  const mk = (id: string, build: (m: SVGMarkerElement) => void): SVGMarkerElement => {
    const m = document.createElementNS(NS, "marker") as SVGMarkerElement;
    m.setAttribute("id", id);
    m.setAttribute("viewBox", "0 0 12 12");
    m.setAttribute("refX", "10"); m.setAttribute("refY", "6");
    m.setAttribute("markerWidth", "8"); m.setAttribute("markerHeight", "8");
    m.setAttribute("orient", "auto-start-reverse");
    build(m);
    return m;
  };
  const path = (d: string, fill: string, stroke = "none"): SVGPathElement => {
    const p = document.createElementNS(NS, "path") as SVGPathElement;
    p.setAttribute("d", d); p.setAttribute("fill", fill);
    if (stroke !== "none") { p.setAttribute("stroke", stroke); p.setAttribute("fill", "none"); p.setAttribute("stroke-width", "1.6"); }
    return p;
  };
  const arrow = mk("kzf-m-arrow", (m) => m.appendChild(path("M1 1 L11 6 L1 11 z", COLOR)));
  const openArrow = mk("kzf-m-openArrow", (m) => { m.setAttribute("refX", "10"); m.appendChild(path("M1 1 L11 6 L1 11", "none", COLOR)); });
  const dot = mk("kzf-m-dot", (m) => {
    m.setAttribute("refX", "6");
    const c = document.createElementNS(NS, "circle"); c.setAttribute("cx", "6"); c.setAttribute("cy", "6"); c.setAttribute("r", "4"); c.setAttribute("fill", COLOR);
    m.appendChild(c);
  });
  const box = mk("kzf-m-box", (m) => {
    m.setAttribute("refX", "6");
    const r = document.createElementNS(NS, "rect"); r.setAttribute("x", "2"); r.setAttribute("y", "2"); r.setAttribute("width", "8"); r.setAttribute("height", "8"); r.setAttribute("fill", COLOR);
    m.appendChild(r);
  });
  return [arrow, openArrow, dot, box];
}
