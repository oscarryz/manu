(function () {
  // The publish step appends ".toolbar { visibility: hidden; }" to main.css.
  // Override that so the buttons are visible when the extension is active.
  const style = document.createElement('style');
  style.textContent = '.toolbar { visibility: visible !important; }';
  document.head.appendChild(style);

  function init() {
    const toolbar = document.querySelector('.toolbar');
    if (!toolbar) return;

    const buttons = toolbar.querySelectorAll('button');
    if (buttons.length < 2) return;

    const [newBtn, editBtn] = buttons;
    const editorBase = chrome.runtime.getURL('editor/editor.html');

    newBtn.onclick = e => {
      e.preventDefault();
      window.location.href = editorBase + '?mode=new';
    };

    editBtn.onclick = e => {
      e.preventDefault();
      const main = document.querySelector('[data-id]');
      const id = main?.dataset.id || '';
      window.location.href = editorBase + '?mode=edit&id=' + encodeURIComponent(id);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
