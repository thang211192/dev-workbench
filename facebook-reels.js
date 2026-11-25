(() => {
  const setting = "facebookReelsEnabled";
  const durationSetting = "facebookReelsMaxDurationMinutes";
  const backgroundTargetKey = "devWorkbenchReelsBackgroundTarget";
  const defaultMaxMinutes = 60;
  const nextLabels = new Set(["next reel", "next video", "reel tiếp theo", "video tiếp theo"]);
  const nextCardLabels = new Set(["next card", "thẻ tiếp theo"]);
  const sponsoredLabels = new Set(["sponsored", "được tài trợ", "được quảng cáo"]);
  let enabled = false;
  let maxMinutes = defaultMaxMinutes;
  let active;
  let lastUserInput = -Infinity;
  let pendingCheck = 0;
  let playingAtBlur;
  let continueInBackground = false;
  const observer = new MutationObserver(scheduleCheck);

  function updateEnabled(value) {
    enabled = value !== false;
    active = undefined;
    playingAtBlur = undefined;
    continueInBackground = false;
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
      continueInBackground = enabled && document.hidden &&
        sessionStorage.getItem(backgroundTargetKey) === location.pathname;
      sessionStorage.removeItem(backgroundTargetKey);
    })
    .catch(() => {});

  function isReelsPage() {
    return /^\/(?:reel|reels)(?:\/|$)/.test(location.pathname);
  }

  function canAdvance() {
    return enabled && isReelsPage();
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
    const card = reelCard(video);
    for (const button of document.querySelectorAll("button, [role='button']")) {
      const label = (button.getAttribute("aria-label") || button.title || "").trim().toLowerCase();
      const isNext = nextLabels.has(label) || (nextCardLabels.has(label) && card?.contains(button));
      if (isNext && !button.disabled &&
          button.getAttribute("aria-disabled") !== "true" && isVisible(button)) {
        button.click();
        return true;
      }
    }

    const rect = video.getBoundingClientRect();
    const candidates = [];
    for (const candidate of document.querySelectorAll("video")) {
      const bounds = candidate.getBoundingClientRect();
      if (bounds.height > 0 && bounds.top >= rect.bottom &&
          bounds.left < rect.right && bounds.right > rect.left &&
          getComputedStyle(candidate).visibility === "visible") {
        candidates.push({ video: candidate, top: bounds.top });
      }
    }
    candidates.sort((a, b) => a.top - b.top);
    let next = candidates[0]?.video;
    if (document.hidden && next) {
      // Read sponsorship in the feed before a standalone Reel loses its ad label.
      const playable = candidates.find(candidate => !isSponsored(reelCard(candidate.video)));
      if (playable) {
        next = playable.video;
        if (openNextReel(next)) return true;
      }
    }
    if (next) {
      next.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
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

  function openNextReel(video) {
    const card = reelCard(video);
    if (!card) return false;
    const paths = new Set();
    for (const link of card.querySelectorAll("a[href*='/reel/']")) {
      const url = new URL(link.href);
      if (url.origin === location.origin && /^\/reel\/\d+\/?$/.test(url.pathname)) {
        paths.add(url.pathname.replace(/\/$/, ""));
      }
    }
    if (paths.size !== 1) return false;
    const [path] = paths;
    if (path === location.pathname.replace(/\/$/, "")) return false;
    try {
      if (continueInBackground) sessionStorage.setItem(backgroundTargetKey, path);
    } catch {
      return false;
    }
    location.assign(path);
    return true;
  }

  function isSponsored(card) {
    if (!card) return false;
    for (const label of card.querySelectorAll("span, a, [aria-label]")) {
      const aria = label.getAttribute("aria-label")?.trim().toLowerCase();
      const text = label.textContent.trim().toLowerCase();
      if (!sponsoredLabels.has(aria) && !sponsoredLabels.has(text)) continue;
      if (document.hidden ? !label.closest("[hidden], [aria-hidden='true']") : isVisible(label)) {
        return true;
      }
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
    // Animation frames stop when the browser hides the tab.
    pendingCheck = setTimeout(() => {
      pendingCheck = 0;
      if (!canAdvance()) return;
      const video = currentVideo();
      if (!video) return;
      track(video);
      if (active.advanced) return;
      const card = reelCard(video);
      if (exceedsDuration(video, card) || isSponsored(card)) {
        advanceOnce(video);
        return;
      }
      if (document.hidden && continueInBackground && video.paused &&
          !video.ended && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          !active.backgroundPlayAttempted) {
        active.backgroundPlayAttempted = true;
        video.play().catch(() => {});
      }
    }, 0);
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
    if (event.type === "ended") {
      advanceOnce(video);
      return;
    }
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;

    const now = performance.now();
    const time = video.currentTime;
    const edge = Math.min(0.5, video.duration / 4);
    const wentBack = time < active.time;
    const userSeeking = now - lastUserInput < 750 ||
      (document.hidden && lastUserInput >= active.sampledAt);
    const elapsed = (now - (active.sampledAt ?? now)) / 1000 * video.playbackRate;
    const crossedEnd = active.time + elapsed >= video.duration + time - edge;
    const nearBoundary = active.time >= video.duration - edge && time <= edge;
    const backgroundLoop = document.hidden && ((video.loop && time <= edge) || crossedEnd);
    const restarted = !video.paused && wentBack && !userSeeking && (nearBoundary || backgroundLoop);
    if (restarted) {
      advanceOnce(video);
      return;
    }

    if (event.type === "seeking") {
      active.time = 0;
      active.sampledAt = undefined;
      return;
    }
    if (video.seeking) return;

    active.time = time;
    active.sampledAt = now;
  }

  window.addEventListener("blur", () => {
    if (!canAdvance() || document.hidden) return;
    const video = currentVideo();
    playingAtBlur = video && !video.paused && !video.ended ? video : undefined;
  }, true);

  window.addEventListener("visibilitychange", () => {
    const video = canAdvance() && document.hidden ? currentVideo() : undefined;
    continueInBackground = Boolean(video && !video.ended && (!video.paused || video === playingAtBlur));
    playingAtBlur = undefined;
    if (!document.hidden && active) active.backgroundPlayAttempted = false;
    scheduleCheck();
  }, true);
  document.addEventListener("scroll", scheduleCheck, { capture: true, passive: true });
  for (const type of ["loadedmetadata", "durationchange", "canplay", "pause"]) {
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
