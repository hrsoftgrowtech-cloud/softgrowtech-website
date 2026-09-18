const SGT_URL='https://syoqukavgvrdhwxatdav.supabase.co',SGT_KEY='sb_publishable_yUuacAdfZy3k-_Zve5QOZA_6eLh9FeZ';
const sb=window.supabase.createClient(SGT_URL,SGT_KEY);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const dateFmt=v=>v?new Date(v+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'Coming Soon';
const adt=v=>v?new Date(v).toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
const monthEnd=v=>{if(!v)return null;const d=new Date(v+'T00:00:00'),day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+1);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last));return d.toISOString().slice(0,10)};
const addDays=(v,n)=>{if(!v)return null;const d=new Date(v+'T00:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
function toast(m){const t=document.getElementById('toast');if(t){t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3200)}}
async function user(){const {data}=await sb.auth.getUser();return data.user}
async function profile(){const u=await user();if(!u)return null;const {data,error}=await sb.from('sgt_profiles').select('*').eq('id',u.id).maybeSingle();if(error)throw error;return data}
function statusClass(s){s=String(s||'').toLowerCase();return s==='selected'||s==='complete'||s==='completed'||s.includes('verified')?'success':s.includes('invalid')||s.includes('not selected')||s.includes('failed')?'danger':s.includes('pending')||s.includes('verification')||s.includes('review')?'warn':'blue'}
async function logout(){await sb.auth.signOut();location.href='student-login.html'}
async function initRegister(){const f=document.getElementById('registerForm');if(!f)return;const dom=document.getElementById('domain'),requested=new URLSearchParams(location.search).get('domain'),code=document.getElementById('callingCode'),countryEl=document.getElementById('country'),regError=document.getElementById('registrationError');const {data:ds}=await sb.from('sgt_domains').select('name').eq('enabled',true).order('name');if(ds){dom.innerHTML=ds.map(d=>`<option>${esc(d.name)}</option>`).join('');if(requested&&ds.some(d=>d.name===requested))dom.value=requested}const syncCountry=()=>{const opt=code?.selectedOptions?.[0],c=opt?.dataset?.country;if(c&&[...countryEl.options].some(o=>o.value===c))countryEl.value=c};code?.addEventListener('change',syncCountry);const gen=(n,p)=>{let a=n.trim().replace(/\s+/g,'').slice(0,3);a=a.charAt(0).toUpperCase()+a.slice(1).toLowerCase();return`SGT@${a}${p.replace(/\D/g,'').slice(-4)}`};const update=()=>{const el=document.getElementById('tempPreview');if(el)el.value=gen(document.getElementById('name').value,document.getElementById('phone').value)};f.addEventListener('input',update);update();f.onsubmit=async e=>{e.preventDefault();const b=f.querySelector('button');b.disabled=true;b.textContent='Creating registration…';if(regError){regError.hidden=true;regError.textContent=''}try{const name=document.getElementById('name').value.trim(),email=document.getElementById('email').value.trim().toLowerCase(),rawPhone=document.getElementById('phone').value.trim().replace(/\s+/g,''),callingCode=code.value,country=countryEl.value.trim(),normalizedRaw=rawPhone.replace(/^\+/,''),phone=callingCode+(normalizedRaw.startsWith(callingCode.slice(1))?normalizedRaw.slice(callingCode.length-1):normalizedRaw),study_year=document.getElementById('studyYear').value,gender=document.getElementById('gender').value,domain=dom.value,temp=gen(name,rawPhone);if(!name||!email||!rawPhone||!callingCode||!country||!study_year||!gender||!domain)throw Error('Please complete all required fields.');const {data:isRegistered,error:checkError}=await sb.rpc('sgt_check_registered_email',{p_email:email});if(!checkError&&isRegistered===true){if(regError){regError.innerHTML='<strong>Registration Already Exists</strong><br>This Gmail address is already registered with SoftGrowTech. Please use your existing registration instead of creating a new one.';regError.hidden=false}b.disabled=false;b.textContent='Create Registration →';return}const {data:groupSetting}=await sb.from('sgt_settings').select('value').eq('key','registration_group').maybeSingle();const whatsapp_group_url=groupSetting?.value?.url||'';const {error}=await sb.auth.signUp({email,password:temp,options:{emailRedirectTo:location.origin+'/student-login.html',data:{full_name:name,phone,country,calling_code:callingCode,study_year,gender,domain,temp_password:temp,must_change_password:true,whatsapp_group_url}}});if(error)throw error;sessionStorage.setItem('sgt_new_registration',JSON.stringify({name,email,domain}));location.href='registration-success.html'}catch(err){if(regError&&/already|registered|exists/i.test(err.message||'')){regError.innerHTML='<strong>Registration Already Exists</strong><br>This Gmail address is already registered with SoftGrowTech. Please use your existing registration instead of creating a new one.';regError.hidden=false}else toast(err.message||'Registration failed.');b.disabled=false;b.textContent='Create Registration →'}}}
async function initLogin(){const f=document.getElementById('loginForm');if(!f)return;f.onsubmit=async e=>{e.preventDefault();const b=f.querySelector('button');b.disabled=true;b.textContent='Signing in…';try{let id=document.getElementById('loginId').value.trim(),email=id;if(/^SGT-/i.test(id)){if(id!==id.toUpperCase())throw Error('Invalid Student ID. Please enter your Student ID exactly as issued, including uppercase and lowercase characters.');const {data:lookup,error}=await sb.rpc('sgt_lookup_login_email',{p_student_id:id});if(error)throw error;if(!lookup)throw Error('Invalid Student ID. Please enter your Student ID exactly as issued, including uppercase and lowercase characters.');email=lookup}const {data:authData,error}=await sb.auth.signInWithPassword({email,password:document.getElementById('password').value});if(error)throw error;const meta=authData?.user?.user_metadata||{};const mustChange=meta.must_change_password===true||Boolean(meta.temp_password);location.href=mustChange?'create-password.html':'portal.html'}catch(err){toast(err.message||'Login failed.');b.disabled=false;b.textContent='Login →'}}}
async function initFirstPassword(){
  const f=document.getElementById('firstPasswordForm');
  if(!f)return;
  const u=await user();
  if(!u){location.replace('student-login.html');return}
  const meta=u.user_metadata||{};
  if(meta.must_change_password!==true && !meta.temp_password){location.replace('portal.html');return}
  f.onsubmit=async e=>{
    e.preventDefault();
    const p=document.getElementById('firstNewPass').value,
          cp=document.getElementById('firstConfirmPass').value,
          b=f.querySelector('button');
    if(!/^(?=.{8}$)(?=.*[A-Z])(?=.*\d)(?=.*[#@?!/]).*$/.test(p))return toast('Use exactly 8 characters with capital, number and # @ ? ! /.');
    if(p!==cp)return toast('Passwords do not match.');
    b.disabled=true;b.textContent='Creating Password…';
    const {error}=await sb.auth.updateUser({password:p,data:{must_change_password:false,temp_password:''}});
    if(error){toast(error.message);b.disabled=false;b.textContent='Create New Password →';return}
    const success=document.getElementById('firstPasswordSuccess'),count=document.getElementById('firstPasswordCountdown');
    if(success)success.hidden=false;
    f.querySelectorAll('input,button').forEach(x=>x.disabled=true);
    let n=5;if(count)count.textContent=n;
    await sb.auth.signOut();
    const timer=setInterval(()=>{n-=1;if(n<=0){clearInterval(timer);location.href='student-login.html'}else if(count)count.textContent=n},1000);
  };
}
async function initReset(){
  const r=document.getElementById('resetRequest'),c=document.getElementById('resetChange'),rv=document.getElementById('resetRequestView'),cv=document.getElementById('resetChangeView'),mode=new URLSearchParams(location.search).get('mode');
  if(cv&&rv){if(mode==='new'){rv.hidden=true;cv.hidden=false}else{rv.hidden=false;cv.hidden=true}}
  const btn=document.getElementById('sendResetBtn'),timer=document.getElementById('resetResendTimer'),sec=document.getElementById('resetSeconds'),resetError=document.getElementById('resetEmailError');
  const cooldownKey='sgt_reset_cooldown_until';
  const renderCooldown=()=>{
    const until=Number(localStorage.getItem(cooldownKey)||0),left=Math.max(0,Math.ceil((until-Date.now())/1000));
    if(!timer||!sec||!btn)return;
    if(left>0){btn.textContent='Resend Reset Link →';btn.disabled=true;timer.hidden=false;sec.textContent=left;window.__sgtResetTimer&&clearInterval(window.__sgtResetTimer);window.__sgtResetTimer=setInterval(renderCooldown,250)}
    else{localStorage.removeItem(cooldownKey);btn.textContent='Send Reset Link →';btn.disabled=false;timer.hidden=true;window.__sgtResetTimer&&clearInterval(window.__sgtResetTimer);window.__sgtResetTimer=null}
  };
  const startCooldown=()=>{localStorage.setItem(cooldownKey,String(Date.now()+60000));if(btn)btn.textContent='Resend Reset Link →';renderCooldown()};
  if(btn)renderCooldown();
  const sendReset=async()=>{
    const email=document.getElementById('resetEmail')?.value.trim().toLowerCase();
    if(resetError){resetError.hidden=true;resetError.textContent=''}
    if(!email)return toast('Enter your registered Gmail.');
    const until=Number(localStorage.getItem(cooldownKey)||0);if(until>Date.now())return;
    btn.disabled=true;btn.textContent='Checking…';
    const {data:isRegistered,error:checkError}=await sb.rpc('sgt_check_registered_email',{p_email:email});
    if(checkError){toast('Unable to verify the Gmail right now. Please try again.');renderCooldown();return}
    if(isRegistered!==true){
      btn.disabled=false;btn.textContent='Send Reset Link →';
      if(resetError){resetError.textContent='Gmail not registered. Please enter your registered Gmail.';resetError.hidden=false}
      return;
    }
    btn.textContent='Sending…';
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname+'?mode=new'});
    if(error){toast(error.message);renderCooldown();return}
    toast('Reset link sent to your registered Gmail. Please check your inbox.');startCooldown();
  };
  if(r)r.onsubmit=async e=>{e.preventDefault();await sendReset()};
  if(c)c.onsubmit=async e=>{
    e.preventDefault();
    const p=document.getElementById('newPass').value,cp=document.getElementById('confirmPass').value;
    if(!/^(?=.{8}$)(?=.*[A-Z])(?=.*\d)(?=.*[#@?!/]).*$/.test(p))return toast('Use exactly 8 characters with capital, number and # @ ? ! /.');
    if(p!==cp)return toast('Passwords do not match.');
    const b=c.querySelector('button');b.disabled=true;b.textContent='Updating Password…';
    const {error}=await sb.auth.updateUser({password:p,data:{must_change_password:false,temp_password:''}});
    if(error){toast(error.message);b.disabled=false;b.textContent='Update Password →';return}
    const success=document.getElementById('resetSuccess'),count=document.getElementById('resetCountdown');
    c.querySelectorAll('input,button').forEach(x=>x.disabled=true);if(success)success.hidden=false;
    let n=3;if(count)count.textContent=n;
    const timer2=setInterval(()=>{n-=1;if(n<=0){clearInterval(timer2);location.href='student-login.html'}else if(count)count.textContent=n},1000)
  };
}
async function getScheduleConfig(){const {data}=await sb.from('sgt_settings').select('value').eq('key','program_schedule').maybeSingle();return data?.value||{task1:{open:0,submit:5,deadline:6,presentation_start:7,presentation_end:8},task2:{open:9,submit:14,deadline:15,presentation_start:16,presentation_end:17},final:{open:18,submit:24,deadline:26,review_start:27,review_end:31}}}
function scheduleDate(base,value,fallback){if(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value))return value;return base&&value!=null?addDays(base,Number(value)):base&&fallback!=null?addDays(base,fallback):null}
function timelineState(date,kind){const today=new Date();today.setHours(0,0,0,0);if(!date)return'upcoming';const d=new Date(date+'T00:00:00');if(d<today)return'complete';if(d.getTime()===today.getTime())return'current';return'upcoming'}
async function initPortal(){
  const root=document.getElementById('portalRoot');
  if(!root)return;
  const u=await user();
  if(!u){location.replace('student-login.html');return}
  const p=await profile();
  if(!p){root.innerHTML='<div class="portal-card"><h2>Profile not found</h2><p>Please contact SoftGrowTech support.</p></div>';return}
  const escDate=v=>v?new Date(v+'T00:00:00'):null;
  const today=new Date();today.setHours(0,0,0,0);
  const rangeState=(start,end)=>{const s=escDate(start),e=escDate(end)||s;if(!s)return'upcoming';if(today>e)return'complete';if(today>=s&&today<=e)return'current';return'upcoming'};
  const rangeLabel=(start,end)=>start&&end&&start!==end?`${dateFmt(start)} – ${dateFmt(end)}`:dateFmt(start);
  document.getElementById('studentName').textContent=p.name||'Student';
  document.getElementById('logoutBtn').onclick=logout;
  document.querySelectorAll('.portal-tab').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.portal-tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.portal-section-view').forEach(x=>x.classList.remove('active'));btn.classList.add('active');document.querySelector(`[data-portal-view=\"${btn.dataset.portalTab}\"]`)?.classList.add('active');window.scrollTo({top:0,behavior:'smooth'})});

  const programStart=p.batch_start||null, programEnd=programStart?monthEnd(programStart):null, orient=programStart?addDays(programStart,-2):null;
  const programStatus=!programStart?'Batch Assignment Pending':today<escDate(programStart)?'Internship Upcoming':today<=escDate(programEnd)?'Internship Running':(p.status==='Completed'?'Internship Completed':'Internship Ended — Completion Pending');
  const profileMeta=[['Student ID',p.student_id],['Gmail',p.email],['Phone / WhatsApp',p.phone],['Country',p.country],['Gender',p.gender],['Domain',p.domain],['Status',p.status]];
  document.getElementById('profileMeta').innerHTML=profileMeta.map(x=>`<div class="meta-box"><small>${x[0]}</small><strong>${esc(x[1]||'—')}</strong></div>`).join('');

  const sched=await getScheduleConfig();
  const scheduleItems=programStart?[
    ['Orientation Session',orient,orient],
    ['Internship Program Start',programStart,programStart],
    ['Task 1 — Work Window',scheduleDate(programStart,sched.task1.open,0),scheduleDate(programStart,sched.task1.submit!=null?sched.task1.submit-1:sched.task1.open,5)],
    ['Task 1 — Submission',scheduleDate(programStart,sched.task1.submit,5),scheduleDate(programStart,sched.task1.deadline,6)],
    ['Task 1 — Presentation',scheduleDate(programStart,sched.task1.presentation_start,7),scheduleDate(programStart,sched.task1.presentation_end,8)],
    ['Task 2 — Work Window',scheduleDate(programStart,sched.task2.open,9),scheduleDate(programStart,sched.task2.submit!=null?sched.task2.submit-1:sched.task2.open,13)],
    ['Task 2 — Submission',scheduleDate(programStart,sched.task2.submit,14),scheduleDate(programStart,sched.task2.deadline,15)],
    ['Task 2 — Presentation',scheduleDate(programStart,sched.task2.presentation_start,16),scheduleDate(programStart,sched.task2.presentation_end,17)],
    ['Final Project — Work Window',scheduleDate(programStart,sched.final.open,18),scheduleDate(programStart,sched.final.submit!=null?sched.final.submit-1:sched.final.open,23)],
    ['Final Project — Submission',scheduleDate(programStart,sched.final.submit,24),scheduleDate(programStart,sched.final.deadline,26)],
    ['Review & Evaluation',scheduleDate(programStart,sched.final.review_start,27),scheduleDate(programStart,sched.final.review_end,31)],
    ['Internship Completion',programEnd,programEnd]
  ]:[['Orientation Session',null,null],['Internship Program Start',null,null],['Batch End',null,null]];
  const scheduleStatus=(name,state)=>{
    const n=String(name||'');
    if(n==='Orientation Session')return state==='complete'?'Orientation Completed':state==='current'?'Orientation Today':'Orientation Upcoming';
    if(n==='Internship Program Start')return state==='complete'?'Batch Started':state==='current'?'Batch Started Today':'Batch Starts Soon';
    if(n.includes('Task 1 — Work Window'))return state==='complete'?'Task 1 Work Completed':state==='current'?'Task 1 In Progress':'Task 1 Starts Soon';
    if(n.includes('Task 1 — Submission'))return state==='complete'?'Task 1 Submission Closed':state==='current'?'Task 1 Submission Open':'Task 1 Submission Upcoming';
    if(n.includes('Task 1 — Presentation'))return state==='complete'?'Task 1 Presentation Completed':state==='current'?'Task 1 Presentation Live':'Task 1 Presentation Upcoming';
    if(n.includes('Task 2 — Work Window'))return state==='complete'?'Task 2 Work Completed':state==='current'?'Task 2 In Progress':'Task 2 Starts Soon';
    if(n.includes('Task 2 — Submission'))return state==='complete'?'Task 2 Submission Closed':state==='current'?'Task 2 Submission Open':'Task 2 Submission Upcoming';
    if(n.includes('Task 2 — Presentation'))return state==='complete'?'Task 2 Presentation Completed':state==='current'?'Task 2 Presentation Live':'Task 2 Presentation Upcoming';
    if(n.includes('Final Project — Work Window'))return state==='complete'?'Final Project Work Completed':state==='current'?'Final Project In Progress':'Final Project Starts Soon';
    if(n.includes('Final Project — Submission'))return state==='complete'?'Final Project Submission Closed':state==='current'?'Final Project Submission Open':'Final Project Submission Upcoming';
    if(n==='Review & Evaluation')return state==='complete'?'Review Completed':state==='current'?'Review In Progress':'Review Upcoming';
    if(n==='Internship Completion')return state==='complete'?'Batch Completed':state==='current'?'Completion Today':'Completion Upcoming';
    return state==='complete'?'Completed':state==='current'?'In Progress':'Upcoming';
  };
  document.getElementById('schedule').innerHTML=scheduleItems.map(([name,start,end])=>{const state=rangeState(start,end);const status=scheduleStatus(name,state);return `<div class="timeline-item"><span class="timeline-dot ${state}"></span><div style="flex:1"><strong>${name}</strong><small>${start?rangeLabel(start,end):'Coming Soon'}</small><div style="margin-top:7px"><span class="status ${state==='complete'?'success':state==='current'?'blue':'warn'}">${status}</span></div></div></div>`}).join('');

  document.getElementById('statusCards').innerHTML=[['Internship Program',programStatus],['Enroll Fee',p.payment_status],['Selection Assessment',p.assessment_status],['Selection',p.selection_status],['Review',p.review_status]].map(x=>`<div class="meta-box"><small>${x[0]}</small><span class="status ${statusClass(x[1])}">${esc(x[1])}</span></div>`).join('');

  const {data:grp}=await sb.from('sgt_settings').select('value').eq('key','registration_group').maybeSingle();
  const groupUrl=p.whatsapp_group_url||grp?.value?.url||'';
  const groupAction=document.getElementById('groupAction');
  if(groupAction) groupAction.innerHTML=groupUrl?`<a class="portal-btn secondary" href="${esc(groupUrl)}" target="_blank" rel="noopener">Join Official WhatsApp Group →</a>`:'';

  let action='';
  const hasPaid=p.payment_status && !['Pending','Refunded'].includes(p.payment_status);
  const round=Number(p.selection_round||1);
  if(p.selection_status==='Not Selected'){
    if(round>=2){
      const rs=p.refund_status||'Refund Process Pending';
      action=`<div class="help-note"><strong>Refund Process</strong><br>Your re-assessment result was not selected. The refund is handled manually by the management team.</div><div class="portal-meta" style="margin-top:14px"><div class="meta-box"><small>Refund Status</small><span class="status ${statusClass(rs)}">${esc(rs)}</span></div>${p.refund_reference?`<div class="meta-box"><small>Refund Reference</small><strong>${esc(p.refund_reference)}</strong></div>`:''}</div>`;
      if(rs==='Refund Completed')action+=`<div class="success-panel" style="margin-top:14px"><strong>Refund completed ✓</strong><p>Your refund process has been marked completed by the management team.</p></div>`;
    }else if(hasPaid){
      action=`<div class="help-note">You were not selected in the current selection round. You can take one re-assessment before the batch starts. Your Student ID remains unchanged.</div><div class="portal-actions"><button class="portal-btn primary" id="startReassessment">Re-Assessment →</button></div>`;
    }else{
      action=`<div class="help-note">Your current selection status is <strong>Not Selected</strong>. No refund process applies because no enrollment payment has been submitted.</div>`;
    }
  }else if(p.selection_status==='Selected'){
    action=`<div class="success-panel"><strong>Selection Confirmed ✓</strong><p style="margin:6px 0 0">Your selection is confirmed. Your Offer Letter is available in Documents. Project access opens after payment verification unless management has enabled a manual project-access override.</p></div>`;
  }else if(p.assessment_status==='Complete'){
    action='<div class="portal-actions"><a class="portal-btn secondary" href="assessment.html">View Assessment Status</a></div>';
  }else{
    action='<div class="portal-actions"><a class="portal-btn primary" href="assessment.html">Start Selection Assessment →</a></div>';
  }
  document.getElementById('assessmentAction').innerHTML=`<div class="assessment-action-highlight">${action}</div>`;
  document.getElementById('startReassessment')?.addEventListener('click',async()=>{const b=document.getElementById('startReassessment');b.disabled=true;b.textContent='Preparing…';const {error}=await sb.from('sgt_profiles').update({selection_round:2,assessment_status:'Not Started',review_status:'Pending',updated_at:new Date().toISOString()}).eq('id',u.id);if(error){toast(error.message);b.disabled=false;b.textContent='Re-Assessment →';return}location.href='assessment.html'});

  const [{data:tasks},{data:tf}]=await Promise.all([sb.from('sgt_tasks').select('*').eq('enabled',true).or(`domain.eq.${p.domain},domain.is.null`).order('title'),sb.from('sgt_settings').select('value').eq('key','task_forms').maybeSingle()]);
  const forms=tf?.value||{};
  const standard=[{task_key:'task1',title:'Task 1',description:'Complete any 2 of the 3 domain projects.',project_url:''},{task_key:'task2',title:'Task 2',description:'Complete the assigned domain project.',project_url:''},{task_key:'final',title:'Final Project',description:'Choose 1 of the 2 final project options.',project_url:''}];
  const taskItems=(tasks&&tasks.length)?tasks:standard;
  const formFor=t=>{const k=String(t.task_key||t.title).toLowerCase();if(k.includes('task1')||k.includes('task-1')||k.includes('task 1'))return forms.task1;if(k.includes('task2')||k.includes('task-2')||k.includes('task 2'))return forms.task2;if(k.includes('final'))return forms.final;return t.submission_url||''};
  const dateFor=(key,type)=>{const sc=key.includes('task1')||key.includes('task-1')||key.includes('task 1')?sched.task1:key.includes('task2')||key.includes('task-2')||key.includes('task 2')?sched.task2:sched.final;const fallback={open:key.includes('task1')?0:key.includes('task2')?9:18,submit:key.includes('task1')?5:key.includes('task2')?14:24,deadline:key.includes('task1')?6:key.includes('task2')?15:26,presentation_start:key.includes('task1')?7:16,presentation_end:key.includes('task1')?8:17,review_start:27,review_end:31}[type];return scheduleDate(programStart,sc[type],fallback)};
  const projectAccess=p.selection_status==='Selected'&&(p.payment_status==='Verified'||p.admin_project_override===true);
  if(!projectAccess){
    const reason=p.selection_status!=='Selected'?'Selection is required before project access.':p.payment_status!=='Verified'?'Project access will open after payment verification.':'Project access is currently restricted.';
    document.getElementById('taskList').innerHTML=`<div class="help-note"><strong>Projects are not live yet.</strong><br>${esc(reason)}${p.admin_project_override===false?'':''}</div>`;
  }else{
    document.getElementById('taskList').innerHTML=taskItems.map(t=>{
      const key=String(t.task_key||t.title).toLowerCase(),open=dateFor(key,'open'),live=dateFor(key,'submit'),deadline=dateFor(key,'deadline');
      const openD=escDate(open),liveD=escDate(live),deadD=deadline?new Date(deadline+'T23:59:59'):null;
      let state='Coming Soon',button='';
      if(deadD&&new Date()>deadD){state='Submission Closed';button='<a class="portal-btn secondary" href="contact.html#support">Couldn’t submit on time? 💬 Get Help</a>'}
      else if(liveD&&today>=liveD){state='Submission Form Live';button=formFor(t)?`<a class="portal-btn primary" target="_blank" rel="noopener" href="${esc(formFor(t))}">Submit ${esc(t.title)} →</a>`:'<span class="help-note">Submission form link will be added by the management team.</span>'}
      else if(openD&&today>=openD){state='In Progress'}
      const range=open&&deadline?rangeLabel(open,deadline):open?dateFmt(open):'Coming Soon';
      return `<div class="timeline-item"><span class="timeline-dot ${state==='Submission Form Live'?'current':state==='Submission Closed'?'complete':state==='In Progress'?'current':'upcoming'}"></span><div style="flex:1"><strong>${esc(t.title)}</strong><small>${esc(t.description||'')} • ${range}</small><div style="margin-top:10px"><span class="status ${statusClass(state)}">${esc(state)}</span></div><div class="portal-actions">${openD&&today>=openD&&t.project_url?`<a class="portal-btn secondary" target="_blank" rel="noopener" href="${esc(t.project_url)}">Open Project Instructions</a>`:''}${button}</div></div></div>`
    }).join('')||'<div class="empty">Tasks will appear according to your assigned batch.</div>';
  }


  const notificationBell=document.getElementById('studentNotificationBell');
  const notificationBadge=document.getElementById('studentNotificationBadge');
  let notificationRows=[];
  const getStudentNotes=async()=>{
    const {data:noteRows}=await sb.from('sgt_student_notes').select('id,category,message,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(50);
    let readIds=new Set();
    try{
      const reads=await sb.from('sgt_student_notification_reads').select('notification_id,read_at').eq('user_id',u.id);
      readIds=new Set((reads.data||[]).map(x=>x.notification_id));
    }catch(e){console.warn('Notification read-state load failed.',e)}
    let localRead=[];try{localRead=JSON.parse(localStorage.getItem(`sgt_note_reads_${u.id}`)||'[]')}catch(_){}
    const localSet=new Set(localRead);
    return (noteRows||[]).map(x=>({id:x.id,realId:x.id,category:(x.category==='Other'?'General Update':(x.category||'General Update')),message:x.message,created_at:x.created_at,read:readIds.has(x.id)||localSet.has(x.id)})).filter(x=>x.message).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  };
  const updateBadge=()=>{const unread=notificationRows.filter(x=>!x.read).length;if(notificationBadge){notificationBadge.textContent=unread?String(unread):'';notificationBadge.hidden=!unread}};
  const persistLocalRead=id=>{const key=`sgt_note_reads_${u.id}`,arr=JSON.parse(localStorage.getItem(key)||'[]');if(!arr.includes(id)){arr.push(id);localStorage.setItem(key,JSON.stringify(arr.slice(-200)))}};
  const markNotificationRead=async note=>{
    if(note.read)return;
    note.read=true;persistLocalRead(note.id);updateBadge();
    if(note.realId){const {error}=await sb.from('sgt_student_notification_reads').upsert({notification_id:note.realId,user_id:u.id},{onConflict:'notification_id,user_id'});if(error)console.warn('Notification read state could not be stored in database.',error.message)}
  };
  const openNotificationPanel=async()=>{
    const old=document.getElementById('studentNotificationPanel');if(old){old.remove();return}
    try{notificationRows=await getStudentNotes()}catch(e){console.warn('Notification load failed',e);notificationRows=[]}
    // Opening the notification panel means the student has viewed the notification center.
    // Mark all currently loaded notifications as seen automatically; there is no manual bulk button.
    for(const n of notificationRows){if(!n.read)await markNotificationRead(n)}
    notificationRows=notificationRows.map(x=>({...x,read:true}));
    updateBadge();
    const panel=document.createElement('div');panel.id='studentNotificationPanel';panel.className='student-notification-panel';
    panel.innerHTML=`<div class="student-notification-panel-head"><div><strong>Notifications</strong><small>All caught up</small></div><button class="close-btn" type="button" aria-label="Close notifications">×</button></div><div class="student-notification-list">${notificationRows.length?notificationRows.map(x=>`<button type="button" class="student-notification-item read" data-note-id="${esc(x.id)}"><span class="note-icon">🔔</span><span><strong>${esc(x.category)}</strong><small style="white-space:pre-line">${esc(x.message)}</small><em>${adt(x.created_at)} • Seen</em></span></button>`).join(''):'<div class="admin-note-empty">No notifications yet.</div>'}</div>`;
    document.body.appendChild(panel);requestAnimationFrame(()=>panel.classList.add('open'));
    panel.querySelector('.close-btn').onclick=()=>panel.remove();
  };
  const showNotification=note=>{if(!note)return;const old=document.querySelector('.admin-note-popup');if(old)old.remove();const pop=document.createElement('div');pop.className='admin-note-popup';pop.innerHTML=`<div class="admin-note-panel is-new"><div class="admin-note-head"><span class="note-icon">🔔</span><div><strong>New Notification</strong><small>${esc(note.category)} • From SoftGrowTech Team</small></div><button type="button" class="close-btn" style="margin-left:auto">×</button></div><p>${esc(note.message)}</p><small class="admin-note-date">${adt(note.created_at)}</small><div class="portal-actions" style="margin-top:12px"><button type="button" class="portal-btn primary" id="popupMarkSeen">Mark as Seen</button></div></div>`;document.body.appendChild(pop);notificationBell?.classList.add('notification-bell-new');setTimeout(()=>notificationBell?.classList.remove('notification-bell-new'),900);pop.querySelector('.close-btn').onclick=()=>pop.remove();pop.querySelector('#popupMarkSeen').onclick=async()=>{await markNotificationRead(note);pop.remove()};setTimeout(()=>{if(pop.isConnected)pop.remove()},9000)};
  const updateNotifications=async(showPopup)=>{const before=new Set(notificationRows.filter(x=>!x.read).map(x=>x.id));notificationRows=await getStudentNotes();updateBadge();const newest=notificationRows.find(x=>!x.read);if(showPopup&&newest&&!before.has(newest.id))showNotification(newest)};
  // Notifications must never block the rest of the dashboard. A read-state/RLS/network issue should not prevent Documents or other sections from rendering.
  notificationBell?.addEventListener('click',openNotificationPanel);
  Promise.resolve(updateNotifications(false)).catch(e=>console.warn('Notification initialization failed.',e));
  setInterval(()=>updateNotifications(true).catch(e=>console.warn('Notification refresh failed.',e)),8000);


  async function makeDocumentPdf(kind){
    const session=await sb.auth.getSession();
    const token=session.data.session?.access_token;
    if(!token) throw new Error('Your session has expired. Please sign in again.');
    const response=await fetch(`${SGT_URL}/functions/v1/sgt-generate-document`,{
      method:'POST',
      headers:{Authorization:`Bearer ${token}`,apikey:SGT_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({kind})
    });
    if(!response.ok){
      let message='Unable to generate document.';
      try{const data=await response.json();message=data?.error||message}catch(e){}
      throw new Error(message);
    }
    return await response.arrayBuffer();
  }
  const docs=[];
  const selectionOk=String(p.selection_status||'').trim().toLowerCase()==='selected';
  const paymentVerified=String(p.payment_status||'').trim().toLowerCase()==='verified';
  const internshipCompleted=String(p.status||'').trim().toLowerCase()==='completed';
  const offerEligible=selectionOk;
  const certificateEligible=selectionOk&&paymentVerified&&internshipCompleted;
  const stableId=(prefix,studentId)=>`${prefix}-${String(studentId||'RECORD').replace(/[^0-9A-Z]/gi,'').slice(-10)}`;
  const offerId=p.offer_letter_id||stableId('SGT-OFFER',p.student_id);
  const certificateId=p.certificate_id||stableId('SGT-CERT',p.student_id);
  if(offerEligible)docs.push(`<div class="doc-row"><div><strong>Offer Letter</strong><small>${esc(offerId)} • Available after selection.</small></div><button class="portal-btn secondary generated-doc" data-doc="offer">View</button></div>`);
  if(certificateEligible)docs.push(`<div class="doc-row"><div><strong>Certificate</strong><small>${esc(certificateId)} • Available after verified payment and completed internship.</small></div><button class="portal-btn secondary generated-doc" data-doc="certificate">View</button></div>`);
  const docBox=document.getElementById('documentActions');
  if(docBox){
    docBox.innerHTML=docs.join('')||'<span class="help-note">Your documents will appear here when they are issued.</span>';
    const openDocumentViewer=async(kind)=>{
      try{
        const bytes=await makeDocumentPdf(kind);if(!bytes)return toast('PDF generator is unavailable.');
        const blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),name=kind==='offer'?offerId:certificateId;
        const modal=document.createElement('div');modal.className='document-viewer-modal';modal.innerHTML=`<div class="document-viewer-card"><div class="document-viewer-head"><div><strong>${kind==='offer'?'Offer Letter':'Certificate'}</strong><small>${esc(name)} • Available</small></div><button type="button" class="close-btn" aria-label="Close document">×</button></div><iframe class="document-viewer-frame" title="${kind==='offer'?'Offer Letter':'Certificate'}" src="${url}"></iframe><div class="document-viewer-actions"><button type="button" class="portal-btn secondary" id="documentViewerClose">Close</button><button type="button" class="portal-btn primary" id="documentViewerDownload">Download PDF</button></div></div>`;
        document.body.appendChild(modal);document.body.classList.add('document-viewer-open');
        const close=()=>{URL.revokeObjectURL(url);modal.remove();document.body.classList.remove('document-viewer-open')};
        modal.querySelector('.close-btn').onclick=close;modal.querySelector('#documentViewerClose').onclick=close;
        modal.querySelector('#documentViewerDownload').onclick=()=>{const a=document.createElement('a');a.href=url;a.download=`${name}.pdf`;a.click()};
        modal.addEventListener('click',e=>{if(e.target===modal)close()});
      }catch(e){console.error(e);toast(e.message||'Unable to generate document.')}
    };

    docBox.querySelectorAll('.generated-doc').forEach(b=>b.onclick=()=>openDocumentViewer(b.dataset.doc));
  }
  if(p.selection_status==='Selected'){
    try{const session=await sb.auth.getSession();const token=session.data.session?.access_token;if(token)await fetch(`${SGT_URL}/functions/v1/sgt-send-selection-email`,{method:'POST',headers:{Authorization:`Bearer ${token}`,apikey:SGT_KEY,'Content-Type':'application/json'},body:'{}'});}catch(e){console.warn('Selection email service unavailable.',e)}
  }
  let lastSelectionStatus=p.selection_status;
  setInterval(async()=>{try{const {data:latestProfile}=await sb.from('sgt_profiles').select('selection_status').eq('id',u.id).maybeSingle();if(latestProfile?.selection_status==='Selected'&&lastSelectionStatus!=='Selected'){lastSelectionStatus='Selected';const session=await sb.auth.getSession();const token=session.data.session?.access_token;if(token)await fetch(`${SGT_URL}/functions/v1/sgt-send-selection-email`,{method:'POST',headers:{Authorization:`Bearer ${token}`,apikey:SGT_KEY,'Content-Type':'application/json'},body:'{}'});location.reload()}}catch(e){}},15000);
}
async function initAssessment(){
  const root=document.getElementById('assessmentRoot');
  if(!root)return;
  const u=await user();
  if(!u){location.href='student-login.html';return}
  const p=await profile();
  if(!p)return;
  const today=new Date();today.setHours(0,0,0,0);
  const orientationDate=p.batch_start?addDays(p.batch_start,-2):null;
  const orientationComplete=Boolean(orientationDate)&&today>=new Date(orientationDate+'T00:00:00');
  const set=p.selection_status==='Not Selected'?'reassessment':'primary';

  if(!orientationComplete){
    root.innerHTML=`<div class="portal-card assessment-gate-card"><div class="portal-kicker">Selection Assessment</div><h1>Orientation Required</h1><p>You can start the assessment after completing the orientation.</p><div class="help-note"><strong>Orientation meeting is mandatory.</strong><br>Orientation details and meeting information will be shared in the official WhatsApp group.</div><div class="success-panel" style="margin-top:16px"><strong>All the best for your assessment and selection!</strong><span class="inline-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></span></div><div class="portal-actions"><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>`;
    return;
  }

  if(p.assessment_status==='Complete'){
    const re=set==='reassessment';
    root.innerHTML=`<div class="portal-card"><div class="portal-kicker">${re?'Re-Assessment':'Selection Assessment'}</div><h1>${re?'Re-Assessment Already Submitted':'Assessment Already Submitted'}</h1><div class="success-panel"><strong>Your ${re?'re-assessment':'selection assessment'} has already been submitted and is currently under verification.</strong><p style="margin:8px 0 0">Payment: ${esc(p.payment_status||'Under Verification')}<br>Assessment: Submitted<br>Review: ${esc(p.review_status||'Under Verification')}</p></div><div class="portal-actions"><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>`;
    return;
  }

  let {data:q}=await sb.from('sgt_assessment_questions').select('*').eq('domain',p.domain).eq('question_set',set).eq('enabled',true).order('question_no');
  const questionsReady=Boolean(q?.length);
  q=(q||[]).slice(0,10);

  const showQuestions=()=>{
    if(!questionsReady){
      root.innerHTML=`<div class="portal-card"><div class="portal-kicker">${set==='reassessment'?'Re-Assessment':'Selection Assessment'}</div><h1>Assessment Questions Not Published</h1><p>The required ${set==='reassessment'?'re-assessment':'assessment'} question set is not available yet.</p><div class="help-note">Please check back after the management team publishes the question set for your domain.</div><div class="portal-actions"><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>`;
      return;
    }
    renderQuestion();
  };

  let i=0,ans={};
  const intro=()=>{
    if(set==='reassessment'){
      const verified=String(p.payment_status||'').toLowerCase()==='verified';
      root.innerHTML=`<div class="portal-card assessment-gate-card"><div class="portal-kicker">SECOND OPPORTUNITY</div><h1>Your Second Opportunity</h1><p>Your first assessment did not result in selection, but this is not the end of your journey.</p><div class="success-panel"><strong>Take this fresh opportunity with confidence.</strong><p style="margin:7px 0 0">Prepare well, stay focused, and demonstrate your knowledge, problem-solving skills and readiness in this new assessment.</p></div><div class="portal-meta" style="margin-top:16px"><div class="meta-box"><small>Payment Submitted</small><strong>${verified?'Verified':'Submitted'}</strong></div></div><div class="portal-actions"><button class="portal-btn secondary" id="backReassess" type="button">← Back</button><button class="portal-btn primary" id="continueReassessment" type="button">Continue to the Re-Assessment →</button></div></div>`;
      document.getElementById('backReassess').onclick=()=>location.href='portal.html';
      document.getElementById('continueReassessment').onclick=showQuestions;
      return;
    }
    root.innerHTML=`<div class="portal-card"><div class="portal-kicker">SELECTION ASSESSMENT</div><h1>Assessment Information</h1><p>This interview-style assessment helps us understand your technical fundamentals, problem-solving approach and readiness for the selected program.</p><div class="portal-meta"><div class="meta-box"><small>Name</small><strong>${esc(p.name)}</strong></div><div class="meta-box"><small>Registered Gmail</small><strong style="word-break:break-word">${esc(p.email)}</strong></div><div class="meta-box"><small>Student ID</small><strong>${esc(p.student_id)}</strong></div><div class="meta-box"><small>Domain</small><strong>${esc(p.domain)}</strong></div></div><div class="success-panel" style="margin-top:16px"><strong>Selection is based on your assessment performance.</strong><p style="margin:7px 0 0">The Enrollment Fee is compulsory for assessment and enrollment processing. <strong>Payment does not guarantee selection.</strong> If you are not selected, the applicable fee is eligible for refund under the stated refund process.</p></div><div class="portal-actions"><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a><button class="portal-btn primary" id="nextAssessInfo" type="button">Next →</button></div></div>`;
    document.getElementById('nextAssessInfo').onclick=()=>{
      const paid=!['Pending','Refunded',''].includes(String(p.payment_status||''));
      if(paid)showQuestions();else location.href='enrollment.html';
    };
  };

  const renderQuestion=()=>{
    const completed=i;
    const remaining=q.length-i-1;
    const progress=q.length?Math.round(((i+1)/q.length)*100):0;
    root.innerHTML=`<div class="portal-card"><div class="portal-kicker">${set==='reassessment'?'RE-ASSESSMENT':'SELECTION ASSESSMENT'}</div><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-end;flex-wrap:wrap"><div><h1>Question ${i+1} of ${q.length}</h1><p style="margin-bottom:0">${esc(q[i].question)}</p></div><strong>${progress}%</strong></div><div style="height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden;margin:18px 0"><div style="height:100%;width:${progress}%;background:currentColor;border-radius:999px"></div></div><div class="help-note"><strong>${completed} completed</strong> • <strong>${remaining} remaining</strong>. Scores are not shown to students.</div><div class="field" style="margin-top:15px"><label>Your answer</label><textarea id="answer" rows="7" placeholder="Write your answer clearly…">${esc(ans[q[i].id]||'')}</textarea></div><div class="portal-actions"><button class="portal-btn secondary" id="prev" ${i===0?'disabled':''}>← Previous</button><button class="portal-btn primary" id="next">${i===q.length-1?'Review & Submit →':'Save & Continue →'}</button></div></div>`;
    document.getElementById('prev').onclick=()=>{ans[q[i].id]=document.getElementById('answer').value;i--;renderQuestion()};
    document.getElementById('next').onclick=()=>{ans[q[i].id]=document.getElementById('answer').value;if(i<q.length-1){i++;renderQuestion();return}renderReview()};
  };

  const renderReview=()=>{
    root.innerHTML=`<div class="portal-card"><div class="portal-kicker">Final Check</div><h1>Review Your Answers</h1><p>Please carefully check all your answers before final submission. Once submitted, your assessment will be sent for evaluation.</p>${q.map((x,n)=>`<div class="review-answer"><small>Question ${n+1}</small><strong>${esc(x.question)}</strong><p style="margin:7px 0 0;white-space:pre-wrap">${esc(ans[x.id]||'No answer provided')}</p></div>`).join('')}<div class="help-note" style="margin-top:18px">Please make sure your answers are complete and correct before you submit.</div><div class="portal-actions"><button class="portal-btn secondary" id="backCheck">← Back & Check Answers</button><button class="portal-btn primary" id="finalSubmit">Submit Assessment →</button></div></div>`;
    document.getElementById('backCheck').onclick=()=>renderQuestion();
    document.getElementById('finalSubmit').onclick=async()=>{
      const btn=document.getElementById('finalSubmit');btn.disabled=true;btn.textContent='Submitting…';
      const {data:a,error}=await sb.from('sgt_assessment_attempts').insert({student_id:p.student_id,user_id:u.id,attempt_no:Date.now(),question_set:set,status:'Complete',submitted_at:new Date().toISOString()}).select().single();
      if(error){toast(error.message);btn.disabled=false;btn.textContent='Submit Assessment →';return}
      const {error:ae}=await sb.from('sgt_assessment_answers').insert(q.map(x=>({attempt_id:a.id,question_id:x.id,answer:ans[x.id]||''})));
      if(ae){toast(ae.message);return}
      const mark=await sb.rpc('sgt_mark_assessment_review');
      if(mark.error)return toast(mark.error.message);
      root.innerHTML='<div class="portal-card"><div class="success-panel"><h1>Submission Received ✓</h1><p><strong>Payment and Selection Assessment are now Under Review.</strong></p><p>Our team will review your submitted payment details and assessment. Your selection status will be updated after the review is completed.</p></div><div class="portal-actions"><a class="portal-btn primary" href="portal.html">Back to Dashboard →</a></div></div>';
    };
  };

  const showPaymentInfo=()=>location.href='enrollment.html';
  intro();
}
async function initEnrollment(){
  const root=document.getElementById('enrollmentRoot');
  if(!root)return;
  const u=await user();
  if(!u){location.href='student-login.html';return}
  const p=await profile();
  if(!p)return;
  const {data:s}=await sb.from('sgt_settings').select('value').eq('key','payment').maybeSingle();
  const cfg=s?.value||{};
  const methods=[];
  const country=String(p.country||'').trim().toLowerCase();
  const phone=String(p.phone||'').replace(/\s+/g,'');
  const codeMatch=phone.match(/^\+(\d{1,4})/);const code=codeMatch?.[1]||'';
  const india=code==='91'||['india','in','bharat'].includes(country);
  const pakistan=code==='92'||['pakistan','pk'].includes(country);
  const defaultQr={india:'assets/india-upi-qr.jpg',binance:'assets/binance-qr.jpg',paypal:'assets/paypal-qr.jpg',pakistan:'',wise:''};
  const qrFor=(key,value)=>value||defaultQr[key]||'';
  if(india){if(cfg.india?.enabled)methods.push({key:'india',name:'India — UPI',fee:`${cfg.india.fee||'149'} ${cfg.india.currency||'INR'}`,details:cfg.india.details||'UPI ID: info.softgrowtech@oksbi',qr:qrFor('india',cfg.india.qr_url||'')});}
  else if(pakistan){if(cfg.pakistan?.enabled)methods.push({key:'pakistan',name:'Pakistan — JazzCash / Easypaisa',fee:`${cfg.pakistan.fee||'499'} ${cfg.pakistan.currency||'PKR'}`,details:cfg.pakistan.details||'',qr:qrFor('pakistan',cfg.pakistan.qr_url||'')});}
  else{const intl=cfg.international||{};['binance','paypal','wise'].forEach(k=>{const x=intl[k]||{};if(x.enabled!==false)methods.push({key:k,name:k==='binance'?'Binance':k==='paypal'?'PayPal':'Wise',fee:`${x.fee||intl.fee||'5'} ${x.currency||intl.currency||'USD'}`,details:x.details||'',qr:qrFor(k,x.qr_url||'')})})}
  if(!methods.length){root.innerHTML=`<div class="portal-card"><h1>Payment Method Unavailable</h1><p>No payment method is currently configured for your registered country. Please contact SoftGrowTech support.</p><div class="portal-actions"><a class="portal-btn secondary" href="assessment.html">Back to Assessment</a><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>`;return;}
  root.innerHTML=`<div class="portal-card"><div class="portal-kicker">Enrollment</div><div style="display:flex;justify-content:space-between;gap:18px;align-items:flex-start;flex-wrap:wrap"><div style="flex:1;min-width:260px"><h1>Enrollment Fee & Payment</h1><p>Choose your payment method, complete the payment, then submit your transaction details for verification.</p></div><div class="help-note" style="margin:0;min-width:170px;text-align:center"><strong>Complete within</strong><div id="paymentTimer" style="font-size:28px;font-weight:800;margin-top:4px">10:00</div></div></div><div class="help-note" style="margin-top:16px"><strong>Payment does not guarantee selection.</strong><br>Your selection is based on your assessment performance. If you are not selected, the applicable Enrollment Fee is eligible for refund under the stated refund process.</div><h3 style="margin-top:22px">Choose Payment Method</h3><div id="methodList" class="payment-method-layout">${methods.map((x,n)=>`<div class="method-card ${n===0?'open':''}" data-key="${esc(x.key)}"><button class="method-toggle" type="button"><span>${esc(x.name)}</span><span>${esc(x.fee)} ▾</span></button><div class="method-body"><p><strong>Payment Details</strong><br>${esc(x.details||'Payment details are configured by SoftGrowTech.')}</p>${x.key==='india'?`<div class="upi-actions" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><a class="portal-btn secondary upi-app" data-app="gpay" href="#">Google Pay</a><a class="portal-btn secondary upi-app" data-app="phonepe" href="#">PhonePe</a><a class="portal-btn secondary upi-app" data-app="paytm" href="#">Paytm</a></div><small style="display:block;margin-top:8px;color:#64748b">App opening depends on the apps installed and supported by the device/browser.</small>`:''}</div></div>`).join('')}<div class="help-note payment-qr-panel" style="grid-column:2;grid-row:1 / span ${methods.length};text-align:center;min-height:300px;display:flex;flex-direction:column;justify-content:center"><strong style="font-size:16px">Scan to Pay</strong><div id="qrPreviewBox"></div><span>Use the QR code or the payment details shown for your selected method.</span></div></div><form id="paymentForm" class="form-grid" style="margin-top:22px"><div class="field"><label>Payment Method</label><select id="payMethod" required>${methods.map(x=>`<option value="${esc(x.key)}">${esc(x.name)}</option>`).join('')}</select></div><div class="field"><label>Transaction ID</label><input id="txn" required></div><div class="field"><label>Receipt</label><input id="receipt" type="file" accept="image/*,.pdf" required></div><div class="field"><label>Student ID</label><input value="${esc(p.student_id)}" disabled></div><div class="field"><label>Registered Gmail</label><input value="${esc(p.email)}" disabled></div><div class="field full"><button class="portal-btn primary" type="submit">Submit Payment for Verification →</button></div></form><div class="portal-actions"><a class="portal-btn secondary" href="assessment.html">Back to Assessment</a><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>`;
  const qrBox=root.querySelector('#qrPreviewBox');
  const selectedMethod=()=>methods.find(x=>x.key===document.getElementById('payMethod').value)||methods[0];
  const updateQr=()=>{const selected=selectedMethod();if(qrBox)qrBox.innerHTML=selected?.qr?`<img src="${esc(selected.qr)}" alt="${esc(selected.name)} QR" style="display:block;max-width:280px;width:100%;height:auto;margin:12px auto;border-radius:12px;background:#fff;padding:8px;box-sizing:border-box">`:'<div style="padding:35px 10px;color:#64748b">QR code is not configured for this payment method.</div>';const details=selected?.details||'';const match=details.match(/(?:UPI\s*ID|UPI)\s*:\s*([^\s]+)/i);const upi=match?.[1]||'';const feeRaw=String(selected?.fee||'').match(/[0-9]+(?:\.[0-9]+)?/);const amount=feeRaw?.[0]||'';document.querySelectorAll('.upi-app').forEach(a=>{if(selected?.key!=='india'||!upi){a.style.display='none';return}a.style.display='inline-flex';const params=`pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent('SoftGrowTech')}${amount?`&am=${encodeURIComponent(amount)}`:''}&cu=INR`;const scheme=a.dataset.app==='gpay'?'gpay://upi/pay':a.dataset.app==='phonepe'?'phonepe://pay':'paytmmp://pay';a.href=`${scheme}?${params}`})};
  document.querySelectorAll('.method-toggle').forEach(btn=>btn.onclick=()=>{const card=btn.closest('.method-card');document.querySelectorAll('.method-card').forEach(c=>{if(c!==card)c.classList.remove('open')});card.classList.toggle('open');document.getElementById('payMethod').value=card.dataset.key;updateQr()});
  document.getElementById('payMethod').onchange=updateQr;updateQr();
  let expiresAt=Date.now()+10*60*1000;const timerEl=document.getElementById('paymentTimer');const timer=setInterval(()=>{const left=Math.max(0,expiresAt-Date.now()),m=Math.floor(left/60000),sec=Math.floor(left/1000)%60;if(timerEl)timerEl.textContent=`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;if(!left){clearInterval(timer);if(timerEl)timerEl.textContent='00:00'}},250);
  document.getElementById('paymentForm').onsubmit=async e=>{e.preventDefault();const file=document.getElementById('receipt').files[0];if(!file)return;const path=`${u.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const up=await sb.storage.from('payment-receipts').upload(path,file);if(up.error)return toast(up.error.message);const selected=selectedMethod();const ins=await sb.rpc('sgt_record_payment_submission',{p_method:selected?.name||document.getElementById('payMethod').value,p_transaction_id:document.getElementById('txn').value.trim(),p_receipt_path:path,p_amount:selected?.fee||''});if(ins.error)return toast(ins.error.message);clearInterval(timer);root.innerHTML='<div class="portal-card"><div class="success-panel"><h1>Payment Submitted ✓</h1><p><strong>Your payment is Under Verification.</strong></p><p>You can now continue with the Selection Assessment while our team verifies the payment.</p></div><div class="portal-actions"><a class="portal-btn primary" href="assessment.html">Continue Selection Assessment →</a><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>'};
}
async function initContact(){const sf=document.getElementById('supportForm'),cf=document.getElementById('clientForm');if(cf){const svc=new URLSearchParams(location.search).get('service');if(svc&&document.getElementById('clientService'))document.getElementById('clientService').value=svc;cf.onsubmit=async e=>{e.preventDefault();const {error}=await sb.from('sgt_client_enquiries').insert({name:document.getElementById('clientName').value.trim(),company:document.getElementById('clientCompany').value.trim(),email:document.getElementById('clientEmail').value.trim(),phone:document.getElementById('clientPhone').value.trim(),service:document.getElementById('clientService').value,requirement:document.getElementById('clientRequirement').value.trim()});if(error)toast(error.message);else{toast('Thanks. Your enquiry has been received.');cf.reset()}}}if(sf)sf.onsubmit=async e=>{e.preventDefault();const u=await user(),p=u?await profile():null;const {error}=await sb.from('sgt_support_queries').insert({user_id:u?.id||null,student_id:p?.student_id||null,name:p?.name||document.getElementById('supportName')?.value||'Visitor',email:p?.email||document.getElementById('supportEmail')?.value||'',category:document.getElementById('supportCategory').value,query_text:document.getElementById('supportQuery').value.trim()});if(error)toast(error.message);else{toast('Query submitted successfully.');sf.reset()}}}
document.addEventListener('DOMContentLoaded',()=>{initRegister();initLogin();initFirstPassword();initReset();initPortal();initAssessment();initEnrollment();initContact();});
