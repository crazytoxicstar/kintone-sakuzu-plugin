// 単体デモ。部門コードでグループ化し、部門の枠の中にメンバー（従来の箱）を並べる。
// メンバーを別の部門枠へドラッグすると、その人の所属（部門コード）が変わる。
import type { FieldChange } from "../src/tree/model";
import type { DataProvider, LoadResult } from "../src/tree/providers";
import { TreeEditor } from "../src/tree/view";

type Row = { id: string; dept: string; dname: string; parent: string; level: number; name: string; role: string };
const ROWS: Row[] = [
  { id: "E001", dept: "D0", dname: "代表", parent: "", level: 1, name: "佐藤 一郎", role: "代表取締役" },
  { id: "E002", dept: "D1", dname: "経営管理本部", parent: "D0", level: 2, name: "伊藤 真由美", role: "本部長" },
  { id: "E003", dept: "D11", dname: "人事総務部", parent: "D1", level: 3, name: "鈴木 健治", role: "部長" },
  { id: "E004", dept: "D11", dname: "人事総務部", parent: "D1", level: 3, name: "山田 花子", role: "主任" },
  { id: "E005", dept: "D2", dname: "営業本部", parent: "D0", level: 2, name: "山本 大輔", role: "本部長" },
  { id: "E006", dept: "D21", dname: "第一営業部", parent: "D2", level: 3, name: "中村 憲", role: "部長" },
  { id: "E007", dept: "D21", dname: "第一営業部", parent: "D2", level: 3, name: "小林 誠", role: "一般" },
  { id: "E008", dept: "D22", dname: "第二営業部", parent: "D2", level: 3, name: "森 須美瑛", role: "一般" },
];

class DemoProvider implements DataProvider {
  readonly writable = true;
  readonly label = "デモ（メモリ内・kintoneには書き込みません）";
  private rows = ROWS.slice();
  async load(): Promise<LoadResult> {
    return { records: this.rows.map((r) => ({
      recordId: r.id, groupId: r.dept, parentId: r.parent, level: r.level, sortKey: r.dept, groupName: r.dname,
      main: r.name, subs: [{ label: "役職", value: r.role }],
    })) };
  }
  async apply(changes: FieldChange[]): Promise<void> {
    for (const c of changes) {
      const r = this.rows.find((x) => x.id === c.recordId);
      if (!r) continue;
      r.dept = c.after.groupId; r.parent = c.after.parentId; r.level = c.after.level;
      // 対象部門の名称に合わせる（デモ用）
      const src = this.rows.find((x) => x.dept === c.after.groupId && x.id !== r.id);
      if (src) r.dname = src.dname;
    }
  }
}

const host = document.getElementById("app");
if (host) {
  const dir = (window as any).__KZT_DIR__ === "horizontal" ? "horizontal" : "vertical";
  new TreeEditor(host, new DemoProvider(), dir).mount().catch((e) => {
    console.error(e);
    host.textContent = "デモの初期化に失敗しました。";
  });
}
