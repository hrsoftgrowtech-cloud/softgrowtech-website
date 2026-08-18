// ============================================================
// SOFTGROWTECH — FINAL WEBSITE SCRIPT
// SUPABASE DOCUMENT VERIFICATION
// ============================================================

const SUPABASE_URL =
  "https://syoqukavgvrdhwxatdav.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_yUuacAdfZy3k-_Zve5QOZA_6eLh9FeZ";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

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
      welcome.remove();
    }, 2450);

  }


  // ==========================================================
  // SCROLL TO TOP
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

      audioContext =
        audioContext ||
        new (
          window.AudioContext ||
          window.webkitAudioContext
        )();


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
        0.035,
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
          ".btn, .nav-apply, .menu-btn, .domain-choice, .text-link, .footer-social"
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
  // ACTIVE NAVBAR PAGE
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

        link.classList.add(
          "active"
        );

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

        link.classList.add(
          "active"
        );

      }

    });


  // ==========================================================
  // MOBILE MENU
  // ==========================================================

  const menuBtn =
    document.querySelector(
      ".menu-btn"
    );


  const navLinks =
    document.getElementById(
      "navLinks"
    );


  if (
    menuBtn &&
    navLinks
  ) {

    menuBtn.addEventListener(
      "click",
      () => {

        navLinks.classList.toggle(
          "open"
        );

      }
    );


    navLinks
      .querySelectorAll("a")
      .forEach(link => {

        link.addEventListener(
          "click",
          () => {

            navLinks.classList.remove(
              "open"
            );

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
            form.querySelector(
              "input"
            );


          const result =
            form.parentElement.querySelector(
              ".verify-result"
            );


          if (
            !input ||
            !result
          ) {

            return;

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
                <div class="verify-message">

                  <div class="verify-icon error-icon">
                    !
                  </div>

                  <h2>
                    Invalid Official ID
                  </h2>

                  <p>
                    Please enter your Official ID
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


          result.innerHTML = `

            <div
              class="verification-processing"
              style="
                text-align:center;
                padding:45px 20px;
              "
            >

              <div
                class="verification-loader"
                style="
                  width:64px;
                  height:64px;
                  margin:0 auto 22px;
                  border:5px solid #dbeafe;
                  border-top-color:#2563eb;
                  border-radius:50%;
                  animation:softgrowSpin 1s linear infinite;
                "
              ></div>


              <h2
                style="
                  margin:0 0 8px;
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
                  margin:22px auto 0;
                  max-width:300px;
                  height:5px;
                  background:#e2e8f0;
                  border-radius:20px;
                  overflow:hidden;
                "
              >

                <div
                  style="
                    width:0%;
                    height:100%;
                    background:#2563eb;
                    border-radius:20px;
                    animation:verificationProgress 3s ease forwards;
                  "
                ></div>

              </div>


              <small
                style="
                  display:block;
                  margin-top:12px;
                  color:#94a3b8;
                "
              >
                Please wait...
              </small>

            </div>

          `;


          addVerificationAnimation();


          // ==================================================
          // WAIT 3 SECONDS
          // ==================================================

          await delay(3000);


          try {


            // =================================================
            // SUPABASE REQUEST
            // =================================================

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

              console.error(
                "Supabase error:",
                response.status,
                await response.text()
              );

              throw new Error(
                "Database connection failed"
              );

            }


            const data =
              await response.json();


            // =================================================
            // INVALID ID
            // =================================================

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
                      padding:30px;
                      text-align:center;
                    "
                  >

                    <div
                      style="
                        width:55px;
                        height:55px;
                        margin:0 auto 15px;
                        border-radius:50%;
                        background:#fee2e2;
                        color:#dc2626;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:28px;
                        font-weight:700;
                      "
                    >
                      !
                    </div>


                    <h2
                      style="
                        margin:0 0 10px;
                        color:#991b1b;
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
                      The ID you entered could not
                      be found in our official records.
                    </p>


                    <p
                      style="
                        margin:12px 0 0;
                        font-size:13px;
                        color:#64748b;
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


            // =================================================
            // VERIFIED STUDENT
            // =================================================

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


            // =================================================
            // SHOW PROFESSIONAL VERIFICATION PAGE
            // =================================================

            showVerifiedResult(
              result,
              {
                studentId,
                name,
                domain,
                batchDate,
                offerLetter,
                certificate,
                status
              }
            );


            // =================================================
            // SMOOTH SCROLL TO RESULT
            // =================================================

            setTimeout(() => {

              result.scrollIntoView({
                behavior: "smooth",
                block: "start"
              });

            }, 100);


          } catch (error) {


            console.error(
              "Verification error:",
              error
            );


            showResult(
              result,
              "error",
              `
                <div
                  style="
                    padding:30px;
                    text-align:center;
                  "
                >

                  <div
                    style="
                      width:55px;
                      height:55px;
                      margin:0 auto 15px;
                      border-radius:50%;
                      background:#fee2e2;
                      color:#dc2626;
                      display:flex;
                      align-items:center;
                      justify-content:center;
                      font-size:25px;
                    "
                  >
                    !
                  </div>


                  <h2
                    style="
                      margin:0 0 10px;
                      color:#991b1b;
                    "
                  >
                    Verification Service Unavailable
                  </h2>


                  <p
                    style="
                      margin:0;
                      color:#64748b;
                    "
                  >
                    We are unable to connect to the
                    verification service right now.
                  </p>


                  <small
                    style="
                      display:block;
                      margin-top:10px;
                      color:#94a3b8;
                    "
                  >
                    Please try again after a few moments.
                  </small>

                </div>
              `
            );

          }

        }
      );

    });


  // ==========================================================
  // BUTTON ANIMATION
  // ==========================================================

  document
    .querySelectorAll(
      ".btn, .nav-apply, .text-link"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          button.classList.remove(
            "clicked"
          );

          void button.offsetWidth;

          button.classList.add(
            "clicked"
          );

        }
      );

    });

});


// ============================================================
// SHOW VERIFIED RESULT
// ============================================================

function showVerifiedResult(
  result,
  student
) {

  const status =
    String(
      student.status
    ).toUpperCase();


  const isCompleted =
    status.includes("COMPLETE") ||
    status.includes("VERIFIED");


  const isRunning =
    status.includes("RUNNING");


  const isNotVerified =
    status.includes("NOT");


  let overallTitle =
    "INTERNSHIP RUNNING";


  let overallText =
    "Your internship is currently in progress.";


  let overallColor =
    "#15803d";


  let overallIcon =
    "↻";


  if (isCompleted) {

    overallTitle =
      "COMPLETE VERIFIED";

    overallText =
      "All documents are verified successfully.";

    overallColor =
      "#1d4ed8";

    overallIcon =
      "✓";

  }


  if (isNotVerified) {

    overallTitle =
      "NOT VERIFIED";

    overallText =
      "Your certificate is not issued yet.";

    overallColor =
      "#dc2626";

    overallIcon =
      "!";

  }


  if (isRunning) {

    overallTitle =
      "RUNNING";

    overallText =
      "Your internship is currently in progress.";

    overallColor =
      "#15803d";

    overallIcon =
      "↻";

  }


  const certificateIssued =
    String(
      student.certificate
    )
      .toLowerCase()
      .includes("received") ||
    String(
      student.certificate
    )
      .toLowerCase()
      .includes("issued");


  const offerVerified =
    String(
      student.offerLetter
    )
      .toLowerCase()
      .includes("received") ||
    String(
      student.offerLetter
    )
      .toLowerCase()
      .includes("verified");


  result.innerHTML = `

    <div
      class="softgrow-verification-page"
      style="
        width:100%;
        max-width:1100px;
        margin:0 auto;
        background:#ffffff;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 12px 40px rgba(15,23,42,.10);
        font-family:inherit;
      "
    >


      <!-- ==========================================
           VERIFICATION HEADER
      =========================================== -->

      <div
        style="
          background:#061a33;
          color:white;
          padding:18px 28px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:20px;
          flex-wrap:wrap;
        "
      >

        <div>

          <div
            style="
              font-size:22px;
              font-weight:800;
              letter-spacing:.2px;
            "
          >
            SoftGrowTech
          </div>


          <div
            style="
              font-size:13px;
              opacity:.85;
              margin-top:2px;
            "
          >
            Learn • Build • Evolve
          </div>

        </div>


        <div
          style="
            display:flex;
            align-items:center;
            gap:10px;
            text-align:right;
          "
        >

          <div
            style="
              font-size:27px;
