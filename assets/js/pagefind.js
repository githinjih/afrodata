import * as pagefind from '/pagefind/pagefind.js';

await pagefind.init();

const container = document.getElementById('search-container');
const section   = container.dataset.section;
const input     = document.getElementById('search-input');
const results   = document.getElementById('search-results');

input.addEventListener('input', async () => {
  const term = input.value.trim();
  if (!term) { results.innerHTML = ''; return; }

  const search = await pagefind.search(term + '*', {
    filters: { section: section }
  });

  const first20 = search.results.slice(0, 20);
  const data = await Promise.all(first20.map(r => r.data()));

  results.innerHTML = data.map(r => `
    <div class="result">
      <a href="${r.url}"><strong>${r.meta.title}</strong></a>
      <p>${r.excerpt}</p>
    </div>
  `).join('');
});