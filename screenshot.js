const messages = {
  vi: {
    title: "Chụp màn hình", crop: "Dùng vùng đã chọn", full: "Dùng toàn bộ ảnh",
    arrow: "Mũi tên", text: "Văn bản", arrowColor: "Màu mũi tên", textColor: "Màu chữ",
    undo: "Hoàn tác", save: "Tải PNG", copyImage: "Sao chép ảnh", close: "Đóng",
    loading: "Đang mở ảnh chụp…", cropHint: "Kéo chuột trên ảnh để chọn vùng cần giữ.",
    arrowHint: "Kéo từ đuôi đến đầu mũi tên.", textHint: "Bấm vị trí muốn đặt chữ.",
    textEntry: "Nhập chữ tại đây. Nhấn Enter để lưu hoặc Esc để hủy.",
    copied: "Đã sao chép ảnh",
    copyError: "Không sao chép được ảnh. Bạn có thể tải PNG.",
    loadError: "Không mở được ảnh. Hãy chụp lại từ tab nguồn.",
    saveError: "Không tạo được ảnh PNG. Hãy thử lại."
  },
  en: {
    title: "Screenshot", crop: "Use selection", full: "Use entire image",
    arrow: "Arrow", text: "Text", arrowColor: "Arrow color", textColor: "Text color",
    undo: "Undo", save: "Download PNG", copyImage: "Copy image", close: "Close",
    loading: "Opening screenshot…", cropHint: "Drag over the image to select the area to keep.",
    arrowHint: "Drag from the tail to the tip of the arrow.", textHint: "Click where you want to place the text.",
    textEntry: "Type here. Press Enter to apply or Esc to cancel.",
    copied: "Image copied",
    copyError: "Could not copy the image. You can download the PNG.",
    loadError: "Could not open the image. Capture it again from the source tab.",
    saveError: "Could not create the PNG. Try again."
  }
};

let copy = messages.vi;
let parentOrigin;

const get = id => document.getElementById(id);
const canvas = get("image");
const ctx = canvas.getContext("2d");
const hint = get("hint");
const cropButton = get("crop");
const textValue = get("text-value");
const feedback = get("feedback");
const annotations = [];
let image;
let region;
let selection;
let gesture;
let textDraft;
let feedbackTimer;
let mode = "crop";

function point(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.round(Math.max(0, Math.min(canvas.width, (event.clientX - rect.left) * canvas.width / rect.width))),
    y: Math.round(Math.max(0, Math.min(canvas.height, (event.clientY - rect.top) * canvas.height / rect.height)))
  };
}

function bounds(start, end) {
  return {
    x: Math.min(start.x, end.x), y: Math.min(start.y, end.y),
    width: Math.abs(start.x - end.x), height: Math.abs(start.y - end.y)
  };
}

function drawAnnotation(item) {
  ctx.save();
  ctx.fillStyle = item.color;
  ctx.strokeStyle = item.color;
  if (item.kind === "arrow") {
    const { start, end } = item;
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    if (distance < 1) {
      ctx.restore();
      return;
    }
    const dx = (end.x - start.x) / distance;
    const dy = (end.y - start.y) / distance;
    const length = Math.min(distance, item.size * 4);
    const baseX = end.x - dx * length;
    const baseY = end.y - dy * length;
    const wing = length * .44;
    const tail = Math.min(item.size / 2, wing);
    ctx.beginPath();
    ctx.moveTo(start.x - dy * tail, start.y + dx * tail);
    ctx.lineTo(baseX - dy * tail, baseY + dx * tail);
    ctx.lineTo(baseX - dy * wing, baseY + dx * wing);
    ctx.lineTo(end.x, end.y);
    ctx.lineTo(baseX + dy * wing, baseY - dx * wing);
    ctx.lineTo(baseX + dy * tail, baseY - dx * tail);
    ctx.lineTo(start.x + dy * tail, start.y - dx * tail);
    ctx.closePath();
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(1, item.size * .4);
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.fill();
  } else {
    ctx.font = `600 ${item.size}px "Segoe UI", sans-serif`;
    ctx.textBaseline = "top";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(2, item.size * .12);
    const [r, g, b] = item.color.slice(1).match(/../g).map(channel => Number.parseInt(channel, 16));
    ctx.strokeStyle = r * .299 + g * .587 + b * .114 > 170 ? "#2e1b3d" : "#fff";
    ctx.strokeText(item.value, item.start.x, item.start.y);
    ctx.fillText(item.value, item.start.x, item.start.y);
  }
  ctx.restore();
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, region.x, region.y, region.width, region.height, 0, 0, canvas.width, canvas.height);
  if (mode === "crop" && selection?.width && selection?.height) {
    const { x, y, width, height } = selection;
    ctx.fillStyle = "#27163ea0";
    ctx.fillRect(0, 0, canvas.width, y);
    ctx.fillRect(0, y + height, canvas.width, canvas.height - y - height);
    ctx.fillRect(0, y, x, height);
    ctx.fillRect(x + width, y, canvas.width - x - width, height);
    ctx.strokeStyle = "#f5a9e8";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  }
  annotations.forEach(drawAnnotation);
  if (gesture?.kind === "arrow") drawAnnotation(gesture);
}

function finishText(keep = true) {
  if (!textDraft) return;
  const draft = textDraft;
  textDraft = null;
  const value = textValue.value.trim();
  textValue.hidden = true;
  textValue.value = "";
  if (keep && value) addAnnotation({ ...draft, value });
  hint.textContent = copy.textHint;
  redraw();
}

function selectMode(next) {
  finishText();
  mode = next;
  gesture = null;
  get("arrow").setAttribute("aria-pressed", String(mode === "arrow"));
  get("text").setAttribute("aria-pressed", String(mode === "text"));
  hint.textContent = copy[mode + "Hint"];
  redraw();
}

function useRegion(next) {
  region = { ...next };
  canvas.width = region.width;
  canvas.height = region.height;
  get("crop-tools").hidden = true;
  get("edit-tools").hidden = false;
  selectMode("arrow");
  get("arrow").focus();
}

function addAnnotation(item) {
  annotations.push(item);
  get("undo").disabled = false;
}

function imageSize(cssPixels) {
  return cssPixels * canvas.width / canvas.getBoundingClientRect().width;
}

canvas.addEventListener("pointerdown", event => {
  if (!event.isPrimary || event.button !== 0 || !image) return;
  const start = point(event);
  if (mode === "text") {
    // Keep the browser's pointer focus change from overriding the input focus.
    event.preventDefault();
    finishText();
    const rect = canvas.getBoundingClientRect();
    const color = get("text-color").value;
    textDraft = { kind: "text", start, size: imageSize(22), color };
    textValue.style.left = `${start.x / canvas.width * 100}%`;
    textValue.style.top = `${start.y / canvas.height * 100}%`;
    textValue.style.setProperty("--entry-width", `${Math.max(40, rect.width * (1 - start.x / canvas.width))}px`);
    textValue.style.color = color;
    textValue.hidden = false;
    hint.textContent = copy.textEntry;
    textValue.focus();
    return;
  }
  canvas.setPointerCapture(event.pointerId);
  gesture = { kind: mode, pointer: event.pointerId, start, end: start };
  if (mode === "arrow") {
    gesture.color = get("arrow-color").value;
    gesture.size = imageSize(4);
  } else {
    selection = bounds(start, start);
    cropButton.disabled = true;
  }
  redraw();
});

canvas.addEventListener("pointermove", event => {
  if (gesture?.pointer !== event.pointerId) return;
  gesture.end = point(event);
  if (mode === "crop") selection = bounds(gesture.start, gesture.end);
  redraw();
});

canvas.addEventListener("pointerup", event => {
  if (gesture?.pointer !== event.pointerId) return;
  gesture.end = point(event);
  if (gesture.kind === "crop") {
    selection = bounds(gesture.start, gesture.end);
    cropButton.disabled = !selection.width || !selection.height;
  } else if (Math.hypot(gesture.end.x - gesture.start.x, gesture.end.y - gesture.start.y) >= 2) {
    addAnnotation(gesture);
  }
  gesture = null;
  redraw();
});

canvas.addEventListener("lostpointercapture", event => {
  if (gesture?.pointer !== event.pointerId) return;
  if (gesture.kind === "crop") selection = null;
  gesture = null;
  redraw();
});

cropButton.addEventListener("click", () => useRegion(selection));
get("full").addEventListener("click", () => useRegion(region));
get("arrow").addEventListener("click", () => selectMode("arrow"));
get("text").addEventListener("click", () => selectMode("text"));
textValue.addEventListener("blur", () => finishText());
textValue.addEventListener("keydown", event => {
  if (event.isComposing || !["Enter", "Escape"].includes(event.key)) return;
  event.preventDefault();
  finishText(event.key === "Enter");
  get("text").focus();
});
get("undo").addEventListener("click", () => {
  annotations.pop();
  get("undo").disabled = !annotations.length;
  redraw();
});
function report(message) {
  clearTimeout(feedbackTimer);
  feedback.textContent = message;
  feedback.hidden = false;
  feedbackTimer = setTimeout(() => { feedback.hidden = true; }, 2800);
}

function renderPng() {
  finishText();
  gesture = null;
  redraw();
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error()), "image/png");
  });
}

get("copy-image").addEventListener("click", async () => {
  try {
    if (typeof ClipboardItem !== "function" || !navigator.clipboard?.write) throw new Error();
    await navigator.clipboard.write([new ClipboardItem({ "image/png": renderPng() })]);
    report(copy.copied);
  } catch {
    report(copy.copyError);
  }
});

get("save").addEventListener("click", async () => {
  try {
    const blob = await renderPng();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dev-workbench-screenshot.png";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    report(copy.saveError);
  }
});

async function initialize(dataUrl, language) {
  const lang = language === "en" ? "en" : "vi";
  copy = messages[lang];
  document.documentElement.lang = lang;
  document.title = `${copy.title} · Dev Workbench`;
  document.querySelectorAll("[data-label]").forEach(node => {
    const label = copy[node.dataset.label];
    node.title = label;
    node.setAttribute("aria-label", label);
  });
  hint.textContent = copy.loading;
  try {
    const blob = await (await fetch(dataUrl)).blob();
    image = await createImageBitmap(blob);
    region = { x: 0, y: 0, width: image.width, height: image.height };
    canvas.width = region.width;
    canvas.height = region.height;
    get("stage").hidden = false;
    get("crop-tools").hidden = false;
    hint.textContent = copy.cropHint;
    redraw();
  } catch {
    report(copy.loadError);
  }
}

function closeEditor() {
  if (parentOrigin) window.parent.postMessage({ type: "dev-workbench-screenshot-close" }, parentOrigin);
}

get("close-editor").addEventListener("click", closeEditor);
window.addEventListener("keydown", event => {
  if (event.key !== "Escape" || event.defaultPrevented) return;
  if (textDraft) finishText(false);
  else closeEditor();
});

window.addEventListener("message", function receive(event) {
  if (event.source !== window.parent || event.data?.type !== "dev-workbench-screenshot-image") return;
  const { image, language } = event.data;
  if (typeof image !== "string" || !image.startsWith("data:image/png;base64,")) return;
  window.removeEventListener("message", receive);
  parentOrigin = event.origin;
  initialize(image, language);
});
if (window.parent !== window) window.parent.postMessage({ type: "dev-workbench-screenshot-ready" }, "*");
else report(copy.loadError);
