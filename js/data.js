// メモリキャッシュ
const deptCache = {};

async function fetchDeptData(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${sheetName}: ${res.status}`);
  const csv = await res.text();
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });

  if (data.length === 0) return [];

  // gviz CSV の先頭行が "フィールド名 値" 形式になっている
  // 例: "氏名 大岩哲己", "課 ", "役職 部長"
  // → フィールド名と1人目のデータに分離して再構成する
  const rawKeys = Object.keys(data[0]);
  const colMap = {};    // rawKey → 正しいフィールド名
  const firstPerson = {};

  rawKeys.forEach(rawKey => {
    if (!rawKey || rawKey.startsWith('_')) return; // Papaparse 自動生成キーをスキップ
    const spaceIdx = rawKey.indexOf(' ');
    if (spaceIdx === -1) {
      colMap[rawKey] = rawKey;
      firstPerson[rawKey] = '';
    } else {
      const fieldName = rawKey.substring(0, spaceIdx);
      const value = rawKey.substring(spaceIdx + 1).trim();
      colMap[rawKey] = fieldName;
      firstPerson[fieldName] = value;
    }
  });

  // 2行目以降を正しいフィールド名でリマップ
  const rest = data
    .map(row => {
      const obj = {};
      rawKeys.forEach(rawKey => {
        const fieldName = colMap[rawKey];
        if (fieldName) obj[fieldName] = row[rawKey] ?? '';
      });
      return obj;
    })
    .filter(obj => obj['氏名'] && obj['氏名'].trim() !== '');

  // 1人目（ヘッダーに埋め込まれていた）を先頭に追加
  return firstPerson['氏名'] ? [firstPerson, ...rest] : rest;
}

async function fetchAllDepts(onProgress) {
  const total = DEPT_ORDER.length;
  let loaded = 0;

  const entries = await Promise.all(
    DEPT_ORDER.map(async (name) => {
      const sheetName = getSheetName(name);
      try {
        const data = await fetchDeptData(sheetName);
        deptCache[name] = data;
        loaded++;
        if (onProgress) onProgress(loaded, total, name);
        return [name, data];
      } catch (e) {
        console.warn(`Failed to load ${name}:`, e);
        deptCache[name] = [];
        loaded++;
        if (onProgress) onProgress(loaded, total, name);
        return [name, []];
      }
    })
  );
  return Object.fromEntries(entries);
}

function isManager(m) {
  return (m.役職 && m.役職.includes('長')) || m.上司 === 'ー' || m.上司 === '-';
}

function isDirectReport(m) {
  return !m.課 || m.課 === '' || m.課 === 'ー' || m.課 === '-';
}

function getPhotoUrl(url) {
  if (!url || url.trim() === '') {
    return 'https://placehold.co/100x80?text=No+Photo';
  }
  url = url.trim();
  if (url.includes('googleusercontent.com')) {
    url = url.split('=')[0] + '=s150';
  }
  return url;
}

function groupBySection(members) {
  const direct = members.filter(isDirectReport);
  const sections = {};
  members.filter(m => !isDirectReport(m)).forEach(m => {
    const sec = m.課;
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(m);
  });
  return { direct, sections };
}
