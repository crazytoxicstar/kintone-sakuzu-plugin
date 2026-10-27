// ツリー編集UIのCSS。プラグイン・単体デモの双方で同じ見た目にするためJSから注入する。
export const TREE_CSS = `
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
/* 部門フレーム（グループの枠。メンバーのドロップ先） */
.kzt-deptbox { fill:#f7f9fb; stroke:#cfd8de; stroke-width:1.5; }
.kzt-node.kzt-droptarget .kzt-deptbox { stroke:#2ecc71; stroke-width:2.5; fill:#eefaf2; }
.kzt-node.kzt-invalid .kzt-deptbox { stroke:#e74c3c; stroke-width:2.5; fill:#fdf1f0; }
.kzt-accent { width:6px; }
.kzt-deptname { font-size:13px; font-weight:700; fill:#2d3b45; }
/* メンバー箱（従来の見た目。ドラッグで異動） */
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
/* 印刷：ページ境界オーバーレイ（操作を妨げない） */
.kzt-pgline { fill:none; stroke:#e2574c; stroke-width:2; stroke-dasharray:6 5; vector-effect:non-scaling-stroke; opacity:.9; pointer-events:none; }
.kzt-pgfill { fill:#e2574c; opacity:.04; pointer-events:none; }
.kzt-pglabel { fill:#e2574c; font-weight:800; opacity:.85; pointer-events:none; }
/* 印刷：設定パネル（キャンバス右上） */
.kzt-printpanel { position:absolute; top:12px; right:12px; z-index:20; width:220px;
  background:#fff; border:1px solid #d7dee3; border-radius:10px; box-shadow:0 6px 20px rgba(0,0,0,.12);
  padding:12px 14px; font-size:13px; }
.kzt-pp-title { display:block; font-weight:700; color:#34495e; margin-bottom:10px; }
.kzt-pp-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.kzt-pp-lb { color:#5a6b78; }
.kzt-pp-sel { height:30px; border:1px solid #c4c4c4; border-radius:6px; background:#fff; padding:0 8px; font-size:13px; }
.kzt-pp-count { display:block; font-weight:700; color:#e2574c; margin:6px 0 10px; }
.kzt-pp-actions { display:flex; flex-direction:column; gap:8px; }
.kzt-pp-actions .kzt-btn { width:100%; justify-content:center; }
`;

let injected = false;
export function injectTreeCss(doc: Document = document): void {
  if (injected && doc === document) return;
  const style = doc.createElement("style");
  style.textContent = TREE_CSS;
  doc.head.appendChild(style);
  if (doc === document) injected = true;
}
