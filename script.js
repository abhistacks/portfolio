const backToTop = document.querySelector(".back-to-top");
const header = document.querySelector(".site-header");
const mobileViewport = window.matchMedia("(max-width: 760px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finishPreloader = () => {
  document.documentElement.classList.remove("is-preloading");
  window.setTimeout(() => document.querySelector(".preloader")?.remove(), 200);
};
// Keep cached loads brief; the head script caps slower loads at 1.4 seconds.
const revealPortfolio = () => {
  const delay = reducedMotion.matches ? 0 : Math.max(0, 280 - performance.now());
  window.setTimeout(finishPreloader, delay);
};
if (document.readyState === "complete") revealPortfolio();
else window.addEventListener("load", revealPortfolio, { once: true });
window.addEventListener("pageshow", (event) => {
  if (event.persisted) finishPreloader();
});
const typewriter = document.querySelector(".typewriter-live");
const typewriterPhrases = [
  "websites that drive results.",
  "web products that scale.",
  "CRM systems that work.",
  "dashboards that simplify.",
];
let typingTimer;
let typingVisible = true;
let typingScrollUntil = 0;
let phraseIndex = 0;
let characterCount = typewriterPhrases[0].length;
let deleting = true;
const scheduleTyping = (delay = 1400) => {
  window.clearTimeout(typingTimer);
  if (!typewriter || !typingVisible || document.hidden || reducedMotion.matches) return;
  typingTimer = window.setTimeout(typeNextCharacter, delay);
};
const typeNextCharacter = () => {
  if (performance.now() < typingScrollUntil) {
    scheduleTyping(180);
    return;
  }
  const phrase = typewriterPhrases[phraseIndex];
  characterCount += deleting ? -1 : 1;
  typewriter.textContent = phrase.slice(0, characterCount);
  let delay = deleting ? 35 : 65;
  if (deleting && characterCount === 0) {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % typewriterPhrases.length;
    delay = 280;
  } else if (!deleting && characterCount === phrase.length) {
    deleting = true;
    delay = 1400;
  }
  scheduleTyping(delay);
};
if (typewriter) {
  new IntersectionObserver(([entry]) => {
    typingVisible = entry.isIntersecting;
    scheduleTyping();
  }).observe(document.querySelector(".typewriter-text"));
  document.addEventListener("visibilitychange", () => scheduleTyping());
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) typewriter.textContent = typewriterPhrases[0];
    phraseIndex = 0;
    characterCount = typewriterPhrases[0].length;
    deleting = true;
    scheduleTyping();
  });
}
let headerSpace = 120;
const updateHeaderSpace = () => {
  if (!header) return;
  const top = Number.parseFloat(window.getComputedStyle(header).top) || 0;
  headerSpace = Math.ceil(header.getBoundingClientRect().height + top + 12);
  document.documentElement.style.setProperty("--header-space", `${headerSpace}px`);
};
if (header) {
  new ResizeObserver(updateHeaderSpace).observe(header);
  updateHeaderSpace();
}
let previousScrollY = Math.max(0, window.scrollY);
let scrollDirection = 0;
let directionDistance = 0;
const showHeader = () => {
  header?.classList.remove("header-hidden");
  directionDistance = 0;
};
mobileViewport.addEventListener("change", showHeader);
header?.addEventListener("focusin", showHeader);

backToTop?.addEventListener("click", () => {
  showHeader();
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "instant" : "smooth" });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    showHeader();
    const offset = headerSpace;
    const targetY = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top: Math.max(targetY, 0),
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
    history.pushState(null, "", targetId);
  });
});

let scrollFramePending = false;
let backToTopVisible = false;
const updateScrollControls = () => {
  scrollFramePending = false;
  const currentScrollY = Math.max(0, window.scrollY);
  const visible = currentScrollY > 520;
  if (visible !== backToTopVisible) {
    backToTop?.classList.toggle("is-visible", visible);
    backToTopVisible = visible;
  }
  if (header && mobileViewport.matches) {
    const delta = currentScrollY - previousScrollY;
    const direction = Math.sign(delta);
    if (direction && direction !== scrollDirection) {
      directionDistance = 0;
      scrollDirection = direction;
    }
    directionDistance += Math.abs(delta);
    if (currentScrollY <= 24) {
      showHeader();
    } else if (directionDistance >= 12) {
      const hide = direction > 0 && currentScrollY > 120 &&
        !header.contains(document.activeElement);
      header.classList.toggle("header-hidden", hide);
      directionDistance = 0;
    }
  }
  previousScrollY = currentScrollY;
};
window.addEventListener("scroll", () => {
  typingScrollUntil = performance.now() + 180;
  if (scrollFramePending) return;
  scrollFramePending = true;
  window.requestAnimationFrame(updateScrollControls);
}, { passive: true });
updateScrollControls();
