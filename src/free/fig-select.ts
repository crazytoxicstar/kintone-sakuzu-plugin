// 図データ（図アプリのレコード群）から、指定カスタマイズビューの図を選ぶ純粋関数。
// kintoneクライアントに依存しないのでテストしやすい。
import type { Diagram } from "../shared/types";

/**
 * 1) viewId が一致する図を最優先。
 * 2) 無ければ viewId 未設定の旧データを1件だけ引き継ぐ（adoptedLegacy=true）。
 * 3) どちらも無ければ null（そのビューは新規＝空キャンバス）。
 */
export function pickDiagramForView(
  records: any[],
  dataField: string,
  viewId: string
): { recordId: string; diagram: Diagram; adoptedLegacy: boolean } | null {
  let legacy: { recordId: string; diagram: Diagram } | null = null;
  for (const rec of records) {
    let d: Diagram;
    try { d = JSON.parse(rec[dataField].value) as Diagram; } catch { continue; }
    if (String(d.viewId ?? "") === String(viewId)) {
      return { recordId: String(rec.$id.value), diagram: d, adoptedLegacy: false };
    }
    if (d.viewId == null && !legacy) legacy = { recordId: String(rec.$id.value), diagram: d };
  }
  return legacy ? { recordId: legacy.recordId, diagram: legacy.diagram, adoptedLegacy: true } : null;
}
