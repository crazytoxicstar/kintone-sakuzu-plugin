// 組織ツリーの描画と編集UI。ドラッグで親を付け替え、確認後に Provider で書き戻す。

import type { DataProvider } from "./providers";
import type { TreeNode, FieldChange } from "./model";
import { TreeModel } from "./model";
import { layoutTree, type LayoutResult, type NodeBox, type Direction } from "./layout";
import { injectTreeCss } from "./styles";

const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_H = 640;
const PAD = 60;

interface VB {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface NodeRect {
  nodeId: string;
  left: number;
  top: number;
  w: number;
  h: number;
}

export class TreeEditor {
  private root: HTMLElement;
  private svg!: SVGSVGElement;
  private scene!: SVGGElement;
  private edgeLayer!: SVGGElement;
  private nodeLayer!: SVGGElement;
  private statusEl!: HTMLElement;
  private toastEl!: HTMLElement;
  private undoBtn!: HTMLButtonElement;

  private model!: TreeModel;
  private layout!: LayoutResult;
  private vb: VB = { x: 0, y: 0, w: 1000, h: SVG_H };
  private rects: NodeRect[] = [];
  private undoStack: FieldChange[][] = [];
  private fitW = 1000; // ズーム100%（全体表示）基準
  private fitH = SVG_H;
  private zoomSlider?: HTMLInputElement;
  private zoomLabel?: HTMLElement;

  // ドラッグ状態
  private dragId: string | null = null;
  private dragStart = { x: 0, y: 0 };
  private dragGroup: SVGGElement | null = null;
  private hoverTarget: string | null = null;

  private direction: Direction; // 縦並び / 横並び（モードで固定）
  private collapsed = new Set<string>(); // 子（部門）を折りたたみ中のノード
  private showSubLabel: boolean; // 副表示でフィールド名を出すか
  private openInNewTab: boolean; // ノードの↗でレコードを新しいタブに開くか

  constructor(host: HTMLElement, private provider: DataProvider, direction: Direction = "vertical", showSubLabel = true, openInNewTab = true) {
    injectTreeCss(host.ownerDocument || document);
    this.root = host;
    this.direction = direction;
    this.showSubLabel = showSubLabel;
    this.openInNewTab = openInNewTab;
  }

  // 部門フレームと、中に並ぶメンバー箱（従来の見た目）の寸法
  private static PADX = 12;
  private static PADY = 10;
  private static HEADER_H = 30; // 部門名の見出し
  private static MEMBER_W = 190; // メンバー箱の幅（従来どおり）
  private static MEMBER_GAP = 10;
  // メンバー箱の列数：縦ツリーは縦積み（1列）、横ツリーは横並び（3列）。ツリーの向きで切り替える。
  private get mcols(): number { return this.direction === "horizontal" ? 3 : 1; }

  /** メンバー箱の高さ（副表示の最大数で全体を揃える。従来の主＋副レイアウト）。 */
  private memberH(): number {
    let maxSubs = 0;
    for (const a of this.model.list()) for (const m of a.members) maxSubs = Math.max(maxSubs, Math.min(5, m.subs.length));
    return 26 + maxSubs * 16 + 8;
  }

  /** 部門フレームのサイズ。中のメンバー数で高さ・幅が変わる。 */
  private sizeOf = (nodeId: string): { w: number; h: number } => {
    const node = this.model.get(nodeId);
    const mc = node ? node.members.length : 0;
    const cols = Math.max(1, Math.min(this.mcols, mc || 1));
    const innerW = cols * TreeEditor.MEMBER_W + (cols - 1) * TreeEditor.MEMBER_GAP;
    const w = Math.max(210, innerW + TreeEditor.PADX * 2);
    const rows = mc > 0 ? Math.ceil(mc / cols) : 0;
    const membersH = mc > 0 ? rows * this.memberH() + (rows - 1) * TreeEditor.MEMBER_GAP + TreeEditor.PADY : TreeEditor.PADY;
    const h = TreeEditor.HEADER_H + membersH;
    return { w, h };
  };

  async mount(): Promise<void> {
    const loaded = await this.provider.load();
    this.model = new TreeModel(loaded.records, loaded.groupDefs);
    this.buildDom();
    this.resizeToWindow();
    this.render();
    this.fit();
    window.addEventListener("resize", () => this.resizeToWindow());
    document.addEventListener("fullscreenchange", () => this.resizeToWindow());
  }

  /** SVGの高さをブラウザのウィンドウ下端まで追従させる（全画面時はウィンドウ＝画面いっぱい） */
  private resizeToWindow(): void {
    const rect = this.svg.getBoundingClientRect();
    const bottomGap = 48; // ステータス行＋余白の見込み
    const h = Math.max(320, Math.round(window.innerHeight - rect.top - bottomGap));
    this.svg.setAttribute("height", String(h));
  }

  private toggleFullscreen(): void {
    const doc = document as any;
    const el = this.root as any;
    if (!doc.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen();
    } else if (doc.exitFullscreen) {
      doc.exitFullscreen();
    }
    // fullscreenchange で resizeToWindow が走る
  }

  // ---- DOM 構築 ----
  private buildDom(): void {
    this.root.classList.add("kzt-root");
    this.root.innerHTML = "";

    const bar = document.createElement("div");
    bar.className = "kzt-toolbar";
    const brand = document.createElement("span");
    brand.className = "kzt-brand";
    brand.textContent = "ツリー編集";
    const hint = document.createElement("span");
    hint.className = "kzt-hint";
    hint.textContent = (this.direction === "vertical" ? "縦並び" : "横並び") + "・ドラッグで配置換え";
    const spacer = document.createElement("span");
    spacer.className = "kzt-spacer";
    const expandBtn = this.mkBtn("すべて展開", () => { this.collapsed.clear(); this.render(); this.fit(); });
    const collapseBtn = this.mkBtn("第2階層で畳む", () => this.collapseToDepth1());
    this.undoBtn = this.mkBtn("元に戻す", () => void this.undo());
    this.undoBtn.disabled = true;
    const fitBtn = this.mkBtn("全体表示", () => this.fit());
    const fsBtn = this.mkBtn("全画面", () => this.toggleFullscreen());
    bar.append(brand, hint, spacer, expandBtn, collapseBtn, this.undoBtn, fitBtn, fsBtn);
    this.root.appendChild(bar);

    const wrap = document.createElement("div");
    wrap.className = "kzt-canvas-wrap";
    this.svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
    this.svg.classList.add("kzt-svg");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", String(SVG_H)); // 初期値。mount後に resizeToWindow で上書き
    this.buildGrid();
    const bg = document.createElementNS(SVG_NS, "rect");
    bg.setAttribute("x", "-100000");
    bg.setAttribute("y", "-100000");
    bg.setAttribute("width", "200000");
    bg.setAttribute("height", "200000");
    bg.setAttribute("fill", "url(#kzt-grid)");
    this.svg.appendChild(bg);

    this.scene = document.createElementNS(SVG_NS, "g") as SVGGElement;
    this.edgeLayer = document.createElementNS(SVG_NS, "g") as SVGGElement;
    this.nodeLayer = document.createElementNS(SVG_NS, "g") as SVGGElement;
    this.scene.append(this.edgeLayer, this.nodeLayer);
    this.svg.appendChild(this.scene);
    wrap.appendChild(this.svg);

    wrap.appendChild(this.buildZoomBar());

    this.toastEl = document.createElement("div");
    this.toastEl.className = "kzt-toast";
    wrap.appendChild(this.toastEl);
    this.root.appendChild(wrap);

    this.statusEl = document.createElement("div");
    this.statusEl.className = "kzt-status";
    this.root.appendChild(this.statusEl);

    this.bindPanZoom(bg);
  }

  private mkBtn(label: string, onClick: () => void): HTMLButtonElement {
    const b = document.createElement("button");
    b.className = "kzt-btn";
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  private buildGrid(): void {
    const defs = document.createElementNS(SVG_NS, "defs");
    const p = document.createElementNS(SVG_NS, "pattern");
    p.setAttribute("id", "kzt-grid");
    p.setAttribute("width", "26");
    p.setAttribute("height", "26");
    p.setAttribute("patternUnits", "userSpaceOnUse");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", "M26 0 L0 0 0 26");
    path.setAttribute("fill", "none");
    path.setAttribute("class", "kzt-grid-line");
    p.appendChild(path);
    defs.appendChild(p);
    this.svg.appendChild(defs);
  }

  // ---- 描画 ----
  private render(): void {
    this.layout = layoutTree(this.model, {
      direction: this.direction,
      collapsed: this.collapsed,
      sizeOf: this.sizeOf,
    });
    this.edgeLayer.innerHTML = "";
    this.nodeLayer.innerHTML = "";
    this.rects = [];

    const vert = this.direction === "vertical";
    // エッジ（親→子、エルボー）。箱サイズは可変なので各ノードのサイズから接続点を出す。
    for (const a of this.model.list()) {
      const parent = a.parentId ? this.model.get(a.parentId) : undefined;
      if (!parent) continue;
      const pp = this.layout.pos.get(parent.nodeId);
      const cp = this.layout.pos.get(a.nodeId);
      if (!pp || !cp) continue;
      const ps = this.sizeOf(parent.nodeId), cs = this.sizeOf(a.nodeId);
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("class", "kzt-edge");
      const SHELF = 18;
      if (vert) {
        const x1 = pp.left + ps.w / 2, y1 = pp.top + ps.h;
        const x2 = cp.left + cs.w / 2, y2 = cp.top;
        const shelfY = Math.min(y1 + SHELF, y2);
        path.setAttribute("d", `M ${x1} ${y1} V ${shelfY} H ${x2} V ${y2}`);
      } else {
        const x1 = pp.left + ps.w, y1 = pp.top + ps.h / 2;
        const x2 = cp.left, y2 = cp.top + cs.h / 2;
        const shelfX = Math.min(x1 + SHELF, x2);
        path.setAttribute("d", `M ${x1} ${y1} H ${shelfX} V ${y2} H ${x2}`);
      }
      this.edgeLayer.appendChild(path);
    }

    // ノード
    for (const a of this.model.list()) {
      const pos = this.layout.pos.get(a.nodeId);
      if (!pos) continue;
      const s = this.sizeOf(a.nodeId);
      this.rects.push({ nodeId: a.nodeId, left: pos.left, top: pos.top, w: s.w, h: s.h });
      this.nodeLayer.appendChild(this.renderNode(a, pos.left, pos.top, s.w, s.h));
    }

    // 子（部門）の折りたたみトグル
    for (const a of this.model.list()) {
      if (!this.model.hasChildren(a.nodeId)) continue;
      const pos = this.layout.pos.get(a.nodeId);
      if (!pos) continue;
      this.nodeLayer.appendChild(this.renderToggle(a.nodeId, pos, this.sizeOf(a.nodeId), vert));
    }

    this.updateStatus();
  }

  // 直下（第1階層＝ルートの子）より下をすべて折りたたむ
  private collapseToDepth1(): void {
    this.collapsed.clear();
    for (const root of this.model.roots()) {
      for (const child of this.model.childrenOf(root.nodeId)) {
        if (this.model.hasChildren(child.nodeId)) this.collapsed.add(child.nodeId);
      }
    }
    this.render();
    this.fit();
  }

  private renderToggle(haichiId: string, pos: NodeBox, s: { w: number; h: number }, vert: boolean): SVGGElement {
    const isCollapsed = this.collapsed.has(haichiId);
    const cx = vert ? pos.left + s.w / 2 : pos.left + s.w + 11;
    const cy = vert ? pos.top + s.h + 11 : pos.top + s.h / 2;
    const g = document.createElementNS(SVG_NS, "g") as SVGGElement;
    g.setAttribute("class", "kzt-toggle");
    const r = document.createElementNS(SVG_NS, "rect");
    r.setAttribute("x", String(cx - 9)); r.setAttribute("y", String(cy - 9));
    r.setAttribute("width", "18"); r.setAttribute("height", "18"); r.setAttribute("rx", "4");
    const t = document.createElementNS(SVG_NS, "text");
    t.setAttribute("x", String(cx)); t.setAttribute("y", String(cy + 4));
    t.setAttribute("text-anchor", "middle"); t.setAttribute("class", "kzt-toggle-sign");
    t.textContent = isCollapsed ? "+" : "−";
    g.append(r, t);
    g.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      if (isCollapsed) this.collapsed.delete(haichiId);
      else this.collapsed.add(haichiId);
      this.render();
    });
    return g;
  }

  private text(parent: SVGGElement, cls: string, x: number, y: number, s: string): SVGTextElement {
    const t = document.createElementNS(SVG_NS, "text") as SVGTextElement;
    t.setAttribute("class", cls); t.setAttribute("x", String(x)); t.setAttribute("y", String(y));
    t.textContent = s; parent.appendChild(t);
    return t;
  }

  private renderNode(a: TreeNode, left: number, top: number, w: number, h: number): SVGGElement {
    const g = document.createElementNS(SVG_NS, "g") as SVGGElement;
    g.setAttribute("class", "kzt-node");
    g.setAttribute("transform", `translate(${left} ${top})`);
    g.dataset.node = a.nodeId;
    const PADX = TreeEditor.PADX;

    // 部門フレーム（グループの枠。メンバーのドロップ先）
    const box = document.createElementNS(SVG_NS, "rect");
    box.setAttribute("class", "kzt-deptbox"); box.setAttribute("width", String(w)); box.setAttribute("height", String(h)); box.setAttribute("rx", "8");
    g.appendChild(box);

    const accent = document.createElementNS(SVG_NS, "rect");
    accent.setAttribute("class", "kzt-accent"); accent.setAttribute("x", "0"); accent.setAttribute("y", "0");
    accent.setAttribute("width", "6"); accent.setAttribute("height", String(h));
    accent.setAttribute("fill", groupColor(a.nodeId)); accent.setAttribute("rx", "3");
    g.appendChild(accent);

    // ヘッダ：部門名
    this.text(g, "kzt-deptname", PADX + 4, 20, a.groupName || a.nodeId);

    // メンバー（従来の見た目の箱。1人ずつドラッグ可能）
    const mc = a.members.length;
    const mh = this.memberH();
    const cols = Math.max(1, Math.min(this.mcols, mc || 1));
    const startY = TreeEditor.HEADER_H;
    a.members.forEach((m, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const mx = PADX + col * (TreeEditor.MEMBER_W + TreeEditor.MEMBER_GAP);
      const my = startY + row * (mh + TreeEditor.MEMBER_GAP);
      this.memberPos.set(m.recordId, { x: left + mx, y: top + my }); // シーン座標（ドラッグ用）
      g.appendChild(this.renderMember(m, mx, my, mh));
    });
    return g;
  }

  /** メンバー1人＝従来の見た目の箱（主表示＋副表示）。ドラッグで別部門へ異動できる。 */
  private renderMember(m: { recordId: string; main: string; subs: { label: string; value: string }[] }, x: number, y: number, mh: number): SVGGElement {
    const g = document.createElementNS(SVG_NS, "g") as SVGGElement;
    g.setAttribute("class", "kzt-member");
    g.setAttribute("transform", `translate(${x} ${y})`);
    g.dataset.rec = m.recordId;
    const box = document.createElementNS(SVG_NS, "rect");
    box.setAttribute("class", "kzt-box"); box.setAttribute("width", String(TreeEditor.MEMBER_W)); box.setAttribute("height", String(mh)); box.setAttribute("rx", "6");
    g.appendChild(box);
    this.text(g, "kzt-name", 12, 19, m.main || "");
    m.subs.slice(0, 5).forEach((s, j) => {
      this.text(g, "kzt-sub", 12, 28 + 12 + j * 16, this.showSubLabel ? `${s.label}: ${s.value}` : s.value);
    });
    // レコードを開く（右上の ↗）。自由配置と同じ。ドラッグと区別するため pointerdown は伝播を止める。
    if (this.provider.recordUrl?.(m.recordId)) {
      const open = document.createElementNS(SVG_NS, "text") as SVGTextElement;
      open.setAttribute("class", "kzt-open");
      open.setAttribute("x", String(TreeEditor.MEMBER_W - 10));
      open.setAttribute("y", "18");
      open.setAttribute("text-anchor", "end");
      open.textContent = "↗";
      open.addEventListener("pointerdown", (ev) => { ev.stopPropagation(); ev.preventDefault(); this.openRecord(m.recordId); });
      g.appendChild(open);
    }
    g.addEventListener("pointerdown", (e) => this.onMemberDown(e, m.recordId, g));
    return g;
  }

  private openRecord(recordId: string): void {
    const url = this.provider.recordUrl?.(recordId);
    if (!url) return;
    const w = this.root.ownerDocument?.defaultView || window;
    if (this.openInNewTab) w.open(url, "_blank");
    else w.location.href = url;
  }

  private updateStatus(): void {
    const n = this.model.list().length;
    const roots = this.model.roots().length;
    const mode = this.provider.writable ? "書込可" : "読取のみ";
    const dg = this.model.diagnostics();
    const warns: string[] = [];
    if (dg.emptyKey > 0) warns.push(`グループキーが空のレコードが${dg.emptyKey}件あり表示できません`);
    if (dg.unknownGroup > 0) warns.push(`マスタに無い部門コードのレコードが${dg.unknownGroup}件あります（マスタ未登録）`);
    if (dg.levelMissing > 0) warns.push(`階層（レベル）が数値でないグループが${dg.levelMissing}件あります（付け替えできません）`);
    if (dg.levelOrder > 0) warns.push(`親の階層が自分以上になっているグループが${dg.levelOrder}件あります（階層フィールドを確認してください）`);
    if (dg.selfLoop > 0) warns.push(`親に自分自身を指定したグループが${dg.selfLoop}件あります（最上位として表示）`);
    if (dg.missingParent > 0) warns.push(`親キーが見つからないグループが${dg.missingParent}件あります（最上位として表示）`);
    if (dg.cycle > 0) warns.push(`親子が循環しているグループが${dg.cycle}件あります（暫定で最上位に並べています）`);
    const warnTxt = warns.length ? `　⚠ ${warns.join(" / ")}` : "";
    const totalMembers = this.model.list().reduce((s, g) => s + g.members.length, 0);
    this.statusEl.textContent = `部門 ${n} 件・メンバー ${totalMembers} 名（ルート ${roots}）／保存先: ${this.provider.label}（${mode}）${warnTxt}`;
    this.statusEl.classList.toggle("kzt-status-warn", warns.length > 0);
  }

  // ---- メンバーのドラッグ異動 ----
  private memberPos = new Map<string, { x: number; y: number }>();
  private dragBase = { x: 0, y: 0 };
  private dragMoved = false; // ドラッグ判定（しきい値未満ならクリック＝レコードを開く）
  private dragDownClient = { x: 0, y: 0 };

  private onMemberDown(e: PointerEvent, recordId: string, memberG: SVGGElement): void {
    e.stopPropagation();
    e.preventDefault();
    this.dragId = recordId;
    this.dragMoved = false;
    this.dragDownClient = { x: e.clientX, y: e.clientY };
    this.dragStart = this.toScene(e.clientX, e.clientY);
    this.dragGroup = memberG;
    // シーン座標の現在位置を基準に、最前面（nodeLayer直下）へ移して動かす
    this.dragBase = this.memberPos.get(recordId) ?? { x: 0, y: 0 };
    memberG.classList.add("kzt-dragging");
    this.nodeLayer.appendChild(memberG); // 部門<g>から出して最前面・シーン座標系へ
    memberG.setAttribute("transform", `translate(${this.dragBase.x} ${this.dragBase.y})`);
    const move = (ev: PointerEvent): void => this.onDragMove(ev);
    const up = (): void => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      this.onDragUp();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  private onDragMove(e: PointerEvent): void {
    if (!this.dragId || !this.dragGroup) return;
    // クリックとドラッグを区別：一定距離動いたらドラッグ扱い
    if (!this.dragMoved) {
      const dx = e.clientX - this.dragDownClient.x;
      const dy = e.clientY - this.dragDownClient.y;
      if (dx * dx + dy * dy > 25) this.dragMoved = true; // 5px超
    }
    const p = this.toScene(e.clientX, e.clientY);
    const nx = this.dragBase.x + (p.x - this.dragStart.x);
    const ny = this.dragBase.y + (p.y - this.dragStart.y);
    this.dragGroup.setAttribute("transform", `translate(${nx} ${ny})`);

    const target = this.hitTest(p.x, p.y);
    if (target !== this.hoverTarget) {
      this.clearHover();
      this.hoverTarget = target;
      if (target) {
        const g = this.nodeLayer.querySelector(`[data-node="${target}"]`);
        const srcGroup = this.model.groupOfMember(this.dragId);
        const valid = !!srcGroup && srcGroup.nodeId !== target; // 別部門ならOK
        g?.classList.add(valid ? "kzt-droptarget" : "kzt-invalid");
      }
    }
  }

  private onDragUp(): void {
    const recordId = this.dragId;
    const target = this.hoverTarget;
    const moved = this.dragMoved;
    this.clearHover();
    this.dragGroup?.classList.remove("kzt-dragging");
    this.dragId = null;
    this.dragGroup = null;
    if (!recordId) return;
    // ほとんど動いていない＝クリック：レコードを開く（ユーザー操作直後に開き、その後レイアウトを戻す）
    if (!moved) { this.openRecord(recordId); this.render(); return; }
    if (!target) { this.render(); return; }
    const src = this.model.groupOfMember(recordId);
    if (!src || src.nodeId === target) { this.render(); return; } // 同じ部門＝異動なし
    this.openMemberConfirm(recordId, target);
  }

  /** メンバーが乗っている部門フレームを返す。 */
  private hitTest(x: number, y: number): string | null {
    for (let i = this.rects.length - 1; i >= 0; i--) {
      const r = this.rects[i];
      if (x >= r.left && x <= r.left + r.w && y >= r.top && y <= r.top + r.h) return r.nodeId;
    }
    return null;
  }

  private clearHover(): void {
    this.nodeLayer.querySelectorAll(".kzt-droptarget,.kzt-invalid").forEach((el) => {
      el.classList.remove("kzt-droptarget", "kzt-invalid");
    });
    this.hoverTarget = null;
  }

  // ---- 確認モーダル（メンバー異動） ----
  private openMemberConfirm(recordId: string, targetGroupId: string): void {
    const src = this.model.groupOfMember(recordId)!;
    const target = this.model.get(targetGroupId)!;
    const mem = src.members.find((m) => m.recordId === recordId)!;

    const overlay = document.createElement("div");
    overlay.className = "kzt-overlay";
    const modal = document.createElement("div");
    modal.className = "kzt-modal";

    const h = document.createElement("h3");
    h.textContent = "メンバーの異動";
    modal.appendChild(h);

    const diff = document.createElement("div");
    diff.className = "kzt-diff";
    diff.innerHTML =
      `<b>${esc(mem.main || recordId)}</b> の所属を変更します<br>` +
      `<span class="kzt-old">${esc(src.groupName || src.nodeId)}</span> ` +
      `<span class="kzt-arrow">→</span> ${esc(target.groupName || target.nodeId)}<br>` +
      `<span class="kzt-desc">部門コードを ${esc(target.nodeId)} に書き換えます（親・階層も対象部門に合わせます）</span>`;
    modal.appendChild(diff);

    const actions = document.createElement("div");
    actions.className = "kzt-modal-actions";
    const cancel = document.createElement("button");
    cancel.className = "kzt-ghostbtn";
    cancel.textContent = "キャンセル";
    cancel.addEventListener("click", () => { overlay.remove(); this.render(); });
    const ok = document.createElement("button");
    ok.className = "kzt-primary";
    ok.textContent = "実行";
    ok.addEventListener("click", () => { overlay.remove(); void this.commitMemberMove(recordId, targetGroupId); });
    actions.append(cancel, ok);
    modal.appendChild(actions);

    overlay.appendChild(modal);
    (this.root.querySelector(".kzt-canvas-wrap") as HTMLElement).appendChild(overlay);
  }

  private async commitMemberMove(recordId: string, targetGroupId: string): Promise<void> {
    const changes = this.model.planMoveMember(recordId, targetGroupId);
    if (changes.length === 0) { this.render(); return; }
    try {
      await this.provider.apply(changes);
    } catch (err) {
      console.error("[kintone-zu] 書き戻しに失敗", err);
      this.render();
      const notWritable = (err as { code?: string })?.code === "FIELD_NOT_WRITABLE";
      const msg = notWritable ? (err as Error).message : "保存に失敗しました（権限やネットワークを確認）";
      this.toast(msg, notWritable ? 7000 : 2200);
      return;
    }
    this.model.apply(changes);
    this.undoStack.push(TreeModel.invert(changes));
    this.undoBtn.disabled = false;
    this.render();
    this.toast("異動しました");
  }

  private async undo(): Promise<void> {
    const inv = this.undoStack.pop();
    if (!inv) return;
    try {
      await this.provider.apply(inv);
    } catch (err) {
      console.error("[kintone-zu] アンドゥの書き戻しに失敗", err);
      this.undoStack.push(inv);
      this.toast("元に戻せませんでした");
      return;
    }
    this.model.apply(inv);
    this.undoBtn.disabled = this.undoStack.length === 0;
    this.render();
    this.toast("元に戻しました");
  }

  // ---- ビュー操作（パン/ズーム/フィット） ----
  private applyVB(): void {
    this.svg.setAttribute("viewBox", `${this.vb.x} ${this.vb.y} ${this.vb.w} ${this.vb.h}`);
    this.updateZoomUi();
  }

  private fit(): void {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const r of this.rects) {
      minX = Math.min(minX, r.left);
      minY = Math.min(minY, r.top);
      maxX = Math.max(maxX, r.left + r.w);
      maxY = Math.max(maxY, r.top + r.h);
    }
    if (!isFinite(minX)) {
      this.vb = { x: 0, y: 0, w: 1000, h: SVG_H };
    } else {
      const w = maxX - minX + PAD * 2;
      const h = maxY - minY + PAD * 2;
      this.vb = { x: minX - PAD, y: minY - PAD, w, h };
    }
    this.fitW = this.vb.w; // この表示＝100%の基準
    this.fitH = this.vb.h;
    this.applyVB();
  }

  // ---- 右側ズームバー ----
  private buildZoomBar(): HTMLElement {
    const bar = document.createElement("div");
    bar.className = "kzt-zoombar";
    const plus = document.createElement("button");
    plus.className = "kzt-zbtn"; plus.textContent = "＋";
    plus.addEventListener("click", () => this.zoomStep(1));
    const slider = document.createElement("input");
    slider.type = "range"; slider.min = "20"; slider.max = "400"; slider.value = "100";
    slider.className = "kzt-zslider";
    slider.addEventListener("input", () => this.applyZoomPct(Number(slider.value)));
    const minus = document.createElement("button");
    minus.className = "kzt-zbtn"; minus.textContent = "−";
    minus.addEventListener("click", () => this.zoomStep(-1));
    const label = document.createElement("div");
    label.className = "kzt-zlabel"; label.textContent = "100%";
    bar.append(plus, slider, minus, label);
    this.zoomSlider = slider;
    this.zoomLabel = label;
    return bar;
  }

  private zoomPct(): number {
    return this.fitW > 0 ? Math.round((this.fitW / this.vb.w) * 100) : 100;
  }
  private applyZoomPct(pct: number): void {
    const p = Math.min(400, Math.max(20, pct));
    const cx = this.vb.x + this.vb.w / 2;
    const cy = this.vb.y + this.vb.h / 2;
    const nw = (this.fitW * 100) / p;
    const nh = (this.fitH * 100) / p;
    this.vb = { x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh };
    this.applyVB();
  }
  private zoomStep(dir: number): void {
    this.applyZoomPct(this.zoomPct() * (dir > 0 ? 1.25 : 0.8));
  }
  private updateZoomUi(): void {
    const p = this.zoomPct();
    if (this.zoomSlider) this.zoomSlider.value = String(Math.min(400, Math.max(20, p)));
    if (this.zoomLabel) this.zoomLabel.textContent = p + "%";
  }

  private toScene(clientX: number, clientY: number): { x: number; y: number } {
    const r = this.svg.getBoundingClientRect();
    // preserveAspectRatio=meet を考慮（縦横で小さい方の倍率で中央寄せ）
    const scale = Math.min(r.width / this.vb.w, r.height / this.vb.h);
    const offX = (r.width - this.vb.w * scale) / 2;
    const offY = (r.height - this.vb.h * scale) / 2;
    const x = this.vb.x + (clientX - r.left - offX) / scale;
    const y = this.vb.y + (clientY - r.top - offY) / scale;
    return { x, y };
  }

  private bindPanZoom(bg: SVGRectElement): void {
    this.svg.addEventListener(
      "wheel",
      (e: WheelEvent) => {
        e.preventDefault();
        const f = e.deltaY < 0 ? 0.9 : 1 / 0.9;
        const p = this.toScene(e.clientX, e.clientY);
        this.vb.x = p.x - (p.x - this.vb.x) * f;
        this.vb.y = p.y - (p.y - this.vb.y) * f;
        this.vb.w *= f;
        this.vb.h *= f;
        this.applyVB();
      },
      { passive: false }
    );
    let panning = false;
    let last = { x: 0, y: 0 };
    bg.addEventListener("pointerdown", (e: PointerEvent) => {
      panning = true;
      last = { x: e.clientX, y: e.clientY };
      this.svg.classList.add("kzt-panning");
    });
    window.addEventListener("pointermove", (e: PointerEvent) => {
      if (!panning) return;
      const r = this.svg.getBoundingClientRect();
      const scale = Math.min(r.width / this.vb.w, r.height / this.vb.h);
      this.vb.x -= (e.clientX - last.x) / scale;
      this.vb.y -= (e.clientY - last.y) / scale;
      last = { x: e.clientX, y: e.clientY };
      this.applyVB();
    });
    window.addEventListener("pointerup", () => {
      panning = false;
      this.svg.classList.remove("kzt-panning");
    });
  }

  private toastTimer = 0;
  private toast(msg: string, ms = 2200): void {
    this.toastEl.textContent = msg;
    this.toastEl.classList.add("kzt-show");
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toastEl.classList.remove("kzt-show"), ms);
  }
}

// 文字列から安定した色を作る（兄弟グルーピングの視認用）
function groupColor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 360;
  return `hsl(${h} 55% 55%)`;
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}
