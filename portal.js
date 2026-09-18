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
async function initRegister(){const f=document.getElementById('registerForm');if(!f)return;const dom=document.getElementById('domain'),requested=new URLSearchParams(location.search).get('domain');const {data:ds}=await sb.from('sgt_domains').select('name').eq('enabled',true).order('name');if(ds){dom.innerHTML=ds.map(d=>`<option>${esc(d.name)}</option>`).join('');if(requested&&ds.some(d=>d.name===requested))dom.value=requested}const gen=(n,p)=>{let a=n.trim().replace(/\s+/g,'').slice(0,3);a=a.charAt(0).toUpperCase()+a.slice(1).toLowerCase();return`SGT@${a}${p.replace(/\D/g,'').slice(-4)}`};const update=()=>{const el=document.getElementById('tempPreview');if(el)el.value=gen(document.getElementById('name').value,document.getElementById('phone').value)};f.addEventListener('input',update);update();f.onsubmit=async e=>{e.preventDefault();const b=f.querySelector('button');b.disabled=true;b.textContent='Creating registration…';try{const name=document.getElementById('name').value.trim(),email=document.getElementById('email').value.trim().toLowerCase(),phone=document.getElementById('phone').value.trim(),country=document.getElementById('country').value.trim(),study_year=document.getElementById('studyYear').value,gender=document.getElementById('gender').value,domain=dom.value,temp=gen(name,phone);if(!name||!email||!phone||!country||!study_year||!gender||!domain)throw Error('Please complete all required fields.');const {error}=await sb.auth.signUp({email,password:temp,options:{emailRedirectTo:location.origin+'/student-login.html',data:{full_name:name,phone,country,study_year,gender,domain,temp_password:temp,must_change_password:true}}});if(error)throw error;sessionStorage.setItem('sgt_new_registration',JSON.stringify({name,email,domain}));location.href='registration-success.html'}catch(err){toast(err.message||'Registration failed.');b.disabled=false;b.textContent='Create Registration →'}}}
async function initLogin(){const f=document.getElementById('loginForm');if(!f)return;f.onsubmit=async e=>{e.preventDefault();const b=f.querySelector('button');b.disabled=true;b.textContent='Signing in…';try{let id=document.getElementById('loginId').value.trim(),email=id;if(/^SGT-/i.test(id)){const {data:lookup,error}=await sb.rpc('sgt_lookup_login_email',{p_student_id:id.toUpperCase()});if(error)throw error;if(!lookup)throw Error('Student ID not found.');email=lookup}const {data:authData,error}=await sb.auth.signInWithPassword({email,password:document.getElementById('password').value});if(error)throw error;const meta=authData?.user?.user_metadata||{};const mustChange=meta.must_change_password===true||Boolean(meta.temp_password);location.href=mustChange?'create-password.html':'portal.html'}catch(err){toast(err.message||'Login failed.');b.disabled=false;b.textContent='Login →'}}}
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
async function getScheduleConfig(){const {data}=await sb.from('sgt_settings').select('value').eq('key','program_schedule').maybeSingle();return data?.value||{task1:{open:0,submit:5,deadline:6,presentation_start:7,presentation_end:8},task2:{open:9,submit:14,deadline:15,presentation_start:16,presentation_end:17},final:{open:18,submit:24,deadline:26,review_end:31}}}
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
    ['Task 1 — Work Window',addDays(programStart,sched.task1.open),addDays(programStart,Math.max(sched.task1.open,(sched.task1.submit||sched.task1.open)-1))],
    ['Task 1 — Submission',addDays(programStart,sched.task1.submit),addDays(programStart,sched.task1.deadline)],
    ['Task 1 — Presentation',addDays(programStart,sched.task1.presentation_start),addDays(programStart,sched.task1.presentation_end)],
    ['Task 2 — Work Window',addDays(programStart,sched.task2.open),addDays(programStart,Math.max(sched.task2.open,(sched.task2.submit||sched.task2.open)-1))],
    ['Task 2 — Submission',addDays(programStart,sched.task2.submit),addDays(programStart,sched.task2.deadline)],
    ['Task 2 — Presentation',addDays(programStart,sched.task2.presentation_start),addDays(programStart,sched.task2.presentation_end)],
    ['Final Project — Work Window',addDays(programStart,sched.final.open),addDays(programStart,Math.max(sched.final.open,(sched.final.submit||sched.final.open)-1))],
    ['Final Project — Submission',addDays(programStart,sched.final.submit),addDays(programStart,sched.final.deadline)],
    ['Review & Evaluation',addDays(programStart,27),addDays(programStart,sched.final.review_end)],
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
  document.getElementById('assessmentAction').innerHTML=action;
  document.getElementById('startReassessment')?.addEventListener('click',async()=>{const b=document.getElementById('startReassessment');b.disabled=true;b.textContent='Preparing…';const {error}=await sb.from('sgt_profiles').update({selection_round:2,assessment_status:'Not Started',review_status:'Pending',updated_at:new Date().toISOString()}).eq('id',u.id);if(error){toast(error.message);b.disabled=false;b.textContent='Re-Assessment →';return}location.href='assessment.html'});

  const [{data:tasks},{data:tf}]=await Promise.all([sb.from('sgt_tasks').select('*').eq('enabled',true).or(`domain.eq.${p.domain},domain.is.null`).order('title'),sb.from('sgt_settings').select('value').eq('key','task_forms').maybeSingle()]);
  const forms=tf?.value||{};
  const standard=[{task_key:'task1',title:'Task 1',description:'Complete any 2 of the 3 domain projects.',project_url:''},{task_key:'task2',title:'Task 2',description:'Complete the assigned domain project.',project_url:''},{task_key:'final',title:'Final Project',description:'Choose 1 of the 2 final project options.',project_url:''}];
  const taskItems=(tasks&&tasks.length)?tasks:standard;
  const formFor=t=>{const k=String(t.task_key||t.title).toLowerCase();if(k.includes('task1')||k.includes('task-1')||k.includes('task 1'))return forms.task1;if(k.includes('task2')||k.includes('task-2')||k.includes('task 2'))return forms.task2;if(k.includes('final'))return forms.final;return t.submission_url||''};
  const dateFor=(key,type)=>{const sc=key.includes('task1')||key.includes('task-1')||key.includes('task 1')?sched.task1:key.includes('task2')||key.includes('task-2')||key.includes('task 2')?sched.task2:sched.final;return programStart&&sc[type]!=null?addDays(programStart,sc[type]):null};
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
    return (noteRows||[]).map(x=>({id:x.id,realId:x.id,category:x.category||'Other',message:x.message,created_at:x.created_at,read:readIds.has(x.id)||localSet.has(x.id)})).filter(x=>x.message).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
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
    updateBadge();
    const panel=document.createElement('div');panel.id='studentNotificationPanel';panel.className='student-notification-panel';
    const unreadCount=notificationRows.filter(x=>!x.read).length;
    panel.innerHTML=`<div class="student-notification-panel-head"><div><strong>Notifications</strong><small>${unreadCount} unread</small></div><button class="close-btn" type="button" aria-label="Close notifications">×</button></div><div class="student-notification-list">${notificationRows.length?notificationRows.map(x=>`<button type="button" class="student-notification-item ${x.read?'read':'unread'}" data-note-id="${esc(x.id)}"><span class="note-icon">🔔</span><span><strong>${esc(x.category)}</strong><small>${esc(x.message)}</small><em>${adt(x.created_at)}${x.read?' • Seen':''}</em></span></button>`).join(''):'<div class="admin-note-empty">No notifications yet.</div>'}</div><div class="student-notification-panel-foot"><button type="button" class="portal-btn secondary" id="markAllNotifications">Mark all as seen</button></div>`;
    document.body.appendChild(panel);requestAnimationFrame(()=>panel.classList.add('open'));
    panel.querySelector('.close-btn').onclick=()=>panel.remove();
    panel.querySelectorAll('.student-notification-item').forEach(item=>item.onclick=async()=>{
      const n=notificationRows.find(x=>String(x.id)===String(item.dataset.noteId));
      if(n){await markNotificationRead(n);item.classList.remove('unread');item.classList.add('read');const em=item.querySelector('em');if(em&&!em.textContent.includes('Seen'))em.textContent+=' • Seen';const small=panel.querySelector('.student-notification-panel-head small');if(small)small.textContent=`${notificationRows.filter(x=>!x.read).length} unread`;}
    });
    panel.querySelector('#markAllNotifications').onclick=async()=>{
      for(const n of notificationRows)await markNotificationRead(n);
      panel.querySelectorAll('.student-notification-item').forEach(item=>{item.classList.remove('unread');item.classList.add('read');const em=item.querySelector('em');if(em&&!em.textContent.includes('Seen'))em.textContent+=' • Seen';});
      const small=panel.querySelector('.student-notification-panel-head small');if(small)small.textContent='0 unread';updateBadge();
    };
  };
  const showNotification=note=>{if(!note)return;const old=document.querySelector('.admin-note-popup');if(old)old.remove();const pop=document.createElement('div');pop.className='admin-note-popup';pop.innerHTML=`<div class="admin-note-panel is-new"><div class="admin-note-head"><span class="note-icon">🔔</span><div><strong>New Notification</strong><small>${esc(note.category)} • From SoftGrowTech Team</small></div><button type="button" class="close-btn" style="margin-left:auto">×</button></div><p>${esc(note.message)}</p><small class="admin-note-date">${adt(note.created_at)}</small><div class="portal-actions" style="margin-top:12px"><button type="button" class="portal-btn primary" id="popupMarkSeen">Mark as Seen</button></div></div>`;document.body.appendChild(pop);notificationBell?.classList.add('notification-bell-new');setTimeout(()=>notificationBell?.classList.remove('notification-bell-new'),900);pop.querySelector('.close-btn').onclick=()=>pop.remove();pop.querySelector('#popupMarkSeen').onclick=async()=>{await markNotificationRead(note);pop.remove()};setTimeout(()=>{if(pop.isConnected)pop.remove()},9000)};
  const updateNotifications=async(showPopup)=>{const before=new Set(notificationRows.filter(x=>!x.read).map(x=>x.id));notificationRows=await getStudentNotes();updateBadge();const newest=notificationRows.find(x=>!x.read);if(showPopup&&newest&&!before.has(newest.id))showNotification(newest)};
  // Notifications must never block the rest of the dashboard. A read-state/RLS/network issue should not prevent Documents or other sections from rendering.
  notificationBell?.addEventListener('click',openNotificationPanel);
  Promise.resolve(updateNotifications(false)).catch(e=>console.warn('Notification initialization failed.',e));
  setInterval(()=>updateNotifications(true).catch(e=>console.warn('Notification refresh failed.',e)),8000);


  function makeDocumentPdf(kind){
    if(!window.jspdf?.jsPDF)return null;
    const {jsPDF}=window.jspdf, doc=new jsPDF({unit:'mm',format:'a4'}); const W=210;
    doc.setFillColor(6,26,51); doc.rect(0,0,W,28,'F'); doc.setTextColor(255,255,255); doc.setFontSize(20); doc.setFont(undefined,'bold'); doc.text('SoftGrowTech',20,17); doc.setFontSize(9); doc.setFont(undefined,'normal'); doc.text('Learn • Build • Evolve',20,23);
    doc.setTextColor(15,23,42); doc.setFontSize(18); doc.setFont(undefined,'bold'); doc.text(kind==='offer'?'INTERNSHIP OFFER LETTER':'CERTIFICATE OF INTERNSHIP',W/2,48,{align:'center'});
    doc.setFontSize(11); doc.setFont(undefined,'normal');
    if(kind==='offer'){
      doc.text(`Offer Letter ID: ${p.offer_letter_id||'SGT-OFFER-'+String(p.student_id||'RECORD').replace(/[^0-9A-Z]/gi,'').slice(-10)}`,20,63); doc.text(`Issue Date: ${new Date().toLocaleDateString('en-GB')}`,20,72); doc.text(`Student ID: ${p.student_id||''}`,20,81); doc.text(`Domain: ${p.domain||''}`,20,90);
      doc.setFont(undefined,'bold'); doc.text(`Dear ${p.name||'Student'},`,20,107); doc.setFont(undefined,'normal');
      const lines=doc.splitTextToSize(`We are pleased to confirm your selection to join the SoftGrowTech Career Training & Internship Program in ${p.domain||'your selected domain'}. This is a one-month online, project-based learning experience with guided tasks, mentor support, project review, presentations and career preparation.`,170); doc.text(lines,20,117);
      doc.setFont(undefined,'bold'); doc.text('Program Details',20,139); doc.setFont(undefined,'normal'); doc.text(`Domain: ${p.domain||''}`,25,149); doc.text('Duration: 1 Month',25,158); doc.text('Mode: Online',25,167); doc.text('Experience: Project-Based Learning',25,176);
      doc.text('We look forward to seeing your practical work, participation and professional growth.',20,193);
    }else{
      doc.setFont(undefined,'normal'); doc.text('This certificate is awarded to',W/2,70,{align:'center'}); doc.setFontSize(22); doc.setFont(undefined,'bold'); doc.text(p.name||'Student',W/2,87,{align:'center'}); doc.setFontSize(11); doc.setFont(undefined,'normal'); doc.text('In recognition of successfully completing the Virtual Internship Program at SoftGrowTech',W/2,102,{align:'center'}); doc.setFont(undefined,'bold'); doc.text(p.domain||'',W/2,117,{align:'center'}); doc.setFont(undefined,'normal'); doc.text(`Program Period: ${programStart?dateFmt(programStart):''} – ${programEnd?dateFmt(programEnd):''}`,W/2,133,{align:'center'}); doc.text(`Certificate ID: ${p.certificate_id||'SGT-CERT-'+String(p.student_id||'CERT').replace(/[^0-9A-Z]/gi,'').slice(-10)}`,W/2,146,{align:'center'}); doc.text('Congratulations on your achievement.',W/2,166,{align:'center'});
    }
    doc.setFontSize(9); doc.text('SoftGrowTech • Practical learning, projects and career-focused development',20,278); return doc;
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
    const openDocumentViewer=(kind)=>{
      const d=makeDocumentPdf(kind);if(!d)return toast('PDF generator is unavailable.');
      const blob=d.output('blob'),url=URL.createObjectURL(blob),name=kind==='offer'?offerId:certificateId;
      const modal=document.createElement('div');modal.className='document-viewer-modal';modal.innerHTML=`<div class="document-viewer-card"><div class="document-viewer-head"><div><strong>${kind==='offer'?'Offer Letter':'Certificate'}</strong><small>${esc(name)} • Available</small></div><button type="button" class="close-btn" aria-label="Close document">×</button></div><iframe class="document-viewer-frame" title="${kind==='offer'?'Offer Letter':'Certificate'}" src="${url}"></iframe><div class="document-viewer-actions"><button type="button" class="portal-btn secondary" id="documentViewerClose">Close</button><button type="button" class="portal-btn primary" id="documentViewerDownload">Download PDF</button></div></div>`;
      document.body.appendChild(modal);document.body.classList.add('document-viewer-open');
      const close=()=>{URL.revokeObjectURL(url);modal.remove();document.body.classList.remove('document-viewer-open')};
      modal.querySelector('.close-btn').onclick=close;modal.querySelector('#documentViewerClose').onclick=close;modal.querySelector('#documentViewerDownload').onclick=()=>d.save(`${name}.pdf`);
      modal.addEventListener('click',e=>{if(e.target===modal)close()});
    };
    docBox.querySelectorAll('.generated-doc').forEach(b=>b.onclick=()=>openDocumentViewer(b.dataset.doc));
  }
  if(p.selection_status==='Selected'){
    try{const session=await sb.auth.getSession();const token=session.data.session?.access_token;if(token)await fetch(`${SGT_URL}/functions/v1/sgt-send-selection-email`,{method:'POST',headers:{Authorization:`Bearer ${token}`,apikey:SGT_KEY,'Content-Type':'application/json'},body:'{}'});}catch(e){console.warn('Selection email service unavailable.',e)}
  }
  let lastSelectionStatus=p.selection_status;
  setInterval(async()=>{try{const {data:latestProfile}=await sb.from('sgt_profiles').select('selection_status').eq('id',u.id).maybeSingle();if(latestProfile?.selection_status==='Selected'&&lastSelectionStatus!=='Selected'){lastSelectionStatus='Selected';const session=await sb.auth.getSession();const token=session.data.session?.access_token;if(token)await fetch(`${SGT_URL}/functions/v1/sgt-send-selection-email`,{method:'POST',headers:{Authorization:`Bearer ${token}`,apikey:SGT_KEY,'Content-Type':'application/json'},body:'{}'});location.reload()}}catch(e){}},15000);
}
async function initAssessment(){const root=document.getElementById('assessmentRoot');if(!root)return;const u=await user();if(!u){location.href='student-login.html';return}const p=await profile();if(!p)return;const set=p.selection_status==='Not Selected'?'reassessment':'primary';let {data:q}=await sb.from('sgt_assessment_questions').select('*').eq('domain',p.domain).eq('question_set',set).eq('enabled',true).order('question_no');if(!q?.length){root.innerHTML='<div class="portal-card"><h1>Assessment is being prepared</h1><p>Your domain-specific questions have not been published yet.</p><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div>';return}q=q.slice(0,10);if(p.assessment_status==='Complete'&&set==='reassessment'&&Number(p.selection_round||1)>=2){root.innerHTML=`<div class="portal-card"><div class="portal-kicker">Re-Assessment</div><h1>Re-Assessment Under Review</h1><div class="success-panel"><strong>Your re-assessment has already been submitted.</strong><p>Please wait for the management team to update your final selection/refund status.</p></div><div class="portal-actions"><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>`;return}if(p.assessment_status==='Complete'&&set==='primary'){root.innerHTML=`<div class="portal-card"><div class="portal-kicker">Selection Assessment</div><h1>Assessment Under Review</h1><div class="success-panel"><strong>Your assessment has already been submitted.</strong><p>Payment: ${esc(p.payment_status)}<br>Assessment: Complete<br>Overall Review: ${esc(p.review_status)}</p></div><div class="portal-actions"><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>`;return}let i=0,ans={};const intro=()=>{root.innerHTML=`<div class="portal-card"><div class="portal-kicker">Selection Assessment</div><h1>Before you begin</h1><p>This interview-style assessment helps our team understand your fundamentals, problem-solving approach and readiness for the selected program.</p><div class="portal-meta"><div class="meta-box"><small>Name</small><strong>${esc(p.name)}</strong></div><div class="meta-box"><small>Student ID</small><strong>${esc(p.student_id)}</strong></div><div class="meta-box"><small>Domain</small><strong>${esc(p.domain)}</strong></div><div class="meta-box"><small>Payment</small><strong>${esc(p.payment_status)}</strong></div></div><div class="help-note" style="margin-top:18px">First complete the enrollment payment step. After you submit your payment receipt and transaction ID, you can continue directly to this assessment while payment verification is in progress.</div><div class="portal-actions"><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a><button class="portal-btn primary" id="continueAssess">Continue →</button></div></div>`;document.getElementById('continueAssess').onclick=()=>{if(p.payment_status==='Pending')location.href='enrollment.html';else renderQuestion()}};const renderQuestion=()=>{root.innerHTML=`<div class="portal-card"><div class="portal-kicker">Selection Assessment</div><h1>Question ${i+1} of ${q.length}</h1><p>${esc(q[i].question)}</p><div class="help-note">${i} completed • ${q.length-i-1} remaining. Scores are not shown to students.</div><div class="field" style="margin-top:15px"><label>Your answer</label><textarea id="answer" rows="7" placeholder="Write your answer clearly…">${esc(ans[q[i].id]||'')}</textarea></div><div class="portal-actions"><button class="portal-btn secondary" id="prev" ${i===0?'disabled':''}>← Previous</button><button class="portal-btn primary" id="next">${i===q.length-1?'Review & Submit →':'Save & Continue →'}</button></div></div>`;document.getElementById('prev').onclick=()=>{ans[q[i].id]=document.getElementById('answer').value;i--;renderQuestion()};document.getElementById('next').onclick=()=>{ans[q[i].id]=document.getElementById('answer').value;if(i<q.length-1){i++;renderQuestion();return}renderReview()}};const renderReview=()=>{root.innerHTML=`<div class="portal-card"><div class="portal-kicker">Final Check</div><h1>Review Your Answers</h1><p>Please carefully check all your answers before final submission. Once submitted, your assessment will be sent for evaluation.</p>${q.map((x,n)=>`<div class="review-answer"><small>Question ${n+1}</small><strong>${esc(x.question)}</strong><p style="margin:7px 0 0;white-space:pre-wrap">${esc(ans[x.id]||'No answer provided')}</p></div>`).join('')}<div class="help-note" style="margin-top:18px">Please make sure your answers are complete and correct before you submit.</div><div class="portal-actions"><button class="portal-btn secondary" id="backCheck">← Back & Check Answers</button><button class="portal-btn primary" id="finalSubmit">Submit Assessment →</button></div></div>`;document.getElementById('backCheck').onclick=()=>renderQuestion();document.getElementById('finalSubmit').onclick=async()=>{const btn=document.getElementById('finalSubmit');btn.disabled=true;btn.textContent='Submitting…';const {data:a,error}=await sb.from('sgt_assessment_attempts').insert({student_id:p.student_id,user_id:u.id,attempt_no:Date.now(),question_set:set,status:'Complete',submitted_at:new Date().toISOString()}).select().single();if(error){toast(error.message);btn.disabled=false;btn.textContent='Submit Assessment →';return}const {error:ae}=await sb.from('sgt_assessment_answers').insert(q.map(x=>({attempt_id:a.id,question_id:x.id,answer:ans[x.id]||''})));if(ae){toast(ae.message);return}const mark=await sb.rpc('sgt_mark_assessment_review');if(mark.error)return toast(mark.error.message);root.innerHTML='<div class="portal-card"><div class="success-panel"><h1>Submission Received ✓</h1><p><strong>Payment and Selection Assessment are now Under Review.</strong></p><p>Our team will review your submitted payment details and assessment. Your selection status will be updated after the review is completed.</p></div><div class="portal-actions"><a class="portal-btn primary" href="portal.html">Back to Dashboard →</a></div></div>'}};intro()}
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
  if(cfg.india?.enabled)methods.push({key:'india',name:'India — UPI',fee:`${cfg.india.fee||'149'} ${cfg.india.currency||'INR'}`,details:cfg.india.details||'',qr:cfg.india.qr_url||''});
  if(cfg.pakistan?.enabled)methods.push({key:'pakistan',name:'Pakistan — JazzCash / Easypaisa',fee:`${cfg.pakistan.fee||'499'} ${cfg.pakistan.currency||'PKR'}`,details:cfg.pakistan.details||'',qr:cfg.pakistan.qr_url||''});
  const intl=cfg.international||{};
  ['binance','paypal','wise'].forEach(k=>{
    const x=intl[k]||{};
    if(x.enabled!==false)methods.push({key:k,name:k==='binance'?'Binance':k==='paypal'?'PayPal':'Wise',fee:`${x.fee||intl.fee||'5'} ${x.currency||intl.currency||'USD'}`,details:x.details||'',qr:x.qr_url||''});
  });
  root.innerHTML=`<div class="portal-card"><div class="portal-kicker">Enrollment</div><h1>Enroll Fee & Payment</h1><p>Choose your payment method, review the complete payment details, then submit your transaction ID and receipt. You can continue to the selection assessment while payment verification is in progress.</p><div class="help-note">🔐 <strong>Payment Verification in Progress</strong><br>Your payment details will be reviewed by our team. You may continue with the interview-based assessment while your payment is being verified.</div><h3 style="margin-top:22px">Choose Payment Method</h3><div id="methodList">${methods.map((x,n)=>`<div class="method-card ${n===0?'open':''}" data-key="${esc(x.key)}"><button class="method-toggle" type="button"><span>${esc(x.name)}</span><span>${esc(x.fee)} ▾</span></button><div class="method-body"><p><strong>Payment Details</strong>\n${esc(x.details||'Payment details are configured by SoftGrowTech.')}</p>${x.qr?`<img class="receipt-preview" src="${esc(x.qr)}" alt="${esc(x.name)} QR">`:''}</div></div>`).join('')}</div><form id="paymentForm" class="form-grid" style="margin-top:22px"><div class="field"><label>Payment Method</label><select id="payMethod" required>${methods.map(x=>`<option value="${esc(x.key)}">${esc(x.name)}</option>`).join('')}</select></div><div class="field"><label>Transaction ID</label><input id="txn" required></div><div class="field"><label>Receipt</label><input id="receipt" type="file" accept="image/*,.pdf" required></div><div class="field"><label>Student ID</label><input value="${esc(p.student_id)}" disabled></div><div class="field"><label>Registered Gmail</label><input value="${esc(p.email)}" disabled></div><div class="field full"><button class="portal-btn primary" type="submit">Submit Payment for Verification →</button></div></form><div class="portal-actions"><a class="portal-btn secondary" href="assessment.html">Continue Selection Assessment →</a><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>`;
  document.querySelectorAll('.method-toggle').forEach(btn=>btn.onclick=()=>{const card=btn.closest('.method-card');document.querySelectorAll('.method-card').forEach(c=>{if(c!==card)c.classList.remove('open')});card.classList.toggle('open');document.getElementById('payMethod').value=card.dataset.key});
  document.getElementById('paymentForm').onsubmit=async e=>{
    e.preventDefault();
    const file=document.getElementById('receipt').files[0];
    if(!file)return;
    const path=`${u.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
    const up=await sb.storage.from('payment-receipts').upload(path,file);
    if(up.error)return toast(up.error.message);
    const selected=methods.find(x=>x.key===document.getElementById('payMethod').value);
    const ins=await sb.rpc('sgt_record_payment_submission',{p_method:selected?.name||document.getElementById('payMethod').value,p_transaction_id:document.getElementById('txn').value.trim(),p_receipt_path:path,p_amount:selected?.fee||''});
    if(ins.error)return toast(ins.error.message);
    root.innerHTML='<div class="portal-card"><div class="success-panel"><h1>Payment Submitted ✓</h1><p><strong>Your payment is Under Verification.</strong></p><p>You can now continue with the Selection Assessment while our team verifies the payment.</p></div><div class="portal-actions"><a class="portal-btn primary" href="assessment.html">Continue Selection Assessment →</a><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>';
  };
}
async function initContact(){const sf=document.getElementById('supportForm'),cf=document.getElementById('clientForm');if(cf){const svc=new URLSearchParams(location.search).get('service');if(svc&&document.getElementById('clientService'))document.getElementById('clientService').value=svc;cf.onsubmit=async e=>{e.preventDefault();const {error}=await sb.from('sgt_client_enquiries').insert({name:document.getElementById('clientName').value.trim(),company:document.getElementById('clientCompany').value.trim(),email:document.getElementById('clientEmail').value.trim(),phone:document.getElementById('clientPhone').value.trim(),service:document.getElementById('clientService').value,requirement:document.getElementById('clientRequirement').value.trim()});if(error)toast(error.message);else{toast('Thanks. Your enquiry has been received.');cf.reset()}}}if(sf)sf.onsubmit=async e=>{e.preventDefault();const u=await user(),p=u?await profile():null;const {error}=await sb.from('sgt_support_queries').insert({user_id:u?.id||null,student_id:p?.student_id||null,name:p?.name||document.getElementById('supportName')?.value||'Visitor',email:p?.email||document.getElementById('supportEmail')?.value||'',category:document.getElementById('supportCategory').value,query_text:document.getElementById('supportQuery').value.trim()});if(error)toast(error.message);else{toast('Query submitted successfully.');sf.reset()}}}
document.addEventListener('DOMContentLoaded',()=>{initRegister();initLogin();initFirstPassword();initReset();initPortal();initAssessment();initEnrollment();initContact();});
