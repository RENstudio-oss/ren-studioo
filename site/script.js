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

const newsletterForm = document.querySelector('form[name="newsletter"]');
newsletterForm?.addEventListener("submit", async event => {
  event.preventDefault();
  if (!newsletterForm.reportValidity()) return;

  const button = newsletterForm.querySelector('button[type="submit"]');
  const status = newsletterForm.querySelector(".newsletter-status");
  const formData = new FormData(newsletterForm);
  const payload = {
    email: String(formData.get("email") || "").trim(),
    firstName: String(formData.get("first_name") || "").trim(),
    consent: formData.get("marketing_consent") === "yes",
    website: String(formData.get("bot-field") || "")
  };

  newsletterForm.classList.add("is-sending");
  button.disabled = true;
  status.classList.remove("is-error");
  status.textContent = "Adding you to the studio…";

  try {
    const response = await fetch("/.netlify/functions/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Subscription failed");
    window.location.assign("/subscribed/");
  } catch (error) {
    status.classList.add("is-error");
    status.textContent = "We couldn’t add you right now. Please try again in a moment.";
    newsletterForm.classList.remove("is-sending");
    button.disabled = false;
  }
});

if (!localStorage.getItem("ren_cookie_choice")) {
  const notice = document.createElement("aside");
  notice.className = "cookie-notice";
  notice.setAttribute("aria-label", "Cookie choices");
  notice.innerHTML = `<div><strong>Your privacy matters.</strong><p>REN Studio currently uses only essential local storage to remember this choice. Advertising cookies remain disabled until a certified consent platform and AdSense are configured.</p><a href="cookies.html">Read cookie policy</a></div><div class="cookie-actions"><button data-choice="essential">Essential only</button><button data-choice="all">Accept all</button></div>`;
  document.body.appendChild(notice);
  notice.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    localStorage.setItem("ren_cookie_choice", button.dataset.choice);
    notice.remove();
  }));
}
