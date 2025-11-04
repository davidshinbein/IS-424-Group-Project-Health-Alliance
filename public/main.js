// === Utility ===
const r_e = (id) => document.querySelector(`#${id}`);

// === Sign-In Modal Handling ===
// Sign-in modal removed from global UI; calendar page contains its own auth UI.
function setupModal() {
  // no-op: calendar page will manage its own modal and sign-in logic
}

// === Navbar Handling ===
function setupNavbar() {
  document.querySelectorAll(".navbar-item").forEach((link) => {
    link.addEventListener("click", (e) => {
      const url = link.getAttribute("href");
      if (url && !url.startsWith("#") && !url.startsWith("http")) {
        // Force a full navigation for the calendar page so module scripts run
        if (url.endsWith("calendar.html") || url.endsWith("Leadership.html")) {
          // Force a hard navigation so the browser reloads the page and module scripts run
          window.location.href = url;
          return;
        }
        e.preventDefault();
        loadPage(url);
      }
    });
  });
}

// === Load Page into <main> ===
function loadPage(url) {
  // If leadership or calendar is requested, force a full navigation so
  // module scripts and page-specific head content load reliably.
  try {
    if (
      url &&
      (url.endsWith("Leadership.html") || url.endsWith("calendar.html"))
    ) {
      // clear one-shot reload markers to ensure fresh load
      sessionStorage.removeItem("gha_leadership_reloaded");
      sessionStorage.removeItem("gha_calendar_reloaded");
      window.location.href = url;
      return;
    }
  } catch (e) {
    console.error("loadPage navigation guard failed", e);
  }
  fetch(url)
    .then((res) => res.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const newMain = doc.querySelector("main");
      const main = document.querySelector("main");
      main.innerHTML = newMain ? newMain.innerHTML : "";

      // initialize any slideshows in the injected content
      try {
        initSlideshows();
      } catch (e) {
        console.warn('initSlideshows failed after injection', e);
      }

      // If we just injected the calendar page via SPA and it didn't populate
      // (no events), trigger one hard reload so module scripts execute.
      try {
        if (url && url.endsWith("calendar.html")) {
          setTimeout(() => {
            const publicEventsEl = document.getElementById("publicEvents");
            const alreadyReloaded = sessionStorage.getItem(
              "gha_calendar_reloaded"
            );
            if (
              (!publicEventsEl || publicEventsEl.children.length === 0) &&
              !alreadyReloaded
            ) {
              // mark and reload once
              sessionStorage.setItem("gha_calendar_reloaded", "1");
              window.location.reload();
            }
          }, 600);
        }

        // one-shot auto-reload for Leadership page when injected via SPA
        try {
          if (url && url.endsWith("Leadership.html")) {
            setTimeout(() => {
              const alreadyReloadedL = sessionStorage.getItem(
                "gha_leadership_reloaded"
              );
              // simple check: ensure at least one leader image exists
              const anyImg = document.querySelector(".leader-image img");
              if ((!anyImg || anyImg.naturalWidth === 0) && !alreadyReloadedL) {
                sessionStorage.setItem("gha_leadership_reloaded", "1");
                window.location.reload();
              }
            }, 600);
          }
        } catch (e) {
          console.error("leadership auto-reload check failed", e);
        }
      } catch (e) {
        console.error("calendar auto-reload check failed", e);
      }

      // Inject head styles and links from fetched page so CSS applies on SPA navigation
      try {
        const head = document.head;
        // add <link rel="stylesheet"> from fetched doc if not already present
        doc.querySelectorAll('link[rel="stylesheet"]').forEach((lnk) => {
          const href = lnk.getAttribute("href");
          if (!href) return;
          if (
            !Array.from(head.querySelectorAll('link[rel="stylesheet"]')).some(
              (existing) => existing.getAttribute("href") === href
            )
          ) {
            const newL = document.createElement("link");
            newL.rel = "stylesheet";
            newL.href = href;
            head.appendChild(newL);
          }
        });
        // inject style tags (avoid duplicates by textContent)
        doc.querySelectorAll("style").forEach((st) => {
          const txt = st.textContent.trim();
          if (!txt) return;
          if (
            !Array.from(head.querySelectorAll("style")).some(
              (existing) => existing.textContent.trim() === txt
            )
          ) {
            const newS = document.createElement("style");
            newS.textContent = txt;
            head.appendChild(newS);
          }
        });
      } catch (e) {
        console.error("Error injecting head styles:", e);
      }

      // Execute <script> tags from the fetched page so module scripts run.
      // Skip re-executing this site-wide `main.js` to avoid duplicate bindings.
      doc.querySelectorAll("script").forEach((old) => {
        try {
          if (old.src && old.src.includes("main.js")) return;
          const script = document.createElement("script");
          if (old.type) script.type = old.type;
          if (old.src) {
            script.src = old.src;
            // preserve execution order for external scripts
            script.async = false;
          } else {
            script.textContent = old.textContent;
          }
          document.body.appendChild(script);
        } catch (e) {
          console.error("Error injecting script from fetched page:", e);
        }
      });
      window.history.pushState({}, "", url);
      setupNavbar();
      setupModal(); // rebind Sign-In every time
    })
    .catch((err) => console.error("Error loading page:", err));
}

// === Init on first load ===
document.addEventListener("DOMContentLoaded", () => {
  setupNavbar();
  setupModal();
  initSlideshows();
});

// === Handle back/forward ===
window.addEventListener("popstate", () => {
  loadPage(window.location.pathname);
});

// === slideshow for the "What We Do" page ===
function initSlideshows() {
  const slideshows = document.querySelectorAll(".slideshow");

  slideshows.forEach((slideshow) => {
    // idempotent init: skip if already initialized
    if (slideshow.dataset.slideInit === "1") return;
    const slides = slideshow.querySelectorAll("img");
    const prevBtn = slideshow.querySelector(".prev");
    const nextBtn = slideshow.querySelector(".next");
    let index = 0;

    function showSlide(n) {
      if (!slides || slides.length === 0) return;
      slides.forEach((slide) => slide.classList.remove("active"));
      slides[n].classList.add("active");
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        index = (index - 1 + slides.length) % slides.length;
        showSlide(index);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        index = (index + 1) % slides.length;
        showSlide(index);
      });
    }

    // if there's only one slide, hide navigation controls
    if (!slides || slides.length <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
    }

    // show initial slide
    showSlide(index);

    // mark initialized
    slideshow.dataset.slideInit = "1";
  });
}

// Capture clicks early and force a hard navigation for leadership/calendar links
document.addEventListener(
  "click",
  (e) => {
    try {
      const a = e.target.closest && e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      if (href.endsWith("Leadership.html") || href.endsWith("calendar.html")) {
        // prevent SPA from swallowing the navigation and force a full reload
        e.preventDefault();
        console.log("[force-nav] capture click for", href);
        // clear any one-shot reload markers so the fresh load behaves normally
        sessionStorage.removeItem("gha_leadership_reloaded");
        sessionStorage.removeItem("gha_calendar_reloaded");
        try {
          // cache-bust the leadership stylesheet so users get the newest CSS
          try {
            const head = document.head;
            const sel = Array.from(head.querySelectorAll('link[rel="stylesheet"]')).find(l => l.getAttribute('href') && l.getAttribute('href').includes('leadership.css'));
            if (sel) {
              const base = sel.getAttribute('href').split('?')[0];
              const busted = base + '?v=' + Date.now();
              console.log('[force-nav] cache-bust leadership stylesheet ->', busted);
              sel.setAttribute('href', busted);
            }
          } catch (xx) {
            console.warn('[force-nav] failed to cache-bust leadership stylesheet', xx);
          }
          const abs = new URL(href, window.location.href).href;
          console.log("[force-nav] redirecting to", abs);
          window.location.href = abs;
        } catch (err) {
          console.error("[force-nav] invalid href", href, err);
          window.location.href = href;
        }
      }
    } catch (err) {
      console.error("force-navigation handler error", err);
    }
  },
  { capture: true }
);
