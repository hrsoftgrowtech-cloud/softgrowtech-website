// ============================================================
// SOFTGROWTECH WEBSITE
// FINAL SCRIPT
// ============================================================


// ============================================================
// SUPABASE CONFIGURATION
// ============================================================

const SUPABASE_URL =
  "https://syoqukavgvrdhwxatdav.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_yUuacAdfZy3k-_Zve5QOZA_6eLh9FeZ";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {


  // ==========================================================
  // BACK TO TOP BUTTON
  // ==========================================================

  const scrollTop = document.createElement("button");

  scrollTop.type = "button";
  scrollTop.className = "scroll-top";
  scrollTop.setAttribute("aria-label", "Back to top");
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


  const updateScrollTop = () => {

    scrollTop.classList.toggle(
      "show",
      window.scrollY > 420
    );

  };


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
      gain.connect(audioContext.destination);


      oscillator.start(now);
      oscillator.stop(now + 0.07);

    } catch (error) {

      // Sound should never interrupt website functionality.

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
  // PAGE LOADED
  // ==========================================================

  document.body.classList.add("loaded");


  // ==========================================================
  // WELCOME SCREEN
  // ==========================================================

  const welcome =
    document.getElementById(
      "welcomeScreen"
    );


  if (welcome) {

    setTimeout(
      () => {
        welcome.classList.add("hide");
      },
      1600
    );


    setTimeout(
      () => {
        welcome.remove();
      },
      2450
    );

  }


  // ==========================================================
  // NAVBAR ACTIVE PAGE
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

            showVerificationResult(
              result,
              "invalid",
              `
                <div>

                  <strong>
                    Invalid Official ID
                  </strong>

                  <br><br>

                  Please enter your Official ID
                  and try again.

                </div>
              `
            );

            return;

          }


          // ==================================================
          // LOADING
          // ==================================================

          showVerificationResult(
            result,
            "loading",
            `
              <div>

                <strong>
                  Verifying Official Record...
                </strong>

                <br>

                <small>
                  Please wait while we securely
                  check your official record.
                </small>

              </div>
            `
          );


          try {


            // =================================================
            // SUPABASE REST API
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


            // =================================================
            // DATABASE RESPONSE ERROR
            // =================================================

            if (!response.ok) {

              const errorText =
                await response.text();


              console.error(
                "Supabase response:",
                response.status,
                errorText
              );


              throw new Error(
                "Supabase request failed"
              );

            }


            // =================================================
            // READ DATABASE DATA
            // =================================================

            const data =
              await response.json();


            console.log(
              "SoftGrowTech verification:",
              data
            );


            // =================================================
            // ID NOT FOUND
            // =================================================

            if (
              !Array.isArray(data) ||
              data.length === 0
            ) {

              showVerificationResult(
                result,
                "invalid",
                `

                  <div
                    style="
                      text-align:left;
                    "
                  >

                    <strong
                      style="
                        font-size:18px;
                      "
                    >
                      Invalid Official ID
                    </strong>


                    <br><br>


                    The ID you entered
                    could not be verified
                    in our official records.


                    <br><br>


                    <strong>
                      Entered ID:
                    </strong>

                    ${escapeHtml(id)}


                    <br><br>


                    <small>
                      Please check your Official ID
                      and try again.
                    </small>

                  </div>

                `
              );

              return;

            }


            // =================================================
            // VERIFIED RECORD
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
              student["Batch date"] ||
              "Not Available";


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
            // SUCCESS RESULT
            // =================================================

            showVerificationResult(
              result,
              "success",
              `

                <div
                  style="
                    text-align:left;
                  "
                >


                  <div
                    style="
                      display:flex;
                      align-items:center;
                      gap:12px;
                      margin-bottom:18px;
                    "
                  >

                    <div
                      style="
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
                        font-weight:700;
                      "
                    >
                      ✓
                    </div>


                    <div>

                      <strong
                        style="
                          font-size:18px;
                        "
                      >
                        Document Successfully Verified
                      </strong>


                      <br>


                      <small>
                        Official SoftGrowTech record
                        successfully verified.
                      </small>

                    </div>

                  </div>


                  <!-- BASIC INFORMATION -->

                  <div
                    style="
                      display:grid;
                      grid-template-columns:
                        repeat(
                          auto-fit,
                          minmax(150px,1fr)
                        );
                      gap:10px;
                    "
                  >

                    ${verificationBox(
                      "Student / Letter ID",
                      studentId
                    )}


                    ${verificationBox(
                      "Student Name",
                      name
                    )}


                    ${verificationBox(
                      "Domain",
                      domain
                    )}


                    ${verificationBox(
                      "Batch Date",
                      batchDate
                    )}

                  </div>


                  <!-- DOCUMENT STATUS -->

                  <div
                    style="
                      margin-top:15px;
                      background:#fff;
                      padding:15px;
                      border-radius:10px;
                      border:1px solid #bbf7d0;
                    "
                  >

                    <strong>
                      Document Status
                    </strong>


                    ${verificationStatus(
                      "Offer Letter",
                      offerLetter
                    )}


                    ${verificationStatus(
                      "Certificate",
                      certificate
                    )}


                    ${verificationStatus(
                      "Current Status",
                      status
                    )}

                  </div>


                  <div
                    style="
                      margin-top:12px;
                      font-size:12px;
                      opacity:.75;
                    "
                  >
                    This information has been
                    retrieved from the official
                    SoftGrowTech verification record.
                  </div>


                </div>

              `
            );


          } catch (error) {


            // =================================================
            // CONNECTION / RLS / API ERROR
            // =================================================

            console.error(
              "Verification error:",
              error
            );


            showVerificationResult(
              result,
              "error",
              `

                <div>

                  <strong>
                    Verification Service Unavailable
                  </strong>

                  <br><br>

                  We are unable to connect
                  to the verification service
                  at the moment.

                  <br><br>

                  <small>
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
  // BUTTON CLICK ANIMATION
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
// VERIFICATION RESULT HELPER
// ============================================================

function showVerificationResult(
  result,
  type,
  html
) {

  result.style.display = "block";


  if (type === "success") {

    result.style.background =
      "#f0fdf4";

    result.style.borderColor =
      "#bbf7d0";

    result.style.color =
      "#166534";

  }

  else if (type === "invalid") {

    result.style.background =
      "#fef2f2";

    result.style.borderColor =
      "#fecaca";

    result.style.color =
      "#991b1b";

  }

  else if (type === "loading") {

    result.style.background =
      "#eff6ff";

    result.style.borderColor =
      "#bfdbfe";

    result.style.color =
      "#1d4ed8";

  }

  else {

    result.style.background =
      "#fef2f2";

    result.style.borderColor =
      "#fecaca";

    result.style.color =
      "#b91c1c";

  }


  result.innerHTML = html;

}


// ============================================================
// INFORMATION BOX
// ============================================================

function verificationBox(
  label,
  value
) {

  return `

    <div
      style="
        background:#fff;
        padding:12px;
        border-radius:9px;
        border:1px solid #bbf7d0;
      "
    >

      <small>
        ${escapeHtml(label)}
      </small>


      <strong
        style="
          display:block;
          margin-top:5px;
        "
      >
        ${escapeHtml(value)}
      </strong>

    </div>

  `;

}


// ============================================================
// STATUS ROW
// ============================================================

function verificationStatus(
  label,
  value
) {

  return `

    <div
      style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        padding:10px;
        margin-top:8px;
        background:#f0fdf4;
        border-radius:8px;
      "
    >

      <span>
        ${escapeHtml(label)}
      </span>


      <strong>
        ${escapeHtml(value)}
      </strong>

    </div>

  `;

}


// ============================================================
// SECURITY
// ============================================================

function escapeHtml(value) {

  return String(value).replace(
    /[&<>"']/g,
    character => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    }[character])
  );

}
