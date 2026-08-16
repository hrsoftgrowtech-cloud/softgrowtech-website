// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL = "https://syoqukavgvrdhwxatdav.supabase.co";

// IMPORTANT:
// YAHAN APNA SUPABASE PUBLISHABLE KEY PASTE KARO.
// "PASTE_YOUR_PUBLISHABLE_KEY_HERE" NAHI REHNA CHAHIYE.
const SUPABASE_PUBLISHABLE_KEY = "YOUR_PUBLISHABLE_KEY_HERE";


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


      // ========================================
      // EMPTY ID
      // ========================================

      if (!id) {

        showResult(
          result,
          "#fff7ed",
          "#fed7aa",
          "#9a3412",
          `
            <strong>Please enter a valid Student / Letter ID.</strong>
          `
        );

        return;
      }


      // ========================================
      // CHECK SUPABASE KEY
      // ========================================

      if (
        !SUPABASE_PUBLISHABLE_KEY ||
        SUPABASE_PUBLISHABLE_KEY === "YOUR_PUBLISHABLE_KEY_HERE"
      ) {

        showResult(
          result,
          "#fef2f2",
          "#fecaca",
          "#b91c1c",
          `
            <strong>Supabase Configuration Error</strong><br>
            <small>
              Please add your Supabase Publishable Key in script.js.
            </small>
          `
        );

        return;
      }


      // ========================================
      // LOADING
      // ========================================

      showResult(
        result,
        "#eff6ff",
        "#bfdbfe",
        "#1d4ed8",
        `
          <strong>Verifying...</strong><br>
          Please wait while we check the official record.
        `
      );


      try {

        // ========================================
        // FETCH ALL STUDENT RECORDS
        // ========================================

        const apiUrl =
          `${SUPABASE_URL}/rest/v1/Students?select=*`;

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
        // API ERROR
        // ========================================

        if (!response.ok) {

          let errorText = "";

          try {
            errorText = await response.text();
          } catch (_) {}

          console.error(
            "Supabase error:",
            response.status,
            errorText
          );

          throw new Error(
            `Supabase request failed: ${response.status}`
          );
        }


        const data = await response.json();

        console.log("Supabase records:", data);


        // ========================================
        // FIND STUDENT BY ID
        // ========================================

        const student = findStudentById(data, id);


        // ========================================
        // RECORD NOT FOUND
        // ========================================

        if (!student) {

          showResult(
            result,
            "#fff7ed",
            "#fed7aa",
            "#9a3412",
            `
              <strong>Document Not Found</strong><br>
              Student / Letter ID:
              ${escapeHtml(id)}
              <br>
              <small>
                No verified record was found for this ID.
              </small>
            `
          );

          return;
        }


        // ========================================
        // GET VALUES
        // ========================================

        const studentId =
          getColumnValue(
            student,
            [
              "student_id",
              "Student Id",
              "Student ID",
              "student id",
              "studentid"
            ]
          ) || id;


        const name =
          getColumnValue(
            student,
            [
              "name",
              "Name"
            ]
          ) || "Not Available";


        const domain =
          getColumnValue(
            student,
            [
              "domain",
              "Domain"
            ]
          ) || "Not Available";


        const batch =
          getColumnValue(
            student,
            [
              "batch",
              "Batch",
              "batch_date",
              "Batch date",
              "batch date"
            ]
          ) || "Not Available";


        const offerLetter =
          getColumnValue(
            student,
            [
              "offer_letter",
              "Offer Letter",
              "offer letter"
            ]
          ) || "Not Available";


        const certificate =
          getColumnValue(
            student,
            [
              "certificate",
              "Certificate"
            ]
          ) || "Not Available";


        const status =
          getColumnValue(
            student,
            [
              "status",
              "Status"
            ]
          ) || "Not Available";


        const overallStatus =
          getColumnValue(
            student,
            [
              "overall_status",
              "Overall Status",
              "overall status",
              "Overall status"
            ]
          ) || "Not Available";


        // ========================================
        // SUCCESS
        // ========================================

        result.style.display = "block";
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

                <strong style="
                  display:block;
                  margin-top:5px;
                ">
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

                <strong style="
                  display:block;
                  margin-top:5px;
                ">
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

                <strong style="
                  display:block;
                  margin-top:5px;
                ">
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

                <strong style="
                  display:block;
                  margin-top:5px;
                ">
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

                  <strong>
                    ${escapeHtml(offerLetter)}
                  </strong>

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

                  <strong>
                    ${escapeHtml(certificate)}
                  </strong>

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

                  <strong>
                    ${escapeHtml(status)}
                  </strong>

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

                  <strong>
                    ${escapeHtml(overallStatus)}
                  </strong>

                </div>

              </div>

            </div>

          </div>

        `;

      }


      // ========================================
      // ERROR
      // ========================================

      catch (error) {

        console.error("Verification error:", error);

        showResult(
          result,
          "#fef2f2",
          "#fecaca",
          "#b91c1c",
          `
            <strong>Verification Error</strong><br>
            Unable to connect to the verification database.
            <br>
            <small>
              Please check your Supabase URL, Publishable Key,
              table access and RLS policy.
            </small>
          `
        );

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
// FIND STUDENT BY ID
// ========================================

function findStudentById(records, searchId) {

  if (!Array.isArray(records)) {
    return null;
  }

  const wanted =
    String(searchId)
      .trim()
      .toLowerCase();


  return records.find(record => {

    const possibleId =
      getColumnValue(
        record,
        [
          "student_id",
          "Student Id",
          "Student ID",
          "student id",
          "studentid"
        ]
      );

    if (!possibleId) {
      return false;
    }

    return String(possibleId)
      .trim()
      .toLowerCase() === wanted;

  }) || null;

}


// ========================================
// GET COLUMN VALUE
// ========================================

function getColumnValue(object, possibleNames) {

  if (!object || typeof object !== "object") {
    return "";
  }


  for (const name of possibleNames) {

    if (
      Object.prototype.hasOwnProperty.call(object, name)
      &&
      object[name] !== null
      &&
      object[name] !== undefined
    ) {

      return object[name];

    }

  }


  // Extra flexible matching
  // Converts:
  // Student Id
  // student_id
  // Student ID
  // student id
  // into the same format.

  const normalize = value =>
    String(value)
      .toLowerCase()
      .replace(/[\s_-]/g, "");


  const wantedNames =
    possibleNames.map(normalize);


  for (const actualKey of Object.keys(object)) {

    if (
      wantedNames.includes(normalize(actualKey))
      &&
      object[actualKey] !== null
      &&
      object[actualKey] !== undefined
    ) {

      return object[actualKey];

    }

  }


  return "";

}


// ========================================
// RESULT MESSAGE
// ========================================

function showResult(
  result,
  background,
  borderColor,
  color,
  html
) {

  result.style.display = "block";
  result.style.background = background;
  result.style.borderColor = borderColor;
  result.style.color = color;
  result.innerHTML = html;

}


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
