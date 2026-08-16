const SUPABASE_URL = "https://syoqukavgvrdhwxatdav.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_yUuacAdfZy3k-_Zve5QOZA_6eLh9FeZ";

document.addEventListener("DOMContentLoaded", () => {

  // PAGE LOADED
  document.body.classList.add("loaded");

  // WELCOME SCREEN
  const welcome = document.getElementById("welcomeScreen");

  if (welcome) {
    setTimeout(() => {
      welcome.classList.add("hide");
    }, 1600);

    setTimeout(() => {
      welcome.remove();
    }, 2450);
  }

  // NAVBAR ACTIVE PAGE
  const currentPage =
    (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

  document.querySelectorAll(".nav-links a").forEach(link => {
    const href = (link.getAttribute("href") || "")
      .split("#")[0]
      .split("?")[0]
      .toLowerCase();

    if (!href || href.startsWith("http")) return;

    if (href === currentPage) {
      link.classList.add("active");
    }

    if (
      ["web-development.html", "data-analysis.html",
       "artificial-intelligence.html", "domains.html"]
        .includes(currentPage) &&
      href === "internships.html"
    ) {
      link.classList.add("active");
    }
  });

  // MOBILE MENU
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

  // DOCUMENT VERIFICATION
  document.querySelectorAll("[data-verify]").forEach(form => {

    form.addEventListener("submit", async e => {
      e.preventDefault();

      const input = form.querySelector("input");
      const result = form.parentElement.querySelector(".verify-result");

      if (!input || !result) return;

      const id = input.value.trim();

      // EMPTY ID
      if (!id) {
        showResult(result, "invalid", `
          <strong>Invalid Official ID</strong><br>
          Please enter your Official ID and try again.
        `);
        return;
      }

      // CHECK ID FORMAT
      if (!/^SGT-[A-Z0-9]+-[A-Z0-9]+-\\d{4}$/i.test(id)) {
        showResult(result, "invalid", `
          <strong>Invalid Official ID</strong><br>
          Please check your Official ID and try again.
          <br>
          <small>
            Enter the exact ID mentioned on your official document.
          </small>
        `);
        return;
      }

      // LOADING
      showResult(result, "loading", `
        <strong>Verifying Official Record...</strong><br>
        <small>Please wait while we check the official database.</small>
      `);

      try {

        const url =
          SUPABASE_URL +
          "/rest/v1/students?student_id=eq." +
          encodeURIComponent(id) +
          "&select=*";

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization": "Bearer " + SUPABASE_PUBLISHABLE_KEY
          }
        });

        if (!response.ok) {
          throw new Error("Database request failed");
        }

        const data = await response.json();

        // INVALID ID
        if (!Array.isArray(data) || data.length === 0) {
          showResult(result, "invalid", `
            <strong>Invalid Official ID</strong><br>
            The ID you entered could not be verified in our official records.
            <br><br>
            <strong>Entered ID:</strong> ${escapeHtml(id)}
            <br>
            <small>
              Please check your Official ID and try again.
            </small>
          `);
          return;
        }

        // VERIFIED RECORD
        const student = data[0];

        const studentId = student.student_id || id;
        const name = student.name || "Not Available";
        const domain = student.domain || "Not Available";
        const batch = student.batch || "Not Available";
        const offerLetter = student.offer_letter || "Not Available";
        const certificate = student.certificate || "Not Available";
        const status = student.status || "Verified";
        const overallStatus = student.overall_status || "Verified";

        showResult(result, "success", `
          <div style="text-align:left">

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
                background:#16a34a;
                color:white;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:22px;
                font-weight:bold;
              ">✓</div>

              <div>
                <strong style="font-size:18px">
                  Document Successfully Verified
                </strong>
                <br>
                <small>
                  This record has been verified against our official database.
                </small>
              </div>
            </div>

            <div style="
              display:grid;
              grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
              gap:10px;
            ">

              ${box("Student / Letter ID", studentId)}
              ${box("Student Name", name)}
              ${box("Domain", domain)}
              ${box("Batch", batch)}

            </div>

            <div style="
              margin-top:15px;
              background:white;
              padding:14px;
              border-radius:10px;
              border:1px solid #bbf7d0;
            ">

              <strong>Document Status</strong>

              <div style="margin-top:10px">

                ${statusRow("Offer Letter", offerLetter)}
                ${statusRow("Certificate", certificate)}
                ${statusRow("Status", status)}
                ${statusRow("Overall Status", overallStatus)}

              </div>
            </div>

            <small style="
              display:block;
              margin-top:12px;
              opacity:.7;
            ">
              Verification completed using the official SoftGrowTech
              verification database.
            </small>

          </div>
        `);

      } catch (error) {

        console.error("Verification error:", error);

        showResult(result, "error", `
          <strong>Verification Service Unavailable</strong><br>
          We couldn't connect to the verification service at the moment.
          <br>
          <small>Please try again in a few moments.</small>
        `);
      }
    });
  }

  // BUTTON ANIMATION
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


// RESULT MESSAGE
function showResult(result, type, html) {

  result.style.display = "block";

  if (type === "success") {
    result.style.background = "#f0fdf4";
    result.style.borderColor = "#bbf7d0";
    result.style.color = "#166534";
  }

  else if (type === "invalid") {
    result.style.background = "#fef2f2";
    result.style.borderColor = "#fecaca";
    result.style.color = "#991b1b";
  }

  else if (type === "loading") {
    result.style.background = "#eff6ff";
    result.style.borderColor = "#bfdbfe";
    result.style.color = "#1d4ed8";
  }

  else {
    result.style.background = "#fef2f2";
    result.style.borderColor = "#fecaca";
    result.style.color = "#b91c1c";
  }

  result.innerHTML = html;
}


// INFO BOX
function box(label, value) {
  return `
    <div style="
      background:white;
      padding:12px;
      border-radius:9px;
      border:1px solid #bbf7d0;
    ">
      <small>${label}</small>
      <strong style="
        display:block;
        margin-top:5px;
      ">
        ${escapeHtml(value)}
      </strong>
    </div>
  `;
}


// STATUS ROW
function statusRow(label, value) {
  return `
    <div style="
      display:flex;
      justify-content:space-between;
      gap:10px;
      padding:9px;
      margin-top:7px;
      background:#f0fdf4;
      border-radius:7px;
    ">
      <span>${label}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}


// SECURITY
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}
