// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL = "https://syoqukavgvrdhwxatdav.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "PASTE_YOUR_PUBLISHABLE_KEY_HERE";


// ========================================
// PAGE LOAD
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");

  const welcome = document.getElementById("welcomeScreen");

  if (welcome) {
    setTimeout(() => welcome.classList.add("hide"), 1600);
    setTimeout(() => welcome.remove(), 2450);
  }


  // ========================================
  // NAVBAR ACTIVE PAGE
  // ========================================

  const currentPage =
    (window.location.pathname.split("/").pop() || "index.html")
      .toLowerCase();

  document.querySelectorAll(".nav-links a").forEach(link => {

    const href =
      (link.getAttribute("href") || "")
        .split("#")[0]
        .split("?")[0]
        .toLowerCase();

    if (!href || href.startsWith("http")) return;

    if (href === currentPage) {
      link.classList.add("active");
    }

    if (
      [
        "web-development.html",
        "data-analysis.html",
        "artificial-intelligence.html",
        "domains.html"
      ].includes(currentPage)
      && href === "internships.html"
    ) {
      link.classList.add("active");
    }
  });


  // ========================================
  // MOBILE MENU
  // ========================================

  const menuBtn = document.querySelector(".menu-btn");
  const navLinks = document.getElementById("navLinks");

  if (menuBtn && navLinks) {

    menuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });

    navLinks.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
      });
    });
  }


  // ========================================
  // DOCUMENT VERIFICATION
  // ========================================

  document.querySelectorAll("[data-verify]").forEach(form => {

    form.addEventListener("submit", async e => {

      e.preventDefault();

      const input = form.querySelector("input");
      const result = form.parentElement.querySelector(".verify-result");

      if (!input || !result) return;

      const id = input.value.trim();

      // Empty ID
      if (!id) {

        result.style.display = "block";
        result.style.background = "#fff7ed";
        result.style.borderColor = "#fed7aa";
        result.style.color = "#9a3412";

        result.textContent =
          "Please enter a valid Student / Letter ID.";

        return;
      }


      // Loading
      result.style.display = "block";
      result.style.background = "#eff6ff";
      result.style.borderColor = "#bfdbfe";
      result.style.color = "#1d4ed8";

      result.innerHTML = `
        <strong>Verifying...</strong><br>
        Please wait while we check the official record.
      `;


      try {

        // ========================================
        // SUPABASE DATABASE REQUEST
        // ========================================

        const apiUrl =
          `${SUPABASE_URL}/rest/v1/Students` +
          `?student_id=eq.${encodeURIComponent(id)}` +
          `&select=*`;

        const response = await fetch(apiUrl, {
          method: "GET",

          headers: {
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization":
              `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json"
          }
        });


        if (!response.ok) {
          throw new Error("Database request failed");
        }


        const data = await response.json();


        // ========================================
        // RECORD NOT FOUND
        // ========================================

        if (!data || data.length === 0) {

          result.style.background = "#fff7ed";
          result.style.borderColor = "#fed7aa";
          result.style.color = "#9a3412";

          result.innerHTML = `
            <strong>Document Not Found</strong><br>
            Student / Letter ID:
            ${escapeHtml(id)}<br>
            <small>
              No verified record was found for this ID.
            </small>
          `;

          return;
        }


        // ========================================
        // RECORD FOUND
        // ========================================

        const student = data[0];


        const studentId =
          student.student_id || id;

        const name =
          student.name || "Not Available";

        const domain =
          student.domain || "Not Available";

        const batch =
          student.batch || "Not Available";

        const offerLetter =
          student.offer_letter || "Not Available";

        const certificate =
          student.certificate || "Not Available";

        const status =
          student.status || "Not Available";

        const overallStatus =
          student.overall_status || "Not Available";


        // ========================================
        // SUCCESS RESULT
        // ========================================

        result.style.background = "#f0fdf4";
        result.style.borderColor = "#bbf7d0";
        result.style.color = "#166534";


        result.innerHTML = `

          <div class="verification-success">

            <div style="
              display:flex;
              align-items:center;
              gap:10px;
              margin-bottom:15px;
            ">

              <div style="
                width:38px;
                height:38px;
                border-radius:50%;
                background:#22c55e;
                color:white;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:22px;
              ">
                ✓
              </div>

              <div>
                <strong style="font-size:18px;">
                  Document Record Verified
                </strong>

                <div style="
                  font-size:13px;
                  margin-top:3px;
                ">
                  The record associated with this Student / Letter ID is valid.
                </div>
              </div>

            </div>


            <div style="
              display:grid;
              grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
              gap:10px;
              margin-top:15px;
            ">

              <div style="
                background:white;
                padding:12px;
                border-radius:10px;
                border:1px solid #dcfce7;
              ">
                <small>Student / Letter ID</small>
                <strong style="display:block;margin-top:5px;">
                  ${escapeHtml(studentId)}
                </strong>
              </div>


              <div style="
                background:white;
                padding:12px;
                border-radius:10px;
                border:1px solid #dcfce7;
              ">
                <small>Student Name</small>
                <strong style="display:block;margin-top:5px;">
                  ${escapeHtml(name)}
                </strong>
              </div>


              <div style="
                background:white;
                padding:12px;
                border-radius:10px;
                border:1px solid #dcfce7;
              ">
                <small>Domain</small>
                <strong style="display:block;margin-top:5px;">
                  ${escapeHtml(domain)}
                </strong>
              </div>


              <div style="
                background:white;
                padding:12px;
                border-radius:10px;
                border:1px solid #dcfce7;
              ">
                <small>Batch</small>
                <strong style="display:block;margin-top:5px;">
                  ${escapeHtml(batch)}
                </strong>
              </div>

            </div>


            <div style="
              margin-top:15px;
              background:white;
              padding:15px;
              border-radius:10px;
              border:1px solid #dcfce7;
            ">

              <strong>Document Status</strong>

              <div style="
                display:grid;
                gap:10px;
                margin-top:12px;
              ">

                <div style="
                  display:flex;
                  justify-content:space-between;
                  gap:10px;
                  padding:10px;
                  background:#f0fdf4;
                  border-radius:8px;
                ">
                  <span>Offer Letter</span>
                  <strong>${escapeHtml(offerLetter)}</strong>
                </div>


                <div style="
                  display:flex;
                  justify-content:space-between;
                  gap:10px;
                  padding:10px;
                  background:#f0fdf4;
                  border-radius:8px;
                ">
                  <span>Certificate</span>
                  <strong>${escapeHtml(certificate)}</strong>
                </div>


                <div style="
                  display:flex;
                  justify-content:space-between;
                  gap:10px;
                  padding:10px;
                  background:#f0fdf4;
                  border-radius:8px;
                ">
                  <span>Status</span>
                  <strong>${escapeHtml(status)}</strong>
                </div>


                <div style="
                  display:flex;
                  justify-content:space-between;
                  gap:10px;
                  padding:10px;
                  background:#f0fdf4;
                  border-radius:8px;
                ">
                  <span>Overall Status</span>
                  <strong>${escapeHtml(overallStatus)}</strong>
                </div>

              </div>

            </div>

          </div>
        `;


      } catch (error) {

        console.error("Verification error:", error);

        result.style.background = "#fef2f2";
        result.style.borderColor = "#fecaca";
        result.style.color = "#b91c1c";

        result.innerHTML = `
          <strong>Verification Error</strong><br>
          Unable to connect to the verification database.
          <br>
          <small>Please try again.</small>
        `;
      }

    });

  });


  // ========================================
  // BUTTON CLICK ANIMATION
  // ========================================

  document
    .querySelectorAll(".btn, .nav-apply, .text-link")
    .forEach(el => {

      el.addEventListener("click", () => {

        el.classList.remove("clicked");

        void el.offsetWidth;

        el.classList.add("clicked");
      });

    });

});


// ========================================
// SECURITY: ESCAPE HTML
// ========================================

function escapeHtml(value) {

  return String(value).replace(
    /[&<>"']/g,

    c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[c])
  );
}
