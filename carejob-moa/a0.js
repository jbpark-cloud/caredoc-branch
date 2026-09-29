const JOB_TYPES=["요양보호사","간병인","사회복지사","간호사","간호조무사","물리치료사","작업치료사","병원동행매니저","생활지원사","시설장","조리원·조리보조","운전원(송영)","사무행정"];
const SCHEDS=["오전만","주간","주3일","야간","입주","단기"];
const GUS=["전체",...[...new Set(JOBS.map(j=>j.gu))].sort((a,b)=>a.localeCompare(b,"ko"))];
const FACS=["방문요양","주야간보호","요양원","요양병원","재활병원","일반 병원","복지관","실버타운","간병인 협회"];
let S={screen:"home",mode:"user",auth:{user:null,biz:null},home:{gu:"강남구",limit:30,tab:"fac",pick:{},group:"fac"},tal:{gu:"전체",job:[],sched:[],lic:false,caredoc:false},f:{gu:"전체",dong:"",job:[],sched:[],fac:[],noLic:false,sort:"near"},job:null,appl:{}};
const $=id=>document.getElementById(id);
// /                          홈
// /jobs                      전체 목록      /jobs/{구}  /jobs/{직종}  /jobs/{구}/{직종}
// /jobs/{id}-{slug}          공고 상세      /start  자격증이 없어요
// /facility/{slug}           시설 페이지(2차)   /biz  /biz/post  /biz/talent  /biz/ads  /me
function slug(s){return String(s).replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"");}
function pathFor(){
  const f=S.f;
  switch(S.screen){
    case "home": return "/";
    case "search": { const gu=f.gu&&f.gu!=="전체"?slug(f.gu):"", job=f.job.length===1?slug(f.job[0]):""; return "/jobs"+(gu?"/"+gu:"")+(job?"/"+job:"")+(f.noLic&&!job?"/자격무관":""); }
    case "detail": return `/jobs/${S.job.id}-${slug(S.job.org)}-${slug(S.job.job)}-${slug(S.job.gu)}`;
    case "start": return "/start";
    case "me": return "/me"; case "biz": return "/biz"; case "post": return "/biz/post"; case "talent": return "/biz/talent"; case "ads": return "/biz/ads"; case "bizme": return "/biz/me";
  } return "/";
}
function seoFor(){
  const f=S.f, base="케어잡모아";
  switch(S.screen){
    case "home": return {t:"케어잡모아 — 우리 동네 요양·돌봄 일자리 | 요양보호사·간병인 구인",d:`서울 요양보호사·간병인·사회복지사 일자리 ${JOBS.length}건. 집 근처·근무 시간·공단 평가등급으로 찾고 전화번호만으로 지원하세요.`};
    case "search": { const gu=f.gu!=="전체"?f.gu:"서울", job=f.job.length===1?f.job[0]:"요양·돌봄"; const n=filtered().length; return {t:`${gu} ${job} 구인 ${n}건 | ${base}`,d:`${gu} ${job} 채용공고 ${n}건. 도보·버스 거리, 오전·주3일·야간 근무형태, 4대보험·급여 공개 여부까지 한눈에.`}; }
    case "detail": { const j=S.job; return {t:`${j.org} ${j.job} 채용 · ${j.pay} · ${j.area} | ${base}`,d:`${j.title}. ${j.hours.join(" ")}, ${j.pay}. ${j.grade?"건강보험공단 평가 "+j.grade+"등급, ":""}${j.ins?"4대보험 가입":""}. 회원가입 없이 전화번호로 1분 지원.`}; }
    case "start": return {t:"자격증 없이 시작하는 돌봄 일자리 · 요양보호사 자격 취득 로드맵 | "+base,d:"병원동행·생활지원·조리보조 등 자격증 없이 지금 가능한 일과 요양보호사 자격 취득 4단계. 케어닥 교육원 상담 무료."};
    case "biz": return {t:"기업회원 · 요양보호사·간병인 무료 채용공고 등록 | "+base,d:"복지관·요양원·요양병원·주야간보호 채용공고 등록 무료. 5060 구직자에게 동네 단위로 도달. 상위노출·급구·문자 알림."};
    case "talent": return {t:"인재정보 · 요양·돌봄 구직자 프로필 | "+base,d:"동의한 구직자의 지역·자격·희망 시간 프로필. 열람 무료, 제안 발송 건당 과금."};
    case "ads": return {t:"광고 상품 · 상위노출·메인 배너·급구·문자 알림 | "+base,d:"공고 등록 무료. 상위노출 7일 3만원부터."};
    default: return {t:base,d:""};
  }
}
function jobLD(j){
  const [gu,dong]=j.area.split(" ");
  return {"@context":"https://schema.org/","@type":"JobPosting","title":j.title,"description":`${j.duty.join(". ")}. 자격: ${j.req}`,"datePosted":new Date(Date.now()-j.days*864e5).toISOString().slice(0,10),"employmentType":j.sched==="단기"?"TEMPORARY":j.sched==="주3일"||j.sched==="오전만"?"PART_TIME":"FULL_TIME",
    "hiringOrganization":{"@type":"Organization","name":j.org},"jobLocation":{"@type":"Place","address":{"@type":"PostalAddress","addressRegion":"서울특별시","addressLocality":gu,"streetAddress":dong,"addressCountry":"KR"}},
    "baseSalary":{"@type":"MonetaryAmount","currency":"KRW","value":{"@type":"QuantitativeValue","value":parseInt(j.pay.replace(/[^\d]/g,""))*(j.pay.includes("만원")?10000:1),"unitText":j.pay.startsWith("시급")?"HOUR":j.pay.startsWith("일급")?"DAY":j.pay.startsWith("연봉")?"YEAR":"MONTH"}},
    "identifier":{"@type":"PropertyValue","name":"carejobmoa","value":String(j.id)},"industry":"노인복지·요양","directApply":true};
}
function applySEO(push){
  const s=seoFor(); document.title=s.t;
  let m=document.querySelector('meta[name="description"]'); if(!m){m=document.createElement("meta");m.name="description";document.head.appendChild(m);} m.content=s.d;
  let c=document.querySelector('link[rel="canonical"]'); if(!c){c=document.createElement("link");c.rel="canonical";document.head.appendChild(c);} c.href="https://carejobmoa.kr"+pathFor();
  let ld=document.getElementById("ld-json"); if(S.screen==="detail"){ if(!ld){ld=document.createElement("script");ld.id="ld-json";ld.type="application/ld+json";document.head.appendChild(ld);} ld.textContent=JSON.stringify(jobLD(S.job)); } else if(ld) ld.remove();
  const p=pathFor(); if(push&&location.protocol!=="file:"&&location.pathname!==p){ try{history.pushState({screen:S.screen,job:S.job&&S.job.id,f:S.f},"",p);}catch(e){} }
}
function routeFromPath(){
  const seg=location.pathname.split("/").filter(Boolean).map(decodeURIComponent); if(!seg.length) return;
  if(seg[0]==="jobs"){ if(seg[1]&&/^\d+-/.test(seg[1])){const id=parseInt(seg[1]);if(JOBS.find(j=>j.id===id)){S.job=JOBS.find(j=>j.id===id);S.screen="detail";return;}}
    S.screen="search"; const rest=seg.slice(1).map(x=>x.replace(/-/g," "));
    for(const r of rest){ if(GUS.includes(r))S.f.gu=r; else if(JOB_TYPES.includes(r))S.f.job=[r]; else if(r==="자격무관")S.f.noLic=true; } return; }
  if(seg[0]==="start"){S.screen="start";return;} if(seg[0]==="me"){S.screen="me";return;}
  if(seg[0]==="biz"){S.mode="biz";S.screen={post:"post",talent:"talent",ads:"ads",me:"bizme"}[seg[1]]||"biz";return;}
}
window.addEventListener("popstate",()=>{ S.screen="home"; S.mode="user"; S.f={gu:"전체",dong:"",job:[],sched:[],fac:[],noLic:false,sort:"near"}; routeFromPath(); if(S.screen==="biz"||S.screen==="post"||S.screen==="talent"||S.screen==="ads"||S.screen==="bizme")S.mode="biz"; render(); applySEO(false); window.scrollTo({top:0}); });
function go(screen,arg){ if(screen==="detail"){S.job=JOBS.find(j=>j.id===arg);} S.screen=screen; render(); applySEO(true); window.scrollTo({top:0}); }
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
 kakao:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3C6.5 3 2 6.4 2 10.6c0 2.7 1.8 5 4.5 6.4l-1 3.8c-.1.3.3.6.6.4l4.4-2.9c.5.1 1 .1 1.5.1 5.5 0 10-3.4 10-7.8S17.5 3 12 3z"/></svg>',
 tab_biz:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>',
 chk:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="rgba(255,255,255,.15)" stroke="none"/><path d="M7 12l3 3 7-7"/></svg>',
 check:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
};
function gradeEl(g){ if(!g) return `<span class="grade"><b class="gN">–</b>평가 대상 아님</span>`; return `<span class="grade"><b class="g${g}">${g}</b>공단 평가 ${g}등급</span>`; }
function stars(n){return "★".repeat(Math.round(n))+"☆".repeat(5-Math.round(n));}
