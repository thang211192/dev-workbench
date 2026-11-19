export function openLinkExtractor(language) {
  if (globalThis.devWorkbenchLinkExtractor?.isConnected) return true;

  const copy = language === "en" ? {
    title: "Link Extractor", close: "Close", all: "Entire page", select: "Select a block",
    parent: "Use parent block", picker: "Click a block to select it, or press Esc to cancel.",
    noBlock: "Select a block on the page.", regex: "Filter URL by regex",
    invalid: "Invalid regular expression.", empty: "No matching URLs.",
    results: (count, total) => `${count} / ${total} unique URLs`, output: "URL list",
    copy: "Copy all URLs", copied: "URLs copied.",
    copyError: "Could not copy automatically. The URLs are selected for manual copying."
  } : {
    title: "Lấy liên kết", close: "Đóng", all: "Lấy toàn bộ trang", select: "Chọn khối",
    parent: "Chọn khối cha", picker: "Bấm vào một khối để chọn hoặc nhấn Esc để hủy.",
    noBlock: "Hãy chọn một khối trên trang.", regex: "Lọc URL theo regex",
    invalid: "Biểu thức chính quy không hợp lệ.", empty: "Không có URL phù hợp.",
    results: (count, total) => `${count} / ${total} URL duy nhất`, output: "Danh sách URL",
    copy: "Sao chép tất cả URL", copied: "Đã sao chép URL.",
    copyError: "Không thể tự sao chép. Danh sách đã được bôi chọn để bạn sao chép thủ công."
  };

  const host = document.createElement("div");
  host.style.setProperty("display", "contents", "important");
  globalThis.devWorkbenchLinkExtractor = host;
  const shadow = host.attachShadow({ mode: "closed" });
  const stylesheet = new CSSStyleSheet();
  stylesheet.replaceSync(`
    * { box-sizing: border-box; }
    dialog { position: fixed; max-height: 90dvh; width: min(680px, calc(100vw - 32px)); max-width: none; margin: auto; padding: 0; overflow: auto; border: 1px solid #e9d9f2; border-radius: 16px; background: #fbf7ff; color: #352048; font: 14px/1.5 system-ui, sans-serif; box-shadow: 0 16px 50px #35204833; }
    dialog::backdrop { background: #27163e66; }
    header, .row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
    header { justify-content: space-between; padding: 12px 16px; background: linear-gradient(112deg, #fbe1ef, #ebe1ff); }
    h2 { margin: 0; font-size: 18px; }
    main { display: grid; gap: 10px; padding: 16px; }
    button, input, textarea { font: inherit; color: inherit; }
    button { padding: 6px 10px; border: 1px solid #e9d9f2; border-radius: 7px; background: white; cursor: pointer; }
    button:disabled { opacity: .55; cursor: default; }
    :focus-visible { outline: 2px solid #a33d8c; outline-offset: 2px; }
    label { font-weight: 600; }
    label:has(input) { display: inline-flex; align-items: center; gap: 4px; }
    input[type=checkbox] { accent-color: #6d35a8; }
    input[type=text], textarea { width: 100%; min-width: 0; padding: 8px; border: 1px solid #ddc9e9; border-radius: 8px; background: white; font: 13px/1.5 Consolas, monospace; }
    textarea { height: clamp(100px, 32dvh, 320px); resize: vertical; white-space: pre; }
    input[aria-invalid=true] { border-color: #a5285b; }
    p { margin: 0; color: #695478; overflow-wrap: anywhere; }
    .error { color: #a5285b; }
    .primary { background: #6d35a8; border-color: #6d35a8; color: white; font-weight: 600; }
    .footer { justify-content: space-between; }
    .shield, .outline, .tip { position: fixed; z-index: 2147483647; }
    .shield { inset: 0; cursor: crosshair; }
    .outline { border: 2px solid #9d39c2; background: #c76bdb33; pointer-events: none; }
    .tip { left: 50%; top: 12px; max-width: calc(100vw - 24px); transform: translateX(-50%); padding: 8px 12px; border-radius: 8px; background: #6d35a8; color: white; font: 14px/1.5 system-ui, sans-serif; pointer-events: none; }
    [hidden] { display: none !important; }
  `);
  shadow.adoptedStyleSheets = [stylesheet];

  function append(parent, tag, text) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    parent.append(node);
    return node;
  }

  const dialog = append(shadow, "dialog");
  dialog.lang = language === "en" ? "en" : "vi";
  dialog.setAttribute("aria-label", copy.title);
  const header = append(dialog, "header");
  append(header, "h2", copy.title);
  const close = append(header, "button", "×");
  close.title = copy.close;
  close.setAttribute("aria-label", copy.close);
  const main = append(dialog, "main");
  const controls = append(main, "div");
  controls.className = "row";
  const allLabel = append(controls, "label");
  const all = append(allLabel, "input");
  all.type = "checkbox";
  all.checked = true;
  allLabel.append(copy.all);
  const select = append(controls, "button", copy.select);
  const parentButton = append(controls, "button", copy.parent);
  const scope = append(main, "p");
  const regexLabel = append(main, "label", copy.regex);
  regexLabel.htmlFor = "url-regex";
  const regex = append(main, "input");
  regex.id = "url-regex";
  regex.type = "text";
  regex.placeholder = "example\\.com|/docs/";
  regex.spellcheck = false;
  regex.autocomplete = "off";
  const output = append(main, "textarea");
  output.readOnly = true;
  output.wrap = "off";
  output.setAttribute("aria-label", copy.output);
  const footer = append(main, "div");
  footer.className = "row footer";
  const count = append(footer, "p");
  count.setAttribute("role", "status");
  const copyButton = append(footer, "button", copy.copy);
  copyButton.className = "primary";
  const status = append(main, "p");
  status.setAttribute("role", "status");
  status.hidden = true;
  const shield = append(shadow, "div");
  shield.className = "shield";
  shield.hidden = true;
  const outline = append(shadow, "div");
  outline.className = "outline";
  outline.hidden = true;
  const tip = append(shadow, "div", copy.picker);
  tip.className = "tip";
  tip.hidden = true;

  let block;
  let urls = [];
  let picking = false;

  function collect(root) {
    if (!root) return [];
    const anchors = Array.from(root.querySelectorAll("a[href]"));
    if (root instanceof Element && root.matches("a[href]")) anchors.unshift(root);
    const unique = new Set();
    for (const anchor of anchors) {
      const url = URL.parse(anchor.getAttribute("href"), anchor.baseURI);
      if (url) unique.add(url.href);
    }
    return [...unique];
  }

  function filter() {
    status.hidden = true;
    count.classList.remove("error");
    regex.removeAttribute("aria-invalid");
    let matched = urls;
    try {
      if (regex.value) {
        const pattern = new RegExp(regex.value);
        matched = urls.filter(url => pattern.test(url));
      }
      count.textContent = matched.length ? copy.results(matched.length, urls.length) : copy.empty;
    } catch {
      matched = [];
      count.textContent = copy.invalid;
      count.classList.add("error");
      regex.setAttribute("aria-invalid", "true");
    }
    output.value = matched.join("\n");
    copyButton.disabled = !matched.length;
  }

  function updateScope() {
    if (block && !block.isConnected) block = null;
    parentButton.disabled = all.checked || !block?.parentElement || block === document.body;
    scope.hidden = all.checked;
    scope.textContent = block ? block.localName + (block.id ? "#" + block.id : "") : copy.noBlock;
    urls = collect(all.checked ? document : block);
    filter();
  }

  function elementAt(event) {
    shield.style.pointerEvents = "none";
    const element = document.elementFromPoint(event.clientX, event.clientY);
    shield.style.pointerEvents = "";
    return element !== host ? element : null;
  }

  function endPicking(nextBlock) {
    picking = false;
    shield.hidden = outline.hidden = tip.hidden = true;
    if (nextBlock) {
      block = nextBlock;
      all.checked = false;
    }
    updateScope();
    dialog.showModal();
    select.focus();
  }

  function handleKey(event) {
    if (!picking || event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    endPicking();
  }

  function dispose() {
    window.removeEventListener("keydown", handleKey, true);
    host.remove();
  }

  select.addEventListener("click", () => {
    picking = true;
    dialog.close();
    shield.hidden = tip.hidden = false;
  });
  shield.addEventListener("pointermove", event => {
    const target = elementAt(event);
    outline.hidden = !target;
    if (!target) return;
    const { left, top, width, height } = target.getBoundingClientRect();
    Object.assign(outline.style, { left: left + "px", top: top + "px", width: width + "px", height: height + "px" });
  });
  shield.addEventListener("pointerdown", event => { event.preventDefault(); event.stopPropagation(); });
  shield.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    const target = elementAt(event);
    if (target) endPicking(target);
  });

  all.addEventListener("change", updateScope);
  parentButton.addEventListener("click", () => {
    if (!block?.parentElement) return;
    block = block.parentElement;
    updateScope();
  });
  regex.addEventListener("input", filter);
  copyButton.addEventListener("click", async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(output.value);
      else throw new Error();
      status.textContent = copy.copied;
    } catch {
      output.focus();
      output.select();
      try {
        status.textContent = document.execCommand("copy") ? copy.copied : copy.copyError;
      } catch {
        status.textContent = copy.copyError;
      }
    }
    status.hidden = false;
  });
  close.addEventListener("click", dispose);
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    dispose();
  });
  window.addEventListener("keydown", handleKey, true);
  document.documentElement.append(host);
  updateScope();
  dialog.showModal();
  return true;
}
