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

const legalLinks = document.querySelector("footer .legal-links");
if (legalLinks && !document.querySelector("#privacy-choices")) {
  const privacyChoices = document.createElement("a");
  privacyChoices.id = "privacy-choices";
  privacyChoices.href = "#";
  privacyChoices.textContent = "Privacy choices";
  privacyChoices.hidden = true;
  legalLinks.appendChild(privacyChoices);

  privacyChoices.addEventListener("click", event => {
    event.preventDefault();
    window.googlefc?.showRevocationMessage?.();
  });

  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
  window.googlefc.callbackQueue.push({
    CONSENT_API_READY: () => {
      if (typeof window.__tcfapi !== "function") return;
      window.__tcfapi("addEventListener", 0, (tcData, success) => {
        privacyChoices.hidden = !(success && tcData?.gdprApplies);
      });
    }
  });
}
