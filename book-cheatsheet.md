# Adding a new book — quick reference

Do this every time you finish a new book page.

## 1. Name your file
Use lowercase words separated by dashes, ending in `.html`.
Example: `atomic-habits.html`, `deep-work.html`

## 2. Give it a proper title tag
In the book's `<head>`, the `<title>` should follow this pattern
(dash-separated main title + subtitle) — same as your existing books:
```html
<title>Atomic Habits — The Architecture of Small Wins</title>
```
This is what shows up on the home page card automatically.

## 3. Add the two nav lines
Right before `</body>` in the book file, paste exactly:
```html
<script src="../assets/library-core.js"></script>
<script src="../assets/nav.js"></script>
```
This is the ONLY code you ever need to add to a new book file.

## 4. (Optional) Add extra info to the card
Anywhere in `<head>`, you can optionally add:
```html
<meta name="book:tagline" content="One line describing the book.">
<meta name="book:date" content="2026-07-05">
<meta name="book:accent" content="#3E7A4F">
```
- `tagline` → shows under the title on the home page card
- `date` → controls order (newest date shows first; skip it and it sorts A–Z by title)
- `accent` → tab color on the card (skip it and it auto-picks from your book's own CSS colors)

None of these three are required. Skip them if you're in a hurry.

## 5. Upload to GitHub
On github.com, in your repo:
- Go into the `books` folder
- Tap **Add file → Create new file**
- Name it `books/your-new-book-name.html`
  *(if you're already inside the books folder, just type `your-new-book-name.html`)*
- Paste the entire book HTML
- Tap **Commit changes**

## 6. Check it
Wait a minute, then open your site:
`https://YOURUSERNAME.github.io/YOURREPONAME/`

Your new book should appear as a card. Open it — you should see the
← Previous / Shelf / Next → bar at the bottom, with your new book
slotted into the right place.

---

## Things that commonly go wrong

| Problem | Cause | Fix |
|---|---|---|
| New book doesn't show on home page | Browser cached the old list | Wait 15 min, or on the home page tap "Try again" if it shows an error |
| Home page shows "Couldn't reach the catalog" | `githubUser`/`githubRepo` wrong in `assets/library-core.js`, or repo is private | Open that file, check the two values match your GitHub username and exact repo name; make sure repo is Public |
| Nav bar missing at bottom of a book | Forgot the two `<script>` lines, or typo'd the path | Re-check step 3 — must be exactly `../assets/library-core.js` and `../assets/nav.js` |
| Book file not found / 404 when clicked | File not actually inside the `books/` folder | On GitHub, confirm the file path starts with `books/` |

---

## One-time setup (already done, just for reference)
`assets/library-core.js` has these two lines set to your details:
```js
githubUser: "your-actual-username",
githubRepo: "your-actual-repo-name",
```
You should never need to touch this again unless you rename the repo
or move it to a different GitHub account.
