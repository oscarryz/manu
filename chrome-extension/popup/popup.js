const FIELDS = ['token', 'owner', 'repo', 'branch', 'siteUrl'];
const DEFAULTS = {
  token: '',
  owner: 'oscarryz',
  repo: 'manu',
  branch: 'gh-pages',
  siteUrl: 'https://oscarryz.com',
};

chrome.storage.sync.get(DEFAULTS, config => {
  FIELDS.forEach(f => { document.getElementById(f).value = config[f]; });
});

document.getElementById('save-btn').addEventListener('click', () => {
  const config = {};
  FIELDS.forEach(f => { config[f] = document.getElementById(f).value.trim(); });
  chrome.storage.sync.set(config, () => {
    const status = document.getElementById('status');
    status.textContent = 'Saved!';
    setTimeout(() => { status.textContent = ''; }, 2000);
  });
});
