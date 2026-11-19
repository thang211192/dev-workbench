export function collectSeo() {
  const nodes = selector => [...document.querySelectorAll(selector)];
  const attr = (node, name) => node.getAttribute(name)?.trim() ?? "";
  const resolve = (node, value) => {
    try {
      return value ? new URL(value, node.baseURI).href : "";
    } catch {
      return value;
    }
  };

  const metas = nodes("meta").map(node => ({
    key: attr(node, "name") || attr(node, "property") || attr(node, "itemprop") || attr(node, "http-equiv") || "charset",
    value: attr(node, "content") || attr(node, "charset"),
    url: /^(og:image(?::url|:secure_url)?|og:url|twitter:image(?::src)?)$/i.test(attr(node, "property") || attr(node, "name"))
      ? resolve(node, attr(node, "content")) : ""
  }));
  const meta = key => metas.find(item => item.key.toLowerCase() === key)?.value ?? "";
  const resources = nodes("link").map(node => ({
    rel: attr(node, "rel"), url: resolve(node, attr(node, "href")), type: attr(node, "type")
  }));
  const related = rel => resources.find(item => item.rel.toLowerCase().split(/\s+/).includes(rel))?.url ?? "";
  return {
    url: location.href,
    summary: {
      title: document.title.trim(), description: meta("description"), keywords: meta("keywords"),
      url: location.href, canonical: related("canonical"), robots: meta("robots"),
      author: meta("author") || related("author"), publisher: meta("publisher") || related("publisher"),
      lang: document.documentElement.lang
    },
    metas,
    resources,
    scripts: nodes("script").map(node => ({ url: resolve(node, attr(node, "src")), type: attr(node, "type") })),
    headings: nodes("h1,h2,h3,h4,h5,h6").map(node => ({ level: Number(node.localName[1]), text: node.textContent.replace(/\s+/g, " ").trim() })),
    images: nodes("img").map(node => ({
      url: node.currentSrc || resolve(node, attr(node, "src")),
      alt: node.getAttribute("alt"), title: attr(node, "title")
    })),
    links: nodes("a[href]").map(node => ({
      url: resolve(node, attr(node, "href")) || node.baseURI,
      title: attr(node, "title"), rel: attr(node, "rel"), text: node.textContent.replace(/\s+/g, " ").trim()
    })),
    schema: [...new Set(nodes("[itemtype]").flatMap(node => attr(node, "itemtype").split(/\s+/)).filter(Boolean))]
  };
}

const messages = {
  vi: {
    sections: "Các mục báo cáo SEO", summary: "Tổng quan", headings: "Đề mục", images: "Hình ảnh",
    links: "Liên kết", social: "Mạng xã hội", tools: "Công cụ",
    loading: "Đang quét trang…", unsupported: "Hãy mở trang HTTP hoặc HTTPS để kiểm tra SEO.",
    error: "Không thể đọc trang này. Hãy thử quét lại hoặc mở trang web khác.",
    missing: "Chưa khai báo", empty: "Không tìm thấy dữ liệu.", blank: "Để trống",
    title: "Tiêu đề", description: "Mô tả", keywords: "Từ khóa", url: "URL", canonical: "Canonical",
    robots: "Thẻ robots", author: "Tác giả", publisher: "Nhà xuất bản", lang: "Ngôn ngữ trang",
    characters: "ký tự", values: "từ khóa", resources: "Tất cả thẻ link", metas: "Tất cả thẻ meta",
    scripts: "Tất cả script", inline: "Script nội tuyến", rel: "Liên kết có thuộc tính rel",
    headingOrder: "Đề mục theo thứ tự xuất hiện", altMissing: "Thiếu alt", titleMissing: "Thiếu title",
    needsReview: "Ảnh cần xem lại", complete: "Ảnh có đủ thuộc tính", alt: "Văn bản thay thế",
    attributeTitle: "Thuộc tính title", unique: "URL duy nhất", internal: "URL nội bộ duy nhất",
    occurrences: "lần xuất hiện", more: "Xem thêm", imageSource: "Nguồn ảnh (image_src)",
    schema: "Schema.org (itemtype)", preview: "Xem ảnh chia sẻ", imageError: "Không tải được ảnh.",
    performance: "Kiểm tra hiệu năng", html: "Kiểm tra HTML", css: "Kiểm tra CSS",
    sharing: "Kiểm tra Open Graph", rich: "Kiểm tra kết quả nhiều định dạng",
    structured: "Kiểm tra dữ liệu có cấu trúc", external: "Các công cụ bên ngoài mở trong tab mới và nhận URL của trang."
  },
  en: {
    sections: "SEO report sections", summary: "Overview", headings: "Headings", images: "Images",
    links: "Links", social: "Social", tools: "Tools",
    loading: "Scanning page…", unsupported: "Open an HTTP or HTTPS page to inspect its SEO.",
    error: "Could not read this page. Rescan or open another web page.",
    missing: "Missing", empty: "No data found.", blank: "Empty",
    title: "Title", description: "Description", keywords: "Keywords", url: "URL", canonical: "Canonical",
    robots: "Robots tag", author: "Author", publisher: "Publisher", lang: "Page language",
    characters: "characters", values: "keywords", resources: "All link tags", metas: "All meta tags",
    scripts: "All scripts", inline: "Inline script", rel: "Links with rel attributes",
    headingOrder: "Headings in document order", altMissing: "Missing alt", titleMissing: "Missing title",
    needsReview: "Images to review", complete: "Images with both attributes", alt: "Alternative text",
    attributeTitle: "Title attribute", unique: "Unique URLs", internal: "Unique internal URLs",
    occurrences: "occurrences", more: "Show more", imageSource: "Image source (image_src)",
    schema: "Schema.org (itemtype)", preview: "Preview sharing image", imageError: "Could not load the image.",
    performance: "Performance check", html: "HTML validation", css: "CSS validation",
    sharing: "Open Graph check", rich: "Rich results test",
    structured: "Structured data validation", external: "External tools open in a new tab and receive the page URL."
  }
};

function append(parent, tag, value, className) {
  const node = document.createElement(tag);
  if (value !== undefined) node.textContent = value;
  if (className) node.className = className;
  parent.append(node);
  return node;
}

function webUrl(value) {
  const url = URL.parse(value);
  return url && ["http:", "https:"].includes(url.protocol) ? url : null;
}

function link(parent, value, label = value) {
  if (!webUrl(value)) return append(parent, "span", label);
  const anchor = append(parent, "a", label);
  anchor.href = value;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  return anchor;
}

export function setupSeo(language) {
  const open = document.querySelector('[data-tool="seo"]');
  const view = document.querySelector("#seo-view");
  const page = document.querySelector("#seo-page");
  const refresh = document.querySelector("#seo-refresh");
  const status = document.querySelector("#seo-status");
  const report = document.querySelector("#seo-report");
  const nav = document.querySelector("#seo-nav");
  const content = document.querySelector("#seo-content");
  const sections = ["summary", "headings", "images", "links", "social", "tools"];
  let selected = "summary";
  let state = "loading";
  let data;
  let copy;
  let number;
  let scanId = 0;

  function stats(parent, entries) {
    const grid = append(parent, "dl", undefined, "seo-stats");
    for (const [label, value, review] of entries) {
      const card = append(grid, "div", undefined, review && value ? "seo-review" : "");
      append(card, "dt", label);
      append(card, "dd", number.format(value));
    }
  }

  function row(parent, label, value, url, detail) {
    const card = append(parent, "div", undefined, "seo-row");
    const term = append(card, "dt", label);
    if (detail) append(term, "small", detail);
    const description = append(card, "dd", value ? undefined : copy.missing, value ? "" : "seo-muted");
    if (value) link(description, url, value);
    return description;
  }

  function group(title, items, renderItem) {
    const panel = append(content, "section", undefined, "seo-panel");
    append(panel, "h3", title);
    if (!items.length) {
      append(panel, "p", copy.empty, "seo-muted");
      return;
    }
    const list = append(panel, "ul", undefined, "seo-list");
    let offset = 0;
    const more = append(panel, "button", copy.more);
    more.type = "button";
    function showBatch() {
      const start = offset;
      for (const item of items.slice(offset, offset + 50)) {
        renderItem(list, item);
        offset++;
      }
      more.hidden = offset >= items.length;
      more.textContent = `${copy.more} · ${number.format(items.length - offset)}`;
      if (start && more.hidden) {
        const firstNew = list.children[start];
        firstNew.tabIndex = -1;
        firstNew.focus();
      }
    }
    more.addEventListener("click", showBatch);
    showBatch();
  }

  function headingStats() {
    const counts = [0, 0, 0, 0, 0, 0];
    for (const { level } of data.headings) counts[level - 1]++;
    return counts.map((count, index) => [`H${index + 1}`, count]);
  }

  function linkItem(list, item) {
    const entry = append(list, "li");
    link(entry, item.url, item.url || copy.blank);
    if (item.text) append(entry, "div", item.text);
    if (item.title !== undefined) append(entry, "div", `${copy.attributeTitle} · ${item.title || copy.missing}`, "seo-muted");
    if (item.rel) append(entry, "div", `rel · ${item.rel}`, "seo-muted");
    if (item.count > 1) append(entry, "div", `${number.format(item.count)} ${copy.occurrences}`, "seo-muted");
  }

  function metaItem(list, item) {
    const entry = append(list, "li");
    append(entry, "strong", item.key);
    link(append(entry, "div"), item.url, item.value || copy.blank);
    if (!/^(og:image(?::url|:secure_url)?|twitter:image(?::src)?|image_src)$/i.test(item.key) || !webUrl(item.url)) return;
    const preview = append(entry, "details");
    append(preview, "summary", copy.preview);
    preview.addEventListener("toggle", () => {
      if (!preview.open || preview.querySelector("img")) return;
      const image = append(preview, "img");
      image.alt = copy.preview;
      image.referrerPolicy = "no-referrer";
      image.addEventListener("error", () => {
        image.hidden = true;
        append(preview, "p", copy.imageError, "seo-muted");
      }, { once: true });
      image.src = item.url;
    });
  }

  function summary() {
    stats(content, [...headingStats(), [copy.images, data.images.length], [copy.links, data.links.length]]);
    const fields = append(content, "dl", undefined, "seo-panel seo-fields");
    for (const [key, value] of Object.entries(data.summary)) {
      let detail;
      if (key === "title" || key === "description") detail = `${number.format([...value].length)} ${copy.characters}`;
      if (key === "keywords") detail = `${number.format(value.split(",").filter(word => word.trim()).length)} ${copy.values}`;
      row(fields, copy[key], value, ["url", "canonical", "author", "publisher"].includes(key) ? value : undefined, detail);
    }
    const shortcuts = append(content, "div", undefined, "seo-shortcuts");
    link(shortcuts, new URL("/robots.txt", data.url).href, "robots.txt");
    link(shortcuts, new URL("/sitemap.xml", data.url).href, "sitemap.xml");
    group(copy.resources, data.resources, (list, item) => {
      const entry = append(list, "li");
      append(entry, "strong", [item.rel || "link", item.type].filter(Boolean).join(" · "));
      link(append(entry, "div"), item.url, item.url || copy.missing);
    });
    group(copy.metas, data.metas, (list, item) => {
      const entry = append(list, "li");
      append(entry, "strong", item.key);
      link(append(entry, "div"), item.url, item.value || copy.blank);
    });
    group(copy.scripts, data.scripts, (list, item) => {
      const entry = append(list, "li");
      link(entry, item.url, item.url || copy.inline);
      if (item.type) append(entry, "div", item.type, "seo-muted");
    });
    group(copy.rel, data.links.filter(item => item.rel), linkItem);
  }

  const renderSection = {
    summary,
    headings() {
      stats(content, headingStats());
      group(copy.headingOrder, data.headings, (list, item) => {
        const entry = append(list, "li", undefined, "seo-heading-row");
        entry.style.setProperty("--level", item.level - 1);
        append(entry, "code", `H${item.level}`);
        append(entry, "span", item.text || copy.blank);
      });
    },
    images() {
      stats(content, [
        [copy.images, data.images.length], [copy.altMissing, data.images.filter(item => item.alt === null).length, true],
        [copy.titleMissing, data.images.filter(item => !item.title).length, true]
      ]);
      const complete = item => item.alt !== null && Boolean(item.title);
      const renderImage = (list, item) => {
        const entry = append(list, "li");
        link(entry, item.url, item.url || copy.missing);
        append(entry, "div", `${copy.alt} · ${item.alt === null ? copy.missing : item.alt || copy.blank}`, "seo-muted");
        append(entry, "div", `${copy.attributeTitle} · ${item.title || copy.missing}`, "seo-muted");
      };
      group(copy.needsReview, data.images.filter(item => !complete(item)), renderImage);
      group(copy.complete, data.images.filter(complete), renderImage);
    },
    links() {
      const unique = new Map();
      for (const item of data.links) {
        const existing = unique.get(item.url);
        if (existing) existing.count++;
        else unique.set(item.url, { ...item, count: 1 });
      }
      const entries = [...unique.values()];
      const origin = new URL(data.url).origin;
      stats(content, [
        [copy.links, data.links.length], [copy.unique, unique.size],
        [copy.internal, entries.filter(item => webUrl(item.url)?.origin === origin).length],
        [copy.titleMissing, data.links.filter(item => !item.title).length]
      ]);
      group(copy.links, entries, linkItem);
    },
    social() {
      group("Open Graph", data.metas.filter(item => /^og:/i.test(item.key)), metaItem);
      group("X / Twitter Cards", data.metas.filter(item => /^twitter:/i.test(item.key)), metaItem);
      const images = data.resources.filter(item => item.rel.toLowerCase().split(/\s+/).includes("image_src"));
      group(copy.imageSource, images.map(({ url }) => ({ key: "image_src", value: url, url })), metaItem);
      group(copy.schema, data.schema, (list, url) => link(append(list, "li"), url));
    },
    tools() {
      append(content, "p", copy.external, "seo-muted");
      const url = new URL(data.url);
      url.username = url.password = url.hash = "";
      const address = encodeURIComponent(url.href);
      const tools = [
        ["PageSpeed Insights", copy.performance, `https://pagespeed.web.dev/analysis?url=${address}`],
        ["W3C Markup Validator", copy.html, `https://validator.w3.org/check?uri=${address}`],
        ["W3C CSS Validator", copy.css, `https://jigsaw.w3.org/css-validator/validator?uri=${address}`],
        ["Facebook Sharing Debugger", copy.sharing, `https://developers.facebook.com/tools/debug/?q=${address}`],
        ["Google Rich Results Test", copy.rich, `https://search.google.com/test/rich-results?url=${address}`],
        ["Schema Markup Validator", copy.structured, `https://validator.schema.org/#url=${address}`]
      ];
      const panel = append(content, "ul", undefined, "seo-panel seo-list");
      for (const [name, description, href] of tools) {
        const item = append(panel, "li");
        link(item, href, name);
        append(item, "div", description, "seo-muted");
      }
    }
  };

  function showSection() {
    for (const button of nav.children) button.setAttribute("aria-pressed", String(button.dataset.section === selected));
    content.replaceChildren();
    renderSection[selected]();
  }

  for (const section of sections) {
    const button = append(nav, "button");
    button.type = "button";
    button.dataset.section = section;
    button.addEventListener("click", () => {
      selected = section;
      showSection();
    });
  }

  function render() {
    copy = messages[language.value];
    number = new Intl.NumberFormat(language.value);
    status.hidden = state === "ready";
    status.textContent = copy[state] ?? "";
    report.hidden = state !== "ready";
    refresh.disabled = state === "loading";
    page.hidden = !data;
    page.textContent = data?.url ?? "";
    nav.setAttribute("aria-label", copy.sections);
    for (const button of nav.children) button.textContent = copy[button.dataset.section];
    if (data) showSection();
    else content.replaceChildren();
  }

  async function scan() {
    const request = ++scanId;
    data = undefined;
    state = "loading";
    render();
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (request !== scanId) return;
      if (!Number.isInteger(tab?.id) || !webUrl(tab.url)) {
        state = "unsupported";
      } else {
        const [result] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: collectSeo });
        if (request !== scanId) return;
        if (!webUrl(result?.result?.url)) throw new Error("Missing SEO report");
        data = result.result;
        state = "ready";
      }
    } catch {
      if (request !== scanId) return;
      state = "error";
    }
    render();
  }

  open.addEventListener("click", () => {
    selected = "summary";
    scan();
  });
  refresh.addEventListener("click", scan);
  language.addEventListener("change", () => {
    if (!view.hidden) render();
  });
}
