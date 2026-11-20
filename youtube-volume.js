(() => {
  const defaults = { youtubeVolumeEnabled: true, youtubeVolumeStep: 5 };
  let settings = { ...defaults, youtubeVolumeEnabled: false };
  let indicator;
  let hideIndicator;

  function showVolume(player, percent) {
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.className = "dev-workbench-youtube-volume";
      indicator.setAttribute("role", "status");
    }
    if (indicator.parentElement !== player) player.append(indicator);
    indicator.textContent = `${percent}%`;
    indicator.hidden = false;
    clearTimeout(hideIndicator);
    hideIndicator = setTimeout(() => { indicator.hidden = true; }, 1200);
  }

  chrome.storage.local.get(defaults).then(values => {
    settings = values;
  }).catch(() => {});

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    for (const key of Object.keys(defaults)) {
      if (changes[key]) settings[key] = changes[key].newValue ?? defaults[key];
    }
  });

  document.addEventListener("wheel", event => {
    if (!settings.youtubeVolumeEnabled || location.pathname !== "/watch" ||
        !event.cancelable || event.ctrlKey || event.shiftKey || event.altKey || event.metaKey ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    const player = event.target.closest?.("#movie_player");
    const video = player?.querySelector("video.html5-main-video");
    if (!video) return;

    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    const current = video.muted ? 0 : video.volume * 100;
    const next = Math.min(100, Math.max(0, Math.round(current + direction * settings.youtubeVolumeStep)));
    if (!video.muted || next > 0) {
      const useFallback = player.dispatchEvent(new CustomEvent("dev-workbench:set-youtube-volume", {
        bubbles: true,
        cancelable: true,
        detail: next
      }));
      if (useFallback) {
        video.volume = next / 100;
        if (video.muted) video.muted = false;
      }
    }
    showVolume(player, next);
  }, { passive: false });
})();
