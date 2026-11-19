export function openScreenshotOverlay(editorUrl, image, language) {
  if (globalThis.devWorkbenchScreenshot?.isConnected) {
    globalThis.devWorkbenchScreenshot.close();
  }

  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "closed" });
  const dialog = document.createElement("dialog");
  globalThis.devWorkbenchScreenshot = dialog;
  const title = language === "en" ? "Screenshot" : "Chụp màn hình";
  dialog.setAttribute("aria-label", title);
  Object.assign(dialog.style, {
    all: "initial", position: "fixed", inset: "0", margin: "0",
    width: "100vw", height: "100dvh", maxWidth: "none", maxHeight: "none",
    overflow: "hidden", background: "#fbf7ff"
  });

  const frame = document.createElement("iframe");
  frame.src = editorUrl;
  frame.title = title;
  frame.allow = "clipboard-write";
  Object.assign(frame.style, { display: "block", width: "100%", height: "100%", border: "0" });
  dialog.append(frame);
  shadow.append(dialog);
  const url = new URL(editorUrl);
  const editorOrigin = url.protocol + "//" + url.host;

  return new Promise(resolve => {
    const timeout = setTimeout(() => dialog.close(), 5000);

    function receive(event) {
      if (event.source !== frame.contentWindow || event.origin !== editorOrigin) return;
      if (event.data?.type === "dev-workbench-screenshot-ready" && image) {
        frame.contentWindow.postMessage({ type: "dev-workbench-screenshot-image", image, language }, editorOrigin);
        image = null;
        clearTimeout(timeout);
        resolve(true);
      }
      if (event.data?.type === "dev-workbench-screenshot-close") dialog.close();
    }

    dialog.addEventListener("close", () => {
      clearTimeout(timeout);
      window.removeEventListener("message", receive);
      host.remove();
      resolve(false);
    }, { once: true });
    window.addEventListener("message", receive);
    document.documentElement.append(host);
    dialog.showModal();
  });
}
