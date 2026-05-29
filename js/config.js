const SPREADSHEET_ID = "10D09i82E_lwGeX51MhkfDTIdxvsOEaKRJWl3ttI6NZM";

const DEPT_ORDER = [
  "財務経理部", "経営企画部", "総務部",
  "街づくり事業部", "街づくり開発部", "建築部", "施工管理部",
  "住宅営業部", "注文住宅部", "感動デザイン部", "リノベ事業部",
  "be naked事業室",
  "福岡支店（リノベ事業部・開発事業部・管理部）",
  "Good and", "Goodies", "ハローはちどり不動産", "エレキャスリゾート",
  "経営メンバー（TK7)+監査役",
  "拓匠分譲VOLTEKKERS", "匠に拓く委員会", "SANSUKE", "新組/鮮組",
  "本能に、感動を。の会"
];

// 表示名 → シート名のマッピング（差異がある場合のみ）
const SHEET_NAME_MAP = {
  "新組/鮮組": "新組鮮組"
};

function getSheetName(deptName) {
  return SHEET_NAME_MAP[deptName] || deptName;
}
