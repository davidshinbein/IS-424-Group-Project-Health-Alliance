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
        if (url.endsWith("calendar.html")) {
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
  fetch(url)
    .then((res) => res.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const newMain = doc.querySelector("main");
      const main = document.querySelector("main");
      main.innerHTML = newMain ? newMain.innerHTML : "";

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
});

// === Handle back/forward ===
window.addEventListener("popstate", () => {
  loadPage(window.location.pathname);
});

// === slideshow for the "What We Do" page ===
document.addEventListener("DOMContentLoaded", () => {
  const slideshows = document.querySelectorAll(".slideshow");

  slideshows.forEach((slideshow) => {
    const slides = slideshow.querySelectorAll("img");
    const prevBtn = slideshow.querySelector(".prev");
    const nextBtn = slideshow.querySelector(".next");
    let index = 0;

    function showSlide(n) {
      slides.forEach((slide) => slide.classList.remove("active"));
      slides[n].classList.add("active");
    }

    prevBtn.addEventListener("click", () => {
      index = (index - 1 + slides.length) % slides.length;
      showSlide(index);
    });

    nextBtn.addEventListener("click", () => {
      index = (index + 1) % slides.length;
      showSlide(index);
    });
  });
});
