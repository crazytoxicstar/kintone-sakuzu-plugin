// ツリーの並び順に使う自然順比較。

/** 自然順比較（数値混在OK：2 < 10、全角数字も認識）。昇順。 */
export function compareCode(a: string, b: string): number {
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}
