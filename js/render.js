function createMemberCard(member, options = {}) {
  const { small = false } = options;
  const manager = isManager(member);
  const photoUrl = getPhotoUrl(member['写真URL']);
  const name = member['氏名'] || '';
  const role = member['役職'] || '';

  const card = document.createElement('div');
  card.className = 'member-card' + (manager ? ' manager' : '') + (small ? ' small' : '');
  card.dataset.member = JSON.stringify(member);
  card.innerHTML = `
    <div class="member-photo-wrap">
      <img src="${photoUrl}" alt="${name}" loading="lazy" onerror="this.src='https://placehold.co/100x80?text=No+Photo'">
    </div>
    <div class="member-name">${name}</div>
    ${role ? `<div class="member-role">${role}</div>` : ''}
  `;
  card.addEventListener('click', () => openModal(member));
  return card;
}

function renderDept(deptName, members, container, options = {}) {
  const { small = false } = options;

  if (!members || members.length === 0) {
    container.innerHTML = '<p class="text-muted p-3">データなし</p>';
    return;
  }

  const { direct, sections } = groupBySection(members);
  const wrapper = document.createElement('div');
  wrapper.className = 'dept-layout';

  // 部直轄メンバー
  if (direct.length > 0) {
    const directWrap = document.createElement('div');
    directWrap.className = 'direct-members';
    direct.forEach(m => directWrap.appendChild(createMemberCard(m, { small })));
    wrapper.appendChild(directWrap);
  }

  // 課グループ
  if (Object.keys(sections).length > 0) {
    const sectionsWrap = document.createElement('div');
    sectionsWrap.className = 'sections-wrap';

    Object.entries(sections).forEach(([secName, secMembers]) => {
      const secEl = document.createElement('div');
      secEl.className = 'section-row';

      const label = document.createElement('div');
      label.className = 'section-label';
      label.textContent = secName.replace(/ /g, '\n');

      const membersEl = document.createElement('div');
      membersEl.className = 'section-members';
      secMembers.forEach(m => membersEl.appendChild(createMemberCard(m, { small })));

      secEl.appendChild(label);
      secEl.appendChild(membersEl);
      sectionsWrap.appendChild(secEl);
    });

    wrapper.appendChild(sectionsWrap);
  }

  container.appendChild(wrapper);
}

function renderAllDepts(allData) {
  const container = document.getElementById('all-depts-container');
  container.innerHTML = '';

  DEPT_ORDER.forEach(deptName => {
    const members = allData[deptName] || [];
    if (members.length === 0) return;

    // outer: overflow hidden でスケール後の高さを実際の高さとして扱う
    const outer = document.createElement('div');
    outer.className = 'all-dept-block-outer';
    outer.dataset.dept = deptName;

    const block = document.createElement('div');
    block.className = 'all-dept-block';

    const title = document.createElement('div');
    title.className = 'all-dept-title';
    title.textContent = deptName;

    const content = document.createElement('div');
    content.className = 'all-dept-content';

    block.appendChild(title);
    block.appendChild(content);
    outer.appendChild(block);
    container.appendChild(outer);

    renderDept(deptName, members, content, { small: true });

    // スケール後の実際の高さを outer に反映
    requestAnimationFrame(() => {
      const h = block.getBoundingClientRect().height;
      outer.style.height = h + 'px';
    });
  });
}
