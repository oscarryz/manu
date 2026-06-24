(async function () {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode') || 'new';
  const id = params.get('id') || undefined;

  const config = await getConfig();

  if (!config.token) {
    document.getElementById('save-btn').disabled = true;
    document.getElementById('content').innerHTML =
      '<h1>Not configured</h1><p>Open the extension popup and enter your GitHub token to start editing.</p>';
    initEditor();
    return;
  }

  let entry = { id: undefined, title: '', content_html: '<h1>Title</h1><p>content</p>' };

  if (mode === 'edit' && id) {
    try {
      const feedFile = await githubRead(config, 'feed.json');
      if (feedFile) {
        const feed = JSON.parse(base64Decode(feedFile.content));
        const found = feed.items.find(i => i.id === id);
        if (found) entry = found;
      }
    } catch (e) {
      console.error('Failed to load entry:', e);
    }
    document.getElementById('main').dataset.id = id;
    document.getElementById('big-title').textContent = entry.title;
  }

  const saved = sessionStorage.getItem('autosave');
  document.getElementById('content').innerHTML = saved || entry.content_html;

  initEditor();

  // Mirror autosave behaviour from original main.js
  const pmEl = getEditorElement();
  if (pmEl) {
    pmEl.addEventListener('keyup', () => {
      sessionStorage.setItem('autosave', getEditorElement().innerHTML);
    });
  }

  document.getElementById('save-btn').addEventListener('click', () => saveDoc(config, mode, entry));
  document.getElementById('cancel-btn').addEventListener('click', () => {
    sessionStorage.removeItem('autosave');
    window.location.href = config.siteUrl;
  });
})();

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

function getEditorElement() {
  return document.querySelector('#editor > div > div.ProseMirror.ProseMirror-example-setup-style');
}

function initEditor() {
  const { EditorState } = require('prosemirror-state');
  const { EditorView } = require('prosemirror-view');
  const { Schema, DOMParser } = require('prosemirror-model');
  const { schema } = require('prosemirror-schema-basic');
  const { addListNodes } = require('prosemirror-schema-list');
  const { exampleSetup } = require('prosemirror-example-setup');

  const mySchema = new Schema({
    nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
    marks: schema.spec.marks,
  });

  window.view = new EditorView(document.querySelector('#editor'), {
    state: EditorState.create({
      doc: DOMParser.fromSchema(mySchema).parse(document.querySelector('#content')),
      plugins: exampleSetup({ schema: mySchema }),
    }),
  });
}

// ---------------------------------------------------------------------------
// Save
// ---------------------------------------------------------------------------

async function saveDoc(config, mode, originalEntry) {
  const pmEl = getEditorElement();
  if (!pmEl) { alert('Editor not ready'); return; }

  const html = pmEl.innerHTML;
  const title = (pmEl.innerText.split('\n')[0] || '').trim() || 'Untitled';
  const slug = kebabCase(title);
  const fileName = slug + '.html';

  const saveBtn = document.getElementById('save-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';

  try {
    const feedFile = await githubRead(config, 'feed.json');
    const feed = feedFile
      ? JSON.parse(base64Decode(feedFile.content))
      : defaultFeed(config.siteUrl);

    const now = new Date().toISOString();
    let entry;

    if (mode === 'new') {
      entry = {
        id: uuidv4(),
        title,
        content_html: html,
        date_published: now,
        date_modified: now,
        url: config.siteUrl + '/' + fileName,
      };
      feed.items.unshift(entry);
    } else {
      const idx = feed.items.findIndex(i => i.id === originalEntry.id);
      const base = idx >= 0 ? feed.items[idx] : originalEntry;
      entry = { ...base, title, content_html: html, date_modified: now, url: config.siteUrl + '/' + fileName };
      if (idx >= 0) feed.items[idx] = entry;
      else feed.items.unshift(entry);
    }

    // Write entry HTML
    const existingEntry = await githubRead(config, fileName);
    await githubWrite(
      config, fileName,
      generateEntryHtml(entry),
      (mode === 'new' ? 'Add: ' : 'Update: ') + title,
      existingEntry?.sha
    );

    // Update feed.json
    await githubWrite(
      config, 'feed.json',
      JSON.stringify(feed, null, 2),
      'Update feed for "' + title + '"',
      feedFile?.sha
    );

    // Update entries.html
    const existingEntries = await githubRead(config, 'entries.html');
    await githubWrite(
      config, 'entries.html',
      generateEntriesHtml(feed.items),
      'Update entries list',
      existingEntries?.sha
    );

    // Point index.html at the newest entry when creating
    if (mode === 'new') {
      const existingIndex = await githubRead(config, 'index.html');
      await githubWrite(
        config, 'index.html',
        '<meta http-equiv="Refresh" content="0; url=/' + fileName + '" />',
        'Update index redirect',
        existingIndex?.sha
      );
    }

    sessionStorage.removeItem('autosave');
    window.location.href = entry.url;

  } catch (err) {
    console.error('Save failed:', err);
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
    alert('Save failed: ' + err.message);
  }
}

// ---------------------------------------------------------------------------
// HTML generators — match src/templates output exactly
// ---------------------------------------------------------------------------

function generateEntryHtml({ id, title, content_html }) {
  return `<!doctype html>
<html lang="en" data-theme="dark">
    <head>
        <link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="img/favicon.ico" type="image/x-icon" />
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <link rel="alternate" type="application/json" href="https://oscarryz.com/feed.json" title="OscarRyz JSON Feed" />
        <link rel="me" href="https://mastodon.social/@oscarryz" />
        <title>${title}</title>
        <link rel="stylesheet" href="css/main.css" />
        <script type="text/javascript" async src="js/main.js"><\/script>
        <script type="text/javascript" async src="js/entries.js"><\/script>
    </head>
    <body>
        <div class="grid-container">
            <footer class="footer">
                <nav id="footer-nav">
                    <a href="about-me.html">About me</a>
                    <a href="/feed.json">JSON feed</a>
                    <a href="#" onclick="toggleTheme()">Theme: Light / Dark</a>
                </nav>
            </footer>
            <header class="header">
                <div class="toolbar">
                    <button class="action-button" onClick="newEntry(); return false;">New</button>
                    <button class="action-button" onClick="loadDoc(); return false;">Edit</button>
                </div>
            </header>
            <main class="main" data-id="${id}">
                <div class="big-title">${title}</div>
                <div id="context-text" class="content">${content_html}</div>
            </main>
            <div class="entries">
                <div id="entries-filter" class="entries-filter">Other entries</div>
                <div id="entries-list" class="entries-list">
                    <iframe src="entries.html" onload="resizeIframe(this)" scrolling="no" frameborder="0"></iframe>
                </div>
            </div>
        </div>
    </body>
    <script>
        (function setTheme() {
            const currentTheme = localStorage.getItem("theme") || "dark";
            document.querySelector("html").dataset.theme = currentTheme;
        })();
    <\/script>
</html>`;
}

function generateEntriesHtml(items) {
  const lis = items.map(i => {
    const href = i.url.substring(i.url.lastIndexOf('/'));
    return '            <li><a href="' + href + '" target="_parent" class="archive-link">' + i.title + '</a></li>';
  }).join('\n');

  return `<html data-theme="dark">
    <head>
        <meta charset="UTF-8" />
        <link rel="stylesheet" href="css/main.css" />
        <script type="text/javascript" async src="/js/entries.js"><\/script>
        <script>
            (function setTheme() {
                const currentTheme = localStorage.getItem("theme") || "dark";
                document.querySelector("html").dataset.theme = currentTheme;
            })();
        <\/script>
    </head>
    <div id="entries-list" class="entries-list">
        <ul>
${lis}
        </ul>
    </div>
</html>`;
}

// ---------------------------------------------------------------------------
// GitHub Contents API
// ---------------------------------------------------------------------------

async function githubRead(config, path) {
  const url = 'https://api.github.com/repos/' + config.owner + '/' + config.repo
    + '/contents/' + path + '?ref=' + config.branch;
  const resp = await fetch(url, { headers: githubHeaders(config) });
  if (resp.status === 404) return null;
  if (!resp.ok) throw new Error('GitHub read ' + path + ' failed: ' + resp.status);
  return resp.json();
}

async function githubWrite(config, path, content, message, sha) {
  const url = 'https://api.github.com/repos/' + config.owner + '/' + config.repo
    + '/contents/' + path;
  const body = { message, content: base64Encode(content), branch: config.branch };
  if (sha) body.sha = sha;
  const resp = await fetch(url, {
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

function githubHeaders(config) {
  return {
    Authorization: 'Bearer ' + config.token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function getConfig() {
  return new Promise(resolve => {
    chrome.storage.sync.get(
      { token: '', owner: 'oscarryz', repo: 'manu', branch: 'gh-pages', siteUrl: 'https://oscarryz.com' },
      resolve
    );
  });
}

function base64Encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function base64Decode(b64) {
  return decodeURIComponent(escape(atob(b64.replace(/\s/g, ''))));
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function kebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

function defaultFeed(siteUrl) {
  return {
    version: 'https://jsonfeed.org/version/1',
    title: 'oscarryz blog',
    home_page_url: siteUrl,
    feed_url: siteUrl + '/feed.json',
    icon: siteUrl + '/img/favicon.ico',
    author: { name: 'OscarRyz', url: 'https://twitter.com/oscarryz' },
    items: [],
  };
}
