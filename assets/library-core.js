window.Library = (function () {
  const CONFIG = {
    githubUser: "YOUR_GITHUB_USERNAME",
    githubRepo: "YOUR_REPO_NAME",
    booksPath: "books",
    cacheKey: "library:catalog:v1",
    cacheTTL: 15 * 60 * 1000,
  };

  async function fetchFileList() {
    const url = `https://api.github.com/repos/${CONFIG.githubUser}/${CONFIG.githubRepo}/contents/${CONFIG.booksPath}`;
    const res = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) {
      throw new Error(`GitHub API error ${res.status}`);
    }
    const data = await res.json();
    return data
      .filter((f) => f.type === "file" && f.name.toLowerCase().endsWith(".html"))
      .map((f) => f.name)
      .sort();
  }

  function parseMeta(doc, filename) {
    const rawTitle = (doc.querySelector("title")?.textContent || filename).trim();
    let title = rawTitle;
    let subtitle = "";
    const parts = rawTitle.split(/\s+[—–]\s+/);
    if (parts.length > 1) {
      title = parts[0].trim();
      subtitle = parts.slice(1).join(" — ").trim();
    }

    const taglineMeta = doc.querySelector('meta[name="book:tagline"]');
    const dateMeta = doc.querySelector('meta[name="book:date"]');
    const accentMeta = doc.querySelector('meta[name="book:accent"]');

    let accent = accentMeta?.getAttribute("content");
    if (!accent) {
      const styleText = Array.from(doc.querySelectorAll("style"))
        .map((s) => s.textContent)
        .join("\n");
      const match = styleText.match(
        /--(?:gold|leaf|accent|flame|bloom|water)\s*:\s*(#[0-9a-fA-F]{3,8})/
      );
      accent = match ? match[1] : "#B08D46";
    }

    return {
      filename,
      title,
      subtitle,
      tagline: taglineMeta?.getAttribute("content") || "",
      date: dateMeta?.getAttribute("content") || null,
      accent,
    };
  }

  async function fetchBookMeta(filename, baseHref) {
    const res = await fetch(`${baseHref}${filename}`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return parseMeta(doc, filename);
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CONFIG.cacheKey);
      if (!raw) return null;
      const { ts, books } = JSON.parse(raw);
      if (Date.now() - ts > CONFIG.cacheTTL) return null;
      return books;
    } catch (e) {
      return null;
    }
  }

  function writeCache(books) {
    try {
      localStorage.setItem(
        CONFIG.cacheKey,
        JSON.stringify({ ts: Date.now(), books })
      );
    } catch (e) {}
  }

  function clearCache() {
    try {
      localStorage.removeItem(CONFIG.cacheKey);
    } catch (e) {}
  }

  async function getCatalog(baseHref, { force = false } = {}) {
    if (!force) {
      const cached = readCache();
      if (cached) return cached;
    }
    const names = await fetchFileList();
    const books = await Promise.all(
      names.map((n) => fetchBookMeta(n, baseHref))
    );
    books.sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date);
      if (a.date) return -1;
      if (b.date) return 1;
      return a.title.localeCompare(b.title);
    });
    writeCache(books);
    return books;
  }

  return { CONFIG, getCatalog, clearCache };
})();
