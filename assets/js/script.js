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
  // 1. Initialize AOS Animations IMMEDIATELY so content is never stuck hidden
  if (typeof AOS !== "undefined") {
    AOS.init({ once: true, offset: 50, duration: 800 });
  }

  // 2. Await the Navbar injection
  if (document.getElementById("navbar-placeholder")) {
    await loadComponent("navbar-placeholder", "components/navbar.html");
  }

  // 3. Await the Footer injection
  if (document.getElementById("footer-placeholder")) {
    await loadComponent("footer-placeholder", "components/footer.html");

    // Set dynamic year only after footer is injected
    const yearSpan = document.getElementById("year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  }

  // Refresh AOS just in case the newly injected components have animations
  if (typeof AOS !== "undefined") {
    AOS.refresh();
  }

  // 4. Initialize Mobile Menu (Now that it actually exists in the DOM)
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });

    // Close mobile menu on link click
    document.querySelectorAll("#mobile-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
      });
    });
  }

  // 5. Sticky Navbar Background Logic
  const navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.classList.add("shadow-lg");
        navbar.style.background = "rgba(15, 23, 42, 0.9)";
      } else {
        navbar.classList.remove("shadow-lg");
        navbar.style.background = "rgba(30, 41, 59, 0.7)";
      }
    });
  }

  // 6. Home Page Canvas Animation (Made crash-proof for internal pages)
  const canvas = document.getElementById("hero-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width, height, particles;

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      // Safely check for the home section, otherwise fallback to window height
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
        ctx.fillStyle = "rgba(6, 182, 212, 0.5)";
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
}

// Bulletproof event listener: Runs correctly whether the browser loads the script early or late
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

// --- Formspree AJAX Submission Handler ---
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Stop the browser from redirecting

    const data = new FormData(contactForm);

    // Find the success message div (handles both home and contact pages)
    const successMsg =
      document.getElementById("success-msg") ||
      document.getElementById("success-msg-home");

    try {
      const response = await fetch(contactForm.action, {
        method: contactForm.method,
        body: data,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        // Show success message and clear the form
        if (successMsg) successMsg.classList.remove("hidden");
        contactForm.reset();

        // Optional: Hide the message again after 5 seconds
        setTimeout(() => {
          if (successMsg) successMsg.classList.add("hidden");
        }, 5000);
      } else {
        alert("Oops! There was a problem submitting your form.");
      }
    } catch (error) {
      alert("Oops! There was a problem submitting your form.");
    }
  });
}
