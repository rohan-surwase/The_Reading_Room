(function () {
  function currentFilename() {
    const path = window.location.pathname;
    return decodeURIComponent(path.substring(path.lastIndexOf("/") + 1));
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      #shelf-nav{
        position:fixed; left:0; right:0; bottom:0; z-index:999;
        display:flex; align-items:stretch; justify-content:space-between;
        background:#161310; color:#EDE6D6;
        font-family:"IBM Plex Mono", ui-monospace, monospace;
        font-size:0.72rem; letter-spacing:0.04em;
        border-top:1px solid rgba(237,230,214,0.15);
        box-shadow:0 -4px 16px rgba(0,0,0,.25);
      }
      #shelf-nav a, #shelf-nav span.disabled{
        flex:1; display:flex; align-items:center; gap:8px;
        padding:12px 16px; text-decoration:none; color:#EDE6D6;
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        transition:background-color .2s ease;
      }
      #shelf-nav a:hover{ background:rgba(237,230,214,0.08); }
      #shelf-nav span.disabled{ color:rgba(237,230,214,0.3); }
      #shelf-nav .nav-prev{ justify-content:flex-start; }
      #shelf-nav .nav-home{ flex:0 0 auto; justify-content:center; border-left:1px solid rgba(237,230,214,0.15); border-right:1px solid rgba(237,230,214,0.15); font-weight:600; text-transform:uppercase; }
      #shelf-nav .nav-next{ justify-content:flex-end; text-align:right; }
      #shelf-nav .label{ opacity:0.55; font-size:0.65rem; }
      @media (max-width:640px){
        #shelf-nav .nav-title{ display:none; }
        #shelf-nav a, #shelf-nav span.disabled{ padding:12px 10px; }
      }
      body{ padding-bottom:48px; }
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
    if (!window.Library) return;
    injectStyles();
    try {
      const catalog = await window.Library.getCatalog("");
      const me = currentFilename();
      const idx = catalog.findIndex((b) => b.filename === me);
      if (idx === -1) {
        const fresh = await window.Library.getCatalog("", { force: true });
        const idx2 = fresh.findIndex((b) => b.filename === me);
        buildBar(fresh, idx2 === -1 ? 0 : idx2);
      } else {
        buildBar(catalog, idx);
      }
    } catch (e) {
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
