// --- Theme Initializer (Runs immediately to prevent flashing) ---
const userTheme = localStorage.getItem("theme");
if (userTheme === "light") {
  document.documentElement.classList.add("light");
} else {
  document.documentElement.classList.remove("light"); // Default is dark
}

// Function to load external HTML components
async function loadComponent(elementId, filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error("Network response was not ok");
    const html = await response.text();
    document.getElementById(elementId).innerHTML = html;
    return true;
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return false;
  }
}

// Main initialization function
async function initApp() {
  if (typeof AOS !== "undefined") {
    AOS.init({ once: true, offset: 50, duration: 800 });
  }

  // Await the Component injections
  if (document.getElementById("navbar-placeholder")) {
    await loadComponent("navbar-placeholder", "components/navbar.html");
  }
  if (document.getElementById("footer-placeholder")) {
    await loadComponent("footer-placeholder", "components/footer.html");
    const yearSpan = document.getElementById("year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  }

  if (typeof AOS !== "undefined") AOS.refresh();

  // --- Theme Toggle Logic ---
  const toggleButtons = [
    document.getElementById("theme-toggle-desktop"),
    document.getElementById("theme-toggle-mobile"),
  ];
  const lightIcons = document.querySelectorAll(".light-icon");
  const darkIcons = document.querySelectorAll(".dark-icon");

  function updateThemeUI() {
    const isLight = document.documentElement.classList.contains("light");
    if (isLight) {
      lightIcons.forEach((icon) => icon.classList.remove("hidden"));
      darkIcons.forEach((icon) => icon.classList.add("hidden"));
    } else {
      lightIcons.forEach((icon) => icon.classList.add("hidden"));
      darkIcons.forEach((icon) => icon.classList.remove("hidden"));
    }
  }

  updateThemeUI(); // Run once to set the correct icon on load

  toggleButtons.forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", () => {
        document.documentElement.classList.toggle("light");
        if (document.documentElement.classList.contains("light")) {
          localStorage.setItem("theme", "light");
        } else {
          localStorage.setItem("theme", "dark");
        }
        updateThemeUI();
      });
    }
  });

  // Mobile Menu Logic
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
    document.querySelectorAll("#mobile-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
      });
    });
  }

  // Sticky Navbar Background Logic (Adapted for Themes)
  const navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      const isLight = document.documentElement.classList.contains("light");
      if (window.scrollY > 50) {
        navbar.classList.add("shadow-lg");
        navbar.style.background = isLight
          ? "rgba(255, 255, 255, 0.95)"
          : "rgba(15, 23, 42, 0.9)";
      } else {
        navbar.classList.remove("shadow-lg");
        navbar.style.background = isLight
          ? "rgba(248, 250, 252, 0.7)"
          : "rgba(30, 41, 59, 0.7)";
      }
    });
  }

  // Home Page Canvas Animation
  const canvas = document.getElementById("hero-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width, height, particles;

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      const homeSection = document.getElementById("home");
      height = canvas.height = homeSection
        ? homeSection.offsetHeight
        : window.innerHeight;
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(6, 182, 212, 0.5)"; // Cyan color looks great on dark AND light
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      let numParticles = Math.min(Math.floor(window.innerWidth / 15), 100);
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    }

    function animateCanvas() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i + 1; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.2 - distance / 600})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animateCanvas);
    }

    initParticles();
    animateCanvas();
  }

  // Beautiful Animated Toast Notification Function
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className =
      "fixed bottom-8 right-8 bg-card border border-slate-700/50 border-l-4 border-l-green-500 px-6 py-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(34,197,94,0.3)] flex items-center z-[100] transform transition-all duration-500 translate-y-12 opacity-0 glass";

    toast.innerHTML = `
      <i class="fas fa-check-circle text-green-400 text-2xl mr-4 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"></i>
      <div>
        <h4 class="font-bold text-white text-md tracking-wide">Success</h4>
        <p class="text-sm text-slate-300 mt-0.5">${message}</p>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove("translate-y-12", "opacity-0");
      toast.classList.add("translate-y-0", "opacity-100");
    }, 100);

    setTimeout(() => {
      toast.classList.remove("translate-y-0", "opacity-100");
      toast.classList.add("translate-y-12", "opacity-0");
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 5000);
  }

  // Formspree AJAX Submission Handler
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<i class="fas fa-circle-notch fa-spin mr-2"></i> Sending...';
      submitBtn.disabled = true;

      const data = new FormData(contactForm);

      try {
        const response = await fetch(contactForm.action, {
          method: contactForm.method,
          body: data,
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          showToast("I have received your message and will reply soon.");
          contactForm.reset();
        } else {
          alert("Oops! There was a problem submitting your form.");
        }
      } catch (error) {
        alert("Oops! There was a problem submitting your form.");
      } finally {
        submitBtn.innerHTML = originalBtnHtml;
        submitBtn.disabled = false;
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
