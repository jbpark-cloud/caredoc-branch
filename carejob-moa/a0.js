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
function facOf(org){ const js=JOBS.filter(j=>j.org===org); const j=js[0]; return {org,fac:j.fac,gu:j.gu,area:j.area,grade:j.grade,ins:j.ins,payOpen:j.payOpen,score:Math.max(...js.map(x=>x.score)),reviews:js.reduce((a,x)=>a+x.reviews,0),caredoc:j.caredoc,jobs:js,id:j.id,rv:j.rv}; }
function facility(){
  const f=S.facil; if(!f) return home();
  const intro={"방문요양":"어르신 가정을 방문해 신체활동·가사 지원을 제공하는 재가 장기요양기관입니다.","주야간보호":"낮 시간 동안 어르신을 모시고 식사·프로그램·재활을 제공하는 데이케어 시설입니다.","요양원":"입소 어르신께 24시간 요양·돌봄을 제공하는 노인의료복지시설입니다.","요양병원":"만성질환 어르신의 입원 치료와 간병을 함께 제공하는 의료기관입니다.","재활병원":"재활의학 전문의와 치료사가 운동·작업치료를 제공하는 병원입니다.","일반 병원":"외래·입원 진료를 제공하는 의료기관입니다.","복지관":"지역 어르신 대상 노인맞춤돌봄·여가·교육 프로그램을 운영하는 복지시설입니다.","실버타운":"자립 생활이 가능한 어르신을 위한 노인복지주택입니다.","간병인 협회":"병원 간병 인력을 교육·등록·배정하는 협회입니다."}[f.fac]||"";
  return `<div class="wrap" style="padding-block:24px">
    <nav class="crumb"><a href="#" onclick="go('home');return false">홈</a><span>›</span><a href="#" onclick="S.f={gu:'${f.gu}',dong:'',job:[],sched:[],fac:['${f.fac}'],noLic:false,sort:'near'};go('search');return false">${f.gu} ${f.fac}</a><span>›</span><b>${esc(f.org)}</b></nav>
    <div class="fac-head"><div><div class="row">${f.caredoc?'<span class="tag bl">케어닥 직영</span>':''}<span class="tag gy">${f.fac}</span>${f.grade?`<span class="tag gr">공단 평가 ${f.grade}등급</span>`:""}</div><h1 style="margin-top:8px">${esc(f.org)}</h1><p class="muted">${f.area} · ${intro}</p></div>
      <div class="row"><button class="btn out" onclick="toast('시설 전화 연결(목업)')">${I.phone}전화</button><button class="btn pri pill" onclick="requireUser(()=>toast('${esc(f.org)} 새 공고 알림을 신청했습니다'))">이 시설 새 공고 알림</button></div></div>
    <div class="trust" style="margin-top:16px"><div><b>${f.grade||"–"}</b><span>건강보험공단 평가등급${f.grade?" (2024)":" (대상 아님)"}</span></div><div><b>${f.ins?"가입":"미가입"}</b><span>4대보험</span></div><div><b>${f.payOpen?"공개":"비공개"}</b><span>급여 공개</span></div><div><b>${f.score}<small class="muted" style="font-size:14px"> /5</small></b><span>근무자 후기 ${f.reviews}건</span></div></div>
    <div class="grid" style="grid-template-columns:1.3fr 1fr;gap:20px;margin-top:20px" id="fac-grid">
      <div class="stack" style="gap:16px">
        <div class="card"><h2 style="margin-bottom:10px">진행 중 공고 <span class="muted" style="font-size:16px">${f.jobs.length}건</span></h2><div class="tbl listwrap" style="border:0"><table class="list"><thead><tr><th class="c-day">등록</th><th class="c-job">직종</th><th class="c-time">근무시간</th><th class="c-pay">급여</th><th class="c-act"></th></tr></thead><tbody>${f.jobs.map(j=>`<tr class="lr${j.urgent?" urg":""}" onclick="go('detail',${j.id})"><td class="c-day"><span class="${j.days===0?"new":""}">${j.days===0?"오늘":j.days+"일 전"}</span></td><td class="c-job">${j.job}<span class="cap">${esc(j.title)}</span></td><td class="c-time">${j.hours[0]}<span class="cap">${j.sched}</span></td><td class="c-pay"><b>${j.pay}</b></td><td class="c-act"><button class="btn pri pill xs" onclick="event.stopPropagation();S.job=JOBS.find(x=>x.id===${j.id});openApply()">지원</button></td></tr>`).join("")}</tbody></table></div></div>
        <div class="card"><h2 style="margin-bottom:6px">근무자 후기</h2><p class="cap">지원 이력이 확인된 근무자·전 근무자만 작성할 수 있습니다. 시설은 답글을 달 수 있습니다.</p>${f.rv.map(r=>`<div class="review"><span class="star">${stars(r[2])}</span><p>${r[1]}</p><span class="who">${r[0]}</span></div>`).join("")}</div>
      </div>
      <div class="stack" style="gap:16px">
        <div class="card stack"><h3>시설 정보</h3><dl class="kv" style="font-size:16px"><dt>유형</dt><dd>${f.fac}</dd><dt>위치</dt><dd>${f.area}</dd><dt>정원·현원</dt><dd>${f.fac==="방문요양"||f.fac==="간병인 협회"?"–":`${29+f.id%40}명 · ${24+f.id%30}명`}</dd><dt>종사자</dt><dd>${8+f.id%20}명</dd><dt>지정일</dt><dd>20${10+f.id%14}년</dd><dt>전화</dt><dd class="tel" style="font-size:18px">02-555-0${String(f.id).padStart(2,"0")}3</dd></dl><p class="cap">정원·종사자·지정일은 건강보험공단 장기요양기관 공개 정보에서 자동 연결됩니다(프로토타입은 샘플).</p></div>
        <div class="card stack"><h3>오시는 길</h3><div class="map"><svg viewBox="0 0 600 180"><rect width="600" height="180" fill="var(--bg)"/><path d="M0 90h600M300 0v180M120 0v180M480 0v180M0 40h600M0 140h600" stroke="var(--line)" stroke-width="2" fill="none"/><circle cx="300" cy="90" r="12" fill="var(--primary)"/><text x="300" y="120" text-anchor="middle" font-size="14" font-weight="700" fill="var(--title)" font-family="inherit">${esc(f.org)}</text></svg></div><p class="muted small">${f.area}</p></div>
        <div class="card stack"><h3>같은 동네 ${f.fac}</h3>${[...new Set(JOBS.filter(j=>j.fac===f.fac&&j.gu===f.gu&&j.org!==f.org).map(j=>j.org))].slice(0,4).map(o=>`<a href="#" class="lnk" style="margin:0;font-size:15px" onclick="openFacility('${esc(o)}');return false">${esc(o)} →</a>`).join("")||'<p class="cap">아직 없어요</p>'}</div>
      </div>
    </div>
    <p class="cap" style="margin-top:20px">시설 페이지 주소: carejobmoa.kr${pathFor()} · 시설명 검색 유입과 신뢰 정보 노출을 위한 SEO 페이지</p>
  </div>`;
}
function openFacility(org){ S.facil=facOf(org); go('facility'); }
