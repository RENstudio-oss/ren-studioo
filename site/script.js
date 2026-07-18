const menu = document.querySelector(".menu");
const mobileNav = document.querySelector(".mobile-nav");
const hero = document.querySelector(".hero-visual");
const portrait = hero?.querySelector("img");

menu?.addEventListener("click", () => {
  const open = !mobileNav.classList.contains("open");
  mobileNav.classList.toggle("open", open);
  mobileNav.setAttribute("aria-hidden", String(!open));
  menu.setAttribute("aria-expanded", String(open));
});

mobileNav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mobileNav.classList.remove("open");
  mobileNav.setAttribute("aria-hidden", "true");
  menu.setAttribute("aria-expanded", "false");
}));

if (hero && portrait && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  hero.addEventListener("pointermove", event => {
    const box = hero.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - .5;
    const y = (event.clientY - box.top) / box.height - .5;
    portrait.style.transform = `translate3d(${x * 8}px, ${y * 8}px, 0) scale(1.025)`;
  });
  hero.addEventListener("pointerleave", () => portrait.style.transform = "");
}

document.querySelectorAll("[data-year], #year").forEach(el => el.textContent = new Date().getFullYear());

if (!localStorage.getItem("ren_cookie_choice")) {
  const notice = document.createElement("aside");
  notice.className = "cookie-notice";
  notice.setAttribute("aria-label", "Cookie choices");
  notice.innerHTML = `<div><strong>Your privacy matters.</strong><p>This preview currently uses only essential local storage to remember this choice. Advertising cookies must remain disabled until a certified consent platform and AdSense are configured.</p><a href="cookies.html">Read cookie policy</a></div><div class="cookie-actions"><button data-choice="essential">Essential only</button><button data-choice="all">Accept all</button></div>`;
  document.body.appendChild(notice);
  notice.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    localStorage.setItem("ren_cookie_choice", button.dataset.choice);
    notice.remove();
  }));
}

document.querySelector(".contact-form")?.addEventListener("submit", event => {
  event.preventDefault();
  document.querySelector(".contact-message").textContent = "Preview only: connect this form to your real email service before publishing.";
});
