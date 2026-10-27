// 自由配置モードの単体デモ（kintone不要・メモリ内）。
// 表示項目（主=氏名/副=役職・部門・区分）、配置、線で接続、シート種別を体験できる。
import { FREE_DEMO_RECORDS } from "../src/free/free-demo-data";
import type { Diagram } from "../src/shared/types";
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
  recordUrl(_recordId: string): string | null {
    return "#demo-record"; // デモではダミー。↗は表示されるが実レコードは開かない
  }
}

const host = document.getElementById("app");
if (host) {
  const st = (window as any).__KZF_SHEET__;
  const sheetType = st === "square" || st === "circle" || st === "honeycomb" ? st : "normal";
  new FreeEditor(host, new DemoFreeProvider(FREE_DEMO_RECORDS), 0, {
    openInNewTab: true,
    sheetType,
  }).mount().catch((e) => {
    console.error(e);
    host.textContent = "デモの初期化に失敗しました。";
  });
}
