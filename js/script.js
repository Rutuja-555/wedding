/* ═══════════════════════════════════════════════════════
   Pratik & Rutuja — Wedding site interactions
   ═══════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ─────────── Countdown to Muhurtha ─────────── */
  // Muhurtha: 10 Dec 2026, 12:19 PM IST (UTC+5:30)
  var TARGET = new Date("2026-12-10T12:19:00+05:30").getTime();

  var elDays = document.getElementById("cdDays");
  var elHours = document.getElementById("cdHours");
  var elMins = document.getElementById("cdMins");
  var elSecs = document.getElementById("cdSecs");

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function tick() {
    var now = Date.now();
    var diff = TARGET - now;

    if (diff <= 0) {
      if (elDays) elDays.textContent = "00";
      if (elHours) elHours.textContent = "00";
      if (elMins) elMins.textContent = "00";
      if (elSecs) elSecs.textContent = "00";
      var cd = document.getElementById("countdown");
      if (cd) cd.setAttribute("aria-label", "The wedding day has arrived!");
      return;
    }

    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var secs = Math.floor((diff % 60000) / 1000);

    if (elDays) elDays.textContent = pad(days);
    if (elHours) elHours.textContent = pad(hours);
    if (elMins) elMins.textContent = pad(mins);
    if (elSecs) elSecs.textContent = pad(secs);
  }

  if (elDays) {
    tick();
    setInterval(tick, 1000);
  }

  /* ─────────── Navbar scroll state ─────────── */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ─────────── Scroll reveal ─────────── */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ─────────── Falling petals ─────────── */
  var petalHost = document.getElementById("petals");
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (petalHost && !reduceMotion) {
    var PETAL_INTERVAL_MS = 2200;
    var MAX_PETALS = 26;

    function spawnPetal() {
      if (petalHost.childElementCount >= MAX_PETALS) return;
      var petal = document.createElement("span");
      petal.className = "petal";
      var size = 8 + Math.random() * 8;
      petal.style.left = Math.random() * 100 + "vw";
      petal.style.width = size + "px";
      petal.style.height = size + "px";
      petal.style.animationDuration = 7 + Math.random() * 8 + "s";
      petal.style.opacity = String(0.5 + Math.random() * 0.4);
      petalHost.appendChild(petal);
      petal.addEventListener("animationend", function () {
        petal.remove();
      });
    }

    // Stagger a few initial petals, then keep spawning
    for (var i = 0; i < 6; i++) {
      setTimeout(spawnPetal, i * 700);
    }
    setInterval(spawnPetal, PETAL_INTERVAL_MS);
  }

  /* ─────────── Intro splash — boarding gate ─────────── */
  var intro = document.getElementById("intro");
  var introBtn = document.getElementById("introEnter");
  if (intro) {
    var seen = false;
    try {
      seen = sessionStorage.getItem("pr26IntroSeen") === "1";
    } catch (err) {
      /* storage unavailable */
    }
    if (seen) {
      intro.remove();
    } else if (introBtn) {
      document.body.classList.add("intro-lock");
      introBtn.addEventListener("click", function () {
        try {
          sessionStorage.setItem("pr26IntroSeen", "1");
        } catch (err) {
          /* ignore */
        }
        intro.classList.add("open");
        document.body.classList.remove("intro-lock");
        setTimeout(function () {
          intro.remove();
        }, 1500);
      });
    }
  }

  /* ─────────── Typing effect on hero eyebrow ─────────── */
  var eyebrow = document.querySelector(".hero-eyebrow");
  if (eyebrow && !reduceMotion) {
    var fullText = eyebrow.textContent.trim();
    eyebrow.textContent = "";
    eyebrow.classList.add("typing", "visible");
    var charIdx = 0;
    setTimeout(function () {
      var typeTimer = setInterval(function () {
        charIdx += 1;
        eyebrow.textContent = fullText.slice(0, charIdx);
        if (charIdx >= fullText.length) {
          clearInterval(typeTimer);
          eyebrow.classList.remove("typing");
        }
      }, 45);
    }, 1600);
  }

  /* ─────────── AI sparkles ─────────── */
  var sparkleHost = document.getElementById("sparkles");
  if (sparkleHost && !reduceMotion) {
    setInterval(function () {
      if (sparkleHost.childElementCount > 16) return;
      var s = document.createElement("span");
      s.className = "sparkle";
      s.textContent = Math.random() > 0.5 ? "✦" : "✧";
      s.style.left = Math.random() * 100 + "vw";
      s.style.top = Math.random() * 100 + "vh";
      s.style.fontSize = 8 + Math.random() * 12 + "px";
      s.style.animationDuration = 2 + Math.random() * 2 + "s";
      sparkleHost.appendChild(s);
      s.addEventListener("animationend", function () {
        s.remove();
      });
    }, 900);
  }

  /* ─────────── Toast helper ─────────── */
  var toastEl = document.createElement("div");
  toastEl.className = "toast";
  document.body.appendChild(toastEl);
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ─────────── Share invitation ─────────── */
  var shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var shareData = {
        title: "Pratik ♥ Rutuja — Wedding Invitation",
        text: "Board the flight to forever with Pratik & Rutuja — 7 to 10 December 2026, Green Paradise, Arnala. #PRARU",
        url: window.location.href,
      };
      if (navigator.share) {
        navigator.share(shareData).catch(function () {
          /* user cancelled */
        });
      } else if (navigator.clipboard) {
        navigator.clipboard
          .writeText(shareData.text + " " + shareData.url)
          .then(function () {
            toast("Invitation link copied — #PRARU");
          });
      } else {
        toast("Copy this page's link to share!");
      }
    });
  }

  /* ─────────── Reserved seat — guest name ─────────── */
  var seatBtn = document.getElementById("seatBtn");
  var guestInput = document.getElementById("guestName");
  var seatGuest = document.getElementById("seatGuest");
  var seatNote = document.getElementById("seatNote");
  function applyGuestName(name) {
    if (!seatGuest) return;
    seatGuest.textContent = name;
    if (seatNote)
      seatNote.textContent =
        "Seat A1·B1 is reserved for " +
        name.split(" ")[0] +
        " — welcome aboard! 💛";
  }
  try {
    var savedName = localStorage.getItem("pr26Guest");
    if (savedName && guestInput) {
      guestInput.value = savedName;
      applyGuestName(savedName);
    }
  } catch (err) {
    /* storage unavailable */
  }
  if (seatBtn && guestInput) {
    seatBtn.addEventListener("click", function () {
      var name = guestInput.value.trim();
      if (!name) {
        toast("Please write your name first ✍");
        guestInput.focus();
        return;
      }
      applyGuestName(name);
      try {
        localStorage.setItem("pr26Guest", name);
      } catch (err) {
        /* ignore */
      }
      toast("Seat A1·B1 confirmed for " + name.split(" ")[0] + " 🎟️");
    });
  }

  /* ─────────── Bag check list ─────────── */
  var checkList = document.getElementById("checkList");
  var checkProgress = document.getElementById("checkProgress");
  if (checkList) {
    var boxes = checkList.querySelectorAll('input[type="checkbox"]');
    var savedChecks = {};
    try {
      savedChecks = JSON.parse(localStorage.getItem("pr26Checklist") || "{}");
    } catch (err) {
      savedChecks = {};
    }
    function updateProgress() {
      var done = 0;
      boxes.forEach(function (b) {
        if (b.checked) done += 1;
      });
      if (checkProgress)
        checkProgress.textContent =
          done === boxes.length
            ? "All packed — see you at the gate! ✈"
            : done + " of " + boxes.length + " packed";
    }
    boxes.forEach(function (b) {
      if (savedChecks[b.dataset.item]) b.checked = true;
      b.addEventListener("change", function () {
        savedChecks[b.dataset.item] = b.checked;
        try {
          localStorage.setItem("pr26Checklist", JSON.stringify(savedChecks));
        } catch (err) {
          /* ignore */
        }
        updateProgress();
      });
    });
    updateProgress();
  }

  /* ─────────── Add to calendar (ICS) ─────────── */
  var EVENTS_ICS = {
    Mehendi: { d: "20261207", s: "100000", e: "140000" },
    Engagement: { d: "20261209", s: "080000", e: "110000" },
    Haldi: { d: "20261209", s: "100000", e: "130000" },
    "Cocktail Party": { d: "20261209", s: "180000", e: "220000" },
    Vidhi: { d: "20261210", s: "090000", e: "113000" },
    "Muhurtha — The Wedding": { d: "20261210", s: "121900", e: "140000" },
    Reception: { d: "20261210", s: "160000", e: "200000" },
    Baraat: { d: "20261210", s: "180000", e: "210000" },
  };
  document.querySelectorAll(".event-card").forEach(function (card) {
    var titleEl = card.querySelector("h3");
    if (!titleEl) return;
    var info = EVENTS_ICS[titleEl.textContent.trim()];
    if (!info) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ec-cal";
    btn.textContent = "+ Calendar";
    btn.addEventListener("click", function () {
      var title = titleEl.textContent.trim();
      var ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//PratikRutuja//Wedding//EN",
        "BEGIN:VEVENT",
        "UID:" + info.d + info.s + "@pratik-rutuja",
        "DTSTART;TZID=Asia/Kolkata:" + info.d + "T" + info.s,
        "DTEND;TZID=Asia/Kolkata:" + info.d + "T" + info.e,
        "SUMMARY:" + title + " — Pratik ♥ Rutuja",
        "LOCATION:Green Paradise, Arnala, Virar West",
        "DESCRIPTION:Wedding celebrations #PRARU",
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");
      var blob = new Blob([ics], { type: "text/calendar" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = title.toLowerCase().replace(/[^a-z]+/g, "-") + ".ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast("Added to calendar — see you there! 📅");
    });
    card.appendChild(btn);
  });
})();
