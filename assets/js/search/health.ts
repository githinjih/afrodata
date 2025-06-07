import Fuse from './fuse.mjs';
import { Hit, Page } from './types.js';

const JSON_INDEX_URL = `${window.location.origin}/health.json`;
const QUERY_URL_PARAM = 'query';

const MAX_HITS_SHOWN = 20;
const LEFT_SIDE_MATCH_HTML = '<mark>';
const RIGHT_SIDE_MATCH_HTML = '</mark>';

const FUSE_OPTIONS = {
  keys: ['title', 'County', 'Sub-County', 'Type'],
  ignoreLocation: true,
  includeMatches: true,
  minMatchCharLength: 3,
};

let fuse: any;

const getInputEl = (): HTMLInputElement => {
  return document.querySelector('#search_input');
};

const enableInputEl = (): void => {
  getInputEl().disabled = false;
};

const initFuse = (pages: Page[]): void => {
  fuse = new Fuse(pages, FUSE_OPTIONS);
};

const doSearchIfUrlParamExists = (): void => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has(QUERY_URL_PARAM)) {
    const query = decodeURIComponent(urlParams.get(QUERY_URL_PARAM));
    getInputEl().value = query;
    handleSearchEvent();
  }
};

const encodeRFC3986URIComponent = (str: string): string => {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
};

const setUrlParam = (query: string): void => {
  const url = new URL(location.origin + location.pathname);
  url.search = `${QUERY_URL_PARAM}=${encodeRFC3986URIComponent(query)}`;
  window.history.replaceState({}, '', url);
};

const clearSearchInput = (): void => {
  const inputElement = getInputEl();
  inputElement.value = '';  // Clear the input field
  handleSearchEvent();      // Trigger a search event to reset the results
  toggleClearButton();      // Hide the clear button when input is cleared
};

const toggleClearButton = (): void => {
  const inputElement = getInputEl();
  const clearButton = document.querySelector('#clear_search_btn');
  // Check if the input field has text
  if (inputElement.value.trim() !== '') {
    clearButton.style.display = 'inline-block'; // Show the clear button
  } else {
    clearButton.style.display = 'none'; // Hide the clear button
  }
};

// Listen to the input event to toggle the visibility of the clear button
getInputEl().addEventListener('input', toggleClearButton);

// Add event listener for the clear search button
document.querySelector('#clear_search_btn').addEventListener('click', clearSearchInput);

const fetchJsonIndex = (): void => {
  fetch(JSON_INDEX_URL)
    .then(response => {
      return response.json();
    })
    .then(data => {
      const pages: Page[] = data;
      initFuse(pages);
      enableInputEl();
      doSearchIfUrlParamExists();
    })
    .catch(error => {
      console.error(`Failed to fetch JSON index: ${error.message}`);
    });
};

const highlightMatches = (hit: Hit, key: string) => {
  const text: string = hit.item[key];
  const match = hit.matches.find(match => match.key === key);
  if (!match) return text;

  const charIndexToReplacementText = new Map<number, string>();
  match.indices.forEach(indexPair => {
    const startIndex = indexPair[0];
    const endIndex = indexPair[1];
    const startCharText = `${LEFT_SIDE_MATCH_HTML}${text[startIndex]}`;
    const endCharText = `${text[endIndex]}${RIGHT_SIDE_MATCH_HTML}`;
    charIndexToReplacementText.set(startIndex, startCharText);
    charIndexToReplacementText.set(endIndex, endCharText);
  });

  return text
    .split('')
    .map((char, index) => charIndexToReplacementText.get(index) || char)
    .join('');
};


const createHitHtml = (hit: Hit): string => {
  const details = Object.keys(hit.item)
    .filter(key => key !== 'title' && key !== 'url')
    .map(key => {
      return `${key}: ${highlightMatches(hit, key)}<br>`;
    })
    .join('\n');

  return `
   <a href="${hit.item.url}" class="no-underline flex items-start gap-5 py-5 border-b-2 border-gray-300 dark:border-gray-800">
    <div class="flex flex-(--flex-even) flex-col items-start">
      <span class="mb-2 text-lg tracking-tight leading-none inline-block font-sans-bold underline">${highlightMatches(hit, 'title')}</span>
      <span class="text-sm tracking-tight opacity-[.95] text-gray-800 dark:text-gray-400">${details}</span>
    </div>
  </a>
  `;
};

const renderHits = (hits: Hit[]): void => {
  const limitedHits = hits.slice(0, MAX_HITS_SHOWN);

  const html = limitedHits.map(createHitHtml).join('\n');
  document.querySelector('#search_results_container').innerHTML = html;
};

const getQuery = (): string => {
  const query = getInputEl().value.trim();
  return query;
};

const getHits = (query: string): Hit[] => {
  return fuse.search(query);
};

const handleSearchEvent = (): void => {
  const query = getQuery();
  const hits = getHits(query);
  setUrlParam(query);
  renderHits(hits);
};

const handleDOMContentLoaded = (): void => {
  if (getInputEl()) {
    fetchJsonIndex();
    getInputEl().addEventListener('keyup', handleSearchEvent);
  }
};

const main = (): void => {
  document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
};

main();
