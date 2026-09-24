from pathlib import Path
p=Path('/tmp/sgt')

# 1) Admin HTML referral section
f=p/'management-console-x7.html'; s=f.read_text()
s=s.replace('Create and manage private referral partners without creating duplicate student records.','Create and manage referral partners, join requests and referral attribution without creating duplicate student records.')
old='''<div class="field" style="margin-top:14px"><label>Private My Referral Portal</label><div class="admin-form-inline"><input id="referralPreviewPortalLink" placeholder="Private portal access link" readonly=""><button class="portal-btn secondary" id="copyReferralPortalPreview" disabled="" type="button">Copy Portal</button></div></div>\n<div class="field" style="margin-top:14px"><label>Private Portal Token</label><div class="admin-form-inline"><input id="referralPreviewAccessNumber" placeholder="SGT-12345678" readonly=""><button class="portal-btn secondary" id="copyReferralAccessNumber" disabled="" type="button">Copy Token</button></div><p class="help-note">The partner enters this unique SGT token on the private portal page. Keep it private.</p></div>\n<p class="help-note" style="margin-top:10px">The referral link is public for student registration. The My Referral Portal link uses a separate private access token and the token number is a second verification step.</p>'''
new='''<div class="field" style="margin-top:14px"><label>My Referral Portal</label><div class="admin-form-inline"><input value="https://www.softgrowtech.in/my-referral.html" readonly=""><button class="portal-btn secondary" id="copyReferralPortalPage" type="button">Copy Portal</button></div></div>\n<div class="field" style="margin-top:14px"><label>Referral Token</label><div class="admin-form-inline"><input id="referralPreviewAccessNumber" placeholder="SGT-12345678" readonly=""><button class="portal-btn secondary" id="copyReferralAccessNumber" disabled="" type="button">Copy Token</button></div><p class="help-note">The partner opens My Referral Portal and enters this token to access their dashboard.</p></div>\n<p class="help-note" style="margin-top:10px">The referral link is used by students for registration. The My Referral Portal page is public; the token identifies the referral partner and unlocks only that partner's dashboard.</p>'''
if old not in s: print('old admin preview block not found')
s=s.replace(old,new)
# Insert join requests card before partners card
needle='''<div class="admin-card">\n<div class="admin-filter"><div class="field wide"><label>Search Referral Partner</label>'''
insert='''<div class="admin-card" style="border-color:#bfdbfe;background:linear-gradient(180deg,#f8fbff,#fff)">\n<div class="portal-section-title"><div><div class="portal-kicker">Join Requests</div><h3>Referral Program Requests</h3><p>People who requested to join the Referral Program appear here. Nothing becomes a referral partner until you create and save the partner.</p></div><span class="pill" id="referralJoinRequestCount">0 pending</span></div>\n<div class="table-scroll"><table class="admin-table"><thead><tr><th>Name</th><th>Gmail</th><th>WhatsApp</th><th>Requested</th><th>Status</th><th>Action</th></tr></thead><tbody id="referralJoinRequestRows"></tbody></table></div>\n</div>\n<div class="admin-card">\n<div class="admin-filter"><div class="field wide"><label>Search Referral Partner</label>'''
if needle not in s: print('needle join not found')
s=s.replace(needle,insert,1)
# replace partner table headers add token/link
s=s.replace('<thead><tr><th>Name</th><th>Total Registration</th><th>Successful</th><th>Pending</th><th>Status</th><th>Action</th></tr></thead><tbody id="referralPartnerRows"></tbody>', '<thead><tr><th>Name</th><th>Total Registration</th><th>Successful</th><th>Pending</th><th>Token</th><th>Status</th><th>Action</th></tr></thead><tbody id="referralPartnerRows"></tbody>',1)
f.write_text(s)

# 2) Admin JS replace referral block
f=p/'admin.js'; s=f.read_text()
start=s.index('async function loadReferralData()')
end=s.index('async function renderAmbassadorSettings()', start)
newjs=r'''async function loadReferralData(){
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
  const total=refs.length; const successful=refs.length;
  return {total,successful,pending:0};
}
function renderReferralMetrics(){
  const total=referralPartners.length;
  const referrals=referralAttributions.length;
  const pending=(window.referralJoinRequests||[]).filter(r=>r.status==='pending').length;
  document.getElementById('referralMetrics').innerHTML=[['Referral Partners',total],['Successful Referrals',referrals],['Join Requests',pending]].map(x=>`<div class="metric-card"><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join('');
}
function renderReferralJoinRequests(){
  const list=window.referralJoinRequests||[]; const pending=list.filter(r=>r.status==='pending');
  const count=document.getElementById('referralJoinRequestCount');if(count)count.textContent=`${pending.length} pending`;
  const body=document.getElementById('referralJoinRequestRows');if(!body)return;
  body.innerHTML=list.map(r=>`<tr><td><strong>${ae(r.name)}</strong></td><td>${ae(r.email)}</td><td>${ae(r.phone)}</td><td>${r.created_at?new Date(r.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'}</td><td><span class="status ${r.status==='pending'?'warning':r.status==='created'?'success':'danger'}">${ae(r.status||'pending')}</span></td><td>${r.status==='pending'?`<button class="portal-btn primary referral-request-create" data-id="${ae(r.id)}">Create Referral</button>`:'<span class="help-note">Completed</span>'}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">No referral join requests.</td></tr>';
  body.querySelectorAll('.referral-request-create').forEach(b=>b.onclick=()=>openReferralCreateFromRequest(b.dataset.id));
}
function renderReferralPartners(){
  const q=(document.getElementById('referralPartnerSearch')?.value||'').trim().toLowerCase();
  const rows=referralPartners.filter(p=>!q||[p.name,p.phone,p.email,p.referral_code].join(' ').toLowerCase().includes(q)).map(p=>{
    const s=referralStats(p.id);
    return `<tr><td><strong>${ae(p.name)}</strong><br><small>${ae(p.email)}</small><br><small>${ae(p.phone)}</small></td><td>${s.total}</td><td>${s.successful}</td><td>${s.pending}</td><td><code>${ae(p.portal_access_code||'—')}</code></td><td><span class="status ${p.active?'success':'danger'}">${p.active?'Active':'Disabled'}</span></td><td><button class="portal-btn secondary referral-link-copy" data-code="${ae(p.referral_code)}">Copy Link</button> <button class="portal-btn secondary referral-token-copy" data-token="${ae(p.portal_access_code||'')}">Copy Token</button> <button class="portal-btn ${p.active?'danger':'primary'} referral-toggle" data-id="${ae(p.id)}" data-active="${p.active?'1':'0'}">${p.active?'Disable':'Enable'}</button></td></tr>`
  }).join('');
  document.getElementById('referralPartnerRows').innerHTML=rows||'<tr><td colspan="7" class="empty">No referral partners found.</td></tr>';
  document.querySelectorAll('.referral-link-copy').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(`${location.origin}/?invite=${encodeURIComponent(b.dataset.code)}`);toast('Referral link copied.')}catch(_){toast('Copy failed.')}});
  document.querySelectorAll('.referral-token-copy').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.token||'');toast('Referral token copied.')}catch(_){toast('Copy failed.')}});
  document.querySelectorAll('.referral-toggle').forEach(b=>b.onclick=async()=>{
    if(!can(admin,'ambassador.edit'))return toast('No permission.');
    const active=b.dataset.active!=='1'; const {error}=await adminSB.from('sgt_referral_partners').update({active,updated_at:new Date().toISOString()}).eq('id',b.dataset.id);
    if(error)return toast(error.message); await log(active?'Enabled referral partner':'Disabled referral partner','referral_partner',b.dataset.id,{active}); toast(active?'Referral partner enabled.':'Referral partner disabled.'); await renderReferralManagement();
  });
}
function generateReferralToken(){const a=new Uint32Array(1);crypto.getRandomValues(a);return `SGT-${String(10000000+(a[0]%90000000))}`}
function generateReferralCode(){return 'SGT-REF-'+Array.from(crypto.getRandomValues(new Uint8Array(4)),b=>b.toString(16).padStart(2,'0')).join('').toUpperCase()}
function openReferralCreate(prefill={}){
  const card=document.getElementById('referralCreateCard');if(!card)return;
  card.hidden=false;card.dataset.requestId=prefill.requestId||'';
  const code=generateReferralCode(),token=generateReferralToken();
  document.getElementById('referralCreateForm').reset();
  document.getElementById('referralName').value=prefill.name||'';document.getElementById('referralEmail').value=prefill.email||'';document.getElementById('referralPhone').value=prefill.phone||'';
  document.getElementById('referralPreviewName').textContent=prefill.name||'—';document.getElementById('referralPreviewCode').textContent=code;
  document.getElementById('referralPreviewLink').value=`${location.origin}/?invite=${encodeURIComponent(code)}`;
  document.getElementById('referralPreviewAccessNumber').value=token;
  card.dataset.portalAccessCode=token;card.dataset.referralCode=code;
  const c=document.getElementById('copyReferralPreview');if(c)c.disabled=false;const ca=document.getElementById('copyReferralAccessNumber');if(ca)ca.disabled=false;
  card.scrollIntoView({behavior:'smooth',block:'start'});
}
function openReferralCreateFromRequest(id){const r=(window.referralJoinRequests||[]).find(x=>x.id===id);if(r)openReferralCreate({requestId:r.id,name:r.name,email:r.email,phone:r.phone})}
function closeReferralCreate(){const card=document.getElementById('referralCreateCard');if(card){delete card.dataset.portalAccessCode;delete card.dataset.referralCode;delete card.dataset.requestId;card.hidden=true;}document.getElementById('referralCreateForm')?.reset();}
async function saveReferralCreate(){
  if(!can(admin,'ambassador.edit'))return toast('No permission.');
  const name=document.getElementById('referralName').value.trim(),email=document.getElementById('referralEmail').value.trim().toLowerCase(),phone=document.getElementById('referralPhone').value.trim(),card=document.getElementById('referralCreateCard'),token=card?.dataset.portalAccessCode||'',requestId=card?.dataset.requestId||'';
  if(!name||!email||!phone)return toast('Enter name, Gmail and phone number.');
  if(!/^SGT-\d{8}$/.test(token))return toast('Referral token is missing. Please reopen Create Referral.');
  const ins=await adminSB.rpc('sgt_admin_create_referral_partner',{p_name:name,p_email:email,p_phone:phone,p_portal_token:token});
  if(ins.error)return toast(ins.error.message);
  if(requestId){const {error}=await adminSB.from('sgt_referral_join_requests').update({status:'created',partner_id:ins.data.id,updated_at:new Date().toISOString()}).eq('id',requestId).eq('status','pending');if(error)return toast(error.message)}
  await log('Created referral partner','referral_partner',ins.data.id,{name,email,phone,referral_code:ins.data.referral_code});
  toast('Referral partner saved. Referral link and token are ready.');
  closeReferralCreate();await renderReferralManagement();
}
async function renderReferralManagement(){try{await loadReferralData();renderReferralMetrics();renderReferralJoinRequests();renderReferralPartners()}catch(e){const er=document.querySelector('.admin-error');if(er)er.textContent=e.message;console.error(e)}}
async function renderAmbassador(){await renderReferralManagement()}
'''
s=s[:start]+newjs+s[end:]
# event bindings replacement for referral old IDs
s=s.replace("document.getElementById('createReferralBtn')?.addEventListener('click',openReferralCreate);document.getElementById('cancelReferralCreate')?.addEventListener('click',closeReferralCreate);document.getElementById('saveReferralCreate')?.addEventListener('click',saveReferralCreate);document.getElementById('copyReferralPreview')?.addEventListener('click',async()=>{const v=document.getElementById('referralPreviewLink')?.value||'';if(!v)return;try{await navigator.clipboard.writeText(v);toast('Referral link copied.')}catch(_){toast('Copy failed.')}});document.getElementById('copyReferralPortalPreview')?.addEventListener('click',async()=>{const v=document.getElementById('referralPreviewPortalLink')?.value||'';if(!v)return;try{await navigator.clipboard.writeText(v);toast('Private portal link copied.')}catch(_){toast('Copy failed.')}});document.getElementById('referralName')?.addEventListener('input',e=>{const n=document.getElementById('referralPreviewName');if(n)n.textContent=e.target.value.trim()||'—'});", "document.getElementById('createReferralBtn')?.addEventListener('click',()=>openReferralCreate());document.getElementById('cancelReferralCreate')?.addEventListener('click',closeReferralCreate);document.getElementById('saveReferralCreate')?.addEventListener('click',saveReferralCreate);document.getElementById('copyReferralPreview')?.addEventListener('click',async()=>{const v=document.getElementById('referralPreviewLink')?.value||'';if(!v)return;try{await navigator.clipboard.writeText(v);toast('Referral link copied.')}catch(_){toast('Copy failed.')}});document.getElementById('copyReferralPortalPage')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(`${location.origin}/my-referral.html`);toast('Referral portal page copied.')}catch(_){toast('Copy failed.')}});document.getElementById('copyReferralAccessNumber')?.addEventListener('click',async()=>{const v=document.getElementById('referralPreviewAccessNumber')?.value||'';try{await navigator.clipboard.writeText(v);toast('Referral token copied.')}catch(_){toast('Copy failed.')}});document.getElementById('referralName')?.addEventListener('input',e=>{const n=document.getElementById('referralPreviewName');if(n)n.textContent=e.target.value.trim()||'—'});")
f.write_text(s)
