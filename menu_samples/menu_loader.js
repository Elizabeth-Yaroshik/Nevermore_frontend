function loadComponent(id, file) {
  fetch(file)
    .then(r => r.text())
    .then(html => document.getElementById(id).innerHTML = html);
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("header", "/menu_samples/header.html");
  loadComponent("sidebar", "sidebar.html");
  loadComponent("mobile-nav", "mobile-nav.html");
});
