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
async function initRegister(){
  const f=document.getElementById('registerForm');if(!f)return;
  const dom=document.getElementById('domain'),requested=new URLSearchParams(location.search).get('domain'),code=document.getElementById('callingCode'),countryEl=document.getElementById('country'),countryHelp=document.getElementById('countryHelp'),regError=document.getElementById('registrationError'),phoneEl=document.getElementById('phone');
  const {data:ds}=await sb.from('sgt_domains').select('name').eq('enabled',true).order('name');
  if(ds){dom.innerHTML=ds.map(d=>`<option>${esc(d.name)}</option>`).join('');if(requested&&ds.some(d=>d.name===requested))dom.value=requested}
  const showPhoneError=(message='',isError=false)=>{const help=document.getElementById('phoneHelp');if(!help)return;help.textContent=message;help.classList.toggle('error',isError)};
  const showCountryError=(message='',isError=false)=>{if(!countryHelp)return;countryHelp.textContent=message;countryHelp.classList.toggle('error',isError)};
  const syncCountry=()=>{const opt=code?.selectedOptions?.[0],c=opt?.dataset?.country,iso=opt?.dataset?.iso,flag=document.getElementById('callingFlag'),selected=Boolean(code?.value);if(countryEl)countryEl.value=c||'';if(flag)flag.innerHTML=iso?`<img src="https://flagcdn.com/w40/${iso}.png" width="24" height="18" alt="${esc(c||'Country')}" loading="eager" referrerpolicy="no-referrer">`:'<span class="calling-flag-placeholder">🌐</span>';showCountryError('',false);if(phoneEl){phoneEl.disabled=!selected;phoneEl.placeholder='';if(!selected){phoneEl.value='';showPhoneError('Please select your country calling code first.',true)}else{showPhoneError('');setTimeout(()=>phoneEl.focus(),0)}}};
  code?.addEventListener('change',syncCountry);syncCountry();
  const gen=(n,p)=>{let a=n.trim().replace(/\s+/g,'').slice(0,3);a=a.charAt(0).toUpperCase()+a.slice(1).toLowerCase();return`SGT@${a}${p.replace(/\D/g,'').slice(-4)}`};
  const update=()=>{const el=document.getElementById('tempPreview');if(el)el.value=gen(document.getElementById('name').value,phoneEl.value)};f.addEventListener('input',update);update();
  const countryRules={in:{min:10,max:10,starts:/^[6-9]/},pk:{min:10,max:10,starts:/^3/},za:{min:9,max:9,starts:/^[6-8]/},bd:{min:10,max:10,starts:/^1/},gb:{min:10,max:10,starts:/^7/},us:{min:10,max:10},ca:{min:10,max:10},au:{min:9,max:9,starts:/^4/},ae:{min:9,max:9,starts:/^5/},sa:{min:9,max:9,starts:/^5/},de:{min:7,max:11},fr:{min:9,max:9,starts:/^[67]/},it:{min:9,max:10},es:{min:9,max:9,starts:/^[6789]/},nl:{min:9,max:9,starts:/^6/},be:{min:9,max:9,starts:/^4/},ch:{min:9,max:9,starts:/^7/},ru:{min:10,max:10,starts:/^9/},jp:{min:10,max:10,starts:/^(70|80|90)/},kr:{min:9,max:10,starts:/^1/},cn:{min:11,max:11,starts:/^1/},sg:{min:8,max:8,starts:/^[689]/},my:{min:9,max:10,starts:/^1/},nz:{min:8,max:10,starts:/^2/},ng:{min:10,max:10,starts:/^[789]/},ke:{min:9,max:9,starts:/^[17]/},eg:{min:10,max:10,starts:/^1/}};
  const allCodes=[...new Set([...code.options].map(o=>o.value).filter(Boolean))].map(x=>x.replace('+',''));
  const validatePhone=()=>{
    const opt=code.selectedOptions?.[0],iso=opt?.dataset?.iso||'',cc=(code.value||'').replace('+',''),raw=phoneEl.value.trim();
    if(!cc||!iso||!raw)return {ok:false,msg:!cc||!iso?'Please select your country calling code first.':'Please enter your mobile number.'};
    if(/[a-z]/i.test(raw))return {ok:false,msg:'Please enter a valid mobile number.'};
    const phoneLib=window.libphonenumber;
    if(phoneLib?.parsePhoneNumberFromString){try{const parsed=phoneLib.parsePhoneNumberFromString(raw,iso.toUpperCase());if(!parsed||!parsed.isValid()||parsed.country!==iso.toUpperCase()||parsed.countryCallingCode!==cc)return {ok:false,msg:`The mobile number does not match the selected country (${opt.dataset.country}).`};return {ok:true,digits:parsed.nationalNumber};}catch(_){}}
    let digits=raw.replace(/\D/g,'');
    if(raw.startsWith('+')||raw.startsWith('00')){
      const normalized=raw.startsWith('00')?raw.slice(2):raw.slice(1);const foreign=allCodes.find(x=>normalized.startsWith(x));
      if(foreign&&foreign!==cc)return {ok:false,msg:`The mobile number does not match the selected country (${opt.dataset.country}).`};
      if(normalized.startsWith(cc))digits=normalized.slice(cc.length);
    }
    digits=digits.replace(/^0+/,'');
    const rule=countryRules[iso];
    if(!rule)return {ok:digits.length>=6&&digits.length<=15,msg:digits.length>=6&&digits.length<=15?'':'Please enter a valid mobile number.'};
    if(digits.length<rule.min||digits.length>rule.max||rule.starts&&!rule.starts.test(digits))return {ok:false,msg:`Please enter a valid ${opt.dataset.country} mobile number for ${code.value}.`};
    return {ok:true,digits};
  };
  phoneEl.addEventListener('input',()=>{if(!code.value){phoneEl.value='';showPhoneError('Please select your country calling code first.',true);return}phoneEl.value=phoneEl.value.replace(/\D/g,'');const raw=phoneEl.value.trim();if(!raw){showPhoneError(`Enter your ${code.selectedOptions?.[0]?.dataset?.country||'valid'} mobile number.`);return}const v=validatePhone();showPhoneError(v.ok?'':v.msg,!v.ok)});phoneEl.addEventListener('blur',()=>{if(!phoneEl.value.trim()){showPhoneError(`Enter your ${code.selectedOptions?.[0]?.dataset?.country||'valid'} mobile number.`);return}const v=validatePhone();showPhoneError(v.ok?'':v.msg,!v.ok)});code.addEventListener('change',()=>{syncCountry()});
  f.onsubmit=async e=>{e.preventDefault();const b=f.querySelector('button');b.disabled=true;b.textContent='Creating registration…';if(regError){regError.hidden=true;regError.textContent=''}try{
    const name=document.getElementById('name').value.trim(),email=document.getElementById('email').value.trim().toLowerCase(),rawPhone=phoneEl.value.trim(),callingCode=code.value,country=countryEl.value.trim(),address=document.getElementById('address')?.value.trim()||'',study_year=document.getElementById('studyYear').value,gender=document.getElementById('gender').value,domain=dom.value,temp=gen(name,rawPhone),phoneCheck=validatePhone();
    showPhoneError(phoneCheck.ok?'':phoneCheck.msg,!phoneCheck.ok);if(!phoneCheck.ok)throw Error(phoneCheck.msg);
    const phone=callingCode+phoneCheck.digits;
    if(!name||!email||!callingCode||!country||!study_year||!gender||!domain)throw Error('Please complete all required fields.');
    const {data:isRegistered,error:checkError}=await sb.rpc('sgt_check_registered_email',{p_email:email});
    if(!checkError&&isRegistered===true){if(regError){regError.innerHTML='<strong>Registration Already Exists</strong><br>This Gmail address is already registered with SoftGrowTech. Please use your existing registration instead of creating a new one.';regError.hidden=false}b.disabled=false;b.textContent='Create Registration →';return}
    const validationResponse=await fetch(`${SGT_URL}/functions/v1/sgt-validate-registration`,{method:'POST',headers:{apikey:SGT_KEY,'Content-Type':'application/json'},body:JSON.stringify({calling_code:callingCode,country,iso:code.selectedOptions?.[0]?.dataset?.iso||'',phone:phoneCheck.digits})});const validationResult=await validationResponse.json().catch(()=>({}));if(!validationResponse.ok)throw Error(validationResult.error||'Unable to validate the mobile number. Please try again.');
    const {data:groupSetting}=await sb.from('sgt_settings').select('value').eq('key','registration_group').maybeSingle();const whatsapp_group_url=groupSetting?.value?.url||'';
    const {error}=await sb.auth.signUp({email,password:temp,options:{emailRedirectTo:location.origin+'/student-login.html',data:{full_name:name,phone,country,calling_code:callingCode,study_year,gender,domain,address,temp_password:temp,must_change_password:true,whatsapp_group_url}}});
    if(error)throw error;sessionStorage.setItem('sgt_new_registration',JSON.stringify({name,email,domain}));location.href='registration-success.html'
  }catch(err){if(regError&&/already|registered|exists/i.test(err.message||'')){regError.innerHTML='<strong>Registration Already Exists</strong><br>This Gmail address is already registered with SoftGrowTech. Please use your existing registration instead of creating a new one.';regError.hidden=false}else{if(regError){regError.textContent=err.message||'Registration failed.';regError.hidden=false}else toast(err.message||'Registration failed.')}b.disabled=false;b.textContent='Create Registration →'}}}

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

  const [sched,batchScheduleInfo]=await Promise.all([getScheduleConfig(),programStart?sb.from('sgt_batches').select('*').eq('start_date',programStart).maybeSingle():Promise.resolve({data:null})]);
  const orientationScheduleDate=sched.orientation?.date||batchScheduleInfo?.data?.orientation_date||orient;
  const orientationScheduleStateComplete=Boolean(sched.orientation?.completed||batchScheduleInfo?.data?.orientation_completed||batchScheduleInfo?.data?.orientation_status==='Complete');
  const scheduleItems=programStart?[
    ['Orientation Session',orientationScheduleDate,orientationScheduleDate],
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
    if(n==='Orientation Session')return orientationScheduleStateComplete?'Orientation Complete':state==='current'?'Orientation Today':state==='complete'?'Orientation Pending':'Orientation Upcoming';
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
  const {data:batchRow}=p.batch_start?await sb.from('sgt_batches').select('whatsapp_group_url').eq('start_date',p.batch_start).maybeSingle():{data:null};
  const registrationGroupFromAuth=u.user_metadata?.whatsapp_group_url||'';const groupUrl=p.whatsapp_group_url||registrationGroupFromAuth||batchRow?.whatsapp_group_url||(!p.batch_start?(grp?.value?.url||''):'');
  const groupAction=document.getElementById('groupAction');
  const groupLabel=p.batch_start?`SoftGrowTech ${dateFmt(p.batch_start)} Batch`:'SoftGrowTech Current Batch';
  if(groupAction) groupAction.innerHTML=`<div class="portal-card" style="margin-top:18px;border-color:#dbeafe;background:linear-gradient(180deg,#f8fbff,#fff)"><div class="portal-section-title"><div><div class="portal-kicker">Official Batch Group</div><h2 style="margin-bottom:4px">${esc(groupLabel)}</h2><p style="margin:0">Important updates, schedules, tasks and program information will be shared there. Joining the group is required.</p></div></div>${groupUrl?`<div class="portal-actions"><a class="portal-btn primary" href="${esc(groupUrl)}" target="_blank" rel="noopener">Join ${esc(groupLabel)} →</a></div>`:'<div class="help-note" style="margin-top:12px">Your batch group link will appear here once it is assigned.</div>'}</div>`;

  let action='';
  const hasPaid=['Under Verification','Verified'].includes(String(p.payment_status||''));
  const assessmentStartHref=(hasPaid&&p.assessment_status!=='Complete')?'assessment.html?start=1':'assessment.html';
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
    action='<div class="success-panel"><strong>Assessment Already Submitted</strong><p style="margin:6px 0 0">Your assessment has already been submitted and is currently under review. Please wait for the result.</p></div><div class="portal-actions"><a class="portal-btn secondary" href="assessment.html">View Assessment Status</a></div>';
  }else{
    action=`<div class="portal-actions"><a class="portal-btn primary" href="${assessmentStartHref}">Start Selection Assessment →</a></div>`;
  }
  document.getElementById('assessmentAction').innerHTML=`<div class="assessment-action-highlight">${action}</div>`;
  document.getElementById('startReassessment')?.addEventListener('click',async()=>{const b=document.getElementById('startReassessment');b.disabled=true;b.textContent='Preparing…';const {error}=await sb.from('sgt_profiles').update({selection_round:2,assessment_status:'Not Started',review_status:'Pending',updated_at:new Date().toISOString()}).eq('id',u.id);if(error){toast(error.message);b.disabled=false;b.textContent='Re-Assessment →';return}location.href='assessment.html'});

  const [{data:tasks},{data:tf}]=await Promise.all([
    sb.from('sgt_tasks').select('*').eq('enabled',true).or(`domain.eq.${p.domain},domain.is.null`).order('title'),
    sb.from('sgt_settings').select('value').eq('key','task_forms').maybeSingle()
  ]);
  const batchInfo=batchScheduleInfo?.data||null;
  const forms=tf?.value||{};
  const standard=[
    {task_key:'task1',title:'Task 1',description:'Complete the assigned domain work.',project_url:''},
    {task_key:'task2',title:'Task 2',description:'Complete the assigned domain work.',project_url:''}
  ];
  const domainKey=String(p.domain||'').trim().toLowerCase();
  const finalProjects={
    'web development':'https://drive.google.com/file/d/1PotEI7mytZ7cWo_vSu0CoOyH_EF1vCP8/view?usp=drivesdk',
    'android app development':'https://drive.google.com/file/d/1Ppbx8qG0aygPdI38eg0EBPIJPxpSbpeI/view?usp=drivesdk',
    'java programming':'https://drive.google.com/file/d/1PXzP7tdjzlNHFM4rDhX_MDjq2du9NUMM/view?usp=drivesdk',
    'python programming':'https://drive.google.com/file/d/1PV_Om7Z7hgdgB4btkcaGyNvsCGc6U38u/view?usp=drivesdk',
    'artificial intelligence':'https://drive.google.com/file/d/1PPdwxVi45DZ7ikrZ5e--jseIop0Sqce-/view?usp=drivesdk',
    'machine learning':'https://drive.google.com/file/d/1PZSYX0IhC3ZXwBjGznPKlwZCzp9ljlmL/view?usp=drivesdk',
    'data science':'https://drive.google.com/file/d/1Pkt8LwnLiOFf9pFYQ111ADX6ihDI9qqH/view?usp=drivesdk',
    'c++ programming':'https://drive.google.com/file/d/1POrWfEcgP_yjD7xEXH3AcfiE7eFVULzE/view?usp=drivesdk',
    'internet of things':'https://drive.google.com/file/d/1PAQz83topBcJwqvcYLyxtyq3JSJwkmb2/view?usp=drivesdk',
    'c programming':'https://drive.google.com/file/d/1PJO3fkmyIOyq5M7Qf1h-7dnUpY13WPBo/view?usp=drivesdk',
    'ui/ux design':'https://drive.google.com/file/d/1z-rT6WDMtisiq8R6NKbAN1dlrDGsdR9B/view?usp=drivesdk',
    'data analysis':'https://drive.google.com/file/d/1yrswsfj4EcBYBvs4F79EO-6yLokxdEvF/view?usp=drivesdk',
    'graphic designing':'https://drive.google.com/file/d/1yy-bwmxiSQbZMiybOnwa3XAOd3XT20FL/view?usp=drivesdk',
    'frontend development':'https://drive.google.com/file/d/1yufYIbFdUGcCIGsqb5fNSs4g9YX4iL8m/view?usp=drivesdk',
    'backend development':'https://drive.google.com/file/d/1ytYpfHHeweGhs--V7pqRFH1jnKR9al-u/view?usp=drivesdk',
    'flutter development':'https://drive.google.com/file/d/1yiRwfOoD8T04d0_kspX_m_JKZDepLGFK/view?usp=drivesdk'
  };
  const finalProjectUrl=finalProjects[domainKey]||'';
  const taskItems=(tasks&&tasks.length)?tasks.filter(t=>!String(t.task_key||t.title).toLowerCase().includes('final')):standard;
  const formFor=t=>{const k=String(t.task_key||t.title).toLowerCase();if(k.includes('task1')||k.includes('task-1')||k.includes('task 1'))return forms.task1;if(k.includes('task2')||k.includes('task-2')||k.includes('task 2'))return forms.task2;return t.submission_url||''};
  const dateFor=(key,type)=>{const sc=key.includes('task1')||key.includes('task-1')||key.includes('task 1')?sched.task1:key.includes('task2')||key.includes('task-2')||key.includes('task 2')?sched.task2:sched.final;const fallback={open:key.includes('task1')?0:key.includes('task2')?9:18,submit:key.includes('task1')?5:key.includes('task2')?14:24,deadline:key.includes('task1')?6:key.includes('task2')?15:26,presentation_start:key.includes('task1')?7:16,presentation_end:key.includes('task1')?8:17,review_start:27,review_end:31}[type];return scheduleDate(programStart,sc?.[type],fallback)};
  const projectAccess=p.selection_status==='Selected'&&(p.payment_status==='Verified'||p.admin_project_override===true);
  const orientationDate=batchInfo?.orientation_date||orient;
  const orientationComplete=Boolean(batchInfo?.orientation_completed||batchInfo?.orientation_status==='Complete');
  if(!projectAccess){
    const reason=p.selection_status!=='Selected'?'Selection is required before project access.':p.payment_status!=='Verified'?'Project access will open after payment verification.':'Project access is currently restricted.';
    document.getElementById('taskList').innerHTML=`<div class="help-note"><strong>Projects are not live yet.</strong><br>${esc(reason)}</div>`;
  }else{
    const task1=taskItems.filter(t=>{const k=String(t.task_key||t.title).toLowerCase();return k.includes('task1')||k.includes('task-1')||k.includes('task 1')});
    const task2=taskItems.filter(t=>{const k=String(t.task_key||t.title).toLowerCase();return k.includes('task2')||k.includes('task-2')||k.includes('task 2')});
    const renderStage=(title,description,start,end,kind,extra='')=>{
      const state=rangeState(start,end);
      const deadline=(kind==='task1-submit'||kind==='task2-submit'||kind==='final-submit')?end:null;
      const isClosed=Boolean(deadline&&today>escDate(deadline));
      let status='Upcoming',dot='upcoming',actions='';
      if(kind==='orientation'){
        if(orientationComplete)status='Orientation Complete'; else if(start&&today>=escDate(start))status='Orientation Pending'; else status=start?'Starts on '+dateFmt(start):'Coming Soon';
        dot=orientationComplete?'complete':today>=escDate(start)?'current':'upcoming';
      } else if(isClosed){status='Closed';dot='complete';actions='<a class="portal-btn secondary" href="https://wa.me/917839686310" target="_blank" rel="noopener">Couldn’t submit on time? 💬 Get Help</a>'}
      else if(start&&today<escDate(start)){status='Starts on '+dateFmt(start);dot='upcoming'}
      else if(end&&today<=escDate(end)){status=kind.endsWith('-submit')?'Submission Open':kind==='task1-work'||kind==='task2-work'||kind==='final-work'?'In Progress':kind.includes('presentation')?'Presentation Live':'In Progress';dot='current'}
      else {status=kind.includes('presentation')?'Completed':kind.endsWith('-submit')?'Closed':'Completed';dot='complete'}
      return `<div class="timeline-item"><span class="timeline-dot ${dot}"></span><div style="flex:1"><strong>${esc(title)}</strong><small>${esc(description)}${start?' • '+esc(rangeLabel(start,end)):' • Coming Soon'}</small><div style="margin-top:10px"><span class="status ${status==='Closed'?'danger':dot==='complete'?'success':dot==='current'?'blue':'warn'}">${esc(status)}</span></div><div class="portal-actions">${actions}${extra}</div></div></div>`;
    };
    const task1Open=dateFor('task1','open'),task1Submit=dateFor('task1','submit'),task1Deadline=dateFor('task1','deadline'),task1PresStart=dateFor('task1','presentation_start'),task1PresEnd=dateFor('task1','presentation_end');
    const task2Open=dateFor('task2','open'),task2Submit=dateFor('task2','submit'),task2Deadline=dateFor('task2','deadline'),task2PresStart=dateFor('task2','presentation_start'),task2PresEnd=dateFor('task2','presentation_end');
    const finalOpen=dateFor('final','open'),finalSubmit=dateFor('final','submit'),finalDeadline=dateFor('final','deadline');
    const taskProjectLinks=(arr)=>arr.map(t=>t.project_url?`<a class="portal-btn secondary" target="_blank" rel="noopener" href="${esc(t.project_url)}">Open Project Instructions</a>`:'').join('');
    const task1Extra=taskProjectLinks(task1),task2Extra=taskProjectLinks(task2);
    const finalExtra=finalProjectUrl?`<a class="portal-btn secondary" target="_blank" rel="noopener" href="${esc(finalProjectUrl)}">Open Final Project</a>`:'';
    const finalWorkEnd=finalSubmit?addDays(finalSubmit,-1):addDays(finalOpen,5);
    const activityStartRaw=sched.activities?.start||batchInfo?.activities_start||null;
    const activityEndRaw=sched.activities?.end||batchInfo?.activities_end||null;
    const activityStart=activityStartRaw||(finalDeadline?addDays(finalDeadline,1):finalOpen);
    const activityEnd=activityEndRaw||programEnd;
    const stages=[];
    stages.push(renderStage('Orientation','Batch orientation session',orientationDate,orientationDate,'orientation'));
    stages.push(renderStage('Task 1','Complete the assigned Task 1 domain work.',task1Open,task1Submit?addDays(task1Submit,-1):task1Open,'task1-work',task1Extra));
    stages.push(renderStage('Task 1 Submission','Submit your Task 1 work using the configured submission form.',task1Submit,task1Deadline,'task1-submit',task1Submit&&today>=escDate(task1Submit)&&!(task1Deadline&&today>escDate(task1Deadline))&&forms.task1?`<a class="portal-btn primary" target="_blank" rel="noopener" href="${esc(forms.task1)}">Submit Task 1 →</a>`:''));
    stages.push(renderStage('Task 1 Presentation','Task 1 presentation session.',task1PresStart,task1PresEnd,'task1-presentation'));
    stages.push(renderStage('Task 2','Complete the assigned Task 2 domain work.',task2Open,task2Submit?addDays(task2Submit,-1):task2Open,'task2-work',task2Extra));
    stages.push(renderStage('Task 2 Submission','Submit your Task 2 work using the configured submission form.',task2Submit,task2Deadline,'task2-submit',task2Submit&&today>=escDate(task2Submit)&&!(task2Deadline&&today>escDate(task2Deadline))&&forms.task2?`<a class="portal-btn primary" target="_blank" rel="noopener" href="${esc(forms.task2)}">Submit Task 2 →</a>`:''));
    stages.push(renderStage('Task 2 Presentation','Task 2 presentation session.',task2PresStart,task2PresEnd,'task2-presentation'));
    stages.push(renderStage('Final Project','Complete the Final Project for your registered domain.',finalOpen,finalWorkEnd,'final-work',finalExtra));
    stages.push(renderStage('Final Project Submission','Submit your Final Project using the configured submission form.',finalSubmit,finalDeadline,'final-submit',finalSubmit&&today>=escDate(finalSubmit)&&!(finalDeadline&&today>escDate(finalDeadline))&&forms.final?`<a class="portal-btn primary" target="_blank" rel="noopener" href="${esc(forms.final)}">Submit Final Project →</a>`:''));
    stages.push(renderStage('Activities','Post-project activities and career preparation until the batch end date.',activityStart,activityEnd,'activities'));
    document.getElementById('taskList').innerHTML=stages.join('');
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
        const blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob);
        const documentTitle=kind==='offer'?'Offer Letter':'Certificate';
        const cleanStudentName=String(p.name||'Student').trim().replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'')||'Student'; const cleanStudentId=String(p.student_id||p.studentId||p.id||'StudentID').trim().replace(/[^a-zA-Z0-9-]+/g,'_').replace(/^_+|_+$/g,'')||'StudentID'; const downloadFilename=`${cleanStudentName}_${kind==='offer'?'OfferLetter':'Certificate'}_${cleanStudentId}_SoftGrowTech.pdf`;
        const modal=document.createElement('div');modal.className='document-viewer-modal';modal.innerHTML=`<div class="document-viewer-card"><div class="document-viewer-head"><div><strong>${documentTitle}</strong><small>${esc(kind==='offer'?offerId:certificateId)} • Available</small></div><button type="button" class="close-btn" aria-label="Close document">×</button></div><iframe class="document-viewer-frame" title="${documentTitle}" src="${url}"></iframe><div class="document-viewer-actions"><button type="button" class="portal-btn secondary" id="documentViewerClose">Close</button><button type="button" class="portal-btn primary" id="documentViewerDownload">Download PDF</button></div></div>`;
        document.body.appendChild(modal);document.body.classList.add('document-viewer-open');
        const close=()=>{URL.revokeObjectURL(url);modal.remove();document.body.classList.remove('document-viewer-open')};
        modal.querySelector('.close-btn').onclick=close;modal.querySelector('#documentViewerClose').onclick=close;
        modal.querySelector('#documentViewerDownload').onclick=()=>{const a=document.createElement('a');a.href=url;a.download=downloadFilename;a.click()};
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
  const root=document.getElementById('assessmentRoot');if(!root)return;
  const u=await user();if(!u){location.href='student-login.html';return}const p=await profile();if(!p)return;
  const today=new Date();today.setHours(0,0,0,0);const orientationDate=p.batch_start?addDays(p.batch_start,-2):null;const {data:assessmentBatch}=p.batch_start?await sb.from('sgt_batches').select('orientation_date,orientation_status,orientation_completed').eq('start_date',p.batch_start).maybeSingle():{data:null};const assessmentOrientationComplete=assessmentBatch?.orientation_status==='Complete'||assessmentBatch?.orientation_completed===true;
  const set=p.selection_status==='Not Selected'?'reassessment-v2':'primary-v2';const forceStart=new URLSearchParams(location.search).get('start')==='1';
  const paymentSubmitted=['Under Verification','Verified'].includes(String(p.payment_status||''));if(forceStart&&set==='primary-v2'&&!paymentSubmitted){location.replace('enrollment.html');return}
  if(!assessmentOrientationComplete){root.innerHTML=`<div class="portal-card assessment-gate-card"><div class="portal-kicker">Selection Assessment</div><h1>Orientation Required</h1><p>You can start the assessment after completing the orientation.</p><div class="help-note"><strong>Orientation meeting is mandatory.</strong><br>Orientation details and meeting information will be shared in the official batch WhatsApp group.</div><div class="success-panel" style="margin-top:16px"><strong>All the best for your assessment and selection!</strong><span class="inline-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-2.2-.8L16 18l2.2-.8L19 15Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></span></div><div class="portal-actions"><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>`;return}
  if(p.assessment_status==='Complete'){const re=set==='reassessment-v2';root.innerHTML=`<div class="portal-card"><div class="portal-kicker">${re?'Re-Assessment':'Selection Assessment'}</div><h1>Assessment Already Submitted</h1><div class="success-panel"><strong>Your ${re?'re-assessment':'selection assessment'} has already been submitted and is currently under review. Please wait for the result.</strong><p style="margin:8px 0 0">Status: Under Review</p></div><div class="portal-actions"><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>`;return}
  let {data:rows}=await sb.from('sgt_assessment_questions').select('id,domain,question_set,question_no,question').eq('domain',p.domain).eq('question_set',set).eq('enabled',true).order('question_no');
  const parseRow=r=>{try{const x=JSON.parse(r.question);return {id:r.id,question:String(x.question||''),options:Array.isArray(x.options)?x.options.map(String):[]}}catch(_){return {id:r.id,question:String(r.question||''),options:[]}}};
  let q=(rows||[]).map(parseRow).filter(x=>x.question&&x.options.length>=4).slice(0,20);
  if(q.length<20){root.innerHTML=`<div class="portal-card"><div class="portal-kicker">${set==='reassessment-v2'?'Re-Assessment':'Selection Assessment'}</div><h1>Assessment Questions Not Published</h1><p>The required 20-question ${set==='reassessment-v2'?'re-assessment':'assessment'} set for <strong>${esc(p.domain)}</strong> is not available yet.</p><div class="help-note">Please check back after the management team publishes the complete question set.</div><div class="portal-actions"><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>`;return}
  let introShown=false;
  const showQuestions=()=>{introShown=true;renderPage()};
  if(set==='reassessment-v2'&&!forceStart){
    root.innerHTML=`<div class="portal-card assessment-gate-card"><div class="portal-kicker">SECOND OPPORTUNITY</div><h1>Your Second Opportunity</h1><p>Your first assessment did not result in selection, but this is a fresh opportunity to demonstrate your knowledge, problem-solving skills and readiness.</p><div class="success-panel"><strong>Payment Submitted</strong><p style="margin:7px 0 0">Payment Status: ${esc(p.payment_status||'Submitted')}</p></div><div class="portal-actions"><button class="portal-btn secondary" id="backReassess" type="button">← Back</button><button class="portal-btn primary" id="continueReassessment" type="button">Continue to the Re-Assessment →</button></div></div>`;document.getElementById('backReassess').onclick=()=>location.href='portal.html';document.getElementById('continueReassessment').onclick=showQuestions;return}
  if(set==='primary-v2'&&!forceStart){
    const paid=!['Pending','Refunded',''].includes(String(p.payment_status||''));
    root.innerHTML=`<div class="portal-card"><div class="portal-kicker">SELECTION ASSESSMENT</div><h1>Assessment Information</h1><p>This assessment checks basic domain knowledge, fundamentals and practical problem-solving through 20 multiple-choice questions.</p><div class="portal-meta"><div class="meta-box"><small>Name</small><strong>${esc(p.name)}</strong></div><div class="meta-box"><small>Registered Gmail</small><strong style="word-break:break-word">${esc(p.email)}</strong></div><div class="meta-box"><small>Student ID</small><strong>${esc(p.student_id)}</strong></div><div class="meta-box"><small>Domain</small><strong>${esc(p.domain)}</strong></div></div><div class="success-panel" style="margin-top:16px"><strong>Enrollment Fee Purpose</strong><p style="margin:7px 0 0">The one-time Enrollment Fee is required at the enrollment stage for assessment participation and related processing, participant verification, records/documentation and enrollment coordination. It is not a fee for the internship, certificate or selection. Selection is based on assessment performance. If you are not selected, the applicable fee is refundable under the stated refund process and terms.</p></div><div class="portal-actions"><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a><button class="portal-btn primary" id="nextAssessInfo" type="button">Next →</button></div></div>`;
    document.getElementById('nextAssessInfo').onclick=()=>paid?showQuestions():location.href='enrollment.html';return;
  }
  let page=0,answers={};const pageCount=Math.ceil(q.length/2),storageKey=`sgt_assessment_${u.id}_${set}`;let startAt=Number(localStorage.getItem(storageKey+'_start')||0),expired=false,submitting=false,timerHandle=null;
  try{answers=JSON.parse(localStorage.getItem(storageKey+'_answers')||'{}')||{}}catch(_){answers={}}
  const persist=()=>localStorage.setItem(storageKey+'_answers',JSON.stringify(answers));
  const answeredCount=()=>q.filter(x=>String(answers[x.id]||'').trim()!=='').length;
  const submitAssessment=async(auto=false)=>{
    if(submitting)return;
    submitting=true;clearInterval(timerHandle);
    root.querySelectorAll('button,input').forEach(x=>x.disabled=true);
    const btn=document.getElementById('submitAssessment');if(btn)btn.textContent='Submitting…';
    const restoreSubmit=()=>{submitting=false;root.querySelectorAll('button,input').forEach(x=>x.disabled=false);const b=document.getElementById('submitAssessment');if(b)b.textContent='Submit Assessment →';if(startAt)timerHandle=setInterval(()=>{const elapsed=Date.now()-startAt,left=Math.max(0,30*60*1000-elapsed),el=document.getElementById('assessmentTimer');if(el){const m=Math.floor(left/60000),ss=Math.floor(left/1000)%60;el.textContent=`${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`};if(left<=0&&!expired){expired=true;submitAssessment(true)}},250)};
    const {data:a,error}=await sb.from('sgt_assessment_attempts').insert({student_id:p.student_id,user_id:u.id,attempt_no:1,question_set:set,status:'Complete',submitted_at:new Date().toISOString()}).select().single();
    if(error){restoreSubmit();toast(error.message||'Unable to submit assessment. Please try again.');return}
    const {error:ae}=await sb.from('sgt_assessment_answers').insert(q.map(x=>({attempt_id:a.id,question_id:x.id,answer:answers[x.id]||''})));
    if(ae){restoreSubmit();toast(ae.message||'Unable to save your answers. Please try again.');return}
    const mark=await sb.rpc('sgt_mark_assessment_review');
    if(mark.error){restoreSubmit();toast(mark.error.message||'Assessment review could not be updated. Please try again.');return}
    const profileUpdate=await sb.from('sgt_profiles').update({assessment_status:'Complete',review_status:'Under Review',updated_at:new Date().toISOString()}).eq('id',u.id);
    if(profileUpdate.error){restoreSubmit();toast(profileUpdate.error.message||'Assessment status could not be updated. Please try again.');return}
    localStorage.removeItem(storageKey+'_start');localStorage.removeItem(storageKey+'_answers');
    if(auto){alert('Assessment Time Expired\nYour assessment has been automatically submitted.');location.href='portal.html';return}
    root.innerHTML='<div class="portal-card"><div class="success-panel"><h1>Assessment Submitted ✓</h1><p><strong>Your selection assessment has been submitted and is now under review.</strong></p><p>Please wait for the result. You cannot start another attempt while this assessment is under review.</p></div><div class="portal-actions"><a class="portal-btn primary" href="portal.html">Go to Dashboard →</a></div></div>';
  };
  const renderPage=()=>{
    if(!startAt){startAt=Date.now();localStorage.setItem(storageKey+'_start',String(startAt));}if(!timerHandle){timerHandle=setInterval(()=>{const elapsed=Date.now()-startAt,left=Math.max(0,30*60*1000-elapsed),el=document.getElementById('assessmentTimer');if(el){const m=Math.floor(left/60000),s=Math.floor(left/1000)%60;el.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`};if(left<=0&&!expired){expired=true;submitAssessment(true)}},250)}
    const start=page*2,end=Math.min(start+2,q.length),answered=answeredCount(),remaining=q.length-answered,elapsed=Date.now()-startAt,left=Math.max(0,30*60*1000-elapsed),mins=Math.floor(left/60000),secs=Math.floor(left/1000)%60;
    if(left<=0){if(!expired){expired=true;submitAssessment(true)}return}
    root.innerHTML=`<div class="portal-card assessment-exam-card"><div class="assessment-exam-head"><div><div class="portal-kicker">${set==='reassessment-v2'?'RE-ASSESSMENT':'SELECTION ASSESSMENT'}</div><h1 style="margin:5px 0 0">${esc(p.name)}</h1><p style="margin:3px 0 0">Student ID: <strong>${esc(p.student_id)}</strong> • Domain: <strong>${esc(p.domain)}</strong></p></div><div class="assessment-timer-box"><small>Time Remaining</small><strong id="assessmentTimer">${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}</strong></div></div><div class="assessment-progress-row"><span>Questions ${start+1}–${end} of ${q.length}</span><span>Answered: <strong>${answered}</strong> • Remaining: <strong>${remaining}</strong></span></div><div class="assessment-progress-track"><div style="width:${Math.round((answered/q.length)*100)}%"></div></div>${q.slice(start,end).map((x,offset)=>{const n=start+offset,selected=String(answers[x.id]||'');return `<div class="assessment-question-card"><div class="assessment-question-title"><span>Question ${n+1}</span><span>${selected?'Answered':'Not answered'}</span></div><h3>${esc(x.question)}</h3><div class="assessment-options">${x.options.map((o,j)=>`<label class="assessment-option"><input type="radio" name="q_${x.id}" value="${esc(o)}" ${selected===o?'checked':''}><span>${String.fromCharCode(65+j)}. ${esc(o)}</span></label>`).join('')}</div></div>`}).join('')}<div class="portal-actions" style="justify-content:space-between"><button class="portal-btn secondary" id="examPrev" ${page===0?'disabled':''}>← Previous</button><div style="display:flex;gap:9px;flex-wrap:wrap">${page<pageCount-1?'<button class="portal-btn primary" id="examNext">Next →</button>':'<button class="portal-btn primary" id="submitAssessment">Submit Assessment →</button>'}</div></div></div>`;
    root.querySelectorAll('input[type=radio]').forEach(inp=>inp.onchange=()=>{answers[inp.name.replace('q_','')]=inp.value;persist();renderPage()});
    document.getElementById('examPrev').onclick=()=>{if(page>0){page--;renderPage()}};
    document.getElementById('examNext')?.addEventListener('click',()=>{if(page<pageCount-1){page++;renderPage()}});
    document.getElementById('submitAssessment')?.addEventListener('click',()=>{if(submitting)return;persist();if(!confirm('Submit your assessment now? You will not be able to change your answers or submit another attempt after submission.'))return;submitAssessment(false)});
  };
  if(forceStart)renderPage();
}

async function initEnrollment(){
  const root=document.getElementById('enrollmentRoot');if(!root)return;const u=await user();if(!u){location.href='student-login.html';return}const p=await profile();if(!p)return;
  const {data:s}=await sb.from('sgt_settings').select('value').eq('key','payment').maybeSingle();const cfg=s?.value||{};const methods=[];const country=String(p.country||'').trim().toLowerCase(),phone=String(p.phone||'').replace(/\s+/g,'');const codeMatch=phone.match(/^\+(\d{1,4})/),code=codeMatch?.[1]||'';const india=code==='91'||['india','in','bharat'].includes(country),pakistan=code==='92'||['pakistan','pk'].includes(country);const defaultQr={india:'',binance:'',paypal:'',pakistan:'',wise:''};const qrFor=(key,value)=>value||defaultQr[key]||'';
  const resolvePaymentQr=async ref=>{const value=String(ref||'');if(!value.startsWith('storage://payment-qr-codes/'))return value;const path=value.replace('storage://payment-qr-codes/','');const session=await sb.auth.getSession(),token=session.data.session?.access_token;if(!token)return '';const r=await fetch(`${SGT_URL}/functions/v1/sgt-payment-qr`,{method:'POST',headers:{Authorization:`Bearer ${token}`,apikey:SGT_KEY,'Content-Type':'application/json'},body:JSON.stringify({action:'signed-url',path})});const result=await r.json().catch(()=>({}));return r.ok?String(result.signed_url||''):''};
  if(india){if(cfg.india?.enabled)methods.push({key:'india',name:'India — UPI',fee:`${cfg.india.fee||'149'} ${cfg.india.currency||'INR'}`,details:cfg.india.details||'UPI ID: info.softgrowtech@oksbi',qr:qrFor('india',cfg.india.qr_url||'')})}
  else if(pakistan){if(cfg.pakistan?.enabled)methods.push({key:'pakistan',name:'Pakistan — JazzCash / Easypaisa',fee:`${cfg.pakistan.fee||'499'} ${cfg.pakistan.currency||'PKR'}`,details:cfg.pakistan.details||'',qr:qrFor('pakistan',cfg.pakistan.qr_url||'')})}
  else{const intl=cfg.international||{};['binance','paypal','wise'].forEach(k=>{const x=intl[k]||{};if(x.enabled!==false)methods.push({key:k,name:k==='binance'?'Binance':k==='paypal'?'PayPal':'Wise',fee:`${x.fee||intl.fee||'5'} ${x.currency||intl.currency||'USD'}`,details:x.details||'',qr:qrFor(k,x.qr_url||'')})})}
  if(!methods.length){root.innerHTML=`<div class="portal-card"><h1>Payment Method Unavailable</h1><p>No payment method is currently configured for your registered country. Please contact SoftGrowTech support.</p><div class="portal-actions"><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>`;return}
  const detailHtml=(details,key)=>{const lines=String(details||'Payment details are configured by SoftGrowTech.').split(/\r?\n|;/).map(x=>x.trim()).filter(Boolean);return lines.map((line,i)=>{const m=line.match(/^([^:]+):\s*(.+)$/),label=m?.[1]?.trim()||'Payment Detail',value=m?.[2]?.trim()||line;return `<div class="payment-detail-row"><div><small>${esc(label)}</small><strong>${esc(value)}</strong></div><button type="button" class="portal-btn secondary copy-payment" data-copy="${esc(value)}">Copy</button></div>`}).join('')};
  root.innerHTML=`<div class="portal-card"><div class="portal-kicker">Enrollment</div><div style="display:flex;justify-content:space-between;gap:18px;align-items:flex-start;flex-wrap:wrap"><div style="flex:1;min-width:260px"><h1>Enrollment Fee & Payment</h1><p>Complete the one-time Enrollment Fee payment for the assessment enrollment stage, then submit your transaction details for verification.</p></div><div class="help-note" style="margin:0;min-width:170px;text-align:center"><strong>Complete within</strong><div id="paymentTimer" style="font-size:28px;font-weight:800;margin-top:4px">10:00</div></div></div><div class="help-note" style="margin-top:16px"><strong>Why this fee is required</strong><br>The Enrollment Fee supports assessment participation and related processing, participant verification, records/documentation and enrollment coordination. It is <strong>not a fee for the internship, certificate or selection</strong>. Selection is based on assessment performance. If you are not selected, the applicable Enrollment Fee is refundable under the stated refund process and terms.</div><h3 style="margin-top:22px">Choose Payment Method</h3><div id="methodList" class="payment-method-layout">${methods.map((x,n)=>`<div class="method-card ${n===0?'open':''}" data-key="${esc(x.key)}"><button class="method-toggle" type="button"><span>${esc(x.name)}</span><span>${esc(x.fee)} ▾</span></button><div class="method-body"><div class="payment-details-list"><strong>Payment Details</strong>${detailHtml(x.details,x.key)}</div>${x.key==='india'?`<div class="upi-actions" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><a class="portal-btn secondary upi-app" data-app="gpay" href="#">Google Pay</a><a class="portal-btn secondary upi-app" data-app="phonepe" href="#">PhonePe</a><a class="portal-btn secondary upi-app" data-app="paytm" href="#">Paytm</a></div><small style="display:block;margin-top:8px;color:#64748b">App opening depends on the apps installed and supported by the device/browser.</small>`:''}</div></div>`).join('')}<div class="help-note payment-qr-panel" style="grid-column:2;grid-row:1 / span ${methods.length};text-align:center;min-height:300px;display:flex;flex-direction:column;justify-content:center"><strong style="font-size:16px">Scan to Pay</strong><div id="qrPreviewBox"></div><span>Use the QR code or the payment details shown for your selected method.</span></div></div><form id="paymentForm" class="form-grid" style="margin-top:22px"><div class="field"><label>Payment Method</label><select id="payMethod" required>${methods.map(x=>`<option value="${esc(x.key)}">${esc(x.name)}</option>`).join('')}</select></div><div class="field"><label>Transaction ID</label><input id="txn" required></div><div class="field"><label>Receipt</label><input id="receipt" type="file" accept="image/*,.pdf" required></div><div class="field"><label>Student ID</label><input value="${esc(p.student_id)}" disabled></div><div class="field"><label>Registered Gmail</label><input value="${esc(p.email)}" disabled></div><div class="field full"><button class="portal-btn primary" type="submit" id="submitPaymentBtn">Submit Payment for Verification →</button></div></form><div class="portal-actions"><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>`;
  const qrBox=root.querySelector('#qrPreviewBox'),selectedMethod=()=>methods.find(x=>x.key===document.getElementById('payMethod').value)||methods[0];
  const updateQr=async()=>{const selected=selectedMethod();if(qrBox){qrBox.innerHTML=selected?.qr?'<div style="padding:18px 10px;color:#64748b">Loading QR…</div>':'<div style="padding:35px 10px;color:#64748b">QR code is not configured for this payment method.</div>';if(selected?.qr){const url=await resolvePaymentQr(selected.qr);qrBox.innerHTML=url?`<img src="${esc(url)}" alt="${esc(selected.name)} QR" style="display:block;max-width:280px;width:100%;height:auto;margin:12px auto;border-radius:12px;background:#fff;padding:8px;box-sizing:border-box">`:'<div style="padding:35px 10px;color:#b91c1c">QR code could not be loaded.</div>'}}const details=selected?.details||'';const match=details.match(/(?:UPI\s*ID|UPI)\s*:\s*([^\s;]+)/i);const upi=match?.[1]||'';const feeRaw=String(selected?.fee||'').match(/[0-9]+(?:\.[0-9]+)?/);const amount=feeRaw?.[0]||'';document.querySelectorAll('.upi-app').forEach(a=>{if(selected?.key!=='india'||!upi){a.style.display='none';return}a.style.display='inline-flex';const params=`pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent('SoftGrowTech')}${amount?`&am=${encodeURIComponent(amount)}`:''}&cu=INR`;const scheme=a.dataset.app==='gpay'?'gpay://upi/pay':a.dataset.app==='phonepe'?'phonepe://pay':'paytmmp://pay';a.href=`${scheme}?${params}`})};
  document.querySelectorAll('.method-toggle').forEach(btn=>btn.onclick=()=>{const card=btn.closest('.method-card');document.querySelectorAll('.method-card').forEach(c=>{if(c!==card)c.classList.remove('open')});card.classList.add('open');document.getElementById('payMethod').value=card.dataset.key;updateQr()});document.getElementById('payMethod').onchange=updateQr;await updateQr();
  document.querySelectorAll('.copy-payment').forEach(btn=>btn.onclick=async()=>{try{await navigator.clipboard.writeText(btn.dataset.copy);const old=btn.textContent;btn.textContent='Copied ✓';setTimeout(()=>btn.textContent=old,1200)}catch(_){toast('Copy failed. Please select and copy the payment detail manually.')}});
  let expiresAt=Date.now()+10*60*1000,expired=false;const timerEl=document.getElementById('paymentTimer'),submitBtn=document.getElementById('submitPaymentBtn'),timer=setInterval(()=>{const left=Math.max(0,expiresAt-Date.now()),m=Math.floor(left/60000),sec=Math.floor(left/1000)%60;if(timerEl)timerEl.textContent=`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;if(!left&&!expired){expired=true;clearInterval(timer);if(submitBtn)submitBtn.disabled=true;alert('Payment session expired. Please return to the assessment and start the enrollment payment again.');location.href='assessment.html'}},250);
  document.getElementById('paymentForm').onsubmit=async e=>{e.preventDefault();if(expired)return toast('Payment session expired. Please start again from the assessment.');const file=document.getElementById('receipt').files[0];if(!file)return;submitBtn.disabled=true;submitBtn.textContent='Submitting…';const path=`${u.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const up=await sb.storage.from('payment-receipts').upload(path,file);if(up.error){submitBtn.disabled=false;submitBtn.textContent='Submit Payment for Verification →';return toast(up.error.message)}const selected=selectedMethod();const ins=await sb.rpc('sgt_record_payment_submission',{p_method:selected?.name||document.getElementById('payMethod').value,p_transaction_id:document.getElementById('txn').value.trim(),p_receipt_path:path,p_amount:selected?.fee||''});if(ins.error){submitBtn.disabled=false;submitBtn.textContent='Submit Payment for Verification →';return toast(ins.error.message)}clearInterval(timer);root.innerHTML='<div class="portal-card"><div class="success-panel"><h1>Payment Submitted ✓</h1><p><strong>Payment Status: Under Verification</strong></p><p>Your payment details are under verification. You can now start the Selection Assessment; payment verification will continue separately.</p></div><div class="portal-actions"><a class="portal-btn primary" href="assessment.html?start=1">Start Assessment →</a><a class="portal-btn secondary" href="portal.html">Back to Dashboard</a></div></div>'};
}

async function initContact(){const sf=document.getElementById('supportForm'),cf=document.getElementById('clientForm');if(cf){const svc=new URLSearchParams(location.search).get('service');if(svc&&document.getElementById('clientService'))document.getElementById('clientService').value=svc;cf.onsubmit=async e=>{e.preventDefault();const {error}=await sb.from('sgt_client_enquiries').insert({name:document.getElementById('clientName').value.trim(),company:document.getElementById('clientCompany').value.trim(),email:document.getElementById('clientEmail').value.trim(),phone:document.getElementById('clientPhone').value.trim(),service:document.getElementById('clientService').value,requirement:document.getElementById('clientRequirement').value.trim()});if(error)toast(error.message);else{toast('Thanks. Your enquiry has been received.');cf.reset()}}}if(sf)sf.onsubmit=async e=>{e.preventDefault();const u=await user(),p=u?await profile():null;const {error}=await sb.from('sgt_support_queries').insert({user_id:u?.id||null,student_id:p?.student_id||null,name:p?.name||document.getElementById('supportName')?.value||'Visitor',email:p?.email||document.getElementById('supportEmail')?.value||'',category:document.getElementById('supportCategory').value,query_text:document.getElementById('supportQuery').value.trim()});if(error)toast(error.message);else{toast('Query submitted successfully.');sf.reset()}}}
document.addEventListener('DOMContentLoaded',()=>{initRegister();initLogin();initFirstPassword();initReset();initPortal();initAssessment();initEnrollment();initContact();});
