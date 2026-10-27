// 自由配置モードのCSS（JS注入でプラグイン・デモ共通）。
export const FREE_CSS = `
.kzf-root { font-family:"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif; color:#2d2d2d; }
.kzf-toolbar { display:flex; align-items:center; gap:8px; padding:8px 12px; background:#fafbfc;
  border:1px solid #e3e8ea; border-bottom:none; border-radius:8px 8px 0 0; }
.kzf-brand { font-weight:700; font-size:14px; color:#34495e; }
.kzf-spacer { flex:1; }
.kzf-btn { height:32px; padding:0 14px; font-size:13px; background:#fff; border:1px solid #c4c4c4;
  border-radius:6px; cursor:pointer; color:#333; }
.kzf-btn:hover:not(:disabled){ background:#f0f4f7; border-color:#3498db; }
.kzf-btn:disabled{ opacity:.45; cursor:not-allowed; }
.kzf-btn.kzf-on{ background:#eaf4fb; border-color:#3498db; color:#1f6391; font-weight:600; }
.kzf-btn.kzf-iconbtn{ display:inline-flex; align-items:center; gap:6px; padding:0 12px; }
.kzf-ico{ width:15px; height:15px; flex:none; display:block; }
.kzf-btn-label{ line-height:1; }
.kzf-body { display:flex; border:1px solid #e3e8ea; border-radius:0 0 8px 8px; overflow:hidden; background:#fff; }
.kzf-palette { width:220px; flex:none; border-right:1px solid #eef1f3; display:flex; flex-direction:column; background:#fbfcfd; }
.kzf-search { margin:8px; height:30px; padding:0 8px; border:1px solid #cfd8de; border-radius:6px; font-size:12px; }
.kzf-pal-list { overflow:auto; flex:1; padding:0 8px 8px; }
.kzf-pal-item { padding:7px 9px; margin-bottom:5px; background:#fff; border:1px solid #e0e6ea; border-radius:6px;
  font-size:12px; cursor:grab; user-select:none; }
.kzf-pal-item:hover{ border-color:#3498db; background:#f6fbff; }
.kzf-pal-item.kzf-placed{ opacity:.45; }
.kzf-pal-line{ display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.kzf-pal-main{ font-weight:600; color:#2d3b45; }
.kzf-pal-sub{ margin-left:8px; color:#6b7a86; }
.kzf-pal-empty{ padding:12px; font-size:12px; color:#8a98a3; }
.kzf-canvas-wrap { position:relative; flex:1; min-width:0; }
.kzf-svg { display:block; width:100%; height:560px; background:#fcfcfd; cursor:grab; touch-action:none; }
.kzf-root:fullscreen { background:#fff; padding:12px; height:100%; overflow:auto; }
.kzf-root:-webkit-full-screen { background:#fff; padding:12px; height:100%; overflow:auto; }
.kzf-zoombar { position:absolute; right:12px; top:50%; transform:translateY(-50%); z-index:15;
  display:flex; flex-direction:column; align-items:center; gap:6px; background:rgba(255,255,255,.92);
  border:1px solid #e3e8ea; border-radius:10px; padding:8px 6px; box-shadow:0 2px 8px rgba(0,0,0,.08); }
.kzf-zbtn { width:28px; height:28px; border:1px solid #c4c4c4; border-radius:6px; background:#fff;
  cursor:pointer; font-size:15px; line-height:1; color:#333; }
.kzf-zbtn:hover { background:#f0f4f7; border-color:#3498db; }
.kzf-zslider { writing-mode:vertical-lr; direction:rtl; width:24px; height:120px; cursor:pointer; accent-color:#3498db; }
.kzf-zlabel { font-size:11px; color:#6b7a86; min-width:34px; text-align:center; }
.kzf-svg.kzf-pan{ cursor:grabbing; }
.kzf-svg.kzf-connect{ cursor:crosshair; }
.kzf-grid-line{ stroke:#eef1f3; stroke-width:1; }
.kzf-grid-line-major{ stroke:#dde4e8; stroke-width:1.2; }
.kzf-cell-line{ stroke:#e1e8ec; stroke-width:1.2; }
.kzf-edge{ stroke:#8595a0; stroke-width:1.8; fill:none; }
.kzf-edge-dashed{ stroke-dasharray:8 5; }
.kzf-edge-dotted{ stroke-dasharray:1.5 5; stroke-linecap:round; }
.kzf-edge-outer{ stroke-width:5; }
.kzf-edge-inner{ stroke:#fff; stroke-width:2; }
.kzf-edge-hit{ stroke:transparent; stroke-width:12; fill:none; cursor:pointer; }
.kzf-edge-g.kzf-sel .kzf-edge{ stroke:#e67e22; }
.kzf-edge-g.kzf-sel .kzf-edge-inner{ stroke:#fff; }
.kzf-linesel{ height:28px; font-size:12px; border:1px solid #c4c4c4; border-radius:6px; background:#fff; color:#333; padding:0 4px; }
.kzf-linetool{ position:relative; display:inline-flex; }
.kzf-linetool .kzf-btn:first-child{ border-top-right-radius:0; border-bottom-right-radius:0; }
.kzf-caret{ width:28px; padding:0; border-left:none; border-top-left-radius:0; border-bottom-left-radius:0; }
.kzf-linepop{ position:absolute; top:calc(100% + 6px); left:0; right:auto; z-index:25; background:#fff;
  border:1px solid #e3e8ea; border-radius:10px; box-shadow:0 6px 20px rgba(0,0,0,.14); padding:10px 12px;
  display:flex; flex-direction:column; gap:8px; min-width:180px; }
.kzf-poprow{ display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:12px; color:#444; }
.kzf-poplabel{ color:#6b7a86; }
.kzf-poprow .kzf-linesel{ width:120px; }
.kzf-decowrap{ display:flex; gap:6px; }
.kzf-decobtn{ width:30px; height:28px; border:1px solid #c4c4c4; border-radius:6px; background:#fff; cursor:pointer;
  font-size:13px; line-height:1; color:#333; }
.kzf-decobtn:hover{ background:#f0f4f7; border-color:#3498db; }
.kzf-decobtn.kzf-on{ background:#eaf4fb; border-color:#3498db; color:#1f6391; }
.kzf-decobtn.kzf-deco-b{ font-weight:700; }
.kzf-decobtn.kzf-deco-i{ font-style:italic; }
.kzf-decobtn.kzf-deco-u{ text-decoration:underline; }
.kzf-color{ width:34px; height:28px; padding:0; border:1px solid #c4c4c4; border-radius:6px; background:#fff; cursor:pointer; }
.kzf-colorfield{ display:inline-flex; align-items:center; gap:6px; }
.kzf-hex{ width:86px; height:28px; padding:0 8px; font-size:12px; font-family:ui-monospace,Menlo,Consolas,monospace;
  border:1px solid #c4c4c4; border-radius:6px; background:#fff; color:#333; text-transform:lowercase;
  -webkit-appearance:none; appearance:none; box-shadow:none; }
.kzf-hex::placeholder{ color:#9aa5ad; }
.kzf-hex:focus{ outline:none; border-color:#3498db; background:#fff; color:#333; }
.kzf-text{ cursor:grab; }
.kzf-text text{ dominant-baseline:hanging; pointer-events:none; }
.kzf-text-box{ fill:transparent; stroke:transparent; stroke-width:1.5; pointer-events:all; }
.kzf-text.kzf-sel .kzf-text-box{ stroke:#3498db; stroke-dasharray:4 3; }
.kzf-svg.kzf-text-mode{ cursor:text; }
.kzf-svg.kzf-marquee-mode{ cursor:crosshair; }
.kzf-marquee{ fill:rgba(52,152,219,.12); stroke:#3498db; stroke-width:1.2; stroke-dasharray:5 3; }
.kzf-textinput{ width:100%; height:38px; padding:0 12px; margin:0 0 16px; font-size:14px; border:1px solid #c4c4c4;
  border-radius:6px; color:#2d3b45; background:#fff; }
.kzf-textinput:focus{ outline:none; border-color:#3498db; box-shadow:0 0 0 3px rgba(52,152,219,.15); }
.kzf-node{ cursor:grab; }
.kzf-node .kzf-box{ fill:#fff; stroke:#cfd8de; stroke-width:1.5; }
.kzf-node.kzf-sel .kzf-box{ stroke:#3498db; stroke-width:2.5; }
.kzf-node.kzf-connect-src .kzf-box{ stroke:#2ecc71; stroke-width:2.5; }
.kzf-node .kzf-label{ font-size:13px; fill:#2d3b45; }
.kzf-status{ padding:6px 12px; font-size:12px; color:#6b7a86; background:#fafbfc; border-top:1px solid #eef1f3; }
.kzf-toast{ position:absolute; left:50%; bottom:14px; transform:translateX(-50%); background:#2d3b45; color:#fff;
  font-size:12.5px; padding:8px 16px; border-radius:20px; opacity:0; transition:opacity .2s; pointer-events:none; }
.kzf-toast.kzf-show{ opacity:1; }
.kzf-main{ font-size:13px; font-weight:700; fill:#2d3b45; }
.kzf-sub{ font-size:11px; fill:#6b7a86; }
.kzf-open{ font-size:13px; fill:#8a98a3; cursor:pointer; }
.kzf-open:hover{ fill:#3498db; }
.kzf-overlay{ position:absolute; inset:0; background:rgba(20,28,34,.38); display:flex; align-items:center;
  justify-content:center; z-index:20; }
.kzf-modal{ background:#fff; border-radius:10px; width:min(440px,92%); padding:20px 22px; box-shadow:0 12px 40px rgba(0,0,0,.25); }
.kzf-modal h3{ margin:0 0 12px; font-size:15px; }
.kzf-diff{ background:#f7f9fa; border:1px solid #e3e8ea; border-radius:8px; padding:12px 14px; font-size:13px; line-height:1.7; margin-bottom:14px; }
.kzf-diff .kzf-arrow{ color:#2980b9; font-weight:700; }
.kzf-diff .kzf-old{ color:#999; }
.kzf-actions{ display:flex; gap:10px; justify-content:flex-end; }
.kzf-primary{ height:36px; padding:0 18px; background:#3498db; color:#fff; font-weight:600; border:none; border-radius:6px; cursor:pointer; }
.kzf-primary:hover{ background:#2f88c5; }
.kzf-ghost{ height:36px; padding:0 16px; background:#fff; color:#444; border:1px solid #c4c4c4; border-radius:6px; cursor:pointer; }
.kzf-ghost:hover{ background:#f2f2f2; }
/* 印刷：ページ境界オーバーレイ（操作を妨げないよう pointer-events 無効） */
.kzf-pgline{ fill:none; stroke:#e2574c; stroke-width:2; stroke-dasharray:6 5; vector-effect:non-scaling-stroke; opacity:.9; pointer-events:none; }
.kzf-pgfill{ fill:#e2574c; opacity:.04; pointer-events:none; }
.kzf-pglabel{ fill:#e2574c; font-weight:800; opacity:.85; pointer-events:none; }
/* 印刷：設定パネル（キャンバス右上） */
.kzf-printpanel{ position:absolute; top:12px; right:12px; z-index:20; width:220px;
  background:#fff; border:1px solid #d7dee3; border-radius:10px; box-shadow:0 6px 20px rgba(0,0,0,.12);
  padding:12px 14px; font-size:13px; }
.kzf-pp-title{ display:block; font-weight:700; color:#34495e; margin-bottom:10px; }
.kzf-pp-row{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.kzf-pp-lb{ color:#5a6b78; }
.kzf-pp-sel{ height:30px; border:1px solid #c4c4c4; border-radius:6px; background:#fff; padding:0 8px; font-size:13px; }
.kzf-pp-count{ display:block; font-weight:700; color:#e2574c; margin:6px 0 10px; }
.kzf-pp-actions{ display:flex; flex-direction:column; gap:8px; }
.kzf-pp-actions .kzf-btn{ width:100%; justify-content:center; }
`;

let injected = false;
export function injectFreeCss(doc: Document = document): void {
  if (injected && doc === document) return;
  const s = doc.createElement("style");
  s.textContent = FREE_CSS;
  doc.head.appendChild(s);
  if (doc === document) injected = true;
}
