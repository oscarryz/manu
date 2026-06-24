(function () {
  const saved = localStorage.getItem('theme') || 'dark';
  document.querySelector('html').dataset.theme = saved;
})();

document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      const next = document.querySelector('html').dataset.theme === 'light' ? 'dark' : 'light';
      document.querySelector('html').dataset.theme = next;
      localStorage.setItem('theme', next);
    });
  }
});
