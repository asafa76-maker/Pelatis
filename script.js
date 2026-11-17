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
  document.querySelectorAll("[data-facebook]").forEach(function (a) { a.href = cfg.facebook || "#"; });
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
  closeBtn.addEventListener("click", function () { setMenu(false); });
  menu.addEventListener("click", function (e) {
    if (e.target === menu || e.target.tagName === "A") setMenu(false);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

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
      window.open(waLink(text), "_blank", "noopener");
    });
  }
})();
