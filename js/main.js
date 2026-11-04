const root = document.documentElement;
root.classList.add("js");
document.getElementById("year").textContent = new Date().getFullYear();

try { localStorage.removeItem("theme"); } catch (e) {}

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const $$ = (sel) => document.querySelectorAll(sel);

// Stagger index for cards and list items
$$(".projects, .stats, .awards, .skills, .social, .timeline").forEach((list) =>
  [...list.children].forEach((li, i) => li.style.setProperty("--i", i)));

// ---- Events & Programs (data comes from js/events.js) ----
(() => {
  const list = document.getElementById("events-list");
  const filters = document.getElementById("event-filters");
  const section = document.getElementById("events");
  if (typeof EVENTS === "undefined" || !EVENTS.length) { section.hidden = true; return; }
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
  const icon = (name) => { const s = document.createElementNS("http://www.w3.org/2000/svg", "svg"); s.setAttribute("class", "icon"); const u = document.createElementNS("http://www.w3.org/2000/svg", "use"); u.setAttribute("href", "#i-" + name); s.append(u); return s; };
  const ytId = (u) => (u.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || [])[1];
  const lb = document.getElementById("lightbox"), lbImg = lb.querySelector("img"), lbCap = lb.querySelector("figcaption");
  let gallery = [], idx = 0;
  const show = (i) => { idx = (i + gallery.length) % gallery.length; lbImg.src = gallery[idx].src; lbImg.alt = gallery[idx].alt; lbCap.textContent = gallery[idx].alt + "  (" + (idx + 1) + "/" + gallery.length + ")"; };
  lb.querySelector(".lb-close").onclick = () => lb.close();
  lb.querySelector(".lb-prev").onclick = () => show(idx - 1);
  lb.querySelector(".lb-next").onclick = () => show(idx + 1);
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  let tx = 0;
  lb.addEventListener("touchstart", (e) => { tx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); }, { passive: true });
  lb.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") show(idx - 1); if (e.key === "ArrowRight") show(idx + 1); });

  EVENTS.forEach((ev, n) => {
    const li = el("li", "event"); li.style.setProperty("--i", n); li.dataset.type = ev.type || "Other";
    const badges = el("div", "badges");
    if (ev.type) badges.append(el("span", "badge", ev.type));
    if (ev.result) badges.append(el("span", "badge win", ev.result));
    li.append(badges, el("h3", "", ev.title));
    const meta = el("div", "e-meta");
    [["calendar", ev.date], ["pin", ev.place]].forEach(([ic, t]) => { if (t) { const s = el("span", "", t); if (ic === "pin") s.prepend(icon("pin")); meta.append(s); } });
    if (meta.children.length) li.append(meta);
    if (ev.description) li.append(el("p", "", ev.description));
    const photos = (ev.photos || []);
    if (photos.length) {
      const grid = el("div", "e-photos");
      const items = photos.map((src, k) => ({ src, alt: ev.title + " photo " + (k + 1) }));
      items.forEach((it, k) => {
        const b = el("button"); b.type = "button"; b.setAttribute("aria-label", "Open " + it.alt);
        const im = el("img"); im.src = it.src; im.alt = it.alt; im.loading = "lazy"; b.append(im);
        b.onclick = () => { gallery = items; show(k); lb.showModal(); };
        grid.append(b);
      });
      li.append(grid);
    }
    const videos = (ev.videos || []);
    if (videos.length) {
      const wrap = el("div", "e-videos");
      videos.forEach((v) => {
        const id = ytId(v);
        if (id) { const f = el("iframe"); f.src = "https://www.youtube-nocookie.com/embed/" + id; f.title = ev.title + " video"; f.loading = "lazy"; f.allowFullscreen = true; f.setAttribute("allow", "accelerometer; encrypted-media; picture-in-picture"); wrap.append(f); }
        else { const vd = el("video"); vd.src = v; vd.controls = true; vd.preload = "metadata"; wrap.append(vd); }
      });
      li.append(wrap);
    }
    list.append(li);
  });

  const types = ["All", ...new Set(EVENTS.map((e) => e.type || "Other"))];
  if (types.length > 2) types.forEach((t, i) => {
    const b = el("button", "", t); b.type = "button"; b.setAttribute("aria-pressed", i === 0);
    b.onclick = () => {
      filters.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      list.querySelectorAll(".event").forEach((li) => { li.hidden = t !== "All" && li.dataset.type !== t; });
    };
    filters.append(b);
  });
})();

// Typing effect for the roles line
const roles = ["Competitive Programmer", "Software Developer", "CSE Student", "Problem Solver"];
const typed = document.getElementById("typed");
if (reduceMotion) {
  typed.textContent = roles[0];
} else {
  let r = 0, c = 0, deleting = false;
  (function tick() {
    const word = roles[r];
    c += deleting ? -1 : 1;
    typed.textContent = word.slice(0, c);
    let delay = deleting ? 40 : 85;
    if (!deleting && c === word.length) { deleting = true; delay = 1400; }
    else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
    setTimeout(tick, delay);
  })();
}

if (!reduceMotion) {
  // Headline appears word by word
  const h1 = document.querySelector(".hero h1");
  h1.innerHTML = h1.textContent.trim().split(/\s+/)
    .map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(" ");

  // Scroll progress bar
  const bar = document.getElementById("progress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Green spotlight that follows the mouse
  if (finePointer) {
    const spot = document.getElementById("spotlight");
    addEventListener("mousemove", (e) => {
      spot.style.setProperty("--mx", e.clientX + "px");
      spot.style.setProperty("--my", e.clientY + "px");
      spot.classList.add("on");
    }, { passive: true });
    document.addEventListener("mouseleave", () => spot.classList.remove("on"));

    // 3D tilt on achievement and rating cards
    $$(".stats a, .stats li > div, .awards li").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const b = card.getBoundingClientRect();
        const x = (e.clientX - b.left) / b.width - 0.5;
        const y = (e.clientY - b.top) / b.height - 0.5;
        card.style.transition = "transform .08s";
        card.style.transform = `perspective(700px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform .4s";
        card.style.transform = "";
      });
    });
  }

  // Floating particles that connect with lines
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  let W, H, dots = [];
  const resize = () => {
    const dpr = devicePixelRatio || 1;
    W = canvas.width = innerWidth * dpr; H = canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(60, Math.floor(innerWidth / 24));
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    }));
  };
  resize();
  addEventListener("resize", resize);
  (function draw() {
    const accent = getComputedStyle(root).getPropertyValue("--accent").trim() || "#22c55e";
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.fillStyle = accent; ctx.strokeStyle = accent;
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > innerWidth) d.vx *= -1;
      if (d.y < 0 || d.y > innerHeight) d.vy *= -1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.arc(d.x, d.y, 1.6, 0, 6.283); ctx.fill();
      for (let j = i + 1; j < dots.length; j++) {
        const o = dots[j], dist = Math.hypot(d.x - o.x, d.y - o.y);
        if (dist < 130) {
          ctx.globalAlpha = (1 - dist / 130) * 0.25;
          ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(o.x, o.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  })();
}

// Heading "decode" effect
function scramble(h) {
  const node = [...h.childNodes].reverse().find((n) => n.nodeType === 3 && n.textContent.trim());
  if (!node) return;
  const text = node.textContent, chars = "01<>/{}#_", t0 = performance.now();
  (function frame(t) {
    const p = Math.min((t - t0) / 650, 1), keep = Math.floor(text.length * p);
    node.textContent = text.split("").map((ch, i) => (i < keep || ch === " " ? ch : chars[Math.floor(Math.random() * chars.length)])).join("");
    if (p < 1) requestAnimationFrame(frame); else node.textContent = text;
  })(t0);
}

// Reveal sections as they scroll into view
const items = $$(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); const h = e.target.querySelector("h2"); if (h) scramble(h); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));

  // Count-up numbers
  const co = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, t0 = performance.now();
      (function step(t) {
        const p = Math.min((t - t0) / 1300, 1);
        if (p < 1) { el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); requestAnimationFrame(step); }
        else { el.textContent = el.dataset.count; el.dataset.done = "1"; }
      })(t0);
      co.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => { el.textContent = "0"; co.observe(el); });
} else {
  items.forEach((el) => el.classList.add("in"));
}

// ---- Upgrades ----
const toastEl = document.getElementById("toast");
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

// Mobile menu
const menuBtn = document.getElementById("menu-toggle");
const nav = document.getElementById("site-nav");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", (e) => { if (e.target.closest("a")) { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); } });

// Highlight the nav link of the section being read
const links = [...nav.querySelectorAll('a[href^="#"]')];
const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      const cur = links.find((a) => a.getAttribute("href") === "#" + e.target.id);
      if (cur && scrollY > 200) document.title = cur.textContent.trim() + " | Avishek Kait";
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
links.forEach((a) => { const t = document.querySelector(a.getAttribute("href")); if (t) spy.observe(t); });
const baseTitle = document.title;
addEventListener("scroll", () => { if (scrollY < 200) document.title = baseTitle; }, { passive: true });

// Back to top
const toTop = document.getElementById("to-top");
addEventListener("scroll", () => toTop.classList.toggle("show", scrollY > 600), { passive: true });
toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

// Copy email
document.getElementById("copy-email").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText("info.avishekkait@gmail.com"); toast("Email copied to clipboard"); }
  catch (e) { toast("Copy failed. Please copy it manually."); }
});

// Contact form: delivered straight to your inbox by FormSubmit (https://formsubmit.co), no key or sign-up.
// The very first message triggers an activation email to you: click the link once.
const FORM_ENDPOINT = "https://formsubmit.co/ajax/info.avishekkait@gmail.com";
// Optional: paste your Web3Forms access key between the quotes to use Web3Forms instead of FormSubmit.
const WEB3FORMS_KEY = "";
document.getElementById("contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target, btn = form.querySelector("button[type=submit]");
  const data = Object.fromEntries(new FormData(form));
  if (data._honey) return; // hidden field that only bots fill in
  const mailto = () => {
    const subject = encodeURIComponent("Portfolio message from " + data.name);
    const body = encodeURIComponent(data.message + "\n\nFrom: " + data.name + " (" + data.email + ")");
    location.href = "mailto:info.avishekkait@gmail.com?subject=" + subject + "&body=" + body;
  };
  btn.disabled = true;
  toast("Sending...");
  try {
    const useW3 = WEB3FORMS_KEY && !WEB3FORMS_KEY.startsWith("YOUR_");
    const subject = "Portfolio message from " + data.name;
    const res = await fetch(useW3 ? "https://api.web3forms.com/submit" : FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(useW3
        ? { access_key: WEB3FORMS_KEY, name: data.name, email: data.email, message: data.message, subject }
        : { name: data.name, email: data.email, message: data.message, _subject: subject, _template: "table", _captcha: "false" }),
    });
    const out = await res.json();
    if (!(out.success === true || out.success === "true")) throw new Error(out.message || "failed");
    form.reset();
    toast("Message sent. Thank you!");
  } catch (err) {
    toast("Could not send directly. Opening your email app...");
    setTimeout(mailto, 900);
  }
  btn.disabled = false;
});

// Magnetic buttons
if (finePointer && !reduceMotion) {
  $$(".btn").forEach((b) => {
    b.addEventListener("mousemove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
    });
    b.addEventListener("mouseleave", () => { b.style.transform = ""; });
  });
}

// Live data: latest GitHub repositories (section stays hidden if the request fails)
fetch("https://api.github.com/users/avishekkait06/repos?sort=updated&per_page=12")
  .then((r) => (r.ok ? r.json() : Promise.reject()))
  .then((repos) => {
    const list = repos.filter((r) => !r.fork).slice(0, 6);
    if (!list.length) return;
    const ul = document.getElementById("repos");
    list.forEach((r, i) => {
      const li = document.createElement("li");
      li.style.setProperty("--i", i);
      const a = document.createElement("a");
      a.href = r.html_url; a.target = "_blank"; a.rel = "noopener";
      const name = document.createElement("strong"); name.textContent = r.name;
      const desc = document.createElement("p"); desc.textContent = r.description || "No description yet.";
      const meta = document.createElement("div"); meta.className = "meta";
      meta.textContent = [r.language, r.stargazers_count ? r.stargazers_count + " stars" : ""].filter(Boolean).join("  ·  ");
      a.append(name, desc, meta); li.append(a); ul.append(li);
    });
    const sec = document.getElementById("github");
    sec.hidden = false;
    if (!("IntersectionObserver" in window) || reduceMotion) sec.classList.add("in");
    else new IntersectionObserver((en, o) => en.forEach((x) => { if (x.isIntersecting) { sec.classList.add("in"); o.disconnect(); } }), { threshold: 0.1 }).observe(sec);
  })
  .catch(() => {});

// Live ratings. The numbers in the HTML are the fallback if a request fails.
function setMax(id, value) {
  const el = document.getElementById(id);
  if (!el || !value || value <= +el.dataset.count) return;
  el.dataset.count = value;
  if (el.dataset.done) el.textContent = value;
}
function showNow(id, text) {
  const el = document.getElementById(id);
  el.textContent = text; el.hidden = false;
}
function fetchJSON(url, ms = 8000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  return fetch(url, { signal: ctl.signal }).then((r) => (r.ok ? r.json() : Promise.reject())).finally(() => clearTimeout(t));
}

// Codeforces: official public API (rank, current + peak rating, contests played)
const $id = (id) => document.getElementById(id);
const cap = (t) => t.replace(/\b\w/g, (c) => c.toUpperCase());
fetchJSON("https://codeforces.com/api/user.info?handles=avishekkait006")
  .then((d) => {
    const u = d.result && d.result[0];
    if (!u || !u.rating) return;
    setMax("cf-max", u.maxRating);
    if (u.rank) $id("cf-title").textContent = cap(u.rank);
    $id("cf-now").textContent = u.rating;
    showNow("cf-live", "● Live from Codeforces");
    // Codeforces allows 1 API call per 2 seconds, so wait before asking for contest history (retry once)
    const loadContests = (tries) => new Promise((res) => setTimeout(res, 2300))
      .then(() => fetchJSON("https://codeforces.com/api/user.rating?handle=avishekkait006"))
      .then((r) => { if (r.result) $id("cf-contests").textContent = r.result.length; })
      .catch(() => (tries > 0 ? loadContests(tries - 1) : null));
    return loadContests(1);
  })
  .catch(() => {});

// CodeChef: no official public API, so try community-run ones in turn (may be slow or offline)
(async () => {
  const urls = [
    "https://codechef-api.vercel.app/handle/avishekkait06",
    "https://coding-platform-profile-api.onrender.com/codechef/avishekkait06/",
  ];
  for (const url of urls) {
    try {
      const d = await fetchJSON(url, 15000);
      const rating = parseInt(d.currentRating || d.rating, 10);
      if (!rating) continue;
      const max = parseInt(d.highestRating || d.highest_rating || d.max_rating, 10) || rating;
      setMax("cc-max", max);
      $id("cc-now").textContent = rating;
      const stars = parseInt(d.stars, 10);
      if (stars) { $id("cc-stars").textContent = stars + "\u2605"; $id("cc-title").textContent = stars + "-Star Coder"; }
      showNow("cc-live", "● Live from CodeChef");
      return;
    } catch (e) {}
  }
})();

// Intro loader
(() => {
  const loader = document.getElementById("loader");
  if (!loader) return;
  const hide = () => { loader.classList.add("done"); setTimeout(() => loader.remove(), 700); };
  if (reduceMotion) return loader.remove();
  const start = performance.now();
  const ready = () => setTimeout(hide, Math.max(0, 900 - (performance.now() - start)));
  document.readyState === "complete" ? ready() : addEventListener("load", ready);
  setTimeout(hide, 3500);
})();

// Use your photo as the browser tab icon (round, cropped to a square). Keeps the AK icon if the photo is missing.
(() => {
  const img = new Image();
  img.onload = () => {
    try {
      const size = 64, cv = document.createElement("canvas");
      cv.width = cv.height = size;
      const ctx = cv.getContext("2d"), side = Math.min(img.width, img.height);
      ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, 6.283); ctx.clip();
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      const link = document.getElementById("favicon");
      link.type = "image/png"; link.href = cv.toDataURL("image/png");
    } catch (e) {}
  };
  img.src = "assets/images/avishek.jpg";
})();

// ---- Problem Solving: contest results from js/events.js, grouped and sorted by position ----
(() => {
  const box = document.getElementById("ps-results");
  if (!box || typeof EVENTS === "undefined") return;
  const rank = (r) => { if (!r) return Infinity; if (/champion|first|winner/i.test(r)) return 1; if (/runner|second/i.test(r)) return 2; const m = String(r).match(/\d+/); return m ? +m[0] : Infinity; };
  const label = (r) => { const n = rank(r); return /champion/i.test(r) ? "Champion" : n === Infinity ? (r || "–") : n + (["th", "st", "nd", "rd"][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || "th"); };
  const main = (e) => /ICPC|IUPC|SZPC|South Zone/i.test(e.title + " " + (e.type || ""));
  const fill = (id, items) => {
    const grp = document.getElementById(id), ol = grp.querySelector("ol");
    if (!items.length) { grp.hidden = true; return; }
    items.sort((a, b) => rank(a.result) - rank(b.result)).forEach((e) => {
      const li = document.createElement("li"), pos = document.createElement("span"), info = document.createElement("div"), t = document.createElement("strong"), m = document.createElement("span");
      pos.className = "ps-pos"; pos.textContent = label(e.result);
      info.className = "ps-info"; t.textContent = e.title; m.textContent = [e.place, e.date].filter(Boolean).join(" · ");
      info.append(t, m); li.append(pos, info); ol.append(li);
    });
  };
  const withResult = EVENTS.filter((e) => e.result);
  fill("ps-main", withResult.filter(main));
  fill("ps-other", withResult.filter((e) => !main(e)));
  box.hidden = !withResult.length;
})();

