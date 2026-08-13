const cursor = document.querySelector(".cursor-light");
const header = document.querySelector(".site-header");
let lastScrollY = window.scrollY;

document.body.classList.add("is-loading");

window.addEventListener("load", () => {
  window.setTimeout(() => {
    document.body.classList.add("is-ready");
    document.body.classList.remove("is-loading");
  }, 900);
});

window.addEventListener("pointermove", (event) => {
  if (!cursor) return;
  cursor.style.setProperty("--x", `${event.clientX}px`);
  cursor.style.setProperty("--y", `${event.clientY}px`);
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
    ".section, .case-card, .timeline-item, .education-list article, .service-grid article, .stack-board > div"
  )
  .forEach((element) => observer.observe(element));

window.addEventListener(
  "scroll",
  () => {
    if (!header) return;

    const currentScrollY = window.scrollY;
    const isMobile = window.matchMedia("(max-width: 760px)").matches;

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
