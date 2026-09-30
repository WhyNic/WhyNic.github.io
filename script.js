const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const themeToggle = document.querySelector(".theme-toggle");
const heroTitle = document.querySelector(".hero-title");
const typingText = document.querySelector("[data-typing-text]");
const techMarquees = Array.from(document.querySelectorAll(".tech-marquee"));
const year = document.querySelector("#year");
const lightbox = document.querySelector("#image-lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCaption = document.querySelector(".lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxPrev = document.querySelector(".lightbox-prev");
const lightboxNext = document.querySelector(".lightbox-next");
const achievementImageButtons = Array.from(document.querySelectorAll("[data-lightbox-image]"));

if (year) {
  year.textContent = new Date().getFullYear();
}

const getStoredTheme = () => {
  try {
    const theme = localStorage.getItem("theme");

    return theme === "light" || theme === "dark" ? theme : null;
  } catch {
    return null;
  }
};

const storeTheme = (theme) => {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Theme preference still works for the current page if storage is unavailable.
  }
};

const applyTheme = (theme) => {
  const isDark = theme === "dark";

  document.documentElement.dataset.theme = theme;

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  }
};

applyTheme(getStoredTheme() || "dark");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (techMarquees.length > 0) {
  techMarquees.forEach((marquee) => {
    const track = marquee.querySelector(".tech-track");
    const sourceSet = marquee.querySelector(".tech-set");

    if (!track || !sourceSet || track.querySelector(".tech-set[aria-hidden='true']")) {
      return;
    }

    const duplicateSet = sourceSet.cloneNode(true);

    duplicateSet.setAttribute("aria-hidden", "true");
    duplicateSet.removeAttribute("aria-label");
    track.append(duplicateSet);
    track.classList.add("is-ready");
  });
}

if (heroTitle) {
  const titleText = heroTitle.textContent.trim();

  heroTitle.setAttribute("aria-label", titleText);
  heroTitle.textContent = "";

  let characterIndex = 0;

  Array.from(titleText).forEach((character) => {
    if (character === " ") {
      heroTitle.append(document.createTextNode(" "));
      return;
    }

    const characterSpan = document.createElement("span");

    characterSpan.className = "title-char";
    characterSpan.textContent = character;
    characterSpan.setAttribute("aria-hidden", "true");
    characterSpan.style.setProperty("--char-index", characterIndex);
    characterIndex += 1;

    heroTitle.append(characterSpan);
  });
}

if (typingText) {
  const finalText = typingText.dataset.typingText || typingText.textContent;

  if (prefersReducedMotion) {
    typingText.textContent = finalText;
    typingText.classList.add("typing-complete");
  } else {
    const duration = 1850;
    const stepDelay = duration / finalText.length;
    let index = 0;

    typingText.textContent = "";
    typingText.classList.add("is-typing");

    const typeNextCharacter = () => {
      index += 1;
      typingText.textContent = finalText.slice(0, index);

      if (index < finalText.length) {
        window.setTimeout(typeNextCharacter, stepDelay);
        return;
      }

      typingText.classList.remove("is-typing");
      typingText.classList.add("typing-complete");
    };

    window.setTimeout(typeNextCharacter, 180);
  }
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
    storeTheme(nextTheme);
  });
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");

    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  navMenu.addEventListener("click", (event) => {
    const clickedLink = event.target.closest("a");

    if (!clickedLink) {
      return;
    }

    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  });
}

if (lightbox && lightboxImage && achievementImageButtons.length > 0) {
  let activeGallery = [];
  let activeIndex = 0;
  let lastFocusedElement = null;

  const updateLightboxImage = () => {
    const activeButton = activeGallery[activeIndex];
    const image = activeButton?.querySelector("img");

    if (!activeButton || !image) {
      return;
    }

    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;

    if (lightboxCaption) {
      lightboxCaption.textContent = activeButton.dataset.caption || image.alt;
    }

    const hasMultipleImages = activeGallery.length > 1;

    if (lightboxPrev) {
      lightboxPrev.hidden = !hasMultipleImages;
    }

    if (lightboxNext) {
      lightboxNext.hidden = !hasMultipleImages;
    }
  };

  const openLightbox = (button) => {
    const galleryName = button.dataset.gallery;

    activeGallery = achievementImageButtons
      .filter((item) => item.dataset.gallery === galleryName)
      .sort((first, second) => Number(first.dataset.index) - Number(second.dataset.index));
    activeIndex = Math.max(activeGallery.indexOf(button), 0);
    lastFocusedElement = document.activeElement;

    updateLightboxImage();
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    lightboxClose?.focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    lightboxImage.removeAttribute("src");

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  const showLightboxImage = (direction) => {
    if (activeGallery.length <= 1) {
      return;
    }

    activeIndex = (activeIndex + direction + activeGallery.length) % activeGallery.length;
    updateLightboxImage();
  };

  achievementImageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openLightbox(button);
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);

  lightboxPrev?.addEventListener("click", () => {
    showLightboxImage(-1);
  });

  lightboxNext?.addEventListener("click", () => {
    showLightboxImage(1);
  });

  lightbox.addEventListener("click", (event) => {
    const clickTarget = event.target;
    const isInteractiveLightboxElement =
      clickTarget instanceof Element &&
      clickTarget.closest(".lightbox-image, .lightbox-close, .lightbox-nav");

    if (!isInteractiveLightboxElement) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden || event.key !== "Escape") {
      return;
    }

    closeLightbox();
  });
}

const revealSections = document.querySelectorAll(".section");

if (revealSections.length > 0) {
  revealSections.forEach((section) => {
    section.classList.add("reveal");
  });

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    revealSections.forEach((section) => {
      section.classList.add("is-visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -80px 0px",
      },
    );

    revealSections.forEach((section) => {
      revealObserver.observe(section);
    });
  }
}
