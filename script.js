const slides = [...document.querySelectorAll(".slide")];
const presentation = document.getElementById("presentation");
const counter = document.getElementById("counter");
const progress = document.getElementById("progress");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const play = document.getElementById("play");
const fullscreen = document.getElementById("fullscreen");
const pentagonAnchors = [[70,12],[84,10],[79,74],[10,76],[78,18],[88,64],[5,28],[85,46],[68,82]];

slides.forEach((slide, slideIndex) => {
  const background = document.createElement("div");
  background.className = "pentagon-background";
  background.setAttribute("aria-hidden", "true");
  for (let item = 0; item < 3; item += 1) {
    const [left, top] = pentagonAnchors[(slideIndex * 2 + item * 3) % pentagonAnchors.length];
    const pentagon = document.createElement("i");
    pentagon.style.setProperty("--left", `${left}%`);
    pentagon.style.setProperty("--top", `${top}%`);
    pentagon.style.setProperty("--rotation", `${(slideIndex * 29 + item * 37) % 90 - 45}deg`);
    background.append(pentagon);
  }
  slide.prepend(background);
});

document.querySelectorAll(".limits > div").forEach((card) => {
  const icon = card.querySelector(".limit-icon");
  if (!icon) return;
  const inner = document.createElement("div"); inner.className = "flip-card-inner";
  const front = document.createElement("div"); front.className = "card-face card-front"; front.append(icon.cloneNode(true));
  const back = document.createElement("div"); back.className = "card-face card-back";
  while (card.firstChild) back.append(card.firstChild);
  inner.append(front, back); card.append(inner); card.classList.add("flip-card");
});

let current = 0;
let playing = false;
let timers = [];
let thanks;
const q = (slide, selector) => [...slide.querySelectorAll(selector)];
const later = (fn, ms) => timers.push(window.setTimeout(fn, ms));
const hide = (items) => items.filter(Boolean).forEach((item) => item.classList.add("play-hidden"));
const reveal = (items) => items.filter(Boolean).forEach((item) => item.classList.remove("play-hidden"));
const clearTimers = () => { timers.forEach(window.clearTimeout); timers = []; };
const resetReveals = () => {
  document.querySelectorAll(".play-hidden").forEach((item) => item.classList.remove("play-hidden"));
  document.querySelectorAll(".flip-card").forEach((item) => item.classList.remove("play-front", "is-flipped"));
  document.querySelectorAll("[data-type-text]").forEach((item) => {
    item.textContent = item.dataset.typeText;
    item.classList.remove("typewriting");
  });
};
const sequence = (items, start, interval, duration, tail = 0) => {
  const step = items.length < 2 ? interval : Math.min(interval, Math.max(0, (duration - tail - start) / (items.length - 1)));
  items.forEach((item, index) => later(() => reveal([item]), start + index * step));
};

function metrics(slide, metricSelector, rowSelector, duration) {
  const cards = q(slide, metricSelector); hide(cards); hide(q(slide, rowSelector));
  cards.forEach((card, index) => {
    const start = 15000 + index * 30000;
    later(() => reveal([card]), start);
    q(card, rowSelector).forEach((row, rowIndex) => later(() => reveal([row]), start + rowIndex * 7500));
  });
  const note = q(slide, ".bottom-note"); hide(note); later(() => reveal(note), duration - 20000);
}

function primeTypewriter(items) {
  items.forEach((item) => {
    item.dataset.typeText ??= item.textContent;
    item.textContent = "";
    item.classList.add("typewriting");
  });
}

function typewrite(item, start, speed = 32) {
  const text = item.dataset.typeText;
  [...text].forEach((character, index) => later(() => { item.textContent += character; }, start + index * speed));
  later(() => item.classList.remove("typewriting"), start + text.length * speed);
}

const plans = [
  { duration: 61500, prepare(slide, d) {
    const eyebrow = q(slide, ".eyebrow");
    const theme = q(slide, ".work-theme");
    const meta = q(slide, ".meta");
    const items = q(slide, ".meta span");
    const typed = [...eyebrow, ...theme, ...items];
    primeTypewriter(typed);
    hide([...eyebrow, ...theme, ...meta, ...items]);
    later(() => { reveal([...eyebrow, ...theme, ...meta]); typewrite(eyebrow[0], 0); typewrite(theme[0], 0); }, 40000);
    items.forEach((item, index) => later(() => { reveal([item]); typewrite(item, 0); }, 50000 + index * 1500));
  } },
  { duration: 45000, prepare(slide, d) {
    const list = q(slide, ".agenda-list"), items = q(slide, ".agenda-list p");
    hide([...list, ...items]); later(() => reveal(list), 10000); sequence(items, 15000, 5000, d, 5000);
  } },
  { duration: 225000, prepare(slide) {
    const cards = q(slide, ".lang-card"), arrows = q(slide, ".language-flow .arrow"), panels = q(slide, ".research-comparison > div"), ref = q(slide, ".research-comparison > div:first-child li"), own = q(slide, ".research-comparison > div:last-child li");
    hide([...cards, ...arrows, ...panels, ...ref, ...own]);
    cards.forEach((card, i) => later(() => { reveal([card]); if (i) reveal([arrows[i - 1]]); }, 45000 + i * 35000));
    ref.forEach((item, i) => later(() => { if (i === 0) reveal(panels); reveal([item, own[i]]); }, 150000 + i * 15000));
  } },
  { duration: 200000, prepare(slide, d) {
    const question = q(slide, "blockquote"), panels = q(slide, ".question-details > div"), hypotheses = q(slide, ".question-details > div:first-child li"), limits = q(slide, ".question-details > div:last-child li");
    hide([...question, ...panels, ...hypotheses, ...limits]); later(() => reveal(question), 5000);
    later(() => reveal([panels[0]]), 60000); later(() => reveal([panels[1]]), 120000);
    sequence(hypotheses, 60000, 20000, d, 80000); sequence(limits, 120000, 20000, d, 20000);
  } },
  { duration: 60000 },
  { duration: 120000, prepare(slide, d) { const items = q(slide, ".method-box"); hide(items); sequence(items, 15000, 35000, d, 35000); } },
  { duration: 155000, prepare(slide, d) { const items = q(slide, ".method-box"); hide(items); sequence(items, 15000, 35000, d, 35000); } },
  { duration: 155000, prepare(slide, d) { const items = q(slide, ".method-box"); hide(items); sequence(items, 15000, 35000, d, 35000); } },
  { duration: 135000, prepare(slide) {
    const table = q(slide, ".result-table"), head = q(slide, ".result-table .row.head"), rows = q(slide, ".result-table .row:not(.head)"); hide([...table, ...head, ...rows]);
    later(() => reveal([table[0], head[0], rows[0]]), 15000); rows.slice(1).forEach((row, i) => later(() => reveal([row]), 45000 + i * 30000));
  } },
  { duration: 155000, prepare(slide, d) { metrics(slide, ".runtime-metric", ".runtime-row", d); } },
  { duration: 155000, prepare(slide, d) { metrics(slide, ".resource-metric", ".resource-row", d); } },
  { duration: 120000, prepare(slide) { const items = q(slide, ".conclusion p"); hide(items); items.forEach((item, i) => later(() => reveal([item]), 10000 + i * 55000)); } },
  { duration: 150000, prepare(slide) {
    const cards = q(slide, ".flip-card"); hide(cards); later(() => { reveal(cards); cards.forEach((card) => card.classList.add("play-front")); }, 5000);
    cards.forEach((card, i) => later(() => card.classList.add("is-flipped"), 10000 + i * 35000));
  } },
  { duration: 60000, prepare(slide) { const outlook = q(slide, ".outlook"); hide(outlook); later(() => reveal(outlook), 10000); } },
  { duration: 10000 },
];

function showSlide(index, auto = false) {
  if (playing && !auto) stopPlay();
  current = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
  counter.textContent = `${current + 1} / ${slides.length}`;
  progress.style.width = `${((current + 1) / slides.length) * 100}%`;
  document.title = `${slides[current].dataset.title} · Crosslinguales RAG`;
  if (auto) preparePlaySlide();
}

function preparePlaySlide() {
  clearTimers(); resetReveals();
  const plan = plans[current] ?? { duration: 30000 };
  plan.prepare?.(slides[current], plan.duration);
  later(() => {
    if (!playing) return;
    if (current < slides.length - 1) showSlide(current + 1, true);
    else showThanks();
  }, plan.duration);
}

function showThanks() {
  if (!playing) return;
  thanks ??= Object.assign(document.createElement("div"), { className: "thanks-overlay", textContent: "Danke!" });
  document.body.append(thanks); requestAnimationFrame(() => thanks.classList.add("visible"));
}

function stopPlay() {
  playing = false; clearTimers(); resetReveals(); presentation.classList.remove("play-mode");
  thanks?.remove(); thanks?.classList.remove("visible");
  play.textContent = "▶"; play.setAttribute("aria-pressed", "false"); play.setAttribute("aria-label", "Play-Modus starten");
}

function startPlay() {
  thanks?.remove(); playing = true; presentation.classList.add("play-mode");
  play.textContent = "❚❚"; play.setAttribute("aria-pressed", "true"); play.setAttribute("aria-label", "Play-Modus pausieren");
  showSlide(current, true);
}

next.addEventListener("click", () => { if (current < slides.length - 1) showSlide(current + 1); });
prev.addEventListener("click", () => { if (current > 0) showSlide(current - 1); });
play.addEventListener("click", () => playing ? stopPlay() : startPlay());
document.addEventListener("keydown", (event) => {
  if (["ArrowRight", "PageDown", " "].includes(event.key)) { event.preventDefault(); if (current < slides.length - 1) showSlide(current + 1); }
  if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); if (current > 0) showSlide(current - 1); }
  if (event.key === "Home") showSlide(0); if (event.key === "End") showSlide(slides.length - 1);
  if (event.key.toLowerCase() === "p") playing ? stopPlay() : startPlay();
  if (event.key.toLowerCase() === "f") toggleFullscreen();
  if (event.key === "Escape" && document.fullscreenElement) document.exitFullscreen();
});
function toggleFullscreen() { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); }
fullscreen.addEventListener("click", toggleFullscreen);
document.addEventListener("dblclick", toggleFullscreen);
showSlide(0);
