/* ═══════════════════════════════════════════════════════
   Pratik & Rutuja — Wedding site interactions
   + Full audio engine: sound effects for every effect and
     background music that starts when you scroll.
   ═══════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ═══════════════════════════════════════════════════════
     1. SOUND ENGINE — every effect gets a synthesized sound
     (Web Audio API — no external files required)
     ═══════════════════════════════════════════════════════ */
  var Sound = (function () {
    var ctx = null;
    var master = null;
    var bus = null;
    var enabled = true;

    function ensure() {
      if (ctx) {
        if (ctx.state === "suspended" && ctx.resume) ctx.resume();
        return true;
      }
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try {
        ctx = new AC();
      } catch (e) {
        return false;
      }
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
      bus = ctx.createGain();
      bus.gain.value = 0.6;
      bus.connect(master);
      return true;
    }

    function now() {
      return ensure() ? ctx.currentTime : 0;
    }

    function setEnabled(v) {
      enabled = !!v;
      if (master) master.gain.value = enabled ? 0.9 : 0.0001;
    }

    function tone(o) {
      if (!enabled || !ensure()) return null;
      var t = o.when != null ? o.when : ctx.currentTime;
      var dur = o.dur || 0.2;
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = o.type || "sine";
      osc.frequency.setValueAtTime(o.freq, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      var vol = o.vol != null ? o.vol : 0.18;
      var atk = o.attack != null ? o.attack : 0.01;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + atk);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(bus);
      osc.start(t);
      osc.stop(t + dur + 0.06);
      return osc;
    }

    function noise(o) {
      if (!enabled || !ensure()) return;
      var dur = o.dur || 0.3;
      var t = o.when != null ? o.when : ctx.currentTime;
      var size = Math.max(1, Math.floor(ctx.sampleRate * dur));
      var buf = ctx.createBuffer(1, size, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < size; i++) d[i] = Math.random() * 2 - 1;
      var src = ctx.createBufferSource();
      src.buffer = buf;
      var filt = ctx.createBiquadFilter();
      filt.type = o.filterType || "bandpass";
      filt.Q.value = o.q || 1;
      filt.frequency.setValueAtTime(o.freq || 800, t);
      if (o.to) filt.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(
        o.vol != null ? o.vol : 0.18,
        t + 0.02
      );
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(filt);
      filt.connect(g);
      g.connect(bus);
      src.start(t);
      src.stop(t + dur + 0.05);
    }

    return {
      ensure: ensure,
      now: now,
      setEnabled: setEnabled,
      isEnabled: function () {
        return enabled;
      },
      /* soft sustained note for the ambient music fallback */
      pad: function (freq, dur, vol, when) {
        tone({
          freq: freq,
          dur: dur,
          vol: vol,
          type: "sine",
          attack: Math.max(0.2, dur * 0.35),
          when: when,
        });
      },
      /* generic UI */
      click: function () {
        tone({ freq: 620, to: 900, dur: 0.09, type: "triangle", vol: 0.11 });
      },
      softClick: function () {
        tone({ freq: 300, to: 240, dur: 0.07, vol: 0.07 });
      },
      /* toast / confirmation */
      ding: function () {
        var t = now();
        tone({ freq: 880, dur: 0.4, vol: 0.14, when: t });
        tone({ freq: 1318.5, dur: 0.5, vol: 0.09, when: t + 0.07 });
      },
      /* planes / links / share */
      whoosh: function (v) {
        noise({ freq: 280, to: 2400, dur: 0.55, vol: v || 0.08, q: 0.8 });
      },
      plane: function () {
        noise({ freq: 420, to: 1500, dur: 1.2, vol: 0.045, q: 0.6 });
      },
      /* tapping the couple */
      heart: function () {
        var t = now();
        [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
          tone({ freq: f, dur: 0.34, vol: 0.13, when: t + i * 0.055 });
        });
      },
      /* tapping the cat */
      meow: function () {
        var t = now();
        tone({
          freq: 620,
          to: 880,
          dur: 0.18,
          type: "sawtooth",
          vol: 0.06,
          when: t,
        });
        tone({
          freq: 760,
          to: 520,
          dur: 0.24,
          type: "triangle",
          vol: 0.055,
          when: t + 0.15,
        });
      },
      /* flipping a card */
      flip: function () {
        noise({ freq: 1100, to: 380, dur: 0.24, vol: 0.08, q: 0.7 });
      },
      /* ticking a bag-check box */
      tick: function () {
        tone({ freq: 1500, to: 950, dur: 0.05, type: "square", vol: 0.06 });
      },
      /* stamping / claiming a seat */
      stamp: function () {
        tone({ freq: 170, to: 85, dur: 0.24, vol: 0.2 });
        noise({
          freq: 220,
          to: 110,
          dur: 0.2,
          vol: 0.12,
          filterType: "lowpass",
          q: 1,
        });
      },
      /* opening the boarding gate */
      boarding: function () {
        var t = now();
        tone({ freq: 587.33, dur: 0.45, vol: 0.13, when: t });
        tone({ freq: 880, dur: 0.7, vol: 0.13, when: t + 0.3 });
      },
      /* tapping the sun */
      night: function () {
        tone({ freq: 420, to: 190, dur: 0.9, vol: 0.11 });
      },
      day: function () {
        var t = now();
        [392, 523.25, 659.25, 783.99].forEach(function (f, i) {
          tone({ freq: f, dur: 0.42, vol: 0.1, when: t + i * 0.07 });
        });
      },
      /* typewriter blip */
      type: function () {
        tone({
          freq: 820 + Math.random() * 480,
          dur: 0.03,
          type: "square",
          vol: 0.025,
        });
      },
      /* twinkling sparkle */
      sparkle: function () {
        tone({ freq: 1700 + Math.random() * 900, dur: 0.1, vol: 0.03 });
      },
    };
  })();

  /* ═══════════════════════════════════════════════════════
     2. BACKGROUND MUSIC
        Plays audio/perfect.mp3 (Ed Sheeran — Perfect) on a
        loop starting the moment the guest scrolls.
        If that file is not present, a soft romantic ambient
        progression plays instead so music always fills the
        background.
     ═══════════════════════════════════════════════════════ */
  var Music = (function () {
    var el = null;
    var missing = false;
    var wantPlay = false;
    var started = false;
    var targetVol = 0.42;
    var fadeTimer = null;
    var fbTimer = null;
    var fbIndex = 0;
    /* Start "Perfect" from 0:05 (5 seconds) — skips the quiet lead-in */
    var START_AT = 5;
    var seeked = false;
    /* classic romantic progression: G – D – Em – C */
    var FB_CHORDS = [
      { bass: 98.0, notes: [196.0, 246.94, 293.66] },
      { bass: 73.42, notes: [146.83, 185.0, 220.0] },
      { bass: 82.41, notes: [164.81, 196.0, 246.94] },
      { bass: 65.41, notes: [130.81, 164.81, 196.0] },
    ];

    function init() {
      if (el) return el;
      el = document.createElement("audio");
      el.id = "bgMusic";
      el.src = "audio/perfect.mp3";
      el.loop = false; /* we loop manually so each repeat starts at 5s */
      el.preload = "auto";
      el.volume = 0;
      el.setAttribute("playsinline", "");
      el.addEventListener("error", function () {
        missing = true;
        if (wantPlay && Sound.isEnabled()) playFallback();
      });
      /* When the song finishes, loop back to START_AT (still 5s) */
      el.addEventListener("ended", function () {
        if (!started || !Sound.isEnabled()) return;
        try {
          el.currentTime = START_AT;
        } catch (e) {
          /* ignore */
        }
        el.play().catch(function () {
          /* ignore */
        });
      });
      document.body.appendChild(el);
      return el;
    }

    function fade(media, target, ms) {
      clearInterval(fadeTimer);
      var step = 50;
      var steps = Math.max(1, Math.round(ms / step));
      var delta = (target - media.volume) / steps;
      fadeTimer = setInterval(function () {
        var v = media.volume + delta;
        if ((delta >= 0 && v >= target) || (delta < 0 && v <= target)) {
          media.volume = Math.max(0, Math.min(1, target));
          clearInterval(fadeTimer);
        } else {
          media.volume = Math.max(0, Math.min(1, v));
        }
      }, step);
    }

    function playFallback() {
      if (fbTimer) return;
      if (!Sound.isEnabled()) return;
      function chord() {
        if (!Sound.isEnabled()) return;
        var t = Sound.now();
        var c = FB_CHORDS[fbIndex % FB_CHORDS.length];
        Sound.pad(c.bass, 3.6, 0.06, t);
        c.notes.forEach(function (n, i) {
          Sound.pad(n, 3.2, 0.04, t + i * 0.06);
        });
        fbIndex++;
      }
      chord();
      fbTimer = setInterval(chord, 3400);
    }

    function stopFallback() {
      clearInterval(fbTimer);
      fbTimer = null;
    }

    var starting = false;

    function go(a) {
      var p = a.play();
      if (p && p.then) {
        p.then(function () {
          starting = false;
          fade(a, targetVol, 2600);
        }).catch(function () {
          starting = false;
          /* autoplay blocked — retried on next gesture */
        });
      } else {
        starting = false;
        fade(a, targetVol, 2600);
      }
    }

    /* Seek to START_AT, wait for the seek to apply, THEN play —
       so the song never plays from 0 */
    function begin(a) {
      if (starting) return;
      starting = true;
      if (seeked) {
        go(a);
        return;
      }
      try {
        a.currentTime = START_AT;
      } catch (e) {
        /* ignore */
      }
      seeked = true;
      var done = false;
      function onSeek() {
        if (done) return;
        done = true;
        a.removeEventListener("seeked", onSeek);
        go(a);
      }
      a.addEventListener("seeked", onSeek);
      /* fallback if no seeked event fires */
      setTimeout(onSeek, 300);
    }

    function ready(a, cb) {
      if (a.readyState >= 1) {
        cb();
        return;
      }
      var fired = false;
      function once() {
        if (fired) return;
        fired = true;
        a.removeEventListener("loadedmetadata", once);
        a.removeEventListener("canplay", once);
        cb();
      }
      a.addEventListener("loadedmetadata", once);
      a.addEventListener("canplay", once);
      /* safety: try again shortly even if events were missed */
      setTimeout(function () {
        if (a.readyState >= 1) once();
      }, 1500);
    }

    return {
      /* start (or resume) the background music */
      play: function () {
        var a = init();
        wantPlay = true;
        started = true;
        if (missing) {
          if (Sound.isEnabled()) playFallback();
          return;
        }
        /* Wait until we can seek, jump to 5s, then start playing */
        ready(a, function () {
          begin(a);
        });
      },
      /* stop the background music */
      stop: function () {
        if (el) {
          fade(el, 0, 600);
          setTimeout(function () {
            if (el) el.pause();
          }, 650);
        }
        stopFallback();
      },
      isPlaying: function () {
        return started && ((el && !el.paused) || !!fbTimer);
      },
    };
  })();

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

  /* ─────────── Sound toggle ─────────── */
  var soundToggle = document.getElementById("soundToggle");
  function refreshSoundToggle() {
    if (!soundToggle) return;
    var on = Sound.isEnabled();
    soundToggle.textContent = on ? "🔊" : "🔇";
    soundToggle.setAttribute("aria-pressed", on ? "true" : "false");
    soundToggle.setAttribute("aria-label", on ? "Mute sound" : "Unmute sound");
    soundToggle.classList.toggle("muted", !on);
  }
  if (soundToggle) {
    soundToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var on = !Sound.isEnabled();
      Sound.setEnabled(on);
      if (on) {
        Music.play();
      } else {
        Music.stop();
      }
      refreshSoundToggle();
      toast(on ? "Sound on — enjoy the music 🔊" : "Sound muted 🔇");
    });
  }
  refreshSoundToggle();

  /* ─────────── Arm audio on first gesture ─────────── */
  var musicArmed = false;
  function armMusic() {
    if (musicArmed) return;
    musicArmed = true;
    if (Sound.isEnabled()) Music.play();
  }
  function unlockAudio() {
    Sound.ensure();
    armMusic();
  }
  ["pointerdown", "touchstart", "keydown"].forEach(function (ev) {
    window.addEventListener(ev, unlockAudio, { passive: true });
  });

  /* Keep the ambient plane whoosh subtle and occasional */
  if (!reduceMotion) {
    setInterval(function () {
      if (Sound.isEnabled() && !document.hidden) Sound.plane();
    }, 20000);
  }

  /* ─────────── Navbar scroll state + music-on-scroll ─────────── */
  var nav = document.getElementById("nav");
  var scrollIdle = null;
  function onScroll() {
    /* Background music starts the moment the guest scrolls */
    armMusic();

    if (nav) {
      if (window.scrollY > 40) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    }

    /* A soft take-off whoosh at the start of each scroll burst */
    if (Sound.isEnabled()) {
      if (!scrollIdle) Sound.whoosh(0.045);
      clearTimeout(scrollIdle);
      scrollIdle = setTimeout(function () {
        scrollIdle = null;
      }, 500);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ─────────── Mobile nav toggle ─────────── */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.textContent = open ? "✕" : "☰";
      Sound.softClick();
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.textContent = "☰";
        Sound.click();
      }
    });
    document.addEventListener("click", function (e) {
      if (!navLinks.contains(e.target) && e.target !== navToggle) {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.textContent = "☰";
      }
    });
  }

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
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ─────────── Falling petals ─────────── */
  var petalHost = document.getElementById("petals");

  if (petalHost && !reduceMotion) {
    var PETAL_INTERVAL_MS = 2200;
    var MAX_PETALS = 26;

    function spawnPetal() {
      if (petalHost.childElementCount >= MAX_PETALS) return;
      var petal = document.createElement("span");
      petal.className = "petal";
      var size = 8 + Math.random() * 8;
      petal.style.left = Math.random() * 100 + "%";
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
        /* First real gesture — unlock audio and start the music */
        Sound.boarding();
        Sound.ensure();
        musicArmed = true;
        Music.play();

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
        if (charIdx % 3 === 0) Sound.type();
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
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.fontSize = 8 + Math.random() * 12 + "px";
      s.style.animationDuration = 2 + Math.random() * 2 + "s";
      sparkleHost.appendChild(s);
      if (Sound.isEnabled() && Math.random() < 0.25) Sound.sparkle();
      s.addEventListener("animationend", function () {
        s.remove();
      });
    }, 900);
  }

  /* ─────────── Share invitation ─────────── */
  var shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      Sound.whoosh(0.1);
      var shareData = {
        title: "Pratik ♥ Rutuja — Wedding Invitation",
        text: "Board the flight to forever with Pratik & Rutuja — 9 to 10 December 2026, Green Paradise, Arnala. #PRARU",
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
        Sound.softClick();
        guestInput.focus();
        return;
      }
      applyGuestName(name);
      Sound.stamp();
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
        if (b.checked) Sound.tick();
        else Sound.softClick();
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
      Sound.ding();
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

  /* ─────────── Interactive story scene ─────────── */
  var scene = document.getElementById("storyScene");
  if (scene) {
    var sun = scene.querySelector("#sunG");
    if (sun) {
      sun.addEventListener("click", function () {
        var night = scene.classList.toggle("night");
        if (night) Sound.night();
        else Sound.day();
        toast(
          night
            ? "Goodnight from Prats and Ruru 🌙"
            : "Sunrise over the hills ☀️"
        );
      });
    }
    var cat = scene.querySelector("#catG");
    var bubble = scene.querySelector("#catBubble");
    var bubbleTimer;
    if (cat && bubble) {
      cat.addEventListener("click", function () {
        Sound.meow();
        bubble.setAttribute("opacity", "1");
        clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(function () {
          bubble.setAttribute("opacity", "0");
        }, 2600);
      });
    }
    ["#groom", "#bride"].forEach(function (sel) {
      var fig = scene.querySelector(sel);
      if (fig)
        fig.addEventListener("click", function () {
          Sound.heart();
          for (var i = 0; i < 7; i++) {
            (function (n) {
              setTimeout(function () {
                var h = document.createElement("span");
                h.className = "heart-pop";
                h.textContent = ["❤", "💞", "💛", "✨"][n % 4];
                h.style.left = 38 + Math.random() * 24 + "%";
                h.style.top = 40 + Math.random() * 20 + "%";
                scene.appendChild(h);
                h.addEventListener("animationend", function () {
                  h.remove();
                });
              }, n * 90);
            })(i);
          }
        });
    });
  }

  /* ─────────── Story flight map ─────────── */
  var STORIES = [
    {
      e: "👀",
      t: "First Glance",
      d: "Ruru's Diploma Farewell Party. Eyes met across the room, and the universe quietly smiled and booked two seats together.",
      x: "The beginning · 2018",
    },
    {
      e: "💬",
      t: "First Hello",
      d: "One 'hi' turned into a three-hour conversation. The phone battery died, but something else came alive.",
      x: "The takeoff · 2018",
    },
    {
      e: "💍",
      t: "The Proposal",
      d: "Under a string of fairy lights, with a trembling hand, a wobbly voice and a teary 'yes' and the tongue cheekily coming out — the flight to forever was officially booked.",
      x: "Final call · 2022",
    },
    {
      e: "🛫",
      t: "Forever",
      d: "Two families, one date — 10 December 2026. The next chapter begins, and you are all invited aboard.",
      x: "Departure · Dec 2026",
    },
  ];
  var storyCard = document.getElementById("storyCard");
  var stopBtns = document.querySelectorAll(".stop");
  function showStory(idx) {
    if (!storyCard) return;
    var s = STORIES[idx];
    storyCard.classList.add("fading");
    setTimeout(function () {
      storyCard.innerHTML =
        '<h4><span class="story-emoji">' +
        s.e +
        "</span>" +
        s.t +
        "</h4><p>" +
        s.d +
        '</p><span class="story-date">' +
        s.x +
        "</span>";
      storyCard.classList.remove("fading");
    }, 200);
  }
  stopBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      Sound.click();
      stopBtns.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      showStory(parseInt(btn.dataset.story, 10) || 0);
    });
  });
  showStory(0);

  /* ─────────── Flip cards ─────────── */
  document.querySelectorAll(".flip-card").forEach(function (card) {
    card.addEventListener("click", function () {
      Sound.flip();
      card.classList.toggle("flipped");
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        Sound.flip();
        card.classList.toggle("flipped");
      }
    });
  });

  /* ─────────── Generic button feedback ─────────── */
  document.querySelectorAll(".btn").forEach(function (b) {
    /* the sound toggle and buttons with custom sounds are handled above */
    if (b.id === "introEnter") return;
    b.addEventListener(
      "click",
      function () {
        Sound.click();
      },
      { passive: true }
    );
  });
})();