// McMaster Climbing Club - Newsletter page renderer
//
// EDIT HERE (only for maintainers comfortable with JS):
// - INDEX_URL if the folder ever moves
// - default accordion behavior via DEFAULT_EXPANDED_INDEX
//
// Exec workflow should only require:
// 1) Add /newsletters/YYYY-MM.md
// 2) Append filename to /newsletters/index.json

(function () {
  const INDEX_URL = "newsletters/index.json";
  const DEFAULT_EXPANDED_INDEX = 0; // Newest item opens by default.

  const container = document.getElementById("newsletterContainer");
  const yearNode = document.getElementById("year");

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  if (!container) return;

  if (!window.marked || typeof window.marked.parse !== "function") {
    showPageMessage("Markdown parser did not load. Please refresh.");
    return;
  }

  initialize().catch((error) => {
    console.error("Newsletter initialization failed:", error);
    showPageMessage("Could not load newsletters right now. Please try again later.");
  });

  async function initialize() {
    const manifest = await loadManifest();

    if (manifest.length === 0) {
      showPageMessage("No newsletters published yet. Check back soon.");
      return;
    }

    const loaded = await Promise.all(manifest.map((entry) => loadNewsletterEntry(entry)));
    const sorted = loaded.sort((a, b) => b.sortDate - a.sortDate);

    container.innerHTML = "";
    sorted.forEach((item, index) => {
      const card = buildAccordionCard(item, index === DEFAULT_EXPANDED_INDEX);
      container.append(card);
    });
  }

  async function loadManifest() {
    const response = await fetch(INDEX_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${INDEX_URL}: ${response.status}`);
    }

    const raw = await response.json();
    if (!Array.isArray(raw)) {
      throw new Error("Manifest must be a JSON array.");
    }

    return raw
      .map((item) => {
        if (typeof item === "string") return { file: item };
        if (item && typeof item.file === "string") return { file: item.file };
        return null;
      })
      .filter(Boolean);
  }

  async function loadNewsletterEntry(entry) {
    const file = entry.file;
    const url = `newsletters/${file}`;

    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const markdownText = await response.text();
      const parsed = parseFrontMatter(markdownText);
      const fallback = inferFromFilename(file);

      const title = parsed.frontMatter.title || fallback.title;
      const dateIso = normalizeIsoDate(parsed.frontMatter.date) || fallback.date;
      const html = window.marked.parse(parsed.body || "");

      const parsedDate = parseIsoDate(dateIso);

      return {
        file,
        title,
        dateIso,
        formattedDate: formatFullDate(dateIso),
        sortDate: parsedDate || new Date(0),
        html,
        error: null
      };
    } catch (error) {
      console.warn(`Failed to load newsletter file: ${file}`, error);
      const fallback = inferFromFilename(file);
      const parsedFallbackDate = parseIsoDate(fallback.date);

      return {
        file,
        title: fallback.title,
        dateIso: fallback.date,
        formattedDate: formatFullDate(fallback.date),
        sortDate: parsedFallbackDate || new Date(0),
        html: "",
        error: "Could not load this newsletter. Please verify the file exists and is valid Markdown."
      };
    }
  }

  function parseFrontMatter(rawMarkdown) {
    const frontMatterMatch = rawMarkdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    if (!frontMatterMatch) {
      return { frontMatter: {}, body: rawMarkdown };
    }

    const block = frontMatterMatch[1];
    const body = rawMarkdown.slice(frontMatterMatch[0].length);
    const frontMatter = {};

    block.split("\n").forEach((line) => {
      const match = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
      if (!match) return;
      const key = match[1].trim().toLowerCase();
      const value = match[2].trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
      frontMatter[key] = value;
    });

    return { frontMatter, body };
  }

  function inferFromFilename(fileName) {
    const match = fileName.match(/(\d{4})-(\d{2})/);
    if (!match) {
      return { title: fileName.replace(/\.md$/i, ""), date: "" };
    }

    const year = match[1];
    const month = match[2];
    const date = `${year}-${month}-01`;
    const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, { month: "long" });

    return {
      title: `${monthName} ${year} Newsletter`,
      date
    };
  }

  function normalizeIsoDate(value) {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return "";
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? "" : trimmed;
  }

  function parseIsoDate(isoDate) {
    if (!isoDate || typeof isoDate !== "string") return null;
    const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const day = Number(match[3]);

    const parsed = new Date(year, monthIndex, day);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  }

  function formatFullDate(isoDate) {
    if (!isoDate) return "Date not set";
    const parsed = parseIsoDate(isoDate);
    if (!parsed) return isoDate;

    return parsed.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function buildAccordionCard(item, startExpanded) {
    const article = document.createElement("article");
    article.className = "news-entry";

    const button = document.createElement("button");
    button.className = "news-summary";
    button.type = "button";

    const panelId = `news-panel-${slugify(item.file)}`;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", panelId);

    const textWrap = document.createElement("div");
    textWrap.className = "news-summary-text";
    textWrap.innerHTML = `
      <h2>${escapeHtml(item.title)}</h2>
      <p class="news-date">${escapeHtml(item.formattedDate)}</p>
    `;

    const icon = document.createElement("span");
    icon.className = "news-chevron";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "▾";

    button.append(textWrap, icon);

    const panel = document.createElement("div");
    panel.className = "news-panel";
    panel.id = panelId;
    panel.hidden = true;

    const inner = document.createElement("div");
    inner.className = "news-body";

    if (item.error) {
      const warning = document.createElement("p");
      warning.className = "news-error";
      warning.textContent = item.error;
      inner.append(warning);
    } else {
      const toc = document.createElement("nav");
      toc.className = "toc";
      toc.setAttribute("aria-label", `Table of contents for ${item.title}`);

      const content = document.createElement("article");
      content.className = "news-content";
      content.innerHTML = item.html;

      applyLinkSafety(content);
      buildToc(content, toc);

      inner.append(toc, content);
    }

    panel.append(inner);
    article.append(button, panel);

    button.addEventListener("click", () => togglePanel(button, panel));

    if (startExpanded && !item.error) {
      openPanel(button, panel, false);
    }

    return article;
  }

  function buildToc(contentRoot, tocNode) {
    const headings = [...contentRoot.querySelectorAll("h2, h3")];

    if (headings.length === 0) {
      tocNode.innerHTML = "<p>No sections in this newsletter yet.</p>";
      return;
    }

    const title = document.createElement("h3");
    title.textContent = "On this page";

    const list = document.createElement("ul");
    const usedIds = new Set();

    headings.forEach((heading, index) => {
      const text = (heading.textContent || "").trim() || `Section ${index + 1}`;
      const base = slugify(text) || `section-${index + 1}`;
      const uniqueId = makeUniqueId(base, usedIds);
      heading.id = uniqueId;

      const item = document.createElement("li");
      if (heading.tagName.toLowerCase() === "h3") {
        item.classList.add("toc-subitem");
      }

      const link = document.createElement("a");
      link.href = `#${uniqueId}`;
      link.textContent = text;

      item.append(link);
      list.append(item);
    });

    tocNode.append(title, list);
  }

  function applyLinkSafety(contentRoot) {
    const links = contentRoot.querySelectorAll("a[href]");
    links.forEach((link) => {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
  }

  function togglePanel(button, panel) {
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closePanel(button, panel);
    } else {
      openPanel(button, panel, true);
    }
  }

  function openPanel(button, panel, animate) {
    button.setAttribute("aria-expanded", "true");
    panel.hidden = false;

    if (!animate) {
      panel.style.maxHeight = "none";
      return;
    }

    panel.style.maxHeight = "0px";
    requestAnimationFrame(() => {
      panel.style.maxHeight = `${panel.scrollHeight}px`;
    });

    const onEnd = () => {
      panel.style.maxHeight = "none";
      panel.removeEventListener("transitionend", onEnd);
    };
    panel.addEventListener("transitionend", onEnd);
  }

  function closePanel(button, panel) {
    button.setAttribute("aria-expanded", "false");

    panel.style.maxHeight = `${panel.scrollHeight}px`;
    requestAnimationFrame(() => {
      panel.style.maxHeight = "0px";
    });

    const onEnd = () => {
      panel.hidden = true;
      panel.removeEventListener("transitionend", onEnd);
    };
    panel.addEventListener("transitionend", onEnd);
  }

  function makeUniqueId(base, used) {
    let id = base;
    let count = 2;
    while (used.has(id)) {
      id = `${base}-${count}`;
      count += 1;
    }
    used.add(id);
    return id;
  }

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .trim()
      .replace(/\.md$/i, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function showPageMessage(message) {
    container.innerHTML = `<p>${escapeHtml(message)}</p>`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
})();
