(function(){
  const paths={
    dashboard:'<path d="M3 12l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    registrations:'<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    calendar:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    domains:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    tasks:'<path d="M5 3h14v18H5z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
    assessment:'<path d="M5 3h14v18H5z"/><path d="M8 7h8M8 11l1.5 1.5L12 10M8 16h8"/>',
    payments:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
    documents:'<path d="M6 2h9l4 4v16H6z"/><path d="M15 2v5h5M9 12h6M9 16h6"/>',
    ambassador:'<path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    communication:'<path d="M4 5h16v11H7l-3 3z"/><path d="M8 9h8M8 12h5"/>',
    services:'<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="8" cy="7" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="10" cy="17" r="1.5"/>',
    support:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.3 2c-1.2.9-1.8 1.3-1.8 2.7M12 17h.01"/>',
    enquiries:'<path d="M4 5h16v12H8l-4 3z"/><path d="M8 9h8M8 12h5"/>',
    archive:'<path d="M4 7h16v13H4zM3 4h18v3H3z"/><path d="M9 11h6"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.6v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4.3v-2.6h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V4.3h2.6v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V13h-.2a1.7 1.7 0 0 0-1.5 1z"/>',
    team:'<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="3.5"/><path d="M17 11a3 3 0 1 0-1-5.8M20 21v-2a4 4 0 0 0-2.2-3.6"/>',
    terms:'<path d="M6 2h12v20H6z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
    audit:'<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/><circle cx="17" cy="17" r="2.5"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6"/>',
    megaphone:'<path d="M3 11v2h4l10 5V6L7 11z"/><path d="M7 13l1.5 6h2L9 13M20 9v6"/>',
    gift:'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8H8.5a2.5 2.5 0 1 1 0-5c2 0 3.5 5 3.5 5zM12 8h3.5a2.5 2.5 0 1 0 0-5c-2 0-3.5 5-3.5 5z"/>',
    rules:'<path d="M6 2h9l4 4v16H6z"/><path d="M15 2v5h5M9 12h6M9 16h6"/>',
    share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.7 10.7l6.6-4M8.7 13.3l6.6 4"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    mentor:'<circle cx="12" cy="7" r="3"/><path d="M5 21v-2a5 5 0 0 1 10 0v2M16 11l3 2-3 2M19 13h2"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    link:'<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.3 2c-1.2.9-1.8 1.3-1.8 2.7M12 17h.01"/>',
    logout:'<path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    inbox:'<path d="M4 5h16v14H4z"/><path d="M4 14h4l1.5 3h5L16 14h4"/>',
    linkedin:'<path d="M6 8v11"/><circle cx="6" cy="5" r="1"/><path d="M10 19v-7a3 3 0 0 1 6 0v7M10 15h6"/>',
    instagram:'<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.5"/><circle cx="17.3" cy="6.8" r="1"/>',
    whatsapp:'<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5z"/><path d="M9 8.5c.3 2 1.8 3.8 3.7 4.7l1.3-1c.3-.2.7-.2 1 0l1.2.6c.4.2.5.7.3 1.1-.4.7-1.1 1.1-1.9 1.1-3.8-.3-6.7-3.1-7-6.7-.1-.8.4-1.5 1.1-1.8.4-.2.9 0 1.1.4l.6 1.2c.2.3.2.7 0 1z"/>',
    bulb:'<path d="M9 18h6M10 21h4"/><path d="M8.2 14.5A6 6 0 1 1 15.8 14c-.8.7-1.2 1.3-1.4 2H9.6c-.2-.6-.6-1.1-1.4-1.5z"/><path d="M12 3v1"/>',
    copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>'
  };
  function icon(name,cls){const p=paths[name]||paths.help;return `<svg class="sgt-icon ${cls||''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</g></svg>`}
  window.sgtIcon=icon;
  window.SGT_ICONS=new Proxy({}, {get:(t,k)=>icon(k)});
  function hydrate(){
    document.querySelectorAll('[data-sgt-icon]').forEach(el=>{if(!el.querySelector('svg'))el.innerHTML=icon(el.dataset.sgtIcon);});
    const adminMap={dashboard:'dashboard',registrations:'registrations',students:'users',batches:'calendar',domains:'domains',tasks:'tasks',assessment:'assessment',payments:'payments',documents:'documents',ambassador:'ambassador',communication:'communication',services:'services',support:'support',enquiries:'enquiries',archive:'archive',settings:'settings',team:'team','team-terms':'terms',audit:'audit',notifications:'bell'};
    Object.entries(adminMap).forEach(([view,name])=>{const sec=document.getElementById('view-'+view);const k=sec?.querySelector('.portal-section-title .portal-kicker');if(k&&!k.querySelector('svg'))k.insertAdjacentHTML('afterbegin',icon(name));});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hydrate);else hydrate();
})();
