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

      form.addEventListener("submit", async event => {
        event.preventDefault();

        const input = form.querySelector("input");
        const result = form.querySelector(".verify-result");

        if (!input || !result) return;

        const id = input.value.trim();

        if (!id) {
          showResult(result, "error", `
            <div style="padding:38px 20px;text-align:center">
              <div style="width:62px;height:62px;margin:0 auto 17px;border-radius:50%;background:#fee2e2;color:#dc2626;display:flex;align-items:center;justify-content:center;font-size:29px;font-weight:800">!</div>
              <h2 style="margin:0 0 10px;color:#991b1b;font-size:23px">Invalid Official ID</h2>
              <p style="margin:0;color:#7f1d1d;font-size:15px">Please enter your Student / Letter ID and try again.</p>
            </div>
          `);
          return;
        }

        // Keep the verification form clean while the secure check runs.
        result.style.display = "block";
        result.style.background = "#fff";
        result.style.border = "1px solid #dbeafe";
        result.style.padding = "0";
        result.innerHTML = `
          <div style="text-align:center;padding:48px 20px">
            <div style="width:68px;height:68px;margin:0 auto 22px;border:5px solid #dbeafe;border-top-color:#2563eb;border-radius:50%;animation:softgrowSpin 1s linear infinite"></div>
            <h2 style="margin:0 0 9px;color:#0f172a;font-size:22px">Verifying Your Document</h2>
            <p style="margin:0;color:#64748b;font-size:14px">Securely checking your official SoftGrowTech record...</p>
            <div style="max-width:320px;height:6px;margin:24px auto 0;background:#e2e8f0;border-radius:20px;overflow:hidden">
              <div style="width:0;height:100%;background:#2563eb;border-radius:20px;animation:softgrowProgress 3s linear forwards"></div>
            </div>
            <div style="margin-top:12px;color:#94a3b8;font-size:13px">Authenticating official record...</div>
          </div>
        `;

        await delay(3000);

        try {
          const apiUrl =
            `${SUPABASE_URL}/rest/v1/Students` +
            `?Student%20Id=eq.${encodeURIComponent(id)}` +
            `&select=*`;

          const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
              "apikey": SUPABASE_PUBLISHABLE_KEY,
              "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
              "Content-Type": "application/json"
            }
          });

          if (!response.ok) {
            console.error("Supabase error:", response.status, await response.text());
            throw new Error("Supabase request failed");
          }

          const data = await response.json();

          // Always move the verification outcome to the dedicated result page.
          if (!Array.isArray(data) || data.length === 0) {
            sessionStorage.setItem("softgrowVerificationResult", JSON.stringify({
              type: "invalid",
              id
            }));
            window.location.href = "verification-result.html";
            return;
          }

          const student = data[0];

          const record = {
            type: "valid",
            studentId: student["Student Id"] || id,
            name: student["Name"] || "Not Available",
            domain: student["Domain"] || "Not Available",
            batchDate: formatDate(student["Batch date"]),
            offerLetter: student["Offer Letter"] || "Not Available",
            certificate: student["Certificate"] || "Not Available",
            status: student["Status"] || "Not Available"
          };

          sessionStorage.setItem("softgrowVerificationResult", JSON.stringify(record));
          window.location.href = "verification-result.html";

        } catch (error) {
          console.error("Verification error:", error);
          sessionStorage.setItem("softgrowVerificationResult", JSON.stringify({
            type: "service-error"
          }));
          window.location.href = "verification-result.html";
        }
      });
    });

  // ==========================================================
  // BUTTON CLICK ANIMATION
  // ==========================================================

  document
    .querySelectorAll(
      ".btn, .nav-apply, .text-link, button"
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
// DEDICATED VERIFICATION RESULT PAGE
// ============================================================

function verificationStatusFlags(record) {
  const status = String(record.status || "").toUpperCase();
  const offer = String(record.offerLetter || "").toLowerCase();
  const certificate = String(record.certificate || "").toLowerCase();

  const completed = /complete|completed|finish|finished/.test(status);
  const running = /running|ongoing|active|progress/.test(status);
  const notVerifiedStatus = /not\s*verified|not\s*issued|invalid|rejected/.test(status);
  const offerVerified = /received|verified|issued/.test(offer);
  const certificateVerified = /received|verified|issued/.test(certificate);
  const certificateMissing = /not issued|not verified|coming soon|pending|not available|not received/.test(certificate);

  return {
    completed,
    running,
    notVerifiedStatus,
    offerVerified,
    certificateVerified,
    certificateMissing
  };
}

function renderVerificationResultPage() {
  const mount = document.getElementById("verificationResultPage");
  if (!mount) return;

  const raw = sessionStorage.getItem("softgrowVerificationResult");
  let record = null;

  try {
    record = raw ? JSON.parse(raw) : null;
  } catch (_) {
    record = null;
  }

  // No verification result in this browser session.
  if (!record) {
    mount.innerHTML = invalidVerificationMarkup(
      "No verification request was found. Please start a new verification."
    );
    return;
  }

  if (record.type === "invalid") {
    mount.innerHTML = invalidVerificationMarkup(
      "The Student / Letter ID you entered could not be found in the official SoftGrowTech records.",
      record.id
    );
    return;
  }

  if (record.type === "service-error") {
    mount.innerHTML = `
      <section class="result-shell result-error-shell">
        <div class="result-error-icon">!</div>
        <h1>Verification Service Unavailable</h1>
        <p>We are unable to connect to the official verification service right now.</p>
        <button class="result-primary-btn" type="button" data-verify-another>Verify Another Letter ID <span>→</span></button>
      </section>
    `;
    bindAnotherIdButton();
    return;
  }

  mount.innerHTML = validVerificationMarkup(record);
  bindAnotherIdButton();
}

function invalidVerificationMarkup(message, enteredId = "") {
  return `
    <section class="result-shell result-invalid-shell">
      <div class="result-invalid-icon">!</div>
      <h1>Invalid Official ID</h1>
      <p>${escapeHtml(message)}</p>
      ${enteredId ? `<div class="entered-id">Entered ID: <strong>${escapeHtml(enteredId)}</strong></div>` : ""}
      <button class="result-primary-btn" type="button" data-verify-another>Verify Another Letter ID <span>→</span></button>
    </section>
  `;
}

function validVerificationMarkup(record) {
  const flags = verificationStatusFlags(record);

  // The completed state with both documents verified is the fully verified result.
  const completedVerified = flags.completed && flags.offerVerified && flags.certificateVerified;
  const completedWithoutCertificate = flags.completed && !flags.certificateVerified;
  const notVerified = flags.notVerifiedStatus || (!flags.completed && !flags.running);

  let section = "";

  if (completedVerified) {
    section = `
      <section class="result-status-card completed-card">
        <div class="status-ribbon blue-ribbon">2. INTERNSHIP COMPLETED (Certificate Received)</div>
        <div class="status-grid">
          <div class="overall-circle blue-circle">
            <div class="overall-icon">✓</div>
            <span>Overall Status</span>
            <strong>COMPLETE<br>VERIFIED</strong>
            <small>All documents are verified successfully.</small>
          </div>
          <div class="document-area">
            <h2>Document Status</h2>
            ${documentRow("offer", "Offer Letter", "Offer letter has been issued.", "✓ Received & Verified", "verified")}
            ${documentRow("certificate", "Certificate", "Certificate has been issued.", "✓ Received & Verified", "verified")}
          </div>
        </div>
        <div class="congratulations-box">
          <div class="congrats-icon">✓</div>
          <div>
            <strong>Congratulations!</strong>
            <p>Your internship has been successfully completed and all required documents have been verified.</p>
          </div>
        </div>
      </section>
    `;
  } else if (completedWithoutCertificate) {
    section = `
      <section class="result-status-card not-issued-card">
        <div class="status-ribbon orange-ribbon">3. CERTIFICATE NOT ISSUED</div>
        <div class="status-grid">
          <div class="overall-circle orange-circle">
            <div class="overall-icon">!</div>
            <span>Overall Status</span>
            <strong>NOT<br>VERIFIED</strong>
            <small>Your certificate has not been issued yet.</small>
          </div>
          <div class="document-area">
            <h2>Document Status</h2>
            ${documentRow("offer", "Offer Letter", "Offer letter has been issued.", "✓ Received & Verified", "verified")}
            ${documentRow("certificate", "Certificate", "Certificate has not been issued yet.", "× Not Verified", "not-verified", true)}
          </div>
        </div>
        <div class="help-strip">
          <div class="help-contact">Need Help? Contact Us <a class="whatsapp-icon" href="https://wa.me/917839686310" target="_blank" rel="noopener noreferrer" aria-label="Contact SoftGrowTech on WhatsApp" title="Contact SoftGrowTech on WhatsApp">${whatsappSvg()}</a></div>
        </div>
      </section>
    `;
  } else if (notVerified) {
    section = `
      <section class="result-status-card not-issued-card">
        <div class="status-ribbon orange-ribbon">3. CERTIFICATE NOT ISSUED</div>
        <div class="status-grid">
          <div class="overall-circle orange-circle">
            <div class="overall-icon">!</div>
            <span>Overall Status</span>
            <strong>NOT<br>VERIFIED</strong>
            <small>Your certificate has not been issued yet.</small>
          </div>
          <div class="document-area">
            <h2>Document Status</h2>
            ${documentRow("offer", "Offer Letter", "Offer letter has been issued.", "✓ Received & Verified", "verified")}
            ${documentRow("certificate", "Certificate", "Certificate has not been issued yet.", "× Not Verified", "not-verified", true)}
          </div>
        </div>
        <div class="help-strip">
          <div class="help-contact">Need Help? Contact Us <a class="whatsapp-icon" href="https://wa.me/917839686310" target="_blank" rel="noopener noreferrer" aria-label="Contact SoftGrowTech on WhatsApp" title="Contact SoftGrowTech on WhatsApp">${whatsappSvg()}</a></div>
        </div>
      </section>
    `;
  } else {
    section = `
      <section class="result-status-card running-card">
        <div class="status-ribbon green-ribbon">1. INTERNSHIP RUNNING (Certificate Coming Soon)</div>
        <div class="status-grid">
          <div class="overall-circle green-circle">
            <div class="overall-icon">↻</div>
            <span>Overall Status</span>
            <strong>RUNNING</strong>
            <small>Your internship is currently in progress.</small>
          </div>
          <div class="document-area">
            <h2>Document Status</h2>
            ${documentRow("offer", "Offer Letter", "Offer letter has been issued.", "✓ Received & Verified", "verified")}
            ${documentRow("certificate", "Certificate", "Certificate will be issued after successful completion of the internship.", "⌛ Coming Soon", "coming")}
          </div>
        </div>
        <div class="note-strip"><strong>● Note:</strong> Certificate will be issued after successful completion of the internship and evaluation.</div>
      </section>
    `;
  }

  return `
    <div class="result-page-card">
      <header class="result-header">
        <div class="result-brand">
          <img src="assets/softgrowtech-logo.png" alt="SoftGrowTech logo">
          <div>
            <div class="brand-name">SoftGrowTech</div>
            <div class="brand-tagline">Learn • Build • Evolve</div>
          </div>
        </div>
        <div class="official-badge">
          <div class="shield-icon">✓</div>
          <div>
            <strong>Official Verification</strong>
            <span>100% Trusted &amp; Secure</span>
          </div>
        </div>
      </header>

      <main class="result-main">
        <div class="verified-heading">
          <div class="verified-check">✓</div>
          <h1>Document Record Verified</h1>
          <p>The record associated with this Student / Letter ID is valid.</p>
        </div>

        <section class="student-record">
          <div class="record-item record-id">
            <div class="record-icon person-icon">${personSvg()}</div>
            <div><span>Student / Letter ID</span><strong>${escapeHtml(record.studentId)}</strong></div>
          </div>
          <div class="record-item"><span>Student Name</span><strong>${escapeHtml(record.name)}</strong></div>
          <div class="record-item"><span>Domain</span><strong>${escapeHtml(record.domain)}</strong></div>
          <div class="record-item"><span>Batch</span><strong>${escapeHtml(record.batchDate)}</strong></div>
        </section>

        ${section}

        <div class="result-actions">
          <button class="result-primary-btn" type="button" data-verify-another>Verify Another Letter ID <span>→</span></button>
          <p>Verify another ID or need to apply for a new internship application.</p>
        </div>
      </main>
    </div>
  `;
}

function documentRow(icon, title, description, badge, badgeClass, certificateAction = false) {
  return `
    <div class="document-row">
      <div class="document-left">
        <div class="document-icon ${icon}-doc">${icon === "offer" ? documentSvg() : certificateSvg()}</div>
        <div>
          <strong>${title}</strong>
          <span>${description}</span>
          ${certificateAction ? `<a class="certificate-mini-link" href="https://wa.me/917839686310?text=Hello%20SoftGrowTech%2C%20I%20would%20like%20to%20get%20my%20internship%20certificate." target="_blank" rel="noopener noreferrer">Get Your Certificate <span>→</span></a>` : ""}
        </div>
      </div>
      <span class="document-badge ${badgeClass}">${badge}</span>
    </div>
  `;
}

function bindAnotherIdButton() {
  document.querySelectorAll("[data-verify-another]").forEach(button => {
    button.addEventListener("click", () => {
      sessionStorage.removeItem("softgrowVerificationResult");
      window.location.href = "documents-verification.html";
    });
  });
}

function personSvg() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2"></circle><path d="M5.5 20c.5-3.4 2.8-5.2 6.5-5.2s6 1.8 6.5 5.2"></path></svg>`;
}

function documentSvg() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7l4 4V20.5H7z"></path><path d="M14 3.5v4h4M9.5 12h5M9.5 15.5h5"></path></svg>`;
}

function certificateSvg() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h10v12.2H7z"></path><path d="M10 7h4M10 10h4M10.5 15.7 9 21l3-1.7 3 1.7-1.5-5.3"></path></svg>`;
}

function whatsappSvg() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 11.5a8.2 8.2 0 0 1-12.1 7.1L4 20l1.4-4A8.2 8.2 0 1 1 20.2 11.5Z"></path><path d="M9.2 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.5.6c.5 1 1.3 1.8 2.3 2.3l.6-.5c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.5.3-1.1.4-1.7.2-1.2-.3-2.5-1.1-3.6-2.1-1.1-1-1.8-2.3-2.1-3.6-.2-.6-.1-1.2.2-1.7Z"></path></svg>`;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderVerificationResultPage);
} else {
  renderVerificationResultPage();
}

