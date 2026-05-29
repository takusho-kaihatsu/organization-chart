const deptCache = {};

async function fetchDeptData(sheetName) {
  // headers=1: 1行目のみをヘッダーとして使う（gvizが複数行をヘッダーと誤検出するのを防ぐ）
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&headers=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${sheetName}: ${res.status}`);
  const text = await res.text();

  // JSONP ラッパー除去: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const match = text.match(/setResponse\((\{[\s\S]*\})\)/);
  if (!match) return [];
  const gviz = JSON.parse(match[1]);

  const cols = gviz?.table?.cols ?? [];
  const rows = gviz?.table?.rows ?? [];
  if (cols.length === 0) return [];

  // 列名: ラベルの最初のスペース/改行より前の部分
  // 例: "氏名 大岩哲己" → "氏名"
  const fieldNames = cols.map(col => {
    const label = (col.label ?? '').trim();
    const m = label.match(/^([^\s\n]+)/);
    return m ? m[1] : '';
  });

  // 1人目: ラベルの「フィールド名 値」の値部分（改行があれば1行目のみ）
  // 例: "氏名 大岩哲己\n石井友美" → "大岩哲己"（石井友美は rows に含まれる）
  const firstPerson = {};
  let hasFirstPerson = false;
  cols.forEach((col, i) => {
    const fn = fieldNames[i];
    if (!fn) return;
    const label = col.label ?? '';
    const spaceIdx = label.indexOf(' ');
    if (spaceIdx !== -1) {
      const val = label.substring(spaceIdx + 1).split('\n')[0].trim();
      firstPerson[fn] = val;
      if (fn === '氏名' && val) hasFirstPerson = true;
    } else {
      firstPerson[fn] = '';
    }
  });

  // 2行目以降のデータを解析
  const rest = rows
    .map(row => {
      const obj = {};
      (row.c ?? []).forEach((cell, i) => {
        const fn = fieldNames[i];
        if (!fn) return;
        obj[fn] = (cell?.v != null) ? String(cell.v) : '';
      });
      return obj;
    })
    .filter(obj => obj['氏名']?.trim());

  return hasFirstPerson ? [firstPerson, ...rest] : rest;
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
