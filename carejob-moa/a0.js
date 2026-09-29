const JOB_TYPES=["요양보호사","간병인","사회복지사","간호사","간호조무사","물리치료사","작업치료사","병원동행매니저","생활지원사","시설장","조리원·조리보조","운전원(송영)","사무행정"];
const SCHEDS=["오전만","주간","주3일","야간","입주","단기"];
const GUS=["전체",...[...new Set(JOBS.map(j=>j.gu))].sort((a,b)=>a.localeCompare(b,"ko"))];
const FACS=["방문요양","주야간보호","요양원","요양병원","재활병원","일반 병원","복지관","실버타운","간병인 협회"];
let S={screen:"home",mode:"user",home:{gu:"강남구",limit:30,tab:"fac",pick:{},group:"fac"},tal:{gu:"전체",job:[],sched:[],lic:false,caredoc:false},f:{gu:"전체",dong:"",job:[],sched:[],fac:[],noLic:false,sort:"near"},job:null,appl:{}};
const $=id=>document.getElementById(id);
function go(screen,arg){ if(screen==="detail"){S.job=JOBS.find(j=>j.id===arg);} S.screen=screen; render(); window.scrollTo({top:0}); }
function homePick(tab,name){ const same=S.home.pick[tab]===name; S.home.pick=same?{}:{[tab]:name}; S.home.limit=30; render(); if(!same){ const el=$("list-anchor"); if(el){ el.scrollIntoView({behavior:"smooth",block:"start"}); el.classList.add("flash"); setTimeout(()=>el.classList.remove("flash"),1200);} } }
function setMode(m){S.mode=m; go(m==="biz"?"biz":"home");}
function toast(t){const d=document.createElement("div");d.className="toast";d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2200);}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
const I={
 pin:'<svg class="ico sm gy" viewBox="0 0 24 24"><path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></svg>',
 clock:'<svg class="ico sm gy" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 home:'<svg class="ico" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
 sun:'<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
 cal:'<svg class="ico" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
 cert:'<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="9" r="5"/><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5"/></svg>',
 phone:'<svg class="ico sm" viewBox="0 0 24 24" style="color:currentColor"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
 shield:'<svg class="ico sm" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
 tab_home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
 tab_list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
 tab_send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l16 8-16 8 3-8z"/></svg>',
 tab_cert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5"/><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5"/></svg>',
 check:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
};
function gradeEl(g){ if(!g) return `<span class="grade"><b class="gN">–</b>평가 대상 아님</span>`; return `<span class="grade"><b class="g${g}">${g}</b>공단 평가 ${g}등급</span>`; }
function stars(n){return "★".repeat(Math.round(n))+"☆".repeat(5-Math.round(n));}
function jobCard(j){
  return `<article class="card job${j.top?" top":""}" onclick="go('detail',${j.id})" tabindex="0" onkeydown="if(event.key==='Enter')go('detail',${j.id})">
    <div class="org">${j.top?'<span class="tag or">상위노출</span>':''}${j.urgent?'<span class="tag rd">급구</span>':''}${j.caredoc?'<span class="tag bl">케어닥 직영</span>':''}${j.noLic?'<span class="tag gr">자격증 없어도 가능</span>':''}<span>${esc(j.org)} · ${j.fac}</span></div>
    <h3>${esc(j.title)}</h3>
    <div class="meta"><span>${I.pin}${j.area} · <b>${j.dist}</b></span><span>${I.clock}${j.hours.join(" · ")}</span></div>
    <div class="pay">${j.pay}</div>
    <div class="foot">${gradeEl(j.grade)}<span class="small muted">${j.days}일 전 · 후기 ${j.reviews}</span></div>
  </article>`;
}
