(() => {
  const mimeType = document.contentType;
  const isJson = mimeType === "application/json" || mimeType === "text/json" || mimeType.endsWith("+json");
  if (!isJson && mimeType !== "text/plain") return;

  const pre = document.querySelector("body > pre");
  if (!pre || pre.children.length) return;
  const source = pre.textContent;
  try {
    JSON.parse(source);
  } catch {
    return;
  }

  function renderJson() {
    // Preserve the original tokens, including numbers outside JavaScript's safe integer range.
    const tokens = source.match(/"(?:\\[\s\S]|[^"\\])*"|[{}\[\],:]|[^\s{}\[\],:"]+/g);
    const output = document.createDocumentFragment();
    const highlight = tokens.length <= 30000;
    const groups = [];
    let target = output;
    let depth = 0;
    let plainText = "";

    function indent() {
      return "\n" + "  ".repeat(Math.min(depth, 40));
    }

    function flushText() {
      if (plainText) target.append(plainText);
      plainText = "";
    }

    function openGroup(token, label) {
      flushText();
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "dev-workbench-json-toggle";
      toggle.setAttribute("aria-label", label ? `JSON ${label}` : `JSON ${token === "{" ? "{}" : "[]"}`);
      toggle.setAttribute("aria-expanded", "true");

      const children = document.createElement("span");
      children.className = "dev-workbench-json-children";
      const ellipsis = document.createElement("span");
      ellipsis.className = "dev-workbench-json-ellipsis";
      ellipsis.setAttribute("aria-hidden", "true");
      toggle.addEventListener("click", () => {
        children.hidden = !children.hidden;
        toggle.setAttribute("aria-expanded", String(!children.hidden));
      });

      target.append(toggle, token, children, ellipsis);
      groups.push(target);
      target = children;
    }

    tokens.forEach((token, index) => {
      const previous = tokens[index - 1];
      const afterOpening = previous === "{" || previous === "[";
      const closing = token === "}" || token === "]";
      const opening = token === "{" || token === "[";
      if (closing) depth--;
      if (closing ? !afterOpening : afterOpening || previous === ",") {
        plainText += indent();
      } else if (previous === ":") {
        plainText += " ";
      }

      if (closing && !afterOpening) {
        flushText();
        target = groups.pop();
      }
      if (opening) {
        depth++;
        const next = tokens[index + 1];
        if (next !== "}" && next !== "]") {
          openGroup(token, previous === ":" ? tokens[index - 2] : "");
          return;
        }
      }

      let color;
      if (highlight) {
        if (token.startsWith('"')) color = tokens[index + 1] === ":" ? "key" : "string";
        else if (/^[-0-9]/.test(token)) color = "number";
        else if (token === "true" || token === "false" || token === "null") color = "literal";
      }
      if (color) {
        flushText();
        const span = document.createElement("span");
        span.className = "dev-workbench-json-" + color;
        span.textContent = token;
        target.append(span);
      } else {
        plainText += token;
      }
    });

    flushText();
    pre.replaceChildren(output);
    pre.classList.add("dev-workbench-json");
  }

  function applySetting(enabled) {
    const formatted = pre.classList.contains("dev-workbench-json");
    if (enabled && !formatted) {
      renderJson();
    } else if (!enabled && formatted) {
      pre.textContent = source;
      pre.classList.remove("dev-workbench-json");
    }
  }

  let settingChanged = false;
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes.jsonViewerEnabled) return;
    settingChanged = true;
    applySetting(changes.jsonViewerEnabled.newValue !== false);
  });
  chrome.storage.local.get({ jsonViewerEnabled: true }).then(({ jsonViewerEnabled }) => {
    if (!settingChanged) applySetting(jsonViewerEnabled !== false);
  }).catch(() => {});
})();
