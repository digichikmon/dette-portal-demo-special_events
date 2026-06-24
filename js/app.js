/* ============================================================
   DETTE SERVICES — PORTAL DEMO
   Shared interactions: sidebar nav, toasts, mock "add to calendar"
   ============================================================ */

const NAV_ITEMS = [
  { num: "01", label: "Dashboard",       href: "dashboard.html" },
  { num: "02", label: "Add to calendar", href: "add-event.html" },
  { num: "03", label: "Event contacts",  href: "emergency.html" },
  { num: "04", label: "Shop",            href: "shop.html" },
];

function renderSidebar(activeHref) {
  const mount = document.getElementById("sidebar-mount");
  if (!mount) return;

  const links = NAV_ITEMS.map(item => {
    const active = item.href === activeHref ? " active" : "";
    return `<a href="${item.href}" class="${active.trim()}">
              <span class="num">${item.num}</span>
              <span>${item.label}</span>
            </a>`;
  }).join("");

  mount.innerHTML = `
    <div class="sidebar__brand">
      <span class="eyebrow">D'Ette Services</span>
      <div class="wordmark">Special Events</div>
    </div>
    <nav class="sidebar__nav">
      ${links}
      <a href="index.html" style="margin-top:auto; opacity:0.5;">
        <span class="num">↩</span>
        <span>Sign out</span>
      </a>
    </nav>
    <div class="sidebar__foot">Demo build · Prototype</div>
  `;
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span class="dot"></span><span class="toast__msg"></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector(".toast__msg").textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 4200);
}

document.addEventListener("DOMContentLoaded", () => {
  const current = document.body.dataset.page || "";
  renderSidebar(current);
});
