// === Utility ===
const r_e = (id) => document.querySelector(`#${id}`);

// === Sign-In Modal Handling ===
function setupModal() {
  const signinModal = r_e("signin-modal");
  const signinLink = r_e("signin-link");
  const form = r_e("sign_in");

  if (signinLink && signinModal) {
    signinLink.onclick = () => signinModal.classList.add("is-active");
  }

  if (signinModal) {
    const closeModal = () => signinModal.classList.remove("is-active");

    const bg = signinModal.querySelector(".modal-background");
    const closeBtn = signinModal.querySelector(".modal-close");

    if (bg) bg.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;
  }

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const email = r_e("email_").value;
      const pass = r_e("password_").value;

      if (email === "test@example.com" && pass === "password") {
        form.reset();
        signinModal.classList.remove("is-active");
        alert(`Welcome back ${email}!`);
      } else {
        r_e("signin_error").classList.remove("is-hidden");
      }
    };
  }
}

// === Navbar Handling ===
function setupNavbar() {
  document.querySelectorAll(".navbar-item").forEach((link) => {
    link.addEventListener("click", (e) => {
      const url = link.getAttribute("href");
      if (url && !url.startsWith("#") && !url.startsWith("http")) {
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
      const newContent = doc.querySelector("main").innerHTML;
      document.querySelector("main").innerHTML = newContent;
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

  slideshows.forEach(slideshow => {
    const slides = slideshow.querySelectorAll("img");
    const prevBtn = slideshow.querySelector(".prev");
    const nextBtn = slideshow.querySelector(".next");
    let index = 0;

    function showSlide(n) {
      slides.forEach(slide => slide.classList.remove("active"));
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
