document.addEventListener('DOMContentLoaded', () => {
  let lastY = window.scrollY;
  const menu = document.querySelector('.mobile-menu');
  if (!menu) return;
  window.addEventListener('scroll', () => {
    const now = window.scrollY;
    if (now > lastY && now > 120) {
      menu.style.transform = 'translateX(-50%) translateY(80px)';
      menu.style.opacity = '0';
      menu.style.pointerEvents = 'none';
    } else {
      menu.style.transform = 'translateX(-50%) translateY(0)';
      menu.style.opacity = '1';
      menu.style.pointerEvents = 'auto';
    }
    lastY = now;
  }, { passive: true });
});
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      contents.forEach(c => {
        c.classList.remove("active");
        if (c.id === target) c.classList.add("active");
      });
    });
  });
});

