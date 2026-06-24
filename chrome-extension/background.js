// Files pushed to gh-pages as text (content from extension bundle)
const TEXT_FILES = [
  'css/all.css',
  'css/editor.css',
  'js/entries.js',
  'about-me.html',
];

// css/main.css gets the toolbar-hiding rule appended before publishing
const CSS_MAIN = 'css/main.css';

// These are emptied on gh-pages — the extension handles New/Edit/Save
const EMPTY_JS = ['js/main.js', 'js/pm.js', 'js/require-pm.js'];

// Binary assets (images + webfonts)
const BINARY_FILES = [
  'img/favicon.ico',
  'img/or-logo.png',
  'img/about-me.png',
  'webfonts/fa-brands-400.eot',
  'webfonts/fa-brands-400.svg',
  'webfonts/fa-brands-400.ttf',
  'webfonts/fa-brands-400.woff',
  'webfonts/fa-brands-400.woff2',
  'webfonts/fa-regular-400.eot',
  'webfonts/fa-regular-400.svg',
  'webfonts/fa-regular-400.ttf',
  'webfonts/fa-regular-400.woff',
  'webfonts/fa-regular-400.woff2',
  'webfonts/fa-solid-900.eot',
  'webfonts/fa-solid-900.svg',
  'webfonts/fa-solid-900.ttf',
  'webfonts/fa-solid-900.woff',
  'webfonts/fa-solid-900.woff2',
];

const TOTAL = TEXT_FILES.length + 1 + EMPTY_JS.length + BINARY_FILES.length;

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'SYNC_ASSETS') {
    runSync(msg.config)
      .then(() => sendResponse({ ok: true }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true; // keep message channel open for async response
  }
});

async function runSync(config) {
  let done = 0;

  function progress(file) {
    done++;
    chrome.storage.local.set({
      syncProgress: { done, total: TOTAL, file, finished: false },
    });
  }

  // Text files — push as-is
  for (const path of TEXT_FILES) {
    const content = await readText(path);
    await pushFile(config, path, content, 'Sync: ' + path);
    progress(path);
  }

  // css/main.css — append visibility rule so toolbar stays hidden without extension
  const mainCss = await readText(CSS_MAIN);
  await pushFile(config, CSS_MAIN, mainCss + '\n.toolbar { visibility: hidden; }', 'Sync: ' + CSS_MAIN);
  progress(CSS_MAIN);

  // Empty JS — extension handles these; publishing clears them
  for (const path of EMPTY_JS) {
    await pushFile(config, path, '', 'Sync: ' + path);
    progress(path);
  }

  // Binary files — fonts and images
  for (const path of BINARY_FILES) {
    const b64 = await readBinary(path);
    await pushFileRaw(config, path, b64, 'Sync: ' + path);
    progress(path);
  }

  chrome.storage.local.set({ syncProgress: { done: TOTAL, total: TOTAL, finished: true } });
}

// ---------------------------------------------------------------------------
// Read extension-bundled files
// ---------------------------------------------------------------------------

async function readText(path) {
  const resp = await fetch(chrome.runtime.getURL(path));
  if (!resp.ok) throw new Error('Could not read ' + path);
  return resp.text();
}

async function readBinary(path) {
  const resp = await fetch(chrome.runtime.getURL(path));
  if (!resp.ok) throw new Error('Could not read ' + path);
  const buf = await resp.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

// ---------------------------------------------------------------------------
// GitHub Contents API
// ---------------------------------------------------------------------------

async function getSha(config, path) {
  const url = apiUrl(config, path) + '?ref=' + config.branch;
  const resp = await fetch(url, { headers: githubHeaders(config) });
  if (resp.status === 404) return undefined;
  if (!resp.ok) throw new Error('GitHub read ' + path + ' failed: ' + resp.status);
  const data = await resp.json();
  return data.sha;
}

async function pushFile(config, path, content, message) {
  const sha = await getSha(config, path);
  const b64 = btoa(unescape(encodeURIComponent(content)));
  return pushFileRaw(config, path, b64, message, sha);
}

async function pushFileRaw(config, path, base64Content, message, sha) {
  if (sha === undefined) sha = await getSha(config, path);
  const body = { message, content: base64Content, branch: config.branch };
  if (sha) body.sha = sha;
  const resp = await fetch(apiUrl(config, path), {
    method: 'PUT',
    headers: { ...githubHeaders(config), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error('GitHub write ' + path + ' failed: ' + resp.status + ' – ' + text);
  }
  return resp.json();
}

function apiUrl(config, path) {
  return 'https://api.github.com/repos/' + config.owner + '/' + config.repo + '/contents/' + path;
}

function githubHeaders(config) {
  return {
    Authorization: 'Bearer ' + config.token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}
