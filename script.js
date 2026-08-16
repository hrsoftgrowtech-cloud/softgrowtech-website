// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL = "https://syoqukavgvrdhwxatdav.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_yUuacAdfZy3k-_Zve5QOZA_6eLh9FeZ";


// ========================================
// PAGE LOAD
// ========================================

document.addEventListener("DOMContentLoaded", () => {

  document.body.classList.add("loaded");

  // ========================================
  // WELCOME SCREEN
  // ========================================

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
      ].includes(currentPage) &&
      href === "internships.html"
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


      // ========================================
      // EMPTY ID
      // ========================================

      if (!id) {

        showVerificationMessage(
          result,
          "invalid",
          `
            <strong>Invalid Official ID</strong><br>
            Please enter your official Student / Letter ID
            and try again.
          `
        );

        return;
      }


      // ========================================
      // BASIC ID FORMAT CHECK
      // ========================================

      const idPattern = /^SGT-[A-Z0-9]+-[A-Z0-9]+-\d{4}$/i;

      if (!idPattern.test(id)) {

        showVerificationMessage(
          result,
          "invalid",
          `
            <strong>Invalid Official ID</strong><br>
            Please check your Official ID and try again.
            <br>
            <small>
              Enter the exact ID mentioned on your official document.
            </small>
          `
        );

        return;
      }


      // ========================================
      // LOADING
      // ========================================

      showVerificationMessage(
        result,
        "loading",
        `
          <strong>Verifying Official Record...</strong><br>
          <small>
            Please wait while we securely check the verification database.
          </small>
        `
      );


      try {

        // ========================================
        // SUPABASE REST API
        // IMPORTANT: table is "students"
        // ========================================

        const apiUrl =
          `${SUPABASE_URL}/rest/v1/students` +
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


        // ========================================
        // DATABASE ERROR
        // ========================================

        if (!response.ok) {

          let errorMessage = "";

          try {
            const errorData = await response.json();
            errorMessage =
              errorData.message ||
              errorData.hint ||
              errorData.error ||
              "";
          } catch (_) {
            // Ignore JSON parsing error
          }

          console.error(
            "Supabase error:",
            response.status,
            errorMessage
          );

          throw new Error(
            `Supabase request failed: ${response.status}`
          );
        }


        const data = await response.json();


        // ========================================
        // INVALID / FAKE ID
        // ========================================

        if (!Array.isArray(data) || data.length === 0) {

          showVerificationMessage(
            result,
            "invalid",
            `
              <div style="text-align:left;">

                <div style="
                  display:flex;
                  align-items:center;
                  gap:10px;
                  margin-bottom:10px;
                ">

                  <div style="
                    width:36px;
                    height:36px;
                    min-width:36px;
                    border-radius:50%;
                    background:#dc2626;
                    color:#fff;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:20px;
                    font-weight:bold;
                  ">
                    !
                  </div>

                  <strong style="font-size:18px;">
                    Invalid Official ID
                  </strong>

                </div>

                <div>
                  The Student / Letter ID you entered could not
                  be verified in our official records.
                </div>

                <div style="
                  margin-top:10px;
                  padding:10px 12px;
                  background:#fff;
                  border-radius:8px;
                  border:1px solid #fecaca;
                ">
                  <strong>Entered ID:</strong>
                  ${escapeHtml(id)}
                </div>

                <small style="
                  display:block;
                  margin-top:10px;
                ">
                  Please check your Official ID and try again.
                </small>

              </div>
            `
          );

          return;
        }


        // ========================================
        // VERIFIED RECORD
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
          student.status || "Verified";

        const overallStatus =
          student.overall_status || "Verified";


        // ========================================
        // SUCCESS
        // ========================================

        showVerificationMessage(
          result,
          "success",
          `

            <div style="text-align:left;">

              <div style="
                display:flex;
                align-items:center;
                gap:12px;
                margin-bottom:16px;
              ">

                <div style="
                  width:42px;
                  height:42px;
                  min-width:42px;
                  border-radius:50%;
                  background:#16a34a;
                  color:#fff;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  font-size:24px;
                  font-weight:bold;
                ">
                  ✓
                </div>

                <div>

                  <strong style="
                    display:block;
                    font-size:19px;
                  ">
                    Document Successfully Verified
                  </strong>

                  <small>
                    This record has been verified against
                    the official database.
                  </small>

                </div>

              </div>


              <div style="
                display:grid;
                grid-template-columns:
                  repeat(auto-fit,minmax(170px,1fr));
                gap:10px;
              ">


                <!-- ID -->

                <div style="
                  background:#fff;
                  padding:13px;
                  border-radius:9px;
                  border:1px solid #bbf7d0;
                ">

                  <small>Student / Letter ID</small>

                  <strong style="
                    display:block;
                    margin-top:5px;
                  ">
                    ${escapeHtml(studentId)}
                  </strong>

                </div>


                <!-- NAME -->

                <div style="
                  background:#fff;
                  padding:13px;
                  border-radius:9px;
                  border:1px solid #bbf7d0;
                ">

                  <small>Student Name</small>

                  <strong style="
                    display:block;
                    margin-top:5px;
                  ">
                    ${escapeHtml(name)}
                  </strong>

                </div>


                <!-- DOMAIN -->

                <div style="
                  background:#fff;
                  padding:13px;
                  border-radius:9px;
                  border:1px solid #bbf7d0;
                ">

                  <small>Domain</small>

                  <strong style="
                    display:block;
                    margin-top:5px;
                  ">
                    ${escapeHtml(domain)}
                  </strong>

                </div>


                <!-- BATCH -->

                <div style="
                  background:#fff;
                  padding:13px;
                  border-radius:9px;
                  border:1px solid #bbf7d0;
                ">

                  <small>Batch</small>

                  <strong style="
                    display:block;
                    margin-top:5px;
                  ">
                    ${escapeHtml(batch)}
                  </strong>

                </div>

              </div>


              <!-- DOCUMENT STATUS -->

              <div style="
                margin-top:15px;
                background:#fff;
                padding:15px;
                border-radius:10px;
                border:
