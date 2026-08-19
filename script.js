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

function initCommonUI() {
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
  const input = form.querySelector("input");
  let result = form.querySelector(".verify-result") || form.parentElement.querySelector(".verify-result");
  if (!input) return;
  if (!result) {
    result = document.createElement("div");
    result.className = "verify-result";
    form.appendChild(result);
  }

  const id = input.value.trim();
  if (!id) {
    showInvalidOnVerification(result, "");
    return;
  }

  showVerificationProcessing(result);
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    const apiUrl = `${SUPABASE_URL}/rest/v1/Students?Student%20Id=eq.${encodeURIComponent(id)}&select=*`;
    const response = await fetch(apiUrl, {
      method:"GET",
      headers:{
        "apikey":SUPABASE_PUBLISHABLE_KEY,
        "Authorization":`Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type":"application/json"
      }
    });
    if (!response.ok) throw new Error("Database request failed");
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      window.location.href = `verification-result.html?id=${encodeURIComponent(id)}&invalid=1`;
      return;
    }

    window.location.href = `verification-result.html?id=${encodeURIComponent(id)}`;
  } catch (error) {
    console.error("Verification error:", error);
    result.style.display = "block";
    result.style.background = "#fef2f2";
    result.style.border = "1px solid #fecaca";
    result.innerHTML = `<div style="padding:30px 20px;text-align:center"><h2 style="margin:0 0 8px;color:#991b1b">Verification Service Unavailable</h2><p style="margin:0;color:#64748b">We are unable to connect to the verification service right now.</p><small style="display:block;margin-top:10px;color:#94a3b8">Please try again after a few moments.</small></div>`;
  }
}

function initVerificationPage() {
  document.querySelectorAll("[data-verify]").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      handleVerification(form);
    });
  });
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
      <div class="result-shell">
        <div class="result-header">
          <div class="result-brand"><img src="assets/softgrowtech-logo.png" alt="SoftGrowTech"><div><strong>SoftGrowTech</strong><span>Learn • Build • Evolve</span></div></div>
          <div class="result-official"><span class="shield">✓</span><div><strong>Official Verification</strong><small>100% Trusted & Secure</small></div></div>
        </div>
        <div class="result-main invalid-result">
          <div class="invalid-icon">!</div>
          <h1>Invalid Official ID</h1>
          <p>The Student / Letter ID you entered could not be found in the official SoftGrowTech records.</p>
          <small>Please check your Official ID and try again.</small>
          <div class="entered-id">Entered ID: <strong>${escapeHtml(id)}</strong></div>
          <a class="result-button" href="${backUrl}">Verify Another ID <span>→</span></a>
        </div>
      </div>`;
  };

  if (invalid || !id) {
    renderInvalid();
    return;
  }

  root.innerHTML = `<div class="result-shell"><div class="result-loading"><div class="result-spinner"></div><h2>Loading Verified Record</h2><p>Retrieving your official SoftGrowTech record...</p></div></div>`;

  const load = async () => {
    try {
      const apiUrl = `${SUPABASE_URL}/rest/v1/Students?Student%20Id=eq.${encodeURIComponent(id)}&select=*`;
      const response = await fetch(apiUrl, { headers:{ "apikey":SUPABASE_PUBLISHABLE_KEY, "Authorization":`Bearer ${SUPABASE_PUBLISHABLE_KEY}` } });
      if (!response.ok) throw new Error("Database request failed");
      const data = await response.json();
      if (!Array.isArray(data) || !data.length) { renderInvalid(); return; }
      renderVerified(data[0]);
    } catch (error) {
      console.error(error);
      root.innerHTML = `<div class="result-shell"><div class="invalid-result"><div class="invalid-icon">!</div><h1>Verification Service Unavailable</h1><p>We are unable to connect to the verification service right now.</p><a class="result-button" href="${backUrl}">Try Again <span>→</span></a></div></div>`;
    }
  };

  load();
}

function renderVerified(student) {
  const root = document.getElementById("verificationResult");
  const id = student["Student Id"] || "Not Available";
  const name = student["Name"] || "Not Available";
  const domain = student["Domain"] || "Not Available";
  const batch = formatDate(student["Batch date"]);
  const offer = String(student["Offer Letter"] || "Not Available");
  const certificate = String(student["Certificate"] || "Not Available");
  const status = String(student["Status"] || "Not Available").toUpperCase();

  const completed = /COMPLETE|COMPLETED/.test(status);
  const running = /RUNNING|ONGOING|ACTIVE/.test(status);
  const offerVerified = /RECEIVED|VERIFIED|ISSUED/.test(offer.toUpperCase());
  const certificateVerified = /RECEIVED|VERIFIED|ISSUED/.test(certificate.toUpperCase());

  let mode = "running";
  if (completed && certificateVerified) mode = "completed";
  else if (completed) mode = "certificate-missing";
  else if (running) mode = "running";

  let statusTitle = mode === "completed" ? "INTERNSHIP COMPLETED" : mode === "certificate-missing" ? "CERTIFICATE NOT VERIFIED" : "INTERNSHIP RUNNING";
  let statusColor = mode === "completed" ? "#2563eb" : mode === "certificate-missing" ? "#d97706" : "#16a34a";
  let statusBg = mode === "completed" ? "#eff6ff" : mode === "certificate-missing" ? "#fffbeb" : "#f0fdf4";
  let overall = mode === "completed" ? "COMPLETE VERIFIED" : mode === "certificate-missing" ? "NOT VERIFIED" : "RUNNING";
  let overallText = mode === "completed" ? "All required documents have been verified successfully." : mode === "certificate-missing" ? "Your internship is complete, but the certificate has not been verified." : "Your internship is currently in progress.";

  const whatsapp = "https://wa.me/917839686310";
  const certificateAction = `<a class="mini-action certificate-action" href="${whatsapp}" target="_blank" rel="noopener noreferrer">Get Your Certificate <span>→</span></a>`;
  const helpAction = `<span class="help-inline">Need Help? Contact Us <a class="whatsapp-icon" href="${whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="Contact SoftGrowTech on WhatsApp" title="WhatsApp">${waIcon()}</a></span>`;

  let documentRows = `
    <div class="doc-row"><div><strong>Offer Letter</strong><small>${escapeHtml(offerVerified ? "Offer letter has been issued." : offer)}</small></div><span class="badge green">✓ Received &amp; Verified</span></div>`;

  if (mode === "running") {
    documentRows += `<div class="doc-row"><div><strong>Certificate</strong><small>Certificate will be issued after successful completion of the internship.</small></div><span class="badge yellow">⌛ Coming Soon</span></div>`;
  } else if (mode === "completed") {
    documentRows += `<div class="doc-row"><div><strong>Certificate</strong><small>Certificate has been issued and verified.</small></div><span class="badge green">✓ Received &amp; Verified</span></div>`;
  } else {
    documentRows += `<div class="doc-row"><div><strong>Certificate</strong><small>Certificate has not been verified.</small></div><span class="badge red">✕ Not Verified</span></div>`;
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
        <div class="result-official"><span class="shield">✓</span><div><strong>Official Verification</strong><small>100% Trusted &amp; Secure</small></div></div>
      </div>
      <div class="result-main">
        <div class="verified-title"><div class="verified-icon">✓</div><div><h1>Document Record Verified</h1><p>The record associated with this Student / Letter ID is valid.</p></div></div>
        <div class="student-grid">
          <div><small>Student / Letter ID</small><strong>${escapeHtml(id)}</strong></div>
          <div><small>Student Name</small><strong>${escapeHtml(name)}</strong></div>
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
        <a class="result-button verify-another" href="${backUrl}">Verify Another Letter ID <span>→</span></a>
        <p class="result-bottom-line">Verify another ID or need to apply for a new internship application.</p>
      </div>
    </div>`;
}

function waIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 11.5a8.2 8.2 0 0 1-12.1 7.1L4 20l1.4-4A8.2 8.2 0 1 1 20.2 11.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9.2 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.5.6c.5 1 1.3 1.8 2.3 2.3l.6-.5c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.5.3-1.1.4-1.7.2-1.2-.3-2.5-1.1-3.6-2.1-1.1-1-1.8-2.3-2.1-3.6-.2-.6-.1-1.2.2-1.7Z" fill="currentColor"/></svg>`;
}

document.addEventListener("DOMContentLoaded", () => {
  initCommonUI();
  initVerificationPage();
  initResultPage();
});
