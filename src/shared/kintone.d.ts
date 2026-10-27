// kintone グローバルの最小型定義（利用箇所のみ）。
// 公式 @types は提供が限定的なため、必要なAPIだけ自前で宣言する。

declare namespace kintone {
  const $PLUGIN_ID: string;

  function api(url: string, method: string, params: unknown): Promise<any>;
  namespace api {
    function url(path: string, detectGuestSpace?: boolean): string;
  }

  namespace events {
    function on(type: string | string[], handler: (event: any) => any): void;
  }

  namespace app {
    function getId(): number | null;
    function getQuery(): string | null;
    function getQueryCondition(): string | null;
  }

  namespace plugin {
    namespace app {
      function getConfig(pluginId: string): Record<string, string>;
      function setConfig(config: Record<string, string>, callback?: () => void): void;
    }
  }
}
