function initPrint(allData) {
  const printBtn = document.getElementById('print-btn');
  const printOptions = document.getElementById('print-options');

  // 全社一覧タブのチェックボックス生成
  const checkList = document.getElementById('print-dept-checklist');
  checkList.innerHTML = '';

  DEPT_ORDER.forEach(name => {
    if (!allData[name] || allData[name].length === 0) return;
    const id = `chk-${CSS.escape(name)}`;
    const div = document.createElement('div');
    div.className = 'form-check form-check-inline';
    div.innerHTML = `
      <input class="form-check-input print-dept-chk" type="checkbox" id="${id}" value="${name}" checked>
      <label class="form-check-label" for="${id}">${name}</label>
    `;
    checkList.appendChild(div);
  });

  // 全社一覧タブ表示中のみ印刷オプションを表示
  document.addEventListener('tabChanged', (e) => {
    printOptions.style.display = e.detail === 'all' ? '' : 'none';
  });

  printBtn.addEventListener('click', () => {
    const currentTab = document.querySelector('.dept-tab.active')?.dataset.tab;
    if (currentTab === 'all') {
      applyPrintFilter();
    }
    window.print();
  });
}

function applyPrintFilter() {
  const checked = Array.from(document.querySelectorAll('.print-dept-chk:checked')).map(c => c.value);
  document.querySelectorAll('.all-dept-block-outer').forEach(outer => {
    const dept = outer.dataset.dept;
    outer.classList.toggle('print-hidden', !checked.includes(dept));
  });
}
