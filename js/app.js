const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const slides = [...document.querySelectorAll(".slide")];
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const homeBtn = document.getElementById("home");
const pageNum = document.getElementById("page-num");
const chapter = document.getElementById("chapter");
const progress = document.getElementById("progress-fill");

let index = 0;
let playId = 0;

const fa = new Intl.NumberFormat("fa-IR");

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function cacheTyped(el) {
  if (!el.dataset.full) el.dataset.full = el.textContent.replace(/\s+/g, " ").trim();
}

function finishTyped(el) {
  el.classList.remove("is-typing");
  if (el.dataset.full) el.textContent = el.dataset.full;
}

async function typeChars(el, token) {
  const full = el.dataset.full || "";
  el.textContent = "";
  el.classList.add("is-typing");
  if (REDUCE) {
    finishTyped(el);
    return;
  }
  for (let i = 0; i < full.length; i++) {
    if (token !== playId) return;
    el.textContent = full.slice(0, i + 1);
    await sleep(28);
  }
  if (token !== playId) return;
  finishTyped(el);
}

async function playTyped(slide, token) {
  const nodes = [...slide.querySelectorAll("[data-type]")];
  for (const el of nodes) {
    cacheTyped(el);
    el.textContent = "";
    el.classList.remove("is-typing");
  }
  for (const el of nodes) {
    if (token !== playId) return;
    await typeChars(el, token);
    if (token !== playId) return;
    await sleep(280);
  }
}

async function playChat(slide, token) {
  const bubbles = [...slide.querySelectorAll("[data-chat]")];
  bubbles.forEach((el) => {
    cacheTyped(el);
    el.textContent = "";
    el.classList.remove("is-on", "is-typing");
  });
  for (let i = 0; i < bubbles.length; i++) {
    if (token !== playId) return;
    await sleep(i === 0 ? 500 : 700);
    if (token !== playId) return;
    bubbles[i].classList.add("is-on");
    await typeChars(bubbles[i], token);
  }
}

function countUp(slide) {
  slide.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    if (REDUCE) {
      el.textContent = fa.format(target);
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fa.format(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function show(i) {
  playId += 1;
  const token = playId;
  index = Math.max(0, Math.min(slides.length - 1, i));
  slides.forEach((slide, n) => {
    const on = n === index;
    slide.classList.toggle("is-active", on);
    slide.toggleAttribute("hidden", !on);
  });
  const slide = slides[index];
  slide.scrollTop = 0;
  pageNum.textContent = `${fa.format(index + 1)} / ${fa.format(slides.length)}`;
  chapter.textContent = slide.dataset.kicker || "";
  progress.style.width = `${((index + 1) / slides.length) * 100}%`;
  prevBtn.disabled = index === 0;
  homeBtn.disabled = index === 0;
  nextBtn.hidden = index === slides.length - 1;
  nextBtn.disabled = nextBtn.hidden;
  if (slide.querySelector("[data-type]")) playTyped(slide, token);
  if (slide.querySelector("[data-chat]")) playChat(slide, token);
  countUp(slide);
}

prevBtn.addEventListener("click", () => show(index - 1));
nextBtn.addEventListener("click", () => show(index + 1));
homeBtn.addEventListener("click", () => show(0));

document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea")) return;
  if (e.key === "Home") {
    e.preventDefault();
    show(0);
  }
  if (e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "PageDown") show(index + 1);
  if (e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "PageUp") show(index - 1);
});

show(0);
