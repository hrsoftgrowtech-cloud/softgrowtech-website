from pathlib import Path
import re, zipfile, shutil, os
root=Path('/tmp/sgt')

# ---------- Referral portal UI ----------
portal=root/'my-referral.html'
s=portal.read_text()
# Replace inline CSS block content with richer styling by injecting additions before </style>
extra='''
.referral-landing{background:linear-gradient(145deg,#ffffff 0%,#f8fbff 55%,#eef6ff 100%);border-color:#cfe0ff}.ref-access-wrap{max-width:900px;margin:46px auto}.ref-access-card{padding:38px}.ref-access-icon{width:82px;height:82px;border-radius:24px;background:linear-gradient(145deg,#eaf3ff,#ffffff);box-shadow:0 12px 30px rgba(37,99,235,.12)}.ref-hero{max-width:1080px;margin:32px auto}.ref-hero:before{content:"";display:block;height:5px;border-radius:99px;background:linear-gradient(90deg,#2563eb,#60a5fa,#bfdbfe);margin-bottom:20px}.ref-position{display:grid;grid-template-columns:1.15fr .85fr;gap:22px;align-items:center;padding:24px;border:1px solid #dbeafe;border-radius:22px;background:linear-gradient(135deg,#f8fbff,#fff);box-shadow:0 14px 35px rgba(30,64,175,.07)}.ref-hero h1{font-size:34px;letter-spacing:-.5px}.ref-token-highlight{display:flex;gap:12px;align-items:center;margin:18px 0;padding:14px 16px;border-radius:15px;background:#f8fbff;border:1px solid #dbeafe;color:#1e3a8a}.ref-token-highlight strong{font-size:13px}.ref-benefit-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:22px 0}.ref-benefit{padding:16px;border:1px solid #e2e8f0;border-radius:16px;background:rgba(255,255,255,.9);box-shadow:0 8px 22px rgba(15,23,42,.04)}.ref-benefit b{display:block;margin-bottom:5px}.ref-benefit span{color:#64748b;font-size:13px;line-height:1.45}.ref-join-cta{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:22px;padding:18px;border-radius:18px;background:#0f2f67;color:#fff}.ref-join-cta p{margin:3px 0 0;color:#dbeafe;font-size:13px}.ref-join-cta .portal-btn{background:#fff;color:#1d4ed8;border-color:#fff}.ref-unlock-note{font-size:12px;color:#64748b;margin-top:9px;text-align:center}.badge-pop{animation:badgePop .65s ease both}.unlock-pop{animation:unlockPop .55s ease both}@keyframes badgePop{0%{transform:scale(.85);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}@keyframes unlockPop{0%{transform:translateY(10px);opacity:0}100%{transform:translateY(0);opacity:1}}@media(max-width:700px){.ref-access-wrap{margin:22px auto}.ref-access-card{padding:24px}.ref-benefit-grid{grid-template-columns:1fr}.ref-position{grid-template-columns:1fr}.ref-hero h1{font-size:28px}.ref-join-cta{flex-direction:column;align-items:flex-start}}
'''
s=s.replace('</style>',extra+'</style>')
portal.write_text(s)

# Replace referral portal JS completely with clean implementation retaining same DB calls.
js=root/'my-referral/referral-portal.js'
js.write_text(r'''const SGT_URL='https://syoqukavgvrdhwxatdav.supabase.co',SGT_KEY='sb_publishable_yUuacAdfZy3k-_Zve5QOZA_6eLh9Fe';
const sb=window.supabase.createClient(SGT_URL,SGT_KEY);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const toast=m=>{const t=document.getElementById('toast');if(t){t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000)}};
const icon=k=>window.sgtIcon?window.sgtIcon(k):'';
const badges=[{at:1,title:'First Referral',icon:'🌱',text:'Your first successful referral is the start of your contribution.'},{at:3,title:'Referral Contributor',icon:'🏅',text:'Three successful referrals completed. Keep the momentum going.'},{at:5,title:'Active Contributor',icon:'⭐',text:'Five successful referrals completed. Your reach is growing.'},{at:10,title:'Referral Champion',icon:'🏆',text:'Ten successful referrals completed. A strong contribution.'},{at:20,title:'Referral Leader',icon:'👑',text:'Twenty successful referrals completed. A major milestone.'}];
function badgeFor(n){let b={at:0,title:'Getting Started',icon:'✨',text:'Complete your first genuine referral to unlock your first badge.'};for(const x of badges)if(n>=x.at)b=x;return b}
function nextBadge(n){return badges.find(x=>n<x.at)||null}
async function submitJoinRequest(){const name=joinName.value.trim(),email=joinEmail.value.trim().toLowerCase(),phone=joinPhone.value.trim();if(!name||!email||!phone){joinMessage.textContent='Please enter your name, Gmail and WhatsApp number.';return}joinSubmit.disabled=true;joinSubmit.textContent='Sending…';const {data,error}=await sb.rpc('sgt_submit_referral_join_request',{p_name:name,p_email:email,p_phone:phone});if(error||!data||data.error){joinMessage.textContent=error?.message||data?.error||'Unable to submit your request right now.';joinSubmit.disabled=false;joinSubmit.textContent='Request to Join';return}joinForm.innerHTML='<div class="join-success unlock-pop">✓ Request submitted successfully.<br><small>Your request has been sent to the SoftGrowTech Referral Program team. You will receive partner access if approved.</small></div>'}
function showLanding(){const root=document.getElementById('referralRoot');root.innerHTML=`<div class="ref-access-wrap"><div class="ref-access-card referral-landing unlock-pop"><div class="ref-access-glow"></div><div class="ref-access-icon">🎯</div><div class="portal-kicker">OFFICIAL SOFTGROWTECH PROGRAM</div><h1>Referral Program</h1><p class="ref-sub">Share the SoftGrowTech opportunity with genuine students, track your referrals and build your contribution from one professional dashboard.</p><div class="ref-benefit-grid"><div class="ref-benefit"><b>🔗 Share & Track</b><span>Use your personal referral link and see registrations connected to you.</span></div><div class="ref-benefit"><b>🏅 Achievement Badges</b><span>Unlock cumulative recognition badges as successful referrals grow.</span></div><div class="ref-benefit"><b>📈 See Your Progress</b><span>Follow referral status and your current progress in one place.</span></div></div><div class="ref-token-box"><label for="portalToken">Enter Your Referral Token</label><input id="portalToken" class="ref-token-input" inputmode="text" maxlength="12" autocomplete="one-time-code" placeholder="SGT-12345678"><div class="ref-security-note">🔐 <span>Your token is issued by SoftGrowTech after your referral-partner access is created.</span></div><p id="portalMessage" class="help-note" style="color:#b91c1c;min-height:20px"></p><button class="portal-btn primary ref-access-btn" id="unlockPortal" type="button">Access My Referral Dashboard →</button><div class="ref-unlock-note">Your token only opens the referral dashboard associated with that partner account.</div></div><div class="ref-join-cta"><div><strong>Want to join the Referral Program?</strong><p>Request partner access and start building your referral contribution.</p></div><button class="portal-btn" id="showJoin" type="button">✨ Join Referral Program</button></div><div id="joinBox" class="join-box" hidden><div class="portal-kicker">REQUEST TO JOIN</div><h2>Become a SoftGrowTech Referral Partner</h2><p>Submit your details. The SoftGrowTech team will review the request before creating your partner access.</p><form id="joinForm"><div class="form-grid"><div class="field"><label>Name</label><input id="joinName" required placeholder="Your full name"></div><div class="field"><label>Gmail</label><input id="joinEmail" type="email" required placeholder="name@gmail.com"></div><div class="field full"><label>WhatsApp Number</label><input id="joinPhone" required placeholder="Your WhatsApp number"></div></div><p id="joinMessage" class="help-note"></p><button class="portal-btn primary ref-access-btn" id="joinSubmit" type="button">Request to Join →</button></form></div></div></div>`;
document.getElementById('unlockPortal').onclick=()=>unlock(document.getElementById('portalToken').value);document.getElementById('portalToken').addEventListener('keydown',e=>{if(e.key==='Enter')unlock(e.target.value)});document.getElementById('showJoin').onclick=()=>{const b=document.getElementById('joinBox');b.hidden=!b.hidden;if(!b.hidden)b.scrollIntoView({behavior:'smooth',block:'center'})};document.getElementById('joinSubmit').onclick=submitJoinRequest}
async function unlock(raw){const token=String(raw||'').trim().toUpperCase(),msg=document.getElementById('portalMessage'),btn=document.getElementById('unlockPortal');if(!/^SGT-\d{8}$/.test(token)){msg.textContent='Please enter your 8-digit SGT token, for example SGT-12345678.';return}btn.disabled=true;btn.textContent='Verifying secure access…';const {data,error}=await sb.rpc('sgt_get_referral_portal',{p_token:token});if(error||!data||data.error){msg.textContent=error?.message||data?.error||'Invalid or inactive referral token.';btn.disabled=false;btn.textContent='Access My Referral Dashboard →';return}loadDashboard(data)}
function loadDashboard(data){const root=document.getElementById('referralRoot'),refs=Array.isArray(data.referrals)?data.referrals:[],n=Number(data.successful_registrations||0),b=badgeFor(n),next=nextBadge(n),progress=next?Math.min(100,Math.round(n/next.at*100)):100,referralLink=`${location.origin}/?invite=${encodeURIComponent(data.referral_code)}`;root.innerHTML=`<div class="ref-hero unlock-pop"><div class="ref-top"><div><div class="portal-kicker icon-inline">${icon('ambassador')} My Referral Portal</div><h1 style="margin:5px 0">Welcome, ${esc(data.name)}</h1><p style="margin:0;color:#64748b">Your official SoftGrowTech referral workspace.</p></div><div class="ref-badge">${b.icon} ${esc(b.title)}</div></div><div class="badge-spotlight badge-pop"><div class="badge-orb">${b.icon}</div><div><small>Achievement Badge</small><h2>${esc(b.title)}</h2><p>${esc(b.text)}</p></div></div><div class="ref-position" style="margin-top:18px"><div><small style="color:#64748b">Successful referrals</small><h2>${n} Successful Referrals</h2><p>Only valid, uniquely attributed registrations count toward successful referral progress. Removed or invalid registrations do not count.</p></div><div class="progress-box"><div class="progress-label"><span>Next badge</span><strong>${next?`${n} / ${next.at}`:'All badges unlocked'}</strong></div><div class="progress-track"><span style="width:${progress}%"></span></div><small>${next?`${next.at-n} more successful referral${next.at-n===1?'':'s'} to unlock ${next.title}`:'Keep building your impact.'}</small></div></div><div class="ref-stats"><div class="ref-stat"><small>Successful Referrals</small><strong>${n}</strong></div><div class="ref-stat"><small>Current Badge</small><strong style="font-size:20px">${b.icon} ${esc(b.title)}</strong></div><div class="ref-stat"><small>Referrals Tracked</small><strong>${refs.length}</strong></div></div></div><div class="ref-nav"><button class="active" data-ref-tab="overview">${icon('dashboard')} Overview</button><button data-ref-tab="referrals">${icon('users')} My Referrals</button><button data-ref-tab="more">${icon('megaphone')} Get More Referrals</button></div><section class="ref-view active" data-ref-view="overview"><div class="portal-card"><div class="portal-section-title"><div><h2>${icon('share')} Your Referral Link</h2><p>Share this official SoftGrowTech link with genuine students.</p></div></div><div class="ref-link"><input id="myReferralLink" value="${esc(referralLink)}" readonly><button class="portal-btn primary" id="copyReferral">${icon('copy')} Copy Link</button><button class="portal-btn secondary" id="shareReferral">${icon('share')} Share</button></div><div class="ref-rule"><strong>What counts as a successful referral?</strong><p>A successful referral is a valid, uniquely attributed registration that completes the required registration flow and remains valid under the program rules. Visits, incomplete registrations, duplicates and removed/expired registrations do not count.</p></div></div></section><section class="ref-view" data-ref-view="referrals"><div class="portal-card"><div class="portal-section-title"><div><h2>${icon('users')} Referral Tracking</h2><p>See the students who came through your referral link and their current status.</p></div></div><div class="ref-table"><table><thead><tr><th>Student</th><th>Registration</th><th>Payment</th><th>Selection</th><th>Referral Status</th><th>Date</th></tr></thead><tbody>${refs.map(r=>`<tr><td><strong>${esc(r.student_name||'Student')}</strong><br><small>${esc(r.student_id||'')}</small></td><td>${esc(r.registration_status||'Registered')}</td><td>${esc(r.payment_status||'—')}</td><td>${esc(r.selection_status||'—')}</td><td>${esc(r.referral_status||'Active')}</td><td>${r.created_at?new Date(r.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'}</td></tr>`).join('')||'<tr><td colspan="6">No referrals yet. Share your link to get started.</td></tr>'}</tbody></table></div></div></section><section class="ref-view" data-ref-view="more"><div class="portal-card"><div class="portal-section-title"><div><h2>${icon('megaphone')} Get More Referrals</h2><p>Keep sharing accurately and genuinely.</p></div></div><div class="ref-guide"><div class="ref-guide-item"><strong>${icon('linkedin')} LinkedIn</strong><p>Share the opportunity with relevant students and include your referral link.</p></div><div class="ref-guide-item"><strong>${icon('instagram')} Instagram</strong><p>Use a Story, Reel or post and share the official link.</p></div><div class="ref-guide-item"><strong>${icon('whatsapp')} WhatsApp</strong><p>Share personally with classmates, friends and juniors without spam.</p></div><div class="ref-guide-item"><strong>${icon('users')} College Network</strong><p>Reach genuine students who may benefit from the program.</p></div><div class="ref-guide-item"><strong>${icon('bulb')} Keep It Genuine</strong><p>Do not promise guaranteed selection, jobs or earnings and do not use fake accounts.</p></div></div><button class="portal-btn primary" id="copyGuideLink" style="margin-top:18px">${icon('copy')} Copy Referral Link</button></div></section>`;root.querySelectorAll('[data-ref-tab]').forEach(b=>b.onclick=()=>{root.querySelectorAll('[data-ref-tab]').forEach(x=>x.classList.remove('active'));root.querySelectorAll('[data-ref-view]').forEach(x=>x.classList.remove('active'));b.classList.add('active');root.querySelector(`[data-ref-view="${b.dataset.refTab}"]`)?.classList.add('active')});root.querySelector('#copyReferral').onclick=async()=>{try{await navigator.clipboard.writeText(referralLink);toast('Referral link copied.')}catch(_){toast('Copy failed.')}};root.querySelector('#copyGuideLink').onclick=async()=>{try{await navigator.clipboard.writeText(referralLink);toast('Referral link copied.')}catch(_){toast('Copy failed.')}};root.querySelector('#shareReferral').onclick=async()=>{if(navigator.share)try{await navigator.share({title:'SoftGrowTech Referral Program',text:'Join SoftGrowTech through my referral link:',url:referralLink})}catch(_){}else{try{await navigator.clipboard.writeText(referralLink);toast('Referral link copied.')}catch(_){}}}}
showLanding();
''')

# ---------- Admin referral management UI ----------
adminhtml=root/'management-console-x7.html'
s=adminhtml.read_text()
start=s.index('<section class="admin-view" id="view-ambassador">')
# locate next section after ambassador
end=s.index('<section class="admin-view" id="view-', start+20)
new='''<section class="admin-view" id="view-ambassador">
<div class="portal-section-title"><div><div class="portal-kicker icon-inline"><span data-sgt-icon="ambassador"></span>Referral Management</div><h2>Referral Management</h2><p>Manage referral partners, join requests and one-to-one referral attribution.</p></div><div class="admin-action-row"><button class="portal-btn secondary icon-btn" id="openReferralRequestsBtn"><span data-sgt-icon="notifications"></span> Referral Requests <span class="notification-badge" id="referralRequestBadge">0</span></button><button class="portal-btn primary icon-btn" id="createReferralBtn"><span data-sgt-icon="plus"></span>Create Referral</button></div></div>
<div class="metric-grid" id="referralMetrics"></div>
<div class="admin-card"><div class="portal-section-title"><div><h3>Referral Partners</h3><p>Click a partner to view the referrals attributed to that partner.</p></div></div><div class="admin-filter"><div class="field wide"><label>Search Referral Partner</label><input id="referralPartnerSearch" placeholder="Search by name, Gmail, phone or referral code"/></div></div><div class="table-scroll" style="margin-top:15px"><table class="admin-table"><thead><tr><th>Partner</th><th>Total Referrals</th><th>Successful</th><th>Active / Pending</th><th>Token</th><th>Status</th></tr></thead><tbody id="referralPartnerRows"></tbody></table></div></div>
<div class="drawer" hidden id="referralCreateModal"><div class="drawer-panel referral-modal-panel"><div class="drawer-head"><div><h2 id="referralCreateTitle">Create Referral Partner</h2><p class="help-note" style="margin:3px 0 0">Nothing is permanently saved until you press Save Referral.</p></div><button class="close-btn" id="cancelReferralCreate" type="button">Close</button></div><form class="form-grid" id="referralCreateForm"><div class="field"><label>Name</label><input id="referralName" placeholder="Referral partner name" required/></div><div class="field"><label>Gmail / Email</label><input id="referralEmail" placeholder="name@gmail.com" required type="email"/></div><div class="field full"><label>WhatsApp / Phone Number</label><input id="referralPhone" placeholder="WhatsApp number" required/></div></form><div class="admin-card" style="margin-top:16px;background:#f8fbff;border-color:#bfdbfe"><div class="portal-kicker">Generated Referral Access</div><div class="portal-meta" style="margin-top:10px"><div class="meta-box"><small>Partner</small><strong id="referralPreviewName">—</strong></div><div class="meta-box"><small>Referral Code</small><strong id="referralPreviewCode">Will generate on Create</strong></div></div><div class="field" style="margin-top:14px"><label>Referral Link</label><div class="admin-form-inline"><input id="referralPreviewLink" placeholder="Generated after Create" readonly/><button class="portal-btn secondary" disabled id="copyReferralPreview" type="button">Copy Link</button></div></div><div class="field" style="margin-top:14px"><label>Referral Token</label><div class="admin-form-inline"><input id="referralPreviewAccessNumber" placeholder="Generated after Create" readonly/><button class="portal-btn secondary" disabled id="copyReferralAccessNumber" type="button">Copy Token</button></div></div><div class="help-note" style="margin-top:10px">The public portal is <strong>https://www.softgrowtech.in/my-referral.html</strong>. The partner enters the generated token there to access the partner dashboard.</div></div><div class="admin-action-row" style="justify-content:flex-end"><button class="portal-btn secondary" id="cancelReferralCreateBottom" type="button">Cancel</button><button class="portal-btn secondary" id="generateReferralPreview" type="button">Create Referral</button><button class="portal-btn primary" id="saveReferralCreate" type="button" disabled>Save Referral</button></div></div></div>
<div class="drawer" hidden id="referralRequestsModal"><div class="drawer-panel referral-modal-panel"><div class="drawer-head"><div><h2>Referral Join Requests</h2><p class="help-note" style="margin:3px 0 0">Review requests and create partners directly from here.</p></div><button class="close-btn" id="closeReferralRequests" type="button">Close</button></div><div class="admin-action-row" style="margin-bottom:12px"><span class="pill" id="referralJoinRequestCount">0 pending</span></div><div class="table-scroll"><table class="admin-table"><thead><tr><th>Name</th><th>Gmail</th><th>WhatsApp</th><th>Requested</th><th>Status</th><th>Action</th></tr></thead><tbody id="referralJoinRequestRows"></tbody></table></div></div></div>
<div class="drawer" hidden id="referralPartnerDetailModal"><div class="drawer-panel referral-modal-panel"><div class="drawer-head"><div><h2 id="referralPartnerDetailTitle">Referral Partner</h2><p class="help-note" id="referralPartnerDetailMeta" style="margin:3px 0 0"></p></div><button class="close-btn" id="closeReferralPartnerDetail" type="button">Close</button></div><div id="referralPartnerDetailBody"></div></div></div>
</section>
'''
s=s[:start]+new+s[end:]
# add CSS to management page before </head>
css='''<style>.notification-badge{display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:#dc2626;color:#fff;font-size:11px;font-weight:900}.referral-modal-panel{max-width:900px;width:min(900px,calc(100vw - 32px));margin:auto}.referral-modal-panel .drawer-head h2{margin:0}.referral-clickable{cursor:pointer}.referral-clickable:hover{background:#f8fbff}.referral-status-removed{color:#b91c1c;font-weight:800}.referral-status-active{color:#15803d;font-weight:800}</style>'''
s=s.replace('</head>',css+'</head>',1)
adminhtml.write_text(s)

# ---------- Admin JS referral functions ----------
adminjs=root/'admin.js'; s=adminjs.read_text()
start=s.index('function ambassadorTier(')
end=s.index('async function renderAmbassadorSettings', start)
newjs=r'''function successfulCountFor(refId){return referralAttributions.filter(r=>r.referral_partner_id===refId&&r.referral_status==='Successful').length}
function referralStatusForStudent(st, attribution){
  if(!st) return {status:'Removed',successful:false,reason:'Student record unavailable / archived'};
  const now=Date.now();
  const reg=st.registration_date?new Date(st.registration_date).getTime():new Date(attribution.created_at||Date.now()).getTime();
  const assessmentDone=String(st.assessment_status||'')==='Complete';
  const payment=String(st.payment_status||'');
  const paymentDone=['Under Verification','Verified'].includes(payment);
  const selected=String(st.selection_status||'')==='Selected';
  const explicitClosed=['Closed','Archived'].includes(String(st.status||''));
  if(explicitClosed) return {status:'Removed',successful:false,reason:'Student record closed/archived'};
  if(!assessmentDone && now-reg>=3*86400000) return {status:'Removed',successful:false,reason:'Assessment not completed within 3 days'};
  const assessmentAt=st.assessment_completed_at?new Date(st.assessment_completed_at).getTime():(assessmentDone?reg:null);
  if(assessmentDone && !paymentDone && assessmentAt && now-assessmentAt>=7*86400000) return {status:'Removed',successful:false,reason:'Valid payment not completed within 7 days'};
  const successful=!!attribution && !explicitClosed;
  if(selected || payment==='Verified' || successful) return {status:'Successful',successful:true,reason:''};
  return {status:'Active',successful:false,reason:''};
}
async function loadReferralData(){
  const [p,a,j]=await Promise.all([
    adminSB.from('sgt_referral_partners').select('id,name,email,phone,referral_code,portal_access_code,active,created_at,updated_at').order('created_at',{ascending:false}),
    adminSB.from('sgt_referral_attributions').select('*').order('created_at',{ascending:false}),
    adminSB.from('sgt_referral_join_requests').select('*').order('created_at',{ascending:false})
  ]);
  if(p.error)throw p.error;if(a.error)throw a.error;if(j.error)throw j.error;
  referralPartners=p.data||[];referralAttributions=a.data||[];window.referralJoinRequests=j.data||[];
}
function referralStats(partnerId){
  const refs=referralAttributions.filter(r=>r.referral_partner_id===partnerId);
  let successful=0,active=0,removed=0;
  refs.forEach(r=>{const st=students.find(x=>x.id===r.referred_student_id);const rs=referralStatusForStudent(st,r);if(rs.successful)successful++;else if(rs.status==='Removed')removed++;else active++});
  return {total:refs.length,successful,active,removed};
}
function renderReferralMetrics(){
  const total=referralPartners.length, referrals=referralAttributions.length;
  let successful=0;referralPartners.forEach(p=>successful+=referralStats(p.id).successful);
  const pending=(window.referralJoinRequests||[]).filter(r=>r.status==='pending').length;
  document.getElementById('referralMetrics').innerHTML=[['Referral Partners',total,'Active partner accounts'],['Total Referrals',referrals,'Unique attributed registrations'],['Successful Referrals',successful,'Current valid successful referrals'],['Join Requests',pending,'Pending partner requests']].map(x=>`<div class="metric-card"><small>${x[0]}</small><strong>${x[1]}</strong><span>${x[2]}</span></div>`).join('');
  const badge=document.getElementById('referralRequestBadge');if(badge){badge.textContent=pending;badge.style.display=pending?'inline-grid':'none'}
}
function renderReferralJoinRequests(){
  const list=window.referralJoinRequests||[],pending=list.filter(r=>r.status==='pending');
  const count=document.getElementById('referralJoinRequestCount');if(count)count.textContent=`${pending.length} pending`;
  const body=document.getElementById('referralJoinRequestRows');if(!body)return;
  body.innerHTML=pending.map(r=>`<tr><td><strong>${ae(r.name)}</strong></td><td>${ae(r.email)}</td><td>${ae(r.phone)}</td><td>${r.created_at?new Date(r.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'}</td><td><span class="status warning">Pending</span></td><td><button class="portal-btn primary referral-request-create" data-id="${ae(r.id)}">Create Referral</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty">No pending referral join requests.</td></tr>';
  body.querySelectorAll('.referral-request-create').forEach(b=>b.onclick=()=>openReferralCreateFromRequest(b.dataset.id));
}
function renderReferralPartners(){
  const q=(document.getElementById('referralPartnerSearch')?.value||'').trim().toLowerCase();
  const rows=referralPartners.filter(p=>!q||[p.name,p.phone,p.email,p.referral_code].join(' ').toLowerCase().includes(q)).map(p=>{
    const s=referralStats(p.id);
    return `<tr class="referral-clickable" data-partner-id="${ae(p.id)}"><td><strong>${ae(p.name)}</strong><br><small>${ae(p.email)}</small><br><small>${ae(p.phone)}</small></td><td>${s.total}</td><td>${s.successful}</td><td>${s.active}</td><td><code>${ae(p.portal_access_code||'—')}</code></td><td><span class="status ${p.active?'success':'danger'}">${p.active?'Active':'Disabled'}</span></td></tr>`
  }).join('');
  document.getElementById('referralPartnerRows').innerHTML=rows||'<tr><td colspan="6" class="empty">No referral partners found.</td></tr>';
  document.querySelectorAll('.referral-clickable').forEach(r=>r.onclick=()=>openReferralPartnerDetail(r.dataset.partnerId));
}
function generateReferralToken(){const a=new Uint32Array(1);crypto.getRandomValues(a);return `SGT-${String(10000000+(a[0]%90000000))}`}
function generateReferralCode(){return 'SGT-REF-'+Array.from(crypto.getRandomValues(new Uint8Array(4)),b=>b.toString(16).padStart(2,'0')).join('').toUpperCase()}
function resetReferralPreview(){const card=document.getElementById('referralCreateModal');if(!card)return;card.dataset.requestId='';card.dataset.portalAccessCode='';card.dataset.referralCode='';document.getElementById('referralCreateForm')?.reset();document.getElementById('referralPreviewName').textContent='—';document.getElementById('referralPreviewCode').textContent='Will generate on Create';document.getElementById('referralPreviewLink').value='';document.getElementById('referralPreviewAccessNumber').value='';document.getElementById('saveReferralCreate').disabled=true;document.getElementById('copyReferralPreview').disabled=true;document.getElementById('copyReferralAccessNumber').disabled=true;}
function openReferralCreate(prefill={}){const m=document.getElementById('referralCreateModal');if(!m)return;resetReferralPreview();m.hidden=false;m.classList.add('open');m.dataset.requestId=prefill.requestId||'';document.getElementById('referralName').value=prefill.name||'';document.getElementById('referralEmail').value=prefill.email||'';document.getElementById('referralPhone').value=prefill.phone||'';document.getElementById('referralPreviewName').textContent=prefill.name||'—';document.getElementById('generateReferralPreview').disabled=false;}
function openReferralCreateFromRequest(id){const r=(window.referralJoinRequests||[]).find(x=>x.id===id);if(r){document.getElementById('referralRequestsModal').hidden=true;document.getElementById('referralRequestsModal').classList.remove('open');openReferralCreate({requestId:r.id,name:r.name,email:r.email,phone:r.phone})}}
function closeReferralCreate(){const m=document.getElementById('referralCreateModal');if(m){m.hidden=true;m.classList.remove('open');resetReferralPreview()}}
function generateReferralPreview(){const name=document.getElementById('referralName').value.trim(),email=document.getElementById('referralEmail').value.trim(),phone=document.getElementById('referralPhone').value.trim(),m=document.getElementById('referralCreateModal');if(!name||!email||!phone)return toast('Enter name, Gmail and WhatsApp number first.');const code=generateReferralCode(),token=generateReferralToken();document.getElementById('referralPreviewName').textContent=name;document.getElementById('referralPreviewCode').textContent=code;document.getElementById('referralPreviewLink').value=`${location.origin}/?invite=${encodeURIComponent(code)}`;document.getElementById('referralPreviewAccessNumber').value=token;m.dataset.portalAccessCode=token;m.dataset.referralCode=code;document.getElementById('copyReferralPreview').disabled=false;document.getElementById('copyReferralAccessNumber').disabled=false;document.getElementById('saveReferralCreate').disabled=false;document.getElementById('generateReferralPreview').disabled=true}
async function saveReferralCreate(){
  if(!can(admin,'ambassador.edit'))return toast('No permission.');
  const name=document.getElementById('referralName').value.trim(),email=document.getElementById('referralEmail').value.trim().toLowerCase(),phone=document.getElementById('referralPhone').value.trim(),m=document.getElementById('referralCreateModal'),token=m?.dataset.portalAccessCode||'',requestId=m?.dataset.requestId||'';
  if(!name||!email||!phone)return toast('Enter name, Gmail and phone number.');
  if(!/^SGT-\d{8}$/.test(token))return toast('Click Create Referral first to generate the link and token.');
  const ins=await adminSB.rpc('sgt_admin_create_referral_partner',{p_name:name,p_email:email,p_phone:phone,p_portal_token:token});
  if(ins.error)return toast(ins.error.message);
  if(requestId){const {error}=await adminSB.from('sgt_referral_join_requests').update({status:'created',partner_id:ins.data.id,updated_at:new Date().toISOString()}).eq('id',requestId).eq('status','pending');if(error)return toast(error.message)}
  await log('Created referral partner','referral_partner',ins.data.id,{name,email,phone,referral_code:ins.data.referral_code});
  toast('Referral partner saved. Referral link and token are ready.');closeReferralCreate();await renderReferralManagement();
}
function openReferralRequests(){const m=document.getElementById('referralRequestsModal');if(!m)return;m.hidden=false;m.classList.add('open');renderReferralJoinRequests()}
function closeReferralRequests(){const m=document.getElementById('referralRequestsModal');if(m){m.hidden=true;m.classList.remove('open')}}
function openReferralPartnerDetail(id){const p=referralPartners.find(x=>x.id===id);if(!p)return;const refs=referralAttributions.filter(r=>r.referral_partner_id===id);const s=referralStats(id),m=document.getElementById('referralPartnerDetailModal');document.getElementById('referralPartnerDetailTitle').textContent=p.name;document.getElementById('referralPartnerDetailMeta').textContent=`${p.email} • ${p.phone} • ${p.active?'Active':'Disabled'}`;document.getElementById('referralPartnerDetailBody').innerHTML=`<div class="portal-meta"><div class="meta-box"><small>Total Referrals</small><strong>${s.total}</strong></div><div class="meta-box"><small>Successful</small><strong>${s.successful}</strong></div><div class="meta-box"><small>Active / Pending</small><strong>${s.active}</strong></div><div class="meta-box"><small>Removed</small><strong>${s.removed}</strong></div></div><div class="admin-card" style="margin-top:16px"><h3>Referral Link & Access</h3><p><strong>Referral Link:</strong> ${ae(location.origin)}/?invite=${encodeURIComponent(p.referral_code)}</p><p><strong>Portal:</strong> https://www.softgrowtech.in/my-referral.html</p><p><strong>Token:</strong> <code>${ae(p.portal_access_code||'—')}</code></p></div><div class="admin-card"><h3>Referred Students</h3><div class="table-scroll"><table class="admin-table"><thead><tr><th>Student</th><th>Registration</th><th>Payment</th><th>Selection</th><th>Referral Status</th><th>Reason</th></tr></thead><tbody>${refs.map(r=>{const st=students.find(x=>x.id===r.referred_student_id),rs=referralStatusForStudent(st,r);return `<tr><td><strong>${ae(st?.name||r.referred_student_id)}</strong><br><small>${ae(st?.student_id||'')}</small></td><td>${ae(st?.status||'Registered')}</td><td>${ae(st?.payment_status||'—')}</td><td>${ae(st?.selection_status||'—')}</td><td class="${rs.status==='Removed'?'referral-status-removed':'referral-status-active'}">${ae(rs.status)}</td><td>${ae(rs.reason||'—')}</td></tr>`}).join('')||'<tr><td colspan="6" class="empty">No referrals yet.</td></tr>'}</tbody></table></div></div>`;m.hidden=false;m.classList.add('open')}
function closeReferralPartnerDetail(){const m=document.getElementById('referralPartnerDetailModal');if(m){m.hidden=true;m.classList.remove('open')}}
async function renderReferralManagement(){try{await loadReferralData();renderReferralMetrics();renderReferralJoinRequests();renderReferralPartners()}catch(e){const er=document.querySelector('.admin-error');if(er)er.textContent=e.message;console.error(e)}}
async function renderAmbassador(){await renderReferralManagement()}
'''
s=s[:start]+newjs+s[end:]
# Wire new event listeners in initAdmin by replacing referral listener chunk.
old="document.getElementById('referralPartnerSearch')?.addEventListener('input',renderReferralPartners);document.getElementById('createReferralBtn')?.addEventListener('click',()=>openReferralCreate());document.getElementById('cancelReferralCreate')?.addEventListener('click',closeReferralCreate);document.getElementById('saveReferralCreate')?.addEventListener('click',saveReferralCreate);document.getElementById('copyReferralPreview')?.addEventListener('click',async()=>{const v=document.getElementById('referralPreviewLink')?.value||'';if(!v)return;try{await navigator.clipboard.writeText(v);toast('Referral link copied.')}catch(_){toast('Copy failed.')}});document.getElementById('copyReferralPortalPage')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(`${location.origin}/my-referral.html`);toast('Referral portal page copied.')}catch(_){toast('Copy failed.')}});document.getElementById('copyReferralAccessNumber')?.addEventListener('click',async()=>{const v=document.getElementById('referralPreviewAccessNumber')?.value||'';try{await navigator.clipboard.writeText(v);toast('Referral token copied.')}catch(_){toast('Copy failed.')}});document.getElementById('referralName')?.addEventListener('input',e=>{const n=document.getElementById('referralPreviewName');if(n)n.textContent=e.target.value.trim()||'—'});"
new="document.getElementById('referralPartnerSearch')?.addEventListener('input',renderReferralPartners);document.getElementById('createReferralBtn')?.addEventListener('click',()=>openReferralCreate());document.getElementById('openReferralRequestsBtn')?.addEventListener('click',openReferralRequests);document.getElementById('closeReferralRequests')?.addEventListener('click',closeReferralRequests);document.getElementById('cancelReferralCreate')?.addEventListener('click',closeReferralCreate);document.getElementById('cancelReferralCreateBottom')?.addEventListener('click',closeReferralCreate);document.getElementById('generateReferralPreview')?.addEventListener('click',generateReferralPreview);document.getElementById('saveReferralCreate')?.addEventListener('click',saveReferralCreate);document.getElementById('copyReferralPreview')?.addEventListener('click',async()=>{const v=document.getElementById('referralPreviewLink')?.value||'';if(!v)return;try{await navigator.clipboard.writeText(v);toast('Referral link copied.')}catch(_){toast('Copy failed.')}});document.getElementById('copyReferralAccessNumber')?.addEventListener('click',async()=>{const v=document.getElementById('referralPreviewAccessNumber')?.value||'';try{await navigator.clipboard.writeText(v);toast('Referral token copied.')}catch(_){toast('Copy failed.')}});document.getElementById('referralName')?.addEventListener('input',e=>{const n=document.getElementById('referralPreviewName');if(n)n.textContent=e.target.value.trim()||'—'});document.getElementById('closeReferralPartnerDetail')?.addEventListener('click',closeReferralPartnerDetail);"
if old not in s: print('listener old not found')
else: s=s.replace(old,new)
adminjs.write_text(s)

# ---------- Fee copy improvements ----------
repls={
'index.html':[
('Registration is free. The one-time Enrollment Fee is introduced only at the enrollment stage to support assessment participation and the related processing, participant verification, records/documentation and enrollment coordination. It is not a fee for the internship, certificate or selection. Selection is based on assessment performance and review. If you are not selected, the applicable Enrollment Fee is refundable under the stated refund process and terms.','Registration is completely free. A **nominal, one-time Enrollment Fee** is introduced only at the enrollment stage to support assessment participation and the related processing, participant verification, records/documentation and enrollment coordination. It is **not a fee for the internship, certificate or selection**. Selection is based on assessment performance and review. **IF YOU ARE NOT SELECTED, THE APPLICABLE ENROLLMENT FEE IS REFUNDABLE** under the stated refund process and terms.')],
'internships.html':[
('Registration is free. At the enrollment stage, a one-time Enrollment Fee is collected for assessment participation and the related processing, participant verification, records/documentation and enrollment coordination. It is not a charge for the internship, certificate or selection. If you are not selected, the applicable fee is refundable under the stated refund process and terms.','Registration is completely free. At the enrollment stage, a **nominal, one-time Enrollment Fee** is collected for assessment participation and related processing, participant verification, records/documentation and enrollment coordination. It is **not a charge for the internship, certificate or selection**. **IF YOU ARE NOT SELECTED, THE APPLICABLE ENROLLMENT FEE IS REFUNDABLE** under the stated refund process and terms.'),
('The Enrollment Fee appears only at the enrollment stage; there is no fee to submit the initial registration, and the fee is not a charge for the internship or certificate.','The **nominal Enrollment Fee** appears only at the enrollment stage; there is no fee to submit the initial registration. It supports the assessment/enrollment process and related verification, records and coordination; it is **not a charge for the internship or certificate**.')],
'how-it-works.html':[
('Registration is free.</strong> At the enrollment stage, the one-time Enrollment Fee supports assessment participation and the related processing, participant verification, records/documentation and enrollment coordination. It is not a fee for the internship, certificate or selection.','Registration is free.</strong> At the enrollment stage, a <strong>nominal, one-time Enrollment Fee</strong> supports assessment participation and related processing, participant verification, records/documentation and enrollment coordination. It is <strong>not a fee for the internship, certificate or selection</strong>.'),
('Selection remains assessment-based.</strong> If a candidate is not selected, the applicable Enrollment Fee is refundable under the stated refund process and terms.','Selection remains assessment-based.</strong> <strong>IF A CANDIDATE IS NOT SELECTED, THE APPLICABLE ENROLLMENT FEE IS REFUNDABLE</strong> under the stated refund process and terms.')],
'apply.html':[
('Registration is free. At the enrollment stage, the one-time Enrollment Fee supports assessment participation and related processing, participant verification, records/documentation and enrollment coordination. It is not a fee for the internship, certificate or selection. If you are not selected, the applicable Enrollment Fee is refundable under the stated refund process and terms.','Registration is completely free. At the enrollment stage, a **nominal, one-time Enrollment Fee** supports assessment participation and related processing, participant verification, records/documentation and enrollment coordination. It is **not a fee for the internship, certificate or selection**. **IF YOU ARE NOT SELECTED, THE APPLICABLE ENROLLMENT FEE IS REFUNDABLE** under the stated refund process and terms.')],
}
# HTML doesn't render markdown; convert ** wrappers to strong for apply/index/internships/how-it-works.
for fn,pairs in repls.items():
    p=root/fn; t=p.read_text()
    for a,b in pairs:t=t.replace(a,b)
    t=t.replace('**nominal, one-time Enrollment Fee**','<strong>nominal, one-time Enrollment Fee</strong>').replace('**not a fee for the internship, certificate or selection**','<strong>not a fee for the internship, certificate or selection</strong>').replace('**IF YOU ARE NOT SELECTED, THE APPLICABLE ENROLLMENT FEE IS REFUNDABLE**','<strong>IF YOU ARE NOT SELECTED, THE APPLICABLE ENROLLMENT FEE IS REFUNDABLE</strong>')
    p.write_text(t)

# Domain pages
for fn in ['web-development.html','artificial-intelligence.html','data-analysis.html']:
    p=root/fn;t=p.read_text()
    t=t.replace('Enrollment Fee — When You Move Forward','Nominal Enrollment Fee — When You Move Forward')
    t=t.replace('Registration is completely free. At the enrollment stage, the applicable <strong>Enrollment Fee</strong> is shown clearly before payment.','Registration is completely free. At the enrollment stage, the applicable <strong>nominal Enrollment Fee</strong> is shown clearly before payment.')
    t=t.replace('It is not a fee for the internship, certificate or selection.</p>','It is <strong>not a fee for the internship, certificate or selection</strong>.</p>')
    t=t.replace('If you are not selected, the applicable Enrollment Fee is refundable under the Program Fee Policy and stated refund terms.','<strong>IF YOU ARE NOT SELECTED, THE APPLICABLE ENROLLMENT FEE IS REFUNDABLE</strong> under the Program Fee Policy and stated refund terms.')
    p.write_text(t)

# Policy strengthen wording
p=root/'internship-fee-policy.html';t=p.read_text()
t=t.replace('A transparent guide to the Enrollment Fee, when it appears and how the refund process works.','A clear guide to the nominal Enrollment Fee, why it applies, when it appears and how the refund process works.')
t=t.replace('The <strong>Enrollment Fee</strong> becomes applicable only','The <strong>nominal, one-time Enrollment Fee</strong> becomes applicable only')
t=t.replace('<div class="refund-box"><strong>Refund for Non-Selection:</strong>','<div class="refund-box"><strong>NOT SELECTED? REFUND APPLIES:</strong> If the participant is not selected, the applicable Enrollment Fee is refundable under the stated refund process and terms. The refund is initiated after the selection decision and is processed within <strong>3 working days</strong>, subject to payment verification and the applicable program terms.</div><div class="refund-box"><strong>Refund for Non-Selection:</strong>')
# fix accidental duplicate paragraph from above by collapsing old content section
old='''<div class="refund-box"><strong>NOT SELECTED? REFUND APPLIES:</strong> If the participant is not selected, the applicable Enrollment Fee is refundable under the stated refund process and terms. The refund is initiated after the selection decision and is processed within <strong>3 working days</strong>, subject to payment verification and the applicable program terms.</div><div class="refund-box"><strong>Refund for Non-Selection:</strong> If the participant is not selected, the applicable Enrollment Fee is refundable under the stated refund process and terms. The refund is initiated after the selection decision and is processed within <strong>3 working days</strong>, subject to payment verification and the applicable program terms.</div>'''
new='<div class="refund-box"><strong>NOT SELECTED? REFUND APPLIES:</strong> If the participant is not selected, the applicable Enrollment Fee is refundable under the stated refund process and terms. The refund is initiated after the selection decision and is processed within <strong>3 working days</strong>, subject to payment verification and the applicable program terms.</div>'
t=t.replace(old,new)
p.write_text(t)

# Portal payment/assessment wording and labels
p=root/'portal.js';t=p.read_text()
t=t.replace('Your enrollment fee payment was rejected.','Your nominal Enrollment Fee payment was rejected.')
t=t.replace('Complete Enrollment Fee →','Complete Nominal Enrollment Fee →')
t=t.replace('<small>Enroll Fee</small>','<small>Enrollment Fee</small>')
t=t.replace('The one-time Enrollment Fee is required at the enrollment stage','The nominal, one-time Enrollment Fee is required at the enrollment stage')
t=t.replace('<h1>Enrollment Fee & Payment</h1><p>Complete the one-time Enrollment Fee payment','<h1>Nominal Enrollment Fee &amp; Payment</h1><p>Complete the one-time nominal Enrollment Fee payment')
t=t.replace('Why this fee is required','Why the nominal Enrollment Fee applies')
t=t.replace('If you are not selected, the applicable Enrollment Fee is refundable under the stated refund process and terms.','<strong>IF YOU ARE NOT SELECTED, THE APPLICABLE ENROLLMENT FEE IS REFUNDABLE</strong> under the stated refund process and terms.')
p.write_text(t)

# Update setup/update docs to explain removal and badges; actual SQL appended below.

# ---------- New SQL: referral lifecycle/removal + robust portal RPC ----------
sql=root/'V22.9.4-REFERRAL-LIFECYCLE-AND-FINAL-FLOW.sql'
sql.write_text(r'''-- SoftGrowTech V22.9.4 — Final Referral Lifecycle + Removal Status
-- Run AFTER V22.9.3-REFERRAL-PUBLIC-PORTAL-AND-JOIN-REQUESTS.sql.
-- This does not create duplicate student records. Referral attribution remains one-to-one.
begin;

alter table public.sgt_referral_attributions add column if not exists referral_status text not null default 'Active' check (referral_status in ('Active','Successful','Removed'));
alter table public.sgt_referral_attributions add column if not exists removal_reason text;
alter table public.sgt_referral_attributions add column if not exists removed_at timestamptz;
alter table public.sgt_referral_attributions add column if not exists attempt_key text;
create index if not exists idx_sgt_referral_attr_status on public.sgt_referral_attributions(referral_partner_id,referral_status,created_at desc);

-- Re-evaluate the referral status from the single existing student record.
-- Rule: assessment must be completed within 3 days of registration.
-- Rule: after assessment completion, a valid payment must be present within 7 days.
-- Removed history is retained and visible to Admin/partner.
create or replace function public.sgt_refresh_referral_lifecycle()
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare r record; changed integer:=0; reg_at timestamptz; assess_at timestamptz; new_status text; reason text;
begin
  for r in
    select a.id,a.referral_status,a.removal_reason,a.removed_at,
           p.registration_date,p.assessment_status,p.assessment_completed_at,p.payment_status,p.status
    from public.sgt_referral_attributions a
    left join public.sgt_profiles p on p.id=a.referred_student_id
  loop
    reg_at := coalesce(r.registration_date, now());
    new_status := 'Active'; reason := null;
    if r.status in ('Closed','Archived') then
      new_status := 'Removed'; reason := 'Student record closed or archived';
    elsif r.assessment_status is distinct from 'Complete' and now() >= reg_at + interval '3 days' then
      new_status := 'Removed'; reason := 'Assessment not completed within 3 days';
    elsif r.assessment_status = 'Complete' and coalesce(r.payment_status,'') not in ('Under Verification','Verified') then
      assess_at := coalesce(r.assessment_completed_at, reg_at);
      if now() >= assess_at + interval '7 days' then
        new_status := 'Removed'; reason := 'Valid payment not completed within 7 days';
      end if;
    else
      -- A valid completed registration with a live attribution is successful for referral tracking.
      new_status := 'Successful';
    end if;
    if r.referral_status is distinct from new_status or coalesce(r.removal_reason,'') is distinct from coalesce(reason,'') then
      update public.sgt_referral_attributions
         set referral_status=new_status, removal_reason=reason, removed_at=case when new_status='Removed' then coalesce(removed_at,now()) else null end
       where id=r.id;
      changed:=changed+1;
    end if;
  end loop;
  return changed;
end;
$$;
grant execute on function public.sgt_refresh_referral_lifecycle() to authenticated;

-- Public portal returns lifecycle status, including Removed history.
create or replace function public.sgt_get_referral_portal(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare r jsonb;
begin
  perform public.sgt_refresh_referral_lifecycle();
  select jsonb_build_object(
    'id',rp.id,'name',rp.name,'referral_code',rp.referral_code,'active',rp.active,
    'total_registrations',(select count(*) from public.sgt_referral_attributions a where a.referral_partner_id=rp.id),
    'successful_registrations',(select count(*) from public.sgt_referral_attributions a where a.referral_partner_id=rp.id and a.referral_status='Successful'),
    'pending_registrations',(select count(*) from public.sgt_referral_attributions a where a.referral_partner_id=rp.id and a.referral_status='Active'),
    'referrals',coalesce((select jsonb_agg(jsonb_build_object(
      'student_name',coalesce(s.name,'Student'),'student_id',coalesce(s.student_id,''),
      'registration_status',coalesce(s.status,'Registered'),'payment_status',coalesce(s.payment_status,'—'),
      'selection_status',coalesce(s.selection_status,'—'),'referral_status',a.referral_status,
      'removal_reason',coalesce(a.removal_reason,''),'created_at',a.created_at
    ) order by a.created_at desc) from public.sgt_referral_attributions a left join public.sgt_profiles s on s.id=a.referred_student_id where a.referral_partner_id=rp.id),'[]'::jsonb)
  ) into r
  from public.sgt_referral_partners rp
  where upper(trim(coalesce(rp.portal_access_code,'')))=upper(trim(coalesce(p_token,''))) and rp.active=true
  limit 1;
  if r is null then return jsonb_build_object('error','Invalid or inactive referral token.'); end if;
  return r;
end;
$$;
grant execute on function public.sgt_get_referral_portal(text) to anon, authenticated;

commit;
''')

# Update existing referral SQL doc with final flow notes (without changing old executable code)
flow=root/'V22.9.3-REFERRAL-FLOW-UPDATE.txt'
flow.write_text('''SoftGrowTech Final Referral Flow

- Public portal: https://www.softgrowtech.in/my-referral.html
- No token is embedded in the portal URL.
- Admin Create Referral opens a separate modal/screen. Enter Name, Gmail and WhatsApp/Phone. Create Referral generates the link/code/token; Cancel discards the draft; Save writes the partner to the database.
- Join Referral Program requests are shown only inside a separate Referral Requests view. Pending requests display a notification badge count.
- Admin can open a pending request and create the referral partner from that request without retyping the applicant details.
- Partner list shows total, successful and active/pending referrals. Clicking a partner opens that partner's referral detail view.
- Referral attribution remains one-to-one and first-touch: the student record is not duplicated and the referral partner mapping is not moved to another partner.
- Successful referral progress is cumulative. Badges are recognition only: 1, 3, 5, 10 and 20 successful referrals. Reward amounts/tier payouts are not hard-coded.
- Lifecycle rule: assessment not completed within 3 days -> referral marked Removed; after assessment completion, valid payment not completed within 7 days -> referral marked Removed. Removed history is retained and shown to Admin and the partner; it is not counted as successful.
- Future direct registration does not revive or count an old removed referral. A future registration that is explicitly started through a referral link is attributed through the normal first-touch referral flow without creating duplicate student records.
- Existing non-referral website flows are intentionally unchanged.
''')

# Basic JS syntax checks using node if available
