// ============================================================
// SOFTGROWTECH — FINAL WEBSITE SCRIPT
// ============================================================

const SUPABASE_URL = "https://syoqukavgvrdhwxatdav.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_yUuacAdfZy3k-_Zve5QOZA_6eLh9FeZ";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}

function formatDate(value) {
  if (!value) return "Not Available";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" });
}

function addVerificationStyles() {
  if (document.getElementById("softgrowVerificationStyles")) return;
  const style = document.createElement("style");
  style.id = "softgrowVerificationStyles";
  style.textContent = `
    @keyframes softgrowSpin { to { transform:rotate(360deg); } }
    @keyframes softgrowProgress { from { width:0%; } to { width:100%; } }
    @keyframes softgrowFade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    .softgrow-result-animate { animation:softgrowFade .45s ease both; }
  `;
  document.head.appendChild(style);
}

function playPremiumClick() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(430, now + .055);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(.025, now + .006);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .065);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + .07);
  } catch (_) {}
}


function addReviewPopupResponsiveStyles(){if(document.getElementById("softgrow-review-popup-mobile-fix"))return;const s=document.createElement("style");s.id="softgrow-review-popup-mobile-fix";s.textContent=`#reviewPopup{max-width:min(380px,calc(100vw - 28px));box-sizing:border-box}@media(max-width:600px){#reviewPopup{width:calc(100vw - 24px)!important;max-width:360px!important;left:12px!important;right:12px!important;bottom:12px!important;margin:0 auto!important;padding:14px!important;font-size:13px}#reviewPopup #reviewPopupText{line-height:1.45;margin-bottom:7px}#reviewPopup #reviewPopupName{font-size:12px}#reviewPopup #reviewPopupStars{font-size:13px}}`;document.head.appendChild(s);}

function initHomeReviewPopup() {
  const popup = document.getElementById("reviewPopup");
  if (!popup) return;

  // Internship-focused social proof only. This popup is intentionally separate
  // from the Internship page feedback cards and uses one consistent design.
  const reviews = [
    { name: "Pragavi Gajendran", text: "The SoftGrowTech internship was a valuable learning experience and helped me gain practical knowledge beyond classroom concepts." },
    { name: "Sadiya Afreen", text: "Working on projects during my SoftGrowTech internship helped me improve my programming and problem-solving skills." },
    { name: "Roshani Kumari", text: "I gained useful knowledge and practical exposure through my SoftGrowTech internship experience." },
    { name: "Anchal Shukla", text: "SoftGrowTech gave me a good opportunity to improve my technical skills through practical internship work." },
    { name: "Khushi Bhatnagar", text: "The project work made my internship experience engaging and gave me the opportunity to learn something new." },
    { name: "Vivek Kumar", text: "The internship provided a clear learning path with practical work that helped me build confidence in my skills." },
    { name: "Mehak Gupta", text: "I found the internship well structured and appreciated the practical learning experience throughout the program." }
  ];

  const textEl = document.getElementById("reviewPopupText");
  const nameEl = document.getElementById("reviewPopupName");
  const starsEl = document.getElementById("reviewPopupStars");
  const labelEl = popup.querySelector(".review-popup-label");
  const closeBtn = document.getElementById("reviewPopupClose");
  const path = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const isHome = path === "index.html" || path === "";
  const isAbout = path === "about.html";
  const isHowItWorks = path === "how-it-works.html";
  if (!isHome && !isAbout && !isHowItWorks) return;

  const showDelay = isHome ? 10000 : 15000;
  const visibleTime = 3000;
  const normalGap = 5000;
  const manualCloseGap = 20000;
  let currentIndex = -1, showTimer = null, hideTimer = null, nextTimer = null, closed = false;
  let usedReviews = new Set();

  try {
    const stored = JSON.parse(sessionStorage.getItem("softgrowInternshipPopupUsed") || "[]");
    if (Array.isArray(stored)) usedReviews = new Set(stored);
  } catch (_) {}

  const clearTimers = () => {
    if (showTimer) clearTimeout(showTimer);
    if (hideTimer) clearTimeout(hideTimer);
    if (nextTimer) clearTimeout(nextTimer);
    showTimer = hideTimer = nextTimer = null;
  };

  const chooseNextReview = () => {
    let available = reviews.map((_, i) => i).filter(i => !usedReviews.has(i));
    if (!available.length) { usedReviews.clear(); available = reviews.map((_, i) => i); }
    if (available.length > 1 && currentIndex !== -1) available = available.filter(i => i !== currentIndex);
    currentIndex = available[Math.floor(Math.random() * available.length)];
    usedReviews.add(currentIndex);
    try { sessionStorage.setItem("softgrowInternshipPopupUsed", JSON.stringify([...usedReviews])); } catch (_) {}
    return reviews[currentIndex];
  };

  const renderReview = () => {
    const review = chooseNextReview();
    if (textEl) textEl.textContent = review.text;
    if (nameEl) nameEl.textContent = review.name;
    if (starsEl) starsEl.textContent = "★★★★★";
    // One fixed popup design; do not switch visual variants between reviews.
    popup.classList.remove("review-popup-blue", "review-popup-minimal", "review-popup-soft", "review-popup-dark");
    popup.classList.add("review-popup-internship");
    if (labelEl) labelEl.textContent = "Internship Experience";
  };

  const showPopup = () => {
    if (closed) return;
    renderReview();
    popup.classList.add("show");
    popup.setAttribute("aria-hidden", "false");
    hideTimer = setTimeout(hidePopup, visibleTime);
  };

  const hidePopup = () => {
    if (closed) return;
    popup.classList.remove("show");
    popup.setAttribute("aria-hidden", "true");
    nextTimer = setTimeout(() => { if (!closed) showPopup(); }, normalGap);
  };

  const close = () => {
    clearTimers();
    closed = true;
    popup.classList.remove("show");
    popup.setAttribute("aria-hidden", "true");
    nextTimer = setTimeout(() => { closed = false; showPopup(); }, manualCloseGap);
  };

  if (closeBtn) closeBtn.addEventListener("click", close);
  showTimer = setTimeout(showPopup, showDelay);
}

function initCommonUI() {
  addReviewPopupResponsiveStyles();
  document.body.classList.add("loaded");
  addVerificationStyles();

  const welcome = document.getElementById("welcomeScreen");
  if (welcome) {
    setTimeout(() => welcome.classList.add("hide"), 1600);
    setTimeout(() => { if (welcome.parentNode) welcome.remove(); }, 2450);
  }

  const currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav-links a").forEach(link => {
    const href = (link.getAttribute("href") || "").split("#")[0].split("?")[0].toLowerCase();
    if (!href || href.startsWith("http")) return;
    if (href === currentPage) link.classList.add("active");
    if (["web-development.html","data-analysis.html","artificial-intelligence.html","domains.html"].includes(currentPage) && href === "internships.html") link.classList.add("active");
  });

  const menuBtn = document.querySelector(".menu-btn");
  const navLinks = document.getElementById("navLinks");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));
  }

  const scrollTop = document.createElement("button");
  scrollTop.type = "button";
  scrollTop.className = "scroll-top";
  scrollTop.setAttribute("aria-label", "Back to top");
  scrollTop.title = "Back to top";
  scrollTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(scrollTop);
  const updateTop = () => scrollTop.classList.toggle("show", window.scrollY > 420);
  window.addEventListener("scroll", updateTop, { passive:true });
  updateTop();
  scrollTop.addEventListener("click", () => window.scrollTo({ top:0, behavior:"smooth" }));

  document.addEventListener("click", event => {
    const target = event.target.closest(".btn, .nav-apply, .menu-btn, .domain-choice, .text-link, .footer-social, button");
    if (target && !target.hasAttribute("data-no-click-sound")) playPremiumClick();
  }, true);

  document.querySelectorAll(".btn, .nav-apply, .text-link").forEach(el => {
    el.addEventListener("click", () => {
      el.classList.remove("clicked");
      void el.offsetWidth;
      el.classList.add("clicked");
    });
  });

  if (["index.html","about.html","how-it-works.html","how-it-work.html","how-it-works-page.html"].includes(currentPage)) initHomeReviewPopup();
}


function ensureMobileLast4Field(form) {
  let wrap = form.querySelector(".verify-mobile-last4-wrap");
  if (wrap) return wrap.querySelector("input");

  wrap = document.createElement("div");
  wrap.className = "verify-mobile-last4-wrap";
  wrap.style.cssText = "margin-top:14px;text-align:left";

  wrap.innerHTML = `
    <label for="verifyMobileLast4" style="display:block;margin-bottom:7px;font-weight:700;color:#0f172a;font-size:14px">
      Registered Mobile — Last 4 Digits
    </label>

    <div class="verify-mobile-input-shell">
      <input
        id="verifyMobileLast4"
        name="mobile_last4"
        type="password"
        inputmode="numeric"
        autocomplete="off"
        maxlength="4"
        pattern="\\d{4}"
        placeholder="••••"
        aria-label="Registered mobile number last 4 digits"
      />
      <button
        type="button"
        class="verify-mobile-visibility"
        id="verifyMobileVisibility"
        aria-label="Show mobile digits"
        aria-pressed="false"
        title="Show mobile digits"
      >
        <span class="verify-eye-icon" aria-hidden="true">👁️</span>
      </button>
    </div>

    <div class="verify-mobile-last4-help">
      Enter the last 4 digits of the mobile number registered with SoftGrowTech internship.
    </div>
  `;

  const submit = form.querySelector('button[type="submit"], input[type="submit"]');
  if (submit) form.insertBefore(wrap, submit);
  else form.appendChild(wrap);

  const mobileInput = wrap.querySelector("#verifyMobileLast4");
  const visibilityBtn = wrap.querySelector("#verifyMobileVisibility");
const eye = wrap.querySelector(".verify-eye-icon");

  mobileInput.addEventListener("input", () => {
    mobileInput.value = mobileInput.value.replace(/\D/g, "").slice(0, 4);
  });

  visibilityBtn.addEventListener("click", () => {
    const isHidden = mobileInput.type === "password";
    mobileInput.type = isHidden ? "text" : "password";
    visibilityBtn.setAttribute("aria-pressed", String(isHidden));
    visibilityBtn.setAttribute("aria-label", isHidden ? "Hide mobile digits" : "Show mobile digits");
    visibilityBtn.setAttribute("title", isHidden ? "Hide digits" : "Show digits");
    eye.textContent = isHidden ? "👁️" : "👁️";
    mobileInput.focus();
  });

  return mobileInput;
}


function showVerificationProcessing(result) {
  result.style.display = "block";
  result.style.background = "#fff";
  result.style.border = "1px solid #dbeafe";
  result.innerHTML = `
    <div style="text-align:center;padding:45px 20px">
      <div style="width:64px;height:64px;margin:0 auto 20px;border:5px solid #dbeafe;border-top-color:#2563eb;border-radius:50%;animation:softgrowSpin 1s linear infinite"></div>
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px">Verifying Your Document</h2>
      <p style="margin:0;color:#64748b;font-size:14px">Securely checking your official SoftGrowTech record...</p>
      <div style="max-width:300px;height:5px;margin:22px auto 0;background:#e2e8f0;border-radius:20px;overflow:hidden"><div style="height:100%;width:0;background:#2563eb;border-radius:20px;animation:softgrowProgress 3s linear forwards"></div></div>
      <small style="display:block;margin-top:12px;color:#94a3b8">Please wait...</small>
    </div>`;
}

function showInvalidOnVerification(result, id) {
  result.style.display = "block";
  result.style.background = "#fff7f7";
  result.style.border = "1px solid #fecaca";
  result.innerHTML = `
    <div style="padding:30px 20px;text-align:center">
      <div style="width:56px;height:56px;margin:0 auto 14px;border-radius:50%;background:#fee2e2;color:#dc2626;display:flex;align-items:center;justify-content:center;font-size:27px;font-weight:800">!</div>
      <h2 style="margin:0 0 8px;color:#991b1b;font-size:22px">Invalid Official ID</h2>
      <p style="margin:0;color:#7f1d1d">The ID you entered could not be found in the official SoftGrowTech records.</p>
      <small style="display:block;margin-top:10px;color:#64748b">Please check your Official ID and try again.</small>
      <div style="margin-top:14px;color:#64748b;font-size:12px">Entered ID: <strong>${escapeHtml(id)}</strong></div>
    </div>`;
}

async function handleVerification(form) {
  const input = form.querySelector('input[name="student_id"], input[id*="student" i], input');
  const mobileInput = ensureMobileLast4Field(form);
  let result = form.querySelector(".verify-result") || form.parentElement.querySelector(".verify-result");
  const inlineError = form.querySelector(".verify-inline-error");

  if (!input || !mobileInput) return;

  if (!result) {
    result = document.createElement("div");
    result.className = "verify-result";
    form.appendChild(result);
  }

  const id = input.value.trim().toUpperCase();
  const mobileLast4 = mobileInput.value.trim();

  if (inlineError) {
    inlineError.hidden = true;
    inlineError.textContent = "";
    inlineError.classList.remove("show");
  }

  result.style.display = "none";
  result.innerHTML = "";

  if (!/^SGT-/.test(id)) {
    if (inlineError) {
      inlineError.textContent = "Incorrect ID format. Please enter a valid official ID starting with SGT-.";
      inlineError.hidden = false;
      inlineError.classList.add("show");
    }
    input.focus();
    return;
  }

  if (/[a-z]/.test(input.value)) {
    if (inlineError) {
      inlineError.textContent = "Please enter the ID using capital letters.";
      inlineError.hidden = false;
      inlineError.classList.add("show");
    }
    input.focus();
    return;
  }

  if (id === "SGT-") {
    if (inlineError) {
      inlineError.textContent = "Please enter the complete official ID after SGT-.";
      inlineError.hidden = false;
      inlineError.classList.add("show");
    }
    input.focus();
    return;
  }

  if (!/^\d{4}$/.test(mobileLast4)) {
    if (inlineError) {
      inlineError.textContent = "Please enter exactly the last 4 digits of your registered mobile number.";
      inlineError.hidden = false;
      inlineError.classList.add("show");
    }
    mobileInput.focus();
    return;
  }

  showVerificationProcessing(result);
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_student`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        p_student_id: id,
        p_mobile_last4: mobileLast4
      })
    });

    if (!response.ok) throw new Error("Database request failed");

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      sessionStorage.removeItem("softgrowVerificationResult");

      // Do not reveal whether the ID or mobile digits were the incorrect part.
      // Continue to the same verification-result page with an invalid state.
      window.location.href =
        `verification-result.html?id=${encodeURIComponent(id)}&invalid=1`;
      return;
    }

    sessionStorage.setItem("softgrowVerificationResult", JSON.stringify({
      type: "valid",
      student: data[0]
    }));

    // Do not put the mobile digits in the URL.
    window.location.href = `verification-result.html?id=${encodeURIComponent(id)}`;
  } catch (error) {
    console.error("Verification error:", error);
    result.style.display = "block";
    result.style.background = "#fef2f2";
    result.style.border = "1px solid #fecaca";
    result.innerHTML = `
      <div style="padding:30px 20px;text-align:center">
        <h2 style="margin:0 0 8px;color:#991b1b">Verification Service Unavailable</h2>
        <p style="margin:0;color:#64748b">We are unable to connect to the verification service right now.</p>
        <small style="display:block;margin-top:10px;color:#94a3b8">Please try again after a few moments.</small>
      </div>`;
  }
}

function resetVerificationPageState() {
  document.querySelectorAll("[data-verify]").forEach(form => {
    const result = form.querySelector(".verify-result");
    const inlineError = form.querySelector(".verify-inline-error");
    if (result) {
      result.style.display = "none";
      result.innerHTML = "";
    }
    if (inlineError) {
      inlineError.hidden = true;
      inlineError.textContent = "";
      inlineError.classList.remove("show");
    }
  });
}


function addVerificationSecurityStyles() {
  if (document.getElementById("softgrow-verification-security-styles")) return;

  const style = document.createElement("style");
  style.id = "softgrow-verification-security-styles";
  style.textContent = `
    .verify-mobile-input-shell {
      position: relative;
      width: 100%;
    }

    .verify-mobile-input-shell input {
      width: 100%;
      box-sizing: border-box;
      padding: 12px 82px 12px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 15px;
      letter-spacing: 2px;
      outline: none;
      background: #fff;
      color: #0f172a;
    }

    .verify-mobile-input-shell input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,.10);
    }

    .verify-mobile-visibility {
      position: absolute;
      top: 50%;
      right: 8px;
      transform: translateY(-50%);
      border: 0;
      background: transparent;
      color: #475569;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 7px 8px;
      border-radius: 7px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
    }

    .verify-mobile-visibility:hover {
      background: #f1f5f9;
      color: #1d4ed8;
    }

    .verification-help-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 20px 0 12px;
    }

    .verification-help-icon {
      width: 42px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #dbeafe;
      border-radius: 50%;
      background: #eff6ff;
      color: #2563eb;
      text-decoration: none;
      font-size: 18px;
      font-weight: 800;
      transition: transform .18s ease, background .18s ease, box-shadow .18s ease;
    }

    .verification-help-icon:hover {
      transform: translateY(-1px);
      background: #dbeafe;
      box-shadow: 0 5px 16px rgba(37,99,235,.12);
    }

    .verification-help-label {
      color: #475569;
      font-size: 13px;
      font-weight: 700;
    }

    .verification-incomplete .invalid-icon {
      background: #fff7ed;
      color: #ea580c;
    }

    .verification-incomplete h1 {
      color: #9a3412;
    }

    .verification-incomplete p {
      color: #7c2d12;
    }

    @media (max-width: 600px) {
      .verify-mobile-input-shell input {
        padding-right: 76px;
      }

      .verify-mobile-visibility {
        right: 6px;
        padding: 7px 6px;
      }

      .verification-help-icon {
        width: 40px;
        height: 40px;
      }
    }
  `;
  document.head.appendChild(style);
}

function initVerificationPage() {
  document.querySelectorAll("[data-verify]").forEach(form => {
    ensureMobileLast4Field(form);

    form.addEventListener("submit", event => {
      event.preventDefault();
      handleVerification(form);
    });
  });

  // When the browser Back button restores this page from its bfcache,
  // clear any old "Verifying Your Document" state so the form is fresh.
  window.addEventListener("pageshow", resetVerificationPageState);
  resetVerificationPageState();
}

function initResultPage() {
  const root = document.getElementById("verificationResult");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "";
  const invalid = params.get("invalid") === "1";
  const backUrl = "documents-verification.html";

  const renderInvalid = () => {
    root.innerHTML = `
    <div class="invalid-only-page">
      <div class="invalid-result verification-incomplete">
        <div class="invalid-icon">!</div>
        <h1>Verification Failed</h1>
        <p>Please check your official ID and registered mobile number's last 4 digits.</p>

        <div class="record-not-found-message">
          <strong>Your record was not found.</strong>
        </div>

        <div class="verification-help-wrap">
          <a
            class="verification-help-icon"
            href="https://wa.me/917839686310?text=${encodeURIComponent("Hello SoftGrowTech, I need help with internship record verification.")}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Need Help with verification"
            title="Need Help"
          >
            <span aria-hidden="true">?</span>
          </a>
          <span class="verification-help-label">Need Help</span>
        </div>

        <a class="result-button" href="${backUrl}">Verify Another ID <span>→</span></a>
      </div>
    </div>`;
};

  if (invalid) {
    sessionStorage.removeItem("softgrowVerificationResult");
    renderInvalid();
    return;
  }

  // Use only the exact record authenticated on the verification page.
  let savedRecord = null;
  try {
    const raw = sessionStorage.getItem("softgrowVerificationResult");
    savedRecord = raw ? JSON.parse(raw) : null;
  } catch (_) {
    savedRecord = null;
  }

  if (savedRecord && savedRecord.type === "valid" && savedRecord.student) {
    renderVerified(savedRecord.student);
    return;
  }

  if (!id) {
    root.innerHTML = `
      <div class="invalid-only-page">
        <div class="invalid-result">
          <div class="invalid-icon">!</div>
          <h1>Verification Session Expired</h1>
          <p>Please return to the official verification page and verify the Student / Letter ID again.</p>
          <a class="result-button" href="${backUrl}">Verify Another ID <span>→</span></a>
        </div>
      </div>`;
    return;
  }

  // Security: never fetch a student record by ID alone on the result page.
  // The verification page must first authenticate the ID + mobile last 4 digits
  // and store the returned record in sessionStorage.
  root.innerHTML = `
    <div class="invalid-only-page">
      <div class="invalid-result">
        <div class="invalid-icon">!</div>
        <h1>Verification Session Expired</h1>
        <p>Please return to the official verification page and verify the Student / Letter ID with the last 4 digits of the registered mobile number.</p>
        <a class="result-button" href="${backUrl}">Verify Another ID <span>→</span></a>
      </div>
    </div>`;
}


  const certificateActionStyle = document.createElement("style");
  certificateActionStyle.textContent = `
    .certificate-action { animation: certificatePulse 1.8s ease-in-out infinite; transform-origin:center; }
    .certificate-action span { display:inline-block; animation: certificateArrow 1s ease-in-out infinite; }
    .certificate-action:hover, .certificate-action:hover span { animation-play-state:paused; }
    @keyframes certificatePulse { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
    @keyframes certificateArrow { 0%,100%{transform:translateX(0)} 50%{transform:translateX(5px)} }
  `;
  document.head.appendChild(certificateActionStyle);

function renderVerified(student) {
  ensureRecordFooterStyles();
  ensureDownloadAndBadgeStyles();
  const root = document.getElementById("verificationResult");
  const backUrl = "documents-verification.html";
  const id = student["Student Id"] || "Not Available";
  const name = student["Name"] || "Not Available";
  const email = student["Student Email"] || student["Email"] || student["email"] || student["Email Address"] || student["Email address"] || "Not Available";
  const domain = student["Domain"] || "Not Available";
  const batch = formatDate(student["Batch date"]);
  const offer = String(student["Offer Letter"] || "Not Available");
  const certificate = String(student["Certificate"] || "Not Available");
  const status = String(student["Status"] || "Not Available").toUpperCase();

  const completed = /COMPLETE|COMPLETED/.test(status);
  const running = /RUNNING|ONGOING|ACTIVE/.test(status);
  const notVerifiedStatus = /NOT\s*VERIFIED|NOT\s*ISSUED|INVALID|REJECTED/.test(status);
  const offerVerified = /RECEIVED|VERIFIED|ISSUED/.test(offer.toUpperCase());
  const certificateVerified = /RECEIVED|VERIFIED|ISSUED/.test(certificate.toUpperCase());

  let mode = "running";
  if (completed && certificateVerified) mode = "completed";
  else if (completed) mode = "certificate-missing";
  else if (notVerifiedStatus) mode = "certificate-missing";
  else if (running) mode = "running";

  let statusTitle = mode === "completed" ? "INTERNSHIP COMPLETED" : mode === "certificate-missing" ? "CERTIFICATE NOT ISSUED" : "INTERNSHIP RUNNING";
  let statusColor = mode === "completed" ? "#2563eb" : mode === "certificate-missing" ? "#d97706" : "#16a34a";
  let statusBg = mode === "completed" ? "#eff6ff" : mode === "certificate-missing" ? "#fffbeb" : "#f0fdf4";
  let overall = mode === "completed" ? "COMPLETE VERIFIED" : mode === "certificate-missing" ? "NOT VERIFIED" : "RUNNING";
  let overallText = mode === "completed" ? "All required documents have been verified successfully." : mode === "certificate-missing" ? "Your internship is complete, but the certificate has not been issued." : "Your internship is currently in progress.";

  const whatsapp = "https://wa.me/917839686310";
  const certificateAction = `<a class="mini-action certificate-action" href="${whatsapp}" target="_blank" rel="noopener noreferrer">Get Your Certificate <span class="click-indicator certificate-icon" aria-hidden="true">▣</span></a>`;
  const helpAction = `<span class="help-inline">Need Help? Contact Us <a class="whatsapp-icon" href="${whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="Contact SoftGrowTech on WhatsApp" title="WhatsApp">${waIcon()}</a></span>`;

  let documentRows = `
    <div class="doc-row"><div><strong>Offer Letter</strong><small>${escapeHtml(offerVerified ? "Offer letter has been issued." : offer)}</small></div><span class="badge green">✓ Received &amp; Verified</span></div>`;

  if (mode === "running") {
    documentRows += `<div class="doc-row"><div><strong>Certificate</strong><small>Certificate will be issued after successful completion of the internship.</small></div><span class="badge yellow">⌛ Coming Soon</span></div>`;
  } else if (mode === "completed") {
    documentRows += `<div class="doc-row"><div><strong>Certificate</strong><small>Certificate has been issued and verified.</small></div><span class="badge green">✓ Received &amp; Verified</span></div>`;
  } else {
    documentRows += `<div class="doc-row"><div><strong>Certificate</strong><small>Certificate has not been issued.</small></div><span class="badge red">✕ Not Issued</span></div>`;
  }

  let bottomMessage = "";
  if (mode === "completed") {
    bottomMessage = `<div class="congratulations"><div class="congrats-icon">✓</div><div><strong>Congratulations!</strong><p>Your internship has been successfully completed and all required documents have been verified.</p></div></div>`;
  } else if (mode === "certificate-missing") {
    bottomMessage = `<div class="certificate-help">${certificateAction}${helpAction}</div>`;
  } else {
    bottomMessage = `<div class="running-note"><strong>Note:</strong> Certificate will be issued after successful completion of the internship and evaluation.</div>`;
  }

  root.innerHTML = `
    <div class="result-shell softgrow-result-animate">
      <div class="result-header">
        <div class="result-brand"><img src="assets/softgrowtech-logo.png" alt="SoftGrowTech"><div><strong>SoftGrowTech</strong><span>Learn • Build • Evolve</span></div></div>
        <div class="result-official"><span class="verified-shield" aria-hidden="true"><span>✓</span></span><div><strong>Official Verification</strong><small>100% Trusted &amp; Secure</small></div></div>
      </div>
      <div class="result-main">
        <div class="verified-title"><div class="verified-icon">✓</div><div><h1>Document Record Verified</h1><p>The record associated with this Student / Letter ID is valid.</p></div></div>
        <div class="mobile-last4-privacy-note" style="margin:0 0 16px;padding:10px 14px;border:1px solid #dbeafe;background:#eff6ff;border-radius:10px;color:#1e3a8a;font-size:12px">
          Verification completed using the Student / Letter ID and the last 4 digits of the registered mobile number. Personal contact details are hidden on this public page.
        </div>
        <div class="student-grid">
          <div><small>Student / Letter ID</small><strong>${escapeHtml(id)}</strong></div>
          <div><small>Student Name</small><strong>${escapeHtml(name)}</strong></div>
          <div><small>Student Email</small><strong>${escapeHtml(email)}</strong></div>
          <div><small>Domain</small><strong>${escapeHtml(domain)}</strong></div>
          <div><small>Batch</small><strong>${escapeHtml(batch)}</strong></div>
        </div>
        <section class="status-section" style="--status:${statusColor};--status-bg:${statusBg}">
          <div class="status-label">1. ${escapeHtml(statusTitle)}</div>
          <div class="status-content">
            <div class="overall-circle"><div class="overall-check">${mode === "completed" ? "✓" : mode === "certificate-missing" ? "!" : "↻"}</div><small>Overall Status</small><strong>${escapeHtml(overall)}</strong><p>${escapeHtml(overallText)}</p></div>
            <div class="document-status"><h2>Document Status</h2>${documentRows}</div>
          </div>
        </section>
        ${bottomMessage}

        <!-- Complete record footer: assurance + actions + copyright.
             This stays INSIDE the downloadable result shell. -->
        <footer class="record-footer" aria-label="Verification record footer">
          <section class="verification-trust-strip" aria-label="Verification assurance">
            <div class="trust-item">
              <div class="trust-icon">✓</div>
              <div><strong>100% Authentic</strong><span>All documents are verified and genuine.</span></div>
            </div>
            <div class="trust-item">
              <div class="trust-icon">♙</div>
              <div><strong>Secure Verification</strong><span>Your privacy and data are fully protected.</span></div>
            </div>
            <div class="trust-item">
              <div class="trust-icon">✦</div>
              <div><strong>Trusted by Thousands</strong><span>Thousands of students trust SoftGrowTech.</span></div>
            </div>
            <div class="trust-item">
              <div class="trust-icon">◉</div>
              <div><strong>Need Support?</strong><span>We're here to help you whenever you need.</span></div>
            </div>
          </section>

          <div class="record-footer-actions">
            <button class="result-button download-record" type="button" data-download-record>
              Download Verification Record <span>⇩</span>
            </button>
            <a class="result-button verify-another" href="${backUrl}">
              Verify Another Letter ID <span>→</span>
            </a>
          </div>

          <p class="result-bottom-line">Verify another ID or need to apply for a new internship application.</p>
          <div class="verification-copyright">© 2026 SoftGrowTech. All Rights Reserved.</div>
        </footer>
      </div>
    </div>`;
  bindVerificationResultActions();
}


function ensureDownloadAndBadgeStyles() {
  if (document.getElementById("softgrow-download-badge-styles")) return;
  const style = document.createElement("style");
  style.id = "softgrow-download-badge-styles";
  style.textContent = `
    .result-official .verified-shield{
      width:42px;height:42px;min-width:42px;
      display:inline-flex;align-items:center;justify-content:center;
      position:relative;
      border:2px solid #2563eb;
      border-radius:12px 12px 16px 16px;
      background:linear-gradient(180deg,#eff6ff,#dbeafe);
      box-shadow:0 4px 10px rgba(37,99,235,.16);
      clip-path:polygon(50% 0%, 92% 17%, 88% 66%, 72% 86%, 50% 100%, 28% 86%, 12% 66%, 8% 17%);
    }
    .result-official .verified-shield::before{
      content:"";
      position:absolute;inset:4px;
      border:1px solid rgba(37,99,235,.25);
      border-radius:9px 9px 12px 12px;
      clip-path:polygon(50% 0%, 92% 17%, 88% 66%, 72% 86%, 50% 100%, 28% 86%, 12% 66%, 8% 17%);
    }
    .result-official .verified-shield > span{
      position:relative;z-index:1;
      color:#2563eb;font-weight:900;font-size:20px;line-height:1;
    }
    .pdf-capture-root{
      width:100% !important;
      max-width:none !important;
      min-width:0 !important;
      box-sizing:border-box !important;
      overflow:visible !important;
      transform:none !important;
    }
    .pdf-capture-root .record-footer{
      break-inside:avoid;
    }
    .pdf-capture-hide{
      display:none !important;
    }
  `;
  document.head.appendChild(style);
}

function ensureRecordFooterStyles() {
  if (document.getElementById("softgrow-record-footer-styles")) return;
  const style = document.createElement("style");
  style.id = "softgrow-record-footer-styles";
  style.textContent = `
    .record-footer{
      margin-top:22px;
      width:100%;
      background:#fff;
      border-top:1px solid #dbe7f5;
      padding-top:14px;
    }
    .record-footer .verification-trust-strip{
      width:100%;
      margin:0;
      box-sizing:border-box;
      padding:18px 20px;
      background:#f8fbff;
      border:1px solid #dbe7f5;
      border-radius:14px;
      display:grid;
      grid-template-columns:repeat(4,1fr);
      gap:14px;
      box-shadow:0 8px 24px rgba(15,23,42,.06);
    }
    .record-footer .trust-item{
      display:flex;
      align-items:center;
      gap:10px;
      min-width:0;
    }
    .record-footer .trust-icon{
      width:40px;height:40px;min-width:40px;border-radius:50%;
      background:#eaf2ff;color:#2563eb;
      display:flex;align-items:center;justify-content:center;
      font-weight:800;font-size:18px;
    }
    .record-footer .trust-item strong{
      display:block;font-size:12px;color:#0f172a;
    }
    .record-footer .trust-item span{
      display:block;font-size:10px;color:#64748b;line-height:1.35;margin-top:3px;
    }
    .record-footer-actions{
      display:flex;
      justify-content:center;
      align-items:center;
      gap:14px;
      flex-wrap:wrap;
      padding:18px 10px 8px;
    }
    .record-footer-actions .result-button{
      min-width:260px;
    }
    .record-footer .result-bottom-line{
      margin:2px 0 12px;
      text-align:center;
    }
    .record-footer .verification-copyright{
      width:100%;
      box-sizing:border-box;
      margin:0;
      background:#061a33;
      color:#fff;
      text-align:center;
      padding:15px 10px;
      font-size:11px;
      border-radius:0 0 10px 10px;
      box-shadow:0 8px 20px rgba(6,26,51,.12);
    }
    @media(max-width:760px){
      .record-footer .verification-trust-strip{grid-template-columns:1fr 1fr;padding:14px}
      .record-footer-actions{flex-direction:column}
      .record-footer-actions .result-button{width:100%;max-width:360px;min-width:0}
    }
  `;
  document.head.appendChild(style);
}


function renderVerificationTrust() {
  // Trust/support content is now rendered inside .record-footer so the
  // complete record is part of the downloadable verification shell.
  const trust = document.getElementById("verificationTrust");
  if (trust) trust.innerHTML = "";
}

function downloadVerificationRecord() {
  const shell = document.querySelector("#verificationResult .result-shell");
  if (!shell) return;

  const original = document.querySelector("[data-download-record]");
  if (original) {
    original.disabled = true;
    original.innerHTML = "Preparing Record…";
  }

  const restoreButton = () => {
    if (original) {
      original.disabled = false;
      original.innerHTML = 'Download Verification Record <span>⇩</span>';
    }
  };

  const loadScript = (src) => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (window.html2canvas && window.jspdf) {
        resolve();
        return;
      }
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  Promise.all([
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
  ]).then(async () => {
    // Capture the LIVE rendered record instead of cloning it.
    // The live DOM already has the correct desktop/mobile layout, fonts,
    // widths and positioning. Cloning was the reason some elements drifted.
    const hideTargets = shell.querySelectorAll(
      ".download-record, .verify-another, .result-bottom-line"
    );
    hideTargets.forEach(el => el.classList.add("pdf-capture-hide"));
    shell.classList.add("pdf-capture-root");

    // Let the browser finish layout/paint before taking the snapshot.
    await new Promise(resolve => requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    }));

    const rect = shell.getBoundingClientRect();
    const canvas = await window.html2canvas(shell, {
      scale: Math.max(2, Math.min(3, window.devicePixelRatio || 2)),
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      width: Math.ceil(rect.width),
      height: Math.ceil(shell.scrollHeight),
      windowWidth: Math.max(document.documentElement.clientWidth, Math.ceil(rect.right)),
      windowHeight: Math.max(window.innerHeight, Math.ceil(shell.scrollHeight))
    });

    hideTargets.forEach(el => el.classList.remove("pdf-capture-hide"));
    shell.classList.remove("pdf-capture-root");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 6;
    const imageWidth = pageWidth - margin * 2;
    const pxPerMm = canvas.width / imageWidth;
    const maxSlicePx = Math.floor((pageHeight - margin * 2) * pxPerMm);

    let sourceY = 0;
    let firstPage = true;

    while (sourceY < canvas.height) {
      const slicePx = Math.min(maxSlicePx, canvas.height - sourceY);

      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = slicePx;

      const ctx = slice.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(
        canvas,
        0, sourceY, canvas.width, slicePx,
        0, 0, canvas.width, slicePx
      );

      if (!firstPage) pdf.addPage();
      firstPage = false;

      pdf.addImage(
        slice.toDataURL("image/png"),
        "PNG",
        margin,
        margin,
        imageWidth,
        slicePx / pxPerMm,
        undefined,
        "FAST"
      );

      sourceY += slicePx;
    }

    pdf.save(`SoftGrowTech-Verification-Record-${Date.now()}.pdf`);
    restoreButton();
  }).catch(error => {
    console.error("Verification record download failed:", error);
    restoreButton();
    // Keep the existing record page available if a PDF library fails.
    window.print();
  });
}
function bindVerificationResultActions() {
  const downloadButton = document.querySelector("[data-download-record]");
  if (downloadButton) {
    downloadButton.addEventListener("click", downloadVerificationRecord);
  }
}

function waIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 11.5a8.2 8.2 0 0 1-12.1 7.1L4 20l1.4-4A8.2 8.2 0 1 1 20.2 11.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9.2 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.5.6c.5 1 1.3 1.8 2.3 2.3l.6-.5c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.5.3-1.1.4-1.7.2-1.2-.3-2.5-1.1-3.6-2.1-1.1-1-1.8-2.3-2.1-3.6-.2-.6-.1-1.2.2-1.7Z" fill="currentColor"/></svg>`;
}

document.addEventListener("DOMContentLoaded", () => {
  addVerificationSecurityStyles();
  initCommonUI();
  initVerificationPage();
  initResultPage();
});
