(function () {
  var cfg = window.SITE_CONFIG || {};

  // ---- WhatsApp links ----
  function waLink(msg) {
    var wa = cfg.whatsapp || "";
    if (/^https?:\/\//.test(wa)) return wa; // business short link: cannot prefill text
    return "https://wa.me/" + wa + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = waLink(a.getAttribute("data-msg"));
    a.target = "_blank";
    a.rel = "noopener";
  });

  // ---- Town, socials, year ----
  document.querySelectorAll("[data-town]").forEach(function (el) { el.textContent = cfg.town || ""; });
  document.querySelectorAll("[data-instagram]").forEach(function (a) { a.href = cfg.instagram || "#"; });
  document.querySelectorAll("[data-facebook]").forEach(function (a) {
    if (cfg.facebook) a.href = cfg.facebook; else a.hidden = true;
  });
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---- Menu ----
  var menu = document.getElementById("menu");
  var openBtn = document.querySelector(".menu-btn");
  var closeBtn = document.querySelector(".menu-close");
  function setMenu(open) {
    menu.hidden = !open;
    openBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) closeBtn.focus();
  }
  openBtn.addEventListener("click", function () { setMenu(true); });
  closeBtn.addEventListener("click", function () { setMenu(false); openBtn.focus(); });
  menu.addEventListener("click", function (e) {
    if (e.target === menu || e.target.tagName === "A") setMenu(false);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { setMenu(false); openBtn.focus(); } });

  // ---- Testimonials slider ----
  var track = document.querySelector(".slides");
  var dotsBox = document.querySelector(".dots");
  if (track && dotsBox) {
    var slides = track.querySelectorAll(".slide");
    var dots = [];
    slides.forEach(function (s, i) {
      var b = document.createElement("button");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "המלצה " + (i + 1));
      b.addEventListener("click", function () { s.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); });
      dotsBox.appendChild(b);
      dots.push(b);
    });
    function current() {
      var w = track.clientWidth || 1;
      return Math.min(slides.length - 1, Math.round(Math.abs(track.scrollLeft) / w));
    }
    function mark() { var c = current(); dots.forEach(function (d, i) { d.setAttribute("aria-selected", String(i === c)); }); }
    track.addEventListener("scroll", function () { window.requestAnimationFrame(mark); }, { passive: true });
    mark();
  }

  // ---- Contact form -> WhatsApp ----
  var form = document.querySelector(".wa-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameEl = form.elements.namedItem("name"), msgEl = form.elements.namedItem("msg");
      var name = nameEl.value.trim();
      var msg = msgEl.value.trim();
      if (!name) { nameEl.focus(); return; }
      var text = "היי רחלי, שמי " + name + (msg ? ".\n" + msg : ". אשמח לפרטים על הסטודיו 🙂");
      var isBusiness = /^https?:\/\//.test(cfg.whatsapp || "");
      if (isBusiness) {
        // A business short link opens the chat but cannot carry text, so copy it for pasting.
        var note = form.querySelector(".copied-note");
        var done = function () { note.textContent = "ההודעה הועתקה – הדביקו אותה בצ'אט שנפתח 🙂"; };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
      }
      window.open(waLink(text), "_blank", "noopener");
    });
  }
})();

// ---- Accessibility menu (settings kept per visitor) ----
(function () {
  var KEY = "a11y-settings";
  var root = document.documentElement;
  var btn = document.querySelector(".a11y-btn");
  var panel = document.getElementById("a11y-panel");
  if (!btn || !panel) return;
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { state = {}; }

  function apply() {
    root.classList.remove("a11y-font-1", "a11y-font-2");
    if (state.font) root.classList.add("a11y-font-" + state.font);
    ["contrast", "links", "readable", "motion"].forEach(function (k) { root.classList.toggle("a11y-" + k, !!state[k]); });
    panel.querySelectorAll("[data-a11y]").forEach(function (b) {
      var k = b.getAttribute("data-a11y");
      b.setAttribute("aria-pressed", String(!!state[k]));
      if (k === "font") b.textContent = state.font === 2 ? "הגדלת טקסט (x2)" : "הגדלת טקסט";
    });
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function open(v) {
    panel.hidden = !v;
    btn.setAttribute("aria-expanded", String(v));
    if (v) panel.querySelector("[data-a11y]").focus(); else btn.focus();
  }
  btn.addEventListener("click", function () { open(panel.hidden); });
  panel.querySelector(".a11y-close").addEventListener("click", function () { open(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) open(false); });
  panel.querySelectorAll("[data-a11y]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-a11y");
      if (k === "font") state.font = ((state.font || 0) + 1) % 3; else state[k] = !state[k];
      apply();
    });
  });
  panel.querySelector(".a11y-reset").addEventListener("click", function () { state = {}; apply(); });
  apply();
})();

// ---- Keep keyboard focus inside the open site menu ----
(function () {
  var menu = document.getElementById("menu");
  if (!menu) return;
  menu.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var f = menu.querySelectorAll("button, a[href]");
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
