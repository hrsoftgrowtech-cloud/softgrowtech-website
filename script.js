
document.addEventListener("DOMContentLoaded", () => {
  // Premium scroll-to-top control on every page.
  const scrollTop = document.createElement("button");
  scrollTop.type = "button";
  scrollTop.className = "scroll-top";
  scrollTop.setAttribute("aria-label", "Back to top");
  scrollTop.title = "Back to top";
  scrollTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(scrollTop);
  const updateScrollTop = () => scrollTop.classList.toggle("show", window.scrollY > 420);
  window.addEventListener("scroll", updateScrollTop, {passive:true});
  updateScrollTop();
  scrollTop.addEventListener("click", () => {
    window.scrollTo({top:0,behavior:"smooth"});
  });

  // Very subtle UI click sound. It is generated locally, so no audio file is required.
  let audioContext;
  function playClickSound(){
    try{
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      if(audioContext.state === "suspended") audioContext.resume();
      const now = audioContext.currentTime;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(720, now);
      osc.frequency.exponentialRampToValueAtTime(430, now + 0.055);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
      osc.connect(gain).connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    }catch(_){/* Audio is optional; never block the UI. */}
  }
  document.addEventListener("click", (event) => {
    const target = event.target.closest(".btn, .nav-apply, .menu-btn, .domain-choice, .text-link, .footer-social");
    if(target && !target.hasAttribute("data-no-click-sound")) playClickSound();
  }, true);
  document.body.classList.add("loaded");

  const welcome = document.getElementById("welcomeScreen");
  if (welcome) {
    setTimeout(() => welcome.classList.add("hide"), 1600);
    setTimeout(() => welcome.remove(), 2450);
  }


  // Highlight the current page in the navbar.
  const currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav-links a").forEach(link => {
    const href = (link.getAttribute("href") || "").split("#")[0].split("?")[0].toLowerCase();
    if (!href || href.startsWith("http")) return;
    if (href === currentPage) link.classList.add("active");

    // Domain pages belong to the Internships section.
    if (
      ["web-development.html","data-analysis.html","artificial-intelligence.html","domains.html"].includes(currentPage)
      && href === "internships.html"
    ) link.classList.add("active");
  });

  const menuBtn = document.querySelector(".menu-btn");
  const navLinks = document.getElementById("navLinks");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));
  }

  document.querySelectorAll("[data-verify]").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const input = form.querySelector("input");
      const result = form.parentElement.querySelector(".verify-result");
      if (!input || !result) return;
      const id = input.value.trim();
      if (!id) {
        result.style.display = "block";
        result.style.background = "#fff7ed";
        result.style.borderColor = "#fed7aa";
        result.style.color = "#9a3412";
        result.textContent = "Please enter a valid document ID.";
        return;
      }
      result.style.display = "block";
      result.style.background = "#f0fdf4";
      result.style.borderColor = "#bbf7d0";
      result.style.color = "#166534";
      result.innerHTML = `<strong>Verification request received.</strong><br>Document ID: ${escapeHtml(id)}<br><small>Connect your verification database/API here to display official document details.</small>`;
    });
  });

  document.querySelectorAll(".btn, .nav-apply, .text-link").forEach(el => {
    el.addEventListener("click", () => {
      el.classList.remove("clicked");
      void el.offsetWidth;
      el.classList.add("clicked");
    });
  });
});

function escapeHtml(value){
  return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
