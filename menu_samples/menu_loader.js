function loadComponent(id, path) {
  fetch(path)
    .then(r => {
      if (!r.ok) throw new Error(`Не удалось загрузить ${path}`);
      return r.text();
    })
    .then(html => document.getElementById(id).innerHTML = html)
    .catch(err => console.error(err));
}

function getMenuSamplesPath() {
  const script = document.currentScript;
  const currentDir = script.src.substring(0, script.src.lastIndexOf('/'));
  return currentDir + '/../menu_samples';
}

document.addEventListener("DOMContentLoaded", () => {
  const base = getMenuSamplesPath();

  loadComponent("header", `${base}/header.html`);
  loadComponent("sidebar", `${base}/sidebar.html`);
  loadComponent("mobile-nav", `${base}/mobile.html`);
});
