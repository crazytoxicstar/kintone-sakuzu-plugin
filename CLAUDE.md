# CLAUDE.md

このリポジトリで作業するClaude（Claude Code / チャットのエージェント）向けの作業メモ。

## これは何か

kintoneの一覧「カスタマイズビュー」上でレコードをオブジェクト（ノード）化し、配置して図を描くプラグイン「kintone作図プラグイン（kintone-sakuzuプラグイン）」。固定表示（組織図・ツリー）と自由配置の2モードを持つ。

## リリース（更新版zipを作る）手順

kintoneに上げる更新版は必ず次の順で作る。

1. **manifest の version を +1 する**
   - `plugin/manifest.json` の `"version"`（整数）を 1 増やす（例: 30 → 31）。
   - 内容に関係なく、リリースのたびに必ず上げる。上げないとkintoneが再インストールしても反映しない。
2. **ビルド**: `npm run build`
   - `plugin/js/desktop.js`・`plugin/js/config.js` と `demo/*.js` が生成される。
3. **パッケージング**: `npm run pack`
   - `private.ppk` で署名し、`dist/plugin.zip` が出力される。
4. **release の zip を差し替え**
   - `cp dist/plugin.zip release/kintone-sakuzu-plugin.zip`
5. **コミット**: `git add` → `git commit`
   - 通常含めるもの: 変更した `src/`・`demo/`、`plugin/manifest.json`、`release/kintone-sakuzu-plugin.zip`。
   - コミットメッセージは日本語で変更内容を `／` 区切りで書き、末尾に `manifest vNN` を付ける。
   - 例: `固定表示に印刷を追加／ツリーのツールバーを左寄せに修正／manifest v30`
6. **プッシュ**: `git push`（`main` ブランチ）

## 注意

- `private.ppk` は秘密鍵。**絶対にコミットしない**。紛失・作り直しするとプラグインIDが変わり、kintone上で同じプラグインとして更新できなくなる（設定も引き継がれない）。`.gitignore` 済み。
- `plugin/js/` と `dist/` は gitignore 対象。配布物としてコミットするのは `release/kintone-sakuzu-plugin.zip` のみ。
- `.DS_Store` はコミットしない。
- 型チェックは `npm run typecheck`。
- ヘッドレステストは `node scripts/test-config-ui.mjs` などを参照（jsdom + esbuild）。

## ディレクトリの要点

- `src/` … TypeScriptソース。`config/`（設定画面）、`tree/`（固定表示）、`free/`（自由配置）、`shared/`。
- `plugin/` … パッケージング対象（manifest・html・css・image・ビルド出力js）。
- `demo/` … 単体デモ（印刷デモ等）。
- `release/kintone-sakuzu-plugin.zip` … 配布用の成果物。
