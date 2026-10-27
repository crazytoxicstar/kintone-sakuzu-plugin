// 自動生成: サンプル配置マスタ（単体デモ用）。編集しないこと。
// 汎用ツリーの素材として、元アプリの任意フィールドを持つ生レコードを表す。
export interface DemoRecord {
  recordId: string;
  haichiId: string;
  shainNo: string;
  name: string;
  deptCode: string;
  deptName: string;
  posName: string;
  bossHaichiId: string;
  assignType: string;
  effort: string;
}

export const DEMO_ASSIGNMENTS: DemoRecord[] = [
  {
    "recordId": "1",
    "haichiId": "A001",
    "shainNo": "E001",
    "name": "佐藤 一郎",
    "deptCode": "D001",
    "deptName": "経営",
    "posName": "代表取締役社長",
    "bossHaichiId": "",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "2",
    "haichiId": "A002",
    "shainNo": "E002",
    "name": "鈴木 健治",
    "deptCode": "D100",
    "deptName": "経営管理本部",
    "posName": "本部長",
    "bossHaichiId": "A001",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "3",
    "haichiId": "A003",
    "shainNo": "E003",
    "name": "高橋 正人",
    "deptCode": "D200",
    "deptName": "営業本部",
    "posName": "本部長",
    "bossHaichiId": "A001",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "4",
    "haichiId": "A004",
    "shainNo": "E004",
    "name": "田中 洋子",
    "deptCode": "D300",
    "deptName": "開発本部",
    "posName": "本部長",
    "bossHaichiId": "A001",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "5",
    "haichiId": "A005",
    "shainNo": "E005",
    "name": "伊藤 真由美",
    "deptCode": "D110",
    "deptName": "人事総務部",
    "posName": "部長",
    "bossHaichiId": "A002",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "6",
    "haichiId": "A006",
    "shainNo": "E006",
    "name": "渡辺 隆",
    "deptCode": "D120",
    "deptName": "経理財務部",
    "posName": "部長",
    "bossHaichiId": "A002",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "7",
    "haichiId": "A007",
    "shainNo": "E007",
    "name": "山本 大輔",
    "deptCode": "D210",
    "deptName": "第一営業部",
    "posName": "部長",
    "bossHaichiId": "A003",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "8",
    "haichiId": "A008",
    "shainNo": "E008",
    "name": "中村 恵",
    "deptCode": "D220",
    "deptName": "第二営業部",
    "posName": "部長",
    "bossHaichiId": "A003",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "9",
    "haichiId": "A009",
    "shainNo": "E009",
    "name": "小林 誠",
    "deptCode": "D310",
    "deptName": "プロダクト開発部",
    "posName": "部長",
    "bossHaichiId": "A004",
    "assignType": "主務",
    "effort": "80"
  },
  {
    "recordId": "10",
    "haichiId": "A010",
    "shainNo": "E010",
    "name": "加藤 彩",
    "deptCode": "D320",
    "deptName": "品質保証部",
    "posName": "部長",
    "bossHaichiId": "A004",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "11",
    "haichiId": "A011",
    "shainNo": "E011",
    "name": "吉田 直樹",
    "deptCode": "D110",
    "deptName": "人事総務部",
    "posName": "課長",
    "bossHaichiId": "A005",
    "assignType": "主務",
    "effort": "70"
  },
  {
    "recordId": "12",
    "haichiId": "A012",
    "shainNo": "E012",
    "name": "山田 彩香",
    "deptCode": "D110",
    "deptName": "人事総務部",
    "posName": "主任",
    "bossHaichiId": "A011",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "13",
    "haichiId": "A013",
    "shainNo": "E013",
    "name": "佐々木 亮",
    "deptCode": "D110",
    "deptName": "人事総務部",
    "posName": "一般",
    "bossHaichiId": "A011",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "14",
    "haichiId": "A014",
    "shainNo": "E014",
    "name": "山口 聡",
    "deptCode": "D120",
    "deptName": "経理財務部",
    "posName": "課長",
    "bossHaichiId": "A006",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "15",
    "haichiId": "A015",
    "shainNo": "E015",
    "name": "松本 佳奈",
    "deptCode": "D120",
    "deptName": "経理財務部",
    "posName": "一般",
    "bossHaichiId": "A014",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "16",
    "haichiId": "A016",
    "shainNo": "E016",
    "name": "井上 拓也",
    "deptCode": "D210",
    "deptName": "第一営業部",
    "posName": "課長",
    "bossHaichiId": "A007",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "17",
    "haichiId": "A017",
    "shainNo": "E017",
    "name": "木村 直人",
    "deptCode": "D210",
    "deptName": "第一営業部",
    "posName": "係長",
    "bossHaichiId": "A016",
    "assignType": "主務",
    "effort": "70"
  },
  {
    "recordId": "18",
    "haichiId": "A018",
    "shainNo": "E018",
    "name": "林 美咲",
    "deptCode": "D210",
    "deptName": "第一営業部",
    "posName": "一般",
    "bossHaichiId": "A016",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "19",
    "haichiId": "A019",
    "shainNo": "E019",
    "name": "清水 翔太",
    "deptCode": "D210",
    "deptName": "第一営業部",
    "posName": "一般",
    "bossHaichiId": "A016",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "20",
    "haichiId": "A020",
    "shainNo": "E020",
    "name": "斎藤 由香",
    "deptCode": "D220",
    "deptName": "第二営業部",
    "posName": "課長",
    "bossHaichiId": "A008",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "21",
    "haichiId": "A021",
    "shainNo": "E021",
    "name": "森 健太",
    "deptCode": "D220",
    "deptName": "第二営業部",
    "posName": "主任",
    "bossHaichiId": "A020",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "22",
    "haichiId": "A022",
    "shainNo": "E022",
    "name": "池田 奈々",
    "deptCode": "D220",
    "deptName": "第二営業部",
    "posName": "一般",
    "bossHaichiId": "A020",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "23",
    "haichiId": "A023",
    "shainNo": "E023",
    "name": "橋本 剛",
    "deptCode": "D310",
    "deptName": "プロダクト開発部",
    "posName": "課長",
    "bossHaichiId": "A009",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "24",
    "haichiId": "A024",
    "shainNo": "E024",
    "name": "山崎 涼",
    "deptCode": "D310",
    "deptName": "プロダクト開発部",
    "posName": "係長",
    "bossHaichiId": "A023",
    "assignType": "主務",
    "effort": "80"
  },
  {
    "recordId": "25",
    "haichiId": "A025",
    "shainNo": "E025",
    "name": "阿部 千尋",
    "deptCode": "D310",
    "deptName": "プロダクト開発部",
    "posName": "主任",
    "bossHaichiId": "A023",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "26",
    "haichiId": "A026",
    "shainNo": "E026",
    "name": "森田 悠",
    "deptCode": "D310",
    "deptName": "プロダクト開発部",
    "posName": "一般",
    "bossHaichiId": "A023",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "27",
    "haichiId": "A027",
    "shainNo": "E027",
    "name": "藤田 莉子",
    "deptCode": "D310",
    "deptName": "プロダクト開発部",
    "posName": "一般",
    "bossHaichiId": "A023",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "28",
    "haichiId": "A028",
    "shainNo": "E028",
    "name": "岡田 浩二",
    "deptCode": "D320",
    "deptName": "品質保証部",
    "posName": "課長",
    "bossHaichiId": "A010",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "29",
    "haichiId": "A029",
    "shainNo": "E029",
    "name": "後藤 麻衣",
    "deptCode": "D320",
    "deptName": "品質保証部",
    "posName": "主任",
    "bossHaichiId": "A028",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "30",
    "haichiId": "A030",
    "shainNo": "E030",
    "name": "村上 隼",
    "deptCode": "D320",
    "deptName": "品質保証部",
    "posName": "一般",
    "bossHaichiId": "A028",
    "assignType": "主務",
    "effort": "100"
  },
  {
    "recordId": "31",
    "haichiId": "A031",
    "shainNo": "E009",
    "name": "小林 誠",
    "deptCode": "D320",
    "deptName": "品質保証部",
    "posName": "課長",
    "bossHaichiId": "A010",
    "assignType": "兼務",
    "effort": "20"
  },
  {
    "recordId": "32",
    "haichiId": "A032",
    "shainNo": "E017",
    "name": "木村 直人",
    "deptCode": "D220",
    "deptName": "第二営業部",
    "posName": "係長",
    "bossHaichiId": "A020",
    "assignType": "兼務",
    "effort": "30"
  },
  {
    "recordId": "33",
    "haichiId": "A033",
    "shainNo": "E011",
    "name": "吉田 直樹",
    "deptCode": "D120",
    "deptName": "経理財務部",
    "posName": "課長",
    "bossHaichiId": "A006",
    "assignType": "兼務",
    "effort": "30"
  },
  {
    "recordId": "34",
    "haichiId": "A034",
    "shainNo": "E024",
    "name": "山崎 涼",
    "deptCode": "D320",
    "deptName": "品質保証部",
    "posName": "係長",
    "bossHaichiId": "A028",
    "assignType": "兼務",
    "effort": "20"
  }
];
