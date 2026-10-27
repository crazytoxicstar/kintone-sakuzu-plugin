"use strict";
(() => {
  // src/free/free-demo-data.ts
  var FREE_DEMO_RECORDS = [
    {
      "recordId": "1",
      "main": "\u4F50\u85E4 \u4E00\u90CE",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4EE3\u8868\u53D6\u7DE0\u5F79\u793E\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7D4C\u55B6"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "2",
      "main": "\u9234\u6728 \u5065\u6CBB",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u672C\u90E8\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7D4C\u55B6\u7BA1\u7406\u672C\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "3",
      "main": "\u9AD8\u6A4B \u6B63\u4EBA",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u672C\u90E8\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u55B6\u696D\u672C\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "4",
      "main": "\u7530\u4E2D \u6D0B\u5B50",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u672C\u90E8\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u958B\u767A\u672C\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "5",
      "main": "\u4F0A\u85E4 \u771F\u7531\u7F8E",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u90E8\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u4EBA\u4E8B\u7DCF\u52D9\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "6",
      "main": "\u6E21\u8FBA \u9686",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u90E8\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7D4C\u7406\u8CA1\u52D9\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "7",
      "main": "\u5C71\u672C \u5927\u8F14",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u90E8\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7B2C\u4E00\u55B6\u696D\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "8",
      "main": "\u4E2D\u6751 \u6075",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u90E8\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7B2C\u4E8C\u55B6\u696D\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "9",
      "main": "\u5C0F\u6797 \u8AA0",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u90E8\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u30D7\u30ED\u30C0\u30AF\u30C8\u958B\u767A\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "10",
      "main": "\u52A0\u85E4 \u5F69",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u90E8\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u54C1\u8CEA\u4FDD\u8A3C\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "11",
      "main": "\u5409\u7530 \u76F4\u6A39",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u8AB2\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u4EBA\u4E8B\u7DCF\u52D9\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "12",
      "main": "\u5C71\u7530 \u5F69\u9999",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4E3B\u4EFB"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u4EBA\u4E8B\u7DCF\u52D9\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "13",
      "main": "\u4F50\u3005\u6728 \u4EAE",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4E00\u822C"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u4EBA\u4E8B\u7DCF\u52D9\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "14",
      "main": "\u5C71\u53E3 \u8061",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u8AB2\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7D4C\u7406\u8CA1\u52D9\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "15",
      "main": "\u677E\u672C \u4F73\u5948",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4E00\u822C"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7D4C\u7406\u8CA1\u52D9\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "16",
      "main": "\u4E95\u4E0A \u62D3\u4E5F",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u8AB2\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7B2C\u4E00\u55B6\u696D\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "17",
      "main": "\u6728\u6751 \u76F4\u4EBA",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4FC2\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7B2C\u4E00\u55B6\u696D\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "18",
      "main": "\u6797 \u7F8E\u54B2",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4E00\u822C"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7B2C\u4E00\u55B6\u696D\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "19",
      "main": "\u6E05\u6C34 \u7FD4\u592A",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4E00\u822C"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7B2C\u4E00\u55B6\u696D\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "20",
      "main": "\u658E\u85E4 \u7531\u9999",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u8AB2\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7B2C\u4E8C\u55B6\u696D\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "21",
      "main": "\u68EE \u5065\u592A",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4E3B\u4EFB"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7B2C\u4E8C\u55B6\u696D\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "22",
      "main": "\u6C60\u7530 \u5948\u3005",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4E00\u822C"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7B2C\u4E8C\u55B6\u696D\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "23",
      "main": "\u6A4B\u672C \u525B",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u8AB2\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u30D7\u30ED\u30C0\u30AF\u30C8\u958B\u767A\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "24",
      "main": "\u5C71\u5D0E \u6DBC",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4FC2\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u30D7\u30ED\u30C0\u30AF\u30C8\u958B\u767A\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "25",
      "main": "\u963F\u90E8 \u5343\u5C0B",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4E3B\u4EFB"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u30D7\u30ED\u30C0\u30AF\u30C8\u958B\u767A\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "26",
      "main": "\u68EE\u7530 \u60A0",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4E00\u822C"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u30D7\u30ED\u30C0\u30AF\u30C8\u958B\u767A\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "27",
      "main": "\u85E4\u7530 \u8389\u5B50",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4E00\u822C"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u30D7\u30ED\u30C0\u30AF\u30C8\u958B\u767A\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "28",
      "main": "\u5CA1\u7530 \u6D69\u4E8C",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u8AB2\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u54C1\u8CEA\u4FDD\u8A3C\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "29",
      "main": "\u5F8C\u85E4 \u9EBB\u8863",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4E3B\u4EFB"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u54C1\u8CEA\u4FDD\u8A3C\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "30",
      "main": "\u6751\u4E0A \u96BC",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4E00\u822C"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u54C1\u8CEA\u4FDD\u8A3C\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u4E3B\u52D9"
        }
      ]
    },
    {
      "recordId": "31",
      "main": "\u5C0F\u6797 \u8AA0",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u8AB2\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u54C1\u8CEA\u4FDD\u8A3C\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u517C\u52D9"
        }
      ]
    },
    {
      "recordId": "32",
      "main": "\u6728\u6751 \u76F4\u4EBA",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4FC2\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7B2C\u4E8C\u55B6\u696D\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u517C\u52D9"
        }
      ]
    },
    {
      "recordId": "33",
      "main": "\u5409\u7530 \u76F4\u6A39",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u8AB2\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u7D4C\u7406\u8CA1\u52D9\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u517C\u52D9"
        }
      ]
    },
    {
      "recordId": "34",
      "main": "\u5C71\u5D0E \u6DBC",
      "subs": [
        {
          "label": "\u5F79\u8077",
          "value": "\u4FC2\u9577"
        },
        {
          "label": "\u90E8\u9580",
          "value": "\u54C1\u8CEA\u4FDD\u8A3C\u90E8"
        },
        {
          "label": "\u533A\u5206",
          "value": "\u517C\u52D9"
        }
      ]
    }
  ];

  // src/shared/types.ts
  var DIAGRAM_SCHEMA_VERSION = 1;
  function createEmptyDiagram(sourceAppId, name = "\u65B0\u3057\u3044\u56F3") {
    return {
      schemaVersion: DIAGRAM_SCHEMA_VERSION,
      id: `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      sourceAppId,
      nodes: [],
      edges: [],
      shapes: [],
      view: { zoom: 1, panX: 0, panY: 0 },
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }

  // src/free/free-styles.ts
  var FREE_CSS = `
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
/* \u5370\u5237\uFF1A\u30DA\u30FC\u30B8\u5883\u754C\u30AA\u30FC\u30D0\u30FC\u30EC\u30A4\uFF08\u64CD\u4F5C\u3092\u59A8\u3052\u306A\u3044\u3088\u3046 pointer-events \u7121\u52B9\uFF09 */
.kzf-pgline{ fill:none; stroke:#e2574c; stroke-width:2; stroke-dasharray:6 5; vector-effect:non-scaling-stroke; opacity:.9; pointer-events:none; }
.kzf-pgfill{ fill:#e2574c; opacity:.04; pointer-events:none; }
.kzf-pglabel{ fill:#e2574c; font-weight:800; opacity:.85; pointer-events:none; }
/* \u5370\u5237\uFF1A\u8A2D\u5B9A\u30D1\u30CD\u30EB\uFF08\u30AD\u30E3\u30F3\u30D0\u30B9\u53F3\u4E0A\uFF09 */
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
  var injected = false;
  function injectFreeCss(doc = document) {
    if (injected && doc === document) return;
    const s = doc.createElement("style");
    s.textContent = FREE_CSS;
    doc.head.appendChild(s);
    if (doc === document) injected = true;
  }

  // src/free/sheet.ts
  var GRID = 20;
  var CELL = 112;
  var CIRCLE_D = 104;
  var HEXR = 60;
  var SVG_NS = "http://www.w3.org/2000/svg";
  var SQRT3 = Math.sqrt(3);
  var ROW_H = SQRT3 / 2 * CIRCLE_D;
  function cellSize(sheet) {
    switch (sheet) {
      case "square":
        return { w: CELL, h: CELL };
      case "circle":
        return { w: CIRCLE_D, h: CIRCLE_D };
      case "honeycomb":
        return { w: 2 * HEXR, h: Math.round(SQRT3 * HEXR) };
      // フラットトップ: 幅=2R, 高さ=√3R
      default:
        return { w: 190, h: 0 };
    }
  }
  function nodeShapeFor(sheet) {
    switch (sheet) {
      case "square":
        return "square";
      case "circle":
        return "ellipse";
      case "honeycomb":
        return "hexagon";
      default:
        return "roundRect";
    }
  }
  function snapCenter(sheet, cx, cy) {
    if (sheet === "square") {
      const c = (v) => Math.round((v - CELL / 2) / CELL) * CELL + CELL / 2;
      return { x: c(cx), y: c(cy) };
    }
    if (sheet === "circle") {
      return circleRound(cx, cy);
    }
    if (sheet === "honeycomb") {
      return hexRound(cx, cy);
    }
    return { x: cx, y: cy };
  }
  function circleRound(cx, cy) {
    const p = CIRCLE_D;
    const h = ROW_H;
    let best = { x: cx, y: cy };
    let bd = Infinity;
    const jr = Math.round(cy / h);
    for (let j = jr - 1; j <= jr + 1; j++) {
      const off = (j % 2 + 2) % 2 === 1 ? p / 2 : 0;
      const ic = Math.round((cx - off) / p);
      for (const i of [ic - 1, ic, ic + 1]) {
        const x = i * p + off;
        const y = j * h;
        const d = (x - cx) ** 2 + (y - cy) ** 2;
        if (d < bd) {
          bd = d;
          best = { x, y };
        }
      }
    }
    return best;
  }
  function snapTopLeft(v) {
    return Math.round(v / GRID) * GRID;
  }
  function hexRound(x, y) {
    const s = HEXR;
    const q = 2 / 3 * x / s;
    const r = (-1 / 3 * x + SQRT3 / 3 * y) / s;
    let xc = q;
    let zc = r;
    let yc = -xc - zc;
    let rx = Math.round(xc);
    let ry = Math.round(yc);
    let rz = Math.round(zc);
    const dx = Math.abs(rx - xc);
    const dy = Math.abs(ry - yc);
    const dz = Math.abs(rz - zc);
    if (dx > dy && dx > dz) rx = -ry - rz;
    else if (dy > dz) ry = -rx - rz;
    else rz = -rx - ry;
    const cx = s * (3 / 2) * rx;
    const cy = s * SQRT3 * (rz + rx / 2);
    return { x: cx, y: cy };
  }
  function hexPoints(cx, cy, r = HEXR) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 180 * (60 * i);
      pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(" ");
  }
  function clipToShape(sheet, node, toward) {
    const cx = node.x + node.w / 2;
    const cy = node.y + node.h / 2;
    const dx = toward.x - cx;
    const dy = toward.y - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };
    if (sheet === "circle") {
      const rad = Math.min(node.w, node.h) / 2;
      const len = Math.hypot(dx, dy);
      return { x: cx + dx / len * rad, y: cy + dy / len * rad };
    }
    if (sheet === "honeycomb") {
      const rad = SQRT3 / 2 * (node.h / SQRT3);
      const len = Math.hypot(dx, dy);
      return { x: cx + dx / len * rad, y: cy + dy / len * rad };
    }
    const hw = node.w / 2;
    const hh = node.h / 2;
    const scale = 1 / Math.max(Math.abs(dx) / hw, Math.abs(dy) / hh);
    return { x: cx + dx * scale, y: cy + dy * scale };
  }
  function buildSheetPattern(sheet, defs) {
    const mk = (tag) => document.createElementNS(SVG_NS, tag);
    if (sheet === "square") {
      const p = mk("pattern");
      p.setAttribute("id", "kzf-sheet");
      p.setAttribute("width", String(CELL));
      p.setAttribute("height", String(CELL));
      p.setAttribute("patternUnits", "userSpaceOnUse");
      const rect = mk("rect");
      rect.setAttribute("x", "0");
      rect.setAttribute("y", "0");
      rect.setAttribute("width", String(CELL));
      rect.setAttribute("height", String(CELL));
      rect.setAttribute("fill", "none");
      rect.setAttribute("class", "kzf-cell-line");
      p.appendChild(rect);
      defs.appendChild(p);
      return "url(#kzf-sheet)";
    }
    if (sheet === "circle") {
      const pit = CIRCLE_D;
      const h = ROW_H;
      const r = pit / 2 - 1;
      const p = mk("pattern");
      p.setAttribute("id", "kzf-sheet");
      p.setAttribute("width", String(pit));
      p.setAttribute("height", String(2 * h));
      p.setAttribute("patternUnits", "userSpaceOnUse");
      const centers = [[0, 0], [pit, 0], [0, 2 * h], [pit, 2 * h], [pit / 2, h]];
      for (const [cx, cy] of centers) {
        const c = mk("circle");
        c.setAttribute("cx", String(cx));
        c.setAttribute("cy", String(cy));
        c.setAttribute("r", String(r));
        c.setAttribute("fill", "none");
        c.setAttribute("class", "kzf-cell-line");
        p.appendChild(c);
      }
      defs.appendChild(p);
      return "url(#kzf-sheet)";
    }
    if (sheet === "honeycomb") {
      const w = 3 * HEXR;
      const h = Math.round(SQRT3 * HEXR);
      const p = mk("pattern");
      p.setAttribute("id", "kzf-sheet");
      p.setAttribute("width", String(w));
      p.setAttribute("height", String(h));
      p.setAttribute("patternUnits", "userSpaceOnUse");
      for (const [cx, cy] of [[0, 0], [3 * HEXR, 0], [0, h], [3 * HEXR, h], [1.5 * HEXR, h / 2]]) {
        const poly = mk("polygon");
        poly.setAttribute("points", hexPoints(cx, cy));
        poly.setAttribute("fill", "none");
        poly.setAttribute("class", "kzf-cell-line");
        p.appendChild(poly);
      }
      defs.appendChild(p);
      return "url(#kzf-sheet)";
    }
    const minor = mk("pattern");
    minor.setAttribute("id", "kzf-grid");
    minor.setAttribute("width", String(GRID));
    minor.setAttribute("height", String(GRID));
    minor.setAttribute("patternUnits", "userSpaceOnUse");
    const mp = mk("path");
    mp.setAttribute("d", `M${GRID} 0 L0 0 0 ${GRID}`);
    mp.setAttribute("fill", "none");
    mp.setAttribute("class", "kzf-grid-line");
    minor.appendChild(mp);
    const MAJOR = GRID * 5;
    const major = mk("pattern");
    major.setAttribute("id", "kzf-sheet");
    major.setAttribute("width", String(MAJOR));
    major.setAttribute("height", String(MAJOR));
    major.setAttribute("patternUnits", "userSpaceOnUse");
    const bg = mk("rect");
    bg.setAttribute("width", String(MAJOR));
    bg.setAttribute("height", String(MAJOR));
    bg.setAttribute("fill", "url(#kzf-grid)");
    const majp = mk("path");
    majp.setAttribute("d", `M${MAJOR} 0 L0 0 0 ${MAJOR}`);
    majp.setAttribute("fill", "none");
    majp.setAttribute("class", "kzf-grid-line-major");
    major.append(bg, majp);
    defs.append(minor, major);
    return "url(#kzf-sheet)";
  }

  // src/free/free-view.ts
  var SVG_NS2 = "http://www.w3.org/2000/svg";
  function normHex(v) {
    let s = (v || "").trim();
    if (s && s[0] !== "#") s = "#" + s;
    if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(s)) return ("#" + s[1] + s[1] + s[2] + s[2] + s[3] + s[3]).toLowerCase();
    return null;
  }
  var NODE_W = 200;
  var HEAD_H = 40;
  var SUB_H = 20;
  var PAD_B = 0;
  var FreeEditor = class {
    constructor(host2, provider, sourceAppId, opts) {
      this.provider = provider;
      this.sourceAppId = sourceAppId;
      this.opts = opts;
      // 印刷ページ境界のオーバーレイ（印刷パネル表示中のみ）
      // 印刷設定
      this.printOn = false;
      this.printPaper = "A4";
      this.printOrient = "land";
      this.printScale = 1;
      this.records = [];
      this.recMap = /* @__PURE__ */ new Map();
      this.vb = { x: 0, y: 0, w: 1e3, h: 560 };
      this.fitW = 1e3;
      this.fitH = 560;
      this.connectMode = false;
      this.snapEnabled = true;
      // 線ツールの既定（新規線に適用。選択中の線があればそれにも反映）
      this.edgeDefaults = {
        style: "solid",
        startMarker: "none",
        endMarker: "arrow",
        routing: "elbow",
        color: "#8595a0"
      };
      this.connectSrc = null;
      // 接続の始点ノード
      this.selNodes = /* @__PURE__ */ new Set();
      // 選択中のノード（複数可）
      this.selEdge = null;
      this.selShape = null;
      // 選択中の文字/図形
      this.marqueeMode = false;
      this.textMode = false;
      this.textDefaults = {
        fontSize: "m",
        bold: false,
        italic: false,
        underline: false,
        color: "#2d3b45"
      };
      this.dirty = false;
      this.bgFill = "url(#kzf-sheet)";
      this.panning = false;
      this.panLast = { x: 0, y: 0 };
      this.toastTimer = 0;
      injectFreeCss(host2.ownerDocument || document);
      this.root = host2;
    }
    async mount() {
      this.records = await this.provider.loadRecords();
      this.recMap = new Map(this.records.map((r) => [r.recordId, r]));
      const loaded = await this.provider.loadDiagram();
      this.diagram = loaded != null ? loaded : createEmptyDiagram(this.sourceAppId, "\u56F31");
      this.buildDom();
      this.resizeToWindow();
      this.renderPalette();
      this.render();
      this.baselineView();
      window.addEventListener("resize", () => this.resizeToWindow());
      document.addEventListener("fullscreenchange", () => this.resizeToWindow());
    }
    /** SVGの高さをブラウザのウィンドウ下端まで追従させる */
    resizeToWindow() {
      const rect = this.svg.getBoundingClientRect();
      const bottomGap = 48;
      const h = Math.max(320, Math.round(window.innerHeight - rect.top - bottomGap));
      this.svg.style.height = h + "px";
      this.palListEl.style.maxHeight = h + "px";
    }
    toggleFullscreen() {
      const doc = document;
      const el2 = this.root;
      if (!doc.fullscreenElement) {
        if (el2.requestFullscreen) el2.requestFullscreen();
      } else if (doc.exitFullscreen) {
        doc.exitFullscreen();
      }
    }
    get shaped() {
      return this.opts.sheetType !== "normal";
    }
    nodeW() {
      return this.shaped ? cellSize(this.opts.sheetType).w : NODE_W;
    }
    nodeH(recordId) {
      if (this.shaped) return cellSize(this.opts.sheetType).h;
      const rec = this.recMap.get(recordId);
      const subs = rec ? this.visibleSubs(rec).length : 0;
      return HEAD_H + (subs > 0 ? subs * SUB_H + PAD_B : PAD_B);
    }
    /** 表示する副（値が空のものは除外、最大5件） */
    visibleSubs(rec) {
      return rec.subs.filter((s) => s.value != null && String(s.value).trim() !== "").slice(0, 5);
    }
    /** ドロップ/移動時の配置を算出（shape系はセル中心スナップ、normalは左上グリッド） */
    placeAt(desiredX, desiredY, w, h) {
      if (this.shaped) {
        const c = snapCenter(this.opts.sheetType, desiredX + w / 2, desiredY + h / 2);
        return { x: c.x - w / 2, y: c.y - h / 2 };
      }
      if (this.snapEnabled) return { x: snapTopLeft(desiredX), y: snapTopLeft(desiredY) };
      return { x: desiredX, y: desiredY };
    }
    /** 指定位置にノードを置くと他ノードと重なるか（shaped=同一セル / normal=矩形交差） */
    wouldOverlap(x, y, w, h, excludeIds) {
      const skip = (id) => typeof excludeIds === "string" ? id === excludeIds : excludeIds.has(id);
      for (const n of this.diagram.nodes) {
        if (skip(n.id)) continue;
        if (this.shaped) {
          if (Math.abs(n.x - x) < 1 && Math.abs(n.y - y) < 1) return true;
        } else {
          const gap = 1;
          if (x < n.x + n.w - gap && x + w > n.x + gap && y < n.y + n.h - gap && y + h > n.y + gap) return true;
        }
      }
      return false;
    }
    /** 希望位置にスナップし、重なる場合は近くの空き位置へずらして返す */
    resolvePlacement(desiredX, desiredY, w, h, excludeId) {
      const skip = new Set(excludeId ? [excludeId] : []);
      const base = this.placeAt(desiredX, desiredY, w, h);
      if (!this.wouldOverlap(base.x, base.y, w, h, skip)) return base;
      const step = this.shaped ? Math.min(cellSize(this.opts.sheetType).w, cellSize(this.opts.sheetType).h) : GRID;
      for (let ring = 1; ring <= 80; ring++) {
        for (let dy = -ring; dy <= ring; dy++) {
          for (let dx = -ring; dx <= ring; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
            const cand = this.placeAt(desiredX + dx * step, desiredY + dy * step, w, h);
            if (!this.wouldOverlap(cand.x, cand.y, w, h, skip)) return cand;
          }
        }
      }
      return base;
    }
    // ---- DOM ----
    buildDom() {
      this.root.classList.add("kzf-root");
      this.root.innerHTML = "";
      const bar = el("div", "kzf-toolbar");
      const brand = spanText("kzf-brand", "\u30EC\u30B3\u30FC\u30C9\u56F3\uFF08\u81EA\u7531\u914D\u7F6E\uFF09");
      const spacer = el("span", "kzf-spacer");
      const lineTool = el("div", "kzf-linetool");
      this.connectBtn = btn("\u30E9\u30A4\u30F3", () => this.toggleConnect(), ICONS.line);
      this.caretBtn = btn("\u25BE", () => this.toggleLinePop());
      this.caretBtn.classList.add("kzf-caret");
      this.routeSel = this.mkLineSelect([["elbow", "L\u5B57"], ["straight", "\u76F4\u7DDA"]], this.edgeDefaults.routing);
      this.lineSel = this.mkLineSelect([["solid", "\u5B9F\u7DDA"], ["dashed", "\u7834\u7DDA"], ["dotted", "\u70B9\u7DDA"], ["double", "\u4E8C\u91CD\u7DDA"]], this.edgeDefaults.style);
      const markerOpts = [["none", "\u306A\u3057"], ["arrow", "\u25B6 \u77E2\u5370"], ["openArrow", "\u25B7 \u767D\u629C\u304D"], ["dot", "\u25CF \u4E38"], ["box", "\u25A0 \u56DB\u89D2"]];
      this.startSel = this.mkLineSelect(markerOpts, this.edgeDefaults.startMarker);
      this.endSel = this.mkLineSelect(markerOpts, this.edgeDefaults.endMarker);
      this.lineColor = this.mkColorField(this.edgeDefaults.color, () => this.applyEdgeStyleFromUi());
      this.routeSel.addEventListener("change", () => this.applyEdgeStyleFromUi());
      this.lineSel.addEventListener("change", () => this.applyEdgeStyleFromUi());
      this.startSel.addEventListener("change", () => this.applyEdgeStyleFromUi());
      this.endSel.addEventListener("change", () => this.applyEdgeStyleFromUi());
      this.linePop = el("div", "kzf-linepop");
      this.linePop.style.display = "none";
      const popRow = (label, ctrl) => {
        const r = el("label", "kzf-poprow");
        r.append(spanText("kzf-poplabel", label), ctrl);
        return r;
      };
      this.linePop.append(
        popRow("\u7D4C\u8DEF", this.routeSel),
        popRow("\u7DDA\u7A2E", this.lineSel),
        popRow("\u59CB\u70B9", this.startSel),
        popRow("\u7D42\u70B9", this.endSel),
        popRow("\u8272", this.lineColor.el)
      );
      lineTool.append(this.connectBtn, this.caretBtn, this.linePop);
      const textTool = el("div", "kzf-linetool");
      this.textBtn = btn("\u6587\u5B57", () => this.toggleTextMode(), ICONS.text);
      this.textCaret = btn("\u25BE", () => this.toggleTextPop());
      this.textCaret.classList.add("kzf-caret");
      this.txtSizeSel = this.mkLineSelect([["s", "\u5C0F"], ["m", "\u4E2D"], ["l", "\u5927"]], this.textDefaults.fontSize);
      this.txtBold = this.mkDecoBtn("B", "kzf-deco-b", () => this.toggleDeco("bold"));
      this.txtItalic = this.mkDecoBtn("I", "kzf-deco-i", () => this.toggleDeco("italic"));
      this.txtUnderline = this.mkDecoBtn("U", "kzf-deco-u", () => this.toggleDeco("underline"));
      this.txtColor = this.mkColorField(this.textDefaults.color, () => this.applyTextStyleFromUi());
      this.txtSizeSel.addEventListener("change", () => this.applyTextStyleFromUi());
      this.textPop = el("div", "kzf-linepop");
      this.textPop.style.display = "none";
      const trow = (label, ctrl) => {
        const r = el("label", "kzf-poprow");
        r.append(spanText("kzf-poplabel", label), ctrl);
        return r;
      };
      const decoWrap = el("div", "kzf-decowrap");
      decoWrap.append(this.txtBold, this.txtItalic, this.txtUnderline);
      this.textPop.append(trow("\u5927\u304D\u3055", this.txtSizeSel), trow("\u88C5\u98FE", decoWrap), trow("\u8272", this.txtColor.el));
      textTool.append(this.textBtn, this.textCaret, this.textPop);
      document.addEventListener("pointerdown", (ev) => {
        const t = ev.target;
        if (this.linePop && this.linePop.style.display !== "none" && !lineTool.contains(t)) this.closeLinePop();
        if (this.textPop && this.textPop.style.display !== "none" && !textTool.contains(t)) this.closeTextPop();
      });
      this.marqueeBtn = btn("\u9078\u629E", () => this.toggleMarquee(), ICONS.select);
      this.delBtn = btn("\u524A\u9664", () => this.deleteSelection(), ICONS.trash);
      this.delBtn.disabled = true;
      const saveBtn = btn("\u4FDD\u5B58", () => void this.save(), ICONS.save);
      const fsBtn = btn("\u5168\u753B\u9762", () => this.toggleFullscreen(), ICONS.fullscreen);
      this.snapBtn = btn(this.shaped ? "\u30BB\u30EB\u306B\u6574\u5217" : "\u30B0\u30EA\u30C3\u30C9: ON", () => this.toggleSnap(), ICONS.grid);
      this.snapBtn.classList.add("kzf-on");
      if (this.shaped) this.snapBtn.disabled = true;
      bar.append(this.snapBtn, lineTool, textTool, this.marqueeBtn, this.delBtn, btn("\u5168\u4F53\u8868\u793A", () => this.fit(), ICONS.fit), btn("\u5370\u5237", () => this.togglePrint()), fsBtn, saveBtn, spacer, brand);
      this.root.appendChild(bar);
      const body = el("div", "kzf-body");
      const palette = el("div", "kzf-palette");
      this.searchEl = document.createElement("input");
      this.searchEl.className = "kzf-search";
      this.searchEl.placeholder = "\u30EC\u30B3\u30FC\u30C9\u3092\u691C\u7D22";
      this.searchEl.addEventListener("input", () => this.renderPalette());
      this.palListEl = el("div", "kzf-pal-list");
      palette.append(this.searchEl, this.palListEl);
      body.appendChild(palette);
      const wrap = el("div", "kzf-canvas-wrap");
      this.canvasWrap = wrap;
      this.svg = document.createElementNS(SVG_NS2, "svg");
      this.svg.classList.add("kzf-svg");
      this.svg.setAttribute("width", "100%");
      this.defs();
      const bg = document.createElementNS(SVG_NS2, "rect");
      bg.setAttribute("x", "-100000");
      bg.setAttribute("y", "-100000");
      bg.setAttribute("width", "200000");
      bg.setAttribute("height", "200000");
      bg.setAttribute("fill", this.bgFill);
      bg.addEventListener("pointerdown", (e) => this.onBgDown(e));
      this.svg.appendChild(bg);
      this.scene = gEl();
      this.edgeLayer = gEl();
      this.nodeLayer = gEl();
      this.shapeLayer = gEl();
      this.printLayer = gEl();
      this.scene.append(this.edgeLayer, this.nodeLayer, this.shapeLayer, this.printLayer);
      this.svg.appendChild(this.scene);
      this.svg.addEventListener("dragover", (e) => e.preventDefault());
      this.svg.addEventListener("drop", (e) => this.onDrop(e));
      this.svg.addEventListener("wheel", (e) => this.onWheel(e), { passive: false });
      wrap.appendChild(this.svg);
      wrap.appendChild(this.buildZoomBar());
      wrap.appendChild(this.buildPrintPanel());
      this.toastEl = el("div", "kzf-toast");
      wrap.appendChild(this.toastEl);
      body.appendChild(wrap);
      this.root.appendChild(body);
      this.statusEl = el("div", "kzf-status");
      this.root.appendChild(this.statusEl);
      this.bindPan();
      document.addEventListener("keydown", (e) => {
        if (document.activeElement === this.searchEl) return;
        if ((e.key === "Enter" || e.key === "F2") && this.selShape) {
          e.preventDefault();
          void this.editText(this.selShape);
        } else if ((e.key === "Delete" || e.key === "Backspace") && (this.selNodes.size || this.selEdge || this.selShape)) {
          e.preventDefault();
          this.deleteSelection();
        } else if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A")) {
          e.preventDefault();
          this.selectAllNodes();
        } else if (e.key === "Escape") {
          this.clearSelection();
          this.render();
        }
      });
      this.updateStatus();
    }
    defs() {
      const defs = document.createElementNS(SVG_NS2, "defs");
      this.bgFill = buildSheetPattern(this.opts.sheetType, defs);
      for (const m of buildEdgeMarkers()) defs.appendChild(m);
      this.svg.appendChild(defs);
    }
    // ---- パレット ----
    renderPalette() {
      var _a;
      const q = (((_a = this.searchEl) == null ? void 0 : _a.value) || "").trim();
      const placed = new Set(this.diagram.nodes.map((n) => n.recordId));
      const items = this.records.filter((r) => !q || r.main.includes(q) || r.recordId.includes(q));
      this.palListEl.innerHTML = "";
      if (items.length === 0) {
        this.palListEl.appendChild(spanText("kzf-pal-empty", "\u8A72\u5F53\u30EC\u30B3\u30FC\u30C9\u306A\u3057"));
        return;
      }
      for (const r of items) {
        const it = el("div", "kzf-pal-item" + (placed.has(r.recordId) ? " kzf-placed" : ""));
        const line = el("div", "kzf-pal-line");
        line.appendChild(spanText("kzf-pal-main", r.main));
        const subs = r.subs.map((s) => s.value).filter((v) => v !== "" && v != null);
        if (subs.length) line.appendChild(spanText("kzf-pal-sub", subs.join(" / ")));
        it.appendChild(line);
        it.title = subs.length ? `${r.main} \uFF5C ${subs.join(" / ")}` : r.main;
        it.draggable = true;
        it.addEventListener("dragstart", (e) => {
          var _a2, _b;
          (_a2 = e.dataTransfer) == null ? void 0 : _a2.setData("text/kzf-record", r.recordId);
          (_b = e.dataTransfer) == null ? void 0 : _b.setData("text/plain", r.recordId);
        });
        this.palListEl.appendChild(it);
      }
    }
    onDrop(e) {
      var _a, _b;
      e.preventDefault();
      const rid = ((_a = e.dataTransfer) == null ? void 0 : _a.getData("text/kzf-record")) || ((_b = e.dataTransfer) == null ? void 0 : _b.getData("text/plain"));
      if (!rid) return;
      const rec = this.recMap.get(rid);
      if (!rec) return;
      const p = this.toScene(e.clientX, e.clientY);
      const w = this.nodeW();
      const h = this.nodeH(rid);
      const pos = this.resolvePlacement(p.x - w / 2, p.y - h / 2, w, h);
      const node = {
        id: `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        recordId: rec.recordId,
        x: pos.x,
        y: pos.y,
        w,
        h,
        shape: nodeShapeFor(this.opts.sheetType),
        color: "#3498db",
        label: rec.main
      };
      this.diagram.nodes.push(node);
      this.markDirty();
      this.render();
      this.renderPalette();
    }
    // ---- 描画 ----
    render() {
      this.edgeLayer.innerHTML = "";
      this.nodeLayer.innerHTML = "";
      const byId = new Map(this.diagram.nodes.map((n) => [n.id, n]));
      for (const edge of this.diagram.edges) {
        const a = byId.get(edge.from);
        const b = byId.get(edge.to);
        if (!a || !b) continue;
        this.edgeLayer.appendChild(this.renderEdge(edge, a, b));
      }
      for (const n of this.diagram.nodes) this.nodeLayer.appendChild(this.renderNode(n));
      this.shapeLayer.innerHTML = "";
      for (const sh of this.diagram.shapes) {
        if (sh.type === "text") this.shapeLayer.appendChild(this.renderText(sh));
      }
      if (this.printOn) this.renderPageGrid();
      this.updateStatus();
    }
    renderText(sh) {
      const g = gEl();
      g.setAttribute("class", "kzf-text" + (sh.id === this.selShape ? " kzf-sel" : ""));
      g.setAttribute("transform", `translate(${sh.x} ${sh.y})`);
      g.dataset.shape = sh.id;
      const px = sh.fontSize === "l" ? 24 : sh.fontSize === "s" ? 12 : 16;
      const t = document.createElementNS(SVG_NS2, "text");
      t.setAttribute("x", "0");
      t.setAttribute("y", String(px));
      t.setAttribute("font-family", '"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif');
      t.setAttribute("font-size", String(px));
      t.setAttribute("fill", sh.color || "#2d3b45");
      if (sh.bold) t.setAttribute("font-weight", "700");
      if (sh.italic) t.setAttribute("font-style", "italic");
      if (sh.underline) t.setAttribute("text-decoration", "underline");
      t.textContent = sh.text || "";
      let approxW = 0;
      for (const ch of sh.text || "") approxW += (ch.charCodeAt(0) > 255 ? 1.02 : 0.6) * px;
      approxW = Math.max(16, approxW);
      const box = document.createElementNS(SVG_NS2, "rect");
      box.setAttribute("class", "kzf-text-box");
      box.setAttribute("x", "-5");
      box.setAttribute("y", String(-3));
      box.setAttribute("width", String(approxW + 10));
      box.setAttribute("height", String(px + 10));
      g.append(box, t);
      g.addEventListener("pointerdown", (e) => this.onShapeDown(e, sh.id));
      g.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        e.preventDefault();
        void this.editText(sh.id);
      });
      return g;
    }
    async editText(shapeId) {
      const sh = this.diagram.shapes.find((s) => s.id === shapeId);
      if (!sh) return;
      const text = await this.promptText("\u30C6\u30AD\u30B9\u30C8\u3092\u7DE8\u96C6", sh.text || "");
      if (text == null) return;
      if (text === "") {
        this.diagram.shapes = this.diagram.shapes.filter((s) => s.id !== shapeId);
      } else sh.text = text;
      this.markDirty();
      this.render();
    }
    onShapeDown(e, id) {
      e.stopPropagation();
      e.preventDefault();
      this.selectShape(id);
      const sh = this.diagram.shapes.find((s) => s.id === id);
      const start = this.toScene(e.clientX, e.clientY);
      const ox = start.x - sh.x;
      const oy = start.y - sh.y;
      let moved = false;
      const move = (ev) => {
        const p = this.toScene(ev.clientX, ev.clientY);
        const pos = this.placeAt(p.x - ox, p.y - oy, 0, 0);
        sh.x = pos.x;
        sh.y = pos.y;
        moved = true;
        const g = this.shapeLayer.querySelector(`[data-shape="${id}"]`);
        g == null ? void 0 : g.setAttribute("transform", `translate(${sh.x} ${sh.y})`);
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        if (moved) this.markDirty();
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    }
    selectShape(id) {
      this.selShape = id;
      this.selNodes.clear();
      this.selEdge = null;
      this.delBtn.disabled = false;
      const sh = this.diagram.shapes.find((s) => s.id === id);
      if (sh && sh.type === "text") {
        this.loadTextUi(sh);
        this.openTextPop();
        this.toast("\u30C0\u30D6\u30EB\u30AF\u30EA\u30C3\u30AF\u307E\u305F\u306FEnter\u3067\u6587\u5B57\u3092\u7DE8\u96C6");
      }
      this.render();
    }
    renderNode(n) {
      const rec = this.recMap.get(n.recordId);
      const h = this.nodeH(n.recordId);
      n.h = h;
      n.w = this.nodeW();
      const g = gEl();
      let cls = "kzf-node";
      if (this.selNodes.has(n.id)) cls += " kzf-sel";
      if (n.id === this.connectSrc) cls += " kzf-connect-src";
      g.setAttribute("class", cls);
      g.setAttribute("transform", `translate(${n.x} ${n.y})`);
      g.dataset.node = n.id;
      if (this.shaped) {
        g.appendChild(this.shapeEl(n));
        const cx = n.w / 2;
        const subVals = rec ? this.visibleSubs(rec).map((s) => s.value) : [];
        const maxSub = Math.max(1, Math.min(5, Math.floor((h - 28) / 14)));
        const lines = subVals.slice(0, maxSub);
        const lineH = 14;
        const total = 1 + lines.length;
        let y = h / 2 - (total - 1) * lineH / 2 + 4;
        const main = document.createElementNS(SVG_NS2, "text");
        main.setAttribute("class", "kzf-main");
        main.setAttribute("x", String(cx));
        main.setAttribute("y", String(y));
        main.setAttribute("text-anchor", "middle");
        main.textContent = truncate(rec ? rec.main : n.label, this.maxChars());
        g.appendChild(main);
        for (const v of lines) {
          y += lineH;
          const sub = document.createElementNS(SVG_NS2, "text");
          sub.setAttribute("class", "kzf-sub");
          sub.setAttribute("x", String(cx));
          sub.setAttribute("y", String(y));
          sub.setAttribute("text-anchor", "middle");
          sub.textContent = truncate(v, this.maxChars());
          g.appendChild(sub);
        }
      } else {
        const box = document.createElementNS(SVG_NS2, "rect");
        box.setAttribute("class", "kzf-box");
        box.setAttribute("width", String(n.w));
        box.setAttribute("height", String(h));
        box.setAttribute("rx", "8");
        const bar = document.createElementNS(SVG_NS2, "rect");
        bar.setAttribute("x", "0");
        bar.setAttribute("y", "0");
        bar.setAttribute("width", "6");
        bar.setAttribute("height", String(h));
        bar.setAttribute("rx", "3");
        bar.setAttribute("fill", n.color);
        const main = document.createElementNS(SVG_NS2, "text");
        main.setAttribute("class", "kzf-main");
        main.setAttribute("x", "16");
        main.setAttribute("y", "25");
        main.textContent = rec ? rec.main : n.label;
        g.append(box, bar, main);
        if (rec) {
          this.visibleSubs(rec).forEach((s, i) => {
            const t = document.createElementNS(SVG_NS2, "text");
            t.setAttribute("class", "kzf-sub");
            t.setAttribute("x", "16");
            t.setAttribute("y", String(HEAD_H + 13 + i * SUB_H));
            t.textContent = this.opts.showSubLabel === false ? s.value : `${s.label}: ${s.value}`;
            g.appendChild(t);
          });
        }
      }
      if (this.provider.recordUrl(n.recordId)) {
        const open = document.createElementNS(SVG_NS2, "text");
        open.setAttribute("class", "kzf-open");
        open.setAttribute("x", String(n.w - (this.shaped ? 16 : 10)));
        open.setAttribute("y", String(this.shaped ? 18 : 17));
        open.setAttribute("text-anchor", "end");
        open.textContent = "\u2197";
        open.addEventListener("pointerdown", (ev) => {
          ev.stopPropagation();
          this.openRecord(n.recordId);
        });
        g.appendChild(open);
      }
      g.addEventListener("pointerdown", (e) => this.onNodeDown(e, n.id));
      return g;
    }
    maxChars() {
      return Math.max(3, Math.floor((this.nodeW() - 18) / 13));
    }
    shapeEl(n) {
      const w = n.w;
      const h = n.h;
      if (this.opts.sheetType === "circle") {
        const e = document.createElementNS(SVG_NS2, "ellipse");
        e.setAttribute("class", "kzf-box");
        e.setAttribute("cx", String(w / 2));
        e.setAttribute("cy", String(h / 2));
        e.setAttribute("rx", String(w / 2 - 1));
        e.setAttribute("ry", String(h / 2 - 1));
        e.style.fill = tint(n.color);
        return e;
      }
      if (this.opts.sheetType === "honeycomb") {
        const poly = document.createElementNS(SVG_NS2, "polygon");
        poly.setAttribute("class", "kzf-box");
        poly.setAttribute("points", hexPoints(w / 2, h / 2, Math.min(w / 2, h / Math.sqrt(3))));
        poly.style.fill = tint(n.color);
        return poly;
      }
      const r = document.createElementNS(SVG_NS2, "rect");
      r.setAttribute("class", "kzf-box");
      r.setAttribute("width", String(w - 2));
      r.setAttribute("height", String(h - 2));
      r.setAttribute("x", "1");
      r.setAttribute("y", "1");
      r.setAttribute("rx", "4");
      r.style.fill = tint(n.color);
      return r;
    }
    openRecord(recordId) {
      const url = this.provider.recordUrl(recordId);
      if (!url) return;
      if (this.opts.openInNewTab) window.open(url, "_blank");
      else window.location.href = url;
    }
    edgePath(a, b, routing = "elbow") {
      const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
      const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
      const p1 = clipToShape(this.opts.sheetType, a, bc);
      const p2 = clipToShape(this.opts.sheetType, b, ac);
      if (routing === "straight") return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
      const dx = p2.x - p1.x, dy = p2.y - p1.y;
      if (Math.abs(dx) >= Math.abs(dy)) {
        const midX = (p1.x + p2.x) / 2;
        return `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
      }
      const midY = (p1.y + p2.y) / 2;
      return `M ${p1.x} ${p1.y} L ${p1.x} ${midY} L ${p2.x} ${midY} L ${p2.x} ${p2.y}`;
    }
    // 1本の線を <g data-edge> として生成（線種・両端の記号を反映）
    renderEdge(edge, a, b) {
      const g = gEl();
      g.setAttribute("class", "kzf-edge-g" + (edge.id === this.selEdge ? " kzf-sel" : ""));
      g.dataset.edge = edge.id;
      const d = this.edgePath(a, b, edge.routing || "elbow");
      const m = resolveMarkers(edge);
      const style = edge.style || "solid";
      const color = edge.color || "";
      const mkPath = (cls) => {
        const p = document.createElementNS(SVG_NS2, "path");
        p.setAttribute("class", cls);
        p.setAttribute("d", d);
        if (color && !cls.includes("inner")) p.setAttribute("stroke", color);
        return p;
      };
      if (style === "double") {
        g.appendChild(mkPath("kzf-edge kzf-edge-outer"));
        g.appendChild(mkPath("kzf-edge kzf-edge-inner"));
      } else {
        const p = mkPath("kzf-edge kzf-edge-" + style);
        if (m.start !== "none") p.setAttribute("marker-start", `url(#kzf-m-${m.start})`);
        if (m.end !== "none") p.setAttribute("marker-end", `url(#kzf-m-${m.end})`);
        g.appendChild(p);
      }
      if (style === "double") {
        const outer = g.querySelector(".kzf-edge-outer");
        if (m.start !== "none") outer.setAttribute("marker-start", `url(#kzf-m-${m.start})`);
        if (m.end !== "none") outer.setAttribute("marker-end", `url(#kzf-m-${m.end})`);
      }
      const hit = mkPath("kzf-edge-hit");
      g.appendChild(hit);
      hit.addEventListener("pointerdown", (ev) => {
        ev.stopPropagation();
        this.selectEdge(edge.id);
      });
      return g;
    }
    // ---- ノード操作 ----
    onNodeDown(e, id) {
      e.stopPropagation();
      e.preventDefault();
      if (this.connectMode) {
        this.handleConnectClick(id);
        return;
      }
      const additive = e.shiftKey || e.ctrlKey || e.metaKey;
      if (additive) {
        this.selectNode(id, true);
        return;
      }
      if (!(this.selNodes.has(id) && this.selNodes.size > 1)) this.selectNode(id);
      const anchor = this.diagram.nodes.find((n) => n.id === id);
      const groupIds = new Set(this.selNodes);
      const group = this.diagram.nodes.filter((n) => groupIds.has(n.id));
      const start = this.toScene(e.clientX, e.clientY);
      const ox = start.x - anchor.x;
      const oy = start.y - anchor.y;
      const rel = new Map(group.map((n) => [n.id, { dx: n.x - anchor.x, dy: n.y - anchor.y }]));
      let moved = false;
      const move = (ev) => {
        const p = this.toScene(ev.clientX, ev.clientY);
        const ap = this.placeAt(p.x - ox, p.y - oy, anchor.w, anchor.h);
        const cand = group.map((n) => {
          const r = rel.get(n.id);
          return { n, x: ap.x + r.dx, y: ap.y + r.dy };
        });
        const blocked = cand.some((c) => this.wouldOverlap(c.x, c.y, c.n.w, c.n.h, groupIds));
        if (blocked) return;
        for (const c of cand) {
          c.n.x = c.x;
          c.n.y = c.y;
          const g = this.nodeLayer.querySelector(`[data-node="${c.n.id}"]`);
          g == null ? void 0 : g.setAttribute("transform", `translate(${c.n.x} ${c.n.y})`);
          this.refreshEdgesOf(c.n.id);
        }
        moved = true;
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        if (moved) this.markDirty();
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    }
    refreshEdgesOf(nodeId) {
      const byId = new Map(this.diagram.nodes.map((n) => [n.id, n]));
      for (const edge of this.diagram.edges) {
        if (edge.from !== nodeId && edge.to !== nodeId) continue;
        const a = byId.get(edge.from);
        const b = byId.get(edge.to);
        if (!a || !b) continue;
        const g = this.edgeLayer.querySelector(`[data-edge="${edge.id}"]`);
        if (!g) continue;
        const d = this.edgePath(a, b, edge.routing || "elbow");
        g.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));
      }
    }
    // 1つ目クリック=始点、2つ目=終点。矢印は始点→終点（図のみ。レコードは変更しない）。
    handleConnectClick(id) {
      if (!this.connectSrc) {
        this.connectSrc = id;
        this.render();
        return;
      }
      if (this.connectSrc === id) {
        this.connectSrc = null;
        this.render();
        return;
      }
      const fromId = this.connectSrc;
      const toId = id;
      this.connectSrc = null;
      const exists = this.diagram.edges.some(
        (e) => e.from === fromId && e.to === toId || e.from === toId && e.to === fromId
      );
      if (!exists) this.addEdge(fromId, toId);
      this.render();
    }
    addEdge(fromId, toId) {
      const edge = {
        id: `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        from: fromId,
        to: toId,
        style: this.edgeDefaults.style,
        startMarker: this.edgeDefaults.startMarker,
        endMarker: this.edgeDefaults.endMarker,
        routing: this.edgeDefaults.routing,
        color: this.edgeDefaults.color
      };
      this.diagram.edges.push(edge);
      this.markDirty();
    }
    // 色フィールド：スウォッチ（color input）＋ #XXXXXX 直接入力。双方向同期。
    mkColorField(initial, onChange) {
      const wrap = el("div", "kzf-colorfield");
      const swatch = document.createElement("input");
      swatch.type = "color";
      swatch.className = "kzf-color";
      swatch.value = initial;
      const hex = document.createElement("input");
      hex.type = "text";
      hex.className = "kzf-hex";
      hex.maxLength = 7;
      hex.value = initial;
      hex.placeholder = "#RRGGBB";
      hex.spellcheck = false;
      swatch.addEventListener("input", () => {
        hex.value = swatch.value;
        onChange();
      });
      hex.addEventListener("input", () => {
        const n = normHex(hex.value);
        if (n) {
          swatch.value = n;
          onChange();
        }
      });
      hex.addEventListener("blur", () => {
        hex.value = swatch.value;
      });
      wrap.append(swatch, hex);
      return {
        el: wrap,
        get: () => swatch.value,
        set: (v) => {
          const n = normHex(v) || v;
          swatch.value = n;
          hex.value = n;
        }
      };
    }
    // 線ツール用の小さなセレクト
    mkLineSelect(options, selected) {
      const s = document.createElement("select");
      s.className = "kzf-linesel";
      for (const [v, t] of options) {
        const o = document.createElement("option");
        o.value = v;
        o.textContent = t;
        s.appendChild(o);
      }
      s.value = selected;
      return s;
    }
    toggleLinePop() {
      if (!this.linePop) return;
      if (this.linePop.style.display === "none") this.openLinePop();
      else this.closeLinePop();
    }
    openLinePop() {
      var _a;
      if (!this.linePop) return;
      this.linePop.style.display = "";
      (_a = this.caretBtn) == null ? void 0 : _a.classList.add("kzf-on");
    }
    closeLinePop() {
      var _a;
      if (!this.linePop) return;
      this.linePop.style.display = "none";
      (_a = this.caretBtn) == null ? void 0 : _a.classList.remove("kzf-on");
    }
    // ---- 文字ツール ----
    mkDecoBtn(label, cls, onClick) {
      const b = document.createElement("button");
      b.className = "kzf-decobtn " + cls;
      b.textContent = label;
      b.type = "button";
      b.addEventListener("click", onClick);
      return b;
    }
    toggleTextMode() {
      var _a;
      this.textMode = !this.textMode;
      (_a = this.textBtn) == null ? void 0 : _a.classList.toggle("kzf-on", this.textMode);
      this.svg.classList.toggle("kzf-text-mode", this.textMode);
      if (this.textMode) {
        if (this.connectMode) this.toggleConnect();
        if (this.marqueeMode) this.toggleMarquee();
        this.toast("\u30AD\u30E3\u30F3\u30D0\u30B9\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u6587\u5B57\u3092\u914D\u7F6E");
      }
    }
    toggleTextPop() {
      if (!this.textPop) return;
      if (this.textPop.style.display === "none") this.openTextPop();
      else this.closeTextPop();
    }
    openTextPop() {
      var _a;
      if (this.textPop) {
        this.textPop.style.display = "";
        (_a = this.textCaret) == null ? void 0 : _a.classList.add("kzf-on");
      }
    }
    closeTextPop() {
      var _a;
      if (this.textPop) {
        this.textPop.style.display = "none";
        (_a = this.textCaret) == null ? void 0 : _a.classList.remove("kzf-on");
      }
    }
    toggleDeco(which) {
      this.textDefaults[which] = !this.textDefaults[which];
      this.syncDecoButtons();
      this.applyTextStyleFromUi();
    }
    syncDecoButtons() {
      var _a, _b, _c;
      (_a = this.txtBold) == null ? void 0 : _a.classList.toggle("kzf-on", this.textDefaults.bold);
      (_b = this.txtItalic) == null ? void 0 : _b.classList.toggle("kzf-on", this.textDefaults.italic);
      (_c = this.txtUnderline) == null ? void 0 : _c.classList.toggle("kzf-on", this.textDefaults.underline);
    }
    applyTextStyleFromUi() {
      var _a, _b;
      this.textDefaults.fontSize = ((_a = this.txtSizeSel) == null ? void 0 : _a.value) || "m";
      this.textDefaults.color = ((_b = this.txtColor) == null ? void 0 : _b.get()) || "#2d3b45";
      if (this.selShape) {
        const sh = this.diagram.shapes.find((s) => s.id === this.selShape && s.type === "text");
        if (sh) {
          sh.fontSize = this.textDefaults.fontSize;
          sh.bold = this.textDefaults.bold;
          sh.italic = this.textDefaults.italic;
          sh.underline = this.textDefaults.underline;
          sh.color = this.textDefaults.color;
          this.markDirty();
          this.render();
        }
      }
    }
    loadTextUi(sh) {
      this.textDefaults = {
        fontSize: sh.fontSize || "m",
        bold: !!sh.bold,
        italic: !!sh.italic,
        underline: !!sh.underline,
        color: sh.color || "#2d3b45"
      };
      if (this.txtSizeSel) this.txtSizeSel.value = this.textDefaults.fontSize;
      if (this.txtColor) this.txtColor.set(this.textDefaults.color);
      this.syncDecoButtons();
    }
    /** アプリ内テキスト入力ダイアログ（サンドボックス環境で window.prompt が使えないため自前実装）。OKで文字列、キャンセルで null。 */
    promptText(title, initial) {
      return new Promise((resolve) => {
        const overlay = el("div", "kzf-overlay");
        const modal = el("div", "kzf-modal");
        const h = document.createElement("h3");
        h.textContent = title;
        const input = document.createElement("input");
        input.type = "text";
        input.className = "kzf-textinput";
        input.value = initial;
        const actions = el("div", "kzf-actions");
        const cancel = document.createElement("button");
        cancel.className = "kzf-ghost";
        cancel.type = "button";
        cancel.textContent = "\u30AD\u30E3\u30F3\u30BB\u30EB";
        const ok = document.createElement("button");
        ok.className = "kzf-primary";
        ok.type = "button";
        ok.textContent = "OK";
        actions.append(cancel, ok);
        modal.append(h, input, actions);
        overlay.appendChild(modal);
        this.canvasWrap.appendChild(overlay);
        let done = false;
        const close = (val) => {
          if (done) return;
          done = true;
          overlay.remove();
          resolve(val);
        };
        cancel.addEventListener("click", () => close(null));
        ok.addEventListener("click", () => close(input.value));
        input.addEventListener("keydown", (ev) => {
          ev.stopPropagation();
          if (ev.key === "Enter") {
            ev.preventDefault();
            close(input.value);
          } else if (ev.key === "Escape") {
            ev.preventDefault();
            close(null);
          }
        });
        overlay.addEventListener("pointerdown", (ev) => {
          if (ev.target === overlay) close(null);
        });
        setTimeout(() => {
          input.focus();
          input.select();
        }, 0);
      });
    }
    async placeText(scenePt) {
      const text = await this.promptText("\u30C6\u30AD\u30B9\u30C8\u3092\u5165\u529B", "\u30C6\u30AD\u30B9\u30C8");
      if (text == null || text === "") return;
      const pos = this.placeAt(scenePt.x, scenePt.y, 0, 0);
      const sh = {
        id: `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        type: "text",
        x: pos.x,
        y: pos.y,
        w: 0,
        h: 0,
        text,
        fontSize: this.textDefaults.fontSize,
        bold: this.textDefaults.bold,
        italic: this.textDefaults.italic,
        underline: this.textDefaults.underline,
        color: this.textDefaults.color
      };
      this.diagram.shapes.push(sh);
      this.markDirty();
      this.render();
    }
    // セレクトの値を、既定＋（選択中の線があれば）その線へ反映
    applyEdgeStyleFromUi() {
      var _a, _b, _c, _d, _e;
      const style = ((_a = this.lineSel) == null ? void 0 : _a.value) || "solid";
      const startMarker = ((_b = this.startSel) == null ? void 0 : _b.value) || "none";
      const endMarker = ((_c = this.endSel) == null ? void 0 : _c.value) || "none";
      const routing = ((_d = this.routeSel) == null ? void 0 : _d.value) || "elbow";
      const color = ((_e = this.lineColor) == null ? void 0 : _e.get()) || "#8595a0";
      this.edgeDefaults = { style, startMarker, endMarker, routing, color };
      if (this.selEdge) {
        const edge = this.diagram.edges.find((e) => e.id === this.selEdge);
        if (edge) {
          edge.style = style;
          edge.startMarker = startMarker;
          edge.endMarker = endMarker;
          edge.routing = routing;
          edge.color = color;
          this.markDirty();
          this.render();
        }
      }
    }
    // 選択中の線の設定をセレクトに読み込む
    loadEdgeUi(edge) {
      const m = resolveMarkers(edge);
      if (this.lineSel) this.lineSel.value = edge.style || "solid";
      if (this.startSel) this.startSel.value = m.start;
      if (this.endSel) this.endSel.value = m.end;
      if (this.routeSel) this.routeSel.value = edge.routing || "elbow";
      if (this.lineColor) this.lineColor.set(edge.color || "#8595a0");
    }
    toggleConnect() {
      var _a, _b;
      this.connectMode = !this.connectMode;
      this.connectSrc = null;
      this.connectBtn.classList.toggle("kzf-on", this.connectMode);
      this.svg.classList.toggle("kzf-connect", this.connectMode);
      if (this.connectMode && this.textMode) {
        this.textMode = false;
        (_a = this.textBtn) == null ? void 0 : _a.classList.remove("kzf-on");
        this.svg.classList.remove("kzf-text-mode");
      }
      if (this.connectMode && this.marqueeMode) {
        this.marqueeMode = false;
        (_b = this.marqueeBtn) == null ? void 0 : _b.classList.remove("kzf-on");
        this.svg.classList.remove("kzf-marquee-mode");
      }
      this.clearSelection();
      this.render();
      if (this.connectMode) {
        this.toast("\u3064\u306A\u30502\u3064\u306E\u30CE\u30FC\u30C9\u3092\u9806\u306B\u30AF\u30EA\u30C3\u30AF");
      }
    }
    toggleSnap() {
      if (this.shaped) return;
      this.snapEnabled = !this.snapEnabled;
      if (this.snapBtn) {
        this.snapBtn.textContent = `\u30B0\u30EA\u30C3\u30C9: ${this.snapEnabled ? "ON" : "OFF"}`;
        this.snapBtn.classList.toggle("kzf-on", this.snapEnabled);
      }
      if (this.snapEnabled) {
        for (const n of this.diagram.nodes) {
          const pos = this.placeAt(n.x, n.y, n.w, n.h);
          n.x = pos.x;
          n.y = pos.y;
        }
        this.markDirty();
        this.render();
      }
    }
    selectNode(id, additive = false) {
      if (additive) {
        if (this.selNodes.has(id)) this.selNodes.delete(id);
        else this.selNodes.add(id);
      } else {
        this.selNodes.clear();
        this.selNodes.add(id);
      }
      this.selEdge = null;
      this.selShape = null;
      this.delBtn.disabled = this.selNodes.size === 0;
      this.render();
    }
    selectAllNodes() {
      this.selNodes = new Set(this.diagram.nodes.map((n) => n.id));
      this.selEdge = null;
      this.selShape = null;
      this.delBtn.disabled = this.selNodes.size === 0;
      this.render();
    }
    selectEdge(id) {
      this.selEdge = id;
      this.selNodes.clear();
      this.selShape = null;
      this.delBtn.disabled = false;
      const edge = this.diagram.edges.find((e) => e.id === id);
      if (edge) {
        this.loadEdgeUi(edge);
        this.openLinePop();
      }
      this.render();
    }
    clearSelection() {
      this.selNodes.clear();
      this.selEdge = null;
      this.selShape = null;
      this.delBtn.disabled = true;
    }
    deleteSelection() {
      if (this.selNodes.size) {
        const ids = this.selNodes;
        this.diagram.nodes = this.diagram.nodes.filter((n) => !ids.has(n.id));
        this.diagram.edges = this.diagram.edges.filter((e) => !ids.has(e.from) && !ids.has(e.to));
      } else if (this.selEdge) {
        this.diagram.edges = this.diagram.edges.filter((e) => e.id !== this.selEdge);
      } else if (this.selShape) {
        this.diagram.shapes = this.diagram.shapes.filter((s) => s.id !== this.selShape);
      } else return;
      this.clearSelection();
      this.markDirty();
      this.render();
      this.renderPalette();
    }
    async save() {
      this.diagram.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      this.diagram.view = { zoom: 1, panX: this.vb.x, panY: this.vb.y };
      try {
        await this.provider.saveDiagram(this.diagram);
      } catch (err) {
        console.error("[kintone-zu] \u4FDD\u5B58\u306B\u5931\u6557", err);
        this.toast("\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F\uFF08\u6A29\u9650/\u30D5\u30A3\u30FC\u30EB\u30C9\u69CB\u6210\u3092\u78BA\u8A8D\uFF09");
        return;
      }
      this.dirty = false;
      this.toast("\u4FDD\u5B58\u3057\u307E\u3057\u305F");
      this.updateStatus();
    }
    markDirty() {
      this.dirty = true;
      this.updateStatus();
    }
    updateStatus() {
      const n = this.diagram.nodes.length;
      const e = this.diagram.edges.length;
      const sel = this.selNodes.size > 1 ? `\u3000\u9078\u629E\u4E2D ${this.selNodes.size}` : "";
      this.statusEl.textContent = `\u30CE\u30FC\u30C9 ${n} / \u7DDA ${e}${sel}\u3000\u4FDD\u5B58\u5148: ${this.provider.label}` + (this.dirty ? "\uFF08\u672A\u4FDD\u5B58\u306E\u5909\u66F4\u3042\u308A\uFF09" : "");
    }
    // ---- パン/ズーム ----
    applyVB() {
      this.svg.setAttribute("viewBox", `${this.vb.x} ${this.vb.y} ${this.vb.w} ${this.vb.h}`);
      this.updateZoomUi();
    }
    /** 配置物の外接矩形（余白込み）。無ければ既定サイズ。 */
    contentBox() {
      if (this.diagram.nodes.length === 0) return { x: 0, y: 0, w: 1e3, h: 560 };
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const n of this.diagram.nodes) {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + n.w);
        maxY = Math.max(maxY, n.y + n.h);
      }
      const pad = 60;
      return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
    }
    /** 全体表示：配置物全体がちょうど収まる倍率にする。 */
    fit() {
      this.vb = this.contentBox();
      this.fitW = this.vb.w;
      this.fitH = this.vb.h;
      this.applyVB();
      this.updateZoomUi();
    }
    /** 初期表示：ノードを一定サイズで表示し、配置物の左上を起点にする（フィットのように拡大しすぎない）。 */
    baselineView(tries = 0) {
      const cb = this.contentBox();
      this.fitW = cb.w;
      this.fitH = cb.h;
      const r = this.svg.getBoundingClientRect();
      let vpW = r.width, vpH = r.height;
      if ((!vpW || !vpH) && tries < 10) {
        requestAnimationFrame(() => this.baselineView(tries + 1));
        return;
      }
      if (!vpW || !vpH) {
        vpW = 1200;
        vpH = 620;
      }
      const TARGET_PX = 120;
      const scale = TARGET_PX / this.nodeW();
      const w = vpW / scale, h = vpH / scale;
      let x = 0, y = 0;
      if (this.diagram.nodes.length) {
        let minX = Infinity, minY = Infinity;
        for (const n of this.diagram.nodes) {
          minX = Math.min(minX, n.x);
          minY = Math.min(minY, n.y);
        }
        const m = this.nodeW() * 0.5;
        x = minX - m;
        y = minY - m;
      }
      this.vb = { x, y, w, h };
      this.applyVB();
      this.updateZoomUi();
    }
    // ===== 印刷（ページ境界プレビュー＋分割印刷） =====
    buildPrintPanel() {
      const p = el("div", "kzf-printpanel");
      p.style.display = "none";
      const row = (label, opts, val, on) => {
        const wr = el("label", "kzf-pp-row");
        wr.append(spanText("kzf-pp-lb", label));
        const s = document.createElement("select");
        s.className = "kzf-pp-sel";
        for (const [v, t] of opts) {
          const o = document.createElement("option");
          o.value = v;
          o.textContent = t;
          if (v === val) o.selected = true;
          s.appendChild(o);
        }
        s.addEventListener("change", () => on(s.value));
        wr.append(s);
        return wr;
      };
      this.printCountEl = spanText("kzf-pp-count", "\u2014");
      const actions = el("div", "kzf-pp-actions");
      actions.append(this.printCountEl, btn("\u5370\u5237\u3059\u308B", () => this.doPrint()), btn("\u9589\u3058\u308B", () => this.togglePrint(false)));
      p.append(
        spanText("kzf-pp-title", "\u5370\u5237\uFF08A4\u306A\u3069\u306B\u5206\u5272\uFF09"),
        row("\u7528\u7D19", [["A4", "A4"], ["A3", "A3"]], this.printPaper, (v) => {
          this.printPaper = v;
          this.renderPageGrid();
        }),
        row("\u5411\u304D", [["land", "\u6A2A"], ["port", "\u7E26"]], this.printOrient, (v) => {
          this.printOrient = v;
          this.renderPageGrid();
        }),
        row("\u7E2E\u5C3A", [["0.5", "50%"], ["0.75", "75%"], ["1", "100%"], ["1.25", "125%"], ["1.5", "150%"]], String(this.printScale), (v) => {
          this.printScale = Number(v);
          this.renderPageGrid();
        }),
        actions
      );
      this.printPanel = p;
      return p;
    }
    togglePrint(force) {
      this.printOn = force === void 0 ? !this.printOn : force;
      if (this.printPanel) this.printPanel.style.display = this.printOn ? "" : "none";
      this.renderPageGrid();
    }
    /** 印刷の基準矩形＝配置物の外接矩形（原点＝左上）。余白は付けない。 */
    printBox() {
      if (!this.diagram.nodes.length) return { x: 0, y: 0, w: 800, h: 600 };
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const n of this.diagram.nodes) {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + n.w);
        maxY = Math.max(maxY, n.y + n.h);
      }
      return { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
    }
    printTiles() {
      const paper = this.printPaper === "A3" ? [297, 420] : [210, 297];
      const [pw, ph] = this.printOrient === "port" ? paper : [paper[1], paper[0]];
      const s = this.printScale, PXMM = 96 / 25.4, M = 10, HD = 8;
      const uWmm = pw - M * 2, uHmm = ph - M * 2 - HD;
      const stepW = uWmm * PXMM / s, stepH = uHmm * PXMM / s;
      const cb = this.printBox();
      const cols = Math.max(1, Math.ceil(cb.w / stepW)), rows = Math.max(1, Math.ceil(cb.h / stepH));
      return { pw, ph, s, uWmm, uHmm, stepW, stepH, cols, rows, ox: cb.x, oy: cb.y };
    }
    /** ページ境界オーバーレイをシーンに描く（印刷パネル表示中のみ）。 */
    renderPageGrid() {
      if (!this.printLayer) return;
      if (!this.printOn) {
        this.printLayer.innerHTML = "";
        return;
      }
      const t = this.printTiles(), total = t.cols * t.rows;
      const lf = Math.max(16, t.stepW * 0.028);
      let g = "";
      for (let r = 0; r < t.rows; r++) for (let c = 0; c < t.cols; c++) {
        const x = t.ox + c * t.stepW, y = t.oy + r * t.stepH;
        g += `<rect class="kzf-pgfill" x="${x}" y="${y}" width="${t.stepW}" height="${t.stepH}"/><rect class="kzf-pgline" x="${x}" y="${y}" width="${t.stepW}" height="${t.stepH}"/><text class="kzf-pglabel" x="${x + lf * 0.5}" y="${y + lf * 1.4}" font-size="${lf}">${r + 1}-${c + 1}\uFF08${r * t.cols + c + 1}/${total}\uFF09</text>`;
      }
      this.printLayer.innerHTML = g;
      if (this.printCountEl) this.printCountEl.textContent = `${total}\u679A\uFF08\u6A2A${t.cols}\xD7\u7E26${t.rows}\uFF09`;
    }
    /** 別ウィンドウにページを並べて印刷する。 */
    doPrint() {
      const t = this.printTiles(), total = t.cols * t.rows;
      const content = this.edgeLayer.outerHTML + this.nodeLayer.outerHTML + this.shapeLayer.outerHTML;
      const paperName = this.printPaper + (this.printOrient === "port" ? "\u7E26" : "\u6A2A");
      const today = (/* @__PURE__ */ new Date()).toLocaleDateString("ja-JP");
      let pages = "";
      for (let r = 0; r < t.rows; r++) for (let c = 0; c < t.cols; c++) {
        const x0 = t.ox + c * t.stepW, y0 = t.oy + r * t.stepH, k = r * t.cols + c + 1;
        pages += `<div class="pp"><div class="pp-in"><div class="pp-head"><span>${paperName}\u30FB${Math.round(t.s * 100)}%\u30FB${today}</span><span>\u30DA\u30FC\u30B8 ${r + 1}-${c + 1} \uFF0F ${k}/${total}</span></div><svg class="pp-svg" xmlns="${SVG_NS2}" width="${t.uWmm}mm" height="${t.uHmm}mm" viewBox="${x0} ${y0} ${t.stepW} ${t.stepH}" preserveAspectRatio="xMinYMin meet"><rect x="${x0}" y="${y0}" width="${t.stepW}" height="${t.stepH}" fill="#ffffff"/>${content}</svg></div></div>`;
      }
      const w = window.open("", "_blank");
      if (!w) {
        this.toast("\u30DD\u30C3\u30D7\u30A2\u30C3\u30D7\u304C\u30D6\u30ED\u30C3\u30AF\u3055\u308C\u307E\u3057\u305F\u3002\u5370\u5237\u3059\u308B\u306B\u306F\u8A31\u53EF\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        return;
      }
      w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>\u5370\u5237</title><style>${FREE_CSS}
@page{ size:${t.pw}mm ${t.ph}mm; margin:0; }
html,body{margin:0;background:#fff;}
.pp{width:${t.pw}mm;height:${t.ph}mm;overflow:hidden;page-break-after:always;}
.pp:last-child{page-break-after:auto;}
.pp-in{box-sizing:border-box;width:100%;height:100%;padding:10mm;display:flex;flex-direction:column;}
.pp-head{font-size:9pt;color:#44555f;border-bottom:1px solid #ccc;padding-bottom:2mm;margin-bottom:2mm;display:flex;justify-content:space-between;}
.pp-svg{flex:1;}
.kzf-open{display:none;}
</style></head><body>${pages}</body></html>`);
      w.document.close();
      w.focus();
      setTimeout(() => {
        try {
          w.print();
        } catch {
        }
      }, 400);
    }
    buildZoomBar() {
      const bar = el("div", "kzf-zoombar");
      const plus = document.createElement("button");
      plus.className = "kzf-zbtn";
      plus.textContent = "\uFF0B";
      plus.addEventListener("click", () => this.zoomStep(1));
      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "20";
      slider.max = "400";
      slider.value = "100";
      slider.className = "kzf-zslider";
      slider.addEventListener("input", () => this.applyZoomPct(Number(slider.value)));
      const minus = document.createElement("button");
      minus.className = "kzf-zbtn";
      minus.textContent = "\u2212";
      minus.addEventListener("click", () => this.zoomStep(-1));
      const label = el("div", "kzf-zlabel");
      label.textContent = "100%";
      bar.append(plus, slider, minus, label);
      this.zoomSlider = slider;
      this.zoomLabel = label;
      return bar;
    }
    zoomPct() {
      return this.fitW > 0 ? Math.round(this.fitW / this.vb.w * 100) : 100;
    }
    applyZoomPct(pct) {
      const p = Math.min(400, Math.max(20, pct));
      const cx = this.vb.x + this.vb.w / 2, cy = this.vb.y + this.vb.h / 2;
      const nw = this.fitW * 100 / p, nh = this.fitH * 100 / p;
      this.vb = { x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh };
      this.applyVB();
    }
    zoomStep(dir) {
      this.applyZoomPct(this.zoomPct() * (dir > 0 ? 1.25 : 0.8));
    }
    updateZoomUi() {
      const p = this.zoomPct();
      if (this.zoomSlider) this.zoomSlider.value = String(Math.min(400, Math.max(20, p)));
      if (this.zoomLabel) this.zoomLabel.textContent = p + "%";
    }
    toScene(cx, cy) {
      const r = this.svg.getBoundingClientRect();
      const scale = Math.min(r.width / this.vb.w, r.height / this.vb.h);
      const offX = (r.width - this.vb.w * scale) / 2;
      const offY = (r.height - this.vb.h * scale) / 2;
      return { x: this.vb.x + (cx - r.left - offX) / scale, y: this.vb.y + (cy - r.top - offY) / scale };
    }
    onWheel(e) {
      e.preventDefault();
      const f = e.deltaY < 0 ? 0.9 : 1 / 0.9;
      const p = this.toScene(e.clientX, e.clientY);
      this.vb.x = p.x - (p.x - this.vb.x) * f;
      this.vb.y = p.y - (p.y - this.vb.y) * f;
      this.vb.w *= f;
      this.vb.h *= f;
      this.applyVB();
    }
    onBgDown(e) {
      if (this.textMode) {
        const pt = this.toScene(e.clientX, e.clientY);
        void this.placeText(pt);
        return;
      }
      if (this.connectMode) {
        this.connectSrc = null;
        this.render();
      }
      if (this.marqueeMode) {
        this.startMarquee(e);
        return;
      }
      this.clearSelection();
      this.render();
      this.panning = true;
      this.panLast = { x: e.clientX, y: e.clientY };
      this.svg.classList.add("kzf-pan");
    }
    /** 範囲選択（ラバーバンド）。矩形に交差するノードをまとめて選択する。 */
    startMarquee(e) {
      const additive = e.shiftKey || e.ctrlKey || e.metaKey;
      if (!additive) {
        this.selNodes.clear();
        this.selEdge = null;
        this.selShape = null;
      }
      const start = this.toScene(e.clientX, e.clientY);
      const rect = document.createElementNS(SVG_NS2, "rect");
      rect.setAttribute("class", "kzf-marquee");
      this.scene.appendChild(rect);
      const box = { x: start.x, y: start.y, w: 0, h: 0 };
      const apply = (ev) => {
        const p = this.toScene(ev.clientX, ev.clientY);
        box.x = Math.min(start.x, p.x);
        box.y = Math.min(start.y, p.y);
        box.w = Math.abs(p.x - start.x);
        box.h = Math.abs(p.y - start.y);
        rect.setAttribute("x", String(box.x));
        rect.setAttribute("y", String(box.y));
        rect.setAttribute("width", String(box.w));
        rect.setAttribute("height", String(box.h));
      };
      const up = () => {
        window.removeEventListener("pointermove", apply);
        window.removeEventListener("pointerup", up);
        rect.remove();
        for (const n of this.diagram.nodes) {
          if (box.x < n.x + n.w && box.x + box.w > n.x && box.y < n.y + n.h && box.y + box.h > n.y) {
            this.selNodes.add(n.id);
          }
        }
        this.delBtn.disabled = this.selNodes.size === 0;
        this.render();
      };
      window.addEventListener("pointermove", apply);
      window.addEventListener("pointerup", up);
    }
    toggleMarquee() {
      var _a, _b;
      this.marqueeMode = !this.marqueeMode;
      (_a = this.marqueeBtn) == null ? void 0 : _a.classList.toggle("kzf-on", this.marqueeMode);
      this.svg.classList.toggle("kzf-marquee-mode", this.marqueeMode);
      if (this.marqueeMode) {
        if (this.connectMode) this.toggleConnect();
        if (this.textMode) {
          this.textMode = false;
          (_b = this.textBtn) == null ? void 0 : _b.classList.remove("kzf-on");
          this.svg.classList.remove("kzf-text-mode");
        }
        this.toast("\u30C9\u30E9\u30C3\u30B0\u3067\u7BC4\u56F2\u9078\u629E\uFF08Shift\u3067\u8FFD\u52A0\u9078\u629E\uFF09");
      }
    }
    bindPan() {
      window.addEventListener("pointermove", (e) => {
        if (!this.panning) return;
        const r = this.svg.getBoundingClientRect();
        const scale = Math.min(r.width / this.vb.w, r.height / this.vb.h);
        this.vb.x -= (e.clientX - this.panLast.x) / scale;
        this.vb.y -= (e.clientY - this.panLast.y) / scale;
        this.panLast = { x: e.clientX, y: e.clientY };
        this.applyVB();
      });
      window.addEventListener("pointerup", () => {
        this.panning = false;
        this.svg.classList.remove("kzf-pan");
      });
    }
    toast(msg) {
      this.toastEl.textContent = msg;
      this.toastEl.classList.add("kzf-show");
      window.clearTimeout(this.toastTimer);
      this.toastTimer = window.setTimeout(() => this.toastEl.classList.remove("kzf-show"), 2600);
    }
  };
  function truncate(s, max) {
    if (!s) return "";
    return s.length > max ? s.slice(0, Math.max(1, max - 1)) + "\u2026" : s;
  }
  function tint(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return "#eef5fb";
    const r = parseInt(m[1].slice(0, 2), 16), g = parseInt(m[1].slice(2, 4), 16), b = parseInt(m[1].slice(4, 6), 16);
    const mix = (c) => Math.round(c + (255 - c) * 0.86);
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
  }
  function el(tag, cls) {
    const e = document.createElement(tag);
    e.className = cls;
    return e;
  }
  function spanText(cls, text) {
    const s = el("span", cls);
    s.textContent = text;
    return s;
  }
  function gEl() {
    return document.createElementNS(SVG_NS2, "g");
  }
  var ICONS = {
    grid: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="2.5" width="11" height="11" rx="1"/><path d="M2.5 6.2H13.5M2.5 9.8H13.5M6.2 2.5V13.5M9.8 2.5V13.5"/></svg>`,
    line: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4.5 11.5 11.5 4.5"/><circle cx="4.5" cy="11.5" r="1.6" fill="currentColor" stroke="none"/><circle cx="11.5" cy="4.5" r="1.6" fill="currentColor" stroke="none"/></svg>`,
    text: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M4 4H12M8 4V12.5M6.3 12.5H9.7"/></svg>`,
    select: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="2.5" width="11" height="11" rx="1" stroke-dasharray="2.2 2"/></svg>`,
    trash: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5H13M6 4.5V3H10V4.5M4.5 4.5 5.2 13H10.8L11.5 4.5M7 7V11M9 7V11"/></svg>`,
    fit: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6V3H6M10 3H13V6M13 10V13H10M6 13H3V10"/></svg>`,
    fullscreen: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 6.5 13 3M13 3H10M13 3V6"/><path d="M6.5 9.5 3 13M3 13H6M3 13V10"/></svg>`,
    save: `<svg class="kzf-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.5V9.5M5.3 6.8 8 9.5 10.7 6.8"/><path d="M3 11.5V13H13V11.5"/></svg>`
  };
  function btn(label, onClick, icon) {
    const b = document.createElement("button");
    b.className = "kzf-btn";
    b.type = "button";
    if (icon) {
      b.classList.add("kzf-iconbtn");
      b.innerHTML = icon;
      const s = document.createElement("span");
      s.className = "kzf-btn-label";
      s.textContent = label;
      b.appendChild(s);
    } else {
      b.textContent = label;
    }
    b.addEventListener("click", onClick);
    return b;
  }
  function resolveMarkers(edge) {
    var _a, _b;
    const legacyEnd = edge.arrow === "none" ? "none" : "arrow";
    const legacyStart = edge.arrow === "both" ? "arrow" : "none";
    return {
      start: (_a = edge.startMarker) != null ? _a : legacyStart,
      end: (_b = edge.endMarker) != null ? _b : legacyEnd
    };
  }
  function buildEdgeMarkers() {
    const NS = "http://www.w3.org/2000/svg";
    const COLOR = "#8595a0";
    const mk = (id, build) => {
      const m = document.createElementNS(NS, "marker");
      m.setAttribute("id", id);
      m.setAttribute("viewBox", "0 0 12 12");
      m.setAttribute("refX", "10");
      m.setAttribute("refY", "6");
      m.setAttribute("markerWidth", "8");
      m.setAttribute("markerHeight", "8");
      m.setAttribute("orient", "auto-start-reverse");
      build(m);
      return m;
    };
    const path = (d, fill, stroke = "none") => {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", fill);
      if (stroke !== "none") {
        p.setAttribute("stroke", stroke);
        p.setAttribute("fill", "none");
        p.setAttribute("stroke-width", "1.6");
      }
      return p;
    };
    const arrow = mk("kzf-m-arrow", (m) => m.appendChild(path("M1 1 L11 6 L1 11 z", COLOR)));
    const openArrow = mk("kzf-m-openArrow", (m) => {
      m.setAttribute("refX", "10");
      m.appendChild(path("M1 1 L11 6 L1 11", "none", COLOR));
    });
    const dot = mk("kzf-m-dot", (m) => {
      m.setAttribute("refX", "6");
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", "6");
      c.setAttribute("cy", "6");
      c.setAttribute("r", "4");
      c.setAttribute("fill", COLOR);
      m.appendChild(c);
    });
    const box = mk("kzf-m-box", (m) => {
      m.setAttribute("refX", "6");
      const r = document.createElementNS(NS, "rect");
      r.setAttribute("x", "2");
      r.setAttribute("y", "2");
      r.setAttribute("width", "8");
      r.setAttribute("height", "8");
      r.setAttribute("fill", COLOR);
      m.appendChild(r);
    });
    return [arrow, openArrow, dot, box];
  }

  // demo/free-demo.ts
  var DemoFreeProvider = class {
    constructor(recs) {
      this.recs = recs;
      this.writable = true;
      this.label = "\u30C7\u30E2\uFF08\u30E1\u30E2\u30EA\u5185\u30FBkintone\u306B\u306F\u4FDD\u5B58\u3057\u307E\u305B\u3093\uFF09";
    }
    async loadRecords() {
      return this.recs.map((r) => ({ ...r, subs: r.subs.map((s) => ({ ...s })) }));
    }
    async loadDiagram() {
      return null;
    }
    async saveDiagram(_d) {
    }
    recordUrl(_recordId) {
      return "#demo-record";
    }
  };
  var host = document.getElementById("app");
  if (host) {
    const st = window.__KZF_SHEET__;
    const sheetType = st === "square" || st === "circle" || st === "honeycomb" ? st : "normal";
    new FreeEditor(host, new DemoFreeProvider(FREE_DEMO_RECORDS), 0, {
      openInNewTab: true,
      sheetType
    }).mount().catch((e) => {
      console.error(e);
      host.textContent = "\u30C7\u30E2\u306E\u521D\u671F\u5316\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002";
    });
  }
})();
