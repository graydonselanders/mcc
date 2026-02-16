// Render newsletter accordion entries and auto-generate mini TOC per post.
(function () {
  const container = document.getElementById("newsletterContainer");
  const yearNode = document.getElementById("year");

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  if (!container || !Array.isArray(window.MCC_POSTS ?? MCC_POSTS)) {
    if (container) {
      container.innerHTML = "<p>No newsletters found. Please check posts.js.</p>";
    }
    return;
  }

  const posts = (window.MCC_POSTS ?? MCC_POSTS).slice();

  if (posts.length === 0) {
    container.innerHTML = "<p>No newsletters published yet. Check back soon.</p>";
    return;
  }

  posts.forEach((post, index) => {
    const entry = document.createElement("details");
    entry.className = "news-entry";
    if (index === 0) entry.open = true;

    const summary = document.createElement("summary");
    summary.className = "news-summary";
    const dateText = formatDate(post.date);
    summary.innerHTML = `<h2>${escapeHtml(post.title)}</h2><p class="news-date">${dateText}</p>`;

    const body = document.createElement("div");
    body.className = "news-body";

    const toc = document.createElement("nav");
    toc.className = "toc";
    toc.setAttribute("aria-label", `Table of contents for ${post.title}`);

    const content = document.createElement("article");
    content.className = "news-content";
    content.innerHTML = post.contentHTML || "";

    buildToc(post.id || `newsletter-${index}`, content, toc);

    body.append(toc, content);
    entry.append(summary, body);
    container.append(entry);
  });

  function formatDate(input) {
    if (!input) return "Date not set";
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) return input;
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function slugify(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  function buildToc(postId, contentRoot, tocNode) {
    const headings = [...contentRoot.querySelectorAll("h2, h3")];
    if (headings.length === 0) {
      tocNode.innerHTML = "<p>No sections in this newsletter yet.</p>";
      return;
    }

    const title = document.createElement("h3");
    title.textContent = "On this page";

    const list = document.createElement("ul");

    headings.forEach((heading, idx) => {
      const base = heading.textContent?.trim() || `section-${idx + 1}`;
      const id = `${slugify(postId)}-${slugify(base)}-${idx + 1}`;
      heading.id = id;

      const item = document.createElement("li");
      if (heading.tagName.toLowerCase() === "h3") {
        item.style.marginLeft = "1rem";
      }

      const link = document.createElement("a");
      link.href = `#${id}`;
      link.textContent = base;

      item.append(link);
      list.append(item);
    });

    tocNode.append(title, list);
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
