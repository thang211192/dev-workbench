(() => {
  const setting = "facebookReelsEnabled";
  const nextLabels = new Set(["next reel", "next video", "reel tiếp theo", "video tiếp theo"]);
  const sponsoredLabels = new Set(["sponsored", "được tài trợ", "được quảng cáo"]);
  let enabled = false;
  let active;
  let lastUserInput = -Infinity;
  let pendingCheck = 0;
  const observer = new MutationObserver(scheduleSponsoredCheck);

  function updateEnabled(value) {
    enabled = value !== false;
    active = undefined;
    observer.disconnect();
    if (enabled) {
      observer.observe(document.documentElement, {
        subtree: true, childList: true, characterData: true,
        attributes: true, attributeFilter: ["aria-label"]
      });
      scheduleSponsoredCheck();
    }
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[setting]) updateEnabled(changes[setting].newValue);
  });
  chrome.storage.local.get({ [setting]: true })
    .then(settings => updateEnabled(settings[setting]))
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
    for (const video of document.querySelectorAll("video")) {
      if (!isVisible(video)) continue;
      const rect = video.getBoundingClientRect();
      const offset = Math.abs(rect.top + rect.height / 2 - center);
      if (offset < distance) {
        closest = video;
        distance = offset;
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
    if (!next) return false;
    next.scrollIntoView({ block: "center", inline: "nearest" });
    return true;
  }

  function track(video) {
    if (active?.video !== video || active.path !== location.pathname || active.source !== video.currentSrc) {
      active = { video, path: location.pathname, source: video.currentSrc, time: 0, advanced: false };
    }
  }

  function isSponsored(video) {
    // Keep labels from other cards and sidebars out of the current Reel.
    let card;
    for (let parent = video.parentElement; parent; parent = parent.parentElement) {
      if (parent.matches("main, [role='main'], body") || parent.querySelectorAll("video").length !== 1) break;
      card = parent;
      if (card.matches("article, [role='article']")) break;
    }
    if (!card) return false;

    for (const label of card.querySelectorAll("span, a, [aria-label]")) {
      const aria = label.getAttribute("aria-label")?.trim().toLowerCase();
      const text = label.textContent.trim().toLowerCase();
      if ((sponsoredLabels.has(aria) || sponsoredLabels.has(text)) && isVisible(label)) return true;
    }
    return false;
  }

  function advanceOnce(video) {
    active.advanced = true;
    if (!advance(video)) active.advanced = false;
  }

  function scheduleSponsoredCheck() {
    if (pendingCheck || !canAdvance()) return;
    pendingCheck = requestAnimationFrame(() => {
      pendingCheck = 0;
      if (!canAdvance()) return;
      const video = currentVideo();
      if (!video) return;
      track(video);
      if (!active.advanced && isSponsored(video)) advanceOnce(video);
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
    scheduleSponsoredCheck();
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
    scheduleSponsoredCheck();
  });
  document.addEventListener("scroll", scheduleSponsoredCheck, { capture: true, passive: true });
  for (const type of ["pointerdown", "pointerup", "keydown"]) {
    document.addEventListener(type, event => {
      if (event.isTrusted && enabled && isReelsPage()) lastUserInput = performance.now();
    }, true);
  }
  for (const type of ["play", "timeupdate", "ended", "seeking", "emptied"]) {
    document.addEventListener(type, onPlayback, true);
  }
})();
