const FIELDS = ['token', 'owner', 'repo', 'branch', 'siteUrl'];
const DEFAULTS = {
  token: '',
  owner: 'oscarryz',
  repo: 'manu',
  branch: 'gh-pages',
  siteUrl: 'https://oscarryz.com',
};

const statusEl = document.getElementById('status');
const syncBtn = document.getElementById('sync-btn');

// Load saved settings
chrome.storage.sync.get(DEFAULTS, config => {
  FIELDS.forEach(f => { document.getElementById(f).value = config[f]; });
});

// Save settings
document.getElementById('save-btn').addEventListener('click', () => {
  const config = {};
  FIELDS.forEach(f => { config[f] = document.getElementById(f).value.trim(); });
  chrome.storage.sync.set(config, () => {
    showStatus('Saved!', false);
    setTimeout(() => { statusEl.textContent = ''; }, 2000);
  });
});

// Sync assets — runs in background service worker so popup can be closed
syncBtn.addEventListener('click', () => {
  chrome.storage.sync.get(DEFAULTS, config => {
    if (!config.token) {
      showStatus('Enter a GitHub token first.', true);
      return;
    }

    syncBtn.disabled = true;
    document.getElementById('save-btn').disabled = true;
    showStatus('Starting sync…', false);

    // Clear any previous progress then kick off the background sync
    chrome.storage.local.set({ syncProgress: null }, () => {
      chrome.runtime.sendMessage({ type: 'SYNC_ASSETS', config }, response => {
        if (response?.ok === false) {
          showStatus('Sync failed: ' + response.error, true);
        }
        syncBtn.disabled = false;
        document.getElementById('save-btn').disabled = false;
      });
    });

    // Poll storage for progress updates
    const poll = setInterval(() => {
      chrome.storage.local.get('syncProgress', ({ syncProgress: p }) => {
        if (!p) return;
        if (p.finished) {
          showStatus('Done! ' + p.total + ' files synced.', false);
          clearInterval(poll);
        } else {
          showStatus(p.done + '/' + p.total + ' — ' + p.file, false);
        }
      });
    }, 150);
  });
});

function showStatus(msg, isError) {
  statusEl.textContent = msg;
  statusEl.className = isError ? 'error' : '';
}
