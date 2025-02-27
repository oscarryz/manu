function resizeIframe(obj) {
  obj.style.height = obj.contentWindow.document.body.scrollHeight + 20 + "px";
}

function toggleTheme() {
  const newTheme =
    document.querySelector("html").dataset.theme === "light" ? "dark" : "light";
  document.querySelector("html").dataset.theme = newTheme;
  document
    .querySelector("iframe")
    .contentDocument.querySelector("html").dataset.theme = newTheme;
  localStorage.setItem("theme", newTheme);
}
