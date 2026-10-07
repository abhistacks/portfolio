const header = document.querySelector(".site-header");
const typewriterText = document.querySelector(".typewriter-text");
const backToTop = document.querySelector(".back-to-top");
const smokeOverlay = document.querySelector(".smoke-overlay");
let lastScrollY = window.scrollY;
let smokeTimeoutId;
let smokeActive = false;

document.body.classList.add("is-loading");

const finishLoading = () => {
  document.body.classList.add("is-ready");
  document.body.classList.remove("is-loading");
};

window.addEventListener("load", () => {
  window.setTimeout(finishLoading, 450);
});

window.setTimeout(finishLoading, 1600);

const typewriterPhrases = [
  "websites that drive results.",
  "web products that scale.",
  "CRM systems that work.",
  "dashboards that simplify.",
];

const startTypewriter = () => {
  if (!typewriterText) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    typewriterText.textContent = typewriterPhrases[0];
    return;
  }

  let phraseIndex = 0;
  let charIndex = typewriterPhrases[0].length;
  let isDeleting = true;

  const tick = () => {
    const phrase = typewriterPhrases[phraseIndex];
    typewriterText.textContent = phrase.slice(0, charIndex);

    if (isDeleting) {
      charIndex -= 1;
    } else {
      charIndex += 1;
    }

    let delay = isDeleting ? 34 : 58;

    if (!isDeleting && charIndex > phrase.length) {
      isDeleting = true;
      delay = 1400;
    }

    if (isDeleting && charIndex < 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % typewriterPhrases.length;
      charIndex = 0;
      delay = 280;
    }

    window.setTimeout(tick, delay);
  };

  window.setTimeout(tick, 1200);
};

startTypewriter();

const triggerSmoke = () => {
  if (!backToTop) return;
  backToTop.classList.remove("is-smoking");
  void backToTop.offsetWidth;
  backToTop.classList.add("is-smoking");
  window.setTimeout(() => backToTop.classList.remove("is-smoking"), 950);
};

const stopFullSmoke = () => {
  smokeActive = false;
  smokeOverlay?.classList.remove("is-active");
  window.clearTimeout(smokeTimeoutId);
};

const startFullSmoke = () => {
  smokeActive = true;
  smokeOverlay?.classList.add("is-active");
  window.clearTimeout(smokeTimeoutId);
  smokeTimeoutId = window.setTimeout(stopFullSmoke, 3200);
};

backToTop?.addEventListener("click", () => {
  startFullSmoke();
  window.scrollTo({ top: 0, behavior: "smooth" });
  window.setTimeout(triggerSmoke, 420);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.14 }
);

document
  .querySelectorAll(
    ".section, .case-card, .timeline-item, .service-grid article, .stack-board > div"
  )
  .forEach((element) => observer.observe(element));

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    header?.classList.remove("header-hidden");
    const offset = window.matchMedia("(max-width: 760px)").matches ? 88 : 120;
    const targetY = target.getBoundingClientRect().top + window.scrollY - offset;

    target.classList.remove("section-focus");
    window.scrollTo({
      top: Math.max(targetY, 0),
      behavior: "smooth",
    });
    window.setTimeout(() => {
      target.classList.add("section-focus");
      window.setTimeout(() => target.classList.remove("section-focus"), 900);
    }, 420);
    history.pushState(null, "", targetId);
  });
});

window.addEventListener(
  "scroll",
  () => {
    if (!header) return;

    const currentScrollY = window.scrollY;
    const isMobile = window.matchMedia("(max-width: 760px)").matches;

    backToTop?.classList.toggle("is-visible", currentScrollY > 520);

    if (smokeActive && currentScrollY < 12) {
      window.setTimeout(stopFullSmoke, 360);
    }

    if (!isMobile || currentScrollY < 24) {
      header.classList.remove("header-hidden");
      lastScrollY = currentScrollY;
      return;
    }

    if (currentScrollY > lastScrollY + 8) {
      header.classList.add("header-hidden");
    } else if (currentScrollY < lastScrollY - 8) {
      header.classList.remove("header-hidden");
    }

    lastScrollY = currentScrollY;
  },
  { passive: true }
);
