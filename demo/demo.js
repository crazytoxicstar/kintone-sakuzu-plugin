"use strict";
(() => {
  // src/tree/hierarchy.ts
  function compareCode(a, b) {
    return String(a).localeCompare(String(b), void 0, { numeric: true, sensitivity: "base" });
  }

  // src/tree/model.ts
  var TreeModel = class {
    /** records: 各レコード（人）。groupDefs があればそれでグループ（部門ツリー）を定義し、メンバーを配置する（外部マスタ参照）。
     *  groupDefs が無ければ records 自身からグループを生成する（自アプリ完結）。 */
    constructor(records, groupDefs) {
      this.byId = /* @__PURE__ */ new Map();
      this.order = [];
      // 読み込み順（安定ソートの最終タイブレーク）
      this._emptyKey = 0;
      // グループキーが空のレコード数
      this._selfLoop = 0;
      // 親に自分自身
      this._missingParent = 0;
      // 親キーが実在しない（孤立）
      this._unknownGroup = 0;
      // マスタに無いグループキーを持つメンバー数
      this._minLevel = NaN;
      const groups = /* @__PURE__ */ new Map();
      if (groupDefs) {
        for (const d of groupDefs) {
          if (!d.groupId || groups.has(d.groupId)) continue;
          const g = { nodeId: d.groupId, parentId: d.parentId || "", level: d.level, sortKey: d.groupId, groupName: d.groupName || d.groupId, members: [] };
          groups.set(d.groupId, g);
          this.order.push(g);
        }
      }
      for (const r of records) {
        if (!r.groupId) {
          this._emptyKey += 1;
          continue;
        }
        let g = groups.get(r.groupId);
        if (!g) {
          g = { nodeId: r.groupId, parentId: r.parentId || "", level: r.level, sortKey: r.sortKey || r.groupId, groupName: r.groupName || r.groupId, members: [] };
          groups.set(r.groupId, g);
          this.order.push(g);
          if (groupDefs) this._unknownGroup += 1;
        }
        g.members.push({ recordId: r.recordId, main: r.main, subs: r.subs });
      }
      const keySet = new Set(groups.keys());
      for (const g of this.order) {
        if (g.parentId === g.nodeId) {
          this._selfLoop += 1;
          g.parentId = "";
        } else if (g.parentId && !keySet.has(g.parentId)) {
          this._missingParent += 1;
        }
        if (Number.isFinite(g.level)) this._minLevel = Number.isNaN(this._minLevel) ? g.level : Math.min(this._minLevel, g.level);
      }
      this.byId = groups;
    }
    list() {
      return [...this.order];
    }
    get(nodeId) {
      return this.byId.get(nodeId);
    }
    /** 直属メンバー数 */
    memberCount(nodeId) {
      var _a, _b;
      return (_b = (_a = this.byId.get(nodeId)) == null ? void 0 : _a.members.length) != null ? _b : 0;
    }
    /** 配下すべて（自分含む）のメンバー合計 */
    subtreeMemberCount(nodeId) {
      let n = this.memberCount(nodeId);
      for (const d of this.descendants(nodeId)) n += this.memberCount(d);
      return n;
    }
    cmp(a, b) {
      const s = compareCode(a.sortKey, b.sortKey);
      if (s !== 0) return s;
      return this.order.indexOf(a) - this.order.indexOf(b);
    }
    childrenOf(nodeId) {
      return this.order.filter((n) => n.parentId === nodeId && n.nodeId !== nodeId).sort((a, b) => this.cmp(a, b));
    }
    roots() {
      return this.order.filter((n) => !n.parentId || n.parentId === n.nodeId || !this.byId.has(n.parentId)).sort((a, b) => this.cmp(a, b));
    }
    descendants(nodeId) {
      const out = [];
      const seen = /* @__PURE__ */ new Set();
      const walk = (id) => {
        if (seen.has(id)) return;
        seen.add(id);
        for (const c of this.childrenOf(id)) {
          out.push(c.nodeId);
          walk(c.nodeId);
        }
      };
      walk(nodeId);
      return out;
    }
    hasChildren(nodeId) {
      return this.order.some((n) => n.parentId === nodeId && n.nodeId !== nodeId);
    }
    /** 表示段（0始まり）。階層フィールドの値（最小レベルを0段目に）。未設定なら親子の深さ。 */
    rowOf(nodeId) {
      const n = this.byId.get(nodeId);
      if (n && Number.isFinite(n.level) && Number.isFinite(this._minLevel)) return n.level - this._minLevel;
      let d = 0;
      let cur = n;
      const seen = /* @__PURE__ */ new Set();
      while (cur && cur.parentId && this.byId.has(cur.parentId) && !seen.has(cur.nodeId)) {
        seen.add(cur.nodeId);
        d += 1;
        cur = this.byId.get(cur.parentId);
      }
      return d;
    }
    wouldCycle(nodeId, targetId) {
      if (nodeId === targetId) return true;
      return this.descendants(nodeId).includes(targetId);
    }
    /** target を node の新しい親グループにできるか（親は上位階層のみ・階層は変更しない）。 */
    canReparent(nodeId, targetId) {
      if (nodeId === targetId) return { ok: false, reason: "self" };
      const node = this.byId.get(nodeId);
      const target = this.byId.get(targetId);
      if (!node || !target) return { ok: false, reason: "self" };
      if (target.nodeId === node.parentId) return { ok: false, reason: "noop" };
      if (this.wouldCycle(nodeId, targetId)) return { ok: false, reason: "cycle" };
      if (!Number.isFinite(node.level) || !Number.isFinite(target.level)) return { ok: false, reason: "level-unknown" };
      if (target.level < node.level) return { ok: true };
      return { ok: false, reason: "level" };
    }
    reachableFromRoots() {
      const reach = /* @__PURE__ */ new Set();
      for (const r of this.roots()) {
        reach.add(r.nodeId);
        for (const d of this.descendants(r.nodeId)) reach.add(d);
      }
      return reach;
    }
    /** データ健全性。空キー・自己ループ・孤立親・循環・階層未設定・階層逆転・マスタ未登録キー。 */
    diagnostics() {
      const reach = this.reachableFromRoots();
      const cycle = this.order.filter((n) => !reach.has(n.nodeId)).length;
      const levelMissing = this.order.filter((n) => !Number.isFinite(n.level)).length;
      const levelOrder = this.order.filter((n) => {
        const p = n.parentId && this.byId.get(n.parentId);
        return p && Number.isFinite(n.level) && Number.isFinite(p.level) && p.level >= n.level;
      }).length;
      return { emptyKey: this._emptyKey, selfLoop: this._selfLoop, missingParent: this._missingParent, cycle, levelMissing, levelOrder, unknownGroup: this._unknownGroup };
    }
    displayRoots() {
      const roots = this.roots();
      const reach = this.reachableFromRoots();
      const extra = this.order.filter((n) => !reach.has(n.nodeId)).sort((a, b) => this.cmp(a, b));
      return [...roots, ...extra];
    }
    /** recordId のメンバーが今属するグループ（ノード）を返す。 */
    groupOfMember(recordId) {
      return this.order.find((g) => g.members.some((m) => m.recordId === recordId));
    }
    /** メンバーを別の部門（targetGroupId）へ異動＝そのレコードの部門コード・親・階層を対象部門の値に書き換える。 */
    planMoveMember(recordId, targetGroupId) {
      const src = this.groupOfMember(recordId);
      const target = this.byId.get(targetGroupId);
      if (!src || !target) return [];
      if (src.nodeId === targetGroupId) return [];
      return [{
        recordId,
        before: { groupId: src.nodeId, parentId: src.parentId, level: src.level, groupName: src.groupName },
        after: { groupId: target.nodeId, parentId: target.parentId, level: target.level, groupName: target.groupName }
      }];
    }
    /** 変更セットをメモリ上のモデルへ適用（メンバーを対象部門へ移す）。 */
    apply(changes) {
      for (const c of changes) {
        let mem;
        for (const g of this.order) {
          const i = g.members.findIndex((m) => m.recordId === c.recordId);
          if (i >= 0) {
            mem = g.members.splice(i, 1)[0];
            break;
          }
        }
        if (!mem) continue;
        const tg = this.byId.get(c.after.groupId);
        if (tg) tg.members.push(mem);
      }
    }
    static invert(changes) {
      return changes.map((c) => ({ recordId: c.recordId, before: c.after, after: c.before }));
    }
  };

  // src/tree/layout.ts
  var DEPTH_GAP = 48;
  var CROSS_GAP = 20;
  function layoutTree(model, opts) {
    var _a, _b, _c, _d, _e;
    const direction = (_a = opts.direction) != null ? _a : "vertical";
    const collapsed = (_b = opts.collapsed) != null ? _b : /* @__PURE__ */ new Set();
    const sizeOf = opts.sizeOf;
    const vert = direction === "vertical";
    const depthSize = (id) => vert ? sizeOf(id).h : sizeOf(id).w;
    const crossSize = (id) => vert ? sizeOf(id).w : sizeOf(id).h;
    const placedRows = /* @__PURE__ */ new Map();
    const allIds = model.list().map((n) => n.nodeId);
    for (const id of allIds) {
      const row = model.rowOf(id);
      placedRows.set(row, Math.max((_c = placedRows.get(row)) != null ? _c : 0, depthSize(id)));
    }
    const maxRow = Math.max(0, ...placedRows.keys());
    const rowStart = [];
    let acc = 0;
    for (let r = 0; r <= maxRow; r++) {
      rowStart[r] = acc;
      acc += ((_d = placedRows.get(r)) != null ? _d : 0) + DEPTH_GAP;
    }
    const spanDepth = acc;
    const crossCenter = /* @__PURE__ */ new Map();
    let cursor = 0;
    const visiting = /* @__PURE__ */ new Set();
    const place = (nodeId) => {
      if (crossCenter.has(nodeId) || visiting.has(nodeId)) {
        const c2 = cursor + crossSize(nodeId) / 2;
        cursor += crossSize(nodeId) + CROSS_GAP;
        return c2;
      }
      visiting.add(nodeId);
      const children = collapsed.has(nodeId) ? [] : model.childrenOf(nodeId).filter((ch) => !crossCenter.has(ch.nodeId));
      let c;
      if (children.length === 0) {
        c = cursor + crossSize(nodeId) / 2;
        cursor += crossSize(nodeId) + CROSS_GAP;
      } else {
        const start = cursor;
        const xs = children.map((ch) => place(ch.nodeId));
        c = vert ? (xs[0] + xs[xs.length - 1]) / 2 : xs[0];
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
      cursor += CROSS_GAP;
    }
    const pos = /* @__PURE__ */ new Map();
    for (const [id, c] of crossCenter) {
      const s = sizeOf(id);
      const depthPos = (_e = rowStart[model.rowOf(id)]) != null ? _e : 0;
      if (vert) pos.set(id, { left: c - s.w / 2, top: depthPos });
      else pos.set(id, { left: depthPos, top: c - s.h / 2 });
    }
    const spanCross = Math.max(cursor, 1);
    const width = vert ? spanCross : spanDepth;
    const height = vert ? spanDepth : spanCross;
    return { pos, width, height, direction };
  }

  // src/tree/styles.ts
  var TREE_CSS = `
.kzt-root { font-family: "Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif; color:#2d2d2d; }
.kzt-toolbar { display:flex; align-items:center; gap:8px; padding:8px 12px; background:#fafbfc;
  border:1px solid #e3e8ea; border-bottom:none; border-radius:8px 8px 0 0; }
.kzt-brand { font-weight:700; font-size:14px; color:#34495e; }
.kzt-spacer { flex:1; }
.kzt-btn { height:32px; padding:0 14px; font-size:13px; background:#fff; border:1px solid #c4c4c4;
  border-radius:6px; cursor:pointer; color:#333; }
.kzt-btn:hover:not(:disabled) { background:#f0f4f7; border-color:#3498db; }
.kzt-btn:disabled { opacity:.45; cursor:not-allowed; }
.kzt-hint { font-size:12px; color:#8a98a3; margin-right:4px; }
.kzt-canvas-wrap { position:relative; border:1px solid #e3e8ea; border-radius:0 0 8px 8px;
  overflow:hidden; background:#fff; }
.kzt-zoombar { position:absolute; right:12px; top:50%; transform:translateY(-50%); z-index:15;
  display:flex; flex-direction:column; align-items:center; gap:6px; background:rgba(255,255,255,.92);
  border:1px solid #e3e8ea; border-radius:10px; padding:8px 6px; box-shadow:0 2px 8px rgba(0,0,0,.08); }
.kzt-zbtn { width:28px; height:28px; border:1px solid #c4c4c4; border-radius:6px; background:#fff;
  cursor:pointer; font-size:15px; line-height:1; color:#333; }
.kzt-zbtn:hover { background:#f0f4f7; border-color:#3498db; }
.kzt-zslider { writing-mode:vertical-lr; direction:rtl; width:24px; height:120px; cursor:pointer;
  accent-color:#3498db; }
.kzt-zlabel { font-size:11px; color:#6b7a86; min-width:34px; text-align:center; }
.kzt-svg { display:block; width:100%; background:#fcfcfd; cursor:grab; touch-action:none; }
.kzt-svg.kzt-panning { cursor:grabbing; }
.kzt-grid-line { stroke:#eef1f3; stroke-width:1; }
.kzt-edge { stroke:#b7c2cb; stroke-width:1.6; fill:none; }
/* \u90E8\u9580\u30D5\u30EC\u30FC\u30E0\uFF08\u30B0\u30EB\u30FC\u30D7\u306E\u67A0\u3002\u30E1\u30F3\u30D0\u30FC\u306E\u30C9\u30ED\u30C3\u30D7\u5148\uFF09 */
.kzt-deptbox { fill:#f7f9fb; stroke:#cfd8de; stroke-width:1.5; }
.kzt-node.kzt-droptarget .kzt-deptbox { stroke:#2ecc71; stroke-width:2.5; fill:#eefaf2; }
.kzt-node.kzt-invalid .kzt-deptbox { stroke:#e74c3c; stroke-width:2.5; fill:#fdf1f0; }
.kzt-accent { width:6px; }
.kzt-deptname { font-size:13px; font-weight:700; fill:#2d3b45; }
/* \u30E1\u30F3\u30D0\u30FC\u7BB1\uFF08\u5F93\u6765\u306E\u898B\u305F\u76EE\u3002\u30C9\u30E9\u30C3\u30B0\u3067\u7570\u52D5\uFF09 */
.kzt-member { cursor:grab; }
.kzt-member .kzt-box { fill:#ffffff; stroke:#cfd8de; stroke-width:1.2; }
.kzt-member.kzt-dragging { opacity:.6; }
.kzt-member.kzt-dragging .kzt-box { stroke:#3a7afe; stroke-width:2; }
.kzt-name { font-size:13px; font-weight:700; fill:#2d3b45; }
.kzt-sub { font-size:11px; fill:#6b7a86; }
.kzt-open { font-size:14px; fill:#8a98a3; cursor:pointer; }
.kzt-open:hover { fill:#3498db; }
.kzt-badge { font-size:10px; font-weight:700; fill:#c9872e; }
.kzt-status { padding:6px 12px; font-size:12px; color:#6b7a86; background:#fafbfc; border-top:1px solid #eef1f3; }
.kzt-status.kzt-status-warn { color:#8a5a00; background:#fff7e6; }
.kzt-toggle { cursor:pointer; }
.kzt-toggle rect { fill:#fff; stroke:#b7c2cb; stroke-width:1.4; }
.kzt-toggle:hover rect { stroke:#3498db; fill:#f0f8ff; }
.kzt-toggle-sign { font-size:14px; font-weight:700; fill:#5a6b76; pointer-events:none; }
.kzt-root:fullscreen { background:#fff; padding:12px; height:100%; overflow:auto; }
.kzt-root:-webkit-full-screen { background:#fff; padding:12px; height:100%; overflow:auto; }
.kzt-overlay { position:absolute; inset:0; background:rgba(20,28,34,.38); display:flex;
  align-items:center; justify-content:center; z-index:20; }
.kzt-modal { background:#fff; border-radius:10px; width:min(460px,92%); padding:22px 24px;
  box-shadow:0 12px 40px rgba(0,0,0,.25); }
.kzt-modal h3 { margin:0 0 12px; font-size:16px; }
.kzt-diff { background:#f7f9fa; border:1px solid #e3e8ea; border-radius:8px; padding:12px 14px;
  font-size:13px; line-height:1.7; margin-bottom:14px; }
.kzt-diff .kzt-arrow { color:#2980b9; font-weight:700; }
.kzt-diff .kzt-old { color:#999; }
.kzt-choice { margin:10px 0 16px; font-size:13px; }
.kzt-choice label { display:flex; gap:8px; align-items:flex-start; padding:8px 10px; border:1px solid #e3e8ea;
  border-radius:8px; margin-bottom:8px; cursor:pointer; }
.kzt-choice label:hover { background:#f6f9fb; }
.kzt-choice .kzt-desc { font-size:11px; color:#78868f; margin-top:2px; }
.kzt-modal-actions { display:flex; gap:10px; justify-content:flex-end; }
.kzt-primary { height:38px; padding:0 20px; background:#3498db; color:#fff; font-weight:600;
  border:none; border-radius:6px; cursor:pointer; }
.kzt-primary:hover { background:#2f88c5; }
.kzt-ghostbtn { height:38px; padding:0 18px; background:#fff; color:#444; border:1px solid #c4c4c4;
  border-radius:6px; cursor:pointer; }
.kzt-ghostbtn:hover { background:#f2f2f2; }
.kzt-toast { position:absolute; left:50%; bottom:16px; transform:translateX(-50%);
  background:#2d3b45; color:#fff; font-size:12.5px; padding:8px 16px; border-radius:20px; z-index:30;
  opacity:0; transition:opacity .2s; pointer-events:none; }
.kzt-toast.kzt-show { opacity:1; }
`;
  var injected = false;
  function injectTreeCss(doc = document) {
    if (injected && doc === document) return;
    const style = doc.createElement("style");
    style.textContent = TREE_CSS;
    doc.head.appendChild(style);
    if (doc === document) injected = true;
  }

  // src/tree/view.ts
  var SVG_NS = "http://www.w3.org/2000/svg";
  var SVG_H = 640;
  var PAD = 60;
  var _TreeEditor = class _TreeEditor {
    // ノードの↗でレコードを新しいタブに開くか
    constructor(host2, provider, direction = "vertical", showSubLabel = true, openInNewTab = true) {
      this.provider = provider;
      this.vb = { x: 0, y: 0, w: 1e3, h: SVG_H };
      this.rects = [];
      this.undoStack = [];
      this.fitW = 1e3;
      // ズーム100%（全体表示）基準
      this.fitH = SVG_H;
      // ドラッグ状態
      this.dragId = null;
      this.dragStart = { x: 0, y: 0 };
      this.dragGroup = null;
      this.hoverTarget = null;
      // 縦並び / 横並び（モードで固定）
      this.collapsed = /* @__PURE__ */ new Set();
      /** 部門フレームのサイズ。中のメンバー数で高さ・幅が変わる。 */
      this.sizeOf = (nodeId) => {
        const node = this.model.get(nodeId);
        const mc = node ? node.members.length : 0;
        const cols = Math.max(1, Math.min(this.mcols, mc || 1));
        const innerW = cols * _TreeEditor.MEMBER_W + (cols - 1) * _TreeEditor.MEMBER_GAP;
        const w = Math.max(210, innerW + _TreeEditor.PADX * 2);
        const rows = mc > 0 ? Math.ceil(mc / cols) : 0;
        const membersH = mc > 0 ? rows * this.memberH() + (rows - 1) * _TreeEditor.MEMBER_GAP + _TreeEditor.PADY : _TreeEditor.PADY;
        const h = _TreeEditor.HEADER_H + membersH;
        return { w, h };
      };
      // ---- メンバーのドラッグ異動 ----
      this.memberPos = /* @__PURE__ */ new Map();
      this.dragBase = { x: 0, y: 0 };
      this.dragMoved = false;
      // ドラッグ判定（しきい値未満ならクリック＝レコードを開く）
      this.dragDownClient = { x: 0, y: 0 };
      this.toastTimer = 0;
      injectTreeCss(host2.ownerDocument || document);
      this.root = host2;
      this.direction = direction;
      this.showSubLabel = showSubLabel;
      this.openInNewTab = openInNewTab;
    }
    // メンバー箱の列数：縦ツリーは縦積み（1列）、横ツリーは横並び（3列）。ツリーの向きで切り替える。
    get mcols() {
      return this.direction === "horizontal" ? 3 : 1;
    }
    /** メンバー箱の高さ（副表示の最大数で全体を揃える。従来の主＋副レイアウト）。 */
    memberH() {
      let maxSubs = 0;
      for (const a of this.model.list()) for (const m of a.members) maxSubs = Math.max(maxSubs, Math.min(5, m.subs.length));
      return 26 + maxSubs * 16 + 8;
    }
    async mount() {
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
    resizeToWindow() {
      const rect = this.svg.getBoundingClientRect();
      const bottomGap = 48;
      const h = Math.max(320, Math.round(window.innerHeight - rect.top - bottomGap));
      this.svg.setAttribute("height", String(h));
    }
    toggleFullscreen() {
      const doc = document;
      const el = this.root;
      if (!doc.fullscreenElement) {
        if (el.requestFullscreen) el.requestFullscreen();
      } else if (doc.exitFullscreen) {
        doc.exitFullscreen();
      }
    }
    // ---- DOM 構築 ----
    buildDom() {
      this.root.classList.add("kzt-root");
      this.root.innerHTML = "";
      const bar = document.createElement("div");
      bar.className = "kzt-toolbar";
      const brand = document.createElement("span");
      brand.className = "kzt-brand";
      brand.textContent = "\u30C4\u30EA\u30FC\u7DE8\u96C6";
      const hint = document.createElement("span");
      hint.className = "kzt-hint";
      hint.textContent = (this.direction === "vertical" ? "\u7E26\u4E26\u3073" : "\u6A2A\u4E26\u3073") + "\u30FB\u30C9\u30E9\u30C3\u30B0\u3067\u914D\u7F6E\u63DB\u3048";
      const spacer = document.createElement("span");
      spacer.className = "kzt-spacer";
      const expandBtn = this.mkBtn("\u3059\u3079\u3066\u5C55\u958B", () => {
        this.collapsed.clear();
        this.render();
        this.fit();
      });
      const collapseBtn = this.mkBtn("\u7B2C2\u968E\u5C64\u3067\u7573\u3080", () => this.collapseToDepth1());
      this.undoBtn = this.mkBtn("\u5143\u306B\u623B\u3059", () => void this.undo());
      this.undoBtn.disabled = true;
      const fitBtn = this.mkBtn("\u5168\u4F53\u8868\u793A", () => this.fit());
      const fsBtn = this.mkBtn("\u5168\u753B\u9762", () => this.toggleFullscreen());
      bar.append(brand, hint, spacer, expandBtn, collapseBtn, this.undoBtn, fitBtn, fsBtn);
      this.root.appendChild(bar);
      const wrap = document.createElement("div");
      wrap.className = "kzt-canvas-wrap";
      this.svg = document.createElementNS(SVG_NS, "svg");
      this.svg.classList.add("kzt-svg");
      this.svg.setAttribute("width", "100%");
      this.svg.setAttribute("height", String(SVG_H));
      this.buildGrid();
      const bg = document.createElementNS(SVG_NS, "rect");
      bg.setAttribute("x", "-100000");
      bg.setAttribute("y", "-100000");
      bg.setAttribute("width", "200000");
      bg.setAttribute("height", "200000");
      bg.setAttribute("fill", "url(#kzt-grid)");
      this.svg.appendChild(bg);
      this.scene = document.createElementNS(SVG_NS, "g");
      this.edgeLayer = document.createElementNS(SVG_NS, "g");
      this.nodeLayer = document.createElementNS(SVG_NS, "g");
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
    mkBtn(label, onClick) {
      const b = document.createElement("button");
      b.className = "kzt-btn";
      b.textContent = label;
      b.addEventListener("click", onClick);
      return b;
    }
    buildGrid() {
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
    render() {
      this.layout = layoutTree(this.model, {
        direction: this.direction,
        collapsed: this.collapsed,
        sizeOf: this.sizeOf
      });
      this.edgeLayer.innerHTML = "";
      this.nodeLayer.innerHTML = "";
      this.rects = [];
      const vert = this.direction === "vertical";
      for (const a of this.model.list()) {
        const parent = a.parentId ? this.model.get(a.parentId) : void 0;
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
      for (const a of this.model.list()) {
        const pos = this.layout.pos.get(a.nodeId);
        if (!pos) continue;
        const s = this.sizeOf(a.nodeId);
        this.rects.push({ nodeId: a.nodeId, left: pos.left, top: pos.top, w: s.w, h: s.h });
        this.nodeLayer.appendChild(this.renderNode(a, pos.left, pos.top, s.w, s.h));
      }
      for (const a of this.model.list()) {
        if (!this.model.hasChildren(a.nodeId)) continue;
        const pos = this.layout.pos.get(a.nodeId);
        if (!pos) continue;
        this.nodeLayer.appendChild(this.renderToggle(a.nodeId, pos, this.sizeOf(a.nodeId), vert));
      }
      this.updateStatus();
    }
    // 直下（第1階層＝ルートの子）より下をすべて折りたたむ
    collapseToDepth1() {
      this.collapsed.clear();
      for (const root of this.model.roots()) {
        for (const child of this.model.childrenOf(root.nodeId)) {
          if (this.model.hasChildren(child.nodeId)) this.collapsed.add(child.nodeId);
        }
      }
      this.render();
      this.fit();
    }
    renderToggle(haichiId, pos, s, vert) {
      const isCollapsed = this.collapsed.has(haichiId);
      const cx = vert ? pos.left + s.w / 2 : pos.left + s.w + 11;
      const cy = vert ? pos.top + s.h + 11 : pos.top + s.h / 2;
      const g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("class", "kzt-toggle");
      const r = document.createElementNS(SVG_NS, "rect");
      r.setAttribute("x", String(cx - 9));
      r.setAttribute("y", String(cy - 9));
      r.setAttribute("width", "18");
      r.setAttribute("height", "18");
      r.setAttribute("rx", "4");
      const t = document.createElementNS(SVG_NS, "text");
      t.setAttribute("x", String(cx));
      t.setAttribute("y", String(cy + 4));
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("class", "kzt-toggle-sign");
      t.textContent = isCollapsed ? "+" : "\u2212";
      g.append(r, t);
      g.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        if (isCollapsed) this.collapsed.delete(haichiId);
        else this.collapsed.add(haichiId);
        this.render();
      });
      return g;
    }
    text(parent, cls, x, y, s) {
      const t = document.createElementNS(SVG_NS, "text");
      t.setAttribute("class", cls);
      t.setAttribute("x", String(x));
      t.setAttribute("y", String(y));
      t.textContent = s;
      parent.appendChild(t);
      return t;
    }
    renderNode(a, left, top, w, h) {
      const g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("class", "kzt-node");
      g.setAttribute("transform", `translate(${left} ${top})`);
      g.dataset.node = a.nodeId;
      const PADX = _TreeEditor.PADX;
      const box = document.createElementNS(SVG_NS, "rect");
      box.setAttribute("class", "kzt-deptbox");
      box.setAttribute("width", String(w));
      box.setAttribute("height", String(h));
      box.setAttribute("rx", "8");
      g.appendChild(box);
      const accent = document.createElementNS(SVG_NS, "rect");
      accent.setAttribute("class", "kzt-accent");
      accent.setAttribute("x", "0");
      accent.setAttribute("y", "0");
      accent.setAttribute("width", "6");
      accent.setAttribute("height", String(h));
      accent.setAttribute("fill", groupColor(a.nodeId));
      accent.setAttribute("rx", "3");
      g.appendChild(accent);
      this.text(g, "kzt-deptname", PADX + 4, 20, a.groupName || a.nodeId);
      const mc = a.members.length;
      const mh = this.memberH();
      const cols = Math.max(1, Math.min(this.mcols, mc || 1));
      const startY = _TreeEditor.HEADER_H;
      a.members.forEach((m, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const mx = PADX + col * (_TreeEditor.MEMBER_W + _TreeEditor.MEMBER_GAP);
        const my = startY + row * (mh + _TreeEditor.MEMBER_GAP);
        this.memberPos.set(m.recordId, { x: left + mx, y: top + my });
        g.appendChild(this.renderMember(m, mx, my, mh));
      });
      return g;
    }
    /** メンバー1人＝従来の見た目の箱（主表示＋副表示）。ドラッグで別部門へ異動できる。 */
    renderMember(m, x, y, mh) {
      var _a, _b;
      const g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("class", "kzt-member");
      g.setAttribute("transform", `translate(${x} ${y})`);
      g.dataset.rec = m.recordId;
      const box = document.createElementNS(SVG_NS, "rect");
      box.setAttribute("class", "kzt-box");
      box.setAttribute("width", String(_TreeEditor.MEMBER_W));
      box.setAttribute("height", String(mh));
      box.setAttribute("rx", "6");
      g.appendChild(box);
      this.text(g, "kzt-name", 12, 19, m.main || "");
      m.subs.slice(0, 5).forEach((s, j) => {
        this.text(g, "kzt-sub", 12, 28 + 12 + j * 16, this.showSubLabel ? `${s.label}: ${s.value}` : s.value);
      });
      if ((_b = (_a = this.provider).recordUrl) == null ? void 0 : _b.call(_a, m.recordId)) {
        const open = document.createElementNS(SVG_NS, "text");
        open.setAttribute("class", "kzt-open");
        open.setAttribute("x", String(_TreeEditor.MEMBER_W - 10));
        open.setAttribute("y", "18");
        open.setAttribute("text-anchor", "end");
        open.textContent = "\u2197";
        open.addEventListener("pointerdown", (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          this.openRecord(m.recordId);
        });
        g.appendChild(open);
      }
      g.addEventListener("pointerdown", (e) => this.onMemberDown(e, m.recordId, g));
      return g;
    }
    openRecord(recordId) {
      var _a, _b, _c;
      const url = (_b = (_a = this.provider).recordUrl) == null ? void 0 : _b.call(_a, recordId);
      if (!url) return;
      const w = ((_c = this.root.ownerDocument) == null ? void 0 : _c.defaultView) || window;
      if (this.openInNewTab) w.open(url, "_blank");
      else w.location.href = url;
    }
    updateStatus() {
      const n = this.model.list().length;
      const roots = this.model.roots().length;
      const mode = this.provider.writable ? "\u66F8\u8FBC\u53EF" : "\u8AAD\u53D6\u306E\u307F";
      const dg = this.model.diagnostics();
      const warns = [];
      if (dg.emptyKey > 0) warns.push(`\u30B0\u30EB\u30FC\u30D7\u30AD\u30FC\u304C\u7A7A\u306E\u30EC\u30B3\u30FC\u30C9\u304C${dg.emptyKey}\u4EF6\u3042\u308A\u8868\u793A\u3067\u304D\u307E\u305B\u3093`);
      if (dg.unknownGroup > 0) warns.push(`\u30DE\u30B9\u30BF\u306B\u7121\u3044\u90E8\u9580\u30B3\u30FC\u30C9\u306E\u30EC\u30B3\u30FC\u30C9\u304C${dg.unknownGroup}\u4EF6\u3042\u308A\u307E\u3059\uFF08\u30DE\u30B9\u30BF\u672A\u767B\u9332\uFF09`);
      if (dg.levelMissing > 0) warns.push(`\u968E\u5C64\uFF08\u30EC\u30D9\u30EB\uFF09\u304C\u6570\u5024\u3067\u306A\u3044\u30B0\u30EB\u30FC\u30D7\u304C${dg.levelMissing}\u4EF6\u3042\u308A\u307E\u3059\uFF08\u4ED8\u3051\u66FF\u3048\u3067\u304D\u307E\u305B\u3093\uFF09`);
      if (dg.levelOrder > 0) warns.push(`\u89AA\u306E\u968E\u5C64\u304C\u81EA\u5206\u4EE5\u4E0A\u306B\u306A\u3063\u3066\u3044\u308B\u30B0\u30EB\u30FC\u30D7\u304C${dg.levelOrder}\u4EF6\u3042\u308A\u307E\u3059\uFF08\u968E\u5C64\u30D5\u30A3\u30FC\u30EB\u30C9\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\uFF09`);
      if (dg.selfLoop > 0) warns.push(`\u89AA\u306B\u81EA\u5206\u81EA\u8EAB\u3092\u6307\u5B9A\u3057\u305F\u30B0\u30EB\u30FC\u30D7\u304C${dg.selfLoop}\u4EF6\u3042\u308A\u307E\u3059\uFF08\u6700\u4E0A\u4F4D\u3068\u3057\u3066\u8868\u793A\uFF09`);
      if (dg.missingParent > 0) warns.push(`\u89AA\u30AD\u30FC\u304C\u898B\u3064\u304B\u3089\u306A\u3044\u30B0\u30EB\u30FC\u30D7\u304C${dg.missingParent}\u4EF6\u3042\u308A\u307E\u3059\uFF08\u6700\u4E0A\u4F4D\u3068\u3057\u3066\u8868\u793A\uFF09`);
      if (dg.cycle > 0) warns.push(`\u89AA\u5B50\u304C\u5FAA\u74B0\u3057\u3066\u3044\u308B\u30B0\u30EB\u30FC\u30D7\u304C${dg.cycle}\u4EF6\u3042\u308A\u307E\u3059\uFF08\u66AB\u5B9A\u3067\u6700\u4E0A\u4F4D\u306B\u4E26\u3079\u3066\u3044\u307E\u3059\uFF09`);
      const warnTxt = warns.length ? `\u3000\u26A0 ${warns.join(" / ")}` : "";
      const totalMembers = this.model.list().reduce((s, g) => s + g.members.length, 0);
      this.statusEl.textContent = `\u90E8\u9580 ${n} \u4EF6\u30FB\u30E1\u30F3\u30D0\u30FC ${totalMembers} \u540D\uFF08\u30EB\u30FC\u30C8 ${roots}\uFF09\uFF0F\u4FDD\u5B58\u5148: ${this.provider.label}\uFF08${mode}\uFF09${warnTxt}`;
      this.statusEl.classList.toggle("kzt-status-warn", warns.length > 0);
    }
    onMemberDown(e, recordId, memberG) {
      var _a;
      e.stopPropagation();
      e.preventDefault();
      this.dragId = recordId;
      this.dragMoved = false;
      this.dragDownClient = { x: e.clientX, y: e.clientY };
      this.dragStart = this.toScene(e.clientX, e.clientY);
      this.dragGroup = memberG;
      this.dragBase = (_a = this.memberPos.get(recordId)) != null ? _a : { x: 0, y: 0 };
      memberG.classList.add("kzt-dragging");
      this.nodeLayer.appendChild(memberG);
      memberG.setAttribute("transform", `translate(${this.dragBase.x} ${this.dragBase.y})`);
      const move = (ev) => this.onDragMove(ev);
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        this.onDragUp();
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    }
    onDragMove(e) {
      if (!this.dragId || !this.dragGroup) return;
      if (!this.dragMoved) {
        const dx = e.clientX - this.dragDownClient.x;
        const dy = e.clientY - this.dragDownClient.y;
        if (dx * dx + dy * dy > 25) this.dragMoved = true;
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
          const valid = !!srcGroup && srcGroup.nodeId !== target;
          g == null ? void 0 : g.classList.add(valid ? "kzt-droptarget" : "kzt-invalid");
        }
      }
    }
    onDragUp() {
      var _a;
      const recordId = this.dragId;
      const target = this.hoverTarget;
      const moved = this.dragMoved;
      this.clearHover();
      (_a = this.dragGroup) == null ? void 0 : _a.classList.remove("kzt-dragging");
      this.dragId = null;
      this.dragGroup = null;
      if (!recordId) return;
      if (!moved) {
        this.openRecord(recordId);
        this.render();
        return;
      }
      if (!target) {
        this.render();
        return;
      }
      const src = this.model.groupOfMember(recordId);
      if (!src || src.nodeId === target) {
        this.render();
        return;
      }
      this.openMemberConfirm(recordId, target);
    }
    /** メンバーが乗っている部門フレームを返す。 */
    hitTest(x, y) {
      for (let i = this.rects.length - 1; i >= 0; i--) {
        const r = this.rects[i];
        if (x >= r.left && x <= r.left + r.w && y >= r.top && y <= r.top + r.h) return r.nodeId;
      }
      return null;
    }
    clearHover() {
      this.nodeLayer.querySelectorAll(".kzt-droptarget,.kzt-invalid").forEach((el) => {
        el.classList.remove("kzt-droptarget", "kzt-invalid");
      });
      this.hoverTarget = null;
    }
    // ---- 確認モーダル（メンバー異動） ----
    openMemberConfirm(recordId, targetGroupId) {
      const src = this.model.groupOfMember(recordId);
      const target = this.model.get(targetGroupId);
      const mem = src.members.find((m) => m.recordId === recordId);
      const overlay = document.createElement("div");
      overlay.className = "kzt-overlay";
      const modal = document.createElement("div");
      modal.className = "kzt-modal";
      const h = document.createElement("h3");
      h.textContent = "\u30E1\u30F3\u30D0\u30FC\u306E\u7570\u52D5";
      modal.appendChild(h);
      const diff = document.createElement("div");
      diff.className = "kzt-diff";
      diff.innerHTML = `<b>${esc(mem.main || recordId)}</b> \u306E\u6240\u5C5E\u3092\u5909\u66F4\u3057\u307E\u3059<br><span class="kzt-old">${esc(src.groupName || src.nodeId)}</span> <span class="kzt-arrow">\u2192</span> ${esc(target.groupName || target.nodeId)}<br><span class="kzt-desc">\u90E8\u9580\u30B3\u30FC\u30C9\u3092 ${esc(target.nodeId)} \u306B\u66F8\u304D\u63DB\u3048\u307E\u3059\uFF08\u89AA\u30FB\u968E\u5C64\u3082\u5BFE\u8C61\u90E8\u9580\u306B\u5408\u308F\u305B\u307E\u3059\uFF09</span>`;
      modal.appendChild(diff);
      const actions = document.createElement("div");
      actions.className = "kzt-modal-actions";
      const cancel = document.createElement("button");
      cancel.className = "kzt-ghostbtn";
      cancel.textContent = "\u30AD\u30E3\u30F3\u30BB\u30EB";
      cancel.addEventListener("click", () => {
        overlay.remove();
        this.render();
      });
      const ok = document.createElement("button");
      ok.className = "kzt-primary";
      ok.textContent = "\u5B9F\u884C";
      ok.addEventListener("click", () => {
        overlay.remove();
        void this.commitMemberMove(recordId, targetGroupId);
      });
      actions.append(cancel, ok);
      modal.appendChild(actions);
      overlay.appendChild(modal);
      this.root.querySelector(".kzt-canvas-wrap").appendChild(overlay);
    }
    async commitMemberMove(recordId, targetGroupId) {
      const changes = this.model.planMoveMember(recordId, targetGroupId);
      if (changes.length === 0) {
        this.render();
        return;
      }
      try {
        await this.provider.apply(changes);
      } catch (err) {
        console.error("[kintone-zu] \u66F8\u304D\u623B\u3057\u306B\u5931\u6557", err);
        this.render();
        const notWritable = (err == null ? void 0 : err.code) === "FIELD_NOT_WRITABLE";
        const msg = notWritable ? err.message : "\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F\uFF08\u6A29\u9650\u3084\u30CD\u30C3\u30C8\u30EF\u30FC\u30AF\u3092\u78BA\u8A8D\uFF09";
        this.toast(msg, notWritable ? 7e3 : 2200);
        return;
      }
      this.model.apply(changes);
      this.undoStack.push(TreeModel.invert(changes));
      this.undoBtn.disabled = false;
      this.render();
      this.toast("\u7570\u52D5\u3057\u307E\u3057\u305F");
    }
    async undo() {
      const inv = this.undoStack.pop();
      if (!inv) return;
      try {
        await this.provider.apply(inv);
      } catch (err) {
        console.error("[kintone-zu] \u30A2\u30F3\u30C9\u30A5\u306E\u66F8\u304D\u623B\u3057\u306B\u5931\u6557", err);
        this.undoStack.push(inv);
        this.toast("\u5143\u306B\u623B\u305B\u307E\u305B\u3093\u3067\u3057\u305F");
        return;
      }
      this.model.apply(inv);
      this.undoBtn.disabled = this.undoStack.length === 0;
      this.render();
      this.toast("\u5143\u306B\u623B\u3057\u307E\u3057\u305F");
    }
    // ---- ビュー操作（パン/ズーム/フィット） ----
    applyVB() {
      this.svg.setAttribute("viewBox", `${this.vb.x} ${this.vb.y} ${this.vb.w} ${this.vb.h}`);
      this.updateZoomUi();
    }
    fit() {
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
        this.vb = { x: 0, y: 0, w: 1e3, h: SVG_H };
      } else {
        const w = maxX - minX + PAD * 2;
        const h = maxY - minY + PAD * 2;
        this.vb = { x: minX - PAD, y: minY - PAD, w, h };
      }
      this.fitW = this.vb.w;
      this.fitH = this.vb.h;
      this.applyVB();
    }
    // ---- 右側ズームバー ----
    buildZoomBar() {
      const bar = document.createElement("div");
      bar.className = "kzt-zoombar";
      const plus = document.createElement("button");
      plus.className = "kzt-zbtn";
      plus.textContent = "\uFF0B";
      plus.addEventListener("click", () => this.zoomStep(1));
      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "20";
      slider.max = "400";
      slider.value = "100";
      slider.className = "kzt-zslider";
      slider.addEventListener("input", () => this.applyZoomPct(Number(slider.value)));
      const minus = document.createElement("button");
      minus.className = "kzt-zbtn";
      minus.textContent = "\u2212";
      minus.addEventListener("click", () => this.zoomStep(-1));
      const label = document.createElement("div");
      label.className = "kzt-zlabel";
      label.textContent = "100%";
      bar.append(plus, slider, minus, label);
      this.zoomSlider = slider;
      this.zoomLabel = label;
      return bar;
    }
    zoomPct() {
      return this.fitW > 0 ? Math.round(this.fitW / this.vb.w * 100) : 100;
    }
    applyZoomPct(pct) {
      const p = Math.min(400, Math.max(20, pct));
      const cx = this.vb.x + this.vb.w / 2;
      const cy = this.vb.y + this.vb.h / 2;
      const nw = this.fitW * 100 / p;
      const nh = this.fitH * 100 / p;
      this.vb = { x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh };
      this.applyVB();
    }
    zoomStep(dir) {
      this.applyZoomPct(this.zoomPct() * (dir > 0 ? 1.25 : 0.8));
    }
    updateZoomUi() {
      const p = this.zoomPct();
      if (this.zoomSlider) this.zoomSlider.value = String(Math.min(400, Math.max(20, p)));
      if (this.zoomLabel) this.zoomLabel.textContent = p + "%";
    }
    toScene(clientX, clientY) {
      const r = this.svg.getBoundingClientRect();
      const scale = Math.min(r.width / this.vb.w, r.height / this.vb.h);
      const offX = (r.width - this.vb.w * scale) / 2;
      const offY = (r.height - this.vb.h * scale) / 2;
      const x = this.vb.x + (clientX - r.left - offX) / scale;
      const y = this.vb.y + (clientY - r.top - offY) / scale;
      return { x, y };
    }
    bindPanZoom(bg) {
      this.svg.addEventListener(
        "wheel",
        (e) => {
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
      bg.addEventListener("pointerdown", (e) => {
        panning = true;
        last = { x: e.clientX, y: e.clientY };
        this.svg.classList.add("kzt-panning");
      });
      window.addEventListener("pointermove", (e) => {
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
    toast(msg, ms = 2200) {
      this.toastEl.textContent = msg;
      this.toastEl.classList.add("kzt-show");
      window.clearTimeout(this.toastTimer);
      this.toastTimer = window.setTimeout(() => this.toastEl.classList.remove("kzt-show"), ms);
    }
  };
  // 部門フレームと、中に並ぶメンバー箱（従来の見た目）の寸法
  _TreeEditor.PADX = 12;
  _TreeEditor.PADY = 10;
  _TreeEditor.HEADER_H = 30;
  // 部門名の見出し
  _TreeEditor.MEMBER_W = 190;
  // メンバー箱の幅（従来どおり）
  _TreeEditor.MEMBER_GAP = 10;
  var TreeEditor = _TreeEditor;
  function groupColor(key) {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 360;
    return `hsl(${h} 55% 55%)`;
  }
  function esc(s) {
    return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  }

  // demo/demo.ts
  var ROWS = [
    { id: "E001", dept: "D0", dname: "\u4EE3\u8868", parent: "", level: 1, name: "\u4F50\u85E4 \u4E00\u90CE", role: "\u4EE3\u8868\u53D6\u7DE0\u5F79" },
    { id: "E002", dept: "D1", dname: "\u7D4C\u55B6\u7BA1\u7406\u672C\u90E8", parent: "D0", level: 2, name: "\u4F0A\u85E4 \u771F\u7531\u7F8E", role: "\u672C\u90E8\u9577" },
    { id: "E003", dept: "D11", dname: "\u4EBA\u4E8B\u7DCF\u52D9\u90E8", parent: "D1", level: 3, name: "\u9234\u6728 \u5065\u6CBB", role: "\u90E8\u9577" },
    { id: "E004", dept: "D11", dname: "\u4EBA\u4E8B\u7DCF\u52D9\u90E8", parent: "D1", level: 3, name: "\u5C71\u7530 \u82B1\u5B50", role: "\u4E3B\u4EFB" },
    { id: "E005", dept: "D2", dname: "\u55B6\u696D\u672C\u90E8", parent: "D0", level: 2, name: "\u5C71\u672C \u5927\u8F14", role: "\u672C\u90E8\u9577" },
    { id: "E006", dept: "D21", dname: "\u7B2C\u4E00\u55B6\u696D\u90E8", parent: "D2", level: 3, name: "\u4E2D\u6751 \u61B2", role: "\u90E8\u9577" },
    { id: "E007", dept: "D21", dname: "\u7B2C\u4E00\u55B6\u696D\u90E8", parent: "D2", level: 3, name: "\u5C0F\u6797 \u8AA0", role: "\u4E00\u822C" },
    { id: "E008", dept: "D22", dname: "\u7B2C\u4E8C\u55B6\u696D\u90E8", parent: "D2", level: 3, name: "\u68EE \u9808\u7F8E\u745B", role: "\u4E00\u822C" }
  ];
  var DemoProvider = class {
    constructor() {
      this.writable = true;
      this.label = "\u30C7\u30E2\uFF08\u30E1\u30E2\u30EA\u5185\u30FBkintone\u306B\u306F\u66F8\u304D\u8FBC\u307F\u307E\u305B\u3093\uFF09";
      this.rows = ROWS.slice();
    }
    async load() {
      return { records: this.rows.map((r) => ({
        recordId: r.id,
        groupId: r.dept,
        parentId: r.parent,
        level: r.level,
        sortKey: r.dept,
        groupName: r.dname,
        main: r.name,
        subs: [{ label: "\u5F79\u8077", value: r.role }]
      })) };
    }
    async apply(changes) {
      for (const c of changes) {
        const r = this.rows.find((x) => x.id === c.recordId);
        if (!r) continue;
        r.dept = c.after.groupId;
        r.parent = c.after.parentId;
        r.level = c.after.level;
        const src = this.rows.find((x) => x.dept === c.after.groupId && x.id !== r.id);
        if (src) r.dname = src.dname;
      }
    }
  };
  var host = document.getElementById("app");
  if (host) {
    const dir = window.__KZT_DIR__ === "horizontal" ? "horizontal" : "vertical";
    new TreeEditor(host, new DemoProvider(), dir).mount().catch((e) => {
      console.error(e);
      host.textContent = "\u30C7\u30E2\u306E\u521D\u671F\u5316\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002";
    });
  }
})();
