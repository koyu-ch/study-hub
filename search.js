const query = document.querySelector('#query');
const status = document.querySelector('#status');
const results = document.querySelector('#results');
const normalize = value => value.normalize('NFKC').toLowerCase();
const index = fetch('data/search-index.json').then(response => {
  if (!response.ok) throw new Error('Search index unavailable');
  return response.json();
}).catch(() => null);

async function renderSearch() {
  const value = query.value;
  const terms = normalize(value).trim().split(/\s+/).filter(Boolean);
  results.replaceChildren();
  results.hidden = true;
  status.hidden = !terms.length;
  if (!terms.length) return;

  status.textContent = '搜尋中…';
  const notes = await index;
  if (query.value !== value) return;
  if (!notes) {
    status.textContent = '無法載入搜尋資料，請重新整理頁面。';
    return;
  }

  const matches = notes.filter(note => {
    const fields = [note.course, note.chapter, note.title, ...note.keywords].map(normalize);
    return terms.every(term => fields.some(field => field.includes(term)));
  });
  status.textContent = matches.length ? `找到 ${matches.length} 篇筆記` : '找不到符合的筆記，請試試其他關鍵字。';
  results.hidden = !matches.length;

  for (const note of matches) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = note.path;
    link.textContent = note.title;
    item.append(link, `（${note.course}／${note.chapter}）`);
    results.append(item);
  }
}

query.addEventListener('input', renderSearch);
window.addEventListener('pageshow', renderSearch);
