// Mobile navigation + light page enhancements for index.html
(function () {
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("primaryNav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (nav.classList.contains("open")) {
          nav.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
          menuToggle.setAttribute("aria-label", "Open navigation menu");
        }
      });
    });
  }

  // Apply editable membership URL from config in index.html.
  const configuredUrl = window.MCC_CONFIG?.membershipUrl;
  if (configuredUrl) {
    const membershipAnchors = [document.getElementById("joinBtn"), document.getElementById("membershipLink")];
    membershipAnchors.forEach((anchor) => {
      if (anchor) anchor.href = configuredUrl;
    });
  }

  const yearNode = document.getElementById("year");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
})();
