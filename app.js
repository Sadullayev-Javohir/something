(() => {
  "use strict";

  // All personal copy lives here or in index.html. No network, tracking, or forms.
  const wishes = [
    {
      title: "Tabassuming hech qachon\nsababsiz qolmasin.",
      description: "Har kuningda ko‘nglingni yorug‘ qiladigan\nkichik bir quvonch topilsin.",
    },
    {
      title: "Orzularing o‘zingdan ham\nbalandroq parvoz qilsin.",
      description: "Har bir kichik qadaming seni\nko‘nglingdagi manzilga yaqinlashtirsin.",
    },
    {
      title: "Qalbing doim\nxotirjam bo‘lsin.",
      description: "Shoshqin dunyo ichida ham o‘zingga\ntegishli sokin bir lahzang bo‘lsin.",
    },
    {
      title: "Ko‘zlaring faqat\nquvonchdan porlasin.",
      description: "Yaxshi xabarlar seni izlab topsin.\nYorug‘ kunlaring ko‘p bo‘lsin.",
    },
    {
      title: "Mehr bersang,\nmehrga duch kel.",
      description: "Atrofing seni borligingcha qadrlaydigan,\nsamimiy insonlarga to‘la bo‘lsin.",
    },
    {
      title: "Eng chiroyli kunlaring\nhali oldinda bo‘lsin.",
      description: "Hayot sen kutmaganingda ham\nsenga go‘zal syurprizlar tayyorlasin.",
    },
  ];

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionToggle = document.querySelector("#motion-toggle");
  const motionNote = document.querySelector("#motion-note");
  let wantsMotion = !reduceMotion.matches;

  function syncMotion() {
    const enabled = wantsMotion && !reduceMotion.matches;
    root.dataset.motion = enabled ? "on" : "off";
    motionToggle.checked = enabled;
    motionToggle.disabled = reduceMotion.matches;
    motionNote.textContent = reduceMotion.matches
      ? "Qurilmangizdagi kamroq harakat sozlamasi hurmat qilinmoqda."
      : "O‘zingga qulay muhitni tanla.";
  }
  syncMotion();
  reduceMotion.addEventListener("change", syncMotion);
  motionToggle.addEventListener("change", () => {
    wantsMotion = motionToggle.checked;
    syncMotion();
  });

  // Seeded placement keeps the composition stable between reloads.
  let seed = 27;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const stars = document.querySelector(".ambient-stars");
  const petals = document.querySelector(".falling-petals");
  for (let index = 0; index < 42; index += 1) {
    const star = document.createElement("span");
    star.className = "ambient-star";
    star.style.cssText = `--x:${random() * 100}%;--y:${random() * 100}%;--size:${random() * 1.7 + 1}px;--duration:${random() * 5 + 4}s;--delay:-${random() * 10}s`;
    stars.append(star);
  }
  for (let index = 0; index < 11; index += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.cssText = `--x:${random() * 95}%;--size:${random() * 8 + 5}px;--duration:${random() * 12 + 19}s;--delay:-${random() * 31}s`;
    petals.append(petal);
  }

  const burstLayer = document.querySelector(".burst-layer");
  function burstFrom(element) {
    if (root.dataset.motion === "off") return;
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    // A bounded set; repeated clicks cannot leave growing particle trees behind.
    burstLayer.replaceChildren();
    for (let index = 0; index < 18; index += 1) {
      const petal = document.createElement("span");
      const angle = (index / 18) * Math.PI * 2;
      const distance = 55 + random() * 90;
      petal.className = "burst-petal";
      petal.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(angle) * distance}px;--dy:${Math.sin(angle) * distance - 45}px;--rotation:${random() * 360}deg`;
      petal.addEventListener("animationend", () => petal.remove(), { once: true });
      burstLayer.append(petal);
    }
  }

  function wireDialog(dialogId, openId, closeId) {
    const dialog = document.getElementById(dialogId);
    const opener = document.getElementById(openId);
    const restorePage = () => {
      document.body.classList.remove("modal-open");
      opener.focus({ preventScroll: true });
    };
    const close = () => {
      dialog.close();
      restorePage();
    };
    opener.addEventListener("click", () => {
      if (dialog.open) return;
      document.body.classList.add("modal-open");
      dialog.showModal();
    });
    document.getElementById(closeId).addEventListener("click", close);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const controls = [...dialog.querySelectorAll(
        'button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]',
      )];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if ((!event.shiftKey && document.activeElement === last) ||
          (event.shiftKey && document.activeElement === first)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      }
    });
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) close();
    });
    dialog.addEventListener("close", restorePage);
  }
  wireDialog("letter-dialog", "open-letter", "close-letter");
  wireDialog("settings-dialog", "open-settings", "close-settings");

  let wishIndex = 0;
  const wishCopy = document.querySelector(".wish-copy");
  const wishTitle = document.querySelector("#wish-title");
  const wishDescription = document.querySelector("#wish-description");
  const wishCounter = document.querySelector("#wish-counter");
  const nextWish = document.querySelector("#next-wish");
  function setLines(element, text) {
    element.replaceChildren();
    text.split("\n").forEach((line, index) => {
      if (index) element.append(document.createElement("br"));
      element.append(document.createTextNode(line));
    });
  }
  nextWish.addEventListener("click", () => {
    wishIndex = (wishIndex + 1) % wishes.length;
    setLines(wishTitle, wishes[wishIndex].title);
    setLines(wishDescription, wishes[wishIndex].description);
    wishCounter.textContent = `${String(wishIndex + 1).padStart(2, "0")} / ${String(wishes.length).padStart(2, "0")}`;
    wishCopy.classList.remove("is-changing");
    // Restart the short, local text reveal without a page-wide animation loop.
    void wishCopy.offsetWidth;
    wishCopy.classList.add("is-changing");
    burstFrom(nextWish);
  });
  wishCopy.addEventListener("animationend", () => wishCopy.classList.remove("is-changing"));

  document.querySelectorAll('input[name="theme"]').forEach((input) => {
    input.addEventListener("change", () => {
      root.dataset.theme = input.value;
      document.querySelector('meta[name="theme-color"]').content =
        input.value === "midnight" ? "#101924" : "#190f16";
    });
  });

  // Original, quiet music-box arpeggio. Starts only after an explicit click.
  const musicButton = document.querySelector("#music-toggle");
  const musicLabel = document.querySelector("#music-label");
  const audioStatus = document.querySelector("#audio-status");
  let context;
  let master;
  let musicEnabled = false;
  let scheduler;
  let nextNoteAt = 0;
  let noteIndex = 0;
  let audioBusy = false;
  const melody = [60, 64, 67, 72, 71, 67, 64, 67, 57, 60, 64, 69, 67, 64, 60, 64, 53, 57, 60, 65, 64, 60, 57, 60, 55, 59, 62, 67, 65, 62, 59, 62];

  function playNote(midi, time) {
    const frequency = 440 * 2 ** ((midi - 69) / 12);
    const voice = context.createGain();
    voice.gain.setValueAtTime(0, time);
    voice.gain.linearRampToValueAtTime(0.115, time + 0.015);
    voice.gain.exponentialRampToValueAtTime(0.001, time + 2.5);
    voice.connect(master);
    [1, 2.002].forEach((ratio, index) => {
      const oscillator = context.createOscillator();
      const partial = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency * ratio;
      partial.gain.value = index === 0 ? 1 : 0.12;
      oscillator.connect(partial);
      partial.connect(voice);
      oscillator.start(time);
      oscillator.stop(time + 2.6);
      oscillator.onended = () => {
        oscillator.disconnect();
        partial.disconnect();
        if (index === 1) voice.disconnect();
      };
    });
  }
  function schedule() {
    if (!musicEnabled || context.state !== "running") return;
    while (nextNoteAt < context.currentTime + 0.15) {
      playNote(melody[noteIndex % melody.length], nextNoteAt);
      nextNoteAt += 0.52;
      noteIndex += 1;
    }
  }
  function stopScheduler() {
    clearInterval(scheduler);
    scheduler = undefined;
  }
  function startScheduler() {
    stopScheduler();
    nextNoteAt = context.currentTime + 0.05;
    schedule();
    scheduler = setInterval(schedule, 100);
  }
  function renderMusicState() {
    musicButton.setAttribute("aria-pressed", String(musicEnabled));
    musicLabel.textContent = musicEnabled ? "Kuyni to‘xtatish" : "Kuy qo‘shish";
  }
  musicButton.addEventListener("click", async () => {
    if (audioBusy) return;
    audioBusy = true;
    musicButton.disabled = true;
    try {
      if (musicEnabled) {
        musicEnabled = false;
        stopScheduler();
        await context.suspend();
      } else {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) throw new Error("Audio is not supported");
        if (!context) {
          context = new AudioContext();
          master = context.createGain();
          master.gain.value = 0.32;
          master.connect(context.destination);
        }
        await context.resume();
        musicEnabled = true;
        if (!document.hidden) startScheduler();
        else await context.suspend();
      }
      audioStatus.textContent = musicEnabled ? "Sokin kuy yoqildi." : "Kuy to‘xtatildi.";
    } catch {
      musicEnabled = false;
      stopScheduler();
      audioStatus.textContent = "Brauzer kuyni yoqa olmadi. Qaytadan urinib ko‘ring.";
    } finally {
      renderMusicState();
      audioBusy = false;
      musicButton.disabled = false;
    }
  });

  async function syncVisibility() {
    root.dataset.paused = String(document.hidden);
    if (!context || !musicEnabled || audioBusy) return;
    stopScheduler();
    try {
      if (document.hidden) await context.suspend();
      else {
        await context.resume();
        if (musicEnabled && !document.hidden) startScheduler();
      }
    } catch {
      musicEnabled = false;
      renderMusicState();
      audioStatus.textContent = "Kuyni qayta yoqish uchun tugmani bosing.";
    }
  }
  document.addEventListener("visibilitychange", syncVisibility);
  window.addEventListener("pagehide", () => {
    stopScheduler();
    if (context) context.suspend().catch(() => {});
  });
  window.addEventListener("pageshow", syncVisibility);
  syncVisibility();
})();
