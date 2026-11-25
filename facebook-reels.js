(() => {
  const setting = "facebookReelsEnabled";
  const durationSetting = "facebookReelsMaxDurationMinutes";
  const defaultMaxMinutes = 15;
  const nextLabels = new Set(["next reel", "next video", "reel tiếp theo", "video tiếp theo"]);
  const sponsoredLabels = new Set(["sponsored", "được tài trợ", "được quảng cáo"]);
  let enabled = false;
  let maxMinutes = defaultMaxMinutes;
  let active;
  let lastUserInput = -Infinity;
  let pendingCheck = 0;
  const observer = new MutationObserver(scheduleCheck);

  function updateEnabled(value) {
    enabled = value !== false;
    active = undefined;
    observer.disconnect();
    if (enabled) {
      observer.observe(document.documentElement, {
        subtree: true, childList: true, characterData: true,
        attributes: true, attributeFilter: ["aria-label", "aria-valuetext"]
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

  function isReelsPage() {
    return /^\/(?:reel|reels)(?:\/|$)/.test(location.pathname);
  }

  function canAdvance() {
    return enabled && isReelsPage() && !document.hidden;
  }

  function isVisible(element) {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 &&
      rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth &&
      getComputedStyle(element).visibility === "visible";
  }

  function currentVideo() {
    const center = innerHeight / 2;
    let closest;
    let distance = Infinity;
    let largestArea = 0;
    for (const video of document.querySelectorAll("video")) {
      if (!isVisible(video)) continue;
      const rect = video.getBoundingClientRect();
      const area = (Math.min(rect.right, innerWidth) - Math.max(rect.left, 0)) *
        (Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
      const offset = Math.abs(rect.top + rect.height / 2 - center);
      if (area > largestArea || (area === largestArea && offset < distance)) {
        closest = video;
        distance = offset;
        largestArea = area;
      }
    }
    return closest;
  }

  function advance(video) {
    for (const button of document.querySelectorAll("button, [role='button']")) {
      const label = (button.getAttribute("aria-label") || button.title || "").trim().toLowerCase();
      if (nextLabels.has(label) && !button.disabled &&
          button.getAttribute("aria-disabled") !== "true" && isVisible(button)) {
        button.click();
        return true;
      }
    }

    const rect = video.getBoundingClientRect();
    let next;
    let nextTop = Infinity;
    for (const candidate of document.querySelectorAll("video")) {
      const bounds = candidate.getBoundingClientRect();
      if (bounds.height > 0 && bounds.top >= rect.bottom &&
          bounds.left < rect.right && bounds.right > rect.left && bounds.top < nextTop &&
          getComputedStyle(candidate).visibility === "visible") {
        next = candidate;
        nextTop = bounds.top;
      }
    }
    if (next) {
      next.scrollIntoView({ block: "center", inline: "nearest" });
      return true;
    }

    for (let container = video.parentElement; container; container = container.parentElement) {
      const style = getComputedStyle(container);
      if (!/^(auto|scroll)$/.test(style.overflowY) ||
          !/^(y|block|both)\b/.test(style.scrollSnapType)) continue;
      const before = container.scrollTop;
      container.scrollBy({ top: container.clientHeight, behavior: "instant" });
      return container.scrollTop > before;
    }
    return false;
  }

  function track(video) {
    if (active?.video !== video || active.path !== location.pathname || active.source !== video.currentSrc) {
      active = { video, path: location.pathname, source: video.currentSrc, time: 0, advanced: false };
    }
  }

  function reelCard(video) {
    let card;
    for (let parent = video.parentElement; parent; parent = parent.parentElement) {
      if (parent.matches("main, [role='main'], body") || parent.querySelectorAll("video").length !== 1) break;
      card = parent;
      if (card.matches("article, [role='article']")) break;
    }
    return card;
  }

  function isSponsored(card) {
    if (!card) return false;
    for (const label of card.querySelectorAll("span, a, [aria-label]")) {
      const aria = label.getAttribute("aria-label")?.trim().toLowerCase();
      const text = label.textContent.trim().toLowerCase();
      if ((sponsoredLabels.has(aria) || sponsoredLabels.has(text)) && isVisible(label)) return true;
    }
    return false;
  }

  function exceedsDuration(video, card) {
    const limit = maxMinutes * 60;
    if (Number.isFinite(video.duration) && video.duration > 0) return video.duration > limit;

    // An on-demand stream may expose its timeline before reporting a finite duration.
    const ranges = video.seekable;
    if (ranges.length && ranges.start(0) < 1 && ranges.end(ranges.length - 1) > limit) return true;

    for (const slider of card?.querySelectorAll("[role='slider'][aria-valuetext]") ?? []) {
      const text = slider.getAttribute("aria-valuetext");
      const match = text.match(/^\s*(?:\d+:)?\d+:\d{2}\s*(?:\/|of|trên)\s*((?:\d+:)?\d+:\d{2})\s*$/i);
      if (!match) continue;
      const total = match[1].split(":").reduce((seconds, part) => seconds * 60 + Number(part), 0);
      if (total > limit) return true;
    }
    return false;
  }

  function advanceOnce(video) {
    active.advanced = true;
    if (!advance(video)) active.advanced = false;
  }

  function scheduleCheck() {
    if (pendingCheck || !canAdvance()) return;
    pendingCheck = requestAnimationFrame(() => {
      pendingCheck = 0;
      if (!canAdvance()) return;
      const video = currentVideo();
      if (!video) return;
      track(video);
      if (active.advanced) return;
      const card = reelCard(video);
      if (exceedsDuration(video, card) || isSponsored(card)) advanceOnce(video);
    });
  }

  function onPlayback(event) {
    const video = event.target;
    if (!canAdvance() || !(video instanceof HTMLVideoElement)) return;
    if (event.type === "emptied") {
      if (active?.video === video) active = undefined;
      return;
    }
    if (video !== currentVideo()) return;
    track(video);
    if (active.advanced) return;
    scheduleCheck();
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;

    const time = video.currentTime;
    const edge = Math.min(0.5, video.duration / 4);
    if (event.type === "seeking") {
      // A looping player can seek to the start before the next timeupdate.
      if (time > edge || active.time < video.duration - edge ||
          performance.now() - lastUserInput < 750) active.time = 0;
      return;
    }
    if (video.seeking) return;

    const restarted = !video.paused && active.time >= video.duration - edge && time <= edge;
    active.time = time;
    if (event.type === "ended" || restarted) advanceOnce(video);
  }

  document.addEventListener("visibilitychange", () => {
    if (active) active.time = 0;
    scheduleCheck();
  });
  document.addEventListener("scroll", scheduleCheck, { capture: true, passive: true });
  for (const type of ["loadedmetadata", "durationchange"]) {
    document.addEventListener(type, scheduleCheck, true);
  }
  for (const type of ["pointerdown", "pointerup", "keydown"]) {
    document.addEventListener(type, event => {
      if (event.isTrusted && enabled && isReelsPage()) lastUserInput = performance.now();
    }, true);
  }
  for (const type of ["play", "timeupdate", "ended", "seeking", "emptied"]) {
    document.addEventListener(type, onPlayback, true);
  }
})();
