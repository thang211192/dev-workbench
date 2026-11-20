document.addEventListener("dev-workbench:set-youtube-volume", event => {
  const player = event.target;
  const percent = event.detail;
  if (location.pathname !== "/watch" || player !== document.getElementById("movie_player") ||
      !Number.isInteger(percent) || percent < 0 || percent > 100 ||
      typeof player.setVolume !== "function" ||
      typeof player.isMuted !== "function" || typeof player.unMute !== "function") return;

  try {
    player.setVolume(percent);
    if (percent > 0 && player.isMuted()) player.unMute();
    event.preventDefault();
  } catch {
    // Let the content script adjust the video directly if the player method fails.
  }
}, true);
