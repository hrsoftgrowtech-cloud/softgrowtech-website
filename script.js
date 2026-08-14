
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");

  const welcome = document.getElementById("welcomeScreen");
  if (welcome) {
    const seen = sessionStorage.getItem("softgrow_welcome_seen");
    if (seen) welcome.remove();
    else {
      sessionStorage.setItem("softgrow_welcome_seen","1");
      setTimeout(() => welcome.classList.add("hide"), 1900);
      setTimeout(() => welcome.remove(), 2850);
    }
  }

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
