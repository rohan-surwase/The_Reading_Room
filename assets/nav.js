/**
 * nav.js
 * Drop these two lines near the end of any book page, right before </body>:
 *   <script src="../assets/library-core.js"></script>
 *   <script src="../assets/nav.js"></script>
 *
 * It figures out where the current book sits in the catalog and injects
 * a small fixed bar: ← Previous book | Back to the Shelf | Next book →
 * No other edits needed — new books slot into the order automatically.
 */
(function () {
  function currentFilename() {
    const path = window.location.pathname;
    return decodeURIComponent(path.substring(path.lastIndexOf("/") + 1));
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      #shelf-nav{
        --shelf-accent: var(--accent, var(--gold, var(--leaf, var(--flame, var(--bloom, var(--water, #d4a657))))));
        position:fixed; left:50%; bottom:14px; z-index:999;
        transform:translateX(-50%);
        display:flex; align-items:stretch; justify-content:space-between;
        width:calc(100% - 28px); max-width:640px;
        color:inherit; font-family:inherit;
        font-size:0.74rem; letter-spacing:0.03em;
        border-radius:18px; overflow:hidden;
        background:rgba(120,120,120,0.16);
        background:color-mix(in srgb, currentColor 9%, transparent);
        border:1px solid rgba(120,120,120,0.22);
        border:1px solid color-mix(in srgb, currentColor 14%, transparent);
        backdrop-filter:blur(20px) saturate(160%);
        -webkit-backdrop-filter:blur(20px) saturate(160%);
        box-shadow:0 18px 40px rgba(0,0,0,.25), 0 2px 10px rgba(0,0,0,.08);
        animation:shelfNavIn .5s cubic-bezier(.2,.8,.2,1);
      }
      @keyframes shelfNavIn{
        from{ opacity:0; transform:translateX(-50%) translateY(16px); }
        to{ opacity:1; transform:translateX(-50%) translateY(0); }
      }
      #shelf-nav a, #shelf-nav span.disabled{
        flex:1; display:flex; align-items:center; gap:8px;
        padding:13px 16px; text-decoration:none; color:inherit;
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        transition:background-color .25s ease, transform .25s ease;
      }
      #shelf-nav a:hover, #shelf-nav a:focus-visible{
        background:rgba(150,150,150,0.14);
        background:color-mix(in srgb, var(--shelf-accent) 16%, transparent);
        outline:none;
      }
      #shelf-nav span.disabled{ opacity:0.35; }
      #shelf-nav .nav-prev{ justify-content:flex-start; }
      #shelf-nav .nav-home{
        flex:0 0 auto; justify-content:center; padding:13px 22px;
        font-weight:700; text-transform:uppercase; letter-spacing:.09em; font-size:0.68rem;
        color:var(--shelf-accent);
        border-left:1px solid rgba(120,120,120,0.2);
        border-left:1px solid color-mix(in srgb, currentColor 14%, transparent);
        border-right:1px solid rgba(120,120,120,0.2);
        border-right:1px solid color-mix(in srgb, currentColor 14%, transparent);
      }
      #shelf-nav .nav-home:hover{
        background:rgba(212,166,87,0.14);
        background:color-mix(in srgb, var(--shelf-accent) 14%, transparent);
      }
      #shelf-nav .nav-next{ justify-content:flex-end; text-align:right; }
      #shelf-nav .label{ opacity:0.55; font-size:0.63rem; text-transform:uppercase; letter-spacing:.08em; }
      #shelf-nav .nav-prev > span:first-child,
      #shelf-nav .nav-next > span:last-child{
        color:var(--shelf-accent); font-size:0.95rem; line-height:1;
        transition:transform .25s ease;
      }
      #shelf-nav .nav-prev:hover > span:first-child{ transform:translateX(-3px); }
      #shelf-nav .nav-next:hover > span:last-child{ transform:translateX(3px); }
      @media (max-width:640px){
        #shelf-nav{ width:calc(100% - 20px); bottom:10px; border-radius:16px; }
        #shelf-nav .nav-title{ display:none; }
        #shelf-nav a, #shelf-nav span.disabled{ padding:12px 10px; }
        #shelf-nav .nav-home{ padding:12px 16px; }
      }
      body{ padding-bottom:86px; }
    `;
    document.head.appendChild(style);
  }

  function buildBar(catalog, currentIndex) {
    const bar = document.createElement("nav");
    bar.id = "shelf-nav";

    const prev = catalog[currentIndex - 1];
    const next = catalog[currentIndex + 1];

    const prevEl = prev
      ? Object.assign(document.createElement("a"), {
          href: prev.filename,
          className: "nav-prev",
          innerHTML: `<span>←</span><span><span class="label">Prev</span><br><span class="nav-title">${prev.title}</span></span>`,
        })
      : Object.assign(document.createElement("span"), {
          className: "disabled nav-prev",
          textContent: "← Start of shelf",
        });

    const homeEl = Object.assign(document.createElement("a"), {
      href: "../index.html",
      className: "nav-home",
      textContent: "Shelf",
    });

    const nextEl = next
      ? Object.assign(document.createElement("a"), {
          href: next.filename,
          className: "nav-next",
          innerHTML: `<span style="margin-left:auto"><span class="label">Next</span><br><span class="nav-title">${next.title}</span></span><span>→</span>`,
        })
      : Object.assign(document.createElement("span"), {
          className: "disabled nav-next",
          textContent: "End of shelf →",
        });

    bar.appendChild(prevEl);
    bar.appendChild(homeEl);
    bar.appendChild(nextEl);
    document.body.appendChild(bar);
  }

  async function init() {
    if (!window.Library) return; // library-core.js not loaded
    injectStyles();
    try {
      const catalog = await window.Library.getCatalog("");
      const me = currentFilename();
      const idx = catalog.findIndex((b) => b.filename === me);
      if (idx === -1) {
        // Book not found yet (e.g. cache stale right after a fresh push) — force refresh once.
        const fresh = await window.Library.getCatalog("", { force: true });
        const idx2 = fresh.findIndex((b) => b.filename === me);
        buildBar(fresh, idx2 === -1 ? 0 : idx2);
      } else {
        buildBar(catalog, idx);
      }
    } catch (e) {
      // Fall back to a minimal bar that at least gets you home.
      const bar = document.createElement("nav");
      bar.id = "shelf-nav";
      bar.innerHTML = `<a href="../index.html" class="nav-home" style="flex:1">← Back to the Shelf</a>`;
      document.body.appendChild(bar);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
