// ============================================================
// SOFTGROWTECH — FINAL WEBSITE SCRIPT
// SUPABASE DOCUMENT VERIFICATION
// ============================================================

const SUPABASE_URL =
  "https://syoqukavgvrdhwxatdav.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_yUuacAdfZy3k-_Zve5QOZA_6eLh9FeZ";


// ============================================================
// GLOBAL HELPERS
// ============================================================

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char])
  );
}


function formatDate(value) {

  if (!value) {
    return "Not Available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return escapeHtml(value);
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}


// ============================================================
// VERIFICATION ANIMATIONS
// ============================================================

function addVerificationAnimation() {

  if (document.getElementById("softgrowVerificationStyles")) {
    return;
  }

  const style = document.createElement("style");

  style.id = "softgrowVerificationStyles";

  style.textContent = `

    @keyframes softgrowSpin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes softgrowProgress {
      from {
        width: 0%;
      }

      to {
        width: 100%;
      }
    }

    @keyframes softgrowFadeUp {
      from {
        opacity: 0;
        transform: translateY(18px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes softgrowPop {
      0% {
        opacity: 0;
        transform: scale(.75);
      }

      70% {
        transform: scale(1.08);
      }

      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    .softgrow-verification-page {
      animation: softgrowFadeUp .5s ease both;
    }

    .softgrow-check-icon {
      animation: softgrowPop .55s ease both;
    }

    .softgrow-status-card {
      transition:
        transform .25s ease,
        box-shadow .25s ease;
    }

    .softgrow-status-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(15,23,42,.08);
    }

    .softgrow-back-button {
      transition:
        transform .2s ease,
        box-shadow .2s ease,
        background .2s ease;
    }

    .softgrow-back-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(37,99,235,.20);
    }

    @media (max-width: 700px) {

      .softgrow-verification-page {
        border-radius: 12px !important;
      }

      .softgrow-info-grid {
        grid-template-columns: 1fr !important;
      }

      .softgrow-document-row {
        flex-direction: column !important;
        align-items: flex-start !important;
      }

      .softgrow-document-badge {
        align-self: flex-start !important;
      }

      .softgrow-header {
        padding: 18px !important;
      }

      .softgrow-main {
        padding: 18px !important;
      }

    }

  `;

  document.head.appendChild(style);
}


// ============================================================
// SHOW GENERIC RESULT
// ============================================================

function showResult(result, type, html) {

  if (!result) {
    return;
  }

  result.style.display = "block";

  result.innerHTML = html;

  if (type === "error") {

    result.style.background = "#fff7f7";
    result.style.border = "1px solid #fecaca";
    result.style.color = "#991b1b";

  } else {

    result.style.background = "#ffffff";
    result.style.border = "1px solid #e2e8f0";
    result.style.color = "#0f172a";

  }

}


// ============================================================
// DOCUMENT READY
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  // ==========================================================
  // PAGE LOADED
  // ==========================================================

  document.body.classList.add("loaded");


  // ==========================================================
  // WELCOME SCREEN
  // ==========================================================

  const welcome =
    document.getElementById("welcomeScreen");

  if (welcome) {

    setTimeout(() => {
      welcome.classList.add("hide");
    }, 1600);

    setTimeout(() => {

      if (welcome && welcome.parentNode) {
        welcome.remove();
      }

    }, 2450);

  }


  // ==========================================================
  // VERIFICATION CSS
  // ==========================================================

  addVerificationAnimation();


  // ==========================================================
  // SCROLL TO TOP BUTTON
  // ==========================================================

  const scrollTop =
    document.createElement("button");

  scrollTop.type = "button";
  scrollTop.className = "scroll-top";
  scrollTop.setAttribute(
    "aria-label",
    "Back to top"
  );
  scrollTop.title = "Back to top";

  scrollTop.innerHTML = `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 19V5M6.5 10.5 12 5l5.5 5.5"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;

  document.body.appendChild(scrollTop);


  function updateScrollTop() {

    scrollTop.classList.toggle(
      "show",
      window.scrollY > 420
    );

  }


  window.addEventListener(
    "scroll",
    updateScrollTop,
    { passive: true }
  );

  updateScrollTop();


  scrollTop.addEventListener(
    "click",
    () => {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );


  // ==========================================================
  // PREMIUM CLICK SOUND
  // ==========================================================

  let audioContext = null;


  function playClickSound() {

    try {

      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) {
        return;
      }

      audioContext =
        audioContext ||
        new AudioContext();


      if (
        audioContext.state === "suspended"
      ) {

        audioContext.resume();

      }


      const now =
        audioContext.currentTime;


      const oscillator =
        audioContext.createOscillator();


      const gain =
        audioContext.createGain();


      oscillator.type = "sine";


      oscillator.frequency.setValueAtTime(
        720,
        now
      );


      oscillator.frequency.exponentialRampToValueAtTime(
        430,
        now + 0.055
      );


      gain.gain.setValueAtTime(
        0.0001,
        now
      );


      gain.gain.exponentialRampToValueAtTime(
        0.025,
        now + 0.006
      );


      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.065
      );


      oscillator.connect(gain);
      gain.connect(
        audioContext.destination
      );


      oscillator.start(now);
      oscillator.stop(now + 0.07);

    } catch (error) {

      // Sound is optional.

    }

  }


  document.addEventListener(
    "click",
    event => {

      const target =
        event.target.closest(
          ".btn, .nav-apply, .menu-btn, .domain-choice, .text-link, .footer-social, button"
        );


      if (
        target &&
        !target.hasAttribute(
          "data-no-click-sound"
        )
      ) {

        playClickSound();

      }

    },
    true
  );


  // ==========================================================
  // ACTIVE NAVIGATION
  // ==========================================================

  const currentPage =
    (
      window.location.pathname
        .split("/")
        .pop() || "index.html"
    ).toLowerCase();


  document
    .querySelectorAll(".nav-links a")
    .forEach(link => {

      const href =
        (
          link.getAttribute("href") || ""
        )
          .split("#")[0]
          .split("?")[0]
          .toLowerCase();


      if (
        !href ||
        href.startsWith("http")
      ) {
        return;
      }


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


  // ==========================================================
  // MOBILE MENU
  // ==========================================================

  const menuBtn =
    document.querySelector(".menu-btn");


  const navLinks =
    document.getElementById("navLinks");


  if (
    menuBtn &&
    navLinks
  ) {

    menuBtn.addEventListener(
      "click",
      () => {

        navLinks.classList.toggle("open");

      }
    );


    navLinks
      .querySelectorAll("a")
      .forEach(link => {

        link.addEventListener(
          "click",
          () => {

            navLinks.classList.remove("open");

          }
        );

      });

  }


  // ==========================================================
  // DOCUMENT VERIFICATION
  // ==========================================================

  document
    .querySelectorAll("[data-verify]")
    .forEach(form => {


      form.addEventListener(
        "submit",
        async event => {

          event.preventDefault();


          const input =
            form.querySelector("input");


          let result =
            form.querySelector(".verify-result");


          if (!result) {

            result =
              form.parentElement?.querySelector(
                ".verify-result"
              );

          }


          if (!input) {
            return;
          }


          // Create result container if HTML
          // doesn't already contain one.

          if (!result) {

            result =
              document.createElement("div");

            result.className =
              "verify-result";

            result.style.marginTop =
              "20px";

            form.insertAdjacentElement(
              "afterend",
              result
            );

          }


          const id =
            input.value.trim();


          // ==================================================
          // EMPTY ID
          // ==================================================

          if (!id) {

            showResult(
              result,
              "error",
              `

                <div
                  style="
                    padding:32px 20px;
                    text-align:center;
                  "
                >

                  <div
                    style="
                      width:58px;
                      height:58px;
                      margin:0 auto 16px;
                      border-radius:50%;
                      background:#fee2e2;
                      color:#dc2626;
                      display:flex;
                      align-items:center;
                      justify-content:center;
                      font-size:27px;
                      font-weight:800;
                    "
                  >
                    !
                  </div>


                  <h2
                    style="
                      margin:0 0 9px;
                      color:#991b1b;
                      font-size:22px;
                    "
                  >
                    Invalid Official ID
                  </h2>


                  <p
                    style="
                      margin:0;
                      color:#7f1d1d;
                    "
                  >
                    Please check your Official ID
                    and try again.
                  </p>

                </div>

              `
            );

            return;

          }


          // ==================================================
          // 3 SECOND VERIFICATION PROCESS
          // ==================================================

          result.style.display = "block";
          result.style.background = "#ffffff";
          result.style.border =
            "1px solid #dbeafe";


          result.innerHTML = `

            <div
              style="
                text-align:center;
                padding:48px 20px;
              "
            >

              <div
                style="
                  width:68px;
                  height:68px;
                  margin:0 auto 22px;
                  border:5px solid #dbeafe;
                  border-top-color:#2563eb;
                  border-radius:50%;
                  animation:softgrowSpin 1s linear infinite;
                "
              ></div>


              <h2
                style="
                  margin:0 0 9px;
                  color:#0f172a;
                  font-size:22px;
                "
              >
                Verifying Your Document
              </h2>


              <p
                style="
                  margin:0;
                  color:#64748b;
                  font-size:14px;
                "
              >
                Securely checking your official
                SoftGrowTech record...
              </p>


              <div
                style="
                  max-width:320px;
                  height:6px;
                  margin:24px auto 0;
                  background:#e2e8f0;
                  border-radius:20px;
                  overflow:hidden;
                "
              >

                <div
                  style="
                    width:0;
                    height:100%;
                    background:#2563eb;
                    border-radius:20px;
                    animation:softgrowProgress 3s linear forwards;
                  "
                ></div>

              </div>


              <div
                style="
                  margin-top:12px;
                  color:#94a3b8;
                  font-size:13px;
                "
              >
                Authenticating official record...
              </div>

            </div>

          `;


          // Give browser time to render
          // the verification animation.

          await delay(3000);


          // ==================================================
          // SUPABASE DATABASE REQUEST
          // ==================================================

          try {

            const apiUrl =
              `${SUPABASE_URL}/rest/v1/Students` +
              `?Student%20Id=eq.${encodeURIComponent(id)}` +
              `&select=*`;


            const response =
              await fetch(
                apiUrl,
                {
                  method: "GET",

                  headers: {

                    "apikey":
                      SUPABASE_PUBLISHABLE_KEY,

                    "Authorization":
                      `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,

                    "Content-Type":
                      "application/json"

                  }
                }
              );


            if (!response.ok) {

              const errorText =
                await response.text();

              console.error(
                "Supabase error:",
                response.status,
                errorText
              );

              throw new Error(
                "Supabase request failed"
              );

            }


            const data =
              await response.json();


            // ==================================================
            // INVALID / FAKE ID
            // ==================================================

            if (
              !Array.isArray(data) ||
              data.length === 0
            ) {

              showResult(
                result,
                "error",
                `

                  <div
                    style="
                      padding:38px 20px;
                      text-align:center;
                    "
                  >

                    <div
                      style="
                        width:62px;
                        height:62px;
                        margin:0 auto 17px;
                        border-radius:50%;
                        background:#fee2e2;
                        color:#dc2626;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:29px;
                        font-weight:800;
                      "
                    >
                      !
                    </div>


                    <h2
                      style="
                        margin:0 0 10px;
                        color:#991b1b;
                        font-size:23px;
                      "
                    >
                      Invalid Official ID
                    </h2>


                    <p
                      style="
                        margin:0;
                        color:#7f1d1d;
                        font-size:15px;
                      "
                    >
                      The ID you entered could not
                      be found in our official records.
                    </p>


                    <p
                      style="
                        margin:13px 0 0;
                        color:#64748b;
                        font-size:13px;
                      "
                    >
                      Please check your Official ID
                      and try again.
                    </p>


                    <div
                      style="
                        margin-top:18px;
                        display:inline-block;
                        padding:8px 13px;
                        background:#f8fafc;
                        border:1px solid #e2e8f0;
                        border-radius:8px;
                        color:#475569;
                        font-size:12px;
                      "
                    >
                      Entered ID:
                      <strong>
                        ${escapeHtml(id)}
                      </strong>
                    </div>

                  </div>

                `
              );

              return;

            }


            // ==================================================
            // VALID RECORD
            // ==================================================

            const student =
              data[0];


            const studentId =
              student["Student Id"] ||
              id;


            const name =
              student["Name"] ||
              "Not Available";


            const domain =
              student["Domain"] ||
              "Not Available";


            const batchDate =
              formatDate(
                student["Batch date"]
              );


            const offerLetter =
              student["Offer Letter"] ||
              "Not Available";


            const certificate =
              student["Certificate"] ||
              "Not Available";


            const status =
              student["Status"] ||
              "Not Available";


            // ==================================================
            // SHOW VERIFIED RESULT
            // ==================================================

            showVerifiedResult(
              result,
             ${escapeHtml(overallTitle)}
              </strong>


              <p
                style="
                  margin:8px 0 0;
                  color:#475569;
                  font-size:12px;
                  max-width:180px;
                "
              >
                ${escapeHtml(overallText)}
              </p>

            </div>


            <!-- DOCUMENT STATUS -->

            <div>

              <h2
                style="
                  margin:0 0 13px;
                  color:#0f172a;
                  font-size:18px;
                "
              >
                Document Status
              </h2>


              <!-- OFFER LETTER -->

              <div
                class="softgrow-document-row"
                style="
                  display:flex;
                  justify-content:space-between;
                  align-items:center;
                  gap:15px;
                  padding:15px;
                  background:#ffffff;
                  border:1px solid #dcfce7;
                  border-radius:11px;
                  margin-bottom:10px;
                "
              >

                <div>

                  <strong
                    style="
                      display:block;
                      color:#0f172a;
                      margin-bottom:4px;
                    "
                  >
                    Offer Letter
                  </strong>


                  <span
                    style="
                      color:#64748b;
                      font-size:13px;
                    "
                  >
                    ${offerVerified
                      ? "Offer letter has been issued and verified."
                      : escapeHtml(offerLetter)}
                  </span>

                </div>


                <span
                  class="softgrow-document-badge"
                  style="
                    white-space:nowrap;
                    background:#dcfce7;
                    color:#15803d;
                    padding:8px 11px;
                    border-radius:7px;
                    font-size:12px;
                    font-weight:700;
                  "
                >
                  ✓
                  ${offerVerified
                    ? "Received & Verified"
                    : escapeHtml(offerLetter)}
                </span>

              </div>


              <!-- CERTIFICATE -->

              <div
                class="softgrow-document-row"
                style="
                  display:flex;
                  justify-content:space-between;
                  align-items:center;
                  gap:15px;
                  padding:15px;
                  background:#ffffff;
                  border:1px solid #dcfce7;
                  border-radius:11px;
                "
              >

                <div>

                  <strong
                    style="
                      display:block;
                      color:#0f172a;
                      margin-bottom:4px;
                    "
                  >
                    Certificate
                  </strong>


                  <span
                    style="
                      color:#64748b;
                      font-size:13px;
                    "
                  >
                    ${certificateIssued
                      ? "Certificate has been issued."
                      : "Certificate status is currently being updated."}
                  </span>

                </div>


                <span
                  class="softgrow-document-badge"
                  style="
                    white-space:nowrap;
                    background:${certificateIssued
                      ? "#dcfce7"
                      : "#fef3c7"};
                    color:${certificateIssued
                      ? "#15803d"
                      : "#b45309"};
                    padding:8px 11px;
                    border-radius:7px;
                    font-size:12px;
                    font-weight:700;
                  "
                >
                  ${certificateIssued
                    ? "✓ Received & Verified"
                    : "⌛ Coming Soon"}
                </span>

              </div>

            </div>

          </div>

        </div>


        <!-- ==================================================
             COMPLETED STATUS
        =================================================== -->

        ${
          isCompleted
            ? `

              <div
                class="softgrow-status-card"
                style="
                  border:1px solid #bfdbfe;
                  background:#eff6ff;
                  border-radius:15px;
                  padding:20px;
                  margin-bottom:18px;
                "
              >

                <div
                  style="
                    display:inline-block;
                    background:#2563eb;
                    color:#ffffff;
                    padding:7px 12px;
                    border-radius:6px;
                    font-size:12px;
                    font-weight:800;
                    margin-bottom:17px;
                  "
                >
                  2. INTERNSHIP COMPLETED
                </div>


                <div
                  style="
                    display:grid;
                    gap:10px;
                  "
                >

                  <div
                    style="
                      padding:14px;
                      background:#ffffff;
                      border:1px solid #dbeafe;
                      border-radius:10px;
                    "
                  >
                    ✓
                    <strong>
                      Offer Letter
                    </strong>

                    <span
                      style="
                        float:right;
                        color:#15803d;
                        font-weight:700;
                      "
                    >
                      Received & Verified
                    </span>
                  </div>


                  <div
                    style="
                      padding:14px;
                      background:#ffffff;
                      border:1px solid #dbeafe;
                      border-radius:10px;
                    "
                  >
                    ✓
                    <strong>
                      Certificate
                    </strong>

                    <span
                      style="
                        float:right;
                        color:#15803d;
                        font-weight:700;
                      "
                    >
                      Received & Verified
                    </span>
                  </div>

                </div>

              </div>

            `
            : ""
        }


        <!-- ==================================================
             INFORMATION NOTE
        =================================================== -->

        <div
          style="
            padding:14px 16px;
            background:#eff6ff;
            border:1px solid #dbeafe;
            border-radius:10px;
            color:#1e3a8a;
            font-size:13px;
            margin-bottom:20px;
          "
        >

          <strong>
            ● Note:
          </strong>

          Your verification record is based on the
          official SoftGrowTech database.
          Please keep your Student / Letter ID safe
          for future verification.

        </div>


        <!-- ==================================================
             TRUST SECTION
        =================================================== -->

        <div
          style="
            display:grid;
            grid-template-columns:
              repeat(4,minmax(0,1fr));
            gap:10px;
            padding:16px;
            background:#f8fafc;
            border:1px solid #e2e8f0;
            border-radius:12px;
          "
        >

          <div
            style="
              text-align:center;
              padding:8px;
            "
          >
            <strong
              style="
                display:block;
                color:#0f172a;
                font-size:13px;
              "
            >
              ✓ 100% Authentic
            </strong>

            <small
              style="
                display:block;
                margin-top:4px;
                color:#64748b;
                font-size:11px;
              "
            >
              Official record verification
            </small>
          </div>


          <div
            style="
              text-align:center;
              padding:8px;
            "
          >
            <strong
              style="
                display:block;
                color:#0f172a;
                font-size:13px;
              "
            >
              🔒 Secure Verification
            </strong>

            <small
              style="
                display:block;
                margin-top:4px;
                color:#64748b;
                font-size:11px;
              "
            >
              Protected verification process
            </small>
          </div>


          <div
            style="
              text-align:center;
              padding:8px;
            "
          >
            <strong
              style="
                display:block;
                color:#0f172a;
                font-size:13px;
              "
            >
              ✓ Official Record
            </strong>

            <small
              style="
                display:block;
                margin-top:4px;
                color:#64748b;
                font-size:11px;
              "
            >
              SoftGrowTech database
            </small>
          </div>


          <div
            style="
              text-align:center;
              padding:8px;
            "
          >
            <strong
              style="
                display:block;
                color:#0f172a;
                font-size:13px;
              "
            >
              Need Support?
            </strong>

            <small
              style="
                display:block;
                margin-top:4px;
                color:#64748b;
                font-size:11px;
              "
            >
              Contact SoftGrowTech
            </small>
          </div>

        </div>


        <!-- ==================================================
             FOOTER
        =================================================== -->

        <div
          style="
            margin-top:20px;
            padding:17px;
            background:#061a33;
            color:#ffffff;
            text-align:center;
            border-radius:10px;
            font-size:12px;
          "
        >
          © 2026 SoftGrowTech. All Rights Reserved.
        </div>


      </div>

    </div>

  `;

}
Important: Is baar jo code tumne
