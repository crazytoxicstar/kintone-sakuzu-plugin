// 自由配置モードの統合デモ（シート種別を画面上で切替）。kintone不要・メモリ内。
import { FREE_DEMO_RECORDS } from "../src/free/free-demo-data";
import type { Diagram, SheetType } from "../src/shared/types";
import type { FreeProvider, FreeRecord } from "../src/free/data";
import { FreeEditor } from "../src/free/free-view";

class DemoFreeProvider implements FreeProvider {
  readonly writable = true;
  readonly label = "デモ（メモリ内・kintoneには保存しません）";
  constructor(private recs: FreeRecord[]) {}
  async loadRecords(): Promise<FreeRecord[]> {
    return this.recs.map((r) => ({ ...r, subs: r.subs.map((s) => ({ ...s })) }));
  }
  async loadDiagram(): Promise<Diagram | null> { return null; }
  async saveDiagram(_d: Diagram): Promise<void> { /* デモは保存しない */ }
  recordUrl(_recordId: string): string | null { return "#demo-record"; }
}

const SHEETS: { value: SheetType; label: string }[] = [
  { value: "normal", label: "ノーマル（20pxグリッド）" },
  { value: "square", label: "正方形シート" },
  { value: "circle", label: "円形シート（六角最密）" },
  { value: "honeycomb", label: "ハニカム（六角）" },
];

const sel = document.getElementById("sheet") as HTMLSelectElement | null;
const host = document.getElementById("app");

function mountFor(sheet: SheetType): void {
  if (!host) return;
  new FreeEditor(host, new DemoFreeProvider(FREE_DEMO_RECORDS), 0, {
    openInNewTab: true,
    sheetType: sheet,
  }).mount().catch((e) => {
    console.error(e);
    host.textContent = "デモの初期化に失敗しました。";
  });
}

if (sel) {
  for (const s of SHEETS) {
    const o = document.createElement("option");
    o.value = s.value; o.textContent = s.label; sel.appendChild(o);
  }
  sel.value = "normal";
  sel.addEventListener("change", () => mountFor(sel.value as SheetType));
}
mountFor("normal");
