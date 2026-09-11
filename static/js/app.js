/**
 * VerdaMetric AI - Main Application Controller
 * Handles SPA navigation, dark/light theme, toast notifications, mobile drawer, and scroll effects.
 */

// Toast Notification Engine
window.showToast = function(message, type = "info", title = "") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: "fa-solid fa-circle-check",
    error: "fa-solid fa-triangle-exclamation",
    info: "fa-solid fa-circle-info"
  };

  const defaultTitles = {
    success: "Success",
    error: "Attention Required",
    info: "Information"
  };

  const toastTitle = title || defaultTitles[type] || "Notice";
  const iconClass = iconMap[type] || "fa-solid fa-bell";

  toast.innerHTML = `
    <div class="toast-icon"><i class="${iconClass}"></i></div>
    <div class="toast-content">
      <div class="toast-title">${toastTitle}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close" aria-label="Dismiss">&times;</button>
  `;

  container.appendChild(toast);

  // Trigger entrance
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  const closeToast = () => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector(".toast-close").addEventListener("click", closeToast);
  setTimeout(closeToast, 4500);
};

// Router & View Switcher
class AppRouter {
  constructor() {
    this.validViews = ["home", "prediction", "performance", "dataset", "about", "contact"];
    this.init();
  }

  init() {
    // Handle initial hash or path
    window.addEventListener("hashchange", () => this.handleRoute());
    
    // Bind nav link clicks
    document.querySelectorAll("[data-nav]").forEach(el => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const targetView = el.getAttribute("data-nav");
        this.navigateTo(targetView);
      });
    });

    // Handle deep links from URL path or hash
    const initialHash = window.location.hash.replace("#", "");
    const initialPath = window.location.pathname.replace("/", "");
    
    if (this.validViews.includes(initialHash)) {
      this.navigateTo(initialHash, false);
    } else if (this.validViews.includes(initialPath)) {
      this.navigateTo(initialPath, false);
    } else {
      this.navigateTo("home", false);
    }
  }

  navigateTo(viewName, updateHash = true) {
    if (!this.validViews.includes(viewName)) viewName = "home";

    if (updateHash) {
      window.location.hash = viewName;
    }

    // Update active nav links
    document.querySelectorAll(".nav-link").forEach(link => {
      const match = link.getAttribute("data-nav") === viewName;
      link.classList.toggle("active", match);
    });

    // Switch view sections
    document.querySelectorAll(".page-view").forEach(view => {
      const isTarget = view.id === `view-${viewName}`;
      view.classList.toggle("active", isTarget);
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Trigger on-demand loads
    if (viewName === "performance" && window.initPerformanceDashboard) {
      window.initPerformanceDashboard();
    } else if (viewName === "dataset" && window.initDatasetExplorer) {
      window.initDatasetExplorer();
    }

    // Close mobile drawer if open
    const drawer = document.getElementById("mobileDrawer");
    if (drawer && drawer.classList.contains("open")) {
      drawer.classList.remove("open");
    }
  }

  handleRoute() {
    const hash = window.location.hash.replace("#", "") || "home";
    this.navigateTo(hash, false);
  }
}

// Theme Engine
class ThemeEngine {
  constructor() {
    this.toggleBtn = document.getElementById("themeToggle");
    this.mobileToggleBtn = document.getElementById("mobileThemeToggle");
    this.themeIcon = document.getElementById("themeIcon");
    this.init();
  }

  init() {
    const saved = localStorage.getItem("verdametric_theme") || "dark";
    this.applyTheme(saved);

    const handler = () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      this.applyTheme(next);
      localStorage.setItem("verdametric_theme", next);
      window.showToast(`Switched to ${next === "dark" ? "Dark" : "Light"} mode`, "info");
      
      // Update charts if present
      if (window.updateChartsTheme) {
        window.updateChartsTheme(next);
      }
    };

    if (this.toggleBtn) this.toggleBtn.addEventListener("click", handler);
    if (this.mobileToggleBtn) this.mobileToggleBtn.addEventListener("click", handler);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (this.themeIcon) {
      if (theme === "light") {
        this.themeIcon.className = "fa-solid fa-moon";
      } else {
        this.themeIcon.className = "fa-solid fa-sun";
      }
    }
  }
}

// Global UI Polish
document.addEventListener("DOMContentLoaded", () => {
  // Initialize router and theme
  window.router = new AppRouter();
  window.themeEngine = new ThemeEngine();

  // Floating Back to Top Button
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 350) {
        scrollTopBtn.classList.add("visible");
      } else {
        scrollTopBtn.classList.remove("visible");
      }
    });

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Mobile Drawer Toggle
  const mobileToggle = document.getElementById("mobileToggle");
  const drawerClose = document.getElementById("drawerClose");
  const mobileDrawer = document.getElementById("mobileDrawer");

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener("click", () => mobileDrawer.classList.add("open"));
  }
  if (drawerClose && mobileDrawer) {
    drawerClose.addEventListener("click", () => mobileDrawer.classList.remove("open"));
  }

  // Modal Dialog: Model Replacement Guide
  const guideModal = document.getElementById("modelGuideModal");
  const openGuideBtns = document.querySelectorAll("[data-open-modal='modelGuide']");
  const closeGuideBtns = document.querySelectorAll("[data-close-modal]");

  openGuideBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (guideModal) guideModal.classList.add("open");
    });
  });

  closeGuideBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (guideModal) guideModal.classList.remove("open");
    });
  });

  if (guideModal) {
    guideModal.addEventListener("click", (e) => {
      if (e.target === guideModal) guideModal.classList.remove("open");
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && guideModal.classList.contains("open")) {
        guideModal.classList.remove("open");
      }
    });
  }

  // FAQ Accordion
  document.querySelectorAll(".faq-question").forEach(q => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });

  // Contact Form Submission
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("contactName").value.trim();
      const email = document.getElementById("contactEmail").value.trim();
      const message = document.getElementById("contactMessage").value.trim();
      const submitBtn = contactForm.querySelector("button[type='submit']");

      if (!name || !email || !message) {
        window.showToast("Please fill in all fields before sending.", "error");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Inquiry...';

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message })
        });
        const data = await res.json();
        if (data.success) {
          window.showToast(data.message, "success", "Message Sent");
          contactForm.reset();
        } else {
          window.showToast(data.error || "Failed to transmit inquiry", "error");
        }
      } catch (err) {
        window.showToast("Server connection error. Please try again.", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Inquiry';
      }
    });
  }
});