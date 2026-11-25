(() => {
  const setting = "tiktokAutoScrollEnabled";
  const durationSetting = "tiktokMaxDurationMinutes";
  const defaultMaxMinutes = 15;
  const cardSelector = "[data-e2e='recommend-list-item-container'], article[id^='one-column-item-']";
  const liveLabels = new Set(["hiện đang live", "đang live", "live now", "is live", "currently live"]);
  const nativeScrollGrace = 500;
  let enabled = false;
  let maxMinutes = defaultMaxMinutes;
  let active;
  let frame = 0;
  let lastSeekInput = -Infinity;
  const observer = new MutationObserver(scheduleCheck);

  function isFeedVisible() {
    return enabled && !document.hidden &&
      /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?(?:foryou|following|friends)?\/?$/i.test(location.pathname);
  }

  function currentCard() {
    const feed = document.getElementById("column-list-container");
    if (!feed) return;
    const bounds = feed.getBoundingClientRect();
    const center = (Math.max(0, bounds.top) + Math.min(innerHeight, bounds.bottom)) / 2;
    return [...feed.children].find(card => {
      if (!card.matches(cardSelector)) return false;
      const rect = card.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.top <= center && rect.bottom > center;
    });
  }

  function track(card) {
    if (card !== active?.card || (card && active.path !== location.pathname)) {
      clearTimeout(active?.timer);
      active = card && { card, path: location.pathname, time: 0, finished: false, advanced: false };
    }
    return active;
  }

  function isLive(card) {
    for (const badge of card.querySelectorAll("span, a, div:not(:has(*)), [aria-label]")) {
      const text = badge.textContent.trim().toLowerCase();
      const aria = badge.getAttribute("aria-label")?.trim().toLowerCase();
      const liveLink = (text === "live" || aria === "live") && badge.closest("a[href$='/live']");
      if ((liveLabels.has(text) || liveLabels.has(aria) || liveLink) &&
          badge.getClientRects().length && getComputedStyle(badge).visibility === "visible") return true;
    }
    return false;
  }

  function advance(state) {
    for (let next = state.card.nextElementSibling; next; next = next.nextElementSibling) {
      if (!next.matches(cardSelector) || !next.getClientRects().length) continue;
      state.advanced = true;
      next.scrollIntoView({ block: "start", inline: "nearest", behavior: "instant" });
      return;
    }
  }

  function check() {
    if (!isFeedVisible()) return;
    const state = track(currentCard());
    if (!state || state.advanced) return;
    const duration = state.card.querySelector("video")?.duration;
    const tooLong = Number.isFinite(duration) && duration > maxMinutes * 60;
    if (tooLong || isLive(state.card) ||
        (state.finished && !state.timer && Math.abs(state.card.getBoundingClientRect().top - state.finishedAt) < 4)) {
      advance(state);
    }
  }

  function scheduleCheck() {
    if (frame || !isFeedVisible()) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      check();
    });
  }

  function onPlayback(event) {
    const video = event.target;
    if (!isFeedVisible() || !(video instanceof HTMLVideoElement)) return;
    const card = video.closest(cardSelector);
    if (!card || card !== currentCard()) return;
    const state = track(card);
    if (state.video !== video || state.source !== video.currentSrc) {
      clearTimeout(state.timer);
      Object.assign(state, { video, source: video.currentSrc, time: 0, finished: false, timer: undefined });
    }
    if (state.advanced || state.finished) return;
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;

    const time = video.currentTime;
    const edge = Math.min(0.5, video.duration / 4);
    if (event.type === "seeking") {
      if (time > edge || state.time < video.duration - edge ||
          performance.now() - lastSeekInput < 750) state.time = 0;
      return;
    }
    if (video.seeking) return;

    const restarted = !video.paused && state.time >= video.duration - edge && time <= edge;
    state.time = time;
    if (event.type !== "ended" && !restarted) return;

    // Let TikTok's own auto-scroll move the feed first when it is enabled.
    state.finished = true;
    state.finishedAt = card.getBoundingClientRect().top;
    state.timer = setTimeout(() => {
      state.timer = undefined;
      check();
    }, nativeScrollGrace);
  }

  function updateEnabled(value) {
    enabled = value !== false;
    track(undefined);
    observer.disconnect();
    if (enabled) {
      observer.observe(document.documentElement, {
        subtree: true, childList: true, characterData: true,
        attributes: true, attributeFilter: ["aria-label", "href"]
      });
      scheduleCheck();
    }
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes[durationSetting]) {
      maxMinutes = changes[durationSetting].newValue ?? defaultMaxMinutes;
      scheduleCheck();
    }
    if (changes[setting]) updateEnabled(changes[setting].newValue);
  });
  chrome.storage.local.get({ [setting]: true, [durationSetting]: defaultMaxMinutes })
    .then(settings => {
      maxMinutes = settings[durationSetting];
      updateEnabled(settings[setting]);
    })
    .catch(() => {});

  document.addEventListener("scroll", scheduleCheck, { capture: true, passive: true });
  document.addEventListener("visibilitychange", () => {
    track(undefined);
    scheduleCheck();
  });
  for (const type of ["pointerdown", "pointerup", "keydown"]) {
    document.addEventListener(type, event => {
      if (event.isTrusted && isFeedVisible()) lastSeekInput = performance.now();
    }, true);
  }
  for (const type of ["timeupdate", "ended", "seeking"]) {
    document.addEventListener(type, onPlayback, true);
  }
  for (const type of ["loadedmetadata", "durationchange"]) {
    document.addEventListener(type, scheduleCheck, true);
  }
})();
