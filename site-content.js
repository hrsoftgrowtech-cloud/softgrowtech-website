(function(){
  const URL='https://syoqukavgvrdhwxatdav.supabase.co',KEY='sb_publishable_yUuacAdfZy3k-_Zve5QOZA_6eLh9FeZ';
  if(!window.supabase)return;
  const db=window.supabase.createClient(URL,KEY),slug=s=>encodeURIComponent(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const icons=[
    '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8M12 18v3M7 8h10M7 12h6"/>',
    '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h3M14 11h2M8 15h3M14 15h2"/>',
    '<circle cx="5" cy="12" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="m7 11 10-4M7 13l10 4"/>'
  ];
  function renderCards(items){
    const grid=document.getElementById('serviceCards');
    if(!grid)return;
    grid.innerHTML=items.map((item,i)=>`<a class="card service-dynamic-card" href="contact.html?service=${slug(item.name)}"><div class="icon-box"><svg class="sg-icon" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[i%icons.length]}</g></svg></div><h3>${esc(item.name)}</h3><p>${esc(item.description||'')}</p>${location.pathname.endsWith('services.html')?'<span class="text-link">Discuss This Service <span class="arrow">→</span></span>':''}</a>`).join('');
  }
  async function run(){
    const {data,error}=await db.from('sgt_settings').select('value').eq('key','services').maybeSingle();
    if(error)return;
    const items=(data?.value?.items||[]).filter(x=>x&&x.enabled!==false);
    if(document.getElementById('serviceCards')) renderCards(items);
  }
  document.addEventListener('DOMContentLoaded',run);
})();