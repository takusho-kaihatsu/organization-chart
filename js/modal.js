function openModal(member) {
  const name    = member['氏名'] || '';
  const role    = member['役職'] || '';
  const section = member['課'] || '';
  const boss    = member['上司'] || '';
  const photo   = getPhotoUrl(member['写真URL']);
  const profile = (member['プロフィール'] || '').replace(/\n/g, '<br>');
  const number  = member['図鑑番号'] || '';
  const type    = member['タイプ'] || '';
  const ability = member['特性'] || '';
  const habitat = member['生息地'] || '';
  const desc    = (member['説明'] || '').replace(/\n/g, '<br>');
  const qual    = (member['所持資格'] || '').replace(/\n/g, '<br>');

  document.getElementById('modal-photo').src = photo;
  document.getElementById('modal-photo').alt = name;
  document.getElementById('modal-name').textContent = name;
  document.getElementById('modal-role').textContent = role;
  document.getElementById('modal-section').textContent = section;
  document.getElementById('modal-boss').textContent = boss;
  document.getElementById('modal-number').textContent = number ? `No.${number}` : '';
  document.getElementById('modal-type').textContent = type;
  document.getElementById('modal-ability').textContent = ability;
  document.getElementById('modal-habitat').textContent = habitat;
  document.getElementById('modal-desc').innerHTML = desc;
  document.getElementById('modal-qual').innerHTML = qual;
  document.getElementById('modal-profile').innerHTML = profile;

  // 空フィールドの行を非表示
  ['type', 'ability', 'habitat', 'desc', 'qual', 'profile', 'boss', 'section'].forEach(key => {
    const el = document.getElementById(`modal-${key}`);
    const row = el ? el.closest('.modal-field-row') : null;
    if (row) row.style.display = (el.textContent.trim() === '' && el.innerHTML.trim() === '') ? 'none' : '';
  });
  // 図鑑番号は badge テキストで判定
  const numEl = document.getElementById('modal-number');
  const numRow = numEl ? numEl.closest('.modal-field-row') : null;
  if (numRow) numRow.style.display = numEl.textContent.trim() === '' ? 'none' : '';

  const modal = new bootstrap.Modal(document.getElementById('memberModal'));
  modal.show();
}
