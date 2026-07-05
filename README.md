# The Reading Room — book library system

One repo, one home page, unlimited books. Drop a new `.html` file into
`/books`, add two lines to it, push — the home page and prev/next
navigation update themselves. No manifest file to maintain, no build step.

## How it works

- `index.html` — the shelf. On load it asks the GitHub API "what files
  are in `/books`?", then fetches each one and reads its `<title>` tag
  (and a couple of optional `<meta>` tags) to build a catalog card.
- `assets/library-core.js` — the shared brain. Talks to the GitHub API,
  parses each book's metadata, caches the result in `localStorage` for
  15 minutes so you're not hammering GitHub's API on every click.
- `assets/nav.js` — injected into each book page. Looks at the same
  catalog, finds where the current book sits, and drops a fixed bar at
  the bottom: **← Previous · Shelf · Next →**.
- `/books/*.html` — your actual book pages, untouched otherwise.

Because the catalog is discovered at runtime from the repo's file
listing, adding a book is genuinely just "add the file" — the site
doesn't need to be regenerated or edited anywhere else.

## One-time setup

Open `assets/library-core.js` and set these two lines near the top:

```js
githubUser: "YOUR_GITHUB_USERNAME",
githubRepo: "YOUR_REPO_NAME",
```

That's it. This only has to be done once for the whole repo.

Also make sure the repo is **public** (GitHub's file-listing API needs
no auth for public repos; a private repo would need a token, which
isn't safe to ship in client-side JS).

## Adding a new book (every time, going forward)

1. Save the book's HTML file into `/books/your-book-name.html`.
2. Near the bottom of that file, right before `</body>`, add:
   ```html
   <script src="../assets/library-core.js"></script>
   <script src="../assets/nav.js"></script>
   ```
3. Push to GitHub.

Done. The home page will pick it up (within 15 minutes if someone
already has a cached view — instantly for a fresh visitor), and the
new book gets working prev/next links automatically, sorted
alphabetically by title unless you set a date (see below).

## Optional metadata

None of this is required, but if you want more control, add any of
these `<meta>` tags into a book's `<head>`:

```html
<meta name="book:tagline" content="One line about what this book explores.">
<meta name="book:date" content="2026-07-05">
<meta name="book:accent" content="#B03A2E">
```

- **`book:tagline`** — shown on the catalog card under the title.
- **`book:date`** — controls sort order (newest first). Without it,
  books sort alphabetically by title.
- **`book:accent`** — the color of the little tab on the catalog card.
  Without it, the system tries to guess from your CSS (`--gold`,
  `--leaf`, `--flame`, `--bloom`, `--water`, or `--accent` custom
  properties), falling back to a neutral brass color.

The title card itself is generated from your `<title>` tag. If it's in
the form `Book Title — Something Evocative`, it gets split into a
title + italic subtitle automatically (this already matches how your
existing books are titled, so no changes needed there).

## Notes on the GitHub API and rate limits

Unauthenticated requests to the GitHub API are capped at 60/hour per
IP address. The 15-minute cache in `localStorage` means a single
visitor won't come close to that in normal browsing. If you ever hit
the limit anyway (e.g. testing repeatedly from the same network), the
homepage shows a "Try again" link, or you can just wait a bit.

## Local testing on Android (Termux)

Because the homepage fetches sibling book files with relative paths,
it needs to be served over `http://`, not opened directly as a
`file://` path. From Termux:

```
cd book-library
python -m http.server 8080
```

Then open `http://localhost:8080` in the browser. (Same as your usual
workflow for CableMetrix/etc.)
