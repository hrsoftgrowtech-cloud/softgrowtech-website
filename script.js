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
/*
 * NEW BATCH VERIFICATION
 * This path is completely separate from the legacy Students/verify_student flow.
 * New records are authenticated through the verify_new_student RPC.
 */
async function verifyNewStudent(id, mobileLast4) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_new_student`, {
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

  if (!response.ok) throw new Error("New student verification request failed");
  const data = await response.json();
  return Array.isArray(data) && data.length ? data[0] : null;
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
    <label for="verifyMobileLast4" style="display:block;margin-bottom:7px;font-weight:700;color:#0f172a;font-size:14px">Registered Mobile — Last 4 Digits</label>
    <div class="verify-mobile-input-shell">
      <input id="verifyMobileLast4" name="mobile_last4" type="password" inputmode="numeric" autocomplete="off" maxlength="4" pattern="\\d{4}" placeholder="••••" aria-label="Registered mobile number last 4 digits" />
      <button type="button" class="verify-mobile-visibility" id="verifyMobileVisibility" aria-label="Show mobile digits" aria-pressed="false" title="Show mobile digits">
        <svg class="verify-eye-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="eye-open" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle class="eye-open" cx="12" cy="12" r="2.5"/><path class="eye-closed" d="M3 3l18 18M5.5 7.5C3.6 9 2.5 12 2.5 12s3.5 6 9.5 6c1.7 0 3.2-.4 4.5-1M9.5 6.4C10.1 6.1 10.8 6 12 6c6 0 9.5 6 9.5 6s-1 2.1-2.7 3.7"/></svg>
      </button>
    </div>
    <div class="verify-mobile-last4-help">Enter the last 4 digits of the mobile number registered with SoftGrowTech internship.</div>`;
  const submit=form.querySelector('button[type="submit"], input[type="submit"]');
  if(submit) form.insertBefore(wrap,submit); else form.appendChild(wrap);
  const input=wrap.querySelector('#verifyMobileLast4'); const btn=wrap.querySelector('#verifyMobileVisibility');
  input.addEventListener('input',()=>{input.value=input.value.replace(/\D/g,'').slice(0,4);});
  btn.addEventListener('click',()=>{const hidden=input.type==='password'; input.type=hidden?'text':'password'; btn.setAttribute('aria-pressed',String(hidden)); btn.setAttribute('aria-label',hidden?'Hide mobile digits':'Show mobile digits'); btn.setAttribute('title',hidden?'Hide mobile digits':'Show mobile digits'); btn.querySelector('.verify-eye-icon').classList.toggle('is-closed',!hidden); input.focus();});
  return input;
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
    // NEW STUDENTS FIRST:
    // If this ID belongs to the new-batch table, use the new automatic
    // batch/confirmation logic. The legacy Students table is untouched.
    const newStudent = await verifyNewStudent(id, mobileLast4);

    if (newStudent) {
      sessionStorage.setItem("softgrowVerificationResult", JSON.stringify({
        type: "new",
        student: newStudent
      }));

      // Do not put the mobile digits in the URL.
      window.location.href = `verification-result.html?id=${encodeURIComponent(id)}`;
      return;
    }

    // LEGACY STUDENTS:
    // Existing records continue through the original verification RPC exactly
    // as before.
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
    .verify-inline-error[hidden]{display:none !important;}
    .sg-icon{width:1.25em;height:1.25em;display:inline-block;vertical-align:-.2em;flex:0 0 auto;}
    .verify-eye-icon{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
    .verify-eye-icon .eye-closed{display:none;}
    .verify-eye-icon.is-closed .eye-open{display:none;}
    .verify-eye-icon.is-closed .eye-closed{display:block;}
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

    .verification-help-icon{position:relative;}
    .verification-help-icon::after{content:"";position:absolute;inset:-5px;border:1px solid currentColor;border-radius:50%;opacity:0;animation:verificationHelpPulse 2.4s ease-out infinite;pointer-events:none;}
    @keyframes verificationHelpPulse{0%{transform:scale(.86);opacity:.35}65%,100%{transform:scale(1.22);opacity:0}}
    @media(prefers-reduced-motion:reduce){.verification-help-icon::after{animation:none;}}
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
            href="https://wa.me/917839686310?text=${encodeURIComponent("Hi")}"
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

  if (savedRecord && savedRecord.student) {
    if (savedRecord.type === "new") {
      renderNewStudentRecord(savedRecord.student);
      return;
    }
    if (savedRecord.type === "valid") {
      renderVerified(savedRecord.student);
      return;
    }
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

function maskPublicEmail(email) {
  if (!email || typeof email !== "string") return email;
  const at = email.indexOf("@");
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);

  // Public verification page: keep only the first 2 and last 2
  // characters of the email local-part visible.
  if (local.length <= 4) return local.slice(0, 1) + "****" + domain;
  return local.slice(0, 2) + "****" + local.slice(-2) + domain;
}


function addOneCalendarMonth(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  const out = new Date(d.getTime());
  const originalDay = out.getDate();
  out.setMonth(out.getMonth() + 1);
  // If the target month has fewer days, JS rolls into the following month.
  // Clamp to the last day of the intended month so the duration remains one
  // calendar month (e.g. Jan 31 -> Feb 28/29).
  if (out.getDate() !== originalDay) {
    out.setDate(0);
  }
  return out;
}

function ensureNewStudentRecordStyles() {
  if (document.getElementById("softgrow-new-student-record-styles")) return;
  const style = document.createElement("style");
  style.id = "softgrow-new-student-record-styles";
  style.textContent = `
    .new-record-page{width:min(1180px,100%);margin:0 auto}
    .new-record-hero{background:#061a33;color:#fff;padding:18px 28px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
    .new-record-brand{display:flex;align-items:center;gap:12px}
    .new-record-brand img{width:48px;height:48px;object-fit:contain;border-radius:10px;background:#fff}
    .new-record-brand strong{display:block;font-size:21px}.new-record-brand span{display:block;font-size:12px;opacity:.82;margin-top:2px}
    .new-record-official{display:flex;align-items:center;gap:10px}.new-record-official strong{display:block;font-size:14px}.new-record-official small{display:block;font-size:11px;opacity:.8;margin-top:3px}
    .new-record-shield{width:42px;height:42px;display:flex;align-items:center;justify-content:center;border:2px solid #2563eb;border-radius:12px;color:#60a5fa;font-weight:900;font-size:21px}
    .new-record-body{padding:28px;background:#fff}
    .new-record-heading{text-align:center;margin-bottom:22px}.new-record-heading h1{margin:0;font-size:28px;letter-spacing:.3px}.new-record-heading p{margin:7px 0 0;color:#64748b;font-size:13px}
    .new-record-student-grid{display:grid;grid-template-columns:repeat(5,1fr);border:1px solid #e2e8f0;border-radius:13px;overflow:hidden;margin-bottom:22px}
    .new-record-student-grid>div{padding:15px 17px;border-right:1px solid #e2e8f0}.new-record-student-grid>div:last-child{border-right:0}
    .new-record-student-grid small{display:block;color:#64748b;font-size:11px;margin-bottom:6px}.new-record-student-grid strong{font-size:14px;word-break:break-word}
    .new-stage-title{display:flex;align-items:center;gap:14px;margin:18px 0 14px;color:#0f172a;font-weight:900;font-size:15px}
    .new-stage-title:before,.new-stage-title:after{content:"";height:2px;background:#dbe7f5;flex:1}.new-stage-title span{padding:8px 16px;border-radius:999px;background:#1d4ed8;color:#fff;box-shadow:0 4px 12px rgba(29,78,216,.18)}
    .new-current-card{border:1px solid var(--new-border);background:var(--new-bg);border-radius:14px;padding:18px;margin-bottom:18px;box-shadow:0 8px 25px rgba(15,23,42,.05)}
    .new-current-label{display:inline-flex;background:var(--new-accent);color:#fff;padding:8px 14px;border-radius:6px;font-size:12px;font-weight:900;letter-spacing:.1px;margin-bottom:17px}
    .new-current-grid{display:grid;grid-template-columns:210px 1fr;gap:24px;align-items:center}
    .new-overall{width:184px;height:184px;margin:auto;border-radius:50%;background:#fff;border:1px dashed color-mix(in srgb,var(--new-accent) 35%,#fff);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:20px;box-shadow:0 4px 18px rgba(15,23,42,.05)}
    .new-overall-icon{width:52px;height:52px;border-radius:50%;background:var(--new-icon-bg);color:var(--new-accent);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;margin-bottom:7px}
    .new-overall small{font-size:11px;color:#475569}.new-overall strong{font-size:18px;color:var(--new-accent);margin-top:4px}.new-overall p{margin:7px 0 0;color:#64748b;font-size:10px;line-height:1.4;max-width:140px}
    .new-doc-title{font-size:17px;font-weight:900;margin:0 0 10px}.new-doc-row{display:flex;align-items:center;justify-content:space-between;gap:14px;background:#fff;border:1px solid #dfe7f0;border-radius:10px;padding:13px 14px;margin-top:9px}
    .new-doc-left{display:flex;align-items:center;gap:12px;min-width:0}.new-doc-icon{width:42px;height:42px;min-width:42px;border-radius:9px;background:#eaf2ff;color:#2563eb;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900}
    .new-doc-icon.offer{background:#e2f7e8;color:#15803d}.new-doc-icon.cert{background:var(--new-icon-bg);color:var(--new-accent)}
    .new-doc-left strong{display:block;font-size:14px}.new-doc-left small{display:block;color:#64748b;font-size:11px;margin-top:4px;line-height:1.4}
    .new-badge{white-space:nowrap;border-radius:7px;padding:8px 10px;font-size:11px;font-weight:900}.new-badge.green{background:#dcfce7;color:#15803d}.new-badge.blue{background:#dbeafe;color:#1d4ed8}.new-badge.yellow{background:#fef3c7;color:#b45309}.new-badge.red{background:#fee2e2;color:#b91c1c}
    .new-confirm-box{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:12px;padding:14px 15px;border-radius:10px;background:#fff;border:1px solid var(--new-border)}
    .new-confirm-box strong{display:block;font-size:13px;color:var(--new-accent)}.new-confirm-box p{margin:4px 0 0;color:#475569;font-size:11px;line-height:1.4}
    .new-confirm-action{display:inline-flex;align-items:center;gap:7px;flex:0 0 auto;padding:10px 14px;border:1px dashed currentColor;border-radius:8px;color:#dc2626;text-decoration:none;font-size:12px;font-weight:900;animation:newConfirmPulse 1.8s ease-in-out infinite}
    .new-confirm-action span{display:inline-block;animation:newConfirmArrow 1s ease-in-out infinite}
    @keyframes newConfirmPulse{0%,100%{transform:translateY(0);box-shadow:0 0 0 rgba(220,38,38,0)}50%{transform:translateY(-2px);box-shadow:0 6px 18px rgba(220,38,38,.12)}} 
    @keyframes newConfirmArrow{0%,100%{transform:translateX(0)}50%{transform:translateX(4px)}}
    .new-congrats{display:flex;align-items:center;gap:12px;margin-top:12px;padding:14px 15px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px}
    .new-congrats-icon{width:42px;height:42px;min-width:42px;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900}
    .new-congrats strong{font-size:13px;color:#1d4ed8}.new-congrats p{margin:4px 0 0;color:#475569;font-size:11px;line-height:1.4}
    .new-bottom-note{text-align:center;padding:10px 14px;border-radius:8px;margin-top:12px;font-size:11px;font-weight:800}
    .new-bottom-note.blue{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe}.new-bottom-note.red{background:#fff1f2;color:#be123c;border:1px solid #fecdd3}.new-bottom-note.green{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0}
    .new-record-trust{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:18px;padding:16px;background:#f8fbff;border:1px solid #dbe7f5;border-radius:13px}
    .new-trust-item{display:flex;align-items:center;gap:9px}.new-trust-icon{width:38px;height:38px;min-width:38px;border-radius:50%;background:#eaf2ff;color:#2563eb;display:flex;align-items:center;justify-content:center;font-weight:900}
    .new-trust-item strong{display:block;font-size:11px}.new-trust-item span{display:block;color:#64748b;font-size:9px;line-height:1.3;margin-top:2px}
    .new-record-actions{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;padding-top:16px}.new-record-actions .result-button{margin:0;max-width:320px}
    .new-record-copyright{margin-top:14px;background:#061a33;color:#fff;text-align:center;padding:14px;font-size:11px;border-radius:0 0 10px 10px}
    @media(max-width:820px){.new-record-student-grid{grid-template-columns:1fr 1fr}.new-record-student-grid>div:nth-child(2n){border-right:0}.new-record-student-grid>div{border-bottom:1px solid #e2e8f0}.new-record-student-grid>div:last-child{border-bottom:0}.new-current-grid{grid-template-columns:1fr}.new-overall{width:170px;height:170px}.new-record-trust{grid-template-columns:1fr 1fr}}
    @media(max-width:560px){.new-record-body{padding:16px}.new-record-hero{padding:15px 16px}.new-record-heading h1{font-size:22px}.new-record-student-grid{grid-template-columns:1fr}.new-record-student-grid>div{border-right:0}.new-current-card{padding:13px}.new-doc-row{flex-direction:column;align-items:flex-start}.new-badge{white-space:normal}.new-confirm-box{flex-direction:column;align-items:flex-start}.new-confirm-action{width:100%;justify-content:center}.new-record-trust{grid-template-columns:1fr}.new-record-actions{flex-direction:column}.new-record-actions .result-button{width:100%;max-width:none}}
  `;
  document.head.appendChild(style);
}


function ensureNewStudentLegacyVisualStyles() {
  if (document.getElementById("softgrow-new-flow-legacy-visuals")) return;
  const style = document.createElement("style");
  style.id = "softgrow-new-flow-legacy-visuals";
  style.textContent = `
    .new-flow-result .record-svg{width:24px;height:24px;display:block}
    .new-flow-result .verified-title .verified-icon{display:flex;align-items:center;justify-content:center}
    .new-flow-result .new-flow-student-grid{grid-template-columns:repeat(6,1fr)}
    .new-flow-result .new-flow-student-grid>div{min-width:0}
    .new-flow-result .new-flow-stage-title{
      display:flex;align-items:center;gap:14px;margin:18px 0 14px;
      color:#0f172a;font-weight:900;font-size:14px;text-align:center;
    }
    .new-flow-result .new-flow-stage-title:before,
    .new-flow-result .new-flow-stage-title:after{
      content:"";height:2px;background:#dbe7f5;flex:1;
    }
    .new-flow-result .new-flow-stage-title span{
      padding:8px 15px;border-radius:999px;background:#1d4ed8;color:#fff;
      box-shadow:0 4px 12px rgba(29,78,216,.18);
      white-space:nowrap;
    }
    .new-flow-result .new-flow-status-section{margin-bottom:18px}
    .new-flow-result .new-flow-overall-icon{
      display:flex;align-items:center;justify-content:center;
    }
    .new-flow-result .new-flow-overall-icon .record-svg{width:28px;height:28px}
    .new-flow-result .new-flow-doc-left{
      display:flex;align-items:center;gap:12px;min-width:0;
    }
    .new-flow-result .new-flow-doc-icon{
      width:42px;height:42px;min-width:42px;border-radius:9px;
      display:flex;align-items:center;justify-content:center;
      color:var(--icon-color,#2563eb);background:var(--icon-bg,#eaf2ff);
    }
    .new-flow-result .new-flow-doc-icon.offer{
      color:#15803d;background:#e2f7e8;
    }
    .new-flow-result .new-flow-doc-icon .record-svg{width:23px;height:23px}
    .new-flow-confirm-button{
      display:inline-flex;align-items:center;justify-content:center;gap:7px;
      padding:8px 11px;border-radius:7px;border:1px dashed #dc2626;
      background:#fff7f7;color:#dc2626;text-decoration:none;
      font-size:11px;font-weight:900;white-space:nowrap;
      animation:newFlowConfirmPulse 1.8s ease-in-out infinite;
    }
    .new-flow-confirm-button span{
      display:inline-block;animation:newFlowConfirmArrow 1s ease-in-out infinite;
    }
    @keyframes newFlowConfirmPulse{
      0%,100%{box-shadow:0 0 0 rgba(220,38,38,0);transform:translateY(0)}
      50%{box-shadow:0 5px 16px rgba(220,38,38,.14);transform:translateY(-1px)}
    }
    @keyframes newFlowConfirmArrow{
      0%,100%{transform:translateX(0)}
      50%{transform:translateX(4px)}
    }
    .new-flow-message{
      display:flex;align-items:center;gap:12px;margin-top:12px;padding:14px 15px;
      border-radius:10px;border:1px solid #bfdbfe;background:#eff6ff;
    }
    .new-flow-message.red{background:#fff1f2;border-color:#fecdd3}
    .new-flow-message.green{background:#f0fdf4;border-color:#bbf7d0}
    .new-flow-message.blue{background:#eff6ff;border-color:#bfdbfe}
    .new-flow-message-icon{
      width:42px;height:42px;min-width:42px;border-radius:10px;
      display:flex;align-items:center;justify-content:center;
      background:#dbeafe;color:#2563eb;
    }
    .new-flow-message.red .new-flow-message-icon{background:#fee2e2;color:#dc2626}
    .new-flow-message.green .new-flow-message-icon{background:#dcfce7;color:#15803d}
    .new-flow-message .record-svg{width:23px;height:23px}
    .new-flow-message strong{display:block;font-size:13px}
    .new-flow-message.red strong{color:#be123c}
    .new-flow-message.blue strong{color:#1d4ed8}
    .new-flow-message.green strong{color:#15803d}
    .new-flow-message p{margin:4px 0 0;color:#475569;font-size:11px;line-height:1.4}
    .new-flow-result .new-flow-note-red{
      background:#fff1f2;color:#be123c;border:1px solid #fecdd3;
      display:flex;align-items:center;justify-content:center;gap:7px;
    }
    .new-flow-result .new-flow-note-blue{
      background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;
      display:flex;align-items:center;justify-content:center;gap:7px;
    }
    .new-flow-result .new-flow-note-green{
      background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;
      display:flex;align-items:center;justify-content:center;gap:7px;
    }
    .new-flow-result .new-flow-note-red .record-svg,
    .new-flow-result .new-flow-note-blue .record-svg,
    .new-flow-result .new-flow-note-green .record-svg{width:16px;height:16px}
    .new-flow-result .new-flow-privacy{margin:0 0 16px!important}
    @media(max-width:900px){
      .new-flow-result .new-flow-student-grid{grid-template-columns:repeat(3,1fr)}
      .new-flow-result .new-flow-student-grid>div:nth-child(3n){border-right:0}
    }
    @media(max-width:760px){
      .new-flow-result .new-flow-student-grid{grid-template-columns:1fr 1fr}
      .new-flow-result .new-flow-student-grid>div:nth-child(2n){border-right:0}
      .new-flow-result .new-flow-student-grid>div{border-bottom:1px solid #e2e8f0}
      .new-flow-result .new-flow-student-grid>div:last-child{border-bottom:0}
      .new-flow-result .new-flow-stage-title{font-size:11px}
      .new-flow-result .new-flow-stage-title span{white-space:normal}
    }
    @media(max-width:560px){
      .new-flow-result .new-flow-student-grid{grid-template-columns:1fr}
      .new-flow-result .new-flow-student-grid>div{border-right:0}
      .new-flow-confirm-button{width:100%;white-space:normal}
    }
  `;
  document.head.appendChild(style);
}

function renderNewStudentRecord(student) {
  ensureRecordFooterStyles();
  ensureDownloadAndBadgeStyles();
  ensureNewStudentLegacyVisualStyles();

  const root = document.getElementById("verificationResult");
  const backUrl = "documents-verification.html";

  const id = student["Student Id"] || "Not Available";
  const name = student["Name"] || "Not Available";
  const email = student["Student Email"] || "Not Available";
  const domain = student["Domain"] || "Not Available";
  const batchStart = student["Batch Start"] || "";
  const confirmed = student.confirmed === true || String(student.confirmed).toLowerCase() === "true";

  const startDate = batchStart ? new Date(batchStart) : null;
  const endDate = addOneCalendarMonth(batchStart);
  const now = new Date();
  const validStart = startDate && !Number.isNaN(startDate.getTime());
  const completed = !!(endDate && now >= endDate);

  let mode;
  if (!validStart) mode = confirmed ? "running-confirmed" : "running-pending";
  else if (!completed && confirmed) mode = "running-confirmed";
  else if (!completed) mode = "running-pending";
  else if (confirmed) mode = "completed-confirmed";
  else mode = "completed-pending";

  const batchStartText = validStart ? formatDate(batchStart) : "Not Available";
  const batchEndText = endDate ? formatDate(endDate) : "Not Available";

  const icons = {
    verified: `<svg viewBox="0 0 24 24" aria-hidden="true" class="record-svg"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="m8 12 2.5 2.5L16.5 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" aria-hidden="true" class="record-svg"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    offer: `<svg viewBox="0 0 24 24" aria-hidden="true" class="record-svg"><path d="M6 3.5h9l3 3V20.5H6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14.5 3.5v3h3M8.5 11h7M8.5 14.5h7M8.5 8h3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    certificate: `<svg viewBox="0 0 24 24" aria-hidden="true" class="record-svg"><path d="M6 3.5h12v12H6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m9 15.5-1 5 4-2 4 2-1-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 7.5h6M9 10.5h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    info: `<svg viewBox="0 0 24 24" aria-hidden="true" class="record-svg"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 10.5v5M12 7.5h.01" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    check: `<svg viewBox="0 0 24 24" aria-hidden="true" class="record-svg"><path d="m5 12 4.2 4L19 6.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" aria-hidden="true" class="record-svg"><path d="M12 3 22 20H2L12 3Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M12 9v5M12 17h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    celebration: `<svg viewBox="0 0 24 24" aria-hidden="true" class="record-svg"><path d="M5 19 8 9l7 7-10 3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m8 9 7-4M12 13l7-3M16 4l1-2M20 8l2-1M5 5 3 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`
  };

  const cfg = {
    "running-pending": {
      color:"#dc2626", bg:"#fffafa", border:"#fecaca", iconBg:"#fee2e2",
      title:"INTERNSHIP RUNNING", overall:"RUNNING",
      overallText:"Your internship is currently in progress.",
      certBadge:null,
      certText:"Please complete your confirmation to receive your certificate.",
      note:"Complete your confirmation to move forward."
    },
    "running-confirmed": {
      color:"#2563eb", bg:"#f8fbff", border:"#bfdbfe", iconBg:"#dbeafe",
      title:"INTERNSHIP RUNNING", overall:"RUNNING",
      overallText:"Your internship is currently in progress.",
      certBadge:"⌛ Coming Soon", certClass:"yellow",
      certText:"Certificate will be issued after successful completion.",
      note:"Once the internship is completed, your certificate will be issued and verified."
    },
    "completed-confirmed": {
      color:"#15803d", bg:"#f7fff9", border:"#bbf7d0", iconBg:"#dcfce7",
      title:"INTERNSHIP COMPLETED", overall:"COMPLETE",
      overallText:"Your internship has been successfully completed.",
      certBadge:"✓ Received & Verified", certClass:"green",
      certText:"Certificate has been issued and verified.",
      note:"Your certificate is now available and verified."
    },
    "completed-pending": {
      color:"#dc2626", bg:"#fffafa", border:"#fecaca", iconBg:"#fee2e2",
      title:"INTERNSHIP COMPLETED", overall:"COMPLETE",
      overallText:"Your internship has been successfully completed.",
      certBadge:"✕ Not Issued", certClass:"red",
      certText:"Certificate has not been issued.",
      note:"Complete your confirmation to get your certificate."
    }
  }[mode];

  const whatsapp = "https://wa.me/917839686310";
  const confirmationButton = `<a class="new-flow-confirm-button" href="#confirmation" onclick="return false;">Complete Your Confirmation <span>→</span></a>`;

  let certificateBadge = "";
  if (mode === "running-pending") {
    certificateBadge = confirmationButton;
  } else if (mode === "completed-pending") {
    certificateBadge = `<span class="badge red">✕ Not Issued</span>`;
  } else {
    certificateBadge = `<span class="badge ${cfg.certClass}">${cfg.certBadge}</span>`;
  }

  let bottomMessage = "";
  if (mode === "running-pending") {
    bottomMessage = `
      <div class="new-flow-message red">
        <div class="new-flow-message-icon">${icons.info}</div>
        <div><strong>Why is confirmation required?</strong><p>Your confirmation helps us verify your details and prepare your certificate.</p></div>
      </div>
      <div class="running-note new-flow-note-red"><strong>✓</strong> Complete your confirmation to move forward.</div>`;
  } else if (mode === "running-confirmed") {
    bottomMessage = `
      <div class="new-flow-message blue">
        <div class="new-flow-message-icon">${icons.celebration}</div>
        <div><strong>Congratulations! 🎉</strong><p>Great job! Your confirmation has been received successfully. You're one step closer to earning your certificate. Keep up the good work!</p></div>
      </div>
      <div class="running-note new-flow-note-blue">${icons.check} Once the internship is completed, your certificate will be issued and verified.</div>`;
  } else if (mode === "completed-confirmed") {
    bottomMessage = `
      <div class="new-flow-message green">
        <div class="new-flow-message-icon">${icons.celebration}</div>
        <div><strong>Congratulations! 🎉</strong><p>Your internship has been successfully completed and your confirmation has been verified. Keep growing!</p></div>
      </div>
      <div class="running-note new-flow-note-green">${icons.check} Your certificate is now available and verified.</div>`;
  } else {
    bottomMessage = `
      <div class="new-flow-message red">
        <div class="new-flow-message-icon">${icons.warning}</div>
        <div><strong>Your confirmation was not received.</strong><p>Please complete the confirmation process to proceed with certificate issuance.</p></div>
      </div>
      <div class="running-note new-flow-note-red">${icons.info} Complete your confirmation to get your certificate.</div>`;
  }

  root.innerHTML = `
    <div class="result-shell softgrow-result-animate new-flow-result">
      <div class="result-header">
        <div class="result-brand">
          <img src="assets/softgrowtech-logo.png" alt="SoftGrowTech">
          <div><strong>SoftGrowTech</strong><span>Learn • Build • Evolve</span></div>
        </div>
        <div class="result-official">
          <span class="verified-shield" aria-hidden="true"><span>✓</span></span>
          <div><strong>Official Verification</strong><small>100% Trusted &amp; Secure</small></div>
        </div>
      </div>

      <div class="result-main">
        <div class="verified-title">
          <div class="verified-icon">✓</div>
          <div><h1>Document Record Verified</h1><p>The record associated with this Student / Letter ID is valid.</p></div>
        </div>

        <div class="mobile-last4-privacy-note new-flow-privacy">
          Verification completed using the Student / Letter ID and the last 4 digits of the registered mobile number. Personal contact details are hidden on this public page.
        </div>

        <div class="student-grid new-flow-student-grid">
          <div><small>Student / Letter ID</small><strong>${escapeHtml(id)}</strong></div>
          <div><small>Student Name</small><strong>${escapeHtml(name)}</strong></div>
          <div><small>Student Email</small><strong>${escapeHtml(maskPublicEmail(email))}</strong></div>
          <div><small>Domain</small><strong>${escapeHtml(domain)}</strong></div>
          <div><small>Batch Start</small><strong>${escapeHtml(batchStartText)}</strong></div>
          <div><small>Batch End</small><strong>${escapeHtml(batchEndText)}</strong></div>
        </div>

        <div class="new-flow-stage-title"><span>${completed ? "AFTER INTERNSHIP COMPLETION (AFTER BATCH END DATE)" : "DURING INTERNSHIP (BEFORE BATCH END DATE)"}</span></div>

        <section class="status-section new-flow-status-section" style="--status:${cfg.color};--status-bg:${cfg.bg}">
          <div class="status-label">${escapeHtml(mode === "running-pending" ? "RUNNING - CONFIRMATION PENDING" :
            mode === "running-confirmed" ? "RUNNING - CONFIRMATION RECEIVED" :
            mode === "completed-confirmed" ? "COMPLETED - CONFIRMATION RECEIVED" :
            "COMPLETED - CONFIRMATION NOT RECEIVED")}</div>

          <div class="status-content">
            <div class="overall-circle">
              <div class="overall-check new-flow-overall-icon">
                ${mode === "completed-confirmed" ? icons.check : mode === "completed-pending" ? icons.warning : icons.clock}
              </div>
              <small>Overall Status</small>
              <strong>${escapeHtml(cfg.overall)}</strong>
              <p>${escapeHtml(cfg.overallText)}</p>
            </div>

            <div class="document-status">
              <h2>Document Status</h2>

              <div class="doc-row">
                <div class="new-flow-doc-left">
                  <div class="new-flow-doc-icon offer">${icons.offer}</div>
                  <div><strong>Offer Letter</strong><small>Offer letter has been issued.</small></div>
                </div>
                <span class="badge green">✓ Received &amp; Verified</span>
              </div>

              <div class="doc-row">
                <div class="new-flow-doc-left">
                  <div class="new-flow-doc-icon cert" style="--icon-color:${cfg.color};--icon-bg:${cfg.iconBg}">${icons.certificate}</div>
                  <div><strong>Certificate</strong><small>${escapeHtml(cfg.certText)}</small></div>
                </div>
                ${certificateBadge}
              </div>

              ${bottomMessage}
            </div>
          </div>
        </section>

        <footer class="record-footer" aria-label="Verification record footer">
          <section class="verification-trust-strip" aria-label="Verification assurance">
            <div class="trust-item"><div class="trust-icon">✓</div><div><strong>100% Authentic</strong><span>All documents are verified and genuine.</span></div></div>
            <div class="trust-item"><div class="trust-icon">♙</div><div><strong>Secure Verification</strong><span>Your privacy and data are fully protected.</span></div></div>
            <div class="trust-item"><div class="trust-icon">✦</div><div><strong>Trusted by Thousands</strong><span>Thousands of students trust SoftGrowTech.</span></div></div>
            <div class="trust-item"><div class="trust-icon">◉</div><div><strong>Need Support?</strong><span>We're here to help you whenever you need.</span></div></div>
          </section>

          <div class="record-footer-actions">
            <button class="result-button download-record" type="button" data-download-record>Download Verification Record <span>⇩</span></button>
            <a class="result-button verify-another" href="${backUrl}">Verify Another Letter ID <span>→</span></a>
          </div>

          <p class="result-bottom-line">Verify another ID or return to the official verification page.</p>
          <div class="verification-copyright">© 2026 SoftGrowTech. All Rights Reserved.</div>
        </footer>
      </div>
    </div>`;
  bindVerificationResultActions();
}


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
          <div><small>Student Email</small><strong>${escapeHtml(maskPublicEmail(email))}</strong></div>
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
  const shell = document.querySelector("#verificationResult .result-shell, #verificationResult .new-record-page");
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
