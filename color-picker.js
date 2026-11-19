export async function startColorPicker(image, language) {
  if (globalThis.devWorkbenchColorPicker?.open) return true;

  const messages = language === "en"
    ? {
        pick: "Click a color to copy its HEX code. Press Esc to cancel.",
        copied: hex => `Copied ${hex}`,
        copyError: hex => `Could not copy ${hex}`
      }
    : {
        pick: "Bấm vào màu để sao chép mã HEX. Nhấn Esc để hủy.",
        copied: hex => `Đã sao chép ${hex}`,
        copyError: hex => `Không thể sao chép ${hex}`
      };

  const data = Uint8Array.from(atob(image.slice(image.indexOf(",") + 1)), c => c.charCodeAt(0));
  const bitmap = await createImageBitmap(new Blob([data], { type: "image/png" }));
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  try {
    context.drawImage(bitmap, 0, 0);
  } finally {
    bitmap.close();
  }
  if (globalThis.devWorkbenchColorPicker?.open) return true;
  if (document.hidden) return false;

  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "closed" });
  const dialog = document.createElement("dialog");
  dialog.lang = language;
  dialog.setAttribute("aria-label", messages.pick);
  dialog.style.cssText = "all: initial; position: fixed; inset: 0; margin: 0; width: 100%; height: 100%; max-width: none; max-height: none; overflow: hidden; cursor: crosshair;";
  canvas.style.cssText = "display: block; width: 100%; height: 100%; cursor: crosshair;";
  dialog.append(canvas);
  shadow.append(dialog);
  document.documentElement.append(host);

  function cancelWhenHidden() {
    if (document.hidden) dialog.close();
  }

  dialog.addEventListener("close", () => {
    document.removeEventListener("visibilitychange", cancelWhenHidden);
    window.removeEventListener("resize", close);
    if (globalThis.devWorkbenchColorPicker === dialog) delete globalThis.devWorkbenchColorPicker;
    host.remove();
  }, { once: true });

  function close() {
    dialog.close();
  }

  canvas.addEventListener("click", async event => {
    if (!event.isTrusted || !dialog.open) return;
    const bounds = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width - 1, Math.floor((event.clientX - bounds.left) * canvas.width / bounds.width)));
    const y = Math.max(0, Math.min(canvas.height - 1, Math.floor((event.clientY - bounds.top) * canvas.height / bounds.height)));
    const pixel = context.getImageData(x, y, 1, 1).data;
    const hex = "#" + Array.from(pixel.slice(0, 3), channel =>
      channel.toString(16).padStart(2, "0")).join("").toUpperCase();

    let copied = false;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(hex);
        copied = true;
      }
    } catch {
      // A page's clipboard policy can block the asynchronous API.
    }
    if (!copied && dialog.open) {
      const field = document.createElement("textarea");
      field.value = hex;
      field.style.cssText = "position: absolute; opacity: 0; pointer-events: none;";
      dialog.append(field);
      field.select();
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      } finally {
        field.remove();
      }
    }

    dialog.close();
    globalThis.devWorkbenchColorStatus?.remove();
    const status = document.createElement("div");
    status.lang = language;
    status.setAttribute("role", copied ? "status" : "alert");
    status.style.cssText = "all: initial; position: fixed; right: 16px; bottom: 16px; z-index: 2147483647; padding: 8px 12px; border-radius: 8px; background: #6d35a8; color: white; font: 14px/1.5 system-ui; pointer-events: none;";
    document.documentElement.append(status);
    globalThis.devWorkbenchColorStatus = status;
    requestAnimationFrame(() => { status.textContent = copied ? messages.copied(hex) : messages.copyError(hex); });
    setTimeout(() => {
      status.remove();
      if (globalThis.devWorkbenchColorStatus === status) delete globalThis.devWorkbenchColorStatus;
    }, 3000);
  }, { once: true });

  globalThis.devWorkbenchColorStatus?.remove();
  try {
    dialog.showModal();
  } catch (error) {
    host.remove();
    throw error;
  }
  globalThis.devWorkbenchColorPicker = dialog;
  document.addEventListener("visibilitychange", cancelWhenHidden);
  window.addEventListener("resize", close);
  return true;
}
