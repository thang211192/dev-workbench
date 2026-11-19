import { openScreenshotOverlay } from "./screenshot-overlay.js";
import { startColorPicker } from "./color-picker.js";
import { openLinkExtractor } from "./link-extractor.js";
import { setupSeo } from "./seo-meta.js";

const toggle = document.querySelector("#toggle");
const statusLabel = document.querySelector("#status");
const toolStatus = document.querySelector("#tool-status");
const toolList = document.querySelector("#tool-list");
const back = document.querySelector("#back");
const originLabel = document.querySelector("#tab-origin");
const unsupported = document.querySelector("#unsupported");
const error = document.querySelector("#error");
const rules = chrome.declarativeNetRequest;
const language = document.querySelector("#language");
const settingsButton = document.querySelector("#open-settings");
const jsonToggle = document.querySelector("#json-toggle");
const settingsError = document.querySelector("#settings-error");
const labels = [...document.querySelectorAll("[data-key]")];
const messages = {
  vi: {
    ...Object.fromEntries(labels.map(el => [el.dataset.key, el.textContent])),
    on: "Đang bật", off: "Đang tắt", loading: "Đang tải…", failed: "Cần kiểm tra",
    error: "Không thể cập nhật trạng thái. Hãy mở lại tiện ích để thử lại.",
    switchLabel: "Cho phép CORS trong tab này", languageLabel: "Ngôn ngữ"
  },
  en: {
    tools: "Tools", back: "Tools", corsSummary: "Cross-origin API calls in this tab",
    intro: "Allow the page in this tab to load APIs and resources over HTTP or HTTPS.",
    scope: "Where it applies", origin: "Requesting page", tabOnly: "This tab only", destination: "Destination", urls: "Any HTTP/HTTPS URL",
    unsupported: "Open an HTTP or HTTPS page to enable CORS.",
    conditions: "Usage notes", help: "Use fetch or XMLHttpRequest without credentials. If the browser sends an OPTIONS request, the API must return a 2xx status.",
    on: "Enabled", off: "Disabled", loading: "Loading…", failed: "Check status",
    error: "Couldn’t update the status. Reopen the extension to try again.",
    switchLabel: "Allow CORS in this tab", languageLabel: "Language",
    settings: "Settings", jsonSetting: "Automatic JSON viewer",
    jsonSettingHelp: "Highlight JSON and collapse nested sections when you open a URL in a tab.",
    settingsError: "Could not update settings. Reopen the extension to try again.",
    colorSummary: "Pick colors from a web page",
    colorOpenError: "Could not start the color picker on this page. Try another web page.",
    screenshotTitle: "Screenshot", screenshotSummary: "Select a region, draw arrows and add text",
    screenshotError: "Could not open the screenshot editor on this page. Try another web page.",
    linkTitle: "Link Extractor", linkSummary: "Select a block, filter and copy URLs",
    linkError: "Could not open the link extractor on this page.",
    seoSummary: "Inspect SEO on the current page", seoRefresh: "Rescan"
  }
};
let state = "loading";
let page;
let ruleId;
language.value = localStorage.getItem("language") === "en" ? "en" : "vi";

function render() {
  const copy = messages[language.value];
  document.documentElement.lang = language.value;
  labels.forEach(el => { el.textContent = copy[el.dataset.key]; });
  toggle.setAttribute("aria-label", copy.switchLabel);
  language.setAttribute("aria-label", copy.languageLabel);
  settingsButton.setAttribute("aria-label", copy.settings);
  settingsButton.title = copy.settings;
  statusLabel.textContent = copy[state];
  toolStatus.setAttribute("aria-label", copy[state]);
  toolStatus.title = copy[state];
  toolStatus.dataset.state = state;
  error.textContent = copy.error;
}

let activeTool;
document.querySelectorAll("[data-tool]").forEach(button => {
  const view = document.getElementById(button.dataset.tool + "-view");
  button.addEventListener("click", () => {
    activeTool = { button, view };
    toolList.hidden = true;
    back.hidden = false;
    view.hidden = false;
    view.querySelector("h2").focus();
  });
});
back.addEventListener("click", () => {
  activeTool.view.hidden = true;
  back.hidden = true;
  toolList.hidden = false;
  activeTool.button.focus();
});

chrome.storage.local.get({ jsonViewerEnabled: true }).then(({ jsonViewerEnabled }) => {
  jsonToggle.setAttribute("aria-checked", String(jsonViewerEnabled !== false));
  jsonToggle.disabled = false;
}).catch(() => { settingsError.hidden = false; });

jsonToggle.addEventListener("click", async () => {
  const enabled = jsonToggle.getAttribute("aria-checked") === "true";
  jsonToggle.disabled = true;
  settingsError.hidden = true;
  try {
    await chrome.storage.local.set({ jsonViewerEnabled: !enabled });
    jsonToggle.setAttribute("aria-checked", String(!enabled));
  } catch {
    settingsError.hidden = false;
  } finally {
    jsonToggle.disabled = false;
  }
});

const openColorPicker = document.querySelector("#open-color-picker");
const colorOpenError = document.querySelector("#color-open-error");
openColorPicker.addEventListener("click", async () => {
  openColorPicker.disabled = true;
  colorOpenError.hidden = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !/^https?:\/\//i.test(tab.url ?? "")) throw new Error();
    const [target] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => Boolean(globalThis.devWorkbenchColorPicker?.open)
    });
    if (target.result) {
      window.close();
      return;
    }
    const image = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
    const [current] = await chrome.tabs.query({ active: true, windowId: tab.windowId });
    if (current?.id !== tab.id || current.url !== tab.url) throw new Error();
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id, documentIds: [target.documentId] },
      func: startColorPicker,
      args: [image, language.value]
    });
    if (!injection?.result) throw new Error();
    window.close();
  } catch {
    colorOpenError.hidden = false;
  } finally {
    openColorPicker.disabled = false;
  }
});

language.addEventListener("change", () => {
  localStorage.setItem("language", language.value);
  render();
});
render();
setupSeo(language);

const openScreenshot = document.querySelector("#open-screenshot");
const screenshotError = document.querySelector("#screenshot-error");
openScreenshot.addEventListener("click", async () => {
  openScreenshot.disabled = true;
  screenshotError.hidden = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !/^https?:\/\//i.test(tab.url ?? "")) throw new Error();
    const [target] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => Boolean(globalThis.devWorkbenchScreenshot?.open)
    });
    if (target.result) {
      window.close();
      return;
    }
    const image = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
    const [current] = await chrome.tabs.query({ active: true, windowId: tab.windowId });
    if (current?.id !== tab.id || current.url !== tab.url) throw new Error();
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id, documentIds: [target.documentId] },
      func: openScreenshotOverlay,
      args: [chrome.runtime.getURL("screenshot.html"), image, language.value]
    });
    if (!injection?.result) throw new Error();
    window.close();
  } catch {
    screenshotError.hidden = false;
  } finally {
    openScreenshot.disabled = false;
  }
});

const openLinks = document.querySelector("#open-link-extractor");
const linkError = document.querySelector("#link-error");
openLinks.addEventListener("click", async () => {
  openLinks.disabled = true;
  linkError.hidden = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !/^https?:\/\//i.test(tab.url ?? "")) throw new Error();
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id }, func: openLinkExtractor, args: [language.value]
    });
    if (!injection?.result) throw new Error();
    window.close();
  } catch {
    linkError.hidden = false;
  } finally {
    openLinks.disabled = false;
  }
});

async function refresh() {
  const [rule] = await rules.getSessionRules({ ruleIds: [ruleId] });
  const enabled = rule?.action.responseHeaders?.find(header =>
    header.header === "Access-Control-Allow-Origin")?.value === page.origin;
  toggle.setAttribute("aria-checked", String(enabled));
  state = enabled ? "on" : "off";
  render();
  toggle.disabled = false;
}

async function initialize() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  page = tab?.url ? URL.parse(tab.url) : null;
  if (!page || !["http:", "https:"].includes(page.protocol) || !Number.isInteger(tab?.id) || tab.id < 0) {
    state = "off";
    unsupported.hidden = false;
    render();
    return;
  }
  ruleId = tab.id + 1;
  originLabel.textContent = page.origin;
  await refresh();
}

function showError() {
  state = "failed";
  error.hidden = false;
  render();
}

toggle.addEventListener("click", async () => {
  toggle.disabled = true;
  const enabled = toggle.getAttribute("aria-checked") === "true";
  try {
    await rules.updateSessionRules({
      removeRuleIds: [ruleId],
      addRules: enabled ? [] : [{
        id: ruleId,
        action: {
          type: "modifyHeaders",
          responseHeaders: [
            { header: "Access-Control-Allow-Origin", operation: "set", value: page.origin },
            { header: "Access-Control-Allow-Methods", operation: "set", value: "GET, HEAD, POST, PATCH, PUT, DELETE, OPTIONS" },
            { header: "Access-Control-Allow-Headers", operation: "set", value: "*" }
          ]
        },
        condition: {
          tabIds: [ruleId - 1],
          initiatorDomains: [page.hostname],
          resourceTypes: ["xmlhttprequest", "font", "image", "stylesheet", "script", "media"]
        }
      }]
    });
    await refresh();
  } catch {
    showError();
  }
});

initialize().catch(showError);
