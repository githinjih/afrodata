import Fuse from './fuse.js';
import {Hit, Page} from './types.js';

/* ======================================
* Main search
* =============================== */

const JSON_INDEX_URL = `${window.location.origin}/transmission.json`;
const QUERY_URL_PARAM = 'query';

/**
 * TEMPLATE_TODO: Optioal. Change how many hits are shown.
 */
const MAX_HITS_SHOWN = 100;

/**
 * TEMPLATE_TODO: Optioal. Change the style of a highlighted match.
 */
const LEFT_SIDE_MATCH_HTML = '<span class="font-extrabold">';
const RIGHT_SIDE_MATCH_HTML = '</span>';

/**
 * TEMPLATE_TODO: Required. Tell Fuse.js which keys to search on.
 */
const FUSE_OPTIONS = {
  keys: ['title','County','Ownership'],
  ignoreLocation: true,
  includeMatches: true,
  minMatchCharLength: 2
};

let fuse: any;

const getInputEl = (): HTMLInputElement => {
  /**
   * TEMPLATE_TODO: Optional. If your HTML input element has a different selector, change it.
   */
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

const setUrlParam = (query: string): void => {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(QUERY_URL_PARAM, encodeURIComponent(query));
  window.history.replaceState({}, '', `${location.pathname}?${urlParams}`);
};

const fetchJsonIndex = (): void => {
  const startTime = performance.now();
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

  if (!match) {
    return text;
  }

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

/**
 * TEMPLATE_TODO: Required. Change how your HTML is created.
 */
const createHitHtml = (hit: Hit): string => {
  const details = Object.keys(hit.item)
    .filter(key => {
      return key !== 'title' && key !== 'url';
    })
    .map(key => {
      return `\
    <span>${key}:</span> ${highlightMatches(hit, key)}<br>
    `;
    })
    .join('\n');

    return `\
      <ul class="search-results list-style-none">
        <li class="search-result">
          <div class="search-result-inner">
            <p class="search-result-title group"><a class="search-result-link" href="${hit.item.url}"><span class="link-gradient">${highlightMatches(hit, 'title')}</span></a></p>
            <p class="search-result-excerpt"> ${details}</p>
          </div>
        </li>
      </ul>
    `
  ;
};

const renderHits = (hits: Hit[]): void => {
  const limitedHits = hits.slice(0, MAX_HITS_SHOWN);
  const html = limitedHits.map(createHitHtml).join('\n');
  /**
   * TEMPLATE_TODO: Optional. If your HTML results container element has a different selector, change it.
   */
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
  const startTime = performance.now();
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