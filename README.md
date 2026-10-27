# kintone作図プラグイン（kintone-zukai プラグイン）

kintoneの一覧「カスタマイズビュー」上で、レコードをオブジェクト（ノード）として白紙キャンバスに自由配置し、線でつないで図を描くプラグイン。相関図・ポジショニングマップ・組織図・フローなどを人の手で描き分けられるプラグイン。

## ダウンロード / インストール

1. 配布用zipをダウンロード: [release/kintone-zukai-plugin.zip](release/kintone-zukai-plugin.zip)
2. kintoneの対象アプリで「設定 → プラグイン → プラグインの追加」から、ダウンロードしたzipを追加する。
3. プラグインを適用し、「設定」から対象ビューIDなどを入力して保存 → アプリを更新。

詳しいセットアップは下記「セットアップ（kintone側）」を参照。

## アーキテクチャ（2アプリ構成）

- **元アプリ（レコードを置く側）**: ノードの素材になるレコードが入っている既存アプリ。改変しない。プラグイン（キャンバスUI）はこのアプリのカスタマイズビューに乗る。
- **図データアプリ（保存専用）**: 1レコード＝1枚の図。複数行テキストフィールドにキャンバス全体のJSONを保存するだけの別アプリ。元レコードはID参照で指す。プラグインがREST API経由で裏で読み書きする。

保存するJSONの構造は `src/shared/types.ts` の `Diagram` を参照（元アプリのレコードと図を結ぶ契約）。

## 必要環境

- Node.js 18 以上
- kintone 環境（プラグイン追加権限のあるユーザー）

## セットアップ（kintone側）

1. **元アプリ**に「カスタマイズ」種別の一覧を1つ作成し、HTMLに描画先コンテナを1つ置く:
   ```html
   <div id="kintone-zu-root"></div>
   ```
   保存後、その一覧のID（URLの `view=XXXX` の数字）を控える。
2. **図データアプリ**を新規作成し、次のフィールドを置く（フィールドコードを合わせること）:
   - 複数行テキスト: `data`（図のJSON本体）
   - 文字列1行: `name`（図の名前）
   ※ 最終的なフィールド構成はM4で確定。現時点では作成だけでよい。
3. 後述の手順でビルドした `dist/plugin.zip` を、元アプリの「プラグイン」設定から追加・適用する。
4. プラグインの「設定」を開き、**対象ビューID**（手順1の一覧ID）と**図データアプリID**（手順2のアプリID）を入力して保存 → アプリを更新。

## 開発コマンド

```bash
npm install        # 初回のみ
npm run build      # src/ を plugin/js/ にバンドル
npm run watch      # 変更監視ビルド
npm run typecheck  # 型チェック
npm run pack       # plugin/ を署名付き dist/plugin.zip にパッケージング
npm run dist       # build + pack
```

- 初回 `pack` 時に秘密鍵 `private.ppk` が生成される。2回目以降は同じ鍵で署名され、**プラグインIDが固定**される（＝kintone上で「同じプラグインの更新」として扱われ、設定が引き継がれる）。
- **`private.ppk` は紛失・流出厳禁**。失うと既存プラグインの更新ができなくなる（新しい鍵＝別プラグイン扱いになる）。Gitには含めない（`.gitignore` 済み）。

## パッケージングツールについて

現状は `@kintone/plugin-packer`（npm）でパッケージングしている。公式ではこの機能が `cli-kintone`（@kintone/cli）へ統合され、`plugin-packer` は2026年8月でメンテナンス終了。将来的には `cli-kintone` の plugin pack 系へ移行予定。移行手順: https://cli.kintone.dev/guide/migration/migration-from-js-sdk/

## ディレクトリ構成

```
kintone-zu-plugin/
├── manifest は plugin/manifest.json
├── src/
│   ├── shared/types.ts       図データのスキーマ（Diagram 定義）
│   ├── shared/kintone.d.ts   kintone グローバルの最小型定義
│   ├── desktop/desktop.ts    一覧カスタマイズビューのエントリ
│   ├── desktop/canvas.ts     SVGキャンバス（パン/ズーム/レイヤー）
│   └── config/config.ts      設定画面ロジック
├── plugin/                   パッケージング対象（pack のソースルート）
│   ├── manifest.json
│   ├── html/config.html
│   ├── css/{config,desktop}.css
│   ├── image/icon.png
│   └── js/                   ← build 出力（desktop.js / config.js）
├── build.mjs                 esbuild ビルド
├── scripts/pack.mjs          パッケージング
└── dist/plugin.zip           ← 成果物（kintoneにアップロードするファイル）
```

## ロードマップ

- **M1 ✅ スキャフォールド＋設定画面＋空キャンバス描画**（本リリース）
  - 設定画面で対象ビューID・図データアプリIDを指定
  - 対象ビューで空のSVGキャンバス（グリッド＋パン/ズーム）を描画
- **M2 レコード取得＋パレット＋ドラッグ配置**: rest-api-clientで絞り込み結果を全件取得し、サイドバーのレコードパレット（検索＋複数選択）からノードとして配置。全件/選択の両対応。
- **M3 線接続・色/形状/ラベル・フリー図形**
- **M4 JSON保存/読込・複数図切替**（図データアプリ）
- **M5 書き出し（SVG/PNG）・仕上げ・cli-kintone移行**
